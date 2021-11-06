import {clusterApiUrl, Connection} from '@solana/web3.js';
import {envConfig} from '../../configs';

const {CLUSTER} = envConfig;

let connection: Connection;

export function getConnection(): Connection {
  if (connection) return connection;

  // connection = new Connection('http://localhost:8899', 'recent');
  connection = new Connection(clusterApiUrl(CLUSTER), 'recent');

  return connection;
}
