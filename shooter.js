//console.log = function(){	return false;}

function Shooter(conf){
	var me	= this;
	me.fps	= 60;
	$.extend(me, conf);
	console.log('[Shooter] constructor', conf);

	me.mainContainer = $(me.target);
	me.mainContainer.addClass("gameContainer");
	me.target	= $(me.target); 
	
	me.console		= $('<div class="console">'+
		'<p class="counter">Frame: <span></span></p>'+
		'<p class="frametime">Frametime: <span></span></p>'+
		'<p><span class="input kL">left</span><span class="input kR">right</span><span class="input kS">space</span></p>'+
		'<p>accel x:<span class="accel x"></span></p>'+
		'<p>accel y:<span class="accel y"></span></p>'+
		'<p>Actors:<span class="pshoots"></span></p>'+
		'<p>Health:<span class="health"></span></p>'+
		'<p>Enemies left:<span class="enemLeft"></span></p>'+
	'</div>');
	me.hud	= $('<div class="hud">'+
		'<table>'+
			'<tr><th>SCORE</th><th>WEAPON</th><th>AMMO</th><th>health</th><th>Enemies</th></tr>'+
			'<tr><td class="score"></td><td class="weapon"></td><td class="ammo"></td><td class="health"></td><td class="enemLeft"></th></tr>'+
		'</table>'+
	'</div>');	
	me.mainContainer.append(me.console);
	me.mainContainer.append(me.hud);
	
	me.target.append('<div class="playfield"></div>');
	me.target = me.target.find(".playfield");
	//me.target.height('100%');
	me.target.h = me.target.height();
	me.target.w = me.target.width();	

	me.player	= new PlayerShip({
		target:me.target,
		x:300, y:200,
		constrainToTarget	: true
	});
	me.input	= new Input({target:document});
	me.nEnemies	= 5;
	me.frame	= 0;
	
	me.starField = new StarField({
		target	: me.target,
		layers	: [
			{
				nStars	: 4
			},
			{
				nStars	: 4
			}/*,
			{
				nStars	: 4
			}*/			
		]
	});	

	me.waves	= [
		{
			nEnemies	: 3,
			type		: '0',
			trajectory	: {
				path	: [
					//[100,0],
					//[500,0]
					[me.target.w-100,0],
					[0, 0]
				],
				rate	: 5
			},
			th			: {
				sprite		: {
					file		: 'stek1.png',
					width		: 69,
					height		: 86,
					positions	: [ [0,0], [70,0] ]
				},
				text		: 'BY DISABLING YOUR ACCESS TO GALACTIC NETWORKING, I DISCOURAGE YOU TO SAILING THE UNIVERSE. PRESS FIRE [SPACE]'
			}
		}/*,
		{
			nEnemies	: 4,
			type		: '1',
			trajectory	: {
				path	: [
					[0,0],
					[me.target.w-100, 200],
					[me.target.w-100, 0],
					[0,100]
				],
				rate	: 7
			}			
		},
		{
			nEnemies	: 1,
			type		: 'Boss1',
			trajectory	: {
				path	: [
					[200,0],
					[500,0],
					[me.target.w-300,100],
					[400,200],
					[0,150]
				],
				rate	: 7
			},
			th			: {
				sprite		: {
					file		: 'cp.png',
					width		: 86,
					height		: 86,
					positions	: [ [0,0], [86,0] ]
				},
				text		: 'I AM PALONSK. LORD OF PROXA REVERSA GALAXY. I WILL DESTROY YOU, BY SENDING YOU URL REQUESTS THROUGH WEBFILES ACCESSING REMOTELY USING GALACTIC COORDINATES MONOLITIC CARD PREVIOUSLY STORED IN A SEQUENTIAL FILE BY A DAEMON DEVELOP... [COMMUNICATION ERROR]'
			}
		}*/
	];
	me.currentWave = -1;
	me.waveCompleted = true;

	
	me.frameCount	= me.console.find('.counter span');
	me.frameTimeCounter	= me.console.find('.frametime span');
	me.spanKL		= me.console.find('span.kL');
	me.spanKR		= me.console.find('span.kR');
	me.spanKS		= me.console.find('span.kS');
	me.spanActors	= me.console.find('span.pshoots');
	me.spanAccelX	= me.console.find('span.accel.x');
	me.spanAccelY	= me.console.find('span.accel.y');
	me.hudScore		= me.hud.find('td.score')[0];
	me.spanHealth	= me.console.find('span.health');
	me.hudHealth	= me.hud.find('td.health')[0];
	me.spanEnemLeft	= me.console.find('span.enemLeft');
	me.hudEnemLeft	= me.hud.find('td.enemLeft')[0];
	me.hudWeapon	= me.hud.find('td.weapon')[0];
	me.hudAmmo		= me.hud.find('td.ammo')[0];
	
	me.actors = [];
	me.actors.push(me.player);

	me.processInputs = function(){	
		//si no hay input de dirección, se desacelera
		if( !me.input.kRight&&!me.input.kLeft ){
			me.player.brakeX();
		}
		if( !me.input.kDown&&!me.input.kUp ){
			me.player.brakeY();
		}		
		//shoot
		if( me.input.kSpace && me.player.shootIntervalI==0 ){
			me.actors.push(new PlayerShoot({
				owner	: me.player,
				vector	: [null, -10]
			}));
			me.player.shoot();
		}
		//aceleración
		if( me.input.kLeft&&!me.input.kRight ){
			me.player.accelLeft();
		}
		if( me.input.kRight&&!me.input.kLeft ){
			me.player.accelRight();
		}
		if( me.input.kUp&&!me.input.kDown ){
			me.player.accelUp();
		}
		if( me.input.kDown&&!me.input.kUp ){
			me.player.accelDown();
		}
		//weapon select
		if( me.input.k1 ){
			me.player.selectWeapon(0);
		}
		if( me.input.k2 ){
			me.player.selectWeapon(1);
		}		
	}

	me.updateInfo = function(){		
		if( me.input.kSpace ){
			me.spanKS.addClass("pressed");
		}
		else{
			me.spanKS.removeClass("pressed");
		}
		if( me.input.kLeft ){
			me.spanKL.addClass("pressed");
		}
		else{
			me.spanKL.removeClass("pressed");
		}
		if( me.input.kRight ){
			me.spanKR.addClass("pressed");
		}
		else{
			me.spanKR.removeClass("pressed");
		}
		me.spanActors.html(me.actors.length);
		me.frameCount.html(me.frame);
		me.frameTimeCounter.html(me.frameTime-me.lastFrameTime);
		me.spanAccelX.html(me.player.accel[0]);
		me.spanAccelY.html(me.player.accel[1]);
		me.spanHealth.html(me.player.health);
		me.hudScore.textContent=me.player.score;
		me.hudHealth.textContent=me.player.health;
		me.spanEnemLeft.html(me.currentWavesEnemiesLeft);
		me.hudEnemLeft.textContent=me.currentWavesEnemiesLeft;
		me.hudWeapon.textContent=me.player.currentWeapon.name;
		me.hudAmmo.textContent=me.player.currentWeapon.ammo;
	}
	
	me.initWave = function(wave){
		me.currentWavesEnemiesLeft = wave.nEnemies;
		var enemyType = wave.type||'0';
		for( var i=0;i<wave.nEnemies;i++ ){
			me.actors.push(new me.enemies[enemyType]({
				target			: me.target,
				fireInterval	: Math.round(Math.random()*50)+50,
				//fireInterval	: 75,
				x				: 100+(i*100),
				y				: 0,
				trajectory		: new Trajectory(wave.trajectory)
			}));
		}
	}

	me.updateFrame = function(){
		
		if( me.waveCompleted ){
			me.currentWave++;
			var wave = me.waves[me.currentWave];
			if( wave ){
				me.waveCompleted=false;	
				if( false /*wave.msg || wave.th*/ ){
			    	if( wave.th ){
			    		var conf = wave.th;
			    		conf.callback = function(){
				                me.initWave(wave);
								me.waveCompleted=false;	
				    	     };
				    	var th = new TH(conf);	
					}
					else{
						var msg = new Msg({
				    		text       : wave.msg.text,
				    	    callback   : function(){
				            	me.initWave(wave);
								me.waveCompleted=false;	
							}
				    	});
					}
				}
				else{
					me.initWave(wave);
				}
			}
			else{
				me.win();
			}
		}

		//remuevo los actores que se se van de pantalla (shoots)
		var toRemove = [];
		for( var i in me.actors ){
			var actor = me.actors[i];
			if( actor instanceof Shoot && (actor.y<0 || actor.y>me.target.h || actor.x<0 || actor.x>me.target.w) ){//si son balas que se van de la pantalla
				toRemove.push(actor);
			}
		}		
		for( var i in toRemove ){
			me.removeActor(toRemove[i]);
		}
		
		//colisiones con player
		toRemove = [];
		var playerCollision = false;//para pintar la nave si es chocada
		for( var i in me.actors ){
			var collisionWithPlayer = false;//para pintar al enemigo si choca con la nave
			var actor = me.actors[i];
			if( actor!=me.player && !(actor instanceof PlayerShoot) ){
				collisionWithPlayer = collisionWithPlayer || isActorCollision(actor, me.player);
				if( collisionWithPlayer ){
					if( actor instanceof EnemyShip ){
						me.player.doDamage(20);
						//actor.collision(collisionWithPlayer);
						if( collisionWithPlayer ){
							actor.collision();
						}
					}
					if( actor instanceof EnemyShoot ){
						me.player.doDamage(10);
						toRemove.push(actor);
						//actor.collision(collisionWithPlayer);
						if( collisionWithPlayer ){
							actor.collision();
						}
					}
				}
			}
			playerCollision = playerCollision || collisionWithPlayer;
		}
		//me.player.collision(playerCollision);
		if( playerCollision ){
			me.player.collision();
		}
		for( var i in toRemove ){
			me.removeActor(toRemove[i]);
		}

		//colisiones de los enemigos		
		toRemove = [];
		for( var i in me.actors ){			
			if( me.actors[i] instanceof EnemyShip ){
				var enemy = me.actors[i];
				if( enemy.alive ){
					var collisionWithPlayer = false;				
					for( var j in me.actors ){
						if( me.actors[j] instanceof PlayerShoot && enemy.alive ){
							if( isActorCollision(me.actors[j], enemy) && !me.actors[j].disabled ){
								enemy.doDamage(me.actors[j].amountDamage);
								collisionWithPlayer = collisionWithPlayer || true;
								//me.actors[j].collision(true);
								me.actors[j].collision();
								me.actors[j].disabled = true;//para no matar al mismo tiempo a dos enemigos que est�n en la misma posici�n
								if( !enemy.alive ){
									toRemove.push(enemy);
								}
								toRemove.push(me.actors[j]);							
							}
						}
						if( me.actors[j] instanceof PlayerShip && enemy.alive ){
							if( isActorCollision(me.actors[j], enemy) ){
								enemy.doDamage(7);
								collisionWithPlayer = collisionWithPlayer || true;
								if( !enemy.alive ){
									toRemove.push(enemy);
								}							
							}
						}
					}
					//enemy.collision(collisionWithPlayer);
					if( collisionWithPlayer ){
						enemy.collision();
					}
				}
			}
		}
		for( var i in toRemove ){
			me.removeActor(toRemove[i]);
		}

		var toRemove=[];
		for( var ai in me.actors ){
			if( me.actors[ai] instanceof EnemyShip && !me.actors[ai].alive ){
				toRemove.push(me.actors[ai]);
			}
		}
		for( var i in toRemove ){
			me.removeActor(toRemove[i]);
		}		
/*
		toRemove = [];
		for( var ai in me.actors ){
			if( me.actors[ai] instanceof PlayerShoot && !me.actors[ai].disabled ){
				var shoot = me.actors[ai];
				for( var aj in me.actors ){
					if( me.actors[aj] instanceof EnemyShip ){
						if( isActorCollision(shoot, me.actors[aj] ) ){
							me.actors[aj].collision();
							shoot.collision();
							console.log("doDamage", shoot.amountDamage, me.actors[aj]);
							me.actors[aj].doDamage(shoot.amountDamage);
							shoot.disabled=true;
						}
					}
				}
			}
		}
		for( var ai in me.actors ){
			if( me.actors[ai].disabled || (me.actors[ai] instanceof EnemyShip && !me.actors[ai].alive) ){
				toRemove.push(me.actors[ai]);
			}
		}
		for( var i in toRemove ){
			me.removeActor(toRemove[i]);
		}		
*/
		//acciones
		//actualizo actores
		for( var i in me.actors ){
			var actor = me.actors[i];
			actor.update();
			if( actor instanceof EnemyShip && actor.performShoot ){
				//console.log("disparo enemigo de ", actor.center[0], actor.center[1], "a", me.player.center[0], me.player.center[1], actor.fireInterval, actor.shootType);
				me.actors.push(new actor.shootType({
					owner	: actor,
					toCoords: [me.player.center[0], me.player.y]
				}));
			}			
		}

		if( me.currentWavesEnemiesLeft==0 ){
			me.waveCompleted=true;
		}
		
		//me.starField.update(me.player);

		if( !me.player.alive ){
			var msg = new Msg({
	    		text       : 'GAME OVER',
	    	    callback   : function(){
	            	location.reload();
				}
	    	});
			clearInterval(me.timer);
		}
	}

	me.renderFrame = function(){
		for( var i in me.actors ){
			me.actors[i].render();
		}
	}

	me.removeActor = function(a){
		if( a instanceof EnemyShip ){
			me.currentWavesEnemiesLeft--;
			me.player.score+=a.value;
		}
		
		var itr;
		itr = me.actors.indexOf(a);
		me.actors.splice(itr, 1)[0].el.remove();
	}

	me.updateGame = function(){
		me.frameTime = new Date().getTime();
		me.frame++;
		if(me.frame==30){
			me.frame=0;
		}
		me.processInputs();
		me.updateFrame();
		me.renderFrame();
		me.updateInfo();
		me.lastFrameTime = new Date().getTime();
	}
	me.startLoop = function(){		
		me.timer = setInterval(me.updateGame, 1000/me.fps);
	}
	me.stopLoop	= function(){
		console.log("stopLoop");
		clearInterval(me.timer);
	}
	me.win = function(){
		me.stopLoop();
		var msg = new Msg({
    		text       : 'CONGRATULATIONS!',
    	    callback   : function(){
            	me.stopLoop();
			}
    	});
	}
	
	me.startLoop();

	return me;
}



