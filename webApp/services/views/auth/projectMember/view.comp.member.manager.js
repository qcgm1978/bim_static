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
	template: _.templateUrl('/services/tpls/auth/projectMember/projectMemberManager.html'),
	selectTree: null,
	selectedTree: null,
	events: {
		"click a[name='selectBtn']": "addOption",
		"mouseover .ztree li a": "showDelete",
		"mouseout .ztree li a": "hideDelete",
		'click #grandBtn':'grand',
		"click .searchBtn":"search",
		"click .closeicon":"clearSearch",
		"keyup #searchContent":"searchCli"
	},
	initialize:function(){
		
	//	this.listenTo(App.Services.projectMember.projectMemberOrgCollection,'reset',this.initView)
		
	},
	render: function(data) {
		this.$el.append(this.template());
		return this;
	},
	
	//初始化部门成员数据、基于ztree树插件
	initView: function(data) {
		//缓存当前View实例对象
		var _view = this;
		//树插件初始化配置
			_view.loadChildren(_view,false,null);
		
		this.selectedTree = $.fn.zTree.init($("#selectedTree"), {
			data:{
				key:{
					title:"tip"
				}
			},
			view: {
				showLine: false,
				showTitle:true,
				nameIsHTML:true
			}
		}, []);

	//	App.Comm.initScroll(this.$('.userSelecter .scrollWrap>ul'),"y");
	},

	//选择节点
	addOption: function() {
		// var _this = this,
		// 	newNodes=[],
		// 	newNodesGet = _this.selectedTree.getNodes(),
		// 	nodes = _this.selectTree.getSelectedNodes(),
		// 	pushArr=[],
		// 	flag=true;
		// _.each(nodes,function(n){
		// 	n.children=[];
		// })
		// if(newNodesGet.length>0){
		// 	for(var j=0,jLen=nodes.length-1;j<=jLen;j++){
		// 		for(var i=0,iLen=newNodesGet.length-1;i<=iLen;i++){
		// 			if(newNodesGet[i].userId == nodes[j].userId){
		// 				flag=false;
		// 			}
		// 		}
		// 		if(flag){
		// 			pushArr.push(nodes[j]);
		// 			continue;
		// 		}
		// 	}
		// 	newNodes = _this.selectedTree.addNodes(null,pushArr);
		// }else{
		// 	newNodes = _this.selectedTree.addNodes(null,nodes);
		// // }
		// console.log(newNodesGet,"newNodesGet");
		// console.log(newNodes,"newNodes");
		// console.log(nodes,"nodes");
		// _.each(nodes,function(n){
		// 	n.children=[];
		// })
		var _this=this;
		var nodes= _this.selectTree.getSelectedNodes();
		_.each(nodes,function(n){
			n.children=[];
		})
		var newNodes=_this.selectedTree.addNodes(null,nodes);
		//自定义渲染树节点
		newNodes.forEach(function(i){
			var $del=$("<span  class='showDelete'><i></i></span>");
			//绑定删除事件
			$del.on("click",function(){
				_this.deleteOption(i);
			});
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
	},

	loadChildren:function(_this,outer,parentId,treeNode){
		_this.$(".scrollWrap").mmhMask();
		var url="fetchServiceKeyUserInfo",
			_getData={
				uid:App.Comm.user('userId')
			},
			setting = {
				data:{
					key:{
						title:"tip"
					}
				},
				callback: {
					beforeClick:function(){

					},
					onClick: function(event, treeId, treeNode) {
						// if(event.target.className.indexOf("button business_ico")!=-1){
						// 	if(!treeNode.userId && !treeNode.isParent){
						// 		_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
						// 	}
						// 	_this.selectTree.cancelSelectedNode(treeNode);
						// }
					},
					beforeDblClick:function(){
						return true;
					},
					onDblClick: function(event, treeId, treeNode) {
						if(!treeNode.userId && !treeNode.isParent){
							_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
						}else if(treeNode.userId){
							_this.addOption();
						}
						// if(event.target.className.indexOf("business_ico")!=-1){
						// 	if(!treeNode.userId && !treeNode.isParent){
						// 		_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
						// 	}
						// 	// _this.selectTree.cancelSelectedNode(treeNode);
						// }else if(treeNode.userId){
						// 	_this.addOption();
						// }
					}
				},
				view: {
					selectedMulti: true,
					nameIsHTML:true,
					showLine: false,
					showTitle:true
				}
			};
		if(parentId){
			_getData={
				outer:outer,
				includeUsers:true,
				parentId:parentId
			}
			url='fetchServiceMemberList';
		}

		App.Comm.ajax({
			URLtype:url,
			type:"get",
			data:_getData
		},function(res){
			if(res.message==="success"){
				var zNodes=[],
					 _org=res.data.org||[],
					_user=res.data.user||[],
					_newOrg=[];
				if(url=='fetchServiceKeyUserInfo'){
					_org.forEach(function(i){
						i.iconSkin='business';
						i.tip= i.name+"("+i.namePath+")";
						i.name=i.name+'<i style="color:#999999;">（'+i.namePath+'）</i>';
					});
					zNodes=_org.concat(_user);
				}else{
					_org.forEach(function(i){
						i.iconSkin='business';
						i.tip= i.name;
						_newOrg.push(i);
					});
					zNodes=_newOrg.concat(_user);
				}
				zNodes.forEach(function(i){
					i.tip= i.tip|| i.name;
				})
				if(!treeNode){
					_this.selectTree = $.fn.zTree.init($("#selectTree"), setting, zNodes);
				}else{
					_this.selectTree.addNodes(treeNode,zNodes);
				}
			}
			clearMask();
		}).fail(function(){
			//失败回调
			clearMask();
		})
	},
	
	/**
	 * 添加项目成员
	 */
	grand:function(){
		$("#dataLoading").show();
		var pid=App.Comm.getCookie('currentPid');
		var url=App.API.URL.putServicesProjectMembers;
		var data={
			"type":App.Services.projectMember.managerType,
		    "projectId":[pid],
		    "outer":{
		        "orgId":[],
		        "userId":[]
		    },
		    "inner":{
		        "orgId":[],
		        "userId":[]
		    }
		};
		
		var nodes=this.selectedTree.getNodes();
		_.each(nodes,function(n){
			if(n.outer){
				if(n.orgId){
					data.outer.orgId.push(n.orgId)
				}else{
					data.outer.userId.push(n.userId)
				}
			}else{
				if(n.orgId){
					data.inner.orgId.push(n.orgId)
				}else{
					data.inner.userId.push(n.userId)
				}
			}
			
		});
		
		App.Comm.ajax({
			URLtype:'putServicesProjectMembers',
			type:"post",
			data:JSON.stringify(data),
			contentType:"application/json"
		},function(res){
			$("#dataLoading").show();
			if(res.message=="success"){
				App.Services.projectMember.loadData(App.Services.projectMember.projectMemberMemberCollection,
					{outer:App.Comm.user("outer")},{
					dataPrivilegeId:App.Comm.getCookie("currentPid")
				});
				App.Services.maskWindow.close();
			}else{
				alert("添加失败");
				$("#dataLoading").hide();
			}
		}).fail(function(){
			$("#dataLoading").hide();
		})

	},
	//搜索模块
	search:function(e){
		var _this = this, url,content = $("#searchContent").val();
		if(!content){return}
		var uid=App.Comm.user('userId');

		var treeNode = null,
			setting = {
				callback: {
					beforeClick:function(){
					},
					onClick: function(event, treeId, treeNode) {
						if(event.target.className.indexOf("button business_ico")!=-1){
							if(!treeNode.userId && !treeNode.isParent){
								_this.loadChildren(_this,treeNode.outer,treeNode.orgId,treeNode);
							}
							_this.selectTree.cancelSelectedNode(treeNode);
						}
					}
				},
				view: {
					selectedMulti: true,
					nameIsHTML:true,
					showLine: false,
					showTitle:false
				}
			};

		url=App.API.URL.searchServicesAuthDataSearch + uid + "/search?key=" + content;  // 头像不对
		$.ajax({
			url:url,
			type:"GET",
			data:{},
			success:function(res){
				if(res.message==="success"){
					var zNodes= res.data || [];
					zNodes.forEach(function(i){
						i.iconSkin='business';
						i.name=i.name+'<i style="color:#999999;">（'+i.parentname+'）</i>';
						if(i.type == 1){
							i.userId = i.id
						}else{
							i.orgId  = i.id
						}
					});
					if(!treeNode){
						_this.selectTree = $.fn.zTree.init($("#selectTree"), setting, zNodes);
					}else{
						_this.selectTree.addNodes(treeNode,zNodes);
					}
				}
				clearMask();
			}
		});
	},
	//重置
	clearSearch:function(e){
		var ele = $(e.target);
		ele.siblings("input").val("");
		this.initView();
	},
	searchCli:function(e){
		if(e.keyCode == 13){
			this.search();
		}
	}
});