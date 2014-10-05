// Sounds
var fireSound = new Audio("audio/shot.wav");
var backgroundMusic = new Audio("audio/POL-cactus-land-short.wav");

var mouseState = {
	x: 0,
	y: 0,
	isHold: false,
	downCount: 0,
	upCount: 0,
	isDown: function() {return this.downCount > this.upCount;},
};

var boundaries = {
    getTopBoundary: function(sprite) {
        return 0 + sprite.height/2;
    },
    getBottomBoundary: function(sprite) {
    	return canvas.height - sprite.height/2;
    },
    getLeftBoundary: function(sprite) {
    	return 0 + sprite.width/2;
    },
    getRightBoundary: function(sprite) {
    	return canvas.width - sprite.width/2;
    }
}

var monsters = [];

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
		fireSound.currentTime = 0;
		fireSound.play();
        var newBullet = new Bullet();
        newBullet.angle = calculateAngle(direction, hero);
        newBullet.x = hero.x;
        newBullet.y = hero.y;
        bullets.push(newBullet);
	}
};

function Monster() {
	this.speed = 256;
	this.height = monsterImage.height;
	this.width = monsterImage.width;
	this.xdirection = 0;
	this.ydirection = 0;
};

function Bullet() {
    this.speed = 600;
    this.height = bulletImage.height;
    this.width = bulletImage.width;
    this.angle = 0;
    this.stepY = function() {
    	return Math.sin(this.angle) * this.speed;
    };
    this.stepX = function() {
    	return Math.cos(this.angle) * this.speed;
    };
    this.x = 0;
    this.y = 0;
}

// Given a sprite with coordinates in the top left corner,
// return the coordinates of the centre of the sprite.
var centerCoordinates = function(sprite) {
    return {x: sprite.x + (sprite.width/2), y: sprite.y + (sprite.height/2)};
}

var calculateAngle = function (destination, source) {
    var deltaY = destination.y - source.y;
    var deltaX = destination.x - source.x;

    var angle = Math.atan(deltaY / deltaX);
    if (deltaX < 0 && deltaY <= 0) {
        angle -= Math.PI;
    }
    if (deltaX < 0 && deltaY > 0) {
        angle += Math.PI;
    }
    return angle;
}


var addGoblin = function () {
	var newMonster = new Monster();
    
    // Get random x coord between left and right boundaries.
	newMonster.x = Math.floor(Math.random() *
		boundaries.getRightBoundary(newMonster) - boundaries.getLeftBoundary(newMonster)) +
	        boundaries.getLeftBoundary(newMonster);

    // Get random y coord between top and bottom boundaries.
	newMonster.y = Math.floor(Math.random() *
		boundaries.getBottomBoundary(newMonster) - boundaries.getTopBoundary(newMonster)) +
	        boundaries.getTopBoundary(newMonster);
	
	newMonster.xdirection = (Math.random() * 2) - 1;
	newMonster.ydirection = (Math.random() * 2) - 1;

	ctx.drawImage(monsterImage, newMonster.x, newMonster.y);
	monsters.push(newMonster);
};

// Handle keyboard controls
var keysDown = {};

window.addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player dies
var newGame = function () {
	backgroundMusic.loop = true;
	backgroundMusic.volume = 0.35;
	backgroundMusic.play();
	keysDown = {};

	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
	
	scoreboard.resetGame();

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
	if (newXPos < boundaries.getLeftBoundary(enemy)) {
        enemy.x = boundaries.getLeftBoundary(enemy);
		enemy.xdirection = -enemy.xdirection;
    } else if (newXPos > boundaries.getRightBoundary(enemy)) {
    	enemy.x = boundaries.getRightBoundary(enemy);
		enemy.xdirection = -enemy.xdirection;
    } else {
        enemy.x = newXPos;
    }
	var newYPos = enemy.y + enemy.ydirection * enemy.speed * modifier;
	if (newYPos < boundaries.getTopBoundary(enemy)) {
       enemy.y = boundaries.getTopBoundary(enemy);
	   enemy.ydirection = -enemy.ydirection;
   } else if (newYPos > boundaries.getBottomBoundary(enemy)) {
   	   enemy.y = boundaries.getBottomBoundary(enemy);
	   enemy.ydirection = -enemy.ydirection;
   } else {
		enemy.y = newYPos;
   }
}

