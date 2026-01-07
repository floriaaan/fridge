import { AiProvider } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export class GeminiProvider implements AiProvider {
  private googleInstance: ReturnType<typeof createGoogleGenerativeAI>;

  constructor() {
    this.googleInstance = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY!,
    });
  }

  async generate(messages: string[]) {
    const { text } = await generateText({
      model: this.googleInstance(env.GEMINI_MODEL!),
      prompt: messages.join("\n"),
    });
    return text;
  }
}
