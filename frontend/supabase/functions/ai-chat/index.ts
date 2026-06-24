import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are AutoCare AI Assistant - a friendly, knowledgeable vehicle maintenance expert.
Only answer questions related to the AutoCare application, vehicle maintenance, automobiles, cars, workshops, and service center management.
If the user asks about unrelated topics, explain that you can only help with vehicle maintenance and workshop operations.

You help users with:
- When to change oil, brake pads, tires, batteries, and other parts
- Understanding service schedules and maintenance intervals
- Diagnosing common vehicle issues based on symptoms
- Estimating maintenance costs in Indian Rupees (INR)
- Tips for extending vehicle life and improving fuel efficiency
- Understanding warning lights and dashboard indicators

Keep responses concise (2-4 sentences unless detail is needed). Use bullet points for lists. Be helpful and proactive with suggestions. If you're unsure, say so and recommend consulting a mechanic.`;

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

function buildAiHeaders(apiKey: string) {
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

function openAiCompatibleSse(text: string) {
  const chunk = {
    choices: [
      {
        delta: { content: text },
      },
    ],
  };
  return `data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const AI_GATEWAY_API_KEY = Deno.env.get("AI_GATEWAY_API_KEY");
    const AI_GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL");
    const AI_GATEWAY_MODEL = Deno.env.get("AI_GATEWAY_MODEL") ?? "gemini-flash-latest";
    if (!AI_GATEWAY_API_KEY) throw new Error("AI_GATEWAY_API_KEY is not configured");
    if (!AI_GATEWAY_URL) throw new Error("AI_GATEWAY_URL is not configured");

    const apiUrl = buildAiUrl(AI_GATEWAY_URL, AI_GATEWAY_API_KEY);
    const headers = buildAiHeaders(AI_GATEWAY_API_KEY);

    if (isGeminiApiRequest(apiUrl, AI_GATEWAY_API_KEY)) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(buildGeminiBody(messages as ChatMessage[])),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("AI gateway error:", response.status, text);
        return new Response(JSON.stringify({ error: "AI service unavailable" }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = await response.json();
      const text = extractGeminiText(payload);
      if (!text) {
        return new Response(JSON.stringify({ error: "AI service returned an empty response" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(openAiCompatibleSse(text), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: AI_GATEWAY_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...(messages as ChatMessage[]),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
