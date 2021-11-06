import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOperation,
} from '@nestjs/swagger';
import AuthService from './auth.service';
import JwtTokensDto from './dto/jwt-tokens.dto';
import SignaturePubkeyPairDTO from './dto/sign-in.dto';

@ApiTags('auth')
@ApiExtraModels(JwtTokensDto)
@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: SignaturePubkeyPairDTO })
  @ApiOkResponse({
    description: 'Returns jwt tokens',
  })
  @ApiBadRequestResponse({
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'signin',
    summary: 'Sign In',
  })
  @Post('sign-in')
  async signIn(@Body() input: SignaturePubkeyPairDTO): Promise<JwtTokensDto> {
    return this.authService.login(input);
  }
}
