const AudioReducer = (state, action) => {
  switch (action.type) {
    case "SET_CURRENT_AUDIO_CHAT":
      return {
        ...state,
        currentAudioChat: action.payload,
      };

    case "RECEIVED_AUDIO_CHAT_REQUEST":
      return {
        ...state,
        audioChatRequests: [action.payload, ...state.audioChatRequests],
      };

    case "REMOVE_AUDIO_CHAT_REQUEST":
      return {
        ...state,
        audioChatRequests: state.audioChatRequests.filter((u) => u !== action.payload),
      };

    case "SET_AUDIO_ICE_CANDIDATE":
      return {
        ...state,
        audioIceCandidates: {
          ...state.audioIceCandidates,
          [action.payload.from.id]: [
            ...(state.audioIceCandidates[action.payload.from.id] || []),
            action.payload.candidate,
          ],
        },
      };

    case "CLEAR_AUDIO_ICE_CANDIDATE":
      const updatedIceCandidates = { ...state.audioIceCandidates };
      delete updatedIceCandidates[action.payload];
      return {
        ...state,
        audioIceCandidates: updatedIceCandidates,
      };

    case "SET_AUDIO_OFFER":
      return {
        ...state,
        audioOffers: {
          ...state.audioOffers,
          [action.payload.from.id]: action.payload.offer,
        },
      };

    case "CLEAR_AUDIO_OFFER":
      const updatedOffers = { ...state.audioOffers };
      delete updatedOffers[action.payload];
      return {
        ...state,
        audioOffers: updatedOffers,
      };

    case "AUDIO_CHAT_ERROR":
      return {
        ...state,
        audioChatError: action.payload,
      };
    default:
      return state;
  }
};

export default AudioReducer;
