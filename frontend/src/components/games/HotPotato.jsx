import PropTypes from "prop-types";
import { useEffect, useContext, useState } from "react";
import UserContext from "../UserContext";
import { socket } from "../../socket";

HotPotato.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  changeGameData: PropTypes.func,
};

export default function HotPotato({ roomID, gameData, changeGameData }) {
  const { username } = useContext(UserContext);
  const [timer, setTimer] = useState("");

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

    socket.on("threw-potato", threwPotato);
    socket.on("timer", updateTimer);

    return () => {
      socket.off("threw-potato", threwPotato);
      socket.off("timer", updateTimer);
    };
  });

  return (
    <>
      <div>
        <h1>{timer}</h1>
      </div>
      <div>
        {Object.entries(gameData).map(
          ([player, potato], i) =>
            player.localeCompare(username) !== 0 && (
              <div key={i}>
                <h1>{player}</h1>
                {playerHasPotato && (
                  <button onClick={() => givePotatoToPlayer(player)}>
                    Pass Potato
                  </button>
                )}
                {potato.hasPotato && <p>potato</p>}
              </div>
            ),
        )}
      </div>
    </>
  );
}
