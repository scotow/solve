$(function(){

    var canvas = $("#game-panel")[0];
    var context = canvas.getContext("2d");

    var coin = new Image();
    coin.src = "images/coin.png";

    //ctx.fillStyle = "red";

    var keys = {
        top: false,
        left: false,
        down: false,
        right: false,
        update: function(keyCode, state){
            switch(keyCode){
                case 37:
                    keys.left = state;
                    break;
                case 38:
                    keys.top = state;
                    break;
                case 39:
                    keys.right = state;
                    break;
                case 40:
                    keys.down = state;
                    break;
            }
        }
    };

    var map = {
        width: canvas.width,
        height: canvas.height
    };

    var player = {
        width: 50,
        height: 50,
        x: map.width/2,
        y: map.height/2,
        step: 5,
        updatePosition: function(){
            if(keys.top) this.y = Math.max(this.y - this.step, 0);
            if(keys.left) this.x = Math.max(this.x - this.step, 0);
            if(keys.down) this.y = Math.min(this.y + this.step, map.height - this.height);
            if(keys.right) this.x = Math.min(this.x + this.step, map.width - this.width);
        }
    };

    player.x -= player.width/2;
    player.y -= player.height/2;
    player.sprite = new Sprite(context, coin, player, 1000, 100, 0, 3, 10);


    function Sprite(context, image, player, width, height, gap, ticksPerFrame, numberOfFrames){
        this.context = context;
        this.image = image;
        this.player = player;
        this.width = width;
        this.height = height;
        this.frameWidth = width/numberOfFrames;

        this.frameIndex = 0;
        this.tickCount = 0;
        this.ticksPerFrame = ticksPerFrame || 0;
        this.numberOfFrames = numberOfFrames || 1;

        this.update = function(){

            this.tickCount++;

            if(this.tickCount > this.ticksPerFrame){

                this.tickCount = 0;

                if(this.frameIndex < this.numberOfFrames - 1){
                    this.frameIndex++;
                } else {
                    this.frameIndex = 0;
                }
            }
        }

        this.render = function(){
            this.context.drawImage(
                this.image,
                this.frameIndex * this.width/this.numberOfFrames,
                0,
                this.frameWidth,
                this.height,
                player.x,
                player.y,
                player.width,
                player.height
            );
        }
    }

    function draw(){
        player.updatePosition();
        context.clearRect(0, 0, map.width, map.height);

        //context.fillRect(player.x, player.y, player.width, player.height);
        player.sprite.update();
        player.sprite.render();


        requestAnimationFrame(draw);
    }

    $(window).keydown(function(event){
        keys.update(event.which, true);
        return false;
    }).keyup(function(event){
        keys.update(event.which, false);
        return false;
    });

    //coin.onload = function(){
        requestAnimationFrame(draw);
    //};

});
