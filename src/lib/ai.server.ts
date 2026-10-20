import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function runAi(system: string, messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new AiError("AI is not configured for this app yet.", 401);

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });

  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    system,
    messages,
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  let text = "";
  try {
    for await (const chunk of result.textStream) text += chunk;
  } catch (e) {
    failure = e;
  }
  if (failure || !text.trim()) {
    const status = (failure as { statusCode?: number })?.statusCode ?? 500;
    if (status === 429) throw new AiError("Too many requests right now. Please wait a moment and try again.", 429);
    if (status === 402) throw new AiError("AI credits have run out for this workspace. Add credits in Lovable to continue.", 402);
    if (status === 403) throw new AiError("This request was declined by the AI service.", 403);
    if (!failure) throw new AiError("The AI returned an empty response. Try rephrasing your request.", 500);
    throw new AiError("The AI service had a problem. Please try again.", status);
  }
  return text.trim();
}
