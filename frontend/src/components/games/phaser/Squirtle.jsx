import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import squirtle1 from "./squirtle-1.png";
import squirtle2 from "./squirtle-2.png";

Squirtle.propTypes = {
  name: PropTypes.string,
  speed: PropTypes.number,
};

export default function Squirtle({ name, speed }) {



  return (
    <div
      className="squirtle-sprite squirtle-animated"
    >
      
    </div>
  );
}
