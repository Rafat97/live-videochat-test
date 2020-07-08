import React from 'react';
import ReactDOM from 'react-dom';
import OpenCamera from './OpenCamera'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPermissionErrorComponent:false,
            showCameraOpenComponent:false
        };
    }
    
    componentDidMount() {
        console.log("componentDidMount")
       
    }
    componentWillUnmount() {
        console.log("componentWillUnmount")
    }
    cameraOpen() {
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            userStream = stream;
            userPermission = true;
            this.setState(state => ({
                showPermissionErrorComponent :false,
                showCameraOpenComponent : true
            }));
        })
        .catch(err => {
            userPermission = false;
            console.log(err);
            this.setState(state => ({
                showPermissionErrorComponent :true,
                showCameraOpenComponent:false
            }));
           
        });
    }
    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                {this.state.showCameraOpenComponent == false ? 
                    <div className="col-md-8">
                        <div className="card mt-5">
                            <div className="card-header">Camera Component</div>
                            <div className="card-body text-center" >
                                <button className="btn btn-primary" onClick={() => this.cameraOpen()}>Open camera and audio</button>
                            </div>
                        </div>
                    </div> : null
                    }
                    {this.state.showPermissionErrorComponent ? 
                        "Error to open camera & audio"
                        :
                        null
                    }
                    {this.state.showCameraOpenComponent ? 
                        <OpenCamera />
                        :
                        null
                    }
                </div>
            </div>
        );
    }
  }

export default App;

if (document.getElementById('example')) {
    ReactDOM.render(<App />, document.getElementById('example'));
}
