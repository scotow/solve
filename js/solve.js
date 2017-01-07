$(function(){

    var canvas = $("#game-panel")[0];
    var context = canvas.getContext("2d");

    var images = {};
    var imagesToLoad = ["stand", "back", "top", "right", "down", "left", "exclamation", "terminal", "desktop"];

    function loadImage(name){
        var image = new Image();
        image.src = "images/" + name + ".png";
        images[name] = image;

        image.onload = function(){
            imagesToLoad.shift();
            if(!imagesToLoad.length){
                $(canvas).removeClass("hidden");
                swal({
                    title: "Comment jouer ?",
                    text: "Utilise les touches directionnelles pour déplacer le personnage et la touche espace pour accéder à l'ordinateur."
                }, function(){
                    questionnaire.start();
                    requestAnimationFrame(draw);
                });
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

    function Questionnaire(){
        this.questions = [];
        this._questionIndex = null;
        this.actualQuestion = null;

        this.start = function(){
            this._questionIndex = Math.floor(Math.random() * this.questions.length);
            this.countDownNextQuestion();
        };

        this.countDownNextQuestion = function(){
            var self = this;
            setTimeout(function(){
                screen.currentSprite = screen.sprites.problem;
                self._questionIndex = (self._questionIndex + 1) % self.questions.length;
                self.actualQuestion = self.questions[self._questionIndex];
            }, 5000 + Math.floor(Math.random() * 2000));
        };

        this.prompt = function(){
            this.actualQuestion.ask();
            screen.currentSprite = screen.sprites.terminal;
        };

        this.solved = function(){
            this.actualQuestion = null;
            screen.currentSprite = screen.sprites.desktop;
            questionnaire.countDownNextQuestion();
        }

    }

    function Question(header, choice1, choice2, answer, explanation){
        this.header = header;
        this.choice1 = choice1;
        this.choice2 = choice2;
        this.answer = answer;
        this.explanation = explanation;

        this.ask = function(){
            var self = this;
            swal({
                title: "Problème informatique",
                text: this.header,
                showCancelButton: true,
                confirmButtonText: this.choice2,
                cancelButtonText: this.choice1,
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(choice){
                var explanation = (choice != self.answer ? "Correct." : "Incorrect.") + "\n" + self.explanation;
                swal({
                    title: "Réponse",
                    text: explanation
                }, function(){
                    questionnaire.solved();
                });

            });
        }
    }

    var questionnaire = new Questionnaire();
    questionnaire.questions.push(new Question("Doit-on stocker les mots de passe des utilisateurs en clair dans la base de données ?", "Vrai", "Faux", false, "En effet, il est dangereux de stocker les mots de passe en clair : en cas d'intrusion, les mots de passe ne sont pas exposés directement."));
    questionnaire.questions.push(new Question("Est-il nécessaire de faire des études poussées pour apprendre l'informatique ?", "Vrai", "Faux", false, "Internet regorge de tutoriels en tout genre pour apprendre les bases de l'informatique."));
    questionnaire.questions.push(new Question("Est-ce qu'un administrateur système doit avoir des connaissances en développement ?", "Oui", "Non", true, "Il est important qu'il ait des connaissances en développement car il doit savoir faire des scripts et faire de l'automatisation."));
    questionnaire.questions.push(new Question("Est-ce qu'il y a beaucoup de différence entre un administrateur et un administrateur réseaux ?", "Oui", "Non", false, "Il est vrai que ces deux métiers sont différents, mais en terme de compétences, ils se ressemblent et souvent, c'est la même personne qui exerce ces deux fonctions dans une entreprise."));
    questionnaire.questions.push(new Question("Quel est le salaire annuel moyen d'un administrateur reseaux / système débutant ?", "22 000€ - 35 000€", "30 000€ - 45 000€", false, "En general, le metier d'administrateur système et réseaux est plutôt bien payé meme au début, par contre l'inconvéniant est que les entreprises préfères recruter des personnes d'expériences."));
    questionnaire.questions.push(new Question("Quel est le niveau d'étude demandé pour exercer la fonction d'administrateur système et réseaux ?", "Bac +2", "Bac +5", false, "En général, les entreprises demandent un niveau bac +5, que ce soit école d'ingénieur ou master, mais il peut y avoir des exceptions."));
    questionnaire.questions.push(new Question("Est-ce que l'on peut être amené à faire de l'astreinte dans le métier d'administrateur réseaux et systèmes ?", "Oui", "Non", true, "En effet beaucoup d'entreprises demandent de l'astreinte, car il faut pouvoir intervenir sur divers problèmes le plus rapidement possible même pendant la nuit."));
    questionnaire.questions.push(new Question("Une fois un système réseau mis en place et sécurisé, des nouvelles failles peuvent-elles survenir ?", "Oui", "Non", true, "Ce domaine informatique est en constante évolution, c'est-à-dire qu'il y aura toujours des personnes pour trouver des failles de sécurité, donc aucun système n'est définitif. Il faudra toujours le faire évoluer."));

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
        },
        aboveScreen: new Shape(415, 107, 65, 20)
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

    var screen = {
        width: 51,
        height: 23,
        x: 459,
        y: 63,
        solving: false
    };

    screen.sprites = {
        desktop: new Sprite(context, images.desktop, screen, 102, 46, 0, 1),
        problem: new Sprite(context, images.exclamation, screen, 500, 500, 0, 1),
        terminal: new Sprite(context, images.terminal, screen, 102, 46, 0, 1)
    };

    screen.currentSprite = screen.sprites.desktop;

    var player = {
        width: 75,
        height: 90,
        x: map.width/2,
        y: map.height/2,
        step: 5,
        solving: false,
        updatePosition: function(){
            this.currentSprite = map.aboveScreen.isInside(this.x, this.y) ? this.sprites.back : this.sprites.stand;
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
        back: new Sprite(context, images.back, player, 23, 30, 0, 1),
        top: new Sprite(context, images.top, player, 69, 30, 3, 3),
        right: new Sprite(context, images.right, player, 51, 30, 3, 3),
        down: new Sprite(context, images.down, player, 69, 30, 3, 3),
        left: new Sprite(context, images.left, player, 51, 30, 3, 3)
    };
    player.currentSprite = player.sprites.stand;


    function Sprite(context, image, object, width, height, ticksPerFrame, numberOfFrames){
        this.context = context;
        this.image = image;
        this.object = object;
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
                this.object.x,
                this.object.y,
                this.object.width,
                this.object.height
            );
        };
    }

    function draw(){
        context.clearRect(player.x, player.y, player.width, player.height);
        context.clearRect(screen.x, screen.y, screen.width, screen.height);
        player.updatePosition();

        player.currentSprite.update();
        player.currentSprite.render();

        screen.currentSprite.update();
        screen.currentSprite.render();

        requestAnimationFrame(draw);
    }

    $(window).keydown(function(event){
        keys.update(event.which, true);
        if(event.which === 32 && map.aboveScreen.isInside(player.x, player.y)){
            if(questionnaire.actualQuestion){
                questionnaire.prompt();
            }else{
                console.log("aez");
                swal("RAS", "Aucun problème n'a été repéré sur le réseau. Essage de repasser plus tard.", "info");
            }
        }
        return false;
    }).keyup(function(event){
        keys.update(event.which, false);
        return false;
    });

});
