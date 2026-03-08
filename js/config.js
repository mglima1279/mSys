import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js"
import { getFirestore, setDoc, doc, getDoc, collection, updateDoc, getDocs, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyBahDS_a_AvrDv--IrVuSGUdtp_Q5DW98s",
    authDomain: "msys-cca52.firebaseapp.com",
    projectId: "msys-cca52",
    storageBucket: "msys-cca52.firebasestorage.app",
    messagingSenderId: "685647449755",
    appId: "1:685647449755:web:a6869fc1f14b980e7b403e"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export {
    app,
    db,
    getDoc,
    setDoc,
    doc,
    collection,
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateDoc,
    getDocs,
    deleteDoc,
    addDoc
}