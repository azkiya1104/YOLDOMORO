let timer;
let isRunning = false;
let currentMode = 'fokus'; // Mode awal
let totalSecondsPassed = 0; // Akumulasi total waktu (Fokus + Rehat) dalam detik
let cycleCount = 0; // Menghitung jumlah sesi fokus yang selesai

// Mengambil elemen dari HTML
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const modeText = document.getElementById('mode-text');
const eggImage = document.getElementById('egg-image');
const cycleDisplay = document.getElementById('cycle-display');
const currentProgressElem = document.getElementById('current-progress');
const maxTargetElem = document.getElementById('max-target');

// Fungsi untuk mengambil nilai input dari user
function getDuration() {
    return {
        focusMin: parseInt(document.getElementById('focus-input').value) || 15,
        breakMin: parseInt(document.getElementById('break-input').value) || 5,
        targetMin: parseInt(document.getElementById('target-input').value) || 60
    };
}

// Inisialisasi waktu awal saat pertama kali dimuat
let { focusMin } = getDuration();
let timeLeft = focusMin * 60;

// FUNGSI UTAMA: Update Tampilan Angka & Progres
function updateDisplay() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    
    // Format mm:ss
    minutesDisplay.textContent = m < 10 ? '0' + m : m;
    secondsDisplay.textContent = s < 10 ? '0' + s : s;
    
    // Update teks progres (X / Y Menit)
    updateProgressText();
}

function updateProgressText() {
    const { targetMin } = getDuration();
    const currentMin = Math.floor(totalSecondsPassed / 60);
    
    if (currentProgressElem) currentProgressElem.innerText = currentMin;
    if (maxTargetElem) maxTargetElem.innerText = targetMin;
}

// FUNGSI TIMER
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            // Waktu habis, hentikan interval dan proses pindah sesi
            clearInterval(timer);
            isRunning = false;
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    pauseTimer();
    currentMode = 'fokus';
    totalSecondsPassed = 0; 
    cycleCount = 0;
    
    const { focusMin } = getDuration();
    timeLeft = focusMin * 60;
    
    if (cycleDisplay) cycleDisplay.innerText = "0";
    modeText.innerText = "MODE: FOKUS";
    modeText.style.color = "#5D4037";
    eggImage.src = "assets/egg-focus.png"; 
    
    updateDisplay();
}

// LOGIKA PINDAH SESI & CEK TARGET
function handleSessionEnd() {
    const { focusMin, breakMin, targetMin } = getDuration();
    const targetSeconds = targetMin * 60;
    
    // Bunyi Notifikasi
    const bell = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    bell.play();

    if (currentMode === 'fokus') {
        // Selesai Fokus: Tambahkan waktu fokus ke akumulasi total
        totalSecondsPassed += (focusMin * 60);
        
        // Cek apakah target belajar total sudah terpenuhi setelah fokus?
        if (totalSecondsPassed >= targetSeconds) {
            finishLearning();
            return;
        }

        // Jika belum, lanjut ke Mode Rehat
        currentMode = 'rehat';
        let sisaWaktu = targetSeconds - totalSecondsPassed;
        // Ambil waktu rehat normal atau sisa target (mana yang lebih kecil)
        timeLeft = Math.min(breakMin * 60, sisaWaktu); 
        
        // Update UI Mode Rehat
        modeText.innerText = "MODE: REHAT (REBAHAN DULU 🍳)";
        modeText.style.color = "#FF8A65";
        eggImage.src = "assets/egg-rest.png"; // Gambar telur rebahan
        
        alert(`Sesi fokus selesai! Selamat rehat.`);

    } else {
        // Selesai Rehat: Tambahkan waktu rehat ke akumulasi total
        totalSecondsPassed += (breakMin * 60);

        // Cek lagi setelah rehat, apakah sudah mencapai target?
        if (totalSecondsPassed >= targetSeconds) {
            finishLearning();
            return;
        }

        // Jika belum, balik ke Mode Fokus
        currentMode = 'fokus';
        let sisaWaktu = targetSeconds - totalSecondsPassed;
        timeLeft = Math.min(focusMin * 60, sisaWaktu);

        // Update UI Mode Fokus
        modeText.innerText = "MODE: FOKUS (MELEK LAGI 🤓)";
        modeText.style.color = "#5D4037";
        eggImage.src = "assets/egg-focus.png"; // Gambar telur kacamata
        
        alert("Waktu rehat habis! Ayo lanjut fokus.");
    }

    updateDisplay();
    startTimer(); // Jalankan mode berikutnya secara otomatis
}

// Fungsi yang dipanggil saat total waktu (Fokus + Rehat) mencapai target
function finishLearning() {
    isRunning = false;
    clearInterval(timer);
    timeLeft = 0;
    
    // Update UI Selesai
    modeText.innerText = "Target Selesai! 🎉";
    modeText.style.color = "#4CAF50";
    eggImage.src = "assets/egg-finish.png"; // Gambar telur pecah/confetti
    
    updateDisplay();
    alert("YAY! Target waktu belajar kamu sudah tercapai. Timer berhenti!");
}

// Jalankan update tampilan pertama kali agar angka awal muncul
updateDisplay();