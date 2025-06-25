const form = document.getElementById('feedback-form');

form.addEventListener('submit', function (event) {
    // Prevent the default form submission behavior (page reload)
    event.preventDefault();

    // In a real application, you would collect form data and send it to a server.
    const feedbackText = event.target.elements.feedback.value;
    console.log('Feedback submitted:', feedbackText);

    // For this demo, we'll just show an alert.
    alert('Thank you for your feedback!');

    // Optionally, clear the form after submission
    form.reset();
});