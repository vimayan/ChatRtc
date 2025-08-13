import React, { useEffect, useRef, useState } from "react";
import AudioCall from "./AudioCall"; // Make sure this file exists

const ChatRoom = ({ socket, from, to, onExit, localStream }) => {
  const peerRef = useRef(null);
  const dataChannelRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showAudioCall, setShowAudioCall] = useState(false);

  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      localStream.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    });

    dataChannelRef.current = peer.createDataChannel("chat");
    setupDataChannel(dataChannelRef.current);

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("send-candidate", to, e.candidate);
      }
    };

    peer.ontrack = (e) => {
      remoteAudioRef.current.srcObject = e.streams[0];
    };

    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socket.emit("send-offer", to, offer);
    });

    socket.on("receive-answer", (answer) => {
      peer.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("receive-candidate", (candidate) => {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("receive-offer", async (offer) => {
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      peer.ondatachannel = (e) => setupDataChannel(e.channel);
      peer.ontrack = (e) => {
        remoteAudioRef.current.srcObject = e.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("send-answer", to, answer);

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("send-candidate", to, e.candidate);
        }
      };
    });

    return () => {
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-candidate");
      peerRef.current?.close();
    };
  }, []);

  const setupDataChannel = (channel) => {
    channel.onmessage = (e) => {
      setMessages((prev) => [...prev, { sender: to.name, text: e.data }]);
    };
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    dataChannelRef.current?.send(text);
    setMessages((prev) => [...prev, { sender: "You", text }]);
    setText("");
  };

  return (
    <div className="card mt-4 p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Chat with {to.name}</h5>
        <div>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => setShowAudioCall(!showAudioCall)}
          >
            {showAudioCall ? "Hide Audio Call" : "Start Audio Call"}
          </button>
          <button className="btn btn-danger btn-sm" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>

      <div className="chat-box border my-3 p-2" style={{ height: 200, overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        className="form-control"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button className="btn btn-primary mt-2" onClick={sendMessage}>
        Send
      </button>

      <audio ref={remoteAudioRef} autoPlay controls className="mt-3" />

      {showAudioCall && (
        <AudioCall
          socket={socket}
          from={from}
          to={to}
          onEndCall={() => setShowAudioCall(false)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
