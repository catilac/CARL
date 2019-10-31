
var _fragmentShader = `      

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 u_camRot;
uniform vec4 u_camQuat;
uniform vec3 u_camPos;
uniform float u_vol;

uniform sampler2D u_feed;
#define PI 3.14159265
#define TAU (2*PI)
#define PHI (sqrt(5)*0.5 + 0.5)
// Define some constants
const int steps = 128; // This is the maximum amount a ray can march.
const float smallNumber = 0.001;
const float maxDist = 10.; // This is the maximum distance a ray can travel.
 

vec3 rotateQuat( vec4 quat, vec3 vec )
{
return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

vec3 lookAt(vec2 uv, vec3 camOrigin, vec3 camTarget){
    vec3 zAxis = normalize(camTarget - camOrigin);
    vec3 up = vec3(0,1,0);
    vec3 xAxis = normalize(cross(up, zAxis));
    vec3 yAxis = normalize(cross(zAxis, xAxis));
    
    float fov = 2.;
    
    vec3 dir = (normalize(uv.x * xAxis + uv.y * yAxis + zAxis * fov));
    
    return dir;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

// Quaternion multiplication
// http://mathworld.wolfram.com/Quaternion.html
vec4 qmul(vec4 q1, vec4 q2) {
	return vec4(
		q2.xyz * q1.w + q1.xyz * q2.w + cross(q1.xyz, q2.xyz),
		q1.w * q2.w - dot(q1.xyz, q2.xyz)
	);
}

// Vector rotation with a quaternion
// http://mathworld.wolfram.com/Quaternion.html
vec3 rotate_vector(vec3 v, vec4 r) {
	vec4 r_c = r * vec4(-1, -1, -1, 1);
	return qmul(r, qmul(vec4(v, 0), r_c)).xyz;
}

vec3 rotateEuler(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

float sqrt(int s){
    return pow(float(s),0.5);
}

 float fBlobSpaz(vec3 p) {
    p = abs(p);
    if (p.x < max(p.y, p.z)) p = p.yzx;
    if (p.x < max(p.y, p.z)) p = p.yzx;
    float b = max(max(max(
        dot(p, normalize(vec3(1, 1, 1))),
        dot(p.xz, normalize(vec2(PHI+1., 1)))),
        dot(p.yx, normalize(vec2(1., PHI)))),
        dot(p.xz, normalize(vec2(1., PHI))));
    float l = length(p);
    return l - 0.2 - 1. * ((u_time) /1.2)* cos(min(sqrt(1.01 - b / l)*(PI / 0.25), PI));
}

float fBlob(vec3 p) {
	p = abs(p);
	if (p.x < max(p.y, p.z)) p = p.yzx;
	if (p.x < max(p.y, p.z)) p = p.yzx;
    float b = max(max(max(
        dot(p, normalize(vec3(1, 1, 1))),
        dot(p.xz, normalize(vec2(PHI+1., 1)))),
        dot(p.yx, normalize(vec2(1., PHI)))),
        dot(p.xz, normalize(vec2(1., PHI))));
    float l = length(p) ;
	return l - 1.5 - 0.2 * (1.5 / 2.0) * cos(min(sqrt(1.01 - b / l)*(PI / 0.25), PI));
}


float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float scene(vec3 position){
    
  
    float b = fBlob(vec3(
            position.x, 
            position.y, 
            position.z - 10.)
        );
 
    
    float ground = (position.y) + sin(position.x * 10.) / (5.+ (5. * (u_vol+1. /2.)))
                              + cos(position.z * 10.) / 10. + 1.;

    float ground2 = -(position.y) + sin(position.x * 10.) / 10. 
                              - cos(position.z * 10.) / 10. + 1.;
                              
    //ground = smin(ground,ground2,1.);
    
    // We want to return whichever one is closest to the ray, so we return the 
    // minimum distance.
    return smin(b,ground, 1.);
}

vec3 getNormal(in vec3 p)
{
    vec3 eps = vec3(0.001, 0, 0); 
    float nx = scene(p + eps.xyy) - scene(p - eps.xyy); 
    float ny = scene(p + eps.yxy) - scene(p - eps.yxy); 
    float nz = scene(p + eps.yyx) - scene(p - eps.yyx); 
    return normalize(vec3(nx,ny,nz)); 
}


vec3 getLighting(vec3 p){

    vec3 lightPos = vec3(sin(u_time) +1. ,sin(u_time * 1.) +1.,1);
    
    float mag = dot(getNormal(p), lightPos);
    
    return vec3(mag) ;

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
            return getLighting(positionOnRay).xyzz ;//1. - (vec4(totalDistance) / maxDist);
 
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
    vec3 camOrigin = u_camPos; //vec3(0., 0., -1.);
    
    

    vec3 zAxis = vec3(0,0,1);
    vec3 up = vec3(0,1,0);
    vec3 xAxis = normalize(cross(up, zAxis));
    vec3 yAxis = normalize(cross(zAxis, xAxis));

    // we need to apply rotate 3 times each with rotation on the relative object, 
    // then we can get the lookat direction that we need. SO lets start with looking at forward

    vec3 dirToLook = zAxis;//normalize(camOrigin + rayOrigin);
    dirToLook = rotateQuat(u_camQuat,dirToLook);    


    // according to 3js docs Default order is 'XYZ'

    vec3 dir = lookAt(uv, camOrigin, dirToLook);

    // This reserved variable is what we must set the final color to
    gl_FragColor = trace(camOrigin, dir);
}
`;