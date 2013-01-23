
// Lorsque le DOM est chargé
window.onload = function () {
    
    // Votre score actuel
    var currentScore = 0;
    
    // Initialisation de Crafty
    Crafty.init(400, 400, 5);
    Crafty.canvas.init();
    
    // On map notre spritesheet
    Crafty.sprite(32, "assets/items.png", {
        apple: [0, 0],
        fruits: [1, 0],
        egg: [2, 0],
        shell: [3, 0],
        flask: [4, 0]
    });
    
    // Création du composant des bouts du serpent
    Crafty.c("SnakePart", {
        init: function() {
            this.addComponent("2D, Canvas, shell, Collision");
            this.steps = [];
            
            this.collision(new Crafty.polygon([8,8], [24,8], [24, 24], [8, 24]))
            
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

            // Position par défaut
            this.attr({ x: 100, y: 200 });

            this.speed = 1;
            this.direction = "e";
            
            this.bind("EnterFrame", function() {
                this.move(this.direction, this.speed);
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
                snake.score.increment(this.speed*1000);
                
                // Destruction du fruit
                collision[0].obj.destroy();
                
                // Création d'un nouveau fruit
                Crafty.e("Food");
                
                // Augmentation de la vitesse
                this.speed += 0.075;
                
                // On rajoute un bout au corps du serpent
                snake.tail.append(snake);
                
            });
            return this;
        },
        // Corps du serpent
        body: function(snake, parent, disabledHitBox) {
            
            this.disabledHitBox = disabledHitBox || false;

            // Position par défaut
            this.attr(parent.steps[0]);
            
            // chaque partie du corps du serpent suivra la précédente
            this.bind("EnterFrame", function() {
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
    Crafty.c("Food", {
        init: function() {
            this.addComponent("2D, Canvas, fruits, Collision");
            this.attr({
                w: 32,
                h: 32,
                // On ajoute un fruit positionné aléatoirement sur le terrain
                x: Crafty.math.randomInt(32, 336),
                y: Crafty.math.randomInt(32, 304)
            });
        }
    })
    
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
                .attr({x: 16, y: 16, w: 368, h: 16}) // Positionnement du mur
                .collision(new Crafty.polygon([0,0], [368,0], [368, 16], [0, 16])); // Hitbox du mur
                
            // Mur Est
            Crafty.e("Wall")
                .attr({x: 368, y: 16, w: 16, h: 336})
                .collision(new Crafty.polygon([0,0], [16,0], [16, 336], [0, 336]));
            
            // Mur Sud
            Crafty.e("Wall")
                .attr({x: 16, y: 336, w: 368, h: 16})
                .collision(new Crafty.polygon([0,0], [368,0], [368, 16], [0, 16]));
            
            // Mur Ouest
            Crafty.e("Wall")
                .attr({x: 16, y: 16, w: 16, h: 336})
                .collision(new Crafty.polygon([0,0], [16,0], [16, 336], [0, 336]));
            
        }
    });
    
    // Création du composant Score
    Crafty.c("Score", {
        init: function() {
            this.addComponent("2D, DOM, Text");
            this.attr({ x: 40, y: 40, w: 200 });
            
            // Paramètres CSS à la jQuery
            this.css({ font: '16px Verdana', color: "white" });
            
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
            this.text("Score: "+currentScore);
            return this;
        }
    });
    
    
    Crafty.scene("menu", function() {
        
        // Si un score est enregistré on l'affiche sur le menu
        if(currentScore !== 0) {
            Crafty.e("2D, DOM, Text")
                .attr({ x: 40, y: 40, w: 200 })
                .css({ font: '16px Verdana', color: "black" })
                .text("Your score is: "+currentScore);
        }
        
        // Instructions pour démarer une partie
        Crafty.e("2D, DOM, Text, Keyboard")
            .attr({ x: 40, y: 80, w: 200 })
            .css({ font: '16px Verdana', color: "black" })
            // Instructions
            .text("Press arrow key to start")
            // Si une flèche directionnelle est préssée on lance une partie
            .bind('KeyUp', function(e) {
                if(e.keyCode  === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
                    Crafty.scene("main");
                }
            });
    });
    
    // Création de la scene principale
    Crafty.scene("main", function() {
                
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/map.png");
        
        // Ajout des limites du terrain de jeu
        Crafty.e("Walls");
        
        // Ajout du serpent sur le terrain de jeu
        Crafty.e("Snake");
        
        // Ajout du premier fruit
        Crafty.e("Food");
        
    });
    
    // Chargement des assets
    Crafty.load(["assets/map.png", "assets/items.png"], function () {
        
        // Déclenchement de la scène principale
        Crafty.scene("menu");
        
    });
    
};
