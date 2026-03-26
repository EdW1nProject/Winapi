document.addEventListener('DOMContentLoaded', () => {

    // Jika sudah pernah login, tendang langsung ke dashboard
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Ambil element dari HTML
    const registerForm = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');
    const submitRegBtn = document.getElementById('submitRegBtn');

    // --- FUNGSI DATABASE LOKAL ---
    function getDB() { 
        return JSON.parse(localStorage.getItem('winyuk_db')) || []; 
    }
    
    function saveDB(data) { 
        localStorage.setItem('winyuk_db', JSON.stringify(data)); 
    }
    
    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const randomString = Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return "WINYUK-" + randomString;
    }

    // --- PROSES KLIK TOMBOL DAFTAR ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah web reload paksa
        
        // Animasi loading pada tombol agar jelas kalau tombolnya bekerja
        const originalBtnText = submitRegBtn.innerHTML;
        submitRegBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        submitRegBtn.disabled = true;

        // Simulasi proses database (loading sebentar)
        setTimeout(() => {
            const newUsername = regUsername.value.trim();
            const newPassword = regPassword.value.trim();
            const db = getDB();

            // 1. Cek apakah username sudah dipakai
            const isExist = db.some(user => user.username === newUsername);
            
            if (isExist) {
                // Jika sudah ada, kembalikan tombol seperti semula dan munculkan error
                submitRegBtn.innerHTML = originalBtnText;
                submitRegBtn.disabled = false;
                
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
                    apikey: generateApiKey() 
                };
                
                // Masukkan ke database
                db.push(newUser);
                saveDB(db);
                
                // 3. Beri sesi login langsung
                localStorage.setItem('winyuk_session', newUsername);
                
                // 4. Tampilkan pesan sukses
                Swal.fire({
                    title: 'Registrasi Berhasil!',
                    text: 'API Key Anda telah dibuat. Mengarahkan...',
                    icon: 'success',
                    showConfirmButton: false,
                    background: '#1a1a1a', 
                    color: '#fff'
                });

                // 5. PAKSA PINDAH HALAMAN SETELAH 1.5 DETIK
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        }, 800); // Waktu loading tombol 0.8 detik
    });
});
