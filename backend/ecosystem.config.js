module.exports = {
  apps: [{
    name: "smart-link-backend",
    script: "./bin/www",
    watch: true,
    env: {
      "PORT": 5000,
      "NODE_ENV": "development"
    }
  }]
}