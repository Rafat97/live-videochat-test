import React , { useEffect, useRef, useState, createRef } from "react";
import ReactDOM from "react-dom";
import Peer from "simple-peer";
import io from "socket.io-client/dist/socket.io";

const initialState = {

};
const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2
};
class GroupChat extends React.Component {


  constructor(props) {
    super(props);
    this.socketRef = createRef();
    this.userVideo  = createRef();
    this.peersRef = createRef([]);
    this.peersRef.current = []
    this.state = {
      peers: []
    }; 
  }
  reset() {
    this.setState(initialState);
  }
  componentDidMount() {
    this.socket_connection()
    this._startCapturing()

    this.socketRef.current.on("all users", users => {
      const peers = [];
      users.forEach((userID) => {
          const peer = this.createPeer(userID, this.socketRef.current.id, this.stream);
          console.log(this.peersRef)
          this.peersRef.current.push({
              peerID: userID,
              peer,
          })
          peers.push(peer);
      })
      this.setState({peers : peers})
    })

    this.socketRef.current.on("user joined", (payload) => {
        const peer = this.addPeer(payload.signal, payload.callerID, this.stream);
       
        this.peersRef.current.push({
            peerID: payload.callerID,
            peer,
        })
        
        var joined = this.state.peers.concat('new value');
        this.setState({ peers: joined })
    });

    this.socketRef.current.on("receiving returned signal", payload => {
      const item = this.peersRef.current.find(p => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });
    console.log("componentDidMount");
  }
  componentWillUnmount() {
    console.log("componentWillUnmount");
  }

  componentDidUpdate() {
    console.log("componentDidUpdate");
  }
  socket_connection(){
    this.socketRef.current = io.connect("/group-chat");
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
    returnObject =  navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true })
    return returnObject;
  }

  addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
    })

    peer.on("signal", signal => {
        this.socketRef.current.emit("returning signal", { signal, callerID })
    })

    peer.signal(incomingSignal);

    return peer;
}
  createPeer(userToSignal, callerID, stream) {
      const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
      });

      peer.on("signal", signal => {
          this.socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
      })

      return peer;
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
      this.stream = await GroupChat._startVideoCapture();
      this.userVideo.current.srcObject = this.stream;
      this.socketRef.current.emit("share_start");
      
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
          Others Video
          <br></br>
          {
            this.state.peers.map((peer, index) => {
              <div>
                <video key={index} peer={peer} />
                <br></br>
              </div>
          })
          }
        </div>
     </div>
    );
  }
}
export default GroupChat;

if (document.getElementById("example")) {
  ReactDOM.render(<GroupChat />, document.getElementById("example"));
}
