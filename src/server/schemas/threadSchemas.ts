export const getThreadSchema = {
    tags: ["Threads"],
    description: "Get a specific thread by ID",
    params: {
        type: "object",
        properties: {
            id: { type: "string", description: "Thread ID" },
        },
        required: ["id"],
    },
    querystring: {
        type: "object",
        properties: {
            page: { type: "string", description: "Page number (default: 1)" },
        },
    },
}
