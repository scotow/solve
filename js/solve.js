$(function(){

    var canvas = $("#game-panel")[0];
    var context = canvas.getContext("2d");

    var images = {};
    var imagesToLoad = ["stand", "top", "right", "down", "left"];

    function loadImage(name){
        var image = new Image();
        image.src = "images/" + name + ".png";
        images[name] = image;

        image.onload = function(){
            imagesToLoad.shift();
            if(!imagesToLoad.length){
                $(canvas).removeClass("hidden");
                requestAnimationFrame(draw);
            }
        }
    }

    imagesToLoad.forEach(function(name){
        loadImage(name);
    });

    var keys = {
        top: false,
        left: false,
        down: false,
        right: false,
        sprint: false,
        update: function(keyCode, state){
            switch(keyCode){
                case 16:
                    keys.sprint = state;
                    break;
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
        height: canvas.height,
        shapes: [
            new Shape(58, 47, 290, 347),
            new Shape(348, 107, 180, 287),
            new Shape(58, 387, 50, 66)
        ],
        isAllowed: function(x, y){
            return this.shapes.some(function(shape){
                 return shape.isInside(x, y);
            });
        }
    };

    function Shape(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.isInside = function(x, y){
            return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
        }

    }

    var player = {
        width: 75,
        height: 90,
        x: map.width/2,
        y: map.height/2,
        step: 5,
        updatePosition: function(){
            this.currentSprite = this.sprites.stand;
            if(keys.sprint){
                this.step = 8;
            }else{
                this.step = 5;
            }
            if(keys.top && !keys.down && map.isAllowed(this.x, this.y - this.step)){
                this.y -= this.step;
                this.currentSprite = this.sprites.top;
            }
            if(keys.down && !keys.top && map.isAllowed(this.x, this.y + this.step)){
                this.y += this.step;
                this.currentSprite = this.sprites.down;
            }
            if(keys.right && !keys.left && map.isAllowed(this.x + this.step, this.y)){
                this.x += this.step;
                this.currentSprite = this.sprites.right;
            }
            if(keys.left && !keys.right && map.isAllowed(this.x - this.step, this.y)){
                this.x -= this.step;
                this.currentSprite = this.sprites.left;
            }
        }
    };

    player.x = Math.round(player.x - player.width/2);
    player.y = Math.round(player.y - player.height/2);

    player.sprites = {
        stand: new Sprite(context, images.stand, player, 23, 30, 0, 1),
        top: new Sprite(context, images.top, player, 69, 30, 3, 3),
        right: new Sprite(context, images.right, player, 51, 30, 3, 3),
        down: new Sprite(context, images.down, player, 69, 30, 3, 3),
        left: new Sprite(context, images.left, player, 51, 30, 3, 3)
    };
    player.currentSprite = player.sprites.stand;


    function Sprite(context, image, player, width, height, ticksPerFrame, numberOfFrames){
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
        };

        this.render = function(){
            this.context.drawImage(
                this.image,
                this.frameIndex * this.frameWidth,
                0,
                this.frameWidth,
                this.height,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        };
    }

    function draw(){
        context.clearRect(player.x, player.y, player.width, player.height);
        player.updatePosition();

        player.currentSprite.update();
        player.currentSprite.render();

        requestAnimationFrame(draw);
    }

    $(window).keydown(function(event){
        keys.update(event.which, true);
        return false;
    }).keyup(function(event){
        keys.update(event.which, false);
        return false;
    });

});
