var ball;
var paddle1;
var paddle2;
var score1 = 0;
var score2 = 0;

var socket;
var am_the_host = false;

function init_connection(){

    socket = io.connect('/');
    
    socket.on("host", function(data){
        alert("Your the host!");
        am_the_host = true;
        //setInterval(send_ball_data, 500);
    });
    
    socket.on('paddle1', function(data){
        paddle1.y = data.y;
        //console.log("PADDLE 1", data);
    });

    socket.on('paddle2', function(data){
        paddle2.y = data.y;
        //console.log("PADDLE 1", data);
    });
    
    socket.on('ball', function(data){
        ball.x = data.x;
        ball.y = data.y;
        ball.body.velocity.x = data.dx;
        ball.body.velocity.y = data.dy;
    });

}



function send_ball_data(){
    if (!am_the_host) return;
    
    ball_data = {
        x: ball.x, 
        y: ball.y,
        dx: ball.body.velocity.x,
        dy: ball.body.velocity.y,
    }
    socket.emit('ball_data', ball_data);
}




window.onload = function () {
    
  var game_config = {
      'preload': preload,
      'create': create,
      'update': update,
  };

  var w = 1300;//window.innerWidth,
      h = 700;//window.innerHeight;

  var game = new Phaser.Game(w, h, Phaser.AUTO, '', game_config);

  function preload() {
      game.load.image('ball', 'img/ball.png');
      game.load.image('paddle', 'img/paddle.png');
  }

  function create() {
      spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      p1KeyUp = game.input.keyboard.addKey(Phaser.Keyboard.A);
      p1KeyDown = game.input.keyboard.addKey(Phaser.Keyboard.D);
      p2KeyUp = game.input.keyboard.addKey(Phaser.Keyboard.J);
      p2KeyDown = game.input.keyboard.addKey(Phaser.Keyboard.L);

      paddle1 = game.add.sprite(0, 0, 'paddle');
      paddle1.body.immovable = true;
      paddle1.anchor.setTo(.5, .5);
      paddle1.x = 100;
      paddle1.y = 300;

      paddle2 = game.add.sprite(0, 0, 'paddle');
      paddle2.body.immovable = true;
      paddle2.anchor.setTo(.5, .5);
      paddle2.x = game.world.width - 100;
      paddle2.y = 300

      ball = game.add.sprite(0, 0, 'ball');
      ball.body.collideWorldBounds = true;
      ball.anchor.setTo(.5, .5);

      score1Text = game.add.text(50, game.world.height - 50, 'Player 1: 0', {
          font: "20px Arial",
          fill: "#ffffff",
          align: "left"
      });
      score2Text = game.add.text(game.world.width - 150, game.world.height - 50, 'Player 2: 0', {
          font: "20px Arial",
          fill: "#ffffff",
          align: "left"
      });
      winnerText = game.add.text(game.world.centerX, game.world.centerY - 150, '', {
          font: "40px Arial",
          fill: "#ffffff",
          align: "center"
      });

      init_connection();
      reset();
  }


  function update() {
      if (spaceKey.justPressed() && ball.body.velocity.x == 0)
          start_game();

      // Mouse controlls the paddles simultaneously
      // paddle1.y = game.input.y-150;
      // paddle2.y = game.input.y-150;
      /*if (paddle1.y >= game.world.height - 175)
          paddle1.y = game.world.height - 175;

      else if (paddle1.y <= 175)
          paddle1.y = 175;

      if (paddle2.y >= game.world.height - 175)
          paddle2.y = game.world.height - 175;

      else if (paddle2.y <= 175)
          paddle2.y = 175;
    */

      // A and D controll left & J and L controll the right seperately
      if (p1KeyUp.isDown)
          socket.emit("paddle1_move_up", {});
          //paddle2.y -= 20;
      if (p1KeyDown.isDown)
          socket.emit("paddle1_move_down", {});
      
      if (p2KeyUp.isDown)
          socket.emit("paddle2_move_up", {});
      if (p2KeyDown.isDown)
          socket.emit("paddle2_move_down", {});


      game.physics.collide(ball, paddle1, ballHitPaddle1);
      game.physics.collide(ball, paddle2, ballHitPaddle2);

      if (ball.x < 50)
          pointForPlayer2();
      if (ball.x > game.world.width - 50)
          pointForPlayer1();

      if (Math.abs(ball.body.velocity.x) > window.innerWidth)
          ball.body.bounce.x = 1;

      

  }


  function reset() {
      ball.body.bounce.x = 1.05;
      ball.body.bounce.y = 1;
      ball.x = game.world.centerX;
      ball.y = game.world.centerY;

      ball.body.velocity.x = 0;
      ball.body.velocity.y = 0;
      send_ball_data();
  }


  function start_game() {
      socket.emit("start", {})
  }


  function pointForPlayer1() {
      score1++;
      score1Text.content = 'Player 1: ' + score1;
      reset();

      if (score1 === 5)
          gameOver1();
  }

  function pointForPlayer2() {
      score2++;

      score2Text.content = 'Player 2: ' + score2;
      reset();

      if (score2 === 5)
          gameOver2();

  }

  function gameOver1() {
      winnerText.content = 'Player 1 Wins!!!!!!'
  }

  function gameOver2() {
      winnerText.content = 'Player 2 Wins!!!!!!'
  }



  function ballHitPaddle1() {
      
      var diff = 0;
      if (ball.y < paddle1.y) {
          //  Ball is on the left-hand side of the paddle
          diff = paddle1.y - ball.y;
          ball.body.velocity.y = (-3 * diff);
      } else if (ball.y > paddle1.y) {
          //  Ball is on the right-hand side of the paddle
          diff = ball.y - paddle1.y;
          ball.body.velocity.y = (3 * diff);
      } else {
          //  Ball is perfectly in the middle
          //  Add a little random X to stop it bouncing straight up!
          ball.body.velocity.y = 2 + Math.random() * 4;
      }
      send_ball_data();  
  }

  function ballHitPaddle2() {
      var diff = 0;
      if (ball.y < paddle2.y) {
          //  Ball is on the left-hand side of the paddle
          diff = paddle2.y - ball.y;
          ball.body.velocity.y = (-3 * diff);
      } else if (ball.y > paddle2.y) {
          //  Ball is on the right-hand side of the paddle
          diff = ball.y - paddle2.y;
          ball.body.velocity.y = (3 * diff);
      } else {
          //  Ball is perfectly in the middle
          //  Add a little random X to stop it bouncing straight up!
          ball.body.velocity.y = 2 + Math.random() * 4;
      }
      send_ball_data();  
  }



}