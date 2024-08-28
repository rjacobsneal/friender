import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogIn from './LogIn';
import SignUp from './SignUp';
import SwipePopup from "./SwipePopup";
import MatchPopup from "./MatchPopup";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavigationBar from "./NavigationBar";

function YesButton({ onYesClick }) {
  return (
    <div className="yes-button" onClick={onYesClick}>
      Yes
    </div>
  );
}

function NoButton({ onNoClick }) {
  return (
    <div className="no-button" onClick={onNoClick}>
      No
    </div>
  );
}

function Profile({ profileData, offsetX, usernameFromState}) {
  const profileStyle = {
    transform: `translateX(${offsetX}px)`,
    transition: "transform 0.3s ease",
  };
  /*
  if (typeof profileData === "object") {
    // If profileData is a string, try to parse it as JSON
    try {
      const parsedData = JSON.parse(profileData);
*/
      // Check if the parsed data is an object
      const parsedData = profileData;
      if (profileData && typeof parsedData === "object") {
        return (
          <div className="profile" style={profileStyle}>
            {parsedData.ID && (
              <img
                src={`/imgs/${parsedData.ID}.jpg`}
                alt="profile photo"
                onError={(e) => {
                  e.target.src = "/imgs/blank.webp";
                }}
              />
            )}
            <p className="field-label">
              Name: <span className="field-value">{parsedData.Name}</span>
            </p>
            <p className="field-label">
              Age: <span className="field-value">{parsedData.Age}</span>
            </p>
            <p className="field-label">
              Hobbies: <span className="field-value">{parsedData.Hobbies}</span>
            </p>
            <p className="field-label">
              University:{" "}
              <span className="field-value">{parsedData.University}</span>
            </p>
            <p className="field-label">
              State of Origin:{" "}
              <span className="field-value">
                {parsedData["State of Origin"]}
              </span>
            </p>
            <p className="field-label">
              Favorite Foods:{" "}
              <span className="field-value">
                {parsedData["Favorite Foods"]}
              </span>
            </p>
            <p className="field-label">
              Favorite Movie Genres:{" "}
              <span className="field-value">
                {parsedData["Favorite Movie Genres"]}
              </span>
            </p>
          </div>
        );
      }
    } 

function ProfileField({ label, value }) {
  return (
    <p className="field-label">
      {label}: <span className="field-value">{value}</span>
    </p>
  );
}

