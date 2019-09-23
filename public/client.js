// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o)');

const socket = io();

socket.on('message', function(msg) {
  console.log(msg.code);
  window.localStorage.setItem('caurlUID', msg.code);
  sendToEditor();
});

let submitButton = document.getElementById('register-button');
if (submitButton) {
  submitButton.addEventListener("click", function() { 
    // get userhandle value
    const fieldElem = document.getElementById('userhandle-field');
    const userhandle = fieldElem.value;
    
    if (userhandle) {
      // register with server
      socket.emit('added user', userhandle);
    }
  });
}

// helpers

function sendToEditor() {
  window.location = '/htmleditor';
}