import { Router } from "express";
import { env } from "../config/env.js";

const router = Router();

const systemPrompt = `You are AutoCare AI Assistant - a friendly, knowledgeable vehicle maintenance expert. You help users with:
- When to change oil, brake pads, tires, batteries, and other parts
- Understanding service schedules and maintenance intervals
- Diagnosing common vehicle issues based on symptoms
- Estimating maintenance costs in Indian Rupees (INR)
- Tips for extending vehicle life and improving fuel efficiency
- Understanding warning lights and dashboard indicators

Keep responses concise (2-4 sentences unless detail is needed). Use bullet points for lists. Be helpful and proactive with suggestions. If unsure, say so and recommend consulting a mechanic.`;

router.post("/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!messages) return res.status(400).json({ error: "messages array is required" });

    if (!env.aiGatewayUrl || !env.aiGatewayApiKey) {
      return res.status(500).json({ error: "AI gateway is not configured" });
    }

    const upstream = await fetch(env.aiGatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.aiGatewayApiKey}`,
        "Content-Type": "application/json",
      },
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
    // Pipe SSE stream from gateway directly to frontend.
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
