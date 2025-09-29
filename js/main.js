// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Mobile Dropdown Toggle
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.parentElement;
        dropdown.classList.toggle('active');
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Navbar scroll effect
// window.addEventListener('scroll', () => {
//     const navbar = document.querySelector('.navbar');
//     const topBar = document.querySelector('.top-bar');
//     const isMobile = window.innerWidth <= 768;
    
//     if (window.scrollY > 100) {

//         if (!isMobile) {
//             topBar.style.transform = 'translateY(-100%)';
//             navbar.style.top = '0';
//         } else {

//             navbar.style.top = '0';
//         }
//         navbar.style.background = 'rgba(255, 255, 255, 0.98)';
//         navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
//     } else {

//         if (!isMobile) {
//             topBar.style.transform = 'translateY(0)';
//             navbar.style.top = '28px';
//         } else {

//             navbar.style.top = '0';
//         }
//         navbar.style.background = 'rgba(255, 255, 255, 0.95)';
//         navbar.style.boxShadow = 'none';
//     }
// });

// Wait for the page to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Put all the logic into a single, named function
    function handleNavbarPosition() {
        const navbar = document.querySelector('.navbar');
        const topBar = document.querySelector('.top-bar');

        // A good practice to prevent errors if elements don't exist
        if (!navbar || !topBar) {
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const isScrolled = window.scrollY > 100;

        if (isScrolled) {
            // Logic for when the page is scrolled down
            if (!isMobile) {
                topBar.style.transform = 'translateY(-100%)';
            }
            navbar.style.top = '0'; // Navbar is always at the top when scrolled
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            // Logic for when the page is at the top
            if (!isMobile) {
                topBar.style.transform = 'translateY(0)';
                navbar.style.top = '28px'; // Position below the top bar
            } else {
                 navbar.style.top = '0'; // On mobile, navbar is always at the top
            }
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }

    // 2. Add event listeners for BOTH scroll and resize
    window.addEventListener('scroll', handleNavbarPosition);
    window.addEventListener('resize', handleNavbarPosition);

    // 3. Run the function once on page load to set the initial state correctly
    handleNavbarPosition();
});

// Handle resize events to ensure proper mobile behavior
window.addEventListener('resize', () => {
    const navbar = document.querySelector('.navbar');
    const topBar = document.querySelector('.top-bar');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, hide top bar and keep navbar at top
        topBar.style.display = 'none';
        navbar.style.top = '0';
        navbar.style.position = 'fixed';
        // Force immediate positioning to prevent spacing
        navbar.style.transform = 'translateZ(0)';
    } else {
        // On desktop, show top bar and position navbar below it
        topBar.style.display = 'block';
        navbar.style.top = '28px';
        navbar.style.position = 'fixed';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const message = this.querySelector('textarea').value;
        
        // Basic validation
        if (!name || !email) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .portfolio-item, .stat');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Initialize mobile behavior on page load
    const navbar = document.querySelector('.navbar');
    const topBar = document.querySelector('.top-bar');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, hide top bar and keep navbar at top
        topBar.style.display = 'none';
        navbar.style.top = '0';
        // Fix any scroll position issues on mobile
        if (window.scrollY > 0) {
            window.scrollTo(0, 0);
        }
    } else {
        // On desktop, show top bar and position navbar below it
        topBar.style.display = 'block';
        navbar.style.top = '28px';
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number) {
                    stat.textContent = '0+';
                    animateCounter(stat, number);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}
