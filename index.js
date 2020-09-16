var Twit = require('twit');
var Tumblr = require('tumblrwks');
var fs = require('fs');
var DATAs = "./data/theleoisallinthemind.tumblr.com"

var TwitterAPIs = require('./config/twitterApi');
var TumblrAPIs = require('./config/tumblrApi');

//CLEAR TERMINAL
process.stdout.write('\x1B[2J\x1B[0f');
console.log("summoning...")

//SET START TIME FROM CLI
var myArgs = process.argv.slice(2);
var hStart = myArgs[0];
var mStart = myArgs[1];

if (!mStart) { mStart = 0; }

//WAIT UNTIL START TIME
var now = new Date();
var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hStart, mStart, 0, 0) - now;
if (midnight < 0) {
    midnight += 86400000;
}

setTimeout(function () { timer() }, midnight);

//REPEAT EVERY 3 HOURS FROM START TIME
function timer() {
    summon();
    setInterval(summon, 60 * 60 * 1000 * 3);
    // setInterval(summon, 1000); //FOR TESTING
}

function summon() {
    var tituDATAs = pick(fs.readdirSync(DATAs));

    twitter(tituDATAs);
    tumblr(tituDATAs);
};

//POST THE IMAGE ON TWITTER
function twitter(image) {
    var T = new Twit(
        {
            consumer_key: TwitterAPIs.TWITTER_CONSUMER_KEY,
            consumer_secret: TwitterAPIs.TWITTER_CONSUMER_SKEY,
            access_token: TwitterAPIs.TWITTER_ACCESS_TOKEN,
            access_token_secret: TwitterAPIs.TWITTER_ACCESS_STOKEN,
        }
    );

    var vapourName = 'post ' + image.slice(0, -4) + ' / #focircle';
    var b64content = fs.readFileSync(DATAs + '/' + image, { encoding: 'base64' })

    T.post('media/upload', { media_data: b64content }, uploaded);

    function uploaded(err, data, response) {
        var mediaIdStr = data.media_id_string;
        var params = { status: vapourName, media_ids: [mediaIdStr] }
        T.post('statuses/update', params, tweeted);
    };

    function tweeted(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            var now = getDateTime()
            console.log('posted ' + now + ": " + data.text);
            // MOVE IMAGE TO ANOTHER FOLDER AS
            fs.rename(DATAs + "/" + image, DATAs + "/seen/" + image);
        }
    };
};


// POST THE IMAGE ON TUMBLR
function tumblr(image) {

    var tumblr = new Tumblr(
        {
            consumerKey: TumblrAPIs.TUMBLR_CONSUMER_KEY,
            consumerSecret: TumblrAPIs.TUMBLR_CONSUMER_SKEY,
            accessToken: TumblrAPIs.TUMBLR_ACCESS_TOKEN,
            accessSecret: TumblrAPIs.TUMBLR_ACCESS_STOKEN
        }, "focircle.tumblr.com"
    );

    var photo = fs.readFileSync(DATAs + '/' + image);
    var vapourName = 'vapour ' + image.slice(0, -4) + '—';

    //POST IMAGE AND THEN ADD CAPTION+TAGS
    tumblr.post('/post', { type: 'photo', data: [photo] }, function (err, json) {
        var blog_id = json.id;
        tumblr.post('/post/edit', { id: blog_id, caption: vapourName, tags: 'vapour,veil,mist,vapours,art,visualart,abstract,abstractart,abstractartist,generative,generativeart,fractal,fractalart,procgen,glitch,glitchart,modern,modernart,render,everyday,daily,terragen,aftereffects,dailyrender,digitalart' }, function (err, json) {
            console.log(json);
        });
    });
}


function getDateTime() {
    var date = new Date();
    var hour = date.getHours(); hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes(); min = (min < 10 ? "0" : "") + min;
    var sec = date.getSeconds(); sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1; month = (month < 10 ? "0" : "") + month;
    var day = date.getDate(); day = (day < 10 ? "0" : "") + day;
    return hour + ":" + min + ":" + sec;
}


function pick(arr) {
    try {
        var index = Math.floor(Math.random() * arr.length);
        return arr[index];
    } catch (e) {
        return arr;
    }
}
