export default async function handler(req, res) {
    // Keamanan dasar
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, message: 'Payload gambar kosong.' });
        }

        // 1. Ekstrak Base64 murni secara aman (Mengabaikan header apapun dari frontend)
        const base64Data = image.substring(image.indexOf(',') + 1);
        const originalBuffer = Buffer.from(base64Data, 'base64');

        // --- FUNGSI BANTUAN: Upload ke Imgur menggunakan File Blob ---
        // Ini adalah trik agar Imgur menerima format apapun (termasuk WebP dari Remini)
        const uploadToImgur = async (bufferData) => {
            const formData = new FormData();
            
            // Kita bungkus buffer menjadi Blob dan paksa namanya menjadi .jpg
            formData.append('image', new Blob([bufferData]), 'winyuk_image.jpg');

            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    // Client-ID Public Imgur
                    'Authorization': 'Client-ID 546c25a59c58ad7'
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                return data.data.link; // Mengembalikan direct link (https://i.imgur.com/...)
            }
            throw new Error(data.data?.error || 'Imgur menolak gambar.');
        };

        // 2. Upload gambar asli (buram) ke Imgur untuk dapatkan URL
        const blurUrl = await uploadToImgur(originalBuffer);

        // 3. EKSEKUSI API REMINI (Ryzendesu)
        // Kita tambahkan parameter &method=enhance agar AI tahu tugasnya
        const reminiApiUrl = `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(blurUrl)}&method=enhance`;
        const aiResponse = await fetch(reminiApiUrl);
        
        if (!aiResponse.ok) {
            throw new Error('Mesin AI Remini sedang sibuk atau menolak koneksi.');
        }

        // 4. Ambil hasil HD dari Remini (Otomatis mendeteksi format kembaliannya)
        let hdBuffer;
        const contentType = aiResponse.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const aiData = await aiResponse.json();
            const targetUrl = aiData.url || aiData.data;
            if (!targetUrl) throw new Error('Respon AI tidak berisi URL yang valid.');
            
            const hdRes = await fetch(targetUrl);
            hdBuffer = Buffer.from(await hdRes.arrayBuffer());
        } else {
            // Jika AI langsung mengembalikan file gambar fisik (JPEG/WebP)
            hdBuffer = Buffer.from(await aiResponse.arrayBuffer());
        }

        // 5. Upload hasil HD kembali ke Imgur menggunakan trik Blob
        const finalHdUrl = await uploadToImgur(hdBuffer);

        // 6. Selesai! Kirim URL HD ke Frontend
        return res.status(200).json({
            success: true,
            url: finalHdUrl,
            message: 'Ajaib! Gambar berhasil diperjelas secara nyata dengan AI Remini.'
        });

    } catch (error) {
        console.error("HD API Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: `Gagal diproses: ${error.message}` 
        });
    }
}
