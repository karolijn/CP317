// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
//set canvas size to half browser width and height
canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	height: 32,
	width: 32
};

var monster = {
	speed: 256,
	height: 32,
	width: 32,
	xdirection: 0,
	ydirection: 0,
};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
	
	monster.xdirection = (Math.random() * 2) - 1;
	monster.ydirection = (Math.random() * 2) - 1;
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		moveSpriteY(hero, hero.y - hero.speed * modifier);
	}
	if (40 in keysDown) { // Player holding down
		moveSpriteY(hero, hero.y + hero.speed * modifier);
	}
	if (37 in keysDown) { // Player holding left
		moveSpriteX(hero, hero.x - hero.speed * modifier);
	}
	if (39 in keysDown) { // Player holding right
		moveSpriteX(hero, hero.x + hero.speed * modifier);
	}
	
	moveMonster(monster, modifier);
	
	
	if (mouseDown == true) {
       moveSpriteToTarget(hero, hero.speed * modifier, {x: mousePosX, y: mousePosY});
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
};


var moveMonster = function(enemy, modifier){
	var newXPos = enemy.x + enemy.xdirection * enemy.speed * modifier;
	if (newXPos < 0) {
        enemy.x = 0;
		enemy.xdirection = -enemy.xdirection;
    } else if (newXPos > canvas.width - enemy.width) {
    	enemy.x = canvas.width - enemy.width;
		enemy.xdirection = -enemy.xdirection;
    } else {
        enemy.x = newXPos;
    }
	var newYPos = enemy.y + enemy.ydirection * enemy.speed * modifier;
	if (newYPos < 0) {
       enemy.y = 0;
	   enemy.ydirection = -enemy.ydirection;
   } else if (newYPos > canvas.height - enemy.height) {
   	   enemy.y = canvas.height - enemy.height;
	   enemy.ydirection = -enemy.ydirection;
   } else {
		enemy.y = newYPos;
   }
}

var moveSpriteToTarget = function(sprite, stepSize, destination) {
  var deltaY = destination.y - sprite.y;
  var deltaX = destination.x - sprite.x;

  var angle = deltaX == 0 ? 0 : Math.atan(deltaY / deltaX);
  var stepY = Math.sin(angle) * stepSize;
  var stepX = Math.cos(angle) * stepSize

  var nextXPos = deltaX < 0 ? sprite.x - stepX : sprite.x + stepX;
  var nextYPos = deltaX < 0 ? sprite.y - stepY : sprite.y + stepY;

  // If the distance to the destination is shorter than the step, go there.
  if (Math.abs(nextYPos - sprite.y) > Math.abs(destination.y - sprite.y)) {
      nextYPos = destination.y;
  }
  if (Math.abs(nextXPos - sprite.x) > Math.abs(destination.x - sprite.x)) {
      nextXPos = destination.x;
  }

  moveSpriteX(sprite, nextXPos);
  moveSpriteY(sprite, nextYPos);
};

var moveSpriteX = function(sprite, newXPos) {
    if (newXPos < 0) {
        sprite.x = 0;
    } else if (newXPos > canvas.width - sprite.width) {
    	sprite.x = canvas.width - sprite.width;
    } else {
        sprite.x = newXPos;
    }
}

var moveSpriteY = function(sprite, newYPos) {
   if (newYPos < 0) {
       sprite.y = 0;
   } else if (newYPos > canvas.height - sprite.height) {
   	   sprite.y = canvas.height - sprite.height;
   } else {
   	sprite.y = newYPos;
   }
}

// Draw everything
var render = function () {
	//reset canvas size if browser has been resized
	canvas.width = window.innerWidth/2;
	canvas.height = window.innerHeight/2;

	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0,window.innerWidth/2,window.innerHeight/2);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};
/*
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      var canvas = document.getElementById('myCanvas');
      var context = canvas.getContext('2d');
*/
var mouseDown = false;
var mousePosX = 0;
var mousePosY = 0;

canvas.addEventListener('mousedown', function(event) {
  mouseDown = true;
});

canvas.addEventListener('mousemove', function(event) {
    mousePosX = event.x;
    mousePosY = event.y;
});

canvas.addEventListener('mouseup', function(event) {
  mouseDown = false;
});

/*
      addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        writeMessage(canvas, message);
      }, false);

canvas.addEventListener('mou')*/
// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
