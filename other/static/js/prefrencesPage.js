// DOM Elements
const destinationInput = document.getElementById('destinationInput');
const addBtn = document.getElementById('addBtn');
const stopList = document.getElementById('stopList');
const optionCards = document.querySelectorAll('.option-card');
const navItems = document.querySelectorAll('.nav-item');
const startTourBtn = document.getElementById('startTourBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupTourRedirection();
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

    // Destination list functionality
    addBtn.addEventListener('click', addDestination);
    destinationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addDestination();
    });
}

function addDestination() {
    const value = destinationInput.value.trim();
    if (value !== '') {
        const li = document.createElement('li');
        const index = stopList.children.length + 1;
        li.innerHTML = `<span>${index}. ${value}</span><i class="fas fa-trash"></i>`;
        stopList.appendChild(li);
        destinationInput.value = '';

        li.querySelector('i').addEventListener('click', () => {
            li.remove();
            updateIndices();
        });
    }
}

function updateIndices() {
    const items = stopList.querySelectorAll('li');
    items.forEach((item, i) => {
        const name = item.querySelector('span').textContent.split('. ')[1];
        item.querySelector('span').textContent = `${i + 1}. ${name}`;
    });
}

function setupTourRedirection() {
    if (startTourBtn) {
        startTourBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get selected destinations
            const stops = Array.from(document.querySelectorAll('#stopList li span'))
                            .map(span => span.textContent.split('. ')[1]);
            
            if (stops.length === 0) {
                showNotification("Please add at least one destination");
                return;
            }

            // Store destinations for the next page
            sessionStorage.setItem('tourStops', JSON.stringify(stops));
            
            // Redirect to Dijkstra page
            window.location.href = "/dijkstra";
        });
    }
}

// Handle option card clicks
function handleOptionClick(event) {
    const card = event.currentTarget;
    const option = card.dataset.option;

    if (card.classList.contains('loading')) return;

    card.classList.add('loading');

    setTimeout(() => {
        handleJourneySelection(option);
        card.classList.remove('loading');
    }, 1000);
}

function handleTouchStart(event) {
    const card = event.currentTarget;
    card.style.transform = 'scale(0.98)';
    setTimeout(() => card.style.transform = '', 150);
}

function handleJourneySelection(option) {
    const messages = {
        'classic': 'Starting Classic Garden Route...',
        'limited': 'Starting Limited Time Tour...',
        'default': 'Unknown option selected'
    };
    showNotification(messages[option] || messages.default);
}

function handleNavClick(event) {
    const navItem = event.currentTarget;
    const navType = navItem.dataset.nav;

    navItems.forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');
    handleNavigation(navType);
}

function handleNavigation(navType) {
    const messages = {
        'home': 'Already on Home page',
        'search': 'Search feature coming soon!',
        'settings': 'Settings feature coming soon!'
    };
    if (messages[navType]) showNotification(messages[navType]);
}

function handleKeyNavigation(event) {
    const { key } = event;
    const focusedElement = document.activeElement;

    if (key === 'Enter' || key === ' ') {
        if (focusedElement.classList.contains('option-card') || 
            focusedElement.classList.contains('nav-item')) {
            event.preventDefault();
            focusedElement.click();
        }
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (focusedElement.classList.contains('option-card')) {
            event.preventDefault();
            const cards = Array.from(optionCards);
            const currentIndex = cards.indexOf(focusedElement);
            const nextIndex = key === 'ArrowDown' 
                ? (currentIndex + 1) % cards.length 
                : currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
            cards[nextIndex].focus();
        }
    }
}

function handleOrientationChange() {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
}

function handleResize() {
    const container = document.querySelector('.container');
    container.style.minHeight = window.innerHeight < 600 
        ? `${window.innerHeight}px` 
        : '100vh';
}

function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

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

    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Accessibility features
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

// Initialize passive event listeners detection
if ('addEventListener' in window) {
    window.supportsPassive = (() => {
        let support = false;
        try {
            const options = {
                get passive() {
                    support = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            support = false;
        }
        return support;
    })();
}

addFocusStyles();  