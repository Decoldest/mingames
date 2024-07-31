import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { socket } from "../socket";
import beer from "../assets/beer.png";
import wine from "../assets/wine.png";
import soju from "../assets/soju.png";
import mixed from "../assets/mixed-drink.png";
import cocktail from "../assets/cocktail.png";
import vodka from "../assets/vodka.png";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";

const drinkImages = [beer, wine, soju, mixed, cocktail, vodka];

Wager.propTypes = {
  roomID: PropTypes.string,
  isPartyLeader: PropTypes.bool,
};

export default function Wager({ roomID }) {
  const [wager, setWager] = useState(0);
  const [warning, setWarning] = useState(null);
  const [doneWagering, setDoneWagering] = useState(false);
  const [selectedDrinks, setSelectedDrinks] = useState([]);

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

  useEffect(() => {
    if (wager > selectedDrinks.length) {
      const newDrink = drinkImages[getRandomInt(0, drinkImages.length)];
      setSelectedDrinks((prevDrinks) => [...prevDrinks, newDrink]);
    } else if (wager < selectedDrinks.length) {
      setSelectedDrinks((prevDrinks) => prevDrinks.slice(0, wager));
    }
  }, [wager, selectedDrinks.length]);

  const handleWager = () => {
    if (wager === null || isNaN(wager) || wager < 0) {
      setWarning("Please enter a valid number of drinks.");
      return;
    }
    placeWager();
    setWager(0);
    setDoneWagering(true);
  };

  const placeWager = () => {
    socket.emit("place-wager", roomID, wager);
  };

  return (
    <section className="wager-container">
      {doneWagering ? (
        <h2>Waiting for other players...</h2>
      ) : (
        <div>
          <h2>How many drinks do you wager?</h2>
          <div className="wager-buttons-container">
            <button onClick={handleDecrement} className="wager-button">
              <FaCircleMinus color="white" size={30}/>
            </button>
            <input
              type="number"
              value={wager}
              onChange={(e) => {
                setWager(e.target.value);
                setWarning(null);
              }}
              readOnly
              placeholder="Enter number of drinks"
              className="my-6"
            />
            <button onClick={handleIncrement} className="wager-button">
              <FaCirclePlus color="white" size={30}/>
            </button>
          </div>
          <button onClick={handleWager} className="game-button">
            Place Wager
          </button>
          <div className="drinks-grid">
            {selectedDrinks.map((drink, i) => (
              <img
                className="drink-item"
                key={i}
                src={drink}
                alt="Drink Image"
              />
            ))}
          </div>
          {warning && <div className="warning">{warning}</div>}
        </div>
      )}
    </section>
  );
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
