/**
  * @require /libsH5/js/libs/three.js
  * @require /libsH5/js/libs/WebViewer.js
*/
var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};
CLOUD.Extensions.Utils = CLOUD.Extensions.Utils || {};

CLOUD.Extensions.Utils.Geometric = {

    isInsideBounds: function (x, y, bounds) {

        return x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height;
    },
    getAngleBetweenPoints: function (p1, p2) {

        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    },
    // 判断是否同一个点
    isEqualBetweenPoints: function (p1, p2, epsilon) {

        epsilon = epsilon || 0.0001;

        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > epsilon) {
            return false;
        }

        return true;
    }
};

var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};
CLOUD.Extensions.Utils = CLOUD.Extensions.Utils || {};

CLOUD.Extensions.Utils.Shape2D = {
    createSvgElement: function(type) {

        var xmlns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(xmlns, type);
        svg.setAttribute('pointer-events', 'inherit');

        return svg;
    },
    makeSVG:function(){
        var xmlns = "http://www.w3.org/2000/svg";
        var xlinkns = "http://www.w3.org/1999/xlink";
        var attrMap = {
            "className": "class",
            "svgHref": "href"
        };
        var nsMap = {
            "svgHref": xlinkns
        };

        return function (tag, attributes) {

            var elem = document.createElementNS(xmlns, tag);

            for (var attribute in attributes) {

                var name = (attribute in attrMap ? attrMap[attribute] : attribute);
                var value = attributes[attribute];

                if (attribute in nsMap)
                    elem.setAttributeNS(nsMap[attribute], name, value);
                else
                    elem.setAttribute(name, value);
            }

            return elem;
        }
    }(),
    createPin: function(fillColor, strokeColor, offset) {

        //var path = "m21.13861,6.59583c0.12562,-0.43852 0.13677,-1.15678 0.0254,-1.59779l-0.36852,-1.45603c-0.11135,-0.441 -0.60654,-0.86506 -1.10105,-0.94223l-3.39636,-0.52882c-0.49415,-0.07717 -1.30358,-0.07465 -1.79704,0.00563l-3.67894,0.59721c-0.49451,0.08029 -1.30357,0.08844 -1.79981,0.01882l-3.59961,-0.50564c0.00452,0.01568 0.01253,0.0295 0.01636,0.04519l2.46376,10.55033l1.1275,0.17563c0.49449,0.07718 1.30286,0.07403 1.79737,-0.00562l3.67789,-0.59784c0.49346,-0.07966 1.30358,-0.08781 1.79982,-0.0182l3.94932,0.5552c0.49624,0.06961 0.8265,-0.23653 0.736,-0.68191l-0.44228,-2.15799c-0.09118,-0.44479 -0.06301,-1.16683 0.06193,-1.60535l0.52826,-1.85059l0,0zm-17.67267,-4.82849c-0.49379,0.09408 -0.80942,0.52881 -0.70537,0.97296l5.25743,22.51152l1.86349,0l-5.33469,-22.84839c-0.10579,-0.44604 -0.58845,-0.73021 -1.08086,-0.63609l0,0z";
        var path = "M0 0 L0 -25 L20 -16 L4 -8.8 L4 0Z";

        var shape = this.makeSVG("path", {
            x: "0",
            y: "0",
            d: path,
            fill: fillColor,
            stroke: strokeColor,
            "stroke-width": "2"
        });

        shape.setAttribute('transform', 'translate(0, 32)');

        // 以图形左下角点为基准，则需要移动元素，移动偏移量
        offset.offsetX = 0;
        offset.offsetY = -32;

        return shape;

    },
    createBubble: function(fillColor, strokeColor, offset){

        var path = "m-3.74999,-31.25c-6.35107,0 -11.50001,4.06299 -11.50001,9.07458c0,5.0128 11.50001,21.9254 11.50001,21.9254s11.50001,-16.9126 11.50001,-21.9254c0,-5.01159 -5.1474,-9.07458 -11.50001,-9.07458z";
        var shape = this.makeSVG("path", {
            x: "0",
            y: "0",
            d: path,
            fill: fillColor,
            stroke: strokeColor,
            "stroke-width": "2"
        });

        shape.setAttribute('transform', 'translate(16, 32)');

        offset.offsetX = -16;
        offset.offsetY = -32;

        return shape;
    },
    createArrow:function(){

    },
    createRectangle:function(){

    },
    createCircle:function(){

    },
    createCloud:function(){

    },
    createFreeHand:function(){

    },
    composeRGBAString: function (hexRGBString, opacity) {

        if (opacity <= 0) {
            return 'none';
        }

        var rgba = ['rgba(' +
        parseInt('0x' + hexRGBString.substr(1, 2)), ',',
            parseInt('0x' + hexRGBString.substr(3, 2)), ',',
            parseInt('0x' + hexRGBString.substr(5, 2)), ',', opacity, ')'].join('');

        return rgba;
    }
};

CLOUD.AxisGrid = function (viewer) {

    this.viewer = viewer;
    this.fillColor = 0xff0000;
    this.lineWidth = 2;
    this.isDashedLine = false;
    this.axisGroup = new THREE.Group();
    this.scene = null;
};

