import React, { useState, useEffect } from "react";
import { fetchChatLog, sendChatMessage } from "./integrat";

function ChatBox() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const load = () => fetchChatLog().then(setChatMessages);
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const handleChatSend = () => {
    if (!chatInput) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="box large-box">
      <h2 className="box-title">Live Chat :</h2>
      <div className="inner-box">
        {chatMessages.map((m, i) => (
          <p key={i}>
            <strong>{m.user}:</strong> {m.text}
          </p>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button onClick={handleChatSend} type="button">Send</button>
      </div>
    </div>
  );
}

export default React.memo(ChatBox);