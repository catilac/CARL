// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o)');

const socket = io();
socket.emit('added user', "test_username");

