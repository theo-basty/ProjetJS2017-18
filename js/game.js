//Getting canvas and context
let canvas = document.getElementById("main-cv");
let context = canvas.getContext("2d");
let decoratorLayer = document.getElementById("decorator").childNodes[1];
//Defining variables containing game state
let zombies = [];
let graves = [];
let startTs = null;
let gameManagement = {
    //refresh periods
    moveZombiePeriod: 50,
    createPeriod: 2000,
    animateGravePeriod: 100,
    //events timestamps
    lvl1TimeStamp: 30000,
    lvl2TimeStamp: 100000,
    bossTimeStamp: 140000,
    endOfGame: 200000,
    //zombie generation states
    lvl1Done: false,
    lvl2Done: false,
    bossDone: false,
    zombieMaxLvl: 0,
    //game status 0:playing, 1:lose, 2:win
    status: 0,
    //remining time in sec
    remainingTime: 0,
};
//player status
let player = {
    pv: 10,
    score: 0,
    cursorX: 300,
    cursorY: 400
};
//defining and loading spritesheets
let zombieSprites = new Image();
zombieSprites.loaded = false;
zombieSprites.src = "ressources/spritesheet-zombie.png";
zombieSprites.onload = function () {
    zombieSprites.loaded = true;
    console.log("zombies sprites loaded");
};
let graveSprites = new Image();
graveSprites.loaded = false;
graveSprites.src = "ressources/spritesheet-grave.png";
graveSprites.onload = function () {
    graveSprites.loaded = true;
    console.log("graves sprites loaded");
};
let visor = new Image();
visor.loaded = false;
visor.src = "ressources/viseur.png";
visor.onload = function () {
    visor.loaded = true;
    console.log("visor loaded");
};

let heartSprites = new Image();
heartSprites.loaded = false;
heartSprites.src = "ressources/spritesheet-heart.png";
heartSprites.onload = function () {
    heartSprites.loaded = true;
    console.log("hearts sprites loaded");
};
//defining and loading sounds
let shotVoid = new Audio("ressources/shot-null.wav");
let shotHit = new Audio("ressources/shot-hit.wav");
//defining a sound bank containing all playing sounds
let soundBank = [];

/**
 * function used to generate random integers in a range
 * @param min
 * minimum bound (included)
 * @param max
 * maximum bound (included)
 * @returns {int}
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * fonction used to refresh canvas display
 * @param remainingMinutes
 * minutes to the end of the game (for the displayed timer)
 * @param remainingSeconds
 * seconds to the end of the game (for the displayed timer)
 */
function render(remainingMinutes, remainingSeconds) {
    //clearing context
    context.clearRect(0, 0, 600, 800);

    //add a night effect to the background during game
    if(gameManagement.status === 0) {
        context.fillStyle = "rgba(0, 0, 64, 0.3)";
        context.fillRect(0, 0, 600, 800);
    }

    //add an end line
    context.fillStyle = "#FF0000";
    context.fillRect(0, 795, 600, 5);

    //rendering Graves
    for (let i = 0; i < graves.length; i++) {
        graves[i].drawOnCtx(context, graveSprites);
    }

    //rendering zombies
    for (let i = 0; i < zombies.length; i++) {
        zombies[i].drawOnCtx(context, zombieSprites);
    }

    //rendering user's visor
    context.drawImage(visor, player.cursorX - 25, player.cursorY - 25, 51, 51);

    //rendering user's life bar
    for (let i = 0; i < 10; i++) {
        let emptyHeart = i >= player.pv;
        context.drawImage(heartSprites,
            32 * emptyHeart,  //sprite X
            0,              //sprite Y
            32,             //sprite width
            32,             //sprite height
            32 * i + 2,       //display X
            1,              //display Y
            32,             //display width
            32              //display height
        )
    }

    //defining font style for score and timer
    context.fillStyle = "#ff0000";
    context.font = "40px dontmix";
    context.textAlign = "right";
    context.lineWidth = 1;

    //drawing score
    context.fillText("Score: " + player.score, 590, 40);
    context.strokeText("Score: " + player.score, 590, 40);

    //drawing timer
    let remainingTimeStr = "" + remainingMinutes;
    if (remainingSeconds % 2 === 0) {
        remainingTimeStr += ":";
    }
    else {
        remainingTimeStr += " "
    }
    remainingTimeStr += "00".substring((remainingSeconds + "").length, 2) + remainingSeconds;
    context.fillText(remainingTimeStr, 590, 80);
    context.strokeText(remainingTimeStr, 590, 80);
}

