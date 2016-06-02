/**
  * @require /libsH5/js/bimView.js
*/
'use strict'
;(function($){
  bimView.API = {
    baseUrl:"http://bim.wanda-dev.cn/",
    //模型
    fetchModel: "model/",//获取模型信息
    fetchFamilyType:'/model/{etag}/metadata/familyInfo.json',
    fetchFloorsMap: 'view/{etag}/{sourceId}/miniature/map', //获取模型楼层信息
    fetchAxisGrid: 'model/{etag}/metadata/gridAndLevel.json', //获取楼层地图,轴网信息
    // 构件树
    fetchFloors: "view/{etag}/{sourceId}/floor", // 获取楼层
    fetchSpecialty: "view/{etag}/{sourceId}/specialty", // 获取楼层,专业信息
    fetchCategory: "view/{etag}/{sourceId}/categories", // 获取构件信息
    fetchCoding: 'view/category/coding/{etag}', //获取构件编码信息
    // 获取构件信息
    fetchComponentById:'sixD/{projectId}/{projectVersionId}/element?elementId={elementId}',
    fetchComponentByModelId:'sixD/{projectId}/{projectVersionId}/element?modelId={modelId}&classCode={classCode}&cateId={cateId}',
    //快照
    fetchModelViewpoint: 'sixD/{projectId}/viewPoint', // 获取快照列表
    fetacCanvasData: 'sixD/{projectId}/viewPoint/{viewPointId}/comment', // 获取批注信息
    createViewpointById: 'sixD/{projectId}/viewPoint', // 创建快照
    addViewpointImg: 'sixD/{projectId}/viewPoint/{viewPointId}/pic', // 添加快照图片
    addViewpointData: 'sixD/{projectId}/viewPoint/{viewPointId}/comment', // 添加几何数据
    editViewpointById: 'sixD/{projectId}/viewPoint/{viewPointId}', // 修改快照
    deleteViewpointById: 'sixD/{projectId}/viewPoint/{viewPointId}', // 删除快照
  }
})($);
