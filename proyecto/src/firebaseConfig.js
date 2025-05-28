// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkKgrkTTIVLiEt5EsM1jbDgCJKQ7ohUx8",
  authDomain: "myapp-8d34d.firebaseapp.com",
  projectId: "myapp-8d34d",
  storageBucket: "myapp-8d34d.appspot.com",   // corregido: antes tenía un typo en “appp”
  messagingSenderId: "384143776546",
  appId: "1:384143776546:web:23696761661db409a5a37b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
