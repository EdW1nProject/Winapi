export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || !url.includes('tiktok.com')) {
        return res.status(400).json({ success: false, message: 'URL TikTok tidak valid.' });
    }

    try {
        // LOGIKA SCRAPING: 
        // Di aplikasi nyata, Anda bisa menggunakan fetch() ke web scraper publik gratis 
        // atau library scraper khusus TikTok di sini.
        
        // Simulasi respon sukses API
        res.status(200).json({
            success: true,
            platform: 'TikTok',
            original_url: url,
            download_url: url, // Ganti ini dengan hasil scrape URL video asli nantinya
            message: 'Simulasi API TikTok berhasil dijalankan via Vercel.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memproses URL.' });
    }
}
