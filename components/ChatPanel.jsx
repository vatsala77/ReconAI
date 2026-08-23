'use client';
import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
  "Which exception has the highest amount at risk?",
  "Why are most orders failing?",
  "Summarize this batch in one sentence",
  "Which category needs urgent review?",
];

export default function ChatPanel({ uploadBatchId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Ask me anything about this reconciliation batch — or tap a suggestion below to get started." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(overrideText) {
    const text = overrideText || input;
    if (!text.trim() || loading) return;

    setShowSuggestions(false);
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadBatchId,
          question: userMsg.content,
          history: newMessages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.answer || 'Sorry, I couldn\'t process that.' }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-avatar">✦</div>
        <div>
          <p className="chat-title">Talk to your data</p>
          <p className="chat-subtitle">AI-powered, grounded in this batch</p>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.role === 'assistant' && <div className="bubble-avatar">✦</div>}
            <div className="bubble-content">{m.content}</div>
          </div>
        ))}

        {showSuggestions && !loading && (
          <div className="suggestions">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} className="suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="chat-bubble assistant">
            <div className="bubble-avatar">✦</div>
            <div className="bubble-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-row">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this batch's reconciliation…"
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>→</button>
      </div>

      <style jsx>{`
        .chat-panel {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          height: 520px;
          overflow: hidden;
        }
        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #1f2942;
          background: linear-gradient(180deg, rgba(0,112,243,0.06), transparent);
        }
        .chat-avatar {
          width: 32px; height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: white;
          flex-shrink: 0;
        }
        .chat-title { font-size: 14px; font-weight: 600; color: #ffffff; margin: 0; }
        .chat-subtitle { font-size: 12px; color: #7c8493; margin: 2px 0 0 0; }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-bubble { display: flex; gap: 10px; max-width: 90%; }
        .chat-bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .bubble-avatar {
          width: 24px; height: 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: white; flex-shrink: 0; margin-top: 2px;
        }
        .bubble-content {
          font-size: 13.5px;
          line-height: 1.6;
          padding: 10px 14px;
          border-radius: 14px;
          color: #e4e7ec;
          background: #151f37;
        }
        .chat-bubble.user .bubble-content {
          background: #0070f3;
          color: white;
          border-radius: 14px 14px 2px 14px;
        }
        .chat-bubble.assistant .bubble-content { border-radius: 14px 14px 14px 2px; }

        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
          margin-left: 34px;
        }
        .suggestion-chip {
          text-align: left;
          background: #151f37;
          border: 1px solid #2a344e;
          color: #aec6ff;
          font-size: 13px;
          padding: 9px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }
        .suggestion-chip:hover {
          background: #1a2540;
          border-color: #0070f3;
        }

        .typing { display: flex; gap: 4px; padding: 14px; }
        .typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c8493;
          animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

        .chat-input-row {
          display: flex;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid #1f2942;
        }
        textarea {
          flex: 1;
          resize: none;
          background: #151f37;
          border: 1px solid #2a344e;
          border-radius: 12px;
          padding: 10px 14px;
          color: #ffffff;
          font-size: 13.5px;
          font-family: inherit;
        }
        textarea:focus { outline: none; border-color: #0070f3; }
        .chat-input-row button {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #0070f3;
          color: white;
          border: none;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .chat-input-row button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}