import { useState, useEffect } from "react";
import io from "socket.io-client";
import WaitingRoom from "./WaitingRoom";

const socket = io("http://localhost:3000");

export default function Homepage() {
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("message");
  const [waiting, setWaiting] = useState(false);
  const messageContainer = document.getElementById("messages");

  useEffect(() => {
    // Set up socket listeners
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("room-created", (username) => {
      const messageItem = document.createElement("li");
      messageItem.textContent = `${username} joined`;
      messageContainer.appendChild(messageItem);
    });

    socket.on("joined-room", (username) => {
      const messageItem = document.createElement("li");
      messageItem.textContent = `${username} joined`;
      messageContainer.appendChild(messageItem);
    });

    socket.on("error", (message) => {
      alert(message);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("new-player");
      socket.off("error");
    };
  }, [messageContainer]);

  const createRoom = () => {
    socket.emit("create-room", username);
  };

  const joinRoom = () => {
    socket.emit("join-room", roomID, username);
  };

  return (
    <main className="App">
      {waiting ? (
        <WaitingRoom
          message={message}
          setMessage={setMessage}
          roomID={roomID}
        />
      ) : (
        <section>
          <h1>MiniGames.io</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
          <button
            onClick={() => {
              createRoom();
              setWaiting(true);
            }}
          >
            Create Room
          </button>
          <input
            type="text"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            placeholder="Enter Room ID"
          />
          <button
            onClick={() => {
              joinRoom();
              setWaiting(true);
            }}
          >
            Join Room
          </button>
        </section>
      )}
      <div id="messages"></div>
    </main>
  );
}
