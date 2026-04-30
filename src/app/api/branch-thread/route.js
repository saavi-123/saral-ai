export async function POST(req) {
  const { threadId, messageId, projectId, messages } = await req.json();

  try {
    // Step 1: Get the parent thread
    const threadRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads/${threadId}`
    );
    const threadData = await threadRes.json();
    const parentThread = threadData.data;

    // Step 2: Create new thread
    const newThreadRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            title: `↳ ${parentThread.title}`,
            project: projectId,
            branched_from: threadId,
            branch_point: messageId
          }
        })
      }
    );
    const newThreadData = await newThreadRes.json();
    const newThread = newThreadData.data;

    // Step 3: Copy all messages up to branch point into new thread
    for (const msg of messages) {
      await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            role: msg.role,
            content: msg.content,
            message_type: msg.message_type,
            chat_thread: newThread.documentId,
            character: msg.character?.documentId || null
          }
        })
      });
    }

    return Response.json({ newThreadId: newThread.documentId });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}