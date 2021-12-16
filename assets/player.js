window.onload = async (event) => {
    const { Player } = Twilio.Live;

    // DOM要素を取得
    const joinStreaming = document.getElementById("joinStreaming");
    const videoDiv = document.getElementById("videoDiv");
    let el;


    // 参加ボタンがクリックされた場合
    joinStreaming.addEventListener("click", async (event) => {
        event.preventDefault();
        // ここから実装を開始
        // 現在接続しているホストとプロトコルを確認
        const {
            host,
            protocol
        } = window.location;
        
        // ブラウザーサポートを確認
        if (Player.isSupported) {
            // 2-3. サポートされている場合            
            // アクセストークンをリクエスト
            const response = await fetch('/live-access-token', {
                method: 'GET',
            });
    
            const {token} = await response.json();
    
            
            // アクセストークンを用いてストリーミングに接続
            const player = await Player.connect(token, {
                playerWasmAssetsPath: `${protocol}//${host}`,
            });

            if (player) {
                // ボタンの状態管理
                joinStreaming.disabled = true;
            }
            // 2-4.はこちらから開始
            // ストリーミングの再生を開始
            player.play();

            // 画面にビデオ要素を追加
            el = player.videoElement
            videoDiv.appendChild(el);

            // 2-5.はこちらから開始
            // ストリーミングの状態が変更された場合
            player.on("stateChanged", (state) => {
                console.log(state);
                switch(state) {
                    case Player.State.Ended:
                        // ストリーミングが終了した場合はビデオ要素を削除し、ボタンの状態を変更する
                        videoDiv.removeChild(el);
                        el = undefined;
                        joinStreaming.disabled = false;
                        
                }
            });
        } else {
            console.log('サポートされていないブラウザです。');
        }
    });
};