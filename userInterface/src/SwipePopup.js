import "./App.css";
import React, { useEffect, useState } from "react";

function SwipePopup({
  onClose,
  onSend,
  onSelfSwipe,
  showPopup,
  userId,
  loggedinUserId,
}) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [errormessage, setErrorMessage] = useState("");
  const convertToObjects = (data) => {
    const result = [];
    for (let i = 0; i < data.length; i += 2) {
      if (i % 2 === 0) {
        const [id, name] = data[i];
        result.push({ id: data[i].toString(), name: data[i + 1].toString() });
      }
    }
    return result;
  };
  const friendsList = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/get_who_user_can_share_recommendations_with`,
        {
          method: "POST",
        }
      );

      console.log("get_who_user_can_share_recommendations_with done");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Data: " + data);
      return data;
    } catch (error) {
      error("Error:", error);
      return [];
    }
  };
  // only shows first 15 profiles
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  const handleSearchChange = async (event) => {
    const searchValue = event.target.value.toLowerCase();
    console.log("searching for", searchValue);
    setSearchTerm(searchValue);

    // filter the profiles based on the search term
    try {
      const data = await friendsList();
      const filtered = data.filter((profile) =>
        profile[1].toLowerCase().includes(searchValue)
      );
      setFilteredProfiles(filtered);
    } catch (error) {
      console.error("Error retrieving friends:", error);
      setFilteredProfiles([]);
    }
  };

  const [swipe, set_swipe] = useState(null);
  const handleSwipe = (swipeType) => {
    fetch(`http://localhost:3001/set_swipe/${userId}/${swipeType}`, {
      method: "POST",
    }).catch((error) => {
      console.error("Error:", error);
    });

    // this would be if you are sending the userId of the person you are swiping on

    console.log("set_swipe function called with data:", userId, swipeType);
  };

  const handleMatch = () => {
    fetch(`http://localhost:3001/get_whether_users_match/${userId}`, {
      method: "POST",
    }).catch((error) => {
      console.error("Error:", error);
    });

    console.log("get_whether_users_match function called with data:", userId);
  };

  const handleCheckboxChange = (friendId) => {
    const isSelected = selectedFriends.find((friend) => friend[0] === friendId);
    if (isSelected) {
      setSelectedFriends(
        selectedFriends.filter((friend) => friend[0] !== friendId)
      );
    } else {
      const friendData = filteredProfiles.find(
        (friend) => friend[0] === friendId
      );
      setSelectedFriends([...selectedFriends, friendData]);
    }
  };

  const handleSendToFriend = async () => {
    // Perform the action to send the profile to the selected friend
    const friendIds = selectedFriends.map((friend) => friend[0]);
    if (friendIds.length > 0) {
      const addedFriends = await friendsList();
      const invalidFriends = friendIds.filter((friendId) => {
        const foundTuple = addedFriends.find(([id, _]) => id === friendId);
        return !foundTuple;
      });
      if (invalidFriends.length === 0) {
        // All selected friends have added you back
        onSend(friendIds);
      } else {
        // Some selected friends haven't added you back
        setErrorMessage(
          "Cannot send to the selected friend(s). They must add you back."
        );
      }
    } else {
      // No friends selected
      setErrorMessage(
        "Please select at least one friend to send the profile to."
      );
    }
  };

  // const [match, setMatch] = useState('0');

  const handleSelfSwipe = () => {
    handleSwipe(1);
    /// this is where is is checking if theres a match, if match = '1' there will have been a match
    const match = handleMatch();
    // setMatch(handleMatch);
    onSelfSwipe(match);
  };

  useEffect(() => {
    if (showPopup) {
      friendsList()
        .then((data) => {
          console.log("Received data:", data); // Log the received data array before conversion
          for (let i = 0; i < data.length; i++) {
            const [id, name] = data[i];
            console.log("ID:", id, "Name:", name);
          }

          setFilteredProfiles(data);
        })
        .catch((error) => {
          console.error("Error fetching friends list:", error);
          setFilteredProfiles([]);
        });
    }
  }, [showPopup]);

  return (
    <div className={`friends-popup ${showPopup ? "visible" : ""}`}>
      <button className="self-button" onClick={handleSelfSwipe}>
        Use Swipe for Self
      </button>
      <p className="or">Or</p>
      <h3>Select Friends to Send Profile:</h3>
      <input
        type="text"
        placeholder="Search profiles..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <p className="error">{errormessage}</p>
      {filteredProfiles.length === 0 ? (
        <p>No search results found</p>
      ) : (
        <div>
          {filteredProfiles.map((friend, index) => (
            <div
              key={index}
              className={`friend-box ${
                selectedFriends.some(
                  (selectedFriend) => selectedFriend[0] === friend[0]
                )
                  ? "selected"
                  : ""
              }`}
            >
              <input
                className="check"
                type="checkbox"
                checked={selectedFriends.some(
                  (selectedFriend) => selectedFriend[0] === friend[0]
                )}
                onChange={() => handleCheckboxChange(friend[0])}
              />
              <p>ID: {friend[0]}</p>
              <p>Name: {friend[1]}</p>
            </div>
          ))}
          <button className="send-button" onClick={handleSendToFriend}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default SwipePopup;
