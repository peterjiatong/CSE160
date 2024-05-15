// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
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
  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
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

let g_globalAngleX = 0;
let g_globalAngleY = 0;

let g_prevMouseX = null;
let g_prevMouseY = null;

let g_globalFOV = 50;
let moveCameraY = false;

function generateMaze(size) {
  let maze = [];
  for (let i = 0; i < size; i++) {
    maze[i] = [];
    for (let j = 0; j < size; j++) {
      maze[i][j] = 1; // Initialize all cells as walls
    }
  }

  // Directions: up, right, down, left
  const directions = [
    [-2, 0],
    [0, 2],
    [2, 0],
    [0, -2]
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function isValid(x, y) {
    return x >= 1 && x < size - 1 && y >= 1 && y < size - 1;
  }

  function carvePath(x, y) {
    shuffle(directions);
    for (let [dx, dy] of directions) {
      let nx = x + dx;
      let ny = y + dy;
      let mx1 = x + dx / 2;
      let my1 = y + dy / 2;
      if (isValid(nx, ny) && maze[nx][ny] === 1) {
        maze[nx][ny] = 0;
        maze[mx1][my1] = 0;
        carvePath(nx, ny);
      }
    }
  }

  // Start at position (1, 1)
  maze[1][1] = 0;
  carvePath(1, 1);

  // Ensure start and end points are clear
  maze[1][0] = 0; // Entry point

  // Clear the spawn area
  for (let i = 3; i <= 5; i++) {
    for (let j = 5; j <= 7; j++) {
      maze[i][j] = 0;
    }
  }

  maze[1][0] = 1;
  // Clear the exit area (last row, columns 10 to 14)
  for (let j = size - 3; j < size - 1; j++) {
    maze[size - 2][j] = 0;
    maze[size - 1][j] = 0; // Ensure exit is 2 cells wide
  }

  return maze;
}

let g_map = generateMaze(16);


function drawMap(){
  var wall = new Cube();

  for(var x = 0; x < g_map.length; x++){
    for(var y = 0; y < g_map[0].length; y++){
      if(g_map[x][y] == 1){
        wall = new Cube();  // Create a new Cube for each wall

        if (x === 0 || x === 15 || y === 0 || y === 15) {
          wall.textureNum = 1;  // Use textureNum 1 for outer walls
        } else {
          wall.textureNum = 0;  // Use textureNum 0 for inner walls
        }

        // Apply the transformations to position the wall
        wall.matrix.translate(0, -.75, 0);
        wall.matrix.translate(0, .25, 0);
        wall.matrix.translate(x - 4, -.25, y - 4);

        // Render the wall
        wall.renderFast();
      }
    }
  }
}


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

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHTMLUI() {
    document.getElementById('FOVXSlide').addEventListener('mousemove', function () {g_globalFOV = this.value;});
    document.getElementById('YOn').onclick = function() {moveCameraY = true};
    document.getElementById('YOff').onclick = function() {moveCameraY = false};
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

function tick() {
  renderScene();
  requestAnimationFrame(tick);
}

function renderScene() {
  var projMat = new Matrix4();
  projMat.setPerspective(g_globalFOV, 1 * canvas.width / canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY,1,0,0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  var ground = new Cube();
  ground.color = [0,1,0,1];
  ground.textureNum = -2;
  ground.matrix.translate(0,-.75,0.0);
  ground.matrix.scale(100,0,100);
  ground.matrix.translate(-.5,0,-0.5);
  ground.renderFast();

  var sky = new Cube();
  sky.textureNum = 3;
  sky.matrix.scale(100,30,100);
  sky.matrix.translate(-.5,-0.10,-0.5);
  sky.renderFast();
}
