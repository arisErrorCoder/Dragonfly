// src/utils/fetchUsers.js
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../components/firebase";
export const fetchUsers = async () => {
  try {
    const usersCollection = collection(fireDB, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return usersList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
