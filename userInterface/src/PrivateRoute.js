// PrivateRoute.js
import React from 'react';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, ...props }) => {
  const { user } = useAuth();

  return user ? (
    <Route {...props} element={children} />
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRoute;
