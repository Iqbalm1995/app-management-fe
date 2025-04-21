module.exports = {
  apps: [
    {
      name: "app-management-fe",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 8998,
      },
    },
  ],
};
