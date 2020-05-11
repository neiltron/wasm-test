global.THREE = require('three');
import glslify from 'glslify';

require('three/examples/js/controls/OrbitControls');
require('three/examples/js/loaders/GLTFLoader');

export default class WebglRenderer {
  constructor(opts = {}) {
    this.buffer = opts.buffer;
    this.itemRadius = opts.itemRadius;

    this.width = opts.width || window.innerWidth;
    this.height = opts.height || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10000 );
    // this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 0, 1000);
    // this.camera.position.x += this.width / 4;
    // this.camera.position.y -= this.height / 10;
    this.camera.position.z += this.width / 20;
    this.scene.add(this.camera);

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 4000;
    // this.controls.enablePan = false;
    // this.controls.enableZoom = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas
    });
    this.renderer.setClearColor('#222');

    const ambientLight = new THREE.AmbientLight('#fff', .2);
    this.scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight('#66f', '#fff', .4);
    this.scene.add(hemisphereLight);

    // const pointLight = new THREE.PointLight('#aaf', 1);
    // this.scene.add(pointLight);
    // pointLight.position.x = this.width / 4;
    // pointLight.position.y = this.height / 10;
    // pointLight.position.z = -400;

    // const pointLight2 = new THREE.PointLight('#f66', 2);
    // this.scene.add(pointLight2);
    // pointLight2.position.x = this.width / -4;
    // pointLight2.position.y = this.height / -10;
    // pointLight2.position.z = 200;


    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.width / 2 + this.itemRadius, this.height / 2 + this.itemRadius, this.height / 2),
      new THREE.MeshBasicMaterial({ color: '#ff0', wireframe: true })
    );
    // this.box.visible = false;

    this.sceneObject = new THREE.Object3D();
    this.scene.add(this.sceneObject);

    this.box.position.x += this.width / 4;
    this.box.position.y += this.height / 4;
    this.box.position.z += this.height / 4;

    this.sceneObject.add(this.box);

    this.sceneObject.position.x -= this.width / 4;
    this.sceneObject.position.y -= this.height / 4;
    this.sceneObject.position.z -= this.height / 4;

    this.loadModel();
    this.createSkyBox();

    this.resize();
    this.createBuffer();
    document.body.appendChild( this.renderer.domElement );
  }

  resize()  {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  draw() {
    this.controls.update();
    this.instanceMesh.geometry.attributes.instancePosition.needsUpdate = true;
    this.instanceMesh.material.uniforms.time.value = performance.now() / 1000;
    this.renderer.render(this.scene, this.camera);
  }

  createBuffer() {
    const instanceGeometry = new THREE.InstancedBufferGeometry();
    instanceGeometry.copy(new THREE.SphereBufferGeometry(this.itemRadius, 32, 32));
    instanceGeometry.addAttribute('instancePosition', new THREE.InstancedBufferAttribute(this.buffer, 3).setDynamic(true));

    const instanceMaterial = new MeshCustomMaterial({
      color: '#000', side: THREE.DoubleSide
    });


    this.instanceMesh = new THREE.Mesh(instanceGeometry, instanceMaterial);

    this.instanceMesh.matrixAutoUpdate = false;
    this.instanceMesh.frustumCulled = false;

    this.sceneObject.add(this.instanceMesh);
  }

  loadModel() {
    const loader = new THREE.GLTFLoader();

    loader.load('../iss_interior.glb', model => {
      const _model = model.scene;

      _model.position.x += this.width / 4;
      _model.position.y += this.height / 4;
      _model.position.z += this.height / 4;
      _model.scale.setScalar(40);

      const material = new THREE.MeshLambertMaterial({ color: '#fff' });

      _model.traverse(child => {
        if (child.isMesh) {
          child.material = material;
          // child.material.side = THREE.BackSide;
        }
      })

      this.sceneObject.add(_model);
    })
  }

  createSkyBox() {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load('./space-sphericalmap.jpg', _t => {
      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(4000),
        new THREE.MeshBasicMaterial({
          map: _t,
          side: THREE.BackSide
        })
      );

      sphere.position.x += this.width / 4;
      sphere.position.y += this.height / 4;
      sphere.position.z += this.height / 4;
      console.log(sphere);

      this.sceneObject.add(sphere);
    })
  }
}