CLOUD.AxisGrid.prototype = {
    constructor: CLOUD.AxisGrid,
    initGrid: function (grids, elevation) {

        var len = grids.length;

        if (len < 1) {
            return;
        }

        var color = this.fillColor;
        var linewidth = this.lineWidth;
        var axisGroup = this.axisGroup;
        var fontParameters = {
            size: 8,
            height: 1,
            curveSegments: 2,
            font: "helvetiker"
        };

        var fontSizeScalar = 100;
        var innerRadius = 1000, outerRadius = 1100;
        var materialGrid;
        var meshMaterial = new THREE.MeshBasicMaterial({color: color, overdraw: 0.0/*, side: THREE.DoubleSide*/});
        var geometryGrid = new THREE.Geometry();

        for (var i = 0; i < len; i++) {

            var name = grids[i].name;
            var start = new THREE.Vector3(grids[i].start.X, grids[i].start.Y, elevation);
            var end = new THREE.Vector3(grids[i].end.X, grids[i].end.Y, elevation);

            // --------------- 网格顶点 --------------- //
            geometryGrid.vertices.push(start.clone(), end.clone());

            // --------------- 文字包围圆 --------------- //
            var dir = new THREE.Vector3();
            dir.subVectors(end, start);
            dir.normalize();
            dir.multiplyScalar(outerRadius);

            var textStart = start.clone().sub(dir); // 开始点延伸
            var textEnd = end.clone().add(dir); // 终点延伸

            var geometryRing = new THREE.RingGeometry(innerRadius, outerRadius);
            var meshS = new THREE.Mesh(geometryRing, meshMaterial);
            //meshS.name = "ring-left-" + name;
            meshS.translateX(textStart.x);
            meshS.translateY(textStart.y);
            meshS.translateZ(elevation);

            var meshE = new THREE.Mesh(geometryRing, meshMaterial);
            //meshE.name = "ring-right-" + name;
            meshE.translateX(textEnd.x);
            meshE.translateY(textEnd.y);
            meshE.translateZ(elevation);

            // 加入到容器
            axisGroup.add(meshS);
            axisGroup.add(meshE);

            // --------------- 文字 --------------- //
            var textGeo = new THREE.TextGeometry(grids[i].name, fontParameters);

            for (var j = 0, size = textGeo.vertices.length; j < size; j++) {
                textGeo.vertices[j].multiplyScalar(fontSizeScalar);
            }

            textGeo.computeBoundingBox();
            var centerOffsetX = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
            var centerOffsetY = -0.5 * ( textGeo.boundingBox.max.y - textGeo.boundingBox.min.y );

            var startMesh = new THREE.Mesh(textGeo, meshMaterial);
            startMesh.name = name;
            startMesh.position.x = textStart.x + centerOffsetX;
            startMesh.position.y = textStart.y + centerOffsetY;
            startMesh.position.z = elevation;

            var endMesh = new THREE.Mesh(textGeo, meshMaterial);
            endMesh.name = name;
            endMesh.position.x = textEnd.x + centerOffsetX;
            endMesh.position.y = textEnd.y + centerOffsetY;
            endMesh.position.z = elevation;

            axisGroup.add(startMesh);
            axisGroup.add(endMesh);
        }

        if (this.isDashedLine) {
            geometryGrid.computeLineDistances();
            var dashSize = geometryGrid.lineDistances[1] - geometryGrid.lineDistances[0];
            dashSize *= 0.02;
            var gapSize = dashSize * 0.5;
            materialGrid = new THREE.LineDashedMaterial({
                color: color,
                dashSize: dashSize,
                gapSize: gapSize,
                linewidth: linewidth
            });
        } else {
            materialGrid = new THREE.LineBasicMaterial({
                color: color,
                linewidth: linewidth
            });
        }

        // --------------- 网格 --------------- //

        geometryGrid.computeBoundingBox();

        var grids = new THREE.LineSegments(geometryGrid, materialGrid);

        grids.name = "grids";
        axisGroup.add(grids);
    },

    setScene: function(scene) {
        this.scene = scene;
    },

    getDefaultScene : function() {
        var scene = this.viewer.getScene();
        var rootNode = scene.rootNode;
        rootNode.updateMatrixWorld(true);
        rootNode.matrixAutoUpdate = false;

        return rootNode;
    },

    getWorldBoundingBox: function () {
        //var box = new THREE.Box3();
        //var rootNode = this.getRootNode();
        //
        //if (rootNode.boundingBox) {
        //    box.copy(rootNode.boundingBox);
        //    box.applyMatrix4(rootNode.matrix);
        //
        //    return box;
        //}

        return null;
    },

    addToScene: function () {
        //var scene = this.viewer.getScene();
        //var rootNode = scene.rootNode;
        //rootNode.updateMatrixWorld(true);
        //rootNode.matrixAutoUpdate = false;

        if (!this.scene) {
            var rootNode = this.getDefaultScene();
            rootNode.add(this.axisGroup);
        } else {
            this.scene.add(this.axisGroup);
        }

    },
    removeFromScene: function () {

        if (!this.scene) {
            var rootNode = this.getDefaultScene();
            rootNode.remove(this.axisGroup);
        } else {
            this.scene.remove(this.axisGroup);
        }

    },
    setVisibility: function (visible) {
        if (this.axisGroup.visible != visible) {
            this.axisGroup.visible = visible;
            this.refresh();
        }
    },
    /**
     * @brief 更新轴网
     */
    refresh: function () {
        this.viewer.render(); // 刷新
    },
    clearData: function () {
        //var start, end, elapse;
        //start = Date.now();
        //for (var i = 0, len = this.axisGroup.children.length; i < len; i++) {
        //    this.axisGroup.children[i] = null;
        //}
        //
        //end = Date.now();
        //elapse = end - start;
        //
        //console.log("clearData elapsed time:" + elapse);

        this.axisGroup.children = [];
    },
    setDataFromJsonString: function (jsonStr, level) {
        var jsonObj = JSON.parse(jsonStr);
        this.setDataFromJsonObject(jsonObj, level);
    },
    setDataFromJsonObject: function (jsonObj, level) {
        if (level) {
            this.setDataByLevel(jsonObj.Grids, jsonObj.Levels, level);
        } else {
            this.setData(jsonObj.Grids, jsonObj.Levels);
        }
    },
    setDataByLevel: function (grids, levels, level) {
        if (level > levels.length) {
            level = levels.length - 1;
        } else if (level < 0) {
            level = 0;
        }

        this.setDataByElev(grids, levels[level].elevation);
    },
    setDataByElev:function(grids, elev) {
        this.clearData();
        this.initGrid(grids, elev);
        this.addToScene();
    },
    setData: function (grids, levels) {
        this.clearData();

        for (var i = 0, len = levels.length; i < len; i++) {
            this.initGrid(grids, levels[i].elevation);
            this.addToScene();
        }
    }
};
CLOUD.MiniMap = function (viewer, callback) {

    this.viewer = viewer;
    this.callbackFn = callback;
    this.visible = true;
    this.width = 0;
    this.height = 0;
    this.domContainer = null;
    this.autoClear = true;

    this.mouseButtons = {LEFT: THREE.MOUSE.LEFT, RIGHT: THREE.MOUSE.RIGHT};

    var scope = this;
    var _mapContainer;
    var normalizedMouse = new THREE.Vector2();

    var _clearColor = new THREE.Color(), _clearAlpha = 1;
    var _defaultClearColor = 0x333333;//0xffffff; // 0xadadad; // 缺省背景色
    var _materialColor = 0x999999;

    var _xmlns = "http://www.w3.org/2000/svg";
    var _svg = document.createElementNS(_xmlns, 'svg');
    var _svgGroupForAxisGrid = document.createElementNS(_xmlns, "g");
    var _svgPathPool = [], _svgLinePool = [], _svgTextPool = [], _svgImagePool = [],_svgCirclePool = [],
        _pathCount = 0, _lineCount = 0, _textCount = 0, _imageCount = 0, _circleCount = 0, _quality = 1;
    var _svgNode, _svgWidth, _svgHeight, _svgHalfWidth, _svgHalfHeight;

    var _clipBox2D = new THREE.Box2(), _elemBox2D = new THREE.Box2(), _axisGridBox2D = new THREE.Box2();

    var _axisGridElements = [], _axisGridIntersectionPoints = [], _axisGridLevels = [];
    var _axisGridNumberCircleRadius = 10, _axisGridNumberFontSize = 8, _axisGridNumberInterval = 3; // 轴号间隔
    var _isShowAxisGridNumber = true, _isShowAxisGrid = false, _isInitializedAxisGrid = false, _isInitializedFloorPlane = false;

    var _enableMouseEvent = true;

    var _tipNode, _circleNode, _highlightHorizLineNode, _highlightVerticalLineNode, _cameraNode, _cameraArrowNode;
    var _highlightColor = '#258ae3', _tipNodeColor = "#000", _tipNodeBackgroundColor = "#fff";
    var _highlightLineWidth = 1, _circleNodeRadius = 3;
    var _hasHighlightInterPoint = false;

    var _floorPlaneMinZ = 0; // 平面图最小高度
    var _cameraProjectedPosZ = 0; // 相机投影点位置高度
    var _floorPlaneBox, _floorPlaneUrl;

    var _enableShowCamera = true;
    var _lastCameraWorldPosition;
    var _isFlyToPoint = false;
    var _epsilon = 0.00001;

    // ------------- 这些算法可以独立成单独文件 S ------------- //

    function cross(p1, p2, p3, p4) {
        return (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    }

    // 获得三角形面积(S = |AB * AC|)
    function getArea(p1, p2, p3) {
        return cross(p1, p2, p1, p3);
    }

    // 获得三角形面积
    function getAbsArea(p1, p2, p3) {
        return Math.abs(getArea(p1, p2, p3));
    }

    // 计算交点
    function getInterPoint(p1, p2, p3, p4) {

        var s1 = getAbsArea(p1, p2, p3);
        var s2 = getAbsArea(p1, p2, p4);
        var interPoint = new THREE.Vector2((p4.x * s1 + p3.x * s2) / (s1 + s2), (p4.y * s1 + p3.y * s2) / (s1 + s2));

        return interPoint;
    }

    //判断两向量角度是否大于180°，大于180°返回真，否则返回假
    function isAngleGreaterThanPi(start, end, up){

        // 根据混合积来判断角度
        var dir = new THREE.Vector3();
        dir.crossVectors(start, end);

        var volume = dir.dot(up);

        //dir 与 up 同向 - 小于 180°
        if (volume >= 0) {
            return false;
        }

        return true;
    }

    // ------------- 这些算法可以独立成单独文件 E ------------- //

    // 正规化坐标转屏幕坐标
    function normalizedPointToScreen(point) {

        point.x = point.x * _svgHalfWidth;
        point.y = -point.y * _svgHalfHeight;
    }

    // 屏幕坐标转正规化坐标
    function screenToNormalizedPoint(point) {

        point.x = point.x / _svgHalfWidth;
        point.y = -point.y / _svgHalfHeight;
    }

    // 正规化屏幕坐标转世界坐标
    function normalizedPointToWorld(point) {

        var boxSize = _axisGridBox2D.size();

        point.x = 0.5 * (point.x + 1) * boxSize.x + _axisGridBox2D.min.x;
        point.y = 0.5 * (point.y + 1) * boxSize.y + _axisGridBox2D.min.y;
    }

    // 世界坐标转正规化屏幕坐标 [-1, 1]
    function worldToNormalizedPoint(point) {

        var boxSize = _axisGridBox2D.size();

        point.x = (point.x - _axisGridBox2D.min.x) / boxSize.x * 2 - 1;
        point.y = (point.y - _axisGridBox2D.min.y) / boxSize.y * 2 - 1;
    }

    function loadStyleString(css) {

        var style = document.createElement("style");
        style.type = "text/css";

        try {
            style.appendChild(document.createTextNode(css));
        } catch (ex) {
            style.styleSheet.cssText = css;
        }

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(style);
    }

    function getImageNode(id) {

        if (_svgImagePool[id] == null) {
            _svgImagePool[id] = document.createElementNS(_xmlns, 'image');
            return _svgImagePool[id];
        }

        return _svgImagePool[id];
    }

    function getPathNode(id) {

        if (_svgPathPool[id] == null) {
            _svgPathPool[id] = document.createElementNS(_xmlns, 'path');

            if (_quality == 0) {
                _svgPathPool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
            }

            return _svgPathPool[id];
        }

        return _svgPathPool[id];
    }

    function getLineNode(id) {

        if (_svgLinePool[id] == null) {
            _svgLinePool[id] = document.createElementNS(_xmlns, 'line');

            if (_quality == 0) {
                _svgLinePool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
            }

            return _svgLinePool[id];
        }

        return _svgLinePool[id];
    }

    function getCircleNode(id) {

        if (_svgCirclePool[id] == null) {
            _svgCirclePool[id] = document.createElementNS(_xmlns, 'circle');

            if (_quality == 0) {
                _svgCirclePool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
            }

            return _svgCirclePool[id];
        }

        return _svgCirclePool[id];
    }

    function getTextNode(id) {

        if (_svgTextPool[id] == null) {
            _svgTextPool[id] = document.createElementNS(_xmlns, 'text');

            if (_quality == 0) {
                _svgTextPool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
            }

            return _svgTextPool[id];
        }

        return _svgTextPool[id];
    }

    // 绘制线条
    function renderLine(v1, v2, material) {

        _svgNode = getLineNode(_lineCount++);
        _svgNode.setAttribute('x1', v1.x);
        _svgNode.setAttribute('y1', v1.y);
        _svgNode.setAttribute('x2', v2.x);
        _svgNode.setAttribute('y2', v2.y);

        if (material instanceof THREE.LineBasicMaterial) {
            _svgNode.setAttribute('style', 'fill: none; stroke: ' + material.color.getStyle() + '; stroke-width: ' + material.linewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.linecap + '; stroke-linejoin: ' + material.linejoin);
            _svgGroupForAxisGrid.appendChild(_svgNode);
        }
    }

    // 绘制圆
    function renderCircle(cx, cy, material) {

        _svgNode = getCircleNode(_circleCount++);
        _svgNode.setAttribute('r', _axisGridNumberCircleRadius + '');
        _svgNode.setAttribute('transform', 'translate(' + cx + ',' + cy + ')');

        if (material instanceof THREE.LineBasicMaterial) {
            _svgNode.setAttribute('style', 'fill: none; stroke: ' + material.color.getStyle() + '; stroke-width: 1');
            _svgGroupForAxisGrid.appendChild(_svgNode);
        }
    }

    // 绘制文本
    function renderText(cx, cy, literal, material) {

        _svgNode = getTextNode(_textCount++);

        if (material instanceof THREE.LineBasicMaterial) {
            _svgNode.setAttribute('style', 'font-size:' +  _axisGridNumberFontSize + 'px; fill: none; stroke: ' + material.color.getStyle() + '; stroke-width: 1');
            _svgGroupForAxisGrid.appendChild(_svgNode);
        }

        _svgNode.innerHTML = literal;

        // 注意: 必须已加到document中才能求到getBoundingClientRect
        var box = _svgNode.getBoundingClientRect();
        var offsetX = cx - 0.5 * box.width;
        var offsetY = cy + 0.25 * box.height;

        _svgNode.setAttribute('transform', 'translate(' + offsetX + ',' + offsetY + ')');
    }

    // 绘制平面图
    function renderFloorPlan() {

        if (_isInitializedFloorPlane) {
            _svgNode = getImageNode(0);
            _svg.appendChild(_svgNode);
        }
    }

    // 绘制高亮提示
    function renderHighlightNode() {

        _svg.appendChild(_highlightHorizLineNode);
        _svg.appendChild(_highlightVerticalLineNode);
        _svg.appendChild(_circleNode);
    }

    // 绘制轴网
    function renderAxisGrid() {

        _svg.appendChild(_svgGroupForAxisGrid);

        for (var i = 0, len = _axisGridElements.length; i < len; i++) {
            var lineElements = _axisGridElements[i];

            for (var j = 0, len2 = lineElements.length; j < len2; j++) {
                var element = lineElements[j];
                var v1 = element.v1.clone();
                var v2 = element.v2.clone();
                var material = element.material;

                _elemBox2D.makeEmpty();
                _elemBox2D.setFromPoints([v1, v2]);

                if (_clipBox2D.isIntersectionBox(_elemBox2D) === true) {
                    renderLine(v1, v2, material);

                    if (_isShowAxisGridNumber) {
                        if (j % _axisGridNumberInterval == 0) {
                            var dir = new THREE.Vector2();
                            dir.subVectors(v2, v1).normalize().multiplyScalar(_axisGridNumberCircleRadius);

                            var newV1 = v1.clone().sub(dir);
                            var newV2 = v2.clone().add(dir);

                            renderCircle(newV1.x, newV1.y, material);
                            renderCircle(newV2.x, newV2.y, material);

                            renderText(newV1.x, newV1.y, element.name, material);
                            renderText(newV2.x, newV2.y, element.name, material);
                        }
                    }
                }
            }
        }
    }

    // 设置容器元素style
    function setContainerElementStyle(container, styleOptions) {

        var defaultStyle = {
            position: "absolute",
            display: "block",
            left: "20px",
            bottom: "20px",
            outline: "#0000FF dotted thin"
            //opacity: ".6",
            //border: "red solid thin",
            //webkitTransition: "opacity .2s ease",
            //mozTransition: "opacity .2s ease",
            //msTransform: "opacity .2s ease",
            //oTransform: "opacity .2s ease",
            //transition: "opacity .2s ease"
        };

        styleOptions = styleOptions || defaultStyle;

        for (var attr in styleOptions) {
            //console.log(attr);
            container.style[attr] = styleOptions[attr];
        }

        //container.style.position = style.position;
        //container.style.display = style.display;
        //container.style.outline = style.outline;
        //container.style.left = style.left;
        //container.style.bottom = style.bottom;
    }

    function transformWorldPoint(point) {
        var sceneMatrix = scope.getMainSceneMatrix();
        point.applyMatrix4(sceneMatrix);
    }

    function calculateAxisGridBox() {

        var offset = 4;
        var isExistData = (_isInitializedAxisGrid || _isInitializedFloorPlane);

        if (_isShowAxisGridNumber && isExistData) {

            var center = _axisGridBox2D.center();
            var oldSize = _axisGridBox2D.size();
            var newSize = new THREE.Vector2();
            newSize.x = oldSize.x * _svgWidth / (_svgWidth - 4.0 * (_axisGridNumberCircleRadius + offset));
            newSize.y = oldSize.y * _svgHeight / (_svgHeight - 4.0 * (_axisGridNumberCircleRadius + offset));

            _axisGridBox2D.setFromCenterAndSize(center, newSize);
        }
    }

    this.enableMouseEvent = function(enable) {

        _enableMouseEvent = enable;
        //this.render();
    };

    this.isEnableMouseEvent = function() {
        return _enableMouseEvent;
    };

    this.isMouseOverCanvas = function (mouse) {

        var domElement = _mapContainer;

        if (domElement !== undefined) {
            var dim = CLOUD.DomUtil.getContainerOffsetToClient(domElement);
            var canvasMouse = new THREE.Vector2();

            // 计算鼠标点相对于所在视口的位置
            canvasMouse.x = mouse.x - dim.left;
            canvasMouse.y = mouse.y - dim.top;

            // 规范化坐标系[-1, 1]
            if (canvasMouse.x > 0 && canvasMouse.x < this.width && canvasMouse.y > 0 && canvasMouse.y < this.height) {
                normalizedMouse.x = canvasMouse.x / this.width * 2 - 1;
                normalizedMouse.y = -canvasMouse.y / this.height * 2 + 1;

                return true;
            }
        }

        return false;
    };

    this.mouseDown = function (event, callback) {

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);

        //if (!_enableMouseEvent) return isOverCanvas;

        if (isOverCanvas) {
            callback();
        }

        return isOverCanvas;
    };

    this.mouseMove = function (event, callback) {

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);

        //if (!_enableMouseEvent) return isOverCanvas;

        if (isOverCanvas && _isShowAxisGrid) {

            this.dealHighlightNode();

            if (_hasHighlightInterPoint) {
                this.showTip();
            } else {
                this.hideTip();
            }

            callback();

        } else {
            //this.hideTip();
            //callback();
            _hasHighlightInterPoint = false;
        }

        return isOverCanvas;
    };

    this.mouseUp = function (event, callback) {

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);
        var isExistData = _isInitializedAxisGrid || _isInitializedFloorPlane;

        if (!_enableMouseEvent) return isOverCanvas;

        if (isOverCanvas && isExistData && event.target.nodeName!= "LI" ) {

            // 计算选中点的坐标
            var clickPoint = new THREE.Vector3();
            var clickPoint2D = normalizedMouse.clone();
            normalizedPointToWorld(clickPoint2D);

            // 如果靠近交点，使用交点会更好，不然感觉靠近交点高亮时，点击的位置不一致。
            var screenPosition = normalizedMouse.clone();
            normalizedPointToScreen(screenPosition);

            // 获得最近的交点
            var intersection = this.computeMinDistanceIntersection(screenPosition);

            if (intersection) {
                // 计算轴信息
                var interPoint = new THREE.Vector2(intersection.intersectionPoint.x, intersection.intersectionPoint.y);
                var offset = screenPosition.sub(interPoint);

                if (offset.lengthSq() < _circleNodeRadius * _circleNodeRadius) {
                    var interScreenPoint = interPoint.clone();
                    screenToNormalizedPoint(interScreenPoint);
                    normalizedPointToWorld(interScreenPoint);
                    clickPoint.set(interScreenPoint.x, interScreenPoint.y, _cameraProjectedPosZ);
                } else {
                    clickPoint.set(clickPoint2D.x, clickPoint2D.y, _cameraProjectedPosZ);
                }
            } else {
                clickPoint.set(clickPoint2D.x, clickPoint2D.y, _cameraProjectedPosZ);
            }

            transformWorldPoint(clickPoint);

            callback(clickPoint);
        }

        return isOverCanvas;
    };

    this.init = function (domContainer, width, height, styleOptions, alpha) {

        width = width || 320;
        height = height || 240;
        alpha = alpha || 0;

        // 初始化绘图面板
        this.initCanvasContainer(domContainer, styleOptions);
        // 初始化提示节点
        this.initTipNode();
        this.initCameraNode();
        // 设置绘图面板大小
        this.setSize(width, height);
        // 设置绘图面板背景色
        this.setClearColor(_defaultClearColor, alpha);
        this.clear();
    };

    this.setSize = function (width, height) {

        if (_mapContainer) {
            this.width = width;
            this.height = height;

            _mapContainer.style.width = width + "px";
            _mapContainer.style.height = height + "px";

            _svgWidth = width;
            _svgHeight = height;
            _svgHalfWidth = _svgWidth / 2;
            _svgHalfHeight = _svgHeight / 2;

            _svg.setAttribute('viewBox', ( -_svgHalfWidth ) + ' ' + ( -_svgHalfHeight ) + ' ' + _svgWidth + ' ' + _svgHeight);
            _svg.setAttribute('width', _svgWidth);
            _svg.setAttribute('height', _svgHeight);

            _clipBox2D.min.set(-_svgHalfWidth, -_svgHalfHeight);
            _clipBox2D.max.set(_svgHalfWidth, _svgHalfHeight);

            // redo init ???
            //this.initAxisGird();
            //this.initFloorPlane()
        }
    };

    this.setClearColor = function (color, alpha) {

        _clearColor.set(color);
        _clearAlpha = alpha !== undefined ? alpha : 1;
    };

    this.clear = function () {

        _pathCount = 0;
        _lineCount = 0;
        _textCount = 0;
        _imageCount = 0;
        _circleCount = 0;

        while (_svg.childNodes.length > 0) {

            while (_svg.childNodes[0] > 0) {
                _svg.childNodes[0].removeChild(_svg.childNodes[0].childNodes[0]);
            }

            _svg.removeChild(_svg.childNodes[0]);
        }

        _svg.style.backgroundColor = 'rgba(' + ( ( _clearColor.r * 255 ) | 0 ) + ',' + ( ( _clearColor.g * 255 ) | 0 ) + ',' + ( ( _clearColor.b * 255 ) | 0 ) + ',' + _clearAlpha + ')';
    };

    this.render = function () {

        if (!_isInitializedAxisGrid) return;

        if (this.autoClear) this.clear();

        if (!this.visible) return;

        renderFloorPlan();

        if (_isShowAxisGrid) {
            renderAxisGrid();
            renderHighlightNode();
        }

        this.calculateCameraPosition();

        if (_enableShowCamera) {
            _svg.appendChild(_cameraNode);
        }

    };

    this.getMainSceneMatrix = function () {
        var mainScene = this.viewer.getScene();
        var rootNode = mainScene.rootNode;
        //rootNode.updateMatrixWorld(true);
        //rootNode.updateMatrix();
        //rootNode.matrixAutoUpdate = false;

        return rootNode.matrix.clone();
    };

    this.containsPointInMainScene = function(point) {
        var mainScene = this.viewer.getScene();

        if (mainScene.rootNode.boundingBox) {
            return mainScene.rootNode.boundingBox.containsPoint(point);
        }

        return false;
    };

    this.initCanvasContainer = function (domContainer, styleOptions) {

        this.domContainer = domContainer;

        if (!_mapContainer) {
            _mapContainer = document.createElement("div");
            setContainerElementStyle(_mapContainer, styleOptions);
            domContainer.appendChild(_mapContainer);
            _mapContainer.appendChild(_svg);
        }
    };

    this.initCameraNode = function () {

        if (!_cameraNode) {
            //_cameraNode = document.createElementNS(_xmlns, 'path');
            //_cameraNode.setAttribute('d', 'M-2,-4 L6,0 L-2,4 L0,0 L-2,-4');
            //_cameraNode.setAttribute('fill', '#1b8cef');
            //_cameraNode.setAttribute('stroke', "#cbd7e1");
            //_cameraNode.setAttribute('stroke-width', '0.4');
            //_cameraNode.setAttribute('stroke-linejoin', "round");
            //_cameraNode.setAttribute('opacity', '0.0');

            _cameraNode = document.createElementNS (_xmlns, 'g');
            _cameraNode.setAttribute('fill', '#1b8cef');
            _cameraNode.setAttribute('stroke', '#cbd7e1');
            _cameraNode.setAttribute('stroke-width', '1');
            _cameraNode.setAttribute('stroke-linejoin', 'round');
            _cameraNode.setAttribute('opacity', '0.0');

            // 尺寸大小 直径 12px
            var circle = document.createElementNS (_xmlns, 'circle');
            circle.setAttribute('r', '6');

            var path = document.createElementNS (_xmlns, 'path');
            path.setAttribute('d', 'M 7 6 Q 10 0, 7 -6 L 19 0 Z');

            _cameraArrowNode = path;

            _cameraNode.appendChild (circle);
            _cameraNode.appendChild (path);
        }
    };

    this.initTipNode = function () {

        if (!_tipNode) {

            // 指示箭头样式
            var css = ".cloud-tip:after { " +
                "box-sizing: border-box;" +
                "display: inline;" +
                "font-size: 10px;" +
                "width: 100%;" +
                "line-height: 1;" +
                "color: " + _tipNodeBackgroundColor +  ";" +
                "content: '\\25BC';" +
                "position: absolute;" +
                "text-align: center;" +
                "margin: -2px 0 0 0;" +
                "top: 100%;" +
                "left: 0;" +
                "}";

            loadStyleString(css);

            _tipNode = document.createElement('div');
            _tipNode.className = "cloud-tip";
            _tipNode.style.position = "absolute";
            _tipNode.style.display = "block";
            _tipNode.style.background = _tipNodeBackgroundColor;
            _tipNode.style.color = _tipNodeColor;
            _tipNode.style.padding = "0 8px 0 8px";
            _tipNode.style.borderRadius = "2px";
            _tipNode.style.fontSize = "8px";
            //_tipNode.style.opacity = 0;

            _mapContainer.appendChild(_tipNode);
        }

        if (!_circleNode) {
            _circleNode = document.createElementNS(_xmlns, 'circle');
            _circleNode.setAttribute('r', _circleNodeRadius + '');
            _circleNode.setAttribute('fill', _highlightColor);
            _circleNode.style.opacity = 0;
        }

        if (!_highlightHorizLineNode) {
            _highlightHorizLineNode = document.createElementNS(_xmlns, 'line');
            _highlightHorizLineNode.setAttribute('style', 'stroke:' + _highlightColor + ';stroke-width:' + _highlightLineWidth + '');
            _highlightHorizLineNode.style.opacity = 0;
        }

        if (!_highlightVerticalLineNode) {
            _highlightVerticalLineNode = document.createElementNS(_xmlns, 'line');
            _highlightVerticalLineNode.setAttribute('style', 'stroke:' + _highlightColor + ';stroke-width:' + _highlightLineWidth + '');
            _highlightVerticalLineNode.style.opacity = 0;
        }
    };

    this.showTip = function () {

        if (_tipNode) {
            _tipNode.style.opacity = 1;
        }

        if (_circleNode) {
            _circleNode.style.opacity = 1;
        }

        if (_highlightHorizLineNode) {
            _highlightHorizLineNode.style.opacity = 1;
        }

        if (_highlightVerticalLineNode) {
            _highlightVerticalLineNode.style.opacity = 1;
        }
    };

    this.hideTip = function () {

        if (_tipNode) {
            _tipNode.style.opacity = 0;
        }

        if (_circleNode) {
            _circleNode.style.opacity = 0;
        }

        if (_highlightHorizLineNode) {
            _highlightHorizLineNode.style.opacity = 0;
        }

        if (_highlightVerticalLineNode) {
            _highlightVerticalLineNode.style.opacity = 0;
        }
    };

    this.generateAxisGrid = function() {

        var jsonObj = CLOUD.MiniMap.axisGridData;

        if (!jsonObj)  return;

        var grids = jsonObj.Grids;
        var levels = jsonObj.Levels;

        this.clearAxisGird();
        this.initAxisGird(grids);
        this.initAxisGirdLevels(levels);
        this.render();
    };

    this.clearAxisGird = function () {

        if (_axisGridElements.length > 0) {
            //_axisGridElements.splice(0,_axisGridElements.length);
            _axisGridElements = [];
        }

        if (_axisGridIntersectionPoints.length > 0) {
            _axisGridIntersectionPoints = [];
        }

        _axisGridBox2D.makeEmpty();
        _isInitializedAxisGrid = false;
    };

    this.initAxisGird = function (grids) {

        var len = grids.length;

        if (len < 1) return;

        var materialGrid = new THREE.LineBasicMaterial({
            color: _materialColor,
            linewidth: 0.5
        });

        var i = 0, j = 0;

        // 计算轴网包围盒
        for (i = 0; i < len; i++) {

            var start = new THREE.Vector2(grids[i].start.X, grids[i].start.Y);
            var end = new THREE.Vector2(grids[i].end.X, grids[i].end.Y);

            _axisGridBox2D.expandByPoint(start);
            _axisGridBox2D.expandByPoint(end);
        }

        calculateAxisGridBox();

        var horizLineElements = []; // 水平线集合
        var verticalLineElements = []; // 垂直线集合

        for (i = 0; i < len; i++) {

            var name = grids[i].name;
            var start = new THREE.Vector2(grids[i].start.X, grids[i].start.Y);
            var end = new THREE.Vector2(grids[i].end.X, grids[i].end.Y);

            worldToNormalizedPoint(start);
            normalizedPointToScreen(start);

            worldToNormalizedPoint(end);
            normalizedPointToScreen(end);

            var dir = end.clone().sub(start).normalize();

            if (Math.abs(dir.x) >= Math.abs(dir.y)) {
                // 水平方向线条
                horizLineElements.push({name: name, v1: start, v2: end, material: materialGrid});
            } else {
                // 垂直方向线条
                verticalLineElements.push({name: name, v1: start, v2: end, material: materialGrid});
            }
        }

        _axisGridElements.push(horizLineElements);
        _axisGridElements.push(verticalLineElements);

        // 计算交点
        var horizLineElementsLen = horizLineElements.length;
        var verticalLineElementsLen = verticalLineElements.length;
        var horizLine, verticalLine, numeralName, abcName;
        var p1, p2, p3, p4;

        for (i = 0; i < horizLineElementsLen; i++) {
            horizLine = horizLineElements[i];
            abcName = horizLine.name;
            p1 = horizLine.v1.clone();
            p2 = horizLine.v2.clone();

            for (j = 0; j < verticalLineElementsLen; j++) {
                verticalLine = verticalLineElements[j];
                numeralName = verticalLine.name;
                p3 = verticalLine.v1.clone();
                p4 = verticalLine.v2.clone();

                // 获得交点
                var interPoint = getInterPoint(p1, p2, p3, p4);
                _axisGridIntersectionPoints.push({
                    intersectionPoint: interPoint,
                    horizLine: [p1.clone(), p2.clone()],
                    verticalLine: [p3.clone(), p4.clone()],
                    abcName: abcName,
                    numeralName: numeralName
                });
            }
        }

        if (_isInitializedFloorPlane && !_isInitializedAxisGrid) {
            console.log("_isInitializedFloorPlane && !_isInitializedAxisGrid");
            this.initFloorPlane();
        }

        _isInitializedAxisGrid = true;
    };

    this.initAxisGirdLevels = function (levels) {
        //var len = levels.length;
        //
        //if (len < 1) {
        //    return;
        //}
        //
        //for (var i = 0; i < len; i++) {
        //    _axisGridLevels.push(levels[i]);
        //}
    };

    this.showAxisGird = function () {

        if (_isInitializedAxisGrid) {
            _isShowAxisGrid = true;
            //_svgGroupForAxisGrid.style.opacity = 1;
            _svgGroupForAxisGrid.style.display = "";

            if (_hasHighlightInterPoint) {
                this.showTip();
            }

            this.render();
        }
    };

    this.hideAxisGird = function () {

        if (_isInitializedAxisGrid) {
            _isShowAxisGrid = false;
            //_svgGroupForAxisGrid.style.opacity = 0;
            _svgGroupForAxisGrid.style.display = "none";

            this.hideTip();

            this.render();
        }
    };

    this.showAxisGridNumber = function(show) {
        _isShowAxisGridNumber = show;
    };

    this.getIntersectionByNormalizedPoint = function(normalizedPoint) {

        var intersection = null;
        var _circleRadiusToSquared = _circleNodeRadius * _circleNodeRadius;

        for (var i = 0, len = _axisGridIntersectionPoints.length; i < len; i++) {
            var interPoint = _axisGridIntersectionPoints[i].intersectionPoint;
            var point = new THREE.Vector2(normalizedPoint.x, normalizedPoint.y);
            normalizedPointToScreen(point);

            var distanceSquared = interPoint.distanceToSquared(point);

            if (distanceSquared < _circleRadiusToSquared) {
                intersection = _axisGridIntersectionPoints[i];
                break;
            }
        }

        return intersection;
    };

    this.getIntersectionByAxisGridNumber = function(abcName, numeralName) {

        var intersection = null;

        for (var i = 0, len = _axisGridIntersectionPoints.length; i < len; i++) {
            var abcNameTmp = _axisGridIntersectionPoints[i].abcName.toLowerCase();
            var numeralNameTmp = _axisGridIntersectionPoints[i].numeralName;

            if (abcNameTmp === abcName.toLowerCase() && numeralNameTmp === numeralName) {
                intersection = _axisGridIntersectionPoints[i];
                break;
            }
        }

        return intersection;
    };

    this.dealHighlightNode = function () {

        _hasHighlightInterPoint = false;

        var intersection = this.getIntersectionByNormalizedPoint(normalizedMouse);

        if (!intersection) return null;

        this.setHighlightNode(intersection);

        _hasHighlightInterPoint = true;

    };

    this.dealHighlightNodeByAxisGridNumber = function (abcName, numeralName) {

        _hasHighlightInterPoint = false;

        var intersection = this.getIntersectionByAxisGridNumber(abcName, numeralName);

        if (!intersection) return null;

        this.setHighlightNode(intersection);

        _hasHighlightInterPoint = true;

    };

    this.setHighlightNode = function(highlightNode) {

        // 高亮点的变换位置
        _circleNode.setAttribute('transform', 'translate(' + highlightNode.intersectionPoint.x + ',' + highlightNode.intersectionPoint.y + ')');

        // 提示文本
        _tipNode.innerHTML = highlightNode.numeralName + "-" + highlightNode.abcName;

        // 位置
        var box = _tipNode.getBoundingClientRect();

        _tipNode.style.left = (_svgHalfWidth + highlightNode.intersectionPoint.x - 0.5 * box.width) + "px";
        _tipNode.style.top = ( _svgHalfHeight + highlightNode.intersectionPoint.y - box.height - 12) + "px"; // 12 = fontsize(10px) + 2 * linewidth(1px)

        // 水平线条
        _highlightHorizLineNode.setAttribute('x1', highlightNode.horizLine[0].x);
        _highlightHorizLineNode.setAttribute('y1', highlightNode.horizLine[0].y);
        _highlightHorizLineNode.setAttribute('x2', highlightNode.horizLine[1].x);
        _highlightHorizLineNode.setAttribute('y2', highlightNode.horizLine[1].y);

        // 垂直线条
        _highlightVerticalLineNode.setAttribute('x1', highlightNode.verticalLine[0].x);
        _highlightVerticalLineNode.setAttribute('y1', highlightNode.verticalLine[0].y);
        _highlightVerticalLineNode.setAttribute('x2', highlightNode.verticalLine[1].x);
        _highlightVerticalLineNode.setAttribute('y2', highlightNode.verticalLine[1].y);
    };

    this.generateFloorPlane = function() {

        _isInitializedFloorPlane = false;

        var jsonObj = CLOUD.MiniMap.floorPlaneData;

        if (!jsonObj) return;

        var url = jsonObj["Path"] || jsonObj["path"];
        var boundingBox = jsonObj["BoundingBox"] || jsonObj["boundingBox"];

        if (!url || !boundingBox) {
            console.warn('floor-plan data is error!');
            return;
        }

        _isInitializedFloorPlane = true;

        _floorPlaneUrl = url;
        _floorPlaneBox = new THREE.Box3(new THREE.Vector3(boundingBox.Min.X, boundingBox.Min.Y, boundingBox.Min.Z), new THREE.Vector3(boundingBox.Max.X, boundingBox.Max.Y, boundingBox.Max.Z));

        // 设置相机投影点位置高度在平面图包围盒中心
        _cameraProjectedPosZ = 0.5 * (_floorPlaneBox.min.z + _floorPlaneBox.max.z);
        _floorPlaneMinZ = _floorPlaneBox.min.z;

        if (!_isInitializedAxisGrid) {
            console.warn('axis-grid is not initialized!');

            return;

            // 没有设置轴网，取自己的包围盒
            //_axisGridBox.copy(bBox2D);
            //
            //computeAxisGridBox();
        }

        this.initFloorPlane();

        this.fly();

        //this.render();
    };

    this.initFloorPlane = function () {

        var url = _floorPlaneUrl;
        // 平面图不需要使用Z坐标
        var bBox2D = new THREE.Box2(new THREE.Vector2(_floorPlaneBox.min.x, _floorPlaneBox.min.y), new THREE.Vector2(_floorPlaneBox.max.x, _floorPlaneBox.max.y));
        // 计算位置
        var axisGridBoxSize = _axisGridBox2D.size();
        var axisGridCenter = _axisGridBox2D.center();
        var boxSize = bBox2D.size();
        var boxCenter = bBox2D.center();
        var scaleX = _svgWidth / axisGridBoxSize.x;
        var scaleY = _svgHeight / axisGridBoxSize.y;
        var width = boxSize.x * scaleX;
        var height = boxSize.y * scaleY;
        var offset = boxCenter.clone().sub(axisGridCenter);

        offset.x *= scaleX;
        offset.y *= -scaleY;

        if (!_axisGridBox2D.containsBox(bBox2D)) {
            console.warn('the bounding-box of axis-grid is not contains the bounding-box of floor-plane!');
        }

        _svgNode = getImageNode(0);
        _svgNode.href.baseVal = url;
        _svgNode.setAttribute("id", "Floor-" + _imageCount);
        _svgNode.setAttribute("width", width + "");
        _svgNode.setAttribute("height", height + "");
        _svgNode.setAttribute("x", (-0.5 * width) + "");
        _svgNode.setAttribute("y", (-0.5 * height) + "");
        _svgNode.setAttribute("transform", 'translate(' + offset.x + ',' + offset.y + ')');

        // 切换楼层，置为true
        _isFlyToPoint = true;
    };

    this.getAxisGridInfoByPoint = function(point) {

        if (!_isInitializedFloorPlane) return null;

        var sceneMatrix = this.getMainSceneMatrix();

        var inverseMatrix = new THREE.Matrix4();
        inverseMatrix.getInverse(sceneMatrix);

        // 点对应的世界坐标
        var pointWorldPosition = point.clone();
        pointWorldPosition.applyMatrix4(inverseMatrix);

        //var projectedWorldPosition = new THREE.Vector3(pointWorldPosition.x, pointWorldPosition.y, _projectedCameraPosZ);

        // 屏幕坐标
        var screenPosition = pointWorldPosition.clone();
        worldToNormalizedPoint(screenPosition);
        normalizedPointToScreen(screenPosition);

        // 获得最近的轴网交点
        var intersection = this.computeMinDistanceIntersection(screenPosition);

        if (intersection) {
            // 计算轴信息
            var interPoint = new THREE.Vector2(intersection.intersectionPoint.x, intersection.intersectionPoint.y);
            screenToNormalizedPoint(interPoint);
            normalizedPointToWorld(interPoint);

            var offsetX = Math.round(pointWorldPosition.x - interPoint.x);
            var offsetY = Math.round(pointWorldPosition.y - interPoint.y);

            return {
                position: pointWorldPosition,
                abcName: intersection.abcName,
                numeralName: intersection.numeralName,
                offsetX: offsetX,
                offsetY: offsetY
            }
        }

        return null;
    };

    this.getAxisGridInfoByNormalizedPoint = function(normalizedPoint) {

        if (!_isInitializedFloorPlane) return null;

        // 世界坐标
        var pointWorldPosition = normalizedPoint.clone();
        screenToNormalizedPoint(pointWorldPosition);
        normalizedPointToWorld(pointWorldPosition);

        var screenPosition = normalizedPoint.clone();
        normalizedPointToScreen(screenPosition);

        // 获得最近的轴网交点
        var intersection = this.computeMinDistanceIntersection(screenPosition);

        if (intersection) {
            // 计算轴信息
            var interPoint = new THREE.Vector2(intersection.intersectionPoint.x, intersection.intersectionPoint.y);
            screenToNormalizedPoint(interPoint);
            normalizedPointToWorld(interPoint);

            var offsetX = Math.round(pointWorldPosition.x - interPoint.x);
            var offsetY = Math.round(pointWorldPosition.y - interPoint.y);

            return {
                position: pointWorldPosition,
                abcName: intersection.abcName,
                numeralName: intersection.numeralName,
                offsetX: offsetX,
                offsetY: offsetY
            }
        }

        return null;
    };

    this.calculateCameraPosition = function () {

        if (!_isInitializedFloorPlane) return;

        var camera = this.viewer.camera;
        var cameraEditor = this.viewer.cameraEditor;

        if (!camera || !cameraEditor) return;

        var cameraPosition = camera.position;
        var cameraTargetPosition = cameraEditor.target;
        var sceneMatrix = this.getMainSceneMatrix();

        //var box = bBox.clone();
        //box.applyMatrix4(sceneMatrix);
        //
        //if (!box.containsPoint(camera.position)) {
        //    return null;
        //}

        var inverseMatrix = new THREE.Matrix4();
        inverseMatrix.getInverse(sceneMatrix);

        var bBoxCenter = _floorPlaneBox.center();
        var pointA = new THREE.Vector3(_floorPlaneBox.min.x, _floorPlaneBox.min.y, bBoxCenter.z).applyMatrix4(sceneMatrix);
        var pointB = new THREE.Vector3(_floorPlaneBox.min.x, _floorPlaneBox.max.y, bBoxCenter.z).applyMatrix4(sceneMatrix);
        var pointC = new THREE.Vector3(_floorPlaneBox.max.x, _floorPlaneBox.min.y, bBoxCenter.z).applyMatrix4(sceneMatrix);

        var plane = new THREE.Plane();
        plane.setFromCoplanarPoints(pointA, pointB, pointC);

        // 计算相机投影
        var projectedCameraPosition = plane.projectPoint(cameraPosition);
        // 相机投影点世界坐标
        projectedCameraPosition.applyMatrix4(inverseMatrix);

        // 计算相机LookAt投影
        var projectedTargetPosition = plane.projectPoint(cameraTargetPosition);
        // 相机LookAt投影点世界坐标
        projectedTargetPosition.applyMatrix4(inverseMatrix);

        // 计算相机投影后的方向
        var projectedEye = projectedTargetPosition.clone().sub(projectedCameraPosition);
        projectedEye.z = 0;
        projectedEye.normalize();

        //var worldProjectedCameraPosition = new THREE.Vector3();
        //
        //if (_floorPlaneBox.containsPoint(projectedCameraPosition)) {
        //    worldProjectedCameraPosition.set(projectedCameraPosition.x, projectedCameraPosition.y, _projectedCameraPosZ);
        //} else {
        //    console.log("camera out");
        //    worldProjectedCameraPosition.set(bBoxCenter.x, bBoxCenter.y, _projectedCameraPosZ);
        //}

        // 计算相机世界位置
        var cameraWorldPosition = cameraPosition.clone();
        cameraWorldPosition.applyMatrix4(inverseMatrix);

        // 相机屏幕坐标
        var cameraScreenPosition = cameraWorldPosition.clone();
        worldToNormalizedPoint(cameraScreenPosition);
        normalizedPointToScreen(cameraScreenPosition);

        _cameraNode.setAttribute('opacity', '1.0');

        if (projectedEye.length() < _epsilon) {
            // 隐藏箭头方向
            _cameraArrowNode.setAttribute('opacity', '0.0');
            _cameraNode.setAttribute("transform", "translate(" + cameraScreenPosition.x + "," + cameraScreenPosition.y + ")");
        } else {
            // 计算角度
            var up = new THREE.Vector3(0, 0, 1);
            var axisX = new THREE.Vector3(1, 0, 0);
            var isGreaterThanPi = isAngleGreaterThanPi(axisX, projectedEye, up);

            // [0, PI]
            var angle = THREE.Math.radToDeg(axisX.angleTo(projectedEye));

            // 注意：svg顺时针时针为正
            if (!isGreaterThanPi) {
                angle *= -1;
            }

            _cameraArrowNode.setAttribute('opacity', '1.0');
            _cameraNode.setAttribute("transform", "translate(" + cameraScreenPosition.x + "," + cameraScreenPosition.y + ") rotate(" + angle + ")");
        }

        this.setCallbackCameraInfo(cameraWorldPosition, cameraScreenPosition);

        _lastCameraWorldPosition = cameraWorldPosition.clone();

        // 切换楼层时飞到指定点，切换楼层需设置 _isFlyToPoint状态
        //if (_isFlyToPoint) {
        //
        //    _isFlyToPoint = false;
        //
        //    var cameraProjectedWorldPosition = new THREE.Vector3(projectedCameraPosition.x, projectedCameraPosition.y, _cameraProjectedPosZ);
        //
        //    this.flyToPoint(cameraProjectedWorldPosition);
        //
        //    // 相机在平面图包围盒中心截面上的投影
        //    //var cameraProjectedWorldPosition = new THREE.Vector3(projectedCameraPosition.x, projectedCameraPosition.y, _cameraProjectedPosZ);
        //    //transformWorldPoint(cameraProjectedWorldPosition);
        //    //this.viewer.cameraEditor.flyToPointWithParallelEye(cameraProjectedWorldPosition);
        //}

        var cameraProjectedWorldPosition = new THREE.Vector3(projectedCameraPosition.x, projectedCameraPosition.y, _cameraProjectedPosZ);

        return {
            worldPosition: cameraWorldPosition,
            projectedWorldPosition : cameraProjectedWorldPosition,
            screenPosition : cameraScreenPosition
        }
    };

    this.fly = function() {

        var cameraPosition = this.calculateCameraPosition();
        var cameraProjectedWorldPosition = cameraPosition.projectedWorldPosition.clone();

        // 变换到缩放后的场景区域
        transformWorldPoint(cameraProjectedWorldPosition);
        this.viewer.cameraEditor.flyToPointWithParallelEye(cameraProjectedWorldPosition);
    };

    this.flyByAxisGridNumber = function(abcName, numeralName) {

        // 获得最近的交点
        var intersection = this.getIntersectionByAxisGridNumber(abcName, numeralName);

        if (intersection) {

            var interPoint = new THREE.Vector3(intersection.intersectionPoint.x, intersection.intersectionPoint.y, _cameraProjectedPosZ);

            screenToNormalizedPoint(interPoint);
            normalizedPointToWorld(interPoint);
            transformWorldPoint(interPoint);
            this.viewer.cameraEditor.flyToPointWithParallelEye(interPoint);
        }

    };

    // 返回相机信息
    this.setCallbackCameraInfo = function(worldPosition, screenPosition) {

        var posChanged = true;

        if (_lastCameraWorldPosition){
            posChanged = (worldPosition.distanceToSquared(_lastCameraWorldPosition) !== 0);
        }

        if (this.callbackFn && posChanged) {

            var cameraWorldPos = worldPosition.clone();

            // 获得离相机最近的交点
            var intersection = this.computeMinDistanceIntersection(screenPosition);

            if (intersection) {
                // 计算轴信息
                var interPoint = new THREE.Vector2(intersection.intersectionPoint.x, intersection.intersectionPoint.y);
                screenToNormalizedPoint(interPoint);
                normalizedPointToWorld(interPoint);

                var offsetX = Math.round(worldPosition.x - interPoint.x);
                var offsetY = Math.round(worldPosition.y - interPoint.y);
                var offsetZ = Math.round(worldPosition.z - _floorPlaneMinZ);
                var axisInfoX = "X(" + intersection.numeralName + "," + offsetX + ")";
                var axisInfoY = "Y(" + intersection.abcName + "," + offsetY + ")";
                var isInScene = true;

                var projectedWorldPosition = worldPosition.clone();
                projectedWorldPosition.setZ(_cameraProjectedPosZ);

                // 判断是否在场景包围盒里面
                if (!this.containsPointInMainScene(projectedWorldPosition)) {
                    isInScene = false;
                    axisInfoX = "";
                    axisInfoY = "";
                }

                var jsonObj = {
                    position: cameraWorldPos,
                    isInScene : isInScene,
                    axis: {
                        abcName: intersection.abcName,
                        numeralName: intersection.numeralName,
                        offsetX: offsetX,
                        offsetY: offsetY,
                        offsetZ: offsetZ,
                        infoX: axisInfoX,
                        infoY: axisInfoY
                    }
                };

                //console.log(jsonObj.axis.infoX + "" + jsonObj.axis.infoY);

                this.callbackFn(jsonObj);
            } else {
                this.callbackFn(null);
            }
        }
    };

    // 计算离相机最近的交点
    this.computeMinDistanceIntersection = function (screenPosition) {

        if (_axisGridIntersectionPoints.length < 1) return null;

        var minDistanceSquared = 0;
        var idx = 0;

        for (var i = 0, len = _axisGridIntersectionPoints.length; i < len; i++) {
            var interObj = _axisGridIntersectionPoints[i];
            var interPoint = new THREE.Vector2(interObj.intersectionPoint.x, interObj.intersectionPoint.y);
            var distanceSquared = interPoint.distanceToSquared(screenPosition);

            if (i == 0) {
                minDistanceSquared = distanceSquared;
            } else {
                if (minDistanceSquared > distanceSquared) {
                    minDistanceSquared = distanceSquared;
                    idx = i;
                }
            }
        }

        return _axisGridIntersectionPoints[idx];
    };

    this.enableCameraNode = function(enable) {

        _enableShowCamera = enable;
        //this.render();
    };

    this.removeMiniMap = function() {

        if (this.domContainer) {
            this.domContainer.removeChild(_mapContainer);
        }
    };

    this.appendMiniMap = function() {

        if (this.domContainer) {
            this.domContainer.appendChild(_mapContainer);
        }
    };

};

