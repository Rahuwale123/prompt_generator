// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCgeDPw5jJNqRADWUB50roHvJSpN4xC5Zo",
    authDomain: "promptly-68c60.firebaseapp.com",
    projectId: "promptly-68c60",
    storageBucket: "promptly-68c60.firebasestorage.app",
    messagingSenderId: "416866582017",
    appId: "1:416866582017:web:3d57cdec2acecb5c6d8a00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Google Sign In
async function signInWithGoogle() {
    try {
        // Show loading state
        const button = document.querySelector('.google-signin-btn');
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Signing in...
        `;

        await signInWithPopup(auth, provider);
        // Auth state listener will handle the redirect

    } catch (error) {
        console.error('Error:', error);
        handleAuthError(error);
    }
}

// Handle authentication errors
function handleAuthError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 animate__animated animate__fadeIn';
    errorDiv.textContent = error.message;
    document.querySelector('.card-body').appendChild(errorDiv);

    // Reset button
    const button = document.querySelector('.google-signin-btn');
    if (button) {
        button.disabled = false;
        button.innerHTML = `
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                 alt="Google Logo" 
                 class="google-icon me-2">
            Continue with Google
        `;
    }

    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.classList.replace('animate__fadeIn', 'animate__fadeOut');
        setTimeout(() => errorDiv.remove(), 1000);
    }, 5000);
}

// Check auth state for all pages
onAuthStateChanged(auth, (user) => {
    const isAuthPage = window.location.pathname.includes('signup.html') || 
                      window.location.pathname.includes('login.html');
    
    if (user) {
        // User is signed in
        if (isAuthPage) {
            window.location.href = 'generator.html';
        }
    } else {
        // User is signed out
        if (window.location.pathname.includes('generator.html')) {
            window.location.href = 'signup.html';
        }
    }
});

// Make functions available globally
window.signInWithGoogle = signInWithGoogle;

// Email/Password Sign Up
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const name = document.getElementById('nameInput').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update user profile with name
        await updateProfile(userCredential.user, {
            displayName: name
        });

        const user = auth.currentUser;
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        }));
        window.location.href = 'index.html'; // Redirect to main app
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}); 