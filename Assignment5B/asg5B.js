import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	RectAreaLightUniformsLib.init();

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

	{

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}


    const cubes = []; // array to store cubes
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/wall.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    // Helper function to create a textured cube
    function createTexturedCube(inputx, inputz) {
        const boxWidth = 3;
        const boxHeight = 3;
        const boxDepth = 3;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = inputx;
        cube.position.y = 4;
        cube.position.z = inputz;
        scene.add(cube);
        cubes.push(cube); // add cube to our list of cubes to rotate
    }

	
	createTexturedCube(15, -6);
	createTexturedCube(15, -11);
	createTexturedCube(15, -16);
	createTexturedCube(9, -6);
	createTexturedCube(9, -11);
	createTexturedCube(9, -16);
    createTexturedCube(4, -6);
	createTexturedCube(4, -11);
	createTexturedCube(4, -16);
	createTexturedCube(-1, -6);
	createTexturedCube(-1, -11);
	createTexturedCube(-1, -16);
	createTexturedCube(-6, -6);
	createTexturedCube(-6, -11);
	createTexturedCube(-6, -16);
	createTexturedCube(-11, -6);
	createTexturedCube(-11, -11);
	createTexturedCube(-11, -16);
	createTexturedCube(-16, -6);
	createTexturedCube(-16, -11);
	createTexturedCube(-16, -16);

    const objLoader = new OBJLoader();
    objLoader.load('https://threejs.org/manual/examples/resources/models/windmill_2/windmill.obj', (obj) => {
        // Called when the resource is loaded
        obj.position.set(0, 0, 3); // Set position as needed
        obj.scale.set(0.005, 0.005, 0.005); // Set scale as needed
        scene.add(obj); // Add it to the scene

        // Optional: Adjust the camera to look at the object
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = Math.max(fitHeightDistance, fitWidthDistance);
        const direction = (new THREE.Vector3()).subVectors(camera.position, center).normalize();

    });

	{

		const sphereRadius = 3;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshStandardMaterial( { color: '#CA8' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
		scene.add( mesh );

	}

	class ColorGUIHelper {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}

	}

	class DegRadHelper {

		constructor( obj, prop ) {

			this.obj = obj;
			this.prop = prop;

		}
		get value() {

			return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );

		}
		set value( v ) {

			this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

		}

	}

	function makeXYZGUI( gui, vector3, name, onChangeFn ) {

		const folder = gui.addFolder( name );
		folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
		folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
		folder.open();

	}

	{

		const color = 0xFFFFFF;
		const intensity = 5;
		const width = 12;
		const height = 4;
		const light = new THREE.RectAreaLight( color, intensity, width, height );
		light.position.set( 0, 10, 0 );
		light.rotation.x = THREE.MathUtils.degToRad( - 90 );
		scene.add( light );

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 7.5);
		scene.add(directionalLight);

		const pointLight = new THREE.PointLight(0xffffff, 1, 50);
		pointLight.position.set(10, 10, 10);
		scene.add(pointLight);
				
		const sky_loader = new THREE.CubeTextureLoader();
		const sky_texture = sky_loader.load([
			'sky.jpg', // right
			'sky.jpg', // left
			'sky.jpg', // top
			'sky.jpg', // bottom
			'sky.jpg', // front
			'sky.jpg'  // back
		]);
		
		scene.background = sky_texture;
	
		const geometry = new THREE.BoxGeometry(100, 100, 100);
		const material = new THREE.MeshBasicMaterial({ 
			color: 0xffffff, 
			envMap: sky_texture, 
		});
		const sky = new THREE.Mesh(geometry, material);
		scene.add(sky);
		

		const helper = new RectAreaLightHelper( light );
		light.add( helper );

		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 10, 0.01 );
		gui.add( light, 'width', 0, 20 );
		gui.add( light, 'height', 0, 20 );
		gui.add( new DegRadHelper( light.rotation, 'x' ), 'value', - 180, 180 ).name( 'x rotation' );
		gui.add( new DegRadHelper( light.rotation, 'y' ), 'value', - 180, 180 ).name( 'y rotation' );
		gui.add( new DegRadHelper( light.rotation, 'z' ), 'value', - 180, 180 ).name( 'z rotation' );

		makeXYZGUI( gui, light.position, 'position' );

	}

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height; // Update the camera's aspect ratio
            camera.updateProjectionMatrix();
        }
        return needResize;
    }

    // The render loop
    function render(time) {
        time *= 0.001; // Convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
            // Update camera aspect ratio and renderer size if needed
        }

        // Rotate each cube
        cubes.forEach((cube, ndx) => {
            const speed = 0.2 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
		

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render); // Start the render loop

}

main();
