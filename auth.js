(function() {
// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Enhanced Authentication with Mobile Responsiveness

// Form elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Enhanced login form submission with mobile optimization
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            showLoading('Signing in...');
            
            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData.entries());
            
            // Enhanced validation with mobile-friendly messages
            if (!validateLoginData(loginData)) {
                hideLoading();
                return;
            }
            
            // Enhanced login with mobile optimization
            const response = await api.login(loginData);
            
            if (response.success) {
                showNotification('Login successful! Redirecting...', 'success');
                
                // Enhanced redirect with mobile optimization
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, window.innerWidth <= 768 ? 1500 : 1000); // Longer delay on mobile for better UX
            } else {
                showNotification(response.message || 'Login failed. Please try again.', 'error');
            }
            
            hideLoading();
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please check your connection and try again.', 'error');
            hideLoading();
        }
    });
}

// Enhanced signup form submission with mobile optimization
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            showLoading('Creating account...');
            
            const formData = new FormData(signupForm);
            const signupData = Object.fromEntries(formData.entries());
            
            // Enhanced validation with mobile-friendly messages
            if (!validateSignupData(signupData)) {
                hideLoading();
                return;
            }
            
            // Enhanced signup with mobile optimization
            const response = await api.signup(signupData);
            
            if (response.success) {
                showNotification('Account created successfully! Please check your email for verification.', 'success');
                
                // Enhanced redirect with mobile optimization
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, window.innerWidth <= 768 ? 2000 : 1500); // Longer delay on mobile for better UX
            } else {
                showNotification(response.message || 'Signup failed. Please try again.', 'error');
            }
            
            hideLoading();
            
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Signup failed. Please check your connection and try again.', 'error');
            hideLoading();
        }
    });
}

// Enhanced login validation with mobile optimization
function validateLoginData(data) {
    // Check required fields with mobile-friendly error messages
    if (!data.email || data.email.trim() === '') {
        showNotification('Please enter your email address.', 'error');
        const emailField = document.getElementById('email');
        if (emailField && window.innerWidth <= 768) {
            emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailField.focus();
        }
        return false;
    }
    
    if (!data.password || data.password.trim() === '') {
        showNotification('Please enter your password.', 'error');
        const passwordField = document.getElementById('password');
        if (passwordField && window.innerWidth <= 768) {
            passwordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            passwordField.focus();
        }
        return false;
    }
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        const emailField = document.getElementById('email');
        if (emailField && window.innerWidth <= 768) {
            emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailField.focus();
        }
        return false;
    }
    
    return true;
}

// Enhanced signup validation with mobile optimization
function validateSignupData(data) {
    // Check required fields with mobile-friendly error messages
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
            showNotification(`Please fill in the ${fieldName} field.`, 'error');
            
            const fieldElement = document.getElementById(field);
            if (fieldElement && window.innerWidth <= 768) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fieldElement.focus();
            }
            return false;
        }
    }
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        const emailField = document.getElementById('email');
        if (emailField && window.innerWidth <= 768) {
            emailField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            emailField.focus();
        }
        return false;
    }
    
    // Enhanced password validation with mobile-friendly feedback
    if (data.password.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        const passwordField = document.getElementById('password');
        if (passwordField && window.innerWidth <= 768) {
            passwordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            passwordField.focus();
        }
        return false;
    }
    
    // Enhanced password strength check
    const passwordStrength = checkPasswordStrength(data.password);
    if (passwordStrength === 'weak') {
        showNotification('Please choose a stronger password with letters, numbers, and symbols.', 'error');
        const passwordField = document.getElementById('password');
        if (passwordField && window.innerWidth <= 768) {
            passwordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            passwordField.focus();
        }
        return false;
    }
    
    // Enhanced password confirmation check
    if (data.password !== data.confirmPassword) {
        showNotification('Passwords do not match. Please try again.', 'error');
        const confirmPasswordField = document.getElementById('confirmPassword');
        if (confirmPasswordField && window.innerWidth <= 768) {
            confirmPasswordField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            confirmPasswordField.focus();
        }
        return false;
    }
    
    return true;
}

// Enhanced password strength checker with mobile optimization
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Enhanced mobile-friendly strength feedback
    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    if (strength < 6) return 'strong';
    return 'very-strong';
}

// Enhanced password visibility toggle with mobile optimization
function togglePasswordVisibility(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const toggleBtn = document.querySelector(`[onclick="togglePasswordVisibility('${fieldId}')"]`);
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        toggleBtn.setAttribute('title', 'Hide password');
    } else {
        passwordField.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.setAttribute('title', 'Show password');
    }
    
    // Enhanced mobile feedback
    if (window.innerWidth <= 768) {
        const action = passwordField.type === 'text' ? 'shown' : 'hidden';
        showNotification(`Password ${action}`, 'info');
    }
}

// Enhanced password strength indicator with mobile optimization
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    const strength = checkPasswordStrength(password);
    
    // Enhanced mobile-friendly strength display
    const isMobile = window.innerWidth <= 768;
    
    strengthBar.className = `strength-fill ${strength}`;
    
    const strengthMessages = {
        'weak': isMobile ? 'Weak' : 'Weak password',
        'medium': isMobile ? 'Medium' : 'Medium strength password',
        'strong': isMobile ? 'Strong' : 'Strong password',
        'very-strong': isMobile ? 'Very Strong' : 'Very strong password'
    };
    
    strengthText.textContent = strengthMessages[strength];
    
    // Enhanced mobile color feedback
    const colors = {
        'weak': '#ef4444',
        'medium': '#f59e0b',
        'strong': '#10b981',
        'very-strong': '#059669'
    };
    
    strengthBar.style.backgroundColor = colors[strength];
}

