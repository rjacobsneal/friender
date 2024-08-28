import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import your AuthContext
import './NavigationBar.css';

function NavigationBar() {
  const { logout } = useAuth(); // Get the logout function from AuthContext
  const handleLogout = () => {
    console.log("logout")
    logout(); // Call the logout function to clear the authentication state
  };

  return (
    <div className="nav-bar">
      <NavLink className="nav-bar-button" to="/App" activeClassName="active">Swipe</NavLink>
      <NavLink className="nav-bar-button" to="/FriendRecs" activeClassName="active">Friend Recs</NavLink>
      <NavLink className="nav-bar-button" to="/Matches" activeClassName="active">Matches</NavLink>
      <NavLink className="nav-bar-button" to="/Friends" activeClassName="active">Friends</NavLink>
      <NavLink onClick={handleLogout} className="nav-bar-button" to="/" activeClassName="active">Log Out</NavLink>
    </div>
  );
}

export default NavigationBar;
