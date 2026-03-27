/**
 * Main Application - Navigation, forms, and general functionality
 */

class MusicWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.initNavigation();
        this.initBio();
        this.initForms();
        this.initLightbox();
        this.initIntersectionObserver();
    }

    // Navigation
    initNavigation() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile menu when link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('.section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });

            // Add shadow to nav on scroll
            const nav = document.querySelector('.nav-bar');
            if (window.scrollY > 50) {
                nav.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
            } else {
                nav.style.boxShadow = 'none';
            }
        });
    }

    // Bio Section
    initBio() {
        const bioText = document.getElementById('bio-text');
        const saveBioBtn = document.getElementById('save-bio-btn');

        // Load saved bio
        const savedBio = storage.getBio();
        if (savedBio) {
            bioText.innerHTML = savedBio;
        }

        // Set initial state based on auth status
        this.updateBioEditableState();

        // Save bio
        saveBioBtn.addEventListener('click', () => {
            // Check if user is logged in
            if (!authManager || !authManager.isAdmin()) {
                this.showNotification('You must be logged in to save bio.', 'error');
                return;
            }
            
            const content = bioText.innerHTML;
            storage.saveBio(content);
            this.showNotification('Bio saved successfully!', 'success');
        });
    }

    updateBioEditableState() {
        const bioText = document.getElementById('bio-text');
        const saveBioBtn = document.getElementById('save-bio-btn');
        const isAdmin = authManager && authManager.isAdmin();

        if (bioText) {
            if (isAdmin) {
                bioText.setAttribute('contenteditable', 'true');
                bioText.classList.add('editable');
            } else {
                bioText.removeAttribute('contenteditable');
                bioText.classList.remove('editable');
            }
        }

        if (saveBioBtn) {
            saveBioBtn.style.display = isAdmin ? 'inline-block' : 'none';
        }
    }

    // Forms
    initForms() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value;
            
            if (this.validateEmail(email)) {
                storage.saveNewsletterSubscription(email);
                this.showFormMessage('newsletter-message', 'Thank you for subscribing!', 'success');
                newsletterForm.reset();
            } else {
                this.showFormMessage('newsletter-message', 'Please enter a valid email address', 'error');
            }
        });

        // Contact form
        const contactForm = document.getElementById('contact-form');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            if (name && this.validateEmail(email) && message) {
                storage.saveContactMessage({ name, email, message });
                this.showFormMessage('contact-message-status', 'Message sent successfully!', 'success');
                contactForm.reset();
            } else {
                this.showFormMessage('contact-message-status', 'Please fill in all fields correctly', 'error');
            }
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showFormMessage(elementId, message, type) {
        const messageEl = document.getElementById(elementId);
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        
        setTimeout(() => {
            messageEl.className = 'form-message';
        }, 5000);
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'success' ? 'var(--color-accent)' : '#CD5C5C'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Lightbox
    initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.querySelector('.lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item img');

        galleryItems.forEach(img => {
            img.addEventListener('click', () => {
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Intersection Observer for animations
    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }
}

// Global helper function for smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicWebsite = new MusicWebsite();

    // Add animations to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be implemented later for offline functionality
    });
}
