class Cube {
    constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 0.0, 1.0];
      this.matrix = new Matrix4();
    }
  
    render() {
      var rgba = this.color;
  

  
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
      // front 
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      drawTriangle3D([0,0,0,1,1,0,1,0,0]);
      drawTriangle3D([0,0,0,0,1,0,1,1,0]);

      // back
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      drawTriangle3D([1,1,1,0,0,1,0,1,1]);
      drawTriangle3D([1,1,1,1,0,1,0,0,1]);

      // top
      gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      drawTriangle3D([0,1,0,0,1,1,1,1,1]);
      drawTriangle3D([0,1,0,1,1,1,1,1,0]);

      // bottom
      gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
      drawTriangle3D([1,0,1,1,0,0,0,0,0]);
      drawTriangle3D([1,0,1,0,0,0,0,0,1]);

      // left
      gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
      drawTriangle3D([0,0,0,0,0,1,0,1,1]);
      drawTriangle3D([0,0,0,0,1,0,0,1,1]);

      // right
      gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
      drawTriangle3D([1,1,1,1,1,0,1,0,0]);
      drawTriangle3D([1,1,1,1,0,1,1,0,0]);
    }
  }