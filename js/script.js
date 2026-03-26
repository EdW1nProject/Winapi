document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMASI SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));

    // --- 2. SISTEM DATABASE MINI (LOCAL STORAGE) ---
    // Mengambil data semua user dari browser
    function getUsersDB() {
        const users = localStorage.getItem('winyuk_db_users');
        return users ? JSON.parse(users) : [];
    }

    // Menyimpan data user ke browser
    function saveUsersDB(usersArray) {
        localStorage.setItem('winyuk_db_users', JSON.stringify(usersArray));
    }

    // Fungsi Generate API Key Acak
    function generateRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomString = Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return "WINYUK-" + randomString;
    }


    // --- 3. SISTEM AUTENTIKASI (LOGIN & REGISTER) ---
    const authModal = document.getElementById('authModal');
    const authBox = document.getElementById('authBox');
    const navAuthBtn = document.getElementById('navAuthBtn');
    const overlayLoginBtn = document.getElementById('overlayLoginBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    const authTitle = document.getElementById('authTitle');
    const submitAuthBtn = document.getElementById('submitAuthBtn');
    const switchAuthModeBtn = document.getElementById('switchAuthModeBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const authErrorMsg = document.getElementById('authErrorMsg');
    
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    
    const lockedOverlay = document.getElementById('lockedOverlay');
    const welcomeText = document.getElementById('welcomeText');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const toggleVisibilityBtn = document.getElementById('toggleVisibility');

    let isLoginMode = true; // True = Login, False = Register

    // Buka/Tutup Modal
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
            authErrorMsg.classList.add('hidden');
            usernameInput.value = '';
            passwordInput.value = '';
        }, 300);
    }

    // Ganti Mode Modal (Login <-> Register)
    switchAuthModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        authErrorMsg.classList.add('hidden'); // Reset error
        
        if (isLoginMode) {
            authTitle.innerText = "Welcome Back";
            submitAuthBtn.innerText = "Masuk ke Dashboard";
            authSwitchText.innerText = "Belum punya akun?";
            switchAuthModeBtn.innerText = "Daftar di sini";
        } else {
            authTitle.innerText = "Create Account";
            submitAuthBtn.innerText = "Daftar Sekarang";
            authSwitchText.innerText = "Sudah punya akun?";
            switchAuthModeBtn.innerText = "Login di sini";
        }
    });

    // Proses Submit (Login atau Register)
    submitAuthBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username.length < 3 || password.length < 4) {
            showError("Username min 3 karakter, Password min 4 karakter!");
            return;
        }

        const usersDB = getUsersDB();

        if (isLoginMode) {
            // PROSES LOGIN
            const userAccount = usersDB.find(u => u.username === username && u.password === password);
            if (userAccount) {
                // Sukses Login
                localStorage.setItem('winyuk_active_session', username);
                closeModal();
                checkAuthStatus();
            } else {
                showError("Username atau Password salah!");
            }
        } else {
            // PROSES REGISTER
            const isUserExist = usersDB.some(u => u.username === username);
            if (isUserExist) {
                showError("Username sudah terdaftar! Pilih yang lain.");
            } else {
                // Buat Akun Baru & Auto-Generate API Key
                const newUser = {
                    username: username,
                    password: password,
                    apiKey: generateRandomKey()
                };
                usersDB.push(newUser);
                saveUsersDB(usersDB);

                // Langsung Login setelah register
                localStorage.setItem('winyuk_active_session', username);
                closeModal();
                checkAuthStatus();
                alert("Registrasi Berhasil! API Key Anda telah digenerate.");
            }
        }
    });

    function showError(msg) {
        authErrorMsg.innerText = msg;
        authErrorMsg.classList.remove('hidden');
    }

    // Cek Status Login di UI Dashboard
    function checkAuthStatus() {
        const activeUser = localStorage.getItem('winyuk_active_session');

        if (activeUser) {
            // Tampilan saat LOGGED IN
            const usersDB = getUsersDB();
            const userData = usersDB.find(u => u.username === activeUser);

            navAuthBtn.innerText = 'Logout';
            navAuthBtn.classList.replace('bg-white', 'bg-red-500');
            navAuthBtn.classList.replace('text-black', 'text-white');
            
            lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
            welcomeText.innerHTML = `Selamat datang kembali, <span class="text-purple-400 font-bold">${activeUser}</span>!`;
            
            apiKeyDisplay.value = "********************************";
            apiKeyDisplay.type = "password";
            apiKeyDisplay.dataset.key = userData.apiKey; // Ambil key dari database
            isHidden = true;
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';

        } else {
            // Tampilan saat LOGGED OUT
            navAuthBtn.innerText = 'Login';
            navAuthBtn.classList.replace('bg-red-500', 'bg-white');
            navAuthBtn.classList.replace('text-white', 'text-black');
            
            lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
            welcomeText.innerText = "Akses endpoint eksklusif untuk bot Discord dan WhatsApp Anda.";
            apiKeyDisplay.value = "********************************";
            apiKeyDisplay.type = "password";
        }
    }

    // Tombol Logout & Navigasi
    navAuthBtn.addEventListener('click', () => {
        if (localStorage.getItem('winyuk_active_session')) {
            localStorage.removeItem('winyuk_active_session'); // Hapus sesi
            checkAuthStatus();
        } else {
            isLoginMode = true; // Selalu buka modal dalam mode login via navbar
            switchAuthModeBtn.click(); switchAuthModeBtn.click(); // Reset ke UI Login
            openModal();
        }
    });

    overlayLoginBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);


    // --- 4. SISTEM KONTROL API KEY ---
    let isHidden = true;

    // Tombol Reset/Regenerate API Key
    document.getElementById('generateBtn').addEventListener('click', function() {
        const activeUser = localStorage.getItem('winyuk_active_session');
        if(!activeUser) return;

        const confirmReset = confirm("Apakah Anda yakin ingin mengganti API Key? Key lama tidak akan bisa digunakan lagi.");
        if(!confirmReset) return;

        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mereset...';
        
        setTimeout(() => {
            const newKey = generateRandomKey();
            
            // Update Database
            const usersDB = getUsersDB();
            const userIndex = usersDB.findIndex(u => u.username === activeUser);
            if(userIndex !== -1) {
                usersDB[userIndex].apiKey = newKey;
                saveUsersDB(usersDB);
            }
            
            // Update UI
            apiKeyDisplay.dataset.key = newKey;
            apiKeyDisplay.value = newKey;
            apiKeyDisplay.type = "text";
            isHidden = false;
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            
            this.innerHTML = originalText;
        }, 800);
    });

    // Toggle Mata (Show/Hide)
    toggleVisibilityBtn.addEventListener('click', () => {
        if(!localStorage.getItem('winyuk_active_session')) return;
        
        isHidden = !isHidden;
        apiKeyDisplay.type = isHidden ? "password" : "text";
        apiKeyDisplay.value = isHidden ? "********************************" : apiKeyDisplay.dataset.key;
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    // Tombol Copy
    document.getElementById('copyKeyBtn').addEventListener('click', function() {
        const keyToCopy = apiKeyDisplay.dataset.key;
        if(!keyToCopy) return;

        navigator.clipboard.writeText(keyToCopy).then(() => {
            const icon = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            setTimeout(() => this.innerHTML = icon, 2000);
        });
    });

    // --- 5. SISTEM LIVE API TESTING (Tetap Sama) ---
    function handleApiTest(type) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const resultBox = document.getElementById(`${type}ResultBox`);
        const resultCode = document.getElementById(`${type}Result`);
        const statusDot = document.getElementById(`${type}StatusDot`);
        const btnElement = document.getElementById(`test${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if(!urlInput) { alert("Harap masukkan URL untuk di-test!"); return; }

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

    // Inisialisasi awal saat web dibuka
    checkAuthStatus();
});
