global.THREE = require('three');
import glslify from 'glslify';
import domCanvas from './dom';

export default class WebglRenderer {
  constructor(opts = {}) {
    this.buffer = opts.buffer;
    this.itemRadius = opts.itemRadius;
    this.yPos = 0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    // this.camera = new THREE.PerspectiveCamera( 40, this.width / this.height, 0.1, 50000 );
    this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 0, 50000);
    // this.camera.position.x += this.width / 4;
    // this.camera.position.y += this.height / 4;
    // this.camera.position.y -= this.height / 10;
    // this.camera.position.x += 1000;
    // this.camera.position.y += 800;
    this.camera.position.z += 2000;
    this.scene.add(this.camera);

    // this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.enabled = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas
    });
    this.renderer.setClearColor('#222');

    // const ambientLight = new THREE.AmbientLight('#fff', .5);
    // this.scene.add(ambientLight);

    // const pointLight = new THREE.PointLight('#00f', 1);
    // this.scene.add(pointLight);
    // pointLight.position.x = this.width / 3;
    // pointLight.position.z = 600;

    // // const directionalLight = new THREE.DirectionalLight('#f0f', 1);
    // // this.scene.add(directionalLight);
    // // directionalLight.position.y = -400;
    // // directionalLight.position.z = 100;
    // // directionalLight.lookAt(new THREE.Vector3(0, 0, 0));

    // // const pointLight2 = new THREE.PointLight('#f00', .5);
    // // this.scene.add(pointLight2);
    // // pointLight2.position.x = this.width / -4;
    // // pointLight2.position.z = 200;

    // // const pointLight3 = new THREE.PointLight('#f00', .5);
    // // this.scene.add(pointLight3);
    // // pointLight3.position.x = this.width / -4;
    // // pointLight3.position.z = -200;


    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.width / 2 + this.itemRadius, this.height / 2 + this.itemRadius, this.height / 2),
      new THREE.MeshBasicMaterial({ color: '#ff0', wireframe: true })
    );

    this.box.visible = false;

    this.sceneObject = new THREE.Object3D();
    this.scene.add(this.sceneObject);

    this.box.position.x += this.width / 4;
    this.box.position.y += this.height / 4;
    this.box.position.z += this.height / 4;

    this.sceneObject.add(this.box);

    // this.sceneObject.position.x += this.width / 4;
    // this.sceneObject.position.y += this.height / 4;
    // this.sceneObject.position.z -= 150;

    // this.camera.lookAt(this.sceneObject.position);

    this.resize();
    this.createBuffer();
    document.body.appendChild( this.renderer.domElement );
  }

  resize()  {
    this.renderer.setSize( this.width, this.height );
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  draw() {;
    // this.controls.update();

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.material.uniforms.time.value = performance.now() / 1000;
    // this.points.geometry.computeFaceNormals();
    this.points.geometry.computeVertexNormals();

    this.renderer.render(this.scene, this.camera);
  }

  setYPos(yPos) {
    this.yPos = yPos;

    console.log(yPos);

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.fillStyle = '#444';
    this.ctx.font = '72pt helvetica, arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DESCENDORG', window.innerWidth / 2, window.innerHeight / 4 + 100 + this.yPos, 200);
    this.ctx.fillText('20    ', window.innerWidth / 2, window.innerHeight / 4 + 220 + this.yPos, 200);
    this.ctx.fillText('    20', window.innerWidth / 2, window.innerHeight / 4 + 340 + this.yPos, 200);

    // this.points.material.uniforms.texture.value.needsUpdate = true;
    this.points.material.uniforms.yPos.value = yPos;
  }

  createBuffer() {
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( this.buffer, 3 ) );

    const indices = [];
    const pointTotal = this.buffer.length / 3;
    const gridSize = Math.floor(Math.sqrt(pointTotal));

    for (let row = 0; row < gridSize - 1; row++) {
      for (let column = 0; column < gridSize - 1; column++) {
        const index =  column + row * gridSize;

        indices.push(index);
        indices.push(index + 1);
        indices.push(index + gridSize);

        indices.push(index + 1);
        indices.push(index + gridSize + 1);
        indices.push(index + gridSize);
      }
    }

    geometry.setIndex(indices);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const fakeGeometry = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, gridSize - 1, gridSize - 1);
    geometry.attributes.uv = fakeGeometry.attributes.uv;

    var material = new MeshCustomMaterial({ color: '#fff', side: THREE.BackSide });

    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.style.position = 'absolute';
    canvas.style.bottom = 0;
    canvas.style.right = 0;

    // ctx.fillStyle = '#111';
    // ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    this.ctx.fillStyle = '#444';
    this.ctx.font = '72pt helvetica, arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DESCENDORG', window.innerWidth / 2, window.innerHeight / 4 + 100, 200);
    this.ctx.fillText('20    ', window.innerWidth / 2, window.innerHeight / 4 + 220, 200);
    this.ctx.fillText('    20', window.innerWidth / 2, window.innerHeight / 4 + 340, 200);

    // document.body.appendChild(canvas);

    setTimeout(() => {
      const texture = new THREE.Texture(domCanvas.canvas);

      material.uniforms.texture.value = texture;
      console.log(document.body.scrollHeight, domCanvas.canvas.height);
      material.uniforms.u_content_size.value = [domCanvas.canvas.width, domCanvas.canvas.height];

      texture.needsUpdate = true;
    }, 2);

    this.points = new THREE.Mesh( geometry,  material );
    this.sceneObject.add( this.points );

    // this.sceneObject.rotation.z += Math.PI;

    this.points.geometry.attributes.position.array = this.buffer;
  }
}


