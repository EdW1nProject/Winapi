// File: js/register.js

document.addEventListener('DOMContentLoaded', () => {

    // Jika sudah login, tendang langsung ke dashboard
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');

    // --- FUNGSI DATABASE LOKAL ---
    // Mengambil data user yang sudah ada
    function getDB() { 
        return JSON.parse(localStorage.getItem('winyuk_db')) || []; 
    }
    
    // Menyimpan data user baru
    function saveDB(data) { 
        localStorage.setItem('winyuk_db', JSON.stringify(data)); 
    }
    
    // Fungsi Pintar: Membuat API Key Otomatis
    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomString = Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return "WINYUK-" + randomString;
    }

    // --- PROSES KLIK TOMBOL DAFTAR ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Cegah halaman reload
        
        const newUsername = regUsername.value.trim();
        const newPassword = regPassword.value.trim();
        const db = getDB();

        // 1. Cek apakah username sudah dipakai orang lain
        const isExist = db.some(user => user.username === newUsername);
        
        if (isExist) {
            // Jika sudah ada, munculkan error
            Swal.fire({ 
                title: 'Username Terpakai!', 
                text: 'Silakan pilih username yang lain ya.', 
                icon: 'warning', 
                background: '#1a1a1a', 
                color: '#fff', 
                confirmButtonColor: '#ec4899' // Pink color
            });
        } else {
            // 2. Jika belum ada, buat akun baru
            const newUser = { 
                username: newUsername, 
                password: newPassword, 
                apikey: generateApiKey() // Generate key langsung di sini!
            };
            
            // Masukkan ke database dan simpan
            db.push(newUser);
            saveDB(db);
            
            // 3. Beri sesi login agar tidak perlu login ulang
            localStorage.setItem('winyuk_session', newUsername);
            
            // 4. Tampilkan pesan sukses dan pindahkan ke dashboard
            Swal.fire({
                title: 'Registrasi Berhasil!',
                text: 'API Key Anda telah dibuat. Mengarahkan ke Dashboard...',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1a1a1a', 
                color: '#fff'
            }).then(() => {
                // Arahkan ke halaman utama API Key
                window.location.href = 'dashboard.html';
            });
        }
    });
});
