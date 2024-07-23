import PropTypes from "prop-types";
import { useEffect, useContext, useState } from "react";
import UserContext from "../UserContext";
import { socket } from "../../socket";

ButtonPress.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  changeGameData: PropTypes.func,
};

export default function ButtonPress({ roomID, gameData, changeGameData }) {
  const [timer, setTimer] = useState("");
  const [score, setScore] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const { username } = useContext(UserContext);

  const pressedButton = () => {
    setScore((score) => score + 1);
    socket.emit("pressed-button", roomID, username, score);
  };

  useEffect(() => {
    const updateTimer = (time) => {
      setTimer(time);
    };

    const disableGame = () => {
      setDisabled(true);
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
      {Object.entries(gameData).map(([player, score], i) => (
        <div key={i}>
          <h1>{player}</h1>
          <p>{score}</p>
        </div>
      ))}
      <div>
        <button onClick={() => pressedButton()}>Click Me</button>
      </div>
    </>
  );
}
