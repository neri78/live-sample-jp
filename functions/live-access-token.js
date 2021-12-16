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


  // ここより下は変更しない

  // コールバック関数を呼び出し
  callback(error, response)
};