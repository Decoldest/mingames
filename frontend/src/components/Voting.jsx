import { useState, useEffect, useContext } from "react";
import UserContext from "./UserContext";
import PropTypes from "prop-types";
import { socket } from "../socket";

Voting.propTypes = {
  votingData: PropTypes.object,
  roomID: PropTypes.string,
  setVotingData: PropTypes.func,
};

export default function Voting({ votingData, roomID, setVotingData }) {
  const [vote, setVote] = useState(0);
  const [warning, setWarning] = useState(null);
  const [doneVoting, setDoneVoting] = useState(false);
  const { username } = useContext(UserContext);

  const handleIncrement = () => {
    setVote((prevWager) => prevWager + 1);
  };

  const handleDecrement = () => {
    setVote((prevWager) => (prevWager > 0 ? prevWager - 1 : 0));
  };

  useEffect(() => {
    console.log(votingData);
    const handleWarning = () => {
      setWarning(warning);
    };

    socket.on("warning", handleWarning);

    return () => {
      socket.off("warning", handleWarning);
    };
  }, [warning, votingData]);

  const addDrink = (name, amount) => {
    socket.emit("add-drink", roomID, name, amount);
  };

  return (
    <section>
      <div>
        {Object.entries(votingData).map(([name, drinks], i) => (
          <div key={i}>
            <h2>{name}</h2>
            <h5>{drinks.myDrinks}</h5>
            {name !== username && votingData[username].drinksToGive > 0 && (
              <button onClick={() => addDrink(name, 1)}>Give Drink</button>
            )}
          </div>
        ))}
        {warning && <div className="warning">{warning}</div>}
      </div>
    </section>
  );
}
