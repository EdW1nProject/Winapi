// Memastikan semua elemen HTML termuat sebelum JS dieksekusi
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ANIMASI SCROLL FADE-IN ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));

    // --- 2. SELECTOR ELEMENT UI ---
    const navLoginBtn = document.getElementById('navLoginBtn');
    const overlayLoginBtn = document.getElementById('overlayLoginBtn');
    const lockedOverlay = document.getElementById('lockedOverlay');
    const welcomeText = document.getElementById('welcomeText');
    
    const authModal = document.getElementById('authModal');
    const authBox = document.getElementById('authBox');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const authForm = document.getElementById('authForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const submitAuthBtn = document.getElementById('submitAuthBtn');
    const switchModeBtn = document.getElementById('switchModeBtn');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('switchText');
    
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const regenerateKeyBtn = document.getElementById('regenerateKeyBtn');

    let isLoginMode = true; 
    let isHidden = true;

    // --- 3. FUNGSI MODAL ---
    function openModal() {
        authModal.classList.remove('hidden');
        setTimeout(() => {
            authModal.classList.remove('opacity-0');
            authBox.classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        authModal.classList.add('opacity-0');
        authBox.classList.add('scale-95');
        setTimeout(() => {
            authModal.classList.add('hidden');
            authForm.reset();
        }, 300);
    }

    overlayLoginBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Beralih antara Login dan Register
    switchModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.innerText = "Sign In"; 
            authSubtitle.innerText = "Masuk ke developer portal.";
            submitAuthBtn.innerText = "Login Now"; 
            switchText.innerText = "New here?"; 
            switchModeBtn.innerText = "Create an account";
        } else {
            authTitle.innerText = "Sign Up"; 
            authSubtitle.innerText = "Buat akun WINYUK API Anda.";
            submitAuthBtn.innerText = "Register & Generate Key"; 
            switchText.innerText = "Already have an account?"; 
            switchModeBtn.innerText = "Sign In";
        }
    });

    // --- 4. LOGIKA DATABASE (LocalStorage) ---
    function getDB() { return JSON.parse(localStorage.getItem('winyuk_db')) || []; }
    function saveDB(data) { localStorage.setItem('winyuk_db', JSON.stringify(data)); }
    function generateKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return "WINYUK-" + Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // --- 5. PROSES FORM (LOGIN / REGISTER) ---
    authForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const db = getDB();

        if (isLoginMode) {
            // Cek Login
            const user = db.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('winyuk_session', username);
                closeModal(); 
                updateUI();
                Swal.fire({ title: 'Welcome Back!', text: `Halo ${username}, selamat datang kembali.`, icon: 'success', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            } else {
                Swal.fire({ title: 'Login Gagal!', text: 'Username atau Password salah.', icon: 'error', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ef4444' });
            }
        } else {
            // Cek Daftar
            if (db.some(u => u.username === username)) {
                Swal.fire({ title: 'Username Terpakai!', text: 'Silakan gunakan username lain.', icon: 'warning', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f59e0b' });
            } else {
                db.push({ username, password, apikey: generateKey() });
                saveDB(db);
                localStorage.setItem('winyuk_session', username);
                closeModal(); 
                updateUI();
                Swal.fire({ title: 'Registrasi Sukses!', text: 'Akun dan API Key berhasil dibuat.', icon: 'success', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            }
        }
    });

    // --- 6. UPDATE TAMPILAN SESUAI STATUS LOGIN ---
    function updateUI() {
        const activeUser = localStorage.getItem('winyuk_session');
        
        if (activeUser) {
            const db = getDB();
            const userData = db.find(u => u.username === activeUser);
            
            navLoginBtn.innerHTML = 'Logout <i class="fa-solid fa-power-off ml-1"></i>';
            navLoginBtn.classList.replace('bg-white', 'bg-red-500'); 
            navLoginBtn.classList.replace('text-black', 'text-white');
            
            lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
            welcomeText.innerHTML = `Selamat mengoding, <span class="text-purple-400 font-bold">${activeUser}</span>!`;
            
            apiKeyDisplay.dataset.key = userData.apikey;
            apiKeyDisplay.value = "********************************";
            apiKeyDisplay.type = "password";
            isHidden = true;
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        } else {
            navLoginBtn.innerHTML = 'Login <i class="fa-solid fa-arrow-right-to-bracket ml-1"></i>';
            navLoginBtn.classList.replace('bg-red-500', 'bg-white'); 
            navLoginBtn.classList.replace('text-white', 'text-black');
            
            lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
            welcomeText.innerText = "Portal developer mewah untuk mengelola integrasi bot Anda.";
            apiKeyDisplay.value = "";
        }
    }

    // Tombol Navigasi Utama (Login / Logout)
    navLoginBtn.addEventListener('click', () => {
        if (localStorage.getItem('winyuk_session')) {
            Swal.fire({
                title: 'Logout?', text: "Anda akan keluar dari sesi ini.", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#4b5563', confirmButtonText: 'Ya, Logout!',
                background: '#1a1a1a', color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('winyuk_session');
                    updateUI();
                }
            });
        } else {
            openModal();
        }
    });

    // --- 7. MANAJEMEN API KEY ---
    toggleVisibilityBtn.addEventListener('click', () => {
        if(!localStorage.getItem('winyuk_session')) return;
        isHidden = !isHidden;
        apiKeyDisplay.type = isHidden ? "password" : "text";
        apiKeyDisplay.value = isHidden ? "********************************" : apiKeyDisplay.dataset.key;
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#22c55e', color: '#fff' });
    
    copyKeyBtn.addEventListener('click', () => {
        const key = apiKeyDisplay.dataset.key;
        if(!key) return;
        navigator.clipboard.writeText(key).then(() => {
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            Toast.fire({ icon: 'success', title: 'API Key dicopy!' });
            setTimeout(() => copyKeyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
        });
    });

    regenerateKeyBtn.addEventListener('click', () => {
        const activeUser = localStorage.getItem('winyuk_session');
        if(!activeUser) return;
        Swal.fire({
            title: 'Reset API Key?', text: "Key lama tidak akan bisa digunakan lagi!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#9333ea', cancelButtonColor: '#4b5563', confirmButtonText: 'Ya, Reset',
            background: '#1a1a1a', color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                const newKey = generateKey();
                let db = getDB();
                let userIndex = db.findIndex(u => u.username === activeUser);
                db[userIndex].apikey = newKey;
                saveDB(db);
                
                apiKeyDisplay.dataset.key = newKey;
                apiKeyDisplay.value = newKey;
                apiKeyDisplay.type = "text";
                isHidden = false;
                toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
                Swal.fire({ title: 'Berhasil!', text: 'API Key baru telah dibuat.', icon: 'success', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            }
        });
    });

    // --- 8. LIVE API TESTER ---
    function handleApiTest(type) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const resultBox = document.getElementById(`${type}ResultBox`);
        const resultCode = document.getElementById(`${type}Result`);
        const statusDot = document.getElementById(`${type}StatusDot`);
        const btnElement = document.getElementById(`test${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if(!urlInput) { 
            Swal.fire({ title: 'Oops!', text: 'Masukkan URL yang ingin dites.', icon: 'info', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea' });
            return; 
        }

        const originalBtnText = btnElement.innerText;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        resultBox.classList.remove('hidden');
        resultCode.className = 'text-xs font-mono text-gray-400';
        resultCode.innerText = 'Menghubungkan ke server WINYUK API...';
        statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-pulse';

        setTimeout(() => {
            btnElement.innerText = originalBtnText;
            let response;
            if (type === 'tiktok') {
                if (urlInput.includes('tiktok.com')) {
                    response = { status: true, creator: "WINYUK", data: { title: "Sample Video", video_nowm: "https://dl.winyuk.com/media/video.mp4" }};
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    response = { status: false, error: "URL TikTok tidak valid." };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            } else if (type === 'discord') {
                if (urlInput.includes('discordapp.com') || urlInput.includes('discord.com')) {
                    response = { status: true, creator: "WINYUK", data: { filename: "attachment.png", bypass_url: "https://api.winyuk.com/dl/bypass/123" }};
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    response = { status: false, error: "Gunakan link CDN Discord yang benar." };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            }
            resultCode.innerText = JSON.stringify(response, null, 4);
        }, 1500);
    }

    document.getElementById('testTiktokBtn').addEventListener('click', () => handleApiTest('tiktok'));
    document.getElementById('testDiscordBtn').addEventListener('click', () => handleApiTest('discord'));

    // --- 9. JALANKAN SAAT WEB DIMUAT ---
    updateUI();
});
