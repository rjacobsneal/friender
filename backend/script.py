import json
import sqlite3
import os
from create_data import ATTRIBUTE_KEY
from flask import Flask, jsonify, request
from flask_cors import CORS
from contextlib import closing
from sys import stderr
import numpy as np
from sklearn.cluster import KMeans
import hashlib

app = Flask(__name__)
CORS(app)

NUM_CLUSTERS = 1000

with open("profile_features1.txt", "r") as json_file:
    CLUSTER_USERS = {}
    PROFILE_DATA = json.load(json_file)
    data = np.array([feature_list for feature_list in PROFILE_DATA.values()])
    CLUSTER_MODEL = KMeans(n_clusters=NUM_CLUSTERS, random_state=0, n_init="auto").fit(data)
    # kmeans.labels_: returns array with cluster labels for each data entry
    # kmeans.predict([[],[],...]): returns array of predicted cluster labels
    # kmeans.cluster_centers_: returns data entries that the clusters centroids
    for cluster, user_id in zip(CLUSTER_MODEL.labels_, PROFILE_DATA.keys()):
        cluster = int(cluster)
        if CLUSTER_USERS.get(cluster):
            # cluster exists in dictionary
            CLUSTER_USERS[cluster]['users'].append(user_id)
        else:
            # cluster doesn't exist in dictionary, create
            CLUSTER_USERS[cluster] = {
                'users': [user_id]
            }


CURRENT_USER = '200'
CURRENT_USER_NAME = 'Jane Doe'
CURRENT_CLUSTER = 0
SWIPE_PROGRESS = ['0' for _ in range(NUM_CLUSTERS)]

"""
def get_unencrypted_password_of_user(user_id):
    query = "SELECT Password FROM Logins WHERE ID = ?"
    result = execute_query(query, [str(user_id)])
    if result:
        print(result[0][0].encode('ascii'))
        return FERNET.decrypt(result[0][0].encode('ascii')).decode()
    return 'No such user'
"""

def execute_query(prepared_statement, prepared_statement_vars = None):
    database_url ='file:db.sqlite?mode=rw'
    try:
        with sqlite3.connect(database_url, isolation_level=None, uri=True) as connection:
            with closing(connection.cursor()) as cursor:
                if prepared_statement_vars:
                    cursor.execute(prepared_statement, prepared_statement_vars)
                else:
                    cursor.execute(prepared_statement)
                return cursor.fetchall()
    except Exception as e_caught:
        print("Error in connecting to database and executing query: " + str(e_caught),
            file=stderr)
        return None

def get_user_info_as_dict(user_id):
    # Update with correct query based on what we have
    query = "SELECT * FROM Profiles WHERE UserID = ?"
    user_info = execute_query(query, [str(user_id)])[0]
    print ("user_info from info_as_dict", user_info)
    # Convert the user_info to a dictionary (assuming it's a tuple from the database)
    user_dict = {
        'ID': user_info[0],
        'Name': user_info[1],
        'Age': user_info[2],
        'Hobbies' : ', '.join([ATTRIBUTE_KEY[int(hobby)] for hobby in user_info[3].split('|')]),
        'University': user_info[4],
        'State of Origin': user_info[5],
        'Favorite Foods': ', '.join([ATTRIBUTE_KEY[int(food)] for food in user_info[6].split('|')]),
        'Favorite Movie Genres': ', '.join([ATTRIBUTE_KEY[int(genre)] for genre in user_info[7].split('|')]),
        'Socials': user_info[8]
    }
    return user_dict

def get_user_info_to_edit():
    return json.dumps(get_user_info_as_dict(CURRENT_USER))


@app.route('/get_user_info/<user_id>', methods = ['POST'])
def get_user_info(user_id):
    print("get user info", user_id)
    user_dict = get_user_info_as_dict(user_id)
    del user_dict['Socials']

    # Convert the dictionary to a JSON string
    user_info_json = json.dumps(user_dict)
    return user_info_json

def update_swipe_progress_in_database():
    query = "UPDATE Profiles SET SwipeProgress=? WHERE UserID=?"
    swipe_progress = '|'.join(SWIPE_PROGRESS)
    swipe_progress += '*' + str(CURRENT_CLUSTER)
    execute_query(query, [swipe_progress, str(CURRENT_USER)])


