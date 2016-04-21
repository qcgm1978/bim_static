/*
 * Created by zhangzj-b on 2016/3/28.
 * arguments:
 * obj{element:ele,sliderTime :  5000,speed: 500}
 */
//兼容动画
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
var slide = {
    obj:{
        element:"ele",
        slideTime : 5000,
        tagTime : 500
    },
    speed:function(){
    },
    present : 0,
    length:0,
    startStatus :1,
    finalStatus : 0,
    presentStatus: 1,
    animationStatus : true,
    action:"next",
    sort :function(present,forward,eleList){//当前    转向目标    列表

        var n = eleList.length,s  = n ;
        eleList.eq(present).css("z-index","1");
        $(slide.obj.element ).find(" .conHeader span").text( eleList.eq(forward).find("a").attr("title"));
       if(!($.isNumeric(forward)) ){slide.present = forward = 0;}
        $(slide.obj.element ).find("em").text(forward + 1);
        for(var  i = 0 ; i < n  ; i ++){
            if(slide.action == "next"){
                if( present + 1 < n ) {
                    present = present + 1;
                }else if( present + 1 == n ){
                    present = 0;
                }
            }else{
                present = present - 1
            }
            eleList.eq(present ).css("z-index",s--);
        }
    },
    animation:function(){
        var list =$(slide.obj.element).find("li");
        var   present = slide.present;
        var    next;
        if(!slide.animationStatus){
            list.eq(slide.present).css("opacity",1);
            present = slide[slide.action](slide.present ,list);
            slide.sort(slide.present ,present,list);
            //静默状态触发
            return
        }
        if(slide.presentStatus == 0 ){
            next = slide.next(slide.present,slide.length);
            slide.sort(slide.present,next,list);
            slide.present = slide.next(slide.present,slide.length);
            slide.presentStatus = 1;
            list.css("opacity" , slide.presentStatus);
            return ;
        }
        if( slide.presentStatus > slide.finalStatus){
            slide.presentStatus = slide.presentStatus - slide. startStatus  / (slide.obj.tagTime * 60 /1000) ;
            if(slide.presentStatus < 0){ slide.presentStatus = 0; }
            list.eq(slide.present).css("opacity" , slide.presentStatus);
        }
        requestAnimationFrame(slide.animation);
    },
    prev : function(present,length){
        var a;
        if( present  > 0 ){
            a =  present - 1;
        }else if( present  == 0){
            a = length - 1;
        }
        return a;
    },
    next : function( present,length ){
        var a;
        if( present + 1 < length ) {
            a = present + 1;
        }else if( present + 1 == length ){
            a = 0;
        }
        return a;
    },
    resetPresentStatus : function(){
        if(slide.presentStatus != 0){
            slide.presentStatus = 1;
        }
    },
    relate : function(){

        $(slide.obj.element ).find(".prev").on("click",function(){
            var preEle = $(slide.obj.element).find("li");
            var pre = slide.present;
            slide.action  = "prev";
            slide.stop();
            slide.present = slide.prev(slide.present,slide.length);
            slide.sort(pre,slide.present,preEle);
            slide.resetPresentStatus();
            slide.play();
        });
        $(slide.obj.element ).find(".next").on("click",function(){
            var preEle = $(slide.obj.element).find("li");
            var pre = slide.present;
            slide.action ="next" ;
            slide.stop();
            slide.present = slide.next(slide.present,slide.length);
            slide.sort(pre,slide.present,preEle);
            slide.resetPresentStatus();
            slide.play();
        });
    },
    play : function (){
        slide.animationStatus = true;
        slide.intervalID = setInterval(function(){
            slide.ammy = window.requestAnimationFrame(slide.animation);
        },slide.obj.slideTime);
    },
    stop :function(){
        slide.animationStatus = false;
        if(slide.intervalID){clearInterval(slide.intervalID); slide.intervalID = "";}
    },
    //兼容旧浏览器的未设置
    windowFront: function(){
        var hiddenProperty = 'hidden' in document ? 'hidden' :
            'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                    null;
        if(hiddenProperty){
            var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            var onVisibilityChange = function(){
                if (!document[hiddenProperty]) {
                    slide.play(); //页面当前显示
                }else{
                    slide.stop();//页面被隐藏
                }
            };
            document.addEventListener(visibilityChangeEvent, onVisibilityChange);
        }else{
            //兼容旧版
            window.onfocus = function(){slide.play(); };
            window.onblur = function(){slide.stop(); };
        }
    },
    count:function(length){
        $(slide.obj.element).find(".slideProcess em").text(slide.present || "1");
        $(slide.obj.element).find(".slideProcess i").text(length);
        var preEle = $(slide.obj.element).find("li"),n=length;
        for(var i = 0 ; i <length ; i++){
            preEle.eq (i).css("z-index",n--);
        }
    },
    initialize:function(obj) {
        this.obj = obj;
        slide.relate();

    }
};