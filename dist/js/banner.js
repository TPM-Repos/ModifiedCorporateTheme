// Version 1.3.2 - Site Banner Injection
(function() {
    if (!window.config || !config.banner || !config.banner.enabled) return;
    var page = window.location.pathname.split('/').pop();
    var pages = config.banner.pages || [];
    if (pages.length && pages.indexOf(page) === -1) return;
    if (!config.banner.message) return;

    // Determine color
    var color = config.banner.color || (config.styles && config.styles.color && config.styles.color.secondary) || '#00AEEF';

    // Create banner element
    var banner = document.createElement('div');
    banner.className = 'site-banner';
    banner.setAttribute('role', 'banner');
    banner.innerHTML = config.banner.message;
    banner.style.background = color;
    banner.style.color = '#fff';
    banner.style.padding = '0.75em 1.5em';
    banner.style.textAlign = 'center';
    banner.style.fontSize = '1.1em';
    banner.style.fontWeight = 'bold';
    banner.style.letterSpacing = '0.01em';
    banner.style.position = 'relative';
    banner.style.zIndex = '1000';
    banner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.07)';

    // Insert at top of body
    document.body.insertBefore(banner, document.body.firstChild);
})(); 