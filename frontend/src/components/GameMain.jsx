import { useState, useEffect } from "react";
import Wager from "./Wager";
import PropTypes from "prop-types";
import Trivia from "./games/Trivia";

GameMain.propTypes = {
  socket: PropTypes.object,
  roomID: PropTypes.string,
  isPartyLeader: PropTypes.bool,
};

export default function GameMain({ socket, roomID, isPartyLeader }) {
  const [isWagering, setIsWagering] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  // const [isVoting, setIsVoting] = useState(false);

  const games = {
    Trivia: {
      component: Trivia,
      description: `Answer the trivia question correctly and you will get to hand out the amount of drinks you wager.
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

    socket.on("start-wagering", handleStartWagers);
    socket.on("set-game-selection", handleRoomGameSelected);
    socket.on("all-wagers-placed", startMiniGame);

    return () => {
      socket.off("start-wagering", handleStartWagers);
      socket.off("set-game-selection", handleRoomGameSelected);
      socket.off("all-wagers-placed", startMiniGame);
    };
  }, [socket]);

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
          <Wager socket={socket} roomID={roomID} />
        </div>
      ) : selectedGame ? (
        SelectedGameComponent && <SelectedGameComponent />
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
