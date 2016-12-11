
let THREE = require('three');
import loadModel from './model-cache';

export default class Freedom {
  constructor () {
    this.state = {
      rps: 0.5
    };
  }

  update (delta) {
    if (this.mesh) {
      this.mesh.rotation.y += this.state.rps * (delta / 1000);
    }
  }

  load (callback) {
    let mesh = this.mesh = new THREE.Object3D();
    mesh.scale.set(10, 10, 10);

    loadModel('freedom', ({ geometry, texture }) => {
      this.texture = texture;

      geometry.center();

      let material = this.material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.3,
        map: texture
      });
      material.side = THREE.DoubleSide;

      let book = this.book = new THREE.Mesh(geometry, material);
      book.rotation.x = -0.24;
      book.rotation.z = -Math.PI / 2;
      book.receiveShadow = true;
      mesh.add(book);

      if (callback) callback(mesh);
    });
  }

  setTexture (texture = this.texture) {
    this.material.map = texture;
  }
}
