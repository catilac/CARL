var container;
var camera, scene, renderer;
var uniforms;
var editor;

// meow globals
var geometry;
var material;
var mesh;

var _fragmentShader = `      
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  vec2 st = -1. + 2. * gl_FragCoord.xy/u_resolution;

  gl_FragColor = vec4(st.x, st.y, sin(u_time), 1.0);
}`;

init();
animate();

function initEditor() {
  editor = document.getElementById('editor');
  if (editor) {
    // add a change handler to try replacing the shader stuff with
    // insert the default fragment shader code
    editor.value = fragmentShader();
    editor.onchange = onEdit;
  }
}

// this function will trigger a change to the editor
function onEdit(e) {
  const elem = e.target;
  const fragmentCode = elem.value;
  updateShader(fragmentCode);
}

function updateShader(fragmentCode) {
  console.log("did update");
  _fragmentShader = fragmentCode;
}

function updateScene() {
  scene = new THREE.Scene();
  geometry = new THREE.PlaneBufferGeometry( 2, 2 );
  
  
  console.log(fragmentShader());
  
  material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader()
  } );

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );  
}

function init() {
  container = document.getElementById( 'container' );
  
  initEditor();

  camera = new THREE.Camera();
  camera.position.z = 1;

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() }
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
  uniforms.u_time.value += 0.05;
  renderer.render( scene, camera );
}


function vertexShader() {
  return `        
    void main() {
      gl_Position = vec4( position, 1.0 );
    }
  `
}

function fragmentShader() {
  return _fragmentShader;
}