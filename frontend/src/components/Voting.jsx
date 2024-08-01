import { useState, useEffect, useContext } from "react";
import UserContext from "./UserContext";
import PropTypes from "prop-types";
import { socket } from "../socket";
import holdingDrinkImage from "../assets/holding-glass.png";

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
    console.log(votingData);
    //Set the current user's drinks to give
    setDrinksToGive(votingData[username].drinksToGive || 0);

    const handleWarning = () => {
      setWarning(warning);
    };

    const updateVotingData = (votingData) => {
      setVotingData(votingData);
    };

    const allocateDrinks = (votingData) => {
      setVotingData(votingData);
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
    <div className="voting-container">
      <h2 className="self-center">
        {votingData[username] && votingData[username].message}
      </h2>
      {votingData.done ? (
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
            className="game-button"
          >
            Done Drinking
          </button>
        </div>
      ) : (
        <>
          <div className="voting-grid">
            {Object.entries(votingData).map(([name, drinks], i) => (
              typeof drinks === 'object' && (
                <div key={i} className="voting-player">
                  <h2>{name}</h2>
                  <h3>Drinks: {drinks.myDrinks}</h3>
                  <div className="holding-drink-container">
                    {Array.from({ length: drinks.myDrinks }, (_, i) => (
                      <img
                        key={i}
                        src={holdingDrinkImage}
                        alt="Holding Drink Icon"
                        id="holding-drink"
                      />
                    ))}
                  </div>
                  {name !== username && drinksToGive > 0 && (
                    <button
                      onClick={() => {
                        addDrink(name);
                      }}
                      className="game-button"
                    >
                      Give Drink
                    </button>
                  )}
                </div>
              )
            ))}
            {warning && <div className="warning">{warning}</div>}
          </div>
          <h2 className="self-center">
            {drinksToGive} {drinksToGive == 1 ? `Drink` : `Drinks`} To Give
          </h2>
        </>
      )}
    </div>
  );
}
