import React, { useEffect, useRef, useState } from "react";
import style from "../../../assets/styleSheets/Messages.module.css";
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
  const [conversations, setConversations] = useState([]);

  const bottomRef = useRef();

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:5000/conversations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);
  }, []);

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

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    const newMsg = {
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: text,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", newMsg);
    setText("");
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const limitText = (text, maxLength = 25) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  function getInitials(name) {
    if (!name) return "";

    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }

    const firstInitial = nameParts[0][0].toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
    return firstInitial + lastInitial;
  }

  return (
    <div className={style.messageContainer} style={{marginTop: "4rem", width: "98%", marginLeft: "0.7rem"}}>
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

        <div className={style.conversationList}>
          {conversations.map((c) => (
            <div
              key={c.conversation_id}
              className={`${style.chatCard} ${selectedUser?.id === c.user.id ? style.activeCard : ""}`}
              onClick={() => {
                setSelectedUser(c.user);
                loadMessages(c.user.id);
              }}
            >
              <div className={style.avatar}>
                {" "}
                {getInitials(c.user.username)}
              </div>{" "}
              <div className={style.cardContent}>
                <strong>{c.user.username}</strong>
                <p className={style.lastMessage}>{limitText(c.last_message)}</p>
              </div>
              <span className={style.timestamp}>
                {new Date(c.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={style.chatArea}>
        {selectedUser ? (
          <>
            <div className={style.chatHeader}>
              <div className={style.selectedProfileAvatar}>
                {getInitials(selectedUser.username)}
              </div>
              <div className={style.selectedUserDeatils}>
                <strong className={style.selectedUserName}>
                  {selectedUser.username}
                </strong>

                <span className={style.selectedUserRole}>
                  &middot;{" "}
                  {selectedUser.role.charAt(0).toUpperCase() +
                    selectedUser.role.slice(1)}
                </span>
              </div>
            </div>

            <div className={style.messagesContainer}>
              {messages.map((msg, index) => {
                const messageDate = new Date(msg.timestamp).toDateString();
                const prevDate =
                  index > 0
                    ? new Date(messages[index - 1].timestamp).toDateString()
                    : null;
                const showDate = messageDate !== prevDate;

                return (
                  <>
                    {showDate && (
                      <div className={style.dateSeparatorWrapper}>
                        <div className={style.dateSeparator}>
                          {messageDate === new Date().toDateString()
                            ? "Today"
                            : messageDate ===
                                new Date(
                                  new Date().setDate(new Date().getDate() - 1),
                                ).toDateString()
                              ? "Yesterday"
                              : messageDate}
                        </div>
                      </div>
                    )}

                    <div
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
                        <div className={style.messageText}>{msg.content}</div>
                        <div className={style.messageTime}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </span>
                    </div>
                  </>
                );
              })}
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
