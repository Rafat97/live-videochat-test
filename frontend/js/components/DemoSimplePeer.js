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
    this._startCapturing();
    console.log("componentDidMount");
  }
  componentWillUnmount() {
    console.log("componentWillUnmount");
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

        var peer1 = new Peer({ initiator: true, stream: this.stream, trickle: false, })
        var peer2 = new Peer({ initiator: false, stream: this.stream, trickle: false, })
        var peer3 = new Peer({ initiator: false, stream: this.stream, trickle: false, })
      
        peer1.on('signal', data => {
          console.log('peer1 ',data)
          peer2.signal(data)
          // peer3.signal(data)
        })
      
        peer2.on('connect', (data) => {
          console.log('peer2 connect',data)
          // peer2.send('hi peer2, this is peer1')
        })
        peer2.on('signal', data => {
          console.log('peer2 ',data)
          peer1.signal(data)
        })

        peer3.on('signal', data => {
          console.log('peer3 ',data)
          peer1.signal(data)
        })
      
        peer2.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
          console.log('peer2 stream ',stream)
          this.partnerVideo.current.srcObject = stream
      })

      peer3.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
          console.log('peer3 stream ',stream)
          // this.partnerVideo2.current.srcObject = stream
      })



    } catch (err) {
      console.log(err);
      alert(err.message);
      this.setState({ enableStartCapture: false });
      // this.reset()
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
