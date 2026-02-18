export const getCategorySchema = {
    tags: ["Categories"],
    description: "Get threads from a category",
    params: {
        type: "object",
        properties: {
            category: { type: "string", description: "Category slug" },
        },
        required: ["category"],
    },
    querystring: {
        type: "object",
        properties: {
            page: { type: "string", description: "Page number (default: 1)" },
        },
    },
}
