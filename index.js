const express = require("express");
const { execSync, exec, spawnSync } = require("child_process");
const fs = require("fs");
const { generateSSL } = require("./acme-client");

const app = express();
const port = 3000;

const proxy_pass = "https://google.com";

function getNginxConfig(domain, proxyPass, certPath, privKeyPath) {
  return `server {
        server_name ${domain};

        location / {
            proxy_pass                          ${proxyPass};
            proxy_set_header  Host              $http_host;
            proxy_set_header  X-Real-IP         $remote_addr;
            proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header  X-Forwarded-Proto $scheme;
            proxy_read_timeout                  900;
        }

        listen 443 ssl; 
        ssl_certificate  ${certPath}; 
        ssl_certificate_key  ${privKeyPath}; 
    }`;
}

app.get("/health-check", (req, res) => {
  res.send("Ok!");
});

app.post("/ssl/:domain", async (req, res) => {
  const { domain } = req.params;

  const { privateKeyPath, certPath, csrPath } = await generateSSL(domain);

  const path = `/etc/nginx/sites-enabled/${domain}`;
  fs.writeFileSync(path, getNginxConfig(domain, proxy_pass, certPath, privateKeyPath));
  res.send("Success!");
});

app.delete("/ssl/:domain", (req, res) => {
  const { domain } = req.params;
  const path = `/etc/nginx/sites-enabled/${domain}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(`/etc/nginx/sites-enabled/${domain}`);
    execSync(`sudo systemctl reload nginx`);
  }
  res.send("Success!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
