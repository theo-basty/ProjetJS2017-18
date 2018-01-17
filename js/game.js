let zombies = [];
let graves = [];
let canvas = document.getElementById("main-cv");
let context = canvas.getContext("2d");
let startTs = null;
let pauseMode = false;
let gameTimeManagement = {
    moveZombiePeriod: 100,
    createPeriod: 2000,
    animateGravePeriod: 100,

    lvl1TimeStamp: 30000/2,
    lvl1Done: false,
    lvl2TimeStamp: 100000/2,
    lvl2Done: false,
    bossTimeStamp: 140000/2,
    bossDone: false,
    endOfGame: 400000/2,
};
let lvlMax = 0;

let player = {
    pv: 10,
    score: 0,
};

let zombieSprites = new Image();
zombieSprites.loaded = false;
zombieSprites.src = "ressources/spritesheet-zombie.png";
zombieSprites.onload = function(){
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

let heartSprites = new Image();
heartSprites.loaded = false;
heartSprites.src = "ressources/spritesheet-heart.png";
heartSprites.onload = function () {
    heartSprites.loaded = true;
    console.log("hearts sprites loaded");
};

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function render(remainingMinutes, remainingSeconds){
    if(!graveSprites.loaded || !zombieSprites.loaded || !heartSprites.loaded){
        return;
    }
    context.clearRect(0, 0, 600, 800);

    // console.log("Rendering Graves");
    for(let i = 1; i < graves.length ; i++){
        // console.log("| " + i + "-> " + this.toString());
        graves[i].drawOnCtx(context, graveSprites);
    }
    // console.log("Done");

    for(let i = 0;i < zombies.length; i++){
        zombies[i].drawOnCtx(context, zombieSprites);
    }

    for(let i = 0; i < 10; i++){
        let emptyHeart = i >= player.pv;
        context.drawImage(heartSprites,
            32*emptyHeart,  //sprite X
            0,              //sprite Y
            32,             //sprite width
            32,             //sprite height
            32*i + 2,       //display X
            1,              //display Y
            32,             //display width
            32              //display height
        )
    }

    context.fillStyle = "#ff0000";
    context.font = "40px dontmix";
    context.textAlign = "right";
    context.lineWidth = 2;

    context.fillText("Score: " + player.score, 590, 40);
    context.strokeText("Score: " + player.score, 590, 40);
    let remainingTimeStr = "" + remainingMinutes;
    if(remainingSeconds%2 === 0){
        remainingTimeStr += ":";
    }
    else{
        remainingTimeStr += " "
    }
    remainingTimeStr += "00".substring((remainingSeconds + "").length, 2) + remainingSeconds;

    context.fillText(remainingTimeStr, 590, 80);
    context.strokeText(remainingTimeStr, 590, 80);
}

function animateGraves(){
    for(let i = 0; i < graves.length; i++){
        if(graves[i].visibleHeight < 32){
            graves[i].visibleHeight += 4;
            graves[i].shift = !graves[i].shift;
        }
        else {
            if(graves[i].zombie != null){
                zombies.push(graves[i].zombie)
                graves[i].zombie = null;
            }
            if(graves[i].ttl <= 0){
                graves[i].opacity -= 0.1;
                if(graves[i].opacity <= 0){
                    graves.splice(i,1);
                }
            }
            else {
                graves[i].ttl -= 1;
            }
        }
    }
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

function spawnZombies(boss = false){
    let level = null;
    if (boss){
        level = 3
    }
    else {
        level = getRandomIntInclusive(0, lvlMax);
    }
    let posX = getRandomIntInclusive(0, 536);
    let posY = getRandomIntInclusive(0, 36);
    let graveType = getRandomIntInclusive(0, 3);

    let zombie = new Zombie(level, posX, posY);
    graves.push(new Grave(posX, posY, zombie, graveType))
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

function win() {
    context.fillStyle = "rgba(0, 128, 0, 0.3)";
    context.fillRect(0, 0, 600 ,800);
    context.fillStyle = "#29c000";
    context.strokeStyle = "#000000"
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

function loose() {
    context.fillStyle = "rgba(128, 0, 0, 0.3)";
    context.fillRect(0, 0, 600 ,800);
    context.fillStyle = "#c00005";
    context.textAlign = "center";

    context.font = "80px dontmix";
    context.lineWidth = 4;
    context.fillText("You Lost !", 300, 300);
    context.strokeText("You Lost !", 300, 300);

    context.font = "40px dontmix";
    context.lineWidth = 2;
    context.fillText("Score : " + player.score, 300, 350);
    context.strokeText("Score : " + player.score, 300, 350);

}

function game(ts) {
    if (pauseMode) {
        return;
    }
    if(startTs === null){
        if(!heartSprites.loaded || !zombieSprites.loaded){
            requestAnimationFrame(game);
            return;
        }
        startTs = {
            start: ts,
            moveZombieTs: ts,
            animateZombieTs: ts,
            createTs: ts,
        };
        console.log("START !!!");

    }

    if(ts - startTs.createTs >= gameTimeManagement.createPeriod){
        startTs.createTs += gameTimeManagement.createPeriod;
        spawnZombies();
    }

    if(ts - startTs.moveZombieTs >= gameTimeManagement.moveZombiePeriod) {
        startTs.moveZombieTs += gameTimeManagement.moveZombiePeriod;
        moveZombies();
    }

    if(ts - startTs.animateZombieTs >= gameTimeManagement.animateGravePeriod) {
        startTs.animateZombieTs += gameTimeManagement.animateGravePeriod;
        animateGraves();
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
        spawnZombies(true);
        gameTimeManagement.createPeriod = 1000;
    }

    let remainingTimeSec = Math.floor((gameTimeManagement.endOfGame - ts + startTs.start)/1000);

    render(Math.floor(remainingTimeSec/60), remainingTimeSec%60);

    if(ts - startTs.start >= gameTimeManagement.endOfGame){
        console.log("WIN !");
        win();
        return;
    }

    if(player.pv <= 0){
        console.log("LOST !");
        loose();
        return;
    }
    requestAnimationFrame(game);
}

function pause(){
    pauseMode = true;
}

function resume(){
    pauseMode = false;
    requestAnimationFrame(game);
}
requestAnimationFrame(game);

