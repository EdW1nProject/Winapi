document.addEventListener('DOMContentLoaded', () => {
    
    // (Kode animasi fade-in, generate API Key, dan Tab Code sebelumnya tetap biarkan di sini)
    // ... [Kode Anda Sebelumnya] ...

    // ===== FITUR BARU: LIVE API TESTING =====
    window.testApi = function(type, btnElement) {
        const urlInput = document.getElementById(`${type}Url`).value.trim();
        const resultBox = document.getElementById(`${type}ResultBox`);
        const resultCode = document.getElementById(`${type}Result`);
        const statusDot = document.getElementById(`${type}StatusDot`);
        
        // Cek jika input kosong
        if(!urlInput) {
            alert("Silakan masukkan URL terlebih dahulu!");
            return;
        }

        // Tampilkan Box dan Animasi Loading
        const originalBtnText = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        resultBox.classList.remove('hidden');
        resultCode.className = 'text-xs font-mono text-gray-400';
        resultCode.innerText = 'Menghubungkan ke server WINYUK API...';
        statusDot.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-pulse';

        // Simulasi Jeda Network (Delay)
        setTimeout(() => {
            btnElement.innerHTML = originalBtnText;
            let response;

            // Logika untuk Endpoint TikTok
            if (type === 'tiktok') {
                if (urlInput.includes('tiktok.com')) {
                    // Skenario: URL Valid (True)
                    response = {
                        status: true,
                        creator: "WINYUK",
                        message: "Fetch successful",
                        data: {
                            id: "7123981293812",
                            title: "Video Keren untuk Bot",
                            is_slide: false,
                            video_nowm: "https://dl.winyuk.com/media/nowm_123.mp4",
                            audio_url: "https://dl.winyuk.com/media/audio_123.mp3",
                            stats: { plays: 1500000, likes: 250000 }
                        }
                    };
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    // Skenario: URL Error (False)
                    response = { 
                        status: false, 
                        error: "Invalid URL. Harap masukkan link tiktok.com yang valid.",
                        code: 400
                    };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            } 
            
            // Logika untuk Endpoint Discord
            else if (type === 'discord') {
                if (urlInput.includes('discordapp.com') || urlInput.includes('discord.com')) {
                    // Skenario: URL Valid (True)
                    response = {
                        status: true,
                        creator: "WINYUK",
                        message: "Media ready to download",
                        data: {
                            filename: "winyuk_attachment.png",
                            content_type: "image/png",
                            size: "1.2 MB",
                            bypass_url: "https://api.winyuk.com/dl/bypass/abc123xyz"
                        }
                    };
                    resultCode.className = 'text-xs font-mono text-green-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]';
                } else {
                    // Skenario: URL Error (False)
                    response = { 
                        status: false, 
                        error: "Format salah. Gunakan link CDN Discord (cdn.discordapp.com).",
                        code: 400
                    };
                    resultCode.className = 'text-xs font-mono text-red-400';
                    statusDot.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]';
                }
            }

            // Tampilkan Response JSON ke dalam box
            resultCode.innerText = JSON.stringify(response, null, 4);
            
        }, 1500); // Simulasi delay 1.5 detik
    };
});
