App.INBox=App.INBox||{}
App.INBox.imboxContainerView = Backbone.View.extend({
    tagName: 'div',
    className: 'contentBox',
	template:_.templateUrl('./imbox/tpls/container.html',true),
	initialize : function(){
        this.listenTo(App.INBox.messageCollection,"reset",this.renderData);
        this.listenTo(App.INBox.messageAllCollection,"reset",this.renderAllData);
    },
	render(){
		this.$el.html(this.template);

		return this;
	},
    //滚动条
    bindTreeScroll() {
        var $modelTree = $(".scrollBoxUl");
        if (!$modelTree.hasClass('mCustomScrollbar')) {
            $modelTree.mCustomScrollbar({
                set_height: "100%",
                set_width: "100%",
                theme: 'minimal-dark',
                axis: 'y',
                keyboard: {
                    enable: true
                },
                scrollInertia: 0
            });
        }
    },
     //滚动条
    bindTreeScrollS() {
        var $modelTree = $(".scrollBoxUlS");
        if (!$modelTree.hasClass('mCustomScrollbar')) {
            $modelTree.mCustomScrollbar({
                set_height: "100%",
                set_width: "100%",
                theme: 'minimal-dark',
                axis: 'y',
                keyboard: {
                    enable: true
                },
                scrollInertia: 0
            });
        }
    },
	renderData(item){
        var _data=item.toJSON()[0];
		var _html=_.templateUrl('./imbox/tpls/list.html');
        if(!_data.items.length){
            this.$('.commissionLists').html('<span class="noData"><i class="tip"></i>没有消息</span>');
            return
        }
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
        this.bindTreeScroll();
	},
	renderAllData(item){
        var _data=item.toJSON()[0];
		var _html=_.templateUrl('./imbox/tpls/list.html');

         if(!_data.items.length){
             this.$('.alreadyLists').html('<span class="noData"><i class="tip"></i>没有消息</span>');
            return 
        }

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
        this.bindTreeScrollS();
	}
})