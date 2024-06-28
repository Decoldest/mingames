import { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import UserContext from "./UserContext";
import WaitingRoom from "./WaitingRoom";
import GameMain from "./GameMain";
import Join from "./Join";
import { socket } from "../socket";

export default function Room() {
  const { roomID } = useParams();
  const location = useLocation();
  const { username, setUsername } = useContext(UserContext);
  const [waiting, setWaiting] = useState(location.state || false);
  const [playing, setIsPlaying] = useState(false);
  const { isPartyLeader } = location.state || false;
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
      socket.on("start-game", handleStartGame);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const handleJoinRoom = () => {
    if (username === "") {
      setError("Please enter a username");
      return;
    }
    joinRoom();
  };

  const joinRoom = () => {
    socket.emit("join-room", roomID, username, (response) => {
      if (response.success) {
        console.log(response.state);
        setWaiting(response.state.waiting);
      } else {
        setError(response.message);
      }
    });

    socket.on("joining-room", () => {
      setError(null);
      setWaiting(true);
    });
  };

  return (
    <main>
      {waiting ? (
        <WaitingRoom username={username} isPartyLeader={isPartyLeader} />
      ) : playing ? (
        <GameMain isPartyLeader={isPartyLeader} />
      ) : (
        <Join
          creatingRoom={false}
          handleJoinRoom={handleJoinRoom}
          error={error}
          setError={setError}
          username={username}
          setUsername={setUsername}
        />
      )}
    </main>
  );
}
