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
  // Filter done: boolean property, otherwise would always be false
  const allDrinksGiven = Object.entries(votingData)
    .filter(([_name, value]) => typeof value === "object")
    .every(([_name, player]) => player.drinksToGive <= 0);

  
  if (allDrinksGiven) {
    //Add done:true property
    votingData = {
      ...votingData,
      done: true,
    };
    await setVotingData(roomID, votingData);
    io.to(roomID).emit("all-drinks-given", votingData);
  }
};

const handleStartTriviaVoting = async (
  io,
  roomID,
  votingData,
  allPlayersIncorrect,
) => {
  if (allPlayersIncorrect) {
    Object.values(votingData).forEach((player) => {
      player.message = "You all got the question wrong lol";
    });
    // Change state to voting, done means no player needs to give out drinks
    votingData = {
      ...votingData,
      done: true,
    };
    await setVotingData(roomID, votingData);
    io.to(roomID).emit("start-voting", votingData);
    io.to(roomID).emit("all-drinks-given", votingData);
  } else if (
    Object.values(votingData).every((player) => player.drinksToGive <= 0)
  ) {
    Object.values(votingData).forEach((player) => {
      // Checks for players who joined late and could not wager
      if (player.correct) {
        player.message = "You were correct but you didn't place a wager";
      }
    });
    votingData = {
      ...votingData,
      done: true,
    };
    await setVotingData(roomID, votingData);
    io.to(roomID).emit("start-voting", votingData);
    io.to(roomID).emit("all-drinks-given", votingData);
  } else {
    // Change state to voting, !done means players willl give out drinks
    votingData = {
      ...votingData,
      done: false,
    };
    await setVotingData(roomID, votingData);

    io.to(roomID).emit("start-voting", votingData);
    setVotingData(roomID, votingData);
  }
};

const handleRaceWinnerVoting = (io, roomID, votingData) => {
  io.to(roomID).emit("start-voting", votingData);
  setVotingData(roomID, votingData);
};

const handlePotatoWinnerVoting = handleRaceWinnerVoting;

const handleButtonPressVoting = handleRaceWinnerVoting;

module.exports = {
  setVotingData,
  giveDrink,
  handleStartTriviaVoting,
  handleRaceWinnerVoting,
  handlePotatoWinnerVoting,
  handleButtonPressVoting,
};
