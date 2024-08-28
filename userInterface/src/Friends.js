import "./Friends.css";
import React, { useState, useEffect } from "react";
import NavigationBar from "./NavigationBar";

const SearchableFriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [addedFriends, setAddedFriends] = useState([]);

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    handleSearch(searchValue);
  }

  const fetchAddedFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3001/get_all_friends_ids`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log("fetch friends called");

      const data = await response.json();
      const flattenedData = data.flat();
      console.log("fetch: " + flattenedData);
      setAddedFriends(flattenedData);
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  const handleSearch = (part_of_name) => {
    setSearched(true);
    if (part_of_name.trim() === "") setSearched(false);
    fetch(`http://localhost:3001/get_all_users_from_search/${part_of_name}`, {
      method: 'POST'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const convertedData = Object.entries(data).map(([id, name]) => ({
          id: parseInt(id),
          name: name,
        }));
        const limitedProfilesWithoutSelf = convertedData.slice(0, 15);
      setFilteredProfiles(limitedProfilesWithoutSelf);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const handleAddFriend = (profileId) => {
    if (!addedFriends.includes(profileId)) {
      console.log("calling add new friend with id:", profileId);
      fetch(`http://localhost:3001/add_new_friend/${profileId}`, {
        method: 'POST',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          // Update addedFriends immediately after a successful addition
          setAddedFriends((prevFriends) => [...prevFriends, profileId]);
          console.log("list: " + addedFriends)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }

  // Fetch added friends when the component mounts
  useEffect(() => {
    fetchAddedFriends();
  }, []);

  return (
    <div className="searchable-friends-page">
      <h1>Add Friends</h1>
      <input
        type="text"
        placeholder="Search profiles..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {filteredProfiles.length === 0 ? (
        searched && <p>No search results found</p>
      ) : (
        <div className="profile-cards">
          {console.log(addedFriends)}
          {console.log(addedFriends.includes(1))}
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <div className="container">
                <img
                  src={`/imgs/${profile.id}.jpg`}
                  alt={`${profile.ID} profile photo`}
                  onError={(e) => {
                    e.target.src = "/imgs/blank.webp";
                  }}
                />
              </div>
              <p>{profile.name}</p>
              <button
                className={`${
                  addedFriends.includes(profile.id) ? "added-button" : ""
                }`}
                disabled={addedFriends.includes(profile.id)}
                onClick={() => handleAddFriend(profile.id)}
              >
                {addedFriends.includes(profile.id) ? "Added" : "Add Friend"}
              </button>
            </div>
          ))}
        </div>
      )}
      <NavigationBar />
    </div>
  );
};

export default SearchableFriendsPage;
