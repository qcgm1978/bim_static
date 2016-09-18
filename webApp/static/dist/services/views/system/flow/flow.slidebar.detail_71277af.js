"use strict";

//slideBar 详情
App.Services.System.FolwSlideBarDetail = Backbone.View.extend({

  tagName: "li",

  className: "item",

  events: {
    "click": "clickItem"
  },

  //渲染
  render: function render() {

    var data = this.model.toJSON(),
        html = _.template('<i class="border"></i><%=busName%>(<%=busCode%>)')(data);

    this.$el.html(html).data("id", data.id);

    return this;
  },


  //点击单个
  clickItem: function clickItem(event) {

    var $target = $(event.target).closest(".item"),
        id = $target.data("id");

    $target.addClass("selected").siblings().removeClass("selected");

    App.Services.SystemCollection.FlowCollection.reset();

    App.Services.SystemCollection.FlowCollection.fetch({
      data: { categoryId: id },
      success: function success(models, data) {

        $(".systemContainer .folwContainer .textSum .count").text(data.data.length);
        $(".folwContainer .flowListBody li:last").find(".myIcon-down").toggleClass("myIcon-down-disable myIcon-down");
      }
    });
  }
});