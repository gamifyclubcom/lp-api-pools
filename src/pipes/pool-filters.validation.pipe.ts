import {BadRequestException, Injectable, PipeTransform} from '@nestjs/common';
import {PublicKey} from '@solana/web3.js';
import {paginationConfig} from '../configs';
import {PoolsFilterInput} from '../modules/pools/pools.dto';
import {PoolsSectionFilter} from '../modules/pools/pools.enum';

const {DEFAULT_LIMIT, DEFAULT_PAGE} = paginationConfig;

@Injectable()
export class PoolFiltersValidationPipe implements PipeTransform {
  transform(value: any): PoolsFilterInput {
    const search = value.search || '';
    const page = value.page ? parseInt(value.page.toString()) : DEFAULT_PAGE;
    const limit = value.limit ? parseInt(value.limit.toString()) : DEFAULT_LIMIT;
    const section = value.section as PoolsSectionFilter;
    const walletAddressString = value.walletAddress;
    const poolProgramId = value.poolProgramId;
    const exceptPoolProgramId = value.exceptPoolProgramId;

    if (section === PoolsSectionFilter.JOINED && !walletAddressString) {
      throw new BadRequestException('Please connect wallet to get this.');
    }
    if (section === PoolsSectionFilter.JOINED && walletAddressString) {
      try {
        new PublicKey(walletAddressString);
      } catch (err) {
        throw new BadRequestException('Wallet address is not a valid address');
      }
    }

    return {
      page,
      limit,
      search,
      section,
      poolProgramId,
      walletAddress: walletAddressString,
      toDate: value.toDate,
      fromDate: value.fromDate,
      exceptPoolProgramId,
    };
  }
}
