// images from openclipart
//question  https://openclipart.org/detail/217532/question-mark
//obj0  https://openclipart.org/detail/227383/animation-of-rocket-blue-and-red
//obj1  https://openclipart.org/detail/168141/gold-star
//obj2  https://openclipart.org/detail/22309/apple-icon
//obj3  https://openclipart.org/detail/8266/soccer-ball
//obj4  https://openclipart.org/detail/172493/snail
//obj5  https://openclipart.org/detail/203621/dice-with-two-on-top
//papiro https://openclipart.org/detail/7889/g-parchment-background-or-border-1


// globals
// var icons = ['ball','wood_disk','logo','uno','dos','tres','cuatro','ball1','ball2','ball3','ball4','ball5']; // list of different icons. These strings are used also to load the corresponding images
var icons = _.map(_.range(6), function(d){return 'obj'+String(d);})//['rocket','star','apple','football']; // list of different icons. These strings are used also to load the corresponding images
var numIcons = icons.length;

var LStop = 5 * 100;
var RStop = 5 * 100;

var listOfBlocks = [];

var newEpoch = false;


//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
// block class
function Block(side, icon) {// side can be 'left' or 'right'. image is a path
  this.side = side;
  this.icon = icon;
  this.image = 'images/'+icon+'.png';

  // add it to the global list of existing blocks
  listOfBlocks.push(this);

  // define some properties
  this.blockSize = 0.5 * document.getElementById('falls').clientWidth;
  this.x = (side == 'left') ? 0 : this.blockSize;
  this.y = 0;

  this.landed = false;

  // create the corresponding svg
  this.svg = blocks.append('image')
                .attr('alt',this.icon)
                .attr('x',this.x)
                .attr('y',this.y)
                .attr('width',this.blockSize)
                .attr('height',this.blockSize)
                .attr('xlink:href',this.image);

  // let it fall
  // this.interval = setInterval(this.update.bind(this), 500); // I use bind (see  http://stackoverflow.com/a/34033393/4564295 )
}

Block.prototype.forward = function() {
  if (this.landed == false) {

    switch (this.side) {
      case 'left':
        if (this.y == LStop-this.blockSize) {this.landed = true;}
        break;
      case 'right':
        if (this.y == RStop-this.blockSize) {this.landed = true;}
        break;
    }
    if (LStop != 0 && RStop != 0) {
      this.moveTo(this.y + this.blockSize);
    } else {
      gameOver();
    }
  }
}

Block.prototype.moveTo = function(y) {
  this.y = y;
  this.svg.transition().duration(200).attr('y',this.y);
}

Block.prototype.changeImage = function(icon) {
    this.icon = icon;
    this.image = 'images/'+icon+'.png';
    this.svg.attr('xlink:href',this.image);
}

