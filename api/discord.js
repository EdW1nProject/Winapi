export default async function handler(req, res) {
    const { url } = req.query;

    // Memastikan itu adalah link attachment Discord
    if (!url || (!url.includes('discordapp.com/attachments') && !url.includes('discord.com/channels'))) {
        return res.status(400).json({ success: false, message: 'Harap masukkan URL Lampiran (Attachment) Discord yang valid.' });
    }

    try {
        res.status(200).json({
            success: true,
            platform: 'Discord',
            type: 'file',
            media: [url],
            message: 'Tautan Discord berhasil diproses.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memproses URL Discord.' });
    }
}
