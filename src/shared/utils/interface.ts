export interface IInitPoolData {
  nonce: number;
  rate: IRate;
  fees: IFee;
  campaign: ICampaign;
}

export interface IPoolData {
  nonce: number;
  rate: IRate;
  fees?: IFee;
  campaign: ICampaign;
}

export interface IFee {
  numerator: number;
  denominator: number;
}

export interface IRate {
  numerator: number;
  denominator: number;
}

export interface ICampaign {
  max_allocation_all_phases: number;
  claim_at: number;
  early_join_phase: {
    is_active: boolean;
    max_total_alloc: number;
    start_at: number;
    end_at: number;
  };
  public_phase: {
    is_active: boolean;
    max_individual_alloc: number;
    start_at: number;
    end_at: number;
  };
}
