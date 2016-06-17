/*
 * @require /bodyContent/js/views/todolist.js
 */
var App = App || {};

App.BodyContent.control= {
	
	

    init : function(){

        $("#contains").empty();

        this.loadMessageCount();
        
        new App.BodyContent.App().render(); //渲染框架

        this.viewCacheTodo=this.viewCacheTodo || new App.BodyContent.todosList();
        this.viewCacheMonthEnd=this.viewCacheMonthEnd || new App.BodyContent.monthEndList();
        this.viewCacheMonthStart=this.viewCacheMonthStart || new App.BodyContent.monthStartList();
        this.viewCacheProclamation=this.viewCacheProclamation || new App.BodyContent.proclamationList();
        
        $(".conMonth .article table").append(this.viewCacheMonthEnd.render().el);
        $(".conMonth .article table").append(this.viewCacheMonthStart.render().el);
        $("#proclamation").append(this.viewCacheProclamation.render().el);
		
        this.loadData(this.todoCollection,{
        	status:1,
        	pageIndex:1,
        	pageItemCount:6
        });
        this.loadData(this.slideCollection,{
        	type:3,
        	pageIndex:1,
        	pageItemCount:30
        });
        this.loadData(this.monthEndCollection,{type:2,userId:App.Comm.getCookie('userId')});
        this.loadData(this.monthStartCollection,{type:1,userId:App.Comm.getCookie('userId')});
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

    post:function(id){
        $('#pageLoading').hide();
        $('#dataLoading').hide();
        $("#topBar li").hide();

        new App.BodyContent.postDetailView();

        this.postDetailCollection.fetch({
            reset:true,
            data:{
                id:id
            }
        })

    },

    loadMessageCount:function(){

        App.Comm.ajax({
            URLtype:'fetchIMBoxList',
            data:{
                status:0
            }
        },function(res){
            $('#messageCount').html(res.data.totalItemCount);
        })

    },

    postDetailCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentNotice",
        parse: function (response) {
            if (response.message == "success") {
                return response.data;
            }
        }
    })),

    todoCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentTodos",
        parse: function (response) {
            if (response.message == "success") {
            	var _data=response.data.items;
            	try{
	            	$("#todoCounter").text(_data.length);
            	}catch(e){
            	}
                return _data;
            }
        }
    })),

    slideCollection:new (Backbone.Collection.extend({
        model:App.BodyContent.model,
        urlType:"fetchBodyContentSilde",
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

    loadData : function(collection,data,urlParam) {
    	var _this=this;
        //数据重置
        collection.reset();
        // load list
        data=data||{};
        collection.fetch({
            data: data,
            success: function(collection, response, options) {
            	var _$container=null;
                //轮播插件是jquery对象、所以直接加载显示、不经过Backbone
                if(collection ==App.BodyContent.control.slideCollection && response.message=="success"){
                	var _datas=response.data,
                        _len=_datas.length,
                        _nodata=null,
                        sildeData=[];
                	_len>=5? _datas.length = 5:"";
                    if(_len==0){
                        _nodata=function(){
                            $(".mmhSlider").html('<img style="margin:16% auto 0;display:inherit;" src="/static/dist/images/bodyContent/images/nodata.png"><div style="color:#CCC;text-align:center;">暂无可访问项目</div>');
                            $("#slideTitle").html('项目');
                        }
                    }
                    _.each(_datas,function(item){
                        sildeData.push({
                            image:item.logoUrl['large'],
                            projectId:item.id,
                            versionId:item.version ?item.version.id:'nodata',
                            title:item.name
                        })
                    })
                    if($('.mmhSlider').children().length==0){
                         $(".mmhSlider").mmhSlider({
                            delay:5000,
                            data:sildeData,
                            noData:_nodata,
                            onChange:function(d){
                                $("#slideTitle").html(d.title);
                            }
                        })
                    }
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