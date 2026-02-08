const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account (JSON key)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      } else {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      }
      
      console.log('Firebase Admin initialized successfully');
    }
    
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Get storage bucket
const getBucket = () => {
  const storage = admin.storage();
  return storage.bucket();
};

module.exports = {
  initializeFirebase,
  getBucket,
  admin
};