@app.route('/get_user_in_same_cluster', methods = ['GET'])
def get_user_in_same_cluster():
    global SWIPE_PROGRESS
    cluster_current_ndx = int(SWIPE_PROGRESS[int(CURRENT_CLUSTER)])
    cluster_users = CLUSTER_USERS[int(CURRENT_CLUSTER)]['users']

    # Check if the current cluster has more users
    if cluster_current_ndx >= len(cluster_users):
        # If there are no more users in the cluster, get user from an adjacent cluster
        return get_user_in_adjacent_cluster()

    # Get the user ID at the current index in the cluster
    user_id = cluster_users[cluster_current_ndx]

    SWIPE_PROGRESS[int(CURRENT_CLUSTER)] = str(int(SWIPE_PROGRESS[int(CURRENT_CLUSTER)]) + 1)
    update_swipe_progress_in_database()
    print ("userid from same_cluse:", user_id)
    return get_user_info(user_id)

@app.route('/get_user_in_adjacent_cluster', methods=['GET'])
def get_user_in_adjacent_cluster():
    # add 1 to LAST_CLUSTER_SHOWN
    # call get_user_in_same_cluster()
    # return the info returned by get_user_in_same_cluster()
    global CURRENT_CLUSTER
    CURRENT_CLUSTER = int(CURRENT_CLUSTER) + 1
    if int(CURRENT_CLUSTER) >= 15000:
        CURRENT_CLUSTER = '0' # cycle back to beginning
    
    # Recursively call the function to get a user in the adjacent cluster
    return get_user_in_same_cluster()


@app.route('/set_swipe/<user_id_swiped>/<swipe>', methods=['POST'])
def set_swipe(user_id_swiped, swipe):
    print(f"set_swipe done with user_id_swiped: {user_id_swiped} and swipe: {swipe}")
    """
        update value in Swipes database table
        query database for where
            UserID1 = CURRENT_USER
            and UserID2 = user_id_swiped
        if the entry exists, replace the swipe value
        with this function's swipe parameter
        otherwise, create a new entry with users and parameter
        left swipe = 0
        right swipe = 1
    """
    prepared_statement = """
        INSERT OR REPLACE INTO Swipes (UserID1, UserID2, Swipe)
        VALUES(?, ?, ?);
    """
    execute_query(prepared_statement, [str(CURRENT_USER), str(user_id_swiped), str(swipe)])

    return ''

@app.route('/get_whether_users_match/<userID_right_swiped>', methods=['POST'])
def get_whether_users_match(userID_right_swiped):
    print(f"get_whether_users_match used with userID_right_swiped: {userID_right_swiped}")
    """
        query Swipes database table selecting "swipe" where 
            UserID1 = CURRENT_USER
            and UserID2 = user_right_swiped
        if it exists in the database, return whether swipe was 
            right (1) => true
            or left (0) => false
            if it doesn't exist, return false
    """
    prepared_statement = """
        SELECT Swipe
        FROM Swipes
        WHERE UserID1 = ? AND UserID2 = ?;
    """
    
    # had to change it to return strings bc it cant take a boolean 
    result = execute_query(prepared_statement, [str(userID_right_swiped), str(CURRENT_USER)])
    print("user right swiped: " + str(userID_right_swiped))
    print("current user: " + str(CURRENT_USER))
    print("result: " + str(result))
    if result:
        swipe = result[0][0]
        return '1' if swipe == 1 else '0'
    return '0'

@app.route('/check_whether_username_is_available/<username>', methods=['POST'])
def check_whether_username_is_available(username):
    
    print(f"check_whether_username_is_available used with username: {username}")
    """
        checks whether username already exists in logins database
        used for when new user is picking username
    """
    query = "SELECT * FROM Logins WHERE Username = ?"
    result = execute_query(query, [str(username)])
    print(result)
    if result:
        #username taken
        print("failed")
        return json.dumps(0)
    print("worked")
    return json.dumps(1)

