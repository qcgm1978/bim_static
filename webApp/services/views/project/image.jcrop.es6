 
//项目基本设置
App.Services.ImageJcrop=Backbone.View.extend({
	tagName:"div",

	template:_.templateUrl('/services/tpls/project/imageJcrop.html',true),
	
	_projectId:'',
	
	events:{
		'change #inputFile':'initDom'
	},
	
	initialize(){
	},

	selectPic(){
		var _this=this,
			boundx,boundy,
			x,y,w,h;
		$("#uploadIframe").on("load",function(){
			var data=JSON.parse(this.contentDocument.body.innerText);
			//var tempUrl='http://h.hiphotos.baidu.com/exp/w=480/sign=663ce568d12a60595210e0121835342d/adaf2edda3cc7cd9ba233d783f01213fb80e9100.jpg';
			var tempUrl=data.code==0?data.data.logoUrl:'';
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
								width: w + 'px',
								height: h + 'px',
								marginLeft: '-' + x + 'px',
								marginTop: '-' + y + 'px'
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
			var j=$("#tempImage").data().Jcrop.tellSelect();
			$("#dataLoading").show();
			$.ajax({
				type:"post",
				url:'/platform/project/'+_this._projectId+'/logo/cut?x='+x+'&y='+y+'&w='+(boundx/326)*w+'&h='+(boundy/235)*h
			}).done(function(data){
				$("#dataLoading").hide();
				if(data.message=='success'){
					App.Services.maskWindow.close();
					var _collection=App.Services.ProjectCollection.ProjectBaseInfoCollection;
					_collection.projectId=_this._projectId;
			 		_collection.fetch({
			 			reset:true,
			 			success(child, data) {
			 			}
			 		});
				}
			}).fail(function(){
				$("#dataLoading").hide();
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
		this.selectPic();
		$("#uploadImageForm").submit();
	}
});