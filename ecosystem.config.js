module.exports = {
  apps: [
    {
      name: 'bot-slack',
      script: 'lib/index.js',
      instances: 'max',
      max_memory_restart: '250M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
