import PropTypes from "prop-types";
import { useEffect, useContext } from "react";
import UserContext from "../UserContext";
import { socket } from "../../socket";

HotPotato.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
};

export default function HotPotato({ roomID, gameData }) {
  const { username } = useContext(UserContext);

  const givePotatoToPlayer = (receiver) => {
    socket.emit("give-potato", (username, receiver));
  };

  const playerHasPotato = gameData[username].hasPotato;

  useEffect(() => {
    console.log(gameData);
  });

  return (
    <div>
      {/* {gameData.map((player, index) => (
        <div key={index}>
          <h1>{player.username}</h1>
          <button>Pass Potato</button>
          {player.hasPotato && (
            <p>potato</p>
          )}
        </div>
      ))} */}
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
              {potato && <p>potato</p>}
            </div>
          ),
      )}
    </div>
  );
}
