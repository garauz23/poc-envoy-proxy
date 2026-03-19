const fs = require('fs');
const https = require('https');

const port = Number(process.env.PORT || 5050);
const envoyHost = process.env.ENVOY_HOST || 'localhost';
const restPort = Number(process.env.ENVOY_REST_PORT || 10000);
const soapPort = Number(process.env.ENVOY_SOAP_PORT || restPort);
const allowInsecureTls = (process.env.ALLOW_INSECURE_TLS || 'true').toLowerCase() === 'true';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function proxyToEnvoy(targetPort, req, res, path, body) {
  const options = {
    hostname: envoyHost,
    port: targetPort,
    path,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${envoyHost}:${targetPort}`,
      'content-length': body.length,
    },
    rejectUnauthorized: !allowInsecureTls,
  };

  const upstreamReq = https.request(options, (upstreamRes) => {
    const responseChunks = [];
    upstreamRes.on('data', (chunk) => responseChunks.push(chunk));
    upstreamRes.on('end', () => {
      const payload = Buffer.concat(responseChunks);
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      res.end(payload);
    });
  });

  upstreamReq.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'upstream_request_failed',
        message: err.message,
        target: `https://${envoyHost}:${targetPort}${path}`,
      })
    );
  });

  if (body.length > 0) {
    upstreamReq.write(body);
  }
  upstreamReq.end();
}

const tlsOptions = {
  key: fs.readFileSync('/app/certs/server.key'),
  cert: fs.readFileSync('/app/certs/server.crt'),
};

const server = https.createServer(tlsOptions, async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'missing_url' }));
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        envoy_rest_listener: `https://${envoyHost}:${restPort}`,
        envoy_soap_listener: `https://${envoyHost}:${soapPort}`,
      })
    );
    return;
  }

  const body = await readBody(req);

  if (req.url.startsWith('/rest')) {
    const proxiedPath = req.url.replace(/^\/rest/, '') || '/';
    proxyToEnvoy(restPort, req, res, proxiedPath, body);
    return;
  }

  if (req.url.startsWith('/soap')) {
    const proxiedPath = req.url.replace(/^\/soap/, '') || '/';
    proxyToEnvoy(soapPort, req, res, proxiedPath, body);
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(
    JSON.stringify({
      error: 'not_found',
      routes: ['/health', '/rest/*', '/soap/*'],
    })
  );
});

server.listen(port, '0.0.0.0', () => {
  console.log(`client-backend listening on https://0.0.0.0:${port}`);
  console.log(`forwarding /rest/* -> https://${envoyHost}:${restPort}`);
  console.log(`forwarding /soap/* -> https://${envoyHost}:${soapPort}`);
});
