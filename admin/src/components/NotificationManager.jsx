import { useState, useEffect } from "react";
import { fireDB } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./NotificationManager.css";

const NotificationSender = () => {
  const [users, setUsers] = useState([]); // List of users from Firestore
  const [userId, setUserId] = useState(""); // Selected user UID or 'all' for Select All
  const [message, setMessage] = useState(""); // Notification message

  // Fetch users from Firestore when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(fireDB, "users");
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList); // Set users in state
    };

    fetchUsers();
  }, []);

  // Send notification to Firestore with users.uid or 'all' for all users
  const sendNotification = async () => {
    if (userId && message) {
      try {
        if (userId === "all") {
          // Send notification to all users
          for (const user of users) {
            await addDoc(collection(fireDB, "notifications"), {
              uid: user.uid, // User's UID
              message: message,
              timestamp: new Date(),
            });
          }
          alert("Notification sent to all users!");
        } else {
          // Send notification to a single user
          await addDoc(collection(fireDB, "notifications"), {
            uid: userId, // Selected user's UID
            message: message,
            timestamp: new Date(),
          });
          alert("Notification sent to selected user!");
        }

        setMessage(""); // Clear message after sending
        setUserId(""); // Reset selected user
      } catch (error) {
        console.error("Error sending notification: ", error);
      }
    } else {
      alert("Please select a user and type a message");
    }
  };

  return (
    <div className="notification-container">
      <h2>Send Notification</h2>
      <label>Select User:</label>
      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="">Select User</option>
        <option value="all">Select All</option> {/* 'Select All' option */}
        {users.map((user) => (
          <option key={user.id} value={user.uid}> {/* Assuming user object has 'uid' */}
            {user.name} ({user.email}) {/* Assuming user object has 'name' and 'email' */}
          </option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here"
      />

      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
};

export default NotificationSender;
