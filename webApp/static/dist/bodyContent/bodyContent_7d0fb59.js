;/*!/bodyContent/js/model/model.js*/
var App = App || {};
App.BodyContent = {};
App.BodyContent.model=Backbone.Model.extend({
	   defaults:function(){
	   		return {
	   			title:''
	   		}
	   } 
}); 
;/*!/bodyContent/js/app.js*/
/*
 * @require bodyContent/js/model/model.js
 */
var App = App || {};
App.BodyContent.App=Backbone.View.extend({

    el:$("#contains"),

    template:_.templateUrl("/bodyContent/tpls/bodyContent.html",true),

    render:function(){
        this.$el.html(this.template);
        return this;
    }
});
;/*!/bodyContent/js/views/todolist.js*/
/*
 * @require /bodyContent/js/view/todos.js
 */
App.BodyContent.todosList = Backbone.View.extend({

    _items:0,

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        var _this=this;
        this.listenTo(App.BodyContent.control.todoCollection,"add",this.addOne);
        this.listenTo(App.BodyContent.control.todoCollection,"reset",function(){
            $("#todos tbody").empty();
            _this._items=0;
         });
        this.render();
    },
    //数据加载
    addOne:function(item){
        this._items++;
        if($('#layoutTodo').height()-70<this._items*30){
            return
        }
        var newView = new App.BodyContent.todosView({model : item});
        var el=newView.render().$el;
        if(this._items%2==1){
            el.addClass('odd');
        }
        $("#todos tbody").append(el);
    }
});
;/*!/bodyContent/js/collections/index.js*/
/*
 * @require bodyContent/js/views/todolist.js
 */
var App = App || {};

