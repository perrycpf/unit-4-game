$(document).ready(function() {

  var characters = {
      "iron-man" : {
          id: "iron-man",
          name: "Iron Man",
          healthPoints: 150,
          attackPoints: 15,
          counterAttackPoints: 10,
          image: "assets/images/iron-man.jpg",
          sound: "assets/sounds/iron-man.mp3"
      },
      "captain-america" : {
        id: "captain-america",
        name: "Captain America",
        healthPoints: 100,
        attackPoints: 10,
        counterAttackPoints: 8,
        image: "assets/images/captain-america.jpg",
        sound: "assets/sounds/captain-america.mp3"
      },
      "hulk" : {
        id: "hulk",
        name: "Hulk",
        healthPoints: 180,
        attackPoints: 30,
        counterAttackPoints: 12,
        image: "assets/images/hulk.jpg",
        sound: "assets/sounds/hulk.mp3"
      },
      "thanos" : {
        id: "thanos",
        name: "Thanos",
        healthPoints: 200,
        attackPoints: 30,
        counterAttackPoints: 50,
        image: "assets/images/thanos.jpg",
        sound: "assets/sounds/thanos.mp3"
      }
  };
  var playerSelected; // Set to true if a player is selected
  var defenderSelected; // Set to true if a defender is selected
  var player; // Holds the player object
  var defender; // Holds the defender object
  var charList; // Temp object for storing the characters during the game
  var baseAttackPoints; // Store the base attack points of a player
  var playerColor = "linear-gradient(-90deg,green, rgba(0, 255, 85, 0.164))"; //  Title and footer color for player
  var enemyColor = "linear-gradient(-90deg,red, rgba(255, 94, 0, 0.774))"; // Title and footer color for enemy
  var backgroundAudio = "assets/sounds/background.mp3"; // Game background music path
  var audioElement; // Sound object

  // Create card template for character
  function CreateCard(cardData) {
    var cardTemplate = [
      '<div class="card">',
        '<div class="card-title rounded-top" id=', cardData.id, '-title>', cardData.name || 'No name provided',
        '</div>',
        '<img alt="Character Picture" class="character-pic img-fluid" id=', cardData.id, ' src=', cardData.image, '>',
        '<div class="card-footer rounded-bottom" id=',cardData.id, '-HP>HP: ', cardData.healthPoints || 'No data provided',
        '</div>',
      '</div>'  
    ];
    return $(cardTemplate.join(''));
  };

  // Render a fighter to area
  function printCharacter (charData, charColor, renderArea) {
    $(renderArea).append(CreateCard(charData));
    updateCharColor(charData, charColor);
  }; 

  // Render characters to area for selection
  function characterCards (charColor, renderArea) {  
    for (x in charList) {
      printCharacter(charList[x],charColor,renderArea);  
    }
  };

  // Remove characters from area
  function removeCharacters (renderArea, key) {
    $(renderArea).empty();
    if (key != "") {
      delete charList[key];
    }
  };

  // Update title and footer colors (red or green) of a character
  function updateCharColor (charData, charColor) {
      $("#"+ charData.id + "-title").css("background-image", charColor);
      $("#"+ charData.id + "-HP").css("background-image", charColor);
  };

  // Setup a fighter
  function setupFighter (charData, role, charColor1, charColor2, renderArea1, renderArea2, renderArea3) {
    if (playerSelected && !defenderSelected) {
      player = charData;
      baseAttackPoints = player.attackPoints;
    } else {
      defender = charData;
      $('#attack').prop('disabled', false);
    }
    // Remove the selected player or defender from the list
    removeCharacters (renderArea2, role);
    // Setup player or defender character
    printCharacter(charData,charColor1,renderArea1);
    // Update next enemies list
    characterCards(charColor2,renderArea3);
  };

  // Perform an attacks
  function attack (charData1, charData2) {
    charData2.healthPoints -= charData1.attackPoints;
    $("#gameMessage").html("You attacked "+ charData2.name + " for " + charData1.attackPoints + " damage points.");
    charData1.attackPoints += baseAttackPoints;
    playSound(charData1.sound); 
  };

  // Perform a counter attack
  function counterAttack (charData1, charData2) {
    charData1.healthPoints -= charData2.counterAttackPoints;
    $("#gameMessage").append("<br>" + charData2.name + " attacked you back for " + charData2.counterAttackPoints + " damage points.");
  };

  // Update health points
  function updateHP (charData) {
    $('#'+charData.id+"-HP").html('HP: '+charData.healthPoints);
    // Blinking HP points if it reaches 50 and below
    if (charData.healthPoints <= 50) {
      $("#"+ charData.id + "-HP").addClass("blink_me");
    }  
  };

  // Check if the player has defeated all enemies
  function isDefeatedAll () {
    if (Object.keys(charList).length === 0 && player.healthPoints > 0)
      return true;
    else return false;
  };

  function playSound (audioSource) {
    audioElement = document.createElement("audio");
    audioElement.setAttribute("src", audioSource);
    audioElement.play();
  };

  // Click event for selecting a player or defender
  $(document).on("click", "img", function() {
    var key = $(this).attr('id');
    if (!playerSelected) {
      playerSelected = true;
      setupFighter (charList[key], key, playerColor, enemyColor, "#playerDiv", "#characters-section", "#enemiesDiv");
    } else if (!defenderSelected && player.healthPoints > 0) {
      defenderSelected = true;
      setupFighter (charList[key], key, enemyColor, enemyColor, "#defenderDiv", "#enemiesDiv", "#enemiesDiv");
      $("#gameMessage").html("");
    }         
  });  

  // Click event for attacking enemy and counter-attacking player
  $(document).on("click", "#attack", function () {
    if (player.healthPoints > 0 && defender.healthPoints > 0) {
      attack (player, defender);
      counterAttack (player, defender);
      updateHP (player);
      updateHP (defender);
      if (defender.healthPoints <= 0)  {
        defenderSelected = false;
        $("#gameMessage").html("You have defeated " + defender.name + ", you can choose to fight another enemy.");
        removeCharacters ("#defenderDiv", defender.id);
        $('#attack').prop('disabled', true);
      }
      if (player.healthPoints <= 0) {
        $("#gameMessage").html("You have been defeated....GAME OVER!!!!");
        $('#attack').prop('disabled', true);
        $("#restart").show();  
      }
    } 
    if (isDefeatedAll()) {
      playSound(backgroundAudio);
      $("#gameMessage").html("You Won!!!! GAME OVER!!!!");
      removeCharacters ("#defenderDiv", defender.id);
      // Wait 10s for background sound before starting a new game
      setTimeout(function(){$("#restart").show();}, 10000);
      $('#attack').prop('disabled', true);
    }
  });

  // Click event for starting a new game
  $(document).on("click", "#restart", function() {
    removeCharacters ("#playerDiv", player.id);
    removeCharacters ("#defenderDiv", defender.id);
    removeCharacters ("#enemiesDiv", "");
    $("#gameMessage").html("");
    gameStart();
    
  });  
  
  // Initiate the game
  function gameStart () {
    $("#restart").hide();
    playerSelected = false; 
    defenderSelected = false;
    player = "";
    defender = "";
    charList = $.extend(true, {}, characters);
    baseAttackPoints = 0;
    characterCards(playerColor, "#characters-section");
    
  }
  
  // Start the main program
  gameStart ();

});   