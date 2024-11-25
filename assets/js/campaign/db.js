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
    // Votre configuration Firebase
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const campaignId = urlParams.get("c");
  const btnLaunchCampaign = document.getElementById("btn-launch-campaign");
  const btnPrint = document.getElementById("btn-print");
  
  btnPrint.style = "display: none";

  if (campaignId) {
    const unsub = onSnapshot(doc(db, "progress", campaignId), async (doc) => {
      const campaignData = doc.data();

      const pageTitleEl = document.getElementById("page-title");

      setTextContent("campaign-name", campaignData.title);
      setTextContent("page-title", `${pageTitleEl.textContent} - ${campaignData.title}`);
      
      setTextContent("campaign-author", campaignData.author || "Inconnu");
      setTextContent("campaign-createdAt", formatDate(campaignData.createdAt));
      setTextContent("campaign-startedAt", formatDate(campaignData.startedAt));
      setTextContent("campaign-endedAt", `${formatDate(campaignData.endedAt)} ${campaignData.endedAt ? "(" + diffDate(campaignData.startedAt, campaignData.endedAt) + ")" : ""}`);
      // TODO Afficher la progression
      setTextContent("campaign-nb-recipients", campaignData.recipients.length);
      setTextContent("campaign-device", await getDeviceInfo(campaignId));
      setTextContent("campaign-message", campaignData.message);

      setTextContent(
        "campaign-nb-recipients-table",
        campaignData.recipients.length
      );

      const recipeintsEl = document.querySelector("#table-recipients tbody");
      recipeintsEl.innerHTML = "";
      let msgSent = 0;
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
              if (r.sent) msgSent++ 
      });

      if (campaignData.end) {
        btnLaunchCampaign.style = "display: none";
        btnPrint.style = "display: block";
        setTextContent("campaign-status", "Terminé");
      } else if (campaignData.startedAt > 0) {
        btnLaunchCampaign.setAttribute("disabled", true);
        btnLaunchCampaign.classList.remove("btn-primary");
        btnLaunchCampaign.classList.add("btn-success");
        btnLaunchCampaign.textContent = "En cours";
        setTextContent("campaign-status", `En cours (${parseInt(100 * msgSent / campaignData.recipients.length)}%)`);
      } else {
        setTextContent("campaign-status", "En attente de lancement");
      }

    });


    btnLaunchCampaign.addEventListener("click", launchCamppaign);

    function formatDate(dateMillis) {
      if (dateMillis === 0) return "--";
      return new Date(dateMillis).toLocaleString("fr-FR", {
        timeStyle: "long",
        dateStyle: "long",
      });
    }

    function diffDate(dateBegin, dateEnd) {
      const begin = parseInt(dateBegin);
      const end = parseInt(dateEnd);
      const durationMs = end - begin;
      const durationSec = durationMs / 1000;
      if (durationSec < 60) return `${parseInt(durationSec)} s`;
      const durationMin = durationSec / 60;
      if (durationMin < 60) return `${parseInt(durationMin)} mn ${parseInt(durationSec % 60)} s`;
      const durationHrs = durationMin / 60;
      return `${parseInt(durationHrs)} h ${parseInt(durationMin % 60)} mn`;
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
