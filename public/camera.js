// this script is from cut-ruby.glitch.me

// so good
var FFT_SIZE = 512;
var vol;

if (window.location.protocol !== 'https:') {
  window.location = 'https://' + window.location.hostname;
}

// from here https://hackernoon.com/creative-coding-using-the-microphone-to-make-sound-reactive-art-part1-164fd3d972f3
// A more accurate way to get overall volume
function getRMS (spectrum) {
  var rms = 0;
  for (var i = 0; i < spectrum.length; i++) {
    rms += spectrum[i] * spectrum[i];
  }
  rms /= spectrum.length;
  rms = Math.sqrt(rms);
  return rms;
}

class Camera {
  constructor () {
    this.video = document.createElement('video');
    this.video.setAttribute('muted', true);
    this.video.setAttribute('playsinline', true);
    
    this.selfie = false;
    
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  _startCapture() {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: this.selfie ? "user" : "environment" }
    }).then(stream => {
      this.stream = stream;
      this.video.srcObject = stream;
      this.video.play();
      
      const audioTracks = stream.getAudioTracks();
      
      var source = this.audioCtx.createMediaStreamSource(stream);
      
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.smoothingTimeConstant = 0.2;
      this.analyser.fftSize = FFT_SIZE;      
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

console.log()

button.addEventListener('click', function (e) {
  camera.init().then(start).catch(e => console.error(e));
});

(function () {
  camera.init().then(start).catch(e => console.error(e));
})();

function start() {

}
