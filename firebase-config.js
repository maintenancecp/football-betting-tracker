import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyASlYaxOMg36n5j6ffqYRntJ5v0lwaQSzI",
  authDomain: "test-progarm.firebaseapp.com",
  projectId: "test-progarm",
  storageBucket: "test-progarm.firebasestorage.app",
  messagingSenderId: "967694649194",
  appId: "1:967694649194:web:b9df00e355a27a90a7c713",
  measurementId: "G-855F2GCTLX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
  document.getElementById("loginPage").style.display = user ? "none" : "block";
  document.getElementById("appContainer").style.display = user ? "flex" : "none";
});

window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    document.getElementById("loginError").textContent = err.message;
  }
};

window.register = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    document.getElementById("loginError").textContent = err.message;
  }
};

window.logout = function () {
  signOut(auth);
};
