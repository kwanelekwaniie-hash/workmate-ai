import { createServerFn } from "@tanstack/react-start";

type Msg = { role: "user" | "assistant"; content: string };
type Input =
  | { kind: "email"; prompt: string; tone: "Formal" | "Friendly"; recipient?: string }
  | { kind: "research"; source: string; focus?: string }
  | { kind: "chat"; messages: Msg[] };

const SYSTEMS = {
  email: (tone: string) =>
    `You are an expert business writer. Write one complete, ready-to-send email in a ${tone.toLowerCase()} tone. ${
      tone === "Formal"
        ? "Use polished, professional language and a formal greeting and sign-off."
        : "Be warm, approachable and concise while staying professional."
    } Start with a line "Subject: ..." then a blank line, then the email body. Use [placeholders] for unknown names or details. Output plain text only, no markdown.`,
  research:
    "You are a meticulous research analyst. Given an article or a topic, produce a structured markdown briefing with these sections: ## Summary (3-5 sentences), ## Key Insights (5-7 bullets), ## Important Details (facts, figures, names), ## Implications for the Workplace, ## Questions to Explore. If only a topic is given, draw on general knowledge and flag anything uncertain or time-sensitive that should be verified.",
  chat: "You are a helpful, concise workplace productivity assistant. Help with planning, writing, meetings, prioritisation, communication and problem-solving. Use the conversation context. Use markdown for structure when helpful. Remind users not to share confidential data if they appear to.",
};

export const generateAi = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    const s = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
    if (d.kind === "email" && s(d.prompt, 4000)) return d;
    if (d.kind === "research" && s(d.source, 30000)) return d;
    if (d.kind === "chat" && Array.isArray(d.messages) && d.messages.length > 0 && d.messages.length <= 60)
      return d;
    throw new Error("Please provide valid input.");
  })
  .handler(async ({ data }) => {
    const { runAi, AiError } = await import("./ai.server");
    try {
      let text: string;
      if (data.kind === "email") {
        text = await runAi(SYSTEMS.email(data.tone), [
          {
            role: "user",
            content: `Write an email about: ${data.prompt}${data.recipient ? `\nRecipient: ${data.recipient}` : ""}`,
          },
        ]);
      } else if (data.kind === "research") {
        text = await runAi(SYSTEMS.research, [
          {
            role: "user",
            content: `${data.focus ? `Focus on: ${data.focus}\n\n` : ""}Source:\n${data.source}`,
          },
        ]);
      } else {
        text = await runAi(
          SYSTEMS.chat,
          data.messages.map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) })),
        );
      }
      return { ok: true as const, text };
    } catch (e) {
      const msg = e instanceof AiError ? e.message : "Something went wrong. Please try again.";
      return { ok: false as const, error: msg };
    }
  });
