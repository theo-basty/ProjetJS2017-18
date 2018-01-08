let zombies = [];
let canvas = document.getElementById("main-cv");
let context = canvas.getContext("2d");
let startTs = null;
let gameTimeManagement = {
    movePeriod: 100,
    createPeriod: 2000,

    lvl1TimeStamp: 30000/2,
    lvl1Done: false,
    lvl2TimeStamp: 100000/2,
    lvl2Done: false,
    bossTimeStamp: 140000/2,
    bossDone: false,
};
let lvlMax = 0;

let player = {
    pv: 10,
    score: 0,
};

let zombieSprites = new Image();
zombieSprites.loaded = false;
zombieSprites.src = "ressources/spritesheet-dev.png";
zombieSprites.onload = function(){
    zombieSprites.loaded = true;
    console.log("zombies sprites loaded");
    render();
};

let backgroundSprites = new Image();
backgroundSprites.loaded = false;
backgroundSprites.src = "ressources/spritesheet-dev.png";
backgroundSprites.onload = function () {
    backgroundSprites.loaded = true;
    console.log("background sprites loaded");
    render();
};

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function render(){
    if(!backgroundSprites.loaded || !zombieSprites.loaded){
        return;
    }
    context.clearRect(0, 0, 600, 800);

    //TODO : Draw Background
    // console.log("Rendering zombies :");
    for(i = 0;i < zombies.length; i++){
        zombies[i].drawOnCtx(context, zombieSprites);
        // console.log("| " + zombies[i].toString());
    }
    // console.log("Done");
}

function moveZombies(){
    for(i = 0;i<zombies.length;i++){
        if(zombies[i].moveCycles >= zombies[i].level) {
            zombies[i].moveCycles = 0;
            zombies[i].posY += 5;
            zombies[i].animFrame = (zombies[i].animFrame + 1) % 4;
            if (zombies[i].posY >= 800 ){
                player.pv -= 1;
                zombies.splice(i, 1);
                console.log("Ouch !!");
            }
        }
        else {
            zombies[i].moveCycles += 1;
        }
    }
}

function createZombies(boss = false){
    let level = null;
    if (boss){
        level = 3
    }
    else {
        level = getRandomIntInclusive(0, lvlMax);
    }
    let posX = getRandomIntInclusive(0, 536);
    let posY = getRandomIntInclusive(0, 36);

    zombies.push(new Zombie(level, posX, posY));
}

canvas.onclick = function(event){
    let rect = this.getBoundingClientRect();
    // console.log("clientX: " + (event.clientX - rect.x) + " - clientY: " + (event.clientY - rect.y));
    for (i = zombies.length - 1; i >= 0; i--){
        if(zombies[i].isHit(event.clientX - rect.x, event.clientY - rect.y)){
            zombies[i].life -= 1;
            if(zombies[i].life <= 0){
                zombies.splice(i, 1);
                player.score++;
            }
            else {
                zombies[i].damageFrame = 1;
                setTimeout(function (zombie) {
                    zombie.damageFrame = 0;
                }, 200, zombies[i]);
            }
            break;
        }

    }
};

function game(ts) {
    if(startTs === null){
        if(!backgroundSprites.loaded || !zombieSprites.loaded){
            requestAnimationFrame(game);
            return;
        }
        startTs = {
            start: ts,
            moveTs: ts,
            createTs: ts,
        };
        console.log("START !!!");

    }

    if(ts - startTs.createTs >= gameTimeManagement.createPeriod){
        startTs.createTs += gameTimeManagement.createPeriod;
        createZombies();
    }

    if(ts - startTs.moveTs >= gameTimeManagement.movePeriod) {
        startTs.moveTs += gameTimeManagement.movePeriod;
        moveZombies();
    }

    if(!gameTimeManagement.lvl1Done && (ts - startTs.start >= gameTimeManagement.lvl1TimeStamp)){
        console.log("lvl1 zombies incoming");
        gameTimeManagement.lvl1Done = true;
        lvlMax = 1;
    }

    if(!gameTimeManagement.lvl2Done && (ts - startTs.start >= gameTimeManagement.lvl2TimeStamp)){
        console.log("lvl2 zombies incoming");
        gameTimeManagement.lvl2Done = true;
        lvlMax = 2;
    }

    if(!gameTimeManagement.bossDone && (ts - startTs.start >= gameTimeManagement.bossTimeStamp)){
        console.log("boss incoming");
        gameTimeManagement.bossDone = true;
        createZombies(true);
        gameTimeManagement.createPeriod = 1000;
    }
    render();
    requestAnimationFrame(game);
}
requestAnimationFrame(game);

