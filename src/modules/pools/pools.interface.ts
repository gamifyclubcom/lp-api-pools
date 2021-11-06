import {PublicKey} from '@solana/web3.js';

export interface IPoolContractData {
  is_initialized: boolean;
  nonce: string;
  id: string;
  token_x: PublicKey;
  token_y: PublicKey;
  fees?: IFees;
  rate?: IRates; // token ratio
  campaign: IPoolCampaign;
  is_active: boolean;
  platform: PublicKey;
  admins: IPoolAdministrators;
}

export interface IPoolFullInfo {
  logo?: string;
  name: string;
  slug?: string;
  website?: string;
  token_economic?: string;
  twitter?: string;
  telegram?: string;
  medium?: string;
  description?: string;
  tag_line?: string;
  pool_start: Date;
}
export interface IPool extends IPoolFullInfo {
  id?: string;
  contract_address: string;
  program_id: string;
  contract_address_secret?: string;
  // fields that store in contract
  token_ratio: number;
  root_admin: string;
  // token info
  token: IToken;
  // token is used to buy token symbol
  token_to: string;
  data: IPoolContractData;
}

export interface IPoolAdministrators {
  root_admin: PublicKey;
}

export interface IToken {
  token_address: string;
  token_decimals: number;
  token_name: string;
  token_symbol: string;
  token_total_supply: string;
}

export interface IPoolCampaign {
  max_allocation_all_phases: number;
  number_whitelisted_user: number;
  claim_at: Date;
  early_join_phase: IPoolPhase;
  public_phase: IPoolPhase;
}

export interface IFees {
  numerator: number;
  denominator: number;
}

export interface IRates {
  numerator: number;
  denominator: number;
}

export interface IPoolPhase {
  is_active: boolean;
  max_total_alloc: number;
  max_individual_alloc: number;
  sold_allocation: number;
  number_joined_user: number;
  start_at: Date;
  end_at: Date;
}

export interface IExtractPoolData {
  is_initialized: boolean;
  nonce: number;
  id: string;
  token_x: string;
  token_y: string;
  rate: number;
  campaign: {
    max_allocation_all_phases: number;
    number_whitelisted_user: number;
    claim_at: Date;
    claimed_allocation: number;
    early_join_phase: {
      is_active: boolean;
      max_total_alloc: number;
      max_individual_alloc: number;
      sold_allocation: number;
      number_joined_user: number;
      start_at: Date;
      end_at: Date;
    };
    public_phase: {
      is_active: boolean;
      max_total_alloc: number;
      max_individual_alloc: number;
      sold_allocation: number;
      number_joined_user: number;
      start_at: Date;
      end_at: Date;
    };
  };
  is_active: boolean;
  platform: string;
  admins: {
    root_admin: string;
  };
}

export interface IExtractRawPoolData {
  is_initialized: boolean;
  nonce: number;
  id: string;
  token_x: string;
  token_y: string;
  rate: number;
  campaign: {
    max_allocation_all_phases: number;
    number_whitelisted_user: number;
    claim_at: number;
    claimed_allocation: number;
    early_join_phase: {
      is_active: boolean;
      max_total_alloc: number;
      max_individual_alloc: number;
      sold_allocation: number;
      number_joined_user: number;
      start_at: number;
      end_at: number;
    };
    public_phase: {
      is_active: boolean;
      max_total_alloc: number;
      max_individual_alloc: number;
      sold_allocation: number;
      number_joined_user: number;
      start_at: number;
      end_at: number;
    };
  };
  is_active: boolean;
  platform: string;
  admins: {
    root_admin: string;
  };
}
