import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  const body = await req.json();
  const { characters, messages, newMessage, contextItems } = body;

  try {
    const contextSection = contextItems && contextItems.length > 0
      ? `\n\nCASE FILES YOU HAVE ACCESS TO:\n${contextItems.map(item =>
          `[${item.item_type?.toUpperCase()}] ${item.title}\n${item.content}`
        ).join("\n\n---\n\n")}`
      : "\n\nCASE FILES: None provided for this query.";

    const allCharacterProfiles = characters.map(c =>
      `${c.name} (${c.category === "story" ? "Case Subject" : "Production Expert"}) — ${c.expertise}`
    ).join(", ");

    const responses = [];
    const runningHistory = [...messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content
    }))];

    // Add the user's new message to running history
    runningHistory.push({ role: "user", content: newMessage });

    for (const character of characters) {
      const isStory = character.category === "story";

      const systemPrompt = isStory
        ? `You ARE ${character.name}.
Background: ${character.description || "No description provided"}
Role in case: ${character.expertise}
Known connections: ${character.association}
${contextSection}

OTHERS PRESENT IN THIS SCENE: ${allCharacterProfiles}

INSTRUCTIONS:
- Respond ONLY as ${character.name} in first person
- React emotionally and authentically to what has been said
- You have your own secrets, motivations, and fears
- Never break character under any circumstances
- If others have already responded in this scene, react to what they said naturally
- Keep responses authentic and human`

        : `You are ${character.name}, a professional ${character.expertise}.
Association: ${character.association}
Background: ${character.description || "No description provided"}
${contextSection}

OTHERS PRESENT IN THIS SCENE: ${allCharacterProfiles}

INSTRUCTIONS:
- Respond with professional expertise and analysis
- Be objective, thorough, and evidence-based
- If others have already responded in this scene, build on or react to their observations
- Reference other characters' points when relevant
- Never break character
- Be concise but thorough`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...runningHistory
        ]
      });

      const response = completion.choices[0].message.content;

      const needsMoreInfo = response.includes("?") &&
        (response.toLowerCase().includes("could you") ||
          response.toLowerCase().includes("can you") ||
          response.toLowerCase().includes("please provide") ||
          response.toLowerCase().includes("i need") ||
          response.toLowerCase().includes("do you have"));

      responses.push({
        character,
        response,
        message_type: needsMoreInfo ? "info_request" : "answer"
      });

      // Add this character's response to running history
      // so next character sees it
      runningHistory.push({
        role: "assistant",
        content: `${character.name}: ${response}`
      });
    }

    return Response.json({ responses });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}