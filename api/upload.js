export default async function handler(req, res) {
    // Keamanan dasar: Hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, message: 'Payload gambar kosong.' });
        }

        // 1. Ekstrak data mentah dari string Base64
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Kita gunakan server CATBOX.MOE (Anti-Blokir, Tanpa API Key)
        // Merakit paket Multipart/Form-Data secara manual agar 100% lolos di Vercel
        const boundary = '----WinyukCatboxBoundary' + Date.now().toString(16);

        const header = Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="reqtype"\r\n\r\n` +
            `fileupload\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="fileToUpload"; filename="winyuk_image.png"\r\n` +
            `Content-Type: image/png\r\n\r\n`,
            'utf-8'
        );

        const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
        
        // Gabungkan semua komponen menjadi satu payload biner
        const payload = Buffer.concat([header, buffer, footer]);

        // 3. Tembak langsung ke API Catbox dengan menyamar sebagai browser (User-Agent)
        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length.toString(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: payload
        });

        // Catbox sangat efisien, ia mengembalikan URL langsung dalam bentuk teks biasa
        const resultText = await response.text();

        // 4. Validasi hasil
        if (resultText.startsWith('https://')) {
            return res.status(200).json({
                success: true,
                url: resultText.trim(),
                message: 'Gambar berhasil di-hosting via Catbox.'
            });
        } else {
            // Jika gagal, tampilkan pesan asli dari server untuk mempermudah debug
            return res.status(500).json({ success: false, message: `Ditolak server: ${resultText}` });
        }

    } catch (error) {
        console.error("Upload API Error:", error);
        return res.status(500).json({ success: false, message: `Terjadi kegagalan sistem Vercel: ${error.message}` });
    }
}
