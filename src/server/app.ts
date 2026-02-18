import Fastify from "fastify"
import rateLimit from "@fastify/rate-limit"
import { threadRoutes } from "./routes/threadRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import categoriesRoutes from "./routes/categoriesRoutes"

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  app.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
  })

  app.register(categoriesRoutes, { prefix: "/api" })
  app.register(categoryRoutes, { prefix: "/api" })
  app.register(threadRoutes, { prefix: "/api" })

  return app
}
