#!/usr/bin/env node

/**
 * Script to export Swagger spec from running Fastify app
 */

const path = require('path')
const fs = require('fs')

// Load the built app
const { buildApp } = require('../dist/server/app')

async function dumpSwagger() {
  try {
    const app = await buildApp({ disableRateLimit: true })

    // Wait for app to be ready (routes registered, plugins initialized)
    await app.ready()

    // Get the OpenAPI spec from Fastify
    const spec = app.swagger()

    // Save to file
    const swaggerPath = path.join(__dirname, '..', 'swagger.json')
    fs.writeFileSync(swaggerPath, JSON.stringify(spec, null, 2))

    console.log('✓ Swagger spec dumped to swagger.json')

    // Close app to exit cleanly
    await app.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error dumping swagger:', error)
    process.exit(1)
  }
}

dumpSwagger()
