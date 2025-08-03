// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "pr-school-vote",
  "appId": "1:447087578343:web:26a3a1f0ff9d477a786642",
  "storageBucket": "pr-school-vote.firebasestorage.app",
  "apiKey": "AIzaSyBA8OCuC7fY4VuefYxxq85cNX1vvIEjb0Q",
  "authDomain": "pr-school-vote.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "447087578343"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
