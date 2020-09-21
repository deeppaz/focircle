var DATAs = require('../data/minimalwhite.json');


var photo = fs.readFileSync(DATAs);

console.log(postedWT)

function postedWT(err, json) {
    var mpost_id = json.id_string
    tumblr.post('/post/edit/', { id: mpost_id, caption: tituName, tags: 'focircle,veil,mist,art,visualart,abstract,abstractart,abstractartist,generative,generativeart,fractal,fractalart,procgen,glitch,glitchart,modern,modernart,render,everyday,daily,terragen,aftereffects,dailyrender,digitalart' }, postedMessage);
}

function postedMessage(err, json) {
    var now = getDateTime()
    console.log('posted to tumblr: ' + now + " : " + " postid: " + JSON.stringify(json) + " / " + toString(json.short_url));
};

