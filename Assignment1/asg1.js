// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_segment = 3;
let g_mode = 0;
let g_shapeList = [];

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function addActionsForHTMLUI() {
    document.getElementById("clear").onclick = function() { g_shapeList = []; renderAllShapes();}

    document.getElementById("green").onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; updateHTML();};
    document.getElementById("red").onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; updateHTML();};
    document.getElementById("blue").onclick = function() { g_selectedColor = [0.0, 0.0, 1.0, 1.0]; updateHTML();};

    document.getElementById('point').onclick = function () { g_mode = 0; updateHTML(); };
    document.getElementById('triangle').onclick = function () { g_mode = 1; updateHTML(); };
    document.getElementById('circle').onclick = function () { g_mode = 2; updateHTML(); };

    document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value / 100; updateHTML();});
    document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value / 100; updateHTML();});
    document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value / 100; updateHTML();});

    document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize= this.value; updateHTML();});
    document.getElementById('segmentSlide').addEventListener('mouseup', function () {g_segment = this.value; updateHTML();});
    document.getElementById('heart').onclick = function () {drawHeart();};
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  updateHTML();
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) {if (ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return ([x,y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
}

function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_mode == 0) {
    point = new Point();
  } else if (g_mode == 1) {
    point = new Triangle();
  } else if (g_mode == 2) {
    point = new Circle();
    point.segments = g_segment;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);
  renderAllShapes();

}

function updateHTML() {
    document.getElementById("info1").innerHTML = "R: " + g_selectedColor[0] + ", G: " + g_selectedColor[1] + ", B: " +  g_selectedColor[2];
    document.getElementById("info2").innerHTML = "Size: " + g_selectedSize + ", Segment: " + g_segment;
    let shape = "N/A";
    if (g_mode == 0) shape = "Point";
    if (g_mode == 1) shape = "Triangle";
    if (g_mode == 2) shape = "Circle";
    if (g_mode == 3) shape = "N/A";
    document.getElementById("info3").innerHTML = "Current Shape: " + shape;
}

let HeartVec = [[0.0, 0.4, 0.0, 0.0, 0.4, 0.0],
   [0.0, 0.4, 0.0, 0.0, -0.4, 0.0,],
   [-0.4, 0.4, -0.4, 0.0, 0.0, 0.4],
   [0.4, 0.4, 0.4, 0.0, 0.0, 0.4],
   [0.4, 0.4, 0.4, 0.8, 0.0, 0.4],
   [0.4, 0.4, 0.4, 0.8, 0.8, 0.4],
   [0.4, 0.4, 0.4, 0.0, 0.8, 0.4],
   [0.4, 0.0, 0.8, 0.0, 0.8, 0.4],
   [0.4, 0.0, 0.8, 0.0, 0.4, -0.4],
   [0.4, 0.0, 0.0, -0.4, 0.4, -0.4],
   [0.0, 0.0, 0.0, -0.4, 0.4, 0.0],
   [0.0, 0.0, 0.0, -0.4, -0.4, 0.0],
   [-0.4, -0.4, 0.0, -0.4, -0.4, 0.0],
   [0.4, -0.4, 0.0, -0.4, 0.0, -0.8],
   [-0.4, -0.4, 0.0, -0.4, 0.0, -0.8],
   [-0.8, 0.0, -0.8, 0.4, -0.4, 0.0],
   [-0.8, 0.0, -0.4, -0.4, -0.4, 0.0],
   [-0.4, 0.4, -0.8, 0.4, -0.4, 0.0],
   [-0.4, 0.4, 0, 0.4, -0.4, 0.8],
   [-0.4, 0.4, -0.8, 0.4, -0.4, 0.8],
  ];

function drawTri(vertices) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

function drawHeart(){
  var len = HeartVec.length;
  for(var i = 0; i < len; i++) {
    drawTri(HeartVec[i]);
  }
}