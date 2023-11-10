import Scene from './scene';
// import * as dat from 'dat.gui';

// const gui = new dat.GUI();

// const guiOpts = {
//   boxVisible: false,
//   cameraControlsEnabled: true
// };

// gui.add(guiOpts, 'boxVisible').onChange(() => {
//   scene.box.visible = guiOpts.boxVisible;
// });

// gui.add(guiOpts, 'cameraControlsEnabled').onChange(() => {
//   scene.controls.enabled = guiOpts.cameraControlsEnabled;
// });

window.addEventListener('touchstart', e => e.preventDefault());

let _particles;
let particleArray;
let scene;
let memory;
let mouseposX = -10000;
let mouseposY = -10000;
const canvas = document.createElement('canvas');
const radius = 20;
const particleCount = 2500;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;
canvas.style.position = 'fixed';
document.body.appendChild(canvas);
document.body.style.margin = 0;

let mousemoveTimer;
let yPos = 0;
window.addEventListener('mousemove', (e) => {
  mouseposX = e.clientX / window.innerWidth;
  mouseposY = e.clientY / window.innerHeight;

  clearTimeout(mousemoveTimer);
  mousemoveTimer = setTimeout(() => {
    mouseposX = -10000;
    mouseposY = -10000;
  }, 400);
});

window.addEventListener('scroll', (e) => {
  yPos = -document.scrollingElement.scrollTop;
  scene.setYPos(yPos);
});

window.addEventListener('touchmove', (e) => {
  mouseposX = e.touches[0].clientX / window.innerWidth;
  mouseposY = e.touches[0].clientY / window.innerHeight;

  clearTimeout(mousemoveTimer);
  mousemoveTimer = setTimeout(() => {
    mouseposX = -10000;
    mouseposY = -10000;
  }, 400);
});

import("./wasm_loader.js").then(_ => {
  memory =  _.get_memory();

  if (_particles) {
    setupParticleArray();

    requestAnimationFrame(update);
  }
});

import("../pkg/index.js").then(_ => {
  _particles = new _.Particles(particleCount, window.innerWidth, window.innerHeight, 500., radius);

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
    canvas
  });
}

function update () {
  const time = performance.now();

  _particles.update(mouseposX, mouseposY);

  scene.draw();

  requestAnimationFrame(update);
}