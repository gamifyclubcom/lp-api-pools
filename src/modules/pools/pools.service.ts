import {
  Actions,
  getJoinPoolStartAndEndTimeV4,
  IPoolV4ContractData,
} from '@gamify/onchain-program-sdk';
import {BadRequestException, ForbiddenException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {SchedulerRegistry} from '@nestjs/schedule';
import {WRAPPED_SOL_MINT} from '@project-serum/serum/lib/token-instructions';
import {MintLayout} from '@solana/spl-token';
import {Keypair, PublicKey, Transaction} from '@solana/web3.js';
import {ObjectId} from 'bson';
import {CronJob} from 'cron';
import Decimal from 'decimal.js';
import {Response} from 'express';
import {Parser} from 'json2csv';
import * as _ from 'lodash';
import {PaginateModel} from 'mongoose';
import {MongooseFuzzyModel} from 'mongoose-fuzzy-searching';
import slugify from 'slugify';
import {v4 as uuid} from 'uuid';
import {BaseService, paginate} from '../../shared/base.service';
import {SOL} from '../../shared/constants';
import {PaginateResponse} from '../../shared/interface';
import {getConnection} from '../../shared/utils/connection';
import {readPoolData} from '../../shared/utils/contract-main';
import {
  addMongooseParam,
  escapeRegExp,
  isEmpty,
  isValidId,
  round,
  stringToUnit8Array,
} from '../../shared/utils/helper';
import {Instructions} from '../../shared/utils/instructions';
import {ICampaign, IFee, IRate} from '../../shared/utils/interface';
import {PlatformService} from '../platform/platform.service';
import {JoinPoolHistoryRepository} from '../pool-participants/join-pool-history.repository';
import {JoinPoolStatusEnum} from '../pool-participants/pool-participants.enum';
import {PoolParticipantsRepository} from '../pool-participants/pool-participants.repository';
import {PoolParticipantsService} from '../pool-participants/pool-participants.service';
import {ClaimTokenHistory, ClaimTokenHistoryDocument} from './claimTokenHistory.schema';
import {CreateClaimTokenHistoryDto} from './dto/claim-token-history.dto';
import {CommitInitPoolDto, CreatePoolInput} from './dto/create-pool.dto';
import {
  ChangePoolAdminInput,
  UpdateOffchainPoolInput,
  UpdateOnchainPoolInput,
} from './dto/update-pool.dto';
import {PoolsFilterInput, PoolsVotingFilterInput, UserVoteDto} from './pools.dto';
import {PoolsSectionFilter, PoolsVotingFilter} from './pools.enum';
import {convertToContractAmount} from './pools.helper';
import {IExtractRawPoolData} from './pools.interface';
import {Pool, PoolDocument} from './pools.schema';

const connection = getConnection();

export class PoolsService extends BaseService<PoolDocument> {
  private actions: Actions;

  constructor(
    @InjectModel(Pool.name) private readonly model: PaginateModel<PoolDocument>,
    @InjectModel(ClaimTokenHistory.name)
    private readonly claimTokenHistoryModel: PaginateModel<ClaimTokenHistoryDocument>,
    private readonly platformService: PlatformService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly joinPoolHistoryRepository: JoinPoolHistoryRepository,
    private readonly poolParticipantsRepository: PoolParticipantsRepository,
    private readonly poolParticipantsService: PoolParticipantsService,
  ) {
    super();
    this.actions = new Actions(connection);
  }

  public async adminIndex(
    filters: PoolsFilterInput,
    address: string,
  ): Promise<PaginateResponse<PoolDocument>> {
    const {search, page, limit, exceptPoolProgramId, poolProgramId} = filters;
    let docs: any[] = [];

    let options: any = {
      ...((filters.fromDate || filters.toDate) && {
        join_pool_start: {
          ...(filters.fromDate && {
            $gte: new Date(filters.fromDate),
          }),
          ...(filters.toDate && {
            $lte: new Date(filters.toDate),
          }),
        },
      }),
    };

    // const commonSetting = await new Actions(connection).readCommonSettingByProgramId();
    // TODO: still list all until pool perrmisison less feature is active
    // if (commonSetting.admin !== address) {
    //   options = {
    //     'data.admins.root_admin': address,
    //     ...options,
    //   };
    // }

    if (poolProgramId) {
      options = Object.assign(options, {
        program_id: poolProgramId,
      });
    }

    if (exceptPoolProgramId) {
      addMongooseParam(options, 'poolProgramid', {
        $ne: exceptPoolProgramId,
      });
    }

    if (search && !isEmpty(search)) {
      options.name = {
        $regex: new RegExp(escapeRegExp(search), 'i'),
      };
    }

    docs = await this.model.find(options, null, {limit, skip: limit * page}).sort({createdAt: -1});
    const totalDocs = await this.model.count(options);

    return {
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      page,
      limit,
      docs,
    };
  }

  public async index(filters?: PoolsFilterInput): Promise<PaginateResponse<PoolDocument>> {
    const {search, section, walletAddress} = filters;
    const page = filters.page ? parseInt(filters.page.toString()) : 0;
    const limit = filters.limit ? parseInt(filters.limit.toString()) : 10;
    let docs: any[] = [];
    let query: any = {};
    const request = [];

    const now = new Date();
    query.pool_start = {$lte: now};

    if (section === PoolsSectionFilter.JOINED && filters.walletAddress) {
      const listPools = await this.poolParticipantsService.indexUserJoinPoolHistory({
        page,
        limit,
        user_address: filters.walletAddress,
      });
      const poolIds = listPools.map((e) => new ObjectId(e.pool_id.toString()));
      const docs = await this.model.find({_id: {$in: poolIds}});
      const paginated = this.paginate({page, limit, docs});
      return paginated;
    }

    if (section) {
      switch (section) {
        case PoolsSectionFilter.UPCOMING:
          query.$or = [
            {
              $and: [
                {'data.version': {$lt: 4}},
                {join_pool_start: {$gte: now}},
                {
                  $or: [
                    {'data.is_active': false},
                    {
                      $and: [{'data.is_active': true}, {join_pool_start: {$gte: now}}],
                    },
                  ],
                },
              ],
            },
            {
              $or: [
                {
                  $and: [
                    {'data.version': {$gte: 4}},
                    {'data.voting.is_active': false},
                    {$or: [{join_pool_start: {$gte: now}}, {'data.is_active': false}]},
                  ],
                },
                {
                  $and: [
                    {'data.version': {$gte: 4}},
                    {'data.voting.is_active': true},
                    {'flags.is_ready': true},
                    {join_pool_start: {$gte: now}},
                    {'data.voting.end_at': {$lte: now}},
                  ],
                },
              ],
            },
          ];
          break;
        case PoolsSectionFilter.FEATURED:
          query['data.is_active'] = true;
          query.join_pool_start = {$lte: now};
          query.join_pool_end = {$gte: now};
          break;
        case PoolsSectionFilter.PAST:
          query['data.is_active'] = true;
          query.join_pool_end = {$lte: now};
          break;
        case PoolsSectionFilter.UPCOMING_FEATURED:
          query.$or = [
            {
              $and: [
                {'data.version': {$lt: 4}},
                {join_pool_start: {$gte: now}},
                {
                  $or: [
                    {'data.is_active': false},
                    {
                      $and: [{'data.is_active': true}, {join_pool_start: {$gte: now}}],
                    },
                  ],
                },
              ],
            },
            {
              $or: [
                {
                  $and: [
                    {'data.version': {$gte: 4}},
                    {'data.voting.is_active': false},
                    {$or: [{join_pool_start: {$gte: now}}, {'data.is_active': false}]},
                  ],
                },
                {
                  $and: [
                    {'data.version': {$gte: 4}},
                    {'data.voting.is_active': true},
                    {'flags.is_ready': true},
                    {join_pool_start: {$gte: now}},
                    {'data.voting.end_at': {$lte: now}},
                  ],
                },
              ],
            },
            {
              $and: [
                {'data.is_active': true},
                {join_pool_start: {$lte: now}},
                {join_pool_end: {$gte: now}},
              ],
            },
          ];
          break;
      }
    } else {
      query.$or = [
        {'data.version': {$lt: 4}},
        {
          $or: [
            {
              $and: [{'data.version': {$gte: 4}}, {'data.voting.is_active': false}],
            },
            {
              $and: [
                {'data.version': {$gte: 4}},
                {'data.voting.is_active': true},
                {$or: [{'flags.is_ready': true}]},
                {'data.voting.end_at': {$lte: now}},
              ],
            },
          ],
        },
      ];
    }

    // search pool
    if (search && !isEmpty(search)) {
      docs = await (this.model as MongooseFuzzyModel<PoolDocument>)
        .fuzzySearch(search)
        .find(query)
        .limit(limit)
        .skip(page * limit)
        .sort({createdAt: -1});
    } else {
      docs = await this.model
        .find(query)
        .limit(limit)
        .skip(page * limit)
        .sort({createdAt: -1});
    }
    const totalDocs: number = await this.model.count(query);
    const paginated = paginate({page, limit, docs, totalDocs});

    return paginated;
  }

  async indexPoolsVoting(filters: PoolsVotingFilterInput): Promise<PaginateResponse<PoolDocument>> {
    const {search, section} = filters;
    const page = filters.page ? parseInt(filters.page.toString()) : 0;
    const limit = filters.limit ? parseInt(filters.limit.toString()) : 10;
    let docs: any[] = [];
    let query: any = {};

    const now = new Date();
    query.pool_start = {$lte: now};
    query['data.is_active'] = false;
    query['data.version'] = {$gte: 4};
    // query.$and = [{'data.voting.end_at': {$lte: now}}, {'flags.is_ready': false}];
    query.$or = [
      {'data.voting.end_at': {$gte: now}},
      {$and: [{'data.voting.end_at': {$lt: now}}, {'flags.is_ready': false}]},
    ];

    switch (section) {
      case PoolsVotingFilter.UPCOMING:
        query['flags.is_ready'] = false;
        query['data.voting.start_at'] = {$gte: now};
        break;
      case PoolsVotingFilter.IN_VOTING:
        query['data.voting.start_at'] = {$lte: now};
        query['data.voting.end_at'] = {$gte: now};
        break;
      case PoolsVotingFilter.DEACTIVATED:
        query['data.voting.end_at'] = {$lte: now};
        query['flags.is_ready'] = false;
        break;
      default:
        break;
    }

    // search pool
    if (search && !isEmpty(search)) {
      docs = await (this.model as MongooseFuzzyModel<PoolDocument>)
        .fuzzySearch(search)
        .find(query)
        .limit(limit)
        .skip(page * limit)
        .sort({createdAt: -1});
    } else {
      docs = await this.model
        .find(query)
        .limit(limit)
        .skip(page * limit)
        .sort({createdAt: -1});
    }
    const totalDocs: number = await this.model.count(query);
    const paginated = paginate({page, limit, docs, totalDocs});

    return paginated;
  }

  async findOne(identifier: string): Promise<any> {
    let data: PoolDocument;

    // check find by id or slug
    if (isValidId(identifier)) {
      data = await this.findOnePoolOrFailById(identifier);
    } else {
      data = await this.findOnePoolOrFailBySlug(identifier);
    }
    return data;
  }

  async getOnePoolVoting(identifier: string): Promise<any> {
    let poolVoting: PoolDocument;

    if (isValidId(identifier)) {
      poolVoting = await this.findOnePoolOrFailById(identifier);
    } else {
      poolVoting = await this.findOnePoolOrFailBySlug(identifier);
    }

    if (poolVoting.data.version && poolVoting.data.version >= 4) {
      return poolVoting;
    }

    throw new NotFoundException('Pool not found');
  }

  // public async create(input: CreatePoolInput): Promise<any> {
  //   const {earlyJoinStartTime, earlyJoinEndTime, publicStartTime, publicEndTime, claimAt} =
  //     this.validateAndGetPhasesTime(
  //       input.join_pool_start,
  //       input.join_pool_end,
  //       input.campaign.claim_at,
  //       input.campaign.early_join_phase.is_active,
  //       input.early_join_duration,
  //     );

  //   const pool_start = new Date(input.pool_start).getTime();
  //   if (
  //     pool_start >=
  //     new Date(
  //       input.campaign.early_join_phase.is_active ? earlyJoinStartTime : publicStartTime,
  //     ).getTime()
  //   ) {
  //     throw new BadRequestException('pool_start cannot greater than or equal join_pool_start');
  //   }
  //   const slug = slugify(input?.slug || `${input?.name}-${input?.token?.token_symbol}`, {
  //     lower: true,
  //   });

  //   const tokenDecimals = await this.getTokenDecimals(input.token.token_address);
  //   const tokenToDecimals = await this.getTokenDecimals(input.token_to);
  //   const rate = await this.convertRateToDataContract(
  //     tokenToDecimals,
  //     tokenDecimals,
  //     input.token_ratio,
  //   );
  //   const platformAddress: string = (
  //     await this.platformService.generate(new PublicKey(POOL_PROGRAM_ID))
  //   ).publicKey;
  //   const poolAccount = Keypair.fromSecretKey(stringToUnit8Array(input.pool_account_secret));
  //   const poolContractAccount = poolAccount.publicKey;

  //   const initPoolParams = {
  //     token_to: input.token_to,
  //     tokenAddress: input?.token.token_address,
  //     rootAdminAddress: input.root_admin,
  //     payer: input.payer,
  //     poolContractAccount,
  //     platformAddress,
  //     initPoolData: {
  //       rate,
  //       fees: {
  //         numerator: 0,
  //         denominator: 1,
  //       },
  //       campaign: {
  //         max_allocation_all_phases: convertToContractAmount(
  //           input.campaign.max_allocation_all_phases,
  //           tokenDecimals,
  //         ),
  //         claim_at: claimAt,
  //         early_join_phase: {
  //           is_active: input.campaign.early_join_phase.is_active,
  //           max_total_alloc: !!input.campaign.early_join_phase.max_total_alloc
  //             ? convertToContractAmount(
  //                 input.campaign.early_join_phase.max_total_alloc,
  //                 tokenDecimals,
  //               )
  //             : 0,
  //           start_at: earlyJoinStartTime,
  //           end_at: earlyJoinEndTime,
  //         },
  //         public_phase: {
  //           is_active: true,
  //           max_individual_alloc: convertToContractAmount(
  //             input.campaign.public_phase.max_individual_alloc,
  //             tokenDecimals,
  //           ),
  //           start_at: publicStartTime,
  //           end_at: publicEndTime,
  //         },
  //       },
  //     },
  //     poolTokenXAccount: input.pool_token_x,
  //     poolTokenYAccount: input.pool_token_y,
  //   };
  //   this.validateInitPoolParams(initPoolParams.initPoolData);
  //   return initPool(initPoolParams);
  // }

  public async commitInitPool(input: CommitInitPoolDto) {
    let contract_address = input.pool_account;
    if (!contract_address) {
      const contract_address_secret = input.pool_account_secret;
      const contract_acc = Keypair.fromSecretKey(stringToUnit8Array(contract_address_secret));
      contract_address = contract_acc.publicKey.toBase58();
    }
    const tokenToDecimals = await this.getTokenDecimals(input.token_to);
    const action = new Actions(getConnection());
    try {
      const poolData = (await action.readPool(
        new PublicKey(contract_address),
      )) as IPoolV4ContractData;
      const pool_start = new Date(input.pool_start).getTime();
      if (
        pool_start >=
        new Date(
          poolData.campaign.early_join_phase.is_active
            ? poolData.campaign.early_join_phase.start_at
            : poolData.campaign.exclusive_phase.is_active
            ? poolData.campaign.exclusive_phase.start_at
            : poolData.campaign.public_phase.start_at,
        ).getTime()
      ) {
        throw new BadRequestException('pool_start cannot greater than or equal join_pool_start');
      }

      const program_id = await new Actions(connection).getPoolProgramId(
        new PublicKey(contract_address),
      );
      const slug = slugify(input?.slug || `${input?.name}-${input?.token?.token_symbol}`, {
        lower: true,
      });

      const {join_pool_start, join_pool_end} = getJoinPoolStartAndEndTimeV4(poolData);
      const params = {
        ...input,
        pool_start,
        slug,
        contract_address,
        program_id,
        data: poolData,
        join_pool_start,
        join_pool_end,
        token_to_decimal: tokenToDecimals,
        flags: {
          is_ready:
            poolData.version >= 4
              ? new Date().getTime() > new Date(poolData.voting.end_at).getTime() &&
                poolData.voting.total_vote_up - poolData.voting.total_vote_down >
                  poolData.voting.required_absolute_vote
              : true,
        },
      };

      const poolDocument = await this.model.create(params);

      await this.addJobFinalizePool(poolDocument);

      return poolDocument;
    } catch (e) {
      console.error(`Get pool data failed`, e);
      throw new BadRequestException(`Contract address is invalid`);
    }
  }

  public async convertRateToDataContract(
    tokenToDecimals: number,
    tokenDecimals: number,
    rate: number,
  ) {
    const contractRate = new Decimal(1)
      .div(rate)
      .mul(new Decimal(10).pow(tokenToDecimals))
      .div(new Decimal(10).pow(tokenDecimals))
      .toDecimalPlaces(12);
    const fraction = contractRate.toFraction();
    return {
      numerator: fraction[0].toNumber(),
      denominator: fraction[1].toNumber(),
    };
  }

  public async getTokenDecimals(token: string): Promise<number> {
    const token_acc = await connection.getAccountInfo(
      token === SOL ? WRAPPED_SOL_MINT : new PublicKey(token),
    );
    if (!token_acc?.data) {
      throw new BadRequestException(`Invalid token`);
    }
    const tokenInfo = MintLayout.decode(token_acc.data);
    return tokenInfo.decimals;
  }

  public async convertToUserRate(
    tokenToInfoDecimals: number,
    tokenInfoDecimals: number,
    rate: IRate,
  ) {
    return round(
      new Decimal(rate.denominator)
        .div(new Decimal(10).pow(tokenInfoDecimals))
        .div(new Decimal(rate.numerator).div(new Decimal(10).pow(tokenToInfoDecimals)))
        .toNumber(),
      2,
    );
  }

  public validateInitPoolParams({
    rate,
    campaign,
    fees,
  }: {
    rate?: IRate;
    campaign?: ICampaign;
    fees?: IFee;
  }) {
    if (rate?.denominator === 0 || rate?.numerator === 0) {
      throw new BadRequestException('Invalid token ratio');
    }
    if (fees?.denominator === 0) {
      throw new BadRequestException('Invalid fees');
    }
    if (campaign?.early_join_phase?.is_active) {
      if (campaign?.early_join_phase?.max_total_alloc > campaign?.max_allocation_all_phases) {
        throw new BadRequestException(
          `campaign.early_join_phase.max_total_alloc cannot greater than campaign.max_allocation_all_phases`,
        );
      }
    }
  }

  public async updateOnchainPool(id: string, input: UpdateOnchainPoolInput) {
    const pool = await this.model.findById(id);
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    const poolData = await this.extractRawPoolData(pool.contract_address);

    const {earlyJoinStartTime, earlyJoinEndTime, publicStartTime, publicEndTime, claimAt} =
      this.validateAndGetPhasesTime(
        input.join_pool_start,
        input.join_pool_end,
        input.campaign.claim_at,
        input.campaign.early_join_phase.is_active,
        input.early_join_duration,
      );

    return this.createUpdatePoolTx(pool, poolData, {
      ...input,
      earlyJoinStartTime,
      earlyJoinEndTime,
      publicStartTime,
      publicEndTime,
      claimAt,
    });
  }

  public async updateOffchainPool(id: string, input: UpdateOffchainPoolInput) {
    const {
      pool_start,
      logo,
      thumbnail,
      tag_line,
      name,
      website,
      token: {token_name, token_symbol},
      token_economic,
      twitter,
      telegram,
      medium,
      description,
      slug,
      liquidity_percentage,
      audit_link,
      claimable_percentage,
    } = input;
    const pool = await this.model.findById(id);
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    const action = new Actions(getConnection());

    const poolData = (await action.readPool(
      new PublicKey(pool.contract_address),
    )) as IPoolV4ContractData;

    const poolStart = new Date(input.pool_start);
    if (
      poolStart >
      (poolData.campaign.early_join_phase.is_active
        ? poolData.campaign.early_join_phase.start_at
        : poolData.campaign.exclusive_phase.is_active
        ? poolData.campaign.exclusive_phase.start_at
        : poolData.campaign.public_phase.start_at)
    ) {
      throw new BadRequestException('pool_start cannot greater than join_pool_start');
    }

    const updateQuery = {
      ...(typeof logo === 'string' && {logo}),
      ...(typeof thumbnail === 'string' && {thumbnail}),
      ...(typeof tag_line === 'string' && {tag_line}),
      ...(pool_start && {pool_start}),
      ...(typeof name === 'string' && {name}),
      ...(typeof website === 'string' && {website}),
      ...(typeof audit_link === 'string' && {audit_link}),
      ...{liquidity_percentage: liquidity_percentage || '0'},
      ...(typeof token_economic === 'string' && {token_economic}),
      ...(typeof twitter === 'string' && {twitter}),
      ...(typeof telegram === 'string' && {telegram}),
      ...(typeof name === 'string' && {name}),
      ...(typeof medium === 'string' && {medium}),
      ...(typeof description === 'string' && {description}),
      ...(typeof token_name === 'string' && {'token.token_name': token_name}),
      ...(typeof token_symbol === 'string' && {'token.token_symbol': token_symbol}),
      ...(typeof slug === 'string' && {
        slug: slugify(input?.slug || `${input?.name}-${input?.token?.token_symbol}`, {
          lower: true,
        }),
      }),
      ...(claimable_percentage && {claimable_percentage}),
    };

    return this.model.findOneAndUpdate({_id: id}, updateQuery as any, {new: true});
  }

  public async createUpdatePoolTx(
    pool: PoolDocument,
    poolData: IExtractRawPoolData,
    input: UpdateOnchainPoolInput & {
      earlyJoinStartTime: number;
      earlyJoinEndTime: number;
      publicStartTime: number;
      publicEndTime: number;
      claimAt: number;
    },
  ) {
    const admin_address = poolData.admins.root_admin;
    const tokenDecimals = await this.getTokenDecimals(pool.token.token_address);
    const tokenToDecimals = await this.getTokenDecimals(pool.token_to);

    const rate = await this.convertRateToDataContract(
      tokenToDecimals,
      tokenDecimals,
      input.token_ratio ? input.token_ratio : poolData.rate,
    );
    const campaign = {
      ...poolData.campaign,
      ...(input.campaign?.max_allocation_all_phases && {
        max_allocation_all_phases: convertToContractAmount(
          input.campaign.max_allocation_all_phases,
          tokenDecimals,
        ),
      }),
      ...(input.campaign?.claim_at && {
        claim_at: Math.floor(input.claimAt / 1000),
      }),
      early_join_phase: {
        ...poolData.campaign.early_join_phase,
        is_active: input.campaign.early_join_phase.is_active,
        max_total_alloc: !!input.campaign.early_join_phase.max_total_alloc
          ? convertToContractAmount(input.campaign.early_join_phase.max_total_alloc, tokenDecimals)
          : 0,
        start_at: Math.floor(input.earlyJoinStartTime / 1000),
        end_at: Math.floor(input.earlyJoinEndTime / 1000),
      },
      public_phase: {
        ...poolData.campaign.public_phase,
        is_active: true,
        max_individual_alloc: convertToContractAmount(
          input.campaign.public_phase.max_individual_alloc,
          tokenDecimals,
        ),
        start_at: Math.floor(input.publicStartTime / 1000),
        end_at: Math.floor(input.publicEndTime / 1000),
      },
    };
    this.validateInitPoolParams({
      rate,
      campaign,
    });

    if (
      !(await this.isChangedCampaign(poolData.campaign, campaign)) &&
      poolData.rate === input.token_ratio
    ) {
      return {
        rawTransaction: null,
      };
    }

    if (poolData.is_active) {
      throw new BadRequestException('Cannot edit data after pool is activated');
    }

    const recentBlockhash = await connection.getRecentBlockhash();
    const poolProgramId = await new Actions(connection).getPoolProgramId(
      new PublicKey(pool.contract_address),
    );
    let resultTx = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: new PublicKey(admin_address),
    });

    if (this.isChangedCampaign(poolData.campaign, campaign)) {
      resultTx = resultTx.add(
        Instructions.setCampaignInstruction(
          {
            poolAccount: new PublicKey(pool.contract_address),
            userAccount: new PublicKey(admin_address),
          },
          campaign,
          new PublicKey(poolProgramId),
        ),
      );
    }

    if (poolData.rate !== input.token_ratio) {
      resultTx = resultTx.add(
        Instructions.setRateInstruction(
          {
            poolAccount: new PublicKey(pool.contract_address),
            userAccount: new PublicKey(admin_address),
          },
          rate,
          new PublicKey(poolProgramId),
        ),
      );
    }
    const rawTx = resultTx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      rawTransaction: rawTx.toString('base64'),
    };
  }

  public async activatePool(id: string) {
    const pool = await this.model.findById(id);
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }
    const action = new Actions(await getConnection());

    const poolData = await action.readPool(new PublicKey(pool.contract_address));
    const root_admin = poolData.admins.root_admin;

    if (poolData.is_active) {
      throw new BadRequestException(`Pool is activated`);
    }

    const programId = await action.getPoolProgramId(new PublicKey(pool.contract_address));

    const recentBlockhash = await connection.getRecentBlockhash();
    const poolProgramId = await action.getPoolProgramId(new PublicKey(pool.contract_address));
    let resultTx = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: new PublicKey(root_admin),
    });

    const platformAccount = (await this.platformService.generate(programId)).publicKey;
    const poolContractAccount = new PublicKey(pool.contract_address);
    const [poolAuthority] = await PublicKey.findProgramAddress(
      [poolContractAccount.toBuffer()],
      new PublicKey(poolProgramId),
    );
    resultTx = resultTx.add(
      Instructions.setPoolActiveInstruction(
        {
          poolAccount: poolContractAccount,
          platformAccount: new PublicKey(platformAccount),
          rootAdminAccount: new PublicKey(root_admin),
          authority: poolAuthority,
          tokenAccountX: new PublicKey(poolData.token_x),
          tokenAccountY: new PublicKey(poolData.token_y),
        },
        {isActive: true},
        new PublicKey(poolProgramId),
      ),
    );
    const rawTx = resultTx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      rawTransaction: rawTx.toString('base64'),
    };
  }

  public async isChangedRate(old: IRate, new_obj: IRate) {
    return !_.isEqual(old, new_obj);
  }

  public async isChangedCampaign(old: ICampaign, new_obj: ICampaign) {
    return !_.isEqual(new_obj, old);
  }

  public async delete(id: string) {
    return this.model.deleteOne({_id: id});
  }

  public async isExisted(data: CreatePoolInput): Promise<boolean> {
    return this.model.exists({
      $or: [
        {name: data.name},
        {'token.token_symbol': data.token?.token_symbol},
        {'token.token_address': data.token?.token_address},
        {slug: data.slug},
      ],
    });
  }

  public async getPoolFullInfo(data: PoolDocument) {
    const action = new Actions(getConnection());
    const poolData = await action.readPool(
      new PublicKey(data.contract_address),
      data.token.token_decimals,
      data.token_to === SOL ? 9 : null,
    );
    const join_pool_start = poolData.campaign.early_join_phase.is_active
      ? poolData.campaign.early_join_phase.start_at
      : poolData.campaign.public_phase.start_at;
    const join_pool_end = poolData.campaign.public_phase.end_at;
    return {
      ...data.toJSON(),
      join_pool_end,
      join_pool_start,
      data: poolData,
    };
  }

  public async extractRawPoolData(contract_address: string): Promise<IExtractRawPoolData> {
    const pool = await readPoolData(contract_address);
    const action = new Actions(connection);
    const tokenToDecimals = await action.getTokenDecimals(new PublicKey(pool.tokenAccountX));
    const tokenDecimals = await action.getTokenDecimals(new PublicKey(pool.tokenAccountY));

    return {
      is_initialized: pool.isInitialized,
      nonce: pool.nonce,
      id: Buffer.from(pool.pool_id).toString(),
      token_x: new PublicKey(pool.tokenAccountX).toBase58(),
      token_y: new PublicKey(pool.tokenAccountY).toBase58(),
      rate: await this.convertToUserRate(tokenToDecimals, tokenDecimals, {
        denominator: pool.rateDenominator,
        numerator: pool.rateNumerator,
      }),
      campaign: {
        max_allocation_all_phases: pool.max_allocation_all_phases,
        number_whitelisted_user: pool.number_whitelisted_user,
        claim_at: pool.claim_at,
        claimed_allocation: pool.claimed_allocation,
        early_join_phase: {
          is_active: pool.earlyJoinIsActive,
          max_total_alloc: pool.earlyJoinMaxTotalAlloc,
          max_individual_alloc: pool.earlyJoinIndividualAlloc,
          sold_allocation: pool.earlyJoinSoldAllocation,
          number_joined_user: pool.earlyJoinNumberJoined,
          start_at: pool.earlyJoinStart,
          end_at: pool.earlyJoinEnd,
        },
        public_phase: {
          is_active: pool.publicIsActive,
          max_total_alloc: pool.publicMaxTotalAlloc,
          max_individual_alloc: pool.publicIndividualAlloc,
          sold_allocation: pool.publicSoldAllocation,
          number_joined_user: pool.publicNumberJoined,
          start_at: pool.publicStart,
          end_at: pool.publicEnd,
        },
      },
      is_active: pool.isActive,
      platform: new PublicKey(pool.platform).toString(),
      admins: {
        root_admin: new PublicKey(pool.admin).toString(),
      },
    };
  }

  public validateAndGetPhasesTime(
    join_pool_start_input: string,
    join_pool_end_input: string,
    claim_at_input: string,
    early_phase_active: boolean,
    early_join_duration?: number,
  ) {
    const join_pool_end = new Date(join_pool_end_input).getTime();
    const join_pool_start = new Date(join_pool_start_input).getTime();
    const claimAt = new Date(claim_at_input).getTime();

    if (claimAt <= join_pool_end) {
      throw new BadRequestException('claim_at cannot less than or equal join_pool_end');
    }
    let earlyJoinStartTime = 0;
    let earlyJoinEndTime = 0;
    let publicStartTime = 0;
    const publicEndTime = join_pool_end;

    if (early_phase_active) {
      if (!early_join_duration) {
        throw new BadRequestException(`early_join_duration is required`);
      }
      const durationTime = early_join_duration * 60 * 1000;
      if (join_pool_start + durationTime > join_pool_end) {
        throw new BadRequestException(
          `When having Allocation round, join_pool_start A cannot happen ${durationTime} minutes earlier than join_pool_end`,
        );
      }
      earlyJoinStartTime = join_pool_start;
      earlyJoinEndTime = earlyJoinStartTime + durationTime;
      publicStartTime = earlyJoinEndTime;
    } else {
      if (join_pool_start >= join_pool_end) {
        throw new BadRequestException('join_pool_start cannot greater than join_pool_end');
      }
      publicStartTime = join_pool_start;
    }

    return {
      earlyJoinStartTime,
      earlyJoinEndTime,
      publicStartTime,
      publicEndTime,
      claimAt,
    };
  }

  public async changePoolAdmin(input: ChangePoolAdminInput) {
    if (!input.new_root_admin || !input.pool_id) {
      throw new BadRequestException('New admin address and pool id is required');
    }
    const pool = await this.model.findById(input.pool_id);
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    const action = new Actions(getConnection());
    const poolData = await action.readPool(new PublicKey(pool.contract_address));

    if (poolData.admins.root_admin === input.new_root_admin) {
      throw new ForbiddenException('Pool admin is already existed');
    }

    const recentBlockhash = await connection.getRecentBlockhash();
    const poolProgramId = await action.getPoolProgramId(new PublicKey(pool.contract_address));

    let resultTx = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: new PublicKey(poolData.admins.root_admin),
    });

    const instruction = Instructions.changePoolAdmin(
      {
        poolAccount: new PublicKey(pool.contract_address),
        newRootAdmin: new PublicKey(input.new_root_admin),
      },
      new PublicKey(poolProgramId),
    );
    resultTx = resultTx.add(instruction);

    const rawTx = resultTx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      rawTransaction: rawTx.toString('base64'),
    };
  }

  public async syncPool(id: string) {
    const pool = await this.findOnePoolOrFailById(id);
    const action = new Actions(getConnection());
    const poolData = (await action.readPool(
      new PublicKey(pool.contract_address),
      pool.token.token_decimals,
      pool.token_to_decimal,
    )) as IPoolV4ContractData;
    let join_pool_start;
    let join_pool_end;
    if (!poolData?.version) {
      join_pool_start = poolData.campaign.early_join_phase.is_active
        ? poolData.campaign.early_join_phase.start_at
        : poolData.campaign.public_phase.start_at;
      join_pool_end = poolData.campaign.public_phase.end_at;
    } else if (poolData.version >= 2) {
      const time = getJoinPoolStartAndEndTimeV4(poolData);
      join_pool_start = time.join_pool_start;
      join_pool_end = time.join_pool_end;
    }

    const poolUpdated = await this.model.findOneAndUpdate(
      {_id: id},
      {
        data: poolData,
        join_pool_start,
        join_pool_end,
      },
      {new: true},
    );
    // check joinPoolEnd change or not
    if (new Date(join_pool_end).getTime() !== new Date(pool.join_pool_end).getTime()) {
      await this.addJobFinalizePool(poolUpdated);
    }

    return poolUpdated;
  }

  public async findOnePoolOrFailBySlug(slug: string) {
    const pool = await this.model.findOne({slug});
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    return pool;
  }

  public async findOnePoolOrFailById(id: string) {
    const pool = await this.model.findById(id);
    if (!pool) {
      throw new NotFoundException('Pool not found');
    }

    return pool;
  }

  public async createClaimTokenHistory(input: CreateClaimTokenHistoryDto): Promise<any> {
    const claimTokenHistory = await this.claimTokenHistoryModel.create({
      user_address: input.user_address,
      pool_address: input.pool_address,
      token_address: input.token_address,
      claimed_at: input.claimed_at,
      is_claimed: true,
    });

    return claimTokenHistory;
  }

  public async getClaimTokenHistory(
    user_address: string,
    pool_address: string,
    token_address: string,
  ): Promise<any> {
    const claimTokenHistory = await this.claimTokenHistoryModel.findOne({
      user_address,
      pool_address,
      token_address,
    });

    return claimTokenHistory;
  }

  public async exportJoinPoolHistory(poolAddress: string, res: Response) {
    if (!poolAddress) {
      throw new BadRequestException('Pool address is required.');
    }

    const joinPoolHistories = await this.poolParticipantsService.indexUserJoinPoolHistory(
      {pool_address: poolAddress},
      true,
    );

    const data = joinPoolHistories.map((item) => ({
      user_address: item.user_address,
      associated_addres: item.participant_address,
      amount: item.amount,
      created_at: item?.createdAt,
    }));

    const fields = [
      {
        label: 'User address',
        value: 'user_address',
      },
      {
        label: 'Amount',
        value: 'amount',
      },
      {
        label: 'Created At',
        value: 'created_at',
      },
    ];

    const json2csv = new Parser({fields});
    const csv = json2csv.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`Join Pool History ${poolAddress}`);

    return res.send(csv);
  }

  async userVote(id: string, params: UserVoteDto): Promise<boolean> {
    try {
      const pool = await this.findOnePoolOrFailById(id);
      pool.data.voting.total_vote_up = params.total_vote_up;
      pool.data.voting.total_vote_down = params.total_vote_down;
      console.log({oldPool: pool});
      if (
        params.total_vote_up - params.total_vote_down >=
        pool.data.voting.required_absolute_vote
      ) {
        pool.flags.is_ready = true;
      } else {
        pool.flags.is_ready = false;
      }

      console.log({newPool: pool});

      await pool.save();
      return true;
    } catch (err) {
      return false;
    }
  }

  async findOneWithCondition(condition: any): Promise<PoolDocument> {
    return this.model.findOne(condition).exec();
  }

  addJobFinalizePool(pool: PoolDocument) {
    const cronName = uuid();
    console.log({cronName});
    const job = new CronJob(new Date(pool.join_pool_end), async () => {
      console.log('Job running');
      pool.flags.is_cron_running = true;
      pool = await pool.save();

      const joinPoolHistoryPending = await this.joinPoolHistoryRepository.find({
        pool_address: pool.contract_address,
        status: JoinPoolStatusEnum.Pending,
      });

      await Promise.all(
        joinPoolHistoryPending.map(async (history) => {
          const {exists, associatedAddress} = await this.actions.getPoolAssociatedAccountInfo(
            new PublicKey(history.user_address),
            new PublicKey(history.pool_address),
          );

          if (!exists) {
            history.status = JoinPoolStatusEnum.Failed;
            await history.save();
            return null;
          }

          history.status = JoinPoolStatusEnum.Succeeded;
          await history.save();

          let poolParticipantsDocs = await this.poolParticipantsRepository.findOne({
            user_address: history.user_address,
            pool_address: history.pool_address,
          });

          if (!poolParticipantsDocs) {
            return this.poolParticipantsRepository.create({
              pool_id: history.pool_id,
              participant_address: associatedAddress.toString(),
              user_address: history.user_address,
              pool_address: history.pool_address,
              amount: history.amount,
              join_pool_history_id: [history._id.toString()],
            });
          }

          poolParticipantsDocs.join_pool_history_ids = [
            ...poolParticipantsDocs.join_pool_history_ids,
            history._id.toString(),
          ];
          poolParticipantsDocs.amount = new Decimal(poolParticipantsDocs.amount)
            .plus(history.amount)
            .toNumber();
          poolParticipantsDocs = await poolParticipantsDocs.save();

          return poolParticipantsDocs;
        }),
      );
    });

    this.schedulerRegistry.addCronJob(cronName, job);
    job.start();

    console.log(`Logic of cron ${cronName} is running`);
  }
}
