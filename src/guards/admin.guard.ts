import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import * as httpContext from 'express-http-context';
import {ADDRESS} from '../shared/constants';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return !!httpContext.get(ADDRESS);
  }
}
