import { useState } from "react";
import PropTypes from "prop-types";
import squirtleMain from "./sprites/squirtleMain.png";

Race.propTypes = {
  gameData: PropTypes.object,
};

export default function Race({ gameData }) {
  const [isNamed, setIsNamed] = useState(false);

  return (
    <section>
      {!isNamed ? (
        <div>
          <h2>Name your squirtle.</h2>
          <img src={squirtleMain} alt="Squirtle Sprite" />
          <input type="text" />
          <button></button>
        </div>
      ) : (
        <div></div>
      )}
    </section>
  );
}
