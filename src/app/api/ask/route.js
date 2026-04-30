import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req) {
  const body = await req.json();
  const { step, character, question, neededInfo, userInfo } = body;

  try {
    if (step === 1) {
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are ${character.name}, a ${character.expertise} with the following background: ${character.description}. Your association is: ${character.association}.`
          },
          {
            role: "user",
            content: `I want to ask you this question: "${question}". Before answering, what specific information do you need to give the best possible answer? List the information you need clearly and concisely.`
          }
        ]
      });

      const neededInfo = completion.choices[0].message.content;
      return Response.json({ neededInfo });

    } else if (step === 2) {
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are ${character.name}, a ${character.expertise} with the following background: ${character.description}. Your association is: ${character.association}.`
          },
          {
            role: "user",
            content: `I asked you: "${question}". You requested this information: "${neededInfo}". I am now providing: "${userInfo}". Based on your expertise and this information, give a thorough and professional answer.`
          }
        ]
      });

      const finalAnswer = completion.choices[0].message.content;
      return Response.json({ finalAnswer });
    }

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}