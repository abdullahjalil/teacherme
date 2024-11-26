import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const Students = () => {
  const { user, logout } = useAuth(); // Access current user and logout function
  const [students, setStudents] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch students belonging to the logged-in teacher
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) {
        console.log("User is not logged in");
        return;
      }

      try {
        console.log("Fetching students for user:", user.uid);
        const studentCollection = collection(db, "students");
        const q = query(studentCollection, where("teacherId", "==", user.uid));
        const studentSnapshot = await getDocs(q);

        const studentList = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched students:", studentList);
        setStudents(studentList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [user]);

  // Add a new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      alert("Please provide both first name and last name.");
      return;
    }

    try {
      const studentData = {
        firstName,
        lastName,
        teacherId: user.uid, // Associate student with logged-in teacher
        subjects: [
          { name: "Urdu", score: "" },
          { name: "English", score: "" },
          { name: "Math", score: "" },
          { name: "Islamic Studies", score: "" },
          { name: "Pakistan Studies", score: "" },
          { name: "Physics", score: "" },
          { name: "Physics Practical", score: "" },
          { name: "Chemistry", score: "" },
          { name: "Chemistry Practical", score: "" },
          { name: "Biology", score: "" },
          { name: "Biology Practical", score: "" },
        ],
      };

      const studentCollection = collection(db, "students");
      await addDoc(studentCollection, studentData);

      setStudents((prev) => [...prev, { ...studentData, id: Date.now() }]);
      setFirstName("");
      setLastName("");
      alert("Student added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add student.");
    }
  };

  // Delete a student
  const handleDeleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents((prev) => prev.filter((student) => student.id !== id));
      alert("Student deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete student.");
    }
  };

  const calculateTotalScore = (subjects) =>
    subjects.reduce((total, subject) => total + (parseInt(subject.score) || 0), 0);

  const calculatePercentage = (totalScore) => ((totalScore / 350) * 100).toFixed(2);

  if (loading) return <div>Loading students...</div>;

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navText}>Welcome, {user.email}</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.logoutButton} onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <h2 style={styles.title}>Manage Students</h2>

      {/* Add Student Form */}
      <form onSubmit={handleAddStudent} style={styles.form}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          Add Student
        </button>
      </form>

      {/* Student List Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Urdu</th>
            <th>English</th>
            <th>Math</th>
            <th>Islamic Studies</th>
            <th>Pakistan Studies</th>
            <th>Physics</th>
            <th>Physics Practical</th>
            <th>Chemistry</th>
            <th>Chemistry Practical</th>
            <th>Biology</th>
            <th>Biology Practical</th>
            <th>Total Score</th>
            <th>Percentage</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const totalScore = calculateTotalScore(student.subjects || []);
            const percentage = calculatePercentage(totalScore);

            return (
              <tr key={student.id}>
                <td>{student.firstName} {student.lastName}</td>
                {(student.subjects || []).map((subject, index) => (
                  <td key={index}>{subject.score || "-"}</td>
                ))}
                <td>{totalScore}</td>
                <td>{percentage}%</td>
                <td>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0079d3",
    padding: "10px 20px",
    color: "#fff",
  },
  navLeft: {
    fontSize: "16px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
  },
  navText: {
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    justifyContent: "center",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "200px",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#0079d3",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Students;
