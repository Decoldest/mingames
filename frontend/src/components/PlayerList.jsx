import PropTypes from "prop-types";
import crown from "../assets/crown.png";
 
PlayerList.propTypes = {
  players: PropTypes.array,
};

export default function PlayerList({ players }) {
  return (
    <div className="players-container mt-10">
      <h2>Players</h2>
      <div className="username-grid">
        {players.map((player) => (
          <div key={player._id} className="username">
            {player.isPartyLeader && (
              <div>
                <img src={crown} alt="Crown Icon" />
              </div>
            )}
            <p>{player.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
