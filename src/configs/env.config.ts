import {Cluster, PublicKey} from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const DOMAIN = process.env.DOMAIN;
const CLUSTER = process.env.CLUSTER;
const API_VERSION = process.env.API_VERSION;
const MONGODB_URL = process.env.MONGODB_URL;
const PAYER_SECRET_KEY = process.env.PAYER_SECRET_KEY;
const STAKE_SECRET_KEY = process.env.STAKE_SECRET_KEY;
const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
const STAKE_ADMIN_ADDRESS = process.env.STAKE_ADMIN_ADDRESS;
const CURRENT_POOL_VERSION = process.env.CURRENT_POOL_VERSION;

export const envConfig = {
  JWT_SECRET,
  HOST,
  PORT,
  DOMAIN,
  CLUSTER: CLUSTER as Cluster,
  API_VERSION,
  MONGODB_URL,
  PAYER_SECRET_KEY,
  STAKE_SECRET_KEY,
  TOKEN_MINT_ADDRESS,
  STAKE_ADMIN_ADDRESS,
  CURRENT_POOL_VERSION,
};
