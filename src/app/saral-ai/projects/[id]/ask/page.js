"use client";

import { useState, use } from "react";
import Link from "next/link";

export default function AskPage({ params }) {
  const { id } = use(params);
  const [question, setQuestion] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [neededInfo, setNeededInfo] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [charactersLoaded, setCharactersLoaded] = useState(false);

  const fetchCharacters = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/characters?filters[project][documentId][$eq]=${id}`
    );
    const data = await res.json();
    setCharacters(data.data);
    setCharactersLoaded(true);
  };

  if (!charactersLoaded) {
    fetchCharacters();
  }

  const handleQuery1 = async () => {
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 1,
        character: selectedCharacter,
        question
      })
    });
    const data = await res.json();
    setNeededInfo(data.neededInfo);
    setStep(2);
    setLoading(false);
  };

  const handleQuery2 = async () => {
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 2,
        character: selectedCharacter,
        question,
        neededInfo,
        userInfo
      })
    });
    const data = await res.json();
    setFinalAnswer(data.finalAnswer);

    await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/queries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          question,
          needed_info: neededInfo,
          provided_info: userInfo,
          final_answer: data.finalAnswer,
          project: id,
          character: selectedCharacter.documentId
        }
      })
    });

    setStep(3);
    setLoading(false);
  };

  const reset = () => {
    setStep(1);
    setQuestion("");
    setNeededInfo("");
    setUserInfo("");
    setFinalAnswer("");
    setSelectedCharacter(null);
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <Link href={`/saral-ai/projects/${id}`} style={{ fontSize: "13px", color: "var(--text2)", textDecoration: "none" }}>
        ← Back to Project
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 32px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Ask a Character
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
            2-step AI consultation with your investigation team
          </p>
        </div>
        <Link href={`/saral-ai/projects/${id}/queries`}>
          <button style={{
            background: "transparent", border: "0.5px solid var(--border2)",
            borderRadius: "8px", padding: "8px 16px",
            fontSize: "13px", color: "var(--text2)"
          }}>
            View History →
          </button>
        </Link>
      </div>

      {/* Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
        {["Select & Ask", "Provide Info", "Final Answer"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: step > i ? "var(--accent)" : step === i + 1 ? "var(--accent)" : "var(--bg3)",
              color: step > i ? "var(--accent-text)" : step === i + 1 ? "var(--accent-text)" : "var(--text3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 500
            }}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: "12px", color: step === i + 1 ? "var(--text)" : "var(--text3)", fontWeight: step === i + 1 ? 500 : 400 }}>
              {label}
            </span>
            {i < 2 && <div style={{ width: "32px", height: "1px", background: "var(--border2)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
              Select Character
            </label>
            <select onChange={(e) => {
              const char = characters.find(c => c.id === parseInt(e.target.value));
              setSelectedCharacter(char);
            }} defaultValue="">
              <option value="" disabled>-- Select a character --</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} — {char.expertise}
                </option>
              ))}
            </select>
          </div>

          {selectedCharacter && (
            <div style={{
              background: "var(--bg2)", border: "0.5px solid var(--border)",
              borderRadius: "10px", padding: "16px",
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "var(--bg3)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "13px", fontWeight: 500,
                color: "var(--text2)", flexShrink: 0
              }}>
                {selectedCharacter.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>{selectedCharacter.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text2)" }}>{selectedCharacter.expertise} · {selectedCharacter.association}</div>
                <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{selectedCharacter.summary}</div>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
              Your Question
            </label>
            <textarea
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the key findings from the crime scene analysis?"
            />
          </div>

          <button
            onClick={handleQuery1}
            disabled={!selectedCharacter || !question || loading}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, alignSelf: "flex-start",
              opacity: !selectedCharacter || !question || loading ? 0.5 : 1
            }}
          >
            {loading ? "Thinking..." : "Ask what information is needed →"}
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            background: "var(--bg2)", border: "0.5px solid var(--border)",
            borderRadius: "10px", padding: "20px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
              {selectedCharacter?.name} needs this information
            </div>
            <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.7 }}>{neededInfo}</p>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
              Provide the Information
            </label>
            <textarea
              rows="6"
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Provide the information requested above..."
            />
          </div>

          <button
            onClick={handleQuery2}
            disabled={!userInfo || loading}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, alignSelf: "flex-start",
              opacity: !userInfo || loading ? 0.5 : 1
            }}
          >
            {loading ? "Analysing..." : "Get Final Answer →"}
          </button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            border: "0.5px solid var(--border)",
            borderLeft: "3px solid #1D9E75",
            borderRadius: "10px", padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--bg3)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "11px", fontWeight: 500, color: "var(--text2)"
              }}>
                {selectedCharacter?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text)" }}>{selectedCharacter?.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text2)" }}>{selectedCharacter?.expertise}</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "#E1F5EE", color: "#0F6E56", fontWeight: 500 }}>
                Saved to history
              </div>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8 }}>{finalAnswer}</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={reset}
              style={{
                background: "var(--accent)", color: "var(--accent-text)",
                border: "none", padding: "10px 24px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 500
              }}
            >
              Ask Another Question
            </button>
            <Link href={`/saral-ai/projects/${id}/queries`}>
              <button style={{
                background: "transparent", border: "0.5px solid var(--border2)",
                borderRadius: "8px", padding: "10px 24px",
                fontSize: "14px", color: "var(--text2)"
              }}>
                View History →
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}