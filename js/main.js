
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import Sculpture from './sculpture';

if (isMobile.any) {
  let mobileWarning = document.createElement('div');
  mobileWarning.className = 'mobile-warning';
  document.body.appendChild(mobileWarning);
  setTimeout(go, 1000);
} else {
  go();
}

function go () {
  window.THREE = THREE;

  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xffffff);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let scene = new THREE.Scene();
  window.scene = scene;

  let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
  camera.position.z = 10;
  scene.add(camera);

  let container = new THREE.Object3D();
  scene.add(container);

  document.body.appendChild(renderer.domElement);

  let dom = {
    info: document.querySelector('.info')
  };

  let state = {
    startTime: null,
    lastTime: null,
    sculture: null
  };

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
    console.log('redy');
  });
  renderer.render(scene, camera);
  start();

  function resize () {
    let w = window.innerWidth;
    let h = window.innerHeight;

    renderer.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function start () {
    update();
  }

  function update (time) {
    if (!state.startTime) state.startTime = time;
    let delta = time - (state.lastTime || time);

    TWEEN.update(time);

    if (state.sculpture) state.sculpture.update(delta);

    renderer.render(scene, camera);
    state.lastTime = time;

    window.requestAnimationFrame(update);
  }

  function createScene (callback) {
    let remaining = 0;

    makeLights();
    load(makeSculpture);

    function load (fn) {
      remaining += 1;
      fn(() => {
        remaining -= 1;
        if (remaining === 0 && callback) {
          callback();
          callback = null;
        }
      });
    }
  }

  function makeLights () {
    let ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
  }

  function makeSculpture (cb) {
    let sculpture = new Sculpture();
    sculpture.load(() => {
      state.sculpture = sculpture;
      scene.add(sculpture.container);

      if (cb) cb();
    });
  }
}
