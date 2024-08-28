import sys
from contextlib import closing
import sqlite3
from random import randint
from sklearn.cluster import KMeans
import numpy as np
import json
import secrets
import string
import hashlib

NUM_RANDOM_PROFILES = 2000
NUM_CLUSTERS = 100

MOVIE_GENRES_RANGE = (1,10)
NUM_MOVIE_GENRES_TO_PICK = 3
FOODS_RANGE = (11,20)
NUM_FOODS_TO_PICK = 3
HOBBIES_RANGE = (21,30)
NUM_HOBBIES_TO_PICK = 3


"""
keys: cluster #s;
values: dictionaries with keys: 
    'current_ndx' (mapping to the index of the next person to show in that cluster)
    and 'users' (mapping to a list of userIds that belong to that cluster)
"""
CLUSTER_USERS = {}

"""
keys: userIDs
values: list if attribute numbers corresponding to user's profile customizations
"""
PROFILE_DATA = {}

ATTRIBUTE_KEY = {
    # movie genres
    1: 'Sci-fi',
    2: 'Romance',
    3: 'Drama',
    4: 'Action',
    5: 'Romantic Comedy',
    6: 'Comedy',
    7: 'Thriller',
    8: 'Documentary',
    9: 'Western',
    10: 'Horror',
    #  foods
    11: 'Pizza',
    12: 'Ice cream',
    13: 'Cake',
    14: 'Hamburger',
    15: 'Salad',
    16: 'Grilled cheese',
    17: 'Cereal',
    18: 'Pasta',
    19: 'Chicken',
    20: 'Fish',
    # hobbies
    21: 'Skiing',
    22: 'Hiking',
    23: 'Reading',
    24: 'Art',
    25: 'Sports',
    26: 'Cooking',
    27: 'Fashion',
    28: 'Writing',
    29: 'Yoga',
    30: 'Television'
}

def create_profile_table_query():
    return """
        CREATE TABLE IF NOT EXISTS Profiles (
            UserID int NOT NULL,
            Name varchar(20),
            Age int NOT NULL,
            Hobbies varchar(16) NOT NULL,
            University varchar(20),
            StateOfOrigin varchar(13),
            FavoriteFoods varchar(16) NOT NULL,
            FavoriteMovieGenres varchar(6) NOT NULL,
            Socials varchar(100) NOT NULL,
            SwipeProgress varchar(2500) NOT NULL,
            PRIMARY KEY (UserID)
        );
    """

def create_swipes_table_query():
    # Swipe = 0 for left swipe / right swipe for someone else
    # Swipe = 1 for right swipe
    return """
        CREATE TABLE IF NOT EXISTS Swipes (
            UserID1 int NOT NULL,
            UserID2 int NOT NULL,
            Swipe int NOT NULL,
            PRIMARY KEY (UserID1,UserID2),
            FOREIGN KEY (UserID1) REFERENCES Profiles(UserID),
            FOREIGN KEY (UserID2) REFERENCES Profiles(UserID)
        );
    """

def create_recommendations_table_query():
    """
        Table holds recipient ID, recommended profile ID,
        and a string separated by |'s that holds all the names of
        the users who have recommended this profile
    """
    return """
        CREATE TABLE IF NOT EXISTS Recommendations (
            Recommenders int NOT NULL,
            RecipientID int NOT NULL,
            RecommendedProfileID int NOT NULL,
            PRIMARY KEY (RecipientID,RecommendedProfileID),
            FOREIGN KEY (RecipientID) REFERENCES Profiles(UserID),
            FOREIGN KEY (RecommendedProfileID) REFERENCES Profiles(UserID)
        );
    """

def create_friendship_table_query():
    return """
        CREATE TABLE IF NOT EXISTS Friendships (
            UserID int NOT NULL,
            FriendID int NOT NULL,
            PRIMARY KEY (UserID,FriendID),
            FOREIGN KEY (UserID) REFERENCES Profiles(UserID),
            FOREIGN KEY (FriendID) REFERENCES Profiles(UserID)
        );
    """

def create_login_table_query():
    return """
        CREATE TABLE IF NOT EXISTS Logins (
            Username varchar(20) NOT NULL,
            Password varchar(20) NOT NULL,
            ID int UNIQUE NOT NULL,
            PRIMARY KEY (Username),
            FOREIGN KEY (ID) REFERENCES Profiles(UserID)
        );
    """

def insert_random_logins_query():
    query = """
    INSERT OR REPLACE INTO Logins (Username, Password, ID)
    VALUES
    """
    with open("login_info.txt", 'w') as file:
        pass
    for id in range(1, NUM_RANDOM_PROFILES+1):

        password = ''.join(secrets.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits)
              for _ in range(10))
        username = "'username" + str(id) + "'"
        if id == 215 or id == 1 or id == 2 or id == 3:
            with open("login_info.txt", 'a') as file:
                file.write('username: ' + username + ' ')
                file.write('password: ' + password + '\n')
        password = int(hashlib.sha512(str(password).encode('utf-8')).hexdigest(), 16)
        query += f"({str(username)}, '{str(password)}', {str(id)}),"
    query= query[:-1] + ";"
    return query

def insert_random_swipes_query():
    query = """
    INSERT OR REPLACE INTO Swipes (UserID1, UserID2, Swipe)
    VALUES
    """
    for id1 in range(1, NUM_RANDOM_PROFILES):
        query += f"({str(id1)}, '{str(215)}', {str(randint(0,1))}),"
    query= query[:-1] + ";"
    print(query)
    return query

