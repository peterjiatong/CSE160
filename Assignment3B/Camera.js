class Camera {
    constructor() {
        this.fov=60.0;
        this.eye = new Vector3([0.5,0,3.5]);
        this.at = new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);
        this.speed = 1;
    }

    moveForward() {
        let v = new Vector3([0,0,0]);
        v.add(this.at);
        v.sub(this.eye);
        v.normalize();
        v.mul(this.speed);
        this.eye.add(v);
        this.at.add(v);
    }

    moveBackward() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        v.normalize();
        v.mul(this.speed);
        this.eye.sub(v);
        this.at.sub(v);
    }

    moveLeft() {
        let v = new Vector3([0,0,0]);
        v.set(this.eye);
        v.sub(this.at);
        let s = Vector3.cross(v, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let s = Vector3.cross(v, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    panLeft() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let rotationMatrix=new Matrix4()
        rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let v_prime = rotationMatrix.multiplyVector3(v);
        this.at.set(this.eye);
        this.at.add(v_prime);
    }

    panRight() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let rotationMatrix=new Matrix4()
        rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let v_prime = rotationMatrix.multiplyVector3(v);
        this.at.set(this.eye);
        this.at.add(v_prime);
    }


    panLeft90() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let rotationMatrix=new Matrix4()
        rotationMatrix.setRotate(90, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let v_prime = rotationMatrix.multiplyVector3(v);
        this.at.set(this.eye);
        this.at.add(v_prime);
    }

    panRight90() {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let rotationMatrix=new Matrix4()
        rotationMatrix.setRotate(-90, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let v_prime = rotationMatrix.multiplyVector3(v);
        this.at.set(this.eye);
        this.at.add(v_prime);
    }

    panX(x) {
        let v = new Vector3([0,0,0]);
        v.set(this.at);
        v.sub(this.eye);
        let rotationMatrix=new Matrix4()
        rotationMatrix.setRotate(x, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let v_prime = rotationMatrix.multiplyVector3(v);
        this.at.set(this.eye);
        this.at.add(v_prime);
    }
}