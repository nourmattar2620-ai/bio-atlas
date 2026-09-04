/**
 * إعدادات Firebase
 */
const firebaseConfig = {
  apiKey: "AIzaSyAJqfK0aU0Iq-A6HoX6w6uurrOUX3aaA-U",
  authDomain: "biology-18bbd.firebaseapp.com",
  projectId: "biology-18bbd",
  storageBucket: "biology-18bbd.firebasestorage.app",
  messagingSenderId: "1044746532151",
  appId: "1:1044746532151:web:28064f9be48feae30216b2",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
