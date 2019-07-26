import * as THREE from 'three';

export default class WebglRenderer {
  constructor(opts = {}) {
    this.buffer = opts.buffer;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    // this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 0.1, 1000 );
    this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 0, 10);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas
    });

    this.resize();
    this.createBuffer();
    document.body.appendChild( this.renderer.domElement );
  }

  resize()  {
    this.renderer.setSize( this.width, this.height );
  }

  draw() {
    this.points.geometry.attributes.position.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  createBuffer() {
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( this.buffer, 3 ) );

    var material = new THREE.PointsMaterial({ color: '#000', size: 20 });

    this.points = new THREE.Points( geometry,  material );
    this.scene.add( this.points );

    this.points.geometry.attributes.position.array = this.buffer;
  }
}
