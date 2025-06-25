
document.addEventListener('DOMContentLoaded', () => {

    // Get all clickable items in the settings list and nav bar
    const clickableItems = document.querySelectorAll('.setting-item, .bottom-nav a');

    clickableItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Prevent default link behavior
            event.preventDefault();

            // For demonstration, we'll log the action to the console
            // In a real app, this would navigate to a new page or open a modal
            const itemText = item.querySelector('span')?.textContent.trim();
            if (itemText) {
                console.log(`Navigating to: ${itemText}`);
                // Example of a real navigation:
                // window.location.href = `/${itemText.toLowerCase().replace(' ', '-')}.html`;
            }
        });
    });

    // Handle language change
    const languageSelect = document.querySelector('select[name="language"]');
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            console.log(`Language changed to: ${event.target.value}`);
            // Here you would add logic to update the app's language
        });
    }
    });