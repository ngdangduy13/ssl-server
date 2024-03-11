
Caution:
1. Make sure the app has permission to write/read/delete file to <b>/etc/ssl<b>, <b>/etc/nginx/sites-enabled/</b>, <b>/var/www/html/.well-known/acme-challenge/</b> directories and those directories are existed
2. Make sure the app can run this command `sudo systemctl reload nginx` to reload nginx

Step to deploy: 
1. Install pm2 globally
2. Install dependencies: `npm i`
3. Start server: `pm2 start index.js`