exports.handler = async function (context, event, callback) {

  // 環境変数からTwilio資格情報を取得
  const { ACCOUNT_SID, API_KEY, API_SECRET } = context;

  // 環境変数からSync Service SIDを取得
  const { SYNC_SERVICE_SID } = context;


  // ここから実装を開始
  // Video Room SIDをリクエストから取得
  const roomSid = event.roomSid;

  // Twilio Nodeヘルパーライブラリを初期化
  const client = require('twilio')(
    API_KEY, 
    API_SECRET, 
    {accountSid: ACCOUNT_SID});

  // PlayerStreamerを作成
  const playerStreamer = await client.media.playerStreamer.create();
  console.log(`PlayerStramerが作成されました - ${playerStreamer.sid}`);

  // MediaProcessorを作成
  const mediaProcessor = await client.media.mediaProcessor.create({
    extension: 'video-composer-v1',
    extensionContext: JSON.stringify({
      room: { name: roomSid },
      outputs: [playerStreamer.sid]
    })
  });
  console.log(`MediaProcessorが作成されました - ${mediaProcessor.sid}`);

  // Documentの名前
  const documentName = 'streaming_info';

  // 保存するデータ
  const jsonData = JSON.stringify({
    roomSid : roomSid,
    playerStreamerSid : playerStreamer.sid,
    mediaProcessorSid : mediaProcessor.sid
  });


  // ドキュメントを検索
  let syncDocuments = await client.sync.services(SYNC_SERVICE_SID)
    .documents
    .list({
      documentName: documentName
    });

  // 存在していればそちらを更新
  if (syncDocuments.length) {
    syncDocument = syncDocuments[0];
    await syncDocument.update({ data: jsonData });
  }
  else {
    // 存在していなければ作成
    syncDocument = await client.sync.services(SYNC_SERVICE_SID)
      .documents.create({
        uniqueName: documentName,
        data: jsonData
      });
  }
  console.log(`Syncにデータを保存しました - ${syncDocument.sid}`);

  callback(null, '');
};