import {
  Actions,
  CURRENT_POOL_PROGRAM_ID,
  sendAndConfirmTransaction,
} from '@intersola/onchain-program-sdk';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import {PaginateModel} from 'mongoose';
import {getConnection} from '../../shared/utils/connection';
import {Platform, PlatformDocument} from './platform.schema';
import {PlatformLayout} from '../../shared/utils/contract-layout';
import {envConfig} from '../../configs';
import {restoreKeypairFromString} from '../../shared/utils/contract-main';

const connection = getConnection();

@Injectable()
export class PlatformService {
  constructor(
    @InjectModel(Platform.name) private readonly model: PaginateModel<PlatformDocument>,
  ) {}

  /**
   * Generate keys
   */
  async generate(programId?: PublicKey): Promise<{publicKey: string}> {
    let rec = await this.model.findOne().exec();
    if (!rec) {
      await this.generateNewPlatformAccount(programId || new PublicKey(CURRENT_POOL_PROGRAM_ID));
      rec = await this.model.findOne().exec();
    } else if (!!programId) {
      const action = new Actions(getConnection());
      const owner = await action.getOwner(new PublicKey(rec.publicKey));
      if (!owner.equals(programId)) {
        rec = await this.model.findOne({programId: programId.toBase58()}).exec();
        if (!rec) {
          await this.generateNewPlatformAccount(programId);
          rec = await this.model.findOne({programId: programId.toBase58()}).exec();
        }
      } else if (!rec.programId) {
        await this.model.updateOne({_id: rec.id}, {programId: programId.toBase58()}).exec();
      }
    }

    return {
      publicKey: rec.publicKey,
    };
  }

  async generateNewPlatformAccount(programId: PublicKey) {
    const payer = restoreKeypairFromString(envConfig.PAYER_SECRET_KEY);
    const transaction = new Transaction();
    const platAccount = new Keypair();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: platAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(PlatformLayout.span),
        space: PlatformLayout.span,
        programId: programId,
      }),
    );
    await sendAndConfirmTransaction(
      'setup pool account and rent data space',
      connection,
      transaction,
      payer,
      platAccount,
    );

    await this.model.create({
      publicKey: platAccount.publicKey.toBase58(),
      secretKey: Buffer.from(platAccount.secretKey).toString('base64'),
      programId: programId.toBase58(),
    });
  }
}
