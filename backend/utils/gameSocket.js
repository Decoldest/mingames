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
    { wager: 0 },
  );

  const room = await Room.findOne({ code: roomID }).populate("players");

  //Check if all ready and set next question state if truthy
  const allPlayersReady = room.players.every((player) => player.wager === 0);
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
  const { selectedGame, gameData } = room.state;
  let addedData;

  if (selectedGame === "Hot Potato") {
    addedData = { [username]: { hasPotato: false } };
  } else if (selectedGame === "Button Press") {
    addedData = { [username]: 0 };
  }

  room.state.gameData = {
    ...gameData,
    ...addedData,
  };

  await room.save();
  return { state: room.state, addedData };
};

module.exports = {
  handleAfterVotingDone,
  handlePlayerJoiningLate,
};