def insert_planned_friendships_query():
    return """
    INSERT INTO Friendships (UserID, FriendID)
        VALUES
        (215, 1)
    """

def drop_swipes_table():
    return """
        DROP TABLE Swipes;
    """

def drop_recommendations_table():
    return """
        DROP TABLE Recommendations;
    """

def drop_logins_table():
    return """
        DROP TABLE Logins;
    """

def insert_random_profiles_query():
    query = """
    INSERT OR REPLACE INTO Profiles (UserID, Name, Age, Hobbies, University, StateOfOrigin, FavoriteFoods, FavoriteMovieGenres, Socials, SwipeProgress)
    VALUES
    """
    movie_genres = []
    hobbies = []
    foods = []
    for idNum in range(1, NUM_RANDOM_PROFILES+1):
        user_id = idNum
        name = "person" + str(idNum)
        age = randint(18, 30)
        university = "University" + str(randint(1,3))
        state = "State" + str(randint(1,5))
        socials = "@socialsToShareWithMatches"

        movie_genres = []
        for _ in range(NUM_MOVIE_GENRES_TO_PICK):
            mg = randint(MOVIE_GENRES_RANGE[0], MOVIE_GENRES_RANGE[1])
            while mg in movie_genres:
                mg = randint(MOVIE_GENRES_RANGE[0], MOVIE_GENRES_RANGE[1])
            movie_genres.append(mg)
            
        hobbies = []
        for _ in range(NUM_HOBBIES_TO_PICK):
            h = randint(HOBBIES_RANGE[0], HOBBIES_RANGE[1])
            while h in hobbies:
                h = randint(HOBBIES_RANGE[0], HOBBIES_RANGE[1])
            hobbies.append(h)

        foods = []
        for _ in range(NUM_FOODS_TO_PICK):
            f = randint(FOODS_RANGE[0], FOODS_RANGE[1])
            while f in foods:
                f = randint(FOODS_RANGE[0], FOODS_RANGE[1])
            foods.append(f)
        
        # swipe progress is pipe-delimited string of indexes that have been swiped through by user
        # the string is ended by *NUM where NUM is the current cluster that the user stopped swiping in
        swipe_progress = '|'.join(['0' for _ in range(NUM_CLUSTERS)])
        swipe_progress += '*0'

        PROFILE_DATA[user_id] = movie_genres + hobbies + foods
        movie_genres = '|'.join([str(movie) for movie in movie_genres])
        hobbies = '|'.join([str(hobby) for hobby in hobbies])
        foods = '|'.join([str(food) for food in foods])
        query += f"({str(user_id)}, '{name}', {str(age)}, '{hobbies}', '{university}', '{state}', '{foods}', '{movie_genres}', '{socials}', '{swipe_progress}'),"
    
    query= query[:-1] + ";"
    return query

def create_and_populate_friendship_database():
    database_url ='file:db.sqlite'

    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                cursor.execute(create_friendship_table_query())
                cursor.execute(insert_planned_friendships_query())
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=sys.stderr)

def create_and_populate_recommendations_database():
    database_url ='file:db.sqlite'

    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                cursor.execute(create_recommendations_table_query())
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=sys.stderr)


def create_and_populate_logins_database():
    database_url ='file:db.sqlite'

    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                # cursor.execute(drop_logins_table())
                cursor.execute(create_login_table_query())
                cursor.execute(insert_random_logins_query())
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=sys.stderr)

def create_and_populate_profile_database():
    database_url ='file:db.sqlite'

    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                cursor.execute(create_profile_table_query())
                cursor.execute(insert_random_profiles_query())
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=sys.stderr)


def create_and_populate_swipes_database():
    database_url ='file:db.sqlite'

    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                # cursor.execute(drop_swipes_table())
                cursor.execute(create_swipes_table_query())
                cursor.execute(insert_random_swipes_query())
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=sys.stderr)

"""
def generate_clusters():
    data = np.array([feature_list for feature_list in PROFILE_DATA.values()])
    kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=0, n_init="auto").fit(data)
    # kmeans.labels_: returns array with cluster labels for each data entry
    # kmeans.predict([[],[],...]): returns array of predicted cluster labels
    # kmeans.cluster_centers_: returns data entries that the clusters centroids
    for cluster, user_id in zip(kmeans.labels_, PROFILE_DATA.keys()):
        cluster = int(cluster)
        if CLUSTER_USERS.get(cluster):
            # cluster exists in dictionary
            CLUSTER_USERS[cluster]['users'].append(user_id)
        else:
            # cluster doesn't exist in dictionary, create
            CLUSTER_USERS[cluster] = {
                'users': [user_id]
            }
    json.dump(CLUSTER_USERS, open("clusters.txt",'w'))
"""

def create_profiles():
    create_and_populate_profile_database()
    json.dump(PROFILE_DATA, open("profile_features1.txt",'w'))

def create_friendships():
    create_and_populate_friendship_database()

def create_swipes():
    create_and_populate_swipes_database()

def create_logins():
    create_and_populate_logins_database()

def create_recommendations():
    create_and_populate_recommendations_database()

def load_clusters():
    CLUSTER_USERS = json.load(open("clusters.txt"))
    print(CLUSTER_USERS['760'])

if __name__ == "__main__":
    create_profiles()
    create_swipes()
    create_logins()
    create_friendships()
    create_recommendations()
    pass
