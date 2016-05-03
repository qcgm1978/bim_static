/**
 * 业务视图组件
 * 
 * 1 项目成员/部门管理视图 
 * 基于ztree树插件
 * 
 * 纯粹的View、没有modal、没有collection
 * 
 * @author 汪冰
 * @time 2016年5月1日18:22:42
 */

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
	
	//初始化部门成员数据、基于ztree树插件
	initView: function() {
		
		//缓存当前View实例对象
		var _view = this;
		//树插件初始化配置
		var setting = {
				callback: {
					onClick: function() {
						//_view.addOption.apply(_view,arguments);
					}
				},
				view: {
					selectedMulti: true,
					nameIsHTML:true,
					showLine: false
				}
			},
			//假数据
			zNodes = [{
				name: "信息管理中心<span style='color:#CCC'>（信息管理中心）</span>",
				open: true,
				children: [{
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
				}, {
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
				}]
			}, {
				name: "信息管理中心",
				open: true,
				children: [{
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
				}, {
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
				}]
			}, {
				name: "信息管理中心",
				open: true,
				children: [{
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
				}, {
					name: "研发一步",
					children:[{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					},{
						name: "成员1",
					}]
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
	
	//删除节点
	deleteOption:function(i){
		this.selectedTree.removeNode(i);
	},

	//显示删除按钮
	showDelete: function(e) {
		$(e.currentTarget).find(".showDelete").show();
	},
	
	//隐藏删除按钮
	hideDelete: function(e) {
		$(e.currentTarget).find(".showDelete").hide();
	}
})