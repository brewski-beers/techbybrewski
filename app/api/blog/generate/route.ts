import { NextRequest, NextResponse } from "next/server";

interface ResearchResult {
  topic: string;
  why_interesting: string;
  sources: { name: string; url: string }[];
  suggested_angle: string;
}

interface DraftResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
}

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface AnthropicResponse {
  content: AnthropicTextBlock[];
}

function verifySecret(req: NextRequest): boolean {
  const secret = process.env.BLOG_SCHEDULER_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const block = data.content[0];
  if (block.type !== "text") throw new Error("Unexpected response block type");
  return block.text;
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Step 1: Research ---
  let research: ResearchResult;
  try {
    const researchText = await callClaude(
      `You are a research assistant for KB, founder of TechByBrewski.
Identify the single most compelling tech or business story from the past 7 days that is:
- Genuinely interesting to builders, founders, and developers
- Has real business implications (not just hype)
- Has verifiable, publicly accessible sources

Return ONLY valid JSON (no markdown, no prose):
{ "topic": string, "why_interesting": string, "sources": [{ "name": string, "url": string }], "suggested_angle": string }`,
      1024
    );
    research = JSON.parse(stripJsonFences(researchText)) as ResearchResult;
  } catch (err) {
    console.error("blog/generate: research step failed", err);
    const message = err instanceof Error ? err.message : "Research step failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // --- Step 2: Draft ---
  let draft: DraftResult;
  try {
    const draftText = await callClaude(
      `You are writing a blog post for techbybrewski.com as KB — a solo dev and founder who builds software and thinks hard about how tech shapes business.

Voice: Direct, opinionated, occasionally self-deprecating. Not corporate. Not a listicle. No "In today's fast-paced world..." openings. Write like a smart person talking to another smart person.

Rules:
- 600-900 words
- Cite sources inline with markdown links: [Source Name](URL)
- Include a natural (not preachy) one-sentence acknowledgment that AI helped research and draft this — weave it in, don't wall it off
- Structure: Hook → context → KB's take → implications → close
- End with this exact paragraph (do not modify it): "*This post was researched and drafted with AI assistance. If something's wrong — and it might be — I'll update the post and call it out explicitly at the top.*"
- Generate a clean URL slug (lowercase, hyphens, no special chars)
- Write a 1-2 sentence excerpt for the listing card

Topic: ${research.topic}
Angle: ${research.suggested_angle}
Sources: ${JSON.stringify(research.sources)}

Return ONLY valid JSON (no markdown, no code fences):
{ "title": string, "slug": string, "excerpt": string, "content": string, "tags": string[] }`,
      2048
    );
    draft = JSON.parse(stripJsonFences(draftText)) as DraftResult;
  } catch (err) {
    console.error("blog/generate: draft step failed", err);
    const message = err instanceof Error ? err.message : "Draft step failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    content: draft.content,
    tags: draft.tags,
    sources: research.sources,
    generatedAt: new Date().toISOString(),
  });
}
