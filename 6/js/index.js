import Scene from './scene';

// const gui = new dat.GUI();

// const guiOpts = {
//   boxVisible: true,
//   cameraControlsEnabled: true
// };

// gui.add(guiOpts, 'boxVisible').onChange(() => {
//   scene.box.visible = guiOpts.boxVisible;
// });

// gui.add(guiOpts, 'cameraControlsEnabled').onChange(() => {
//   scene.controls.enabled = guiOpts.cameraControlsEnabled;
// });

let _particles;
let particleArray;
let scene;
let memory;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('webgl');
const radius = 10;
const particleCount = 300;

const width = 1400;
const height = 1400;
const depth = 700;
// var synth = new Tone.Synth().toMaster()

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
window.addEventListener('resize', () => {
  scene.resize();
});

window.test = (index) => {
  const note = index % notes.length;

  if (canPlayAudio) {
    // synth.triggerAttackRelease(notes[note], '8n')
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
  _particles = new _.Particles(particleCount, width / 2, height / 2, depth, radius);

  if (particleArray) {
    setupParticleArray();

    requestAnimationFrame(update);
  }
}).catch(console.error);

const setupParticleArray = () => {
  particleArray = new Float32Array(memory.buffer, _particles.items(), particleCount * 3);

  scene = new Scene({
    buffer: particleArray,
    itemRadius: radius,
    width: width,
    height: height,
    depth: depth,
    canvas
  });
}

function update () {
  _particles.update(performance.now() / 1000);
  scene.draw();

  requestAnimationFrame(update);
}