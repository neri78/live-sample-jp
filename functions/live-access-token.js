exports.handler = async function (context, event, callback) {

  // Twilio資格情報を取得
  const { ACCOUNT_SID, API_KEY, API_SECRET } = context;

  // 環境変数からSync Service SIDを取得
  const { SYNC_SERVICE_SID } = context;

  // CallBack関数で渡すエラー、およびレスポンスオブジェクト
  let error = null;
  let response = null;

  // Twilio Nodeヘルパーライブラリを初期化
  const client = require('twilio')(
    API_KEY, 
    API_SECRET, 
    {accountSid: ACCOUNT_SID});

  // Syncに登録するドキュメントの名前を指定
  const documentName = 'streaming_info';

  // SyncオブジェクトからPlayerStreamerSIDを取得
  let syncDocument = await client.sync.services(SYNC_SERVICE_SID)
    .documents(documentName)
    .fetch();
  
  // ここから実装を開始
  // Documentを取得できている場合
  if (syncDocument) {
    
    // SyncオブジェクトからPlayerStreamerSIDを取得
    let playerStreamerSid = syncDocument.data.playerStreamerSid;

    
    // 1-3. はここから実装予定
        // アクセストークン並びにストリーミング再生権限を付与
        const { AccessToken } = Twilio.jwt;
        const { PlaybackGrant } = AccessToken;
    
        // アクセストークンの作成
        const accessToken = new AccessToken(
          ACCOUNT_SID, 
          API_KEY,
          API_SECRET);
    
        // 指定したPlayerStreamer IDに関する再生権限を取得
        let playbackGrant = await client.media.playerStreamer(playerStreamerSid)
          .playbackGrant()
          .create({ttl: 60});
        
        const wrappedPlaybackGrant = new PlaybackGrant({
          grant: playbackGrant.grant
        });
    
        // アクセストークンに権限を付与
        accessToken.addGrant(wrappedPlaybackGrant);
    
        // 1-4.はこちらから実装予定
        // レスポンスを作成
        response = new Twilio.Response();

        response.appendHeader('Access-Control-Allow-Origin', '*');
        response.appendHeader('Access-Control-Allow-Methods', 'GET');
        response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
        response.appendHeader('Content-Type', 'application/json');
        // レスポンスにトークンを追加
        response.setBody({ token: accessToken.toJwt() });

  } else {
    // このブロックに到達した場合はエラーとなる
    error = '問題が発生しました。'
  }

  // ここより下は変更しない

  // コールバック関数を呼び出し
  callback(error, response)
};