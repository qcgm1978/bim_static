App.INBox=App.INBox||{}
App.INBox.imboxContainerView=Backbone.View.extend({

	template:_.templateUrl('./imbox/tpls/container.html',true),

	initialize : function(){
        this.listenTo(App.INBox.messageCollection,"reset",this.renderData);
        this.listenTo(App.INBox.messageAllCollection,"reset",this.renderAllData);
    },

	render(){
		this.$el.html(this.template);
		return this;
	},

	renderData(item){
        var _data=item.toJSON()[0];
		var _html=_.templateUrl('./imbox/tpls/list.html');
		this.$('.commissionLists').html(_html({data:_data.items}));
        this.$(".commissionListPagination").empty().pagination(_data.totalItemCount, {
             items_per_page:_data.pageItemCount,
             current_page:_data.pageIndex-1,
             num_edge_entries: 3, //边缘页数
             num_display_entries: 5, //主体页数
             link_to: 'javascript:void(0);',
             itemCallback: function(pageIndex) {
                App.INBox.loadData('un',pageIndex + 1);
             },
             prev_text: "上一页",
             next_text: "下一页"

         });
	},

	renderAllData(item){
        var _data=item.toJSON()[0];
		var _html=_.templateUrl('./imbox/tpls/list.html');
		this.$('.alreadyLists').html(_html({data:_data.items}));
        this.$(".alreadyListPagination").empty().pagination(_data.totalItemCount, {
             items_per_page:_data.pageItemCount,
             current_page:_data.pageIndex-1,
             num_edge_entries: 3, //边缘页数
             num_display_entries: 5, //主体页数
             link_to: 'javascript:void(0);',
             itemCallback: function(pageIndex) {
                App.INBox.loadData('all',pageIndex + 1);
             },
             prev_text: "上一页",
             next_text: "下一页"

         });
	}


})

