 
//项目映射
App.Services.ProjectMapping=Backbone.View.extend({

	tagName:"div",

	className:"projectMapping", 
	
	events:{
		'click .alink':'linkList',
		'click .aedit':'linkList'
	},

	template:_.templateUrl('/services/tpls/project/index.mapping.html',true),

	initialize(){
		this.listenTo(App.Services.ProjectCollection.ProjecMappingCollection,'reset',this.render);
	},

	render(data){
		data=data.toJSON()[0];
		var _array=[];
		if(data){
			_array=[{
	    		module:'模块化',
	    		projectName:data.modularizeProjectName,
	    		code:data.modularizeProjectCode,
	    		op:''
	    	},{
	    		module:'成本',
	    		projectName:data.costProjectName,
	    		code:data.costProjectCode,
	    		op:"<a class='aedit' href='javascript:;'>修改</a>"
	    	},{
	    		module:'质监',
	    		projectName:data.qualityProjectName,
	    		code:data.qualityProjectCode,
	    		op:"<a class='alink' href='javascript:;'>关联</a>"
	    	}];
		}
    	
    	
    	var _html=_.template(this.template);
		this.$el.html(_html({items:_array}));  
		$(".projectContainer .projectMapping").html(this.$el);
		
		return this;
	},
	
	setUserData(data){
		this.userData=data;
	},
	
	linkList(event){
		debugger
		var _userData=this.userData;
		var el=new App.Services.ProjectLink({
			userData:{
				projectId:_userData.projectId,
				type:$(event.currentTarget).attr('class')=='alink'?'qualityProjectCode':'costProjectCode'
			}
		}).render().el;
		App.Global.module=new App.Comm.modules.Dialog({title:'成本项目映射',width:600,height:500,isConfirm:false,message:el})
	}

});