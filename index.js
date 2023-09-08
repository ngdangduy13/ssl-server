const express = require("express");
const { execSync } = require("child_process");
const fs = require("fs");

const app = express();
const port = 3000;

const proxy_pass = "https://google.com";

function getNginxConfig(domain, proxyPass) {
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
    }`;
}

app.get("/health-check", (req, res) => {
  res.send("Ok!");
});

app.post("/ssl/:domain", (req, res) => {
  const { domain } = req.params;
  fs.writeFileSync(`/etc/nginx/sites-enabled/${domain}`, getNginxConfig(domain, proxy_pass));
  const stdout = execSync(`sudo certbot -d ${domain} --force-renewal`);
  console.log({ domain, result: stdout.toString() });
  res.send("Success!");
});

app.delete("/ssl/:domain", (req, res) => {
  const { domain } = req.params;
  fs.unlinkSync(`/etc/nginx/sites-enabled/${domain}`);
  execSync(`sudo systemctl reload nginx`);
  res.send("Success!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
