// import React, { useEffect, useRef, useState } from "react";

// const AudioCall = ({ socket, from, to, onEndCall }) => {
//   const [micEnabled, setMicEnabled] = useState(true);

//   const peerRef = useRef(null);
//   const localStream = useRef(null);
//   const remoteAudio = useRef(null);

//   useEffect(() => {
//     initCall();

//     socket.on("receive-offer", async (offer) => {
//       // const stream = await navigator.mediaDevices.getUserMedia({
//       //   audio: true,
//       // });
//       // localStream.current = stream;
//       // console.log("localAudio", stream);

//       console.log("Received offer");
//       const peer = new RTCPeerConnection();
//       if (peerRef.current) {
//         peerRef.current.close();
//       }
//       peerRef.current = peer;
//       if (peer.signalingState === "stable") {
//         await peer.setRemoteDescription(new RTCSessionDescription(offer));

//         const answer = await peer.createAnswer();
//         await peer.setLocalDescription(answer);
//         socket.emit("send-answer", to, answer);

//         navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//           localStream.current = stream;
//           stream.getTracks().forEach((track) => {
//             peer.addTrack(track, stream);
//           });
//         });
//         // stream.getTracks().forEach((track) => peer.addTrack(track, stream));
//         peer.ontrack = (event) => {
//           console.log(remoteAudio.current, "remoteAudio");
//           return (remoteAudio.current.srcObject = event.streams[0]);
//         };
//       }
//     });

//     socket.on("receive-answer", (answer) => {
//       if (
//         peerRef.current &&
//         peerRef.current.signalingState === "have-local-offer"
//       ) {
//         peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     socket.on("receive-candidate", (candidate) => {
//       console.log("receive-candidate", candidate);
//       const iceCandidate = new RTCIceCandidate(candidate);
//       peerRef.current.addIceCandidate(iceCandidate);
//     });

//     return () => {
//       socket.off("receive-offer");
//       socket.off("receive-answer");
//       socket.off("receive-candidate");
//       endCall();
//     };
//   }, []);

//   const initCall = async () => {
//     // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     // localStream.current = stream;
//     // console.log("localAudio", stream);

//     const peer = new RTCPeerConnection();

//     if (peerRef.current) {
//       peerRef.current.close();
//     }
//     peerRef.current = peer;

//     peer.onicecandidate = (e) => {
//       if (e.candidate) {
//         socket.emit("send-candidate", to, e.candidate);
//       }
//     };

//     // Create offer
//     peer.createOffer().then((offer) => {
//       peer.setLocalDescription(offer);
//       socket.emit("send-offer", to, offer);
//       console.log("send-offer");
//     });

//     // stream.getTracks().forEach((track) => peer.addTrack(track, stream));

//     navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//       localStream.current = stream;
//       stream.getTracks().forEach((track) => {
//         peer.addTrack(track, stream);
//       });
//     });
//     peer.ontrack = (event) => {
//       console.log(remoteAudio.current, "remoteAudio");
//       return (remoteAudio.current.srcObject = event.streams[0]);
//     };
//   };

//   const toggleMic = () => {
//     const enabled = !micEnabled;
//     setMicEnabled(enabled);
//     localStream.current.getAudioTracks().forEach((track) => {
//       track.enabled = enabled;
//     });
//   };

//   const endCall = () => {
//     if (peerRef.current) {
//       peerRef.current.close();
//       peerRef.current = null;
//     }

//     if (localStream.current) {
//       localStream.current.getTracks().forEach((track) => track.stop());
//       localStream.current = null;
//     }

//     if (remoteAudio.current) {
//       remoteAudio.current.srcObject = null;
//     }

//     onEndCall();
//   };

//   return (
//     <div className="card mt-4 p-4 text-center">
//       <h5>Audio Call with {to.name}</h5>

//       <div className="mt-3">
//         <button
//           className={`btn btn-${micEnabled ? "warning" : "secondary"} me-2`}
//           onClick={toggleMic}
//         >
//           {micEnabled ? "Mute Mic" : "Unmute Mic"}
//         </button>
//         <button className="btn btn-danger" onClick={endCall}>
//           End Call
//         </button>
//       </div>

//       <audio ref={remoteAudio} autoPlay controls className="mt-4" />
//     </div>
//   );
// };

// export default AudioCall;

import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../context/user/UserContext";

const AudioCall = ({ to, from, offer, iceCandidate }) => {
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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current = stream;

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    const peer = createPeer();
    peerRef.current = peer;

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("send-local-candidate", to, e.candidate);
      }
    };

    // Create & send offer
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("send-offer", to, offer);
    console.log("send-offer");

    // Add local audio track(s)
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      console.log(remoteAudio.current, "remoteAudio");
      return (remoteAudio.current.srcObject = event.streams[0]);
    };
  };

  /** Callee: handle offer */
  const handleReceiveOffer = async () => {
    console.log("Received offer");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("send-candidate", to, e.candidate);
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("send-answer", to, answer);
      peer.ontrack = (event) => {
        console.log(remoteAudio.current, "remoteAudio");
        return (remoteAudio.current.srcObject = event.streams[0]);
      };
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

    peer.ontrack = (event) => {
      console.log("Remote audio received");
      remoteAudio.current.srcObject = event.streams[0];
      remoteAudio.current.play();
    };

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

      <audio ref={remoteAudio} autoPlay controls className="mt-4" />
    </div>
  );
};

export default AudioCall;
