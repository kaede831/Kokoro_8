/* -------------------------
   ステータス読み込み
------------------------- */
loadStatus();
loadInventory();

/* -------------------------
   要素取得
------------------------- */

const dayText = document.getElementById("day");

const petGauge = document.getElementById("pet-gauge-fill");

const hungerBar = document.getElementById("hunger-bar");
const loveBar = document.getElementById("love-bar");
const stressBar = document.getElementById("stress-bar");
const hpBar = document.getElementById("hp-bar");

const feedBtn = document.getElementById("food-btn");
const petBtn = document.getElementById("pet-btn");
const playBtn = document.getElementById("play-btn");
const sleepBtn = document.getElementById("sleep-btn");
const settingBtn = document.getElementById("setting-btn");
const shopBtn = document.getElementById("shop-btn");

const settingPanel = document.getElementById("setting-panel");

const volume = document.getElementById("volum");
const bgm = document.getElementById("bgm");
const se = document.getElementById("se");
const seVolumeSlider = document.getElementById("se-volum");

const inventoryBtn = document.getElementById("inventory-btn");
const inventoryPanel = document.getElementById("inventory-panel");
const inventoryList = document.getElementById("inventory-list");
const inventoryClose = document.getElementById("inventory-close");

const resetOpen = document.getElementById("reset-open");
const resetModal = document.getElementById("reset-modal");
const cancelReset = document.getElementById("cancel-reset");
const doReset = document.getElementById("do-reset");

const coinText = document.getElementById("coin");

const kokoro = document.getElementById("kokoro");
const kokoroMessage = document.getElementById("kokoro-message");

// ゲーム開始状態
let gameStarted = false;
/* -------------------------
   こころの成長
------------------------- */

let originalKokoroWidth = 0;

function updateGrowth() {
    // 元の画像サイズを記録
    if (originalKokoroWidth === 0) {
        originalKokoroWidth = kokoro.offsetWidth;
    }

    // 10日ごとに成長
    const growthSteps = Math.floor((day - 1) / 10);

    // 10日ごとに5%ずつ大きくする
    const growthSize = Math.min(
        1 + growthSteps * 0.05,
        1.5
    );

    // 元のサイズを基準に成長させる
    kokoro.style.width =
        originalKokoroWidth * growthSize + "px";
}

/* -------------------------
   バー更新
------------------------- */

function updateBars() {

    hungerBar.style.width = hunger + "%";
    loveBar.style.width = love + "%";
    stressBar.style.width = stress + "%";
    hpBar.style.width = hp + "%";

    dayText.textContent = `Day ${day}`;
}

/* -------------------------
   表情変更
------------------------- */

function updateFace() {
    if (stress >= 70) {
        kokoro.src = "img/dog_angry.png";
    } else if (hp <= 30) {
        kokoro.src = "img/dog_sad.png";
    } else if (hunger <= 30) {
        kokoro.src = "img/dog_sad.png";
    } else if (love >= 80) {
        kokoro.src = "img/dog_fun.png";
    } else {
        kokoro.src = "img/dog.png";
    }
}

/* -------------------------
BGM / SE
------------------------- */

// 共通の音量設定を読み込む
loadSoundSettings();

// 音量を反映
bgm.volume = bgmVolume / 100;
se.volume = seVolume / 100;

// スライダーに現在の音量を表示
volume.value = bgmVolume;
seVolumeSlider.value = seVolume;

// BGM音量
volume.addEventListener("input", () => {
bgmVolume = Number(volume.value);

bgm.volume = bgmVolume / 100;

saveSoundSettings();

volume.style.background =
    `linear-gradient(
        to right,
        #f3b2c1 0%,
        #f3b2c1 ${bgmVolume}%,
        #d8d3c9 ${bgmVolume}%,
        #d8d3c9 100%
    )`;
});

// 効果音量
seVolumeSlider.addEventListener("input", () => {
seVolume = Number(seVolumeSlider.value);

se.volume = seVolume / 100;

saveSoundSettings();

});

/* -------------------------
   コイン
------------------------- */

function updateCoinDisplay() {

    coinText.textContent = coin;

};

/* -------------------------
   所持品一覧を表示
------------------------- */

