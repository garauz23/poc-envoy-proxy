const https = require("https");
const fs = require("fs");

const port = Number(process.env.PORT || 8450);
const name = process.env.SERVICE_NAME || "https-service";

const options = {
  key: fs.readFileSync("/app/certs/server.key"),
  cert: fs.readFileSync("/app/certs/server.crt"),
};

const server = https.createServer(options, (req, res) => {
  const payload = {
    service: name,
    method: req.method,
    path: req.url,
    message: "HTTPS backend is running",
  };

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`${name} listening on https://0.0.0.0:${port}`);
});
