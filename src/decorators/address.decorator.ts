import {createParamDecorator} from '@nestjs/common';
import { ADDRESS } from 'src/shared/constants';
import * as httpContext from 'express-http-context';

export const Address = createParamDecorator(() => {
  return httpContext.get(ADDRESS);
});