function Ship(conf){//Nave genérica
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('Ship');
	Actor.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[Ship] constructor", me, conf);
	me.health = 100;
	me.alive = true;
	me.damageCoefficient=1;

	return me;
}
Ship.prototype = Object.create(Actor.prototype);
Ship.prototype.collisionAnimationDuration = 2;
Ship.prototype.shoot = function(){
	var me = this;
	console.log("[Ship] shoot");
}
Ship.prototype.doDamage = function(d){	
	if(this.alive){
		this.health = this.health-d*this.damageCoefficient;
		if( this.health<=0 && this.dyingI==-1 ){
			this.kill();
		}
		//$(this.el).html(this.health);		
	}
}

function PlayerShip(conf){
	var me = this;	
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('PlayerShip');
	/*me.hitBoxes = [
		{
			height	: 30,
			width	: 400,
			top		: -10,
			left	: -150
		}
	];		*/
	me.dyingDuration=10;
	me.dyingSprite = {
		//file	: 'sprites2.png',
		frames	: [
			[483,-16],
			[387,-16],
			[287,-16],
			[190,-16]
		]
	};
	me.shootInterval  = 10;
	me.shootIntervalI = 0;
	me.readyToShoot	= true;
	me.score		= 0;
	me.weapons		= [new PlayerWeapon1(), new PlayerWeapon2()];
	Ship.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[PlayerShip] me.weapons", me.weapons);
	me.selectWeapon(0);
	return me;
}
PlayerShip.prototype = Object.create(Ship.prototype);
PlayerShip.prototype.update = function(){
	this.shootIntervalI++;
	if( this.shootIntervalI>=this.shootInterval ){
		this.shootIntervalI=0;
	}
	Actor.prototype.update.call(this);
}
PlayerShip.prototype.selectWeapon = function(n){
	this.currentWeapon = this.weapons[n];
}

