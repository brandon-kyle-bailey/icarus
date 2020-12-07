const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideo.srcObject = stream;
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play();
    })
    videoGrid.append(myVideo);

    myPeer.on('call', call => {
       call.answer(stream);
        const answerVideo = document.createElement('video');
       call.on('stream', answerVideoStream => {
            answerVideo.srcObject = answerVideoStream;
            answerVideo.addEventListener('loadedmetadata', () => {
                answerVideo.play();
            })
            videoGrid.append(answerVideo);
       });
    });
    
    socket.on('user-connected', userId => {
        const call = myPeer.call(userId, stream);
        const newVideo = document.createElement('video');
        call.on('stream', userVideoStream => {
            newVideo.srcObject = userVideoStream;
            newVideo.addEventListener('loadedmetadata', () => {
                newVideo.play();
            })
            videoGrid.append(newVideo);
        });
        call.on('close', () => {
            newVideo.remove();
        });

        peers[userId] = call;
    });

    socket.on('user-disconnected', userId => {
        if(peers[userId]) {
            peers[userId].close();
        }
    });

}).catch(err => console.log(err));

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});