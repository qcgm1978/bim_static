 
//项目基本设置
App.Services.ImageJcrop=Backbone.View.extend({
	tagName:"div",

	template:_.templateUrl('/services/tpls/project/imageJcrop.html',true),
	
	events:{
		'click #selectBtn':'selectPic'
	},
	
	initialize(){
	},

	selectPic(){
		$("#inputFile").trigger('click');
		$("#inputFile").on('change',function(e){
			var _files=e.target.files;
			if(_files.length){
				var _file=_files[0];
				var URL = window.URL || window.webkitURL;
				var _image= URL.createObjectURL(_file);
				$("#tempImage").attr("src",_image).show();
				$("#preImage").attr("src",_image);
				$("#tempImage").Jcrop();
			}
		})
	},

	render(){
		this.$el.html(this.template);   
		return this;
	},
	
	initDom(){
		$("#inputFile").on('change',function(e){
			debugger
			var _files=e.target.files;
			if(_files.length){
				var _file=_files[0];
				var URL = window.URL || window.webkitURL;
				var _image= URL.createObjectURL(_file);
				$("#tempImage").attr("src",_image).show();
				$("#tempImage").Jcrop();
			}
		})
		
	}

});