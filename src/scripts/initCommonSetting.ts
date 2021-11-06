import {config as dotenvConfig} from 'dotenv';
dotenvConfig();
import {getConnection} from '../shared/utils/connection';
import {Actions} from '@intersola/onchain-program-sdk';
import {restoreKeypairFromString} from '../shared/utils/contract-main';
import {envConfig} from '../configs/env.config';
import {PublicKey} from '@solana/web3.js';
import {sendAndConfirmTransaction} from '../shared/utils/helper';

class Program {
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
  }

  private async process() {
    const connection = getConnection();
    const action: Actions = new Actions(connection);
    const payerSecret = envConfig.PAYER_SECRET_KEY;
    const stakeSecretKey = envConfig.STAKE_SECRET_KEY;
    const tokenMinAddress = envConfig.TOKEN_MINT_ADDRESS;
    const stakeAdminAddress = envConfig.STAKE_ADMIN_ADDRESS;
    const poolVersion = +envConfig.CURRENT_POOL_VERSION;

    if (!payerSecret || !stakeSecretKey || !tokenMinAddress || !stakeAdminAddress || !poolVersion) {
      throw new Error(
        `Config env before run script: ${{
          payerSecret,
          stakeSecretKey,
          tokenMinAddress,
          stakeAdminAddress,
          poolVersion,
        }}`,
      );
    }

    const payer = restoreKeypairFromString(payerSecret);

    try {
      const commonSetting = await action.readCommonSettingByVersion(poolVersion);
      if (commonSetting) {
        console.log(commonSetting);
        console.log(`Account has already init, try with other acc`);
        return;
      }
    } catch (error) {
      console.log('check commonSetting', error);
    }

    const {unsignedTransaction} = await action.initCommonSetting(
      new PublicKey(payer.publicKey),
      new PublicKey(stakeAdminAddress),
      10,
      4,
      {
        max_voting_days: 7,
        required_absolute_vote: 200,
        token_voting_power_rate: 100,
      },
    );

    await sendAndConfirmTransaction('init tiers data', connection, unsignedTransaction, payer);

    const setting = await action.readCommonSettingByVersion(poolVersion);
    console.log('setting: ', setting);
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
