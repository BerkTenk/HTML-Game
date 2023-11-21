window.addEventListener('load',function(){
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game=game;
            window.addEventListener('keydown', e => {
                if(((e.key === 'w') || (e.key === 's'))
                
                && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                }
                else if( e.key === ' ' || e.key === 'f'){
                    this.game.player.shootTop();
                }
            })
            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key)> -1 ){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1 );
                }
            })
        }

    }
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 30;
            this.height = 10;
            this.speed = 3;
            this.markedForDeletion = false;
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    class Particle {

    }
    class Player {
        constructor(game){
            this.game = game;
            this.width= 50;
            this.height= 100;
            this.x= 20;
            this.y= 100;
            this.speedY= 0;
            this.maxSpeed = 2;
            this.projectiles = [];
        }
        update(){
            if(this.game.keys.includes('w')) this.speedY = -this.maxSpeed;
            else if(this.game.keys.includes('s')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
        }
        draw(context){
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width,this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop(){
            if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x, this.y));
            this.game.ammo--;
        }
        }
    }
    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -0.6 -0.1;
            this.markedForDeletion = false;
            this.lives= 3;
            this.score = this.lives;
        }
        update(){
            this.x += this.speedX;
            if(this.x+this.width < 0) this.markedForDeletion=true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);

        }
    }
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width= 228 *0.3 ;
            this.height= 169*0.3 ;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }
    class Layer{

    }
    class Background {

    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context){
            context.save();
            context.fillStyle=this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontSize + "px" + this.fontFamily;
            //score
            context.fillText("Score : "+ this.game.score, 20, 40);
            //ammo
            
            for(let i = 0;i< this.game.ammo;i++){
                context.fillRect(20 + 5*i, 50, 3, 20);
            }
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText("Timer : " + formattedTime, 20, 100);

            // game over messages
            if (this.game.gameOver){
                context.textAlign = "center";
                let message1;
                let message2;
                if(this.game.score > this.game.winningscore){
                    message1 = "You Win!";
                    message2 = "Well Done.";
                } else {
                    message1 = "You Lose!";
                    message2 = "Try Again Next Time.";
                }
                context.font = "50px" + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 50);
                context.font = "30px" + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 50);
            }
            context.restore();
        }
    }
    class Game{
        constructor(width,height){
            this.width = width;
            this.height = height;   
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningscore = 10;
            this.gameTime = 0;
            this.timeLimit = 5000;


        }
        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.player.update();
            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo){
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            }
            else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if(enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                           if(!this.gameOver) this.score += enemy.score;
                            if(this.score>this.winningscore) this.gameOver = true;
                        }
                    }
                })
            })
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
        }
        checkCollision(rect1, rect2){
            return ( rect1.x < rect2.x + rect2.width && 
                    rect1.x + rect1.width > rect2.x && 
                    rect1.y < rect2.y + rect2.height && 
                    rect1.height + rect1.y > rect2.y)
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);

});