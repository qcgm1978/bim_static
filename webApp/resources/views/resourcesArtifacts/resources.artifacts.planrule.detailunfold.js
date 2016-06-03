/**
 * @require /resources/collection/resource.nav.es6
 */
App.Resources.ArtifactsPlanRuleDetailUnfold = Backbone.View.extend({

    tagName:"div",

    template: _.templateUrl("/resources/tpls/resourcesArtifacts/resources.artifacts.planruledetailunfold.html"),

    events:{
        "click .tabRule":"tabRule",
        "click .addNewRule":"addNewRule",
        "click .deleteRule":"deleteRule",
        "click .saveRule":"saveRule",
        "click .choose":"choose",

        "click .delRule": "delRule",
        "focus .categoryCode": "legend"
    },
    render:function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    initialize:function(model){
        this.listenTo(this.model,"change",this.render);
        this.listenTo(this.model,"mappingCategoryChange",this.render);
        this.dealStr(model);
        //this.getValue("(30,40]");
    },
    //ѡ��������
    choose:function(){
        var tree  = new App.Resources.ArtifactsWindowRule().render().el;
        this.window(tree);
        App.Resources.ArtifactsMaskWindow.find(".content").css({"position":"relative"});
        var contain = App.Resources.artifactsTree(App.Resources.artifactsTreeData);
        $("#resourcesArtifactTree").html(contain);
        App.ResourceArtifacts.presentRule = this;
    },


    //�����¹���
    addNewRule:function(){
        var model = new App.ResourceArtifacts.newRule(App.ResourceArtifacts.newModel);
        App.ResourceArtifacts.operator.add(model);
    },
    //����
    saveRule:function(){
        //У��
        var  check = this.check();
        if(!check){return}

        var _this =this;
        var cdata = {
            URLtype : '',
            type:"POST",
            data:{}
        };
        if(this.model.get("id")){
            cdata.URLtype = "modifyArtifactsPlanRule";
            //����
        }else{
            cdata.URLtype = "createArtifactsPlanNewRule";
            //����
        }
        //��ʱ����
        this.$el.closest(".ruleDetail").hide().empty();
        App.ResourceArtifacts.Status.saved = true ;//����״̬
        //
        App.Comm.ajax(cdata,function(response){
            if(response.code == 0 && response.data.id){

                //����
                if(cdata.URLtype == "createArtifactsPlanNewRule"){
                    _this.createRule();
                }

                _this.$el.closest(".ruleDetail").hide().empty();
                _this.reset();
            }
        });
      /* �������� {
            "messageId": "8dd37a0f592c4d7e8a13895ea1ac3c2a",
            "messageType": null,
            "timestamp": 1464599023448,
            "code": 0,
            "message": "success",
            "data": {
            "id": 842508543648096
            }
        }
        */
    },
    //����
    createRule:function(response){
        this.model.set("id",response.data.id);
    },
    //���ñ���״̬
    reset:function(){
        App.ResourceArtifacts.Status.saved = true ;
    },

    //ɾ���ƻ��е���������
    deleteRule:function(){
        var _this = this;
        //�½���δ�޸�
        if(!_this.model.get("id") && App.ResourceArtifacts.Status.saved){//���δ�޸�����գ�ע���½�ʱ���޸�   App.ResourceArtifacts.Status.saved ֵ�����
            _this.$el.closest("li").hide().empty();
            _this.reset();
            return
        }
        var frame = new App.Resources.ArtifactsPlanRuleAlert().render().el;
            App.Resources.ArtifactsAlertWindow = new App.Comm.modules.Dialog({
                title: "",
                width: 280,
                height: 180,
                isConfirm: false,
                isAlert: false,
                message: frame
            });
            $(".mod-dialog .wrapper .header").hide();//����ͷ��
            $(".alertInfo").html('ȷ��ɾ�� ��'+ _this.model.get("targetName") + '����');
    },
    //ɾ����������
    delRule:function(e){
        var rule = $(e.target),_this = this;
        var id  = rule.siblings(".leftten").data("id");
        var list = _this.model.get("mappingCategory")["mappingPropertyList"];
        for(var i = 0 ; i < list.length ; i ++){
            if(list[i].id == id){
                list.splice(i,1)
            }
        }
        _this.model.set(".mappingPropertyList",list);
        rule.closest("dd").remove();
    },
    //����ģ��
    legend:function(e){
        var _this = this;
        _this.$(".chide").css({"visibility":"hidden"});
        var ac = _.map(App.Resources.artifactsTreeData,function(item){return item.code}); //����-����
        var pre = $(e.target);
        $(e.target).addClass("active");
        pre.css({"opacity":"1"});
        //���벻�Ϸ����޷��ҵ�
        var list = pre.closest("div").siblings("ul");
        list.html();

        if(pre.val()){
            list.show();
        }
        //���
        pre.on("keydown",function(){
            list.show();
            pre.removeClass("alert");
        });

        pre.on("keyup",function(e){
            App.Resources.cancelBubble(e);
            var val = pre.val(),test, count = 5,str = '',index,arr = [],unResult = "<li>��������ƥ����</li>";  //��ʾ5��
            list.html("");
            val = val.replace(/\s+/,'');
            if(!val){list.hide();return}
            val = val.replace(/\u3002+/,'.');
            //��ֹ��������֣���Ǿ�����
            test = /[^\d\.]+/.test(val);
            if(test){
                list.html(unResult);
                return;
            }

            str = val;
            var x = str.length%3;
            if(x ==0){
                if(_.last(str) != "."){ list.html(unResult);return}
                str = _.initial(str);
                str = str.join('');
                index = _.indexOf(ac,str,true);
            }else if(x == 1){
                for(var s = 0 ; s< 9 ; s++){
                    var sd = str + s + '';
                    index = _.indexOf(ac,sd);
                    if(index >= 0){
                        break
                    }
                }
            }else{
                index = _.indexOf(ac,str,true);
            }

            if(index < 0 ){
                list.html(unResult);
                return
            }
            for(var j = index  ;  j < App.Resources.artifactsTreeData.length  ; j++){
                if(App.Resources.artifactsTreeData[j].length <= val.length ||  j - index  + 1 >count) {
                    break
                }
                var newRule = new App.ResourceArtifacts.newCode(App.Resources.artifactsTreeData[j]);
                list.append(new App.Resources.ArtifactsRuleLegend({model:newRule}).render().el);
            }
        });
    },

    //У��ģ��
    check:function(){
        var vals = this.$(".categoryCode");
        if(!vals.val()){
            vals.focus();
            this.redAlert(vals)
        }
        return false;
    },
    //��ʼ������
    window:function(frame){
        App.Resources.ArtifactsMaskWindow = new App.Comm.modules.Dialog({
            title:"ѡ��������",
            width:600,
            height:500,
            isConfirm:false,
            isAlert:false,
            closeCallback:function(){
                App.Resources.ArtifactsMaskWindow.close();
            },
            message:frame
        });
    },
    //��ɫ��ʾ����
    redAlert:function(ele){
        ele.addClass("alert");
    },

    //��Ϊ���ݸ�ʽ���µı������ݵ�ģ�͵Ķ�������
    saveDataToModel:function(title,data){
        var con = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
        con[title] =  typeof data == "number" ? data + '' : data;
        App.ResourceArtifacts.presentRule.model.set({"mappingCategory":con});
        App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");//�ػ�ģ��
    },
    //��Ϊ���ݸ�ʽ���µı������鵽ģ�͵Ķ�������
    saveArrayToModel:function(id,title,data){
        var con = App.ResourceArtifacts.presentRule.model.get("mappingCategory");
        var arr = con.mappingPropertyList;
        for(var i = 0 ;i < arr.length ; i++){
            if(arr[i].id == id){
                arr[i][title] =data;
            }
        }
        con.mappingPropertyList = arr;
        App.ResourceArtifacts.presentRule.model.set({"mappingCategory":con});
        App.ResourceArtifacts.presentRule.model.trigger("mappingCategoryChange");//�ػ�ģ��
    }
});