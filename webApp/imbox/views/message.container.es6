App.IMBox=App.IMBox||{}
App.IMBox.imboxContainerView=Backbone.View.extend({

	template:_.templateUrl('./imbox/tpls/container.html',true),

	initialize : function(){
        this.listenTo(App.IMBox.messageCollection,"reset",this.renderData);
        this.listenTo(App.IMBox.messageAllCollection,"reset",this.renderAllData);
    },

	render(){
		this.$el.html(this.template);
		return this;
	},

	renderData(item){
		var _html=_.templateUrl('./imbox/tpls/list.html');
		this.$('.commissionLists').html(_html({data:item.toJSON()}));
        this.$(".commissionListPagination").empty().pagination(50, {
             items_per_page:20,
             current_page:1,
             num_edge_entries: 3, //边缘页数
             num_display_entries: 5, //主体页数
             link_to: 'javascript:void(0);',
             itemCallback: function(pageIndex) {
                 App.IMBox.pageIndex = pageIndex + 1;
             },
             prev_text: "上一页",
             next_text: "下一页"

         });
	},

	renderAllData(item){
		var _html=_.templateUrl('./imbox/tpls/list.html');
		this.$('.alreadyLists').html(_html({data:item.toJSON()}));
        this.$(".alreadyListPagination").empty().pagination(80, {
             items_per_page:20,
             current_page:1,
             num_edge_entries: 3, //边缘页数
             num_display_entries: 5, //主体页数
             link_to: 'javascript:void(0);',
             itemCallback: function(pageIndex) {
                 App.IMBox.pageIndex = pageIndex + 1;
             },
             prev_text: "上一页",
             next_text: "下一页"

         });
	}


})

