window.onload = async (event) => {

    // DOM要素を取得
    const joinVideoRoomBtn = document.getElementById("joinVideoRoom");
    const startStreamingBtn = document.getElementById("startStreaming");
    const stopStreamingBtn = document.getElementById("stopStreaming");
    const identityField = document.getElementById('identity');
    const roomField = document.getElementById('room');
 
    let room;
    let videoToken;
    let roomSid;


    // 配信開始ボタンのクリックイベント
    startStreamingBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        // 配信開始APIを呼び出し
        let response = await fetch('/create-broadcast', {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({roomSid: roomSid})
        });
        if (response && response.status === 200) {
            // ボタンの状態管理
            joinVideoRoomBtn.disabled = true;
            startStreamingBtn.disabled = true
            stopStreamingBtn.disabled = false;
        }
    });

    // 配信停止ボタンのクリックイベント
    stopStreamingBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        // 配信停止APIを呼び出し
        let response = await fetch('/stop-broadcast', {
            method: 'POST',
        });
        if (response && response.status === 200) {
            // ボタンの状態管理
            joinVideoRoomBtn.disabled = true;
            startStreamingBtn.disabled = false
            stopStreamingBtn.disabled = true;
        
        }
    });

    
    // ビデオルームに参加する場合
    joinVideoRoomBtn.addEventListener('click', async (event) => {
        event.preventDefault();
    
        // ユーザー名・ルーム名を取得
        const identity = identityField.value;
        const roomName = roomField.value;

        // アクセストークンをリクエスト
        let response = await fetch('/video-token', {
            method: 'POST',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({identity: identity, room: roomName})
        });
    
        let jsonResponse = await response.json();
        videoToken = jsonResponse.token;
        room = jsonResponse.room;
        roomSid = jsonResponse.roomSid;
        
        // ビデオチャットを開始
        startVideoChat(videoToken, room);

    });

    async function startVideoChat(token, room) {
        // Video Client SDKを使用し、Roomに接続
        let videoRoom = await Twilio.Video.connect(
            token, {
             room: room,
             audio: true,
             video: true
         });
    
         if (videoRoom) {
             console.log('state management');
             // ボタンの状態管理
            joinVideoRoomBtn.disabled = true;
            startStreamingBtn.disabled = false;
            stopStreamingBtn.disabled = true;
         }
         console.log(videoRoom);
    
        // ローカル参加者を自分の画面に追加    
        participantConnected(videoRoom.localParticipant);
     
        // 現在のルーム参加者をページに追加
        videoRoom.participants.forEach(participantConnected);
    
        // Roomに新たに参加者が追加された場合のイベントハンドラを指定
        videoRoom.on('participantConnected', participantConnected);
        
        // Roomから参加者が退出した場合のイベントハンドラを指定
        videoRoom.on('participantDisconnected', participantDisconnected);
    
        // Roomから自分自身が退出した際の処理
        videoRoom.once('disconnected', (room) => {
            console.log(room.state);
        })
    
        // ブラウザーのクローズやリロードの処理
        window.addEventListener('beforeunload', tidyUp(videoRoom));
        window.addEventListener('pagehide', tidyUp(videoRoom));
    }
    
    function participantConnected(participant) {
    
        //  デバッグ用に出力
        console.log(`${participant.identity}がRoomに参加しました。`)
    
        // <Div>要素を作成。参加者のidentityをIDに設定
        const el = document.createElement('div');
        el.setAttribute('id', participant.identity);
        el.setAttribute('class', 'participant');
    
        // 参加者一覧に追加
        const participants = document.getElementById('participants');
        participants.appendChild(el);
    
        // 参加者のトラック（映像、音声）をページに追加
        participant.tracks.forEach((trackPublication) => {
            trackPublished(trackPublication, participant);
        })
    
        // 参加者が新しくパブリッシュした場合のイベントハンドラを登録
        participant.on('trackPublished', trackPublished)
    }
    
    // トラックがパブリッシュされた際の処理
    function trackPublished(trackPublication, participant) {
        // 事前に作成した参加者のIdentityをIDにした<div>要素を取得
        const el = document.getElementById(participant.identity);
    
         // トラックの購読処理
         const trackSubscribed = (track) => {
            // trackの種類に合わせて<video> <audio>タグを要素に追加
            el.appendChild(track.attach())
            // デバッグ用に出力
            console.log(`${track}のサブスクライブ後処理を完了しました。`)
         };
    
        // トラックの公開を通知
        if (trackPublication.track)
            trackSubscribed(trackPublication.track);
        
        // パブリッシュされたトラックのサブスクライブイベントハンドラを登録
        trackPublication.on('subscribed', trackSubscribed);
    }
    
    // 参加者が接続解除した際の処理
    function participantDisconnected(participant) {
        participant.removeAllListeners();
        const el = document.getElementById(participant.identity);
        el.remove();
    }
    
    // トラックがアンパブリッシュされた際の処理
    function trackUnpublished(trackPublication) {
        trackPublication.track.detach().forEach(function (mediaElement) {
        mediaElement.remove();
        });
    }
    
    // 退出処理
    function tidyUp(room) {
        return function (event) {
            if (event.persisted) {
                console.log('is this a case?');
                return;
            }
            if (room) {
                room.disconnect();
                room = null;
            }
        };
    }
};