CLOUD.MiniMap.axisGridData = null;
CLOUD.MiniMap.floorPlaneData = null;

CLOUD.MiniMap.setAxisGridData = function(jsonObj){
    CLOUD.MiniMap.axisGridData = jsonObj;
};
CLOUD.MiniMap.setFloorPlaneData = function(jsonObj){
    CLOUD.MiniMap.floorPlaneData = jsonObj;
};


/**
 * 暂时用于处理检查点
 *
 */
CLOUD.Marker = function (id, editor) {

    this.id = id;
    this.editor = editor;
    this.worldPosition = new THREE.Vector3();
    this.worldBoundingBox = new THREE.Box3();
    this.clientPosition = new THREE.Vector2();
    this.size = new THREE.Vector2();
    this.selected = false;
    this.userId = "";
    this.borderColor = "#fffaff";
    this.svgShape = null;
    this.shapeTypes = {pin: 0, bubble: 1};
    this.state = 0;
    this.shapeOriOffset = {offsetX : 0, offsetY: 0}; // 屏幕坐标顶点在左上角
};

CLOUD.Marker.prototype = {
    constructor: CLOUD.Marker,
    onMouseDown: function () {

    },
    destroy:function() {
        this.setParent(null);
    },
    setUserId: function(id) {
        this.userId = id;
    },
    setParent: function (parent) {

        if (this.svgShape) {
            var element = this.svgShape;

            if(element.parentNode){
                element.parentNode.removeChild(element);
            }

            if(parent){
                parent.appendChild(element);
            }
        }
    },
    setWorldPosition: function (pos) {
        this.worldPosition.set(pos.x, pos.y, pos.z);
    },
    setClientPostion: function (pos) {
        this.clientPosition.set(pos.x, pos.y);
    },
    setWorldBoundingBox:function(box) {
        this.worldBoundingBox.copy(box);
    },
    getWorldBoundingBox: function(){
        return this.worldBoundingBox;
    },
    setState:function(state) {
      this.state = state;
    },
    setSize: function ( width, height) {
        this.size.set(width, height);
    },
    createPinShape: function(fillColor, strokeColor) {

        //var path = "m21.13861,6.59583c0.12562,-0.43852 0.13677,-1.15678 0.0254,-1.59779l-0.36852,-1.45603c-0.11135,-0.441 -0.60654,-0.86506 -1.10105,-0.94223l-3.39636,-0.52882c-0.49415,-0.07717 -1.30358,-0.07465 -1.79704,0.00563l-3.67894,0.59721c-0.49451,0.08029 -1.30357,0.08844 -1.79981,0.01882l-3.59961,-0.50564c0.00452,0.01568 0.01253,0.0295 0.01636,0.04519l2.46376,10.55033l1.1275,0.17563c0.49449,0.07718 1.30286,0.07403 1.79737,-0.00562l3.67789,-0.59784c0.49346,-0.07966 1.30358,-0.08781 1.79982,-0.0182l3.94932,0.5552c0.49624,0.06961 0.8265,-0.23653 0.736,-0.68191l-0.44228,-2.15799c-0.09118,-0.44479 -0.06301,-1.16683 0.06193,-1.60535l0.52826,-1.85059l0,0zm-17.67267,-4.82849c-0.49379,0.09408 -0.80942,0.52881 -0.70537,0.97296l5.25743,22.51152l1.86349,0l-5.33469,-22.84839c-0.10579,-0.44604 -0.58845,-0.73021 -1.08086,-0.63609l0,0z";
        var path = "M0 0 L0 -25 L20 -16 L4 -8.8 L4 0Z";

        var shape = this.editor.makeSVG("path", {
            x: "0",
            y: "0",
            d: path,
            fill: fillColor,
            stroke: strokeColor,
            "stroke-width": "2"
        });

        shape.setAttribute('transform', 'translate(0, 32)');

        // 以图形左下角点为基准，则需要移动元素，移动偏移量
        this.shapeOriOffset.offsetX = 0;
        this.shapeOriOffset.offsetY = -32;

        return shape;
    },
    createBubbleShape: function(fillColor, strokeColor) {

        //var path = "m12.25,0.75c-5.7988,0 -10.5,3.80087 -10.5,8.48913c0,4.6894 10.5,20.51087 10.5,20.51087s10.5,-15.82148 10.5,-20.51087c0,-4.68826 -4.6998,-8.48913 -10.5,-8.48913z";
        var path = "m-3.74999,-31.25c-6.35107,0 -11.50001,4.06299 -11.50001,9.07458c0,5.0128 11.50001,21.9254 11.50001,21.9254s11.50001,-16.9126 11.50001,-21.9254c0,-5.01159 -5.1474,-9.07458 -11.50001,-9.07458z";
        var shape = this.editor.makeSVG("path", {
            x: "0",
            y: "0",
            d: path,
            fill: fillColor,
            stroke: strokeColor,
            "stroke-width": "2"
        });

        shape.setAttribute('transform', 'translate(16, 32)');

        this.shapeOriOffset.offsetX = -16;
        this.shapeOriOffset.offsetY = -32;

        return shape;
    },
    createSVGShape: function (sharpData, svgContainer) {

        var svgElem = this.svgShape = this.editor.makeSVG("svg", {viewBox: "0 0 32 32", width: "32", height: "32"});
        svgElem.style.position = "absolute";
        svgElem.style.display = "block";

        //var group = this.makeSVG("g", {x: "0", y: "0", transform: "translate("+sharpData.left+", "+sharpData.top+")"});
        //var group = this.editor.makeSVG("g", {x: "0", y: "0"});

        var fillColor = sharpData.fillColor;
        var strokeColor = this.borderColor;

        var shape;
        if (sharpData.type === this.shapeTypes.pin) {
            shape = this.createPinShape(fillColor, strokeColor);
        }else {
            shape = this.createBubbleShape(fillColor, strokeColor);
        }

        //this.svgShape = shape;
        //group.appendChild(shape);

        svgElem.appendChild(shape);

        svgContainer.appendChild(svgElem);
    },
    updateTransformMatrix: function () {

    },

    updateStyle: function () {

        //this.svgShape.style.left = this.clientPosition.x - 15;
        //this.svgShape.style.top = this.clientPosition.y - 30;

        this.svgShape.style.left = this.clientPosition.x + this.shapeOriOffset.offsetX;
        this.svgShape.style.top = this.clientPosition.y + this.shapeOriOffset.offsetY;
    }
};

