# Running the Code

To run the application, follow these steps:

### In Terminal 1:

```bash
cd backend
python create_data.py
python script.py
```

### In Terminal 2:

```bash
cd userInterface
npm start
```

# Overview

## Backend

- **Database Generation**:
  - Generates a local SQLite database containing mock application data.
  - Creates a text file `clusters.txt` that categorizes profiles based on specific criteria.
  - Creates a text file `login_info.txt` that provides unencrypted login information for select accounts for demo purposes.

## Frontend

- **Starting the Application**:

  - Running `npm start` will launch the application on `localhost:3000`.

- **Pages and Features**:

  - **Start Page**:

    - Users can log in or create a new profile.

  - **Swipe Page**:

    - Displays profiles from the database as cards, using the data from `clusters.txt`.
    - Users can swipe left to reject a profile (prompts the application to suggest dissimilar profiles) or swipe right to accept a profile.
    - Option to swipe either for themselves or on behalf of their friends.
    - Swiping for themselves results in recommendations of similar profiles.

  - **Recommendations Page**:

    - Displays profiles that have been recommended by friends.

  - **Matches Page**:

    - Shows profiles with whom the user has mutual matches.

  - **Friends Page**:
    - Allows users to send friend requests, determining who can send them profile recommendations.

# Demo Instructions

- **Login Information**: Credentials for `person1`, `person2`, `person3`, and `person215` are provided in `login_info.txt`, located in the backend folder after running `create_data.py`
- **Data Population**:

  - For demo purposes, `create_data.py` pre-populates random swipe data specifically for `person215`.
  - To see random matches, log in as `person215`. Other users can use the swipe feature, but their swipe data is not pre-populated in the mock database.

- **Friendship Setup**:

  - `person1` is automatically set as a friend of `person215`. Therefore, `person1` can send profile recommendations to `person215`, which will be visible on `person215`'s recommendation page.

- **Additional Users**:
  - Login credentials for `person2` and `person3` are also available to explore further interactions between users.
