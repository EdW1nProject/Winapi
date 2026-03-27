export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Gunakan method POST.' });
    }

    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ success: false, message: 'Payload gambar kosong.' });

        // 1. Ekstrak data mentah Base64
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const originalBuffer = Buffer.from(base64Data, 'base64');

        // --- FUNGSI BANTUAN: Upload Buffer ke Catbox ---
        const uploadToCatbox = async (bufferData, filename) => {
            const boundary = '----WinyukCatboxBoundary' + Date.now().toString(16);
            const header = Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n` +
                `--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`, 'utf-8'
            );
            const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
            const payload = Buffer.concat([header, bufferData, footer]);

            const uploadRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': payload.length.toString(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: payload
            });
            return await uploadRes.text();
        };

        // 2. Upload gambar asli (buram) ke server untuk mendapatkan URL publik
        const originalUrl = await uploadToCatbox(originalBuffer, 'winyuk_blur.jpg');
        
        if (!originalUrl.startsWith('https://')) {
            return res.status(500).json({ success: false, message: 'Gagal mengunggah gambar awal ke server.' });
        }

        // 3. PROSES AI HD (Remini Upscaler Public API)
        // Kita kirim URL gambar buram ke AI, dan AI akan mengembalikan foto yang tajam
        const aiResponse = await fetch(`https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(originalUrl)}`);
        
        if (!aiResponse.ok) {
            return res.status(500).json({ success: false, message: 'Server AI sedang sibuk. Coba beberapa saat lagi.' });
        }

        // Ambil hasil gambar HD dalam bentuk biner (Buffer)
        const hdArrayBuffer = await aiResponse.arrayBuffer();
        const hdBuffer = Buffer.from(hdArrayBuffer);

        // 4. Upload gambar hasil HD ke server untuk mendapatkan URL permanen
        const finalHdUrl = await uploadToCatbox(hdBuffer, 'winyuk_hd_clear.jpg');

        if (!finalHdUrl.startsWith('https://')) {
            return res.status(500).json({ success: false, message: 'Gagal mengunggah hasil HD ke server.' });
        }

        // 5. Selesai! Kembalikan URL foto HD ke frontend
        return res.status(200).json({
            success: true,
            url: finalHdUrl,
            message: 'Ajaib! Gambar berhasil diperjelas dengan AI Remini.'
        });

    } catch (error) {
        console.error("HD API Error:", error);
        return res.status(500).json({ success: false, message: `Terjadi kegagalan sistem: ${error.message}` });
    }
}
