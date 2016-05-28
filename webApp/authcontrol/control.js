App.AuthControl = {

  setting : {
    authInfo : ''
  },
  getAuthInfo : function(){

    if(this.setting.authInfo){

    }else{
      if(localStorage.user && localStorage.user.length>10){
        this.setting.authInfo = _.pluck(JSON.parse(localStorage.user).function,'code');
        console.log(this.setting.authInfo)

      }else{
        this.setting.authInfo = null;

      }
    }



  },

  do : function(page,param1,param2){

    //this.getAuthInfo();
    //
    //switch (page){
    //  case 'service':
    //    param1 ? (param2?this.service2(param1,param2):this.service1(param1)):this.service()
    //}
  },

  service : function(){

    var info = this.setting.authInfo;
    //应用管理
    if(!info || !_.contains(info,"service-app")){
      $('.item.application').hide();
    }
    //日记管理
    if(!info || !_.contains(info,"service-log")){
      $('.item.log').hide();
    }
    //系统管理
    if(!info || !(_.contains(info,"service-sys-bizCategary") || _.contains(info,"service-sys-workflow") || _.contains(info,"service-sys-extendedAttribute"))){
      $('.item.systen').hide();
    }
    //项目管理
    if(!info || !(_.contains(info,"service-project-baseInfo") || _.contains(info,"service-project-mappingRule") || _.contains(info,"service-project-designInfo"))){
      $('.item.project').hide();
    }
  },
  service1 : function(type){

    var info = this.setting.authInfo;
    if(type=='project'){
      //项目管理
      if(!(_.contains(info,"service-project-baseInfo"))){
        $('li[data-type="base"]').remove();
      }
      if(!(_.contains(info,"service-project-mappingRule"))){
        $('li[data-type="mapping"]').remove();
      }
      if(!(_.contains(info,"service-project-designInfo"))){
        $('li[data-type="floor"],li[data-type="basehole"],li[data-type="section"],li[data-type="pile"]').remove();
      }
      setTimeout(function(){
        $('.serviceNav .item').eq(0).trigger('click');

      },100);
    }

  },
  service2 : function(type,tab){
    console.log('do3')

  },
  //成本和质量权限控制

};