let vertexShader = glslify(`
  #define PHYSICAL

  uniform float time;
  varying vec3 vViewPosition;
  varying vec3 vPosition;
  varying vec2 vUv;

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
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>


    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>

    vUv = uv;
    vPosition = position;
  }
`);

let fragmentShader = glslify(`
  #define PHYSICAL

  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform vec2 u_resolution;
  uniform vec2 u_content_size;
  uniform float roughness;
  uniform float metalness;
  uniform float opacity;
  uniform float yPos;
  uniform sampler2D texture;

  uniform float colorOffset;
  uniform vec3 u_color;
  uniform float time;
  varying vec2 vUv;
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
    // diffuseColor += texture2D(texture, vUv.xy);
    // float noiseR = snoise3(vec3(vViewPosition.xy * 20.0, time * 2.0));

    // vec3 color = mix(colorA, colorB, max(0.0, min(1.0, noiseR)));
    // diffuseColor.rgb -= color * 2.;

    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
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

    vec3 light = vec3(sin(time / 30.) * 50., cos(time / 30.) * 50., 1.0);
    // vec3 light = vec3(0.1, sin(time / 10.) * 20., -1.0);
    vec3 _color = vec3(1.);

    vec3 irid = abs(cross(vNormal, vPosition / 2.)) / 1000.;
    vec3 bodyIrid = abs(cross(vNormal, vPosition - vec3(u_resolution.xy / 3., 0.))) / 1000.;
    _color = _color - irid / (3. + sin(time / 10.));

    _color -= vec3(abs(dot(vNormal.xyz, light.xyz)) / 200.);

    // _color += min(max(0.0, vViewPosition.y * 7.0), 1.0);

    vec4 _textureColor = texture2D(texture, (vUv.xy / u_content_size / vec2(.5, .5)) * u_resolution + vec2(0, yPos / u_resolution.y / 2. + .5));
    vec3 textureColor = (_textureColor.rgb - bodyIrid * (1.5 + (sin(time / 10. + vPosition.x / 100.) + 1.) / 2.)) * _textureColor.a;

    // gl_FragColor = vec4(_color + outgoingLight, opacity );
    gl_FragColor = vec4(mix(_color + outgoingLight, _color + textureColor - irid, _textureColor.a), opacity );

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
      u_resolution: { value: [window.innerWidth, window.innerHeight] },
      u_content_size: { value: [window.innerWidth, window.innerHeight] },
      colorOffset: { value: .1 },
      texture: { value: null },
      yPos: { value: 0 },
    }
  ]);
  setFlags(this);
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