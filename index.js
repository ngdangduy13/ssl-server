const express = require("express");
const { execSync, exec, spawnSync } = require("child_process");
const fs = require("fs");
const { generateSSL } = require("./acme-client");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/health-check", (req, res) => {
  res.send("Ok!");
});

app.post("/ssl-certs/", async (req, res) => {
  try {
    const { body } = req;
    await Promise.all(body.domains.map((domain) => generateSSL(domain, body.provider)));
    execSync(`sudo systemctl reload nginx`);

    res.send({ message: "Success!" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e.message });
  }
});

app.delete("/ssl-certs/:domain", (req, res) => {
  const { domain } = req.params;
  const path = `/etc/nginx/sites-enabled/${domain}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(`/etc/nginx/sites-enabled/${domain}`);
    execSync(`sudo systemctl reload nginx`);
  }
  res.send({ message: "Success!" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
