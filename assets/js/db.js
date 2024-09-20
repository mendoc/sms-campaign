import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { goToHomePage } from "./utils.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLI-SZHzfQgxAjyp0Dt90xyLnkYWYPYvs",
  authDomain: "mes-infos.firebaseapp.com",
  databaseURL: "https://mes-infos.firebaseio.com",
  projectId: "mes-infos",
  storageBucket: "mes-infos.appspot.com",
  messagingSenderId: "738073783804",
  appId: "1:738073783804:web:40ea2438006e43e3979679",
  measurementId: "G-NCL06LW1VE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function login(cberror) {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/spreadsheets.readonly");
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log(token, user);
    })
    .catch(cberror);
}

export function getCurrentUser(cb) {
  onAuthStateChanged(auth, cb);
}

export function logout(cberror) {
  signOut(auth)
    .then(() => {
      goToHomePage();
    })
    .catch(cberror);
}

export default app;
