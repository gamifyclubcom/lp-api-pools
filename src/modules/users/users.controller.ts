import {Body, Controller, Post, Get, Query, Put, Delete, Param} from '@nestjs/common';
import {ObjectId} from 'mongodb';
import {ApiTags, ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation} from '@nestjs/swagger';
import {
  UserEntity,
  UserDTO,
  IndexUsersOutput,
  UsersFilterInput,
  UpdateUserInput,
} from './users.dto';
import UsersService from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@ApiExtraModels(UserEntity)
@Controller('users')
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({
    operationId: 'getUser',
    summary: 'Get User',
  })
  @ApiOkResponse({type: UserEntity})
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('')
  @ApiOperation({
    operationId: 'indexUsers',
    summary: 'Index Users',
  })
  @ApiOkResponse({type: IndexUsersOutput})
  async index(@Query() filters: UsersFilterInput) {
    return this.usersService.index(filters);
  }

  @Post('')
  @ApiOperation({
    operationId: 'createUser',
    summary: 'Create User',
  })
  @ApiOkResponse({type: UserEntity})
  async create(@Body() input: UserDTO) {
    return this.usersService.create(input);
  }

  @Put('')
  @ApiOperation({
    operationId: 'updateUser',
    summary: 'Update User',
  })
  @ApiOkResponse({type: UserEntity})
  async update(@Query('id') id: string, @Body() input: UpdateUserInput) {
    return this.usersService.update(id, input);
  }
}
