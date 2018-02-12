import browser from "webextension-polyfill";
import "./style.css";

function restoreOptions() {
  browser.storage.local.get(["apiKey", "eyesServer", "seideId"]).then((options) => {
    document.getElementById("api_key").value = options.apiKey || "";
    document.getElementById("eyes_server").value = options.eyesServer || "";
    document.getElementById("seide_id").value = options.seideId || "";
  });
}

function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    apiKey: document.getElementById("api_key").value,
    eyesServer: document.getElementById("eyes_server").value,
    seideId: document.getElementById("seide_id").value
  }).then(() => {
    window.close();
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
