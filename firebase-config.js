// กำหนด config firebase และ initialize app + auth
const firebaseConfig = {
  apiKey: "AIzaSyASlYaxOMg36n5j6ffqYRntJ5v0lwaQSzI",
  authDomain: "test-progarm.firebaseapp.com",
  projectId: "test-progarm",
  storageBucket: "test-progarm.firebasestorage.app",
  messagingSenderId: "967694649194",
  appId: "1:967694649194:web:b9df00e355a27a90a7c713",
  measurementId: "G-855F2GCTLX"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
