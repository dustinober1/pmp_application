import { createServer, startServer } from "./fastify-server";

async function main() {
  try {
    const app = await createServer();
    await startServer(app);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