@app.route('/get_whether_login_is_valid/<username>/<password>', methods=['POST'])
def get_whether_login_is_valid(username, password):

    print(f"get_whether_login_is_valid used with username: {username} and password: {password}")
    """
        check in the database to see if the username and password exists
        if it does, set CURRENT_USER to that userID & return user info
        if not, return False
    """
    global CURRENT_USER
    global CURRENT_USER_NAME
    global SWIPE_PROGRESS
    global CURRENT_CLUSTER
    prepared_statement = """
        SELECT ID
        FROM Logins
        WHERE Username = ? AND Password = ?;
    """
    password = int(hashlib.sha512(str(password).encode('utf-8')).hexdigest(), 16)
    result = execute_query(prepared_statement, [str(username), str(password)])
    if result:
        
        id = result[0][0]
        CURRENT_USER = str(id)

        swipe_progress_prepared_statement = "SELECT SwipeProgress FROM Profiles WHERE UserID = ?"
        swipe_progress = execute_query(swipe_progress_prepared_statement, [CURRENT_USER])[0][0]
        # looks like: '0|5|13|...|2*5' where the last number is the current cluster
        SWIPE_PROGRESS = swipe_progress.split('|')
        last_term = SWIPE_PROGRESS[len(SWIPE_PROGRESS)-1].split('*')
        SWIPE_PROGRESS[len(SWIPE_PROGRESS)-1] = last_term[0]
        CURRENT_CLUSTER = last_term[1]
        user_info = get_user_info_as_dict(id)
        print(user_info['Name'])
        CURRENT_USER_NAME = user_info['Name']
        return json.dumps(get_user_info(id))
    return json.dumps(0)


@app.route('/add_new_friend/<new_friend_id>', methods=['POST'])
def add_new_friend(new_friend_id):
    print("add_new_friend called with new friend id:", new_friend_id)
    """
        adds that userId to friendship table as the current user's friend
    """
    try:
        prepared_statement = """
            INSERT OR REPLACE INTO Friendships (UserID, FriendID)
            VALUES(?, ?);
        """
        print("current user", CURRENT_USER)

        execute_query(prepared_statement, [CURRENT_USER, new_friend_id])
        return '0'
    except Exception as e:
        print(f"Error adding friend: {str(e)}")
        return 'Error adding friend'

@app.route('/get_all_friends', methods=['POST'])
def get_all_friends():
    print("get_all_friends called")
    get_friends_query = """
        SELECT Profiles.UserID, Profiles.Name
        FROM Friendships
        INNER JOIN Profiles ON Friendships.FriendID = Profiles.UserID
        WHERE Friendships.UserID = ?;
    """
    results = execute_query(get_friends_query, [str(CURRENT_USER)])  
    print(CURRENT_USER) 
    print(results)
    if results == None:
        return []
    return results

@app.route('/get_all_friends_ids', methods=['POST'])
def get_all_friends_ids():
    print("get_all_friends_ids called")
    get_friends_ids_query = """
        SELECT Profiles.UserID
        FROM Friendships
        INNER JOIN Profiles ON Friendships.FriendID = Profiles.UserID
        WHERE Friendships.UserID = ?;
    """
    results = execute_query(get_friends_ids_query, [str(CURRENT_USER)])  
    print(CURRENT_USER) 
    print(results)
    if results == None:
        return []
    return results
    

@app.route('/get_who_user_can_share_recommendations_with', methods=['POST'])
def get_who_user_can_share_recommendations_with():
    print(f"get_who_user_can_share_recommendations_with used")
   
    """
        returns list of tuples (id, name) who have
        added the current user as their friend, aka
        who the current user can share recommendations
        with
    """
    get_friends_query = """
        SELECT Profiles.UserID, Profiles.Name
        FROM Friendships
        INNER JOIN Profiles ON Friendships.UserID = Profiles.UserID
        WHERE Friendships.FriendID = ?;
    """
    results = execute_query(get_friends_query, [CURRENT_USER])
    
    return results if results else []

@app.route('/get_all_users_from_search/<part_of_name>', methods=['POST'])
def get_all_users_from_search(part_of_name):
    print(f"get_all_users_from_search used with name: {part_of_name}")
    
    """
        for the purpose of adding a friend
        returns a dictionary turned into JSON mapping userIds
        to names that contain part_of_name
    """
    prepared_statement = """
        SELECT UserID, Name
        FROM Profiles
        WHERE Name like ? AND UserID != ?;
    """
    result = execute_query(prepared_statement, ['%' + str(part_of_name) + '%', CURRENT_USER])
    users = {str(user[0]): user[1] for user in result}

    return users

