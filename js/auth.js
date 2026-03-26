document.addEventListener('DOMContentLoaded', () => {

    // Jika user sudah pernah login sebelumnya, langsung lempar ke dashboard
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const authForm = document.getElementById('authForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitBtn');
    
    const switchModeBtn = document.getElementById('switchModeBtn');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const switchText = document.getElementById('switchText');

    let isLoginMode = true;

    // --- FUNGSI GANTI MODE LOGIN / REGISTER ---
    switchModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            formTitle.innerText = "Welcome Back";
            formSubtitle.innerText = "Masuk untuk mengelola bot Anda.";
            submitBtn.innerText = "Sign In";
            switchText.innerText = "Belum punya akun?";
            switchModeBtn.innerText = "Daftar di sini";
        } else {
            formTitle.innerText = "Create Account";
            formSubtitle.innerText = "Daftar untuk mendapatkan API Key.";
            submitBtn.innerText = "Register & Generate Key";
            switchText.innerText = "Sudah punya akun?";
            switchModeBtn.innerText = "Login di sini";
        }
    });

    // --- FUNGSI DATABASE (LOCALSTORAGE) ---
    function getDB() { return JSON.parse(localStorage.getItem('winyuk_db')) || []; }
    function saveDB(data) { localStorage.setItem('winyuk_db', JSON.stringify(data)); }
    
    // Fungsi membuat API Key random (WINYUK-24Karakter)
    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return "WINYUK-" + Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // --- PROSES SUBMIT ---
    authForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah form memuat ulang halaman
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const db = getDB();

        if (isLoginMode) {
            // PROSES LOGIN
            const user = db.find(u => u.username === username && u.password === password);
            if (user) {
                // Simpan sesi login
                localStorage.setItem('winyuk_session', username);
                
                Swal.fire({
                    title: 'Login Berhasil!',
                    text: 'Mengarahkan ke Dashboard...',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1a1a', color: '#fff'
                }).then(() => {
                    // Pindah ke halaman dashboard
                    window.location.href = 'dashboard.html';
                });
            } else {
                Swal.fire({ title: 'Gagal!', text: 'Username atau Password salah.', icon: 'error', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ef4444' });
            }
        } else {
            // PROSES REGISTER
            if (db.some(u => u.username === username)) {
                Swal.fire({ title: 'Oops!', text: 'Username sudah dipakai orang lain.', icon: 'warning', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#f59e0b' });
            } else {
                // Simpan user baru beserta API Key-nya ke database
                db.push({ 
                    username: username, 
                    password: password, 
                    apikey: generateApiKey() 
                });
                saveDB(db);
                
                // Langsung berikan sesi login
                localStorage.setItem('winyuk_session', username);
                
                Swal.fire({
                    title: 'Akun Dibuat!',
                    text: 'API Key Anda telah digenerate. Masuk ke Dashboard...',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a1a', color: '#fff'
                }).then(() => {
                    // Pindah ke halaman dashboard
                    window.location.href = 'dashboard.html';
                });
            }
        }
    });
});
