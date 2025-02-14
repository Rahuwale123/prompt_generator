// Add this at the beginning of script.js
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// Check auth state for navigation
onAuthStateChanged(auth, (user) => {
    // Handle navigation based on auth state
    document.querySelectorAll('a[href="generator.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!user) {
                window.location.href = 'signup.html';
            } else {
                window.location.href = 'generator.html';
            }
        });
    });
});

// Protect generator page
if (window.location.pathname.includes('generator.html')) {
    if (!user) {
        // Store attempted URL
        sessionStorage.setItem('returnUrl', 'generator.html');
        window.location.href = 'signup.html';
        return;
    }
}

// Function to get Gemini API key from Firestore
async function getGeminiApiKey() {
    try {
        const docRef = doc(db, 'google_api', 'api_keys');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data().api;
        } else {
            throw new Error('API key not found in Firestore');
        }
    } catch (error) {
        console.error('Error fetching API key:', error);
        throw error;
    }
}

async function generatePrompt() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) {
        alert('Please enter your request first!');
        return;
    }

    // Show loading state
    const generateBtn = document.querySelector('.generate-btn');
    const spinner = generateBtn.querySelector('.spinner-border');
    generateBtn.disabled = true;
    spinner.classList.remove('d-none');

    try {
        // Get API key from Firestore
        const API_KEY = await getGeminiApiKey();

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Please convert the following user request into a well-structured, detailed prompt that can be used with AI models. Make it specific, clear, and comprehensive: "${userInput}"`
                    }]
                }]
            })
        });

        const data = await response.json();
        const generatedPrompt = data.candidates[0].content.parts[0].text;

        // Show result
        document.getElementById('generatedPrompt').value = generatedPrompt;
        document.querySelector('.result-container').classList.remove('d-none');
        document.querySelector('.result-container').classList.add('animate__fadeIn');

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the prompt. Please try again.');
    } finally {
        // Reset loading state
        generateBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

function copyToClipboard() {
    const promptText = document.getElementById('generatedPrompt');
    promptText.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.btn-outline-primary');
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copy-success');
    
    setTimeout(() => {
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copy-success');
    }, 2000);
}

// Make functions available globally
window.generatePrompt = generatePrompt;
window.copyToClipboard = copyToClipboard;

// Add animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate__animated');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            if (element.classList.contains('animate__fadeInUp')) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            } else if (element.classList.contains('animate__fadeInLeft')) {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            } else if (element.classList.contains('animate__fadeInRight')) {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            }
        }
    });
};

window.addEventListener('scroll', animateOnScroll); 