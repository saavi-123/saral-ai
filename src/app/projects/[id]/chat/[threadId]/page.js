"use client";

import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditThreadTitle from "../../../../components/EditThreadTitle";

export default function ChatThreadPage({ params }) {
  const { id, threadId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCharacters, setLoadingCharacters] = useState([]);
  const [thread, setThread] = useState(null);
  const [contextItems, setContextItems] = useState([]);
  const [selectedContext, setSelectedContext] = useState([]);
  const [showContext, setShowContext] = useState(false);
  const [branchingId, setBranchingId] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingCharacters]);

  const fetchAll = async () => {
    const [threadRes, messagesRes, charsRes, contextRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/chat-threads/${threadId}`),
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/messages?filters[chat_thread][documentId][$eq]=${threadId}&populate=character&sort=createdAt:asc`),
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/characters?filters[project][documentId][$eq]=${id}`),
      fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/context-items?filters[project][documentId][$eq]=${id}`)
    ]);

    const [threadData, messagesData, charsData, contextData] = await Promise.all([
      threadRes.json(), messagesRes.json(), charsRes.json(), contextRes.json()
    ]);

    setThread(threadData.data);
    setMessages(messagesData.data || []);
    setCharacters(charsData.data || []);
    setContextItems(contextData.data || []);
  };

  const saveMessage = async (role, content, message_type, characterDocId) => {
    const body = {
      data: { role, content, message_type, chat_thread: threadId }
    };
    if (characterDocId) body.data.character = characterDocId;
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.data;
  };

  const toggleCharacter = (char) => {
    setSelectedCharacters(prev =>
      prev.find(c => c.id === char.id)
        ? prev.filter(c => c.id !== char.id)
        : [...prev, char]
    );
  };

  const handleSimulate = async () => {
    if (!input.trim() || selectedCharacters.length === 0 || loading) return;

    const currentInput = input;
    setInput("");
    setLoading(true);

    // Add user message to UI
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: currentInput,
      message_type: "question",
      character: null,
      createdAt: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, userMsg]);
    await saveMessage("user", currentInput, "question", null);

    // Show which characters are loading
    setLoadingCharacters(selectedCharacters.map(c => ({ ...c, done: false })));

    const contextToSend = selectedContext
      .map(cId => contextItems.find(c => c.id === cId))
      .filter(Boolean);

    const messageHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characters: selectedCharacters,
        messages: messageHistory,
        newMessage: currentInput,
        contextItems: contextToSend
      })
    });

    const data = await res.json();
    setLoadingCharacters([]);

    // Add each character response to messages sequentially
    for (const r of data.responses) {
      const charMsg = {
        id: Date.now() + Math.random(),
        role: "character",
        content: r.response,
        message_type: r.message_type,
        character: r.character,
        createdAt: new Date().toISOString(),
        isTemp: true
      };
      setMessages(prev => [...prev, charMsg]);
      await saveMessage("character", r.response, r.message_type, r.character.documentId);
    }

    setLoading(false);
  };

  const handleBranch = async (messageIndex) => {
    setBranchingId(messageIndex);
    const messagesUpToPoint = messages.slice(0, messageIndex + 1);
    const res = await fetch("/api/branch-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        messageId: messages[messageIndex]?.documentId || messages[messageIndex]?.id,
        projectId: id,
        messages: messagesUpToPoint
      })
    });
    const data = await res.json();
    setBranchingId(null);
    if (data.newThreadId) router.push(`/projects/${id}/chat/${data.newThreadId}`);
  };

  const toggleContext = (itemId) => {
    setSelectedContext(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    );
  };

  const avatarColors = [
    { bg: "#E6F1FB", color: "#185FA5" },
    { bg: "#EEEDFE", color: "#534AB7" },
    { bg: "#E1F5EE", color: "#0F6E56" },
    { bg: "#FAEEDA", color: "#854F0B" },
    { bg: "#FAECE7", color: "#993C1D" },
  ];

  const getCharacterColor = (charId) => {
    const index = characters.findIndex(c => c.id === charId) % avatarColors.length;
    return avatarColors[index >= 0 ? index : 0];
  };

  const productionChars = characters.filter(c => c.category === "production" || !c.category);
  const storyChars = characters.filter(c => c.category === "story");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "20px", flexShrink: 0
      }}>
        <div>
          <Link href={`/projects/${id}/chat`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
            ← Back to Threads
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            {thread ? (
              <EditThreadTitle thread={thread} fontSize="20px" fontWeight={700} />
            ) : (
              <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
                Loading...
              </h1>
            )}
            {thread?.branched_from && (
              <span style={{
                fontSize: "11px", padding: "3px 10px", borderRadius: "20px",
                background: "#EEEDFE", color: "#534AB7", fontWeight: 500
              }}>
                ⑂ branched thread
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {characters.slice(0, 5).map((char, i) => {
            const { bg, color } = avatarColors[i % avatarColors.length];
            const isSelected = selectedCharacters.find(c => c.id === char.id);
            return (
              <div key={char.id} style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "11px", fontWeight: 500, color,
                outline: isSelected ? `2px solid ${color}` : "none",
                outlineOffset: "2px"
              }}>
                {char.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex",
        flexDirection: "column", gap: "16px",
        paddingRight: "8px", marginBottom: "16px"
      }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎭</div>
            <div style={{ fontSize: "14px", color: "var(--text2)" }}>
              Select characters below and start the simulation
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const char = msg.character || null;
          const charColor = char ? getCharacterColor(char.id) : avatarColors[0];
          const isHovered = hoveredMessage === index;
          const isBranching = branchingId === index;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessage(index)}
              onMouseLeave={() => setHoveredMessage(null)}
              style={{ position: "relative" }}
            >
              <div style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                alignItems: "flex-start", gap: "10px"
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: isUser ? "var(--bg3)" : charColor.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 500,
                  color: isUser ? "var(--text2)" : charColor.color,
                  flexShrink: 0
                }}>
                  {isUser ? "You" : char?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                <div style={{ maxWidth: "70%" }}>
                  {!isUser && char && (
                    <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px", fontWeight: 500 }}>
                      {char.name} · {char.expertise}
                      {char.category === "story" && (
                        <span style={{
                          marginLeft: "6px", fontSize: "10px", padding: "1px 6px",
                          borderRadius: "10px", background: "#EEEDFE", color: "#534AB7"
                        }}>story</span>
                      )}
                    </div>
                  )}
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                    background: isUser ? "var(--accent)" : "var(--bg2)",
                    color: isUser ? "var(--accent-text)" : "var(--text)",
                    fontSize: "14px", lineHeight: 1.7,
                    border: isUser ? "none" : "0.5px solid var(--border)",
                    borderLeft: !isUser && msg.message_type === "info_request"
                      ? "3px solid #BA7517"
                      : !isUser
                      ? `3px solid ${charColor.color}`
                      : "none"
                  }}>
                    {msg.content}
                  </div>
                  {!isUser && msg.message_type === "info_request" && (
                    <div style={{ fontSize: "11px", color: "#BA7517", marginTop: "4px" }}>
                      ⚠ Requesting more information
                    </div>
                  )}
                  <div style={{
                    fontSize: "11px", color: "var(--text3)", marginTop: "4px",
                    display: "flex", alignItems: "center",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    gap: "8px"
                  }}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    {isHovered && (
                      <button
                        onClick={() => handleBranch(index)}
                        disabled={isBranching}
                        style={{
                          background: "transparent", border: "0.5px solid var(--border2)",
                          borderRadius: "6px", padding: "2px 8px",
                          fontSize: "11px", color: "#534AB7", cursor: "pointer"
                        }}
                      >
                        {isBranching ? "Branching..." : "⑂ Branch here"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading state — shows each character */}
        {loadingCharacters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {loadingCharacters.map((char, i) => {
              const { bg, color } = getCharacterColor(char.id);
              return (
                <div key={char.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "11px", fontWeight: 500, color
                  }}>
                    {char.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{
                    padding: "10px 16px", borderRadius: "4px 12px 12px 12px",
                    background: "var(--bg2)", border: "0.5px solid var(--border)",
                    fontSize: "13px", color: "var(--text3)"
                  }}>
                    {char.name} is thinking...
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Context Selector */}
      {showContext && contextItems.length > 0 && (
        <div style={{
          background: "var(--bg2)", border: "0.5px solid var(--border)",
          borderRadius: "10px", padding: "12px", marginBottom: "10px", flexShrink: 0
        }}>
          <div style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
            Select context to include — stays active until deselected
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {contextItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleContext(item.id)}
                style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "12px",
                  cursor: "pointer", transition: "all 0.15s",
                  background: selectedContext.includes(item.id) ? "var(--accent)" : "var(--bg3)",
                  color: selectedContext.includes(item.id) ? "var(--accent-text)" : "var(--text2)",
                  border: selectedContext.includes(item.id) ? "none" : "0.5px solid var(--border2)"
                }}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        flexShrink: 0, background: "var(--bg)",
        borderTop: "0.5px solid var(--border)", paddingTop: "16px"
      }}>

        {/* Character toggles */}
        <div style={{ marginBottom: "10px" }}>
          {productionChars.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                fontSize: "10px", color: "#185FA5", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px"
              }}>
                Production
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {productionChars.map((char) => {
                  const isSelected = selectedCharacters.find(c => c.id === char.id);
                  return (
                    <button
                      key={char.id}
                      onClick={() => toggleCharacter(char)}
                      style={{
                        padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                        fontWeight: 500, cursor: "pointer", border: "0.5px solid",
                        borderColor: isSelected ? "#185FA5" : "var(--border2)",
                        background: isSelected ? "#E6F1FB" : "transparent",
                        color: isSelected ? "#185FA5" : "var(--text2)",
                        transition: "all 0.15s"
                      }}
                    >
                      {char.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {storyChars.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{
                fontSize: "10px", color: "#534AB7", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px"
              }}>
                Story
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {storyChars.map((char) => {
                  const isSelected = selectedCharacters.find(c => c.id === char.id);
                  return (
                    <button
                      key={char.id}
                      onClick={() => toggleCharacter(char)}
                      style={{
                        padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                        fontWeight: 500, cursor: "pointer", border: "0.5px solid",
                        borderColor: isSelected ? "#534AB7" : "var(--border2)",
                        background: isSelected ? "#EEEDFE" : "transparent",
                        color: isSelected ? "#534AB7" : "var(--text2)",
                        transition: "all 0.15s"
                      }}
                    >
                      {char.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message input row */}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSimulate();
                }
              }}
              placeholder={
                selectedCharacters.length === 0
                  ? "Select characters above to begin..."
                  : selectedCharacters.length === 1
                  ? `Ask ${selectedCharacters[0].name}...`
                  : `Simulate scene with ${selectedCharacters.map(c => c.name.split(" ")[0]).join(", ")}...`
              }
              disabled={selectedCharacters.length === 0 || loading}
              style={{ flex: 1, resize: "none" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => setShowContext(!showContext)}
              style={{
                background: selectedContext.length > 0 ? "var(--accent)" : "transparent",
                color: selectedContext.length > 0 ? "var(--accent-text)" : "var(--text2)",
                border: "0.5px solid var(--border2)",
                borderRadius: "8px", padding: "8px 14px",
                fontSize: "12px", whiteSpace: "nowrap", cursor: "pointer"
              }}
            >
              📁 {selectedContext.length > 0 ? `${selectedContext.length} active` : "Context"}
            </button>
            <button
              onClick={handleSimulate}
              disabled={!input.trim() || selectedCharacters.length === 0 || loading}
              style={{
                background: "var(--accent)", color: "var(--accent-text)",
                border: "none", padding: "8px 20px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
                opacity: !input.trim() || selectedCharacters.length === 0 || loading ? 0.5 : 1,
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "..." : `Simulate →`}
            </button>
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "6px" }}>
          {selectedCharacters.length === 0
            ? "Select one or more characters to simulate"
            : `${selectedCharacters.length} character${selectedCharacters.length > 1 ? "s" : ""} selected · Enter to simulate · Hover any message to branch`}
        </div>
      </div>
    </div>
  );
}