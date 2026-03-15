import { app } from "./app";
import { env } from "@config";

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Server running at ${env.SERVER_URL}`);
    console.log(`📘 Swagger docs at ${env.SWAGGER_URL}`);
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

start();
