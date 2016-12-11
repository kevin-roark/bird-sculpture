
let THREE = require('three');
import CameraTexture from './camera-texture';

export default class Mirrors {
  constructor ({ renderer, scene, size = 6 }) {
    this.renderer = renderer;
    this.scene = scene;
    this.size = size;

    this.state = {
      active: false
    };

    this.container = new THREE.Object3D();
    this.cameraTextures = [];
    this.mirrors = [];

    for (let i = 0; i < 2; i++) {
      let cameraTexture = new CameraTexture({ renderer, scene });
      this.cameraTextures.push(cameraTexture);

      let mirror = this._makeMirror(cameraTexture);

      let light = new THREE.PointLight(0xffffff, 1, 20, 1);
      mirror.add(light);

      switch (i) {
        case 0:
          mirror.rotation.y = Math.PI / 2;
          mirror.position.set(-size, 0, 0);
          cameraTexture.cameraParent.position.set(-size + 0.1, 0, 0);
          cameraTexture.cameraParent.rotation.y = -Math.PI / 2;
          light.position.set(-5, 2, 0);
          break;
        case 1:
          mirror.rotation.y = -Math.PI / 2;
          mirror.position.set(size, 0, 0);
          cameraTexture.cameraParent.position.set(size - 0.1, 0, 0);
          cameraTexture.cameraParent.rotation.y = Math.PI / 2;
          light.position.set(5, 2, 0);
          break;
      }

      this.mirrors.push(mirror);
      this.container.add(mirror);
    }

    this.length = this.mirrors.length;
  }

  getMirror (i) {
    return this.mirrors[i];
  }

  setMirrorTexture (i, texture = null) {
    let mirror = this.getMirror(i);
    if (!texture) {
      texture = mirror._cameraTexture.texture;
    }

    mirror.material.map = texture;
  }

  activate () {
    this.state.active = true;
    this.scene.add(this.container);
  }

  deactivate () {
    this.state.active = false;
    this.scene.remove(this.container);
  }

  update (delta) {
    if (!this.state.active) return;

    for (let i = 0; i < this.cameraTextures.length; i++) {
      this.cameraTextures[i].update(delta);
    }
  }

  _makeMirror (cameraTexture) {
    let geometry = new THREE.BoxBufferGeometry(8, 6, 0.1);
    geometry.center();

    let material = new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0.05,
      map: cameraTexture.texture
    });
    material.side = THREE.DoubleSide;

    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh._cameraTexture = cameraTexture;

    return mesh;
  }
}
