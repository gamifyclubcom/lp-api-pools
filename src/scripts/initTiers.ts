import {config as dotenvConfig} from 'dotenv';
dotenvConfig();
import {INestApplication} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {PlatformService} from '../modules/platform/platform.service';
import {AppModule} from '../app.module';
import {getConnection} from '../shared/utils/connection';
import {Actions, CURRENT_POOL_PROGRAM_ID} from '@gamify/onchain-program-sdk';
import {restoreKeypairFromString} from '../shared/utils/contract-main';
import {envConfig} from '../configs/env.config';
import {PublicKey} from '@solana/web3.js';
import {sendAndConfirmTransaction} from '../shared/utils/helper';

class Program {
  private app: INestApplication;
  private platformService: PlatformService;

  async main() {
    try {
      await this.initialize();
      await this.process();
    } catch (err) {
      console.log(err.stack);
    }
  }

  private async initialize() {
    console.log('initialize [START]');

    this.app = await NestFactory.create<NestExpressApplication>(AppModule);
    this.platformService = this.app.get<PlatformService>(PlatformService);
  }

  private async process() {
    const connection = getConnection();
    const action: Actions = new Actions(connection);
    const payerSecret = envConfig.PAYER_SECRET_KEY;
    const stakeSecretKey = envConfig.STAKE_SECRET_KEY;
    const tokenMinAddress = envConfig.TOKEN_MINT_ADDRESS;
    const stakaAdminAddress = envConfig.STAKE_ADMIN_ADDRESS;

    if (!payerSecret || !stakeSecretKey || !tokenMinAddress || !stakaAdminAddress) {
      throw new Error(
        `Config env before run script: ${{
          payerSecret,
          stakeSecretKey,
          tokenMinAddress,
          stakaAdminAddress,
        }}`,
      );
    }

    const payer = restoreKeypairFromString(payerSecret);
    const stakeAcc = restoreKeypairFromString(stakeSecretKey);
    const {publicKey: platform} = await this.platformService.generate(
      new PublicKey(CURRENT_POOL_PROGRAM_ID),
    );
    if (await connection.getAccountInfo(stakeAcc.publicKey)) {
      const tier = await action.readTiers(stakeAcc.publicKey);
      console.log(tier);
      console.log(`Account has already init, try with other acc`);
      return;
    }

    const {
      stakeAcc: newAcc,
      transaction,
      unsignedTransaction,
      unsignedData,
      stakeTokenAccount,
    } = await action.initTier(
      new PublicKey(payer.publicKey),
      new PublicKey(platform),
      new PublicKey(stakaAdminAddress),
      new PublicKey(tokenMinAddress),
      Buffer.from(stakeAcc.secretKey).toString('base64'),
    );

    await sendAndConfirmTransaction(
      'init tiers data',
      connection,
      unsignedTransaction,
      payer,
      stakeTokenAccount,
      stakeAcc,
    );

    const tiers = await action.readTiers(newAcc.publicKey);
    console.log('tiers: ', tiers);
  }
}

new Program()
  .main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(err.code || -1);
  });
