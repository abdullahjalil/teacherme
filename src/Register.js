import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save teacher role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "teacher",
      });

      alert("Account created successfully!");
      navigate("/login"); // Redirect to login
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Register as a Teacher</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>
        <p style={styles.registerText}>
          Already have an account?{" "}
          <span
            style={styles.registerLink}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f6f7f8",
    },
    formContainer: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      padding: "40px",
      width: "100%",
      maxWidth: "400px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginBottom: "20px",
    },
    error: {
      color: "red",
      fontSize: "14px",
      marginBottom: "15px",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    inputGroup: {
      marginBottom: "15px",
    },
    label: {
      marginBottom: "5px",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#555",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
    },
    button: {
      backgroundColor: "#0079d3",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "16px",
      padding: "10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "10px",
    },
    buttonHover: {
      backgroundColor: "#005ea1",
    },
    registerText: {
      fontSize: "14px",
      color: "#555",
      textAlign: "center",
      marginTop: "20px",
    },
    registerLink: {
      color: "#0079d3",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

export default Register;