Block.prototype.removeSVG = function() {
    this.svg.transition().duration(100).attr('x',(this.x+this.blockSize/2)).attr('width',1e-6).remove();
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function gameOver(){
  gameOverPanel.style('visibility','visible');
  clearInterval(gameLoop);
}

function accomplished(){
  accomplishPanel.style('visibility','visible');
  clearInterval(gameLoop);
}

function help(){
  helpPanel.style('visibility','visible');
  clearInterval(gameLoop);
}

function restart(){
  // hide panels if any
  gameOverPanel.style('visibility','hidden');
  accomplishPanel.style('visibility','hidden');
  helpPanel.style('visibility','hidden');
  // remove icons
  _.each(listOfBlocks, function(d){d.removeSVG();});
  // reset array of blocks
  listOfBlocks = [];
  // reset training data
  training_data = [];
  // reset score (epoch will be updated in the first epoch because of counter)
  addScore(0,true);
  // reset main loop
  timeStep = 1000;
  counter = 0;
  clearInterval(gameLoop);
  gameLoop = setInterval(nextStep,timeStep);
}

function addScore(value,reset) {
  var sc = Number(score.text().slice(7));
  if (reset) {
    score.text('score: '+String(value));
  } else {
    score.text('score: '+String(sc + value));
  }
}

function removeBlocks() {
  // remove question marks with a penalty
  var questions = _.filter(listOfBlocks, function(d){return d.icon == 'question';});
  var remainingQuestions = questions.length;
  if (remainingQuestions > 0) { //actually it can only be 0 or 1.
    for (var i = 0; i < questions.length; i++) {
      questions[i].removeSVG();
      // score
      addScore(-10);
    }
    // delete question object from the list of Blocks
    listOfBlocks = _.reject(listOfBlocks, function(d){return d.icon == 'question';})
  }

  // remove blocks if they appear more than once and update score
  for (var i = 0; i < numIcons; i++) {
    var equals = _.filter(listOfBlocks, function(d){return d.icon == icons[i];});

    if (equals.length > 1) { // there are more than 1 of kind icons[i]
      // remove the corresponding svgs
      _.each(equals,function(d){
        // d.svg.transition().duration(100).attr('width',1e-6).attr('height',1e-6).remove();
        // d.svg.transition().duration(100).attr('x',d.x+50).attr('width',1e-6).remove();
        // d.svg.remove();
        d.removeSVG();

        var current = d;
        if (d.side == 'left') {// set landed flag as false for the block that is on top, if any
          _.each(listOfBlocks,function(d){(d.side == 'left' && d.y < current.y) ? d.landed = false : d.landed = d.landed});
          // LStop += 100;
        } else {
          _.each(listOfBlocks,function(d){(d.side == 'right' && d.y < current.y) ? d.landed = false : d.landed = d.landed});
          // RStop += 100;
        }
      });
      // delete Block objects from the list of Blocks
      listOfBlocks = _.reject(listOfBlocks, function(d){return _.contains(equals, d);})

      // land all
      landAll();

      // score (only if the questions were removed)
      if (remainingQuestions == 0) {
        addScore(equals.length * 5);
      }
    }
  }
}

function updateAll() {
  var blockSize = 0.5 * document.getElementById('falls').clientWidth;
  // update LStop and RStop
  var lefts = _.filter(listOfBlocks, function(d){return d.side == 'left';});
  var nL = lefts.length;
  LStop = (6 - nL)*blockSize;

  var rights = _.filter(listOfBlocks, function(d){return d.side == 'right';});
  var nR = rights.length;
  RStop = (6 - nR)*blockSize;

  // forward all
  _.each(listOfBlocks, function(d){d.forward();});
}

function landAll() {
  var blockSize = 0.5 * document.getElementById('falls').clientWidth;

  var lefts = _.filter(listOfBlocks, function(d){return d.side == 'left';});
  _.each(lefts, function(d,i){d.moveTo((5-i)*blockSize); d.landed = true;});

  var rights = _.filter(listOfBlocks, function(d){return d.side == 'right';});
  _.each(rights, function(d,i){d.moveTo((5-i)*blockSize); d.landed = true;});
}

//////// using http://stackoverflow.com/a/7445863/4564295
var timeStep = 1000;
var counter = 0;
var tRate = 0.033; // rate at which the speed is increasing. The bigger, the faster
var nextStep = function() {
  clearInterval(gameLoop);
  // do not accelerate during the training period (when the user defines one by one the paths corresponding to each icon)
  if (counter >= numIcons) { // this is considered the training period
    timeStep = 1000 - 1000*(counter-numIcons)/((counter-numIcons) + 1/tRate);
  }

  gameLoop = setInterval(nextStep, timeStep);

  // if all landed, throw new ones
  var allLanded = _.every(listOfBlocks, function(d){return d.landed == true;});
  if (allLanded && LStop > 0 && RStop > 0) {
    removeBlocks();

    // check accomplishment (arrive to 50 epochs)
    if (counter == 50) {
      accomplished()
    } else {
      // throw new ones
      if (counter >= numIcons) {
          new Block('left',_.sample(icons));
      } else {
          new Block('left',icons[counter]);
      }
      new Block('right','question');
      // this is a new epoch
      counter += 1;
      newEpoch = true;
      activeLine.datum([]).attr("d", renderPath);
      // update epoch display
      epoch.text('epoch: ' + counter);
    }
  }
  // update status of all existing blocks
  updateAll();

}
var gameLoop; //= setInterval(nextStep,timeStep);
