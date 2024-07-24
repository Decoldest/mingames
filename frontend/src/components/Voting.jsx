import { useState, useEffect, useContext } from "react";
import UserContext from "./UserContext";
import PropTypes from "prop-types";
import { socket } from "../socket";

Voting.propTypes = {
  votingData: PropTypes.object,
  roomID: PropTypes.string,
  setVotingData: PropTypes.func,
  doneVotingPhase: PropTypes.func,
};

export default function Voting({
  votingData,
  roomID,
  setVotingData,
  doneVotingPhase,
}) {
  const [drinksToGive, setDrinksToGive] = useState(0);
  const [warning, setWarning] = useState(null);
  const [votingResults, setVotingResults] = useState(-1);
  const { username } = useContext(UserContext);
  const [isDoneDrinking, setIsDoneDrinking] = useState(false);

  useEffect(() => {
    //Set the current user's drinks to give
    setDrinksToGive(votingData[username].drinksToGive || 0);

    const handleWarning = () => {
      setWarning(warning);
    };

    const updateVotingData = (votingData) => {
      setVotingData(votingData);
    };

    const allocateDrinks = (votingData) => {
      setVotingResults(votingData[username]?.myDrinks);
    };

    socket.on("warning", handleWarning);
    socket.on("update-voting-data", updateVotingData);
    socket.on("all-drinks-given", allocateDrinks);

    return () => {
      socket.off("warning", handleWarning);
      socket.off("update-voting-data", updateVotingData);
      socket.off("all-drinks-given", allocateDrinks);
    };
  }, [warning, votingData, username, votingResults, setVotingData]);

  const addDrink = (name) => {
    //Emit drink adding - username is sender, name is receiver
    socket.emit("add-drink", roomID, username, name);
  };

  return (
    <section>
      <div>{votingData[username].message}</div>
      {votingResults >= 0 ? (
        <div>
          <h1>
            You take {votingResults} {votingResults == 1 ? `drink` : `drinks`}
          </h1>
          <h1>
            {votingResults === 0
              ? `You got lucky this time`
              : `Please drink responsibly`}
          </h1>
          <button
            onClick={() => {
              doneVotingPhase();
              setIsDoneDrinking(true);
            }}
            disabled={isDoneDrinking}
          >
            Done Drinking
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
