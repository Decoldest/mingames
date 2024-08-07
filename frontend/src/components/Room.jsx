import { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";
import WaitingRoom from "./WaitingRoom";
import GameMain from "./GameMain";
import Join from "./Join";
import Footer from "../Footer";
import { socket } from "../socket";

export default function Room() {
  const { roomID } = useParams();
  const location = useLocation();
  const { username, setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const [isPartyLeader, setIsPartyLeader] = useState(
    location.state?.isPartyLeader || false,
  );
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    waiting: location.state?.waiting || false,
    playing: location.state?.playing || false,
    isWagering: location.state?.isWagering || false,
    selectedGame: location.state?.selectedGame || null,
    gameData: location.state?.gameData || null,
    votingData: location.state?.votingData || null,
    waitingMessage: "",
  });

  const { waiting, playing } = state;

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
      navigate("/");
    };

    const handleStartGame = () => {
      setState((prevState) => ({
        ...prevState,
        waiting: false,
        playing: true,
      }));
    };

    const makePartyLeader = () => {
      console.log("New party leader");
      setIsPartyLeader(true);
    };

    // Register socket event listeners
    socket.on("connect", handleConnect);
    socket.on("error", handleError);
    socket.on("start-game", handleStartGame);
    socket.on("disconnect", handleDisconnect);
    socket.on("make-party-leader", makePartyLeader);

    // Cleanup function to remove event listeners on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      socket.off("start-game", handleStartGame);
      socket.off("disconnect", handleDisconnect);
      socket.off("make-party-leader", makePartyLeader);

      //send socket event
      socket.emit("leave-room");
    };
  }, [navigate]);

  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }
    joinRoom();
  };

  const joinRoom = () => {
    socket.emit("join-room", roomID, username, (response) => {
      if (response.success) {
        console.log(response.state);

        setState(response.state);
      } else {
        setError(response.message);
      }
    });
  };

  const errorHandler = (error) => {
    setError(error);
  };

  const usernameHandler = (username) => {
    setUsername(username);
  };

  return (
    <main className="flex flex-col">
      <div className="min-h-screen flex items-start justify-center pt-5 sm:pt-20">
        {waiting ? (
          <WaitingRoom username={username} isPartyLeader={isPartyLeader} />
        ) : playing ? (
          <GameMain
            isPartyLeader={isPartyLeader}
            state={state}
            setState={setState}
          />
        ) : (
          <Join
            creatingRoom={false}
            handleJoinRoom={handleJoinRoom}
            error={error}
            errorHandler={errorHandler}
            username={username}
            usernameHandler={usernameHandler}
            roomID={roomID}
          />
        )}
      </div>
      <Footer />
    </main>
  );
}
