import PropTypes from "prop-types";
import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserContext from "./UserContext";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

WaitingRoom.propTypes = {
  isPartyLeader: PropTypes.bool,
};

export default function WaitingRoom({ isPartyLeader }) {
  const { roomID } = useParams();
  const { username } = useContext(UserContext);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const addMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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

    const returnToHome = () => {
      console.log("returning ti gome");
      navigate("/");
    };

    socket.on("joined-room", handleJoinedRoom);
    socket.on("left-room", handleLeftRoom);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("return-main", returnToHome);

    return () => {
      socket.off("joined-room", handleJoinedRoom);
      socket.off("left-room", handleLeftRoom);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("return-main", returnToHome);
    };
  }, [navigate]);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("send-message", messageInput, username, roomID);
      setMessageInput("");
    }
  };

  const setGameStart = () => {
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
      {isPartyLeader ? (
        <button onClick={() => setGameStart()}>Start Game</button>
      ) : (
        <h4>Party leader will start the game</h4>
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
