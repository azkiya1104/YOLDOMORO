let timer;
let isRunning = false;
let currentMode = 'fokus';
let totalSecondsPassed = 0;
let widget;

// Ambil Elemen
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const modeText = document.getElementById('mode-text');
const eggImage = document.getElementById('egg-image');
const currentProgressElem = document.getElementById('current-progress');
const maxTargetElem = document.getElementById('max-target');
const musicSelect = document.getElementById('music-select');
const volumeSlider = document.getElementById('volume');
const scIframe = document.getElementById('sc-widget');

// Load SoundCloud API
const scScript = document.createElement('script');
scScript.src = "https://w.soundcloud.com/player/api.js";
document.head.appendChild(scScript);

scScript.onload = () => {
    widget = SC.Widget(scIframe);
};

function getDuration() {
    return {
        focusMin: parseInt(document.getElementById('focus-input').value) || 15,
        breakMin: parseInt(document.getElementById('break-input').value) || 5,
        targetMin: parseInt(document.getElementById('target-input').value) || 60
    };
}

let { focusMin } = getDuration();
let timeLeft = focusMin * 60;

function updateDisplay() {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    minutesDisplay.textContent = m < 10 ? '0' + m : m;
    secondsDisplay.textContent = s < 10 ? '0' + s : s;
    updateProgressText();
}

function updateProgressText() {
    const { targetMin } = getDuration();
    currentProgressElem.innerText = Math.floor(totalSecondsPassed / 60);
    maxTargetElem.innerText = targetMin;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    if (widget && musicSelect.value && musicSelect.value !== 'add-new') widget.play();
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    if (widget) widget.pause();
}

function resetTimer() {
    pauseTimer();
    currentMode = 'fokus';
    totalSecondsPassed = 0;
    const { focusMin } = getDuration();
    timeLeft = focusMin * 60;
    modeText.innerText = "MODE: FOKUS";
    eggImage.src = "assets/egg-focus.png";
    updateDisplay();
}

function handleSessionEnd() {
    const { focusMin, breakMin, targetMin } = getDuration();
    const targetSeconds = targetMin * 60;
    
    new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();

    if (currentMode === 'fokus') {
        totalSecondsPassed += (focusMin * 60);
        
        // Update display dulu supaya angka progres naik sebelum cek finish
        updateDisplay(); 

        if (totalSecondsPassed >= targetSeconds) {
            finishLearning();
            return; 
        }

        currentMode = 'rehat';
        let sisaDetikKeTarget = targetSeconds - totalSecondsPassed;
        timeLeft = Math.min(breakMin * 60, sisaDetikKeTarget); 

        modeText.innerText = "MODE: REHAT 🍳";
        eggImage.src = "assets/egg-rest.png";
        showModal('modal-notif', 'Fokus Selesai!', 'Waktunya rehat sejenak.');
        
    } else {
        totalSecondsPassed += (breakMin * 60);
        
        // Update display dulu supaya angka progres jadi 2/2 sebelum tamat
        updateDisplay(); 

        if (totalSecondsPassed >= targetSeconds) {
            finishLearning();
            return; 
        }

        currentMode = 'fokus';
        let sisaDetikKeTarget = targetSeconds - totalSecondsPassed;
        timeLeft = Math.min(focusMin * 60, sisaDetikKeTarget);

        modeText.innerText = "MODE: FOKUS 🤓";
        eggImage.src = "assets/egg-focus.png";
        showModal('modal-notif', 'Rehat Selesai!', 'Ayo lanjut fokus!');
    }

    // Jalankan timer otomatis untuk sesi berikutnya jika belum finish
    isRunning = false; 
    startTimer(); 
}

function finishLearning() {
    isRunning = false;
    clearInterval(timer);
    modeText.innerText = "Target Selesai! 🎉";
    eggImage.src = "assets/egg-finish.png";
    showModal('modal-notif', 'YAY SELESAI!', 'Target belajarmu hari ini sudah tercapai. Keren!');
}

// --- LOGIKA MODAL ---
function showModal(id, title, msg) {
    if (title) document.getElementById('modal-title').innerText = title;
    if (msg) document.getElementById('modal-message').innerText = msg;
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// --- LOGIKA LAGU & LOCAL STORAGE ---
function saveCustomSong() {
    const name = document.getElementById('custom-name').value;
    const url = document.getElementById('custom-url').value;

    if (name && url) {
        let songs = JSON.parse(localStorage.getItem('yoldoro_songs')) || [];
        songs.push({ name, url });
        localStorage.setItem('yoldoro_songs', JSON.stringify(songs));
        
        updateMusicDropdown();
        closeModal('modal-add-song');
        document.getElementById('custom-name').value = '';
        document.getElementById('custom-url').value = '';
    }
}

function updateMusicDropdown() {
    musicSelect.innerHTML = `
        <option value="">None</option>
        <option value="https://soundcloud.com/lofi_girl/sets/lofi-girl-beats-to-relax-study">Lo-fi Girl Radio 🎶</option>
        <option value="https://soundcloud.com/grant-lewers-185714392/cafe-leblanc-coffee-shop-ambience-smooth-jazz-persona-music-rain-to-study-relax-sleep?si=208250b99b7947869a4456a8b3b769eb&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing">Cafe Ambience ☕</option>
        <option value="add-new">➕ Add SoundCloud Link...</option>
    `;

    const songs = JSON.parse(localStorage.getItem('yoldoro_songs')) || [];
    songs.forEach(song => {
        const opt = document.createElement('option');
        opt.value = song.url;
        opt.text = `🎵 ${song.name}`;
        musicSelect.add(opt, musicSelect.options[musicSelect.options.length - 1]);
    });
}

musicSelect.addEventListener('change', function() {
    if (this.value === 'add-new') {
        showModal('modal-add-song');
        this.value = ""; 
    } else if (this.value) {
        widget.load(this.value, { auto_play: true, show_artwork: false });
    } else {
        widget.pause();
    }
});

volumeSlider.addEventListener('input', function() {
    if (widget) widget.setVolume(this.value * 100);
});

// Jalankan saat pertama load
updateMusicDropdown();
updateDisplay();