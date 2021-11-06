import {NestInterceptor, Injectable, ExecutionContext, CallHandler} from '@nestjs/common';
import {Logger} from 'nestjs-pino';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class ResponseBodyLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  intercept(context: ExecutionContext, call$: CallHandler): Observable<any> {
    return call$.handle().pipe(
      map((data) => {
        this.logger.log({responseBody: data}, 'LOG RESPONSE BODY');
        return data;
      }),
    );
  }
}
