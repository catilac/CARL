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
      // this.audio.srcObject = stream
      
      source = audioCtx.createMediaStreamSource(stream);
      
      var analyser = context.createAnalyser();
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = FFT_SIZE;  
      
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);
      
      
      analyser.getByteTimeDomainData(dataArray);
     // var node = context.createScriptProcessor(FFT_SIZE*2, 1, 1);     
      
//       node.onaudioprocess = function () {       // bitcount returns array which is half the FFT_SIZE
//         self.spectrum = new Uint8Array(analyser.frequencyBinCount);       // getByteFrequencyData returns amplitude for each bin
//         analyser.getByteFrequencyData(self.spectrum);
//              // getByteTimeDomainData gets volumes over the sample time
//              // analyser.getByteTimeDomainData(self.spectrum);
//         vol = getRMS(self.spectrum);

//       }
      
//       console.log("this is vol: ", vol);
//       var input = context.createMediaStreamSource(stream);
//       input.connect(analyser);
//       analyser.connect(node);
//       node.connect(context.destination);
//     });
  }
  init () {
    return this._startCapture();
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
