 
//项目映射
App.Services.ProjectMapping=Backbone.View.extend({

	tagName:"div",

	className:"projectMapping", 

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
	    		code:data.modularizeProjectCode
	    	},{
	    		module:'成本',
	    		projectName:data.costProjectName,
	    		code:data.costProjectCode
	    	},{
	    		module:'质监',
	    		projectName:data.qualityProjectName,
	    		code:data.qualityProjectCode
	    	}];
		}
    	
    	
    	var _html=_.template(this.template);
		this.$el.html(_html({items:_array}));  
		$(".projectContainer .projectMapping").html(this.$el);
		return this;
	}

	 



});