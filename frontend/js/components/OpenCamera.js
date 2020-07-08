import React from 'react';
import ReactDOM from 'react-dom';

class OpenCamera extends React.Component {
    constructor(props) {
        super(props);
        // const videoTracks = userStream.getVideoTracks();
        this.state = {
            videoTracks : userStream.getVideoTracks(),
            videoURI : userStream,
        };
    }
    
    componentDidMount() {
        console.log("componentDidMount")
        console.log(this.state.videoTracks)
        console.log(this.state.videoURI)
    }
    componentWillUnmount() {
        console.log("componentWillUnmount")
    }
   
    render() {
        return (
           <div className="mt-5">
                <video ref={video => {video.srcObject = this.state.videoURI}} autoPlay />
            </div>
        );
    }
  }

export default OpenCamera;

