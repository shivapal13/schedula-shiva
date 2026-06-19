import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entity/user.entities';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const hashedPassword = await bcrypt.hash(
      signupDto.password,
      10,
    );

    const user = this.userRepository.create({
      username: signupDto.username,
      email: signupDto.email,
      password: hashedPassword,
      role: signupDto.role,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    };
  }

async login(loginDto: LoginDto){
  const user = await this.userRepository.findOne({
  where: {
    email: loginDto.email,
  },
  select: [
    'id',
    'email',
    'password',
    'role',
    'username',
  ],
});
if (!user) {
  throw new UnauthorizedException(
    'Invalid credentials',
  );
}

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }
}