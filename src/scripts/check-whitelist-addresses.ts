import {config as dotenvConfig} from 'dotenv';
dotenvConfig();
import * as _ from 'lodash';
import * as minimist from 'minimist';
import axios from 'axios';
import pLimit from 'p-limit';
import {sleep} from '@gamify/onchain-program-sdk';

const ARG_ADRRESSES = 'addresses';
const ARG_POOL_ID = 'poolId';

class Program {
  async main() {
    try {
      await this.process();
    } catch (error) {
      throw error;
    }
  }

  async process() {
    console.log('PROCESSING');
    const limit = pLimit(1);

    const args = minimist(process.argv.slice(2), {
      string: [ARG_ADRRESSES, ARG_POOL_ID],
    });

    const host = process.env.HOST;
    console.log('-------------');
    console.log(`host: ${host}`);

    if (!host) {
      console.log('Please add HOST to env!');
      return;
    }

    const poolId = args[ARG_POOL_ID];
    console.log('-------------');
    console.log(`poolId: ${poolId}`);
    if (!poolId) {
      console.log(`Missing ${ARG_POOL_ID}!`);
      return;
    }

    const addressArg = args[ARG_ADRRESSES];
    console.log('-------------');
    console.log(`addressArg: ${addressArg}`);
    if (!addressArg) {
      console.log(`Missing ${ARG_ADRRESSES}!`);
      return;
    }

    const addresses = addressArg.split(',');
    const responses = [];
    const errorCheckAddresses = [];

    await Promise.all(
      addresses.map(async (address: string) => {
        return limit(async () => {
          console.log(`Checking address: ${address}`);
          try {
            const res = await axios.get(`${host}/api/pools/${poolId}/users`, {
              params: {
                userAccount: address,
              },
            });
            responses.push(res.data);
          } catch (error) {
            console.log('-------------');
            console.log(`Something went wrong with address: ${address}`);
            console.log(error.response?.statusText);
            errorCheckAddresses.push(address);
          }
          await sleep(1000);
          console.log('Waiting 1s');
        });
      }),
    );
    const whitelistedAddresses = responses.filter((el) => el.isWhitelisted);
    const notWhitelistedAddresses = responses.filter((el) => !el.isWhitelisted);

    console.log('-------------');
    console.log(`Whitelisted addresses:`);
    whitelistedAddresses.forEach((el) => console.log(el.userAccount));

    console.log('-------------');
    console.log(`Not whitelisted addresses:`);
    notWhitelistedAddresses.forEach((el) => console.log(el.userAccount));

    console.log('-------------');
    console.log(`Error when checking:`);
    errorCheckAddresses.forEach((el) => console.log(el));
  }
}

new Program()
  .main()
  .then(() => {
    console.log('-------------');
    console.log(`the main function of Program is finished`);
    process.exit(0);
  })
  .catch((err) => {
    console.log(err.stack);
    process.exit(err.code || -1);
  });
