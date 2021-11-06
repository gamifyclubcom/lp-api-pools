import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DecodedUser } from './interfaces/decoded-user.interface';
import AuthRepository from './auth.repository';
import UsersService from '../users/users.service';
import SignaturePubkeyPairDTO from './dto/sign-in.dto';

@Injectable()
export default class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly userService: UsersService,
  ) {}

  public async login(data: SignaturePubkeyPairDTO): Promise<any> {
    let user = await this.userService.findByAddress(data.address);
    if (!user) {
      user = await this.userService.create(data);
    }

    const payload = {
      id: user._id,
      avatar: user.avatar,
      address: user.address,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);

    return { accessToken, refreshToken };
  }

  public async verifyToken(token: string, secret: string): Promise<DecodedUser | null> {
    try {
      const user = (await this.jwtService.verifyAsync(token, { secret })) as DecodedUser | null;

      return user;
    } catch (error) {
      return null;
    }
  }
}
