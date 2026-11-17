/* -------------------
    ステータス
------------------*/
loadStatus();
loadInventory();

/* -------------------------
   初回プレゼント
------------------------- */

function giveFirstGift() {
    const initialized =
        localStorage.getItem("inventoryInitialized");

    // すでにプレゼントを受け取っていたら何もしない
    if (initialized === "true") {
        return;
    }

    // ボール ver.1 を5個プレゼント
    inventory["ball_1"] = 5;

    // 所持品を保存
    saveInventory();

    // 受け取り済みにする
    localStorage.setItem("inventoryInitialized", "true");

    console.log("初回プレゼント：ボール ver.1 を5個！");
}

// 所持品の読み込み後に実行
giveFirstGift();

/* -------------------------
   要素取得
------------------------- */
const hpBar = document.getElementById("play-hp");
const hungerBar = document.getElementById("play-hunger");
const loveBar = document.getElementById("play-love");
const stressBar = document.getElementById("play-stress");

const gameArea = document.getElementById("game-area");
const kokoro = document.getElementById("kokoro");
const dayText = document.getElementById("day");
const backBtn = document.getElementById("back-btn");

const resultModal = document.getElementById("result-modal");
const earnedCoinText = document.getElementById("earned-coin");
const homeBtn = document.getElementById("home-btn");

const volume = document.getElementById("volum");
const seVolumeSlider = document.getElementById("se-volum");
const bgm = document.getElementById("bgm");
const se = document.getElementById("se");

const settingBtn = document.getElementById("p_setting-btn");
const settingPanel = document.getElementById("p_setting-panel");

const ball = document.getElementById("ball");
const coinText = document.getElementById("coin");
const timeText = document.getElementById("time");
const coinEffect = document.getElementById("coin-effect");

const timerFill = document.getElementById("timer-fill");

/* -------------------------
   おうちへ戻る共通処理
------------------------- */

let isLeaving = false;

function goHome() {

    // 二重クリック防止
    if (isLeaving) return;
    isLeaving = true;

    // データ保存
    saveStatus();
    saveInventory();

    // ロード画面を表示
    showLoading("おうちに帰っているよ 🐾");

    // ロード演出後に移動
    setTimeout(() => {
        location.href = "index.html";
    }, 3000);
}

/* -------------------------
   日付変動
------------------------- */

setInterval(() => {
    day++;
    dayText.textContent = `Day ${day}`;
    saveStatus();
}, 300000);

/* -------------------------
   バー更新
------------------------- */
function updateBars(){
    hpBar.style.width = hp + "%";
    hungerBar.style.width = hunger + "%";
    loveBar.style.width = love + "%";
    stressBar.style.width = stress + "%";
    dayText.textContent = `Day ${day}`;
}

/* -------------------------
   選択中のボールを反映
------------------------- */

function updateBallImage() {
    const product = shopProducts[selectedBall];

    if (!product || !ball){
        console.error("アイテム情報が見つからないよ！", selectedBall);
        return
    } ;

    ball.src = product.image;
    ball.alt = product.name;
}

/* -------------------------
   アイテムを1個消費
------------------------- */

function consumeBall() {
    const itemId = selectedBall;
    const count = inventory[itemId] || 0;

    if (count <= 0) {
        alert("このアイテムは持っていないよ！");
        goHome();
        return false;
    }
    // 選択したアイテムを1個消費
    inventory[itemId] = count - 1;

    if (inventory[itemId] <= 0) {
        delete inventory[itemId];

        // 別のアイテムに勝手に切り替えず、
        // 今回のプレイでは選択したアイテムを維持する
    }

    saveInventory();

    return true;
}


/* -------------------------
    追いかける
------------------------- */
// 犬の位置
let dogX = gameArea.clientWidth / 2;
let dogY = gameArea.clientHeight / 2;
// マウスの位置
let mouseX = dogX;
let mouseY = dogY;
// マウスが動いたら座標を保存
gameArea.addEventListener('mousemove',(e)=>{
    const rect = gameArea.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
})
//犬移動
function moveDog(){
    const speed = 0.05;
    dogX += (mouseX - dogX) * speed;
    dogY += (mouseY - dogY) * speed;
    kokoro.style.left = dogX + "px";
    kokoro.style.top = dogY + "px";

    requestAnimationFrame(moveDog);
}
moveDog();

