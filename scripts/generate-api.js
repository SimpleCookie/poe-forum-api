#!/usr/bin/env node

/**
 * Simple script to generate API client from Swagger spec
 * Assumes the server is already running or swagger.json exists
 */

const { execSync } = require("child_process")
const http = require("http")
const fs = require("fs")
const path = require("path")

const SERVER_URL = "http://localhost:3000"
const SWAGGER_PATH = path.join(process.cwd(), "swagger.json")
const MAX_RETRIES = 5
const RETRY_DELAY = 2000

function fetchAndSaveSwaggerSpec(retries = 0) {
    return new Promise((resolve, reject) => {
        console.log(`📥 Fetching swagger.json from ${SERVER_URL}/swagger/json (attempt ${retries + 1}/${MAX_RETRIES})...`)

        const req = http.get(`${SERVER_URL}/swagger/json`, { timeout: 5000 }, (res) => {
            console.log(`📊 Response status: ${res.statusCode}`)

            if (res.statusCode !== 200) {
                req.destroy()
                if (retries < MAX_RETRIES) {
                    console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`)
                    setTimeout(() => fetchAndSaveSwaggerSpec(retries + 1).then(resolve).catch(reject), RETRY_DELAY)
                } else {
                    reject(new Error(`Server returned status ${res.statusCode}`))
                }
                return
            }

            let data = ""
            res.on("data", (chunk) => {
                data += chunk
            })
            res.on("end", () => {
                try {
                    console.log(`📝 Received ${data.length} bytes`)
                    fs.writeFileSync(SWAGGER_PATH, data)
                    console.log("✓ Swagger spec saved to swagger.json")
                    resolve()
                } catch (error) {
                    reject(error)
                }
            })
        })

        req.on("error", (error) => {
            console.log(`❌ Connection error: ${error.message}`)
            req.destroy()
            if (retries < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`)
                setTimeout(() => fetchAndSaveSwaggerSpec(retries + 1).then(resolve).catch(reject), RETRY_DELAY)
            } else {
                reject(error)
            }
        })

        req.on("timeout", () => {
            console.log(`⏱️  Request timeout`)
            req.destroy()
            if (retries < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`)
                setTimeout(() => fetchAndSaveSwaggerSpec(retries + 1).then(resolve).catch(reject), RETRY_DELAY)
            } else {
                reject(new Error("Request timeout"))
            }
        })
    })
}

async function generateApi() {
    try {
        // Check if swagger.json already exists
        if (fs.existsSync(SWAGGER_PATH)) {
            console.log("✓ Found existing swagger.json, using it to generate client...")
        } else {
            // Fetch from server if swagger.json doesn't exist
            await fetchAndSaveSwaggerSpec()
        }

        console.log("📝 Generating API client with Orval...")
        execSync("npx orval", { stdio: "inherit" })

        console.log("✅ API client generated successfully!")
        console.log("📂 Generated file: src/generated/")

        // Copy generated API directory to the npm package
        const sourceDir = path.join(process.cwd(), "src/generated")
        const targetDir = path.join(process.cwd(), "packages/api-client/generated")

        if (fs.existsSync(sourceDir)) {
            // Remove existing target directory if it exists
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true })
            }

            // Copy entire directory
            fs.cpSync(sourceDir, targetDir, { recursive: true })
            console.log("📦 Copied to packages/api-client/generated/")
        }
    } catch (error) {
        console.error("❌ Error:", error.message)
        console.error("\n💡 Make sure the server is running: npm run server")
        console.error("💡 Or manually fetch the spec with: curl http://localhost:3000/swagger/json > swagger.json")
        process.exit(1)
    }
}

generateApi()
