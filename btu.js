function Btu(conf){
    var me = this;
    $.extend(me, conf);
    console.log('[Btu] init');

    me.mainContainer = $(me.target);
	me.mainContainer.addClass("gameContainer");
    me.target= me.target;
    me.mainContainer.append('<div class="playfield"></div>');
    me.playfield = $(me.mainContainer).find('.playfield');
    me.playfield.h = me.playfield.height();
    me.playfield.w = me.playfield.width();
    
    me.frame = 0;
    me.input= new Input({target:document});

    console.log("playfield", me.playfield);

    me.actors = [];

    me.player = new Hero({
		target: me.playfield,
		x:300, y:200,
		constrainToTarget: true
    });

    me.actors.push(me.player);

    me.actors.push(
        new Enemy({
            target: me.playfield,
            x:400, y:300,
            constrainToTarget: true            
        })
    );
    
    me.console = new mConsole({
        target: me.target
    });    

    function mlog(){
        me.console.update(`
            <p>up: ${me.input.kUp}</p>
            <p>dw: ${me.input.kDown}</p>
            <p>lf: ${me.input.kLeft}</p>
            <p>rg: ${me.input.kRight}</p>
            <p>sp: ${me.input.kSpace}</p>
            <p>frame: ${me.frame}</p>
            <p>frametime: ${me.lastFrameTime - me.frameTime}</p>
            <p>player x: ${me.player.x}</p>
            <p>player y: ${me.player.y}</p>
        `);
    }

    mlog();

    function processInputs(){
		//aceleración
		if( me.input.kLeft&&!me.input.kRight ){
			me.player.walk(-10,0);
		}
		if( me.input.kRight&&!me.input.kLeft ){
			me.player.walk(10,0);
		}
		if( me.input.kUp&&!me.input.kDown ){
			me.player.walk(0,-10);
		}
		if( me.input.kDown&&!me.input.kUp ){
			me.player.walk(0,10);
		}	
		//shoot
		if( me.input.kSpace ){
			me.player.punch();
		}
		//weapon select
		if( me.input.k1 ){
			me.player.selectWeapon(0);
		}
		if( me.input.k2 ){
			me.player.selectWeapon(1);
		}	        
    }

    function updateFrame(){
        //check colisiones
		toRemove = [];
		var playerCollision = false;//para pintar la nave si es chocada
		for( var i in me.actors ){
			var collisionWithPlayer = false;//para pintar al enemigo si choca con la nave
			var actor = me.actors[i];
			if( actor!=me.player /*&& !(actor instanceof PlayerShoot)*/ ){
				collisionWithPlayer = collisionWithPlayer || isActorCollision(actor, me.player);
				if( collisionWithPlayer ){
					if( actor instanceof Enemy ){
						me.player.doDamage(20);
						//actor.collision(collisionWithPlayer);
						if( collisionWithPlayer ){
							actor.collision();
						}
					}
				}
			}
			playerCollision = playerCollision || collisionWithPlayer;
        }
                
		if( playerCollision ){
			me.player.collision();
        }
        
        //update posiciones
		for( var i in me.actors ){
			var actor = me.actors[i];
            actor.update();            
		}        
    }

    function renderFrame(){
		for( var i in me.actors ){
			me.actors[i].render();
		}
	}

	function updateGame(){        
		me.frameTime = new Date().getTime();
		me.frame++;
		if(me.frame==60){
			me.frame=0;
        }
        
        processInputs();       
        updateFrame();
        renderFrame();
        /*
        
        me.updateInfo();
        */
        me.lastFrameTime = new Date().getTime();
        mlog(`frameTime: ${me.frameTime}`);
        window.requestAnimationFrame(updateGame);
    }
    
    updateGame();

    return {

    }
}

function Person(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('Person');
	Actor.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[Person] constructor", me, conf);

	return me;    
}
Person.prototype = Object.create(Actor.prototype);
Person.prototype.walk = function(x, y){
    this.x+=x;
    this.y+=y;
}
Person.prototype.punch = function(){

}
Person.prototype.doDamage = function(d){
    this.health-=d;
}

function Hero(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('hero');
	Person.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[Hero] constructor", me, conf);
    me.health = 100;
	return me;    
}
Hero.prototype = Object.create(Person.prototype);
Hero.prototype.update = function(){
    Person.prototype.update.call(this);
    this.el[0].innerText=this.x + ' ' + this.y;    
}

function Enemy(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('enemy');
	Person.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[Enemy] constructor", me, conf);
    this.collisionAnimationDuration = 1;
	return me;    
}
Enemy.prototype = Object.create(Person.prototype);