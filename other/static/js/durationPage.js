// Preset buttons toggle
document.querySelectorAll('.preset-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-buttons button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function populateWheel(id, max, defaultVal = 0) {
    const wheel = document.getElementById(id);
    wheel.innerHTML = '';

    // Top padding
    wheel.appendChild(document.createElement('div')).textContent = '';

    for (let i = 0; i <= max; i++) {
        const div = document.createElement('div');
        div.textContent = String(i).padStart(2, '0');
        if (i === defaultVal) div.classList.add('selected');
        wheel.appendChild(div);
    }

    // Bottom padding
    wheel.appendChild(document.createElement('div')).textContent = '';
    wheel.scrollTop = (defaultVal + 1) * 30;
}

function setupScrollSnap(wheelId) {
    const wheel = document.getElementById(wheelId);
    wheel.addEventListener('scroll', () => {
        const items = wheel.querySelectorAll('div');
        let closest = null;
        let minDist = Infinity;
        const center = wheel.scrollTop + wheel.clientHeight / 2;

        items.forEach(item => {
            const itemCenter = item.offsetTop + item.offsetHeight / 2;
            const dist = Math.abs(itemCenter - center);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        });

        items.forEach(el => el.classList.remove('selected'));
        if (closest) closest.classList.add('selected');
    });
}

// Setup all 3 wheels
populateWheel('hoursWheel', 23, 1);
populateWheel('minutesWheel', 59, 26);
populateWheel('secondsWheel', 59, 1);

setupScrollSnap('hoursWheel');
setupScrollSnap('minutesWheel');
setupScrollSnap('secondsWheel');

// Function to get selected duration
function getSelectedDuration() {
    // Check if a preset button is active
    const activePresetBtn = document.querySelector('.preset-buttons button.active');
    if (activePresetBtn) {
        return {
            type: 'preset',
            value: activePresetBtn.textContent.trim(),
            minutes: parseInt(activePresetBtn.textContent.match(/\d+/)[0])
        };
    }

    // Get custom time from wheels
    const hours = document.querySelector('#hoursWheel .selected')?.textContent || '00';
    const minutes = document.querySelector('#minutesWheel .selected')?.textContent || '00';
    const seconds = document.querySelector('#secondsWheel .selected')?.textContent || '00';

    return {
        type: 'custom',
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds),
        totalMinutes: parseInt(hours) * 60 + parseInt(minutes) + Math.round(parseInt(seconds) / 60)
    };
}

// Handle Next button click
function handleNextButtonClick(event) {
    event.preventDefault(); // Prevent default link behavior
    
    const duration = getSelectedDuration();
    
    // Store duration data (you can use sessionStorage if needed)
    // Note: In a real app, you might want to store this data
    console.log('Selected duration:', duration);
    
    // Show loading state
    const nextBtn = event.currentTarget;
    const originalText = nextBtn.innerHTML;
    nextBtn.innerHTML = 'Loading...';
    nextBtn.disabled = true;
    
    // Add some visual feedback
    showNotification(`Duration set: ${duration.type === 'preset' ? duration.value : `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`}`);
    
    // Navigate to tour plan page after a short delay
    setTimeout(() => {
        window.location.href = 'tourPlanPage.html';
    }, 1000);
}

// DOM Elements
const optionCards = document.querySelectorAll('.option-card');
const navItems = document.querySelectorAll('.nav-item');
const nextButton = document.querySelector('.next-btn');

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

    // Add event listener to Next button
    if (nextButton) {
        nextButton.addEventListener('click', handleNextButtonClick);
    }

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
        } else if (focusedElement.classList.contains('next-btn')) {
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
        .nav-item:focus,
        .next-btn:focus {
            outline: 2px solid #4a7c59;
            outline-offset: 2px;
        }
        
        .option-card:focus:not(:focus-visible),
        .nav-item:focus:not(:focus-visible),
        .next-btn:focus:not(:focus-visible) {
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
// Handle Next button click
document.querySelector('.next-btn').addEventListener('click', function() {
    // You can add any validation here if needed
    window.location.href = "/tour-plan";
});