function PlayerWeapon(conf){
	var me	= this;
	me.name	= 'PLAYER WEAPON',
	me.ammo	= 0;
	me.reloadAmmoCount = 0;
	$.extend(me, conf);
	me.reload();
	return me;
}
PlayerWeapon.prototype.reload = function(){
	this.ammo = this.reloadAmmoCount;
}
function PlayerWeapon1(conf){
	var me = this;
	var conf = conf||{};
	$.extend(conf, {
		name			: 'PLAYER WEAPON 1',
		power			: 10,
		reloadAmmoCount : 50
	});
	$.extend(me, conf);
	PlayerWeapon.call(this, conf);
	return me;
}
PlayerWeapon1.prototype = Object.create(PlayerWeapon.prototype);
function PlayerWeapon2(conf){
	var me = this;
	var conf = conf||{};
	$.extend(conf, {
		name			: 'PLAYER WEAPON 2',
		power			: 20,
		reloadAmmoCount : 60
	});
	$.extend(me, conf);
	PlayerWeapon.call(this, conf);
	return me;
}
PlayerWeapon2.prototype = Object.create(PlayerWeapon.prototype);

function EnemyShip(conf){
	var me = this;
	/*Instance properties*/
	me.shooting		 = true;
	me.fireInterval  = null;
	me.fireIntervalI = 0;
	me.trajectory	 = null;	
	me.currentPathNode = 0;
	me.shootType	= EnemyShoot;//basic shoot
	me.value		= 0;
	/**/
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('EnemyShip');
	Ship.call(this, $.extend(conf, {classNames:classNames}));
	
	return me;
}
EnemyShip.prototype = Object.create(Ship.prototype);
EnemyShip.prototype.update = function(){
	var me = this;
	
	if( me.shooting ){
		me.fireIntervalI++;
		if( me.fireIntervalI==me.fireInterval ){
			//shoot
			//me.shoot();
			me.performShoot = true;
			me.fireIntervalI=0;			
		}
		else{
			me.performShoot = false;
		}
	}
	
	if( /*!this.first&&*/me.trajectory ){
		//this.first=false;
		var node = me.trajectory.path[me.currentPathNode];
		
		if( parseInt(me.x)==node[0]&&parseInt(me.y)==node[1] ){
			//console.log("Llegamos a", node);
			me.currentPathNode++;
			if( me.currentPathNode>=me.trajectory.path.length ){
				me.currentPathNode = 0;
			}
		}
		
		
		var dx		= me.x-node[0];
		var dy		= me.y-node[1];
		var hip		= Math.sqrt(dx*dx+dy*dy);
		var speed	= me.trajectory.rate<hip?me.trajectory.rate:hip;
		
		if( hip>0 ){
			me.vector	=  [
				speed*(dx)/hip,
				-speed*(dy)/hip,
			]
			me.x = me.x-me.vector[0];
			me.y = me.y+me.vector[1];
		}
		
	}

	Actor.prototype.update.call(this);
}
EnemyShip.prototype.doDying = function(){
	if( this.trajectory && this.trajectory.rate>0 ){
		this.trajectory.rate-=0.1;
	}
	Actor.prototype.doDying.call(this);
}

