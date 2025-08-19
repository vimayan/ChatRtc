import React, { useContext, useEffect, useRef, useState } from "react";
import UserContext from "../context/user/UserContext";
import ChatContext from "../context/chat/ChatContext";
const TextChat = ({ to, from, offer, iceCandidate }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const peerRef = useRef();
  const dataChannelRef = useRef();
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);

  const userContext = useContext(UserContext);
  const { socket } = userContext;

  const chatContext = useContext(ChatContext);
  const { ExitChat } = chatContext;
  useEffect(() => {
    console.log(to, from, "to-from");
    // Initialize socket connection
    if (!offer) {
      createPeerConnection(to);
    } else {
      console.log("receive-offer-peer", offer);
      const peer = new RTCPeerConnection();
      peerRef.current = peer;

      console.log("peer.signalingState", peerRef.current.signalingState);

      // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      //   // localStreamRef.current = stream;
      //   stream.getTracks().forEach((track) => {
      //     console.log("local audio", track);
      //     peer.addTrack(track, stream);
      //   });
      // });

      // peer.ontrack = (event) => {
      //   console.log("Remote audio received");
      //   remoteAudioRef.current.srcObject = event.streams[0];
      //   remoteAudioRef.current.play();
      // };

      peerRef.current.ondatachannel = (event) => {
        console.log("dataChannel", event.channel);
        dataChannelRef.current = event.channel;
        setupDataChannel(event.channel);
      }; // Create the data channel as the receiving peer

      peerRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          console.log("ice-send", peerRef.current.localDescription);
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

    // Handle offer from other users
    // socket.on("receive-offer", async (offer) => {
    //   const peer = new RTCPeerConnection();
    //   peerRef.current = peer;
    //   console.log("peer.signalingState", peer.signalingState);
    //   if (peer.signalingState === "stable") {
    //     createDataChannel(peer, false);
    //     // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    //     //   // localStreamRef.current = stream;
    //     //   stream.getTracks().forEach((track) => {
    //     //     console.log("local audio", track);
    //     //     peer.addTrack(track, stream);
    //     //   });
    //     // });
    //     // peer.ontrack = (event) => {
    //     //   console.log("Remote audio received");
    //     //   remoteAudioRef.current.srcObject = event.streams[0];
    //     //   remoteAudioRef.current.play();
    //     // };

    //     await peer.setRemoteDescription(new RTCSessionDescription(offer));

    //     const answer = await peer.createAnswer();
    //     await peer.setLocalDescription(answer);
    //     socket.emit("send-answer", to, answer);

    //     // createDataChannel(peer, false); // Create the data channel as the receiving peer
    //   }
    // });

    // Handle answer from other users
    socket.on("receive-answer", (answer) => {
      console.log("Received answer", answer, peerRef.current.signalingState);
      if (
        peerRef.current &&
        peerRef.current.signalingState === "have-local-offer"
      ) {
        peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Handle ICE candidates
    socket.on("receive-candidate", (candidate) => {
      console.log("receive-candidate", candidate);
      const iceCandidate = new RTCIceCandidate(candidate);
      peerRef.current.addIceCandidate(iceCandidate);
    });

    // return () => {
    //   // Remove socket listeners
    //   socket.off("receive-answer");
    // };
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

    // navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    //   // localStreamRef.current = stream;
    //   stream.getTracks().forEach((track) => {
    //     console.log("local audio", track);
    //     peer.addTrack(track, stream);
    //   });
    // });

    // peer.ontrack = (event) => {
    //   console.log("Remote audio received");
    //   remoteAudioRef.current.srcObject = event.streams[0];
    //   remoteAudioRef.current.play();
    // };

    // Create the data channel on peer connection initiation
    createDataChannel();

    // Handle ICE candidates
    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("send-local-candidate", to, from, e.candidate);
        console.log(peerRef.current.localDescription);
      }
    };

    // Create offer
    peerRef.current.createOffer().then((offer) => {
      peerRef.current.setLocalDescription(offer);
      socket.emit("send-offer", to, from, offer);
      console.log("send-offer");
    });
  };

  const createDataChannel = () => {
    dataChannelRef.current = peerRef.current.createDataChannel("chat");
    setupDataChannel(dataChannelRef.current);
    console.log("dataChannel-create", dataChannelRef.current);
  };

  // const createDataChannel = (peer, isInitiator) => {
  //   let dataChannel;

  //   dataChannel = peer.createDataChannel("chat");
  //   setupDataChannel(dataChannel);
  //   dataChannelRef.current = dataChannel;
  //   console.log("dataChannel-create", dataChannel);

  //   peer.ondatachannel = (event) => {
  //     dataChannel = event.channel;
  //     setupDataChannel(dataChannel);
  //     dataChannelRef.current = dataChannel;
  //     console.log("dataChannel-setup", dataChannel);
  //   };

  //   // if (isInitiator) {
  //   //   // Create the data channel if initiating the peer connection
  //   //   dataChannel = peer.createDataChannel("chat");
  //   //   setupDataChannel(dataChannel);
  //   //   dataChannelRef.current = dataChannel;
  //   //   console.log("dataChannel-create", dataChannel);
  //   // } else {
  //   //   // Receive the data channel on the other side
  //   //   peer.ondatachannel = (event) => {
  //   //     dataChannel = event.channel;
  //   //     setupDataChannel(dataChannel);
  //   //     dataChannelRef.current = dataChannel;
  //   //     console.log("dataChannel-setup", dataChannel);
  //   //   };
  //   // }
  // };

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
      socket.emit("exit-chat", to, from);
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
        <div>
          <audio ref={remoteAudioRef} autoPlay controls className="mt-3" />
        </div>
      </div>
    </div>
  );
};

export default TextChat;
