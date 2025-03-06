import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Remainder-Mobile.css';
import { useNavigate } from 'react-router-dom';
import { auth, fireDB } from '../../Login/firebase';
import { doc, getDocs, addDoc, collection, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logooImage from '../../../assets/Header/logo.png';
import Push from 'push.js';

const packages = [
  { id: 1, title: 'Anniversary', description: 'Celebrate your love with our anniversary packages.' },
  { id: 2, title: 'Birthday', description: 'Make your birthday unforgettable with our special offers.' },
  { id: 3, title: 'Proposal', description: 'Propose in the most romantic way with our curated packages.' },
  { id: 4, title: 'Movie Date', description: 'Enjoy a private movie date under the stars.' },
  { id: 5, title: 'Rooftop', description: 'Dine on our rooftop with breathtaking views.' },
  { id: 6, title: 'Dining', description: 'Fine dining experience for special occasions.' },
  { id: 7, title: 'Stays', description: 'Luxurious stay packages for a relaxing getaway.' },
  { id: 8, title: 'Decorations', description: 'Customized decoration packages for any occasion.' },
];

const Remainder = () => {
  const defaultTime = '12:00';
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customPackage, setCustomPackage] = useState('');
  const [reminderTime, setReminderTime] = useState(defaultTime);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchReminders(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(checkReminderTimes, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  useEffect(() => {
    Push.Permission.request();
  }, []);

  const fetchReminders = async (uid) => {
    const remindersCollection = collection(fireDB, 'reminders');
    const q = query(remindersCollection, where('uid', '==', uid));
    const reminderDocs = await getDocs(q);

    const fetchedReminders = reminderDocs.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
      };
    });

    setReminders(fetchedReminders);
  };

  const handleDateChange = (newDate) => setDate(newDate);

  const handleAddOrUpdateReminder = async () => {
    if (!reminderTime || !(selectedPackage || customPackage)) {
      toast.error('Please select a package and a reminder time.');
      return;
    }

    const packageName = selectedPackage === 'Other' ? customPackage : selectedPackage;
    const formattedTime = new Date(`1970-01-01T${reminderTime}:00`);
    const timeString = formattedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReminder = {
      uid: userId,
      date: new Date(date),
      time: timeString,
      package: packageName,
    };

    try {
      if (editingReminderId) {
        await updateDoc(doc(fireDB, 'reminders', editingReminderId), newReminder);
        setReminders(
          reminders.map((reminder) =>
            reminder.id === editingReminderId ? { ...newReminder, id: editingReminderId } : reminder
          )
        );
        toast.success('Reminder updated successfully!');
      } else {
        const docRef = await addDoc(collection(fireDB, 'reminders'), newReminder);
        setReminders([...reminders, { ...newReminder, id: docRef.id }]);
        toast.success('Reminder added successfully!');
      }
      resetForm();
    } catch (error) {
      toast.error('Error saving reminder: ' + error.message);
    }
  };

  const handleEditReminder = (index) => {
    const reminder = reminders[index];
    setSelectedPackage(reminder.package);
    setReminderTime(reminder.time);
    setDate(reminder.date);
    setEditingReminderId(reminder.id);
  };

  const handleDeleteReminder = async (index) => {
    const reminderId = reminders[index].id;
    setReminders(reminders.filter((_, i) => i !== index));

    try {
      await deleteDoc(doc(fireDB, 'reminders', reminderId));
      toast.info('Reminder deleted successfully!');
    } catch (error) {
      toast.error('Error deleting reminder: ' + error.message);
    }
  };

  const resetForm = () => {
    setSelectedPackage('');
    setCustomPackage('');
    setReminderTime(defaultTime);
    setEditingReminderId(null);
    setDate(new Date());
  };

  const checkReminderTimes = () => {
    const now = new Date();
    reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.date);
      const reminderTime = new Date(`${reminderDate.toLocaleDateString()} ${reminder.time}`);

      if (reminderTime.getTime() <= now.getTime() && reminderTime.getTime() + 60000 > now.getTime()) {
        pushNotification(reminder);
      }
    });
  };

  const pushNotification = (reminder) => {
    Push.create('Reminder', {
      body: `Don't forget: ${reminder.package} at ${reminder.time}`,
      icon: logooImage,
      timeout: 0,
      requireInteraction: true,
      onClick: function () {
        window.focus();
        this.close();
      },
    });
  };

  // Custom tile function for the calendar
  const tileContent = ({ date }) => {
    const hasReminder = reminders.some((reminder) => {
      const reminderDate = new Date(reminder.date);
      return (
        reminderDate.getFullYear() === date.getFullYear() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getDate() === date.getDate()
      );
    });

    return hasReminder ? <div className="circle-marker" /> : null;
  };

  return (
    <div className="remainder-container-mobile">
      <ToastContainer />
      <div className="reminder-form-mobile">
        <h2>{editingReminderId ? 'Edit Reminder' : 'Add Reminder'}</h2>
        <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}>
          <option value="">Select a Package</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
          ))}
          <option value="Other">Other</option>
        </select>
        {selectedPackage === 'Other' && (
          <input
            type="text"
            placeholder="Enter package name"
            value={customPackage}
            onChange={(e) => setCustomPackage(e.target.value)}
          />
        )}
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
        />
        <button onClick={handleAddOrUpdateReminder}>
          {editingReminderId ? 'Update Reminder' : 'Add Reminder'}
        </button>
      </div>

      <div className="calendar-and-reminders-mobile">
        <div className="reminders-content-mobile">
          <h2>My Reminders</h2>
          <ul className="reminder-list-mobile">
            {reminders.map((reminder, index) => (
              <li key={reminder.id}>
                <strong>{reminder.package}</strong> on {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                <div className="reminder-buttons-mobile">
                  <button onClick={() => handleEditReminder(index)}>Edit</button>
                  <button onClick={() => handleDeleteReminder(index)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="calendar-container-mobile">
          <Calendar 
            value={date} 
            onChange={handleDateChange} 
            tileContent={tileContent} 
          />
        </div>
      </div>
    </div>
  );
};

export default Remainder;
