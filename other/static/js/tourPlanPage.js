const classicBtn = document.getElementById('classicBtn');
const customBtn = document.getElementById('customBtn');

classicBtn.addEventListener('click', () => {
    classicBtn.classList.add('active');
    customBtn.classList.remove('active');
});

customBtn.addEventListener('click', () => {
    customBtn.classList.add('active');
    classicBtn.classList.remove('active');
});

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
    console.log(`Selected journey: ${option}`);

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

function showNotification(message) {

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





