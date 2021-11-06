import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {PaginateModel} from 'mongoose';
import {MongooseFuzzyModel} from 'mongoose-fuzzy-searching';

import {User, UserDocument} from './users.schema';
import {UserDTO, UsersFilterInput, UpdateUserInput} from './users.dto';
import {BaseService} from '../../shared/base.service';
import {paginationConfig} from '../../configs';
import {isEmpty} from '../../shared/utils/helper';
import {PaginateResponse} from '../../shared/interface';

const {DEFAULT_PAGE, DEFAULT_LIMIT} = paginationConfig;

@Injectable()
export default class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: PaginateModel<UserDocument>) {
    super();
  }

  async index(filters?: UsersFilterInput): Promise<PaginateResponse<UserDocument>> {
    const search = filters.search || '';
    const page = filters.page ? parseInt(filters.page.toString()) : DEFAULT_PAGE;
    const limit = filters.limit ? parseInt(filters.limit.toString()) : DEFAULT_LIMIT;

    let docs: any = [];

    if (search && !isEmpty(search)) {
      docs = await (this.userModel as MongooseFuzzyModel<UserDocument>)
        .fuzzySearch(search)
        .find({});
    } else {
      docs = await this.userModel.find({}).sort({createdAt: 1});
    }
    const paginated = this.paginate({page, limit, docs});

    return paginated;
  }

  public findOne(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  public findAll(): Promise<User[]> {
    return this.userModel.find({}).exec();
  }

  public findByAddress(address: string): Promise<UserDocument> {
    return this.userModel.findOne({address}).exec();
  }

  public create(user: UserDTO): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  async update(id: string, fields: UpdateUserInput) {
    delete fields.address;

    return this.userModel.findOneAndUpdate({_id: id}, fields, {new: true});
  }

  async delete(id) {
    return this.userModel.deleteOne({_id: id});
  }
}
