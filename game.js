
// Lorsque le DOM est chargé
window.onload = function () {

    // Initialisation de Crafty
    Crafty.init(400, 400);
    Crafty.canvas.init();
    
    // On map notre spritesheet
    Crafty.sprite(32, "assets/items.png", {
        apple: [0, 0],
        fruits: [1, 0],
        egg: [2, 0],
        shell: [3, 0],
        flask: [4, 0]
    });
    
    // Création du composant Snake
    Crafty.c("Snake", {
        init: function() {
            
            // Ajout des composant :
            // - 2D pour le placement
            // - Canvas pour la méthode d'affichage
            // - shell le sprite à afficher
            this.addComponent("2D, Canvas, Keyboard, shell, Collision");
            
            // Positionnement du serpent sur le canvas
            this.attr({
                x: 100,
                y: 200
            });
            
            // Direction actuelle du Snake
            this.currentDirection = "e";
            
            // On déplace le serpent entre chaque frame
            this.bind("EnterFrame", function() {
                this.move(this.currentDirection, 1.2);
            });
            
            // Changement de direction lorsque les touches directionnelles sont préssées
            this.bind('KeyDown', function(e) {
                this.currentDirection = { 38: "n", 39: "e", 40: "s", 37: "w" }[e.keyCode] || this.currentDirection;
            });
            
            // Si le serpent touche un mur, on relance la partie
            this.onHit("Wall", function(){
                Crafty.scene("main");
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
    
    // Création de la scene principale
    Crafty.scene("main", function() {
        
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/map.png");
        
        // Ajout des limites du terrain de jeu
        Crafty.e("Walls");
        
        // Ajout du serpent sur le terrain de jeu
        Crafty.e("Snake");
        
    });
    
    // Chargement des assets
    Crafty.load(["assets/map.png", "assets/items.png"], function () {
        
        // Déclenchement de la scène principale
        Crafty.scene("main");
        
    });
    
};
