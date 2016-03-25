/**
 * @require /app/project/modelChange/js/comm.js
 * @require /app/project/modelChange/js/collection.js
 */
App.Index={

	bindEvent(){

		 $("#projectContainer").on("click",".projectPropetyHeader .item",function(){
		 	var index=$(this).index();
		 	$(this).addClass("selected").siblings().removeClass("selected");
		 	$(this).closest(".designPropetyBox").find(".projectPropetyContainer div").eq(index).show().siblings().hide();
		 });
	},

	getProject:function(){
		App.Comm.projectId = this.getQueryString("projectId");
		App.Comm.projectVersionId = this.getQueryString("projectVersionId");
	},

	getQueryString:function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	},

	init(){
		this.bindEvent();
		this.getProject();
		App.Project.Collection.changeList.projectId = App.Comm.projectId;
		App.Project.Collection.changeList.projectVersionId = App.Comm.projectVersionId;
		App.Project.Collection.changeList.fetch();
		$(".rightPropertyContent .designChange").html(new App.Project.Model.changeList().render().el);
	}
}
App.Project.Model = {
	changeList:Backbone.View.extend({

		tagName: "div",

	  className: "tree-view rightTree",

		events:{
			"click .item-content":"openTree",
			"click .tree-text":"select"
		},

		initialize: function() {
			this.listenTo(App.Project.Collection.changeList,"add",this.addList);
		},

	  template:_.templateUrl('/app/project/modelChange/tpls/changeList.html'),

	  render: function(){
	  	this.$el.html("没有变更");
	  	return this;
	  },

	  addList:function(model){
	  	var data = model.toJSON()
	  	if(data.message == 'success'){
		  	this.$el.html(this.template(data));
		  	return this;
	  	}
	  },

	  openTree:function(event){
	  	var that = $(event.target).closest('.item-content')
	  			comparisonId = that.data('id');
	  	that.toggleClass('open');
	  	if(comparisonId&&that.next().length==0){
		  	that.after(new App.Project.Model.getInfo().render().el);
		  	App.Project.Collection.changeInfo.projectId = App.Comm.projectId;
				App.Project.Collection.changeInfo.projectVersionId = App.Comm.projectVersionId;
				App.Project.Collection.changeInfo.comparisonId = App.Comm.comparisonId;
		  	App.Project.Collection.changeInfo.fetch();
	  	}
	  },

	  select:function(){
	  	var that = $(event.target);
	  	if(that.prev('.noneSwitch').length>0){
		  	$(event.target).toggleClass('current');
	  	}
	  }

	}),

	getInfo:Backbone.View.extend({

		tagName: "ul",

	  className: "treeViewSub",

		initialize: function() {
			this.listenTo(App.Project.Collection.changeInfo,"add",this.addDetail);
		},

	  template:_.templateUrl('/app/project/modelChange/tpls/changeInfo.html'),

	  render: function(){
	  	this.$el.html("没有变更");
	  	return this;
	  },

	  addDetail:function(model){
	  	var data = model.toJSON();
	  	if(data.message == 'success'){
		  	this.$el.html(this.template(data));
		  	return this;
		  }
	  }

	})
}
