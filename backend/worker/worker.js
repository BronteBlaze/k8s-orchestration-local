const { Pool } = require("pg");
const amqp = require("amqplib");
const redis = require("redis");

const pool = new Pool({
  connectionString: "postgres://postgres:postgres@postgres:5432/demo",
});

const queue = "contact_messages";

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
  throw new Error("Worker failed to connect to RabbitMQ");
}

async function startWorker() {
  const channel = await connectRabbitMQ("amqp://bijay:bijay123@rabbitmq");
  await channel.assertQueue(queue);
  // Connect to Redis
  const redisClient = redis.createClient({ url: "redis://redis:6379" });
  await redisClient.connect();

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      // Simulate delay for showing pending for some time
      setTimeout(async () => {
        try {
          const { name, message } = JSON.parse(msg.content.toString());
          await pool.query(
            "INSERT INTO messages(name, message) VALUES($1, $2)",
            [name, message]
          );
          console.log("Inserted message from queue:", name);
          channel.ack(msg);
        } catch (error) {
          channel.ack(msg);
        }
      }, 5000);
    }
  });

  console.log("Worker is running and listening for messages...");
}

startWorker().catch(console.error);
