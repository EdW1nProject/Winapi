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

        // 1. Ekstrak Base64 menjadi Buffer biner
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // --- FUNGSI BANTUAN: Upload Super Cepat ke TmpFiles ---
        // Kita pakai TmpFiles karena tidak memblokir Vercel dan langsung memberikan direct link
        const uploadImage = async (imgBuffer, fileName) => {
            const formData = new FormData();
            // Menggunakan Blob native untuk menghindari error perakitan Buffer manual
            formData.append('file', new Blob([imgBuffer], { type: 'image/jpeg' }), fileName);
            
            const res = await fetch('https://tmpfiles.org/api/v1/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            if (data?.data?.url) {
                // TmpFiles memberikan link web (view). Kita ubah regex-nya menjadi direct link download (/dl/)
                return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
            }
            throw new Error('Server hosting sementara menolak gambar.');
        };

        // 2. Upload gambar asli (buram) untuk mendapatkan URL
        const blurUrl = await uploadImage(buffer, 'winyuk_blur.jpg');

        // 3. EKSEKUSI API REMINI (Pembuktian!)
        // Kita tembak URL gambar buram ke AI Ryzendesu (Remini API)
        const reminiApiUrl = `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(blurUrl)}`;
        const aiResponse = await fetch(reminiApiUrl);
        
        if (!aiResponse.ok) {
            throw new Error('Mesin AI Remini sedang sibuk atau offline.');
        }

        // Kita buat sistem pintar: Cek apakah AI mengembalikan JSON atau langsung File Gambar mentah
        let hdBuffer;
        const contentType = aiResponse.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const aiData = await aiResponse.json();
            // Jika mengembalikan JSON, kita ekstrak URL-nya dan download ulang
            const targetUrl = aiData.url || aiData.data;
            if (!targetUrl) throw new Error('Respon AI tidak valid.');
            
            const hdRes = await fetch(targetUrl);
            hdBuffer = Buffer.from(await hdRes.arrayBuffer());
        } else {
            // Jika AI langsung mengirim gambar mentah
            hdBuffer = Buffer.from(await aiResponse.arrayBuffer());
        }

        // 4. Upload gambar hasil HD ke server untuk mendapatkan URL permanen final
        const finalHdUrl = await uploadImage(hdBuffer, 'winyuk_remini_hd.jpg');

        // 5. Berhasil! Kirim URL HD ke Frontend
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
