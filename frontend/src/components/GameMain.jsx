import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Wager from "./Wager";
import PropTypes from "prop-types";
import Trivia from "./games/Trivia";
import Race from "./games/Race";
import Voting from "./Voting";
import HotPotato from "./games/HotPotato";
import { socket } from "../socket";
import ButtonPress from "./games/ButtonPress";
import PlayerList from "./PlayerList";
import "@fontsource/press-start-2p";
import "@fontsource/share-tech-mono";
import "./GameMain.scss";

GameMain.propTypes = {
  isPartyLeader: PropTypes.bool,
  state: PropTypes.object,
  setState: PropTypes.func,
  players: PropTypes.array,
  playersHandler: PropTypes.func,
};

export default function GameMain({
  isPartyLeader,
  state,
  setState,
  players,
  playersHandler,
}) {
  const { roomID } = useParams();

  const { isWagering, selectedGame, gameData, votingData, waitingMessage } =
    state;

  const games = {
    Trivia: {
      component: Trivia,
      description: `Answer the trivia question correctly and you will get to hand out the amount of drinks you wager to other players.
        If you guess incorrectly, you have to drink your wager. Players who answered correctly can also hand out drinks to you.`,
      emoji: "🧠",
    },
    Race: {
      component: Race,
      description: `You will get a squirtle that will race the other players' squirtles. Wager a number of drinks 
        on your squirtle winning the race. Winner gets to give drinks out. Losers will
        drink their wager plus any additional drinks given to them.`,
      emoji: "🏁",
    },
    "Hot Potato": {
      component: HotPotato,
      description: `It's literally hot potato. The person with a potato at the end of the game drinks.`,
      emoji: "🥔",
    },
    "Button Press": {
      component: ButtonPress,
      description: `Press the button as many times as possible before the timer ends. The player with the most button presses
        is safe. The other players drink.`,
      emoji: "🔘",
    },
  };

  useEffect(() => {
    const handleStartWagers = () => {
      setState((prevState) => ({ ...prevState, isWagering: true }));
    };

    const startMiniGame = () => {
      setState((prevState) => ({ ...prevState, isWagering: false }));
    };

    const handleRoomGameSelected = (game) => {
      setState((prevState) => ({ ...prevState, selectedGame: game }));
    };

    const handleGameData = (data) => {
      setState((prevState) => ({ ...prevState, gameData: data }));
    };

    const handleVotingData = (data) => {
      setState((prevState) => ({ ...prevState, votingData: data }));
    };

    const handleContinueGame = (state) => {
      setState(state);
    };

    const handleLatePlayer = (addedGameData, addedVotingData) => {
      setState((prevState) => {
        // Handle null or undefined addedVotingData
        const votingDataUpdate = addedVotingData
          ? { ...prevState.votingData, ...addedVotingData }
          : prevState.votingData;

        return {
          ...prevState,
          gameData: { ...prevState.gameData, ...addedGameData },
          votingData: votingDataUpdate,
        };
      });
    };

    //Resets the screen to game selection state
    const handleEndGame = () => {
      setState({
        waiting: false,
        playing: true,
        selectedGame: null,
        gameData: null,
        votingData: null,
        isWagering: false,
        waitingMessage: "",
      });
    };

    const handleJoinedRoom = (username, playerList) => {
      console.log(playerList);
      playersHandler(playerList);
    };

    const handleLeftRoom = (username, playerList) => {
      playersHandler(playerList);
    };

    socket.on("game-data", handleGameData);
    socket.on("start-wagering", handleStartWagers);
    socket.on("set-game-selection", handleRoomGameSelected);
    socket.on("all-wagers-placed", startMiniGame);
    socket.on("start-voting", handleVotingData);
    socket.on("update-game", handleContinueGame);
    socket.on("end-game", handleEndGame);
    socket.on("late-player-data", handleLatePlayer);
    socket.on("joined-room", handleJoinedRoom);
    socket.on("left-room", handleLeftRoom);

    return () => {
      socket.off("game-data", handleGameData);
      socket.off("start-wagering", handleStartWagers);
      socket.off("set-game-selection", handleRoomGameSelected);
      socket.off("all-wagers-placed", startMiniGame);
      socket.off("start-voting", handleVotingData);
      socket.off("update-game", handleContinueGame);
      socket.off("end-game", handleEndGame);
      socket.off("late-player-data", handleLatePlayer);
      socket.off("joined-room", handleJoinedRoom);
      socket.off("left-room", handleLeftRoom);
    };
  }, [setState, gameData, playersHandler]);

  const setWageringPhase = () => {
    if (isPartyLeader) {
      socket.emit("initiate-wagering", roomID);
    }
  };

  const handleGameSelectionAsLeader = (game) => {
    setWageringPhase();
    socket.emit("game-chosen", roomID, game);
  };

  const SelectedGameComponent = selectedGame
    ? games[selectedGame]?.component
    : null;
  const selectedGameDescription = selectedGame
    ? games[selectedGame]?.description
    : null;

  const doneVotingPhase = () => {
    socket.emit("done-voting-phase", roomID);
  };

  const handleWaitingMessage = (message) => {
    setState((prevState) => ({
      ...prevState,
      waitingMessage: message,
    }));
  };

  const handleVotingData = (data) => {
    setState((prevState) => ({ ...prevState, votingData: data }));
  };

  const handleChangeGameData = (data) => {
    setState((prevState) => ({ ...prevState, gameData: data }));
  };

  return (
    <section className="w-full game-main-container">
      {isWagering ? (
        <div className="wager-container">
          <h1 className="game-title text-center">{selectedGame}</h1>
          <h3>
            {gameData && gameData.round ? `Round: ${gameData.round + 1}` : ""}
          </h3>
          <p className="game-description">{selectedGameDescription}</p>
          <Wager roomID={roomID} />
        </div>
      ) : votingData ? (
        <Voting
          votingData={votingData}
          roomID={roomID}
          setVotingData={handleVotingData}
          doneVotingPhase={doneVotingPhase}
        />
      ) : selectedGame ? (
        SelectedGameComponent && (
          <SelectedGameComponent
            gameData={gameData}
            roomID={roomID}
            waitingMessage={waitingMessage}
            setWaitingMessage={handleWaitingMessage}
            changeGameData={handleChangeGameData}
            isPartyLeader={isPartyLeader}
          />
        )
      ) : (
        <div className="game-buttons-container">
          {isPartyLeader ? <h2>Choose A Game 🕹️</h2> : <h2>Games 🕹️</h2>}

          <div className="game-buttons-grid">
            {Object.keys(games).map((game) => (
              <button
                key={game}
                onClick={() => handleGameSelectionAsLeader(game)}
                disabled={!isPartyLeader}
                className="game-button"
              >
                <span>
                  {games[game].emoji} {game}
                </span>
              </button>
            ))}
          </div>
          {!isPartyLeader && (
            <h2 className="leader-message">
              *Party leader will select the game
            </h2>
          )}
          <PlayerList players={players} />
        </div>
      )}
    </section>
  );
}
