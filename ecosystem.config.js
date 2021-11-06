module.exports = {
  apps: [
    {
      name: 'api-pools',
      script: 'node ./dist/main',
      watch: false,
      ignore_watch: 'swagger.json',
      env: {
        NODE_ENV: 'development',
        HOST: 'http://localhost',
        PORT: 3002,
        MONGODB_URL:
          'mongodb+srv://root:ONkbEgaivezfZBfa@gamify-dev.7n3tz.mongodb.net/gamify-dev?retryWrites=true&w=majority',
        REDIS_URL: 'redis://127.0.0.1:6379',
        POOL_PROGRAM_ID: 'DJ7QgQehs5iYqqs3dVAPgUitYH8Wn7rYcb6TAD1tCeDe',
        CLUSTER: 'devnet',
        API_VERSION: '0.1.0',
      },
      env_development: {
        NODE_ENV: 'development',
        HOST: 'http://54.151.154.88',
        PORT: 3002,
        MONGODB_URL:
          'mongodb+srv://root:ONkbEgaivezfZBfa@gamify-dev.7n3tz.mongodb.net/gamify-dev?retryWrites=true&w=majority',
        REDIS_URL: 'redis://127.0.0.1:6379',
        POOL_PROGRAM_ID: 'DJ7QgQehs5iYqqs3dVAPgUitYH8Wn7rYcb6TAD1tCeDe',
        CLUSTER: 'devnet',
        API_VERSION: '0.1.0',
      },
      env_staging: {
        NODE_ENV: 'production',
        HOST: 'https://staging-api.gamify.io',
        PORT: 3002,
        MONGODB_URL:
          'mongodb+srv://root:ONkbEgaivezfZBfa@gamify-dev.7n3tz.mongodb.net/gamify?retryWrites=true&w=majority',
        REDIS_URL: 'redis://127.0.0.1:6379',
        POOL_PROGRAM_ID: 'DJ7QgQehs5iYqqs3dVAPgUitYH8Wn7rYcb6TAD1tCeDe',
        CLUSTER: 'devnet',
        API_VERSION: '0.1.0',
      },
    },
  ],

  deploy: {
    development: {
      user: 'ubuntu',
      host: '54.151.154.88',
      ref: 'origin/develop',
      repo: 'git@github.com:Gamifyio/api-pools.git',
      path: '/home/ubuntu/app/api-pools',
      'post-setup': 'cp .env.development .env && ./install.sh',
      'post-deploy':
        'cp .env.development .env && ./install.sh && pm2 startOrRestart ecosystem.config.js --env development',
    },
    staging: {
      user: 'root',
      host: '95.217.212.37',
      ref: 'origin/develop',
      repo: 'git@github.com:Gamifyio/api-pools.git',
      path: '/root/app/api-pools',
      'post-setup': 'cp .env.staging .env && ./install.sh',
      'post-deploy':
        'cp .env.staging .env && ./install.sh && pm2 startOrRestart ecosystem.config.js --env staging',
    },
  },
};
