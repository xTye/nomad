import "./index.css";
import * as THREE from "three";
import { render } from "solid-js/web";
import { Camera, Renderer, Scene, Vector3 } from "three";

function init(): any {
  var scene = new THREE.Scene();
  var enableFog = false;
  if (enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.2);
  }

  // box instantiation
  var box = getBox(1, 1, 1);
  box.position.y = box.geometry.parameters.height / 2;

  // plane instantion
  var plane = getPlane(20);
  plane.rotation.x = Math.PI / 2;
  plane.name = "plane-1";

  // pointLight instantion
  var pointLight = getPointLight(1);
  pointLight.position.y = 1.5;
  pointLight.position.x = 2;
  pointLight.position.z = 1;
  var sphere = getSphere(0.05);

  // scene synthesis
  scene.add(plane);
  scene.add(box);
  scene.add(pointLight);
  pointLight.add(sphere);

  // camera setup
  var camera = new THREE.PerspectiveCamera(
    45, // fov
    window.innerWidth / window.innerHeight, // aspect
    1, // near
    1000 // far
  );
  camera.position.set(2, 3, 7.5);
  camera.lookAt(0, 0, 0);

  // rendering: instantiation, clear color, attach to html, call update to make dynamic changes
  var renderer = new THREE.WebGLRenderer(); // too streamlined
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.getElementById("webgl")?.appendChild(renderer.domElement);
  update(renderer, scene, camera);

  return scene;
}

// geometry helper functions: box, sphere, plane
function getBox(w: number, h: number, d: number) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getSphere(r: number) {
  var geometry = new THREE.SphereGeometry(r, 24, 24); // 24 = segment value "smoothness"
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getPlane(size: number) {
  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshPhongMaterial({
    color: 0xfacade,
    side: THREE.DoubleSide,
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getPointLight(intensity: number) {
  var light = new THREE.PointLight(0xffffff, intensity);
  return light;
}

function update(renderer: Renderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);
  // });

  requestAnimationFrame(function () {
    update(renderer, scene, camera);
  });
}

var scene = init();
var test = 1;
