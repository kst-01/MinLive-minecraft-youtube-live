// src/App.js
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"; 
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { toggleGamemode, toggleTime, sendChatMessage, sendConsoleCommand, fetchChatLog, fetchItemLog, fetchMobVotes, fetchStats } from "./integrat";
import "./App.css";
import Loader from "./Loader";
import Settings from "./Settings";
import About from "./About";
import heart from "./images/heart.png";
import pickaxe from "./images/pickaxe.png";
import cam from "./images/cam.png";
import sunrise from "./images/sunrise.png";
import day from "./images/day.png";
import noon from "./images/noon.png";
import sunset from "./images/sunset.png";
import night from "./images/night.png";
import midnight from "./images/midnight.png";
import but from "./images/bg.png";
import backVideo from "./images/backvid.mp4";
import "./animations.css";
import SteveAssistant from "./SteveAssistant";

// Initialize Socket.IO connection
const socket = io("http://localhost:5000");

function App() {
  const [bgMode, setBgMode] = useState("image");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [itemLogList, setItemLogList] = useState([]);
  const [mobVotesData, setMobVotesData] = useState({});
  const [consoleInput, setConsoleInput] = useState("");
  const [stats, setStats] = useState({ viewers: 0, likes: 0, subscribers: 0 });
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const sequence = [
      { text: "Initializing...", duration: 800 },
      { text: "Loading Assets", duration: 1000 },
      { text: "Loading Webpage", duration: 1200 },
      { text: "Loading Complete!", duration: 500 },
    ];
    let step = 0;
    const run = () => {
      if (step < sequence.length) {
        setLoadingText(sequence[step].text);
        setTimeout(() => {
          step++;
          run();
        }, sequence[step].duration);
      } else {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("minlive_theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  useEffect(() => {
    // Initial data fetch
    fetchChatLog().then(setChatMessages);
    fetchItemLog().then(setItemLogList);
    fetchMobVotes().then(setMobVotesData);

    // Socket.IO event listeners for real-time updates
    socket.on("chatMessage", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on("itemUpdate", (items) => {
      setItemLogList(items);
    });

    socket.on("mobVotesUpdate", (votes) => {
      setMobVotesData(votes);
    });

    // Cleanup on unmount
    return () => {
      socket.off("chatMessage");
      socket.off("itemUpdate");
      socket.off("mobVotesUpdate");
    };

  }, []);
  useEffect(() => {
    const load = () => fetchStats().then(setStats);
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  const handleToggleBg = () => {
    setBgMode(bgMode === "image" ? "video" : "image");
  };

  const handleTimeCommand = (time) => {
    toggleTime(time);
  };
  const handleGameMode = (mode) => {
    toggleGamemode(mode);
  };
  const handleChatSend = () => {
    if (!chatInput) return;
    sendChatMessage(chatInput);
    setChatInput("");
  };

  const handleConsoleSend = () => {
    if (!consoleInput) return;
    sendConsoleCommand(consoleInput);
    setConsoleInput("");
  };

  function MainContent() {
    return (
      <main className="main-layout">
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

        <div className="middle-panel">
          <div className="box small-box">
            <h3 className="box-title">Items Given :</h3>
            <div className="inner-box">
              {itemLogList.map((it, i) => (
                <p key={i}>
                  {it.time} - {it.item}
                </p>
              ))}
            </div>
          </div>
          <div className="box small-box">
            <h3 className="box-title">Mobs Voted :</h3>
            <div className="inner-box">
              {Object.entries(mobVotesData).map(([mob, count]) => (
                <p key={mob}>
                  {mob}: {count}
                </p>
              ))}
            </div>
          </div>
          <div className="box small-box">
            <h3 className="box-title">Console :</h3>
            <div className="console"></div>
            <div className="console-input">
              <input
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Type your command here..."
              />
              <button className="console-input button" onClick={handleConsoleSend} type="button">Send</button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="box game-mode-box">
            <h3 className="right-box-title">Toggles :</h3>
            <h4 className="box-title-left">Time :</h4>
            <div className="time-buttons">
              {[
                ["sunrise", sunrise],
                ["day", day],
                ["noon", noon],
                ["sunset", sunset],
                ["night", night],
                ["midnight", midnight],
              ].map(([time, img]) => (
                <div key={time} className="toggle-item">
                  <button onClick={() => handleTimeCommand(time)} className="icon-button">
                    <img src={img} alt={time} className="icon-large" />
                  </button>
                  <p>{time.charAt(0).toUpperCase() + time.slice(1)}</p>
                </div>
              ))}
            </div>

            <h4 className="box-title-left">Game Mode :</h4>
            <div className="game-mode-buttons">
              {[
                ["survival", heart],
                ["spectator", cam],
                ["creative", pickaxe],
              ].map(([mode, img]) => (
                <div key={mode} className="toggle-item">
                  <button onClick={() => handleGameMode(mode)} className="icon-button">
                    <img src={img} alt={mode} className="icon-large" />
                  </button>
                  <p>{mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Loader isVisible={isLoading} loadingText={loadingText} />

      <div
        className={`app${bgMode === "video" ? " video-bg" : " image-bg"}`}
        style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.5s ease" }}
      >
        {bgMode === "image" && <div className="background-image" />}
        {bgMode === "video" && (
          <>
            <video className="background-video" src={backVideo} autoPlay loop playsInline />
            <div className="background-overlay" />
          </>
        )}

        <div className="steve-container">
          <SteveAssistant />
          <div className="steve-tooltip">Hello, user 👋</div>
        </div>

        <header className="app-header">
          <div className="logo">MinLive</div>
          <div className="nav-center">
            <button
              className="bg-toggle-btn nav-toggle"
              onClick={handleToggleBg}
              title={bgMode === "image" ? "Switch to Video Background" : "Switch to Image Background"}
            >
              <img className="bg-toggle-icon" src={but} alt="Toggle Background" />
            </button>
          </div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route
            path="/settings"
            element={
              <Settings
                bgMode={bgMode}
                handleToggleBg={handleToggleBg}
                onSettingsChange={({ preference, theme, language }) => {
                  document.documentElement.setAttribute("data-theme", theme);
                }}
              />
            }
          />
          <Route path="/about" element={<About />} />
        </Routes>

        {isHome && (
          <footer className="footer-stats">
            <div className="stats-text">
              <span>Number of viewers:</span>
              <span className="views">{stats.viewers}</span>
              <span>Number of Likes:</span>
              <span className="likes">{stats.likes}</span>
              <span>Number of Subscribers:</span>
              <span className="subs">{stats.subscribers}</span>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}

export default App;