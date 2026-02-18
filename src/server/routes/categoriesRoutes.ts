import { FastifyInstance } from "fastify"
import { forumCategories } from "../../config/categories"
import { FORUM_BASE_URL } from "../../config/constants"

export default async function categoriesRoutes(app: FastifyInstance) {

    app.get("/categories", async () => {
        const grouped = {
            poe1: [] as any[],
            poe2: [] as any[],
        }

        forumCategories.forEach((cat) => {
            const apiEndpoint = `/api/category/${cat.slug}`

            grouped[cat.game].push({
                name: cat.name,
                slug: cat.slug,
                endpoint: apiEndpoint,
                sourceUrl: `${FORUM_BASE_URL}${cat.slug}`
            })
        })

        return grouped
    })
}
