import { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import squirtleMain from "./phaser/squirtleMain.gif";
import { socket } from "../../socket";
import UserContext from "../UserContext";
import SquirtleRace from "./phaser/SquirtleRace";

Race.propTypes = {
  gameData: PropTypes.object,
  roomID: PropTypes.string,
  waitingMessage: PropTypes.string,
  setWaitingMessage: PropTypes.func,
};

export default function Race({
  gameData,
  roomID,
  waitingMessage,
  setWaitingMessage,
}) {
  const [isNamed, setIsNamed] = useState(false);
  const [name, setName] = useState("");
  const { username } = useContext(UserContext);

  useEffect(() => {
    console.log(gameData);
    const handleAllSquirtlesIn = () => {
      setIsNamed(true);
    };
    socket.on("squirtle-squad-in", handleAllSquirtlesIn);

    return () => {
      socket.off("squirtle-squad-in", handleAllSquirtlesIn);
    };
  }, [gameData]);

  const submitSquirtleName = () => {
    socket.emit("add-squirtle", name, username, roomID, (response) => {
      setWaitingMessage(response.message);
    });
  };

  return (
    <section>
      {!gameData? (
        <div className="squirtle-sprite">
          <h2>Name your squirtle</h2>
          <img
            src={squirtleMain}
            alt="Squirtle Sprite"
            height={"100px"}
            className="squirtle-sprite"
          />
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setWaitingMessage("");
              }}
            />
            <button onClick={() => submitSquirtleName()}>Done</button>
          </div>
          {waitingMessage && <h2>{waitingMessage}</h2>}
        </div>
      ) : (
        <SquirtleRace
          gameData={gameData}
        />
      )}
    </section>
  );
}
