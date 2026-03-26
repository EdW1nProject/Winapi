document.addEventListener('DOMContentLoaded', () => {

    // 1. Cek sesi: Kalau sudah login, ngapain daftar lagi? Langsung lempar ke dashboard.
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');
    const registerBtn = document.getElementById('registerBtn');

    // 2. Fungsi Komunikasi Database (LocalStorage)
    function getDatabase() {
        const data = localStorage.getItem('winyuk_db');
        return data ? JSON.parse(data) : [];
    }

    function saveDatabase(data) {
        localStorage.setItem('winyuk_db', JSON.stringify(data));
    }

    // 3. Fungsi Pintar: Generator API Key (Contoh: WINYUK-aB3... total 24 huruf/angka acak)
    function generateApiKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for(let i = 0; i < 24; i++) {
            randomString += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return "WINYUK-" + randomString;
    }

    // 4. Proses Eksekusi Pendaftaran
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Jangan biarkan web reload

        const newUsername = regUsername.value.trim();
        const newPassword = regPassword.value.trim();
        const db = getDatabase();

        // Cek apakah username sudah ada yang pakai
        const isUsernameTaken = db.some(user => user.username === newUsername);

        if (isUsernameTaken) {
            Swal.fire({
                title: 'Username Terpakai!',
                text: 'Yah, username ini sudah ada yang punya. Pilih yang lain ya.',
                icon: 'warning',
                confirmButtonColor: '#ec4899' // Pink
            });
            return; // Hentikan proses
        }

        // Ubah tampilan tombol biar kelihatan memproses
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
        registerBtn.disabled = true;

        setTimeout(() => {
            // Buat profil akun baru
            const newUser = {
                username: newUsername,
                password: newPassword,
                apikey: generateApiKey() // Generate API key secara ajaib di sini
            };

            // Simpan ke database
            db.push(newUser);
            saveDatabase(db);

            // Berikan akses masuk (Login otomatis)
            localStorage.setItem('winyuk_session', newUsername);

            Swal.fire({
                title: 'Registrasi Berhasil!',
                text: 'API Key kamu sudah jadi. Mari menuju Dashboard...',
                icon: 'success',
                showConfirmButton: false
            });

            // Lemparkan ke halaman Dashboard dalam 1.5 detik
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        }, 800); // Simulasi delay loading
    });
});
