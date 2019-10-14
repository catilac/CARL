
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


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec3 u_camRot;
uniform sampler2D u_feed;

// Define some constants
const int steps = 128; // This is the maximum amount a ray can march.
const float smallNumber = 0.001;
const float maxDist = 10.; // This is the maximum distance a ray can travel.
 
float scene(vec3 position){
    // So this is different from the sphere equation above in that I am
    // splitting the position into its three different positions
    // and adding a 10th of a cos wave to the x position so it oscillates left 
    // to right and a (positive) sin wave to the z position
    // so it will go back and forth.
    float sphere = length(
        vec3(
            position.x + cos(u_time)/10., 
            position.y, 
            position.z+ sin(u_time) +1.)
        )-0.5;
    
    // This is different from the ground equation because the UV is only 
    // between -1 and 1 we want more than 1/2pi of a wave per length of the 
    // screen so we multiply the position by a factor of 10 inside the trig 
    // functions. Since sin and cos oscillate between -1 and 1, that would be 
    // the entire height of the screen so we divide by a factor of 10.
    float ground = position.y + sin(position.x * 10.) / 10. 
                              + cos(position.z * 10.) / 10. + 1.;
    
    // We want to return whichever one is closest to the ray, so we return the 
    // minimum distance.
    return min(sphere,ground);
}
vec4 trace (vec3 origin, vec3 direction){
    
    float dist = 0.;
    float totalDistance = 0.;
    vec3 positionOnRay = origin;
    
    for(int i = 0 ; i < steps; i++){
        
        dist = scene(positionOnRay);
        
        // Advance along the ray trajectory the amount that we know the ray
        // can travel without going through an object.
        positionOnRay += dist * direction;
        
        // Total distance is keeping track of how much the ray has traveled
        // thus far.
        totalDistance += dist;
        
        // If we hit an object or are close enough to an object,
        if (dist < smallNumber){
            // return the distance the ray had to travel normalized so be white
            // at the front and black in the back.
            return 1. - (vec4(totalDistance) / maxDist);
 
        }
        
        if (totalDistance > maxDist){
 
            return texture2D(u_feed, gl_FragCoord.xy/u_resolution); // Background color.
        }
    }
    
    return texture2D(u_feed, gl_FragCoord.xy/u_resolution);
}
 
// main is a reserved function that is going to be called first
void main(void)
{
    vec2 normCoord = gl_FragCoord.xy/u_resolution;

    vec2 uv = -1. + 2. * normCoord;
    // Unfortunately our screens are not square so we must account for that.
    uv.x *= (u_resolution.x / u_resolution.y);
    
    vec3 rayOrigin = vec3(uv, 0.);
    vec3 camOrigin = vec3(0., 0., -1.);
    vec3 direction = camOrigin + rayOrigin;

    // This reserved variable is what we must set the final color to
    gl_FragColor = trace(rayOrigin, direction);
}

//void main() {
//  vec2 st = -1. + 2. * gl_FragCoord.xy/u_resolution;

  // gl_FragColor = vec4(texture2D(u_feed,gl_FragCoord.xy * u_resolution).r, ((sin(u_camRot.x)+1.0) / 2.0), 0.5, 1.0);

//  gl_FragColor = texture2D(u_feed, gl_FragCoord.xy/u_resolution).rrrr;
//}

`;

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