var container;
var camera, scene, renderer;
var uniforms;
var editor;

// meow globals
var geometry;
var material;
var mesh;

var _fragmentShader;

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
}

function updateShader(fragmentCode) {
    
}

function updateScene() {
  scene = new THREE.Scene();
  geometry = new THREE.PlaneBufferGeometry( 2, 2 );
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
  return `      
#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float EPSILON = 0.01;

// geometry
float smin( float a, float b, float k ) {
    float res = exp2( -k*a ) + exp2( -k*b );
    return -log2( res )/k;
}

float unionSDF(float d0, float d1) {
  return smin(d0, d1, 32.);
}

float intersectSDF(float d0, float d1) {
  return max(d0, d1);
}

float differenceSDF(float d0, float d1) {
  return max(d0, -d1);
}

float sphereSDF(vec3 p, vec3 center, float r) {
  return length(p - center) - r;
}

float planeSDF(vec3 p, float y) {
  return p.y - y;
}

float sceneSDF(vec3 pos) {
  float ds0 = sphereSDF(pos, vec3(.5, .5, 0.), 0.3);
  float ds1 = sphereSDF(pos, vec3(0.35, abs(sin(u_time/2.)*0.89), 0.), 0.2);

  return unionSDF(ds0, ds1);
}

vec3 estimateNormal(vec3 p) {
  return normalize(vec3(
  // dx
    sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) -
    sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),

  // dy
    sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) -
    sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),

  // dz
    sceneSDF(vec3(p.x, p.y, p.z + EPSILON)) -
    sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
  ));
}

float lighting(vec3 ro, vec3 rd, vec3 n) {
  vec3 lightRay = normalize(vec3(-1., 0., -1.) - ro);
  float diffuse = max(0.0, dot(n, lightRay));
  vec3 reflectedRay = rd - 2. * dot(n, rd) * n;
  float specular = max(0.0, dot(reflectedRay, lightRay));
  specular = pow(specular, 200.0);
  return diffuse + specular;
}


vec3 trace(vec3 rayOrigin, vec3 dir) {
  float totalDist = 0.;
  vec3 color = vec3(0.5, 0., sin(u_time));

  for (int i = 0; i < 100; i++) {
    float dist = sceneSDF(rayOrigin);

    rayOrigin += dist * dir;
    totalDist += dist;

    if (dist < EPSILON) {
      color = vec3(totalDist);
      break;
    }
  }

  vec3 n = estimateNormal(rayOrigin);
  float l = lighting(rayOrigin, dir, n);
  return color * l;
}

void main() {
  vec2 st = -1. + 2. * gl_FragCoord.xy/u_resolution;

  vec3 cameraOrigin = vec3(0., 0., -1.);
  vec3 rayOrigin = vec3(st.x, st.y, 0);
  vec3 dir = normalize(rayOrigin - cameraOrigin);

  gl_FragColor = vec4(trace(cameraOrigin, dir), 1.0);
}`;
}