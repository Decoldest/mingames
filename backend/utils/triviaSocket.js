const Player = require("../models/player");
const Room = require("../models/room");
const { handleStartVoting } = require("./votingSocket");

const maxRound = 4;

const sendTriviaQuestions = async (io, roomID) => {
  try {
    console.log("getting trivia data");
    const response = await fetch(
      "https://opentdb.com/api.php?amount=5&type-multiple",
      {
        mode: "cors",
      },
    );
    const data = await response.json();
    const round = 0;

    //Update database game data
    await Room.findOneAndUpdate(
      {
        code: roomID,
      },
      { $set: { "state.gameData": { triviaData: data, round } } },
    );

    //Send trivia data to everyone in the room
    io.to(roomID).emit("game-data", { triviaData: data, round: round });
  } catch (error) {
    console.error("Error fetching trivia question: ", error);
  }
};

const handleTriviaAnswers = async (socket, correctAnswer, choice) => {
  try {
    await Player.findOneAndUpdate(
      {
        socketID: socket.id,
      },
      { wonBet: choice === correctAnswer },
      { new: true },
    );
  } catch (error) {
    console.log("Error setting trivia result: ", error);
  }
};

const setNextTriviaQuestion = async (room, continueGame, endGame) => {
  try {
    const round = room.state.gameData.round;
    if (round >= maxRound) {
      //Call end game function from gameSocket
      endGame();
      return;
    }
    // Update the room state
    room.state = {
      ...room.state,
      gameData: {
        ...room.state.gameData,
        round: round + 1,
      },
      votingData: null,
      isWagering: true,
    };

    await room.save();

    //Emit updated round to client in gameSocket function
    continueGame(room.state);
  } catch (error) {
    console.log("Error changing round: ", error);
    throw error;
  }
};

const triviaAnswered = async (socket, io, roomID, correctAnswer, choice) => {
  await handleTriviaAnswers(socket, correctAnswer, choice);

  //Check if the every player answered, then send voting data
  const room = await Room.findOne({ code: roomID }).populate("players");

  const allPlayersAnswered = room.players.every(
    (player) => player.wonBet !== null,
  );

  //Go through each player and add drink data
  if (allPlayersAnswered) {
    const drinkData = {};

    room.players.forEach(async (player) => {
      // Check if the player has a wonBet property (player could have joined late)
      if (player.wonBet === null) {
        drinkData[player.username] = {
          drinksToGive: 0,
          myDrinks: 0,
          correct: false,
          message: "You were lucky you didn't answer",
        };
      } else {
        if (player.wonBet) {
          drinkData[player.username] = {
            drinksToGive: Number(player.wager),
            myDrinks: 0,
            correct: true,
            message: "You were Correct! LFGGGG!",
          };
        } else {
          drinkData[player.username] = {
            drinksToGive: 0,
            myDrinks: Number(player.wager),
            correct: false,
            message: "You were incorrect! Get better bud!",
          };
        }

        // Reset wonBet property
        player.wonBet = null;
        await player.save();
      }
    });
    handleStartVoting(io, roomID, drinkData);
  }
};

module.exports = {
  sendTriviaQuestions,
  handleTriviaAnswers,
  setNextTriviaQuestion,
  triviaAnswered,
};