CLOUD.MarkerEditor = function (cameraEditor, scene, domElement) {
    "use strict";

    CLOUD.OrbitEditor.call(this, cameraEditor, scene, domElement);

    this.markers = [];

    //this.selectedMarker = null;
    //this.bounds = {x: 0, y: 0, width: 0, height: 0};

    // 隐患待整改：红色
    // 隐患已整改：黄色
    // 隐患已关闭：绿色
    // size: 22 * 27
    this.pinColorSelector = {red: "#ff2129", green: "#85af03", yellow:"#fe9829"};
    // 有隐患：红色
    // 无隐患：绿色
    // 过程验收点、开业验收点的未检出：灰色
    this.bubbleColorSelector = {red: "#f92a24", green: "#86b507", gray:"#fffaff"};
    this.markerType = 0;
    this.markerColor = this.pinColorSelector.red;
    this.markerState = 0;
    this.isEditing = false;
};

CLOUD.MarkerEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.MarkerEditor.prototype.constructor = CLOUD.MarkerEditor;

CLOUD.MarkerEditor.prototype.init = function() {

    //if (!this.svg) {
    //    this.svg = this.createSvgElement('svg');
    //    this.svg.style.position = "absolute";
    //    this.svg.style.display = "block";
    //
    //    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    //
    //    var svgContainer = document.body;
    //    //var rect = svgContainer.getBoundingClientRect();
    //
    //    var svgWidth = dim.width;
    //    var svgHeight = dim.height;
    //    this.svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
    //    this.svg.setAttribute('width', svgWidth);
    //    this.svg.setAttribute('height', svgHeight);
    //
    //    svgContainer.appendChild(this.svg);
    //}
};

CLOUD.MarkerEditor.prototype.uninit = function() {

    this.clear();

    //if (!this.svg) return;
    //
    //var svg = this.svg;
    //
    //if (svg.parentNode) {
    //    svg.parentNode.removeChild(svg);
    //}
    //
    //this.svgGroup = null;
    //this.svg = null;
};

CLOUD.MarkerEditor.prototype.onExistEditor = function () {

    this.uninit();
};

CLOUD.MarkerEditor.prototype.onMouseUp = function(event) {
    var cameraEditor = this.cameraEditor;

    if (cameraEditor.enabled === false)
        return;

    event.preventDefault();

    if (this.oldMouseX == event.clientX && this.oldMouseY == event.clientY) {

        this.isMouseClick = true;

        if (event.button === THREE.MOUSE.LEFT) {
            var scope = this;
            var normalizedVec = cameraEditor.mapWindowToViewport(event.clientX, event.clientY);
            var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);

            scope.scene.pick(normalizedVec, cameraEditor.object, function (intersect) {

                if (intersect) {

                    var userId = "";
                    userId = intersect.userId || userId;

                    if (userId === "") return;

                    var svgContainer = scope.domElement;
                    var shapeData = {
                        x: "0",
                        y: "0",
                        //label: "",
                        type : scope.markerType,
                        fillColor: scope.markerColor
                    };

                    var bBox = intersect.object.boundingBox;

                    if (!bBox) {
                        intersect.object.geometry.computeBoundingBox();
                        bBox = intersect.object.geometry.boundingBox;
                    }

                    var worldPoint = intersect.point.clone();
                    var inverseMatrix = scope.getInverseSceneMatrix();
                    worldPoint.applyMatrix4(inverseMatrix);

                    var markerId = scope.generateMarkerId();

                    //console.log(markerId);
                    var marker = new CLOUD.Marker(markerId, scope);

                    marker.createSVGShape(shapeData, svgContainer);
                    marker.setWorldPosition(worldPoint);
                    marker.setWorldBoundingBox(bBox);
                    marker.setUserId(userId);
                    marker.setState(scope.markerState);
                    marker.setClientPostion({x: event.clientX - dim.left, y: event.clientY - dim.top});
                    marker.updateStyle();
                    //marker.setParent(scope.svgGroup);
                    scope.addMarker(marker);
                }
            });
        }
    }
};

CLOUD.MarkerEditor.prototype.onMouseMove = function(event) {

    CLOUD.OrbitEditor.prototype.onMouseMove.call(this, event);

    this.update();
};

CLOUD.MarkerEditor.prototype.onMouseWheel = function (event) {

    CLOUD.OrbitEditor.prototype.onMouseWheel.call(this, event);
    this.update();
};

CLOUD.MarkerEditor.prototype.update = function() {

    for (var i = 0, len = this.markers.length; i < len; i++) {
        var marker = this.markers[i];
        var pos = this.worldToClient(marker.worldPosition);
        marker.setClientPostion(pos);
        marker.updateStyle();
    }
};

CLOUD.MarkerEditor.prototype.editBegin = function() {

    if (this.isEditing) {
        return true;
    }

    //if (!this.svgGroup) {
    //    this.svgGroup = this.createSvgElement('g');
    //}
    //
    //this.svg.insertBefore(this.svgGroup, this.svg.firstChild);

    this.clear();

    this.isEditing = true;
};

CLOUD.MarkerEditor.prototype.editEnd = function() {
    this.isEditing = false;

    //this.svg.removeChild(this.svgGroup);
};

//CLOUD.MarkerEditor.prototype.generateMarkerId = (function () {
//
//    var value = 0;
//
//    return function () {
//        return ++value;
//    };
//})();

CLOUD.MarkerEditor.prototype.generateMarkerId = function () {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

CLOUD.MarkerEditor.prototype.clear = function() {

    var markers = this.markers;

    while (markers.length) {
        var marker = markers[0];
        this.removeMarker(marker);
        marker.destroy();
    }

    //var svg = this.svgGroup;
    //if (svg && svg.childNodes.length > 0) {
    //    while (svg.childNodes.length) {
    //        svg.removeChild(svg.childNodes[0]);
    //    }
    //}
};

CLOUD.MarkerEditor.prototype.getMarker = function (id) {

    for (var i = 0, len = this.markers.length; i < len; ++i) {
        if (this.markers[i].id == id) {
            return this.markers[i];
        }
    }

    return null;
};

CLOUD.MarkerEditor.prototype.addMarker = function(marker) {
    this.markers.push(marker);
};

CLOUD.MarkerEditor.prototype.removeMarker = function(marker) {

    var idx = this.markers.indexOf(marker);

    if (idx !== -1) {
        this.markers.splice(idx, 1);
    }
};

CLOUD.MarkerEditor.prototype.loadMarkers = function(markerInfoList) {

    this.clear();

    var svgContainer = this.domElement;

    var currMarkerState = this.markerState;

    for (var i = 0, len = markerInfoList.length; i < len; i++) {
        var info = markerInfoList[i];

        var markerState = info.state;

        this.setMarkerState(markerState);

        var shapeData = {
            x: "0",
            y: "0",
            //label: "",
            type : this.markerType,
            fillColor: this.markerColor
        };

        var markerId = info.id;
        var marker = new CLOUD.Marker(markerId, this);

        var box = new THREE.Box3();
        box.max.x = info.bBox.max.x;
        box.max.y = info.bBox.max.y;
        box.max.z = info.bBox.max.z;
        box.min.x = info.bBox.min.x;
        box.min.y = info.bBox.min.y;
        box.min.z = info.bBox.min.z;

        marker.createSVGShape(shapeData, svgContainer);
        marker.setWorldPosition(info.position);
        marker.setWorldBoundingBox(box);
        marker.setUserId(info.userId);
        marker.setState(info.state);

        var pos = this.worldToClient(info.position);
        marker.setClientPostion(pos);
        marker.updateStyle();
        //marker.setParent(scope.svgGroup);
        this.addMarker(marker);
    }

    this.markerState = currMarkerState;
    this.setMarkerState(currMarkerState);
};

CLOUD.MarkerEditor.prototype.getMarkerInfoList = function() {

    var markerInfoList = [];

    for (var i = 0, len = this.markers.length; i < len; i++) {
        var marker = this.markers[i];

        var info = {
            id: marker.id,
            userId: marker.userId,
            state : marker.state,
            position: marker.worldPosition.clone(),
            bBox: marker.worldBoundingBox.clone()
        };

        markerInfoList.push(info);
    }

    return markerInfoList;
};

CLOUD.MarkerEditor.prototype.getInverseSceneMatrix = function() {

    var sceneMatrix = this.scene.rootNode.matrix;
    var inverseMatrix = new THREE.Matrix4();
    inverseMatrix.getInverse(sceneMatrix);

    return inverseMatrix;
};

CLOUD.MarkerEditor.prototype.getSceneMatrix = function() {

    var sceneMatrix = this.scene.rootNode.matrix;

    return sceneMatrix;
};

CLOUD.MarkerEditor.prototype.worldToClient = function(point) {

    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();
    var sceneMatrix = this.getSceneMatrix();

    var worldPoint = new THREE.Vector3(point.x, point.y, point.z);
    worldPoint.applyMatrix4(sceneMatrix);

    result.set(worldPoint.x, worldPoint.y, worldPoint.z);
    result.project(camera);

    //result.x =  Math.round(0.5 * (result.x + 1) * dim.width + dim.left);
    //result.y =  Math.round(-0.5 * (result.y - 1) * dim.height + dim.top);
    result.x =  Math.round(0.5 * (result.x + 1) * dim.width);
    result.y =  Math.round(-0.5 * (result.y - 1) * dim.height);
    result.z = 0;

    return result;
};

CLOUD.MarkerEditor.prototype.clientToWorld = function(point, depth) {

    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    //result.x = (point.x - dim.left) / dim.width * 2 - 1;
    //result.y = -((point.y - dim.top) / dim.height) * 2 + 1;
    result.x = (point.x) / dim.width * 2 - 1;
    result.y = -((point.y) / dim.height) * 2 + 1;
    result.z = depth;

    result.unproject(camera);

    //var inverseMatrix = this.getInverseSceneMatrix();
    //result.applyMatrix4(inverseMatrix);

    return result;
};

CLOUD.MarkerEditor.prototype.makeSVG = function() {
    var xmlns = "http://www.w3.org/2000/svg";
    var xlinkns = "http://www.w3.org/1999/xlink";
    var attrMap = {
        "className": "class",
        "svgHref": "href"
    };
    var nsMap = {
        "svgHref": xlinkns
    };

    return function (tag, attributes) {

        var elem = document.createElementNS(xmlns, tag);

        for (var attribute in attributes) {

            var name = (attribute in attrMap ? attrMap[attribute] : attribute);
            var value = attributes[attribute];

            if (attribute in nsMap)
                elem.setAttributeNS(nsMap[attribute], name, value);
            else
                elem.setAttribute(name, value);
        }

        return elem;
    }
}();

CLOUD.MarkerEditor.prototype.createSvgElement = function(type) {

    var xmlns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(xmlns, type);
    svg.setAttribute('pointer-events', 'inherit');

    return svg;
};

CLOUD.MarkerEditor.prototype.calcBoundingBox = function() {

    if (this.markers.length < 1) return null;

    var bBox = new THREE.Box3();

    for (var i = 0, len = this.markers.length; i < len; i++) {
        var marker = this.markers[i];
        bBox.union(marker.getWorldBoundingBox());
    }

    return bBox;
};

CLOUD.MarkerEditor.prototype.setMarkerState = function(state) {

    if (state < 0 && state > 5) {
        state = 0;
    }

    switch (state) {
        case 0:
            this.markerType = 0;
            this.markerColor = this.pinColorSelector.red;
            break;
        case 1:
            this.markerType = 0;
            this.markerColor = this.pinColorSelector.green;
            break;
        case 2:
            this.markerType = 0;
            this.markerColor = this.pinColorSelector.yellow;
            break;
        case 3:
            this.markerType = 1;
            this.markerColor = this.bubbleColorSelector.red;
            break;
        case 4:
            this.markerType = 1;
            this.markerColor = this.bubbleColorSelector.green;
            break;
        case 5:
            this.markerType = 1;
            this.markerColor = this.bubbleColorSelector.gray;
            break;
        default:
            this.markerType = 0;
            this.markerColor = this.pinColorSelector.red;
            break;
    }

    this.markerState = state;
};




CLOUD.Extensions.Comment = function (editor, id) {

    this.editor = editor;
    this.id = id;
    this.shapeType = 0;
    this.style = this.getDefaultStyle();
    this.size = {x: 0, y: 0};
    this.position = {x: 0, y: 0};
    this.rotation = 0;
    this.shape = null;
    this.selected = false;
    this.highlighted = false;
    this.highlightColor = '#FAFF3C';
    this.originX = 0;
    this.originY = 0;
    this.isDisableInteractions = false;
};

CLOUD.Extensions.Comment.prototype = {
    constructor: CLOUD.Extensions.Comment,

    addDomEventListeners: function () {
    },

    removeDomEventListeners: function () {
    },

    onMouseDown: function (event) {

        //event.preventDefault();
        //event.stopPropagation();

        if (this.isDisableInteractions) {
            return;
        }

        this.select();

        if (this.editor.commentFrame) {
            this.editor.commentFrame.dragBegin(event);
        }
    },

    onMouseOut: function () {
        this.highlight(false);
    },

    onMouseOver: function () {
        this.highlight(true);
    },

    created: function () {
    },

    destroy: function () {

        this.deselect();
        this.removeDomEventListeners();
        this.setParent(null);
    },

    set: function (position, width, height) {

        this.rotation = 0;
        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    },

    setRotation: function (angle) {

        this.rotation = angle;
        this.updateStyle();
    },

    getRotation:function() {

        return this.rotation;
    },

    setPosition: function (x, y) {

        this.position.x = x;
        this.position.y = y;
        this.updateStyle();
    },

    getPosition:function() {

        return {
            x: this.position.x,
            y: this.position.y
        };
    },

    setSize: function (width, height, position) {

        this.size.x = width;
        this.size.y = height;
        this.position.x = position.x;
        this.position.y = position.y;
        this.updateStyle();
    },

    getSize:function() {

        return {
            x: this.size.x,
            y: this.size.y
        };
    },

    setParent: function (parent) {

        var shapeEl = this.shape;

        if (shapeEl.parentNode) {
            shapeEl.parentNode.removeChild(shapeEl);
        }

        if (parent) {
            parent.appendChild(shapeEl);
        }
    },

    setStyle:function(style){

        this.style = CLOUD.DomUtil.cloneStyle(style);
        this.updateStyle();
    },

    getStyle:function(){

        return CLOUD.DomUtil.cloneStyle(this.style);
    },

    updateTransformMatrix: function () {
    },

    updateStyle: function () {
    },

    select: function () {

        if (this.selected) {
            return;
        }

        this.selected = true;
        this.highlighted = false;
        this.updateStyle();

        this.editor.selectComment(this);
    },

    deselect: function () {

        this.selected = false;
    },

    highlight: function (isHighlight) {

        if (this.isDisableInteractions) {
            return;
        }

        this.highlighted = isHighlight;
        this.updateStyle();
    },

    disableInteractions : function (disable) {

        this.isDisableInteractions = disable;
    },

    delete: function () {

        this.editor.deleteComment(this);
    },

    getDefaultStyle: function () {

        var style = {};

        style['stroke-width'] = 3;
        style['stroke-color'] = '#ff0000';
        style['stroke-opacity'] = 1.0;
        style['fill-color'] = '#ff0000';
        style['fill-opacity'] = 0.0;
        style['font-family'] = 'Arial';
        style['font-size'] = 16;
        style['font-style'] = ''; // 'italic'
        style['font-weight'] = ''; // 'bold'

        return style;
    }
};

CLOUD.Extensions.Comment.shapeTypes = {ARROW: 1, RECTANGLE: 2, CIRCLE: 3, CROSS: 4, CLOUD: 5, TEXT: 6};
CLOUD.Extensions.CommentArrow = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.ARROW;
    this.head = new THREE.Vector3();
    this.tail = new THREE.Vector3();

    this.size.y = this.style['stroke-width'] * 2;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentArrow.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentArrow.prototype.constructor = CLOUD.Extensions.CommentArrow;

CLOUD.Extensions.CommentArrow.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentArrow.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.removeEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentArrow.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('polygon');
};

