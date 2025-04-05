const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./package-lock.json'); // Path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// Get Firestore instance
const firestore = admin.firestore();

// Optional: Add error handling for initialization
try {
  // Test Firestore connection
  firestore.collection('test').doc('test').get()
    .then(() => console.log('Firebase Admin initialized successfully'))
    .catch(err => console.error('Firestore connection error:', err));
} catch (err) {
  console.error('Firebase Admin initialization error:', err);
  process.exit(1);
}

// Export the initialized instances
module.exports = {
  admin,
  firestore
};