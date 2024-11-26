import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const PRESET_SUBJECTS = [
  "Urdu",
  "English",
  "Math",
  "Islamic Studies",
  "Pakistan Studies",
  "Physics",
  "Physics Practical",
  "Chemistry",
  "Chemistry Practical",
  "Biology",
  "Biology Practical",
];

function AddStudent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      return alert("First name and last name are required.");
    }

    // Generate subjects with placeholder values
    const subjects = PRESET_SUBJECTS.map((subject) => ({
      name: subject,
      score: "",
      grade: "",
      remarks: "",
    }));

    try {
      const studentCollection = collection(db, "students");
      await addDoc(studentCollection, { firstName, lastName, subjects });
      setFirstName("");
      setLastName("");
      alert("Student added successfully with preset subjects.");
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };

  return (
    <div className="card">
      <h2>Add a Student</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}

export default AddStudent;
