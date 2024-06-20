import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import WaitingRoom from "./WaitingRoom";

const socket = io("http://localhost:3000");

export default function Homepage() {
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const [waiting, setWaiting] = useState(false);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const addMessage = (message) => {
      const messageItem = document.createElement("li");
      messageItem.textContent = message;
      messageContainerRef.current.appendChild(messageItem);
    };

    // Set up socket listeners
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("room-created", (roomID, username) => {
      addMessage(`${username} joined`);
      setRoomID(roomID);
    });

    socket.on("joined-room", (username) => {
      addMessage(`${username} joined`);
    });

    socket.on("left-room", (username) => {
      console.log(username);
      addMessage(`${username} left`);
    });

    socket.on("error", (message) => {
      alert(message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("joined-room");
      socket.off("left-room");
      socket.off("error");
      socket.off("disconnect");
    };
  }, []); // No dependencies needed for useEffect

  const createRoom = () => {
    socket.emit("create-room", username);
  };

  const joinRoom = () => {
    socket.emit("join-room", roomID, username);
  };

  return (
    <main className="App">
      {waiting ? (
        <WaitingRoom roomID={roomID} />
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
      <div ref={messageContainerRef} id="messages"></div>
    </main>
  );
}
