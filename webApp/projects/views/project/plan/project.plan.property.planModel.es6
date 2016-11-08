App.Project.PlanModel = Backbone.View.extend({

	tagName: "div",

	className: "planModel",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "add", this.addOne);
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "reset", this.loading);
	},

	events: {
		"click .searchToggle": "searchToggle",
		"click .tbPlan tr.itemClick": "showInModle",
		"click .treeCheckbox": "switch"
	},
	clearSearch() {
		this.$(".categoryOption .text").html('全部')
		this.$(".categoryOption .text").html('全部')
		Backbone.trigger('qualityFilterDataClear');
	},
	//显示隐藏搜索
	searchToggle(e) {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		$(e.currentTarget).toggleClass('expandArrowIcon');
		$searchDetail.slideToggle();
	},

	searchup() {
		var $searchDetail = this.$(".searchDetail");
		if ($searchDetail.is(":animated")) {
			return;
		}
		this.$('.searchToggle').removeClass('expandArrowIcon');
		$searchDetail.slideUp();
	},

	render: function() {
		var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planModel.html", true);
		this.$el.html(tpl);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


	loading:function(){
		this.searchup();
	},

	addOne: function(model) {

		var data = model.toJSON();
		this.$(".tbPlan tbody").html(this.template(data));
		var codes = [];
		$('.planSearch .treeCheckbox input').prop('checked',false);
		$.each(data.data, function(i, item) {
			item.code?codes.push(item.code):'';
		});
		if (codes.length > 0) {
			codes.push(-1);
		}

		//App.Project.PlanAttr.PlanAnalogCollection.reset();
		//App.Project.PlanAttr.PlanAnalogCollection.projectId = App.Project.Settings.projectId;
		//App.Project.PlanAttr.PlanAnalogCollection.projectVersionId = App.Project.Settings.CurrentVersion.id;
		//App.Project.PlanAttr.PlanAnalogCollection.fetch();
		this.codes = codes;
	},
	//切换显示此节点关联模型
	switch(){
		if($('.planModel .itemClick.selected').length>0){
			var self = this;
			App.Project.Settings.checkBoxIsClick = true;
			setTimeout(function(){
				self.showInModle('',$('.planModel .itemClick.selected'));
			},100)
		}
	},
	//模型中显示
	showInModle(event,$el) {

	//	App.Project.recoverySilder();

		var $target,ids,box;
		if($el){
			$target = $el;
		}else{
			$target = $(event.target).closest("tr");
		}
		ids=$target.data("userId");
		box=$target.data("box");

		if(App.Project.Settings.isHighlight ){
			//高亮钱取消
			//App.Project.cancelZoomModel();
			App.Project.Settings.Viewer.translucent(false);

			App.Project.Settings.Viewer.highlight({
				type: 'userId',
				ids: undefined
			});
		}

		//App.Project.Settings.Viewer.filter({
		//	type: "plan",
		//	ids: undefined
		//});
    if(!$el){
	    if ($target.hasClass("selected")) {
		    $target.parent().find(".selected").removeClass("selected");
		    return;
	    } else {
		    $target.parent().find(".selected").removeClass("selected");
		    $target.addClass("selected");
	    }
    }

		var targetCode = $target.data("code"),
		    checked = $('.planModel .treeCheckbox input').prop('checked');


		if (box && ids) {
			if(checked){
				App.Project.Settings.checkBoxIsClick = true;
				App.Project.Settings.Viewer.translucent(false);
				App.Project.Settings.Viewer.filterByUserIds(ids);

				return
			}
			if($el){
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});
				//App.Project.Settings.Viewer.filter({
				//	type: "plan",
				//	ids: undefined
				//});
				App.Project.Settings.Viewer.filterByUserIds(undefined);

				App.Project.Settings.Viewer.translucent(true);
				App.Project.Settings.Viewer.highlight({
					type: 'userId',
					ids: ids
				});
			}else{
				App.Project.zoomToBox(ids,box);


			}
			App.Project.Settings.isHighlight = true;

			return;
		}
		var data = {
			URLtype: "fetchModleIdByCode",
			data: {
				projectId: App.Project.Settings.CurrentVersion.projectId,
				projectVersionId: App.Project.Settings.CurrentVersion.id,
				planCode: $target.data("code")
			}
		};
		App.Comm.ajax(data, function(data) {
			if (data.code == 0) {
				var box=App.Project.formatBBox(data.data.boundingBox);
				if(box && box.length){
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					if(checked){
						App.Project.Settings.checkBoxIsClick = true;
						App.Project.Settings.Viewer.translucent(false);
						App.Project.Settings.Viewer.filterByUserIds(data.data.elements);

						return
					}
					if($el){
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});
						//App.Project.Settings.Viewer.filter({
						//	type: "plan",
						//	ids: undefined
						//});
						App.Project.Settings.Viewer.filterByUserIds(undefined);

						App.Project.Settings.Viewer.translucent(true);
						App.Project.Settings.Viewer.highlight({
							type: 'userId',
							ids: data.data.elements
						});
					}else{
						App.Project.zoomToBox(data.data.elements,box);

					}
					App.Project.Settings.isHighlight = true;

				}
			}else{
				App.Project.cancelZoomModel();
			}
		});
	}
});

//if(checked){
//
//	var codesToFilter = _.filter(this.codes,function(num){return num!=targetCode});
//	App.Project.Settings.Viewer.translucent(false);
//
//	App.Project.Settings.Viewer.filter({
//		type: "plan",
//		ids: codesToFilter
//	});
//
//	return
//}