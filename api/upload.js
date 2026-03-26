export default async function handler(req, res) {
    // Pastikan hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    try {
        const { image, filename = 'winyuk_image.png' } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, message: 'Payload gambar kosong.' });
        }

        // 1. Membersihkan string Base64 dari header MIME type (misal: "data:image/png;base64,")
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        
        // 2. Mengubah Base64 murni menjadi Binary Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // 3. TRIK JITU: Merakit Multipart/Form-Data secara manual (Solusi Vercel Node.js)
        const boundary = '----WinyukApiBoundary' + Math.random().toString(16).substring(2);
        
        // Membuat Header Payload
        const header = Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
            `Content-Type: image/png\r\n\r\n`, 
            'utf-8'
        );
        
        // Membuat Footer Payload
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
        
        // Menggabungkan Header, Gambar (Buffer), dan Footer menjadi satu paket
        const payload = Buffer.concat([header, buffer, footer]);

        // 4. Mengirim paket utuh ke Telegra.ph
        const response = await fetch('https://telegra.ph/upload', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length
            },
            body: payload
        });

        const data = await response.json();

        // 5. Validasi dan Kembalikan URL
        if (data && data[0] && data[0].src) {
            return res.status(200).json({
                success: true,
                url: 'https://telegra.ph' + data[0].src,
                message: 'Gambar berhasil di-hosting.'
            });
        } else if (data.error) {
            return res.status(500).json({ success: false, message: `Ditolak oleh server: ${data.error}` });
        } else {
            return res.status(500).json({ success: false, message: 'Server hosting tidak merespons URL dengan benar.' });
        }

    } catch (error) {
        // Log ini akan muncul di dashboard Vercel -> tab "Logs" untuk mempermudah pemantauan
        console.error("API Upload Error:", error); 
        return res.status(500).json({ success: false, message: 'Gagal memproses gambar di server Vercel.' });
    }
}
