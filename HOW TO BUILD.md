## 3 Simple Steps:

### 1. Build (on your Windows machine)
cmd
npm run build:standalone


### 2. Copy to RHEL server
cmd
scp -r .next\standalone\* user@server:/app/


### 3. Restart on server
bash
ssh user@server
cd /app
pm2 restart ecosystem.config.js