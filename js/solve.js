$(function(){

    var canvas = $("#game-panel")[0];
    var ctx = canvas.getContext("2d");

    canvas.width = 800;

    ctx.fillStyle = "red";

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
        width: 40,
        height: 70,
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

    function draw(){
        player.updatePosition();
        ctx.clearRect(0, 0, map.width, map.height);

        ctx.fillRect(player.x, player.y, player.width, player.height);

        requestAnimationFrame(draw);
    }
    
    $(window).keydown(function(event){
        keys.update(event.which, true);
        return false;
    }).keyup(function(event){
        keys.update(event.which, false);
        return false;
    });

    requestAnimationFrame(draw);

});
