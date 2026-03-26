// File: js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PROTEKSI HALAMAN (AUTH GUARD) ---
    // Cek apakah ada sesi login. Jika tidak ada, tendang ke index.html
    const activeSession = localStorage.getItem('winyuk_session');
    if (!activeSession) {
        window.location.href = 'index.html';
        return; // Hentikan eksekusi script selanjutnya
    }

    // --- 2. AMBIL DATA USER DARI DATABASE ---
    const db = JSON.parse(localStorage.getItem('winyuk_db')) || [];
    const userData = db.find(u => u.username === activeSession);

    // Jika entah kenapa datanya hilang, paksa logout
    if (!userData) {
        localStorage.removeItem('winyuk_session');
        window.location.href = 'index.html';
        return;
    }

    // --- 3. ISI TAMPILAN DASHBOARD ---
    document.getElementById('welcomeText').innerHTML = `Halo <span class="text-purple-400 font-bold">${userData.username}</span>, siap untuk mengoding hari ini?`;
    
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    // Simpan API key asli di dataset agar mudah diakses fitur copy
    apiKeyDisplay.dataset.key = userData.apikey; 

    // --- 4. FITUR LOGOUT ---
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Swal.fire({
            title: 'Logout?',
            text: "Sesi Anda akan diakhiri.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Keluar',
            background: '#1a1a1a', 
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('winyuk_session'); // Hapus sesi
                window.location.href = 'index.html'; // Lempar ke halaman login
            }
        });
    });

    // --- 5. FITUR KONTROL API KEY ---
    let isHidden = true;
    const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const regenerateKeyBtn = document.getElementById('regenerateKeyBtn');

    // Tampilkan/Sembunyikan Key
    toggleVisibilityBtn.addEventListener('click', () => {
        isHidden = !isHidden;
        apiKeyDisplay.type = isHidden ? "password" : "text";
        apiKeyDisplay.value = isHidden ? "********************************" : apiKeyDisplay.dataset.key;
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    // Copy Key ke Clipboard
    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#22c55e', color: '#fff' });
    
    copyKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(apiKeyDisplay.dataset.key).then(() => {
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            Toast.fire({ icon: 'success', title: 'API Key berhasil disalin!' });
            setTimeout(() => copyKeyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
        });
    });

    // Reset (Generate Ulang) API Key
    regenerateKeyBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Ganti API Key?', 
            text: "Bot yang menggunakan key lama akan terputus aksesnya!", 
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#9333ea', 
            cancelButtonColor: '#4b5563', 
            confirmButtonText: 'Ya, Generate Baru',
            background: '#1a1a1a', color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Buat key baru
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const newKey = "WINYUK-" + Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                
                // Update ke database lokal
                let currentDb = JSON.parse(localStorage.getItem('winyuk_db'));
                let userIndex = currentDb.findIndex(u => u.username === activeSession);
                currentDb[userIndex].apikey = newKey;
                localStorage.setItem('winyuk_db', JSON.stringify(currentDb));
                
                // Update UI di layar
                apiKeyDisplay.dataset.key = newKey;
                apiKeyDisplay.value = newKey;
                apiKeyDisplay.type = "text";
                isHidden = false;
                toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
                
                Swal.fire({ title: 'Berhasil!', text: 'API Key baru sudah aktif.', icon: 'success', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            }
        });
    });

    // --- 6. FITUR LIVE API TESTER ---
    function handleApiTest(type) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const resultBox = document.getElementById(`${type}ResultBox`);
        const resultCode = document.getElementById(`${type}Result`);
        const statusDot = document.getElementById(`${type}StatusDot`);
        const btnElement = document.getElementById(`test${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if(!urlInput) { 
            Swal.fire({ title: 'Tunggu Dulu!', text: 'URL target tidak boleh kosong.', icon: 'info', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            return; 
        }

        const originalBtnText = btnElement.innerText;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        resultBox.classList.remove('hidden');
        resultCode.className = 'text-xs font-mono text-gray-400';
        resultCode.innerText = `Mengautentikasi key: ${apiKeyDisplay.dataset.key.substring(0, 10)}...\nMenghubungi server...`;
        statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-pulse';

        // Simulasi Loading 1.5 detik
        setTimeout(() => {
            btnElement.innerText = originalBtnText;
            let response;
            if (type === 'tiktok') {
                if (urlInput.includes('tiktok.com')) {
                    response = { status: true, creator: userData.username, key_used: true, data: { title: "Video Keren", video_nowm: "https://dl.winyuk.com/media/video.mp4" }};
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    response = { status: false, error: "Link TikTok tidak dikenali." };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            } else if (type === 'discord') {
                if (urlInput.includes('discordapp.com') || urlInput.includes('discord.com')) {
                    response = { status: true, creator: userData.username, key_used: true, data: { filename: "file_penting.png", size: "2.4 MB", bypass_url: "https://api.winyuk.com/dl/123" }};
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    response = { status: false, error: "Bukan link CDN Discord yang valid." };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            }
            resultCode.innerText = JSON.stringify(response, null, 4);
        }, 1500);
    }

    document.getElementById('testTiktokBtn').addEventListener('click', () => handleApiTest('tiktok'));
    document.getElementById('testDiscordBtn').addEventListener('click', () => handleApiTest('discord'));

    // --- 7. ANIMASI FADE-IN SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));
});
