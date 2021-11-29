import {Account, PublicKey, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import * as Layout from '../../modules/layout/layout';
import {Numberu64} from '../../modules/layout';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BufferLayout = require('buffer-layout');

export class Instructions {
  static createInitInstruction(
    accounts: {
      poolAccount: Account;
      authority: PublicKey;
      tokenAccountX: PublicKey;
      tokenAccountY: PublicKey;
      whitelistAccounts: Account;
    },
    inputData: {
      nonce: number;
      rateNumerator: number;
      rateDenominator: number;
    },
    swapProgramId: PublicKey,
  ) {
    // logger.info('Instructions::createInitInstruction create instruction');
    const keys = [
      {pubkey: accounts.poolAccount.publicKey, isSigner: false, isWritable: true},
      {pubkey: accounts.authority, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountX, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountY, isSigner: false, isWritable: false},
      {pubkey: accounts.whitelistAccounts.publicKey, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('nonce'),
      BufferLayout.nu64('rateNumerator'),
      BufferLayout.nu64('rateDenominator'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeSwap instruction
          nonce: inputData.nonce,
          rateNumerator: inputData.rateNumerator,
          rateDenominator: inputData.rateDenominator,
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

  static createAddUserWhitelistInstruction(
    accounts: {
      poolAccount: Account;
      authority: PublicKey;
      userAccount: PublicKey;
      whitelistAccounts: PublicKey;
      adminAccount: PublicKey;
      adminListAccount: PublicKey;
    },
    poolProgramId: PublicKey,
  ) {
    // logger.info('Instructions::createAddUserWhitelistInstruction create instruction');
    const keys = [
      {pubkey: accounts.poolAccount.publicKey, isSigner: false, isWritable: false},
      {pubkey: accounts.authority, isSigner: false, isWritable: false},
      {pubkey: accounts.userAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.whitelistAccounts, isSigner: false, isWritable: true},
      {pubkey: accounts.adminAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.adminListAccount, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 101, // InitializeSwap instruction
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
      poolAccount: Account;
    },
    inputData: {
      poolPublicAccessTime: number;
    },
    poolProgramId: PublicKey,
  ) {
    // logger.info('Instructions::setPoolPublicAccessTime create instruction');
    const keys = [{pubkey: accounts.poolAccount.publicKey, isSigner: false, isWritable: true}];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.int64('poolPublicAccessTime'),
    ]);

    /*logger.info('Instructions::setPoolPublicAccessTime instruction data ', {
      instruction: 102, // setPoolPublicAccessTime instruction
      poolPublicAccessTime: inputData.poolPublicAccessTime,
    });*/
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 102, // setPoolPublicAccessTime instruction
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

  static createSwapInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;

      userSourceTokenAccount: PublicKey;
      poolSourceTokenAccount: PublicKey;
      sourceTokenProgram: PublicKey;

      userDestinationTokenAccount: PublicKey;
      poolDestinationTokenAccount: PublicKey;
      destinationTokenProgram: PublicKey;
    },
    inputData: {
      incoming_amount: number;
      min_outgoing_amount: number;
    },
    poolProgramId: PublicKey,
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.userAuthority, isSigner: false, isWritable: false},
      {pubkey: accounts.userSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.poolSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.sourceTokenProgram, isSigner: false, isWritable: false},
      {pubkey: accounts.userDestinationTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.poolDestinationTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.destinationTokenProgram, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('incoming_amount'),
      Layout.uint64('min_outgoing_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 1, // InitializeSwap instruction
          incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
          min_outgoing_amount: new Numberu64(inputData.min_outgoing_amount).toBuffer(),
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

  static createJoinInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;

      userAccount: Account;
      userJoinAccount: Account;

      userSourceTokenAccount: PublicKey;
      poolSourceTokenAccount: PublicKey;
      tokenProgramId: PublicKey;

      clockSysvarAccount: PublicKey;
    },
    inputData: {
      incoming_amount: number;
    },
    poolProgramId: PublicKey,
  ) {
    // logger.info('Instructions::createJoinInstruction create instruction');
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.userAuthority, isSigner: false, isWritable: false},
      {pubkey: accounts.userAccount.publicKey, isSigner: true, isWritable: true},
      {pubkey: accounts.userJoinAccount.publicKey, isSigner: false, isWritable: true},
      {pubkey: accounts.userSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.poolSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.tokenProgramId, isSigner: false, isWritable: false},
      {pubkey: accounts.clockSysvarAccount, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('incoming_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 2, // Join instruction
          incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
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

  static createClaimInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;

      userAccount: Account;
      joinedUsersAccount: PublicKey;

      userDestinationTokenAccount: PublicKey;
      poolDestinationTokenAccount: PublicKey;
      tokenProgramId: PublicKey;
    },
    poolProgramId: PublicKey,
  ) {
    // logger.info('Instructions::createClaimInstruction create instruction');
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: false},
      {pubkey: accounts.userAuthority, isSigner: false, isWritable: false},
      {pubkey: accounts.userAccount.publicKey, isSigner: false, isWritable: false},
      {pubkey: accounts.joinedUsersAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.userDestinationTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.poolDestinationTokenAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.tokenProgramId, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 3, // Claim instruction
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
