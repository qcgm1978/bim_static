"use strict";

App.Project.ProjectViewSetting = Backbone.View.extend({

  tagName: "div",

  className: "designCollSetting",

  events: {
    "click .itemContent": "openTree",
    "blur .labelInput": "requireName"
  },

  template: _.templateUrl("/projects/tpls/project/design/project.design.view.setting.html"),

  initialize: function initialize() {
    this.listenTo(App.Project.DesignAttr.CollisionSetting, "add", this.addFiles);
  },

  render: function render() {
    this.$el.html('');
    return this;
  },

  addFiles: function addFiles(model) {
    var that = this;
    var data = model.toJSON();
    this.$el.html(this.template(data));
    return this;
  },

  openTree: function openTree(event) {
    var self = this,
        that = self.element = $(event.target).closest(".itemContent");
    that.toggleClass("open");
  }
});