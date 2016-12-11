
let THREE = require('three');
import loadModel from './model-cache';
import createGrid from './grid';

let DEFAULT_MODE = '2';

export default class Cage {
  constructor ({ mode = DEFAULT_MODE } = {}) {
    this.mode = mode;
    this.state = {
      rps: -0.2
    };
  }

  update (delta) {
    if (this.mesh) {
      this.mesh.rotation.y += this.state.rps * (delta / 1000);
    }
  }

  load (callback) {
    let { mode } = this;

    switch (mode) {
      case '1':
      case '2':
      case '3': {
        let path = `cage${mode}`;
        loadModel(path, ({ geometry, texture }) => {
          geometry.center();

          let material = this.material = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            metalness: 0.3,
            map: texture
          });
          material.side = THREE.DoubleSide;

          let mesh = this.mesh = new THREE.Mesh(geometry, material);
          mesh.scale.set(10, 10, 10);
          mesh.receiveShadow = true;
          callback(mesh);
        });
      } break;

      default: {
        setTimeout(() => {
          let mesh = this.mesh = createGrid({ length: 3.33, gridLength: 7 });
          callback(mesh);
        }, 1);
      } break;
    }
  }
}
