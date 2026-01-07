import { AiProvider } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export class OpenAiProvider implements AiProvider {
  private openaiInstance: ReturnType<typeof createOpenAI>;

  constructor() {
    this.openaiInstance = createOpenAI({
      apiKey: env.OPENAI_API_KEY!,
    });
  }

  async generate(messages: string[]) {
    const { text } = await generateText({
      model: this.openaiInstance(env.OPENAI_MODEL!),
      prompt: messages.join("\n"),
    });
    return text;
  }
}
