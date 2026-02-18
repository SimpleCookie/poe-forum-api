import { buildApp } from "./app"
import { env, validateEnv } from "../config/env"

async function start() {
  // Validate environment variables
  validateEnv()

  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    const url = `http://${env.HOST === "0.0.0.0" ? "localhost" : env.HOST}:${env.PORT}`
    console.log(`\n🚀 Server running: ${url}`)
    console.log(`📚 API Docs: ${url}/documentation`)
    console.log(`❤️  Health: ${url}/health\n`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`)
  process.exit(0)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

start().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
