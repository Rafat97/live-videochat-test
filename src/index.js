require("./figlet")

const express = require('express')
const path = require('path');
const { disconnect } = require("process");
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 3388 

app.use(express.static('public'))

let users_connect = []
let users_peers = []

// io.on('connection', (socket) => {
//     // console.log(`a user connected ${socket.id}`);
    
//     users_connect.push(
//         {
//             id : socket.id,
//             screen_share : false,
//             video_share : false,
//             audio_share: false,
//         }
//     )
//     console.log(users_connect);
//     // io.emit('users', users_connect);
//     allways_emit()
    
//     //Send a message after a timeout of 4seconds
//     // setInterval(function() {
//     //     socket.send(`Sent a message 4seconds after connection! ${socket.id}`);
//     // }, 1);

//     socket.on('message',function(data) {
//         let send = {
//             'socket_id' : socket.id,
//             'message' : data,
//         }
//         console.log(`user ${socket.id} message = ${data}`);
//      });
//      socket.on('screen_share',function(data) {
//         console.log(`user ${socket.id} message = ${data}`);

//         var removeIndex = users_connect.map(function(item) { return item.id; }).indexOf(socket.id);
//         users_connect[removeIndex].screen_share = data;
//         if (data == false) {
//             var removeIndex = users_peers.map(function(item) { return item.id; }).indexOf(socket.id);
//             users_peers.splice(removeIndex, 1);
//         }
        
//         allways_emit()
//      });
//      socket.on('peer_signal',function(data) {
//         socket.send(`${socket.id}`);
//         var removeIndex = users_peers.map(function(item) { return item.id; }).indexOf(socket.id);
//         if (removeIndex == -1) {
//             users_peers.push({
//                 id : socket.id,
//                 peer_data : data
//             })
//         }else{
//             users_peers[removeIndex].peer_data = data;
//         }
//         allways_emit()
//         // users_connect[removeIndex].screen_share = data;
//         // console.log(`user ${socket.id} message = ${data}`);
//      });
//      socket.on('peer_stream',function(data) {
//         socket.send(`${socket.id}`);
//         var removeIndex = users_peers.map(function(item) { return item.id; }).indexOf(socket.id);
//         if (removeIndex == -1) {
//             users_peers.push({
//                 id : socket.id,
//                 peer_data : data
//             })
//         }else{
//             users_peers[removeIndex].peer_stream = data;
//         }
//         allways_emit()
//         // users_connect[removeIndex].screen_share = data;
//         // console.log(`user ${socket.id} message = ${data}`);
//      });
//     //when disconnect user
//     socket.on('disconnect', () => {
//         // delete users_connect[socket.id]; //object remove
//         var removeIndex = users_connect.map(function(item) { return item.id; }).indexOf(socket.id);
//         users_connect.splice(removeIndex, 1);

//         var removeIndex = users_peers.map(function(item) { return item.id; }).indexOf(socket.id);
//         users_peers.splice(removeIndex, 1);

//         allways_emit()

//         console.log(`user disconnected ${socket.id}`);
//     });

//     function allways_emit() {
//         io.emit('users', users_connect);
//         io.emit('peer_signal', users_peers);
//     }
// });

const screenshareNamespace = io.of('/screenshare');
screenshareNamespace.on('connection' ,(socket) => {
    users_connect.push(
                {
                    id : socket.id,
                    screen_share : false,
                    video_share : false,
                    audio_share: false,
                }
            )
    function allways_emit() {
        screenshareNamespace.emit('users', users_connect);
    }
    socket.on('screen_share',function(data) {
        console.log(`user ${socket.id} message = ${data}`);
        var removeIndex = users_connect.map(function(item) { return item.id; }).indexOf(socket.id);
        users_connect[removeIndex].screen_share = data;
        if (data == false) {
            var removeIndex = users_peers.map(function(item) { return item.id; }).indexOf(socket.id);
            users_peers.splice(removeIndex, 1);
        } else{
            screenshareNamespace.emit('CreatePeer')   
        }
        allways_emit()
    });

    socket.on('Offer', (offer) => {
        socket.broadcast.emit("BackOffer", offer)
        allways_emit()
    })
    socket.on('Answer', (data) => {
        socket.broadcast.emit("BackAnswer", data)
        allways_emit()
    })
    socket.on('disconnect', () => {
        var removeIndex = users_connect.map(function(item) { return item.id; }).indexOf(socket.id);
        users_connect.splice(removeIndex, 1);
        console.log(`user disconnected ${socket.id}`);
        allways_emit()
    });

    // console.log(users_connect)
    allways_emit()

})


