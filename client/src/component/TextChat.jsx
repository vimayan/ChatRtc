import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../context/user/UserContext";
import ChatContext from "../context/chat/ChatContext";

const TextChat = ({ to, from }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef();
  const peerRef = useRef();
  const dataChannelRef = useRef();

  const userContext = useContext(UserContext);
  const { socket } = userContext;

  const chatContext = useContext(ChatContext);
  const { ExitChat } = chatContext;
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = socket;

    createPeerConnection(to);

    // Handle offer from other users
    socketRef.current.on("receive-offer", async (offer) => {
      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      console.log("peer.signalingState", peer.signalingState);
      if (peer.signalingState === "stable") {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit("send-answer", to, answer);

        createDataChannel(peer, false); // Create the data channel as the receiving peer
      }
    });

    // Handle answer from other users
    socketRef.current.on("receive-answer", (answer) => {
      if (
        peerRef.current &&
        peerRef.current.signalingState === "have-local-offer"
      ) {
        peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Handle ICE candidates
    socketRef.current.on("receive-candidate", (candidate) => {
      console.log("receive-candidate", candidate);
      const iceCandidate = new RTCIceCandidate(candidate);
      peerRef.current.addIceCandidate(iceCandidate);
    });

    return () => {
      // Remove socket listeners
      socketRef.current.off("receive-offer");
      socketRef.current.off("receive-answer");
      socketRef.current.off("receive-candidate");
    };
  }, [socket]);

  const handleExitChat = () => {
    if (peerRef.current) {
      peerRef.current.close(); // Close the peer connection
      peerRef.current = null; // Clear the reference
      console.log("closed connection");
      ExitChat(to);
    }
  }; // Define han  dleExit

  const createPeerConnection = (newUserId) => {
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    // Create the data channel on peer connection initiation
    createDataChannel(peer, true);

    // Handle ICE candidates
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("send-candidate", newUserId, e.candidate);
        console.log(peerRef.current.localDescription);
      }
    };

    // Create offer
    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socketRef.current.emit("send-offer", newUserId, offer);
      console.log("send-offer");
    });
  };

  const createDataChannel = (peer, isInitiator) => {
    let dataChannel;

    if (isInitiator) {
      // Create the data channel if initiating the peer connection
      dataChannel = peer.createDataChannel("chat");
      setupDataChannel(dataChannel);
      dataChannelRef.current = dataChannel;
      console.log("dataChannel", dataChannel);
    } else {
      // Receive the data channel on the other side
      peer.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
        dataChannelRef.current = dataChannel;
        console.log("dataChannel", dataChannel);
      };
    }
  };

  const setupDataChannel = (dataChannel) => {
    dataChannel.onopen = () => {
      console.log("Data channel is open");
    };

    dataChannel.onmessage = (event) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Peer", text: event.data },
      ]);
    };

    dataChannel.onclose = () => {
      socketRef.current.emit("exit-chat", to, from);
      console.log("Data channel is closed");
      dataChannelRef.current.close();
      dataChannelRef.current = null;
      handleExitChat();
    };
  };

  const sendMessage = () => {
    console.log("send message");
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", text: message },
      ]);
      setMessage(""); // Clear input
    }
    console.log("message readyState", dataChannelRef.current);
  };

  return (
    <div className="card mt-5">
      <div className="card-header d-flex justify-content-between">
        <h5>Chat with {to.name}</h5>
        <button className="btn btn-sm btn-danger" onClick={handleExitChat}>
          Back
        </button>
      </div>
      <div className="card-body">
        <div
          style={{
            border: "1px solid black",
            padding: "10px",
            width: "300px",
            height: "200px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender}:</strong> {msg.text}
            </p>
          ))}
        </div>
        <input
          className="form-control"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-primary mt-2" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default TextChat;
