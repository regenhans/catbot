//require twit library
var Twit = require('twit'),
		config = require('./config'),
    imgGen = require('js-image-generator'),
    request = require('request'),
    fs = require('fs'),
		T = new Twit(config);
// search for the following
var query = {
  //follow: '263809798'// @trafico_zmg twitter ID's => 263809798
  follow: '236640161' //ID for testing
  // (you can find the id of a twitter account here : https://tweeterid.com/)
}

// init stream
var stream = T.stream('statuses/filter', query)

//show me tweets every time the user creates a tweet with one of the keywords
var filteredTweet;

stream.on('tweet', function (tweet) {
  for (var i = 0; i < keywords.length; i++) {
      if(tweet.text.indexOf(keywords[i]) != -1){

        var filteredTweet = tweet.text;
        console.log(filteredTweet);
        tweetIt();
        break; //end loop if at least one word finded
      }
  }

});
//Tweet a cat

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
    console.log('cat done');
  });

  //next i encode de image so it's readable by the API
  var b64img = fs.readFileSync('./cat.png', { encoding: 'base64' })

  // first we must post the media to Twitter
  T.post('media/upload', { media_data: b64img }, function (err, data, response) {
    // now we can assign alt text to the media, for use by screen readers and
    // other text-based presentations and interpreters
    var mediaIdStr = data.media_id_string
    var altText = "random cat."
    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

    T.post('media/metadata/create', meta_params, function (err, data, response) {
      if (!err) {
        // now we can reference the media and post a tweet (media will attach to the tweet)
        var params = { status: 'Random cat: ', media_ids: [mediaIdStr] }

        T.post('statuses/update', params, function (err, data, response) {
          console.log(data)
          console.log('image posted')
        })
      }
    })
  })
}//end tweeit()

tweetCat();
