const Player = require("../models/player");
const Room = require("../models/room");

const setVotingData = async (roomID, votingData) => {
  await Room.findOneAndUpdate(
    {
      code: roomID,
    },
    { $set: { "state.votingData": votingData } },
  );
};

const giveDrink = async (io, roomID, giverName, receiverName) => {
  try {
    const room = await Room.findOne({ code: roomID });

    //Get drinkData state
    const votingData = room.state.votingData;

    if (votingData[giverName].drinksToGive > 0) {
      votingData[giverName].drinksToGive -= 1;
      votingData[receiverName].myDrinks += 1;

      // Save the updated voting data state
      await setVotingData(roomID, votingData);

      // Emit the updated voting data to the room
      io.to(roomID).emit("update-voting-data", votingData);
    }
    checkAllDrinksGiven(io, roomID, votingData);
  } catch (error) {
    console.error("Error giving drink:", error);
  }
};

const checkAllDrinksGiven = async (io, roomID, votingData) => {
  const allDrinksGiven = Object.values(votingData).every(
    (player) => player.drinksToGive === 0,
  );
  if (allDrinksGiven) {
    io.to(roomID).emit("all-drinks-given", votingData);
    try {
      await setVotingData(roomID, null);
    } catch (error) {
      console.error("Error resetting votingData:", error);
    }
  }
};

const handleStartVoting = (io, roomID, votingData) => {
  const allPlayersIncorrect = Object.values(votingData).every(
    (player) => player.correct === false,
  );

  if (allPlayersIncorrect) {
    Object.values(votingData).forEach((player) => {
      player.message = "You all got the question wrong lol";
    });
    // Change state to voting
    io.to(roomID).emit("start-voting", votingData);

    // Give out drinks immediately since no player can allocate any
    io.to(roomID).emit("all-drinks-given", votingData);
  } else if (
    Object.values(votingData).every((player) => player.drinksToGive === 0)
  ) {
    Object.values(votingData).forEach((player) => {
      // Checks for players who joined late and could not wager
      if (player.correct) {
        player.message = "You were correct but you didn't place a wager";
      }
    });
    io.to(roomID).emit("start-voting", votingData);
    io.to(roomID).emit("all-drinks-given", votingData);
  } else {
    io.to(roomID).emit("start-voting", votingData);
    setVotingData(roomID, votingData);
  }
};

const handleRaceWinnerVoting = (io, roomID, votingData) => {
  io.to(roomID).emit("start-voting", votingData);
  setVotingData(roomID, votingData);
};

const handlePotatoWinnerVoting = handleRaceWinnerVoting;

module.exports = {
  setVotingData,
  giveDrink,
  handleStartVoting,
  handleRaceWinnerVoting,
  handlePotatoWinnerVoting,
};
