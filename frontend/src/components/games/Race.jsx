import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import PropTypes from "prop-types";
import squirtleMain from "./sprites/squirtleMain.gif";
import squirtle1 from "./sprites/squirtle-1.png";
import squirtle2 from "./sprites/squirtle-2.png";

Race.propTypes = {
  gameData: PropTypes.object,
};

export default function Race({ gameData }) {
  const [isNamed, setIsNamed] = useState(false);

  return (
    <section>
      {!isNamed ? (
        <div className="squirtle-sprite" >
          <h2>Name your squirtle</h2>
          <img
            src={squirtleMain}
            alt="Squirtle Sprite"
            height={"100px"}
            className="squirtle-sprite"
          />
          <div>
            <input type="text" />
            <button onClick={setIsNamed(true)}>Done</button>
          </div>
        </div>
      ) : (
        <div>
          <Squirtle />
        </div>
      )}
    </section>
  );
}

const Squirtle = ({ name, speed }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame === 0 ? 1 : 0));
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  const springs = useSpring({
    opacity: frame === 0 ? 1 : 0,
    config: { duration: speed },
  });

  return (
    <div className="squirtle-sprite" style={{ position: 'relative', width: '100px', height: '100px' }}>
      <animated.img
        src={squirtle1}
        style={{
          position: "absolute",
          width: '100%',
          height: '100%',
          ...springs,
        }}
      />
      <animated.img
        src={squirtle2}
        style={{
          position: "absolute",
          width: '100%',
          height: '100%',
          opacity: springs.opacity.to((op) => 1 - op),
        }}
      />
    </div>
  );
};
