document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMASI SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));


    // --- 2. SISTEM AUTENTIKASI (LOGIN & SESSION) ---
    const loginModal = document.getElementById('loginModal');
    const loginBox = document.getElementById('loginBox');
    const navAuthBtn = document.getElementById('navAuthBtn');
    const overlayLoginBtn = document.getElementById('overlayLoginBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const usernameInput = document.getElementById('usernameInput');
    
    const lockedOverlay = document.getElementById('lockedOverlay');
    const welcomeText = document.getElementById('welcomeText');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const toggleVisibilityBtn = document.getElementById('toggleVisibility');

    // Fungsi membuka modal login
    function openModal() {
        loginModal.classList.remove('hidden');
        setTimeout(() => {
            loginModal.classList.remove('opacity-0');
            loginBox.classList.remove('scale-95');
        }, 10);
    }

    // Fungsi menutup modal login
    function closeModal() {
        loginModal.classList.add('opacity-0');
        loginBox.classList.add('scale-95');
        setTimeout(() => loginModal.classList.add('hidden'), 300);
    }

    // Cek status saat web dimuat
    function checkAuthStatus() {
        const savedUser = localStorage.getItem('winyuk_user');
        const savedKey = localStorage.getItem('winyuk_apikey');

        if (savedUser) {
            // State: LOGGED IN
            navAuthBtn.innerText = 'Logout';
            navAuthBtn.classList.replace('bg-white', 'bg-red-500');
            navAuthBtn.classList.replace('text-black', 'text-white');
            
            lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
            welcomeText.innerHTML = `Selamat datang kembali, <span class="text-purple-400 font-bold">${savedUser}</span>!`;
            
            if(savedKey) {
                apiKeyDisplay.value = savedKey;
                apiKeyDisplay.dataset.key = savedKey;
            } else {
                apiKeyDisplay.value = "Klik Generate untuk membuat key";
                apiKeyDisplay.dataset.key = "";
            }
        } else {
            // State: LOGGED OUT
            navAuthBtn.innerText = 'Login';
            navAuthBtn.classList.replace('bg-red-500', 'bg-white');
            navAuthBtn.classList.replace('text-white', 'text-black');
            
            lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
            welcomeText.innerText = "Akses endpoint eksklusif untuk bot Discord dan WhatsApp Anda.";
            apiKeyDisplay.value = "********************************";
            apiKeyDisplay.type = "password";
        }
    }

    // Event Listener Login
    navAuthBtn.addEventListener('click', () => {
        if (localStorage.getItem('winyuk_user')) {
            // Proses Logout
            localStorage.removeItem('winyuk_user');
            // Jangan hapus API key agar tidak reset jika login lagi: 
            // localStorage.removeItem('winyuk_apikey'); 
            checkAuthStatus();
        } else {
            openModal();
        }
    });

    overlayLoginBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    submitLoginBtn.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        if(user.length < 3) {
            alert("Username minimal 3 karakter!");
            return;
        }
        
        // Simpan sesi ke browser
        localStorage.setItem('winyuk_user', user);
        
        // Buatkan API key default jika belum punya
        if(!localStorage.getItem('winyuk_apikey')) {
            localStorage.setItem('winyuk_apikey', "WINYUK-" + generateRandomString(24));
        }

        closeModal();
        checkAuthStatus();
        usernameInput.value = ''; // clear input
    });


    // --- 3. SISTEM API KEY GENERATOR ---
    let isHidden = true;

    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({length}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    document.getElementById('generateBtn').addEventListener('click', function() {
        if(!localStorage.getItem('winyuk_user')) return; // Proteksi ganda

        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        
        setTimeout(() => {
            const newKey = "WINYUK-" + generateRandomString(24);
            localStorage.setItem('winyuk_apikey', newKey); // Simpan permanen di browser
            
            apiKeyDisplay.dataset.key = newKey;
            apiKeyDisplay.value = newKey;
            apiKeyDisplay.type = "text";
            isHidden = false;
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            
            this.innerHTML = originalText;
        }, 800);
    });

    toggleVisibilityBtn.addEventListener('click', () => {
        if(!localStorage.getItem('winyuk_user') || !apiKeyDisplay.dataset.key) return;
        
        isHidden = !isHidden;
        apiKeyDisplay.type = isHidden ? "password" : "text";
        apiKeyDisplay.value = isHidden ? "********************************" : apiKeyDisplay.dataset.key;
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    document.getElementById('copyKeyBtn').addEventListener('click', function() {
        const keyToCopy = apiKeyDisplay.dataset.key;
        if(!keyToCopy) return;

        navigator.clipboard.writeText(keyToCopy).then(() => {
            const icon = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            setTimeout(() => this.innerHTML = icon, 2000);
        });
    });


    // --- 4. SISTEM LIVE API TESTING ---
    function handleApiTest(type) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const resultBox = document.getElementById(`${type}ResultBox`);
        const resultCode = document.getElementById(`${type}Result`);
        const statusDot = document.getElementById(`${type}StatusDot`);
        const btnElement = document.getElementById(`test${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if(!urlInput) {
            alert("Harap masukkan URL untuk di-test!");
            return;
        }

        // Tampilan Loading
        const originalBtnText = btnElement.innerText;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        resultBox.classList.remove('hidden');
        resultCode.className = 'text-xs font-mono text-gray-400';
        resultCode.innerText = 'Menghubungkan ke server WINYUK API...';
        statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-pulse';

        // Proses simulasi (Delay 1.5 detik)
        setTimeout(() => {
            btnElement.innerText = originalBtnText;
            let response;

            if (type === 'tiktok') {
                if (urlInput.includes('tiktok.com')) {
                    response = {
                        status: true,
                        creator: "WINYUK",
                        data: {
                            title: "Sample TikTok Video",
                            video_nowm: "https://dl.winyuk.com/media/video.mp4"
                        }
                    };
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    response = { status: false, error: "URL TikTok tidak valid." };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            } else if (type === 'discord') {
                if (urlInput.includes('discordapp.com') || urlInput.includes('discord.com')) {
                    response = {
                        status: true,
                        creator: "WINYUK",
                        data: {
                            filename: "attachment.png",
                            bypass_url: "https://api.winyuk.com/dl/bypass/123"
                        }
                    };
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

    // Binding Event Listeners untuk tombol test
    document.getElementById('testTiktokBtn').addEventListener('click', () => handleApiTest('tiktok'));
    document.getElementById('testDiscordBtn').addEventListener('click', () => handleApiTest('discord'));


    // Inisialisasi awal saat web dibuka
    checkAuthStatus();
});
