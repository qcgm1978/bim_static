App.Project.NotesToMeView = Backbone.View.extend({
	tagName: "div",
	className: "notesContentBoxTop",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.to.me.html",true),
	default:{
	},
	render: function() {
		this.$el.html(this.template);
		this.initCheckHandle();//初始化复选框事件
		return this;
	},
	initCheckHandle(){//初始化复选框事件
		this.$("#toMe").on("change",function(evt){
			var target = $(evt.target);
			var searchData = {
				"toMeBool":target.prop("checked"),
			}
			App.Project.NotesCollection.getNotesListHandle(searchData);//共用了获取批注列表的方法
		})
	}
})