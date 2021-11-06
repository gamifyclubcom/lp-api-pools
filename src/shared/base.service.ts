import { PaginateResponse } from './interface';

export class BaseService<T> {
  paginate = (
    args: {
      page: number;
      limit: number;
      docs: any[];
    },
    needAll?: boolean,
  ): PaginateResponse<T> => {
    const totalDocs = args.docs.length;
    const page = needAll ? 0 : args.page;
    const limit = needAll ? args.docs.length : args.limit;

    const start = page * limit;
    const end = (page + 1) * limit;
    const totalPages = Math.ceil(totalDocs / limit);

    const docsResult = args.docs.slice(start, end);

    return {
      totalDocs,
      totalPages,
      page,
      limit,
      docs: docsResult,
    };
  };
}

export function paginate(
  args: {
    page: number;
    limit: number;
    docs: any[];
    totalDocs?: number
  },
  needAll?: boolean,
): PaginateResponse<any> {
  const totalDocs = args.totalDocs || args.docs.length;
  const page = needAll ? 0 : args.page;
  const limit = needAll ? args.docs.length : args.limit;

  const start = page * limit;
  const end = (page + 1) * limit;
  const totalPages = Math.ceil(totalDocs / limit);

  // const docsResult = args.docs.slice(start, end);
  const docsResult = args.docs;

  return {
    totalDocs,
    totalPages,
    page,
    limit,
    docs: docsResult,
  };
}
