import { ZegoExpressEngine, ZegoUser } from 'zego-express-engine-webrtc';

class ZegoWebRTC {
  private zegoEngine: ZegoExpressEngine;
  private appID: number;
  private server: string;

  constructor(appID: number, server: string) {
    this.appID = appID;
    this.server = server;
    this.zegoEngine = new ZegoExpressEngine(this.appID, this.server);
    this.initializeListeners();
  }

  private initializeListeners(): void {
    this.zegoEngine.on('roomStateUpdate', (roomID, state, errorCode) => {
      console.log(`Room ${roomID} state: ${state}`);
    });

    this.zegoEngine.on('remoteStreamAdded', (streamID) => {
      console.log(`Remote stream added: ${streamID}`);
      this.zegoEngine.startPlayingStream(streamID);
    });

    this.zegoEngine.on('remoteStreamPlaying', (streamID, remoteStream) => {
      console.log(`Playing remote stream: ${streamID}`);
      const videoElement = document.createElement('video');
      videoElement.srcObject = remoteStream;
      videoElement.autoplay = true;
      document.body.appendChild(videoElement);
    });
  }

  loginRoom(roomID: string, userID: string, userName: string): void {
    const user: ZegoUser = { userID, userName };
    this.zegoEngine.loginRoom(roomID, user, { userUpdate: true });
    console.log(`User ${userID} logged into room ${roomID}`);
  }

  startPublishingStream(streamID: string): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.zegoEngine.startPublishingStream(streamID, stream);
        console.log(`Publishing stream: ${streamID}`);
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }

  logoutRoom(roomID: string): void {
    this.zegoEngine.logoutRoom(roomID);
    console.log(`Logged out of room ${roomID}`);
  }

  destroyEngine(): void {
    this.zegoEngine.destroyEngine();
    console.log('ZEGO Engine destroyed');
  }
}

export default ZegoWebRTC;
