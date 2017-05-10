App.Project.NotesSearchCondition = Backbone.View.extend({
	tagName: "div",
	className: "searchConditionBox",
	template:_.templateUrl("/projects/tpls/project/notes/project.search.condition.html"),
	default:{
		versionIds:[],
		searchKeyText:'',
		searchVersionId:"",
		searchStartDate:'',
		searchEndDate:'',
		notesDateStar:'',
		notesDateEnd:''
	},
	render: function() { 
		this.getVersionIdHandle();//获取版本id列表
		this.initDateHandle();//初始化页面上的数据
		return this;
	},
	initDateHandle:function(){//初始化页面上的数据
		var _this = this;
		var startDate = new Date(),
			endDate = new Date(),
			formatEndDate = endDate.getFullYear()+'-'+(endDate.getMonth()+1>=10?endDate.getMonth()+1:"0"+(endDate.getMonth()+1))+'-'+(endDate.getDate()>=10?endDate.getDate():"0"+endDate.getDate()),
			y,m,d,formatStartDate;
		startDate.setMonth(startDate.getMonth()-1);
        y = startDate.getFullYear();
        m = startDate.getMonth()+1>=10?startDate.getMonth()+1:"0"+(startDate.getMonth()+1);
        d = startDate.getDate()>=10?startDate.getDate():"0"+startDate.getDate();
        formatStartDate = y+'-'+m+'-'+d;
        this.default.notesDateStar = formatStartDate;//渲染页面的开始时间
        this.default.notesDateEnd = formatEndDate;//渲染页面的结束时间
        this.default.searchStartDate = formatStartDate;//搜索的时候使用的开始时间
        this.default.searchEndDate = formatEndDate;//搜索的时候使用的结束时间
	},
	bindDateHandle:function(){//给时间输入框绑定事件插件
		var _this = this;
		this.$('#notesDateStar').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month',
			endDate:this.default.notesDateEnd
		}).on("changeDate",function(ev){
			var _dateStr=new Date(ev.date.getTime()).format('yyyy-MM-dd');
			_this.$('#notesDateEnd').datetimepicker('setStartDate',_dateStr);
			_this.$('#notesDateEnd').val();
			_this.default.searchStartDate = _dateStr;
		});
		this.$('#notesDateEnd').datetimepicker({
			language: 'zh-CN',
			autoclose: true,
			format: 'yyyy-mm-dd',
			minView: 'month',
			startDate:this.default.notesDateStar
		}).on("changeDate",function(ev){
			var _dateStr=new Date(ev.date.getTime()).format('yyyy-MM-dd');
			_this.$('#notesDateStar').datetimepicker('setEndDate',_dateStr);
			_this.$('#notesDateStar').val();
			_this.default.searchEndDate = _dateStr;
		});
		this.$(".dateBox .iconCal").on("click",function() {
		    $(this).next().focus();
		});
	},
	getVersionIdHandle:function(){//获取版本id列表
		var _this = this;
		var _data = {
				URLtype: "fetchStandardVersion",
				data: {
					projectId: App.Project.Settings.projectId,
				}
			};
		App.Comm.ajax(_data, function(data) {
			if (data.code == 0) {
				_this.default.versionIds = data.data;
				_this.initHtmlHandle();//初始化页面结构
			} else {
				$.tip({
					message:data.message,
					type:'alarm'
				});
			}
		})
	},
	initHtmlHandle:function(){//初始化页面结构
		this.$el.html(this.template({default:this.default}));
		this.bindKeyHandle();//给关键词输入框绑定事件
		this.bindSelectChangeHandle();//给下拉列表绑定事件
		this.bindDateHandle();//给时间输入框绑定事件插件
		this.bindSearchBtnHandle();//给搜索按钮绑定点击事件
	},
	bindSelectChangeHandle:function(){//给下拉列表绑定事件
		var _this = this;
		var selectDom = this.$(".keyTextInputBox select");
		selectDom.on("change",function(){
			_this.default.searchVersionId = $(this).find('option:selected').attr('versionId')?$(this).find('option:selected').attr('versionId'):"";
		})
	},
	bindKeyHandle:function(){//给关键词输入框绑定事件
		var _this = this;
		var keyDome = this.$(".keyTextInputBox input");
		keyDome.on("keyup",function(event){
			var target = $(event.target);
			var targetVal = target.val().trim();
			_this.default.searchKeyText = targetVal?targetVal:"";
		})
	},
	bindSearchBtnHandle:function(){//给搜索按钮绑定点击事件
		var _this = this;
		var searchBtn = this.$(".searchBoxS button");
		searchBtn.on("click",function(){
			_this.loadListHandle();//通过搜索获取批注列表的方法
		})
	},
	loadListHandle:function(){//通过搜索获取批注列表的方法
		var searchData = {
			"projectVersionId":this.default.searchVersionId,
			"content":this.default.searchKeyText,
			"opTimeStart":this.default.searchStartDate,
			"opTimeEnd":this.default.searchEndDate,
		}
		App.Project.NotesCollection.defaults.pageIndexNotes = 1;
		App.Project.NotesCollection.getNotesListHandle(searchData);//共用了获取批注列表的方法
	}
})