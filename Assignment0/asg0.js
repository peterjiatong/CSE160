// DrawRectangle.js
function main(){
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set a blue color
    // ctx.fillRect(120, 10, 150, 150); // Fill a rectangle with the color

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // var vector = new Vector3([2.25, 2.25, 0]);
    // drawVector(vector, 'red');
}

function angleBetween(v1, v2) {
    let dotResult = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    return 180 / Math.PI * Math.acos(dotResult / m1 * m2);
  }
  
  function areaTriangle(v1, v2) {
    return Vector3.cross(v1, v2).magnitude() / 2;
  }

function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    var scaledX = v.elements[0] * 20;
    var scaledY = v.elements[1] * 20;

    var originX = ctx.canvas.width / 2;
    var originY = ctx.canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + scaledX, originY - scaledY);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var vector1x= document.getElementById("vector1x").value;
    var vector1y = document.getElementById("vector1y").value;
    var vector1 = new Vector3([vector1x, vector1y, 0]);
    drawVector(vector1, 'red');

    var vector2x= document.getElementById("vector2x").value;
    var vector2y = document.getElementById("vector2y").value;
    var vector2 = new Vector3([vector2x, vector2y, 0]);
    drawVector(vector2, 'blue');
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var vector1x= document.getElementById("vector1x").value;
    var vector1y = document.getElementById("vector1y").value;
    var vector1 = new Vector3([vector1x, vector1y, 0]);
    drawVector(vector1, 'red');

    var vector2x= document.getElementById("vector2x").value;
    var vector2y = document.getElementById("vector2y").value;
    var vector2 = new Vector3([vector2x, vector2y, 0]);
    drawVector(vector2, 'blue');

    var operation = document.getElementById('operation').value;
    var scalar = document.getElementById('scalar').value;
    let vector3 = vector1;
    let vector4 = vector2;
    if (operation == "add") {
        drawVector(vector3.add(vector4), 'green');
    } else if (operation == "sub"){
        drawVector(vector3.sub(vector4), 'green');
    } else if (operation == "mul"){
        drawVector(vector3.mul(scalar), 'green');
        drawVector(vector4.mul(scalar), 'green');
    } else if (operation == "div"){
        drawVector(vector3.div(scalar), 'green');
        drawVector(vector4.div(scalar), 'green');
    } else if (operation == "mag"){
        console.log("Magnitude v1: ", vector1.magnitude());
        console.log("Magnitude v2: ", vector2.magnitude());
    } else if (operation == "nor"){
        drawVector(vector1.normalize(), 'green');
        drawVector(vector2.normalize(), 'green');
    } else if (operation == "ang"){
        console.log("Angle: ", angleBetween(vector1, vector2));
    } else if (operation == "are"){
        console.log("Area of the triangle: ", areaTriangle(vector1, vector2));
    } 
}