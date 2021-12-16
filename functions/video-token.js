exports.handler = async function (context, event, callback) {

  
  // Twilio資格情報を取得
  const { ACCOUNT_SID, API_KEY, API_SECRET } = context;
  
  // リクエストからユーザー名とビデオルームを取得
  const IDENTITY = event.identity;
  const ROOM = event.room;

  // Twilio Nodeヘルパーライブラリを初期化
  const client = require('twilio')(
    API_KEY, API_SECRET, {accountSid: ACCOUNT_SID});
  
  let room;
  try {
    // 進行中のビデオチャットルームを一意の名前で検索
    let rooms = await client.video.rooms.list({
      status : 'in-progress',
      uniqueName: ROOM
    });
  
    // ビデオルームが存在するかを確認
    if (rooms.length)
      room = rooms[0];
    else {
      // 存在しない場合は作成
      room = await client.video.rooms.create({ 
        uniqueName: ROOM,
        type: 'group'
      });
    }// ここまで  
    console.log(`Video Room found/created: ${room}`);
  }
  catch(error) {
    // エラーの場合
    console.error(error);
    callback(error);
  }

  // アクセストークンおよびビデオ権限オブジェクトを取得
  const { AccessToken } = Twilio.jwt;
  const { VideoGrant } = AccessToken;

  // 特定のルームに接続を許可する
  const grant = new VideoGrant();
  grant.room = ROOM;

  const accessToken = new AccessToken(
    ACCOUNT_SID, API_KEY, API_SECRET);

  accessToken.addGrant(grant);
  accessToken.identity = IDENTITY;

  const response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  response.appendHeader('Content-Type', 'application/json');
  response.setBody({ token: accessToken.toJwt(), room: ROOM, roomSid: room.sid});
  callback(null, response);
};