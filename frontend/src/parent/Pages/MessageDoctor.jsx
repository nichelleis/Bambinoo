import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default function Messages() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchCode, setSearchCode] = useState("");

  const bottomRef = useRef();

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        msg.sender_id === selectedUser?.id ||
        msg.receiver_id === selectedUser?.id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receive_message");
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const searchUser = async () => {
    if (!searchCode) return;

    try {
      const res = await fetch(
        `http://localhost:5000/search-user/${searchCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) throw new Error("User not found");

      const data = await res.json();
      setSelectedUser(data);
      loadMessages(data.id);
      setSearchCode("");
    } catch (err) {
      alert(err.message);
    }
  };


  const loadMessages = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load messages");

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err.message);
    }
  };


  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    socket.emit("send_message", {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: text,
    });

    setText("");
  };

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc" }}>

      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Messages</h3>

        <input
          placeholder="Enter doc/nurse/parent ID"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          style={{ width: "70%", marginRight: 5 }}
        />
        <button onClick={searchUser}>Search</button>

        {selectedUser && (
          <div style={{ marginTop: 20 }}>
            <strong>Chatting with:</strong>
            <p>
              {selectedUser.username} ({selectedUser.role})
            </p>
          </div>
        )}
      </div>

      <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            <div
              style={{
                padding: 10,
                borderBottom: "1px solid #ccc",
                background: "#f5f5f5",
              }}
            >
              <strong>{selectedUser.username}</strong> ({selectedUser.role})
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign:
                      msg.sender_id === currentUser.id ? "right" : "left",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: 10,
                      borderRadius: 10,
                      background:
                        msg.sender_id === currentUser.id ? "#d1e7ff" : "#eee",
                    }}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div
              style={{
                display: "flex",
                padding: 10,
                borderTop: "1px solid #ccc",
              }}
            >
              <input
                style={{ flex: 1, marginRight: 10 }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ padding: 20 }}>Search a user to start chatting</div>
        )}
      </div>
    </div>
  );
}
