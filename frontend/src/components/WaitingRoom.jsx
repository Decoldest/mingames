import PropTypes from "prop-types";
import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserContext from "./UserContext";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import "./WaitingRoom.scss";

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
      navigate("/");
    };

    socket.on("joined-room", handleJoinedRoom);
    socket.on("left-room", handleLeftRoom);
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

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="wait flex justify-center gap-10">
      <div className="info-container">
        <h1 className="title">Booze Bash</h1>
        <h1>{roomID}</h1>
        <p className="mb-4">Waiting for players to join...</p>
        {isPartyLeader ? (
          <button onClick={() => setGameStart()} className="main-button">
            Start Game
          </button>
        ) : (
          <h4>Party leader will start the game</h4>
        )}
      </div>
      <div className="input-container">
        <div className="message-container" ref={messageContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className="message-item">
              {msg}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          onClick={() => {
            sendMessage();
          }}
          className="send-button"
        >
          Send
        </button>
      </div>
    </section>
  );
}
