module.exports = {
    apps: [{
      name: 'frotend',
      script: 'server.js',
      instances: 1, // For Next.js, usually 1 instance is recommended
      exec_mode: 'fork', // Not cluster mode for Next.js
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      }
    }]
  };