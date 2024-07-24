import PropTypes from "prop-types";
import { useEffect, useContext, useState } from "react";
import UserContext from "../UserContext";
import { socket } from "../../socket";

ButtonPress.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  changeGameData: PropTypes.func,
  isPartyLeader: PropTypes.bool,
};

export default function ButtonPress({
  roomID,
  gameData,
  changeGameData,
  isPartyLeader,
}) {
  const [timer, setTimer] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const { username } = useContext(UserContext);

  const pressedButton = () => {
    setMyScore((myScore) => {
      const newScore = myScore + 1;
      socket.emit("pressed-button", roomID, username, newScore);
      return newScore;
    });
  };

  useEffect(() => {
    const updateTimer = (time) => {
      setTimer(time);
    };

    const disableGame = () => {
      setDisabled(true);
      if (isPartyLeader) {
        socket.emit("button-results", gameData, roomID);
      }
    };

    const addScore = (newScore) => {
      changeGameData({
        ...gameData,
        ...newScore,
      });
    };

    socket.on("end-game", disableGame);
    socket.on("timer", updateTimer);
    socket.on("add-score", addScore);

    return () => {
      socket.off("end-game", disableGame);
      socket.off("timer", updateTimer);
      socket.off("add-score", addScore);
    };
  });

  return (
    <>
      <div>{timer}</div>
      <div className="flex flex-row">
        {Object.entries(gameData).map(([player, score], i) => (
          <div key={i}>
            <h1>{player}</h1>
            <p>{score}</p>
          </div>
        ))}
      </div>
      <div>
        <h1>{myScore}</h1>
        <button disabled={disabled} onClick={() => pressedButton()}>
          Click Me
        </button>
      </div>
    </>
  );
}
