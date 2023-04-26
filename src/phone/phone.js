/* global: Peer */

const peer = new Peer("squatmaster-phone");

navigator.mediaDevices.getUserMedia(
	{ video: true, audio: true },
	(stream) => {
		const call = peer.call("squatmaster-oculus", stream);
	},
	(err) => {
		console.error("Failed to get local stream", err);
	},
);

