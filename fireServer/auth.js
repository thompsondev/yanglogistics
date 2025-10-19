// Enhanced Authentication with Mobile Responsiveness

// Check if already logged in and redirect
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const adminToken = localStorage.getItem('adminToken');
    
    // If on login page and already authenticated, redirect to admin
    if (window.location.pathname.includes('login.html') && isLoggedIn && adminToken) {
        window.location.href = 'admin.html';
        return;
    }
});

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
            console.log('Login data being sent:', loginData);
            const response = await api.login(loginData);
            console.log('Login response:', response);
            console.log('Response success:', response.success);
            console.log('Response token:', response.token ? 'present' : 'missing');
            
            if (response.success) {
                // Set authentication flags
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminToken', response.token);
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
            // Clear any existing authentication data on error
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminToken');
            api.clearToken();
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'role', 'password', 'confirmPassword'];
    
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
    
    // Enhanced phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = data.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        showNotification('Please enter a valid phone number.', 'error');
        const phoneField = document.getElementById('phone');
        if (phoneField && window.innerWidth <= 768) {
            phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            phoneField.focus();
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

// Enhanced mobile-specific initializations
document.addEventListener('DOMContentLoaded', () => {
    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Optimize form inputs for mobile
        document.querySelectorAll('input, textarea, select').forEach(el => {
            el.style.fontSize = '16px'; // Prevents iOS zoom
            el.style.minHeight = '44px'; // Touch-friendly height
        });
        
        // Optimize buttons for touch
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.minHeight = '48px';
            btn.style.minWidth = '44px';
        });
        
        // Enhance auth card for mobile
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.padding = '2rem 1.5rem';
            authCard.style.margin = '1rem';
        }
        
        // Optimize password strength indicator for mobile
        const strengthBar = document.querySelector('.strength-bar');
        if (strengthBar) {
            strengthBar.style.height = '8px';
            strengthBar.style.marginTop = '0.5rem';
        }
    }
    
    // Enhanced password strength monitoring
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
    
    // Enhanced form validation on blur for mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => {
                // Trigger validation on blur for better mobile UX
                if (input.value.trim() === '') {
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '#d1d5db';
                }
            });
            
            input.addEventListener('focus', () => {
                input.style.borderColor = '#2563eb';
            });
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Re-apply mobile optimizations after orientation change
            if (window.innerWidth <= 768) {
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    el.style.fontSize = '16px';
                    el.style.minHeight = '44px';
                });
            }
        }, 500);
    });
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-apply optimizations based on new screen size
            if (window.innerWidth <= 768) {
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    el.style.fontSize = '16px';
                    el.style.minHeight = '44px';
                });
            }
        }, 250);
    });
    
    console.log('Authentication page loaded successfully with mobile optimizations!');
});

// Make functions globally available
window.togglePasswordVisibility = togglePasswordVisibility;
window.updatePasswordStrength = updatePasswordStrength; 