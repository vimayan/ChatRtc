import React, { useReducer } from "react";
import AudioContext from "./AudioContext";
import AudioReducer from "./AudioReducer";

function AudioAction(props) {
  const audioInitial = {
    currentAudioChat: null,
    audioChatRequests: [],
    audioIceCandidates: {},
    audioOffers: {},
    audioChatError: {},
  };

  const [useState, dispatch] = useReducer(AudioReducer, audioInitial);
  const setCurrentAudioChat = async (user) => {
    dispatch({
      type: "SET_AUDIO_CURRENT_CHAT",
      payload: user,
    });
  };
  // const addAudioReceivedRequests = async (socket) => {
  //   socket.on("receive-audio-chat-request", (newUserId) => {
  //     console.log(`Received Request: ${newUserId}`);
  //     dispatch({
  //       type: "RECEIVED_AUDIO_CHAT_REQUEST",
  //       payload: newUserId,
  //     });
  //   });
  // };
  // const updateAudioReceivedRequests = async (socket) => {
  //   socket.on("cancelled-audio-chat-request", (cancelledUser) => {
  //     console.log(`Request Cancelled: ${cancelledUser}`);
  //     dispatch({
  //       type: "REMOVE_CHAT_REQUEST",
  //       payload: cancelledUser,
  //     });
  //   });
  // };
  const createAudioChatrequest = (newUser, socket) => {
    console.log("createChatrequest", newUser);
    socket.emit("audio-chat-user", socket.id, newUser.id);
    setCurrentAudioChat(newUser);
  };
  const exitAudioChat = (to) => {
    setCurrentAudioChat(null);
    dispatch({
      type: "REMOVE_AUDIO_CHAT_REQUEST",
      payload: to.id,
    });
  };
  const setAudioIceCandidates = (from, candidate) => {
    console.log("setAudioIceCandidates", from, candidate);
    dispatch({
      type: "SET_AUDIO_ICE_CANDIDATE",
      payload: { from, candidate },
    });
  };
  const setAudioOffers = (from, offer) => {
    console.log("setOffers", from, offer);
    dispatch({
      type: "SET_AUDIO_OFFER",
      payload: { from, offer },
    });
  };
  const clearAudioConnections = (from) => {
    dispatch({
      type: "CLEAR_AUDIO_ICE_CANDIDATE",
      payload: from.id,
    });
    dispatch({
      type: "CLEAR_AUDIO_OFFER",
      payload: from.id,
    });
  };
  return (
    <AudioContext.Provider
      value={{
        currentAudioChat: useState.currentAudioChat,
        audioChatRequests: useState.audioChatRequests,
        audioIceCandidates: useState.audioIceCandidates,
        audioOffers: useState.audioOffers,
        audioChatError: useState.audioChatError,
        setCurrentAudioChat,
        // addAudioReceivedRequests,
        // updateAudioReceivedRequests,
        createAudioChatrequest,
        exitAudioChat,
        setAudioOffers,
        setAudioIceCandidates,
        clearAudioConnections,
      }}
    >
      {props.children}
    </AudioContext.Provider>
  );
}

export default AudioAction;
