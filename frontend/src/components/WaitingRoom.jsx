import PropTypes from "prop-types";
import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserContext from "./UserContext";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import "./WaitingRoom.scss";
import PlayerList from "./PlayerList";

WaitingRoom.propTypes = {
  isPartyLeader: PropTypes.bool,
  players: PropTypes.array,
  playersHandler: PropTypes.func,
};

export default function WaitingRoom({ isPartyLeader, players, playersHandler }) {
  const { roomID } = useParams();
  const { username } = useContext(UserContext);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [copySuccess, setCopySuccess] = useState("");
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();
  const link = `${window.location.hostname.replace(/^www\./, "")}/${roomID}`;

  useEffect(() => {
    const addMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleJoinedRoom = (username, playerList) => {
      addMessage(`${username} joined`);
      playersHandler(playerList);
    };

    const handleLeftRoom = (username, playerList) => {
      addMessage(`${username} left`);
      playersHandler(playerList);
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
  }, [navigate, playersHandler]);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("send-message", messageInput, username, roomID);
      setMessageInput("");
    }
  };

  const setGameStart = () => {
    socket.emit("initiate-game", roomID);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess("Link copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    });
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
        <p>Click below to copy room link</p>
        <div className="link-container">
          <button onClick={copyToClipboard} className="copy-link">
            {copySuccess ? "Copied Link!" : `${link}`}
          </button>
        </div>
        <h1>{roomID}</h1>
        {isPartyLeader ? (
          <button onClick={() => setGameStart()} className="main-button">
            Start Game
          </button>
        ) : (
          <h4>Party leader will start the game</h4>
        )}
        <PlayerList players={players}/>
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
