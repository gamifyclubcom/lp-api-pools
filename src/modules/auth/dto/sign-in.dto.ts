import {ApiProperty} from '@nestjs/swagger';

export default class SignaturePubkeyPairDTO {
  @ApiProperty()
  address: string;
}