function renderInventory() {
    inventoryList.innerHTML = "";

    const ownedItems = itemOrder
        .map(itemId => [itemId, inventory[itemId] || 0])
        .filter(([itemId, count]) => {
            return shopProducts[itemId] && count > 0;
        });

    if (ownedItems.length === 0) {
        inventoryList.innerHTML =
            "<p>まだアイテムを持っていないよ。</p>";
        return;
    }

    ownedItems.forEach(([itemId, count]) => {
        const product = shopProducts[itemId];

        const card = document.createElement("div");
        card.className = "item-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.className = "inventory-image";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const quantity = document.createElement("p");
        quantity.textContent = `所持数：${count}`;

        // 1タップでもらえるコイン数
        const earnCoin = document.createElement("p");
        earnCoin.className = "earn-coin";
        earnCoin.textContent =
            `1タップで＋${product.earnCoin}コイン`;

        const useButton = document.createElement("button");
        useButton.className = "use-btn";

        useButton.textContent =
            selectedBall === itemId
                ? "使用中"
                : "使う";

        useButton.disabled = selectedBall === itemId;

        useButton.addEventListener("click", () => {
            askToSelectBall(itemId);
        });

        card.append(image, name, earnCoin, quantity, useButton);
        inventoryList.appendChild(card);
    });
}
/* -------------------------
所持品一覧の開閉
------------------------- */

inventoryBtn.addEventListener("click", () => {
renderInventory();
inventoryPanel.style.display = "block";
});

inventoryClose.addEventListener("click", () => {
inventoryPanel.style.display = "none";
});
/* -------------------------
   ボール選択確認パネル
------------------------- */

let pendingBallId = null;

const itemConfirmPanel =
    document.getElementById("item-confirm-panel");

const confirmItemImage =
    document.getElementById("confirm-item-image");

const confirmItemName =
    document.getElementById("confirm-item-name");

const confirmItemEarnCoin =
    document.getElementById("confirm-item-earn-coin");

const itemConfirmYes =
    document.getElementById("item-confirm-yes");

const itemConfirmNo =
    document.getElementById("item-confirm-no");

// 確認パネルを開く
function askToSelectBall(itemId) {
    const product = shopProducts[itemId];

    if (!product || (inventory[itemId] || 0) <= 0) {
        alert("このアイテムは持っていないよ！");
        return;
    }

    // 選択候補を保存
    pendingBallId = itemId;

    // パネルにボールの情報を表示
    confirmItemImage.src = product.image;
    confirmItemImage.alt = product.name;
    confirmItemName.textContent = product.name;
    confirmItemEarnCoin.textContent =
    `1タップで＋${product.earnCoin}コイン`;

    // パネルを表示
    itemConfirmPanel.style.display = "flex";
}

// 「選ぶ！」を押したとき
itemConfirmYes.addEventListener("click", () => {
    if (pendingBallId === null) return;

    const product = shopProducts[pendingBallId];

    if (!product || (inventory[pendingBallId] || 0) <= 0) {
        alert("このアイテムは持っていないよ！");
        itemConfirmPanel.style.display = "none";
        pendingBallId = null;
        return;
    }

    // ボールを選択
    selectedBall = pendingBallId;

    // 選択したボールを保存
    saveInventory();

    // パネルを閉じる
    itemConfirmPanel.style.display = "none";
    pendingBallId = null;

    // 所持品一覧を更新
    renderInventory();

});

// 「やめる」を押したとき
itemConfirmNo.addEventListener("click", () => {
    itemConfirmPanel.style.display = "none";
    pendingBallId = null;
});
document.querySelectorAll(".item-earn-coin").forEach(element => {
    const itemId = element.dataset.item;
    const product = shopProducts[itemId];

    if (product) {
        element.textContent =
            `1タップで+${product.earnCoin}コイン`;
    }
});
/* -------------
　初期化
------------ */
updateCoin();


/* -------------------------
    店へ行く
------------------------- */

shopBtn.addEventListener("click", () => {
    saveStatus();
    location.href = "shop.html";
})

/* -------------------------
   ごはん
------------------------- */

feedBtn.addEventListener("click", () => {

    hunger += 15;

    if (hunger > 100) {
        hunger = 100;
    }

    hp += 3;

    if (hp > 100) {
        hp = 100;
    }

    stress -= 3;

    if (stress < 0) {
        stress = 0;
    }

    kokoro.classList.add("bounce");

    setTimeout(() => {
        kokoro.classList.remove("bounce");
    }, 300);

    se.currentTime = 0;
    se.play();

    saveStatus();
    updateBars();
    updateFace();
    checkMaxStatus("hunger");

});


