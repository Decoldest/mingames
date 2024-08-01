import PropTypes from "prop-types";
import { useEffect, useContext, useState } from "react";
import UserContext from "../UserContext";
import { socket } from "../../socket";
import potatoImage from "../../assets/potato.png";
import potatoGreyed from "../../assets/potato-greyed.png";

HotPotato.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  changeGameData: PropTypes.func,
};

export default function HotPotato({ roomID, gameData, changeGameData }) {
  const { username } = useContext(UserContext);
  const [timer, setTimer] = useState("");
  const [disabled, setDisabled] = useState(false);

  const givePotatoToPlayer = (receiver) => {
    socket.emit("give-potato", roomID, username, receiver);
  };

  const playerHasPotato = gameData[username].hasPotato;

  useEffect(() => {
    console.log(gameData);
    const threwPotato = (gameData) => {
      changeGameData(gameData);
    };
    const updateTimer = (time) => {
      setTimer(time);
    };
    const disableGame = () => {
      setDisabled(true);
    };

    socket.on("threw-potato", threwPotato);
    socket.on("timer", updateTimer);
    socket.on("end-game", disableGame);

    return () => {
      socket.off("threw-potato", threwPotato);
      socket.off("timer", updateTimer);
      socket.off("end-game", disableGame);
    };
  });

  return (
    <>
      <h2 className="timer">{timer} s</h2>
      <div className="potato-container">
        {Object.entries(gameData).map(([player, potato], i) =>
          player.localeCompare(username) === 0 ? (
            <div key={i} className="hot-potato-player">
              <h1>
                {player} {`(you)`}
              </h1>
              {playerHasPotato ? (
                <>
                  <img
                    className="potato-image"
                    src={potatoImage}
                    alt="Potato"
                  />
                  <h2>You have the potato</h2>
                </>
              ) : (
                <img
                  className="potato-image greyed"
                  src={potatoGreyed}
                  alt="Potato"
                />
              )}
            </div>
          ) : (
            <div key={i} className="hot-potato-player">
              <h1>{player}</h1>
              {potato.hasPotato ? (
                <>
                  <img
                    className="potato-image"
                    src={potatoImage}
                    alt="Potato"
                  />{" "}
                  <h2>{player} has the potato</h2>
                </>
              ) : (
                <img
                  className="potato-image greyed"
                  src={potatoGreyed}
                  alt="Potato"
                />
              )}
              {playerHasPotato && (
                <button
                  disabled={disabled}
                  onClick={() => givePotatoToPlayer(player)}
                  className="game-button"
                >
                  Pass Potato
                </button>
              )}
            </div>
          ),
        )}
      </div>
    </>
  );
}
