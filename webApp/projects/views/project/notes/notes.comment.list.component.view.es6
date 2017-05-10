App.Project.NotesCommentComponentView = Backbone.View.extend({
	tagName: "li",
	className: "",
	template:_.templateUrl("/projects/tpls/project/notes/project.notes.comment.component.html"),
	default:{
	},
	render: function() {
		this.$el.html(this.template(this.model));
		return this;
	},
	
})