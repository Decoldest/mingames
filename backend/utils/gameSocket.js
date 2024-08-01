const Room = require("../models/room");
const Player = require("../models/player");
const { setNextTriviaQuestion } = require("./triviaSocket");

const handleAfterVotingDone = async (socket, io, roomID) => {
  //Send updated state to continue current game
  const continueGame = (state) => {
    io.to(roomID).emit("update-game", state);
  };

  //Send updated state to end current game
  const endGame = async () => {
    await Room.findOneAndUpdate(
      { code: roomID },
      {
        $set: {
          "state.waiting": false,
          "state.playing": true,
          "state.selectedGame": null,
          "state.gameData": null,
          "state.votingData": null,
          "state.isWagering": false,
          "state.waitingMessage": "",
        },
      },
    );

    io.to(roomID).emit("end-game");
  };
  //Reset the player's wager to 0
  await Player.findOneAndUpdate(
    {
      socketID: socket.id,
    },
    { wager: -1 },
  );

  const room = await Room.findOne({ code: roomID }).populate("players");

  //Check if all ready and set next question state if truthy
  const allPlayersReady = room.players.every((player) => player.wager === -1);
  const { selectedGame } = room.state;

  if (allPlayersReady) {
    console.log("All players are done drinking");
    switch (selectedGame) {
      case "Trivia":
        await setNextTriviaQuestion(room, continueGame, endGame);
        break;
      case "Race":
        //End game since nothing left to do
        endGame();
        break;
      case "Hot Potato":
        endGame();
        break;
      case "Button Press":
        endGame();
        break;
    }
  }
};

const handlePlayerJoiningLate = async (room, username) => {
  const { selectedGame, gameData, votingData } = room.state;
  let addedGameData;
  let addedVotingData = null;

  if (selectedGame === "Hot Potato") {
    addedGameData = { [username]: { hasPotato: false } };
  } else if (selectedGame === "Button Press") {
    addedGameData = { [username]: 0 };
  }

  room.state.gameData = {
    ...gameData,
    ...addedGameData,
  };

  if (votingData !== null) {
    addedVotingData = {
      [username]: {
        drinksToGive: 0,
        myDrinks: 0,
        correct: false,
        message: "You joined late",
      },
    };
    room.state.votingData = {
      ...votingData,
      ...addedVotingData,
    };
  }

  await room.save();
  return { state: room.state, addedGameData, addedVotingData };
};

module.exports = {
  handleAfterVotingDone,
  handlePlayerJoiningLate,
};