/* -------------------------
    コイン
------------------------- */

coinText.textContent = coin;

coinEffect.style.left = ball.style.left;
coinEffect.style.top = ball.style.top;

coinEffect.style.display = "block";

coinEffect.classList.remove("coin-animation");
void coinEffect.offsetWidth;
coinEffect.classList.add("coin-animation");

setTimeout(() => {
    coinEffect.style.display = "none";
}, 600);

/* -------------------------
    遊ぶ・ボール移動
------------------------- */

/* -------------------------
    ボール移動
------------------------- */

function moveBall() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    const ballWidth = ball.offsetWidth;
    const ballHeight = ball.offsetHeight;

    // ボールがゲームエリアからはみ出さない範囲
    const maxX = Math.max(0, areaWidth - ballWidth);
    const maxY = Math.max(0, areaHeight - ballHeight);

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
}

/* -------------------------
   遊び開始時のボール設定
------------------------- */
// 選択中のボールを1個消費
if (consumeBall()) {
    // ボールの画像を反映
    updateBallImage();
    // ボールを表示して配置
    ball.style.display = "block";
    moveBall();
} else {
    // ボールを持っていない場合は遊べない
    ball.style.display = "none";
}

ball.addEventListener("click", () => {

    // くまのぬいぐるみは5コイン、ボールは1コイン
    if (selectedBall.startsWith("doll_")) {
        coin += 5;
    } else {
        coin += 1;
    }

    saveStatus();
    updateCoin();

    // 効果音
    se.currentTime = 0;
    se.play();

    // コイン獲得エフェクト
    coinEffect.style.left = ball.style.left;
    coinEffect.style.top = ball.style.top;

    coinEffect.style.display = "block";

    coinEffect.classList.remove("coin-animation");
    void coinEffect.offsetWidth;
    coinEffect.classList.add("coin-animation");

    setTimeout(() => {
        coinEffect.style.display = "none";
    }, 600);

    // アイテムを移動
    moveBall();
});

// あそび開始時のコイン数
const startCoin = coin;

// あそび終了フラグ
let gameFinished = false;

/* ------------
    制限時間
------------ */
let time = 30;
const maxTime = 30;
let timer = null;

timeText.textContent = time;
timerFill.style.width = "100%";

function startTimer() {
    if (timer !== null || gameFinished) return;

    timer = setInterval(() => {
        time--;

        timeText.textContent = time;
        timerFill.style.width = (time / maxTime) * 100 + "%";

        if (time <= 0) {
            finishPlay();
        }
    }, 1000);
}

/* -------------------------
   あそび終了
------------------------- */

function finishPlay() {
    // 二重実行を防ぐ
    if (gameFinished) return;

    gameFinished = true;
    clearInterval(timer);

    // ボールを隠す
    ball.style.display = "none";

    // こころのステータスを更新
    hp = Math.max(hp - 20, 0);
    hunger = Math.max(hunger - 15, 0);
    stress = Math.max(stress - 10, 0);
    love = Math.min(love + 5, 100);

    // ステータスとコインを保存
    saveStatus();

    // 今回獲得したコイン数を表示
    const earnedCoin = coin - startCoin;
    earnedCoinText.textContent = earnedCoin;

    // 結果画面を表示
    resultModal.style.display = "flex";
}

/* -------------------------
    おうちへ
------------------------- */

backBtn.addEventListener("click", () => {
    goHome();
});

homeBtn.addEventListener("click", () => {
    goHome();
});
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


se.volume = seVolumeValue / 100;

saveSoundSettings();

});

// BGM再生
document.addEventListener("click", () => {
bgm.play().catch(() => {
console.log("BGMを再生できませんでした");
});
}, { once: true });

/* -------------------------
   初期化
------------------------- */
updateBars();
updateDay();
updateCoin();