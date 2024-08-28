import "./SignUp.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// need: name, age, hobbies (choose 3), university
// state, foods (choose 3), movie genres (choose 3)
// friends -- secondary signup page

function NextButton({ onNextClick }) {
  return (
    <div className="button" onClick={onNextClick}>
      Next
    </div>
  );
}

function BackButton({ onBackClick }) {
  return (
    <div className="button" onClick={onBackClick}>
      Back
    </div>
  );
}

function ToggleButton({ id, label, isSelected, onClick }) {
  return (
    <button
      className={isSelected ? "choose-button selected" : "choose-button"}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  );
}

function ButtonCluster({ title, list, selectedButtons, handleChooseClick }) {
  return (
    <div>
      <p>{title}</p>
      <div className="choose-container">
        {list.map((buttonId) => (
          <ToggleButton
            key={buttonId}
            id={buttonId}
            label={`${buttonId}`}
            isSelected={selectedButtons.includes(buttonId)}
            onClick={handleChooseClick}
          />
        ))}
      </div>
    </div>
  );
}

function SignUp() {
  const location = useLocation();
  const { state } = location;
  const password = state && state.password;
  const { username } = useParams();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [homeState, setHomeState] = useState("");
  const [university, setUniversity] = useState("");
  const [socials, setSocial] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [canNext1, setCanNext1] = useState(true);
  const [canNext2, setCanNext2] = useState(true);
  const [canNext3, setCanNext3] = useState(true);
  const [nextClicked, setNextClicked] = useState(0);
  const [newID, setNewID] = useState(0);
  const navigate = useNavigate();
  const ATTRIBUTE_KEY = {
    1: "Sci-fi",
    2: "Romance",
    3: "Drama",
    4: "Action",
    5: "Romantic Comedy",
    6: "Comedy",
    7: "Thriller",
    8: "Documentary",
    9: "Western",
    10: "Horror",

    11: "Pizza",
    12: "Ice cream",
    13: "Cake",
    14: "Hamburger",
    15: "Salad",
    16: "Grilled cheese",
    17: "Cereal",
    18: "Pasta",
    19: "Chicken",
    20: "Fish",

    21: "Skiing",
    22: "Hiking",
    23: "Reading",
    24: "Art",
    25: "Sports",
    26: "Cooking",
    27: "Fashion",
    28: "Writing",
    29: "Yoga",
    30: "Television",
  };

  const fetchNewID = async () => {
    try {
      const response = await fetch(`http://localhost:3001/get_new_user_id`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      console.log("fetch new ID called");
  
      const data = await response.json();
      console.log("id: " + data);
      setNewID(data);
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  // Use async function to fetch new ID
  const getNewUserID = async () => {
    try {
      const id = await fetchNewID();
      console.log('New User ID:', id);
      return id;
    } catch (error) {
      console.error('Error fetching new user ID:', error);
      return null;
    }
  }

//   useEffect(() => {
//     if (state && state.token) {
//       // Access the token from state
//       const token = state.token;
//       setPassword(token);
//       console.log("Token from state:", token);
//       // Do something with the token if needed
//     }
//   }, [state]);
  
  // Call the function in useEffect or wherever appropriate
  useEffect(() => {
    getNewUserID();
  }, []); 

  const getAttributeKey = (selectedItems, category) => {
    return selectedItems.map((item) => {
      const key = Object.keys(ATTRIBUTE_KEY).find(
        (k) => ATTRIBUTE_KEY[k] === item
      );
      return key ? parseFloat(key, 10) : null;
    });
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleBirthdateChange = (e) => {
    setBirthdate(e.target.value);

    const calcage = calculateAge(e.target.value);
    setAge(calcage);
  };

  const handleNextClick = async () => {
    if (nextClicked == 0) {
      if (name && age >= 18 && homeState && university) {
        setCanNext1(true);
        setNextClicked(nextClicked + 1);
      } else setCanNext1(false);
    }
    if (nextClicked == 1) {
      if (
        selectedHobbies.length == 3 &&
        selectedFoods.length == 3 &&
        selectedGenres.length == 3
      ) {
        setCanNext2(true);
        setNextClicked(nextClicked + 1);
      } else setCanNext2(false);
    }
    if (nextClicked == 2) {
      if (socials) {
        setCanNext3(true);
        setNextClicked(nextClicked + 1);
        await handleSignUp();
        navigate("/Friends");
      } else setCanNext3(false);
    }
  };

  const handleBackClick = () => {
    if (nextClicked > 0) {
      setNextClicked(nextClicked - 1);
    }
  };

  // const [selectedButtons, setSelectedButtons] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const handleChooseClick = (buttonId, category) => {
    let selectedCategory, setFunction;
    switch (category) {
      case "hobbies":
        selectedCategory = selectedHobbies;
        setFunction = setSelectedHobbies;
        break;
      case "foods":
        selectedCategory = selectedFoods;
        setFunction = setSelectedFoods;
        break;
      case "genres":
        selectedCategory = selectedGenres;
        setFunction = setSelectedGenres;
        break;
      default:
        break;
    }

    if (selectedCategory.includes(buttonId)) {
      setFunction(selectedCategory.filter((id) => id !== buttonId));
    } else if (selectedCategory.length < 3) {
      setFunction([...selectedCategory, buttonId]);
    }
  };

  const attributeKeyHobbies = getAttributeKey(selectedHobbies, "Hobbies");
  const attributeKeyFoods = getAttributeKey(selectedFoods, "FavoriteFoods");
  const attributeKeyGenres = getAttributeKey(
    selectedGenres,
    "FavoriteMovieGenres"
  );

  const foodsString = attributeKeyFoods.join("|");
  const moviesString = attributeKeyGenres.join("|");
  const hobbiesString = attributeKeyHobbies.join("|");

  const handleSignUp = async () => {
    const user = {
      Name: name,
      Age: age,
      FavoriteHobbies: attributeKeyHobbies.join("|"),
      University: university,
      StateOfOrigin: homeState,
      FavoriteFoods: attributeKeyFoods.join("|"),
      FavoriteMovieGenres: attributeKeyGenres.join("|"),
      Socials: socials,
    };

    const loginInfo = {
      Username: username,
      Password: password,
    };

    try {
      const response = await fetch(
        `http://localhost:3001/add_new_user/${JSON.stringify(
          user
        )}/${JSON.stringify(loginInfo)}`,
        {
          method: "POST",
        }
      );
      console.log("add_new_user function called with data:", user, loginInfo);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const hobbiesList = [
    "Skiing",
    "Hiking",
    "Reading",
    "Art",
    "Sports",
    "Cooking",
    "Fashion",
    "Writing",
    "Yoga",
    "Television",
  ];
  const foodsList = [
    "Pizza",
    "Ice cream",
    "Cake",
    "Hamburger",
    "Salad",
    "Grilled cheese",
    "Ceareal",
    "Pasta",
    "Chicken",
    "Fish",
  ];
  const genresList = [
    "Sci-fi",
    "Romance",
    "Drama",
    "Action",
    "Romantic Comedy",
    "Comedy",
    "Thriller",
    "Documentary",
    "Western",
    "Horor",
  ];

  // const [shareList, setShareList] = useState([]);
  // const [formData, setFormData] = useState({
  // phoneNumber: "",
  // email: "",
  // instagram: "",
  // // Add more fields as needed
  // });

  // const handleInputChange = (fieldName, value) => {
  // setFormData({
  // ...formData,
  // [fieldName]: value,
  // });
  // };

  // const handleCheckboxChange = (fieldName) => {
  // const isFieldShared = shareList.some((item) => item.name === fieldName);

  // if (isFieldShared) {
  // // Remove the item from the list
  // setShareList(shareList.filter((item) => item.name !== fieldName));
  // } else {
  // // Add the item to the list
  // setShareList([...shareList, { name: fieldName, value: formData[fieldName] }]);
  // }
  // };
  const [paragraph, setParagraph] = useState("");
  const handleParagraphChange = (event) => {
    setParagraph(event.target.value);
  };

  const [image, setImage] = useState(null);
  const handleImageChange = async (event) => {
    const selectedImage = event.target.files ? event.target.files[0] : null;
  
    if (selectedImage) {
      
      if (!selectedImage.type || !selectedImage.type.startsWith('image/jpeg')) {
        alert('Please upload a JPEG image.');
        return;
      }

      const reader = new FileReader();
  
      reader.onloadend = async () => {
        setImage(reader.result);
  
        // Assuming newID is available as a variable
        const userID = newID;
  
        // Create a FormData object to send the image file to the server
        const formData = new FormData();
        formData.append('image', selectedImage);
  
        // Send a POST request to save the image with the USERID as the filename
        try {
          const response = await fetch(`http://localhost:3001/save_image/${userID}`, {
            method: 'POST',
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          console.log('Image saved successfully');
        } catch (error) {
          console.error('Error saving image:', error);
        }
      };
  
      reader.readAsDataURL(selectedImage);
    } else {
      setImage(null);
    }
  };  

  return (
    <div className="signup">
      <header className="signup-header">
        <h1>Sign Up</h1>
        <h2>Welcome {username}</h2>
        {nextClicked === 2 ? (
          <div>
            <p>
              Enter information you want to get sent to matches (this will be
              the way your matches communicate with you)
            </p>
            <p>(eg. phone number: 555-555-5555)</p>

            <input
              className="text-field"
              type="paragraph"
              name="info-paragraph"
              value={socials}
              onChange={(e) => setSocial(e.target.value)}
              rows={4}
              cols={35}
            />
            <p>Last Thing! Enter a Profile Pic (accepted file types: jpg)</p>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg" // Specify accepted file types (in this case, all image types)
              onChange={handleImageChange}
            />
            {image && (
              <div>
                <p>Preview</p>
                <img src={image} alt="Preview" className="profile" />
              </div>
            )}
            {!canNext3 && <p className="errors">Input some information</p>}
            <br />
            <div className="next-button">
              <BackButton onBackClick={handleBackClick} />
            </div>
          </div>
        ) : nextClicked === 1 ? (
          <div>
            <ButtonCluster
              title={"Hobbies (Choose 3)"}
              list={hobbiesList}
              selectedButtons={selectedHobbies}
              handleChooseClick={(buttonId) =>
                handleChooseClick(buttonId, "hobbies")
              }
            />
            <ButtonCluster
              title={"Favorite Foods (Choose 3)"}
              list={foodsList}
              selectedButtons={selectedFoods}
              handleChooseClick={(buttonId) =>
                handleChooseClick(buttonId, "foods")
              }
            />
            <ButtonCluster
              title={"Favorite Movie Genres (Choose 3)"}
              list={genresList}
              selectedButtons={selectedGenres}
              handleChooseClick={(buttonId) =>
                handleChooseClick(buttonId, "genres")
              }
            />
            {!canNext2 && <p className="errors">Choose 3 for each</p>}
            <div className="next-button">
              <BackButton onBackClick={handleBackClick} />
            </div>
          </div>
        ) : (
          <form>
            <input
              className="text-field"
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <div className="birthday-container">
              <p>Birthday</p>
              <input
                className="text-field"
                type="date"
                name="birthdate"
                placeholder="Birthday"
                value={birthdate}
                onChange={handleBirthdateChange}
                pattern="\d{4}-\d{2}-\d{2}"
              />
            </div>
            {age > 18 && age < 100 && <p>You are {age} years old</p>}
            {age > 0 && age < 18 && (
              <p className="errors">You are {age} years old, you must be 18</p>
            )}
            <input
              className="text-field"
              type="text"
              name="homestate"
              placeholder="Home State"
              value={homeState}
              onChange={(e) => setHomeState(e.target.value)}
            />
            <br />
            <input
              className="text-field"
              type="text"
              name="university"
              placeholder="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            {!canNext1 && <p className="errors">Enter All Fields</p>}
          </form>
        )}
        <div className="next-button">
          <NextButton onNextClick={handleNextClick} />
        </div>
      </header>
    </div>
  );
}
export default SignUp;
