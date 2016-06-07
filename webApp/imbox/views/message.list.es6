App.IMBox=App.IMBox||{}
App.IMBox.imboxListView=Backbone.View.extend({

	template:_.templateUrl('./imbox/tpls/container.html',true),

	initialize : function(){
      //  this.listenTo(App.IMBox.messageCollection,"reset",this.renderData);
    },

	render(){
		this.$el.html(this.template);
		return this;
	},

	renderData(item){
		debugger
	}


})

