import React from 'react';
import ReactDOM from 'react-dom';
import OpenCamera from './OpenCamera'

class Socket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    
    componentDidMount() {
        console.log("componentDidMount")
        console.log(socket_io)
        socket_io.on('message', function(data){
            console.log(data)
        });
        socket_io.emit('message' , "hello Socket");
       
    }
    componentWillUnmount() {
        console.log("componentWillUnmount")
    }
    static _startScreenCapture() {
   
        if (navigator.getDisplayMedia) {
          return navigator.getDisplayMedia({video: true});
        } else if (navigator.mediaDevices.getDisplayMedia) {
          return navigator.mediaDevices.getDisplayMedia({video: true});
        } else {
          return navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
        }
    }
    async _startCapturing() {
        try {
          console.log('Start capturing.');
          this.status = 'Screen recording started.';
          this.enableStartCapture = false;
          this.enableStopCapture = true;
          this.enableDownloadRecording = false;
  
          if (this.recording) {
            window.URL.revokeObjectURL(this.recording);
          }
  
          this.chunks = [];
          this.recording = null;
          
          this.stream = await Socket._startScreenCapture();
          
  
          this.stream.addEventListener('inactive', e => {
            console.log('Capture stream inactive - stop recording!');
            this._stopCapturing(e);
          });
          this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm'});
          this.mediaRecorder.addEventListener('dataavailable', event => {
            if (event.data && event.data.size > 0) {
              this.chunks.push(event.data);
            }
          });
          this.mediaRecorder.start(10);
      } catch (err) {
        console.log(err)
      }
    }

    render() {
        return (
            <div>
                <button onClick={ ()=> this._startCapturing() }>Start Screen</button>
            </div>
        );
  }
}
export default Socket;

if (document.getElementById('example')) {
    ReactDOM.render(<Socket />, document.getElementById('example'));
}
