// this script is from cut-ruby.glitch.me

// so good

if (window.location.protocol !== 'https:') {
  window.location = 'https://' + window.location.hostname;
}

class Camera {
  constructor () {
    this.video = document.createElement('video');
    this.video.setAttribute('muted', true);
    this.video.setAttribute('playsinline', true);
    
    this.selfie = false;
  }
  _startCapture() {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: this.selfie ? "user" : "environment" }
    }).then(stream => {
      
      alert("HI");
      
      this.stream = stream;
      this.video.srcObject = stream;
      this.video.play();
      
      const audioTracks = stream.getAudioTracks();
      this.audio.srcObject = stream
      
    });
  }
  init () {
    return this._startCapture();
  }
  flip () {
    this.selfie = !this.selfie;
    this._startCapture();
  }
}

let button = document.querySelector("button");
let camera = new Camera();
document.querySelector('.vidholder').appendChild(camera.video);

button.addEventListener('click', function (e) {
  camera.init().then(start).catch(e => console.error(e));
});

(function () {
  camera.init().then(start).catch(e => console.error(e));
})();

function start() {

}
