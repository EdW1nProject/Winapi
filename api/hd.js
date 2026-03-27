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

        // 1. Bersihkan header Base64 dari Frontend
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // --- FUNGSI BANTUAN: Upload Base64 Langsung ke Imgur (Anti-Blokir) ---
        // Kita tidak pakai FormData biner lagi, murni teks URL-Encoded!
        const uploadToImgur = async (base64String) => {
            const params = new URLSearchParams();
            params.append('image', base64String);
            params.append('type', 'base64');

            const res = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    // Ini adalah Public Client-ID Imgur untuk upload anonim (Aman dipakai)
                    'Authorization': 'Client-ID 546c25a59c58ad7',
                    'Accept': 'application/json'
                },
                body: params
            });

            const data = await res.json();
            if (data.success) {
                return data.data.link; // Mengembalikan URL langsung (misal: https://i.imgur.com/xyz.jpg)
            }
            throw new Error(data.data?.error || 'Server Imgur menolak gambar.');
        };

        // 2. Upload gambar asli (buram) ke Imgur
        const blurUrl = await uploadToImgur(base64Data);

        // 3. EKSEKUSI API REMINI (Ryzendesu)
        // Kirim URL Imgur tadi ke mesin AI Remini
        const reminiApiUrl = `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(blurUrl)}`;
        const aiResponse = await fetch(reminiApiUrl);
        
        if (!aiResponse.ok) {
            throw new Error('Mesin AI Remini sedang sibuk atau offline.');
        }

        // 4. Ambil hasil HD dari Remini dan ubah kembali menjadi Base64
        let hdBase64;
        const contentType = aiResponse.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            // Jika Remini membalas dengan JSON
            const aiData = await aiResponse.json();
            const targetUrl = aiData.url || aiData.data;
            if (!targetUrl) throw new Error('Respon AI tidak valid.');
            
            const hdRes = await fetch(targetUrl);
            const hdBuffer = await hdRes.arrayBuffer();
            hdBase64 = Buffer.from(hdBuffer).toString('base64');
        } else {
            // Jika Remini langsung membalas dengan File Gambar
            const hdBuffer = await aiResponse.arrayBuffer();
            hdBase64 = Buffer.from(hdBuffer).toString('base64');
        }

        // 5. Upload hasil HD (Base64) kembali ke Imgur untuk dapat URL Permanen
        const finalHdUrl = await uploadToImgur(hdBase64);

        // 6. Berhasil! Kirim URL HD ke Frontend
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
