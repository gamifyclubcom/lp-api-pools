import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { User } from './users.interface';
import { PaginateQuery } from '../../shared/interface';

export class UserEntity extends Document {
  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: String })
  first_name?: string;

  @ApiProperty({ type: String })
  last_name?: string;

  @ApiProperty({ type: String })
  email?: string;

  @ApiProperty({ type: String })
  avatar?: string;
}

export class UserDTO {
  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: String })
  first_name?: string;

  @ApiProperty({ type: String })
  last_name?: string;

  @ApiProperty({ type: String })
  email?: string;

  @ApiProperty({ type: String })
  avatar?: string;
}
export class IndexUsersOutput {
  @ApiPropertyOptional()
  docs: User[];

  @ApiPropertyOptional()
  totalDocs: number;

  @ApiPropertyOptional()
  limit: number;

  @ApiPropertyOptional()
  totalPages: number;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  pagingCounter: number;

  @ApiPropertyOptional()
  hasPrevPage: boolean;

  @ApiPropertyOptional()
  hasNextPage: boolean;

  @ApiPropertyOptional()
  prevPage: number;

  @ApiPropertyOptional()
  nextPage: number;

  @ApiPropertyOptional()
  meta?: any;
}

export class UsersFilterInput extends PaginateQuery {}

export class CreateUserInput extends UserDTO {}
export class UpdateUserInput extends PartialType(UserDTO) {}
