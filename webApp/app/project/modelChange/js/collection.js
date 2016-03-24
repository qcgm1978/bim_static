
App.Project = {

  Collection: {
    changeList: new(Backbone.Collection.extend({
      model: Backbone.Model.extend({
        defaults: function() {
          return {
            title: ""
          }
        }
      }),

      urlType:"fetchDesignChange"

    })),
    changeInfo: new(Backbone.Collection.extend({
      model: Backbone.Model.extend({
        defaults: function() {
          return {
            title: ""
          }
        }
      }),
      urlType:"fetchDesignChangeInfo"
    }))
  }
};
