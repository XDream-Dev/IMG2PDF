// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Update current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Update current date in PDF format
    const formatPDFDate = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options) + ' (UTC)';
    };
    
    document.getElementById('currentDate').textContent = formatPDFDate(new Date());
});

/* JavaScript for mobile accordion functionality */
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        const footerLinks = document.querySelectorAll('.footer-links');
        
        footerLinks.forEach(link => {
            const title = link.querySelector('.pdf-section-title');
            title.addEventListener('click', () => {
                link.classList.toggle('active');
            });
            
            // Keep the first section open by default
            if (link === footerLinks[0]) {
                link.classList.add('active');
            }
        });
    }
});