function EnemyShipType0(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('EnemyShipType0');
	me.hitBoxes = [
		{
			height	: 64,
			width	: 56,
			top		: 0,
			left	: 16
		},
		{
			height	: 9,
			width	: 15,
			top		: 65,
			left	: 36
		},
		{
			height	: 12,
			width	: 88,
			top		: 34,
			left	: 0
		}	
	];
	
	me.dyingSprite = {
		//file	: 'sprites2.png',
		frames	: [
			[1001,370],
			[909,370],
			[811,370]
		]
	};
	EnemyShip.call(this, $.extend(conf, {classNames:classNames}));
	me.damageCoefficient=0.5;
	me.dyingDuration = 50;
	me.value = 10;
	return me;
}
EnemyShipType0.prototype = Object.create(EnemyShip.prototype);

function EnemyShipType1(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('EnemyShipType1');
	me.hitBoxes = [
		{
			height	: 38,
			width	: 106,
			top		: 19,
			left	: 0
		},
		{
			height	: 18,
			width	: 32,
			top		: 59,
			left	: 37
		}	
	];
	me.dyingSprite = {
		frames	: [
			[1001,370],
			[909,370],
			[811,370]
		]
	};	
	EnemyShip.call(this, $.extend(conf, {classNames:classNames}));
	me.shootType = EnemyShipType1Shoot;
	me.damageCoefficient = 0.5;
	me.value = 20;
	me.dyingDuration=50;
	return me;
}
EnemyShipType1.prototype = Object.create(EnemyShip.prototype);

