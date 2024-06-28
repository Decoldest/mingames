import { createContext, useState } from "react";
const UserContext = createContext();
import PropTypes from "prop-types";

UserProvider.propTypes = {
  children: PropTypes.node
};

export function UserProvider({ children }) {
  const [username, setUsername] = useState("");
  return (
    <UserContext.Provider value={{username, setUsername}}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