CLOUD.Extensions.CommentArrow.prototype.set = function (sx, sy, ex, ey) {

    var v0 = new THREE.Vector2(sx, sy);
    var v1 = new THREE.Vector2(ex, ey);
    var vDir = v1.clone().sub(v0).normalize();

    this.size.x = v0.distanceTo(v1);
    this.rotation = Math.acos(vDir.dot(new THREE.Vector2(1, 0)));
    //this.rotation = ey > sy ? (Math.PI * 2) - this.rotation : this.rotation;

    this.rotation = ey < sy ? (Math.PI * 2) - this.rotation : this.rotation;

    this.tail.set(sx, sy, 0);
    this.head.set(ex, ey, 0);

    this.updateStyle();
};

CLOUD.Extensions.CommentArrow.prototype.setSize = function (width, height, position) {

    var endX = Math.cos(this.rotation);
    var endY = Math.sin(this.rotation);
    var endDir = new THREE.Vector2(endX, endY);
    endDir.multiplyScalar(width * 0.5);

    var vCenter = new THREE.Vector2(position.x, position.y);
    var v0 = vCenter.clone().sub(endDir);
    var v1 = vCenter.clone().add(endDir);

    this.tail.set(v0.x, v0.y, 0);
    this.head.set(v1.x, v1.y, 0);
    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;

    this.updateStyle();
};

CLOUD.Extensions.CommentArrow.prototype.setPosition = function (x, y) {

    var head = this.head;
    var tail = this.tail;

    var dx = head.x - tail.x;
    var dy = head.y - tail.y;

    var x0 = x - dx * 0.5;
    var y0 = y - dy * 0.5;

    head.x = x0;
    head.y = y0;

    tail.x = x0 + dx;
    tail.y = y0 + dy;

    this.updateStyle();
};

CLOUD.Extensions.CommentArrow.prototype.updateTransformMatrix = function () {

    var offsetX = this.size.x * 0.5;
    var offsetY = this.size.y;

    this.position.x = (this.head.x + this.tail.x) * 0.5;
    this.position.y = (this.head.y + this.tail.y) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');
};

CLOUD.Extensions.CommentArrow.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var shapePoints = this.getShapePoints();
    var mappedPoints = shapePoints.map(function (point) {
        return point[0] + ',' + point[1];
    });

    var pointsStr = mappedPoints.join(' ');

    this.shape.setAttribute('points', pointsStr);
    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute('fill', strokeColor);
    this.shape.setAttribute('opacity', strokeOpacity);
};

CLOUD.Extensions.CommentArrow.prototype.getShapePoints = function () {

    var strokeWidth = this.size.y;
    var halfLen = this.size.x * 0.5;
    var thickness = strokeWidth;
    var halfThickness = strokeWidth * 0.5;
    var headLen = halfLen - (1.2 * thickness);

    var p1 = [-halfLen, -halfThickness];
    var p7 = [-halfLen, halfThickness];
    var p4 = [halfLen, 0];
    var p3 = [headLen, -thickness];
    var p2 = [headLen, -halfThickness];
    var p6 = [headLen, halfThickness];
    var p5 = [headLen, thickness];

    var points = [p1, p2, p3, p4, p5, p6, p7];

    points.forEach(function (point) {
        point[0] += halfLen;
        point[1] += thickness;
    });

    return points;
};

CLOUD.Extensions.CommentArrow.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.size.y;;
    var strokeColor = this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];

    var offsetX = this.size.x * 0.5;
    var offsetY = strokeWidth;
    var posX = (this.head.x + this.tail.x) * 0.5;
    var posY = (this.head.y + this.tail.y) * 0.5;

    var m1 = new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, 0);
    var m2 = new THREE.Matrix4().makeRotationZ(this.rotation);
    var m3 = new THREE.Matrix4().makeTranslation(posX, posY, 0);
    var transform = m3.multiply(m2).multiply(m1);

    var points = this.getShapePoints();

    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity);
    ctx.beginPath();

    points.forEach(function (point) {

        var x = point[0], y = point[1];
        var client = new THREE.Vector3(x, y, 0);

        client = client.applyMatrix4(transform);
        ctx.lineTo(client.x, client.y);
    });

    ctx.fill();
};


CLOUD.Extensions.CommentRectangle = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.RECTANGLE;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentRectangle.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentRectangle.prototype.constructor = CLOUD.Extensions.CommentRectangle;

CLOUD.Extensions.CommentRectangle.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentRectangle.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.removeEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentRectangle.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('rect');
};

CLOUD.Extensions.CommentRectangle.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];

    //var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    //var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    var originX = (this.size.x - strokeWidth) * 0.5;
    var originY = (this.size.y - strokeWidth) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -originX, ',', -originY, ') '
    ].join('');
};

CLOUD.Extensions.CommentRectangle.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    //this.shape.setAttribute('stroke', strokeColor);
    //this.shape.setAttribute('stroke-opacity', strokeOpacity);
    this.shape.setAttribute("stroke", CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity));
    //this.shape.setAttribute('fill', fillColor);
    //this.shape.setAttribute('fill-opacity', fillOpacity);
    this.shape.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity));
    this.shape.setAttribute('width', Math.max(this.size.x - strokeWidth, 0) + '');
    this.shape.setAttribute('height', Math.max(this.size.y - strokeWidth, 0) + '');
};

CLOUD.Extensions.CommentRectangle.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];
    var width = this.size.x - strokeWidth;
    var height = this.size.y - strokeWidth;

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    if (fillOpacity !== 0) {
        ctx.fillRect(width / -2, height / -2, width, height);
    }

    ctx.strokeRect(width / -2, height / -2, width, height);
};

CLOUD.Extensions.CommentCircle = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CIRCLE;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentCircle.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCircle.prototype.constructor = CLOUD.Extensions.CommentCircle;

CLOUD.Extensions.CommentCircle.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCircle.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.removeEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCircle.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('ellipse');
};

CLOUD.Extensions.CommentCircle.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];
    //var offsetX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    //var offsetY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    var offsetX = (this.size.x - strokeWidth) * 0.5;
    var offsetY = (this.size.y - strokeWidth) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');
};

CLOUD.Extensions.CommentCircle.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var radX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    var radY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    //this.shape.setAttribute("stroke", strokeColor);
    //this.shape.setAttribute("stroke-opacity", strokeOpacity);
    this.shape.setAttribute("stroke", CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity));
    //this.shape.setAttribute('fill', fillColor);
    //this.shape.setAttribute('fill-opacity', fillOpacity);
    this.shape.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity));
    this.shape.setAttribute('cx', radX);
    this.shape.setAttribute('cy', radY);
    this.shape.setAttribute('rx', radX);
    this.shape.setAttribute('ry', radY);
};

CLOUD.Extensions.CommentCircle.prototype.renderToCanvas = function (ctx) {

    function ellipse(ctx, cx, cy, w, h) {

        ctx.beginPath();

        var lx = cx - w / 2,
            rx = cx + w / 2,
            ty = cy - h / 2,
            by = cy + h / 2;

        var magic = 0.551784;
        var xmagic = magic * w / 2;
        var ymagic = magic * h / 2;

        ctx.moveTo(cx, ty);
        ctx.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
        ctx.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
        ctx.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
        ctx.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);
        ctx.stroke();
    }

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var width = this.size.x - strokeWidth;
    var height = this.size.y - strokeWidth;
    var size = {x: width, y: height};
    var center = {x: this.position.x, y: this.position.y};

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();

    ellipse(ctx, 0, 0, size.x, size.y);

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    ctx.stroke();
};
CLOUD.Extensions.CommentCloud = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CLOUD;
    this.shapePoints = [];
    this.shapePath = [];
    this.shapeControlPoints = [];

    this.isSeal = false; // 是否封口

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentCloud.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCloud.prototype.constructor = CLOUD.Extensions.CommentCloud;

CLOUD.Extensions.CommentCloud.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCloud.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.removeEventListener("mouseover", this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCloud.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.CommentCloud.prototype.set = function (position, width, height) {
    this.rotation = 0;
    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;
    this.size.y = height;

    this.updateStyle();
};

CLOUD.Extensions.CommentCloud.prototype.setPosition = function (x, y) {

    var len = this.shapePoints.length;

    var dx = x - this.position.x;
    var dy = y - this.position.y;

    for (var i = 0; i < len; i += 2) {
        this.shapePoints[i] += dx;
        this.shapePoints[i + 1] += dy;
    }

    this.updateStyle();
};

CLOUD.Extensions.CommentCloud.prototype.setSize = function (width, height, position) {

    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;
    this.size.y = height;

    this.updateStyle();
};

CLOUD.Extensions.CommentCloud.prototype.updateTransformMatrix = function () {

    var box = this.getBoundingBox();

    var center = box.center();
    this.position.x = center.x;
    this.position.y = center.y;

    var size = box.size();
    this.size.x = size.x;
    this.size.y = size.y;

    //var offsetX = this.size.x * 0.5;
    //var offsetY = this.size.y * 0.5;

    var offsetX = this.position.x;
    var offsetY = this.position.y;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');
};

CLOUD.Extensions.CommentCloud.prototype.updateStyle = function () {

    // 小于两个点，不处理
    if (this.shapePoints.length < 4) return;

    this.updateTransformMatrix();

    var shapePathStr = this.getPathString();
    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", strokeColor);
    this.shape.setAttribute("stroke-opacity", strokeOpacity);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', fillOpacity);
    this.shape.setAttribute('d', shapePathStr);
};

// 计算控制点
CLOUD.Extensions.CommentCloud.prototype.calculateControlPoint = function (startPoint, endPoint) {

    var start = new THREE.Vector2(startPoint.x, startPoint.y);
    var end = new THREE.Vector2(endPoint.x, endPoint.y);
    var direction = end.clone().sub(start);
    var halfLen = 0.5 * direction.length();
    var centerX = 0.5 * (start.x + end.x);
    var centerY = 0.5 * (start.y + end.y);
    var center = new THREE.Vector2(centerX, centerY);

    direction.normalize();
    direction.rotateAround(new THREE.Vector2(0, 0), -0.5 * Math.PI);
    direction.multiplyScalar(halfLen);
    center.add(direction);

    return {
        x: center.x,
        y: center.y
    };
};

CLOUD.Extensions.CommentCloud.prototype.calculateShapePath = function () {

    // 根据形状点构造path
    var shapePath = [];
    var shapeControlPoints = [];
    var len = this.shapePoints.length;
    var originShapePoint = {};
    var currentShapePoint = {};
    var lastShapePoint = {};
    var controlPoint;

    if (len % 2 !== 0) {
        console.error("[CommentCloud] shape points is error!");
    }

    for (var i = 0; i < len; i += 2) {

        currentShapePoint.x = this.shapePoints[i];
        currentShapePoint.y = this.shapePoints[i + 1];

        if (i === 0) { // 第一个点

            shapePath.push('M');
            shapePath.push(currentShapePoint.x);
            shapePath.push(currentShapePoint.y);

            originShapePoint.x = currentShapePoint.x;
            originShapePoint.y = currentShapePoint.y;

            lastShapePoint.x = currentShapePoint.x;
            lastShapePoint.y = currentShapePoint.y;

        } else {

            // 计算控制点
            controlPoint = this.calculateControlPoint(lastShapePoint, currentShapePoint);
            shapeControlPoints.push(controlPoint.x);
            shapeControlPoints.push(controlPoint.y);

            shapePath.push('Q');
            shapePath.push(controlPoint.x);
            shapePath.push(controlPoint.y);
            shapePath.push(',');
            shapePath.push(currentShapePoint.x);
            shapePath.push(currentShapePoint.y);

            lastShapePoint.x = currentShapePoint.x;
            lastShapePoint.y = currentShapePoint.y;


            // 最后一个点, 处理封口
            if ((i === len - 2) && this.isSeal) {

                // 计算控制点
                controlPoint = this.calculateControlPoint(lastShapePoint, originShapePoint);
                shapeControlPoints.push(controlPoint.x);
                shapeControlPoints.push(controlPoint.y);

                shapePath.push('Q');
                shapePath.push(controlPoint.x);
                shapePath.push(controlPoint.y);
                shapePath.push(',');
                shapePath.push(originShapePoint.x);
                shapePath.push(originShapePoint.y);
                shapePath.push('Z');
            }
        }
    }

    this.shapePath = shapePath;
    this.shapeControlPoints = shapeControlPoints;
};

CLOUD.Extensions.CommentCloud.prototype.getPathString = function () {

    return this.shapePath.join(' ');
};

CLOUD.Extensions.CommentCloud.prototype.addPoint = function (point) {

    var len = this.shapePoints.length;

    if (len === 0) {

        this.shapePoints.push(point.x);
        this.shapePoints.push(point.y);

    } else {

        var epsilon = 0.5;

        var preShapePoint = {};
        preShapePoint.x = this.shapePoints[len - 2];
        preShapePoint.y = this.shapePoints[len - 1];

        // 判断是否同一个点, 同一个点不加入集合
        if (!CLOUD.Extensions.Utils.Geometric.isEqualBetweenPoints(preShapePoint, point, epsilon)) {

            this.shapePoints.push(point.x);
            this.shapePoints.push(point.y);
        }
    }

    this.updateStyle();
};

CLOUD.Extensions.CommentCloud.prototype.getBoundingBox = function () {

    var box = new THREE.Box2();
    var i, len = this.shapePoints.length;
    var point = new THREE.Vector2();

    for (i = 0; i < len; i += 2) {

        point.set(this.shapePoints[i], this.shapePoints[i + 1]);
        box.expandByPoint(point);
    }

    // 计算path
    this.calculateShapePath();

    len = this.shapeControlPoints.length;

    for (i = 0; i < len; i += 2) {

        point.set(this.shapeControlPoints[i], this.shapeControlPoints[i + 1]);
        box.expandByPoint(point);
    }

    return box;
};

CLOUD.Extensions.CommentCloud.prototype.setSeal = function (isSeal) {

    this.isSeal = isSeal;

    this.updateStyle();
};

// 设置形状点集
CLOUD.Extensions.CommentCloud.prototype.setShapePoints = function (shapeStr) {

    var scope = this;
    var shapePoints = shapeStr.split(',');

    this.shapePoints = [];

    shapePoints.forEach(function (point) {
        scope.shapePoints.push(parseInt(point));
    });
};

// 获得形状点集字符串（用“，”分割）
CLOUD.Extensions.CommentCloud.prototype.getShapePoints = function () {

    return this.shapePoints.join(',');
};

CLOUD.Extensions.CommentCloud.prototype.renderToCanvas = function (ctx) {

    // 小于两个点，不处理
    if (this.shapePoints.length < 4) return;

    var scope = this;

    function drawCloud(ctx, points, isSeal) {

        var len = points.length;
        var originShapePoint = {};
        var currentShapePoint = {};
        var lastShapePoint = {};
        var controlPoint;

        ctx.beginPath();

        for (var i = 0; i < len; i += 2) {

            currentShapePoint.x = points[i];
            currentShapePoint.y = points[i + 1];

            if (i === 0) { // 第一个点

                ctx.moveTo(currentShapePoint.x, currentShapePoint.y);

                originShapePoint.x = currentShapePoint.x;
                originShapePoint.y = currentShapePoint.y;

                lastShapePoint.x = currentShapePoint.x;
                lastShapePoint.y = currentShapePoint.y;

            } else {

                // 计算控制点
                controlPoint = scope.calculateControlPoint(lastShapePoint, currentShapePoint);

                ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentShapePoint.x, currentShapePoint.y);

                lastShapePoint.x = currentShapePoint.x;
                lastShapePoint.y = currentShapePoint.y;

                // 最后一个点, 处理封口
                if ((i === len - 2) && isSeal) {

                    // 计算控制点
                    controlPoint = scope.calculateControlPoint(lastShapePoint, originShapePoint);

                    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, originShapePoint.x, originShapePoint.y);
                }
            }
        }

        ctx.stroke();
    }

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x, -this.position.y);

    drawCloud(ctx, this.shapePoints, this.isSeal);

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    ctx.stroke();
};


CLOUD.Extensions.CommentCross = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CROSS;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentCross.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCross.prototype.constructor = CLOUD.Extensions.CommentCross;

CLOUD.Extensions.CommentCross.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCross.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.removeEventListener("mouseover",this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCross.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.CommentCross.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];
    var offsetX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    var offsetY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');
};

CLOUD.Extensions.CommentCross.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    this.shape.setAttribute('stroke',strokeColor);
    this.shape.setAttribute('stroke-opacity',strokeOpacity);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', fillOpacity);
    this.shape.setAttribute('d', this.getPath().join(' '));
};

CLOUD.Extensions.CommentCross.prototype.getPath = function() {

    var size = this.size;
    var l = 0;
    var t = 0;
    var r = size.x;
    var b = size.y;

    var path = [];

    path.push('M');
    path.push(l);
    path.push(t);
    path.push('L');
    path.push(r);
    path.push(b);
    path.push('z');

    path.push('M');
    path.push(l);
    path.push(b);
    path.push('L');
    path.push(r);
    path.push(t);
    path.push('z');

    return path;
};

CLOUD.Extensions.CommentCross.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var width = this.size.x - strokeWidth;
    var height = this.size.y - strokeWidth;
    var size = {x: width, y: height};

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;

    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-0.5 * width, -0.5 * height);

    //ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(size.x, size.y);

    ctx.moveTo(0, size.y);
    ctx.lineTo(size.x, 0);

    ctx.stroke();

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    ctx.stroke();
};

CLOUD.Extensions.CommentText = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.TEXT;
    this.currText = "";
    this.currTextLines = [""];
    this.textDirty = true;
    this.lineHeight = 100;

    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('maxlength', '260');

    this.parentDiv = null;

    this.textAreaStyle = {};
    this.textAreaStyle['position'] = 'absolute';
    this.textAreaStyle['overflow-y'] = 'hidden';

    this.measurePanel = document.createElement('div');

    this.isActive = false;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentText.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentText.prototype.constructor = CLOUD.Extensions.CommentText;

