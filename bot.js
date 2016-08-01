//require twit library
var Twit = require('twit'),
		config = require('./config'),
    imgGen = require('js-image-generator'),
    request = require('request'),
    fs = require('fs'),
		T = new Twit(config);
// search for the following


var stream = T.stream('user')

var follower ;
stream.on('follow', function (event) {
	console.log('new follower')
	follower =  'Gracias por reguirme @'+event.source.screen_name+ ' aquí tienes un gato: (estoy probando un bot)';
  tweetCat();
});

//Tweet a cat function (the crazy stuff)
function tweetCat(){
  //first I download a random cat image from  the cat API
  var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename).on('close', callback));
    });
  };

  download('http://thecatapi.com/api/images/get?format=src&type=png', 'cat.png', function(){
    console.log('thank you cat tweet posted');
  });

  //next I encode de image so it's readable by the API
  var b64img = fs.readFileSync('./cat.png', { encoding: 'base64' })

  // first we must post the image to Twitter before tweeting
  T.post('media/upload', { media_data: b64img }, function (err, data, response) {
    // now we can assign alt text to the media, for use by screen readers and
    // other text-based presentations and interpreters
    var mediaIdStr = data.media_id_string
    var altText = "random cat."
    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

    T.post('media/metadata/create', meta_params, function (err, data, response) {
      if (!err) {
        // now we can reference the media and post a tweet (media will attach to the tweet)
        var params = { status:  follower  , media_ids: [mediaIdStr] }

        T.post('statuses/update', params, function (err, data, response) {
          console.log('image posted')
        })
      }
    })
  })
}//end tweetCat()
