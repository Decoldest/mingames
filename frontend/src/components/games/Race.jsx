import { useState, useContext, useEffect, useRef } from "react";
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
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const { username } = useContext(UserContext);
  const squirtleRaceRef = useRef(null);

  useEffect(() => {
    const handleAllSquirtlesIn = () => {
      setIsNamed(true);
    };
    socket.on("squirtle-squad-in", handleAllSquirtlesIn);

    return () => {
      socket.off("squirtle-squad-in", handleAllSquirtlesIn);
    };
  }, [gameData]);

  useEffect(() => {
    if (isNamed && squirtleRaceRef.current) {
      squirtleRaceRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isNamed]);

  const submitSquirtleName = () => {
    socket.emit("add-squirtle", name, username, roomID, (response) => {
      setWaitingMessage(response.message);
      if (response.success) {
        setIsInputDisabled(true);
      }
    });
  };

  return (
    <div className="race-container">
      {!isNamed ? (
        <div className="squirtle-sprite">
          <h1>Name Your Squirtle</h1>
          <div>
            <img
              src={squirtleMain}
              alt="Squirtle Sprite"
              height={"100px"}
              className="squirtle-sprite"
            />
          </div>
          <div className="squirtle-name">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setWaitingMessage("");
              }}
              disabled={isInputDisabled}
            />
            <button
              onClick={() => submitSquirtleName()}
              className="game-button"
            >
              Done
            </button>
          </div>
          <span>
            Note: On smaller screens the display will be rotated to landscape.
          </span>
          {waitingMessage && <h2>{waitingMessage}</h2>}
        </div>
      ) : (
        // Rotate on smaller screens
        <div className={"h-screen w-screen"} ref={squirtleRaceRef}>
          <SquirtleRace data={{ gameData, roomID }} />
        </div>
      )}
    </div>
  );
}
