const https = require("https");
const fs = require("fs");

const port = Number(process.env.PORT || 8450);
const name = process.env.SERVICE_NAME || "https-service";

const options = {
  key: fs.readFileSync("/app/certs/server.key"),
  cert: fs.readFileSync("/app/certs/server.crt"),
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = https.createServer(options, async (req, res) => {
  const requestUrl = new URL(req.url || "/", "https://localhost");

  if (req.method === "POST" && requestUrl.pathname === "/calls/users") {
    const body = await readBody(req);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        service: name,
        method: req.method,
        path: requestUrl.pathname,
        message: `Hello world from ${name}`,
        body,
      })
    );
    return;
  }

  const payload = {
    service: name,
    method: req.method,
    path: requestUrl.pathname,
    message: "HTTPS backend is running",
  };

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`${name} listening on https://0.0.0.0:${port}`);
});
