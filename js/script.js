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

    // 2. API Key Management Elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const generateBtn = document.getElementById('generateBtn');
    const toggleVisibilityBtn = document.getElementById('toggleVisibility');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    
    let currentKey = "WINYUK-" + generateRandomString(24);
    let isHidden = true;

    // Helper to generate random string
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Update Input Display
    function updateDisplay() {
        if (isHidden) {
            apiKeyInput.type = "password";
            apiKeyInput.value = currentKey; 
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        } else {
            apiKeyInput.type = "text";
            apiKeyInput.value = currentKey;
            toggleVisibilityBtn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        }
    }

    // Generate New Key
    generateBtn.addEventListener('click', () => {
        // Add loading state
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        
        setTimeout(() => {
            currentKey = "WINYUK-" + generateRandomString(24);
            isHidden = false; // Automatically show new key
            updateDisplay();
            generateBtn.innerHTML = originalText;
        }, 600);
    });

    // Toggle Visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        isHidden = !isHidden;
        updateDisplay();
    });

    // Copy API Key
    copyKeyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentKey).then(() => {
            const icon = copyKeyBtn.innerHTML;
            copyKeyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
            setTimeout(() => copyKeyBtn.innerHTML = icon, 2000);
        });
    });

    // Initialize display
    updateDisplay();

    // 3. Copy Code Snippet
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const codeSnippet = document.getElementById('codeSnippet');

    copyCodeBtn.addEventListener('click', () => {
        const textToCopy = codeSnippet.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyCodeBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Code';
            }, 2000);
        });
    });
});
