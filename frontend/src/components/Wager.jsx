import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { socket } from "../socket";

Wager.propTypes = {
  roomID: PropTypes.string,
  isPartyLeader: PropTypes.bool,
};

export default function Wager({ roomID }) {
  const [wager, setWager] = useState(0);
  const [warning, setWarning] = useState(null);
  const [doneWagering, setDoneWagering] = useState(false);

  const handleIncrement = () => {
    setWager((prevWager) => prevWager + 1);
  };

  const handleDecrement = () => {
    setWager((prevWager) => (prevWager > 0 ? prevWager - 1 : 0));
  };

  useEffect(() => {
    const handleWarning = () => {
      setWarning(warning);
    };

    socket.on("warning", handleWarning);

    return () => {
      socket.off("warning", handleWarning);
    };
  }, [warning]);

  const handleWager = () => {
    if (wager === null || isNaN(wager) || wager <= 0) {
      setWarning("Please enter a valid number of drinks.");
      return;
    }
    placeWager();
    setWager(0);
    setDoneWagering(true);
  };

  const placeWager = () => {
    socket.emit("place-wager", roomID, wager);
    console.log("wager", wager);
  };

  return (
    <section>
      {doneWagering ? (
        <div>Waiting for other players...</div>
      ) : (
        <div>
          <h2>How many drinks do you wager?</h2>
          <div>
            <button onClick={handleDecrement}>-</button>
            <input
              type="number"
              value={wager}
              onChange={(e) => {
                setWager(e.target.value);
                setWarning(null);
              }}
              readOnly
              placeholder="Enter number of drinks"
            />
            <button onClick={handleIncrement}>+</button>
          </div>
          <button onClick={handleWager}>Place Wager</button>
          {warning && <div className="warning">{warning}</div>}
        </div>
      )}
    </section>
  );
}
