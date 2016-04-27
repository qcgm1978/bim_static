/**
 * @require /services/views/system/index.es6
 */


//列别管理
App.Services.System.CategoryManager = Backbone.View.extend({

	tagName: "div",

	className: "categoryManager",

	events: {
		"click .topBar .create": "addNewCategoryDialog"
	},

	//初始化
	initialize() {
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "add", this.addOne);
		this.listenTo(App.Services.SystemCollection.CategoryCollection, "reset", this.resetList)
	},

	template: _.templateUrl('/services/tpls/system/category/system.category.index.html'),

	render() {

		this.$el.html(this.template);
		this.getList();
		return this;

	},

	//获取数据
	getList(){
		//重置
		App.Services.SystemCollection.CategoryCollection.reset();
		//获取数据
		App.Services.SystemCollection.CategoryCollection.fetch();
	},

	//新增分类 弹出层
	addNewCategoryDialog() { 

		var dialogHtml = _.templateUrl('/services/tpls/system/category/system.add.category.html', true);

		var opts = {
			title: "新增业务类别",
			width: 601,
			cssClass: "addNewCategoryDialog",
			message: dialogHtml,
			okCallback: () => {
				if (this.addNewCategory()==false) {
					return false;
				};
			}

		}

		new App.Comm.modules.Dialog(opts);
	},

	//新增分类
	addNewCategory() {
		var $addNewCategoryDialog = $(".addNewCategoryDialog"),
			title = $addNewCategoryDialog.find(".txtCategoryTitle").val().trim(),
			desc = $addNewCategoryDialog.find(".txtCategoryDesc").val().trim();

		if (!title) {
			alert("请输入分类名称");
			return false;
		}

		if (!desc) {
			alert("请输入分类描述");
			return false;
		}

		var data={
			URLtype:"servicesAddCategory",
			type:"POST",
			data:{
				busName:title,
				busDescdesc:desc
			}
		}

		//新增
		App.Comm.ajax(data,function(data){
			console.log(data);
		}) 
	}, 

	//新增后处理
	addOne(model) {
		 
		//
		var viewr=new App.Services.System.CategoryListDetail({
			model:model
		});

		this.$(".categoryListBody").find(".loading").remove();

		this.$(".categoryListBody").append(viewr.render().el);

	},

	//重置加载
	resetList(){
		this.$(".categoryListBody").html('<li class="loading">正在加载，请稍候……</li>');
	}


});