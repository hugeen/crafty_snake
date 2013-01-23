
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
            this.addComponent("2D, Canvas, shell");
            
            // Positionnement du serpent sur le canvas
            this.attr({
                x: 100,
                y: 200
            });
        }
    });
    
    // Création de la scene principale
    Crafty.scene("main", function() {
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/map.png");
        Crafty.e("Snake");
    });
    
    // Chargement des assets
    Crafty.load(["assets/map.png", "assets/items.png"], function () {
        // Déclenchement de la scène principale
        Crafty.scene("main");
    });
    
};
