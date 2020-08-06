var container;
var threeCam, scene, renderer;
var uniforms;
var editor;

var gl;

var codemirror;

// meow globals
var geometry;
var material;
var mesh;

var socket;

var isDirty = false;
init();
animate();

function initEditor() {
  codemirror = CodeMirror(document.body, {
    value: fragmentShader(),
    lineNumbers: true,
    mode: "x-shader/x-vertex",
  });

  codemirror.on("change", onEdit);
  onEdit();
}

// this function will trigger a change to the editor
function onEdit() {
  const fragmentCode = codemirror.getValue();
  updateShader(fragmentCode);
}

function updateShader(fragmentCode) {
  if (!checkFragmentShader(fragmentCode)) {
    return;
  }

  console.log("did update");
  _fragmentShader = fragmentCode;

  sendCodeOverWire();

  isDirty = true;
}

function sendCodeOverWire() {
  socket.emit("livecode-update", fragmentShader());
}

function updateScene() {
  scene = new THREE.Scene();
  geometry = new THREE.PlaneBufferGeometry(2, 2);

  try {
    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
    });
  } catch (e) {
    console.log("MY ERROR", e);
    return;
  }

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  shaderDirtyFlag = false;
}

function init() {
  // SOCKET IO
  socket = io();

  container = document.getElementById("container");

  initEditor();

  threeCam = new THREE.Camera();
  threeCam.position.z = 1;

  video = document.querySelector("video");
  feed = new THREE.VideoTexture(video);

  uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_camRot: { type: "v3", value: new THREE.Vector3() },
    u_feed: { type: "", value: new THREE.VideoTexture(video) },
  };

  updateScene();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);

  gl = renderer.getContext();

  container.appendChild(renderer.domElement);

  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (isDirty) {
    updateScene();
  }
  uniforms.u_time.value += 0.05;
  uniforms.u_feed.value = feed;
  renderer.render(scene, threeCam);
}

function vertexShader() {
  return `        
    void main() {
      gl_Position = vec4( position, 1.0 );
    }
  `;
}

function fragmentShader() {
  return _fragmentShader;
}

// this returns false if the fragment shader cannot compile
// true if it can
function checkFragmentShader(shaderCode) {
  if (!gl) {
    return;
  }
  let shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, shaderCode);
  gl.compileShader(shader);

  let result = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!result) console.log(gl.getShaderInfoLog(shader));

  return result;
}
