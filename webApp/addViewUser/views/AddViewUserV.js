/*!/addViewUser/collection/index.js调用*/
App.AddViewUser.AddViewUserV = Backbone.View.extend({
	default:{
		state:{
			selectedIndex:"userList",
			showIndex:"userList",
			userListData:[],
			userSetData:[{
				name:"ys"
			}],
		},
	},
	initialize:function(){
		this.listenTo(App.AddViewUser.AddViewUserC, "add", this.addOne);
		this.listenTo(App.AddViewUser.AddViewUserC, "reset", this.reset);
	},
	el:$("#contains"),
	template:_.templateUrl("/addViewUser/tpls/index.html"),
	events: {
 		"click .viewUserTopTab li": "switchTab",
 		"click #addViewUserBtn": "addViewUserFun",
 		"click #myDropText": "myDropDownFun",
 	},
 	defautlSetings:{
 		pageIndex:1,
 	},
	render:function(){
	    this.$el.html(this.template({state:this.default.state}));
	    var _data = {
	    	loginId:App.Comm.getCookie("OUTSSO_AuthToken"),
	    	pageIndex:this.defautlSetings.pageIndex,
	    	pageItemCount:App.Comm.Settings.pageItemCount
	    }
	    App.AddViewUser.AddViewUserC.fetch({
			data: _data,
			success: function(collection, response, options) {
				console.log("response",response);
			}
		})
	    return this;
	},
	renderDom:function(){
		this.$el.html(this.template({state:this.default.state}));
	},
	//切换改变
	addOne: function(model) {
		var data = model.toJSON(); 
		this.default.state.userListData = data.items;
		this.renderDom();
	},
	//清空内容
	emptyContent:function(){
		this.$el.find(".viewUserListBox > table > tbody").html('<li class="loading">正在加载...</li>');
	},
	switchTab:function(event){
		var target = $(event.target);
		if(!target.hasClass('selected')){
			this.default.state.selectedIndex = target.data('type');
			this.default.state.showIndex = target.data('type');
			this.render();
		}
	},
	addViewUserFun:function(){
		var frame = _.templateUrl("/addViewUser/tpls/newViewUser.html")();
		//初始化窗口
		new App.Comm.modules.Dialog({
		    title:"新建用户",
		    width:400,
		    height:220,
		    isConfirm:false,
		    isAlert:false,
		    closeCallback:function(){},
		    message:frame
		});
		var viewProjectArr = [];
		$("button#button").on("click",function(e){
			
		})
		$('.projectUlBox li').on("click",function(e){
			var projectObj = {};
			var target = $(e.target);
			if(!target.find('label').hasClass('selectCheckBox')){
				target.find('label').addClass('selectCheckBox');
			}else{
				target.find('label').removeClass('selectCheckBox')
			}
		})
	},
});