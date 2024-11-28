import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const Students = () => {
  const { user, logout } = useAuth(); // Access current user and logout function
  const [students, setStudents] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null); // Student being edited
  const [editScores, setEditScores] = useState([]); // Temporary scores during editing

  const thresholds = {
    Urdu: 30,
    English: 30,
    Math: 30,
    "Islamic Studies": 20,
    "Pakistan Studies": 20,
    Physics: 24,
    "Physics Practical": 4,
    Chemistry: 24,
    "Chemistry Practical": 4,
    Biology: 24,
    "Biology Practical": 4,
  };

  const calculateRemarks = (subjects) => {
    for (let subject of subjects) {
      const score = parseInt(subject.score) || 0;
      if (score < thresholds[subject.name]) {
        return "FAIL"; // If any subject is below threshold, it's a fail
      }
    }
    return "PASS"; // All subjects are above thresholds
  };
  
  const getCellStyle = (subjectName, score) => {
    if (score < thresholds[subjectName]) {
      return { backgroundColor: "lightcoral", color: "#fff" };
    }
    return {};
  };

  // Fetch students belonging to the logged-in teacher
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) {
        console.log("User is not logged in");
        return;
      }

      try {
        const studentCollection = collection(db, "students");
        const q = query(studentCollection, where("teacherId", "==", user.uid));
        const studentSnapshot = await getDocs(q);

        const studentList = studentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
      const docRef = await addDoc(studentCollection, studentData);
  
      // Add student to local state with Firestore-generated ID
      setStudents((prev) => [
        ...prev,
        { ...studentData, id: docRef.id }, // Include the Firestore document ID
      ]);
  
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

  // Open the edit panel for a student
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setEditScores([...student.subjects]); // Clone the student's subjects for editing
  };

  // Save the updated scores
  const saveScores = async () => {
    if (!editingStudent) return;

    try {
      const studentDoc = doc(db, "students", editingStudent.id);
      await updateDoc(studentDoc, { subjects: editScores });

      // Update the local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id ? { ...student, subjects: editScores } : student
        )
      );

      alert("Scores updated successfully!");
      setEditingStudent(null); // Close the edit panel
    } catch (err) {
      console.error("Error saving scores:", err);
      alert("Failed to save scores.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingStudent(null); // Close the edit panel without saving
  };

  const calculateTotalScore = (subjects) =>
    subjects.reduce((total, subject) => total + (parseInt(subject.score) || 0), 0);

  const calculatePercentage = (totalScore) => ((totalScore / 350) * 100).toFixed(2);

  const calculateGrade = (percentage) => {
    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "-";
  };

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
            <th>Grade</th>
            <th>Remarks</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const totalScore = calculateTotalScore(student.subjects || []);
            const percentage = calculatePercentage(totalScore);
            const grade = calculateGrade(percentage);
            const remarks = calculateRemarks(student.subjects || []);

            return (
              <tr key={student.id}>
                <td>{student.firstName} {student.lastName}</td>
                {(student.subjects || []).map((subject, index) => (
                  <td
                  key={index}
                  style={getCellStyle(subject.name, parseInt(subject.score) || 0)}
                >
                  {subject.score || "-"}
                </td>
                
                ))}
                <td>{totalScore}</td>
                <td>{percentage}%</td>
                <td>{grade}</td>
                <td>{remarks}</td>
                <td>
                  <button
                    onClick={() => handleEditStudent(student)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                </td>
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

      {/* Slide-In Edit Panel */}
      {editingStudent && (
        <div style={styles.editPanel}>
          <h3>Editing Scores for {editingStudent.firstName} {editingStudent.lastName}</h3>
          <div style={styles.editForm}>
            {editScores.map((subject, index) => (
              <div key={index} style={styles.subjectRow}>
                <span>{subject.name}:</span>
                <input
                  type="number"
                  value={subject.score || ""}
                  onChange={(e) => {
                    const updatedScores = [...editScores];
                    updatedScores[index].score = e.target.value;
                    setEditScores(updatedScores);
                  }}
                  style={styles.input}
                />
              </div>
            ))}
          </div>
          <div style={styles.editActions}>
            <button onClick={saveScores} style={styles.saveButton}>Save</button>
            <button onClick={cancelEdit} style={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}
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
  editButton: {
    padding: "5px 10px",
    backgroundColor: "orange",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  editPanel: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: "400px",
    backgroundColor: "#fff",
    boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.2)",
    padding: "20px",
    overflowY: "auto",
    zIndex: 1000,
  },
  editForm: {
    marginTop: "20px",
  },
  subjectRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  editActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  saveButton: {
    backgroundColor: "#0079d3",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "grey",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Students;
