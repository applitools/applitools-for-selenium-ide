import browser from "webextension-polyfill";
import "./style.css";

let showAdvanced = false;

function restoreOptions() {
  browser.storage.local.get(["apiKey", "eyesServer", "branch", "parentBranch", "seideId"]).then((options) => {
    document.getElementById("api_key").value = options.apiKey || "";
    document.getElementById("eyes_server").value = options.eyesServer || "";
    document.getElementById("branch").value = options.branch || "";
    document.getElementById("parent_branch").value = options.parentBranch || "";
    document.getElementById("seide_id").value = options.seideId || "";
  });
}

function saveOptions(e) {
  e.preventDefault();
  console.log(document.getElementById("branch").value);
  browser.storage.local.set({
    apiKey: document.getElementById("api_key").value,
    eyesServer: document.getElementById("eyes_server").value,
    branch: document.getElementById("branch").value,
    parentBranch: document.getElementById("parent_branch").value,
    seideId: document.getElementById("seide_id").value
  }).then(() => {
    window.close();
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

document.getElementById("advanced-toggle").addEventListener("click", () => {
  const advancedButton = document.getElementById("advanced-toggle");
  const advancedContainer = document.getElementById("advanced");
  showAdvanced = !showAdvanced;
  if (showAdvanced) {
    advancedContainer.style.display = "block";
    advancedButton.innerText = "Hide advanced settings ∧";
  } else {
    advancedContainer.style.display = "none";
    advancedButton.innerText = "Show advanced settings ∨";
  }
});
