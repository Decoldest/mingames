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
  const [drinksToGive, setDrinksToGive] = useState(0);
  const [warning, setWarning] = useState(null);
  const { username } = useContext(UserContext);

  useEffect(() => {
    //Set the current user's drinks to give
    setDrinksToGive(votingData[username].drinksToGive);

    const handleWarning = () => {
      setWarning(warning);
    };

    const updateVotingData = (votingData) => {
      setVotingData(votingData);
    };

    socket.on("warning", handleWarning);
    socket.on("update-voting-data", updateVotingData);

    return () => {
      socket.off("warning", handleWarning);
      socket.off("update-voting-data", updateVotingData);
    };
  }, [warning, votingData, username, setVotingData]);

  const addDrink = (name) => {
    //Emit drink adding - username is sender, name is receiver
    socket.emit("add-drink", roomID, username, name);
  };

  return (
    <section>
      <div className="flex gap-4">
        {Object.entries(votingData).map(([name, drinks], i) => (
          <div key={i} className="flex-column">
            <h2>{name}</h2>
            <h5>{drinks.myDrinks}</h5>
            {name !== username && drinksToGive > 0 && (
              <button
                onClick={() => {
                  addDrink(name);
                }}
              >
                Give Drink
              </button>
            )}
          </div>
        ))}
        {warning && <div className="warning">{warning}</div>}
      </div>
      <div>
        {drinksToGive} {drinksToGive == 1 ? `Drink` : `Drinks`} To Give
      </div>
    </section>
  );
}
