/* global: Peer */
import { Peer } from "peerjs";

if (window.location.href.includes("phone.html")) {
  const peer = new Peer();

  const conn = peer.connect("squatmaster-oculus");
  conn.on("open", () => {
    conn.send("hi!");
    console.log("Sending hi!")
  });

  navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then((stream) => {
    const videoEl  = document.getElementById('video-feed')
    videoEl.srcObject = stream

    let call = peer.call("squatmaster-oculus", stream);
  })
  .catch((err) => {
    console.log('Failed to get local stream', err);
  });

}

