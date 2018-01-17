class Zombie{
    constructor(level, posX, posY){
        this.level = level;
        this.posX = posX;
        this.posY = posY;
        this.animFrame = 0;
        this.moveCycles = 0;
        this.damageFrame = 0;
        switch (level) {
            case 0:
                this.totalLife = 1;
                break;
            case 1:
                this.totalLife = 2;
                break;
            case 2:
                this.totalLife = 3;
                break;
            case 3:
                this.totalLife = 25;
                break;
            default:
                this.totalLife = 0;
        }
        this.life = this.totalLife;
    }

    drawOnCtx(contexte, spritesheet){
        contexte.drawImage(spritesheet,
            32*(this.level*2+this.damageFrame),          //sprite X
            32*(this.animFrame),         //sprite Y
            32,         //sprite width
            32,         //sprite height
            this.posX,  //display X
            this.posY,  //display Y
            64,         //display width
            64          //display height
        );
        if(this.life === this.totalLife) {
            contexte.fillStyle = "#004cff";
        } else if(this.life > this.totalLife / 2){
            contexte.fillStyle = "#ffcc00";
        } else {
            contexte.fillStyle = "#ff0000";
        }
        contexte.fillRect(this.posX, this.posY, 64*this.life/this.totalLife, 5);
        contexte.strokeRect(this.posX, this.posY, 64, 5);
    }

    isHit(cvMouseX, cvMouseY){
        let zbMouseX = cvMouseX - this.posX;
        let zbMouseY = cvMouseY - this.posY;

        switch(this.level){
            case 0:
                if(zbMouseX > 18 && zbMouseX <= 44 && zbMouseY >= 24 && zbMouseY <= 60){
                    return true;
                }
                else{
                    return false;
                }
            case 1:
                if(zbMouseX > 16 && zbMouseX <= 48 && zbMouseY >= 22 && zbMouseY <= 58){
                    return true;
                }
                else{
                    return false;
                }
            case 2:
                if(zbMouseX > 4 && zbMouseX <= 60 && zbMouseY >= 10 && zbMouseY <= 58){
                    return true;
                }
                else{
                    return false;
                }
            case 3:
                if(zbMouseX > 8 && zbMouseX <= 54 && zbMouseY >= 4 && zbMouseY <= 58){
                    return true;
                }
                else{
                    return false;
                }
        }
    }

    toString(){
        return "x:" + this.posX + " "
            + "y:" + this.posY + " "
            + "lvl:" + this.level + " "
            + "pv:" + this.life + " ";
    }
}

class Grave{
    constructor(posX, posY, zombie, type){
        this.posX = posX;
        this.posY = posY;
        this.type = type;
        this.visibleHeight = 0;
        this.shift = false;
        this.opacity = 1;
        this.ttl = 100;
        this.zombie = zombie;
    }

    drawOnCtx(contexte, spritesheet){
        contexte.globalAlpha = this.opacity;
        contexte.drawImage(spritesheet,
            32*(this.type%2),          //sprite X
            32*(Math.floor(this.type/2)),         //sprite Y
            32,         //sprite width
            this.visibleHeight,         //sprite height
            this.posX + 4*this.shift,  //display X
            this.posY + (32-this.visibleHeight)*2,  //display Y
            64,         //display width
            this.visibleHeight*2          //display height
        );
        contexte.globalAlpha = 1;
    }

    toString(){
        return "x:" + this.posX + ", y:" + this.posY;
    }
}