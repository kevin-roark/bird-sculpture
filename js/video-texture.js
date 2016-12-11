
let THREE = window.THREE || require('three');

export default class VideoTexture {
  constructor (options = {}) {
    let video = options.video;
    if (typeof video === 'string') {
      let url = video;
      video = document.createElement('video');
      video.preload = true;
      video.autoplay = false;
      video.muted = true;
      video.src = url;
    }

    this.video = video;
    video.addEventListener('canplaythrough', () => {
      if (options.onLoad) options.onLoad();
    }, false);
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      setTimeout(() => {
        if (this.playing) this.play();
      }, 200);
    }, false);

    this.videoCanvas = document.createElement('canvas');
    this.videoCanvas.width = options.width || 320;
    this.videoCanvas.height = options.height || 240;

    this.videoContext = this.videoCanvas.getContext('2d');
    this.videoContext.fillStyle = options.backgroundColor || '#000'; // background color if no video present
    this.videoContext.fillRect(0, 0, this.videoCanvas.width, this.videoCanvas.height);

    this.texture = new THREE.Texture(this.videoCanvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.format = THREE.RGBFormat;
    this.texture.generateMipmaps = false;
  }

  play () {
    this.playing = true;
    this.video.play();
  }

  pause () {
    this.playing = false;
    this.video.pause();
  }

  update () {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.videoContext.drawImage(this.video, 0, 0);

      if (this.texture) {
        this.texture.needsUpdate = true;
      }
    }
  }
}
