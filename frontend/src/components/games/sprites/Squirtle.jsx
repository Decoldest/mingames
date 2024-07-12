import { useEffect, useState } from "react";
import { animated } from "@react-spring/web";
import PropTypes from "prop-types";
import squirtle1 from "./squirtle-1.png";
import squirtle2 from "./squirtle-2.png";

Squirtle.propTypes = {
  name: PropTypes.string,
  speed: PropTypes.number,
};

export default function Squirtle({ name, speed }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prevFrame) => (prevFrame === 0 ? 1 : 0));
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div
      className="squirtle-sprite squirtle-animated"
    >
      <animated.img
        src={squirtle1}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: frame === 0 ? 1 : 0,
        }}
      />
      <animated.img
        src={squirtle2}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: frame === 1 ? 1 : 0,
        }}
      />
    </div>
  );
}
