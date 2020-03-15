
// this is just for code highlighting in VSCode
// via the glsl-literal extension
const glsl = x => x;

export const frag = glsl`
precision highp float;
uniform float time;
uniform float width;
uniform float height;

const float PI = 3.141592654;
const float DEG = PI / 180.0;

vec2 coords() {
  float vmin = min(width, height);
  return vec2((gl_FragCoord.x - width * .5) / vmin,
              (gl_FragCoord.y - height * .5) / vmin);
}

vec2 rotate(vec2 p, float a) {
  return vec2(p.x * cos(a) - p.y * sin(a),
              p.x * sin(a) + p.y * cos(a));
}

vec2 repeat(in vec2 p, in vec2 c) {
  return mod(p, c) - 0.5 * c;
}

// Distance functions by Inigo Quilez
// https://iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
float circle(in vec2 p, float radius) {
  return length(p) - radius;
}

float pie( in vec2 p, in vec2 c, in float r )
{
    p.x = abs(p.x);
    float l = length(p) - r;
    float m = length(p-c*clamp(dot(p,c),0.0,r)); // c = sin/cos of the aperture
    return max(l,m*sign(c.y*p.x-c.x*p.y));
}

// function from https://www.shadertoy.com/view/3ll3zr
float sdHeart(in vec2 p, float s) {
  p /= s;
  vec2 q = p;
  q.x *= 0.5 + .5 * q.y;
  q.y -= abs(p.x) * .63;
  return (length(q) - .7) * s;
}

float symmetricDiff(float a, float b)
{
    // (A ∪ B) \ (A ∩ B)
    return max(min(a, b), -max(a, b));
}

float subtract(float a, float b)
{
    return max(-a, b);
}

vec3 shade(in vec2 p)
{
  vec3 background = vec3(0);
  vec3 foreground = vec3(.5 + .5 * sin(.015 + time * .1), .2 + p.y * .01, .9);
  vec2 h = vec2(sin(90.0 * 3.14/180.0), cos(90.0 * 3.14/180.0));
  float sdf0 = pie(p, h, 50.0);
  sdf0 = min(sdf0, circle(p - vec2(25.0, 0), 25.0));
  sdf0 = subtract(circle(p + vec2(25.0, 0), 25.0), sdf0);
  sdf0 = symmetricDiff(sdf0, circle(p - vec2(25.0, 0), 5.0));
  sdf0 = symmetricDiff(sdf0, circle(p + vec2(25.0, 0), 5.0));
  float sdf  = mix(sdf0, sdHeart(p + vec2(0, 2.0 +sin(time) * 4.0), 40.0), clamp(2.0 * sin(time * .1), 0.0, 1.0));

  if (sdf < 0.0) {
    return foreground;
  }
  
  float sdf2 = circle(p, 50.0);


  vec3 col = sdf2 < 0.0 ? vec3(0) : background;
  
  // Lighten around surface
  col = mix(col, col*1.0+exp(-2.0 * abs(min(sdf, sdf2))), 0.4);
  
  // repeating lines
  return col;
}


void main () {
  vec2 p0 = coords();
  float zoom = 110.0;
  float rota = mix(mod(time * .1, 2.0 * PI), 0.0, clamp(2.0 * sin(time * .1), 0.0, 1.0));
  vec2 p1 = rotate(p0 * zoom, rota);
  vec3 col = shade(p1);
  gl_FragColor = vec4(col, 1.0);
}
`

export const vert = glsl`
precision mediump float;
attribute vec2 position;

void main () {
  gl_Position = vec4(position, 0, 1.0);
}
`

