import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserDTO } from '../../../modules/users/users.dto';
import { envConfig } from '../../../configs';

const { JWT_SECRET } = envConfig;

@Injectable()
export default class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refreshToken') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: UserDTO): Promise<UserDTO> {
    return {
      avatar: payload.avatar,
      address: payload.address,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    };
  }
}
