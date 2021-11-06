import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { UserDTO } from '../../../modules/users/users.dto';
import { envConfig } from '../../../configs';

const { JWT_SECRET } = envConfig;

@Injectable()
export default class JwtAccessStrategy extends PassportStrategy(Strategy, 'accessToken') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('access-token'),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: UserDTO): Promise<UserDTO> {
    console.log('Verify token', { bearer: ExtractJwt.fromHeader('access-token') });
    return {
      avatar: payload.avatar,
      address: payload.address,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    };
  }
}
