import React, { useState, useEffect, useRef } from "react";
import "./DoctorMessages.css";

// Dummy children conversations with genders
const dummyConversations = [
  {
    id: 1,
    parentName: "Father Fernando",
    childName: "Noah Fernando",
    gender: "boy",
    messages: [
      { id: 1, sender: "parent", content: "Doctor, my child has been scratching his skin a lot recently." },
      { id: 2, sender: "doctor", content: "Does he have any rashes or redness?" },
      { id: 3, sender: "parent", content: "Yes, mainly around elbows and knees." },
      { id: 4, sender: "doctor", content: "That sounds like eczema. Are you moisturizing daily?" },
      { id: 5, sender: "parent", content: "Yes doctor, twice a day." },
      { id: 6, sender: "doctor", content: "Good. Continue moisturizing and apply the prescribed cream." },
    ],
  },
  {
    id: 2,
    parentName: "Mother Silva",
    childName: "Emma Silva",
    gender: "girl",
    messages: [
      { id: 1, sender: "parent", content: "Doctor, my daughter is having breathing difficulty at night." },
      { id: 2, sender: "doctor", content: "Does she have asthma history?" },
      { id: 3, sender: "parent", content: "Yes, she was diagnosed last year." },
      { id: 4, sender: "doctor", content: "Is she using her inhaler regularly?" },
      { id: 5, sender: "parent", content: "Sometimes she forgets." },
      { id: 6, sender: "doctor", content: "Please ensure regular inhaler use before bedtime." },
      { id: 7, sender: "parent", content: "Understood, doctor. Thank you." },
      { id: 8, sender: "doctor", content: "No problem. Keep monitoring her symptoms." },
      { id: 9, sender: "parent", content: "Should I give her any supplements?" },
      { id: 10, sender: "doctor", content: "Vitamin D is fine, but nothing else without prescription." },
      { id: 11, sender: "parent", content: "Okay, will do." },
    ],
  },
  {
    id: 3,
    parentName: "Father Perera",
    childName: "Liam Perera",
    gender: "boy",
    messages: [
      { id: 1, sender: "parent", content: "Doctor, Liam has a fever for two days." },
      { id: 2, sender: "doctor", content: "What is his temperature?" },
      { id: 3, sender: "parent", content: "Around 101°F." },
      { id: 4, sender: "doctor", content: "Keep him hydrated and monitor temperature. If it crosses 102°F, visit clinic." },
    ],
  },
  {
    id: 4,
    parentName: "Mother Jayasinghe",
    childName: "Olivia Jayasinghe",
    gender: "girl",
    messages: [
      { id: 1, sender: "parent", content: "Doctor, Olivia is having frequent headaches." },
      { id: 2, sender: "doctor", content: "Since when?" },
      { id: 3, sender: "parent", content: "About a week now." },
      { id: 4, sender: "doctor", content: "We may need to check vision and stress factors." },
    ],
  },
];

const DoctorMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(dummyConversations[0]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setReplyText("");
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMessage = {
      id: selectedConversation.messages.length + 1,
      sender: "doctor",
      content: replyText,
    };

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
    });

    setReplyText("");
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation.messages]);

  return (
    <div className="doctor-chat-container">
      
      <div className="conversation-list">
        <h3>Conversations</h3>
        {dummyConversations.map((conv) => (
          <div
            key={conv.id}
            className={`conversation-item ${selectedConversation.id === conv.id ? "active" : ""}`}
            onClick={() => handleSelectConversation(conv)}
          >
            <strong>{conv.childName}</strong> ({conv.parentName})
          </div>
        ))}
      </div>

    
      <div className="chat-window">
        <div className="chat-header">
          Chat with {selectedConversation.parentName} about {selectedConversation.childName}
        </div>

        <div className="chat-messages">
          {selectedConversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender}`}
              style={{
                backgroundColor:
                  msg.sender === "parent"
                    ? selectedConversation.gender === "boy"
                      ? "#cce4ff"
                      : "#ffcce0"
                    : "#007bff",
                color: msg.sender === "doctor" ? "white" : "black",
              }}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
          />
          <button onClick={handleSendReply}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
