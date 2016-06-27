App.Projects.searchView = Backbone.View.extend({

	tagName: 'div',

	className: 'projectSearch',

	formData:{
		 name:"",
		 projectType:"",
		 estateType: "",
         province: "",
         region: "",
         complete: "",
         open: "",
         openTimeStart: "", 
         openTimEnd: ""
	},
	//
	events: {
		"click .seniorSearch": "seniorSearch",
		"click .btnSearch": "searchProject",
		"click .btnClear": "clearSearch",
		"change .txtSearch":"linkSearchWord"
	},

	template: _.templateUrl("/projects/tpls/project.search.html"),


	render: function() {
		var _this=this;
		this.$el.html(this.template());
		//type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');

		this.$(".pickProjectType").myDropDown({
			zIndex:99,
			click:function($item){
				_this.formData.subType=$item.attr('data-val');
			}
		});
		this.$(".pickCategory").myDropDown({
			zIndex:98,
			click:function($item){
				_this.formData.estateType=$item.attr('data-val');
			}
		});
		this.$(".projectStatus").myDropDown({
			zIndex:98,
			click:function($item){
				_this.formData.projectType=$item.attr('data-val');
			}
		});
		this.$(".pickManager").myDropDown({
			zIndex:97,
			click:function($item){
				_this.formData.region=encodeURI($item.attr('data-val'));
			}
		});
		this.$(".pickProvince").myDropDown({
			zIndex:96,
			click:function($item){
				_this.formData.province=encodeURI($item.text());
			}
		});
		this.$(".pickOpening").myDropDown({
			zIndex:95,
			click:function($item){
				_this.formData.open=$item.attr('data-val');
			}
		});

		this.$('.btnRadio').on('click',function(){
			_this.formData.complete=$(this).attr('data-val');
		})

		this.$('#dateStar').on('change',function(){
			_this.formData.openTimeStart=$(this).val();
		})
		this.$('#dateEnd').on('change',function(){
			_this.formData.openTimEnd=$(this).val();
		})

		return this;

	},

	clearSearch:function(){
		this.formData={
			 name:"",
			 projectType:"",
			 estateType: "",
	         province: "",
	         region: "",
	         complete: "",
	         open: "",
	         openTimeStart: "", 
	         openTimEnd: ""
		};
		this.$(".pickProjectType .text").html('请选择');
		this.$(".pickCategory .text").html('请选择');
		this.$(".pickManager .text").html('请选择');
		this.$(".pickProvince .text").html('请选择');
		this.$(".pickOpening .text").html('请选择');

		this.$(".btnRadio").removeClass('selected');
		this.$('#dateStar').val('');
		this.$('#dateEnd').val('');
		this.$(".quickSearch .txtSearch").val('');
		this.$('.moreSeachText').val('');
		App.Projects.Settings.pageIndex=1;
		App.Projects.loadData(this.formData); 
	},

	//显示隐藏高级收缩
	seniorSearch: function() {

		var $advancedQueryConditions = this.$el.find(".advancedQueryConditions");
		if ($advancedQueryConditions.is(":hidden")) {
			this.$el.find(".quickSearch").hide();
			this.$el.find(".advancedQueryConditions").show();
			$("#projectModes").addClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").addClass('down');
		} else {
			this.$el.find(".quickSearch").show();
			this.$el.find(".advancedQueryConditions").hide();
			$("#projectModes").removeClass("projectModesDown");
			//当前按钮添加事件
			this.$el.find(".seniorSearch").removeClass('down');
		}
		this.$el.find(".seniorSearch i").toggleClass('icon-angle-down  icon-angle-up');

	},
	//搜索项目
	searchProject: function() {
		var quickSearchName =encodeURI($(".quickSearch .txtSearch").val().trim()),
			moreSearchName =encodeURI($('.moreSeachText').val().trim());
		this.formData.name=moreSearchName||quickSearchName||'';
		App.Projects.Settings.pageIndex=1;
 		App.Projects.loadData(this.formData); 

	},

	linkSearchWord:function(e){
		this.$('.moreSeachText').val($(e.currentTarget).val());
	}

});