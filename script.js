// Function to toggle between Dark and Light Mode
document.getElementById('theme-toggle').addEventListener('click', function() {
    const html = document.querySelector('html');
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Remember theme choice
    this.textContent = newTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
});

// Load saved theme on page load
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.querySelector('html');
    html.setAttribute('data-theme', savedTheme);
    
    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.textContent = savedTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
})();

// Function to handle the internal page navigation (mocking a working application flow)
function showSection(sectionId) {
    // Hide all main sections
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        window.scrollTo(0, 0); // Scroll to top for new "page"
    }

    // Optional: Special handling for form titles/clearing
    if (sectionId === 'signup-section') {
        document.getElementById('signup-form').reset();
    }
}

// Ensure the hero section is visible on initial load if no other state is set
document.addEventListener('DOMContentLoaded', function() {
    // Check if any section is already active, if not, show hero
    if (document.querySelectorAll('main section.active').length === 0) {
        showSection('hero-section');
    }
});
