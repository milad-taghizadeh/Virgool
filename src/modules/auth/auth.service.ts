import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isPhoneNumber } from 'class-validator';
import { PrismaService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { AuthMessage, BadRequestMessage } from 'src/common/enums/message.enum';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: PrismaService) {}
  userExistence(authDto: AuthDto) {
    const { method, type, username } = authDto;
    switch (type) {
      case AuthType.Login:
        return this.login(method, username);
      case AuthType.Register:
        return this.register(method, username);
      default:
        throw new UnauthorizedException();
    }
  }

  async login(method: AuthMethod, username: string) {
    const validUsername = await this.usernameValidator(method, username);
    const user: User = await this.checkExistUser(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.saveOtp(user.id);
    otp.userId = user.id;
    return { code: otp.code };
  }

  async register(method: AuthMethod, username: string) {
    const validUsername = await this.usernameValidator(method, username);
    let user: User = await this.checkExistUser(method, validUsername);
    const randomUsername: string = `m_${Date.now()}`;
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);
    if (method === AuthMethod.Username) {
      throw new BadRequestException(BadRequestMessage.InvalidRegisterData);
    }
    user = await this.databaseService.user.create({
      data: { [method]: username, username: randomUsername },
    });
    const otp = await this.saveOtp(user.id);
    otp.userId = user.id;
    return { code: otp.code };
  }

  async saveOtp(userId: string) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 2 * 60);
    let otp = await this.databaseService.otp.findFirst({ where: { userId } });
    if (otp) {
      otp.code = code;
      otp.expiresIn = expiresIn;
    } else {
      otp = await this.databaseService.otp.create({
        data: { code, expiresIn, userId },
      });
    }
    // Send SMS or EMAIL for user
    return otp;
  }

  async checkOtp() {}

  async checkExistUser(method: AuthMethod, username: string) {
    let user: User;
    if (method === AuthMethod.Phone) {
      user = await this.databaseService.user.findFirst({
        where: { phone: username },
      });
    } else if (method === AuthMethod.Email) {
      user = await this.databaseService.user.findFirst({
        where: { email: username },
      });
    } else if (method === AuthMethod.Username) {
      user = await this.databaseService.user.findFirst({
        where: { username },
      });
    } else throw new BadRequestException(BadRequestMessage.InvalidLoginData);
    return user;
  }
  async usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException('email format is invalid');
      case AuthMethod.Phone:
        if (isPhoneNumber(username, 'IR')) return username;
        throw new BadRequestException('phone number is invalid');
      case AuthMethod.Username:
        return username;
      default:
        throw new UnauthorizedException('username data is not valid');
    }
  }
}
