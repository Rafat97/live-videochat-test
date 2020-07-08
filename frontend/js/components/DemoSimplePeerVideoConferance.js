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
    this.peerRef = createRef();
    this.partnerVideo = createRef();
    this.partnerVideo2 = createRef();
    this.socket = createRef();
    this.state = {
      all_users: {},
      all_users_without_me: {},
      count : 0,
    };
  }
  reset() {
    this.setState(initialState);
  }
  componentDidMount() {
    this.socket_connection()
    this._startCapturing();
    console.log("componentDidMount");
  }
  componentWillUnmount() {
    console.log("componentWillUnmount");
  }
  socket_connection() {
    this.socket.current = io.connect("/conferance-call");
    this.socket.current.on("all_users", (data) => {
      console.log(data)
      // this.setState({all_users : data})
    });
  }
  static _startVideoCapture() {
    let returnObject = null;
    returnObject = navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    return returnObject;
  }
  initPeer(){

    this.peerRef = new Peer({ 
      initiator: true,
      trickle: false,
      stream: this.stream,
     })
    
    this.peerRef.on('signal', (data) => {
      console.log(data)
      this.socket.current.emit('user_added' , data)
    })
    
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
      this.stream = await SingleChat._startVideoCapture();
      this.userVideo.current.srcObject = this.stream;

      this.initPeer()

    } catch (err) {
      console.log(err);
      alert(err.message);
      this.setState({ enableStartCapture: false });
    }
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
          partner Video 2
          <br></br>
          <video muted ref={this.partnerVideo2} autoPlay playsInline />
        </div>
        <br></br>
        
      </div>
    );
  }
}
export default SingleChat;

if (document.getElementById("example")) {
  ReactDOM.render(<SingleChat />, document.getElementById("example"));
}
