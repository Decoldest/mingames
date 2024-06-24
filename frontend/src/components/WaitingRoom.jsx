import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

WaitingRoom.propTypes = {
  socket: PropTypes.object,
  roomID: PropTypes.string,
  username: PropTypes.string,
  setRoomID: PropTypes.func,
  isPartyLeader: PropTypes.bool,
};

export default function WaitingRoom({
  socket,
  roomID,
  username,
  setRoomID,
  isPartyLeader,
}) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    const addMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleRoomCreated = (roomID, username) => {
      addMessage(`${username} joined`);
      setRoomID(roomID);
    };

    const handleJoinedRoom = (username) => {
      addMessage(`${username} joined`);
    };

    const handleLeftRoom = (username) => {
      addMessage(`${username} left`);
    };

    const handleReceiveMessage = (message, username) => {
      addMessage(`${username}: ${message}`);
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("joined-room", handleJoinedRoom);
    socket.on("left-room", handleLeftRoom);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("joined-room", handleJoinedRoom);
      socket.off("left-room", handleLeftRoom);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [setRoomID, socket]);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("send-message", messageInput, username, roomID);
      setMessageInput("");
    }
  };

  const setGameStart = () => {
    console.log("statring attempt")
    socket.emit("initiate-game", roomID);
  };

  return (
    <section>
      <h1>{roomID}</h1>
      Waiting for players to join...
      <div className="message-container" ref={messageContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className="message-item">
            {msg}
          </div>
        ))}
      </div>
      {isPartyLeader && (
        <button onClick={() => setGameStart()}>Start Game</button>
      )}
      <div className="input-container">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button onClick={() => sendMessage()} className="send-button">
          Send
        </button>
      </div>
    </section>
  );
}
