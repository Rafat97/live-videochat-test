import React from "react";
import ReactDOM from "react-dom";
import Peer from "simple-peer";
import io from "../../../node_modules/socket.io-client/dist/socket.io";

const initialState = {
  enableStartCapture: false,
  users: [],
  recording: null,
  webcamStream: null,
  screenStream: null,
  streamURI: null,
  recordingURI: null,
  peers: null,
  client: {},
};
class ScreenSharing extends React.Component {
  constructor(props) {
    super(props);
    this.socket_screen_sharing = io("/screenshare");
    this.state = initialState;
    this.videoTag = React.createRef();
    this.videoTagPeer = React.createRef();
    this.socket_screen_sharing.on("users", (data) => {
      console.log(data);
      this.setState({ users: data });
    });
    this.socket_screen_sharing.on("CreatePeer", () => this.MakePeer() );
    this.socket_screen_sharing.on("BackOffer", (offer) =>
      this.FrontAnswer(offer)
    );
    this.socket_screen_sharing.on("BackAnswer", (answer) =>
      this.SignalAnswer(answer)
    );
  }
  SignalAnswer(answer) {
    this.setState(
      {
        client :  {
          gotAnswer : true
        }
      })
    // let peer = this.state.client.peer;
    let peer = this.client.peer;
    peer.signal(answer);
  }
  FrontAnswer(offer) {
    let peer = this.InitPeer("notInit");
    peer.on("signal", (data) => {
      this.socket_screen_sharing.emit("Answer", data);
    });
    peer.signal(offer);
    // var add = Object.assign(this.state.client, { peer: peer });
    // this.setState({ client:  add});
    this.client.peer = peer
  }

  InitPeer(type) {
    let peer = new Peer({
      initiator: type == "init" ? true : false,
      stream: this.stream,
      trickle: false,
    });
    peer.on("stream", (stream) => {
      // CreateVideo(stream)
      this.videoTagPeer.current.srcObject = stream
      console.log(stream);
    });
    
    // peer.on("data", (data) => {
    //   let decodedData = new TextDecoder("utf-8").decode(data);
    //   let peervideo = document.querySelector("#peerVideo");
    //   peervideo.style.filter = decodedData;
    // });
    return peer;
  }
  MakePeer() {
    // var add = Object.assign(this.state.client, {gotAnswer : false});
    // this.setState({client : add})
    this.client = {}
    this.client.gotAnswer = false
    let peer = this.InitPeer("init");
    peer.on("signal", (data) => {
      // if (!this.state.client.gotAnswer) {
      //   this.socket_screen_sharing.emit("Offer", data);
      // }
      if (!this.client.gotAnswer) {
        this.socket_screen_sharing.emit("Offer", data);
      }
    });
    //  add = Object.assign(this.state.client, { peer: peer });
    // this.setState({ client:  add});
    this.client.peer = peer
  }
  reset() {
    this.setState(initialState);
  }
  componentDidMount() {
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

      this.stream = await ScreenSharing._startScreenCapture();
      this.setState({ screenStream: this.stream });
      this.videoTag.current.srcObject = this.stream;
      const vido = this.videoTag.current;
      vido.addEventListener("play", (e) => {
        console.log(e);
      });
      this.stream.addEventListener("inactive", (e) => {
        this.socket_screen_sharing.emit("screen_share", false);
        this.setState({ enableStartCapture: false });
        alert("stop screen ");
        console.log("Capture stream inactive - stop recording!");
      });
      this.socket_screen_sharing.emit("screen_share", true);
    } catch (err) {
      console.log(err);
      alert(err.message);
      this.socket_screen_sharing.emit("screen_share", false);
      this.setState({ enableStartCapture: false });
      // this.reset()
    }
  }

  render() {
    return (
      <div>
        {this.state.users.map((number) => (
          <ul key={number.id}>
            <li>{number.id}</li>
            <ul>
              <li>screen_share = {number.screen_share ? 1 : 0}</li>
              <li>video_share = {number.video_share ? 1 : 0}</li>
              <li>audio_share ={number.audio_share ? 1 : 0}</li>
            </ul>
          </ul>
        ))}
        My Video
        <br></br>
        <video width="500" height="200"  ref={this.videoTag} autoPlay/>
        <br></br>
        <br></br>
        Peer Video
        <br></br>
        <video width="500" height="200" ref={this.videoTagPeer} autoPlay />
        <br></br>
        <br></br>

        {/* <canvas ref={this.canvasRef} width={this.state.canvasWidth} height={this.state.canvasHeight}></canvas> */}

        {/* <video src={this.state.recordingURI} autoPlay /> */}
        <button
          disabled={this.state.enableStartCapture}
          onClick={() => this._startCapturing()}
        >
          Start Screen
        </button>
      </div>
    );
  }
}
export default ScreenSharing;

if (document.getElementById("example")) {
  ReactDOM.render(<ScreenSharing />, document.getElementById("example"));
}
