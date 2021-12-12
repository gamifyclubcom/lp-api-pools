/**
 * Note: A shared mongoose version without soft deleted feature
 */
import {merge, slice} from 'lodash';
import {
  ClientSession,
  Document,
  FilterQuery,
  Model,
  PaginateModel,
  QueryOptions,
  SaveOptions,
  Schema,
} from 'mongoose';
import {paginationConfig} from 'src/configs';
import {convertObject} from './helper';
import {PaginateQuery} from './interface';

type DocumentSaveCallback<T> = (err: any, doc: T) => void;

export interface BaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  restore(fn?: DocumentSaveCallback<this>): Promise<this>;
  restore(options?: SaveOptions, fn?: DocumentSaveCallback<this>): Promise<this>;
}

export function getMaxTimeMs() {
  return 60000;
}

export function getBaseSchema(): Schema {
  return new Schema(
    {
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    {
      timestamps: true,
      toObject: {
        transform: (_, ret) => convertObject(ret),
      },
      toJSON: {
        transform: (_, ret) => convertObject(ret),
      },
    },
  );
}

export interface Repository<T extends Document> {
  aggregate(aggregations?: any[]): Promise<any[]>;

  count(conditions: any): Promise<number>;

  countAll(): Promise<number>;

  create(doc: Record<string, unknown>, options?: SaveOptions): Promise<T>;

  create(docs: Record<string, unknown>[], options?: SaveOptions): Promise<T[]>;

  delete(doc: T, options?: QueryOptions): Promise<T>;

  delete(docs: T[], options?: QueryOptions): Promise<T[]>;

  deleteAll(options?: QueryOptions): Promise<any>;

  deleteById(id: any, options?: QueryOptions): Promise<T>;

  deleteMany(conditions: any, options?: QueryOptions): Promise<any>;

  deleteOne(conditions: any, options?: QueryOptions): Promise<T>;

  exists(conditions: any): Promise<boolean>;

  existsById(id: any): Promise<boolean>;

  find(conditions: any, options?: QueryOptions): Promise<T[]>;

  findAll(options?: QueryOptions): Promise<T[]>;

  findById(id: any, options?: any | QueryOptions): Promise<T>;

  findOne(conditions: any, options?: QueryOptions): Promise<T>;

  findOneOrCreate(conditions: any, doc: any, options?: QueryOptions & SaveOptions): Promise<T>;

  save(doc: T, options?: SaveOptions): Promise<T>;

  save(docs: T[], options?: SaveOptions): Promise<T[]>;

  update(conditions: any, doc: any, options?: QueryOptions): Promise<any>;

  updateById(id: any, doc: any, options?: QueryOptions): Promise<T>;

  updateMany(conditions: any, doc: any, options?: QueryOptions): Promise<any>;

  updateOne(conditions: any, doc: any, options?: QueryOptions): Promise<T>;

  updateOneOrCreate(conditions: any, doc: any, options?: QueryOptions): Promise<T>;

  withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
    option?: ClientSession,
  ): Promise<U>;

  getCollectionName(): string;

  createCollection(): Promise<void>;

  dropCollection(): Promise<void>;

  getPrimaryKey(): string;
}

export class BaseRepository<T extends Document> implements Repository<T> {
  protected primaryKey = '_id';

  constructor(public readonly model: Model<T>) {}

  async aggregate(aggregations?: any[]): Promise<any[]> {
    aggregations = slice(aggregations);
    const opts = {
      maxTimeMS: getMaxTimeMs(),
    };

    return this.model.aggregate(aggregations).option(opts).exec();
  }

  async count(conditions: any): Promise<number> {
    return this.modifyQuery(this.model.countDocuments(conditions)).exec();
  }

  async countAll(): Promise<number> {
    return this.count({});
  }

  async create(doc: Record<string, unknown>, options?: SaveOptions): Promise<T>;

  async create(docs: Record<string, unknown>[], options?: SaveOptions): Promise<T[]>;

