import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class PaginateQuery {
  @ApiPropertyOptional({type: Number})
  page?: number;

  @ApiPropertyOptional({type: Number})
  limit?: number;

  @ApiPropertyOptional({type: String})
  search?: string;
}

export class PaginateResponse<T> {
  @ApiProperty({type: Number})
  totalDocs: number;

  @ApiProperty({type: Number})
  totalPages: number;

  @ApiProperty({type: Number})
  page: number;

  @ApiProperty({type: Number})
  limit: number;

  @ApiProperty()
  docs: T[];
}
