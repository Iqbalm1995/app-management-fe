module.exports = {
  apps: [
    {
      name: "app-management-fe",
      script: "npm",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      env: {
        PORT: 80,
      },
    },
  ],
};
