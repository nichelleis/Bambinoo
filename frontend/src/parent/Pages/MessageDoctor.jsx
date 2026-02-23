import React, { useEffect, useRef, useState } from "react";
import style from "../../assets/styleSheets/Messages.module.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default function MessageDoctor() {
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
    <div className={style.messageContainer}>
      <div className={style.leftSideBar}>
        <h3 className={style.messageHeader}>
          {" "}
          <i className={`bi bi-chat ${style.chatIcon}`}></i> Messages
        </h3>

        <div className={style.searchRow}>
          <input
            placeholder="Enter doctor/nurse/parent ID"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className={style.searchInput}
          />
          <button onClick={searchUser} className={style.searchButton}>
            Search
          </button>
        </div>
        {selectedUser && ( //style or change this bit
          <div style={{ marginTop: 20 }}>
            <strong>Chatting with:</strong>
            <p>
              {selectedUser.username} ({selectedUser.role})
            </p>
          </div>
        )}
      </div>

      <div className={style.chatArea}>
        {selectedUser ? (
          <>
            <div className={style.chatHeader}>
              <div className={style.selectedProfileAvatar}>TF</div>
              <div className={style.selectedUserDeatils}>
                <strong className={style.selectedUserName}>
                  {selectedUser.username}
                </strong>

                <span className={style.selectedUserRole}>
                  &middot; {selectedUser.role}
                </span>
              </div>
            </div>

            <div className={style.messagesContainer}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${style.messageRow} ${
                    msg.sender_id === currentUser.id
                      ? style.myMessage
                      : style.otherMessage
                  }`}
                >
                  <span
                    className={`${style.bubble} ${
                      msg.sender_id === currentUser.id
                        ? style.myBubble
                        : style.otherBubble
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className={style.inputArea}>
              <input
                className={style.textInput}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className={style.sendButton} onClick={sendMessage}>
                <i class="bi bi-send"></i>
              </button>
            </div>
          </>
        ) : (
          <div className={style.emptyState}>
            <div className={style.emptyContent}>
              <div className={style.emptyIcon}>
                <i className="bi bi-chat"></i>
              </div>

              <h3 className={style.emptyTitle}>Start a conversation</h3>

              <p className={style.emptyText}>
                Search for a doctor, nurse, or parent by their ID
                <br />
                to begin messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
