import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Wager from "./Wager";
import PropTypes from "prop-types";
import Trivia from "./games/Trivia";
import Voting from "./Voting";
import { socket } from "../socket";

GameMain.propTypes = {
  isPartyLeader: PropTypes.bool,
};

export default function GameMain({ isPartyLeader }) {
  const { roomID } = useParams();
  const [isWagering, setIsWagering] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameData, setGameData] = useState();
  const [votingData, setVotingData] = useState(null);

  const games = {
    Trivia: {
      component: Trivia,
      description: `Answer the trivia question correctly and you will get to hand out the amount of drinks you wager to other players.
      If you guess incorrectly, you have to drink your wager. Players who answered correctly can also hand out drinks to you.`,
    },
    // CoinToss: {
    //   component: CoinToss,
    //   description: "A simple coin toss game.",
    // },
    // TortoiseRace: {
    //   component: TortoiseRace,
    //   description: "A race game with tortoises.",
    // },
    // HotPotato: {
    //   component: HotPotato,
    //   description: "A game where you pass a hot potato around.",
    // },
    // Knockout: {
    //   component: Knockout,
    //   description: "A knockout-style competition.",
    // },
    // Bingo: {
    //   component: Bingo,
    //   description: "A classic bingo game.",
    // },
  };

  useEffect(() => {
    const handleStartWagers = () => {
      setIsWagering(true);
    };

    const startMiniGame = () => {
      setIsWagering(false);
    };

    const handleRoomGameSelected = (game) => {
      setSelectedGame(game);
    };

    const handleGameData = (data) => {
      setGameData(data);
    };

    const handleVotingData = (data) => {
      setVotingData(data);
    };

    socket.on("game-data", handleGameData);
    socket.on("start-wagering", handleStartWagers);
    socket.on("set-game-selection", handleRoomGameSelected);
    socket.on("all-wagers-placed", startMiniGame);
    socket.on("start-voting", handleVotingData);

    return () => {
      socket.off("game-data", handleGameData);
      socket.off("start-wagering", handleStartWagers);
      socket.off("set-game-selection", handleRoomGameSelected);
      socket.off("all-wagers-placed", startMiniGame);
      socket.off("start-voting", handleVotingData);
    };
  }, []);

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

  return (
    <section>
      {isWagering ? (
        <div>
          <h1>{selectedGame}</h1>
          <p>{selectedGameDescription}</p>
          <Wager roomID={roomID} />
        </div>
      ) : votingData ? (
        <Voting votingData={votingData} roomID={roomID} setVotingData={setVotingData} />
      ) : selectedGame ? (
        SelectedGameComponent && (
          <SelectedGameComponent gameData={gameData} roomID={roomID} />
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
