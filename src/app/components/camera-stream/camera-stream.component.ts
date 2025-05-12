import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-camera-stream',
  standalone: false,
  templateUrl: './camera-stream.component.html',
  styleUrl: './camera-stream.component.scss'
})
export class CameraStreamComponent implements AfterViewInit {
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;
  peerConnection!: RTCPeerConnection;
  signalingSocket!: WebSocket;
  showPlayButton = true;

  readonly SIGNALING_SERVER_URL = environment.signalingServerURL;
  readonly STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  constructor() {}

  ngAfterViewInit() {
    this.initWebRTC();
  }

  initWebRTC() {
    this.signalingSocket = new WebSocket(this.SIGNALING_SERVER_URL);

    this.signalingSocket.onmessage = async (messageEvent) => {
      const data = JSON.parse(messageEvent.data);

      if (data.type === 'offer') {
        console.log('Received new offer. Resetting connection');

        if (this.peerConnection) {
          this.peerConnection.close();
        }
        this.peerConnection = new RTCPeerConnection({ iceServers: this.STUN_SERVERS });
        this.setupPeerConnectionHandlers();

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data));

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.signalingSocket.send(JSON.stringify({
          type: 'answer',
          sdp: answer.sdp,
          sdpType: answer.type
        }));
      } else if (this.peerConnection && data.type === 'candidate') {
        try {
          console.log('Received ICE candidate from camera.');
          await this.peerConnection.addIceCandidate(data.candidate);
        } catch (err) {
          console.error('Error adding received ice candidate', err);
        }
      }
    };

    this.signalingSocket.onopen = () => {
      console.log('✅ Connected to signaling server');
      this.signalingSocket.send(JSON.stringify({
        type: "request-offer"
      }));
    };

    this.signalingSocket.onerror = (err) => {
      console.error('❌ Signaling WebSocket error:', err);
    };
  }

  setupPeerConnectionHandlers() {
    this.peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      this.remoteVideoRef.nativeElement.srcObject = stream;
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE Connection State Changed:", this.peerConnection.iceConnectionState);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Found ICE candidate. Sending to camera.');
        this.signalingSocket.send(JSON.stringify({
          type: 'candidate',
          candidate: {
            "component": event.candidate.component,
            "foundation": event.candidate.foundation,
            "ip": event.candidate.address,
            "port": event.candidate.port,
            "priority": event.candidate.priority,
            "protocol": event.candidate.protocol,
            "type": event.candidate.type,
            "relatedAddress": event.candidate.relatedAddress,
            "relatedPort": event.candidate.relatedPort,
            "sdpMid": event.candidate.sdpMid,
            "sdpMLineIndex": event.candidate.sdpMLineIndex,
            "tcpType": event.candidate.tcpType,
          }
        }));
      }
    };
  }

  handleStartStream() {
    this.remoteVideoRef.nativeElement.play().then(() => {
      this.showPlayButton = false;
    }).catch(() => {
      console.error('Something went wrong while trying to play the video stream');
    })
  }
}
