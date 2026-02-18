import { defineConfig } from "orval"

export default defineConfig({
    api: {
        input: {
            target: "./swagger.json",
        },
        output: {
            target: "./src/generated/api.ts",
            client: "fetch",
            httpClient: "fetch",
            mode: "tags-split",
            prettier: true,
            baseUrl: process.env.API_URL || "http://localhost:3000",
        },
    },
})
