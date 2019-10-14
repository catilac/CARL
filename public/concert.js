
var container;
var threeCam, scene, renderer;
var uniforms;

// meow globals
var geometry;
var material;
var mesh;

var caurl_id;
var socket;
var _rotation = new THREE.Euler(0, 0, 0, 'XYZ');

var _fragmentShader = `      
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_camPos;

void main() {
  vec2 st = -1. + 2. * gl_FragCoord.xy/u_resolution;

  gl_FragColor = vec4(st.x, ((sin(u_camPos.x)+1.0) / 2.0), 0.5, st.y);
}`;

init();
animate();


function updateScene() {
  scene = new THREE.Scene();
  geometry = new THREE.PlaneBufferGeometry( 2, 2 );
  
  try {
    material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader()
    } );
    
    
  } catch (e) {
    console.log(e);
    return;
  }
  
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
    
}

function init() {
    
  container = document.getElementById( 'container' );
  
  threeCam = new THREE.Camera();
  threeCam.position.z = 1;

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_camPos: {type: "v3", value: new THREE.Vector3() }
    
    // add camera orientation to this?
  };
  
  updateScene();
  
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  
  container.appendChild( renderer.domElement );
  
  onWindowResize();
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
  renderer.setSize( window.innerWidth, window.innerHeight );
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  updateScene();
  uniforms.u_time.value += 0.05;
  
  // update camera position
  var _camera = document.querySelector("a-camera");
  
  var rot = _camera.getAttribute("rotation");
  console.log(rot);
  uniforms.u_camPos.value = new THREE.Vector3(rot.x, rot.y, rot.z);
  // if there is no .value here we get a strange error from three.js.min sayinf b is undefined :0
  
  renderer.render( scene, threeCam );

}

function fragmentShader() {
  return _fragmentShader;
}

function vertexShader() {
  return `        
    void main() {
      gl_Position = vec4( position, 1.0 );
    }
  `
}
//https://aframe.io/docs/0.9.0/components/camera.html#reading-position-or-rotation-of-the-camera
// AFRAME.registerComponent('rotation-reader', {
//   tick: function () {
//     // `this.el` is the element.
//     // `object3D` is the three.js object.

//     // `rotation` is a three.js Euler using radians. `quaternion` also available.
//     _rotation = this.el.object3D.rotation;

//     // `position` is a three.js Vector3.
//     console.log(this.el.object3D.position);
//   }
// });