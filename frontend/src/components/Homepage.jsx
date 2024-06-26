import { useState, useEffect } from "react";
import WaitingRoom from "./WaitingRoom";
import GameMain from "./GameMain";
import { socket } from "../socket";

export default function Homepage() {
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [playing, setIsPlaying] = useState(false);
  const [isPartyLeader, setIsPartyLeader] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Event handlers for socket events
    const handleConnect = () => {
      console.log("Connected to server");
    };

    const handleError = (errorMessage) => {
      setError(errorMessage);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
    };

    const handleStartGame = () => {
      setWaiting(false);
      setIsPlaying(true);
    };

    // Register socket event listeners
    socket.on("connect", handleConnect);
    socket.on("error", handleError);
    socket.on("start-game", handleStartGame);
    socket.on("disconnect", handleDisconnect);

    // Cleanup function to remove event listeners on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const handleCreateRoom = () => {
    if (username === "") {
      setError("Please enter a username");
      return;
    }
    createRoom();
    setIsPartyLeader(true);
    setWaiting(true);
  };

  const createRoom = () => {
    socket.emit("create-room", username);
  };

  const handleJoinRoom = () => {
    if (username === "") {
      setError("Please enter a username");
      return;
    }
    joinRoom();
  };

  const joinRoom = () => {
    socket.emit("join-room", roomID, username);

    socket.on("joining-room", () => {
      setError(null);
      setWaiting(true);
    });
  };

  return (
    <main className="App">
      {waiting ? (
        <WaitingRoom
          roomID={roomID}
          username={username}
          setRoomID={setRoomID}
          setWaiting={setWaiting}
          isPartyLeader={isPartyLeader}
        />
      ) : playing ? (
        <GameMain
          socket={socket}
          roomID={roomID}
          isPartyLeader={isPartyLeader}
        />
      ) : (
        <section>
          <h1>MiniGames.io</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            placeholder="Enter your name"
          />
          <button onClick={handleCreateRoom}>Create Room</button>
          <input
            type="text"
            value={roomID}
            onChange={(e) => {
              setRoomID(e.target.value);
              setError(null);
            }}
            placeholder="Enter Room ID"
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </section>
      )}
      {error && <div className="error">{error}</div>}
    </main>
  );
}