CLOUD.Extensions.CommentText.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this), false);
    this.shape.addEventListener("mouseover", this.onMouseOver.bind(this), false);
};

CLOUD.Extensions.CommentText.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.removeEventListener("mouseout", this.onMouseOut.bind(this), false);
    this.shape.removeEventListener("mouseover", this.onMouseOver.bind(this), false);
};

CLOUD.Extensions.CommentText.prototype.createShape = function () {

    this.clipPath = CLOUD.Extensions.Utils.Shape2D.createSvgElement('clipPath');
    this.clipPathId = 'clip_' + this.id;
    this.clipPath.setAttribute('id', this.clipPathId);
    this.clipPath.removeAttribute('pointer-events');

    this.clipRect = CLOUD.Extensions.Utils.Shape2D.createSvgElement('rect');
    this.clipRect.removeAttribute('pointer-events');
    this.clipPath.appendChild(this.clipRect);

    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('text');
    this.backgroundRect = CLOUD.Extensions.Utils.Shape2D.createSvgElement('rect');
};

CLOUD.Extensions.CommentText.prototype.set = function (position, width, height, textString) {

    this.position.x = position.x;
    this.position.y = position.y;

    this.size.x = width;
    this.size.y = height;

    this.setText(textString);
};

CLOUD.Extensions.CommentText.prototype.setSize = function (width, height, position) {

    var isCalcLines = (this.size.x !== width);

    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;
    this.size.y = height;

    if (isCalcLines) {

        var newLines = this.calcTextLines();

        if (!this.linesEqual(newLines)) {

            this.currTextLines = newLines;
            this.textDirty = true;
            this.forceRedraw();
        }
    }

    this.updateStyle();
};

CLOUD.Extensions.CommentText.prototype.setText = function (text) {

    this.currText = text;
    this.currTextLines = this.calcTextLines();
    this.textDirty = true;
    this.updateStyle();
};

CLOUD.Extensions.CommentText.prototype.getText = function () {

    return this.currText;
};

CLOUD.Extensions.CommentText.prototype.setParent = function (parent) {

    var currParent = this.clipPath.parentNode;

    if (currParent) {
        currParent.removeChild(this.clipPath);
    }

    if (parent) {
        parent.appendChild(this.clipPath);
    }

    currParent = this.backgroundRect.parentNode;

    if (currParent) {
        currParent.removeChild(this.backgroundRect);
    }

    if (parent) {
        parent.appendChild(this.backgroundRect);
    }

    currParent = this.shape.parentNode;

    if (currParent) {
        currParent.removeChild(this.shape);
    }

    if (parent) {
        parent.appendChild(this.shape);
    }
};

CLOUD.Extensions.CommentText.prototype.updateTransformMatrix = function () {

    var offsetX = this.size.x * 0.5;
    var offsetY = this.size.y * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');
};

CLOUD.Extensions.CommentText.prototype.updateStyle = function (forceDirty) {

    this.updateTransformMatrix();

    var fontSize = this.style['font-size'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute("font-family", this.style['font-family']);
    this.shape.setAttribute("font-size", fontSize);
    this.shape.setAttribute('font-weight', this.style['font-weight']);
    this.shape.setAttribute("font-style", this.style['font-style']);
    this.shape.setAttribute("fill", CLOUD.Extensions.Utils.Shape2D.composeRGBAString(strokeColor, strokeOpacity));

    var bBox = this.shape.getBBox();
    //var verticalTransform = ['translate(0, ', (-this.size.y + fontSize), ')'].join('');
    var verticalTransform = ['translate(0, ', fontSize, ')'].join('');
    this.shape.setAttribute("transform", (this.transformShape + verticalTransform));
    //this.shape.setAttribute('clip-path', 'url(#' + this.clipPathId + ')');

    if (this.textDirty || forceDirty) {

        if (forceDirty) {
            this.currTextLines = this.calcTextLines();
        }

        this.rebuildTextSvg();
        this.textDirty = false;
    }

    this.clipRect.setAttribute('x', "0");
    this.clipRect.setAttribute('y', bBox.y + '');
    this.clipRect.setAttribute('width', this.size.x);
    this.clipRect.setAttribute('height', this.size.y);

    verticalTransform = ['translate(0, ', this.size.y, ')'].join('');
    this.backgroundRect.setAttribute("transform", this.transformShape + verticalTransform);
    this.backgroundRect.setAttribute('width', this.size.x);
    this.backgroundRect.setAttribute('height', this.size.y);
    this.backgroundRect.setAttribute("stroke-width", '0');
    this.backgroundRect.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity));
};

CLOUD.Extensions.CommentText.prototype.forceRedraw = function () {

    window.requestAnimationFrame(function () {

        this.highlighted = !this.highlighted;
        this.updateStyle();

        this.highlighted = !this.highlighted;
        this.updateStyle();

    }.bind(this));
};

CLOUD.Extensions.CommentText.prototype.rebuildTextSvg = function () {

    while (this.shape.childNodes.length > 0) {
        this.shape.removeChild(this.shape.childNodes[0]);
    }

    var dx = 0;
    var dy = 0;
    var yOffset = this.getLineHeight();

    this.currTextLines.forEach(function (line) {

        var tspan = CLOUD.Extensions.Utils.Shape2D.createSvgElement('tspan');
        tspan.setAttribute('x', dx);
        tspan.setAttribute('y', dy);
        tspan.textContent = line;
        this.shape.appendChild(tspan);
        dy += yOffset;

    }.bind(this));
};

CLOUD.Extensions.CommentText.prototype.getLineHeight = function () {
    return this.style['font-size'] * (this.lineHeight * 0.01);
};

CLOUD.Extensions.CommentText.prototype.calcTextLines = function () {

    var textValues = this.editor.commentTextArea.getTextValuesByComment(this);
    return textValues.lines;
};

CLOUD.Extensions.CommentText.prototype.getTextLines = function () {

    return this.currTextLines.concat();
};

CLOUD.Extensions.CommentText.prototype.linesEqual = function (lines) {

    var curr = this.currTextLines;

    if (lines.length !== curr.length)
        return false;

    var len = curr.length;

    for (var i = 0; i < len; ++i) {
        if (lines[i] !== curr[i])
            return false;
    }

    return true;
};

CLOUD.Extensions.CommentText.prototype.renderToCanvas = function (ctx) {

    function renderTextLines(ctx, lines, lineHeight, maxHeight) {

        var y = 0;

        lines.forEach(function (line) {

            if ((y + lineHeight) > maxHeight) {
                return;
            }

            ctx.fillText(line, 0, y);
            y += lineHeight;
        });
    }

    var fontFamily = this.style['font-family'];
    var fontStyle = this.style['font-style'];
    var fontWeight = this.style['font-weight'];
    var strokeColor = this.style['stroke-color'];
    var fontOpacity = this.style['stroke-opacity'];
    var fontSize = this.style['font-size'];
    var lineHeight = fontSize * (this.lineHeight * 0.01);

    var center = {x: this.position.x, y: this.position.y};
    var clientSize = {x: this.size.x, y: this.size.y};

    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    ctx.save();
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.composeRGBAString(fillColor, fillOpacity);
    ctx.translate(center.x, center.y);

    if (fillOpacity !== 0) {
        ctx.fillRect(clientSize.x * -0.5, clientSize.y * -0.5, clientSize.x, clientSize.y);
    }

    ctx.restore();

    // Text
    ctx.fillStyle = strokeColor;
    ctx.strokeStyle = strokeColor;
    ctx.textBaseline = 'top';
    ctx.translate(center.x - (clientSize.x * 0.5), center.y - (clientSize.y * 0.5));
    //ctx.rotate(this.rotation);
    ctx.font = fontStyle + " " + fontWeight + " " + fontSize + "px " + fontFamily;
    ctx.globalAlpha = fontOpacity;
    renderTextLines(ctx, this.currTextLines, lineHeight, clientSize.y);
};


CLOUD.Extensions.CommentTextArea = function (editor, container) {

    this.editor = editor;
    this.container = container;

    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('maxlength', '260');

    this.textAreaStyle = {};
    this.textAreaStyle['position'] = 'absolute';
    this.textAreaStyle['overflow-y'] = 'hidden';

    this.measurePanel = document.createElement('div');

    this.textComment = null;

    this.addDomEventListeners();
};

CLOUD.Extensions.CommentTextArea.prototype.addDomEventListeners = function () {

    this.textArea.addEventListener('keydown', this.onKeyDown.bind(this), false);
};

CLOUD.Extensions.CommentTextArea.prototype.removeDomEventListeners = function () {

    this.textArea.removeEventListener('keydown', this.onKeyDown.bind(this), false);
};

CLOUD.Extensions.CommentTextArea.prototype.onKeyDown = function () {

    var keyCode = event.keyCode;
    var shiftDown = event.shiftKey;

    if (!shiftDown && keyCode === 13) {
        event.preventDefault();
        this.accept();
    }
};

CLOUD.Extensions.CommentTextArea.prototype.onResize = function () {

    window.requestAnimationFrame(function () {

        var text = this.textArea.value;
        this.style = null;
        this.init();
        this.textArea.value = text;

    }.bind(this));
};

CLOUD.Extensions.CommentTextArea.prototype.destroy = function () {

    this.removeDomEventListeners();
    this.inactive();
};

CLOUD.Extensions.CommentTextArea.prototype.init = function () {

    var position = this.textComment.getPosition();
    var size = this.textComment.getSize();
    var left = position.x - size.x * 0.5;
    var top = position.y - size.y * 0.5;

    var lineHeightPercentage = this.textComment.lineHeight + "%";
    this.textAreaStyle['line-height'] = lineHeightPercentage;

    this.setPositionAndSize(left, top, size.x, size.y);
    this.setStyle(this.textComment.getStyle());
    this.textArea.value = this.textComment.getText();

};

CLOUD.Extensions.CommentTextArea.prototype.setPositionAndSize = function (left, top, width, height) {

    if (left + width >= this.container.clientWidth) {
        left = this.container.clientWidth - (width + 10);
    }

    if (top + height >= this.container.clientHeight) {
        top = this.container.clientHeight - (height + 10);
    }

    this.textAreaStyle['left'] = left + 'px';
    this.textAreaStyle['top'] = top + 'px';
    this.textAreaStyle['width'] = width + 'px';
    this.textAreaStyle['height'] = height + 'px';
};

CLOUD.Extensions.CommentTextArea.prototype.setStyle = function (style) {

    if (this.style) {

        var width = parseFloat(this.textArea.style.width);
        var height = parseFloat(this.textArea.style.height);
        var left = parseFloat(this.textArea.style.left);
        var top = parseFloat(this.textArea.style.top);

        var position = {
            x: left + (width * 0.5),
            y: top + (height * 0.5)
        };

        this.setPositionAndSize(
            position.x - width * 0.5,
            position.y - height * 0.5,
            width, height);
    }

    this.textAreaStyle['font-family'] = style['font-family'];
    this.textAreaStyle['font-size'] = style['font-size'] + 'px';
    this.textAreaStyle['font-weight'] = style['font-weight'];
    this.textAreaStyle['font-style'] = style['font-style'];

    var styleStr = CLOUD.DomUtil.getStyleString(this.textAreaStyle);
    this.textArea.setAttribute('style', styleStr);

    this.style = CLOUD.DomUtil.cloneStyle(style);
};

CLOUD.Extensions.CommentTextArea.prototype.isActive = function () {

    return !!this.textComment;
};

CLOUD.Extensions.CommentTextArea.prototype.active = function (comment, firstEdit) {

    if (this.textComment === comment) {
        return;
    }

    this.inactive();

    this.container.appendChild(this.textArea);
    this.textComment = comment;
    this.firstEdit = firstEdit || false;

    this.init();

    window.addEventListener('resize', this.onResize.bind(this));

    var textArea = this.textArea;

    window.requestAnimationFrame(function(){
        textArea.focus();
    });
};

CLOUD.Extensions.CommentTextArea.prototype.inactive = function () {

    window.removeEventListener('resize', this.onResize.bind(this));

    if (this.textComment) {

        this.textComment = null;
        this.container.removeChild(this.textArea);
    }

    this.style = null;
};

CLOUD.Extensions.CommentTextArea.prototype.accept = function () {

    var width = parseFloat(this.textArea.style.width);
    var height = parseFloat(this.textArea.style.height);
    var left = parseFloat(this.textArea.style.left);
    var top = parseFloat(this.textArea.style.top);
    var textValues = this.getTextValues();
    var position = {
        x: left + (width * 0.5),
        y: top + (height * 0.5)
    };
    var data = {
        comment: this.textComment,
        firstEdit: this.firstEdit,
        style: this.style,
        position: position,
        width : width,
        height:height,
        text: textValues.text,
        lines: textValues.lines
    };

    this.editor.handleTextChange(data);
    this.inactive();
};

CLOUD.Extensions.CommentTextArea.prototype.getTextValuesByComment = function (comment) {

    this.active(comment, false);

    var textValues = this.getTextValues();

    this.inactive();

    return textValues;
};

CLOUD.Extensions.CommentTextArea.prototype.getTextValues = function () {

    var text = this.textArea.value;

    return {
        text: text,
        lines: this.calcTextLines()
    };
};

CLOUD.Extensions.CommentTextArea.prototype.calcTextLines = function () {

    var text = this.textArea.value;
    var linesBreaks = text.split(/\r*\n/);

    var measureStyle = CLOUD.DomUtil.cloneStyle(this.textAreaStyle);
    CLOUD.DomUtil.removeStyleAttribute(measureStyle, ['top', 'left', 'width', 'height', 'overflow-y']);
    measureStyle['position'] = 'absolute';
    measureStyle['white-space'] = 'nowrap';
    measureStyle['float'] = 'left';
    measureStyle['visibility'] = 'hidden';

    this.measurePanel.setAttribute('style', CLOUD.DomUtil.getStyleString(measureStyle));
    this.container.appendChild(this.measurePanel);

    var maxLineLength = parseFloat(this.textArea.style.width);
    var lines = [];

    for (var i = 0, len = linesBreaks.length; i < len; ++i) {

        var line = CLOUD.DomUtil.trimRight(linesBreaks[i]);
        this.splitLine(line, maxLineLength, lines);
    }

    this.container.removeChild(this.measurePanel);

    return lines;
};

CLOUD.Extensions.CommentTextArea.prototype.getShorterLine = function (line) {

    var iLastSpace = line.lastIndexOf(' ');

    if (iLastSpace === -1) {
        return [line];
    }

    while (line.charAt(iLastSpace - 1) === ' ') {
        iLastSpace--;
    }

    var trailingWord = line.substr(iLastSpace);
    var shorterLine = line.substr(0, iLastSpace);

    return [shorterLine, trailingWord];
};

CLOUD.Extensions.CommentTextArea.prototype.splitWord = function (word, remaining, maxLength, output) {

    var lenSoFar = 1;
    var fits = true;

    while (fits) {

        var part = word.substr(0, lenSoFar);
        this.measurePanel.innerHTML = part;
        var lineLen = this.measurePanel.clientWidth;

        if (lineLen > maxLength) {

            if (lenSoFar === 1) {

                output.push(part);
                this.splitWord(word.substr(1), remaining, maxLength, output);

                return;
            }

            var okayWord = word.substr(0, lenSoFar - 1);
            output.push(okayWord);

            var extraWord = word.substr(lenSoFar - 1);

            this.splitLine(extraWord + remaining, maxLength, output);

            return;
        }

        lenSoFar++;

        if (lenSoFar > word.length) {

            output.push(word);

            return;
        }
    }
};

CLOUD.Extensions.CommentTextArea.prototype.splitLine = function (text, maxLength, output) {

    if (text === '') {
        return;
    }

    var remaining = '';
    var done = false;

    while (!done) {

        this.measurePanel.innerHTML = text;
        var lineLen = this.measurePanel.clientWidth;

        if (lineLen <= maxLength) {

            output.push(text);
            this.splitLine(CLOUD.DomUtil.trimLeft(remaining), maxLength, output);
            done = true;

        } else {

            var parts = this.getShorterLine(text);

            if (parts.length === 1) {

                this.splitWord(text, remaining, maxLength, output);
                done = true;

            } else {

                text = parts[0];
                remaining = parts[1] + remaining;

            }
        }
    }
};



CLOUD.Extensions.CommentFrame = function (editor, container) {

    this.editor = editor;
    this.container = container;
    this.selection = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        element: null,
        active: false,
        dragging: false,
        resizing: false,
        handle: {}
    };

    this.comment = null;

    this.createFramePanel();
    this.addDomEventListeners();
};

CLOUD.Extensions.CommentFrame.prototype.addDomEventListeners = function() {

    this.framePanel.addEventListener('mousedown', this.onMouseDownToResize.bind(this));
    this.framePanel.addEventListener('dblclick', this.onDoubleClick.bind(this));
    this.selection.element.addEventListener('mousedown', this.onMouseDownToReposition.bind(this));
    this.selection.element.addEventListener('mousedown', this.onMouseDownToRotation.bind(this));
};

CLOUD.Extensions.CommentFrame.prototype.removeDomEventListeners = function() {

    this.framePanel.removeEventListener('mousedown', this.onMouseDownToResize.bind(this));
    this.framePanel.removeEventListener('dblclick', this.onDoubleClick.bind(this));
    this.selection.element.removeEventListener('mousedown', this.onMouseDownToReposition.bind(this));
    this.selection.element.removeEventListener('mousedown', this.onMouseDownToRotation.bind(this));
};

CLOUD.Extensions.CommentFrame.prototype.onMouseMove = function (event) {

};

CLOUD.Extensions.CommentFrame.prototype.onMouseUp = function (event) {
};

CLOUD.Extensions.CommentFrame.prototype.onMouseDownToReposition = function (event) {

    if (!this.comment) return;

    if (this.isDragPoint(event.target) || this.isRotatePoint(event.target)) return;

    this.selection.dragging = true;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);

    this.originMouse = mouse;
    this.originPosition = {
        x: this.comment.position.x,
        y: this.comment.position.y
    };

    this.onMouseMove = this.onMouseMoveToReposition.bind(this);
    this.onMouseUp = this.onMouseUpToReposition.bind(this);

    this.editor.dragCommentFrameBegin();
};

CLOUD.Extensions.CommentFrame.prototype.onMouseMoveToReposition = function (event) {

    if (!this.comment) return;

    if (!this.selection.dragging) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);

    var movement = {
        x: mouse.x - this.originMouse.x,
        y: mouse.y - this.originMouse.y
    };

    var x = this.originPosition.x + movement.x;
    var y = this.originPosition.y + movement.y;

    this.updatePosition(x, y, this.selection.rotation);

    this.comment.setPosition(x, y);
};

CLOUD.Extensions.CommentFrame.prototype.onMouseUpToReposition = function () {

    if (!this.selection.dragging) {
        return;
    }

    this.selection.dragging = false;
    this.editor.dragCommentFrameEnd();
};

CLOUD.Extensions.CommentFrame.prototype.onMouseDownToResize = function (event) {

    if (!this.comment) return;

    var target = event.target;

    if (this.isDragPoint(target)) {

        this.selection.resizing = true;
        this.selection.handle.resizingPanel = target;
        var direction = this.selection.handle.resizingPanel.getAttribute('data-drag-point');
        this.container.style.cursor = direction + '-resize';

        var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
        var position = this.comment.position;
        var size = this.comment.size;

        this.origin = {
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
            mouseX: mouse.x,
            mouseY: mouse.y
        };

        this.onMouseMove = this.onMouseMoveToResize.bind(this);
        this.onMouseUp = this.onMouseUpToResize.bind(this);

        this.editor.dragCommentFrameBegin();
    }
};

