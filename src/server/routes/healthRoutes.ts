import { FastifyInstance } from 'fastify'

export default async function healthRoutes(app: FastifyInstance) {
  // Health check endpoint - for monitoring
  app.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  })

  // Readiness check
  app.get('/ready', async (_request, _reply) => {
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    }
  })
}
