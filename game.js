
// Lorsque le DOM est chargé
window.onload = function () {
    
    // Votre score actuel
    var currentScore = 0;
    var bonusInterval = false;
    var sprintInterval = false;
    
    // Initialisation de Crafty
    Crafty.init(500, 600, 5);
    Crafty.canvas.init();
    
    // On map notre spritesheet
    Crafty.sprite(32, "assets/snakeitems01.png", {
        sprint: [0, 0],
        sweet: [1, 0],
        cut: [2, 0],
        part: [3, 0],
        head: [4, 0]
    });
    
    // Création du composant des bouts du serpent
    Crafty.c("SnakePart", {
        init: function() {
            this.addComponent("2D, Canvas, Collision");
            this.steps = [];
            this.attr({ x: -200, y: -200, w: 32, h: 32 });
            this.collision(new Crafty.polygon([10,10], [20,10], [20, 20], [10, 20]))
            this.origin("center");
            // On enregistre les 10 dernières positions de cette partie
            this.bind("EnterFrame", function() {
                this.steps.push({ x: this.x, y: this.y });
                if(this.steps.length > 10) {
                    // Si il y à plus de 10 positions enregistrées, on supprime la plus ancienne
                    this.steps.shift();
                }
            });
        },
        // La tête du serpent
        head: function(snake) {
            
            
            this.addComponent("Delay, head");
            
            // Position par défaut
            this.attr({ x: 100, y: 200, z: 1 });

            this.speed = 1;
            this.direction = "e";
            this.speedMultiplier = 1;
            
            this.bind("EnterFrame", function() {
                
                if(this.direction == "w") {
                    this.attr({ rotation: 180 });
                }
                if(this.direction == "e") {
                    this.attr({ rotation: 0 });
                }
                if(this.direction == "n") {
                    this.attr({ rotation: 270 });
                }
                if(this.direction == "s") {
                    this.attr({ rotation: 90 });
                }
                this.move(this.direction, this.speed*this.speedMultiplier);
            });
            
            // Si le serpent touche un mur, on revient au menu
            this.onHit("Wall", function(){
                Crafty.scene("menu");
            });
            
            // Si le serpent touche sa queue, on revient au menu
            this.onHit("SnakePart", function(collision) {
                
                // La hitbox des 2 premières parties du serpent est désactivée
                if(!collision[0].obj.disabledHitBox) {
                    Crafty.scene("menu");
                }
            });
            
            // Si on attrape un fruit
            this.onHit("Food", function(collision) {
                
                // On incrémente le score en fonction de la vitesse actuelle
                snake.score.increment(this.speed*100);
                
                /// Destruction du fruit
                for(var index in collision) {
                    collision[index].obj.destroy();
                }
                
                // Création d'un nouveau fruit
                Crafty.e("Food");
                
                // Augmentation de la vitesse
                this.speed += 0.085;
                
                // On rajoute un bout au corps du serpent
                snake.tail.append(snake);
                
            });
            
            // Si on attrape un fruit
            this.onHit("Bonus", function(collision) {
                
                // On incrémente le score en fonction de la vitesse actuelle
                snake.score.increment(this.speed*100*2);
                
                // Destruction du fruit
                for(var index in collision) {
                    collision[index].obj.destroy();
                }
                        
                // Augmentation de la vitesse
                this.speed -= 0.085*2;
                
                for(var i = 0; i < 2; i++) {
                    var oldTail = snake.tail;
                    snake.tail = snake.tail.parentPart;
                    oldTail.destroy();
                }

            });
            
            this.onHit("Sprint", function(collision) {
                
                snake.score.increment(this.speed*100*2);
                
                for(var index in collision) {
                    collision[index].obj.destroy();
                }

                this.speedMultiplier = 2;
                
                this.delay(function() {
                    this.speedMultiplier = 1;
                }, 3*100);


            });
            return this;
        },
        // Corps du serpent
        body: function(snake, parent, disabledHitBox) {
            this.addComponent("part");
            this.parentPart = parent;
            this.attr({ z: parent._z-1 });
            this.disabledHitBox = disabledHitBox || false;

            // Position par défaut
            this.attr(parent.steps[0]);
            
            // chaque partie du corps du serpent suivra la précédente
            this.bind("EnterFrame", function() {
                if(parent.steps[0].x-this._x > 0) {
                    this.attr({ rotation: 180 });
                }
                if(parent.steps[0].x-this._x < 0) {
                    this.attr({ rotation: 0 });
                }
                if(parent.steps[0].y-this._y > 0) {
                    this.attr({ rotation: 270 });
                }
                if(parent.steps[0].y-this._y < 0) {
                    this.attr({ rotation: 90 });
                }
                this.attr(parent.steps[0]);
                
            });
            
            return this;
        },
        append: function(snake, disabledHitBox) {
            snake.tail = Crafty.e("SnakePart").body(snake, this, disabledHitBox);
        }
    })

    // Création du composant Snake
    Crafty.c("Snake", {
        init: function() {
            
            // Ajout des composant :
            // - 2D pour le placement
            // - Canvas pour la méthode d'affichage
            // - shell le sprite à afficher
            this.addComponent("2D, Canvas, Keyboard");
            
            // Création et affichage du score
            this.score = Crafty.e("Score").display();
            
            // Tête du serpent
            this.head = Crafty.e("SnakePart").head(this);
            
            // La queue du serpent
            this.tail = this.head;
            
            // On rajoute 2 parties au corps du serpent
            this.tail.append(this, true);
            this.tail.append(this, true);
            
            // Changement de direction lorsque les touches directionnelles sont préssées
            this.bind('KeyDown', function(e) {
                
                // Stockage de l'ancienne direction
                var oldDirection = this.head.direction;
                
                // Stockage de la nouvelle direction
                var newDirection = {
                    38: "n",
                    39: "e",
                    40: "s",
                    37: "w"
                }[e.keyCode] || this.head.direction;
                
                // Si l'a nouvelle direction n'est pas l'opposée de l'ancienne on modifie la direction de notre serpent.
                if(newDirection !== {"n":"s", "s":"n", "e":"w", "w":"e"}[oldDirection]) {
                    this.head.direction = newDirection;
                }
                
            });

        }
    });

    // Composant Food
    Crafty.c("Bonus", {
        init: function() {
            this.addComponent("2D, Canvas, cut, Collision, Delay");
            this.attr({
                w: 32,
                h: 32,

                x: Crafty.math.randomInt(32, 336),
                y: Crafty.math.randomInt(32, 304)
            });
            
            this.delay(function() {
                this.destroy();
            }, Crafty.math.randomInt(4, 8)*1000);
            
        }
    });
    
    // Composant Food
    Crafty.c("Sprint", {
        init: function() {
            this.addComponent("2D, Canvas, sprint, Collision, Delay");
            this.attr({
                w: 32,
                h: 32,

                x: Crafty.math.randomInt(32, 336),
                y: Crafty.math.randomInt(32, 304)
            });
            
            this.delay(function() {
                this.destroy();
            }, Crafty.math.randomInt(5, 9)*1000);
            
        }
    });
    
    // Composant Food
    Crafty.c("Food", {
        init: function() {
            this.addComponent("2D, Canvas, sweet, Collision");
            this.attr({
                w: 32,
                h: 32,
                // On ajoute un fruit positionné aléatoirement sur le terrain
                x: Crafty.math.randomInt(32, 443),
                y: Crafty.math.randomInt(32, 468)
            });
        }
    });
    
    // Composant Mur
    Crafty.c("Wall", {
        init: function() {
            this.addComponent("2D, Canvas, Collision");
        }
    });
    
    // Composant Murs, contient les 4 murs qui délimitent la zone de jeu
    Crafty.c("Walls", {
        init: function() {

            // Création du mur Nord
            Crafty.e("Wall")
                .attr({x: 16, y: 16, w: 468, h: 16}) // Positionnement du mur
                .collision(new Crafty.polygon([0,0], [468,0], [468, 16], [0, 16])); // Hitbox du mur
                
            // Mur Est
            Crafty.e("Wall")
                .attr({x: 475, y: 16, w: 16, h: 436})
                .collision(new Crafty.polygon([0,0], [16,0], [16, 500], [0, 500]));
            
            // Mur Sud
            Crafty.e("Wall")
                .attr({x: 16, y: 500, w: 468, h: 16})
                .collision(new Crafty.polygon([0,0], [468,0], [468, 16], [0, 16]));
            
            // Mur Ouest
            Crafty.e("Wall")
                .attr({x: 16, y: 16, w: 16, h: 436})
                .collision(new Crafty.polygon([0,0], [16,0], [16, 500], [0, 500]));
            
        }
    });
    
    // Création du composant Score
    Crafty.c("Score", {
        init: function() {
            this.addComponent("2D, DOM, Text");
            this.attr({ x: 40, y: 40, w: 200 });
            
            // Paramètres CSS à la jQuery
            this.css({ font: '16px Verdana', color: "black" });
            
            // Réinitialisation du score
            currentScore = 0;
        },
        // Incrémentation et display du score 
        increment: function(by) {
            currentScore += by;
            this.display();
            return this;
        },
        display: function() {
            // Affichage du score à l'écran
            this.text("Score: "+Math.round(currentScore));
            return this;
        }
    });
    
    
    Crafty.scene("menu", function() {
        
        clearInterval(bonusInterval);
        clearInterval(sprintInterval);
        
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image, Keyboard").image("assets/snakescreen01.png").attr({ z: -9999 }).bind('KeyUp', function(e) {
            if(e.keyCode  === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
                Crafty.scene("main");
            }
        });
        
        Crafty.e("2D, DOM, Text")
            .attr({ x: 98, y: 45, w: 200 })
            .css({ font: '15px Verdana', color: "black" })
            .text(Math.round(currentScore));
    });
    
    // Création de la scene principale
    Crafty.scene("main", function() {
                
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/snakefond01.png").attr({ z: -9999 });
        
        // Ajout des limites du terrain de jeu
        Crafty.e("Walls");
        
        // Ajout du serpent sur le terrain de jeu
        Crafty.e("Snake");
        
        // Ajout du premier fruit
        Crafty.e("Food");
        
        bonusInterval = setInterval(function() {
            Crafty.e("Bonus");
        }, 23*1000);
        
        sprintInterval = setInterval(function() {
            Crafty.e("Sprint");
        }, 19*1000);

        
    });
    
    // Chargement des assets
    Crafty.load(["assets/snakefond01.png", "assets/snakeitems01.png", "assets/snakescreen01.png"], function () {
        
        // Déclenchement de la scène principale
        Crafty.scene("menu");
        
    });
    
};
