
App.Project.FileContainerDetail=Backbone.View.extend({


	tagName:"li",

	className:"item",

	//初始化
	initialize:function(){
		//this.listenTo(this.model, 'change', this.render);
	   // this.listenTo(this.model, 'destroy', this.removeItem);
	},

	//事件绑定
	events:{
		"click .fileName  .text":"fileClick",
		"click .ckAll":"singleCheck"
	},

	template:_.templateUrl("/projects/tpls/project/project.container.file.detail.html"),

	//渲染
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	//文件或者文件夹点击
	fileClick:function(event){

		var $target=$(event.target),id=$target.data("id"),isFolder=$target.data("isfolder");
		//文件夹
		if (isFolder) {

			var $leftItem=$("#projectContainer .projectNavContentBox .treeViewMarUl span[data-id='"+id+"']");

			if ($leftItem.length>0) {

				$nodeSwitch=$leftItem.parent().find(".nodeSwitch");

				if ($nodeSwitch.length>0  && !$nodeSwitch.hasClass('on') ) {
					$nodeSwitch.click();
				}
				$leftItem.click();
			}

		}else{

			//this.fetchFileModelIdByFileVersionId(id,$target);

		} 
	},

	//获取文件模型id
	fetchFileModelIdByFileVersionId:function(id,$target){

		var data={
			URLtype:"fetchFileModelIdByFileVersionId",
			data:{
				projectId:App.Project.Settings.projectId,
				projectVersionId:App.Project.Settings.CurrentVersion.id,
				fileVersionId:id,
			}
		};

		App.Comm.ajax(data,function(data){
			 if (data.message=="success") {

			 	if (data.data.modelId) {

			 	}else{
			 		$target.prop("href","javascript:void(0);");
			 		alert("模型转换中");
			 	}

			 }else{
			 	alert(data.message);
			 }
		});  
	},

	//是否全选
	singleCheck(event){
	 
		if (this.$el.parent().find(".ckAll:not(:checked)").length>0) {
			$(".fileContentHeader  .header .ckAll").prop("checked",false);
			
		}else{
			$(".fileContentHeader  .header .ckAll").prop("checked",true);
		}
	}

});