function App() {
  const [dragStartX, setDragStartX] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [delayPopup, setDelayPopup] = useState(false);
  const MIN_DRAG_DISTANCE = window.innerWidth / 5;
  const profileContainerWidth = window.innerWidth;
  const [swipe, set_swipe] = useState(null);
  // const [match, get_whether_users_match] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const setUserId = (userId) => {
    setLoggedInUserId(userId);
  };
  const location = useLocation();
  const usernameFromState = location.state && location.state.username;
  const handleSwipe = (swipeType) =>
  {
    const newOffsetX = swipeType === 1? profileContainerWidth : -profileContainerWidth;
    setOffsetX(newOffsetX)
    fetch(`http://localhost:3001/set_swipe/${information.ID}/${swipeType}`, {
      method: 'POST'
    })
    
    .catch(error => {
      console.error('Error:', error);
    });
  
   // this would be if you are sending the userId of the person you are swiping on
    
    console.log("set_swipe function called with data:", information.ID, swipeType);
    
  };

  const handleRecomend = (list_of_recipient_ids) => {
    fetch(`http://localhost:3001/make_recommendations/${information.ID}/${list_of_recipient_ids}`, {
        method: 'POST'
      })
      
      .catch(error => {
        console.error('Error:', error);
      });
      console.log("make_recommendations function called with data:", information.ID, " + ", {list_of_recipient_ids});
  }
  // Function to handle sending the profile to friends
  const handleSendToFriends = (friendId) => {
    // Implement logic to send the profile to selected friends
    console.log("Sending profile to friends:", friendId);
    handleRecomend(friendId);
    // setSendButtonPressed(true);
    setDelayPopup(false);
    // wait until end of transform
    setTimeout(() => {togglePopup();
    setIsTransitioning(false);}, 500);
  };


  const [match, setMatch] = useState('0');
  const [matchPopup, setMatchPopup] = useState(false);
  const [delayMatchPopup, setDelayMatchPopup] = useState(false);

  const fetchMatchStatus = async (userID) => {
    try {
      const response = await fetch(`http://localhost:3001/get_whether_users_match/${userID}`, {
        method: 'POST',
        // Add any additional headers or body if required
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      console.log("Match data received from the server:", data);
  
      if (data !== undefined) {
        return data;
      } else {
        console.error("Received unexpected data:", data);
        return null;
      }
    } catch (error) {
      console.error("Error in fetchMatchStatus:", error);
      throw error;
    }
  };

  const handleMatch = () => {
    setDelayPopup(false);
    setMatch('0');
    setTimeout(() => {togglePopup();
      setMatchPopup(true);}, 500);
  };

  const handleDismissMatch = () => {
    setDelayMatchPopup(false);
    setMatch('0');
    setTimeout(() => {setMatchPopup(false);
      setIsTransitioning(false);
      }, 500);
  };

  const handleSelfSwipe = async (userId) => {
    try {
      let matchl = await fetchMatchStatus(userId);
      setDelayPopup(false);
        
      handleSwipe(1);
  
      if (matchl === 0 || matchl === '0') {
        // wait until end of transform
        setTimeout(() => { togglePopup(); setIsTransitioning(false); }, 500);
      } else {
        setDelayMatchPopup(true);
        handleMatch();
      }
    } catch (error) {
      // Handle errors if any
      
      console.error("Error in handleSelfSwipe:", error);
    }
  };
  

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [newInfoList, setNewInfoList] = useState([
    { 
      UserProfile: 1,
      fields: {
        Name: "",
        Age: 0,
        Hobbies: "",
        University: "",
        "State of Origin": "",
        "Favorite Foods": "",
        "Favorite Movie Genres": "",
      },
    },
  ]);
  const [information, setInformation] = useState(newInfoList[currentIndex]);

  // when the app first loads, it calls the get_user_in_same_cluster functionand prints that
  useEffect(() => {
    console.log("Username from state:", usernameFromState);
    if (usernameFromState)
    {
      setLoggedInUserId(usernameFromState);
    }
    if (!isTransitioning) {
      // Fetch the first profile's data when the component mounts
      console.log(
        "Fetching data from:",
        "http://localhost:3001/get_user_in_same_cluster"
      );
      fetch("http://localhost:3001/get_user_in_same_cluster")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("data recieved from server", data);
          if (data) {
            console.log("collected data", data);
            setInformation(data);
            console.log("information", information);
            setOffsetX(0);
            setNewInfoList([{ UserProfile: data.user_info, fields: data }]);
          } else {
            // Handle cases where the received data is not as expected
            console.error("Received unexpected data:", data);
          }
        })
        .catch((error) => console.error("Error: ", error));
    }
  }, [isTransitioning]); // The empty dependency array ensures this effect runs only once when the component mounts

  const handleNoClick = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      const newOffsetX = -profileContainerWidth;
      
      setOffsetX(newOffsetX);
      // Add to user's "no swipe" history
      // Check if there's more information to display
      setTimeout(() => {
        
        fetch("http://localhost:3001/get_user_in_adjacent_cluster")
          .then((response) => response.json())
          .then((data) => {
            if (data) {
              setInformation(data);
              setIsTransitioning(false);
              handleSwipe(0);
              // setNewInfoList([{ UserProfile: data.user_info, fields: data }]);
            } else {
              // Handle cases where the received data is not as expected
              console.error("Received unexpected data:", data);
            }
          })
          .catch((error) => console.error("Error: ", error));
      }, 300);
    }
  };

  const handleYesClick = () => {
    if (!isTransitioning) {
      // animate the profile sliding off to the right
      setIsTransitioning(true);
      const newOffsetX = profileContainerWidth;
      setOffsetX(newOffsetX);
      // delay updating the index until the transition ends
      setTimeout(() => {
              togglePopup();
              
      }, 300);
    }
    setTimeout(() => {setDelayPopup(true);}, 320);
  };


  const handleDragStart = (e) => {
    setDragStartX(e.clientX);
  };

  const handleDragMove = (e) => {
    if (dragStartX !== null) {
      const dragX = e.clientX - dragStartX;
      setOffsetX(dragX);
    }
  };

  const handleDragEnd = (e) => {
    if (dragStartX) {
      const dragEndX = e.clientX;
      const deltaX = dragEndX - dragStartX;
      if (Math.abs(deltaX) > MIN_DRAG_DISTANCE) {
        // user dragged the profile beyond the threshold
        if (deltaX > 0) {
          handleYesClick();
        } else {
          handleNoClick();
        }
      } else {
        // profile wasn't dragged far enough; reset the offset
        setOffsetX(0);
      }
      setDragStartX(null);
    }
  };

  // {information.length > 0 && currentIndex < newInfoList.length ? (
  return (
    
        <div className="app" onMouseUp={handleDragEnd} onMouseMove={handleDragMove}>
      <header className="app-header">
        {information ? ( // check if theres profile data
          <div>
          {!showPopup && !matchPopup && (
            <div className="profile-button-container"
            onMouseDown={handleDragStart}>
            <NoButton onNoClick={handleNoClick} />
            <Profile profileData={information} offsetX={offsetX} loggedInUserId={loggedInUserId}/>
            <YesButton onYesClick={handleYesClick} />
          </div>
          )}
                  
          {showPopup && (
              <SwipePopup onSend={handleSendToFriends}
              onSelfSwipe={() => handleSelfSwipe(information.ID)}
              showPopup={delayPopup}
              userId ={information.ID}
              loggedinUserId= {loggedInUserId}/>
           )}

          {matchPopup && (
            <div>
              <MatchPopup showPopup={delayMatchPopup} handleDismiss={handleDismissMatch} userId = {information.ID}/>
            </div>
          )}

          </div>
        ) : (
          <p>No more profiles to display.</p>
        )}
        <input type="hidden" name="loggedInUserId" value={loggedInUserId} />
        <div>
      </div>
        <NavigationBar />
      </header>
    </div>
    
  );
}

export default App;