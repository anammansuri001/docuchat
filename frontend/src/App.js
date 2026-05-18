import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function App() {
  const [docId, setDocId] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData);
      setDocId(res.data.doc_id);
      setMessages([{ role: "system", text: `✅ "${file.name}" uploaded. ${res.data.chunks} chunks indexed. Ask me anything!` }]);
    } catch {
      setMessages([{ role: "system", text: "❌ Upload failed. Make sure it's a PDF." }]);
    }
    setUploading(false);
  };

  const askQuestion = async () => {
    if (!question.trim() || !docId) return;
    const userMsg = { role: "user", text: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ask`, { question, doc_id: docId });
      setMessages(prev => [...prev,
        { role: "assistant", text: res.data.answer },
        { role: "sources", chunks: res.data.sources }
      ]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>DocuChat</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Upload a PDF, ask it anything.</p>

      {/* Upload */}
      <label style={{
        display: "block", border: "2px dashed #ddd", borderRadius: 12,
        padding: "2rem", textAlign: "center", cursor: "pointer",
        background: docId ? "#f0fff4" : "#fafafa", marginBottom: 24,
        borderColor: docId ? "#34d399" : "#ddd"
      }}>
        <input type="file" accept=".pdf" onChange={uploadFile} style={{ display: "none" }} />
        {uploading ? "⏳ Processing..." : docId ? `✅ ${fileName}` : "📄 Click to upload a PDF"}
      </label>

      {/* Chat messages */}
      <div style={{ minHeight: 200, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            {msg.role === "user" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "#2563eb", color: "white", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", maxWidth: "75%", fontSize: 14 }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === "assistant" && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", maxWidth: "75%", fontSize: 14, lineHeight: 1.6 }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === "system" && (
              <div style={{ textAlign: "center", fontSize: 13, color: "#666", padding: "6px 0" }}>{msg.text}</div>
            )}
            {msg.role === "sources" && (
              <details style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                <summary style={{ cursor: "pointer" }}>📎 View sources ({msg.chunks.length} chunks)</summary>
                {msg.chunks.map((c, j) => (
                  <div key={j} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", marginTop: 6, lineHeight: 1.5 }}>
                    {c.substring(0, 200)}...
                  </div>
                ))}
              </details>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ color: "#94a3b8", fontSize: 14 }}>⏳ Thinking...</div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && askQuestion()}
          placeholder={docId ? "Ask a question about your document..." : "Upload a PDF first"}
          disabled={!docId || loading}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10,
            border: "1px solid #e2e8f0", fontSize: 14, outline: "none"
          }}
        />
        <button
          onClick={askQuestion}
          disabled={!docId || loading || !question.trim()}
          style={{
            background: "#2563eb", color: "white", border: "none",
            borderRadius: 10, padding: "10px 20px", fontSize: 14,
            cursor: "pointer", opacity: (!docId || loading) ? 0.5 : 1
          }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}