// Enhanced loading states with mobile optimization
function showLoading(message = 'Loading...') {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
        submitBtn.disabled = true;
    }
    
    // Enhanced mobile loading indicator
    if (window.innerWidth <= 768) {
        showNotification(message, 'info');
    }
}

function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        const isLogin = window.location.pathname.includes('login');
        submitBtn.innerHTML = isLogin ? 
            '<i class="fas fa-sign-in-alt"></i> Sign In' : 
            '<i class="fas fa-user-plus"></i> Create Account';
        submitBtn.disabled = false;
    }
}

// Enhanced notification system with mobile optimization
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Mobile-optimized positioning
    const isMobile = window.innerWidth <= 768;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        ${isMobile ? 'bottom: 20px; left: 20px; right: 20px;' : 'top: 20px; right: 20px;'}
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'});
        transition: transform 0.3s ease;
        max-width: ${isMobile ? 'none' : '400px'};
        font-size: ${isMobile ? '0.9rem' : '1rem'};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0) translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = `translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'})`;
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = `translateY(${isMobile ? '100%' : '0'}) translateX(${isMobile ? '0' : '100%'})`;
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If logged in and on login/signup page, redirect to admin
    if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'admin.html';
        return;
    }
    
    // If not logged in and on admin page, redirect to login
    if (!isLoggedIn && currentPage === 'admin.html') {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize page
    initializePage();
});

// Initialize page based on current page
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        initializeLogin();
    } else if (currentPage === 'signup.html') {
        initializeSignup();
    }
}

// Initialize login page
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!email || !password) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        showLoading('loginForm');
        
        try {
            const success = await authenticateUser(email, password);
            
            if (success) {
                // Set session
                const sessionData = {
                    email: email,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe
                };
                
                if (rememberMe) {
                    localStorage.setItem('adminSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
                }
                
                localStorage.setItem('adminLoggedIn', 'true');
                
                showNotification('Login successful! Redirecting to admin dashboard...', 'success');
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
                
            } else {
                showNotification('Invalid email or password. Please try again.', 'error');
                hideLoading('loginForm');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
            hideLoading('loginForm');
        }
    });
}

// Initialize signup page
function initializeSignup() {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Password strength checker
    passwordInput.addEventListener('input', () => {
        checkPasswordStrength(passwordInput.value);
    });
    
    // Confirm password checker
    confirmPasswordInput.addEventListener('input', () => {
        checkPasswordMatch();
    });
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const userData = Object.fromEntries(formData.entries());
        
        // Validate inputs
        if (!validateSignupData(userData)) {
            return;
        }
        
        // Show loading state
        showLoading('signupForm');
        
        try {
            const success = await createAdminAccount(userData);
            
            if (success) {
                showNotification('Account created successfully! Please log in.', 'success');
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } else {
                showNotification('Account creation failed. Email might already be registered.', 'error');
                hideLoading('signupForm');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Account creation failed. Please try again.', 'error');
            hideLoading('signupForm');
        }
    });
}

// Authenticate user
async function authenticateUser(email, password) {
    try {
        // Use backend API for authentication
        const response = await api.login(email, password);
        return response.success;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

// Create admin account
async function createAdminAccount(userData) {
    try {
        // Use backend API for account creation
        const response = await api.signup(userData);
        return response.success;
    } catch (error) {
        console.error('Account creation error:', error);
        return false;
    }
}

// Validate signup data
function validateSignupData(data) {
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'role', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    // Validate email
    if (!isValidEmail(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate phone
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
        showNotification('Please enter a valid phone number.', 'error');
        return false;
    }
    
    // Validate password strength
    if (!isPasswordStrong(data.password)) {
        showNotification('Password must be at least 8 characters with uppercase, lowercase, number, and special character.', 'error');
        return false;
    }
    
    // Check password match
    if (data.password !== data.confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return false;
    }
    
    // Check terms agreement
    if (!data.agreeTerms) {
        showNotification('Please agree to the Terms of Service and Privacy Policy.', 'error');
        return false;
    }
    
    return true;
}

// Check password strength
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Cap strength at 100
    strength = Math.min(strength, 100);
    
    // Update UI
    strengthFill.style.width = strength + '%';
    
    if (strength < 25) {
        strengthFill.className = 'strength-fill weak';
        feedback = 'Very Weak';
    } else if (strength < 50) {
        strengthFill.className = 'strength-fill weak';
        feedback = 'Weak';
    } else if (strength < 75) {
        strengthFill.className = 'strength-fill medium';
        feedback = 'Medium';
    } else if (strength < 100) {
        strengthFill.className = 'strength-fill strong';
        feedback = 'Strong';
    } else {
        strengthFill.className = 'strength-fill very-strong';
        feedback = 'Very Strong';
    }
    
    strengthText.textContent = feedback;
}

// Check if password is strong enough
function isPasswordStrong(password) {
    return password.length >= 8 && 
           /[a-z]/.test(password) && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#ef4444';
    } else {
        confirmInput.style.borderColor = '#e2e8f0';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate user ID
function generateUserId() {
    return 'ADM' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Show loading state
function showLoading(formId) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Store original text for restoration
    submitBtn.setAttribute('data-original-text', originalText);
}

// Hide loading state
function hideLoading(formId) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.getAttribute('data-original-text');
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

// Logout function
function logout() {
    console.log('Logging out...');
    api.clearToken();
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminSession');
    
    showNotification('Logged out successfully.', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Add logout function to global scope
window.logout = logout;

console.log('Authentication system loaded successfully!');
})(); 