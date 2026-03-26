document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Intersection Observer for Fade-In Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach((el) => {
        observer.observe(el);
    });

    // 2. API Key Management
    const apiKeyInput = document.getElementById('apiKeyInput');
    const generateBtn = document.getElementById('generateBtn');
    const toggleVisibilityBtn = document.getElementById('toggleVisibility');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    
    let currentKey = "WINYUK-" + generateRandomString(24);
    let isHidden = true;

    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({length}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    function updateDisplay() {
        apiKeyInput.type = isHidden ? "password" : "text";
        apiKeyInput.value = currentKey; 
        toggleVisibilityBtn.innerHTML = isHidden ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
    }

    generateBtn.addEventListener('click', () => {
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        setTimeout(() => {
            currentKey = "WINYUK-" + generateRandomString(24);
            isHidden = false; 
            updateDisplay();
            generateBtn.innerHTML = originalText;
        }, 600);
    });

    toggleVisibilityBtn.addEventListener('click', () => {
        isHidden = !isHidden;
        updateDisplay();
    });

    copyKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentKey).then(() => {
            const icon = copyKeyBtn.innerHTML;
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            setTimeout(() => copyKeyBtn.innerHTML = icon, 2000);
        });
    });

    updateDisplay();

    // 3. Code Snippet Tabs Management
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const codeSnippet = document.getElementById('codeSnippet');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Dictionary of code templates
    const codes = {
        tiktok: `
<span class="text-purple-400">const</span> axios = <span class="text-blue-300">require</span>(<span class="text-green-300">'axios'</span>);

<span class="text-gray-500">// WINYUK API - TikTok Downloader Example</span>
<span class="text-purple-400">const</span> API_KEY = <span class="text-green-300">'YOUR_API_KEY'</span>;
<span class="text-purple-400">const</span> TIKTOK_URL = <span class="text-green-300">'https://vt.tiktok.com/ZSxxxxxxx/'</span>;

<span class="text-purple-400">async function</span> <span class="text-blue-400">downloadTikTok</span>(url) {
    <span class="text-purple-400">try</span> {
        <span class="text-purple-400">const</span> res = <span class="text-purple-400">await</span> axios.get(<span class="text-cyan-300">\`https://api.winyuk.com/v1/dl/tiktok?url=\${url}\`</span>, {
            headers: { <span class="text-green-300">'Authorization'</span>: <span class="text-cyan-300">\`Bearer \${API_KEY}\`</span> }
        });
        
        <span class="text-blue-300">console</span>.log(<span class="text-green-300">'Title:'</span>, res.data.title);
        <span class="text-blue-300">console</span>.log(<span class="text-green-300">'Video (No WM):'</span>, res.data.video_nowm);
        <span class="text-purple-400">if</span>(res.data.is_slide) {
             <span class="text-blue-300">console</span>.log(<span class="text-green-300">'Photos:'</span>, res.data.images); <span class="text-gray-500">// Array of images</span>
        }
    } <span class="text-purple-400">catch</span> (err) {
        <span class="text-blue-300">console</span>.error(<span class="text-green-300">'Error:'</span>, err.response?.data || err.message);
    }
}

downloadTikTok(TIKTOK_URL);`,

        discord: `
<span class="text-purple-400">const</span> axios = <span class="text-blue-300">require</span>(<span class="text-green-300">'axios'</span>);

<span class="text-gray-500">// WINYUK API - Discord Media Fetcher Example</span>
<span class="text-purple-400">const</span> API_KEY = <span class="text-green-300">'YOUR_API_KEY'</span>;
<span class="text-purple-400">const</span> DISCORD_URL = <span class="text-green-300">'https://cdn.discordapp.com/attachments/...'</span>;

<span class="text-purple-400">async function</span> <span class="text-blue-400">fetchDiscordMedia</span>(url) {
    <span class="text-purple-400">try</span> {
        <span class="text-purple-400">const</span> res = <span class="text-purple-400">await</span> axios.get(<span class="text-cyan-300">\`https://api.winyuk.com/v1/dl/discord?url=\${url}\`</span>, {
            headers: { <span class="text-green-300">'Authorization'</span>: <span class="text-cyan-300">\`Bearer \${API_KEY}\`</span> }
        });
        
        <span class="text-blue-300">console</span>.log(<span class="text-green-300">'File Name:'</span>, res.data.filename);
        <span class="text-blue-300">console</span>.log(<span class="text-green-300">'Direct Buffer URL:'</span>, res.data.download_url);
        <span class="text-gray-500">// Siap dikirim ke Discord/WhatsApp Bot sebagai Buffer</span>
        
    } <span class="text-purple-400">catch</span> (err) {
        <span class="text-blue-300">console</span>.error(<span class="text-green-300">'Error:'</span>, err.response?.data || err.message);
    }
}

fetchDiscordMedia(DISCORD_URL);`
    };

    // Tab Click Event
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active styles from all
            tabBtns.forEach(b => {
                b.classList.remove('text-purple-400', 'border-b-2', 'border-purple-400');
                b.classList.add('text-gray-500');
            });
            // Add active style to clicked
            btn.classList.remove('text-gray-500');
            btn.classList.add('text-purple-400', 'border-b-2', 'border-purple-400');
            
            // Change code content
            const target = btn.getAttribute('data-code');
            codeSnippet.innerHTML = codes[target];
        });
    });

    // Copy Code
    copyCodeBtn.addEventListener('click', () => {
        // Create temporary div to strip HTML tags for copying
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = codeSnippet.innerHTML;
        const textToCopy = tempDiv.textContent || tempDiv.innerText;

        navigator.clipboard.writeText(textToCopy).then(() => {
            copyCodeBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
            }, 2000);
        });
    });
});
