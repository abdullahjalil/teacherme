import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";
import Students from "./Students";

function App() {
  const { user } = useAuth(); // Get current user

  return (
    <Router>
      <Routes>
        {!user ? (
          // If user is not logged in, redirect to login or register
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          // If user is logged in, redirect to students
          <>
            <Route path="/students" element={<Students />} />
            <Route path="*" element={<Navigate to="/students" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