function EnemyShipTypeBoss1(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('EnemyShipTypeBoss1');
	me.hitBoxes = [
		{
			height	: 283,
			width	: 190,
			top		: 0,
			left	: 56
		},
		{
			height	: 37,
			width	: 299,
			top		: 50,
			left	: 0
		}	
	];
	EnemyShip.call(this, $.extend(conf, {classNames:classNames}));
	me.shootType = EnemyShipType1Shoot;
	me.damageCoefficient = 0.1;
	me.value = 50;
	return me;
}
EnemyShipTypeBoss1.prototype = Object.create(EnemyShip.prototype);

/*
	Shoot
	se instancia con toCoords[x,y] (así disparan los enemigos)
	o directamente con un vector [n,n] (como dispara el player)
*/
function Shoot(conf){
	var me = this;
	/*I.P.*/
	me.vector = [null, null];//x, y
	me.speed  = null;//hipotenusa
	me.amountDamage = 10;
	/**/
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	conf.target = me.owner.target;
	classNames.push('Shoot');
	Actor.call(this, $.extend(conf, {classNames:classNames}));

	me.x = me.owner.center[0];
	me.y = me.owner.y;
	
	if( me.toCoords ){
		var dx = me.toCoords[0]-me.owner.center[0];
		var dy = me.toCoords[1]-me.owner.center[1];				
		var hip = Math.sqrt(dx*dx+dy*dy);
		me.vector	= [
			me.speed*(dx)/hip,
			me.speed*(dy)/hip,
		];
	}

	//console.log("[Shoot] constructor", me);
	return me;
}
Shoot.prototype = Object.create(Actor.prototype);
Shoot.prototype.update = function(){
	var me = this;
	//me.x = this.x+me.vector[0];
	//me.y = this.y-me.vector[1];
	me.accel = me.vector;
	Actor.prototype.update.call(this);
}