CLOUD.Extensions.CommentFrame.prototype.onMouseMoveToResize = function (event) {

    if (!this.comment) return;

    if (!this.selection.resizing) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    var origin = this.origin;

    var movement = {
        x: mouse.x - origin.mouseX,
        y: mouse.y - origin.mouseY
    };

    var vector = new THREE.Vector3(movement.x, movement.y, 0);
    var undoRotation = new THREE.Matrix4().makeRotationZ(-this.selection.rotation);
    movement = vector.applyMatrix4(undoRotation);

    var x = origin.x,
        y = origin.y,
        width = origin.width,
        height = origin.height;

    var localSpaceDelta = new THREE.Vector3();

    var direction = this.selection.handle.resizingPanel.getAttribute('data-drag-point');

    var translations = {
        n: function () {
            height -= movement.y;
            localSpaceDelta.y = movement.y;
        },
        s: function () {
            height += movement.y;
            localSpaceDelta.y = movement.y;
        },
        w: function () {
            width -= movement.x;
            localSpaceDelta.x = movement.x;
        },
        e: function () {
            width += movement.x;
            localSpaceDelta.x = movement.x;
        },
        nw: function () {
            this.n();
            this.w();
        },
        ne: function () {
            this.n();
            this.e();
        },
        sw: function () {
            this.s();
            this.w();
        },
        se: function () {
            this.s();
            this.e();
        }
    };

    translations[direction]();

    var redoRotation = new THREE.Matrix4().makeRotationZ(this.selection.rotation);
    var actualDelta = localSpaceDelta.applyMatrix4(redoRotation);

    var newPos = new THREE.Vector2(
        x + (actualDelta.x * 0.5),
        y + (actualDelta.y * 0.5));

    this.comment.setSize(width, height, newPos);
};

CLOUD.Extensions.CommentFrame.prototype.onMouseUpToResize = function (event) {

    this.selection.resizing = false;
    this.selection.handle.resizingPanel = null;
    this.container.style.cursor = '';
    this.editor.dragCommentFrameEnd();
};

CLOUD.Extensions.CommentFrame.prototype.onMouseDownToRotation = function (event) {

    if (!this.comment) return;

    if (!this.isRotatePoint(event.target)) return;

    this.selection.rotating = true;

    this.originPosition = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    this.originRotation = this.selection.rotation || 0;

    this.onMouseMove = this.onRotationMouseMove.bind(this);
    this.onMouseUp = this.onMouseUpToRotation.bind(this);

    this.editor.dragCommentFrameBegin();
};

CLOUD.Extensions.CommentFrame.prototype.onRotationMouseMove = function (event) {


    if (!this.comment) return;

    if (!this.selection.rotating) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    var position = this.comment.position;

    var angle1 = CLOUD.Extensions.Utils.Geometric.getAngleBetweenPoints(position, mouse);
    var angle2 = CLOUD.Extensions.Utils.Geometric.getAngleBetweenPoints(position, this.originPosition);
    var rotation = angle1 - angle2 + this.originRotation;

    this.updatePosition(this.selection.x, this.selection.y, rotation);

    this.comment.setRotation(rotation);
};

CLOUD.Extensions.CommentFrame.prototype.onMouseUpToRotation = function (event) {

    this.selection.rotating = false;
    this.originRotation = null;
    this.originPosition = null;
    this.editor.dragCommentFrameEnd();
};

CLOUD.Extensions.CommentFrame.prototype.onDoubleClick = function(event) {

    this.selection.dragging = false;

    if (this.comment) {
        this.editor.onMouseDoubleClick(event, this.comment);
    }
};

CLOUD.Extensions.CommentFrame.prototype.destroy = function(){

   this.removeDomEventListeners();
};

CLOUD.Extensions.CommentFrame.prototype.createFramePanel = function(){

    var scope = this;

    var createBoxWrapperPanel = function () {

        var panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.top = 0;
        panel.style.bottom = 0;
        panel.style.left = 0;
        panel.style.right = 0;
        panel.style.overflow = 'hidden';
        panel.style.visibility = 'hidden';
        panel.style.pointerEvents = 'none';

        return panel;
    };

    var createRotatePointPanel = function (diameter) {

        var borderWidth = 2;
        var borderRadius = (diameter / 2) + borderWidth;

        var panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.backgroundColor = 'aqua';
        panel.style.border = borderWidth + 'px solid rgb(95, 98, 100)';
        panel.style.height = diameter + 'px';
        panel.style.width = diameter + 'px';
        panel.style.borderRadius = borderRadius + 'px';
        panel.style.boxSizing = 'border-box';
        panel.classList.add('select-rotate-point');
        panel.style.top = '-25px';
        panel.style.left = '50%';
        panel.style.transform = 'translate3d(-50%, 0px, 0px)';

        return panel;
    };

    var createDragBoxPanel = function () {

        var borderWidth = 1;
        var borderColor = 'rgb(0, 0, 255)';

        var panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.border = borderWidth + 'px solid ' + borderColor;
        panel.style.zIndex = 1;
        panel.style.cursor = 'move';
        panel.style.boxSizing = 'border-box';
        panel.style.pointerEvents = 'auto';
        panel.classList.add('drag-box');

        return panel;
    };

    var createDragPointPanel = function (diameter, position) {

        var borderWidth = 2;
        var placementOffset = -1 * ((diameter + borderWidth) / 2);
        var wrapperPanel;

        var dragPointPanel = document.createElement('div');
        dragPointPanel.style.position = 'absolute';
        dragPointPanel.style.backgroundColor = 'rgba(151, 151, 151, 1)';
        dragPointPanel.style.border = borderWidth + 'px solid rgb(95, 98, 100)';
        dragPointPanel.style.height = diameter + 'px';
        dragPointPanel.style.width = diameter + 'px';
        dragPointPanel.style.borderRadius = (diameter / 2) + borderWidth + 'px';
        dragPointPanel.style.boxSizing = 'border-box';
        CLOUD.DomUtil.setCursorStyle(dragPointPanel, position);
        dragPointPanel.className = 'select-drag-point drag-point-' + position;
        dragPointPanel.setAttribute('data-drag-point', position);

        switch (position) {
            case 'n':
                wrapperPanel = document.createElement('div');
                wrapperPanel.style.position = 'absolute';
                wrapperPanel.style.width = '100%';
                wrapperPanel.style.height = diameter + 'px';
                wrapperPanel.style.top = placementOffset + 'px';

                dragPointPanel.style.margin = '0 auto';
                dragPointPanel.style.position = '';
                wrapperPanel.appendChild(dragPointPanel);
                dragPointPanel = wrapperPanel;
                break;
            case 's':
                wrapperPanel = document.createElement('div');
                wrapperPanel.style.position = 'absolute';
                wrapperPanel.style.width = '100%';
                wrapperPanel.style.height = diameter + 'px';
                wrapperPanel.style.bottom = placementOffset + 'px';

                dragPointPanel.style.margin = '0 auto';
                dragPointPanel.style.position = '';
                wrapperPanel.appendChild(dragPointPanel);
                dragPointPanel = wrapperPanel;
                break;
            case 'w':
                dragPointPanel.style.left = placementOffset + 'px';
                dragPointPanel.style.top = '50%';
                dragPointPanel.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'e':
                dragPointPanel.style.right = placementOffset + 'px';
                dragPointPanel.style.top = '50%';
                dragPointPanel.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'nw':
                dragPointPanel.style.top = placementOffset + 'px';
                dragPointPanel.style.left = placementOffset + 'px';
                break;
            case 'ne':
                dragPointPanel.style.top = placementOffset + 'px';
                dragPointPanel.style.right = placementOffset + 'px';
                break;
            case 'sw':
                dragPointPanel.style.bottom = placementOffset + 'px';
                dragPointPanel.style.left = placementOffset + 'px';
                break;
            case 'se':
                dragPointPanel.style.bottom = placementOffset + 'px';
                dragPointPanel.style.right = placementOffset + 'px';
                break;
        }

        return dragPointPanel;
    };

    var createDragPointPanels = function (selector) {

        var diameter = 12;
        var directions = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];

        directions.forEach(function (direction) {

            scope.selection.handle[direction] = createDragPointPanel(diameter, direction);
            selector.appendChild(scope.selection.handle[direction]);

        });
    };

    this.framePanel = createBoxWrapperPanel();
    this.container.appendChild(this.framePanel);

    var dragBoxPanel = createDragBoxPanel();
    createDragPointPanels(dragBoxPanel);

    this.selection.element = dragBoxPanel;
    this.framePanel.appendChild(this.selection.element);

    this.selection.rotationPanel = createRotatePointPanel(12);
    dragBoxPanel.appendChild(this.selection.rotationPanel);

    this.updateState(false);
};

CLOUD.Extensions.CommentFrame.prototype.setSelection = function(x, y, width, height, rotation) {

    this.updateDimensions(width, height);
    this.updatePosition(x, y, rotation);
    this.updateState(true);
    this.framePanel.style.visibility = 'visible';
};

CLOUD.Extensions.CommentFrame.prototype.setComment = function (comment) {

    if (!comment) {

        if (this.comment) {

            this.comment = null;
            this.updateState(false);
        }

        return;
    }

    var size = comment.size,
        position = comment.position,
        width = size.x,
        height = size.y,
        rotation = comment.rotation;

    this.comment = comment;

    this.setSelection(position.x - (width / 2), position.y - (height / 2), width, height, rotation);

    this.enableResize();
    this.enableRotation();
};

CLOUD.Extensions.CommentFrame.prototype.isActive = function () {
    return this.isDragging() || this.isResizing() || this.isRotating();
};

CLOUD.Extensions.CommentFrame.prototype.dragBegin = function (event) {

    this.onMouseDownToReposition(event);
};

CLOUD.Extensions.CommentFrame.prototype.isDragging = function () {

    return this.selection.dragging;
};

CLOUD.Extensions.CommentFrame.prototype.isResizing = function () {

    return this.selection.resizing;
};

CLOUD.Extensions.CommentFrame.prototype.isRotating = function () {

    return this.selection.rotating;
};

CLOUD.Extensions.CommentFrame.prototype.enableResize = function () {

    var handle, direction;

    for (direction in this.selection.handle) {

        handle = this.selection.handle[direction];

        if (handle) {
            handle.style.display = 'block';
        }
    }
};

CLOUD.Extensions.CommentFrame.prototype.enableRotation = function () {

    this.selection.rotationPanel.style.display = 'block';
};

CLOUD.Extensions.CommentFrame.prototype.updateDimensions = function (width, height) {

    this.selection.width = width;
    this.selection.height = height;
    this.selection.element.style.width = width + 'px';
    this.selection.element.style.height = height + 'px';
};

CLOUD.Extensions.CommentFrame.prototype.updatePosition = function (x, y, rotation) {

    var size = this.comment.size;

    this.selection.x = x;
    this.selection.y = y;
    this.selection.rotation = rotation;

    this.selection.element.style.msTransform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.msTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';

    this.selection.element.style.webkitTransform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.webkitTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';

    this.selection.element.style.transform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.transformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
};

CLOUD.Extensions.CommentFrame.prototype.updateState = function (active) {

    this.selection.active = active;
    this.selection.element.style.display = active ? 'block' : 'none';
};

CLOUD.Extensions.CommentFrame.prototype.isDragPoint = function (element) {

    return CLOUD.DomUtil.matchesSelector(element, '.select-drag-point');
};

CLOUD.Extensions.CommentFrame.prototype.isRotatePoint = function (element) {

    return CLOUD.DomUtil.matchesSelector(element, '.select-rotate-point');
};
var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};

CLOUD.Extensions.CommentEditor = function (cameraEditor, scene, domElement) {
    "use strict";

    CLOUD.OrbitEditor.call(this, cameraEditor, scene, domElement);

    //this.cameraEditor = cameraEditor;
    //this.scene = scene;
    //this.domElement = domElement;
    this.comments = [];
    this.selectedComment = null;
    this.bounds = {x: 0, y: 0, width: 0, height: 0};
    this.keys = {
        BACKSPACE: 8,
        ALT: 18,
        ESC: 27,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40,
        DELETE: 46,
        ZERO: 48,
        A: 65,
        D: 68,
        E: 69,
        Q: 81,
        S: 83,
        W: 87,
        PLUS: 187,
        SUB: 189
    };
    this.isEditing = false;
    this.originX = 0;
    this.originY = 0;
    this.isCreating = false;
    this.beginEditCallback = null;
    this.endEditCallback = null;
    this.changeEditorModeCallback = null;
    this.isCameraChange = false;
    this.commentType = CLOUD.Extensions.Comment.shapeTypes.ARROW;
    this.nextCommentId = 0;
};

CLOUD.Extensions.CommentEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.Extensions.CommentEditor.prototype.constructor = CLOUD.Extensions.CommentEditor;

CLOUD.Extensions.CommentEditor.prototype.addDomEventListeners = function () {

    if (this.svg) {

        this.svg.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.svg.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
        this.svg.addEventListener('dblclick', this.onMouseDoubleClick.bind(this), false);

        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('mouseup', this.onMouseUp.bind(this), false);

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);

        this.onFocus();
    }

};

CLOUD.Extensions.CommentEditor.prototype.removeDomEventListeners = function () {

    if (this.svg) {

        this.svg.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.svg.removeEventListener('mousewheel', this.onMouseWheel.bind(this), false);
        this.svg.removeEventListener('dblclick', this.onMouseDoubleClick.bind(this), false);

        window.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.removeEventListener('mouseup', this.onMouseUp.bind(this), false);

        window.removeEventListener('keydown', this.onKeyDown.bind(this), false);
        window.removeEventListener('keyup', this.onKeyUp.bind(this), false);
    }

};

