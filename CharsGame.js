function CharsGame(conf){
    var me = this;
    $.extend(me, conf);
    console.log('[CharsGame] init');

    me.mainContainer = $(me.target);
	me.mainContainer.addClass("gameContainer viewport");
    me.target= me.target;
    me.mainContainer.append('<div class="playfield" style="left:0;top:0;"></div>');
    me.playfield = $(me.mainContainer).find('.playfield');
    me.playfield.h = me.playfield.height();
    me.playfield.w = me.playfield.width();

    me.playfield.append('<div class="bg"></div>');
    me.world = new CharsRain({
        nChars: 5,
        target: me.playfield,
        viewPort: me.mainContainer[0]
    });
    
    me.playfield[0].style.left = 0;
    me.playfield[0].style.top = 0;
    
    me.frame = 0;
    me.input= new Input({target:document});    

    me.actors = me.world.chars;

    me.starField = new StarField({
		target	: me.playfield,
		layers	: [
			{
				nStars	: 4
			},
			{
				nStars	: 4
			},
			{
				nStars	: 4
			}
		]
	});	
    
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
            <p>kA: ${me.input.kA}</p>
            <p>kS: ${me.input.kS}</p>
            <p>kD: ${me.input.kD}</p>
            <p>frame: ${me.frame}</p>
            <p>frametime: ${me.lastFrameTime - me.frameTime}</p>
            <p>actors: ${me.actors.length}</p>
            <p>w: ${me.playfield.w}</p>
            <p>h: ${me.playfield.h}</p>
        `);
    }

    mlog();

    function processInputs(){
        if( me.input.kA ){
            me.world.attackChar('a');
        }
        if( me.input.kS ){
            me.world.attackChar('s');
        }
        if( me.input.kD ){
            me.world.attackChar('d');
        }
    }

    function updateFrame(){
        //check colisiones


        me.world.update();
        me.starField.update();
    }

    function renderFrame(){
        me.world.update();
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
    
    me.components = [
        new HealthBar({
            target: me.el
        })
    ];    

    me.healthBar = me.components[0];
    
    this.collisionAnimationDuration = 1;
	return me;    
}
Enemy.prototype = Object.create(Person.prototype);
Enemy.prototype.update = function(){
    var me = this;
    Person.prototype.update.call(this);
    //console.log('Enemy update', me.healthBar);
    me.healthBar.update(me);
}

function EnemyChar(conf){
    var me = this;
    $.extend(me, conf);
    
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
    classNames.push('char');   
    Enemy.call(this, $.extend(conf, {classNames:classNames})); 
    
    me.accel = conf.accel;
    console.log("EnemyChar", conf.target, me.el);
    me.el.label[0].innerText = conf.symbol;
    $(me.el).append('<div class="symbol">'+conf.symbol+'</div>');
    return me;
}
EnemyChar.prototype = Object.create(Enemy.prototype);
EnemyChar.prototype.attack = function(){
    if( this.health>0 ){
        this.health-=10;
    }
}

function CharsRain(conf){
    var me = this;
    $.extend(me, conf);
    me.chars = [];
    me.init(conf);
    console.log('CharsRain', conf);
    return me;
}
CharsRain.prototype = {
    init: function(conf){
        var me = this;
        for( var i = 0; i<conf.nChars; i++ ){            
            me.addChar();
        }       
    },
    update: function(){
        var me = this;
        var toRemove = [];
        for( var i in me.chars ){
            var actor = me.chars[i];
            actor.update();
            if( me.isActorOutside(actor) || actor.health<1 ){
                toRemove.push(actor);
            }
        }
        for( var i in toRemove ){
            me.removeChar( toRemove[i] );
        }
        for( var i = 0; i < toRemove.length; i++ ){
            me.addChar();
        }

        for( var i in me.chars ){
            me.chars[i].render();
        }
    },
    attackChar: function(c){
        var me = this;
        //console.log('killChar', c);
        for( var i in me.chars ){
            var char = me.chars[i];
            if( char.symbol == c && char.health>0 ){
                //console.log('kill', me.chars[i]);
                char.attack();
            }
        }
    },
    removeChar: function(c){
        var me = this;
        console.log('removeChar', c);
        var iToRemove;
        for( var i in me.chars ){
            if( me.chars[i] == c ){
                iToRemove = i;
                break;                
            }
        }
        if( iToRemove ){
            console.log("remuevo", me.chars[i]);
            var toRemove = me.chars.splice(iToRemove, 1);
            toRemove[0].el[0].remove();
        }
    },
    addChar: function(){
        var me = this;
        me.chars.push( new EnemyChar({
            symbol: enums.getRandomSymbol(),
            //accel: [Math.random()*2*getRandomSign(), Math.random()*2*getRandomSign()],
            accel: [0,0],
            x: Math.random()*this.target.w,
            y: Math.random()*this.target.h,
            target: me.target
        }));        
    },
    isActorOutside: function(a){
        return a.x < 0 || a.x > this.target.w || a.y < 0 || a.y > this.target.h;
    },
    removeActor: function(a){
        console.log('remove actor', a);
    }
}

enums = {
    symbols: ['a', 's', 'd'],
    getRandomSymbol: function(){
        return enums.symbols[Math.floor( Math.random()*enums.symbols.length )];
    }
}

function getRandomSign(){    
    return Math.random()<0.5?-1:1;
}

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