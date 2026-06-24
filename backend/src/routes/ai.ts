import { Router, type Response } from "express";
import { env } from "../config/env.js";

const router = Router();

const systemPrompt = `You are AutoCare AI Assistant - a friendly, knowledgeable vehicle maintenance expert.
You only answer questions related to the AutoCare application, vehicle maintenance, automobiles, cars, workshops, and service center management.
Do not respond to unrelated topics outside of vehicles, automobiles, or workshop operations.
If a user asks about something else, politely explain that you can only help with vehicle maintenance, car service, and AutoCare application workflows.

You help users with:
- When to change oil, brake pads, tires, batteries, and other parts
- Understanding service schedules and maintenance intervals
- Diagnosing common vehicle issues based on symptoms
- Estimating maintenance costs in Indian Rupees (INR)
- Tips for extending vehicle life and improving fuel efficiency
- Understanding warning lights and dashboard indicators

Keep responses concise (2-4 sentences unless detail is needed). Use bullet points for lists. Be helpful and proactive with suggestions.`;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function buildAiUrl(url: string, apiKey: string) {
  if (apiKey.startsWith("AIza")) {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("key")) {
      parsed.searchParams.set("key", apiKey);
    }
    return parsed.toString();
  }
  return url;
}

function buildAiHeaders(apiKey: string): Record<string, string> {
  if (apiKey.startsWith("AIza")) {
    return { "Content-Type": "application/json" };
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function isGeminiApiRequest(apiUrl: string, apiKey: string) {
  return apiKey.startsWith("AIza") && apiUrl.includes("generativelanguage.googleapis.com");
}

function buildGeminiBody(messages: ChatMessage[]) {
  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: messages
      .filter((message) => message.content)
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
  };
}

function extractGeminiText(payload: unknown) {
  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates;
  return candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

function writeOpenAiCompatibleSse(res: Response, text: string) {
  const chunk = {
    choices: [
      {
        delta: { content: text },
      },
    ],
  };
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  res.write("data: [DONE]\n\n");
}

router.post("/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? (req.body.messages as ChatMessage[]) : null;
    if (!messages) return res.status(400).json({ error: "messages array is required" });

    if (!env.aiGatewayUrl || !env.aiGatewayApiKey) {
      return res.status(500).json({ error: "AI gateway is not configured" });
    }

    const apiUrl = buildAiUrl(env.aiGatewayUrl, env.aiGatewayApiKey);
    const headers = buildAiHeaders(env.aiGatewayApiKey);

    if (isGeminiApiRequest(apiUrl, env.aiGatewayApiKey)) {
      const upstream = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(buildGeminiBody(messages)),
      });

      if (!upstream.ok) {
        const txt = await upstream.text().catch(() => "");
        console.error("AI upstream error:", upstream.status, txt);
        return res.status(upstream.status).json({ error: "AI service unavailable" });
      }

      const payload = await upstream.json();
      const text = extractGeminiText(payload);
      if (!text) return res.status(502).json({ error: "AI service returned an empty response" });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      writeOpenAiCompatibleSse(res, text);
      return res.end();
    }

    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: env.aiGatewayModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => "");
      console.error("AI upstream error:", upstream.status, txt);
      return res.status(upstream.status).json({ error: "AI service unavailable" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!upstream.body) return res.status(500).json({ error: "No AI response stream" });
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
