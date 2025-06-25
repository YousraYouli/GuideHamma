// DOM Elements
const optionCards = document.querySelectorAll('.option-card');
const navItems = document.querySelectorAll('.nav-item');

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Add event listeners to option cards
    optionCards.forEach(card => {
        card.addEventListener('click', handleOptionClick);
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
    });

    // Add event listeners to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', handleKeyNavigation);

    // Add orientation change handler
    window.addEventListener('orientationchange', handleOrientationChange);

    // Add resize handler for responsive adjustments
    window.addEventListener('resize', debounce(handleResize, 250));
}

// Handle option card clicks
function handleOptionClick(event) {
    const card = event.currentTarget;
    const option = card.dataset.option;

    // Prevent double clicks
    if (card.classList.contains('loading')) {
        return;
    }

    // Add loading state
    card.classList.add('loading');

    // Simulate navigation delay
    setTimeout(() => {
        handleJourneySelection(option);
        card.classList.remove('loading');
    }, 1000);
}

// Handle touch events for better mobile interaction
function handleTouchStart(event) {
    const card = event.currentTarget;
    card.style.transform = 'scale(0.98)';

    // Reset transform after touch
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
}

// Handle journey selection
function handleJourneySelection(option) {
    let message = '';

    switch (option) {
        case 'classic':
            message = 'Starting Classic Garden Route...';
            break;
        case 'limited':
            message = 'Starting Limited Time Tour...';
            break;
        default:
            message = 'Unknown option selected';
    }

    // Show selection feedback
    showNotification(message);

    // Here you would typically navigate to the next screen
    // For demo purposes, we'll just log the selection
    console.log(`Selected journey: ${option}`);

    // In a real app, you might do:
    // window.location.href = `/journey/${option}`;
    // or use a router if it's a SPA
}

// Handle navigation clicks
function handleNavClick(event) {
    const navItem = event.currentTarget;
    const navType = navItem.dataset.nav;

    // Remove active class from all nav items
    navItems.forEach(item => item.classList.remove('active'));

    // Add active class to clicked item
    navItem.classList.add('active');

    // Handle navigation
    handleNavigation(navType);
}

// Handle navigation logic
function handleNavigation(navType) {
    switch (navType) {
        case 'home':
            showNotification('Already on Home page');
            break;
        case 'search':
            showNotification('Search feature coming soon!');
            break;
        case 'settings':
            showNotification('Settings feature coming soon!');
            break;
        default:
            console.log(`Unknown navigation: ${navType}`);
    }
}

// Keyboard navigation support
function handleKeyNavigation(event) {
    const { key } = event;

    if (key === 'Enter' || key === ' ') {
        const focusedElement = document.activeElement;

        if (focusedElement.classList.contains('option-card')) {
            event.preventDefault();
            focusedElement.click();
        } else if (focusedElement.classList.contains('nav-item')) {
            event.preventDefault();
            focusedElement.click();
        }
    }

    // Arrow key navigation for cards
    if (key === 'ArrowDown' || key === 'ArrowUp') {
        const focusedElement = document.activeElement;

        if (focusedElement.classList.contains('option-card')) {
            event.preventDefault();
            const cards = Array.from(optionCards);
            const currentIndex = cards.indexOf(focusedElement);

            let nextIndex;
            if (key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % cards.length;
            } else {
                nextIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
            }

            cards[nextIndex].focus();
        }
    }
}

// Handle orientation changes
function handleOrientationChange() {
    // Small delay to ensure proper rendering after orientation change
    setTimeout(() => {
        // Trigger a resize event to recalculate any dynamic sizing
        window.dispatchEvent(new Event('resize'));
    }, 100);
}

// Handle window resize
function handleResize() {
    // Adjust any dynamic calculations if needed
    const container = document.querySelector('.container');

    // Update container height if needed for certain screen sizes
    if (window.innerHeight < 600) {
        container.style.minHeight = `${window.innerHeight}px`;
    } else {
        container.style.minHeight = '100vh';
    }
}

// Show notification/toast message
function showNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4a7c59;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility function to debounce events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add focus styles for accessibility
function addFocusStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .option-card:focus,
        .nav-item:focus {
            outline: 2px solid #4a7c59;
            outline-offset: 2px;
        }
        
        .option-card:focus:not(:focus-visible),
        .nav-item:focus:not(:focus-visible) {
            outline: none;
        }
    `;
    document.head.appendChild(style);
}

// Initialize focus styles
addFocusStyles();

// Performance optimization: Use passive listeners where appropriate
if ('addEventListener' in window) {
    const supportsPassive = (() => {
        let support = false;
        try {
            const options = Object.defineProperty({}, 'passive', {
                get() {
                    support = true;
                    return false;
                }
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            support = false;
        }
        return support;
    })();

    // Store passive support globally for use in event listeners
    window.supportsPassive = supportsPassive;
}