/**
 * function used to update graves state :
 * 1-after created, rising it with a shake effect
 * 2-once risen, spawn linked zombie then wait a few update
 * 3-once wait over, fading the grave then delete it
 */
function animateGraves() {
    for (let i = 0; i < graves.length; i++) {
        //checking if state 1 not finished
        if (graves[i].visibleHeight < 32) {
            graves[i].visibleHeight += 4;
            graves[i].shift = !graves[i].shift;
        }
        else {
            //spawn zombie if not done yet
            if (graves[i].zombie != null) {
                zombies.push(graves[i].zombie);
                graves[i].zombie = null;
            }
            //checking if wait is over
            if (graves[i].ttl <= 0) {
                //if yes, reducing opacity
                graves[i].opacity -= 0.1;
                if (graves[i].opacity <= 0) {
                    //if grave disappeared, remove it from the game
                    graves.splice(i, 1);
                }
            }
            else {
                //if wait not over, reducing remaining wait time
                graves[i].ttl -= 1;
            }
        }
    }
}

/**
 * Function updating position and state of zombies
 */
function moveZombies() {
    for (i = 0; i < zombies.length; i++) {
        //checking if the zombie must be updated this cycle
        if (zombies[i].moveCycles >= zombies[i].slowness) {
            //if ok, restarting cycle counter, increasing position and updating animation frame
            zombies[i].moveCycles = 0;
            zombies[i].posY += 5;
            zombies[i].animFrame = (zombies[i].animFrame + 1) % 4;
            //checking if the zombie is at the bottom of the terrain
            if (zombies[i].posY >= 800 - 64) {
                //if yes, reducing user's life points and removing zombie from game
                player.pv -= 1;
                zombies.splice(i, 1);
                console.log("Ouch !!");
            }
        }
        else {
            //if not update move cycles skipped
            zombies[i].moveCycles += 1;
        }
    }
}

/**
 * Function generating a new zombie
 * @param boss
 * Telling if the zombie to generate is a boss
 */
function spawnZombies(boss = false) {
    /**
     * Choose randomly the level of the zombie to spawn. Max level change during the game.
     * The maximum level of a zombie is stored in gameManagement.
     * If boss is true, fix level at 3
     */
    let level = null;
    if (boss) {
        level = 3
    }
    else {
        level = getRandomIntInclusive(0, gameManagement.zombieMaxLvl);
    }
    //Randomly choose starting position and grave style
    let posX = getRandomIntInclusive(0, 536);
    let posY = getRandomIntInclusive(0, 36);
    let graveType = getRandomIntInclusive(0, 3);

    //Creating the corresponding Zombie object and adding it to a new Grave object. The grave is then pushed to the grave list
    let zombie = new Zombie(level, posX, posY);
    graves.push(new Grave(posX, posY, zombie, graveType))
}

//Defining click on canvas action
canvas.onclick = function (event) {
    // manage click event only if game status is playing
    if(gameManagement.status === 0) {
        //retrieving canvas' size
        let rect = this.getBoundingClientRect();
        //iterating the zombie in reverse order to only hit the front most zombie
        for (i = zombies.length - 1; i >= 0; i--) {
            //for each zombie, checking if the mouse is in the hitbox when clicked
            if (zombies[i].isHit(event.clientX - rect.x, event.clientY - rect.y)) {
                let newSound = shotHit.cloneNode();
                newSound.play();
                soundBank.push(newSound);
                //reducing zombie's life
                zombies[i].life -= 1;
                //if no more life points, increase player's score and deleting zombie
                if (zombies[i].life <= 0) {
                    player.score += zombies[i].points;
                    zombies.splice(i, 1);
                }
                //else setting damage frame state of the zombie to add a visual effect
                else {
                    zombies[i].damageFrame = 1;
                    setTimeout(function (zombie) {
                        zombie.damageFrame = 0;
                    }, 200, zombies[i]);
                }
                //breaking the loop
                return;
            }
        }
        let newSound = shotVoid.cloneNode();
        newSound.play();
        soundBank.push(newSound);
    }
};

//Defining mousemove action on canvas to update player's cursor position
canvas.onmousemove = function (event) {
    let rect = this.getBoundingClientRect();
    player.cursorX = event.clientX - rect.x;
    player.cursorY = event.clientY - rect.y;
};

/**
 * function to draw the winning screen
 */
function win() {
    context.fillStyle = "rgba(0, 128, 0, 0.3)";
    context.fillRect(0, 0, 600, 800);
    context.fillStyle = "#29c000";
    context.strokeStyle = "#000000";
    context.textAlign = "center";

    context.font = "80px dontmix";
    context.lineWidth = 4;
    context.fillText("You Won !", 300, 300);
    context.strokeText("You Won !", 300, 300);

    context.font = "40px dontmix";
    context.lineWidth = 2;
    context.fillText("Score : " + player.score, 300, 350);
    context.strokeText("Score : " + player.score, 300, 350);
}

