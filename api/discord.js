export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || !url.includes('discordapp.com/attachments') && !url.includes('discord.com/channels')) {
        return res.status(400).json({ success: false, message: 'URL Lampiran Discord tidak valid.' });
    }

    try {
        // Discord API Proxy Logic:
        // Discord belakangan ini memperketat akses URL attachment dari luar.
        // Serverless function ini bisa menjadi proxy agar file bisa didownload tanpa terblokir CORS.

        res.status(200).json({
            success: true,
            platform: 'Discord',
            original_url: url,
            download_url: url, // URL proxy untuk file discord
            message: 'Simulasi API Discord berhasil dijalankan via Vercel.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memproses URL.' });
    }
}
