module.exports = {
  apps: [
    {
      name: 'bot-discord',
      script: 'lib/index.js',
      instances: 'max',
      max_memory_restart: '250M',
    },
  ],
};
