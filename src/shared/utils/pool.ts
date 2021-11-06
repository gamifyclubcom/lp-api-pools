import {
  Keypair,
  PublicKey,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction as realSendAndConfirmTransaction,
  TransactionSignature,
} from '@solana/web3.js';
import {PlatformLayout, PoolLayout} from './contract-layout';
import {Instructions} from './instructions';
import {IInitPoolData} from './interface';
export class Pool {
  static async createPool(
    connection: Connection,
    accounts: {
      poolAccount: PublicKey;
      platformAccount: PublicKey;
      authority: PublicKey;
      payerAccount: PublicKey;
      rootAdminAccount: PublicKey;
      tokenAccountX: PublicKey;
      tokenAccountY: PublicKey;
    },
    programId: PublicKey,
    data: IInitPoolData,
  ) {
    const recentBlockhash = await connection.getRecentBlockhash();
    const initPoolTx = new Transaction({
      recentBlockhash: recentBlockhash.blockhash,
      feePayer: accounts.payerAccount,
    });
    const instruction = Instructions.createInitInstruction(accounts, data, programId);

    initPoolTx.add(instruction);
    const rawTx = initPoolTx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      rawTransaction: rawTx.toString('base64'),
    };
  }
}

function sendAndConfirmTransaction(
  title: string,
  connection: Connection,
  transaction: Transaction,
  ...signers: Array<Keypair>
): Promise<TransactionSignature> {
  return realSendAndConfirmTransaction(connection, transaction, signers, {
    skipPreflight: false,
    commitment: 'recent',
    preflightCommitment: 'recent',
  });
}
