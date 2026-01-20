let score = 0;
let timeLeft = 30;
let gameActive = true;

const canvas = document.getElementById('canvas');
const scoreDisplay = document.getElementById('game-score');
const timerDisplay = document.getElementById('game-timer');
const overlay = document.getElementById('overlay');
const finalScore = document.getElementById('final-score');

// Preload Suara agar tidak ada delay saat pertama kali diklik
const clickSoundUrl = 'https://www.soundjay.com/buttons/sounds/button-10.mp3';

function playClickSound() {
    // Membuat instance audio baru setiap kali fungsi dipanggil
    // Ini memungkinkan suara untuk "tumpang tindih" (overlap) saat diklik cepat
    const pop = new Audio(clickSoundUrl);
    pop.volume = 0.5;
    pop.currentTime = 0; // Mengatur ulang durasi ke awal
    pop.play().catch(error => console.log("Audio play blocked:", error));
}

function spawnItem() {
    if (!gameActive) return;

    const item = document.createElement('img');
    const isStar = Math.random() > 0.7; // 30% peluang muncul bintang
    item.src = isStar ? 'assets/star-icon.png' : 'assets/egg-icon.png';
    item.className = 'spawn-item';

    // Koordinat Acak sesuai ukuran canvas terbaru
    const maxX = canvas.clientWidth - 60;
    const maxY = canvas.clientHeight - 60;
    item.style.left = Math.random() * maxX + 'px';
    item.style.top = Math.random() * maxY + 'px';

    // Logika Klik
    item.onclick = (e) => {
        if (!gameActive) return;
        
        // Hentikan propagasi agar tidak memicu event lain
        e.stopPropagation();

        // JALANKAN SUARA DULU (Agar Instan)
        playClickSound();

        // Update skor (Bintang skornya 5, Telur 1)
        score += isStar ? 5 : 1;
        scoreDisplay.innerText = score;
        
        // Hapus elemen dan munculkan yang baru
        item.remove();
        spawnItem(); 
    };

    canvas.appendChild(item);

    // Item hilang otomatis jika tidak diklik dalam 1.2 detik
    setTimeout(() => {
        if (item.parentElement) {
            item.remove();
            if (gameActive) spawnItem();
        }
    }, 1200);
}

// Timer Game
const countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(countdown);
        endGame();
    }
}, 1000);

function endGame() {
    gameActive = false;
    overlay.style.display = 'flex';
    finalScore.innerText = score;
}

// Mulai game dengan 3 item pertama
spawnItem();
spawnItem();
spawnItem();