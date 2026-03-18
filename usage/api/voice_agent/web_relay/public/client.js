/**
 * Lokutor Web Voice Client (V3 - Production Grade)
 * 1. Captures mic at browser native rate -> Resamples to 16kHz for Lokutor
 * 2. Receives JSON-wrapped or Raw Binary audio -> Plays with zero-gap scheduling
 * 3. Handles Barge-in: Stops AI output as soon as user speaks
 */

const LOKUTOR_INPUT_RATE = 16000;
const LOKUTOR_OUTPUT_RATE = 44100;

let audioContext = null;
let ws = null;
let globalStream = null;
let processor = null;
let isConversationActive = false;

// Scheduling State
let nextStartTime = 0;
let activeSources = [];

// UI Elements
const actionBtn = document.getElementById('actionBtn');
const transcriptBox = document.getElementById('transcript');
const orb = document.getElementById('voiceOrb');
const statusBadge = document.getElementById('botStatus');

actionBtn.addEventListener('click', () => {
    isConversationActive ? stopConversation() : startConversation();
});

async function startConversation() {
    try {
        console.log('🎙 Requesting Microphone...');
        globalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const nativeRate = audioContext.sampleRate;
        console.log(`🔊 AudioContext initialized at ${nativeRate}Hz`);

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/relay`);
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            console.log('✅ Connected to Relay');
            addMessage('system', 'Connected to Lokutor Service.');
            setUIState(true);
            ws.send(JSON.stringify({ type: 'prompt', data: 'You are a helpful and charismatic AI assistant.' }));
            ws.send(JSON.stringify({ type: 'voice', data: 'F1' }));
        };

        ws.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                handleJsonMessage(JSON.parse(event.data));
            } else {
                playAudioChunk(event.data);
            }
        };

        ws.onclose = () => {
            console.warn('❌ WebSocket Closed');
            stopConversation();
        };

        const source = audioContext.createMediaStreamSource(globalStream);
        processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        processor.onaudioprocess = (e) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0);
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
                orb.style.transform = `scale(${1 + volume / 100})`;

                const pcmBuffer = resampleAndConvertToInt16(inputData, nativeRate, LOKUTOR_INPUT_RATE);
                ws.send(pcmBuffer);
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

    } catch (err) {
        console.error('Failed to initiate conversation:', err);
        addMessage('system', `Error: ${err.message}`);
    }
}

function handleJsonMessage(msg) {
    if (msg.type === 'audio') {
        const audioData = Uint8Array.from(atob(msg.data), c => c.charCodeAt(0)).buffer;
        playAudioChunk(audioData);
    } else if (msg.type === 'transcript') {
        addMessage(msg.role || 'agent', msg.data);
    } else if (msg.type === 'status') {
        const status = msg.data;
        orb.className = `orb ${status === 'speaking' ? 'speaking' : (status === 'listening' ? 'listening' : '')}`;
        
        // ⚡ BARGE-IN: Clear talking queue immediately if user takes over
        if (status === 'interrupted' || status === 'listening') {
            stopCurrentAudio();
        }
    }
}

function playAudioChunk(arrayBuffer) {
    if (!audioContext || !isConversationActive) return;
    
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 0x7FFF;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Array.length, LOKUTOR_OUTPUT_RATE);
    audioBuffer.getChannelData(0).set(float32Array);
    
    if (nextStartTime < audioContext.currentTime + 0.05) {
        nextStartTime = audioContext.currentTime + 0.05;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(nextStartTime);
    
    nextStartTime += audioBuffer.duration;
    activeSources.push(source);
    source.onended = () => {
        activeSources = activeSources.filter(s => s !== source);
    };
}

function stopCurrentAudio() {
    activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSources = [];
    nextStartTime = 0;
}

function resampleAndConvertToInt16(buffer, fromRate, toRate) {
    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Int16Array(newLength);
    for (let i = 0; i < newLength; i++) {
        result[i] = buffer[Math.round(i * ratio)] * 0x7FFF;
    }
    return result.buffer;
}

function stopConversation() {
    if (ws) ws.close();
    if (processor) processor.disconnect();
    if (globalStream) globalStream.getTracks().forEach(t => t.stop());
    if (audioContext) audioContext.close();
    
    ws = null; processor = null; audioContext = null;
    setUIState(false);
    stopCurrentAudio();
}

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    transcriptBox.appendChild(div);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function setUIState(active) {
    isConversationActive = active;
    actionBtn.innerText = active ? 'End Connection' : 'Start Conversation';
    actionBtn.className = active ? 'btn stop' : 'btn primary';
    statusBadge.innerText = active ? 'Live' : 'Offline';
    statusBadge.className = active ? 'status-badge status-active' : 'status-badge';
    if (!active) orb.className = 'orb';
}
