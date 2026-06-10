import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entity/user.entities';
import { RolesGuard } from './roles.guard';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
   JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: '1d',
    },
  }),
})
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],
})
export class AuthModule {}