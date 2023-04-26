require()

AFRAME.registerComponent('video-stream', {

  init() {
    const peer = new Peer("squatmaster-oculus");

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia(
        { video: true, audio: true },
        (stream) => {
          call.answer(stream); // Answer the call with an A/V stream.
          call.on("stream", (remoteStream) => {
            // Show stream in some <video> element.
          });
        },
        (err) => {
          console.error("Failed to get local stream", err);
        },
      );
    });
  }
})