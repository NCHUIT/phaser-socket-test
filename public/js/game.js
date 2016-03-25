(function($) { $(function() {
  // var player;
  var players = {};
  var players_future_pos;
  var ground, ladder;
  var cursor;

  var socket = io();
  var my_id;

  var game = new Phaser.Game($(window).width(), 600, Phaser.AUTO, '', {
      preload: preload,
      create: create,
      update: update,
      render: render
    });
  function preload() {
    game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('kenney', 'assets/kenney.png');
    game.load.image('sky', 'assets/sky.png');
    game.load.spritesheet('pastleo', 'assets/pastleo.png', 35 , 69);
  
  }

  function create() {
    game.physics.startSystem(Phaser.Physics.Arcade);
    game.physics.arcade.gravity.y = 300;

    game.add.sprite(0, 0, 'sky').scale.setTo(3, 3);

    var map = game.add.tilemap('map');
    map.addTilesetImage('kenney');

    var collisionTile = [12, 32, 33, 34, 53, 54, 92 ,134];
    for (var i = 0; i < collisionTile.length; i++) {
      map.setCollision(collisionTile[i])
    }

    ground = map.createLayer('ground');
    ground.resizeWorld();
    ground.debug = true;

    // ladder = map.createLayer('ladder');
    // ladder.resizeWorld();
    // ladder.debug = true;

    var p = game.add.sprite(700, 700, 'pastleo');
    p.frame = 4;
    p.animations.add('left', [0, 1, 2, 3], 10, true);
    p.animations.add('right', [5, 6, 7, 8], 10, true);
    game.physics.enable(p);
    p.body.bounce.y = 0.2;
    p.body.linearDamping = 1;
    p.body.collideWorldBounds = true;
    players[my_id] = p;

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(players[my_id]);

    socket.emit('joinGame', p.position);
    socket.on('joinGame', function(my) {
      console.log('[socket.on][joinGame]', my);
      players[my.id] = p;
      my_id = my.id;
      socket.emit('getAllPlayers');
    });

    socket.on('getAllPlayers', function(players_data) {
      console.log('[socket.on][getAllPlayers]',players_data);
      for (var p_id in players_data) {
        if ( my_id == p_id) continue; 
        var player_data = players_data[p_id];
        var p = game.add.sprite(
          player_data.position.x,
          player_data.position.y,
          'pastleo');
        p.frame = 4;
        p.animations.add('left', [0, 1, 2, 3], 10, true);
        p.animations.add('right', [5, 6, 7, 8], 10, true);
        game.physics.enable(p);
        p.body.bounce.y = 0.2;
        p.body.linearDamping = 1;
        p.body.collideWorldBounds = true;
        players[player_data.id] = p;
      }
    });
    socket.on('moving', function(players_data) {
      console.log('[socket.on][moving]', players_data);
      players_future_pos = players_data;
    });
  }

  function update() {
    for(var id in players) {
      if (id === 'undefined')
        continue;
      var player = players[id];
      game.physics.arcade.collide(player, ground);
      player.body.velocity.x = 0;
      if (my_id == id) {
        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -150;
            player.animations.play('left');
            socket.emit('moving', player.position);
        }
        else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 150;
            player.animations.play('right');
            socket.emit('moving', player.position);
        }
        else{
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown) {
          if (player.body.onFloor()) {
            player.body.velocity.y = -300;
            socket.emit('moving', player.position);
          }
        }
      }
      /*** 
      * 這邊還沒寫好
      * 這邊還沒寫好
      * 這邊還沒寫好
      */ 
      // else {
      //   if ( !players_future_pos)
      //     continue;
      //   var player_future_pos = players_future_pos[id];
      //   if (player.position.x > player_future_pos.position.x) {
      //     player.body.velocity.x = -150;
      //     player.animations.play('left');
      //   }
      //   else if (player.position.x < player_future_pos.position.x) {
      //     player.body.velocity.x = 150;
      //     player.animations.play('right');
      //   }
      //   else {
      //     player.animations.stop();
      //     player.frame = 4;
      //   }
      // }

    }
  }
  function render() {
  }

  function craw(player, tile) {
    console.log('event!!!!!');
    return false;
  }
}); })(jQuery);
