const synth = new Tone.Synth().toDestination();
const url = 'http://localhost:3000/api/v1/tunes';


const keyToNote = {'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'Bb4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5', 'p': 'D#5', ';': 'E5'};


const playNote = (note, duration = "8n") => {
    const now = Tone.now();
    synth.triggerAttackRelease(note, duration, now);

    if (isRecording) {
        const timing = now - recordingStartTime;
        recordedNotes.push({ note, duration, timing });
    }
};


document.querySelectorAll('#keyboardDiv button').forEach(button => {
    button.addEventListener('mousedown', () => playNote(button.id));
});

let keysPressed = {};


document.addEventListener('keydown', (event) => {
    if (!keysPressed[event.key]) {
        keysPressed[event.key] = true;
        if (keyToNote[event.key]) {
            playNote(keyToNote[event.key]);
        }
    }
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});


const fetchSongs = async () => {
    const response = await axios.get(url);
    const songs = response.data;

    const tunesDropdown = document.getElementById('tunesDrop');
    tunesDropdown.innerHTML = '';

    songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id; 
        option.textContent = song.name; 
        tunesDropdown.appendChild(option);
    });
};

fetchSongs();



const playSong = async () => {
    const tunesDropdown = document.getElementById('tunesDrop');
    const selectedTuneId = tunesDropdown.value; 
    const response = await axios.get(url);
    const tunes = response.data;

    const selectedTune = tunes.find(tune => tune.id === selectedTuneId); 
    selectedTune.tune.forEach(noteObj => {
        setTimeout(() => {
            playNote(noteObj.note, noteObj.duration);
        }, noteObj.timing * 1000);
    });
};

document.getElementById('tunebtn').addEventListener('click', playSong);



let isRecording = false;
let recordedNotes = [];
let recordingStartTime;


const startRecording = () => {
    isRecording = true;
    recordedNotes = [];
    recordingStartTime = Tone.now();
    document.getElementById('recordbtn').disabled = true; 
    document.getElementById('stopbtn').disabled = false; 
};


const stopRecording = () => {
    isRecording = false;
    document.getElementById('recordbtn').disabled = false; 
    document.getElementById('stopbtn').disabled = true; 
    let recordingName = document.getElementById('recordName').value;
    if (!recordingName) {
        recordingName = 'No-name Tune';
    }
    if (recordedNotes.length) {
        postTune(recordingName, recordedNotes); 
    }
};

const postTune = async (name, notes) => {
    const response = await axios.post(url, {
        id: Date.now().toString(),
        name: name,
        tune: notes
    });
    fetchSongs(); 
};



document.getElementById('recordbtn').addEventListener('click', startRecording);
document.getElementById('stopbtn').addEventListener('click', stopRecording);
document.getElementById('stopbtn').disabled = true;
