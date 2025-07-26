// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'defi-platform',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Monitoring
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    out_file: './logs/app.log',
    error_file: './logs/error.log',
    log_file: './logs/combined.log',
    
    // Resource limits
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Auto restart settings
    watch: false,
    autorestart: true,
    
    // Performance monitoring
    pmx: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    
    // Environment-specific settings
    node_args: '--max-old-space-size=1024'
  }]
};