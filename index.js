const express = require("express");
const { execSync, exec, spawnSync } = require("child_process");
const fs = require("fs");
const { generateSSL } = require("./acme-client");

const app = express();
const port = 3000;

app.get("/health-check", (req, res) => {
  res.send("Ok!");
});

app.post("/ssl/:domains", async (req, res) => {
  const { domains } = req.params;

  const domainList = domains.split(",");

  await Promise.all(domainList.map((domain) => generateSSL(domain)));

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
