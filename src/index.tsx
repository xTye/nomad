import "./index.css";
import * as THREE from "three";
import { render } from "solid-js/web";
import { Camera, Renderer, Scene, Vector3 } from "three";

function init(): any {
  var scene = new THREE.Scene();

  var box = getBox(1, 1, 1);
  // box.position.y = box.geometry.parameters.height / 2;

  var plane = getPlane(4);
  plane.rotation.x = Math.PI / 2;
  plane.name = "plane-1";

  scene.add(plane);
  plane.add(box);

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(2, 1, 5);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer(); // too streamlined
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("webgl")?.appendChild(renderer.domElement);
  update(renderer, scene, camera);

  return scene;
}

function getBox(w: number, h: number, d: number) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getPlane(size: number) {
  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshBasicMaterial({
    color: 0xfacade,
    side: THREE.DoubleSide,
  });
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function update(renderer: Renderer, scene: Scene, camera: Camera) {
  renderer.render(scene, camera);

  // apply animation to object. implicitly adds to children.
  var plane = scene.getObjectByName("plane-1");
  if (plane) {
    plane!.rotation.y += 0.001;
    plane!.rotation.z += 0.005;
  }

  // // applies callback function to object & children
  // scene.traverse((child) => {
  //   child.scale.x += 0.001;
  // });

  requestAnimationFrame(function () {
    update(renderer, scene, camera);
  });
}

var scene = init();
var test = 1;
