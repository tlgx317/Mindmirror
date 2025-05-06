document.addEventListener('DOMContentLoaded', () => {
    // Home Page Elements
    const moodSlider = document.getElementById('mood-slider');
    const moodFace = document.getElementById('mood-face');
    const moodEmojiDisplay = document.getElementById('mood-emoji-display');
    const moodNote = document.getElementById('mood-note');
    const saveMoodButton = document.getElementById('save-mood-button');
    const motivationalQuoteDisplay = document.getElementById('motivational-quote');
    const viewHistoryButton = document.getElementById('view-history-button');

    // Mindful Anchor Elements
    const mindfulAnchorPromptContainer = document.getElementById('mindful-anchor-prompt-container');
    const mindfulAnchorMessage = document.getElementById('mindful-anchor-message');
    const startAnchorExerciseButton = document.getElementById('start-anchor-exercise-button');
    const declineAnchorExerciseButton = document.getElementById('decline-anchor-exercise-button');
    
    const mindfulExerciseModal = document.getElementById('mindful-exercise-modal');
    const closeExerciseModalButton = document.getElementById('close-exercise-modal');
    const exerciseTextPrompt = document.getElementById('exercise-text-prompt');
    const endExerciseEarlyButton = document.getElementById('end-exercise-early-button');
    const exerciseTimerDisplay = document.getElementById('exercise-timer-display');

    const moods = [
        { emoji: "😔", name: "Very Sad", faceClass: "mood-vsad", quote: "Even the darkest night will end and the sun will rise. Be gentle with yourself.", offersAnchor: true },
        { emoji: "🙁", name: "Sad", faceClass: "mood-sad", quote: "It's okay not to be okay. Acknowledge your feelings.", offersAnchor: true },
        { emoji: "😐", name: "Neutral", faceClass: "mood-neutral", quote: "Take a deep breath. You are doing your best, and that's enough.", offersAnchor: false },
        { emoji: "🙂", name: "Happy", faceClass: "mood-happy", quote: "Every day is a new beginning. Cherish the small joys.", offersAnchor: false },
        { emoji: "😄", name: "Very Happy", faceClass: "mood-vhappy", quote: "Believe you can and you're halfway there! Spread your positivity.", offersAnchor: false }
    ];

    function updateMoodVisuals(sliderValue) {
        const selectedMood = moods[sliderValue];
        
        if (moodEmojiDisplay) moodEmojiDisplay.textContent = selectedMood.emoji;
        
        if (moodFace) {
            moods.forEach(mood => moodFace.classList.remove(mood.faceClass));
            moodFace.classList.add(selectedMood.faceClass);
        }
        
        if (motivationalQuoteDisplay) motivationalQuoteDisplay.textContent = `"${selectedMood.quote}"`;
        
        if (mindfulAnchorPromptContainer && mindfulAnchorPromptContainer.style.display === 'block') {
            mindfulAnchorPromptContainer.style.display = 'none';
        }
    }

    if (moodSlider) { // Only run if on home page
        updateMoodVisuals(parseInt(moodSlider.value)); // Initialize
        moodSlider.addEventListener('input', (event) => {
            updateMoodVisuals(parseInt(event.target.value));
        });
    }

    if (saveMoodButton) { // Only run if on home page
        saveMoodButton.addEventListener('click', () => {
            const sliderValue = parseInt(moodSlider.value);
            const selectedMood = moods[sliderValue];
            const noteText = moodNote.value.trim();
            const timestamp = new Date().toISOString();

            const moodEntry = {
                mood: selectedMood.emoji,
                name: selectedMood.name,
                note: noteText,
                date: timestamp
            };

            let moodHistory = JSON.parse(localStorage.getItem('mindMirrorHistory')) || [];
            moodHistory.push(moodEntry);
            localStorage.setItem('mindMirrorHistory', JSON.stringify(moodHistory));

            alert(`Mood (${selectedMood.emoji} ${selectedMood.name}) saved!`);
            moodNote.value = '';
            
            if (selectedMood.offersAnchor && mindfulAnchorPromptContainer) {
                mindfulAnchorMessage.textContent = `You've logged feeling ${selectedMood.name.toLowerCase()}. It's okay to feel this way.`;
                mindfulAnchorPromptContainer.style.display = 'block';
            } else if (mindfulAnchorPromptContainer) {
                mindfulAnchorPromptContainer.style.display = 'none';
            }
        });
    }
    
    if (viewHistoryButton) { // Only run if on home page
        viewHistoryButton.addEventListener('click', () => {
            const moodHistory = JSON.parse(localStorage.getItem('mindMirrorHistory'));
            if (moodHistory && moodHistory.length > 0) {
                let historyLog = "Your Mood History:\n(Newest to Oldest)\n\n";
                moodHistory.slice().reverse().forEach(entry => { // Show newest first
                    historyLog += `${new Date(entry.date).toLocaleDateString()} ${new Date(entry.date).toLocaleTimeString()}: ${entry.mood} ${entry.name}${entry.note ? ' - Note: ' + entry.note : ''}\n`;
                });
                alert(historyLog);
            } else {
                alert('No mood history found. Start by saving your current mood!');
            }
        });
    }

    // Mindful Anchor Exercise Logic
    let exerciseInterval;
    let exerciseTimeout;
    let exerciseTimerInterval; // For the countdown timer
    let currentPromptIndex;
    let exerciseDurationSeconds;

    const exercisePrompts = [
        "Take a slow, deep breath in... and out.",
        "Notice the feeling of your feet on the ground.",
        "Acknowledge your current feeling without judgment.",
        "This feeling is temporary, like a passing cloud.",
        "You are here, in this moment. You are safe.",
        "Take another gentle breath. You are doing okay."
    ];
    const promptDuration = 8; // seconds per prompt

    function startMindfulExercise() {
        if (!mindfulExerciseModal || !exerciseTextPrompt || !exerciseTimerDisplay) return;

        mindfulExerciseModal.classList.add('show');
        currentPromptIndex = 0;
        exerciseDurationSeconds = exercisePrompts.length * promptDuration;
        
        updateExercisePrompt();
        if (endExerciseEarlyButton) endExerciseEarlyButton.style.display = 'inline-block';

        exerciseInterval = setInterval(() => {
            currentPromptIndex++;
            if (currentPromptIndex < exercisePrompts.length) {
                updateExercisePrompt();
            } else {
                finishMindfulExercise("Exercise complete. Well done!");
            }
        }, promptDuration * 1000);
        
        let timeLeft = exerciseDurationSeconds;
        exerciseTimerDisplay.textContent = `Time remaining: ${timeLeft}s`;
        exerciseTimerInterval = setInterval(() => {
            timeLeft--;
            exerciseTimerDisplay.textContent = `Time remaining: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(exerciseTimerInterval);
            }
        }, 1000);

        exerciseTimeout = setTimeout(() => finishMindfulExercise("Time's up. Hope that helped!"), exerciseDurationSeconds * 1000);
    }

    function updateExercisePrompt() {
        if (exerciseTextPrompt) {
            exerciseTextPrompt.style.opacity = 0;
            setTimeout(() => {
                exerciseTextPrompt.textContent = exercisePrompts[currentPromptIndex];
                exerciseTextPrompt.style.opacity = 1;
            }, 300);
        }
    }

    function finishMindfulExercise(endMessage = "Exercise ended.") {
        clearInterval(exerciseInterval);
        clearTimeout(exerciseTimeout);
        clearInterval(exerciseTimerInterval);

        if (exerciseTextPrompt) exerciseTextPrompt.textContent = endMessage; // Show end message briefly
        
        setTimeout(() => { // Delay hiding modal to show end message
            if (mindfulExerciseModal) mindfulExerciseModal.classList.remove('show');
            if (endExerciseEarlyButton) endExerciseEarlyButton.style.display = 'none';
            if (mindfulAnchorPromptContainer) mindfulAnchorPromptContainer.style.display = 'none';
            if (exerciseTimerDisplay) exerciseTimerDisplay.textContent = "";
            if (exerciseTextPrompt) exerciseTextPrompt.textContent = "Starting soon..."; // Reset for next time
        }, 1500); // Show end message for 1.5 seconds
    }

    if (startAnchorExerciseButton) { // Only run if on home page
        startAnchorExerciseButton.addEventListener('click', () => {
            if (mindfulAnchorPromptContainer) mindfulAnchorPromptContainer.style.display = 'none';
            startMindfulExercise();
        });
    }

    if (declineAnchorExerciseButton) { // Only run if on home page
        declineAnchorExerciseButton.addEventListener('click', () => {
            if (mindfulAnchorPromptContainer) mindfulAnchorPromptContainer.style.display = 'none';
        });
    }

    if (closeExerciseModalButton) { // Only run if on home page
        closeExerciseModalButton.addEventListener('click', () => finishMindfulExercise());
    }
    if (endExerciseEarlyButton) { // Only run if on home page
        endExerciseEarlyButton.addEventListener('click', () => finishMindfulExercise());
    }
    
    // Close modal if overlay is clicked (optional)
    if (mindfulExerciseModal) {
        mindfulExerciseModal.addEventListener('click', (event) => {
            if (event.target === mindfulExerciseModal) { 
                finishMindfulExercise();
            }
        });
    }

    // Global: Active navigation link highlighting
    const navLinks = document.querySelectorAll('.bottom-nav .nav-link');
    const currentPath = window.location.pathname;
    let currentPageFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    if (currentPageFile === "" || currentPageFile === "index.html") { // Handle root path or explicit index.html
        currentPageFile = "index.html";
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkFile = link.getAttribute('href');
        if (linkFile === currentPageFile) {
            link.classList.add('active');
        }
    });
});