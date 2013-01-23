
window.onload = function () {

    // Initialisation de Crafty
    Crafty.init(400, 400);
    Crafty.canvas.init();
    
    // Création de la scene principale
    Crafty.scene("main", function() {
        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/map.png");
    });
    
    // Chargement des assets
    Crafty.load(["assets/map.png"], function () {
        // Déclenchement de la scène principale
        Crafty.scene("main");
    });
    
};
