
let THREE = require('three');
import loadModel from './model-cache';
import createGrid from './grid';

let DEFAULT_MODE = 'none';

export default class Cage {
  constructor ({ mode = DEFAULT_MODE } = {}) {
    this.mode = mode;
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
          callback(mesh);
        });
      } break;

      default: {
        setTimeout(() => {
          let mesh = this.mesh = createGrid({ length: 0.33, gridLength: 7 });
          console.log(this.mesh);
          callback(mesh);
        }, 1);
      } break;
    }
  }
}
