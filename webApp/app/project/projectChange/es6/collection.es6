App.Collections = {

	changeListCollection: new(Backbone.Collection.extend({

		model: Backbone.Model.extend({
			defaults: function() {
				return {
					title: ""
				}
			}
		}),

		urlType: "projectChangeList"


	})),
};


App.Views = {

	projectChangeListView: Backbone.View.extend({

		tagName: "div",

		className: "changeListBox",

		events: {
			"click #mCSB_1_container": "showInModle"
		},

		//初始化
		initialize() {
			this.listenTo(App.Collections.changeListCollection, "add", this.addOne);
			this.listenTo(App.Collections.changeListCollection, "reset", this.resetData);
		}, 
		//渲染
		render() {

			this.$el.html('<div class="loadings">正在加载，请稍候……</div>');
			$('.txtSearch').on('keydown',this.search);
			return this;
		},

		//返回数据渲染
		addOne(model) {
			var treeRoot = _.templateUrl('/app/project/projectChange/tpls/treeRoot.html');
			var treeNode = _.templateUrl('/app/project/projectChange/tpls/treeNode.html');
			var data = model.toJSON();
			data.treeNode = treeNode;
			console.log(data)
			this.$el.html(treeRoot(data))

			this.$(".itemContent:even").addClass("odd");

			this.bindScroll();//绑定滚动条
		},

		//模型中显示
		showInModle(event) {
			var $target = $(event.target).closest(".itemContent"),
			    ids=$target.data("userId"),
			    box=$target.data("box");
			if ($target.hasClass("selected")) {
				App.Project.cancelZoomModel();
				$target.removeClass("selected");
				return
			} else {
				this.$(".mCSB_container").find(".selected").removeClass("selected");
				$target.addClass("selected");
			}
			if (ids && box) {
				App.Project.zoomToBox(ids,box);
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
					var box=App.Project.formatBBox(data.data.boundingBox);
					$target.data("userId", data.data.elements);
					$target.data("box", box);
					App.Project.zoomToBox(data.data.elements,box);
				}
			});
		},

		resetData(){
			this.$el.html('<div class="loadings">正在加载，请稍候……</div>');
		},
		
		//绑定滚动条
		bindScroll() {

			var $materialequipmentListScroll = this.$el;

			if ($materialequipmentListScroll.hasClass('mCustomScrollbar')) {
				return;
			}

			$materialequipmentListScroll.mCustomScrollbar({
				set_height: "100%",
				theme: 'minimal-dark',
				axis: 'y',
				keyboard: {
					enable: true
				},
				scrollInertia: 0
			});
		},

		search(e){
			if(e.keyCode==13){
				App.Collections.changeListCollection.reset();
				App.Collections.changeListCollection.projectId = App.Index.Settings.projectId;
				App.Collections.changeListCollection.projectVersionId =App.Index.Settings.projectVersionId;
				App.Collections.changeListCollection.fetch({
					data:{
						fileVerionId:App.Index.Settings.differFileVersionId,
						baseFileVerionId:App.Index.Settings.baseFileVersionId,
						keyword:$(e.currentTarget).val()
					},
					success:function(c,d,x){
						if(d.data.length<=0){
							$('.changeListBox ').html('<div class="loadings">暂无搜索结果</div>');
						}
					}
				});
			}
		}
 

	})

}