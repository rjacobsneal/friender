import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import App from "./App";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import SearchableFriendsPage from "./Friends";
import reportWebVitals from "./reportWebVitals";
import Matches from "./Matches";
import FriendRecs from "./FriendRecs";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route index element={<LogIn />} />
          <Route path="/App" element={<App />} />
          <Route path="/SignUp/:username" element={<SignUp />} />
          <Route path="/Friends" element={<SearchableFriendsPage />} />
          <Route path="/FriendRecs" element={<FriendRecs />} />
          <Route path="/Matches" element={<Matches />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
