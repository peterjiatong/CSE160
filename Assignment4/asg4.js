// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_SlightOn;

  void main() {
    if (u_whichTexture == -3){
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2){
      gl_FragColor = u_FragColor; // use color
    } else if(u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0); // use uv debug color
    } else if(u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0
    } else if(u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1
    } else {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // use texture2
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    // if (r<1.0){
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if(r <2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    vec3 R = reflect(-L,N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    float specular = pow(max(dot(E,R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn) {
      if (u_SlightOn) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    } else {
      gl_FragColor = gl_FragColor;
    }
    
  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_SlightOn;

let g_globalAngleX = 0;
let g_globalAngleY = 0;

let g_prevMouseX = null;
let g_prevMouseY = null;

let g_globalFOV = 60;
let moveCameraY = true;

let g_NormalOn = false;
let g_animationOn = true;

let g_lightOn = true; 
let g_SlightOn = true; 

let g_lightPos = [0, 1, 0];

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  camera = new Camera();
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }


  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log("failed to get the storage loc of u_ProjectionMatrix");
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log("failed to get the storage loc of u_ViewMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of  u_GlobalRotateMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('failed to get u_Sampler0 location');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('failed to get u_Sampler1 location');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('failed to get u_Sampler2 location');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log('failed to get u_Texture location');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if(!u_lightPos) {
    console.log('failed to get u_lightPos location');
    return false;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if(!u_cameraPos) {
    console.log('failed to get u_cameraPos location');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
      return;
  }

  u_SlightOn = gl.getUniformLocation(gl.program, 'u_SlightOn');
  if (!u_SlightOn) {
      console.log('Failed to get the storage location of u_SlightOn');
      return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHTMLUI() {
    // document.getElementById('FOVXSlide').addEventListener('mousemove', function () {g_globalFOV = this.value;});
    // document.getElementById('YOn').onclick = function() {moveCameraY = true};
    // document.getElementById('YOff').onclick = function() {moveCameraY = false};

    document.getElementById('NOn').onclick = function() {g_NormalOn = true};
    document.getElementById('NOff').onclick = function() {g_NormalOn = false};

    document.getElementById('LAOn').onclick = function() {g_animationOn = true};
    document.getElementById('LAOff').onclick = function() {g_animationOn = false};

    document.getElementById('LOn').onclick = function() {g_lightOn = true};
    document.getElementById('LOff').onclick = function() {g_lightOn = false};

    document.getElementById('SLOn').onclick = function() {g_SlightOn = true};
    document.getElementById('SLOff').onclick = function() {g_SlightOn = false};

    document.getElementById('lightx').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[0] = this.value/100; renderScene();}});
    document.getElementById('lighty').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[1] = this.value/100; renderScene();}});
    document.getElementById('lightz').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[2] = this.value/100; renderScene();}});
}

function sendTexttoHTML(text, htmlID) {
  var htmlElem = document.getElementById(htmlID);
  if (!htmlElem) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
  }
  htmlElem.innerHTML = text;
}

function initTextures(){
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }

  var image = new Image();
  if(!image){
    console.log('failed to create image object');
    return false;
  }
  image.onload = function() {sendImageToGLSL0(0, u_Sampler0, image) };
  image.src = "dirt.jpg";

  var image1 = new Image();
  if(!image1){
    console.log('failed to create image1 object');
    return false;
  }
  image1.onload = function() {sendImageToGLSL1(1, u_Sampler1, image1) };
  image1.src = "image.png";

  var image2 = new Image();
  if(!image2){
    console.log('failed to create image2 object');
    return false;
  }
  image2.onload = function() {sendImageToGLSL2(2, u_Sampler2, image2) };
  image2.src = "sky.jpg";

  return true;
}

function sendImageToGLSL0(n, u_Sampler, image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, n);
}

function sendImageToGLSL1(n, u_Sampler, image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, n);
}

function sendImageToGLSL2(n, u_Sampler, image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, n);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);

  document.onkeydown = function(ev) {keydown(ev); };
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); } };
  canvas.onmouseup = function() { g_prevMouseX = null; g_prevMouseY = null; };
}

function click(ev) {
  let rect = ev.target.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  if (g_prevMouseX !== null && g_prevMouseY !== null) {
    let deltaX = x - g_prevMouseX;
    let deltaY = y - g_prevMouseY;
    camera.panX(deltaX * 0.2);
    // for debug
    if (moveCameraY == true) g_globalAngleY += deltaY * 0.2;
  }

  g_prevMouseX = x;
  g_prevMouseY = y;
}

function keydown(ev){

  if(ev.key == 'w'){
    camera.moveForward();
  }else if(ev.key == 'a'){
    camera.moveLeft();  
  }else if(ev.key == 's'){
    camera.moveBackward();
  }else if(ev.key == 'd'){
    camera.moveRight();
  }else if(ev.key == 'q'){
    camera.panLeft();
  }else if(ev.key == 'e'){
    camera.panRight();
  }else if (ev.shiftKey && ev.key == 'Q') {
    camera.panLeft90();
  } else if (ev.shiftKey && ev.key == 'E') {
    camera.panRight90();
  }


}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return ([x,y]);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000 - g_startTime;
  if (g_animationOn) {
    updateAnimationAngles();
  }
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  g_lightPos[0] = Math.cos(g_seconds);
}

function renderScene() {
  var startTime = performance.now();
  var projMat = new Matrix4();
  projMat.setPerspective(g_globalFOV, 1 * canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(camera.eye.elements[0], camera.eye.elements[1] + 1, camera.eye.elements[2] + 2,
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY,1,0,0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // var ground = new Cube();
  // ground.color = [0,1,0,1];
  // ground.textureNum = -2;
  // ground.matrix.translate(0,-.75,0.0);
  // ground.matrix.scale(100,0,100);
  // ground.matrix.translate(-.5,0,-0.5);
  // ground.renderFast();

  gl.uniform3f(u_lightPos, g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_SlightOn, g_SlightOn);

  var sky = new Cube();
  sky.textureNum = -2;
  if (g_NormalOn) sky.textureNum = -3;
  sky.matrix.scale(-10,-10,-10);
  sky.matrix.translate(-.55,-0.65,-0.5);
  sky.render();

  var cube = new Cube();
  cube.textureNum = -2;
  cube.color = [1, 0.5, 0.5, 1.0];
  if (g_NormalOn) cube.textureNum = -3;
  cube.matrix.scale(1,1,1);
  cube.matrix.translate(-1,-1,-0.5);
  cube.render();

  var light = new Cube();
  light.textureNum = -2;
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
  light.matrix.scale(.2,.2,.2);
  light.matrix.translate(1.75, 3, 12);
  light.render();

  var sphere = new Sphere();
  if(g_NormalOn) sphere.textureNum = -3;
  sphere.matrix.scale(0.65, 0.65, 0.65);
  sphere.matrix.translate(2.5, -.9, 0.5);
  sphere.render();

  var duration = performance.now() - startTime;
  sendTexttoHTML(" ms: " + Math.floor(duration) + " FPS: " + Math.floor(10000 / duration), "numdot");
}
