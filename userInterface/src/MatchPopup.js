import "./App.css";
import React, { useEffect, useState } from "react";

  function MatchPopup({ showPopup, handleDismiss, userId}) {

    const [userInfo, setUserInfo] = useState(null);
    useEffect(() => {
      
      const fetchUserInfo = async() => {
        try { 
            const response = await fetch (`http://localhost:3001/get_user_info/${userId}`, {
            method: 'POST'
        })
        console.log("get_user_info function called with data:", userId);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setUserInfo(data);
          return data;
          
        }
        catch(error) {
            console.error('Error:', error);
            setUserInfo(null);
            return null;
        }
      };
      if (showPopup){
        fetchUserInfo();
      }
    }, [showPopup, userId]);
          
    
    
  
    return (
        <div className={`friends-popup ${showPopup ? 'visible' : ''}`}>
            <h3>Congrats! Its a Match</h3>
            {userInfo && (
              <div>
                <img
                src={`/imgs/${userInfo.ID}.jpg`}
                alt="profile photo"
                onError={(e) => {
                  e.target.src = "/imgs/blank.webp";
                }}></img>
                {/* CHANGE */}
                <p>You matched with: {userInfo.Name}</p>
                <p>Information:</p>
                <ul>
                  <li>Name: {userInfo.Name}</li>
                  <li>Age: {userInfo.Age}</li>
                  <li>University: {userInfo.University}</li>
                  <li>State of Origin: {userInfo["State of Origin"]}</li>
                </ul>
                </div>
            )}
                <button onClick={handleDismiss}>dismiss</button>
                </div>
            );

            
            
 }     
  
  export default MatchPopup;