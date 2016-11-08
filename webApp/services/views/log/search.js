App.Services.searchView = Backbone.View.extend({

  tagName: 'div',

  className: 'logSearch',

  formData:{
    moduleType:"",
    entityName: "",
    operator: "",
    opTimeStart:"",
    opTimeEnd:""
  },
  //
  events: {
    "click .btnSearch": "searchProject",
    "click .btnClear": "clearSearch",
    "change .txtSearch":"linkSearchWord",
    "keydown .txtInput":"enterSearch"
  },

  template: _.templateUrl("/services/tpls/log/log.search.html"),


  render: function() {
    var _this=this;
    this.$el.html(this.template());
    //type=="my-backbone-fast" && this.$el.find(".fast").addClass('selected')|| this.$el.find(".msg").addClass('selected');

    this.$(".pickProjectType").myDropDown({
      zIndex:99,
      click:function($item){
        _this.formData.moduleType=$item.attr('data-val');
      }
    });


    this.$('#dateStar').datetimepicker({
      language: 'zh-CN',
      autoclose: true,
      format: 'yyyy-mm-dd',
      minView: 'month'
    }).on("changeDate", function(ev) {
      var _dateStr=new Date(ev.date.getTime()-24*60*60*1000).format('yyyy-MM-dd');
      _this.$('#dateEnd').datetimepicker('setStartDate',_dateStr);
      _this.$('#dateEnd1').val('');
    });
    this.$('#dateEnd').datetimepicker({
      language: 'zh-CN',
      autoclose: true,
      format: 'yyyy-mm-dd',
      minView: 'month'
    }).on("changeDate", function(ev) {

    });
    this.$('#dateStar').on('change',function(){
      _this.formData.opTimeStart=$(this).val();
    })
    this.$('#dateEnd').on('change',function(){
      _this.formData.opTimeEnd=$(this).val();
    })

    return this;

  },

  clearSearch:function(){
    this.formData={
      moduleType:"",
      opTime:"",
      entityName: "",
      operator: "",
      opContent: "",
      opTimeStart:"",
      opTimeEnd:""
    };
    this.$(".pickProjectType .text").html('请选择类别');

    this.$(".btnRadio").removeClass('selected');
    this.$('#dateStar').val('');
    this.$('#dateEnd').val('');
    this.$('.moreSeachText').val('');
    App.Services.Settings.pageIndex=1;
    App.Services.loadData(this.formData);
  },

  enterSearch:function(e){
    if(e && e.keyCode=='13'){
      this.searchProject();
    }
  },

  //显示隐藏高级收缩
  seniorSearch: function() {

    var $advancedQueryConditions = this.$el.find(".advancedQueryConditions");
    if ($advancedQueryConditions.is(":hidden")) {
      this.$el.find(".quickSearch").hide();
      this.$el.find(".advancedQueryConditions").show();
      $("#projectModes").addClass("projectModesDown");
      //当前按钮添加事件
      this.$el.find(".seniorSearch").addClass('down');
    } else {
      this.$el.find(".quickSearch").show();
      this.$el.find(".advancedQueryConditions").hide();
      $("#projectModes").removeClass("projectModesDown");
      //当前按钮添加事件
      this.$el.find(".seniorSearch").removeClass('down');
    }
    this.$el.find(".seniorSearch i").toggleClass('icon-angle-down  icon-angle-up');

  },
  //搜索项目
  searchProject: function() {
    var name =$("#name").val().trim(),
        account =$("#account").val().trim();
    this.formData.entityName=name;
    this.formData.operator=account;
    App.Services.Settings.pageIndex=1;
    App.Services.loadData(this.formData);

  },

  linkSearchWord:function(e){
    this.$('.moreSeachText').val($(e.currentTarget).val());
  }

});
