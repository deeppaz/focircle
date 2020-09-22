var Twit = require('twit');
var Tumblr = require('tumblrwks');
var fs = require('fs');
var DATAs = "./data/theleoisallinthemind.tumblr.com"
var fetch = require('node-fetch');

const imageDownloader = require('node-image-downloader')

var TwitterAPIs = require('./config/twitterApi');
var TumblrAPIs = require('./config/tumblrApi');
const postData = require('./data/minimalwhite');


//CLEAR TERMINAL
process.stdout.write('\x1B[2J\x1B[0f');
console.log("focircle getting ready...")

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

var posted = [];
var readyToPost = postData.posts;
setTimeout(function () { timer() }, midnight);

//REPEAT EVERY 3 HOURS FROM START TIME
function timer() {
    summon();
    setInterval(summon, 60 * 60 * 1000 * 3);
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

    var tituName = 'post ' + image.slice(0, -4) + ' / #focircle';
    var b64content = fs.readFileSync(DATAs + '/' + image, { encoding: 'base64' })

    T.post('media/upload', { media_data: b64content }, uploaded);

    function uploaded(err, data, response) {
        var mediaIdStr = data.media_id_string;
        var params = { status: tituName, media_ids: [mediaIdStr] }
        T.post('statuses/update', params, tweeted);
    };

    function tweeted(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            var now = getDateTime()
            console.log('posted to twitter: ' + now + ": " + data.text);
            // MOVE IMAGE TO ANOTHER FOLDER AS
            fs.renameSync(DATAs + "/" + image, DATAs + "/postedbefore/" + image);
        }
    };
};


// POST THE IMAGE ON TUMBLR
async function tumblr(image) {
    var currentPost = readyToPost.pop();
    console.log("Current:" + JSON.stringify(currentPost.photo_url_1280));
    posted.push(currentPost);

    var tumblr = new Tumblr(
        {
            consumerKey: TumblrAPIs.TUMBLR_CONSUMER_KEY,
            consumerSecret: TumblrAPIs.TUMBLR_CONSUMER_SKEY,
            accessToken: TumblrAPIs.TUMBLR_ACCESS_TOKEN,
            accessSecret: TumblrAPIs.TUMBLR_ACCESS_STOKEN
        }, "focircle.tumblr.com"
    );

    var myimage = currentPost.photo_url_1280

    imageDownloader({
        imgs: [
            {
                uri: myimage,

            }
        ],
        dest: './data/testdata', //destination folder
    })
        .then((info) => {
            console.log('all done', info);
            var photo = fs.readFileSync('./data/testdata' + '/' + currentPost.photo_url_1280.split("/").pop());
            // var tituName = 'focircle ' + image.slice(0, -4) + '—';

            //POST IMAGE AND THEN ADD CAPTION+TAGS
            tumblr.post('/post', { type: 'photo', data: [photo] }, postedWT);

            function postedWT(err, json) {
                console.log("CurrentPost : " + err);
                var mpost_id = json.id_string
                tumblr.post('/post/edit/', { id: mpost_id, caption: currentPost.photo_caption, tags: 'focircle,veil,mist,art,visualart,abstract,abstractart,abstractartist,generative,generativeart,fractal,fractalart,procgen,glitch,glitchart,modern,modernart,render,everyday,daily,terragen,aftereffects,dailyrender,digitalart' }, postedMessage);
            }

            function postedMessage(err, json) {
                var now = getDateTime()
                console.log('posted to tumblr: ' + now + " : " + " postid: " + JSON.stringify(json) + " / " + toString(json.short_url));
            };
        })
        .catch((error, response, body) => {
            console.log('something goes bad!')
            console.log(error)
        })
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
