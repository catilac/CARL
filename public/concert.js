
var container;
var threeCam, scene, renderer;
var uniforms;

// meow globals
var geometry;
var material;
var mesh;
var feed;

var caurl_id;
var socket;

var _fragmentShader = `      
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_camRot;
uniform sampler2D u_feed;

void main() {
  vec2 st = -1. + 2. * gl_FragCoord.xy/u_resolution;

  // gl_FragColor = vec4(texture2D(u_feed,gl_FragCoord.xy * u_resolution).r, ((sin(u_camRot.x)+1.0) / 2.0), 0.5, 1.0);

  gl_FragColor = texture2D(u_feed, gl_FragCoord.xy/u_resolution).rrrr;
}`;

init();
animate();


function updateScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xff0000 );
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
  
  video = document.querySelector( 'video' );
  feed = new THREE.VideoTexture( video );
  
  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_camRot: {type: "v3", value: new THREE.Vector3() },
    u_feed: {type: "", value: new THREE.VideoTexture(video)}
    
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
  uniforms.u_camRot.value = new THREE.Vector3(rot.x, rot.y, rot.z);
  // if there is no .value here we get a strange error from three.js.min sayinf b is undefined :0
  
  uniforms.u_feed.value = feed;
  
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