import React from 'react';
import './App.css';

function About() {
  return (
    <div className="page-content">
      <h2>About MinLive</h2>
      <p>
        <strong>MinLive</strong> is a Minecraft websocket programming toolkit and demo app. 
        It lets you interact with Minecraft using custom scripts, send commands, and visualize game data in real time.
      </p>
      <h3>Features</h3>
      <ul>
        <li>Live chat integration</li>
        <li>Item and mob voting</li>
        <li>Console command interface</li>
        <li>Game mode and time toggles</li>
      </ul>
      <h3>Credits</h3>
      <ul>
        <li>Developed by the MinLive Team</li>
        <li>Inspired by Minecraft modding and automation</li>
        <li>See backend folder for websocket code and tutorials</li>
      </ul>
      <h3>Links</h3>
      <ul>
        <li><a href="https://youtu.be/o-NgvtJZDcY" target="_blank" rel="noopener noreferrer">Python Tutorial</a></li>
        <li><a href="https://youtu.be/bjanNXXwQbo" target="_blank" rel="noopener noreferrer">JavaScript Tutorial</a></li>
      </ul>
    </div>
  );
}

export default About;
