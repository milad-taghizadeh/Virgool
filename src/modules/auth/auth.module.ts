import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtService, TokenService],
})
export class AuthModule {}
