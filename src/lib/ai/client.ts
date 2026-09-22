export class AiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function baseUrl(): string {
  const raw = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com";
  return raw.replace(/\/+$/, "");
}

function model(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export async function chatJson(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new AiError("OPENAI_API_KEY is not configured");
  }

  const url = `${baseUrl()}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model(),
      temperature: opts.temperature ?? 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AiError(
      `AI HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
      res.status,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new AiError("AI returned empty content");
  }
  return content;
}