var moveSpriteToTarget = function(sprite, stepSize, destination) {
  var angle = calculateAngle(destination, sprite);
  var stepY = Math.sin(angle) * stepSize;
  var stepX = Math.cos(angle) * stepSize;

  var nextXPos = sprite.x + stepX;
  var nextYPos = sprite.y + stepY;

  // If the distance to the destination is shorter than the step, go there.
  if (stepSize > Math.abs(destination.y - sprite.y)) {
      nextYPos = destination.y;
  }
  if (stepSize > Math.abs(destination.x - sprite.x)) {
      nextXPos = destination.x;
  }

  // If the cursor is on the sprite, don't move it.
  if (destination.x - sprite.width/2 > sprite.x - sprite.width/2 && destination.x < sprite.x + sprite.width/2) {
  	nextXPos = sprite.x;
  }
  if (destination.y - sprite.width/2 > sprite.y - sprite.height/2 && destination.y < sprite.y + sprite.height/2) {
  	nextYPos = sprite.y;
  }

  moveSpriteX(sprite, nextXPos);
  moveSpriteY(sprite, nextYPos);
};

var updateBullets = function(modifier) {
    for (var i = 0; i < bullets.length; ++i) {
        bullets[i].x += bullets[i].stepX() * modifier;
        bullets[i].y += bullets[i].stepY() * modifier;
        
        var didHitMonster = false;

        for (var j = 0; j < monsters.length; j++) {
        	if (
				bullets[i].x <= (monsters[j].x + 32)
				&& monsters[j].x <= (bullets[i].x + 32)
				&& bullets[i].y <= (monsters[j].y + 32)
				&& monsters[j].y <= (bullets[i].y + 32)
			) {
				//Store monsters caught
                scoreboard.addPoint();
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
    if (newXPos < boundaries.getLeftBoundary(sprite)) {
        sprite.x = boundaries.getLeftBoundary(sprite);
    } else if (newXPos > boundaries.getRightBoundary(sprite)) {
    	sprite.x = boundaries.getRightBoundary(sprite);
    } else {
        sprite.x = newXPos;
    }
}

var moveSpriteY = function(sprite, newYPos) {
   if (newYPos < boundaries.getTopBoundary(sprite)) {
       sprite.y = boundaries.getTopBoundary(sprite);
   } else if (newYPos > boundaries.getBottomBoundary(sprite)) {
   	   sprite.y = boundaries.getBottomBoundary(sprite);
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
		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x - heroImage.width/2, hero.y - heroImage.height/2);
	}

	if (monsterReady) {
		for (var j = 0; j < monsters.length; j++) {
			ctx.drawImage(monsterImage, monsters[j].x - monsterImage.width/2, monsters[j].y - monsterImage.height/2);
		}
	}

	if (bulletReady) {
		for (var i = 0; i < bullets.length; ++i) {
			drawBullet(bullets[i]);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "13px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("Score: " + scoreboard.getCurrentScore(), 36, 36);

    ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.textBaseline = "top";
	ctx.textAlign = "right";
	ctx.fillText("High Score: " + scoreboard.getHighScore(), canvas.width - 36, canvas.height-36);
	
	ctx.textAlign = "left";
	ctx.fillText("Cumulative Score: " + scoreboard.getCumulativeScore(), 36, canvas.height-36);
};

var scoreboard = {
  getHighScore: function() {
  	if (!localStorage.highScore) {
  		localStorage.highScore = 0;
  	}
  	return localStorage.highScore;
  },
  	
  getCurrentScore: function() {
    if (!localStorage.currentScore) {
        localStorage.currentScore = 0;
    }
      return localStorage.currentScore;
  },

  getCumulativeScore: function() {
  	if (!localStorage.cumulativeScore) {
  		localStorage.cumulativeScore = 0;
  	}
  	return localStorage.cumulativeScore;
  },

  addPoint: function() {
      if (!localStorage.currentScore) {
      	localStorage.currentScore = 0;
      }
      if (!localStorage.cumulativeScore) {
      	localStorage.cumulativeScore = 0;
      }
      ++localStorage.cumulativeScore;
      ++localStorage.currentScore;


      if (localStorage.highScore < localStorage.currentScore) {
      	localStorage.highScore = localStorage.currentScore;
      }
  },

  resetGame: function() {
  	localStorage.currentScore = 0;
  }
}

var drawBullet = function (bullet) {
    ctx.translate(bullet.x, bullet.y);
	ctx.rotate(bullet.angle);
	ctx.drawImage(bulletImage, -bulletImage.width/2, -bulletImage.height/2);
	ctx.rotate(-bullet.angle);
	ctx.translate(-bullet.x, -bullet.y);
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
    	if (mouseState.isDown() && downCount == mouseState.downCount) {
    		console.log("holding!");
    		mouseState.isHold = true;
    	}
    }, 200);
});

window.addEventListener('mousemove', function(event) {
	mouseState.x = event.x;
	mouseState.y = event.y;
});

window.addEventListener('mouseup', function(event) {
  ++mouseState.upCount;
  if (!mouseState.isHold) {
  	hero.fireBullet({x: event.x, y: event.y});
  }
  mouseState.isHold = false;
});

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
newGame();
setInterval(addGoblin,3000);
main();
