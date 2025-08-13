import React, { useEffect, useRef, useState } from "react";

const AudioCall = ({ socket, from, to, onEndCall }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);

  const peerRef = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(null);

  useEffect(() => {
    initCall();

    socket.on("receive-offer", async (offer) => {
      console.log("Received offer");
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        remoteAudio.current.srcObject = event.streams[0];
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("send-candidate", to, e.candidate);
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("send-answer", to, answer);
      setCallAccepted(true);
    });

    socket.on("receive-answer", (answer) => {
      peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
    });

    socket.on("receive-candidate", (candidate) => {
      peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-candidate");
      endCall();
    };
  }, []);

  const initCall = async () => {
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      remoteAudio.current.srcObject = event.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("send-candidate", to, e.candidate);
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("send-offer", to, offer);
  };

  const toggleMic = () => {
    const enabled = !micEnabled;
    setMicEnabled(enabled);
    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  };

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

    onEndCall();
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

      <audio ref={remoteAudio} autoPlay controls className="mt-4" />
    </div>
  );
};

export default AudioCall;
