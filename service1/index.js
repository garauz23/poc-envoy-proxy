import express from "express";
import axios from "axios";

const app = express();
const ENVOY_URL = process.env.ENVOY_URL || "http://envoy:10000";

export async function callService2() {
  try {
    console.log(`${ENVOY_URL}/service2/hello`);
    const res = await axios.get(`${ENVOY_URL}/service2/hello`, {
      validateStatus: () => true,
      headers: {
        "x-from-service": "service1",
        "x-trace-id": "trace-demo-123",
      },
    });
    console.log({
      status: res.status,
    });
    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error(
      "Error calling service2:",
      error.response?.status,
      error.message,
    );
    return {
      status: err.response?.status ?? 500,
      data: err.response?.data ?? { error: err.message },
    };
  }
}

export async function callServiceHelloWorld() {
  try {
    const res = await axios.get(`${ENVOY_URL}/service2/hello-world`, {
      validateStatus: () => true,
      headers: {
        "x-from-service": "hello-world",
        "x-trace-id": "trace-demo-123",
      },
    });
    console.log({
      status: res.status,
    });
    return {
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    console.error(
      "Error calling service2:",
      error.response?.status,
      error.message,
    );
    return {
      status: err.response?.status ?? 500,
      data: err.response?.data ?? { error: err.message },
    };
  }
}
app.get("/call-service2", async (req, res) => {
  try {
    const { status, data } = await callService2();

    res.status(status).json({
      service: "service1",
      via: "envoy",
      envoyUrlUsed: ENVOY_URL,
      service2Status: status,
      responseFromService2: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/call-service-test", async (req, res) => {
  try {
    const { status, data } = await callServiceHelloWorld();

    res.status(status).json({
      service: "hello-world",
      via: "envoy",
      envoyUrlUsed: ENVOY_URL,
      service2Status: status,
      responseFromService2: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("service1 listening on :3001");
});
