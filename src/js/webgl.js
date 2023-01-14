import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import * as dat from "lil-gui";
import img1 from "../images/1.jpg";
// import img2 from "../images/2.jpg";
// import img3 from "../images/3.jpg";
// import img4 from "../images/4.jpg";
// import img5 from "../images/5.jpg";
// const images = [...document.querySelectorAll(".gallery_image")];
const images = [img1];
// const gallery = images.map((img) => {
//   return new THREE.TextureLoader().load(img.src);
// });
export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    this.imageXAspect = images[0].naturalWidth / images[0].naturalHeight;
    this.imageYAspect = images[0].naturalHeight / images[0].naturalWidth;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // this.gallery = gallery;
    this.gallery = null;

    this.container.appendChild(this.renderer.domElement);
    
    this.clock = new THREE.Clock();
    this.time = 0;
    this.isPlaying = true;
    
    // this.settings();
    this.addObjects();
    this.addCamera();
    this.resize();
    this.setupResize();
    // this.render();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    this.imageXAspect = images[0].naturalWidth / images[0].naturalHeight;
    this.imageYAspect = images[0].naturalHeight / images[0].naturalWidth;
    this.material.uniforms.uXAspect.value = this.Xaspect / this.imageAspect;
    this.material.uniforms.uYAspect.value = this.Yaspect / this.imageYAspect;
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives:",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: {
          value: 0,
        },
        resolution: {
          value: new THREE.Vector4(),
        },
        uXAspect: {
          value: this.Xaspect / this.imageAspect,
        },
        uYAspect: {
          value: this.Yaspect / this.imageYAspect,
        },
        pixels: {
          value: new THREE.Vector2(this.width, this.height),
        },
        accel: {
          value: new THREE.Vector2(1, 1),
        },
        progress: {
          value: 0,
        },
        texture1: {
          // value: new THREE.TextureLoader().load(images[0].src),
          value: null,
        },
        texture2: {
          // value: new THREE.TextureLoader().load(images[1].src),
          value: null,
        },
      },
      // wireframe: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  addCamera() {
    let frustumSize = 2;
    this.camera = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );
    this.camera.position.set(0, 0, 2);
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) {
      return;
    }
    const elapsedTime = this.clock.getElapsedTime();
    this.time = elapsedTime;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
