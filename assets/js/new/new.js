(() => {
  let tokenClient;
  let accessToken = null;

  const DISCOVERY_DOC =
    "https://sheets.googleapis.com/$discovery/rest?version=v4";
  const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
  const CLIENT_ID =
    "738073783804-1jv29evpi9j7er483mcq8d954rmsa0fs.apps.googleusercontent.com";
  const API_KEY = "AIzaSyCtgzjDM11qSIzxlYVj39o8cYyR0IqGa3Q";
  const APP_ID = "738073783804";

  // Use the API Loader script to load google.picker
  function onApiLoad() {
    gapi.load("client:picker", onPickerApiLoad);
  }

  async function onPickerApiLoad() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
    });
  }

  // Create and render a Google Picker object for selecting from Drive.
  function createPicker() {
    const showPicker = () => {
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.SPREADSHEETS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(API_KEY)
        .setCallback(pickerCallback)
        .setAppId(APP_ID)
        .build();
      picker.setVisible(true);
    };

    // Request an access token.
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        throw response;
      }
      accessToken = response.access_token;
      showPicker();
    };

    if (accessToken === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }

  // A simple callback implementation.
  function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      let doc = data[google.picker.Response.DOCUMENTS][0];
      const { id, name } = doc;
      // TODO Afficher le nom du document dans le helper du champ des destinataires
      console.log(name);
      extractRecipients(id);
    }
  }

  async function extractRecipients(fileId) {
    const response = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: fileId,
    });

    if (!response.result) return;

    const sheet = response.result.sheets[0];
    const sheetName = sheet.properties.title;
    const range = `${sheetName}!A1:B`;

    gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: fileId,
        range: range,
      })
      .then(function (response) {
        const data = response.result.values;
        let recipients = [];
        for (let i = 0; i < data.length; i++) {
          // TODO Contaténer le nom du destinataire au numéro
          if (isValidNumber(data[i][0])) recipients.push(data[i][0]);
        }
        document.getElementById("text-campaign-recipients").value =
          recipients.join(", ");
      });
  }

  function isValidNumber(num) {
    // TODO Implémenter la validation des numéros
    return true;
  }

  document
    .getElementById("btn-import-recipients")
    .addEventListener("click", createPicker);
  window.addEventListener("load", function () {
    onApiLoad();
    gisLoaded();
  });
})();
