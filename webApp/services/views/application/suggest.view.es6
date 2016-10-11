App.Services.SuggestView=function(){

    var tpl=_.templateUrl('/services/tpls/application/suggest.view.html', true);

    var opts = {
        title: "建议反馈",
        width: 601,
        isConfirm: false,
        isAlert: true,
        message: tpl,
        okCallback: () => {
            return false;
        }
    }

    new App.Comm.modules.Dialog(opts);

}