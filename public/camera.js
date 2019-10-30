// this script is from cut-ruby.glitch.me

// so good
    function aoskDeviceMotion() {
      document.querySelector('#overlay').addEventListener(
        'click', _askDeviceMotion, false);
      }

    function _askDeviceMotion() {
      askDeviceMotion()
    }

function askDeviceMotion(callback) {
  try {
      if (
        DeviceMotionEvent &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ){
        DeviceMotionEvent.requestPermission().then(
          response => {
            if (response === 'granted') {
              grantedDeviceMotion(callback)
            }else{
              alert('Device Motion permission not granted.')

              console.log('Device Motion permission not granted.')
            }
          })
          .catch(console.error )
      } else {
        grantedDeviceMotion(callback)
      }
    } catch (oops) {
      alert('Your device and application combination do not support device motion events.')
      console.log('Your device and application combination do not support device motion events.')
    }
  }

function grantedDeviceMotion(callback) {
  window.addEventListener(
    'devicemotion',
    callback,
    false
  );
}
////// ---- ORITENTATION FSTUFF

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
    askDeviceMotion(console.log);
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
