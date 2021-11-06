import {ApiProperty} from '@nestjs/swagger';

export class ReadPoolUserDto {
  @ApiProperty()
  userAccount: string;
}
