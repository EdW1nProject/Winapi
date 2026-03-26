export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || !url.includes('tiktok.com')) {
        return res.status(400).json({ success: false, message: 'URL TikTok tidak valid. Pastikan ada unsur tiktok.com' });
    }

    try {
        // Mengambil data dari public endpoint tanpa API Key
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Jika API publik gagal menemukan data
        if (data.code !== 0) {
            return res.status(404).json({ success: false, message: 'Media tidak ditemukan. Pastikan akun tidak diprivat.' });
        }

        const info = data.data;
        const isImage = info.images && info.images.length > 0;

        // Menyusun respon untuk frontend
        const result = {
            success: true,
            platform: 'TikTok',
            type: isImage ? 'image' : 'video',
            author: info.author.nickname,
            title: info.title,
            cover: info.cover,
            media: isImage ? info.images : [info.play] // Array URL media
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat mengambil data TikTok.' });
    }
}
