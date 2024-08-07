import PropTypes from "prop-types";
import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserContext from "./UserContext";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import crown from "../assets/crown.png";
import "./WaitingRoom.scss";

WaitingRoom.propTypes = {
  isPartyLeader: PropTypes.bool,
};

export default function WaitingRoom({ isPartyLeader }) {
  const { roomID } = useParams();
  const { username } = useContext(UserContext);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [copySuccess, setCopySuccess] = useState("");
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();
  const link = `${window.location.origin}/${roomID}`;

  useEffect(() => {
    const addMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleJoinedRoom = (username, playerList) => {
      addMessage(`${username} joined`);
      setPlayers(playerList);
    };

    const handleLeftRoom = (username, playerList) => {
      addMessage(`${username} left`);
      setPlayers(playerList);
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
  }, [navigate, players]);

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
        <div className="players-container mt-10">
          <h2>Players</h2>
          <div className="username-grid">
            {players.map((player) => (
              <div key={player._id} className="username">
                {player.isPartyLeader && (
                  <div>
                    <img src={crown} alt="Crown Icon" />
                  </div>
                )}
                <p>{player.username}</p>
              </div>
            ))}
          </div>
        </div>
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
