App.ResourceArtifacts={
    Settings: {

    },
    PlanNode : new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>������</li>');
            }
        }
    })),

//�������ģ�͵�����������ʼ��ģ��
    PlanRules : Backbone.Model.extend({
            defaults:function(){
                return{

                }
            },
        urlType: "",
        parse: function(responese) {
            /*if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>������</li>');
            }*/
        }
    }),

    ArtifactsRule:new(Backbone.Collection.extend({
        model:Backbone.Model.extend({
            defaults:function(){
                return{

                }
            }
        }),
        urlType: "",
        parse: function(responese) {

            if (responese.code == 0 && responese.data.length > 0) {
                return responese.data;
            } else {
                $().html('<li>������</li>');
            }
        }
    })),




    init:function(){
        //����˵�
        //����ƻ��ڵ�
        //����Ĭ��Ϊ�յĹ����б�
    }

};