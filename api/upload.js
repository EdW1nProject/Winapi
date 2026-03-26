export default async function handler(req, res) {
    // Pastikan hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Endpoint ini hanya menerima method POST.' });
    }

    try {
        const { image, filename = 'image.png' } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, message: 'Data gambar tidak ditemukan dalam payload.' });
        }

        // Memisahkan header Base64 (contoh: "data:image/png;base64,...") dari data mentahnya
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Membungkus gambar ke FormData standar untuk dikirim ke public server (Telegra.ph)
        const formData = new FormData();
        formData.append('file', new Blob([buffer], { type: 'image/png' }), filename);

        // Eksekusi upload via Backend (sehingga aman dan tidak terkena CORS dari luar)
        const response = await fetch('https://telegra.ph/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Mengembalikan URL ke pengguna API Anda
        if (data && data[0] && data[0].src) {
            return res.status(200).json({
                success: true,
                url: 'https://telegra.ph' + data[0].src,
                message: 'Gambar berhasil dikonversi menjadi URL permanen.'
            });
        } else {
            return res.status(500).json({ success: false, message: 'Gagal mendapatkan URL dari server hosting.' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kegagalan sistem pada server API.' });
    }
}
