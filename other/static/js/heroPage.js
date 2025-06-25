

const redirectDelay = 3000; // time in milliseconds

setTimeout(function () {

    console.log(`Redirecting after ${redirectDelay / 1000} seconds...`);
    window.location.href = '../html/landingPage.html'; 

}, redirectDelay);