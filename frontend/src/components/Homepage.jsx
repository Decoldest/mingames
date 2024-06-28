import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Join from "./Join";
import UserContext from "./UserContext";
import { socket } from "../socket";

export default function Homepage() {
  const [roomID, setRoomID] = useState("");
  const { username, setUsername } = useContext(UserContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

    // Register socket event listeners
    socket.on("connect", handleConnect);
    socket.on("error", handleError);
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
  };

  const createRoom = () => {
    socket.emit("create-room", username, (response) => {
      if (response.success) {
        setRoomID(response.roomID);
        navigate(`/${response.roomID}`, {
          state: { isPartyLeader: true, waiting: true },
        });
      } else {
        setError(response.message);
      }
    });
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
      navigate(`/${roomID}`, { state: { isPartyLeader: false, waiting: true } });
    });
  };

  return (
    <main>
      <Join
        creatingRoom={true}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        error={error}
        setError={setError}
        username={username}
        setUsername={setUsername}
        roomID={roomID}
        setRoomID={setRoomID}
      />
    </main>
  );
}
