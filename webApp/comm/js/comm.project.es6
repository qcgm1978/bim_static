var CommProject={
    _$viewer:null,

    init(viewer){
       this._$viewer=viewer;
    },

    filter(params){
        var _cat=params.cat,
            _floors=params.floors,
            _specialFilterFiles=[],
            _extArray=[],
            _codeFlag=false,
            _hideCode=null;
        var _viewer=this._$viewer;
        if(_.isArray(_floors)){
            _floors=floor.join(',');
        }
        App.Comm.ajax({
            URLtype:"modelFilterRule",
            data:{
                token:123,
                sourceId: App.Project.Settings.DataModel.sourceId,
                etag: App.Project.Settings.DataModel.etag,
                projectId: App.Project.Settings.projectId,
                projectVersionId: App.Project.Settings.CurrentVersion.id,
                checkPointType:cat,
                floor:floor
            }
        }).done(function(res){
            if(res.code==0 && res.data){

                App.Project.recoverySilder();

                var _t=res.data.code;
                _specialFilterFiles=res.data.file;
                _extArray=res.data.specCode;
                _hideCode=_t.code;
                _codeFlag=_t.visible;
                floor=_.pluck(res.data.floor, 'floor');
            }
            _this.linkSilder('floors', floor);
            _this.linkSilderSpecial('specialty', _specialFilterFiles,_extArray);
            if(_hideCode && _hideCode.length ){
                App.Project.Settings.Viewer.filter({
                    ids: _this.filterHideCode(_hideCode,_codeFlag),
                    type: "classCode"
                })
            }

            if(callback && _.isFunction(callback)){
                callback(res.data.margin,res.data.ratio);
            }
        })
    }
}