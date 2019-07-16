import Tone from 'tone';

let _particles;
let particleArray;
let memory;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const radius = 20;
const particleCount = 20;
var synth = new Tone.Synth().toMaster()

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;
document.body.appendChild(canvas);
document.body.style.margin = 0;

const notes = [
  'C3',
  'E4',
  'D4',
]

let canPlayAudio = false;
const startAudio = () => { canPlayAudio = true; }
document.body.addEventListener('click', startAudio.bind(this));
document.body.addEventListener('touchstart', startAudio.bind(this));

window.test = (index) => {
  const note = index % notes.length;

  if (canPlayAudio) {
    synth.triggerAttackRelease(notes[note], '8n')
  }
}

import("./wasm_loader.js").then(_ => {
  memory =  _.get_memory();

  if (_particles) {
    setupParticleArray();

    requestAnimationFrame(update);
  }
});

import("../pkg/index.js").then(_ => {
  _particles = new _.Particles(particleCount, window.innerWidth, window.innerHeight, radius);

  if (particleArray) {
    setupParticleArray();

    requestAnimationFrame(update);
  }
}).catch(console.error);

const setupParticleArray = () => {
  particleArray = new Float32Array(memory.buffer, _particles.items(), particleCount * 2);
}

const update = () => {
  _particles.update();

  drawParticles();

  requestAnimationFrame(update);
}

const drawParticles = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `#000`;

  for (let i = 0, total = particleArray.length; i < total; i += 2) {
    ctx.beginPath();

    ctx.arc(particleArray[i], particleArray[i + 1], radius, 0, Math.PI * 2);

    ctx.fill();
    ctx.closePath();
  }
}