import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  setDoc,
  doc,
  collection,
  onSnapshot,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

(async () => {
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
  const db = getFirestore(app);

  const campaignNumber = Date.now().toString().substring(10, 13);
  document.getElementById(
    "text-campaign-name"
  ).value = `Campagne ${campaignNumber}`;

  document.getElementById(
    "text-campaign-message"
  ).value = `Message de la campagne ${campaignNumber}`;

  document
    .getElementById("form-new-campaign")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      let campaignObj = {
        author: "",
        end: false,
        createdAt: Date.now(),
        startedAt: 0,
        endedAt: 0,
      };
      let device;
      document.querySelectorAll("[role=field]").forEach((el) => {
        const name = el.getAttribute("name");
        const value = el.value;

        if (name === "device") device = value;
        else if (name === "recipients" && value) {
          const recipientsArr = [];
          value.split(",").forEach((recip) => {
            recipientsArr.push({
              name: "",
              number: recip.trim(),
              sent: false,
              sentAt: 0,
            });
          });
          campaignObj[name] = recipientsArr;
        } else campaignObj[name] = value;
      });
      if (campaignObj) {
        if (!campaignObj.message || campaignObj.message.length === 0) {
          console.log("Veuillez renseigner le message à envoyer.");
          return;
        }
        console.log(campaignObj.recipients);
        if (!campaignObj.recipients || campaignObj.recipients.length === 0) {
          console.log("Veuillez renseigner au moins 1 destinataire.");
          return;
        }

        if (!device) {
          console.log(
            "Veuillez choisir le smartphone à utiliser pour la campagne."
          );
          return;
        }

        await setDoc(doc(db, "campaigns", device), campaignObj);
        await setDoc(doc(db, "progress", device), campaignObj);
        location.href = `/campaign.html?c=${device}`;
      }
    });

  const querySnapshot = await getDocs(collection(db, "devices"));
  const selectEl = document.getElementById("select-campaign-device");
  querySnapshot.forEach((doc) => {
    var opt = document.createElement("option");
    opt.value = doc.id;
    opt.innerHTML = doc.data().deviceName;
    selectEl.appendChild(opt);
  });
})();