@app.route('/make_recommendations/<recommended_profile_id>/<list_of_recipient_ids>', methods=['POST'])
def make_recommendations(recommended_profile_id, list_of_recipient_ids):
    
    print(f"make_recommendations used with data: {recommended_profile_id} {list_of_recipient_ids}")
    """
        takes a list of recipients because you could be sending the
        same recommendation to multiple friends at a time.
        search the database to see if the recommendation was already
        made by someone else. if so, add your name to the list of
        recommenders. if not, create new recommendation in database
    """
    recommended_profile_id = str(recommended_profile_id)
    split_list_of_recipient_ids = list_of_recipient_ids.split(",")
    for recipient in split_list_of_recipient_ids:
        recipient = str(recipient)
        print(recommended_profile_id)
        print(recipient)
        check_if_rec_exists_query = """
            SELECT *
            FROM Recommendations
            WHERE RecipientID = ? and RecommendedProfileID = ?;
        """
        result = execute_query(check_if_rec_exists_query, [recipient, recommended_profile_id])
        if result:
            recommenders = result[0][0].split('|')
            recommenders.append(CURRENT_USER_NAME)
            new_recommenders = '|'.join(recommenders)
        else:
            new_recommenders = CURRENT_USER_NAME
        add_name_to_rec_query = """
            INSERT OR REPLACE INTO Recommendations (Recommenders, RecipientID, RecommendedProfileID)
            VALUES(?, ?, ?);
        """
        execute_query(add_name_to_rec_query, [new_recommenders, recipient, recommended_profile_id])
    return ''

@app.route('/get_recommendation', methods=['GET'])
def get_recommendation():
    print(f"get_recommendations used with data")
   
    """
        get one recommendation for the current user
    """
    check_if_rec_exists_query = """
        SELECT *
        FROM Recommendations
        WHERE RecipientID = ?;
    """
    result = execute_query(check_if_rec_exists_query, [str(CURRENT_USER)])
    print(result)
    if (result):
        rec = result[0]
        rec_prof = get_user_info_as_dict(rec[2])
        del rec_prof['Socials']
        rec_info = {
            'Recommenders': rec[0].split('|'),
            'RecommendedProfile': rec_prof
            }
        recs = json.dumps(get_user_info(rec[2]))
        return get_user_info(rec[2])
    return jsonify({})

@app.route('/delete_recommendation', methods=['POST'])
def delete_recommendation():
    """
        deletes rec from database
    """
    check_if_rec_exists_query = """
        SELECT *
        FROM Recommendations
        WHERE RecipientID = ?;
    """
    result = execute_query(check_if_rec_exists_query, [str(CURRENT_USER)])

    if (result):
        rec = result[0]
        
        query = """
            DELETE FROM Recommendations
            WHERE RecipientID = ? and RecommendedProfileID = ?;
        """
        result = execute_query(query, [str(CURRENT_USER), str(rec[2])])
    return ''
