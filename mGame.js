var m = m||{};
function Input(conf){
	var me = this;
	me.target = conf.target;

	me.mRight	= false;
	me.mLeft	= false;
	me.kSpace	= false;
	me.kLeft	= false;
	me.kRight	= false;
	console.log("bind", me.target);
	$(me.target).on("keydown", function(e){
		//console.log("[Input] keydown", e.keyCode);
		switch(e.keyCode){
			case 32	: me.kSpace	= true; break;
			case 37	: me.kLeft	= true; break;
			case 39	: me.kRight	= true; break;
			case 38	: me.kUp	= true; break;
			case 40	: me.kDown	= true; break;
			case 49	: me.k1		= true; break;
			case 50	: me.k2		= true; break;
		}

	});
	$(me.target).on("keyup", function(e){
		//console.log("[Input] keyup", e.keyCode);
		switch(e.keyCode){
			case 32	: me.kSpace	= false; break;
			case 37	: me.kLeft	= false; break;
			case 39	: me.kRight	= false; break;
			case 38	: me.kUp	= false; break;
			case 40	: me.kDown	= false; break;
			case 49	: me.k1		= false; break;
			case 50	: me.k2		= false; break;
		}
	});
	/*$(me.target).on("mousedown", function(e){
		me.mLeft = true;
	});
	$(me.target).on("mouseup", function(e){
		me.mLeft = false;
	});

	$(me.target).on("mousemove", function(e){
		//console.log(e.pageX);
	});*/
	$(me.target).on("click", function(e){
		console.log("click!");
	});
	
	return me;
}

function Actor(conf){
	var me = this;
	//console.log("[Actor] constructor", conf);
	var classNames = [];
	if( conf.classNames ){
		classNames = conf.classNames;
	}
	classNames.push('Actor');
	//console.log("Actor classNames", classNames, classNames.toString().replace(/,/g, " "), typeof this);
	me.el = $('<div class="'+classNames.toString().replace(/,/g, " ")+'"></div>');
	//me.hitBoxes=[];
	me.collisionAnimationDuration = 15;
	me.collisionAnimationIndex = 0;
	me.dyingI = -1;
	me.dyingDuration = 10;
	me.center	= [null, null];	
	
	for( var si in me.hitBoxes ){
		me.hitBoxes[si].el = $('<div class="hitbox"></div>');
		me.hitBoxes[si].el.css(me.hitBoxes[si]);
		me.el.append(me.hitBoxes[si].el);
		
	}
	
	$(conf.target).append(me.el);
	me.w = me.el.width();
	me.h = me.el.height();
	me.x2 = me.x+me.w;//deberían reemplazarse con una llamada a .update()
	me.y2 = me.y+me.h;
	me.accel = [0,0];
	me.accelAmount = 15;
	//me.update();
	return me;
}
Actor.prototype.move = function(params){//recibe deltax, deltay
	var me = this;
	//console.log("[Ship] move", params);
	if( params.x ){
		this.x = me.x+params.x;
	}
	if( params.y ){
		this.y = me.y+params.y;
	}
}
/*Actor.prototype.collision = function(c){	
	if(c){
		this.el[0].classList.add("collision");
	}
	else{
		this.el[0].classList.remove("collision");
	}
}*/
Actor.prototype.collision = function(){
	this.colliding=true;
	this.collisionAnimationIndex=0;
}
Actor.prototype.doCollision = function(){
	if( this.collisionAnimationIndex<this.collisionAnimationDuration ){
		this.el[0].classList.add("collision");
		this.collisionAnimationIndex++;
	}
	else{
		this.el[0].classList.remove("collision");
		this.colliding=false;
	}
}
Actor.prototype.getX = function(){
	return this.x;
}
Actor.prototype.getY = function(){
	return this.y;
}
Actor.prototype.update = function(){
	var nextX = this.x+this.accel[0];
	var nextY = this.y+this.accel[1];
	var nextX2 = nextX + this.w;
	var nextY2 = nextY + this.h;
	if( !this.constrainToTarget ){
		this.x = nextX;
		this.y = nextY;
		this.x2 = nextX2;
		this.y2 = nextY2;
	}
	else{
		if( nextX>=0&&nextX2<=this.target.w ){
			this.x = nextX;
			this.x2= nextX2;
		}
		else{
			if( nextX<=0 ){
				this.x=0;
				this.x2=this.x+this.w;
				this.accel[0]=0;
				
			}
			if( nextX2>=this.target.w ){
				this.x=this.target.w-this.w;
				this.x2=this.x+this.w;
				this.accel[0]=0;
			}
		}
		if( nextY>=0&&nextY2<=this.target.h ){
			this.y = nextY;
			this.y2 = nextY2;
		}
		else{
			if( nextY<=0 ){
				this.y=0;
				this.y2=this.y+this.h;
				this.accel[1]=0;
			}
			if( nextY2>=this.target.h ){
				this.y=this.target.h-this.h;
				this.y2=this.y+this.w;
				this.accel[1]=0;
			}
			
		}
	}
	this.center = [ this.x+(this.w/2), this.y+(this.h/2) ];
	//ahora update a todas las caras
	for( var si in this.hitBoxes ){
		var s = this.hitBoxes[si];
		s.x = this.x+s.left;
		s.x2 = s.x+s.width;
		s.y = this.y+s.top;
		s.y2 = s.y+s.height;
	}
	
	if( this.colliding ){
		this.doCollision();
	}
	
	if( this.dyingI>=0 ){
		this.doDying();
	}
}
Actor.prototype.setWidth = function(w){
	this.width = w;
	this.el.width(w);
}
Actor.prototype.setHeight = function(h){
	this.height = h;
	this.el.height(h);
}
Actor.prototype.render	= function(){
	this.el[0].style.top = this.y;
	this.el[0].style.left = this.x;	
}
Actor.prototype.accelUp	= function(){
	if( this.accel[1]>-this.accelAmount ){
		this.accel[1]--;
	}	
}
Actor.prototype.accelDown	= function(){
	if( this.accel[1]<this.accelAmount ){
		this.accel[1]++;
	}	
}
Actor.prototype.accelLeft	= function(){
	if( this.accel[0]>-this.accelAmount ){
		this.accel[0]--;
	}	
}
Actor.prototype.accelRight	= function(){
	if( this.accel[0]<this.accelAmount ){
		this.accel[0]++;
	}	
}
Actor.prototype.brakeX	= function(){
	if( this.accel[0]>0 ){
		this.accel[0]--;
		return;
	}
	if( this.accel[0]<0 ){
		this.accel[0]++;
	}
}
Actor.prototype.brakeY	= function(){
	if( this.accel[1]>0 ){
		this.accel[1]--;
		return;
	}
	if( this.accel[1]<0 ){
		this.accel[1]++;
	}
}
Actor.prototype.brake = function(){
	this.brakeX();
	this.brakeY();
}
Actor.prototype.doDying  = function(){
	this.dyingI++;
	if( this.dyingSprite ){
		var backPos = this.dyingSprite.frames[parseInt((this.dyingI-1)*this.dyingSprite.frames.length/this.dyingDuration)];
		//console.log('[Actor] doDying', this.dyingI, backPos, this.el[0].backgroundPosition);
		this.el[0].style.backgroundPosition = backPos[0]+'px '+backPos[1]+'px';
	}
	
	
	if( this.dyingI>=this.dyingDuration ){
		this.alive = false;
		this.dyingI = -1;
		console.log("[Actor] Dead!");
	}
}
Actor.prototype.kill = function(){
	console.log("[Actor] kill");
	this.dyingI = 0;
}

