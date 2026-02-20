import Fastify, { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { threadRoutes } from './routes/threadRoutes'
import { threadRoutesV1 } from './routes/v1/threadRoutesV1'
import { threadRoutesV2 } from './routes/v2/threadRoutesV2'
import categoryRoutes from './routes/categoryRoutes'
import categoriesRoutes from './routes/categoriesRoutes'
import healthRoutes from './routes/healthRoutes'
import { env } from '../config/env'

export async function buildApp(opts?: { disableRateLimit?: boolean }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.IS_PRODUCTION
        ? undefined
        : {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
    },
  })

  // Security headers
  await app.register(helmet)

  // CORS - configured via environment
  const corsOrigin = env.IS_DEVELOPMENT ? true : env.CORS_ORIGIN
  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  })

  // Swagger API documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: env.API_TITLE,
        description: env.API_DESCRIPTION,
        version: env.API_VERSION,
      },
      servers: [{ url: env.API_URL, description: env.NODE_ENV }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
  })

  // Rate limiting (disable for tests)
  if (!opts?.disableRateLimit) {
    await app.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW,
    })
  }

  // Routes
  app.register(categoriesRoutes, { prefix: '/api' })
  app.register(categoryRoutes, { prefix: '/api' })
  app.register(threadRoutes, { prefix: '/api' })
  // Versioned thread routes for backwards compatibility
  app.register(threadRoutesV1, { prefix: '/api' })
  app.register(threadRoutesV2, { prefix: '/api' })
  app.register(healthRoutes)

  return app
}
