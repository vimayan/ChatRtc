import React, { useReducer } from "react";
import UserReducer from "./UserReducer";
import UserContext from "./UserContext";

function UserAction(props) {
  const userInitial = {
    userName: "",
    socketId: "",
    iceCandidates: {},
    offers: {},
    peerConnection: {},
    dataChannel: {},
    socket: null,
    error: {},
  };

  const [state, dispatch] = useReducer(UserReducer, userInitial);
  const socketConnection = async (socket) => {
    // Handle new user connection
    console.log("socket", socket);
    dispatch({
      type: "CREATE_SOCKET",
      payload: socket,
    });
  };
  const createUser = async (userName, socketId) => {
    dispatch({
      type: "CREATE_USER",
      payload: { userName, socketId },
    });
  };

  const handleRegister = (user_name) => {
    if (user_name) {
      state.socket.emit("register", user_name, () => {
        dispatch({
          type: "CREATE_USER",
          payload: { userName: user_name, socketId: state?.socket.id },
        });
      });
    }
  };

  const setPeer = async (peer) => {
    dispatch({
      type: "CREATE_PEER",
      payload: peer,
    });
  };
  const addDataChannel = async (channelName, newChannel) => {
    const addedChannel = {};
    addedChannel[channelName] = newChannel;
    dispatch({
      type: "ADD_CHANNEL",
      payload: { ...addedChannel },
    });
  };

  const createPeerConnection = (newUserId) => {
    const peer = new RTCPeerConnection();

    // Create the data channel on peer connection initiation
    createDataChannel(peer, true);

    // Handle ICE candidates
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        state.socket.emit("send-candidate", newUserId, e.candidate);
        console.log(peer.localDescription);
      }
    };

    // Create offer
    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      state.socket.emit("send-offer", newUserId, offer);
      console.log("send-offer");
    });

    dispatch({
      type: "CREATE_PEER",
      payload: peer,
    });
  };

  const createDataChannel = (peer, isInitiator) => {
    let dataChannel;

    if (isInitiator) {
      // Create the data channel if initiating the peer connection
      dataChannel = peer.createDataChannel("chat");
      setupDataChannel(dataChannel);
      dispatch({
        type: "CREATE_DATA_CHANNEL",
        payload: dataChannel,
      });
      console.log("dataChannel", dataChannel);
    } else {
      // Receive the data channel on the other side
      peer.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
        dispatch({
          type: "CREATE_DATA_CHANNEL",
          payload: dataChannel,
        });
        console.log("dataChannel", dataChannel);
      };
    }
  };

  const setupDataChannel = (dataChannel) => {
    dataChannel.onopen = () => {
      console.log("Data channel is open");
    };

    dataChannel.onmessage = (event) => {
      console.log(event.data);
      // setMessages((prevMessages) => [
      //   ...prevMessages,
      //   { sender: "Peer", text: event.data },
      // ]);
    };

    // dataChannel.onclose = () => {
    //   socket.emit("exit-chat", to, from);
    //   console.log("Data channel is closed");
    //   dataChannelRef.current.close();
    //   dataChannelRef.current = null;
    //   handleExitChat();
    // };
  };

  const receiveOffer = async (to) => {
    state.socket.on("receive-offer", async (offer) => {
      const peer = new RTCPeerConnection();

      console.log("peer.signalingState", peer.signalingState);
      if (peer.signalingState === "stable") {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        state.socket.emit("send-answer", to, answer);

        createDataChannel(peer, false); // Create the data channel as the receiving peer

        dispatch({
          type: "CREATE_PEER",
          payload: peer,
        });
      }
    });
  };

  const receiveAnswer = async () => {
    // Handle answer from other users
    state.socket.on("receive-answer", (answer) => {
      if (
        state.peerConnection &&
        state.peerConnection.signalingState === "have-local-offer"
      ) {
        state.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });
  };
  const receiveCandidate = (peer) => {
    console.log(peer instanceof RTCPeerConnection, "peeer");
    // Handle ICE candidates
    state.socket.on("receive-candidate", (candidate) => {
      console.log("receive-candidate", candidate);
      const iceCandidate = new RTCIceCandidate(candidate);
      peer.addIceCandidate(iceCandidate);
    });
  };
  const setIceCandidates = (from, candidate) => {
    console.log("setIceCandidates", from, candidate);
    dispatch({
      type: "SET_ICE_CANDIDATE",
      payload: { from, candidate },
    });
  };
  const setOffers = (from, offer) => {
    console.log("setOffers", from, offer);
    dispatch({
      type: "SET_OFFER",
      payload: { from, offer },
    });
  };
  const clearConnections = (from) => { 
    dispatch({
      type: "CLEAR_ICE_CANDIDATE",
      payload: from.id,
    });
    dispatch({
      type: "CLEAR_OFFER",
      payload: from.id,
    });
  };
  return (
    <UserContext.Provider
      value={{
        userName: state.userName,
        socketId: state.socketId,
        peerConnection: state.peerConnection,
        dataChannel: state.dataChannel,
        socket: state.socket,
        iceCandidates: state.iceCandidates,
        offers: state.offers,
        error: state.error,
        socketConnection,
        createUser,
        handleRegister,
        createPeerConnection,
        createDataChannel,
        receiveOffer,
        receiveAnswer,
        receiveCandidate,
        setPeer,
        addDataChannel,
        setIceCandidates,
        setOffers,
        clearConnections,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export default UserAction;
