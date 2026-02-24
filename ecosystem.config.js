module.exports = {
  apps: [
    {
      name: "app-management-fe",
      script: "./server.js",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 80,
      },
    },
  ],
};
