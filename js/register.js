document.addEventListener('DOMContentLoaded', () => {

    // Jika sudah login, langsung ke dashboard
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    
    // Proteksi: Cek apakah ID form di HTML sudah benar
    if (!registerForm) {
        console.error("Form pendaftaran tidak ditemukan!");
        return;
    }

    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');

    function getDB() { return JSON.parse(localStorage.getItem('winyuk_db')) || []; }
    function saveDB(data) { localStorage.setItem('winyuk_db', JSON.stringify(data)); }
    
    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomString = Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return "WINYUK-" + randomString;
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Wajib agar web tidak reload
        
        const newUsername = regUsername.value.trim();
        const newPassword = regPassword.value.trim();
        const db = getDB();

        const isExist = db.some(user => user.username === newUsername);
        
        if (isExist) {
            Swal.fire({ 
                title: 'Username Terpakai!', 
                text: 'Silakan pilih username yang lain.', 
                icon: 'warning', 
                background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ec4899' 
            });
        } else {
            // Buat akun
            const newUser = { 
                username: newUsername, 
                password: newPassword, 
                apikey: generateApiKey() 
            };
            
            db.push(newUser);
            saveDB(db);
            localStorage.setItem('winyuk_session', newUsername);
            
            // Munculkan notifikasi sukses
            Swal.fire({
                title: 'Registrasi Berhasil!',
                text: 'API Key Anda telah dibuat. Mengarahkan...',
                icon: 'success',
                showConfirmButton: false,
                background: '#1a1a1a', color: '#fff'
            });

            // PAKSA PINDAH HALAMAN SETELAH 1.5 DETIK
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    });
});
