import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// Array of API keys
const API_KEYS = [
    'AIzaSyAYd3V2YMlZDHuyvqU_ct0JRbo1mmrRAig',
    'AIzaSyDZ2VO1k_Liy-rYb-mvbtuisBzaqyeWBuU',
    'AIzaSyCd6z4x7WQdXQss2HMmV8tUlXeOtLzg_j0',
    'AIzaSyBu07YEtQ8cqNcOLlYDX3M8aiuKKrp1Tx8',
    'AIzaSyCDB5_2hUhZt7erV3F8vXcjwGjni2eSseY'
];

let currentKeyIndex = 0;

// Function to get next API key
function getNextApiKey() {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        updateUserInfo(user);
    } else {
        // User is signed out
        window.location.href = 'signup.html';
    }
});

// Update user info in the navbar
function updateUserInfo(user) {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`;
    userAvatar.alt = user.displayName;
    userName.textContent = user.displayName;
}

// Logout function
async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// Generate prompt function
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
        // Get API key with rotation
        const API_KEY = getNextApiKey();
        console.log("Using API Key Index:", currentKeyIndex);

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate a detailed AI prompt based on this request. Format the response with clear sections using ## and emphasize key points with **. Include these sections:

##Prompt
The main prompt text

##Context
Background information

##Details
Specific requirements

##Style Guidelines
Formatting preferences

For this request: "${userInput}"`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Response:', errorData);
            
            // If quota exceeded, try next key
            if (errorData.error?.status === 'RESOURCE_EXHAUSTED') {
                console.log("Quota exceeded, trying next key...");
                return generatePrompt(); // Retry with next key
            }
            
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from API');
        }

        const generatedPrompt = data.candidates[0].content.parts[0].text;

        // Show result
        document.getElementById('generatedPrompt').value = generatedPrompt;
        document.querySelector('.result-container').classList.remove('d-none');
        document.querySelector('.result-container').classList.add('animate__fadeIn');

    } catch (error) {
        console.error('API Error:', error);
        
        // If it's a quota error, try next key
        if (error.message?.includes('RESOURCE_EXHAUSTED')) {
            console.log("Quota exceeded, trying next key...");
            return generatePrompt(); // Retry with next key
        }
        
        alert(`Error: ${error.message || 'An error occurred while generating the prompt. Please try again.'}`);
    } finally {
        // Reset loading state
        generateBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

// Copy to clipboard function
function copyToClipboard() {
    const promptText = document.getElementById('generatedPrompt');
    promptText.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.btn-outline-primary');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="bi bi-check2 me-2"></i>Copied!';
    copyBtn.classList.add('btn-success');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('btn-success');
    }, 2000);
}

// Make functions globally available
window.generatePrompt = generatePrompt;
window.copyToClipboard = copyToClipboard;
window.logout = logout; 