let vertexShader = glslify(`
  #define PHYSICAL
  #define USE_MAP

  uniform float time;
  attribute vec3 instancePosition;
  varying vec3 vViewPosition;
  varying vec3 vPosition;

  #ifndef FLAT_SHADED

    varying vec3 vNormal;

  #endif

  #include <common>
  #include <uv_pars_vertex>
  #include <uv2_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <color_pars_vertex>
  #include <fog_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <shadowmap_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  #include <clipping_planes_pars_vertex>

  void main() {

    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

    vNormal = normalize( transformedNormal );

  #endif
    #include <begin_vertex>

    transformed = vec3( position + instancePosition );

    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>


    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>

    vPosition = transformed;
  }
`);

let fragmentShader = glslify(`
  #define PHYSICAL
  #define USE_MAP

  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform float roughness;
  uniform float metalness;
  uniform float opacity;

  uniform float colorOffset;
  uniform vec3 u_color;
  uniform float time;
  varying vec2 v_Uv;
  varying vec3 vPosition;

  #ifndef STANDARD
    uniform float clearCoat;
    uniform float clearCoatRoughness;
  #endif

  varying vec3 vViewPosition;

  #ifndef FLAT_SHADED

    varying vec3 vNormal;

  #endif

  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <envmap_pars_fragment>
  #include <fog_pars_fragment>
  #include <bsdfs>
  #include <cube_uv_reflection_fragment>
  #include <lights_pars_begin>
  #include <lights_physical_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <roughnessmap_pars_fragment>
  #include <metalnessmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>

  vec3 hsv2rgb(vec3 c)
  {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    // float noiseR = snoise3(vec3(vViewPosition.xy * 20.0, time * 2.0));

    // vec3 color = mix(colorA, colorB, max(0.0, min(1.0, noiseR)));
    // diffuseColor.rgb -= color * 2.;

    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>

    // accumulation
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

    // float r = (sin(1.0 - v_uv.x / 800.0) + 1.0) / 2.0;
    // float g = (sin(1.0 - v_uv.y / 800.0) + 1.0) / 1.8;
    // float b = (sin(1.0 - v_uv.z / 800.0) + 1.0) * .5;
    // vec3 _color = vec3(r, g, b);

    // vec3 lightAdjustment = vec3(0);

    // for (int i = 0; i < NUM_POINT_LIGHTS; i += 1) {
    //   vec3 light = pointLights[i].position;
    //   vec3 _color = vec3(1.0);

    //   _color -= min(max(0.4, vUv.x), 0.8);
    //   _color /= distance(vUv.xy, light.xy);
    //   _color += cross(vNormal, light);

    //   lightAdjustment += _color;
    // }

    // vec3 light = vec3(sin(time) * 20., cos(time) * 20., 0.0);
    // vec3 light = vec3(cos(time  / 1.5) / 10., sin(time  / 2.) / 10., -1.0);
    vec3 light = vec3(.1, .05, -1.0);
    vec3 _color = vec3(1.);

    _color += abs(cross(normalize(vNormal), vPosition * 10.)) / 20.;

    _color /= (distance(vPosition, cameraPosition) / abs(dot(vNormal.xy, light.xy))) / 10.;

    _color += min(max(0.0, vViewPosition.y * 7.0), 1.0);


    gl_FragColor = vec4((hsv2rgb(_color) + _color) / 2. + outgoingLight / 10., opacity );

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>

  }
`);

function MeshCustomMaterial (parameters) {
  THREE.MeshStandardMaterial.call( this );
  this.uniforms = THREE.UniformsUtils.merge([
    THREE.ShaderLib.standard.uniforms,
    {
      time: { value: 10 },
      u_color: { value: [parameters.color.r, parameters.color.g, parameters.color.b] },
      colorOffset: { value: .1 }
    }
  ]);
  setFlags(this);
  console.log(this);
  this.setValues(parameters);
}

MeshCustomMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
MeshCustomMaterial.prototype.constructor = MeshCustomMaterial;
MeshCustomMaterial.prototype.isMeshStandardMaterial = true;

MeshCustomMaterial.prototype.copy = function ( source ) {
  THREE.MeshStandardMaterial.prototype.copy.call( this, source );
  this.uniforms = THREE.UniformsUtils.clone(source.uniforms);
  setFlags(this);
  return this;
};

function setFlags (material) {
  material.vertexShader = vertexShader;
  material.fragmentShader = fragmentShader;
  material.type = 'MeshCustomMaterial';
}