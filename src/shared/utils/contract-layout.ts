import * as BufferLayout from 'buffer-layout';
import { bool } from './layout';
import * as Layout from './layout';

export const InitPoolLayout = [
  BufferLayout.u8('instruction'),
  BufferLayout.u8('nonce'),

  BufferLayout.nu64('rateNumerator'),
  BufferLayout.nu64('rateDenominator'),
  BufferLayout.nu64('feesNumerator'),
  BufferLayout.nu64('feesDenominator'),

  BufferLayout.nu64('max_allocation_all_phases'),

  bool('earlyJoinIsActive'),
  BufferLayout.nu64('earlyJoinMaxTotalAlloc'),
  BufferLayout.nu64('earlyJoinStart'),
  BufferLayout.nu64('earlyJoinEnd'),

  bool('publicIsActive'),
  BufferLayout.nu64('publicIndividualAlloc'),
  BufferLayout.nu64('publicStart'),
  BufferLayout.nu64('publicEnd'),

  BufferLayout.nu64('claim_at'),
];

export const PlatformLayout = BufferLayout.struct([
  Layout.publicKey('plat_admin'),
  BufferLayout.blob(18, 'pool_id'),
]);

export const PoolLayout = BufferLayout.struct([
  BufferLayout.u8('isInitialized'),
  BufferLayout.u8('nonce'),
  BufferLayout.blob(18, 'pool_id'),

  Layout.publicKey('tokenAccountX'),
  Layout.publicKey('tokenAccountY'),

  BufferLayout.nu64('rateNumerator'),
  BufferLayout.nu64('rateDenominator'),
  BufferLayout.nu64('feeNumerator'),
  BufferLayout.nu64('feeDenominator'),

  BufferLayout.nu64('max_allocation_all_phases'),
  BufferLayout.nu64('number_whitelisted_user'),
  BufferLayout.nu64('claim_at'),
  BufferLayout.nu64('claimed_allocation'),

  bool('earlyJoinIsActive'),
  BufferLayout.nu64('earlyJoinMaxTotalAlloc'),
  BufferLayout.nu64('earlyJoinIndividualAlloc'),
  BufferLayout.nu64('earlyJoinSoldAllocation'),
  BufferLayout.nu64('earlyJoinNumberJoined'),
  BufferLayout.nu64('earlyJoinStart'),
  BufferLayout.nu64('earlyJoinEnd'),

  bool('publicIsActive'),
  BufferLayout.nu64('publicMaxTotalAlloc'),
  BufferLayout.nu64('publicIndividualAlloc'),
  BufferLayout.nu64('publicSoldAllocation'),
  BufferLayout.nu64('publicNumberJoined'),
  BufferLayout.nu64('publicStart'),
  BufferLayout.nu64('publicEnd'),

  bool('isActive'),
  Layout.publicKey('platform'),
  Layout.publicKey('admin'),
]);

export interface PoolData {
  isInitialized: boolean;
  nonce: number;
  pool_id: string;
  tokenAccountX: string;
  tokenAccountY: string;
  rateNumerator: number;
  rateDenominator: number;
  feeNumerator: number;
  feeDenominator: number;

  max_allocation_all_phases: number;
  number_whitelisted_user: number;
  claim_at: number;
  claimed_allocation: number;

  earlyJoinIsActive: boolean;
  earlyJoinMaxTotalAlloc: number;
  earlyJoinIndividualAlloc: number;
  earlyJoinSoldAllocation: number;
  earlyJoinNumberJoined: number;
  earlyJoinStart: number;
  earlyJoinEnd: number;

  publicIsActive: boolean;
  publicMaxTotalAlloc: number;
  publicIndividualAlloc: number;
  publicSoldAllocation: number;
  publicNumberJoined: number;
  publicStart: number;
  publicEnd: number;

  isActive: boolean;
  platform: string;
  admin: string;
}

export const SetCampaignLayout = BufferLayout.struct([
  BufferLayout.u8('instruction'),
  BufferLayout.nu64('max_allocation_all_phases'),

  bool('earlyJoinIsActive'),
  BufferLayout.nu64('earlyJoinMaxTotalAlloc'),
  BufferLayout.nu64('earlyJoinStart'),
  BufferLayout.nu64('earlyJoinEnd'),

  bool('publicIsActive'),
  BufferLayout.nu64('publicIndividualAlloc'),
  BufferLayout.nu64('publicStart'),
  BufferLayout.nu64('publicEnd'),

  BufferLayout.nu64('claim_at'),
]);