/**
 * function to draw the loosing screen
 */
function loose() {
    context.fillStyle = "rgba(128, 0, 0, 0.3)";
    context.fillRect(0, 0, 600, 800);
    context.fillStyle = "#c00005";
    context.textAlign = "center";

    context.font = "80px dontmix";
    context.lineWidth = 4;
    context.fillText("You Lose...", 300, 300);
    context.strokeText("You Lose...", 300, 300);

    context.font = "40px dontmix";
    context.lineWidth = 2;
    context.fillText("Score : " + player.score, 300, 350);
    context.strokeText("Score : " + player.score, 300, 350);

}

/**
 * Callback to manage refresh times depending on the gameManagement periods
 * @param ts
 * timestamp of the page
 */
function game(ts) {
    //checking if all sprites are loaded. Don't do anything if not
    if (graveSprites.loaded && zombieSprites.loaded && heartSprites.loaded && visor.loaded) {
        //if the game just started, initing timestamps memory
        if (startTs === null) {
            startTs = {
                start: ts,
                moveZombieTs: ts,
                animateZombieTs: ts,
                createTs: ts,
            };
            console.log("START !!!");

        }

        //=====PERIODIC ACTIONS=====
        if(gameManagement.status !== 2){ //continue to spawn zombies if user lost
            //spawn new zombies
            if (ts - startTs.createTs >= gameManagement.createPeriod) {
                startTs.createTs += gameManagement.createPeriod;
                spawnZombies();
            }
        }

        if(gameManagement.status !== 2) { //freeze zombies if user win
            //launch a new move cycle
            if (ts - startTs.moveZombieTs >= gameManagement.moveZombiePeriod) {
                startTs.moveZombieTs += gameManagement.moveZombiePeriod;
                moveZombies();
            }
        }

        //animate graves
        if (ts - startTs.animateZombieTs >= gameManagement.animateGravePeriod) {
            startTs.animateZombieTs += gameManagement.animateGravePeriod;
            animateGraves();
        }

        //=====PHASE UPDATER=====
        //Increase zombies max lvl to 1
        if (!gameManagement.lvl1Done && (ts - startTs.start >= gameManagement.lvl1TimeStamp)) {
            console.log("lvl1 zombies incoming");
            gameManagement.lvl1Done = true;
            gameManagement.zombieMaxLvl = 1;
        }

        //Increase zombies max lvl to 2
        if (!gameManagement.lvl2Done && (ts - startTs.start >= gameManagement.lvl2TimeStamp)) {
            console.log("lvl2 zombies incoming");
            gameManagement.lvl2Done = true;
            gameManagement.zombieMaxLvl = 2;
        }

        //Spawning boss and reduce zombies spawn period
        if (!gameManagement.bossDone && (ts - startTs.start >= gameManagement.bossTimeStamp)) {
            console.log("boss incoming");
            gameManagement.bossDone = true;
            spawnZombies(true);
            gameManagement.createPeriod = 1000;
        }

        //=====OTHER ACTIONS=====
        //calculating remaining time. Freezing it if game not playing
        if(gameManagement.status === 0) {
            gameManagement.remainingTime = Math.floor((gameManagement.endOfGame - ts + startTs.start) / 1000);
        }
        else if(gameManagement.status === 2){ //Setting it to 0 if player won
            gameManagement.remainingTime = 0;
        }

        //rendering terrain
        render(Math.floor(gameManagement.remainingTime / 60), gameManagement.remainingTime % 60);

        //clearing sound bank
        for (let i = 0; i < soundBank.length; i++){
            if(soundBank[i].paused){
                soundBank.splice(i, 1);
            }
        }

        //checking win conditions
        if (ts - startTs.start >= gameManagement.endOfGame) {
            //draw win screen and update game status
            gameManagement.status = 2;
            if(decoratorLayer.className !== "win"){
                decoratorLayer.className = "win";
            }
            win();
        }
        //checking loose conditions
        else if (player.pv <= 0) {
            //draw loose screen and update game status
            gameManagement.status = 1;
            if(decoratorLayer.className !== "lost"){
                decoratorLayer.className = "lost";
            }
            loose();
        }
        //clear game status
        else {
            gameManagement.status = 0;
            decoratorLayer.className = "";
        }
    }
    //ask for the next frame
    requestAnimationFrame(game);
}
//start game loop
requestAnimationFrame(game);

