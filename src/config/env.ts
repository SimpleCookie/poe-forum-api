import dotenv from "dotenv"

dotenv.config()

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000", 10),
    HOST: process.env.HOST || "0.0.0.0",

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

    // Logging
    LOG_LEVEL: (process.env.LOG_LEVEL || "info") as "trace" | "debug" | "info" | "warn" | "error" | "fatal",

    // Rate Limiting
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "50", 10),
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || "1 minute",

    // Swagger/API Documentation
    API_URL: process.env.API_URL || "http://localhost:3000",
    API_TITLE: process.env.API_TITLE || "PoE Forum Mobile API",
    API_DESCRIPTION: process.env.API_DESCRIPTION || "API for browsing Path of Exile forum on mobile",
    API_VERSION: process.env.API_VERSION || "1.0.0",

    // Production flags
    IS_PRODUCTION: process.env.NODE_ENV === "production",
    IS_DEVELOPMENT: process.env.NODE_ENV === "development",
}

export function validateEnv() {
    const errors: string[] = []

    if (isNaN(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
        errors.push("PORT must be a valid port number (1-65535)")
    }

    if (env.IS_PRODUCTION && env.CORS_ORIGIN === "http://localhost:3000") {
        errors.push("CORS_ORIGIN must be set to your production domain in production mode")
    }

    if (errors.length > 0) {
        console.error("❌ Environment validation failed:")
        errors.forEach((err) => console.error(`  - ${err}`))
        process.exit(1)
    }

    console.log(`✅ Environment validated (${env.NODE_ENV})`)
}