/* -------------------------
   なでる
------------------------- */

let petMode = false;
let petTimer = 0;
let petCountdown = null;

petBtn.addEventListener("click", () => {

    document.body.style.cursor = 'url("../img/hand.png"), auto';

    petMode = true;

    se.currentTime = 0;
    se.play();

    let timeLeft = 5;

    petGauge.style.width = "100%";

    if (petCountdown) {
        clearInterval(petCountdown);
    }

    petCountdown = setInterval(() => {

        timeLeft--;

        petGauge.style.width =
            (timeLeft / 5) * 100 + "%";

        if (timeLeft <= 0) {

            clearInterval(petCountdown);

            petMode = false;

            petGauge.style.width = "0%";

            document.body.style.cursor = "default";

        }

    }, 1000);

});


function petKokoro() {

    if (!petMode) {
        return;
    }

    const now = Date.now();

    if (now - petTimer < 300) {
        return;
    }

    petTimer = now;

    love += 2;

    if (love > 100) {
        love = 100;
    }

    stress -= 2;

    if (stress < 0) {
        stress = 0;
    }

    kokoro.classList.add("happy");

    setTimeout(() => {
        kokoro.classList.remove("happy");
    }, 200);

    saveStatus();
    updateBars();
    updateFace();
    checkMaxStatus("love");

};
/* ----------------
    PC:マウス
-------------- */
kokoro.addEventListener('mousemove', () =>{
    petKokoro();
});
/* ---------------
    スマホ:指
-------------- */
kokoro.addEventListener("touchmove", (e) =>{
    if (!petMode){
        return
    };
    e.preventDefault ();

    petKokoro();
},{passive: false});
/* -------------------------
   あそぶ
------------------------- */

playBtn.addEventListener("click", () => {

    // 現在の状態を保存
    saveStatus();

    // ゲーム内時間を一時停止
    gameStarted = false;

    // なでる処理も停止
    petMode = false;

    if (petCountdown) {
        clearInterval(petCountdown);
        petCountdown = null;
    }

    document.body.style.cursor = "default";

    // ミニゲームから戻ることを記録
    sessionStorage.setItem("returnFromPlay", "true");

    se.currentTime = 0;
    se.play();

    setTimeout(() => {
        location.href = "play.html";
    }, 150);

});

/* -------------------------
   ねる
------------------------- */

sleepBtn.addEventListener("click", () => {

    hp += 20;

    if (hp > 100) {
        hp = 100;
    }

    hunger -= 5;

    if (hunger < 0) {
        hunger = 0;
    }

    stress -= 10;

    if (stress < 0) {
        stress = 0;
    }

    se.currentTime = 0;
    se.play();

    saveStatus();
    updateBars();
    updateFace();

});
/* ----------------
こころのセリフ
--------------- */
let messageTimer;

// セリフを表示する関数
function showKokoroMessage(message) {
    if (!kokoroMessage) return;

    const messageArea = kokoroMessage.parentElement;

    const newMessage = document.createElement("div");

    newMessage.className = "kokoro-message-item";
    newMessage.textContent = message;

    // 連続表示時に少しずつ下へずらす
    const activeMessages =
        messageArea.querySelectorAll(".kokoro-message-item").length;

    newMessage.style.bottom =
        (130 - activeMessages * 20) + "px";

    messageArea.appendChild(newMessage);

    setTimeout(() => {
        newMessage.remove();
    }, 2500);
}
// MAX時のセリフ
function checkMaxStatus(forceKey = null) {

    const statusList = {
        hunger: hunger,
        love: love,
        stress: stress
    };

    const messages = {
        hunger: "おなかいっぱい！",
        love: "♥",
        stress: "💢"
    };

    for (const key in statusList) {
        const isMax = statusList[key] >= 100;

        // MAXになった瞬間、またはMAX状態で対応する操作をしたとき
        if (isMax && (!previousMaxStatus[key] || forceKey === key)) {
            showKokoroMessage(messages[key]);
        }

        previousMaxStatus[key] = isMax;
    }
}
/* -------------------------
   設定
------------------------- */

settingBtn.addEventListener("click", () => {

    if (settingPanel.style.display === "block") {

        settingPanel.style.display = "none";

    } else {

        settingPanel.style.display = "block";

    }

});

/* -------------------------
   リセットモーダル
------------------------- */

resetOpen.addEventListener("click", () => {

    resetModal.style.display = "flex";

});