CLOUD.Extensions.CommentEditor.prototype.onFocus = function () {

    if (this.svg) {

        this.svg.focus();
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseDown = function (event) {

    if (!this.isEditing) {
        CLOUD.OrbitEditor.prototype.onMouseDown.call(this, event);
        this.isCameraChange = true;
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.commentFrame.isActive()) {

        this.commentFrame.setComment(this.selectedComment);

        return;
    }

    if (!this.isCreating && event.target === this.svg) {

        this.selectComment(null);
    }

    this.handleMouseEvent(event, "down");
};

CLOUD.Extensions.CommentEditor.prototype.onMouseMove = function (event) {

    if (!this.isEditing) {

        CLOUD.OrbitEditor.prototype.onMouseMove.call(this, event);
        this.handleCallbacks("changeEditor");

        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.commentFrame.isActive()) {

        this.commentFrame.onMouseMove(event);
        this.commentFrame.setComment(this.selectedComment);

        return;
    }

    this.handleMouseEvent(event, "move");
};

CLOUD.Extensions.CommentEditor.prototype.onMouseUp = function (event) {

    if (!this.isEditing) {

        CLOUD.OrbitEditor.prototype.onMouseUp.call(this, event);
        this.isCameraChange = false;

        return;
    }

    event.preventDefault();
    event.stopPropagation();

    // 批注编辑结束
    if (this.commentFrame.isActive()) {

        this.commentFrame.onMouseUp(event);

        return;
    }

    if (this.selectedComment && this.isCreating) {

        this.handleMouseEvent(event, "up");
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseWheel = function (event) {

    if (!this.isEditing) {

        CLOUD.OrbitEditor.prototype.onMouseWheel.call(this, event);

        this.isCameraChange = true;
        this.handleCallbacks("changeEditor");
        this.isCameraChange = false;
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseDoubleClick = function (event, comment) {

    event.preventDefault();
    event.stopPropagation();

    if (!this.isEditing) {
        return;
    }

    this.mouseDoubleClickForCloud(event);
    this.mouseDoubleClickForText(event, comment);
};

CLOUD.Extensions.CommentEditor.prototype.onKeyDown = function (event) {

};

CLOUD.Extensions.CommentEditor.prototype.onKeyUp = function (event) {

    if (!this.isEditing) {
        return;
    }

    switch (event.keyCode) {
        case this.keys.DELETE:
            if (this.selectedComment) {
                this.selectedComment.delete();
                this.selectedComment = null;
                this.deselectComment();
            }
            break;
        case this.keys.ESC: // 结束云图绘制

            if (this.commentType === CLOUD.Extensions.Comment.shapeTypes.CLOUD) {

                // 结束云图绘制，不封闭云图
                this.selectedComment.setSeal(false);
                this.createCommentEnd();
                this.deselectComment();
            }

            break;
        default :
            break;
    }
};

CLOUD.Extensions.CommentEditor.prototype.onResize = function () {

    var bounds = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = bounds.width;
    this.bounds.height = bounds.height;

    var viewBox = this.getSVGViewBox(this.bounds.width, this.bounds.height);

    this.svg.setAttribute('viewBox', viewBox);
    this.svg.setAttribute('width', this.bounds.width + '');
    this.svg.setAttribute('height', this.bounds.height + '');

    this.updateComments();
};

CLOUD.Extensions.CommentEditor.prototype.handleMouseEvent = function (event, type) {

    var mode = this.commentType;

    switch (mode) {

        case CLOUD.Extensions.Comment.shapeTypes.RECTANGLE:
            if (type === "down") {

                if (this.mouseDownForRectangle(event)) {
                    this.createCommentBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForRectangle(event);
            } else if (type === "up") {
                this.createCommentEnd();
                this.deselectComment();
            }
            break;
        case CLOUD.Extensions.Comment.shapeTypes.CIRCLE:
            if (type === "down") {

                if (this.mouseDownForCircle(event)) {
                    this.createCommentBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForCircle(event);
            } else if (type === "up") {
                //this.created()
                this.createCommentEnd();
                this.deselectComment();
            }
            break;
        case CLOUD.Extensions.Comment.shapeTypes.CROSS:
            if (type === "down") {
                if (this.mouseDownForCross(event)) {
                    this.createCommentBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForCross(event);
            } else if (type === "up") {
                this.createCommentEnd();
                this.deselectComment();
            }
            break;
        case CLOUD.Extensions.Comment.shapeTypes.CLOUD:
            if (type === "down") {
                if (this.selectedComment && this.isCreating) {
                    this.moveCommentCloud(event);
                } else {
                    if (!this.isCreating) {
                        this.mouseDownForCloud(event);
                        this.createCommentBegin();
                    }
                }
            }
            break;
        case CLOUD.Extensions.Comment.shapeTypes.TEXT:
            if (type === "down") {
                this.mouseDownForText(event);
            }
            break;
        case CLOUD.Extensions.Comment.shapeTypes.ARROW:
        default :
            if (type === "down") {

                if (this.mouseDownForArrow(event)) {
                    this.createCommentBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForArrow(event);
            } else if (type === "up") {
                this.createCommentEnd();
                this.deselectComment();
            }
            break;
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForArrow = function (event) {

    if (this.selectedComment) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var width = 2;
    var head = {x: this.originX, y: this.originY};
    var tail = {
        x: Math.round(head.x + Math.cos(Math.PI * 0.25) * width),
        y: Math.round(head.y + Math.sin(-Math.PI * 0.25) * width)
    };

    var constrain = function (head, tail, width, bounds) {

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.y = Math.round(head.y + Math.sin(Math.PI * 0.25) * width);

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.x = Math.round(head.y + Math.cos(-Math.PI * 0.25) * width);

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.y = Math.round(head.y + Math.sin(-Math.PI * 0.25) * width);
    };

    constrain(head, tail, width, this.getBounds());

    var arrowId = this.generateCommentId();
    var arrow = new CLOUD.Extensions.CommentArrow(this, arrowId);
    arrow.set(head.x, head.y, tail.x, tail.y);
    this.addComment(arrow);
    arrow.created();

    this.selectedComment = arrow;

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.mouseMoveForArrow = function (event) {

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    var arrow = this.selectedComment;
    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.originX;
    var startY = this.originY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    var head = {x: startX, y: startY};
    var tail = {x: endX, y: endY};

    var epsilon = 0.0001;

    if (Math.abs(arrow.head.x - head.x) >= epsilon || Math.abs(arrow.head.y - head.y) >= epsilon ||
        Math.abs(arrow.tail.x - tail.x) >= epsilon || Math.abs(arrow.tail.y - tail.y) >= epsilon) {

        arrow.set(head.x, head.y, tail.x, tail.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForRectangle = function (event) {

    if (this.selectedComment) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    //var position = this.clientToWorld();
    //var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var rectangle = new CLOUD.Extensions.CommentRectangle(this, id);
    rectangle.set(position, size.x, size.y);
    this.addComment(rectangle);
    rectangle.created();

    this.selectedComment = rectangle;

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.mouseMoveForRectangle = function (event) {

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    var rectangle = this.selectedComment;
    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.originX;
    var startY = this.originY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(rectangle.position.x - position.x) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon ||
        Math.abs(rectangle.position.y - position.y) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon) {

        rectangle.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForCircle = function (event) {

    if (this.selectedComment) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var circle = new CLOUD.Extensions.CommentCircle(this, id);
    circle.set(position, size.x, size.y);
    this.addComment(circle);
    circle.created();

    this.selectedComment = circle;

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.mouseMoveForCircle = function (event) {

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    var circle = this.selectedComment;
    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.originX;
    var startY = this.originY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(circle.position.x - position.x) > epsilon || Math.abs(circle.size.y - size.y) > epsilon ||
        Math.abs(circle.position.y - position.y) > epsilon || Math.abs(circle.size.y - size.y) > epsilon) {

        circle.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForCross = function (event) {

    if (this.selectedComment) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var cross = new CLOUD.Extensions.CommentCross(this, id);
    cross.set(position, size.x, size.y);
    this.addComment(cross);
    cross.created();

    this.selectedComment = cross;

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.mouseMoveForCross = function (event) {

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    var cross = this.selectedComment;
    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.originX;
    var startY = this.originY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(cross.position.x - position.x) > epsilon || Math.abs(cross.size.y - size.y) > epsilon ||
        Math.abs(cross.position.y - position.y) > epsilon || Math.abs(cross.size.y - size.y) > epsilon) {

        cross.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForCloud = function (event) {

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var cloud = new CLOUD.Extensions.CommentCloud(this, id);
    cloud.addPoint(start);
    cloud.set(position, size.x, size.y);
    this.addComment(cloud);
    cloud.created();

    this.selectedComment = cloud;

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentCloud = function (event) {

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    var size = {x: 10, y: 10};
    var cloud = this.selectedComment;
    var position = this.getPointOnDomContainer(event.clientX, event.clientY);
    cloud.addPoint(position);
};

CLOUD.Extensions.CommentEditor.prototype.mouseDoubleClickForCloud = function (event) {

    if (this.isCreating && this.selectedComment) {

        if (this.selectedComment.shapeType === CLOUD.Extensions.Comment.shapeTypes.CLOUD) {
            // 结束云图绘制，并封闭云图
            this.selectedComment.setSeal(true);
            this.createCommentEnd();
            this.deselectComment();
        }
    }
};

CLOUD.Extensions.CommentEditor.prototype.mouseDownForText = function (event) {

    if (this.commentTextArea.isActive()) {

        this.commentTextArea.accept();
        return;
    }

    if (this.selectedComment) {
        return;
    }

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);
    var clientFontSize = 16;
    var initWidth = clientFontSize * 15;
    var initHeight = clientFontSize * 3;

    var size = new THREE.Vector2(initWidth, initHeight);

    var position = new THREE.Vector2(
        start.x + (initWidth * 0.5),
        start.y + (initHeight * 0.5));

    var id = this.generateCommentId();
    var text = new CLOUD.Extensions.CommentText(this, id);
    text.set(position, size.x, size.y, '');
    this.addComment(text);
    text.created();
    text.forceRedraw();

    this.selectedComment = text;

    this.commentTextArea.active(this.selectedComment, true);

    return true;
};

CLOUD.Extensions.CommentEditor.prototype.mouseDoubleClickForText = function (event, comment) {

    if (comment) {

        if (this.selectedComment && (this.selectedComment.shapeType === CLOUD.Extensions.Comment.shapeTypes.TEXT)) {

            this.deselectComment();
            this.commentTextArea.active(comment, false);
        }
    }
};

CLOUD.Extensions.CommentEditor.prototype.init = function (callbacks) {

    if (callbacks) {

        this.beginEditCallback = callbacks.beginEditCallback;
        this.endEditCallback = callbacks.endEditCallback;
        this.changeEditorModeCallback = callbacks.changeEditorModeCallback;
    }

    if (!this.svg) {

        var svgWidth = this.domElement.offsetWidth;
        var svgHeight = this.domElement.offsetHeight;

        this.bounds.width = svgWidth;
        this.bounds.height = svgHeight;

        var viewBox = this.getSVGViewBox(svgWidth, svgHeight);

        this.svg = CLOUD.Extensions.Utils.Shape2D.createSvgElement('svg');
        this.svg.style.position = "absolute";
        this.svg.style.display = "block";
        this.svg.style.left = "0";
        this.svg.style.top = "0";
        this.svg.setAttribute('viewBox', viewBox);
        this.svg.setAttribute('width', svgWidth + '');
        this.svg.setAttribute('height', svgHeight + '');

        this.domElement.appendChild(this.svg);

        this.enableSVGPaint(false);

        this.commentFrame = new CLOUD.Extensions.CommentFrame(this, this.domElement);
        this.commentTextArea = new CLOUD.Extensions.CommentTextArea(this, this.domElement);
    }
};

CLOUD.Extensions.CommentEditor.prototype.uninit = function () {

    if (!this.svg) return;

    // 如果仍然处在编辑中，强行结束
    if (this.isEditing) {
        this.editEnd();
    }

    // 卸载数据
    this.unloadComments();

    if (this.svg.parentNode) {
        this.svg.parentNode.removeChild(this.svg);
    }

    this.svgGroup = null;
    this.svg = null;

    this.beginEditCallback = null;
    this.endEditCallback = null;
    this.changeEditorModeCallback = null;

    //this.destroy();
};

CLOUD.Extensions.CommentEditor.prototype.destroy = function () {

    if (this.commentTextArea) {

        if (this.commentTextArea.isActive()) {

            this.commentTextArea.accept();
        }
    }

    this.deselectComment();

    if (this.commentFrame) {

        this.commentFrame.destroy();
        this.commentFrame = null;
    }
};

CLOUD.Extensions.CommentEditor.prototype.generateCommentId = function () {

    //return ++this.nextCommentId;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

CLOUD.Extensions.CommentEditor.prototype.onExistEditor = function () {

    this.uninit();
};

CLOUD.Extensions.CommentEditor.prototype.editBegin = function () {

    if (this.isEditing) {
        return true;
    }

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Utils.Shape2D.createSvgElement('g');
    }

    //if (this.svgGroup.parentNode) {
    //    this.svgGroup.parentNode.removeChild(this.svgGroup);
    //}

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    this.handleCallbacks("beginEdit");

    // 注册事件
    this.addDomEventListeners();
    // 允许穿透
    this.enableSVGPaint(true);
    // 清除数据
    this.clear();

    this.isEditing = true;
};

CLOUD.Extensions.CommentEditor.prototype.editEnd = function () {

    this.isEditing = false;

    if (this.svgGroup && this.svgGroup.parentNode) {
        //this.svg.removeChild(this.svgGroup);
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    this.removeDomEventListeners();

    this.handleCallbacks("endEdit");

    // 不允许穿透
    this.enableSVGPaint(false);
    this.deselectComment();
};

CLOUD.Extensions.CommentEditor.prototype.createCommentBegin = function () {

    if (!this.isCreating) {

        this.isCreating = true;
        this.disableCommentInteractions(true);
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentEnd = function () {

    if (this.isCreating) {

        this.isCreating = false;
        this.disableCommentInteractions(false);
    }
};

CLOUD.Extensions.CommentEditor.prototype.dragCommentFrameBegin = function () {

    this.disableCommentInteractions(true)
};

CLOUD.Extensions.CommentEditor.prototype.dragCommentFrameEnd = function () {

    this.disableCommentInteractions(false)
};

CLOUD.Extensions.CommentEditor.prototype.clear = function () {

    var comments = this.comments;

    while (comments.length) {
        var comment = comments[0];
        this.removeComment(comment);
        comment.destroy();
    }

    var group = this.svgGroup;
    if (group && group.childNodes.length > 0) {
        while (group.childNodes.length) {
            group.removeChild(group.childNodes[0]);
        }
    }
};

CLOUD.Extensions.CommentEditor.prototype.setCommentType = function (type) {

    this.commentType = type;

    // 强行完成
    this.createCommentEnd();
    this.deselectComment();

    this.onFocus();
};

CLOUD.Extensions.CommentEditor.prototype.addComment = function (comment) {

    comment.setParent(this.svgGroup);

    this.comments.push(comment);
};

CLOUD.Extensions.CommentEditor.prototype.deleteComment = function (comment) {

    if (comment) {
        this.removeComment(comment);
        comment.destroy();
    }
};

CLOUD.Extensions.CommentEditor.prototype.removeComment = function (comment) {

    var idx = this.comments.indexOf(comment);

    if (idx !== -1) {
        this.comments.splice(idx, 1);
    }
};

CLOUD.Extensions.CommentEditor.prototype.setCommentSelection = function (comment) {

    if (this.selectedComment !== comment) {

        this.deselectComment();
    }

    this.selectedComment = comment;

    // 放在最前面

    if (!this.isCreating) {
        this.commentFrame.setComment(comment);
    }
};

CLOUD.Extensions.CommentEditor.prototype.selectComment = function (comment) {

    if (comment) {

        if (this.commentType === comment.shapeType) {

            this.setCommentSelection(comment)

        } else {

            var shapeType = comment.shapeType;

            this.setCommentSelection(null);
            this.setCommentType(shapeType);
            this.setCommentSelection(comment);
        }

    } else {
        this.setCommentSelection(null);
    }
};

CLOUD.Extensions.CommentEditor.prototype.deselectComment = function () {

    if (this.selectedComment) {
        this.selectedComment.deselect();
        this.selectedComment = null;
    }

    this.commentFrame.setComment(null);
};

CLOUD.Extensions.CommentEditor.prototype.worldToClient = function (point) {

    var rect = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    result.set(point.x, point.y, point.z);
    result.project(camera);

    result.x = Math.round(0.5 * (result.x + 1) * rect.width);
    result.y = Math.round(-0.5 * (result.y - 1) * rect.height);
    result.z = 0;

    return result;
};

CLOUD.Extensions.CommentEditor.prototype.clientToWorld = function (x, y, depth) {

    var rect = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    depth = depth || 0;

    result.x = x / rect.width * 2 - 1;
    result.y = -y / rect.height * 2 + 1;
    result.z = depth;

    result.unproject(camera);
    result.z = 0;

    //result.add(camera.position).applyMatrix4(camera.matrixWorldInverse);
    //result.z = 0;

    return result;
};

CLOUD.Extensions.CommentEditor.prototype.calcBoundingBox = function () {

    return null;
};

CLOUD.Extensions.CommentEditor.prototype.getBounds = function () {

    return this.bounds;
};

CLOUD.Extensions.CommentEditor.prototype.getPointOnDomContainer = function (clientX, clientY) {

    var rect = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);

    return new THREE.Vector2(clientX - rect.left, clientY - rect.top);
};

CLOUD.Extensions.CommentEditor.prototype.getSVGViewBox = function (clientWidth, clientHeight) {

    //var lt = this.clientToWorld(0, 0);
    //var rb = this.clientToWorld(clientWidth, clientHeight);

    //var lt = {x: 0, y: 0};
    //var rb = {x:clientWidth, y:clientHeight};
    //
    //var l = Math.min(lt.x, rb.x);
    //var t = Math.min(lt.y, rb.y);
    //var r = Math.max(lt.x, rb.x);
    //var b = Math.max(lt.y, rb.y);
    //
    //return [l, t, r - l, b - t].join(' ');

    return [0, 0, clientWidth, clientHeight].join(' ');
};

CLOUD.Extensions.CommentEditor.prototype.handleTextChange = function (data) {

    var text = data.comment;

    if (data.text === '') {

        this.selectComment(null);
        return;
    }

    var position = {x: data.position.x, y: data.position.y};
    var size = {x: data.width, y: data.height};

    text.setSize(size.x, size.y, position);
    text.setText(data.text);

    this.createCommentEnd();
    this.deselectComment();
};

CLOUD.Extensions.CommentEditor.prototype.disableCommentInteractions = function (disable) {

    this.comments.forEach(function (comment) {
        comment.disableInteractions(disable);
    });
};

CLOUD.Extensions.CommentEditor.prototype.handleCallbacks = function (name) {

    switch (name) {

        case "beginEdit":
            if (this.beginEditCallback) {
                this.beginEditCallback(this.domElement);
            }
            break;
        case "endEdit":
            if (this.endEditCallback) {
                this.endEditCallback(this.domElement);
            }
            break;
        case "changeEditor":
            if (this.isCameraChange && this.changeEditorModeCallback) {

                this.changeEditorModeCallback(this.domElement);
            }
            break;
    }

};

CLOUD.Extensions.CommentEditor.prototype.renderToCanvas = function (ctx) {

    this.comments.forEach(function (comment) {
        ctx.save();
        comment.renderToCanvas(ctx);
        ctx.restore();
    });
};

// 是否允许在SVG上绘图
CLOUD.Extensions.CommentEditor.prototype.enableSVGPaint = function (enable) {

    if (enable) {

        this.svg.setAttribute("pointer-events", "painted");
    } else {

        this.svg.setAttribute("pointer-events", "none");
    }

};

// ---------------------------- 外部 API BEGIN ---------------------------- //

// 屏幕快照
CLOUD.Extensions.CommentEditor.prototype.composeScreenSnapshot = function (snapshot) {

    var canvas = document.createElement("canvas");

    var bounds = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    canvas.width = bounds.width;
    canvas.height = bounds.height;

    var ctx = canvas.getContext('2d');
    var preSnapshot = new Image();
    preSnapshot.src = snapshot;

    var startColor = this.gradientStartColor;
    var stopColor = this.gradientStopColor;

    // 绘制背景
    if (startColor) {

        if (stopColor) {

            var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, stopColor);

            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = startColor;
        }

        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 先绘制之前的图像
    ctx.drawImage(preSnapshot, 0, 0);
    // 绘制批注
    this.renderToCanvas(ctx);

    var data = canvas.toDataURL("image/png");

    canvas = ctx = null;

    return data;
};

// 设置导出背景色
CLOUD.Extensions.CommentEditor.prototype.setBackgroundColor = function (startColor, stopColor) {

    this.gradientStartColor = startColor;
    this.gradientStopColor = stopColor;
};

// 获得批注列表
CLOUD.Extensions.CommentEditor.prototype.getCommentInfoList = function () {

    var commentInfoList = [];

    for (var i = 0, len = this.comments.length; i < len; i++) {
        var comment = this.comments[i];

        var text = "";
        if (comment.shapeType === CLOUD.Extensions.Comment.shapeTypes.TEXT) {
            text = comment.currText;
        }

        var shapePoints = "";
        var isSeal = false;
        if (comment.shapeType === CLOUD.Extensions.Comment.shapeTypes.CLOUD) {
            shapePoints = comment.getShapePoints();
            isSeal = comment.isSeal;
        }

        var arrowHead = null;
        var arrowTail = null;

        if (comment.shapeType === CLOUD.Extensions.Comment.shapeTypes.ARROW) {
            arrowHead = comment.head;
            arrowTail = comment.tail;
        }

        var info = {
            id: comment.id,
            shapeType: comment.shapeType,
            rotation: comment.rotation,
            position: comment.position,
            size: comment.size,
            isSeal: isSeal,
            shapePoints: shapePoints,
            arrowHead: arrowHead,
            arrowTail: arrowTail,
            text: text
        };

        commentInfoList.push(info);
    }

    return commentInfoList;
};

// 加载批注
CLOUD.Extensions.CommentEditor.prototype.loadComments = function (commentInfoList) {

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Utils.Shape2D.createSvgElement('g');
    }

    // 清除数据
    this.clear();

    //if (this.svgGroup.parentNode) {
    //    this.svgGroup.parentNode.removeChild(this.svgGroup);
    //}

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    for (var i = 0, len = commentInfoList.length; i < len; i++) {

        var info = commentInfoList[i];
        var id = info.id;
        var shapeType = info.shapeType;
        var position = info.position;
        var size = info.size;
        var shapePointsStr = info.shapePoints;
        var text = info.text;
        var arrowHead = info.arrowHead;
        var arrowTail = info.arrowTail;
        var rotation = info.rotation;
        var isSeal = info.isSeal;

        switch (shapeType) {

            case CLOUD.Extensions.Comment.shapeTypes.ARROW:
                var arrow = new CLOUD.Extensions.CommentArrow(this, id);
                arrow.set(arrowHead.x, arrowHead.y, arrowTail.x, arrowTail.y);
                arrow.setRotation(rotation);
                this.addComment(arrow);
                arrow.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.RECTANGLE:
                var rectangle = new CLOUD.Extensions.CommentRectangle(this, id);
                rectangle.set(position, size.x, size.y);
                rectangle.setRotation(rotation);
                this.addComment(rectangle);
                rectangle.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.CIRCLE:
                var circle = new CLOUD.Extensions.CommentCircle(this, id);
                circle.set(position, size.x, size.y);
                circle.setRotation(rotation);
                this.addComment(circle);
                circle.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.CROSS:
                var cross = new CLOUD.Extensions.CommentCross(this, id);
                cross.set(position, size.x, size.y);
                cross.setRotation(rotation);
                this.addComment(cross);
                cross.created();
                break;
            case CLOUD.Extensions.Comment.shapeTypes.CLOUD:
                var cloud = new CLOUD.Extensions.CommentCloud(this, id);
                cloud.setShapePoints(shapePointsStr);
                cloud.setSeal(isSeal);
                cloud.set(position, size.x, size.y);
                cloud.setRotation(rotation);
                this.addComment(cloud);
                cloud.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.TEXT:
                var textComment = new CLOUD.Extensions.CommentText(this, id);
                textComment.set(position, size.x, size.y, text);
                textComment.setRotation(rotation);
                this.addComment(textComment);
                textComment.created();
                textComment.forceRedraw();
                break;
            default :
                break;
        }
    }
};

// 卸载批注
CLOUD.Extensions.CommentEditor.prototype.unloadComments = function () {

    // 清除数据
    this.clear();

    if (this.svgGroup && this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }
};

// 显示批注
CLOUD.Extensions.CommentEditor.prototype.showComments = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "visible");
    }
};

// 隐藏批注
CLOUD.Extensions.CommentEditor.prototype.hideComments = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "hidden");
    }
};

// 设置批注风格（边框色，填充色，字体大小等等）
CLOUD.Extensions.CommentEditor.prototype.setCommentStyle = function (style) {

    this.commentStyle = CLOUD.DomUtil.cloneStyle(style);
};

// 更新所有批注
CLOUD.Extensions.CommentEditor.prototype.updateComments = function () {

    for (var i = 0, len = this.comments.length; i < len; i++) {
        var comment = this.comments[i];
        comment.updateStyle();
    }
};

// ---------------------------- 外部 API END ---------------------------- //
