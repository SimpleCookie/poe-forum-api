import OpenAI from "openai"
import dotenv from "dotenv"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

dotenv.config() // Load environment variables from .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analyze content using ChatGPT API.
 * @param contentList - Array of forum post contents.
 * @returns A weighted summary as a string.
 */
export const analyzeWithChatGPT = async (
  contentList: string[]
): Promise<string> => {
  const fullContent = contentList.join("\n")

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are an assistant skilled in summarizing content.",
    },
    {
      role: "user",
      content: `Here is a list of forum posts. Please create a weighted summary based on the content, prioritizing recurring themes and significant topics:\n\n${fullContent}`,
    },
  ]

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    })

    return response.choices[0].message?.content || "No summary generated."
  } catch (error) {
    console.error("Error using ChatGPT API:", error)
    return "Error generating summary."
  }
}
