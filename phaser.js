//Config Object 
var config = {
    //type property set to auto will use either WebGL 
    //and Canvas depending on availability
    type: Phaser.AUTO,
    //setting size of canvas property
    width: 800,
    height: 600,
    //add Physics to config so phaser knows it's needed
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var game = new Phaser.Game(config);
//define variables
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

//this function will load these assets on page start
//first parameter is asset key, will help link back to these assets
//can be any string
function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

//This function helps with adding and positioning images
//the order of objects here matches how they are displayed, 
//something placed after sky would appear above the sky background
//something placed before sky would be placed
// behind the sky background (unseen)

function create ()
{
    //this image is 800x600, but since it 
    //is positioned by its center, (400, 300)
    this.add.image(400, 300, 'sky');

    //add static group, which is not touched by gravity
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    //add player & set position
    player = this.physics.add.sprite(100, 450, 'dude');
    //he will bounce when he lands
    player.setBounce(0.2);
    //the world bounds are outside game dimensions by default
    player.setCollideWorldBounds(true);

    //define animations left, and positions on sprite sheet(0, 3)
    //repeat: -1 tells an animation to loop
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    //Turn animation
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    //turn right 
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    //populates cursors with instances of key objects
    //note input keyboard
    cursors = this.input.keyboard.createCursorKeys();
    //monitors player and platforms to detect collision
    //takes two objects and performs sparation against them
    this.physics.add.collider(player, platforms); 
    
    //Creates 12 stars, starts at x,y position and moves 70 pixels on
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    //random bounce for each start
    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    
    //separate stars & platform w/collider
    this.physics.add.collider(stars, platforms);
    //if player hits stats, call collect star (below) 
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //add score text (16, 16 is the coordinate to set the star at)
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //add bomb group!
    bombs = this.physics.add.group();

    //separate bomb & platforms! 
    this.physics.add.collider(bombs, platforms);
    //if player hits bombs, call hit bombs! 
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    
}

function update ()
{
    //run left, notice how velocity is -160 since it's positional
    //runs left if left arrow key is held
    //"plays" relevant animation established in create()
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    //this will only work if "up" arrow is pressed AND if player is touching the ground
    //(no midair jumps)
    //Y velocity is in px/sec^2 and determines height
    //because of gravity, player will fall back down to the ground 
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }




}
//function to remove star on player overlaps
function collectStar (player, star)
{
    star.disableBody(true, true);
    //increment store on collision
    score = score + 10;
    scoreText.setText('Score: ' + score);
    //countActive checks how many stars have not been collected/disabled
    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
        //pick random x coordinate, 
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
