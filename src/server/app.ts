import Fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import rateLimit from "@fastify/rate-limit"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { threadRoutes } from "./routes/threadRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import categoriesRoutes from "./routes/categoriesRoutes"

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  // Security headers
  await app.register(helmet)

  // CORS - configure for your frontend domain
  await app.register(cors, {
    origin: true, // Allow all origins for localhost/development. Change to specific domain in production
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  })

  // Swagger API documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: "PoE Forum Mobile API",
        description: "API for browsing Path of Exile forum on mobile",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:3000", description: "Development" },
      ],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: "/documentation",
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
  })

  // Routes
  app.register(categoriesRoutes, { prefix: "/api" })
  app.register(categoryRoutes, { prefix: "/api" })
  app.register(threadRoutes, { prefix: "/api" })

  return app
}
