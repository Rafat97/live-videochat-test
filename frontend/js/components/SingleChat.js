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
      all_users: {},
      all_users_without_me: {},
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
  // componentDidUpdate() {
  //   console.log("componentDidUpdate");
  // }
  socket_connection() {
    this.socket.current = io.connect("/single-chat");
    this.socket.current.on("all_users", (data) => {
      this.setState({ my_id: this.socket.current.id });
      const all_usr = data;
      this.setState({ all_users: all_usr });
      const all_usr_without_me = {};
      for (const val in all_usr) {
        if (this.socket.current.id != val) {
          all_usr_without_me[val] = val;
        }
      }
      this.setState({ all_users_without_me: all_usr_without_me });
    });
    this.socket.current.on("hey", (data) => {
      console.log('hey = ',data)
      if (this.state.count == 0) {
        this.acceptCall(data.signal,data.from) 
        this.setState({count : 1})
      }
      // this.acceptCall(data.signal,data.from)  //continous calling not working

    })
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
      console.log('signal > callUser',data)
      this.socket.current.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: this.state.my_id,
      });
    });

    peer.on("stream", (stream) => {
      if (this.partnerVideo.current) {
        this.partnerVideo.current.srcObject = stream;
      }
    });

    this.socket.current.on("callAccepted", (signal) => {
      console.log("callAccepted",signal)
      peer.signal(signal);
    });
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
          {Object.keys(this.state.all_users_without_me).map((data, index) => {
            // if (key === yourID) {
            //   return null;
            // }
            return (
              <button key={index} onClick={() => this.callPeer(data)}>
                Call {data}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}
export default SingleChat;

if (document.getElementById("example")) {
  ReactDOM.render(<SingleChat />, document.getElementById("example"));
}
