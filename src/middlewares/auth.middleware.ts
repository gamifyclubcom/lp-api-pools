import {Injectable, NestMiddleware, UnauthorizedException} from '@nestjs/common';
import * as httpContext from 'express-http-context';
import * as express from 'express';
import {ADDRESS} from '../shared/constants';
import {verifyAndDecode} from '@gamify/onchain-program-sdk';
import {Logger} from 'nestjs-pino';

export const ACCESS_TOKEN_HEADER_NAME = 'access-token';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  async use(req: express.Request, _res: express.Response, next: () => void): Promise<void> {
    const accessToken = req.get(ACCESS_TOKEN_HEADER_NAME);

    if (accessToken) {
      const decodeResult = verifyAndDecode(accessToken);
      if (!decodeResult.isValid || decodeResult.isExpired || !decodeResult.data) {
        if (decodeResult.error) {
          this.logger.error(decodeResult.error);
        }

        throw new UnauthorizedException();
      }

      httpContext.set('accessToken', accessToken);
      httpContext.set(ADDRESS, decodeResult.data.address);
    }

    return next();
  }
}
