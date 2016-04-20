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

		//初始化
		initialize() {
			this.listenTo(App.Collections.changeListCollection, "add", this.addOne);

		}, 
		 

		//渲染
		render() {

			this.$el.html('<div class="loadings">正在加载，请稍候……</div>');
			return this;
		},

		//返回数据渲染
		addOne(model) {
			var treeRoot = _.templateUrl('/app/project/projectChange/tpls/treeRoot.html');
			var treeNode = _.templateUrl('/app/project/projectChange/tpls/treeNode.html');
			var data = model.toJSON();
			data.treeNode = treeNode;

			this.$el.html(treeRoot(data))

			this.$(".itemContent:even").addClass("odd");

			this.bindScroll();//绑定滚动条
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
		}
 

	})

}