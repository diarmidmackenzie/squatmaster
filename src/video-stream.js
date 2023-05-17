/* global: Peer */
import { Peer } from "peerjs";

if (!window.location.href.includes("phone.html")) {

  const peer = new Peer("squatmaster-oculus");

  peer.on("connection", (conn) => {
    conn.on("data", (data) => {
      // Will print 'hi!'
      console.log(data);
    });
    conn.on("open", () => {
      conn.send("hello!");
    });
  });

  peer.on('call', call => {
    // Answer the call
    call.answer(null);

    // Disable sending any media
    call.on('stream', stream => {

      const videoEl = document.getElementById("video1")

      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream
        videoEl.play()
      }
    });
  });
}
