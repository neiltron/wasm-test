import Tone from 'tone';
import Scene from './scene';

let _particles;
let particleArray;
let scene;
let memory;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('webgl');
const radius = 10;
const particleCount = 250;
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
  particleArray = new Float32Array(memory.buffer, _particles.items(), particleCount * 3);

  // const positions = [];

  // for (let i = 0; i < particleCount * 3; i++) {
  //   positions[i * 3] = 500 + Math.random();
  //   positions[i * 3 + 1] = 500 + Math.random();
  //   positions[i * 3 + 2] = 0;
  // }

  // particleArray = new Float32Array(positions, _particles.items(), particleCount * 3);

  scene = new Scene({
    buffer: particleArray,
    canvas
  });
}

function update () {
  _particles.update();
  scene.draw();

  requestAnimationFrame(update);
}