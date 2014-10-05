var BULLET_SPEED = 200;

var mouseState = {
	x: 0,
	y: 0,
	isHold: false,
	downCount: 0,
	upCount: 0,
	isDown: function() {return this.downCount != this.upCount;}
};

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

// Bullet image
var bulletReady = false;
var bulletImage = new Image();
bulletImage.onload = function () {
	bulletReady = true;
};
bulletImage.src = "images/bullet_sm.png";
var bullets = [];

// Game objects
var hero = {
	speed: 256, // movement in pixels per second
	height: 32,
	width: 32,
	fireBullet: function(direction) {
        var angle = calculateAngle(direction, hero)
        var stepY = Math.sin(angle);
        var stepX = Math.cos(angle);
        var newBullet = {
        	stepX: stepX,
        	stepY: stepY,
        	x: hero.x,
        	y: hero.y,
        	angle: angle
        };
        bullets.push(newBullet);
	}
};

// Given a sprite with coordinates in the top left corner,
// return the coordinates of the centre of the sprite.
var centerCoordinates = function(sprite) {
    return {x: sprite.x + (sprite.width/2), y: sprite.y + (sprite.height/2)};
}

function Monster() {
	this.speed = 256;
	this.height = 32;
	this.width = 32;
	this.xdirection = 0;
	this.ydirection = 0;
};

var calculateAngle = function (destination, source) {
    var deltaY = destination.y - centerCoordinates(source).y;
    var deltaX = destination.x - centerCoordinates(source).x;

    var angle = Math.atan(deltaY / deltaX);
    if (deltaX < 0 && deltaY <= 0) {
        console.log(angle);
        angle -= Math.PI;
    }
    if (deltaX < 0 && deltaY > 0) {
        angle += Math.PI;
    }
    return angle;
}

var monsters = [];
var monstersCaught = 0;


var addGoblin = function () {
	var newMonster = new Monster();

	newMonster.x = 32 + (Math.random() * (canvas.width - 64));
	newMonster.y = 32 + (Math.random() * (canvas.height - 64));
	
	newMonster.xdirection = (Math.random() * 2) - 1;
	newMonster.ydirection = (Math.random() * 2) - 1;

	ctx.drawImage(monsterImage, newMonster.x, newMonster.y);
	monsters.push(newMonster);

};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player dies
var newGame = function () {
	keysDown = {};
	mouseState.isHold = false;

	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	
	alert("New Game!");

	monstersCaught = 0;
	monsters = [];
	bullets = [];

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

	if (mouseState.isHold == true) {
       moveSpriteToTarget(hero, hero.speed * modifier, {x: mouseState.x, y: mouseState.y});
	}

	updateBullets(modifier);

	// Are they touching?
	for (var i = 0; i < monsters.length; i++) {

		moveMonster(monsters[i], modifier);

		if (
			hero.x <= (monsters[i].x + 32)
			&& monsters[i].x <= (hero.x + 32)
			&& hero.y <= (monsters[i].y + 32)
			&& monsters[i].y <= (hero.y + 32)
		) {
			newGame();
		}
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

var updateBullets = function(modifier) {
    for (var i = 0; i < bullets.length; ++i) {
        bullets[i].x += bullets[i].stepX * BULLET_SPEED * modifier;
        bullets[i].y += bullets[i].stepY * BULLET_SPEED * modifier;
        
        var didHitMonster = false;

        for (var j = 0; j < monsters.length; j++) {
        	if (
				bullets[i].x <= (monsters[j].x + 32)
				&& monsters[j].x <= (bullets[i].x + 32)
				&& bullets[i].y <= (monsters[j].y + 32)
				&& monsters[j].y <= (bullets[i].y + 32)
			) {
				++monstersCaught;
		   		monsters.splice(j, 1);
				didHitMonster = true;
			}
        }

        if (isOffscreen(bullets[i]) || didHitMonster) {
            bullets.splice(i, 1);
        }
    }
}

var isOffscreen = function(sprite) {
  if (sprite.x < 0 || sprite.x > canvas.width || sprite.y < 0 || sprite.y > canvas.height) {
  	return true;
  }
  return false;
}

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
		for (var j = 0; j < monsters.length; j++) {
			ctx.drawImage(monsterImage, monsters[j].x, monsters[j].y);
		}
	}

	if (bulletReady) {
		for (var i = 0; i < bullets.length; ++i) {
			drawBullet(bullets[i]);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
};

var drawBullet = function (bullet) {
    ctx.translate(bullet.x + bulletImage.width/2, bullet.y + bulletImage.height/2);
	ctx.rotate(bullet.angle);
	console.log(bulletImage.width)
	ctx.drawImage(bulletImage, -bulletImage.width/2, -bulletImage.height/2);
	ctx.rotate(-bullet.angle);
	ctx.translate(-(bullet.x + bulletImage.width/2), -(bullet.y + bulletImage.height/2));
}

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

window.addEventListener('mousedown', function(event) {
	var downCount = ++mouseState.downCount;

    setTimeout(function() {
    	if (mouseState.isDown() && mouseState.downCount == downCount) {
    		mouseState.isHold = true; }
    	}, 200);
});

window.addEventListener('mousemove', function(event) {
	mouseState.x = event.x;
	mouseState.y = event.y;
});

window.addEventListener('mouseup', function(event) {
  ++mouseState.upCount;
  if (mouseState.isHold) {
  	mouseState.isHold = false;
  	return;
  } else {
  	hero.fireBullet({x: event.x, y: event.y});
  }
});

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
newGame();
setInterval(addGoblin,3000);
main();
