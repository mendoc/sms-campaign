export function setLoaderVisibility(visible) {
  document.getElementById("loader-block").style.display = visible
    ? "flex"
    : "none";
}

export function setContentVisibility(visible) {
  document.getElementById("content-block").style.display = visible
    ? "block"
    : "none";
}

export function goToHomePage() {
    location.href = "/";
}

export function onClick(elId, cb) {
  document.getElementById(elId).addEventListener("click", cb);
}