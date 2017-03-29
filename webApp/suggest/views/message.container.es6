App.Suggest=App.Suggest||{}
App.Suggest.containerView=Backbone.View.extend({
    id:"imboxContent",
	template:_.templateUrl('./suggest/tpls/container.html',true),
	initialize : function(){
        this.listenTo(App.Suggest.messageCollection, "add", this.addOne);
        this.listenTo(App.Suggest.messageCollection, "reset", this.resetList);
    },
    events:{
        "click .downLoad":"downLoadHandle"
    },
	render(){
		this.$el.html(this.template);
		return this;
	},
    addOne(model){//每一条数据 进行处理
        var data = model.toJSON();
        var _html=_.templateUrl('./suggest/tpls/list.html');
        this.$('#commissionLists').append(_html({data:data}));
        this.bindScroll();
    },
    resetList(){//重置加载
        this.$("#commissionLists").html('<div class="loading">正在加载，请稍候……</div>');
    },
    bindScroll:function(){//绑定滚动条
        this.$el.find("div.scrollBox").mCustomScrollbar({
            theme: 'minimal-dark',
            axis: 'y',
            keyboard: {
                enable: true
            },
            scrollInertia: 0
        }); 
    },
    downLoadHandle(event){//下载按钮
        var target = $(event.target);
        var downloadid = target.data("downloadid");
        var downloadDataObj = {
            URLtype:"downloadsFeedBack",
            data: {
                adviceId: downloadid,
            }
        }
        window.location.href = App.Comm.getUrlByType(downloadDataObj).url;
    }
})

