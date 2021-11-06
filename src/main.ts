import * as dotenv from 'dotenv';

import * as path from 'path';
import * as fs from 'fs';
import {INestApplication, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {Logger} from 'nestjs-pino';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';
import {envConfig} from './configs';
import {ResponseBodyLoggingInterceptor} from './interceptors/res-body-logging.interceptor';
import * as basicAuth from 'express-basic-auth';
import * as httpContext from 'express-http-context';
import {ACCESS_TOKEN_HEADER_NAME} from './middlewares/auth.middleware';
import * as bodyParser from 'body-parser';

dotenv.config();

const {PORT, CLUSTER, DOMAIN, API_VERSION, HOST, MONGODB_URL} = envConfig;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bodyParser: true, cors: true});
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  app.useGlobalInterceptors(new ResponseBodyLoggingInterceptor(logger));
  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(httpContext.middleware);

  await Promise.all([initializeSwagger(app)]);
  logger.log(
    CLUSTER ? 'Environment variables has been loaded' : "Environment variables can't be load",
  );
  await app.listen(PORT, () => {
    const baseUrlAbsolute = `${HOST}/api`;
    const docsBaseUrlAbsolute = `${HOST}/docs`;
    logger.log(`Started on ${baseUrlAbsolute}`);
    logger.log(`Swagger UI on ${docsBaseUrlAbsolute}`);
    // console.log(`Application running on port ${PORT}`);
  });
}

async function initializeSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(`Gamify API`)
    .setDescription(`Swagger specification for API Gamify | [swagger.json](docs-json)`)
    .setVersion(API_VERSION)
    .addServer(`${DOMAIN}/api`)
    .addBasicAuth()
    .addApiKey(undefined, ACCESS_TOKEN_HEADER_NAME)
    .build();

  const document = SwaggerModule.createDocument(app, options, {ignoreGlobalPrefix: true});
  writeSwaggerJson(path.join(__dirname, '..'), document);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      displayOperationId: true,
    },
  });
}

const writeSwaggerJson = (path: string, document) => {
  const swaggerFile = `${path}/swagger.json`;
  fs.writeFileSync(swaggerFile, JSON.stringify(document, null, 2), {encoding: 'utf8'});
};

bootstrap();
