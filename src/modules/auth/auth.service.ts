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
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from 'src/common/enums/message.enum';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthResponse } from './types/response';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: PrismaService,
    private tokenService: TokenService,
  ) {}
  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(res, result);
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
    const token = this.tokenService.createOtpToken({ UserId: user.id });
    return { code: otp.code, token };
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
    const token = this.tokenService.createOtpToken({ UserId: user.id });
    return { code: otp.code, token };
  }

  async sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;
    res.cookie(CookieKeys.OTP, token, { httpOnly: true });
    res.json({ message: PublicMessage.SentOtp, code });
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
