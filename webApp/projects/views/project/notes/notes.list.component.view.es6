App.Project.NotesListComponentView = Backbone.View.extend({
	tagName: "li",
	className: "clickItem",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.list.component.html"),
	default:{
	},
	render: function() {
		this.$el.html(this.template(this.model));
		return this;
	},
	
})