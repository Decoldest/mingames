import { socket } from "../../socket";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

Trivia.propTypes = {
  gameData: PropTypes.object,
  round: PropTypes.number,
};
export default function Trivia({ gameData }) {
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    const { triviaData } = gameData;
    const { correct_answer } =
      triviaData[gameData.round].correct_answer;
    const { incorrect_answers } =
      triviaData[gameData.round].incorrect_answers;

    console.log(correct_answer);
    console.log([correct_answer]+incorrect_answers);
    setChoices(triviaData);

    console.log(triviaData);
  }, [gameData]);
  return <div>Round {gameData.round}/5</div>;
}

function getSingleQuestionAndShuffle(arr1, arr2) {
  return arr1 + arr2;
}
