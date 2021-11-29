import {Keypair, PublicKey, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import * as Layout from './layout';
import {Numberu64} from './layout';
import * as BufferLayout from 'buffer-layout';
import {ICampaign, IInitPoolData, IRate} from './interface';
import {InitPoolLayout, SetCampaignLayout} from './contract-layout';

export class Instructions {
  static createInitInstruction(
    accounts: {
      poolAccount: PublicKey;
      platformAccount: PublicKey;
      authority: PublicKey;
      rootAdminAccount: PublicKey;
      tokenAccountX: PublicKey;
      tokenAccountY: PublicKey;
      payerAccount: PublicKey;
    },
    inputData: IInitPoolData,
    swapProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.authority, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountX, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountY, isSigner: false, isWritable: false},
      {pubkey: accounts.rootAdminAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.platformAccount, isSigner: false, isWritable: true},
      {
        pubkey: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ];

    const commandDataLayout = BufferLayout.struct(InitPoolLayout);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeSwap instruction
          nonce: inputData.nonce,

          feesNumerator: inputData.fees.numerator,
          feesDenominator: inputData.fees.denominator,

          rateNumerator: inputData.rate.numerator,
          rateDenominator: inputData.rate.denominator,

          max_allocation_all_phases: inputData.campaign.max_allocation_all_phases,

          earlyJoinIsActive: inputData.campaign.early_join_phase.is_active,
          earlyJoinMaxTotalAlloc: inputData.campaign.early_join_phase.max_total_alloc,
          earlyJoinStart: Math.floor(inputData.campaign.early_join_phase.start_at / 1000),
          earlyJoinEnd: Math.floor(inputData.campaign.early_join_phase.end_at / 1000),

          publicIndividualAlloc: inputData.campaign.public_phase.max_individual_alloc,
          publicStart: Math.floor(inputData.campaign.public_phase.start_at / 1000),
          publicEnd: Math.floor(inputData.campaign.public_phase.end_at / 1000),
          publicIsActive: inputData.campaign.public_phase.is_active,

          claim_at: Math.floor(inputData.campaign.claim_at / 1000),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: swapProgramId,
      data,
    });
  }

  static setCampaignInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAccount: PublicKey;
    },
    inputData: ICampaign,
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.userAccount, isSigner: false, isWritable: false},
      {
        pubkey: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ];

    let data = Buffer.alloc(1024);
    {
      const encodeLength = SetCampaignLayout.encode(
        {
          instruction: 103,
          max_allocation_all_phases: inputData.max_allocation_all_phases,

          earlyJoinIsActive: inputData.early_join_phase.is_active,
          earlyJoinMaxTotalAlloc: inputData.early_join_phase.max_total_alloc,
          earlyJoinStart: Math.floor(inputData.early_join_phase.start_at),
          earlyJoinEnd: Math.floor(inputData.early_join_phase.end_at),

          publicIsActive: inputData.public_phase.is_active,
          publicIndividualAlloc: inputData.public_phase.max_individual_alloc,
          publicStart: Math.floor(inputData.public_phase.start_at),
          publicEnd: Math.floor(inputData.public_phase.end_at),

          claim_at: Math.floor(inputData.claim_at),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static setRateInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAccount: PublicKey;
    },
    inputData: IRate,
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.userAccount, isSigner: false, isWritable: false},
      {
        pubkey: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.nu64('rateNumerator'),
      BufferLayout.nu64('rateDenominator'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 102,
          rateNumerator: inputData.numerator,
          rateDenominator: inputData.denominator,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static setUserWhitelistInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAccount: PublicKey;
      poolMemberAccount: PublicKey;
      poolAdminAccount: PublicKey;
    },
    inputData: {
      isWhitelisted: boolean;
    },
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.userAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.poolMemberAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.poolAdminAccount, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('is_whitelisted'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 101,
          is_whitelisted: inputData.isWhitelisted,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static setPoolPublicAccessTimeInstruction(
    accounts: {
      poolAccount: Keypair;
    },
    inputData: {
      poolPublicAccessTime: number;
    },
    poolProgramId: PublicKey,
  ) {
    const keys = [{pubkey: accounts.poolAccount.publicKey, isSigner: false, isWritable: true}];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.int64('poolPublicAccessTime'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 102,
          poolPublicAccessTime: new Numberu64(inputData.poolPublicAccessTime).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static setPoolActiveInstruction(
    accounts: {
      poolAccount: PublicKey;
      platformAccount: PublicKey;
      authority: PublicKey;
      rootAdminAccount: PublicKey;
      tokenAccountX: PublicKey;
      tokenAccountY: PublicKey;
    },
    inputData: {
      isActive: boolean;
    },
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.authority, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountX, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountY, isSigner: false, isWritable: false},
      {pubkey: accounts.rootAdminAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.platformAccount, isSigner: false, isWritable: false},
      {
        pubkey: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('is_active'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 104,
          is_active: inputData.isActive,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static changePoolAdmin(
    accounts: {
      poolAccount: PublicKey;
      newRootAdmin: PublicKey;
    },
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.newRootAdmin, isSigner: false, isWritable: true},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 100,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }
}
