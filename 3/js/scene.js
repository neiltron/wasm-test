global.THREE = require('three');


require('three/examples/js/controls/OrbitControls');

import CustomPhongMaterial from  './CustomPhong';

export default class WebglRenderer {
  constructor(opts = {}) {
    this.buffer = opts.buffer;
    this.itemRadius = opts.itemRadius;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 90, this.width / this.height, 0.1, 5000 );
    // this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 0, 1000);
    // this.camera.position.x += this.width / 4;
    // this.camera.position.y += this.height / 4;
    this.camera.position.z += this.width / 2;
    this.scene.add(this.camera);

    this.controls = new THREE.OrbitControls(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas
    });
    this.renderer.setClearColor('#222');

    const ambientLight = new THREE.AmbientLight('#fff', .2);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#fff', '#aaa', .5);
    this.scene.add(hemiLight);

    const pointLight = new THREE.PointLight('#00f', .5);
    this.scene.add(pointLight);
    pointLight.position.x = this.width / 3;
    pointLight.position.z = -400;

    const pointLight2 = new THREE.PointLight('#f00', .2);
    this.scene.add(pointLight2);
    pointLight2.position.x = this.width / -4;
    pointLight2.position.z = 200;


    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.width / 2 + this.itemRadius, this.height / 2 + this.itemRadius, this.height / 2),
      new THREE.MeshBasicMaterial({ color: '#ff0', wireframe: true })
    );

    this.sceneObject = new THREE.Object3D();
    this.scene.add(this.sceneObject);

    this.box.position.x += this.width / 4;
    this.box.position.y += this.height / 4;
    this.box.position.z += this.height / 4;

    this.sceneObject.add(this.box);

    this.sceneObject.position.x -= this.width / 4;
    this.sceneObject.position.y -= this.width / 5;
    this.sceneObject.position.z -= this.width / 4;

    this.resize();
    this.createBuffer();
    document.body.appendChild( this.renderer.domElement );
  }

  resize()  {
    this.renderer.setSize( this.width, this.height );
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  draw() {
    this.controls.update();
    this.instanceMesh.geometry.attributes.instancePosition.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  createBuffer() {
    const instanceGeometry = new THREE.InstancedBufferGeometry();
    instanceGeometry.copy(new THREE.SphereBufferGeometry(this.itemRadius, 16, 16));
    instanceGeometry.addAttribute('instancePosition', new THREE.InstancedBufferAttribute(this.buffer, 3).setDynamic(true));

    const instanceMaterial = new CustomPhongMaterial({
      color: '#fff'
    });


    this.instanceMesh = new THREE.Mesh(instanceGeometry, instanceMaterial);

    this.instanceMesh.matrixAutoUpdate = false;
    this.instanceMesh.frustumCulled = false;

    this.sceneObject.add(this.instanceMesh);
  }
}
