
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import Freedom from './freedom';
import Cage from './cage';
import Mirrors from './mirrors';
import VideoTexture from './video-texture';

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
  renderer.setClearColor(0x000000);
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
    freedom: null,
    cage: null,
    mirrors: null,
    bookIsBird: false
  };

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
    console.log('redy');
    setTimeout(mushTextures, 2000);
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

    if (state.freedom) state.freedom.update(delta);
    if (state.cage) state.cage.update(delta);
    if (state.mirrors) state.mirrors.update(delta);
    if (state.videoTexture) state.videoTexture.update(delta);

    renderer.render(scene, camera);
    state.lastTime = time;

    window.requestAnimationFrame(update);
  }

  function mushTextures () {
    let { freedom, mirrors, videoTexture } = state;

    state.bookIsBird = !state.bookIsBird;
    if (state.bookIsBird) {
      freedom.setTexture(videoTexture.texture);
      for (let i = 0; i < mirrors.length; i++) {
        if (Math.random() < 0.5) {
          mirrors.setMirrorTexture(i, videoTexture.texture);
        }
      }
    } else {
      state.freedom.setTexture();
      for (let i = 0; i < mirrors.length; i++) {
        mirrors.setMirrorTexture(i);
      }
    }

    let time = Math.random() * 4000 + 200;
    setTimeout(mushTextures, time);
  }

  function createScene (callback) {
    let remaining = 0;
    let hasLoaded = false;

    makeLights();
    makeGround();
    makeMirrors();
    makeVideo();

    load(makeCage);
    load(makeFreedom);

    function load (fn) {
      remaining += 1;
      fn(() => {
        remaining -= 1;
        if (remaining === 0 && !hasLoaded) {
          loaded();
          hasLoaded = true;
        }
      });
    }

    function loaded () {
      state.cage.mesh.position.y = 0.5;

      scene.add(state.freedom.mesh);
      scene.add(state.cage.mesh);

      state.videoTexture.play();

      if (callback) callback();
    }
  }

  function makeLights () {
    let ambient = new THREE.AmbientLight(0x222222, 0.1);
    scene.add(ambient);

    let lights = [
      new THREE.PointLight(0xff0000, 1, 30, 4),
      new THREE.SpotLight(0xffffff, 1.5, 20, 0.3),
      new THREE.PointLight(0x0000ff, 1, 30, 4)
    ];

    lights[0].position.set(-0.5, -0.5, 3);
    lights[1].position.set(0, -6, 9);
    lights[2].position.set(0.5, -0.5, -3);

    lights.forEach(light => {
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 100;
      light.shadow.camera.fov = 30;

      scene.add(light);
    });
  }

  function makeGround () {
    let geometry = new THREE.BoxBufferGeometry(1000, 1, 1000);
    let material = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.05,
      color: 0xffffff
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -10;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function makeMirrors () {
    state.mirrors = new Mirrors({ renderer, scene });
    state.mirrors.activate();
  }

  function makeVideo () {
    state.videoTexture = new VideoTexture({
      video: 'video/v1_projection.mp4',
      width: 720, height: 480
    });
    state.videoTexture.video.playbackRate = 0.75;
  }

  function makeFreedom (cb) {
    let freedom = new Freedom();
    freedom.load(() => {
      state.freedom = freedom;
      if (cb) cb();
    });
  }

  function makeCage (cb) {
    let cage = new Cage();
    cage.load(() => {
      state.cage = cage;
      if (cb) cb();
    });
  }
}
