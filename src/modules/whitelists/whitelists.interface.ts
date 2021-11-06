export interface IWhitelist {
  pool_id: string;
  user_public_key: string;
  user_pool_account: string;
  user_pool_secret: string;
  is_whitelisted: boolean;
}
