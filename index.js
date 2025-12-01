const express = require("express");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT || 3000;

// passed via env in Docker/Helm
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const client = createClient({
  url: `redis://${redisHost}:${redisPort}`,
});

client.on("error", (err) => console.error("Redis error:", err));

async function startServer() {
  await client.connect();

  app.get("/", (req, res) => {
    res.send("API is up");
  });

  app.get("/hit", async (req, res) => {
    const count = await client.incr("hits");
    res.send(`This endpoint has been hit ${count} times`);
  });

  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
