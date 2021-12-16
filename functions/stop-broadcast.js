exports.handler = async function (context, event, callback) {


  // Twilio資格情報を取得
  const { ACCOUNT_SID, API_KEY, API_SECRET } = context;

  // 環境変数からSync Service SIDを取得
  const { SYNC_SERVICE_SID } = context;

  // Twilio Nodeヘルパーライブラリを初期化
  const client = require('twilio')(
    API_KEY, 
    API_SECRET, 
    {accountSid: ACCOUNT_SID});


  // ここから実装を開始
  // Sync Document名
  const documentName = 'streaming_info';

  // Sync Documentを取得
  let syncDocument  = await client.sync.services(SYNC_SERVICE_SID)
    .documents(documentName)
    .fetch();

    // ドキュメントが取得できた場合
    if (syncDocument) {
      // MediaProcessor Sidを取得
      const { mediaProcessorSid } = syncDocument.data;
      const result = await client.media.mediaProcessor(mediaProcessorSid)
        .update({
          status: 'ended'
        });
      console.log(`MediaProcessor ${result.sid} のステータスを ${result.status} に変更しました。`);
  
      if (result.status === 'ENDED') { 
        // Sync Documentを削除
        await client.sync.services(SYNC_SERVICE_SID)
        .documents(documentName)
        .remove();
      }
    }

  callback(null, '');
};