// -------------------------------------------------------------
// RETRO SOUND EFFECTS GENERATOR
// This file uses the browser's built-in Web Audio API to create
// synthesizer sounds. It has no classes or complex code.
// -------------------------------------------------------------

// This variable will hold our AudioContext instance
let audioContext = null;

// This helper function sets up the audio context when a button is clicked
function initAudio() {
  // If the audio context doesn't exist yet, we create it
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // If the browser paused the audio, we tell it to resume
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Function to play a simple click sound for buttons
export function playClickSound() {
  try {
    initAudio(); // Initialize audio first
    
    // Create oscillator (makes the sound wave) and gain (controls volume)
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Connect them together: Oscillator -> Gain -> Speakers
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine'; // Smooth wave sound
    
    // Set pitch (800 Hz) and volume (0.03)
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    gain.gain.setValueAtTime(0.03, audioContext.currentTime);
    
    // Quick fade out
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    
    osc.start(); // Start making sound
    osc.stop(audioContext.currentTime + 0.05); // Stop making sound after 0.05 seconds
  } catch (error) {
    console.log('Failed to play sound:', error);
  }
}

// Function to play a happy ascending sound when user gets answer correct
export function playCorrectSound() {
  try {
    initAudio();
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    const now = audioContext.currentTime;
    
    // Play two notes quickly: first note C5 (523 Hz), then note E5 (659 Hz)
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(659, now + 0.1);
    
    // Set volume to 0.08 and fade out in 0.3 seconds
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start();
    osc.stop(now + 0.3);
  } catch (error) {
    console.log('Failed to play sound:', error);
  }
}

// Function to play a low buzz sound when user gets answer wrong
export function playIncorrectSound() {
  try {
    initAudio();
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'triangle'; // Buzzy wave sound
    const now = audioContext.currentTime;
    
    // Slide pitch down from 180 Hz to 120 Hz
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);
    
    // Set volume to 0.12 and fade out in 0.25 seconds
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.start();
    osc.stop(now + 0.25);
  } catch (error) {
    console.log('Failed to play sound:', error);
  }
}

// Function to play a little victory fanfare when the quiz is finished
export function playVictorySound() {
  try {
    initAudio();
    const now = audioContext.currentTime;
    
    // Helper function to play a single note in the tune
    function playNote(frequency, startTime, duration) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0.08, now + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startTime + duration);
      
      osc.start(now + startTime);
      osc.stop(now + startTime + duration);
    }
    
    // Play four notes in a row
    playNote(261, 0, 0.15);    // Note 1: C4
    playNote(329, 0.15, 0.15); // Note 2: E4
    playNote(392, 0.3, 0.15);  // Note 3: G4
    playNote(523, 0.45, 0.5);  // Note 4: C5
  } catch (error) {
    console.log('Failed to play sound:', error);
  }
}
