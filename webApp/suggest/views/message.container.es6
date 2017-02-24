App.Suggest=App.Suggest||{}
App.Suggest.containerView=Backbone.View.extend({

    id:"imboxContent",

	template:_.templateUrl('./suggest/tpls/container.html',true),

	initialize : function(){
        this.listenTo(App.Suggest.messageCollection,"reset",this.renderData);
    },

	render(){
		this.$el.html(this.template);
		return this;
	},

	renderData(item){
        var _data=item.toJSON();
		var _html=_.templateUrl('./suggest/tpls/list.html');
		this.$('.commissionLists').html(_html({data:_data}));
        this.scrollFun();
        /*this.$(".commissionListPagination").empty().pagination(_data.totalItemCount, {
             items_per_page:_data.pageItemCount,
             current_page:_data.pageIndex-1,
             num_edge_entries: 3, //边缘页数
             num_display_entries: 5, //主体页数
             link_to: 'javascript:void(0);',
             itemCallback: function(pageIndex) {
             },
             prev_text: "上一页",
             next_text: "下一页"

         });*/
	},
    scrollFun:function(){
        
    }

})

