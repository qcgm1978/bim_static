 
//项目基本设置
App.Services.ProjectLink=Backbone.View.extend({

	tagName:"div",
	
	className:'projectLinkList',
	
	events:{
		'click tr':'selectProject',
		'click #linkBtn':'linkProject',
		'keydown #inputProjectSerach':'updateList'
	},

	template:_.templateUrl('/services/tpls/project/project.list.html',true),
	
	initialize(data){
		this.userData=data.userData
	},

	render(){
		var _this=this;
		_this.loadData(function(data){
			
			_this.projectData=data;
		
			var _tpl=_.template(_this.template);
			_this.$el.html(_tpl(data));
		});
		return this;
	},
	
	loadData:function(callback){
		var _this=this;
		$.ajax({
			url:'/platform/mapping/project?type='+(_this.userData.type=='qualityProjectCode'?3:2)
		}).done(function(data){
			callback(data);
		})
	},
	
	selectProject:function(e){
		$(e.currentTarget).toggleClass('selected');
		$(e.currentTarget).find('.checkClass').toggleClass('unCheckClass');
	},
	
	linkProject:function(){
		$("#dataLoading").show();
		var $li=$('tr.selected');
		
		var _this=this;
		var projectId=_this.userData.projectId,
			type=_this.userData.type;
		var _result={
				    "modularizeProjectCode": "",
				    "costProjectCode":"",
				    "qualityProjectCode": ""
				}
		_result[type]=$li.first().attr('data-code');
		
		if($li.length>0){
			$.ajax({
				url:'/platform/mapping/'+projectId,
				type:'PUT',
				contentType:'application/json',
				data:JSON.stringify(_result)
			}).done(function(data){
				$("#dataLoading").hide();
				App.Global.module.close();
			})
		}
	},
	
	updateList(e){
		if(e.keyCode!='13'){
			return
		}
		
		var t=$(e.currentTarget).val();
		var d=this.projectData.data||[];
		var r=d.filter(function(i){
			return i.projectName.indexOf(t)!==-1;
		})
		var _tpl=_.template(this.template);
		this.$el.html(_tpl({data:r}));
	}

});