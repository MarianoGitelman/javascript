$('head').append('<link href="msg.css" type="text/css" rel="stylesheet">');

function Msg(conf){
    var me = this;
    var defaults = {
        text    : "texto default",
        height  : 200,
        width   : 200,
        target  : 'body'
    };
    $.extend(defaults, conf);
    $.extend(me, defaults);
    //console.log("Msg", me);
    
    var markup = $('<div class="Msg" style="opacity:0">'+me.text+'</div>');
    
    $(me.target).append(markup);
    markup.animate({opacity:1}, 500);
    markup.one("click", function(){
        markup.animate({opacity:0}, 500,null, function(){
            markup.remove();
            if( me.callback ){
                me.callback();
            }
        });
        
    });
    return me;
}

function TH(conf){//Talking head
    var me = this;
    var defaults = {
        text    : "texto default",
        height  : 200,
        width   : 200,
        target  : 'body'
    };
    $.extend(defaults, conf);
    $.extend(me, defaults);
    
    me.markup = $('<div class="Msg th" style="opacity:0;">'
                    +'<div class="sprite" style="background-image:url('+me.sprite.file+');width:'+me.sprite.width+'px;height:'+me.sprite.height+'px;"></div>'
                    +'<div class="text"></div>'
                +'</div>');
    
    $(me.target).append(me.markup);
    me.markup.animate({opacity:1}, 500);
    var sprite  = me.markup.find('.sprite')[0];
    var text    = me.markup.find('.text');
    var textI   = 0;
    me.timer = setInterval(function(){
        var nextPos = Math.round(Math.random()*(me.sprite.positions.length-1));
        sprite.style["background-position"]=me.sprite.positions[nextPos][0]+'px '+me.sprite.positions[nextPos][1]+'px';
        if( textI<me.text.length){
            text.append(me.text[textI]);
            textI++;            
        }
    }, 75);
    
    /*$(me.target).one("click", function(){
        me.end();
    });*/
    $(me.target).on("keydown", function(e){
        console.log("keydown", this, e);
        if( (e.keyCode==13 || e.keyCode==32)&&textI==me.text.length ){
            $(this).off("keydown");
            me.end();
        }
    });
    return me;    
}
TH.prototype.end = function(){
    var me = this;
    me.markup.animate({opacity:0}, 500,null, function(){
        clearInterval(me.timer);
        me.markup.remove();
        if( me.callback ){
            me.callback();
        }
    });    
}

function MsgQueue(conf){
    var me = this;
    $.extend(me, conf);
}
MsgQueue.prototype.run = function(){
    var me = this;
    var msgConf = me.msgs.splice(0,1)[0];
    if( msgConf ){
        var msg = new Msg({
             text       : msgConf.text,
             callback   : function(){
                me.run();
             }
            
        });        
    }
    else{
        me.callback();
    }
    
}