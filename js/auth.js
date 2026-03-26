// ==========================================
// FILE: auth.js (SISTEM LOGIN & DATABASE)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT SELECTORS ---
    const modal = document.getElementById('authModal');
    const modalBox = document.getElementById('authBox');
    const navLoginBtn = document.getElementById('navLoginBtn');
    const overlayLoginBtn = document.getElementById('overlayLoginBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    
    const authForm = document.getElementById('authForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitAuthBtn');
    
    const switchModeBtn = document.getElementById('switchModeBtn');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('switchText');
    
    // Element Dashboard untuk diupdate setelah login
    const lockedOverlay = document.getElementById('lockedOverlay');
    const welcomeText = document.getElementById('welcomeText');
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');

    let isLoginMode = true; // Status form (Login atau Register)

    // --- FUNGSI MODAL ---
    function openModal() {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalBox.classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalBox.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            authForm.reset();
        }, 300);
    }

    // --- SWITCH MODE (LOGIN <-> REGISTER) ---
    switchModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        
        if (isLoginMode) {
            authTitle.innerText = "Sign In";
            authSubtitle.innerText = "Masuk ke developer portal.";
            submitBtn.innerText = "Login Now";
            switchText.innerText = "New here?";
            switchModeBtn.innerText = "Create an account";
        } else {
            authTitle.innerText = "Sign Up";
            authSubtitle.innerText = "Buat akun WINYUK API Anda.";
            submitBtn.innerText = "Register & Generate Key";
            switchText.innerText = "Already have an account?";
            switchModeBtn.innerText = "Sign In";
        }
    });

    // --- DATABASE LOKAL (LOCALSTORAGE) ---
    function getDB() {
        return JSON.parse(localStorage.getItem('winyuk_db')) || [];
    }
    
    function saveDB(data) {
        localStorage.setItem('winyuk_db', JSON.stringify(data));
    }

    function generateKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return "WINYUK-" + Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // --- PROSES SUBMIT FORM ---
    authForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah web reload
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const db = getDB();

        if (isLoginMode) {
            // PROSES LOGIN
            const user = db.find(u => u.username === username && u.password === password);
            if (user) {
                // Berhasil Login
                localStorage.setItem('winyuk_session', username);
                closeModal();
                updateUI();
                Swal.fire({
                    title: 'Welcome Back!',
                    text: `Halo ${username}, selamat datang di WINYUK API.`,
                    icon: 'success',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea'
                });
            } else {
                // Gagal Login
                Swal.fire({
                    title: 'Login Gagal!',
                    text: 'Username atau Password salah.',
                    icon: 'error',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ef4444'
                });
            }
        } else {
            // PROSES REGISTER
            if (db.some(u => u.username === username)) {
                Swal.fire({
                    title: 'Username Terpakai!',
                    text: 'Silakan gunakan username lain.',
                    icon: 'warning',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f59e0b'
                });
            } else {
                // Buat user baru
                const newUser = { username, password, apikey: generateKey() };
                db.push(newUser);
                saveDB(db);
                
                // Langsung login-kan
                localStorage.setItem('winyuk_session', username);
                closeModal();
                updateUI();
                Swal.fire({
                    title: 'Registrasi Sukses!',
                    text: 'Akun dan API Key Anda berhasil dibuat.',
                    icon: 'success',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea'
                });
            }
        }
    });

    // --- FUNGSI UPDATE UI (DASHBOARD) ---
    function updateUI() {
        const activeUser = localStorage.getItem('winyuk_session');
        
        if (activeUser) {
            // JIKA SUDAH LOGIN
            const db = getDB();
            const userData = db.find(u => u.username === activeUser);
            
            // Ubah tombol Navbar jadi Logout
            navLoginBtn.innerHTML = 'Logout <i class="fa-solid fa-power-off ml-1"></i>';
            navLoginBtn.classList.replace('bg-white', 'bg-red-500');
            navLoginBtn.classList.replace('text-black', 'text-white');
            
            // Buka Gembok API
            lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
            welcomeText.innerHTML = `Selamat mengoding, <span class="text-purple-400 font-bold">${activeUser}</span>!`;
            
            // Masukkan API Key
            apiKeyDisplay.dataset.key = userData.apikey;
            apiKeyDisplay.value = "********************************";
            apiKeyDisplay.type = "password";
            
        } else {
            // JIKA BELUM LOGIN
            navLoginBtn.innerHTML = 'Login <i class="fa-solid fa-arrow-right-to-bracket ml-1"></i>';
            navLoginBtn.classList.replace('bg-red-500', 'bg-white');
            navLoginBtn.classList.replace('text-white', 'text-black');
            
            lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
            welcomeText.innerText = "Portal developer mewah untuk mengelola integrasi bot Anda.";
            apiKeyDisplay.value = "";
        }
    }

    // --- EVENT LISTENER TOMBOL ---
    navLoginBtn.addEventListener('click', () => {
        if (localStorage.getItem('winyuk_session')) {
            // Aksi Logout
            Swal.fire({
                title: 'Logout?',
                text: "Anda akan keluar dari sesi ini.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#4b5563',
                confirmButtonText: 'Ya, Logout!',
                background: '#1a1a1a', color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('winyuk_session');
                    updateUI();
                    window.dispatchEvent(new Event('userLoggedOut')); // Beritahu file main.js
                }
            });
        } else {
            openModal();
        }
    });

    overlayLoginBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    // Jalankan pengecekan pertama kali web dimuat
    updateUI();
});