  async create(
    docs: Record<string, unknown> | Record<string, unknown>[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.create(doc, options));
      }
      return result;
    }
    return this.save(new this.model(docs as any), options);
  }

  async delete(doc: T, options?: QueryOptions): Promise<T>;

  async delete(docs: T[], options?: QueryOptions): Promise<T[]>;

  async delete(docs: T | T[], options?: QueryOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.delete(doc, options));
      }
      return result;
    }
    if (options && options.session) {
      docs.$session(options.session);
    }
    return docs.remove();
  }

  async deleteAll(options?: QueryOptions): Promise<number> {
    return this.deleteMany({}, options);
  }

  async deleteById(id: any, options?: QueryOptions): Promise<T> {
    return this.deleteOne({[this.primaryKey]: id}, options);
  }

  async deleteMany(conditions: any, options?: QueryOptions): Promise<number> {
    let query = this.model.deleteMany(conditions);
    if (options && options.session) {
      query = query.session(options.session);
    }
    const result = await query.exec();
    return result.ok ? result.deletedCount : 0;
  }

  async deleteOne(conditions: any, options?: QueryOptions): Promise<T> {
    return this.model.findOneAndDelete(conditions, options).exec();
  }

  async exists(conditions: any): Promise<boolean> {
    return this.model.exists(conditions);
  }

  async existsById(id: any): Promise<boolean> {
    return this.exists({[this.primaryKey]: id});
  }

  async find(conditions: any, options?: QueryOptions): Promise<T[]> {
    return this.modifyQuery(this.model.find(conditions, null, options)).exec();
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    return this.find({}, options);
  }

  async findById(id: any, options?: QueryOptions): Promise<T> {
    return this.findOne({[this.primaryKey]: id}, options);
  }

  async findOne(conditions: any, options?: QueryOptions): Promise<T> {
    return this.modifyQuery(this.model.findOne(conditions, null, options)).exec();
  }

  async findOneOrCreate(
    conditions: any,
    doc: any,
    options?: QueryOptions & SaveOptions,
  ): Promise<T> {
    let document = await this.findOne(conditions, options);
    if (!document) {
      document = await this.create(merge({}, conditions, doc), options);
    }
    return document;
  }

  async save(doc: T, options?: SaveOptions): Promise<T>;

  async save(docs: T[], options?: SaveOptions): Promise<T[]>;

  async save(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.save(doc, options));
      }
      return result;
    }
    return docs.save(options);
  }

  async update(conditions: any, doc: any, options?: QueryOptions): Promise<number> {
    const result = await this.modifyQuery(this.model.update(conditions, doc, options)).exec();
    return result.ok ? result.nModified : 0;
  }

  async updateById(id: any, doc: any, options?: QueryOptions): Promise<T> {
    return this.updateOne({[this.primaryKey]: id}, doc, options);
  }

  async updateMany(conditions: any, doc: any, options?: QueryOptions): Promise<number> {
    const result = await this.modifyQuery(this.model.updateMany(conditions, doc, options)).exec();
    return result.ok ? result.nModified : 0;
  }

  async updateOne(conditions: any, doc: any, options?: QueryOptions): Promise<T> {
    return this.modifyQuery(
      this.model.findOneAndUpdate(conditions, doc, merge({new: true}, options)),
    ).exec();
  }

  async updateOneOrCreate(conditions: any, doc: any, options?: QueryOptions): Promise<T> {
    return this.updateOne(
      conditions,
      doc,
      merge({new: true, upsert: true, setDefaultsOnInsert: true}, options),
    );
  }

  async paginate(query?: FilterQuery<T> & PaginateQuery, needAll: boolean = false): Promise<any> {
    const page = query.page || paginationConfig.DEFAULT_PAGE;
    const limit = query.limit || paginationConfig.DEFAULT_LIMIT;
    delete query.page;
    delete query.limit;
    return (this.model as PaginateModel<T>).paginate(query, {
      sort: {created_at: -1},
      page,
      limit,
      pagination: !needAll,
    });
  }

  async withTransaction<U>(fn: (session: ClientSession) => Promise<U>, options?): Promise<U> {
    const session = await this.model.db.startSession();
    let result: U;
    try {
      await session.withTransaction(async (ses: any) => {
        result = await fn(ses);
      }, options);
      return result;
    } finally {
      await session.endSession();
    }
  }

  getCollectionName(): string {
    return this.model.collection.collectionName;
  }

  async createCollection(): Promise<void> {
    return null;
  }

  async dropCollection(): Promise<void> {
    if (await this.isCollectionExists()) {
      await this.model.collection.drop();
    }
  }

  getPrimaryKey(): string {
    return this.primaryKey;
  }

  private modifyQuery(query) {
    // check maxtime ms
    query = query.maxTimeMS(getMaxTimeMs());

    return query;
  }

  private async isCollectionExists(): Promise<boolean> {
    const result = await this.model.estimatedDocumentCount().exec();
    return !!result;
  }
}
