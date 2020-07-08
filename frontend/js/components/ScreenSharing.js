import React from 'react';
import ReactDOM from 'react-dom';
import OpenCamera from './OpenCamera'
import Peer from 'simple-peer'

const initialState = {
  enableStartCapture : false,
  users : [],
  recording : null,
  webcamStream : null,
  screenStream : null,
  streamURI : null,
  recordingURI : null,
  peers : null
};
class ScreenSharing extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState
        this.videoTag = React.createRef()
        this.videoTagPeer = React.createRef()
    }
    reset(){
      this.setState(initialState);
    }
    componentDidMount() {
        console.log("componentDidMount")
        console.log(socket_io)
        socket_io.on('users', (data) => {
          this.setState({users : data})
        });
        socket_io.on('peer_signal', (data) => {
          this.setState({peers : data})
        });
        socket_io.on('peer_stream', (data) => {
          this.setState({peers : data})
        });
        socket_io.emit('message' , "hello Socket");
    }
    componentWillUnmount() {

        console.log("componentWillUnmount")
    }
    static _startScreenCapture() {
        let returnObject = null
        if (navigator.getDisplayMedia) {
          returnObject =  navigator.getDisplayMedia({video: true})
        } else if (navigator.mediaDevices.getDisplayMedia) {
          returnObject = navigator.mediaDevices.getDisplayMedia({video: true})
        } else {
          returnObject = navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}})
        }
        
        return returnObject;
    }
   
    // Logs answer to offer creation and sets peer connection session descriptions.
     createdAnswer(description) {
      console.log("createdAnswer : ",description);

      // trace('remotePeerConnection setLocalDescription start.');
      // this.remotePeerConnection.setLocalDescription(description)
      //   .then((e) => {
      //     console.log(e)
      //   }).catch((e) => {
      //     console.log(e)
      //   });
      // // trace('localPeerConnection setRemoteDescription start.');
      // this.localPeerConnection.setRemoteDescription(description)
      //   .then((e) => {
      //     console.log(e)
      //   }).catch((e) => {
      //     console.log(e)
      //   });
    }
    
    createdOffer(description) {
      console.log("createdOffer : ",description);
      // trace('localPeerConnection setLocalDescription start.');
      this.localPeerConnection.setLocalDescription(description)
        .then((e) => {
          console.log(e)
        }).catch((e) => {
          console.log(e)
        });
    
      // trace('remotePeerConnection setRemoteDescription start.');
      this.remotePeerConnection.setRemoteDescription(description)
        .then((e) => {
          console.log(e)
        }).catch((e) => {
          console.log(e)
        });
    
      // trace('remotePeerConnection createAnswer start.');
      this.remotePeerConnection.createAnswer()
        .then((e) => this.createdAnswer(e))
        .catch((e) => {
          console.log(e)
        });
    }
    async _startCapturing() {
        try {
          // const webcamstream = await navigator.mediaDevices.getUserMedia( {
          //   audio: false,
          //   video: true
          // });
          // this.setState({webcamStream : webcamstream})

          console.log('Start capturing.');

          this.status = 'Screen recording started.';
          this.setState({enableStartCapture : true})
          // this.enableStartCapture = false;
          this.enableStopCapture = true;
          this.enableDownloadRecording = false;
  
          if (this.recording) {
            window.URL.revokeObjectURL(this.recording);
          }
  
          this.chunks = [];
          this.recording = null;
          
          this.stream = await ScreenSharing._startScreenCapture();
          this.setState({screenStream : this.stream})
          this.videoTag.current.srcObject = this.stream
          const vido =this.videoTag.current
          vido.addEventListener("play" , e => {
            console.log(e)
          })
          this.stream.addEventListener('inactive', e => {
            
            this.reset()
            alert("stop screen ")
            console.log('Capture stream inactive - stop recording!');
            // this._stopCapturing(e);
            socket_io.emit('screen_share' , false);
          });
          socket_io.emit('screen_share' , true);
          console.log(this.stream.getTracks())

          var peer1 = new Peer(
              { 
                initiator: true, 
                stream: this.stream ,
                trickle: false,
              }
            )
          var peer2 = new Peer(
            { 
              initiator: false, 
              stream: this.stream ,
              trickle: false,
            }
          )
          peer1.on('stream', (stream) => {
            console.log(stream)
          })
          peer1.on('signal', (data) => {
            console.log(data)
            peer2.signal(data)
          })
          peer2.on('signal', (data) => {
            
          })
          

          // const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
          // this.localPeerConnection = new RTCPeerConnection({});

          // this.localPeerConnection.addEventListener('icecandidate', e => {
          //   console.log("this.localPeerConnection icecandidate")
          //   console.log(e)
          // });
          // this.localPeerConnection.addEventListener('iceconnectionstatechange', e => {
          //   console.log("this.localPeerConnection iceconnectionstatechange")
          //   console.log(e)

          // });

          // this.remotePeerConnection = new RTCPeerConnection({});
          // this.remotePeerConnection.addEventListener('icecandidate', e => {
          //   console.log("remotePeerConnection icecandidate")
          //   console.log(e)
          // });
          // this.remotePeerConnection.addEventListener('iceconnectionstatechange', e => {
          //   console.log("remotePeerConnection iceconnectionstatechange")
          //   console.log(e)

          // });
          // this.remotePeerConnection.addEventListener('addstream', (e) => {
          //   console.log("remotePeerConnection addstream")
          //   console.log(e)
          // });
          // this.localPeerConnection.addStream(this.stream);

          // this.localPeerConnection.createOffer({
          //   offerToReceiveVideo: 1,
          // })
          // .then((e) => this.createdOffer(e))
          // .catch((e) => {
          //   console.log(e)
          // });

          // // console.log(await this.stream)
          // this.setState({streamURI : this.stream })
          

          // this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm'});

          // this.mediaRecorder.addEventListener('dataavailable', event => {
          //   if (event.data && event.data.size > 0) {

          //     console.log(event.data)
          //     this.chunks.push(event.data);
          //     let rec_data = (window.URL ? URL : webkitURL).createObjectURL(new Blob( this.chunks, {type: 'video/webm'}));
          //     // // let rec_data = window.URL.createObjectURL( event.data);
          //     // console.log(rec_data)
          //     // this.setState({recording : rec_data})
          //     this.setState({recordingURI : rec_data})
          //   }
          // });

          // this.mediaRecorder.start(10);
      } catch (err) {
        console.log(err)
        alert(err.message)
        socket_io.emit('screen_share' , false);
        // this.reset()
      }
    }

    render() {
        return (
            <div>
              {
                 this.state.users.map((number) =>
                  <ul key={number.id}>
                     <li>{number.id}</li> 
                     <ul>
                        <li>screen_share = {number.screen_share ? 1 : 0}</li>
                        <li>video_share = {number.video_share ? 1 : 0}</li>
                        <li>audio_share ={number.audio_share ? 1 : 0}</li>
                    </ul>

                  </ul>
                
                )
              }
                  <video 
                    ref={this.videoTag}
                    autoPlay
                    hidden = {true}
                  />
                <br></br>
                <br></br>
                <br></br>
                  <video 
                    width="500"
                    height="200"
                    ref={this.videoTagPeer}
                    autoPlay
                  />
<br></br>
<br></br>
<br></br>

                  
              {/* <canvas ref={this.canvasRef} width={this.state.canvasWidth} height={this.state.canvasHeight}></canvas> */}
              
                {/* <video src={this.state.recordingURI} autoPlay /> */}
                <button disabled={ this.state.enableStartCapture } onClick={ ()=> this._startCapturing() }>Start Screen</button>
            </div>
        );
  }
}
export default ScreenSharing;

if (document.getElementById('example')) {
    ReactDOM.render(<ScreenSharing />, document.getElementById('example'));
}
