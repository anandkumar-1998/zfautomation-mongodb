import firebase from "firebase/compat/app";
import { initializeApp } from 'firebase/app';
import { getStorage, } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
var clientCredentials = {

};
var env = process.env.NEXT_PUBLIC_ENVTYPE || "dev"
console.log("ENVTYPE " + env);
if (env === 'prod') {
    clientCredentials = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
} else {
    clientCredentials = {
        apiKey: process.env.NEXT_PUBLIC_DEV_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_DEV_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_DEV_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_DEV_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_DEV_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_DEV_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_DEV_FIREBASE_MEASUREMENT_ID
    };
}
const app = initializeApp(clientCredentials);
const auth = getAuth(app);
const db = getFirestore();
const storage = getStorage();
export { app, auth, db, storage };