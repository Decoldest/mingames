import { useState } from "react";
import PropTypes from "prop-types";
import squirtleMain from "./sprites/squirtleMain.gif";
import Squirtle from "./sprites/Squirtle"


Race.propTypes = {
  gameData: PropTypes.object,
};

export default function Race({ gameData }) {
  const [isNamed, setIsNamed] = useState(false);

  return (
    <section>
      {!isNamed ? (
        <div className="squirtle-sprite">
          <h2>Name your squirtle</h2>
          <img
            src={squirtleMain}
            alt="Squirtle Sprite"
            height={"100px"}
            className="squirtle-sprite"
          />
          <div>
            <input type="text" />
            <button onClick={() => setIsNamed(true)}>Done</button>
          </div>
        </div>
      ) : (
        <div>
          <Squirtle speed={220} />
        </div>
      )}
    </section>
  );
}
