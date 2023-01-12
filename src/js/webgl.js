import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import * as dat from "lil-gui";
import img1 from "../images/1.jpg";
import img2 from "../images/2.jpg";
import img3 from "../images/3.jpg";
import img4 from "../images/4.jpg";
import img5 from "../images/5.jpg";

const gallery = [
  new THREE.TextureLoader().load(img1),
  new THREE.TextureLoader().load(img2),
  new THREE.TextureLoader().load(img3),
  new THREE.TextureLoader().load(img4),
  new THREE.TextureLoader().load(img5),
];

export class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.clock = new THREE.Clock();
    this.gallery = gallery;
    this.container.appendChild(this.renderer.domElement);

    this.time = 0;
    this.isPlaying = true;
    // this.settings();
    this.addObjects();
    this.addCamera();
    this.resize();
    this.render();
    this.setupResize();
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
    this.renderer.setSize(this.width, this.height);
    if (this.width / this.height > 1) {
      this.plane.scale.x = this.plane.scale.y = 1 * (this.width / this.height);
      this.plane.scale.x = this.width / this.height;
    }

    this.material.uniforms.uXAspect.value = this.width / this.height;
    this.material.uniforms.uYAspect.value = this.height / this.width;

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
        uYAspect: { value: this.height / this.width }, //vartexにアスペクト比を渡し、background-cover同様の表示にする
        uXAspect: { value: this.width / this.height }, //vartexにアスペクト比を渡し、background-cover同様の表示にする
        pixels: {
          value: new THREE.Vector2(this.width, this.height),
        },
        accel: {
          value: new THREE.Vector2(0.5, 2),
        },
        progress: {
          value: 0,
        },
        texture1: {
          value: new THREE.TextureLoader().load(img1),
        },
        texture2: {
          value: new THREE.TextureLoader().load(img2),
        },
      },
      // wireframe: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  addCamera() {
    const fov = 70;
    const fovRad = (fov / 2) * (Math.PI / 180);
    this.dist = this.height / 2 / Math.tan(fovRad); //画面いっぱいにオブジェクトを映す
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      1000
    );
    this.camera.position.set(0, 0, this.dist);
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
