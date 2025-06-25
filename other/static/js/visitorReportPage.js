document.addEventListener('DOMContentLoaded', () => {

    const shareButton = document.querySelector('.share-button');

    shareButton.addEventListener('click', async () => {
        const shareData = {
            title: 'My Tour Report',
            text: 'Check out the summary of my latest tour!',
            url: window.location.href // Shares the current page's URL
        };

        // Check if the browser supports the Web Share API
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Report shared successfully!');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback for browsers that do not support the Share API (e.g., most desktops)
            alert('Share feature is not supported on this browser. You can copy the link manually!');
        }
    });

});