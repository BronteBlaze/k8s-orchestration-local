const express = require("express");
const amqp = require("amqplib");
const redis = require("redis");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const queue = "contact_messages";

async function startServer() {
  const pool = new Pool({
    connectionString: "postgres://postgres:postgres@postgres:5432/demo",
  });
  // Connect to Redis
  const redisClient = redis.createClient({ url: "redis://redis:6379" });
  await redisClient.connect();

  async function connectRabbitMQ(url, retries = 10, delay = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        const conn = await amqp.connect(url);
        console.log("Connction succeed");
        return await conn.createChannel();
      } catch (err) {
        console.log(`RabbitMQ worker retry ${i + 1} failed`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new Error("API failed to connect to RabbitMQ");
  }

  // Connect to RabbitMQ
  const channel = await connectRabbitMQ("amqp://bijay:bijay123@rabbitmq");
  await channel.assertQueue(queue);

  // API route for posting contact
  app.post("/api/contact", async (req, res) => {
    const { name, message } = req.body;
    await channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify({ name, message }))
    );
    await redisClient.set("last_contact", JSON.stringify({ name, message }));
    await redisClient.set("isPending", "true", { EX: 5 });
    res.json({ status: "Pending" });
  });

  // Get insertion status
  app.get("/api/status", async (req, res) => {
    const isPending = await redisClient.get("isPending");
    if (isPending === "true") {
      return res.status(200).json({ status: "Pending" });
    } else {
      return res.status(200).json({ status: "Completed" });
    }
  });

  // API route for getting last contact from redis
  app.get("/api/redis-contact", async (req, res) => {
    const start = Date.now();
    const data = await redisClient.get("last_contact");
    const duration = Date.now() - start;
    if (!data)
      return res
        .status(404)
        .json({ error: "No contact message found in redis" });
    res.json({ data: JSON.parse(data), responseTime: duration });
  });

  // API route for getting last contact from db
  app.get("/api/db-contact", async (req, res) => {
    const start = Date.now();
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY id DESC LIMIT 1"
    );
    const duration = Date.now() - start;
    if (!result?.rows?.length)
      return res.status(404).json({ error: "No contact message found in db" });
    res.json({ data: result.rows[0], responseTime: duration });
  });

  app.listen(8000, () => console.log("API server running on port 8000"));
}

startServer().catch(console.error);
