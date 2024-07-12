import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Wager from "./Wager";
import PropTypes from "prop-types";
import Trivia from "./games/Trivia";
import Race from "./games/Race";
import Voting from "./Voting";
import { socket } from "../socket";

GameMain.propTypes = {
  isPartyLeader: PropTypes.bool,
  state: PropTypes.object,
  setState: PropTypes.func,
};

export default function GameMain({ isPartyLeader, state, setState }) {
  const { roomID } = useParams();

  const { isWagering, selectedGame, gameData, votingData, waitingMessage } =
    state;

  const games = {
    Trivia: {
      component: Trivia,
      description: `Answer the trivia question correctly and you will get to hand out the amount of drinks you wager to other players.
      If you guess incorrectly, you have to drink your wager. Players who answered correctly can also hand out drinks to you.`,
    },
    Race: {
      component: Race,
      description: `You will get a Squirtle that will race the other Squirtles. Wager a number of drinks 
      on your Squirtle winning the race. Winner gets to give drinks out. Losers will
      drink their wager plus any additional drinks given to them.`,
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

    socket.on("game-data", handleGameData);
    socket.on("start-wagering", handleStartWagers);
    socket.on("set-game-selection", handleRoomGameSelected);
    socket.on("all-wagers-placed", startMiniGame);
    socket.on("start-voting", handleVotingData);
    socket.on("update-game", handleContinueGame);
    socket.on("end-game", handleEndGame);

    return () => {
      socket.off("game-data", handleGameData);
      socket.off("start-wagering", handleStartWagers);
      socket.off("set-game-selection", handleRoomGameSelected);
      socket.off("all-wagers-placed", startMiniGame);
      socket.off("start-voting", handleVotingData);
      socket.off("update-game", handleContinueGame);
      socket.off("end-game", handleEndGame);
    };
  }, [setState]);

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

  return (
    <section>
      {isWagering ? (
        <div>
          <h1>{selectedGame}</h1>
          <h3>
            {gameData && gameData.round ? `Round: ${gameData.round + 1}` : ""}
          </h3>
          <p>{selectedGameDescription}</p>
          <Wager roomID={roomID} />
        </div>
      ) : votingData ? (
        <Voting
          votingData={votingData}
          roomID={roomID}
          setVotingData={(data) =>
            setState((prevState) => ({ ...prevState, votingData: data }))
          }
          doneVotingPhase={doneVotingPhase}
        />
      ) : selectedGame ? (
        SelectedGameComponent && (
          <SelectedGameComponent
            gameData={gameData}
            roomID={roomID}
            waitingMessage={waitingMessage}
            setWaitingMessage={(message) =>
              setState((prevState) => ({
                ...prevState,
                waitingMessage: message,
              }))
            }
          />
        )
      ) : (
        <div>
          {Object.keys(games).map((game) => (
            <button
              key={game}
              onClick={() => handleGameSelectionAsLeader(game)}
              disabled={!isPartyLeader}
            >
              {game}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
