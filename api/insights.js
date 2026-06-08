// Vercel serverless function: proxies sales-insight requests to Google Gemini.
// The API key lives ONLY here (process.env.GEMINI_API_KEY) — never in the browser.

const ALLOWED_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

const LANG_NAME = {
  pt: "Portuguese (Portugal)",
  en: "English",
  es: "Spanish",
};

const LEAD_SCHEMA = {
  type: "object",
  properties: {
    closeProbability: { type: "integer" },
    signals: { type: "array", items: { type: "string" } },
    nextAction: { type: "string" },
    suggestedMessage: { type: "string" },
    risks: { type: "array", items: { type: "string" } },
  },
  required: ["closeProbability", "signals", "nextAction", "suggestedMessage", "risks"],
};

const PIPELINE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    ranked: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          priority: { type: "string" }, // high | medium | low
          reason: { type: "string" },
          action: { type: "string" },
        },
        required: ["id", "priority", "reason", "action"],
      },
    },
  },
  required: ["summary", "ranked"],
};

function buildPrompts(kind, data, langName) {
  const system =
    `You are a senior sales coach for a Brazilian Jiu-Jitsu academy. ` +
    `Your goal is to help the gym owner convert leads into enrolled students. ` +
    `Base your advice strictly on the lead data and follow-up history provided. ` +
    `Be concrete, practical and concise. Free trial class is the main conversion tool. ` +
    `Respond ONLY with the requested JSON. Write all human-readable text in ${langName}.`;

  if (kind === "pipeline") {
    return {
      system,
      user:
        `Business context: ${JSON.stringify(data.business)}\n\n` +
        `Active leads (excluding won/lost):\n${JSON.stringify(data.leads)}\n\n` +
        `Task: Write a short "summary" (2-3 sentences) of the pipeline state and where to focus. ` +
        `Then return "ranked": the leads ordered by how urgently the owner should act, each with ` +
        `priority ("high"|"medium"|"low"), a one-line "reason", and a concrete "action" to move it ` +
        `toward enrollment. Keep the original lead "id".`,
    };
  }
  return {
    system,
    user:
      `Business context: ${JSON.stringify(data.business)}\n\n` +
      `Lead:\n${JSON.stringify(data.lead)}\n\n` +
      `Task: Estimate "closeProbability" (0-100). List "signals" (buying/interest or risk signals from ` +
      `the follow-ups). Give one clear "nextAction". Draft a short, friendly "suggestedMessage" ready to ` +
      `send to this lead via WhatsApp (use the lead's first name, reference the free trial when useful). ` +
      `List "risks" that could lose the sale.`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "missing_key" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { kind = "lead", lang = "pt", data = {} } = body;
    const model = ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0];
    const langName = LANG_NAME[lang] || LANG_NAME.pt;
    const schema = kind === "pipeline" ? PIPELINE_SCHEMA : LEAD_SCHEMA;
    const { system, user } = buildPrompts(kind, data, langName);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const reqBody = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // Retry transient 503 (model overloaded) a few times with backoff.
    let resp;
    for (let attempt = 0; attempt < 4; attempt++) {
      resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: reqBody,
      });
      if (resp.status !== 503) break;
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }

    if (!resp.ok) {
      const detail = await resp.text();
      const status = resp.status === 429 ? 429 : 502;
      res.status(status).json({
        error: resp.status === 429 ? "rate_limited" : "upstream_error",
        detail: detail.slice(0, 500),
      });
      return;
    }

    const json = await resp.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "empty_response" });
      return;
    }

    res.status(200).json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: "server_error", detail: String(err).slice(0, 300) });
  }
}
