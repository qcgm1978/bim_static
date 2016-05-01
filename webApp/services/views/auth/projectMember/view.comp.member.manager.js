var ViewComp=ViewComp||{};
ViewComp.MemberManager = Backbone.View.extend({
	tagName: "table",
	className: "userSelecter",
	template: _.templateUrl('/services/tpls/auth/projectMember/projectMemberManager.html'),
	selectTree: null,
	selectedTree: null,
	events: {
		"click a[name='selectBtn']": "addOption",
		"mouseover .ztree li a": "showDelete",
		"mouseout .ztree li a": "hideDelete"
	},
	
	initialize:function(){
		
	},
	
	render: function() {
		this.$el.append(this.template());
		return this;
	},
	initView: function() {
		var _view = this;
		var setting = {
				callback: {
					onClick: function() {
						//_view.addOption.apply(_view,arguments);
					}
				},
				view: {
					selectedMulti: true,
					showLine: false
				}
			},
			zNodes = [{
				name: "test1",
				open: true,
				children: [{
					name: "test1_1"
				}, {
					name: "test1_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}, {
				name: "test2",
				open: true,
				children: [{
					name: "test2_1"
				}, {
					name: "test2_2"
				}]
			}];
		this.selectTree = $.fn.zTree.init($("#selectTree"), setting, zNodes);
		this.selectedTree = $.fn.zTree.init($("#selectedTree"), {
			view: {
				showLine: false
			}
		}, []);
	},

	//选择节点
	addOption: function() {
		var _this=this;
		var nodes= _this.selectTree.getSelectedNodes();
		var newNodes=_this.selectedTree.addNodes(null,nodes);
		
		//自定义渲染树节点
		newNodes.forEach(function(i){
			var $del=$("<span  class='showDelete'></span>");
			//绑定删除事件
			$del.on("click",function(){
				_this.deleteOption(i);
			})
			$("#selectedTree #"+i.tId+"_a").append($del);
		})
	},

	deleteOption:function(i){
		this.selectedTree.removeNode(i);
	},

	showDelete: function(e) {
		$(e.currentTarget).find(".showDelete").show();
	},
	hideDelete: function(e) {
		$(e.currentTarget).find(".showDelete").hide();
	}
})