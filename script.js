// Function to toggle between Dark and Light Mode
document.getElementById('theme-toggle').addEventListener('click', function() {
    const html = document.querySelector('html');
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Remember theme choice
    this.textContent = newTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    
    // NEW: Update ambience greeting when theme changes
    updateAmbienceGreeting(newTheme);
});

// Load saved theme on page load
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.querySelector('html');
    html.setAttribute('data-theme', savedTheme);
    
    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.textContent = savedTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    
    // Initial ambience update
    updateAmbienceGreeting(savedTheme);
})();

// NEW: Function to handle AI Reply and update ambience based on time/theme
function updateAmbienceGreeting(theme) {
    const greetingEl = document.getElementById('ambience-greeting');
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) {
        timeGreeting = 'Good Morning! Start Your Exchange.';
    } else if (hour < 18) {
        timeGreeting = 'Good Afternoon! Time to Connect Skills.';
    } else {
        timeGreeting = 'Good Evening! Find Your Night Match.';
    }
    
    let themeMessage = theme === 'dark' ? ' (Dark Mode Active)' : ' (Light Mode Active)';
    greetingEl.textContent = timeGreeting + themeMessage;
}

// Function to handle the internal page navigation (working properly)
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

    // Reset login error message when navigating away
    document.getElementById('login-error').textContent = '';
}

// =========================================================
// NEW: MOCK DATA STORAGE AND LOGIN LOGIC (using LocalStorage)
// =========================================================

// Handle Sign Up Form Submission
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const skillsOffer = document.getElementById('skills-offer').value;
    const skillsNeed = document.getElementById('skills-need').value;
    
    if (password.length < 6) {
         alert("Password must be at least 6 characters long.");
         return;
    }
    
    // Store user data securely in LocalStorage (MOCK BACKEND)
    const userData = {
        name: name,
        email: email,
        skillsOffer: skillsOffer,
        skillsNeed: skillsNeed
    };
    
    localStorage.setItem('currentUser', username);
    localStorage.setItem('user_' + username, JSON.stringify(userData));
    localStorage.setItem('pass_' + username, password); // Store password (NOT SECURE in REAL APP)

    // Simulate success and move to match page
    alert(`Success! Profile created for ${username}. (Credentials stored locally)`);
    showSection('match-section');
});

// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const storedPassword = localStorage.getItem('pass_' + username);
    const errorMessage = document.getElementById('login-error');

    if (storedPassword && storedPassword === password) {
        localStorage.setItem('currentUser', username);
        errorMessage.textContent = '';
        alert("Login successful! Welcome back.");
        showSection('match-section');
    } else {
        errorMessage.textContent = 'Login failed: Invalid username or password.';
    }
});


// =========================================================
// NEW: POST-MATCH INTERACTION LOGIC
// =========================================================

function startExchange(matchId) {
    const matchUser = matchId === 'alex' ? 'Alex Johnson' : 'Maria Lopez';
    
    // Update the chat header
    document.getElementById('chat-header').textContent = `Exchange with ${matchUser}`;
    
    // Clear and reset the chat box content dynamically based on the match
    const chatBox = document.querySelector('.chat-box');
    chatBox.innerHTML = `
        <div id="ai-reply" class="chat-message ai-message">
            <p>👋 **Aura AI:** Welcome to your exchange with ${matchUser}! Since you matched on **Photography** and **Web Design**, how should you start the exchange?</p>
        </div>
        <div class="chat-message user-message">
            <p>I will send a message to ${matchUser} to schedule our first lesson.</p>
        </div>
        <div class="chat-message ai-message">
            <p>👍 **Aura AI:** Proactive! I have logged **1 Skill Minute** for initiating the contact. Keep me updated!</p>
        </div>
    `;

    // Switch to the chat section
    showSection('chat-section');
}

// Ensure the hero section is visible on initial load
document.addEventListener('DOMContentLoaded', function() {
    // Check for a logged-in user in localStorage and go straight to match if found
    if (localStorage.getItem('currentUser')) {
        showSection('match-section');
    } else {
        showSection('hero-section');
    }
});