function PlayerShoot(conf){
	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('PlayerShoot');
	Shoot.call(this, $.extend(conf, {classNames:classNames}));
	//console.log("[EnemyShip] constructor", me);
	me.amountDamage=10;
	return me;
}
PlayerShoot.prototype = Object.create(Shoot.prototype);

function EnemyShoot(conf){
	var me = this;
	conf.speed = conf.speed||7;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('EnemyShoot');
	
	Shoot.call(this, $.extend(conf, {classNames:classNames}));
	me.y = me.owner.y2;
	
	//console.log("[EnemyShip] constructor", me);
	return me;
}
EnemyShoot.prototype = Object.create(Shoot.prototype);

function EnemyShipType1Shoot(conf){
	var me = this;
	conf.speed = conf.speed||14;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('type1');
	EnemyShoot.call(this, $.extend(conf, {classNames:classNames}));	
	return me;
}
EnemyShipType1Shoot.prototype = Object.create(EnemyShoot.prototype);

Shooter.prototype.enemies = {
	'0'	: EnemyShipType0,
	'1' : EnemyShipType1,
	'Boss1' : EnemyShipTypeBoss1
};

function StarField(conf){
	var me = this;
	me.layers= [];
	me.el = $('<div class="starField"></div>');
	me.target = conf.target;
	
	for( var i in conf.layers ){
		console.log("layer", i);
		me.addLayer(conf.layers[i], i);
	}
	
	me.target.append(me.el);
	
	return me;
}
StarField.prototype.addLayer = function(conf, i){
	var fieldLayerConf = {
		h : this.target.h,
		w : this.target.w,
		i : i
	};
	$.extend(fieldLayerConf, conf);
	var newStarFieldLayer = new StarFieldLayer(fieldLayerConf);
	this.layers.push(newStarFieldLayer);
	this.el.append(newStarFieldLayer.el);
}
StarField.prototype.update = function(){
	for( var i in this.layers ){
		this.layers[i].update();
	}
}

function StarFieldLayer(conf, i){
	var me = this;
	me.i = i;
	console.log('[StarFieldLayer]', conf);
	$.extend(me, conf);
	me.stars = [];
	me.el = $('<div class="layer i'+conf.i+'"></div>');
	for( var i = 0; i<conf.nStars; i++ ){
		me.addStar(true);//first
	}	
	return me;
}
StarFieldLayer.prototype.addStar = function(first){
	var newStar = new BackgroundStar({
		maxH : this.h,
		maxW : this.w,
		first: first
	});
	this.stars.push(newStar);
	this.el.append(newStar.el);
}
StarFieldLayer.prototype.update = function(){
	var toRemove = [];
	for( var i in this.stars ){
		var star = this.stars[i];
		star.update(null, 10-this.i*2);
		if( star.y>this.h ){
			toRemove.push(star);
			this.addStar();
		}
	}
	for( var i in toRemove ){
		var itr;
		itr = this.stars.indexOf(toRemove[i]);
		this.stars.splice(itr, 1)[0].el.remove();
	}
}

function BackgroundStar(conf){
	var me = this;
	this.x = parseInt(Math.random()*conf.maxW);
	this.y = !conf.first?0:parseInt(Math.random()*conf.maxH);
	me.el = $('<div class="backgroundStar" style="left:'+this.x+';top:'+this.y+'"></div>');
	return me;
}
BackgroundStar.prototype.update = function(incX, incY){
	this.y+=incY;
	this.el[0].style.top = this.y;
}