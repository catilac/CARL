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
      audio: false,
      video: { facingMode: this.selfie ? "user" : "environment" }
    }).then(stream => {
      this.stream = stream;
      this.video.srcObject = stream;
      this.video.play();
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

function start() {
  button.style.display = 'none';
  let flip = document.createElement('button');
  flip.innerText = 'flip camera'
  document.body.appendChild(flip)
  flip.addEventListener('click', function (e) {
    camera.flip();
  });
}
