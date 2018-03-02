function Btu(conf){
    var me = this;
    $.extend(me, conf);
    console.log('[Btu] init');

    me.mainContainer = $(me.target);
	me.mainContainer.addClass("gameContainer viewport");
    me.target= me.target;
    me.mainContainer.append('<div class="playfield" style="left:0;top:0;"></div>');
    me.playfield = $(me.mainContainer).find('.playfield');
    me.playfield.h = me.playfield.height();
    me.playfield.w = me.playfield.width();

    me.playfield.append('<div class="bg"></div>');
    me.world = new TileWorld({
        rows: 15,
        columns: 20,
        tileWidth: 64,
        tileHeight: 64,
        target: me.playfield,
        viewPort: me.mainContainer[0]
    });
    
    me.playfield[0].style.left = 0;
    me.playfield[0].style.top = 0;
    me.camera = new BtuCamera({target: me.playfield[0]});
    
    me.frame = 0;
    me.input= new Input({target:document});    

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
            <p>attack: ${me.player.attackBoxes[0].enable}</p>
            <p>camera: ${me.camera.x}, ${me.camera.y}</p>
        `);
    }

    mlog();

    function processInputs(){
		//aceleración
		if( me.input.kLeft&&!me.input.kRight ){
            me.player.walk(-10,0);
            me.camera.move(-10,0);
		}
		if( me.input.kRight&&!me.input.kLeft ){
            me.player.walk(10,0);
            me.camera.move(10,0);
		}
		if( me.input.kUp&&!me.input.kDown ){
			me.player.walk(0,-10);
		}
		if( me.input.kDown&&!me.input.kUp ){
			me.player.walk(0,10);
		}	
		//shoot
		if( me.input.kSpace ){
			me.player.punch(0);
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

        //vaciar toRemove

        //check ataques player -> enemy
        for( var i in me.actors ){
            var actor = me.actors[i];
            if( actor!=me.player ){                
                if( isActorAttacked(actor, me.player) ){                    
                    actor.doDamage(10);
                }
            }
        }

        
        //update posiciones
		for( var i in me.actors ){
			var actor = me.actors[i];
            actor.update();            
		}        
    }

    function renderFrame(){
        me.world.update();
        
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
    me.health = 100;
    me.attackDuration = 30;
    me.attackI = 0;
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
Person.prototype.punch = function(n){
    if( !this.attackBoxes || !this.attackBoxes[n] ){
        return;
    }    
    this.attackI++;//lanza el ataque
    this.currentAttack = this.attackBoxes[n];
    this.currentAttack.enable = true;    
}
Person.prototype.doDamage = function(d){
    this.health-=d;
}
Person.prototype.update = function(){    
    Actor.prototype.update.call(this);
    if( this.attackI > 0 ){//atacando
        this.attackI++;
        
        if( this.attackI>=this.attackDuration ){
            this.attackI = 0;
            this.currentAttack.enable = false;
            return;
        }
    }
    this.el.label[0].innerText = this.health;
}

function Hero(conf){
    var me = this;
    this.hitBoxes = [{
            height	: 100,
            width	: 50,
            top		: 0,
            left	: 0
        }
    ];
    this.attackBoxes = [
        {
            height	: 20,
            width	: 75,
            top		: 10,
            left	: 0
        },
    ];
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
    classNames.push('hero');
	Person.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[Hero] constructor", me, conf);
    me.health = 100;
    me.collisionAnimationDuration = 1;
	return me;    
}
Hero.prototype = Object.create(Person.prototype);
Hero.prototype.update = function(){
    Person.prototype.update.call(this);
    //this.el[0].innerText=this.x + ' ' + this.y;    
}

function Enemy(conf){
    var me = this;
    me.hitBoxes = [{
            height	: 100,
            width	: 50,
            top		: 0,
            left	: 0
        }
    ];

	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('enemy');
	Person.call(this, $.extend(conf, {classNames:classNames}));
    console.log("[Enemy] constructor", me, conf);
    me.components = [
        new HealthBar({
            target: me.el
        })
    ];    
    console.log("[Enemy] hola", me.components);
    this.collisionAnimationDuration = 1;
	return me;    
}
Enemy.prototype = Object.create(Person.prototype);

function BtuCamera(conf){
    var me = this;
    $.extend(me, conf);
    me.x = 0;
    me.y = 0;   

    return me;
}
BtuCamera.prototype.move = function (x, y){
    this.x-= x;
    this.y+= y;
    //console.log('[BtuCamera]', this.target, this.x, this.y);
    this.target.style.left=this.x;
    this.target.style.top=this.y;
}
BtuCamera.prototype.getPos = function (){
    return [this.x, this.y];
}