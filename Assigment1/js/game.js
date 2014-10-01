// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
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
var monster = {};
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
};

var moveSpriteUp = function (sprite, modifier, speed) {
	var nextYPos = sprite.y - speed * modifier;
	var minYPos = 0;
	sprite.y = nextYPos < minYPos ? minYPos : nextYPos;
}

var moveSpriteDown = function (sprite, modifier, speed, sprite_height) {
	var nextYPos = sprite.y + speed * modifier;
	var maxYPos = canvas.height - sprite_height;
	sprite.y = nextYPos > maxYPos ? maxYPos : nextYPos;
}

var moveSpriteLeft = function (sprite, modifier, speed) {
	var nextXPos = sprite.x - speed * modifier;
	var minXPos = 0;
	sprite.x = nextXPos < minXPos ? minXPos : nextXPos;
}

var moveSpriteRight = function (sprite, modifier, speed, sprite_width) {
	var nextXPos = sprite.x + speed * modifier;
	var maxXPos = canvas.width - sprite_width;
	sprite.x = nextXPos > maxXPos ? maxXPos : nextXPos;
}

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		moveSpriteUp(hero, modifier, hero.speed);
	}
	if (40 in keysDown) { // Player holding down
		moveSpriteDown(hero, modifier, hero.speed, hero.height);
	}
	if (37 in keysDown) { // Player holding left
		moveSpriteLeft(hero, modifier, hero.speed);
	}
	if (39 in keysDown) { // Player holding right
		moveSpriteRight(hero, modifier, hero.speed, hero.width);
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

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
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

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
