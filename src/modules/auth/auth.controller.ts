import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, CheckOtpDto } from './dto/auth.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger.consumes.enum';
import { Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.urlEncoded, SwaggerConsumes.Json)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }

  @Post('check-otp')
  @ApiConsumes(SwaggerConsumes.urlEncoded, SwaggerConsumes.Json)
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto.code);
  }
}
