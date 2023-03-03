var mt;
var cwidth = 900;
var cheight = 400;
var ctx;
var firstpick = true;
var pickedtwo = false; // flag for attempted click-cheats, or just fast-clickers
var firstcard;
var secondcard;
var backcolor = "rgb(128,0,255)";
var frontbgcolor = "rgb(73,215,215)";
var polycolor = "rgb(254,11,0)";
var tablecolor = "rgb(200,200,200)";
var cardrad = 30;
var deck = [];
var firstsx = 30;
var firstsy = 50;
var margin = 25;
var cardwidth = 4*cardrad;
var cardheight = 4*cardrad;
var pairs = 2; //number of pairs of cards
var tid;
var matched;
var starttime;
var scoreboard = [];

//deck holds info on the cards: the location and dimensions and identifying info
//identifying (matching) info in this case is the number of sides for the poly

function Card(sx,sy,swidth,sheight,info) {
this.sx = sx;
this.sy = sy;
this.swidth = swidth;
this.sheight = sheight;
this.info = info;
this.draw = drawback;
}

//generate deck of cards in pairs of polygons
function makedeck() {

var i;
var acard;
var bcard;
var cx = firstsx;
var cy = firstsy;

for(i=3;i<pairs+3;i++) {
  acard = new Card(cx,cy,cardwidth,cardheight,i);
  deck.push(acard);
  bcard = new Card(cx,cy+cardheight+margin,cardwidth,cardheight,i);
  deck.push(bcard);
  cx = cx+cardwidth+ margin;
  acard.draw();
  bcard.draw();
  }
shuffle();
}

function shuffle() {
//coded to resemble how I shuffled cards when playing concentration
var i;
var k;
var holder;
var dl = deck.length
var nt;
for (nt=0;nt<3*dl;nt++) {  //do the swap 3 times deck.length times
i = Math.floor(Math.random()*dl);
k = Math.floor(Math.random()*dl);
holder = deck[i].info;
deck[i].info = deck[k].info;
deck[k].info = holder;
}
}

//Polycard will produce the card face. Backcard will produce the common back

function Polycard(sx,sy,rad,n) {
this.sx = sx;
this.sy = sy;
this.rad = rad;
this.draw = drawpoly;
this.n = n;
this.angle = (2*Math.PI)/n  //parens may not be needed.
this.moveit = generalmove;
}

function drawpoly() {
ctx.fillStyle= frontbgcolor;
ctx.strokeStyle=backcolor;
ctx.fillRect(this.sx-2*this.rad,this.sy-2*this.rad,4*this.rad,4*this.rad);
ctx.beginPath();
ctx.fillStyle=polycolor;
var i;
var rad = this.rad * 2;
ctx.beginPath();
ctx.moveTo(this.sx+rad*Math.cos(-.5*this.angle),this.sy+rad*Math.sin(-.5*this.angle));
for (i=1;i<this.n;i++) {
ctx.lineTo(this.sx+rad*Math.cos((i-.5)*this.angle),this.sy+rad*Math.sin((i-.5)*this.angle));
}
ctx.fill();
}

function generalmove(dx,dy) {
this.sx +=dx;
this.sy +=dy;
}

function drawback() {
ctx.fillStyle = backcolor;
ctx.fillRect(this.sx,this.sy,this.swidth,this.sheight);
}

function choose(ev) {
var mx;
var my;
var pick1;
var pick2;
if ( ev.layerX ||  ev.layerX == 0) { // Firefox
    mx= ev.layerX;
    my = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    mx = ev.offsetX;
    my = ev.offsetY;
  }
var i;
for (i=0;i<deck.length;i++){
var card = deck[i];
if (card.sx >=0)  //this is the way to avoid checking for clicking on this space
if ((mx>card.sx)&&(mx<card.sx+card.swidth)&&(my>card.sy)&&(my<card.sy+card.sheight)) {
  //check that this isn't clicking on first card
  if ((firstpick)|| (i!=firstcard)) break;
}
}
if (i<deck.length && !pickedtwo) {  //clicked on a card & it's not a third/fourth
if (firstpick) {
  firstcard = i;
  firstpick = false;
  // create poly to draw it on top of back
  pick1 = new Polycard(card.sx+cardwidth*.5,card.sy+cardheight*.5,cardrad,card.info);
  pick1.draw();
}
else {
  secondcard = i;
  pickedtwo = true; // clicked a second card
  pick2 = new Polycard(card.sx+cardwidth*.5,card.sy+cardheight*.5,cardrad,card.info);
  pick2.draw();
    if (deck[i].info==deck[firstcard].info) {
    matched = true;

    var nm = 1+Number(document.f.count.value);
    document.f.count.value = String(nm);
    if (nm>= .5*deck.length) {
      var now = new Date();
      var nt = Number(now.getTime());

      var seconds = Math.floor(.5+(nt-starttime)/1000);
      document.f.elapsed.value = String(seconds);
      //need to fo to flipback for the last match
      clearInterval(mt);
    }
  }
  else {
    matched = false;
  }
  firstpick = true;
  tid = setTimeout(flipback,200);
}
}
}

function flipback() {
var card;
pickedtwo = false; //reset the double-click flag
if (!matched) {
deck[firstcard].draw();
deck[secondcard].draw();
}
else {
ctx.fillStyle = tablecolor;
    ctx.fillRect(deck[secondcard].sx,deck[secondcard].sy,deck[secondcard].swidth,deck[secondcard].sheight);
    ctx.fillRect(deck[firstcard].sx,deck[firstcard].sy,deck[firstcard].swidth,deck[firstcard].sheight);
    deck[secondcard].sx = -1;
    deck[firstcard].sx = -1;
}
}

function init(){
  ctx = document.getElementById('canvas').getContext('2d');
  canvas1 = document.getElementById('canvas');
  canvas1.addEventListener('click',choose,false);
  makedeck();
  document.f.count.value = "0";
  document.f.elapsed.value = "";
  starttime = new Date();
  starttime = Number(starttime.getTime());
  mt = setInterval(ticktock,100);
}

function ticktock(){
  var now = new Date();
  var nt = Number(now.getTime());

  var seconds = Math.floor(.5+(nt-starttime)/100)/10;
  document.getElementById('myTimer').innerHTML=seconds;
}

function scoresRecord(){
  var matches = document.getElementById('matches').value;
  var time = document.getElementById('time').value;
  var initials = document.getElementById('initials').value;

  var score = initials + " " + time + " " + matches;

  scoreboard.push(score);

  var scorestotal = document.getElementById('scores');

  for (var i = scoreboard.length; i > 0; i--) {//reverse loop array
    if (scoreboard.length > 6) {
      var scores = document.getElementById("scores");
      scoreboard.shift(); //removes first element in array
    }
  }
  var scores = document.getElementById("scores");
  scores.innerHTML = "";//clear scoreboard
  printScores();//print to scoreboard
}

function printScores(){
  var scores = document.getElementById("scores");
  for (var i = scoreboard.length; i > 0; i--) {//reverse array so latest score on top
    scores.innerHTML += scoreboard[i-1] + "<br>";
  }
}
