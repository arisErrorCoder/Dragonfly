const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL
});

const db = admin.firestore();

module.exports = { db };
