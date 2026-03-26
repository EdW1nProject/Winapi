// ==========================================
// FILE: main.js (FITUR DASHBOARD & UI)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- ANIMASI SCROLL FADE-IN ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el));


    // --- KONTROL API KEY (SHOW, COPY, REGENERATE) ---
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const regenerateKeyBtn = document.getElementById('regenerateKeyBtn');

    let isHidden = true;

    // Reset ikon mata saat dilogout
    window.addEventListener('userLoggedOut', () => {
        isHidden = true;
        toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
    });

    // Fitur Intip Key
    toggleVisibilityBtn.addEventListener('click', () => {
        if(!localStorage.getItem('winyuk_session')) return; // Tolak jika belum login
        
        isHidden = !isHidden;
        apiKeyDisplay.type = isHidden ? "password" : "text";
        apiKeyDisplay.value = isHidden ? "********************************" : apiKeyDisplay.dataset.key;
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    });

    // Fitur Copy Key dengan Notifikasi SweetAlert Toast
    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        background: '#22c55e', color: '#fff'
    });

    copyKeyBtn.addEventListener('click', () => {
        const key = apiKeyDisplay.dataset.key;
        if(!key) return;

        navigator.clipboard.writeText(key).then(() => {
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            Toast.fire({ icon: 'success', title: 'API Key dicopy!' });
            setTimeout(() => copyKeyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>', 2000);
        });
    });

    // Fitur Reset Key
    regenerateKeyBtn.addEventListener('click', () => {
        const activeUser = localStorage.getItem('winyuk_session');
        if(!activeUser) return;

        Swal.fire({
            title: 'Reset API Key?',
            text: "Key lama bot Anda akan mati dan tidak bisa digunakan lagi!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, Generate Baru',
            background: '#1a1a1a', color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                // Generate key baru
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const newKey = "WINYUK-" + Array.from({length: 24}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                
                // Simpan ke database
                let db = JSON.parse(localStorage.getItem('winyuk_db'));
                let userIndex = db.findIndex(u => u.username === activeUser);
                db[userIndex].apikey = newKey;
                localStorage.setItem('winyuk_db', JSON.stringify(db));

                // Update UI
                apiKeyDisplay.dataset.key = newKey;
                apiKeyDisplay.value = newKey;
                apiKeyDisplay.type = "text";
                isHidden = false;
                toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';

                Swal.fire({
                    title: 'Berhasil!',
                    text: 'API Key baru telah dibuat.',
                    icon: 'success',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#9333ea'
                });
            }
        });
    });

});
