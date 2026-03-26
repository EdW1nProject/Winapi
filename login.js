document.addEventListener('DOMContentLoaded', () => {

    // 1. Cek apakah pengguna sudah dalam keadaan login sebelumnya
    // Jika ya, langsung arahkan ke halaman dashboard (kita akan buat nanti)
    if (localStorage.getItem('winyuk_session')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');

    // 2. Fungsi untuk mengambil data akun dari LocalStorage
    function getDatabase() {
        const data = localStorage.getItem('winyuk_db');
        return data ? JSON.parse(data) : [];
    }

    // 3. Proses saat tombol Login diklik
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Mencegah halaman termuat ulang

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const db = getDatabase();

        // Cari apakah ada username dan password yang cocok di database
        const matchedUser = db.find(user => user.username === username && user.password === password);

        if (matchedUser) {
            // Jika cocok, simpan sesi login
            localStorage.setItem('winyuk_session', username);

            // Tampilkan pesan sukses
            Swal.fire({
                title: 'Login Sukses!',
                text: 'Mengarahkan ke dashboard...',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });

            // Pindah ke halaman dashboard setelah 1.5 detik
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } else {
            // Jika salah atau tidak ditemukan
            Swal.fire({
                title: 'Gagal Login',
                text: 'Username atau Password salah, atau akun belum terdaftar.',
                icon: 'error',
                confirmButtonColor: '#9333ea'
            });
        }
    });
});
