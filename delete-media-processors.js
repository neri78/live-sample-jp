'use strict;'
require('dotenv').config();

// Twilio資格情報を取得
const { ACCOUNT_SID, API_KEY, API_SECRET  } = process.env;
  
// Twilio Nodeヘルパーライブラリを初期化
const client = require('twilio')(
    API_KEY, API_SECRET, {accountSid: ACCOUNT_SID});

console.log('動作中のMediaProcessorを削除...')
client.media.mediaProcessor.list({status: 'started'})
    .then((processors) => {
        if (processors && processors.length === 0) {
            console.log('削除すべきMediaProcessorリソースがありません。')
        } else {
            processors.forEach((processor) => {
                client.media.mediaProcessor(processor.sid)
                            .update({status: 'ended'})
                            .then((result) => console.log(result))
                            .catch((err) => console.err(err));
            })
        }
});
console.log('動作中のPlayerStreamerを削除...')
client.media.playerStreamer.list({status: 'started'})
    .then((streamers) => {
        if (streamers && streamers.length === 0) {
            console.log('削除すべきPlayerStreamerリソースがありません。')
        } else {
            streamers.forEach((streamer) => {
                client.media.playerStreamer(streamer.sid)
                            .update({status: 'ended'})
                            .then((result) => console.log(result))
                            .catch((err) => console.err(err));
            })
        }
});