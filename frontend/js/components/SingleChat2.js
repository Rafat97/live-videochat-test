import React, { useEffect, useRef, useState, createRef } from "react";
import ReactDOM from "react-dom";
import Peer from "simple-peer";
import io from "socket.io-client/dist/socket.io";

const initialState = {};
const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};
class SingleChat extends React.Component {
  constructor(props) {
    super(props);
    this.userVideo = createRef();
    this.partnerVideo = createRef();
    this.socket = createRef();
    this.state = {
      all_users: [],
      all_users_without_me: [],
      my_info : {},
      count : 0,
    };
  }
  reset() {
    this.setState(initialState);
  }
  componentDidMount() {
    this.socket_connection();
    this._startCapturing();
    console.log("componentDidMount");
  }
  componentWillUnmount() {
    console.log("componentWillUnmount");
  }
  socket_connection() {
    this.socket.current = io.connect("/video-call");
    
    // get all users
    this.socket.current.on('all_users',(data) => {
      var users_in_test_room = data 
      this.setState({all_users : data })
      data.forEach(element => {
        if (element.id == this.socket.current.id) {
          this.setState({my_info : element })
        }
      });
      // this.callPeer(this.socket.current.id)
    })
    this.socket.current.on('new_user_join',(data) => {
      if (data == this.socket.current.id) {
        this.callPeer(data)
      }
     
      // console.log(data)
    })

    // this.socket.current.on('all_users_without_me',(data) => {
    //   this.setState({all_users_without_me : data })
    // })
  }
  static _startScreenCapture() {
    let returnObject = null;
    if (navigator.getDisplayMedia) {
      returnObject = navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      returnObject = navigator.mediaDevices.getDisplayMedia({ video: true });
    } else {
      returnObject = navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" },
      });
    }
    return returnObject;
  }
  static _startVideoCapture() {
    let returnObject = null;
    returnObject = navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    return returnObject;
  }

  async _startCapturing() {
    try {
      console.log("Start capturing.");

      this.status = "Screen recording started.";
      this.setState({ enableStartCapture: true });
      // this.enableStartCapture = false;
      this.enableStopCapture = true;
      this.enableDownloadRecording = false;

      if (this.recording) {
        window.URL.revokeObjectURL(this.recording);
      }

      this.chunks = [];
      this.recording = null;

      // this.stream = await ScreenSharing._startScreenCapture();
      this.stream = await SingleChat._startVideoCapture();
      this.userVideo.current.srcObject = this.stream;
      this.socket.current.emit("users_have_video");

    } catch (err) {
      console.log(err);
      alert(err.message);
      this.setState({ enableStartCapture: false });
      // this.reset()
    }
  }
  acceptCall(callerSignal, caller) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.stream,
    });
    peer.on("signal", data => {
      console.log('signal > acceptCall',data)
      this.socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      console.log("acceptCall stream", stream)
      this.partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }
  callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.stream,
    });
    console.log(peer)
    peer.on("signal", (data) => {
      console.log('signal > user_signal',data)
      this.socket.current.emit("user_signal", {
          signalData: data,
        });
      // this.socket.current.emit("callUser", {
      //   userToCall: id,
      //   signalData: data,
      //   from: this.state.my_id,
      // });
    });

    peer.on("stream", (stream) => {
      console.log("callPeer stream", stream)
      // if (this.partnerVideo.current) {
      //   this.partnerVideo.current.srcObject = stream;
      // }
      this.partnerVideo.current.srcObject = stream;
    });

    this.socket.current.on("accept_joined", (signal) => {
      console.log("callAccepted",signal)
      peer.signal(signal);
      // this.socket.current.emit('send_')
    });
  }
  joinPress(){
    this.state.all_users.forEach(element => {
      var sendsignal =  element
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: this.stream,
      });
      peer.on("signal", data => {
        console.log('signal > acceptCall',data)
        this.socket.current.emit("send_joined", { signal: data })
      })
      peer.on("stream", stream => {
        console.log("acceptCall stream", stream)
        this.partnerVideo.current.srcObject = stream;
      });
      if (element.id != this.socket.current.id) {
        peer.signal(sendsignal.signal);
      }
    });
    
  }
  joinPress_1(){
    var sendsignal =  this.state.all_users[1]
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.stream,
    });
    peer.on("signal", data => {
      console.log('signal > acceptCall',data)
      this.socket.current.emit("send_joined", { signal: data })
    })

    peer.on("stream", stream => {
      console.log("acceptCall stream", stream)
      this.partnerVideo.current.srcObject = stream;
    });

    peer.signal(sendsignal.signal);
  }
  render() {
    return (
      <div>
        <div>
          My Video
          <br></br>
          <video muted ref={this.userVideo} autoPlay playsInline />
        </div>

        <div>
          partner Video
          <br></br>
          <video muted ref={this.partnerVideo} autoPlay playsInline />
        </div>
        <br></br>
        <div>
        {
          (this.state.my_info.is_joined) ?
          <div></div>
           :
            <button  onClick={() => this.joinPress(this.state.all_users[0])}>
            JOIN 
          </button>
        }
         
        </div>
      </div>
    );
  }
}
export default SingleChat;

if (document.getElementById("example")) {
  ReactDOM.render(<SingleChat />, document.getElementById("example"));
}
