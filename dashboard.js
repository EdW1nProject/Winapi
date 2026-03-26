document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SISTEM KEAMANAN (AUTH GUARD)
    // ==========================================
    // Cek apakah ada tiket/sesi login di browser
    const activeSession = localStorage.getItem('winyuk_session');
    
    // Kalau tidak ada sesi (belum login), tendang balik ke halaman login!
    if (!activeSession) {
        window.location.href = 'index.html';
        return;
    }

    // ==========================================
    // 2. AMBIL DATA USER DARI DATABASE
    // ==========================================
    function getDatabase() {
        const data = localStorage.getItem('winyuk_db');
        return data ? JSON.parse(data) : [];
    }
    
    function saveDatabase(data) {
        localStorage.setItem('winyuk_db', JSON.stringify(data));
    }

    const db = getDatabase();
    // Cari data user yang sedang aktif
    const userData = db.find(user => user.username === activeSession);

    // Kalau entah kenapa datanya hilang, paksa logout
    if (!userData) {
        localStorage.removeItem('winyuk_session');
        window.location.href = 'index.html';
        return;
    }

    // Tampilkan Nama User di layar
    document.getElementById('welcomeName').innerText = userData.username;

    // ==========================================
    // 3. SISTEM KONTROL API KEY
    // ==========================================
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const toggleKeyBtn = document.getElementById('toggleKeyBtn');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const resetKeyBtn = document.getElementById('resetKeyBtn');

    let isKeyHidden = true;
    let currentApiKey = userData.apikey; // Simpan key dari database ke variabel

    // Inisialisasi tampilan awal key (Tertutup bintang)
    apiKeyDisplay.value = "********************************";

    // Fitur Buka/Tutup Mata (Intip Key)
    toggleKeyBtn.addEventListener('click', () => {
        isKeyHidden = !isKeyHidden;
        if (isKeyHidden) {
            apiKeyDisplay.type = "password";
            apiKeyDisplay.value = "********************************";
            toggleKeyBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        } else {
            apiKeyDisplay.type = "text";
            apiKeyDisplay.value = currentApiKey;
            toggleKeyBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        }
    });

    // Fitur Copy (Salin Key)
    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#22c55e', color: '#fff' });
    
    copyKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentApiKey).then(() => {
            const originalIcon = copyKeyBtn.innerHTML;
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            Toast.fire({ icon: 'success', title: 'API Key berhasil disalin!' });
            setTimeout(() => copyKeyBtn.innerHTML = originalIcon, 2000);
        });
    });

    // Fitur Reset API Key
    resetKeyBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Yakin Reset API Key?',
            text: "Bot atau script lama yang pakai key ini akan mati!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Ganti Baru!',
            background: '#1a1a1a', color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Generate key acak baru
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let newKey = 'WINYUK-';
                for(let i=0; i<24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));

                // Update database
                let currentDb = getDatabase();
                let userIndex = currentDb.findIndex(u => u.username === activeSession);
                currentDb[userIndex].apikey = newKey;
                saveDatabase(currentDb);

                // Update variabel & layar
                currentApiKey = newKey;
                apiKeyDisplay.value = newKey;
                apiKeyDisplay.type = "text";
                isKeyHidden = false;
                toggleKeyBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';

                Swal.fire({ title: 'Berhasil!', text: 'API Key baru telah aktif.', icon: 'success', background: '#1a1a1a', color: '#fff' });
            }
        });
    });

    // ==========================================
    // 4. FITUR LIVE API TESTER
    // ==========================================
    function testApi(type) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const consoleBox = document.getElementById(`${type}Console`);
        const led = document.getElementById(`${type}Led`);
        const btn = document.getElementById(`test${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);

        if (!urlInput) {
            Swal.fire({ title: 'Oops!', text: 'Masukkan link URL-nya dulu ya.', icon: 'info', background: '#1a1a1a', color: '#fff' });
            return;
        }

        // Animasi Loading di Terminal
        const originalBtnText = btn.innerText;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        consoleBox.className = "text-xs font-mono text-yellow-400";
        consoleBox.innerText = `Menghubungi server...\nMengautentikasi key: ${currentApiKey.substring(0,10)}***`;
        led.className = "w-2 h-2 rounded-full bg-yellow-500 animate-pulse";

        // Simulasi respon server (Jeda 1.5 detik)
        setTimeout(() => {
            btn.innerText = originalBtnText;
            let response;

            // Logika Sukses/Gagal TikTok
            if (type === 'tiktok') {
                if (urlInput.includes('tiktok.com')) {
                    response = { status: 200, success: true, creator: userData.username, data: { desc: "Video Skripsi Mantap", video_no_watermark: "https://dl.winyuk.com/media/123.mp4" }};
                    consoleBox.className = "text-xs font-mono text-green-400";
                    led.className = "w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]";
                } else {
                    response = { status: 400, success: false, message: "URL TikTok tidak dikenali!" };
                    consoleBox.className = "text-xs font-mono text-red-400";
                    led.className = "w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]";
                }
            } 
            // Logika Sukses/Gagal Discord
            else if (type === 'discord') {
                if (urlInput.includes('discordapp.com') || urlInput.includes('discord.com')) {
                    response = { status: 200, success: true, creator: userData.username, data: { filename: "foto_bot.png", bypass_url: "https://api.winyuk.com/dl/abc" }};
                    consoleBox.className = "text-xs font-mono text-green-400";
                    led.className = "w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]";
                } else {
                    response = { status: 400, success: false, message: "Format link Discord salah!" };
                    consoleBox.className = "text-xs font-mono text-red-400";
                    led.className = "w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]";
                }
            }

            // Tampilkan hasil JSON ke layar Terminal
            consoleBox.innerText = JSON.stringify(response, null, 4);
        }, 1500);
    }

    document.getElementById('testTiktokBtn').addEventListener('click', () => testApi('tiktok'));
    document.getElementById('testDiscordBtn').addEventListener('click', () => testApi('discord'));

    // ==========================================
    // 5. FITUR LOGOUT
    // ==========================================
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Swal.fire({
            title: 'Yakin mau keluar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Logout',
            background: '#1a1a1a', color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Hapus sesi dan lempar balik ke gerbang login
                localStorage.removeItem('winyuk_session');
                window.location.href = 'index.html';
            }
        });
    });

});
