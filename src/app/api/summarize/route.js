import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const body = await req.json();
  const { project, characters, contextItems, messages } = body;

  try {
    const charactersText = characters.length > 0
      ? characters.map(c =>
          `- ${c.name} (${c.category === "story" ? "Story Character" : "Production Expert"}) — ${c.expertise}${c.association ? `, ${c.association}` : ""}${c.summary ? `\n  ${c.summary}` : ""}`
        ).join("\n")
      : "No characters added yet.";

    const contextText = contextItems.length > 0
      ? contextItems.map(c =>
          `[${c.item_type?.toUpperCase()}] ${c.title}: ${c.content}`
        ).join("\n\n")
      : "No evidence or context items added yet.";

    const messagesText = messages.length > 0
      ? messages.slice(-30).map(m =>
          `${m.role === "user" ? "Investigator" : m.character?.name || "Character"}: ${m.content}`
        ).join("\n")
      : "No conversations yet.";

    const prompt = `You are an intelligent case analyst. Based on the following investigation data, generate a structured case summary.

PROJECT: ${project.name}
DESCRIPTION: ${project.description || "No description"}
STATUS: ${project.status1}

CHARACTERS INVOLVED:
${charactersText}

EVIDENCE & CONTEXT:
${contextText}

RECENT CONVERSATION EXCERPTS:
${messagesText}

Generate a structured case summary with exactly these sections:
1. CASE OVERVIEW — 2-3 sentences on what this case is about
2. WHAT IS KNOWN — concrete facts established by evidence
3. WHAT IS SUSPECTED — theories and leads being investigated
4. WHAT IS UNRESOLVED — key open questions and gaps
5. KEY CHARACTERS — brief role of each character in the case
6. STRONGEST LEADS — top 2-3 directions worth pursuing
7. INVESTIGATOR'S NOTE — one honest sentence on the current state of the investigation

Be specific and reference actual evidence and character names. Do not be generic. If there is not enough data, say so clearly in each section.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500
    });

    return Response.json({ summary: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}