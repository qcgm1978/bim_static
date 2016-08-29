App.Project.PlanModel = Backbone.View.extend({

	tagName: "div",

	className: "planModel",

	initialize: function() {
		this.listenTo(App.Project.PlanAttr.PlanModelCollection, "add", this.addOne);
	},

	events: {
		"click .tbPlan tr.itemClick": "showInModle",
		"click .treeCheckbox": "switch"

	},

	render: function() {
		var tpl = _.templateUrl("/projects/tpls/project/plan/project.plan.property.planModel.html", true);
		this.$el.html(tpl);
		return this;
	},

	template: _.templateUrl("/projects/tpls/project/plan/project.plan.property.planAnalog.detail.html"),


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
			setTimeout(function(){
				self.showInModle('',$('.planModel .itemClick.selected'));
			},100)
		}
	},
	//模型中显示
	showInModle(event,$el) {
		var $target,ids,box;
		if($el){
			$target = $el;
		}else{
			$target = $(event.target).closest("tr");
		}
		ids=$target.data("userId");
		box=$target.data("box");

		//高亮钱取消
		App.Project.cancelZoomModel();
		App.Project.Settings.Viewer.translucent(false);

		App.Project.Settings.Viewer.highlight({
			type: 'userId',
			ids: undefined
		});
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


		if($('.planSearch .treeCheckbox input').prop('checked')){

			var codesToFilter = _.filter(this.codes,function(num){return num!=$target.data("code")});
			App.Project.Settings.Viewer.translucent(false);

			App.Project.Settings.Viewer.filter({
				type: "plan",
				ids: codesToFilter
			});

			//App.Project.Settings.Viewer.translucent(true);
      //
			//App.Project.Settings.Viewer.highlight({
			//	type: "plan",
			//	ids: [$target.data("code")]
			//});
			//App.Project.Settings.Viewer.zoomToBuilding(0.05,1);
			return
		}

		if (box && ids) {
			if($el){
				App.Project.Settings.Viewer.translucent(false);

				App.Project.Settings.Viewer.ignoreTranparent({
					type: "plan",
					//ids: [code[0]]
					ids: undefined
				});
				App.Project.Settings.Viewer.filter({
					type: "plan",
					ids: undefined
				});
				App.Project.Settings.Viewer.translucent(true);
				App.Project.Settings.Viewer.highlight({
					type: 'userId',
					ids: ids
				});
			}else{
				App.Project.zoomToBox(ids,box);


			}
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
					if($el){
						App.Project.Settings.Viewer.translucent(false);

						App.Project.Settings.Viewer.ignoreTranparent({
							type: "plan",
							//ids: [code[0]]
							ids: undefined
						});
						App.Project.Settings.Viewer.filter({
							type: "plan",
							ids: undefined
						});
						App.Project.Settings.Viewer.translucent(true);
						App.Project.Settings.Viewer.highlight({
							type: 'userId',
							ids: data.data.elements
						});
					}else{
						App.Project.zoomToBox(data.data.elements,box);

					}
				}
			}else{
				App.Project.cancelZoomModel();
			}
		});
	}
});