@app.route('/add_new_user/<user_info_as_json>/<user_login_as_json>', methods=['POST'])
def add_new_user(user_info_as_json, user_login_as_json):
    print(f"add_new_user used with data: {user_info_as_json}+{user_login_as_json}")
   
    """
        add new user to Profiles database with the given info
        also add them to the Login database with the given login info
    """
    """ 
        assuming user_info_as_json looks like:
        {
            Name: ____,
            Age: ____,
            University: ____,
            StateOfOrigin: ____,
            FavoriteFoods: ____, # should look like "number|number|number"
            FavoriteMovieGenres: ____, # should look like "number|number|number"
            FavoriteHobbies: ____, # should look like "number|number|number"
            Socials: ___
        }
    
    """
    """ 
        assuming user_login_as_json looks like:
        {
            Username: ____,
            Password: ____
        }
    
    """
    """ 
        assuming user_friends looks like:
        [friend1ID, friend2ID, ...]
    
    """
    global CURRENT_USER
    global CURRENT_USER_NAME

    # query to count number of profiles in order to create new ID
    number_profiles_query = "SELECT COUNT(*) FROM Profiles"
    number_profiles = int(execute_query(number_profiles_query)[0][0])
    new_id = number_profiles + 1

    profile_prepared_statement = """
        INSERT OR REPLACE INTO Profiles (UserID, Name, Age, Hobbies, University, StateOfOrigin, FavoriteFoods, FavoriteMovieGenres, Socials, SwipeProgress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    user_info = json.loads(user_info_as_json)
    print("new id:", new_id)
    execute_query(profile_prepared_statement, [
        str(new_id),
        str(user_info['Name']),
        str(user_info['Age']),
        str(user_info['FavoriteHobbies']),
        str(user_info['University']),
        str(user_info['StateOfOrigin']),
        str(user_info['FavoriteFoods']),
        str(user_info['FavoriteMovieGenres']),
        str(user_info['Socials']),
        '|'.join(['0' for _ in range(NUM_CLUSTERS)]) + '*0'
    ])

    login_prepared_statement = """
        INSERT OR REPLACE INTO Logins (Username, Password, ID)
        VALUES (?, ?, ?);
    """
    user_login = json.loads(user_login_as_json)
    password = int(hashlib.sha512(str(user_login['Password']).encode('utf-8')).hexdigest(), 16)
    execute_query(login_prepared_statement, [
        str(user_login['Username']), 
        str(password),
        str(new_id)
    ])

    CURRENT_USER = str(new_id)
    print(CURRENT_USER)
    CURRENT_USER_NAME = str(user_info['Name'])
    features = str(user_info['FavoriteMovieGenres']).split('|') + str(user_info['FavoriteHobbies']).split('|') + str(user_info['FavoriteFoods']).split('|')
    PROFILE_DATA[CURRENT_USER] = features
    with open('profile_features1.txt', 'w') as file:
        json.dump(PROFILE_DATA, file)
    cluster = CLUSTER_MODEL.predict([features])[0]
    CLUSTER_USERS[int(cluster)]['users'].append(CURRENT_USER)
    return ''

@app.route('/get_matches', methods=['POST'])
def get_matches():
    """
        gets profiles (including socials) of current user's matches
    """
    print(f"got matches")
    prepared_statement = """
        WITH
            right_swipes_by_user as (
                select *
                from Swipes
                where UserID1 = ? and Swipe = 1
            ),
            right_swipes_on_user as (
                select *
                from Swipes
                where UserID2 = ? and Swipe = 1
            )
        select right_swipes_by_user.UserID2
        from right_swipes_by_user
        left outer join right_swipes_on_user
        where right_swipes_by_user.UserID2 = right_swipes_on_user.UserID1
    """
    query_output = execute_query(prepared_statement,[CURRENT_USER, CURRENT_USER])
    matches_profiles = []
    for matches in query_output:
        profile_id = matches[0]
        matches_profiles.append(get_user_info_as_dict(profile_id))
    return matches_profiles

@app.route('/get_new_user_id', methods=['GET'])
def get_new_user_id():
    query = "SELECT MAX(ID) FROM Logins"
    result = execute_query(query)
    if result and result[0][0]:
        return jsonify(result[0][0] + 1)
    return 0

IMAGE_UPLOAD_DIR = '../userInterface/public/imgs'
@app.route('/save_image/<userID>', methods=['POST'])
def save_image(userID):
    try:
        # Ensure the directory for image upload exists
        os.makedirs(IMAGE_UPLOAD_DIR, exist_ok=True)
        # Get the uploaded image file from the request
        uploaded_file = request.files['image']
        # Save the image with USERID.jpg as the filename
        file_path = os.path.join(IMAGE_UPLOAD_DIR, f'{userID}.jpg')
        uploaded_file.save(file_path)
        return {'success': True, 'message': 'Image saved successfully'}
    except Exception as e:
        print("ERROR\n")
        return {'success': False, 'error': str(e)}

def get_password():
    login_prepared_statement = """
        SELECT *
        FROM Logins
        WHERE ID = 215;
    """
    return execute_query(login_prepared_statement)

def get_right_swipes_on_current_user():
    prepared_statement = """
        SELECT Swipe
        FROM Swipes
        WHERE UserID2 = ?;
    """
    
    # had to change it to return strings bc it cant take a boolean 
    result = execute_query(prepared_statement, [str(CURRENT_USER)])
    return result

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=3001)