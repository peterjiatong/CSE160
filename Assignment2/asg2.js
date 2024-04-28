// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;

let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngleX = 0;
let g_globalAngleY = 0;

let g_leftarm = 0;
let g_leftarmAnimation = false;

let g_rightarm = 0;
let g_rightarmAnimation = false;

let g_lefthand = 0;
let g_lefthandAnimation = false;

let g_righthand = 0;
let g_righthandAnimation = false;

let g_leftUpperLeg = 0;
let g_leftUpperLegAnimation = false;

let g_leftLowerLeg = 0;
let g_leftLowerLegAnimation = false;

let g_rightUpperLeg = 0;
let g_rightUpperLegAnimation = false;

let g_rightLowerLeg = 0;
let g_rightLowerLegAnimation = false;

let g_leftFoot = 0;
let g_leftFootAnimation = false;

let g_rightFoot = 0;
let g_rightFootAnimation = false;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // gl.enable(gl.DEPTH_TEST);
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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of  u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHTMLUI() {
    document.getElementById('angleXSlide').addEventListener('mousemove', function () {g_globalAngleX = this.value;});
    document.getElementById('angleYSlide').addEventListener('mousemove', function () {g_globalAngleY = this.value;});

    document.getElementById('leftarmSlide').addEventListener('mousemove', function () {g_leftarm= this.value;});
    document.getElementById('leftarmButtonOn').onclick = function() {g_leftarmAnimation = true};
    document.getElementById('leftarmButtonOff').onclick = function() {g_leftarmAnimation = false};

    document.getElementById('rightarmSlide').addEventListener('mousemove', function () {g_rightarm = this.value;});
    document.getElementById('rightarmButtonOn').onclick = function() {g_rightarmAnimation = true};
    document.getElementById('rightarmButtonOff').onclick = function() {g_rightarmAnimation = false};

    document.getElementById('lefthandSlide').addEventListener('mousemove', function () {g_lefthand = this.value;});
    document.getElementById('lefthandButtonOn').onclick = function() {g_lefthandAnimation = true};
    document.getElementById('lefthandButtonOff').onclick = function() {g_lefthandAnimation = false};

    document.getElementById('righthandSlide').addEventListener('mousemove', function () {g_righthand = this.value;});
    document.getElementById('righthandButtonOn').onclick = function() {g_righthandAnimation = true};
    document.getElementById('righthandButtonOff').onclick = function() {g_righthandAnimation = false};

    document.getElementById('leftUpperLegSlide').addEventListener('mousemove', function () {g_leftUpperLeg = this.value;});
    document.getElementById('leftUpperLegButtonOn').onclick = function() {g_leftUpperLegAnimation = true};
    document.getElementById('leftUpperLegButtonOff').onclick = function() {g_leftUpperLegAnimation = false};

    document.getElementById('leftLowerLegSlide').addEventListener('mousemove', function () {g_leftLowerLeg = this.value;});
    document.getElementById('leftLowerLegButtonOn').onclick = function() {g_leftLowerLegAnimation = true};
    document.getElementById('leftLowerLegButtonOff').onclick = function() {g_leftLowerLegAnimation = false};

    document.getElementById('rightUpperLegSlide').addEventListener('mousemove', function () {g_rightUpperLeg = this.value;});
    document.getElementById('rightUpperLegButtonOn').onclick = function() {g_rightUpperLegAnimation = true};
    document.getElementById('rightUpperLegButtonOff').onclick = function() {g_rightUpperLegAnimation = false};

    document.getElementById('rightLowerLegSlide').addEventListener('mousemove', function () {g_rightLowerLeg = this.value;});
    document.getElementById('rightLowerLegButtonOn').onclick = function() {g_rightLowerLegAnimation = true};
    document.getElementById('rightLowerLegButtonOff').onclick = function() {g_rightLowerLegAnimation = false};

    document.getElementById('leftFootSlide').addEventListener('mousemove', function () {g_leftFoot = this.value;});
    document.getElementById('leftFootButtonOn').onclick = function() {g_leftFootAnimation = true};
    document.getElementById('leftFootButtonOff').onclick = function() {g_leftFootAnimation = false};

    document.getElementById('rightFootSlide').addEventListener('mousemove', function () {g_rightFoot = this.value;});
    document.getElementById('rightFootButtonOn').onclick = function() {g_rightFootAnimation = true};
    document.getElementById('rightFootButtonOff').onclick = function() {g_rightFootAnimation = false};
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  canvas.onmousedown = origin;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  canvas.onclick = function(ev) {if(ev.shiftKey) {g_leftarmAnimation = true; g_rightarmAnimation = true;
    g_lefthandAnimation = false; g_righthandAnimation = false; g_leftUpperLegAnimation = true; g_rightUpperLegAnimation = true;
    g_leftLowerLegAnimation = false; g_rightLowerLegAnimation = false; g_leftFootAnimation = true; g_rightFootAnimation = true;}};

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000;
var g_sec = performance.now() / 1000 - g_startTime;

function click(ev) {
  let coordinates = convertCoordinatesEventToGL(ev);
  g_globalAngleX = g_globalAngleX+coordinates[0];
  g_globalAngleY = g_globalAngleY-coordinates[1];
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return ([x,y]);
}

function tick() {
  g_sec = performance.now() / 1000 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function renderScene() {
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY,1,0,0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var head = new Cube();
  head.color = [0.1,1,0.3,1.0];
  head.matrix.translate(-0.175, 0.6, 0.0);
  head.matrix.scale(0.35, 0.25, 0.3);
  head.render();

  var lefteye = new Cube();
  lefteye.color = [1,1,1,1];
  lefteye.matrix.translate(-0.135, 0.7, 0.21);
  lefteye.matrix.scale(0.12, 0.1, 0.1);
  lefteye.render();

  var righteye = new Cube();
  righteye.color = [1,1,1,1];
  righteye.matrix.translate(0.02, 0.7, 0.21);
  righteye.matrix.scale(0.12, 0.1, 0.1);
  righteye.render();

  var body = new Cube();
  body.color = [0.2,0.3,1.0,1.0];
  body.matrix.translate(-0.25, -.2, 0.0);
  body.matrix.scale(0.5, 0.8, 0.3);
  body.render();

  var leftarm = new Cube();
  leftarm.color = [0.3,1,0.6,1.0];
  leftarm.matrix.translate(-0.5, -0.1, 0.05);
  leftarm.matrix.scale(0.25, 0.6, 0.2);
  leftarm.matrix.rotate(-g_leftarm, 1,0,0);
  var leftarmCoord = new Matrix4(leftarm.matrix)
  leftarm.render();

  var lefthand = new Cube();
  lefthand.color = [1, 0.5, 0.5, 1];
  lefthand.matrix = leftarmCoord;
  lefthand.matrix.translate(0, -.25, 0)
  lefthand.matrix.scale(1, 0.25, 1);
  lefthand.matrix.rotate(g_lefthand, 1,0,1)
  lefthand.render();

  var rightarm = new Cube();
  rightarm.color = [1.0,0.2,0.2,1.0];
  rightarm.matrix.translate(0.26, -0.11, 0.05);
  rightarm.matrix.scale(0.25, 0.6, 0.2);
  rightarm.matrix.rotate(-g_rightarm, 1,0,0);
  var rightarmCoord = new Matrix4(rightarm.matrix)
  rightarm.render();

  var righthand = new Cube();
  righthand.color = [1, 0.5, 0.5, 1];
  righthand.matrix = rightarmCoord;
  righthand.matrix.translate(0, -.25, 0)
  righthand.matrix.scale(1, 0.25, 1);
  righthand.matrix.rotate(g_righthand, 1,0,1)
  righthand.render();

  var leftUpperleg = new Cube();
  leftUpperleg.color = [1,0,1,1];
  leftUpperleg.matrix.translate(-.23, -0.55, 0.05);
  leftUpperleg.matrix.scale(0.22, 0.35, 0.2);
  leftUpperleg.matrix.rotate(g_leftUpperLeg, 1,0,0);
  var leftUpperlegCoord = new Matrix4(leftUpperleg.matrix);
  leftUpperleg.render();

  var leftLowerleg = new Cube();
  leftLowerleg.color = [1,0,1,1];
  leftLowerleg.matrix = leftUpperlegCoord;
  leftLowerleg.matrix.translate(0, -1, 0);
  leftLowerleg.matrix.rotate(g_leftLowerLeg, 1,0,0);
  var leftLowerlegCoord = new Matrix4(leftLowerleg.matrix);
  leftLowerleg.render();

  var leftKnee = new Cube();
  leftKnee.color = [1,1,0,1];
  leftKnee.matrix = leftUpperlegCoord;
  leftKnee.matrix.scale(0.9,0.35,1);
  leftKnee.matrix.translate(0.05,2.5,0);
  leftKnee.render();


  var rightUpperleg = new Cube();
  rightUpperleg.color = [1,0,0.5,1];
  rightUpperleg.matrix.translate(0.015, -0.55, 0.05);
  rightUpperleg.matrix.scale(0.22, 0.35, 0.2);
  rightUpperleg.matrix.rotate(g_rightUpperLeg, 1,0,0);
  var rightUpperlegCoord = new Matrix4(rightUpperleg.matrix);
  rightUpperleg.render();

  var rightLowerleg = new Cube();
  rightLowerleg.color = [1,0,0.5,1];
  rightLowerleg.matrix = rightUpperlegCoord;
  rightLowerleg.matrix.translate(0, -1, 0);
  rightLowerleg.matrix.rotate(g_rightLowerLeg, 1,0,0);
  var rightLowerlegCoord = new Matrix4(rightLowerleg.matrix);
  rightLowerleg.render();

  var rightKnee = new Cube();
  rightKnee.color = [1,1,0,1];
  rightKnee.matrix = rightUpperlegCoord;
  rightKnee.matrix.scale(0.9,0.35,1);
  rightKnee.matrix.translate(0.05,2.5,0);
  rightKnee.render();

  var leftFoot = new Cube();
  leftFoot.color = [1,1,1,1];
  leftFoot.matrix = leftLowerlegCoord;
  leftFoot.matrix.scale(1,0.35,1);
  leftFoot.matrix.translate(0,-0.75,0);
  leftFoot.matrix.rotate(g_leftFoot, 1,0,0);
  leftFoot.render();

  var rightFoot = new Cube();
  rightFoot.color = [1,1,1,1];
  rightFoot.matrix = rightLowerlegCoord;
  rightFoot.matrix.scale(1,0.35,1);
  rightFoot.matrix.translate(0,-0.75,0);
  rightFoot.matrix.rotate(g_rightFoot, 1,0,0);
  rightFoot.render();
}


function updateAnimationAngles() {
  if (g_leftarmAnimation) {
    g_leftarm = 10 * Math.sin(g_sec);
  }

  if (g_rightarmAnimation) {
    g_rightarm = -10 * Math.sin(g_sec);
  }

  if (g_lefthandAnimation) {
    g_lefthand = 10 * Math.sin(g_sec);
  }

  if (g_righthandAnimation) {
    g_righthand = 10 * Math.sin(g_sec);
  }

  if (g_leftUpperLegAnimation) {
    g_leftUpperLeg = 10 * Math.sin(g_sec);
  }

  if (g_leftLowerLegAnimation) {
    g_leftLowerLeg = 10 * Math.sin(g_sec);
  }

  if (g_rightUpperLegAnimation) {
    g_rightUpperLeg = -10 * Math.sin(g_sec);
  }

  if (g_rightLowerLegAnimation) {
    g_rightLowerLeg = 10 * Math.sin(g_sec);
  }

  if (g_leftFootAnimation) {
    g_leftFoot = 10 * Math.sin(g_sec);
  }

  if (g_rightFootAnimation) {
    g_rightFoot = 10 * Math.sin(g_sec);
  }
}