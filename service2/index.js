import express from "express";

const app = express();

// sleep
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// jitter: agrega variación aleatoria
function jitter(ms, ratio = 0.2) {
  const delta = ms * ratio;
  const random = (Math.random() * 2 - 1) * delta; // [-delta, +delta]
  return Math.max(0, ms + random);
}

app.get("/hello", async (req, res) => {
  const delay = jitter(1000); // base 1000ms con jitter ±20%
  console.log(`⏳ Responding in ~${Math.round(delay)}ms`);

  await sleep(delay);
  res.json({
    service: "service2",
    message: "Hola desde service2 👋",
    receivedHeaders: req.headers,
    delayUsedMs: Math.round(delay),
  });
});

app.get("/hello-world", async (req, res) => {
  const delay = jitter(1000); // base 1000ms con jitter ±20%
  console.log(`⏳ Responding in ~${Math.round(delay)}ms`);

  await sleep(delay);
  res.json({
    service: "hello-world",
    message: "Hola hello-world 👋",
    receivedHeaders: req.headers,
    delayUsedMs: Math.round(delay),
  });
});

app.listen(3002, () => {
  console.log("service2 listening on :3002");
});