function Trajectory(conf){
	$.extend(this, conf);
	return this;
};

function isCollision(a1, a2){//deprecar
	if(
		(a1.y>=a2.y && a1.y<=a2.y2 ||
		a1.y2>=a2.y && a1.y2<=a2.y2)
			&&
		(a1.x>=a2.x && a1.x<=a2.x2 ||
		a1.x2>=a2.x && a1.x2<=a2.x2)
	)
	{	
		//console.log("isCollision", a1.y>=a2.y && a1.y<=a2.y2, a1.y2>=a2.y && a1.y2<=a2.y2, a1.x>=a2.x && a1.x<=a2.x2, a1.x2>=a2.x && a1.x2<=a2.x2);
		return true;		
	}
}

function isRectangleCollision(r1, r2){//actor1, actor2
	if(
		(r1.y>=r2.y && r1.y<=r2.y2 ||
		r1.y2>=r2.y && r1.y2<=r2.y2)
			&&
		(r1.x>=r2.x && r1.x<=r2.x2 ||
		r1.x2>=r2.x && r1.x2<=r2.x2)
	)
	{
		return true;		
	}
}

function isActorCollision(a1, a2){
	if( a1.hitBoxes&&a1.hitBoxes.length>0 ){
		for( var sa1i in a1.hitBoxes ){
			if( a2.hitBoxes&&a2.hitBoxes.length>0 ){
				for( var sa2i in a2.hitBoxes  ){
					if( isRectangleCollision(a1.hitBoxes[sa1i], a2.hitBoxes[sa2i]) ){
						return true;
					}
				}
			}
			else{
				if( isRectangleCollision(a1.hitBoxes[sa1i], a2) ){
					return true;
				}				
			}
		}		
	}
	else{
		if( a2.hitBoxes&&a2.hitBoxes.length>0 ){
			for( var sa2i in a2.hitBoxes  ){
				//console.log("check", a1, a2);
				if( isRectangleCollision(a1, a2.hitBoxes[sa2i]) ){
					//console.log("col", a1, a2);
					return true;
				}
			}			
		}
		else{
			return isRectangleCollision(a1, a2);
		}
	}
}

/*
function isInsideConstrain
*/
function isInsideConstrain(a, fp){//devuelve si la posición de un actor está dentro de su constrain
	//a implementar
	//console.log("isInsideConstrain", a, fp);
	
}