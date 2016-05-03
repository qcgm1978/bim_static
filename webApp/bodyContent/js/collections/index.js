/*
 * @require /bodyContent/js/views/todolist.js
 */
var App = App || {};
App.BodyContent.control= {

    init : function(){
		


        $("#contains").empty();
        new App.BodyContent.App().render(); //渲染框架
        $("#todos").html(new App.BodyContent.todosList().render().el);
        $(".conMonth .article table").append(new App.BodyContent.monthEndList().render().el);
        $(".conMonth .article table").append(new App.BodyContent.monthStartList().render().el);
        $("#proclamation").html(new App.BodyContent.proclamationList().render().el);
		
        this.loadData(this.todoCollection,{});
        this.loadData(this.slideCollection);
        this.loadData(this.monthEndCollection,{type:2,useId:'wb'});
        this.loadData(this.monthStartCollection,{type:1,useId:'wb'});
        this.loadData(this.proCollection);


        $(".conMonth .conHeader span").on("click",function(){
            if($(this).hasClass("active"))return;
            var n = $(this).index();
            $(this).addClass("active").siblings("span").removeClass("active");
            $(this).parent(".conHeader").siblings(".article").find("tbody").eq(n-1).show().siblings("tbody").hide();
            if(n!=1){
                $(this).css({"border-radius":"0px"});
            }
        });
    },

    todoCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentTodos",
        parse: function (response) {
            if (response.message == "success") {
                return response.data.items;
            }
        }
    })),

    slideCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentMmhSlide",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    monthEndCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentMonthEnd",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    monthStartCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentMonthStart",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    proCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentProclamation",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    loadData : function(collection,data) {
    	
        //数据重置
        collection.reset();
        // load list
        data=data||{};
        collection.fetch({
            data: data,
            success: function(collection, response, options) {
            	var _$container=null;
                //轮播插件是jquery对象、所以直接加载显示、不经过Backbone
                if(collection ==App.BodyContent.control.slideCollection){
                    $(".mmhSlider").mmhSlider({
						delay:5000,
						data:response.data,
						onChange:function(d){
							$("#slideTitle").html(d.title);
						}
					})
                }
                //空数据提示视图
                if(!collection.models.length){
	                if(collection ==App.BodyContent.control.todoCollection){
	                	_$container=$("#todoContainer");
	                }
	                if(collection ==App.BodyContent.control.monthEndCollection){
	                	_$container=$("#endTaskContainer");
	                }
	                if(collection ==App.BodyContent.control.proCollection){
	                	_$container=$("#postContainer");
	                }
	                _$container && _$container.html("<span class='noDataTip'>暂无内容</span>")
                }
            }
        });
    }
};