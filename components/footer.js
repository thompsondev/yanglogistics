// Global Footer Loader Utility
class FooterLoader {
    constructor() {
        this.footerContainer = null;
        this.footerPath = 'components/footer.html';
    }

    // Initialize footer loading
    init() {
        console.log('FooterLoader: Initializing...');
        this.footerContainer = document.getElementById('global-footer');
        if (this.footerContainer) {
            console.log('FooterLoader: Footer container found, loading footer...');
            this.loadFooter();
        } else {
            console.error('FooterLoader: Footer container not found! Make sure you have <div id="global-footer"></div> in your HTML.');
        }
    }

    // Load footer content from external file
    async loadFooter() {
        try {
            console.log('FooterLoader: Attempting to load footer from:', this.footerPath);
            const response = await fetch(this.footerPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const footerContent = await response.text();
            this.footerContainer.innerHTML = footerContent;
            console.log('FooterLoader: Footer loaded successfully!');
            
            // Initialize any footer-specific functionality
            this.initFooterFunctionality();
        } catch (error) {
            console.error('FooterLoader: Error loading footer:', error);
            console.log('FooterLoader: Loading fallback footer...');
            this.loadFallbackFooter();
        }
    }

    // Fallback footer in case the external file fails to load
    loadFallbackFooter() {
        console.log('FooterLoader: Loading fallback footer...');
        const fallbackFooter = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <div class="footer-logo">
                                <img src="../logo.png" alt="Logistics Logo" class="logo-img">
                                <span class="logo-text">YangLogistics</span>
                            </div>
                            <p>Connecting the world through innovative logistics solutions and reliable supply chain management.</p>
                            <div class="social-links">
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h4>Services</h4>
                            <ul>
                                <li><a href="index.html#services">Ocean Freight</a></li>
                                <li><a href="index.html#services">Air Freight</a></li>
                                <li><a href="index.html#services">Ground Transport</a></li>
                                <li><a href="index.html#services">Warehousing</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="index.html#about">About Us</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">News</a></li>
                                <li><a href="index.html#contact">Contact</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="tracking.html">Track Shipment</a></li>
                                <li><a href="order.html">Get Quote</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 YangLogistics. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
        this.footerContainer.innerHTML = fallbackFooter;
        console.log('FooterLoader: Fallback footer loaded successfully!');
    }

    // Initialize any footer-specific functionality
    initFooterFunctionality() {
        console.log('FooterLoader: Initializing footer functionality...');
        // Add any footer-specific JavaScript here
        // For example, social media link handlers, newsletter signup, etc.
        
        // Add smooth scrolling for anchor links
        const footerLinks = this.footerContainer.querySelectorAll('a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        console.log('FooterLoader: Footer functionality initialized!');
    }
}

// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('FooterLoader: DOM loaded, initializing footer...');
    const footerLoader = new FooterLoader();
    footerLoader.init();
});

// Export for manual initialization if needed
window.FooterLoader = FooterLoader; 