function showLoading(message = "こころが待っているよ") {
    const loading = document.getElementById("loading-screen");
    const messageElement = loading?.querySelector(".loading-content > p:first-child");

    if (!loading) return;

    loading.style.display = "flex";
    loading.classList.remove("hide");

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function hideLoading() {
    const loading = document.getElementById("loading-screen");

    if (!loading) return;

    loading.classList.add("hide");

    setTimeout(() => {
        loading.style.display = "none";

        // ローディング画面が完全に消えてから遊び時間を開始
        if (typeof startTimer === "function") {
            startTimer();
        }

    }, 1000);
}

window.addEventListener("load", () => {
    setTimeout(hideLoading, 5000);
});