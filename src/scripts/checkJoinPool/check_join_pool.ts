// CLUSTER=mainnet-beta npm run check_join_pool EJvH2bHww7d5AyMXH8GjdWstMTc9vv8h5CHts4CPzvAF  /home/ntc/Job/Intersol/api-pools/src/scripts/extractUsersFromJoinTxs/joined_address-EJvH2bHww7d5AyMXH8GjdWstMTc9vv8h5CHts4CPzvAF.csv

import {config as dotenvConfig} from 'dotenv';
dotenvConfig();
import {Actions, sleep} from '@intersola/onchain-program-sdk';
import * as path from 'path';
import * as fs from 'fs';
import { getConnection } from '../../shared/utils/connection';
import { PublicKey } from '@solana/web3.js';
import { Parser } from 'json2csv';

class Program {
    async main() {
      const args = process.argv.slice(2);
      const poolAddress = args[0];
      const dataFilePath = args[1];

      if (!poolAddress) {
        throw new Error(`Please input pool address`);

      }

      if (!dataFilePath) {
        throw new Error(`Please input data file path`);
      }

      await this.process(poolAddress, dataFilePath);
    }

    async process(poolAddress: string, dataFilePath: string) {
      console.log('START PROCESSING');
      const userAddresses = [];
      const readline = require('readline');

      try {
        const readInterface = readline.createInterface({
          input: fs.createReadStream(path.resolve(dataFilePath)),
          output: false,
          console: false
        });

        for await (const line of readInterface) {
          const arr = line.split(',')
          userAddresses.push({
            address: line,
            // arr[0].slice(1,arr[0].length - 1),
            contribute: 0
          });
        }
      } catch (e) {
        console.error(`Cannot read input data file due to error `, e);
      }

      console.log(`processing poolAddress=${poolAddress}, dataFilePath=${dataFilePath}`);

      const action = new Actions(getConnection());
      const poolAddressPK = new PublicKey(poolAddress);
      const poolData = await action.readPool(poolAddressPK);
      const ratio = poolData.rate;
      const isProcessedAddresses = {};

      const result = [];
      for (let i in userAddresses) {
        const userAddress = userAddresses[i].address;
        console.log(`Checking address: ${userAddress}`);
        try {
          if (isProcessedAddresses[userAddress]) {
            console.log(`Skip duplicate entry: ${userAddress}`);
            continue;
          }

          const a = new PublicKey(userAddress)

          const investorData = await action.readInvestorData(
            a,
            poolAddressPK
          );
          if (investorData) {
            result.push({
              user_address: userAddress,
              amount_sol: investorData.amount_token_x,
              amount_token: investorData.amount_token_y,
              user_allocation: investorData.user_allocation && investorData.user_allocation / ratio,
              success: true
            });
          } else {
            result.push({
              user_address: userAddress,
              amount_sol: 0,
              amount_token: 0,
              user_allocation: 0,
              success: false
            });
          }
          isProcessedAddresses[userAddress] = true;
        } catch (error) {
          console.log(error)
          console.error(`  Probably the address didn't join this pool`);
        }
        await sleep(3000);
      }

      const fields = [
        {
          label: 'User address',
          value: 'user_address'
        },
        {
          label: 'Amount SOL',
          value: 'amount_sol'
        },
        {
         label: 'Amount token',
          value: 'amount_token'
        },
        {
         label: 'User Allocation',
          value: 'user_allocation'
        },
        {
         label: 'Success',
          value: 'success'
        }
      ];
      const json2csv = new Parser({ fields });
      const dataCsv = json2csv.parse(result);

      fs.appendFileSync(path.join(__dirname, `output-${poolAddress}.csv`), dataCsv);
    }
  }

  function write(settlementId: string) {
    return new Promise((resolve, reject) => {
      fs.appendFile('src/scripts/settlement6.txt', `${settlementId}\r\n`, (err) => {
        if (err) throw reject(err);
        console.log('Saved!');
        resolve(true);
      });
    });
  }

  new Program()
    .main()
    .then(() => {
      console.log('-------------');
      console.log(`the main function of Program is finished. Please check result in output.csv`);
      process.exit(0);
    })
    .catch((err) => {
      console.log(err.stack);
      process.exit(err.code || -1);
    });
