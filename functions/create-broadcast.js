exports.handler = async function (context, event, callback) {

  // 環境変数からTwilio資格情報を取得
  const { ACCOUNT_SID, API_KEY, API_SECRET } = context;

  // 環境変数からSync Service SIDを取得
  const { SYNC_SERVICE_SID } = context;


  // ここから実装を開始


  callback(null, '');
};