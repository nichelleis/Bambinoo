import "./DoctorMessages.css";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/doctor/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setConversations);
  }, []);

  const openChat = (c) => {
    setActive(c);
    fetch(`${API}/doctor/messages/${c.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setMessages);
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    fetch(`${API}/doctor/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversation_id: active.id,
        content: text,
      }),
    }).then(() => {
      setMessages([...messages, { sender: "doctor", content: text }]);
      setText("");
    });
  };

  return (
    <div className="messages-layout">
    
      <aside className="chat-list">
        <h3>Parent Messages</h3>
        {conversations.map(c => (
          <div
            key={c.id}
            className={`chat-item ${active?.id === c.id ? "active" : ""}`}
            onClick={() => openChat(c)}
          >
            <strong>{c.child}</strong>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </aside>

      <section className="chat-window">
        {active ? (
          <>
            <div className="chat-header">
              {active.parent} • {active.child}
            </div>

            <div className="chat-body">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`bubble ${m.sender}`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type your reply..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            Select a conversation to begin
          </div>
        )}
      </section>
    </div>
  );
};

export default Messages;