cancelReset.addEventListener("click", () => {

    resetModal.style.display = "none";

});


doReset.addEventListener("click", () => {

    resetStatus();

    loadStatus();

    resetModal.style.display = "none";

    updateBars();
    updateFace();
    updateDay();
    updateCoin();

});


/* -------------------------
   Dayの経過
   5分 = 1 Day
------------------------- */

setInterval(() => {

    if (!gameStarted) return;

    day++;

    saveStatus();
    updateBars();
    updateGrowth();

}, 300000);

/* -------------------------
   ステータス時間経過
   5秒ごと
------------------------- */

setInterval(() => {

    if (!gameStarted) return;

    love -= 2;
    hunger -= 1;
    stress += 1;

    if (love < 0) love = 0;
    if (hunger < 0) hunger = 0;
    if (stress > 100) stress = 100;

    saveStatus();

    updateBars();
    updateFace();

}, 5000);

/* =========================
   ゲーム開始・終了
========================= */

const titleScreen = document.getElementById("title-screen");
const endingScreen = document.getElementById("ending-screen");

const startGameBtn = document.getElementById("start-game-btn");
const titleReturnBtn = document.getElementById("title-return-btn");
const endGameBtn = document.getElementById("end-game-btn");

const loadingScreen = document.getElementById("loading-screen");
const gameScreen = document.querySelector(".game");
// すでにゲームを開始したことがある場合
if (sessionStorage.getItem("hasStartedGame") === "true") {

    // タイトル画面とロード画面を隠す
    titleScreen.style.display = "none";

    // ゲーム本編を表示
    gameScreen.style.visibility = "visible";

    // ゲーム開始状態にする
    gameStarted = true;

    // BGM再生
    bgm.play().catch(() => {
        console.log("BGMを再生できませんでした");
    });

}
// ゲーム開始
startGameBtn.addEventListener("click", () => {

    if (gameStarted) return;
    sessionStorage.setItem("hasStartedGame", "true");
    startGameBtn.disabled = true;

    // タイトル画面を隠す
    titleScreen.style.display = "none";

    // ロード画面を表示
    loadingScreen.style.display = "flex";
    loadingScreen.classList.remove("hide");

    // ロード演出
    setTimeout(() => {

        loadingScreen.classList.add("hide");

        setTimeout(() => {

            loadingScreen.style.display = "none";

            // ゲーム本編を表示
            gameScreen.style.visibility = "visible";

            gameStarted = true;

            // BGM再生
            bgm.play().catch(() => {
                console.log("BGMを再生できませんでした");
            });

        }, 600);

    }, 800);

});

// ゲーム終了
function endGame() {

    gameStarted = false;

    // なでる処理を停止
    petMode = false;

    if (petCountdown) {
        clearInterval(petCountdown);
        petCountdown = null;
    }

    document.body.style.cursor = "default";

    // データ保存
    saveStatus();
    saveInventory();

    // BGM停止
    bgm.pause();
    bgm.currentTime = 0;

    // 設定などを閉じる
    settingPanel.style.display = "none";
    inventoryPanel.style.display = "none";

    // ゲーム本編を隠す
    gameScreen.style.visibility = "hidden";

    // ロード画面を表示
    showLoading("こころとの思い出を振り返ろう 🐾");

    // エンディング画面を準備
    endingScreen.style.display = "flex";

    // 少し待ってからロード画面を閉じる
    setTimeout(() => {
        hideLoading();
    }, 800);
}
// 終了ボタン
endGameBtn.addEventListener("click", () => {

    const answer = confirm("ゲームを終了する？");

    if (answer) {
        endGame();
    }

});

// タイトルへ戻る
titleReturnBtn.addEventListener("click", () => {

    // ロード画面を表示
    showLoading("タイトルに戻っているよ 🐾");

    // ゲーム開始状態をリセット
    gameStarted = false;
    sessionStorage.removeItem("hasStartedGame");

    setTimeout(() => {

        // エンディング画面を隠す
        endingScreen.style.display = "none";

        // ゲーム本編を隠す
        gameScreen.style.visibility = "hidden";

        // タイトル画面を表示
        titleScreen.style.display = "flex";

        // 開始ボタンを再び押せるようにする
        startGameBtn.disabled = false;

        // ロード画面を閉じる
        hideLoading();

    }, 800);

});

/* -------------------------
   初期化
------------------------- */

updateBars();
updateFace();
updateDay();
updateGrowth();
