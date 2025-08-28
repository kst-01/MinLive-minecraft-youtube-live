// src/integrat.js

export async function fetchChatLog() {
  const res = await fetch("/api/chat-log");
  return res.json();
}

export async function fetchItemLog() {
  const res = await fetch("/api/item-log");
  return res.json();
}

export async function fetchMobVotes() {
  const res = await fetch("/api/mob-votes");
  return res.json();
}

export async function fetchChannel() {
  const res = await fetch("/api/channel");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch("/api/stats");
  return res.json();
}

export async function toggleGamemode(mode) {
  const res = await fetch("/api/gamemode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode })
  });
  return res.json();
}

export async function toggleTime(time) {
  const res = await fetch("/api/time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time })
  });
  return res.json();
}

export async function sendChatMessage(message) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}

export async function sendConsoleCommand(command) {
  const res = await fetch("/api/console", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });
  return res.json();
}
