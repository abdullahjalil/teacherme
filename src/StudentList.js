import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

const StudentList = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      const studentCollection = collection(db, "students");
      const q = query(studentCollection, where("teacherId", "==", user.uid));
      const studentSnapshot = await getDocs(q);

      const studentList = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    };

    fetchStudents();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect if not logged in
  }

  return (
    <div>
      <h2>Your Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.firstName} {student.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;
