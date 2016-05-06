 
//项目基本设置
App.Services.ImageJcrop=Backbone.View.extend({
	tagName:"div",

	template:_.templateUrl('/services/tpls/project/imageJcrop.html',true),
	
	_projectId:'',
	
	events:{
		'click #selectBtn':'selectPic'
	},
	
	initialize(){
	},

	selectPic(){
		var _this=this,
			boundx,boundy,
			x,y,w,h;
		$("#inputFile").trigger('click');
		$("#inputFile").on('change',function(e){
			$("#uploadImageForm").submit();
		})
		$("#uploadIframe").on("load",function(){
			var data=JSON.parse(this.contentDocument.body.innerText);
			var tempUrl='http://h.hiphotos.baidu.com/exp/w=480/sign=663ce568d12a60595210e0121835342d/adaf2edda3cc7cd9ba233d783f01213fb80e9100.jpg';
			//var tempUrl=data.data.logoUrl;
			$("#tempImage").attr("src",tempUrl).show();
			$("#preImage").attr("src",tempUrl).show();
			$("#tempImage").Jcrop({
				aspectRatio:1.3,
				onChange:function(c){
					if (parseInt(c.w) > 0) {
							var rx = 200 / c.w;
							var ry = 150 / c.h;
							w= Math.round(rx * boundx);
							h=Math.round(ry * boundy);
							x=Math.round(rx * c.x);
							y=Math.round(ry * c.y);
							$("#preImage").css({
								width: Math.round(rx * boundx) + 'px',
								height: Math.round(ry * boundy) + 'px',
								marginLeft: '-' + Math.round(rx * c.x) + 'px',
								marginTop: '-' + Math.round(ry * c.y) + 'px'
							});
						}
				}
			},function(){
				var bounds = this.getBounds();
					boundx = bounds[0];
					boundy = bounds[1];
			});
		})
		
		$("#cutImageBtn").on('click',function(){
			$.ajax({
				url:'/platform/project/'+_this._projectId+'/logo/cut?x='+x+'&y='+y+'&w='+w+'&h='+h
			}).done(function(){
			})
		})
	},

	render(imagePath,projectId){
		var data={
			oldImage:imagePath
		}
		this._projectId=projectId;
		this.$el.html(_.template(this.template)(data));   
		return this;
	},
	
	initDom(){
		$("#inputFile").on('change',function(e){
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