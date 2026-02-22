function MessageDoctor() {
  return (
    <div style={{ display: "flex", height: "82.7vh" }}>       {/*add overflow 0 here*/}
    
      <div style={{ width: "25%", borderRight: "1px solid #ccc" }}>
        <h3>Messages</h3>

        <input
          placeholder="Enter doc/nurse/parent ID"
          style={{ width: "70%", marginRight: 8 }}
        />
        <button>Search</button>

        <div style={{ marginTop: 20 }}>
          <strong>Chatting with:</strong>
          <p>Dr. Smith</p>
        </div>
      </div>
      <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: 10,
            borderBottom: "1px solid #ccc",
            background: "#f5f5f5",
          }}
        >
          <strong>Dr. Smith</strong>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          <div style={{ textAlign: "left", marginBottom: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                background: "#eee",
              }}
            >
              Hello! How are you today?
            </span>
          </div>

          <div style={{ textAlign: "right", marginBottom: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                background: "#d1e7ff",
              }}
            >
              I'm good, thanks! How about you?
            </span>
          </div>

          <div style={{ textAlign: "left", marginBottom: 10 }}>
            <span
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                background: "#eee",
              }}
            >
              Doing well! Did you take your medication?
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: 10,
            borderTop: "1px solid #ccc",
          }}
        >
          <input style={{ flex: 1, marginRight: 10 }} value="Type message..." />
          <button>Send</button>
        </div>
      </div>
    </div>
  );
}

export default MessageDoctor;
