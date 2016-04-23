//project.cost.property.reference.es6

//陈本清单
App.Project.CostReference=Backbone.View.extend({

	tagName:"div",

	className:"CostReference",

	initialize:function(){
		this.listenTo(App.Project.CostAttr.ReferenceCollection,"add",this.addOne);
		this.listenTo(App.Project.CostAttr.ReferenceCollection,"reset",this.reset);
	},


	events: {
		"click .tbReference  tr": "showInModle"
	},


	//渲染
	render:function(){
		var page=_.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.html",true);
		this.$el.html(page); 
		return this;
	},

	template:_.templateUrl("/projects/tpls/project/cost/project.cost.property.reference.detail.html"),

	//获取数据后处理
	addOne:function(model){
		var data=model.toJSON();
		this.$(".tbReference tbody").html(this.template(data)); 
	},

	reset(){
		this.$(".tbReference tbody").html(App.Project.Settings.loadingTpl); 
	},
	//模型中显示
	showInModle(event) {

		var $target = $(event.target).closest("tr");


		if ($target.hasClass("selected")) {
			$target.parent().find(".selected").removeClass("selected");
			//$target.removeClass("selected");
		} else {
			$target.parent().find(".selected").removeClass("selected");
			$target.addClass("selected");
		}

		var Ids = [];
			 
		if ($target.data("cate")) {

			$target.parent().find(".selected").each(function() {
				Ids = $.merge(Ids, $(this).data("cate"))
			}); 
			App.Project.Settings.Viewer.highlight({
				type: "userId",
				ids: Ids
			}) 

			return;
		}

		 
		var data = {
			URLtype: "fetchCostModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				costCode: $target.data("code")
			}
		};

		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				$target.data("cate",data.data);
				$target.parent().find(".selected").each(function() {
					Ids = $.merge(Ids, $(this).data("cate"))
				});
				  
				App.Project.Settings.Viewer.highlight({
					type: "userId",
					ids: Ids
				})
			}
		});



	}


});