let socket_users = []
let video_users = {}
const groupChat = io.of('/group-chat');
groupChat.on('connection' , (socket) => {
    var roomID = 'test'
    socket.on('share_start', () => {
        if (video_users[roomID]) {
            video_users[roomID].push(socket.id);
        } else {
            video_users[roomID] = [socket.id];
        }
        const users_in_video = video_users[roomID].filter(id => id !== socket.id);
        console.log(users_in_video)
        socket.emit("all users", users_in_video);
    });
    socket.on('share_end', () => {
        delete video_users[socket.id]
    });
    socket.on('sending signal', (payload ) => {
        groupChat.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });
    socket.on("returning signal", payload => {
        groupChat.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

  
    socket.on('disconnect', () => {
        
        // var removeIndex = video_users.map(function(item) { return item.id; }).indexOf(socket.id);
        // users_connect.splice(removeIndex, 1);
        // console.log(`user disconnected ${socket.id}`);
        // delete video_users[socket.id]
        let room = video_users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            video_users[roomID] = room;
        }
        allways_emit()
    });

    function allways_emit() {
        
    }
    console.log(`${socket.id}`)
})

const users_have_video = {};
const single_chat = io.of('/single-chat');
single_chat.on('connection' , (socket) => {
    socket.on('users_have_video', () => {
        var size = Object.keys(users_have_video).length;
        if (!users_have_video[socket.id]) {
            users_have_video[socket.id] = socket.id;
        }
        allways_emit()
        // single_chat.emit("all_users", users_have_video);
    });
  
    socket.on("callUser", (data) => {
        console.log("callUser")
        single_chat.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })
    socket.on("acceptCall", (data) => {
        single_chat.to(data.to).emit('callAccepted', data.signal);
    })
    socket.on('disconnect', () => {
        delete users_have_video[socket.id]
        allways_emit()
    });

    function allways_emit() {
        single_chat.emit("all_users", users_have_video);
    }
})



const video_call_users = {test:[]};
const video_call = io.of('/video-call');
video_call.on('connection' , (socket) => {
    var roomID = 'test'
    socket.on('users_have_video', () => {
        var size = Object.keys(video_call_users[roomID]).length;
        if (size == 0) {
            video_call_users[roomID] = []
            video_call_users[roomID].push(
                {
                    id : socket.id, 
                    is_joined : true
                }
            )
        }else{
            video_call_users[roomID].push(
                {
                    id : socket.id, 
                    is_joined : false
                }
            )
        }
        video_call.emit("new_user_join", socket.id);
        always_emit()
        // const all_users_without_me = video_call_users[roomID].filter((element) => element.id !== socket.id )
        // video_call.emit("all_users_without_me", all_users_without_me);
    });
    socket.on('user_signal', (data) => {
        // video_call_users[roomID].
        video_call_users[roomID].forEach(element => {
            if (element.id == socket.id) {
                element.signal = data.signalData
            }
        });
        always_emit()
    });
    socket.on('send_joined', (data) => {
        console.log(data)
        video_call.emit('accept_joined', data.signal);
    });
    socket.on('disconnect', () => {
        var removeIndex = video_call_users['test'].map(function(item) { return item.id; }).indexOf(socket.id);
        video_call_users['test'].splice(removeIndex, 1);
        always_emit()
    });
    function always_emit(){
        video_call.emit("all_users", video_call_users[roomID]);
    }
  
})

const conferance_users = {};
const conferance_socket = io.of('/conferance-call');
conferance_socket.on('connection' , (socket) => {
    socket.on('user_added', (data) => {
     console.log(data)
     conferance_users[socket.id] = {
         id: socket.id,
         signal: data
     }
     console.log(conferance_users)
     always_emit()
    });
    socket.on('disconnect', () => {
     
    });
    function always_emit(){
        socket.emit('all_users',conferance_users)
    }
  
})

// app.get('/', (req, res) => res.send(`Hello World! ${port}`))

//using express
//app.listen(port, () => console.log(`listening on http://localhost:${port}`))

//using http
http.listen(port, () => console.log(`listening on http://localhost:${port}`));