App.BodyContent.control = {



    init: function() {

        $("#contains").empty();

        new App.BodyContent.App().render(); //渲染框架

        this.viewCacheTodo = this.viewCacheTodo || new App.BodyContent.todosList();
        this.viewCacheDone = this.viewCacheDone || new App.BodyContent.doneList();
        this.viewCacheMonthEnd = this.viewCacheMonthEnd || new App.BodyContent.monthEndList();
        this.viewCacheMonthStart = this.viewCacheMonthStart || new App.BodyContent.monthStartList();
        this.viewCacheProclamation = this.viewCacheProclamation || new App.BodyContent.proclamationList();

        $("#layoutMonth .article table").append(this.viewCacheMonthEnd.render().el)
            .append(this.viewCacheMonthStart.render().el);

        $("#proclamation").append(this.viewCacheProclamation.render().el);

        this.loadData(this.todoCollection, {
            status: 1,
            pageIndex: 1,
            pageItemCount: 6
        });
        this.loadData(this.doneCollection, {
            status: 2,
            pageIndex: 1,
            pageItemCount: 6
        });
        this.loadData(this.slideCollection, {
            type: 3,
            pageIndex: 1,
            pageItemCount: 30
        });
        this.loadData(this.monthEndCollection, {
            type: 2,
            userId: App.Comm.user('userId')
        });
        this.loadData(this.monthStartCollection, {
            type: 1,
            userId: App.Comm.user('userId')
        });
        this.loadData(this.proCollection);

        //切换 计划开始 结束
        $(".conMonth .conHeader span").on("click", function() {

            var _type=$(this).data("type");

            if ($(this).hasClass("active")) return; 

            $(this).addClass("active").siblings("span").removeClass("active");



            if ( _type== "start") {

                $("#endTaskContainer thead .startTime").text("计划开始日期");
                $("#monthStart").show();
                $("#monthEnd").hide();

            } else if(_type=="end") {

                $("#endTaskContainer thead .startTime").text("计划结束日期");
                $(this).css({
                    "border-radius": "0px"
                });
                $("#monthStart").hide();
                $("#monthEnd").show();

            }else if(_type=="todoTab") {
                $("#todos").show();
                $("#dones").hide();
            }else if(_type=="doneTab") {
                $("#todos").hide();
                $("#dones").show();
            }

        });

    },

    post: function(id) {

        $('#dataLoading').hide();
        $('#pageLoading').hide();
        $("#topBar li").hide();

        new App.BodyContent.postDetailView();

        this.postDetailCollection.fetch({
            reset: true,
            data: {
                id: id
            }
        })

    },

    postDetailCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentNotice",
        parse: function(response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    todoCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentTodos",
        parse: function(response) {
            if (response.message == "success") {
                var _data = response.data.items;
                try {
                    $("#todoCounter").text(_data.length);
                } catch (e) {}
                return _data;
            }
        }
    })),

    doneCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentTodos",
        parse: function(response) {
            if (response.message == "success") {
                var _data = response.data.items;
                try {
                    $("#doneCounter").text(response.data.totalItemCount);
                } catch (e) {}
                return _data;
            }
        }
    })),



    slideCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentSilde",
        parse: function(response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    monthEndCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentMonthEnd",
        parse: function(response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    monthStartCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentMonthStart",
        parse: function(response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    proCollection: new(Backbone.Collection.extend({
        model: App.BodyContent.model,
        urlType: "fetchBodyContentProclamation",
        parse: function(response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    loadData: function(collection, data, urlParam) {
        var _this = this;
        //数据重置
        collection.reset();
        // load list
        data = data || {};
        collection.fetch({
            data: data,
            success: function(collection, response, options) {
                $("#pageLoading").hide();
                var _$container = null;
                //轮播插件是jquery对象、所以直接加载显示、不经过Backbone
                if (collection == App.BodyContent.control.slideCollection && response.message == "success") {
                    var _datas = response.data,
                        _len = _datas.length,
                        _nodata = null,
                        sildeData = [];
                    _len >= 5 ? _datas.length = 5 : "";
                    if (_len == 0) {
                        _nodata = function() {
                            $(".mmhSlider").html('<img style="margin:16% auto 0;display:inherit;" src="/static/dist/images/bodyContent/images/nodata.png"><div style="color:#CCC;text-align:center;">暂无可访问项目</div>');
                            $("#slideTitle").html('项目');
                        }
                    }
                    _.each(_datas, function(item) {
                        sildeData.push({
                            image: item.logoUrl ? item.logoUrl['large'] : '',
                            projectId: item.id,
                            versionId: item.version ? item.version.id : '845160092246208',
                            title: item.name
                        })
                    })
                    if ($('.mmhSlider').children().length == 0) {
                        $(".mmhSlider").mmhSlider({
                            delay: 5000,
                            data: sildeData,
                            noData: _nodata,
                            onChange: function(d) {
                                $("#slideTitle").html(d.title);
                            }
                        })
                    }
                }
                //空数据提示视图
                if (!collection.models.length) {
                    if (collection == App.BodyContent.control.todoCollection) {
                        _$container = $("#todoContainer");
                    }
                    if (collection == App.BodyContent.control.monthEndCollection) {
                        _$container = $("#endTaskContainer");
                    }
                    if (collection == App.BodyContent.control.proCollection) {
                        _$container = $("#postContainer");
                    }
                    _$container && _$container.html("<span class='noDataTip'>暂无内容</span>")
                }
            }
        });
    }
};
;/*!/bodyContent/js/views/donelist.js*/
/*
 * @require /bodyContent/js/view/todos.js
 */
App.BodyContent.doneList = Backbone.View.extend({

    _items:0,

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        var _this=this;
        this.listenTo(App.BodyContent.control.doneCollection,"add",this.addOne);
        this.listenTo(App.BodyContent.control.doneCollection,"reset",function(){
            $("#dones tbody").empty();
            _this._items=0;
         });
        this.render();
    },
    //数据加载
    addOne:function(item){
        this._items++;
        if($('#layoutTodo').height()-70<this._items*30){
            return
        }
        var newView = new App.BodyContent.todosView({model : item});
        var el=newView.render().$el;
        if(this._items%2==1){
            el.addClass('odd');
        }
        $("#dones tbody").append(el);
    }
});
;/*!/bodyContent/js/views/monthEnd.js*/
/**
 * @require bodyContent/js/model/model.js
 */

App.BodyContent.monthEndView = Backbone .View.extend({

    tagName :  "tr",

    event:{},

    template:_.templateUrl("/bodyContent/tpls/monthEnd.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    
    //事件管理，未知，返回不同type的处理程序
    eventType:function(){

    }
});
;/*!/bodyContent/js/views/monthendlist.js*/
/**
 * @require /bodyContent/js/view/monthEnd.js
 */
App.BodyContent.monthEndList = Backbone.View.extend({

    _items:0,

    tagName:'tbody',

    id:"monthEnd",
    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        var _this=this;
        this.listenTo(App.BodyContent.control.monthEndCollection,"add",this.addOne);
        this.listenTo(App.BodyContent.control.monthEndCollection,"reset",function(){
            _this.$el.empty();
            _this._items=0;
        });
    },
    //数据加载

    addOne:function(item){
        var newView = new App.BodyContent.monthEndView({model : item});
        this._items++;
        if($('#layoutMonth').height()-70<this._items*30){
            return
        }
        var el=newView.render().$el;
        if(this._items%2==1){
            el.addClass('odd');
        }

        this.$el.append(el);
    }
});
;/*!/bodyContent/js/views/monthStart.js*/
/**
 * @require bodyContent/js/model/model.js
 */

App.BodyContent.monthStartView = Backbone .View.extend({

    tagName :  "tr",

    event:{},

    template:_.templateUrl("/bodyContent/tpls/monthStart.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    
    //事件管理，未知，返回不同type的处理程序
    eventType:function(){

    }
});
;/*!/bodyContent/js/views/monthstartlist.js*/
/**
 * @require bodyContent/js/views/monthStart.js
 */
App.BodyContent.monthStartList = Backbone.View.extend({

    tagName:'tbody',
    id:"monthStart",
    _items:0,
    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        var _this=this;
        this.listenTo(App.BodyContent.control.monthStartCollection,"add",this.addOne);
         this.listenTo(App.BodyContent.control.monthStartCollection,"reset",function(){
            _this.$el.empty();
            _this._items=0;
        });
    },
    //数据加载
    addOne:function(item){
        this._items++;
        if($('#layoutMonth').height()-70<this._items*30){
            return
        }
        var newView = new App.BodyContent.monthStartView({model : item});
        var el=newView.render().$el;
        if(this._items%2==1){
            el.addClass('odd');
        }

        this.$el.append(el);
    }
});
;/*!/bodyContent/js/views/post.detail.js*/
App.BodyContent.postDetailView= Backbone.View.extend({

	className:'postContainer',

	template:_.templateUrl("/bodyContent/tpls/post.detail.html"),

    initialize : function(){
        this.listenTo(App.BodyContent.control.postDetailCollection,"reset",this.render);
    },
    //数据加载
    render:function(item){
    	var data=item.toJSON();
        this.$el.html(this.template(data[0]));
        $('#contains').append(this.$el);
    }
});
;/*!/bodyContent/js/views/proclamation.js*/
/**
 * @require bodyContent/js/model/model.js
 */

App.BodyContent.proclamationView = Backbone .View.extend({

    tagName :  "tr",

    event:{},

    template:_.templateUrl("/bodyContent/tpls/proclamation.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    //事件管理，未知，返回不同type的处理程序
    eventType:function(){

    }
});
;/*!/bodyContent/js/views/proclamationlist.js*/
/**
 * @require /bodyContent/js/view/proclamation.js
 */
App.BodyContent.proclamationList = Backbone.View.extend({
    _items:0,
    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        var _this=this;
        this.listenTo(App.BodyContent.control.proCollection,"add",this.addOne);
        this.listenTo(App.BodyContent.control.proCollection,"reset",function(){
            $('#proclamation').empty();
            _this._items=0;
        });
    },
    //数据加载
    addOne:function(item){
        this._items++;
        if($('#layoutPost').height()-70<this._items*30){
            return
        }
        var newView = new App.BodyContent.proclamationView({model : item});
        var el=newView.render().$el
        if(this._items%2==1){
            el.addClass('odd');
        }
        $('#proclamation').append(el);
    }
});
;/*!/bodyContent/js/views/slide.js*/
/**
 * @require bodyContent/js/model/model.js
 */
App.BodyContent.slideView = Backbone .View.extend({

    tagName :  "li",

    event:{},

    template:_.templateUrl("/bodyContent/tpls/slide.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    //事件管理，未知，返回不同type的处理程序
    eventType:function(){

    }
});
;/*!/bodyContent/js/views/slidelist.js*/
/**
 * @require /bodyContent/js/view/slide.js
 */
App.BodyContent.slideList = Backbone.View.extend({


    tagName:"ul",

    id:"slide",

    events:{
    //无事件，预留
    },
    render:function(){
        this.$el.html(this.template);
        return this;
    },

    initialize : function(){
        this.listenTo(App.BodyContent.control.slideCollection,"add",this.addOne);
    },
    //数据加载
    addOne:function(item){
        var newView = new App.BodyContent.slideView({model : item});
        this.$el.append(newView.render().el);
    }
});
;/*!/bodyContent/js/views/todos.js*/
/*
 * @require bodyContent/js/model/model.js
 */

App.BodyContent.todosView = Backbone .View.extend({

    className : "",//预留
    event:{},
    tagName :  "tr",

    template:_.templateUrl("/bodyContent/tpls/todos.html"),

    render : function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }


});