import React, { useState, useEffect } from "react";
import stevegun from "./images/stevegun.gif";
import stevecrouch2 from "./images/stevecrouch2.gif";
import stevechair from "./images/stevechair.gif";
import stevecrouch from "./images/stevecrouch.gif";
import stevespin from "./images/stevespin.gif";

const steveGifs = [
  stevecrouch,
  stevegun,
  stevechair,
  stevespin,
  stevecrouch2,

];

function SteveAssistant() {
  const [currentSteveGif, setCurrentSteveGif] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSteveGif((prev) => (prev + 1) % steveGifs.length);
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="steve-container">
      <img
        src={steveGifs[currentSteveGif]}
        alt="Steve Assistant"
        className="steve-assistant"
      />
      <div className="steve-tooltip">Hello, user 👋</div>
    </div>
  );
}

export default SteveAssistant;