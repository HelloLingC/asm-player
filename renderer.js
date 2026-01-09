const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volume = document.getElementById('volume');
const progress = document.getElementById('progress');
const playlistEl = document.getElementById('playlist');
const dropArea = document.getElementById('dropArea');

let playlist = [];
let currentTrack = -1;

// Drag and drop functionality
dropArea.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.multiple = true;
  input.onchange = (e) => handleFiles(e.target.files);
  input.click();
});

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#4CAF50';
});

dropArea.addEventListener('dragleave', () => {
  dropArea.style.borderColor = '#ccc';
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#ccc';
  const files = e.dataTransfer.files;
  handleFiles(files);
});

function handleFiles(files) {
  const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
  audioFiles.forEach(file => {
    playlist.push({
      name: file.name,
      path: file.path || URL.createObjectURL(file)
    });
  });
  renderPlaylist();
  if (currentTrack === -1 && playlist.length > 0) {
    loadTrack(0);
  }
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  playlist.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    if (index === currentTrack) {
      item.classList.add('active');
    }
    item.textContent = track.name;
    item.onclick = () => loadTrack(index);
    playlistEl.appendChild(item);
  });
}

function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentTrack = index;
  audio.src = playlist[index].path;
  audio.load();
  renderPlaylist();
}

// Playback controls
playBtn.addEventListener('click', () => {
  if (currentTrack === -1 && playlist.length > 0) {
    loadTrack(0);
  }
  audio.play();
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
});

stopBtn.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
});

prevBtn.addEventListener('click', () => {
  if (currentTrack > 0) {
    loadTrack(currentTrack - 1);
    audio.play();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentTrack < playlist.length - 1) {
    loadTrack(currentTrack + 1);
    audio.play();
  }
});

// Volume control
volume.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// Progress bar
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
});

progress.addEventListener('input', (e) => {
  if (audio.duration) {
    audio.currentTime = (e.target.value / 100) * audio.duration;
  }
});

// Auto play next track
audio.addEventListener('ended', () => {
  if (currentTrack < playlist.length - 1) {
    loadTrack(currentTrack + 1);
    audio.play();
  }
});
