
var container;
var threeCam, scene, renderer;
var uniforms;

// meow globals
var geometry;
var material;
var mesh;
var feed;

var socket;

var needsUpdate = true;

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
  
  socket = io();
  needsUpdate = true;
  socket.on('code', function(shaderCode) {
    _fragmentShader = shaderCode;
    needsUpdate = true;
  });
    
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
    u_feed: {type: "", value: new THREE.VideoTexture(video)},
    u_camQuat:{type:"v4", value: new THREE.Vector4() },
    u_camPos: {type: "v3", value: new THREE.Vector3() },
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
  if (needsUpdate) {
    updateScene();
    needsUpdate = false;
  }

  uniforms.u_time.value += 0.05;
  
  // update camera position
  var _camera = document.querySelector("a-camera");
  
  var rot = _camera.getAttribute("rotation");
 // var threeCamera = _camera.components.camera.camera;
  var threeCamera = _camera.object3D;
  
  var quat = threeCamera.quaternion;
  var pos = new THREE.Vector3();
  var pos = threeCamera.getWorldPosition(pos);
  console.log('position: ', pos);
  //alert(quat.x)
  
  uniforms.u_camRot.value = new THREE.Vector3(rot.x, rot.y, rot.z);
  uniforms.u_camQuat.value = new THREE.Vector4(quat.x, quat.y, quat.z, quat.w);

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