function Raycaster(conf){
    var me = this;
    $.apply(me, conf)
    me.target = $(conf.target);
    console.log('Raycaster',conf);
    me.target.addClass('raycaster');
    me.height = me.target.height();
    me.target.append('<div class="world"><div class="sky" style="height:'+parseInt(me.height/2)+'px"></div><div class="floor" style="height:'+parseInt(me.height/2)+'px"></div></div>');
    
    
    console.log('h',me.height);
    
    me.player = new DoomGuy({x:1, y:1});
    me.input = new Input({target:document});
	me.processInputs = function(){	
		//movimiento
		if( me.input.kLeft&&!me.input.kRight ){
			me.player.rotate(-0.1);
		}
		if( me.input.kRight&&!me.input.kLeft ){
			me.player.rotate(0.1);
		}
		if( me.input.kUp&&!me.input.kDown ){
			var newPos = movePoint(me.player.x, me.player.y, me.player.angle, 0.1);
			if(isOcuppablePosition(me.world, newPos[0], newPos[1])){
				//me.player.forward(0.1);
				me.player.setPos(newPos);
			}
		}
		if( me.input.kDown&&!me.input.kUp ){
			var newPos = movePoint(me.player.x, me.player.y, me.player.angle, -0.1);
			if(isOcuppablePosition(me.world, newPos[0], newPos[1])){
				//me.player.forward(-0.1);
				me.player.setPos(newPos);
			}
		}	
	}    
    
    for( var i = 0; i<conf.nCols; i++ ){
        me.target.find('.world').append('<div class="col"><div class="wall"></div></div>');
    }
    me.walls = me.target.find('.wall');
    
	me.console = $('<div class="console">'+
		'<p class="counter">Frame: <span></span></p>'+
		'<p class="frametime">Frametime: <span></span></p>'+
		'<p class="playerposx">Player X: <span></span></p>'+
		'<p class="playerposy">Player Y: <span></span></p>'+
		'<p class="playerangle">Player &: <span></span></p>'+
	'</div>');	
	me.target.append(me.console);  
	
	me.info = {
	    frameCount      : me.console.find('.counter span'),
	    frameTimeCounter: me.console.find('.frametime span'),
	    playerPosX      : me.console.find('.playerposx span'),
	    playerPosY      : me.console.find('.playerposy span'),
	    playerAngle     : me.console.find('.playerangle span'),
	};
	
	me.world = new World({
		map	: [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,3,0,1],
			[1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
		]
	});

	me.minimap = new MiniMap({
		target	: conf.target,
		world	: me.world
	});
    
	me.updateInfo = function(){	
	    /*
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
		*/
		me.info.frameCount.html(me.frame);
		me.info.frameTimeCounter.html(me.frameTime-me.lastFrameTime);
		me.info.playerPosX.html(me.player.x);
		me.info.playerPosY.html(me.player.y);
		me.info.playerAngle.html(me.player.angle);
		
		me.minimap.setPlayerPos(me.player.x, me.player.y);
	}
	me.updateGame = function(){
		me.frameTime = new Date().getTime();
		me.frame++;
		if(me.frame==30){
			me.frame=0;
		}
		me.processInputs();
		me.updateFrame();
		//me.renderFrame();
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
	
	me.startLoop();
    return me;
}
Raycaster.prototype.updateFrame = function(){
    var me = this;
    if( me.player.x>=0 && me.player.y>=0 && me.player.x<=me.world.maxX && me.player.y<=me.world.maxY ){
	    me.walls.each(function(wi){
	    	//console.log("wall", wi, this);
	    	var o = calcWallHeight(wi, me.player, me.world);
	    	this.style.height	= o.h;
	    	
	    	this.style.top		= Math.round(calcWallTop(this));
	    	//$(this).html(o.r);
	    	this.style.background = me.enums.colors[o.c-1];
	    });    	
    }

}
Raycaster.prototype.enums = {
	colors:['gray','green', 'red', 'blue']
};
var cosa = Math.PI/180;
var offset = Math.PI/4;
function calcWallHeight(wi, player, world){
	var r = 0;
	var x = player.x;
	var y = player.y;
	var a = (player.angle-offset) + wi * cosa;

	var obj;
	while ( !obj ){
		r+=0.01;
		obj = world.isThereSomething(x+r*Math.cos(a),y+r*Math.sin(a));
	}
	
	return {h:r<1?300:parseInt((300/r)), c:obj, r:r};
}
function calcWallTop(wall){
	//console.log(wall.parentElement, $(wall.parentElement).height());
	return $(wall.parentElement).height()/2 -  $(wall).height()/2;
}

function DoomGuy(conf){
 	var me = this;
	$.extend(me, conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('doomguy');
	Actor.call(this, $.extend(conf, {classNames:classNames}));
	console.log("[DoomGuy] constructor", me, conf);
	
	me.x = conf.x||0;
	me.y = conf.y||0;
	me.angle=0;
	
	me.stepLength = 0.1;

	return me;   
}
DoomGuy.prototype = Object.create(Actor.prototype);
DoomGuy.prototype.rotate = function(angle){
	this.angle+=angle;
	if( this.angle>=2*Math.PI ){
		this.angle-=2*Math.PI
	}
	else{
		if( this.angle<=-2*Math.PI ){
			this.angle+=2*Math.PI;
		}
	}
}
DoomGuy.prototype.forward = function(r){
	this.x += r*Math.cos(this.angle);
	this.y += r*Math.sin(this.angle);
}
DoomGuy.prototype.setPos = function(pos){// [x,y]
	this.x = pos[0];
	this.y = pos[1];
}

function World(conf){
	var me = this;
	me.map = conf.map;
	me.maxX = me.map[0].length;
	me.maxY = me.map.length;
	console.log("world", me);
	return me;
}
World.prototype.isThereSomething = function(x, y){
	
	if( this.map[Math.round(x)]&&this.map[Math.round(x)][Math.round(y)] ){
		return this.map[Math.round(x)][Math.round(y)];
	}
	else{
		return false;
		
	}
}

function MiniMap(conf){
	var me = this;
	var $el = $('<div class="minimap"></div>');
	me.player = $('<div class="item actor"></div>');
	$el.append(me.player);
	$(conf.target).append($el);
	
	$el.width(conf.world.map.length);
	$el.height(conf.world.map[0].length);
	for( var rowIndex in conf.world.map ){
		var row = conf.world.map[rowIndex];
		for( var columnIndex in row ){
			if( row[columnIndex]!=0 ){
				$el.append('<div class="block" style="left:'+rowIndex+'px;top:'+columnIndex+'px;"></div>');
			}
		}
	}
}
MiniMap.prototype.setPlayerPos = function(x,y){
	this.player[0].style.left = x;
	this.player[0].style.top = y;
}

function isOcuppablePosition(world, x, y){
	//console.log('isOcuppablePosition', x, y);
	return world.map[parseInt(x)][parseInt(y)]==0;
}

function movePoint(x, y, angle, r){//x, y: coordenadas actuales. angle, r: parámetros para mover el punto
	//console.log('movePoint', x, y, angle, r);
	return [ x+r*Math.cos(angle), y+r*Math.sin(angle) ];
}