import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  updateDoc,
  doc,
  collection,
  getDoc,
  onSnapshot,
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

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const campaignId = urlParams.get("c");
  const btnLaunchCampaign = document.getElementById("btn-launch-campaign");

  if (campaignId) {
    const unsub = onSnapshot(doc(db, "progress", campaignId), async (doc) => {
      const campaignData = doc.data();

      if (campaignData.end) {
        btnLaunchCampaign.style = "display: none";
        setTextContent("campaign-status", "Terminé");
      } else if (campaignData.startedAt > 0) {
        btnLaunchCampaign.classList.remove("btn-primary");
        btnLaunchCampaign.classList.add("btn-success");
        btnLaunchCampaign.textContent = "En cours";
        setTextContent("campaign-status", "En cours");
      } else {
        setTextContent("campaign-status", "En attente de lancement");
      }

      setTextContent("campaign-name", campaignData.title);
      setTextContent("campaign-author", campaignData.author || "Inconnu");
      setTextContent("campaign-createdAt", formatDate(campaignData.createdAt));
      setTextContent("campaign-startedAt", formatDate(campaignData.startedAt));
      setTextContent("campaign-endedAt", formatDate(campaignData.endedAt));
      // TODO Afficher la progression
      setTextContent("campaign-nb-recipients", campaignData.recipients.length);
      setTextContent("campaign-device", await getDeviceInfo(campaignId));
      setTextContent("campaign-message", campaignData.message);

      setTextContent(
        "campaign-nb-recipients-table",
        campaignData.recipients.length
      );

      const recipeintsEl = document.querySelector("table tbody");
      recipeintsEl.innerHTML = "";
      campaignData.recipients.forEach((r, idx) => {
        recipeintsEl.innerHTML += `<tr>
                <th scope="row">${idx + 1}</th>
                <td>${r.name || "Non renseigné"}</td>
                <td>${r.number}</td>
                <td>${
                  r.sent
                    ? "Envoyé le " + formatDate(r.sentAt)
                    : '<p class="fst-italic">En attente ...</p>'
                }</td>
              </tr>`;
      });
    });

    btnLaunchCampaign.addEventListener("click", launchCamppaign);

    function formatDate(dateMillis) {
      if (dateMillis === 0) return "--";
      return new Date(dateMillis).toLocaleString("fr-FR", {
        timeStyle: "long",
        dateStyle: "long",
      });
    }

    function setTextContent(elId, text) {
      document.getElementById(elId).textContent = text;
    }

    async function launchCamppaign() {
      btnLaunchCampaign.setAttribute("disabled", true);
      const campaignRef = doc(db, "campaigns", campaignId);

      await updateDoc(campaignRef, {
        startedAt: Date.now(),
      });
    }

    async function getDeviceInfo(campaignId) {
      const deviceRef = doc(db, "devices", campaignId);
      const deviceSnap = await getDoc(deviceRef);

      if (deviceSnap.exists()) {
        return deviceSnap.data().deviceName || "Appareil inconnu";
      }
    }
  }
})();
