import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req) {
    return req.user;
  }

  @Get('doctor/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  doctorProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Get('patient/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  patientProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}