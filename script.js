// 1. Grab the avatar element
const avatarElement = document.getElementById('avatar');

// 2. Thresholds and Timers
// ADJUST THESE: If it gets scared too easily, raise the YELL_THRESHOLD!
const YELL_THRESHOLD = 60;  // NEW: High volume needed to trigger "scared"
const MOUTH_THRESHOLD = 15; // Volume needed to "open mouth"
const TURN_THRESHOLD = 5;   // Base volume to stay facing forward
const TURN_DELAY = 1000;    // 1 second delay before turning around after silence

let lastSpokeTime = 0; // The timestamp of the last sound detected

async function startAudioListener() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256; 
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // 3. The main loop
        function checkVolume() {
            analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;

            // 4. The Logic with Yelling Detection
            if (averageVolume > TURN_THRESHOLD) {
                // Sound detected! Wake up.
                lastSpokeTime = Date.now(); 
                avatarElement.classList.remove('facing-away');
                
                // --- Emotion & Talking Animation ---
                // We check the LOUDEST threshold first
                if (averageVolume > YELL_THRESHOLD) {
                    // You are yelling! Show the scared frog.
                    avatarElement.src = "assets/front-view-scared.png";
                } 
                else if (averageVolume > MOUTH_THRESHOLD) {
                    // Normal talking volume
                    avatarElement.src = "assets/front-view-talking.png";
                } 
                else {
                    // Barely making noise (mouth closed)
                    avatarElement.src = "assets/front-view.png";
                }

            } else {
                // We are quiet. Check if we should turn around yet.
                let timeSinceLastSpoke = Date.now() - lastSpokeTime;

                if (timeSinceLastSpoke > TURN_DELAY) {
                    // Silence has lasted longer than 1 second: Turn around
                    avatarElement.classList.add('facing-away');
                    avatarElement.src = "assets/back-view.png";
                } else {
                    // Sound stopped, but delay is NOT over: Stay front, close mouth
                    avatarElement.src = "assets/front-view.png";
                }
            }

            requestAnimationFrame(checkVolume);
        }

        checkVolume();

    } catch (error) {
        console.error("Microphone access denied or not found:", error);
    }
}

startAudioListener();