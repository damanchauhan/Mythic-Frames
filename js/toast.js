/* ==========================================
   TOAST
========================================== */

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const toastIcon = document.getElementById("toastIcon");

let toastTimeout;

function showToast(message, icon = "✓") {

    if (!toast) return;

    clearTimeout(toastTimeout);

    toastText.textContent = message;
    toastIcon.textContent = icon;

    toast.classList.add("show");

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}