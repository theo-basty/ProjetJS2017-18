let zombieSprites = new Image();
zombieSprites.loaded = false;
zombieSprites.src = "../ressources/spritesheet-dev.png";
zombieSprites.onload = function(){
    zombieSprites.loaded = true;
};

let backgroundSprites = new Image();
backgroundSprites.loaded = false;
backgroundSprites.src = "../ressources/spritesheet-dev.png";
backgroundSprites.onload = function () {
    backgroundSprites.loaded = true;
};

let render = function(){
    if(!backgroundSprites.loaded || !zombieSprites.loaded){
        return;
    }


};

