var bootstrap = require('bootstrap');
import adapter from 'webrtc-adapter';
// var React = require('react');
var io = require('../../node_modules/socket.io-client/dist/socket.io.js')
// window.socket_io = io();
console.log(adapter.browserDetails)
window.constraints = {
    audio: true,
    video: true
};
window.userPermission = false;
window.userStream = null;

// require('./permission');


// require('./screenshearing')


// require('./components/App');
// require('./components/Socket');
// require('./components/ScreenSharing');

// require('./components/ScreenSharing2');
// require('./components/SingleChat'); // working fine
// require('./components/SingleChat2'); // partial work
// require('./components/DemoSimplePeer'); // test simple-peer
require('./components/DemoSimplePeerVideoConferance'); // partial work

// socket_io.on('message', function(data){
//     console.log(data)
// });