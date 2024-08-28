import "./LogIn.css";
import React, { useState } from "react";
import { useNavigate,  Routes, Route} from "react-router-dom";


function LogInButton({ nameC, onLogClick }) {
    return (
        <div className={nameC} onClick={onLogClick}>
            Login</div>
    );
  }

function SignUpButton({ nameC, onSignClick }) {
    return (
        <div className={nameC} onClick={onSignClick}>
            Sign Up</div>
    );
  }

function LogIn() {

    const [action,setAction] = useState("Login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState(null);
    const [errormessage, setErrorMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const [checkUsername, check_whether_username_is_available] = useState(null);
    const checkUser = async() => {
        try { 
            const response = await fetch (`http://localhost:3001/check_whether_username_is_available/${username}`, {
            method: 'POST'
        })
        console.log("check_whether_username_is_available function called with data:", username);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data;
          
        }
        catch(error) {
            console.error('Error:', error);
            return null;
        }
          
    }
    const checkLogin = async() => {
        try {
            const response = await fetch (`http://localhost:3001/get_whether_login_is_valid/${username}/${password}`, {
                method: 'POST'
        })
        console.log("get_whether_login_is_valid function called with data:", username, password);
    ;
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data;
        }
        catch(error) {
            console.error('Error:', error);
            return null;
        }
          
    }

    const handleLogClick = async() => {

        if(action === "Login") {
            try{
                const userinfoPromise = await checkLogin(username, password);
                const userinfo = await userinfoPromise;
                console.log("userinfo:", userinfo);
                console.log("t/f:", userinfo === 0)
            /// checks if username + password are valid
            
            if ((userinfo === null || userinfo === undefined || userinfo === 0 || !(username && password))){
                setErrorMessage("Invalid login");
            }
            else{
                navigate("/App",  {state: {username: username}});
            }
        }
            catch (error) {
                console.error("Error:", error);
                setErrorMessage("An error occurred");
            }

        
            /// will have userinfo if its a valid user
            
            
        } else {
            setAction("Login");
        }
    };

    const handleSignClick = async() => {
        if(action === "Sign Up") {
            if(username && password){
                try {
                    
                
                /// checks if the username is used already
                const checkPromise = (checkUser(username));
                const check = await checkPromise;
                console.log ("check:", check);
                if (check === 0){
                    console.log("failed?");
                    setErrorMessage("Username taken");
                }
                else
                {
                    setUserId(username);
                    // navigate(`/SignUp/${username}/${password}`);
                    navigate(`/SignUp/${username}`, { state: {password} });
                    // navigate('/SignUp');
                }
            }
            catch (error){
                console.error("Error:", error);
                setErrorMessage("An error occurred");
            }
        
        }else{
            setErrorMessage("Enter Username and Password to Continue");
        }
        } else {
            setAction("Sign Up");
            
        }
    };


    return(
            
                <div className="login" >
                    
                    <header className="login-header">
                        <h1>{action}</h1>
                        <div className="login-fields">
                        <form>
                            <input className="text-field"
                            type="text" name="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            />
                            <br></br>
                            <input className="text-field" type="password" name="password" placeholder="Password" value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                            <br></br>
                            <div className="submit-container">
                                <LogInButton nameC={action==="Sign Up"?"submit gray":"submit"} onLogClick= {handleLogClick} />
                                <SignUpButton nameC={action==="Login"?"submit gray":"submit"}onSignClick={handleSignClick} />
                            </div>
                        </form>
                        <p className="error">{errormessage}</p>
                    </div>
                    </header>
                </div>
        
    );
}
export default LogIn