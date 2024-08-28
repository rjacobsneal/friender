import "./Matches.css";
import React, { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";

function NavBarButton({ label, onClick }) {
  return (
    <div className="nav-bar-button" onClick={onClick}>
      {label}
    </div>
  );
}

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const startChat = (id) => {
    // Implement logic to start a chat with the user based on their ID
    console.log(`Start chat with user ${id}`);
  };
  useEffect(() => {
    const fetchMatches =  async() => {
      try {
        const response =  await fetch(
          
          `http://localhost:3001/get_matches`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Received data:", data);
        
        setMatches(data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchMatches();
  }, []);
  return (
    //<div class="searchable-friends-page">
    <div class="matches-page">
      <h1>Matches</h1>
      <NavigationBar />
      {loading ? (
        <p>Loading...</p> ) : 
        matches.length === 0 ? (
        <p>No matches yet! Get swiping...</p>
      ) : (
        <div className="matches-container">
          {matches.map((profile, index) => (
            <div
              key={index}
              className="match-card"
              // onClick={() => startChat(profile.id)}
            >
              <img
                src={`/imgs/${profile.ID}.jpg`}
                alt="profile photo"
                onError={(e) => {
                  e.target.src = "/imgs/blank.webp";
                }}></img>
              {/* <img src={profile.photo} alt={profile.name} /> */}
              <div className="card-info">
                {/* <p className="profile-name">{profile.name}</p> */}
                <p className="profile-info">
                <p className="profile-name">Name: {profile.Name}</p>
                <p> Age: {profile.Age} </p>
                <p> Favorite Foods: {profile["Favorite Foods"]} </p>  
                <p> Favorite Movie Genres: {profile["Favorite Movie Genres"]} </p>  
                <p> Hobbies: {profile["Hobbies"]} </p>  
                <p> Socials: {profile.Socials} </p>  
                <p> State Of Origin: {profile["State of Origin"]} </p>  
                <p>  University: {profile.University} </p> 
                  </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Matches;