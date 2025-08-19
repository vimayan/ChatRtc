import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../context/user/UserContext";

const VideoCall = ({ to, from, offer, iceCandidate }) => {
  const [micEnabled, setMicEnabled] = useState(true);

  const peerRef = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(null);

  const userContext = useContext(UserContext);
  const { socket, clearConnections } = userContext;

  useEffect(() => {
    if (offer) {
      handleReceiveOffer();
    } else {
      initCall();
    }

    socket.on("receive-answer", handleReceiveAnswer);
    socket.on("receive-candidate", handleReceiveCandidate);

    return () => {
      socket.off("receive-answer");
      socket.off("receive-candidate");
      endCall();
    };
  }, []);

  /** Caller: start call */
  const initCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStream.current = stream;

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    const peer = createPeer();
    peerRef.current = peer;

    peer.ontrack = (event) => {
      console.log("Remote audio received");
      remoteAudio.current.srcObject = event.streams[0];
    };

    // Add local audio track(s)
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("send-local-candidate", to, from, e.candidate);
      }
    };

    // Create & send offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("send-offer", to, from, offer);
    console.log("send-offer");
  };

  /** Callee: handle offer */
  const handleReceiveOffer = async () => {
    console.log("Received offer");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStream.current = stream;
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    const peer = createPeer();
    peerRef.current = peer;
    if (peer.signalingState === "stable") {
      // Add local audio
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        console.log("Remote audio received");
        remoteAudio.current.srcObject = event.streams[0];
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("send-candidate", to, e.candidate);
        }
      };

      peerRef.current
        .setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerRef.current.createAnswer())
        .then((answer) => {
          console.log("send-answer", answer);
          peerRef.current.setLocalDescription(answer);
          socket.emit("send-answer", to, answer);
        })
        .then(() => {
          // 2. Apply any candidates that arrived early
          iceCandidate.forEach((c) => {
            console.log("ice-candidate", c);
            peerRef.current
              .addIceCandidate(new RTCIceCandidate(c))
              .catch(console.error);
          });
        })
        .catch((err) => {
          console.error("Error handling SDP:", err);
        });
    }
  };

  /** Caller: handle answer */
  const handleReceiveAnswer = async (answer) => {
    console.log("Received answer");
    if (
      peerRef.current &&
      peerRef.current.signalingState === "have-local-offer"
    ) {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  /** Both: handle ICE candidates */
  const handleReceiveCandidate = (candidate) => {
    console.log("receive-candidate", candidate);
    if (peerRef.current) {
      const iceCandidate = new RTCIceCandidate(candidate);
      peerRef.current.addIceCandidate(iceCandidate);
    }
  };

  /** Peer setup (common for caller & callee) */
  const createPeer = () => {
    const peer = new RTCPeerConnection();

    // Debugging
    peer.onsignalingstatechange = () => {
      console.log("Signaling state:", peer.signalingState);
    };
    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
    };

    return peer;
  };

  /** Toggle mic */
  const toggleMic = () => {
    const enabled = !micEnabled;
    setMicEnabled(enabled);
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  /** End call */
  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (remoteAudio.current) {
      remoteAudio.current.srcObject = null;
    }
    // onEndCall();
  };

  return (
    <div className="card mt-4 p-4 text-center">
      <h5>Audio Call with {to.name}</h5>

      <div className="mt-3">
        <button
          className={`btn btn-${micEnabled ? "warning" : "secondary"} me-2`}
          onClick={toggleMic}
        >
          {micEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button className="btn btn-danger" onClick={endCall}>
          End Call
        </button>
      </div>

      <video ref={remoteAudio} autoPlay controls className="mt-4" />
    </div>
  );
};

export default VideoCall;
