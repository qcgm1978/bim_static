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

    createSvgElement: function (type) {

        var xmlns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(xmlns, type);
        svg.setAttribute('pointer-events', 'inherit');

        return svg;
    },
    getRGBAString: function (hexRGBString, opacity) {

        if (opacity <= 0) {
            return 'none';
        }

        var rgba = ['rgba(' +
        parseInt('0x' + hexRGBString.substr(1, 2)), ',',
            parseInt('0x' + hexRGBString.substr(3, 2)), ',',
            parseInt('0x' + hexRGBString.substr(5, 2)), ',', opacity, ')'].join('');

        return rgba;
    },
    makeFlag: function () {

        var path = "M0 0 L0 -20 L15 -13 L4 -6.87 L4 0Z";
        var shape = this.createSvgElement('path');
        shape.setAttribute('d', path);

        return shape;
    },
    makeBubble: function (style) {

        var path = "m0.0035,-19.88544c-3.838253,0 -6.95,2.581968 -6.95,5.766754c0,3.185555 6.95,13.933247 6.95,13.933247s6.95,-10.747692 6.95,-13.933247c0,-3.184786 -3.11082,-5.766754 -6.95,-5.766754z";
        var shape = this.createSvgElement('path');
        shape.setAttribute('d', path);

        return shape;
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
CLOUD.MiniMap = function (viewer) {

    this.viewer = viewer;
    this.visible = true;
    this.width = 0;
    this.height = 0;
    this.domContainer = null;
    this.autoClear = true;
    this.mouseButtons = {LEFT: THREE.MOUSE.LEFT, RIGHT: THREE.MOUSE.RIGHT};
    this.callbackCameraChanged = null;
    this.callbackClickOnAxisGrid = null;
    this.initialized = false;

    var scope = this;
    var _mapContainer;
    var normalizedMouse = new THREE.Vector2();

    var _clearColor = new THREE.Color(), _clearAlpha = 1;
    var _defaultClearColor = 0x333333;//0xffffff; // 0xadadad; // 缺省背景色
    var _materialColor = 0x999999;

    // 轴网材质
    var _materialGrid = new THREE.LineBasicMaterial({
        color: _materialColor,
        linewidth: 0.5
    });

    var _xmlns = "http://www.w3.org/2000/svg";
    //var _svg = document.createElementNS(_xmlns, 'svg');
    //var _svgGroupForAxisGrid = document.createElementNS(_xmlns, "g");
    var _svg, _svgGroupForAxisGrid;
    var _svgPathPool = [], _svgLinePool = [], _svgTextPool = [], _svgImagePool = [],_svgCirclePool = [],
        _pathCount = 0, _lineCount = 0, _textCount = 0, _imageCount = 0, _circleCount = 0, _quality = 1;
    var _svgNode, _svgWidth, _svgHeight, _svgHalfWidth, _svgHalfHeight;

    var _clipBox2D = new THREE.Box2(), _elemBox2D = new THREE.Box2(), _axisGridBox2D = new THREE.Box2();

    var _axisGridElements = [], _axisGridIntersectionPoints = [], _axisGridLevels = [];
    var _axisGridNumberCircleRadius = 10, _axisGridNumberFontSize = 8, _axisGridNumberInterval = 3; // 轴号间隔
    var _isShowAxisGrid = false, _isLoadedAxisGrid = false, _isLoadedFloorPlane = false;

    var _enableFlyByClick = true; // 是否允许click飞到指定位置

    var _tipNode, _circleNode, _highlightHorizLineNode, _highlightVerticalLineNode, _cameraNode, _cameraArrowNode, _cameraCircleNode;
    var _highlightColor = '#258ae3', _tipNodeColor = "#000", _tipNodeBackgroundColor = "#fff";
    var _highlightLineWidth = 1, _circleNodeRadius = 3;
    var _hasHighlightInterPoint = false;

    var _floorPlaneMinZ = 0; // 平面图最小高度
    var _cameraProjectedPosZ = 0; // 相机投影点位置高度
    var _floorPlaneBox, _floorPlaneUrl;

    var _enableShowCamera = true;
    var _lastCameraWorldPosition;
    var _epsilon = 0.00001;

    var _isNormalizeMousePoint = false;
    var _isChangeView = false;

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

        if (_isLoadedFloorPlane) {
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

                    // 绘制轴号
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

    // 计算轴网包围盒
    function calculateAxisGridBox(grids) {

        _axisGridBox2D.makeEmpty();

        // 计算轴网包围盒
        for (var i = 0, len = grids.length; i < len; i++) {

            var start = new THREE.Vector2(grids[i].start.X, grids[i].start.Y);
            var end = new THREE.Vector2(grids[i].end.X, grids[i].end.Y);

            _axisGridBox2D.expandByPoint(start);
            _axisGridBox2D.expandByPoint(end);
        }

        var offset = 4;

        if (_isShowAxisGrid) {

            var center = _axisGridBox2D.center();
            var oldSize = _axisGridBox2D.size();
            var newSize = new THREE.Vector2();
            newSize.x = oldSize.x * _svgWidth / (_svgWidth - 4.0 * (_axisGridNumberCircleRadius + offset));
            newSize.y = oldSize.y * _svgHeight / (_svgHeight - 4.0 * (_axisGridNumberCircleRadius + offset));

            _axisGridBox2D.setFromCenterAndSize(center, newSize);
        }
    }

    // 计算轴网交叉点
    function calculateAxisGridIntersection(grids, material) {

        if (_axisGridElements.length > 0) {
            //_axisGridElements.splice(0,_axisGridElements.length);
            _axisGridElements = [];
        }

        if (_axisGridIntersectionPoints.length > 0) {
            _axisGridIntersectionPoints = [];
        }

        var horizLineElements = []; // 水平线集合
        var verticalLineElements = []; // 垂直线集

        var i = 0, j = 0, len = grids.length;

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
                horizLineElements.push({name: name, v1: start, v2: end, material: material});
            } else {
                // 垂直方向线条
                verticalLineElements.push({name: name, v1: start, v2: end, material: material});
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
    }

    this.enableMouseEvent = function(enable) {

        _enableFlyByClick = enable;
        //this.render();
    };

    this.isEnableMouseEvent = function() {
        return _enableFlyByClick;
    };

    this.isMouseOverCanvas = function (mouse) {

        var domElement = _mapContainer;

        _isNormalizeMousePoint = false;

        if (domElement) {
            var dim = CLOUD.DomUtil.getContainerOffsetToClient(domElement);
            var canvasMouse = new THREE.Vector2();

            // 计算鼠标点相对于所在视口的位置
            canvasMouse.x = mouse.x - dim.left;
            canvasMouse.y = mouse.y - dim.top;

            if (dim.width === 0 || dim.height === 0) {
                return false;
            }

            // 规范化坐标系[-1, 1]
            if (canvasMouse.x > 0 && canvasMouse.x < this.width && canvasMouse.y > 0 && canvasMouse.y < this.height) {
                normalizedMouse.x = canvasMouse.x / this.width * 2 - 1;
                normalizedMouse.y = -canvasMouse.y / this.height * 2 + 1;

                _isNormalizeMousePoint = true;

                return true;
            }
        }

        return false;
    };

    this.onMouseDown = function (event) {

        if (this.viewer.isMouseMoving()) {
            return;
        }

        this.isMouseDown = true;
    };

    this.onMouseMove = function (event) {

        if (this.viewer.isMouseMoving()) {
            return;
        }

        if (!_enableFlyByClick) return;

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);

        this.highlightedNode(isOverCanvas, _isShowAxisGrid, false);
    };

    this.onMouseUp = function (event) {

        if (!this.isMouseDown) {

            return;
        }

        this.isMouseDown = false;

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);
        var isExistData = _isLoadedAxisGrid || _isLoadedFloorPlane;

        if (!_enableFlyByClick) {

            this.highlightedNode(isOverCanvas, _isShowAxisGrid, true);

            return;
        }

        if (isOverCanvas && isExistData ) {

            // 计算选中点的坐标
            var clickPoint = new THREE.Vector3();
            var clickPoint2D = normalizedMouse.clone();
            normalizedPointToWorld(clickPoint2D);

            // 如果靠近交点，使用交点会更好，不然感觉靠近交点高亮时，点击的位置不一致。
            var screenPosition = normalizedMouse.clone();
            normalizedPointToScreen(screenPosition);

            // 获得最近的交点
            var intersection = this.getIntersectionToMinDistance(screenPosition);

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

            this.flyToPointWithParallelEye(clickPoint);
        }
    };

    this.onContextMenu = function(event) {

        event.preventDefault();
    };

    this.onMouseDownBinded = this.onMouseDown.bind(this);
    this.onMouseMoveBinded = this.onMouseMove.bind(this);
    this.onMouseUpBinded = this.onMouseUp.bind(this);
    this.onContextMenuBinded = this.onContextMenu.bind(this);

    this.addDomEventListeners = function () {

        if (_mapContainer) {

            _mapContainer.addEventListener( 'contextmenu', this.onContextMenuBinded, false );
            _mapContainer.addEventListener('mousedown', this.onMouseDownBinded, false);
            _mapContainer.addEventListener('mousemove', this.onMouseMoveBinded, false);
            _mapContainer.addEventListener('mouseup', this.onMouseUpBinded, false);
        }
    };

    this.removeDomEventListeners = function () {

        if (_mapContainer) {

            _mapContainer.removeEventListener( 'contextmenu', this.onContextMenuBinded, false );
            _mapContainer.removeEventListener('mousedown', this.onMouseDownBinded, false);
            _mapContainer.removeEventListener('mousemove', this.onMouseMoveBinded, false);
            _mapContainer.removeEventListener('mouseup', this.onMouseUpBinded, false);
        }
    };

    this.init = function (domContainer, width, height, styleOptions, alpha) {

        width = width || 320;
        height = height || 240;
        alpha = alpha || 0;

        if (!_svg) {
            _svg = document.createElementNS(_xmlns, 'svg');
            _svgGroupForAxisGrid = document.createElementNS(_xmlns, "g");
        }

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
        this.addDomEventListeners();

        _hasHighlightInterPoint = false;

        if (this.callbackClickOnAxisGrid) {

            var gridInfo = {
                position: '',
                abcName: '',
                numeralName: '',
                offsetX: '',
                offsetY: ''
            };
            this.callbackClickOnAxisGrid(gridInfo);
        }

        this.initialized = true;
    };

    this.uninit = function() {

        if (this.initialized) {

            this.initialized = false;

            this.removeDomEventListeners();

            this.clear();

            if ( _svg.parentNode) {

                _svg.parentNode.removeChild(_svg)
            }

            this.remove();

            _mapContainer = null;
            _svg = null;
            _svgGroupForAxisGrid = null;
        }

    };

    // 设置绘图面板大小
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

            //this.resizeClientAxisGrid();
            //
            //_svgGroupForAxisGrid.style.display = "";
            //
            //if (_hasHighlightInterPoint) {
            //    this.showTip();
            //}
            //
            //this.render();
        }
    };

    // 设置绘图面板背景色
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

        if (!_isLoadedAxisGrid) return;

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

    // 初始化绘图面板
    this.initCanvasContainer = function (domContainer, styleOptions) {

        this.domContainer = domContainer;

        if (!_mapContainer) {
            _mapContainer = document.createElement("div");
            setContainerElementStyle(_mapContainer, styleOptions);
            domContainer.appendChild(_mapContainer);
            _mapContainer.appendChild(_svg);
        }
    };

    // 初始化相机图形节点
    this.initCameraNode = function () {

        if (!_cameraNode) {

            _cameraNode = document.createElementNS (_xmlns, 'g');
            _cameraNode.setAttribute('fill', '#1b8cef');
            _cameraNode.setAttribute('stroke', '#cbd7e1');
            _cameraNode.setAttribute('stroke-width', '1');
            _cameraNode.setAttribute('stroke-linejoin', 'round');
            //_cameraNode.setAttribute('opacity', '0.0');

            // 尺寸大小 直径 12px
            var circle = document.createElementNS (_xmlns, 'circle');
            circle.setAttribute('r', '6');
            _cameraCircleNode = circle;

            var path = document.createElementNS (_xmlns, 'path');
            path.setAttribute('d', 'M 7 6 Q 10 0, 7 -6 L 19 0 Z');
            _cameraArrowNode = path;

            _cameraNode.appendChild (circle);
            _cameraNode.appendChild (path);
        }

        _cameraNode.setAttribute('opacity', '0.0');
    };

    // 初始化提示节点
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
            _tipNode.className = "";
            //_tipNode.className = "cloud-tip";
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

        _tipNode.style.opacity = 0;

        if (!_circleNode) {
            _circleNode = document.createElementNS(_xmlns, 'circle');
            _circleNode.setAttribute('r', _circleNodeRadius + '');
            _circleNode.setAttribute('fill', _highlightColor);
            //_circleNode.style.opacity = 0;
        }

        _circleNode.style.opacity = 0;

        if (!_highlightHorizLineNode) {
            _highlightHorizLineNode = document.createElementNS(_xmlns, 'line');
            _highlightHorizLineNode.setAttribute('style', 'stroke:' + _highlightColor + ';stroke-width:' + _highlightLineWidth + '');
            //_highlightHorizLineNode.style.opacity = 0;
        }

        _highlightHorizLineNode.style.opacity = 0;

        if (!_highlightVerticalLineNode) {
            _highlightVerticalLineNode = document.createElementNS(_xmlns, 'line');
            _highlightVerticalLineNode.setAttribute('style', 'stroke:' + _highlightColor + ';stroke-width:' + _highlightLineWidth + '');
            //_highlightVerticalLineNode.style.opacity = 0;
        }

        _highlightVerticalLineNode.style.opacity = 0;
    };

    // 构造轴网
    this.generateAxisGrid = function() {

        var jsonObj = CLOUD.MiniMap.axisGridData;

        if (!jsonObj)  return;

        var grids = jsonObj.Grids;
        var len = grids.length;

        if (len < 1) {

            console.error("axis grid data error!!!");
            return;
        }

        _isLoadedAxisGrid = true;

        this.initAxisGird(grids);

        // 如果先初始化平面图，后初始化轴网，因为轴网确定范围，则需要重新初始化平面图
        if (_isLoadedFloorPlane) {

            console.log("re-initialize floor plane!!!");

            this.initFloorPlane();

            if (_isChangeView) {
                this.fly();
            }else {
                this.render();
            }

        } else {
            this.render();
        }
    };

    // 初始化轴网
    this.initAxisGird = function (grids) {

        // 计算轴网包围盒
        calculateAxisGridBox(grids);

        // 计算轴网交叉点
        calculateAxisGridIntersection(grids, _materialGrid);
    };

    //this.initAxisGirdLevels = function (levels) {
    //    var len = levels.length;
    //
    //    if (len < 1) {
    //        return;
    //    }
    //
    //    for (var i = 0; i < len; i++) {
    //        _axisGridLevels.push(levels[i]);
    //    }
    //};

    // 构造平面图
    this.generateFloorPlane = function(changeView) {

        if (changeView === undefined) {
            changeView = false;
        }

        _isChangeView = changeView;


        var jsonObj = CLOUD.MiniMap.floorPlaneData;

        if (!jsonObj) return;

        var url = jsonObj["Path"] || jsonObj["path"];
        var boundingBox = jsonObj["BoundingBox"] || jsonObj["boundingBox"];

        if (!url || !boundingBox) {
            console.warn('floor-plan data is error!');
            return;
        }

        _floorPlaneUrl = url;
        _floorPlaneBox = new THREE.Box3(new THREE.Vector3(boundingBox.Min.X, boundingBox.Min.Y, boundingBox.Min.Z), new THREE.Vector3(boundingBox.Max.X, boundingBox.Max.Y, boundingBox.Max.Z));

        // 设置相机投影点位置高度在平面图包围盒中心
        _cameraProjectedPosZ = 0.5 * (_floorPlaneBox.min.z + _floorPlaneBox.max.z);
        _floorPlaneMinZ = _floorPlaneBox.min.z;

        _isLoadedFloorPlane = true;

        if (!_isLoadedAxisGrid) {
            console.warn('axis-grid is not initialized!');

            return;
        }

        this.initFloorPlane();

        // render
        if (_isChangeView) {
            this.fly();
        }else {
            this.render();
        }

    };

    // 初始化平面图
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
        _svgNode.setAttribute("preserveAspectRatio", "none");
        _svgNode.setAttribute("width", width + "");
        _svgNode.setAttribute("height", height + "");
        _svgNode.setAttribute("x", (-0.5 * width) + "");
        _svgNode.setAttribute("y", (-0.5 * height) + "");
        _svgNode.setAttribute("transform", 'translate(' + offset.x + ',' + offset.y + ')');
    };

    // 重设轴网大小
    this.resizeClientAxisGrid = function() {

        var grids = CLOUD.MiniMap.axisGridData.Grids;

        this.initAxisGird(grids);

        if (_isLoadedFloorPlane) {
            this.initFloorPlane();
        }
    };

    // 显示轴网
    this.showAxisGird = function () {

        if (_isLoadedAxisGrid) {

            _isShowAxisGrid = true;

            this.resizeClientAxisGrid();

            //_svgGroupForAxisGrid.style.opacity = 1;
            _svgGroupForAxisGrid.style.display = "";

            if (_hasHighlightInterPoint) {
                this.showTip();
            }

            this.render();
        }
    };

    // 隐藏轴网
    this.hideAxisGird = function () {

        if (_isLoadedAxisGrid) {

            _isShowAxisGrid = false;

            this.resizeClientAxisGrid();

            //_svgGroupForAxisGrid.style.opacity = 0;
            _svgGroupForAxisGrid.style.display = "none";

            this.hideTip();

            this.render();
        }
    };

    // 显示提示节点
    this.showTip = function () {

        if (_tipNode) {
            _tipNode.className = "cloud-tip";
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

    // 隐藏提示节点
    this.hideTip = function () {

        if (_tipNode) {
            _tipNode.className = "";
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

    // 通过轴网号高亮
    this.highlightNodeByAxisGridNumber = function (abcName, numeralName) {

        var intersection = this.getIntersectionByAxisGridNumber(abcName, numeralName);

        if (intersection) {

            this.setHighlightNode(intersection);
            this.showTip();

        } else {

            this.hideTip();
        }

        this.render();
    };

    // 高亮节点
    this.highlightedNode = function (isOverCanvas, isShowAxisGrid, allowNear) {

        _hasHighlightInterPoint = false;

        if (isOverCanvas && isShowAxisGrid) {

            var intersection;

            // 允许获得离选中的点最近的交点
            if (allowNear) {

                var screenPosition = normalizedMouse.clone();
                normalizedPointToScreen(screenPosition);
                // 获得最近的轴网交点
                intersection = this.getIntersectionToMinDistance(screenPosition);

            } else {

                intersection = this.getIntersectionByNormalizedPoint(normalizedMouse);
            }

            if (intersection) {

                _hasHighlightInterPoint = true;

                this.setHighlightNode(intersection);
                this.showTip();

            } else {

                this.hideTip();
            }

            this.render();

            if (this.callbackClickOnAxisGrid) {

                var gridInfo = this.getAxisGridInfoByNormalizedPoint(normalizedMouse);
                this.callbackClickOnAxisGrid(gridInfo);
            }
        } else {

            this.hideTip();
            this.render();
        }

    };

    // 设置节点高亮状态
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

    // 获得主场景变换矩阵
    this.getMainSceneMatrix = function () {

        return this.viewer.getScene().getRootNodeMatrix();
    };

    // 判断点是否在场景包围盒中
    this.containsPointInMainScene = function(point) {

        var boundingBox = this.viewer.getScene().getRootNodeBoundingBox();

        if (boundingBox) {
            return boundingBox.containsPoint(point);
        }

        return false;
    };

    // 根据指定位置点获得轴网信息
    this.getAxisGridInfoByPoint = function(point) {

        if (_isLoadedFloorPlane) {

            var sceneMatrix = this.getMainSceneMatrix();
            var inverseMatrix = new THREE.Matrix4();
            inverseMatrix.getInverse(sceneMatrix);

            // 点对应的世界坐标
            var pointWorldPosition = point.clone();
            pointWorldPosition.applyMatrix4(inverseMatrix);

            // 屏幕坐标
            var screenPosition = pointWorldPosition.clone();
            worldToNormalizedPoint(screenPosition);
            normalizedPointToScreen(screenPosition);

            // 获得最近的轴网交点
            var intersection = this.getIntersectionToMinDistance(screenPosition);

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
        }

        return {
            position: new THREE.Vector3(),
            abcName: '',
            numeralName: '',
            offsetX: '',
            offsetY: ''
        };
    };

    // 根据规范化坐标点获得轴网信息
    this.getAxisGridInfoByNormalizedPoint = function(normalizedPoint) {

        if (_isLoadedFloorPlane) {

            // 世界坐标
            var pointWorldPosition = normalizedPoint.clone();
            normalizedPointToWorld(pointWorldPosition);

            // 屏幕坐标
            var screenPosition = normalizedPoint.clone();
            normalizedPointToScreen(screenPosition);

            // 获得最近的轴网交点
            var intersection = this.getIntersectionToMinDistance(screenPosition);

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
        }

        return {
            position: new THREE.Vector3(),
            abcName: '',
            numeralName: '',
            offsetX: '',
            offsetY: ''
        };
    };

    // 根据正规化坐标获得轴网交叉点
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

    // 根据轴网号获得轴网交叉点
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

    // 获得离指定位置最近的交叉点
    this.getIntersectionToMinDistance = function (screenPosition) {

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

    // 计算相机在小地图上的位置
    this.calculateCameraPosition = function () {

        if (!_isLoadedFloorPlane) return;

        var camera = this.viewer.camera;
        var cameraEditor = this.viewer.cameraEditor;

        if (!camera || !cameraEditor) return;

        var cameraPosition = camera.position;
        var cameraTargetPosition = cameraEditor.target;
        var sceneMatrix = this.getMainSceneMatrix();
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

            // 计算边缘交点
            var newProjectedCameraPosition = this.calculateEdgePositionCameraOutBounds(_axisGridBox2D, projectedCameraPosition, projectedEye);

            if (newProjectedCameraPosition) {

                var newCameraScreenPosition = new THREE.Vector2(newProjectedCameraPosition.x, newProjectedCameraPosition.y);
                worldToNormalizedPoint(newCameraScreenPosition);
                normalizedPointToScreen(newCameraScreenPosition);

                _cameraArrowNode.setAttribute('opacity', '1.0');
                _cameraCircleNode.setAttribute('opacity', '0.0');
                _cameraNode.setAttribute("transform", "translate(" + newCameraScreenPosition.x + "," + newCameraScreenPosition.y + ") rotate(" + angle + ")");

            } else {
                _cameraArrowNode.setAttribute('opacity', '1.0');
                _cameraCircleNode.setAttribute('opacity', '1.0');
                _cameraNode.setAttribute("transform", "translate(" + cameraScreenPosition.x + "," + cameraScreenPosition.y + ") rotate(" + angle + ")");

            }
        }

        // 设置回调相机信息
        this.setCallbackCameraInfo(cameraWorldPosition, cameraScreenPosition);

        _lastCameraWorldPosition = cameraWorldPosition.clone();

        var cameraProjectedWorldPosition = new THREE.Vector3(projectedCameraPosition.x, projectedCameraPosition.y, _cameraProjectedPosZ);

        return {
            worldPosition: cameraWorldPosition,
            projectedWorldPosition : cameraProjectedWorldPosition,
            screenPosition : cameraScreenPosition
        }
    };

    // 计算相机在边界上的位置
    this.calculateEdgePositionCameraOutBounds = function(bBox, worldPosition, direction){

        // 先计算射线与Y轴平行的两个面的交点，再计算射线与X轴平行的两个面的交点

        var isExistedPoint = function(points, p) {

            var existEqual = false;

            for (var i = 0, len = points.length; i < len; i++) {

                if (CLOUD.Extensions.Utils.Geometric.isEqualBetweenPoints(p, points[i], _epsilon)) {
                    existEqual = true;
                    break;
                }
            }
            
            return existEqual;
        };

        // 将包围盒上下左右拉大0.5，预防浮点精度问题
        var extendBox = bBox.clone();
        extendBox.min.x -= 0.5;
        extendBox.min.y -= 0.5;
        extendBox.max.x += 0.5;
        extendBox.max.y += 0.5;

        // 判断点是否在包围盒中，不在则计算与边缘的交点
        if (!extendBox.containsPoint(worldPosition)) {

            var intersects = [];

            var origin = new THREE.Vector3(worldPosition.x, worldPosition.y, 0);
            var ray = new THREE.Ray(origin, direction);

            // 与Y轴平行的面
            var point = new THREE.Vector3(bBox.min.x, bBox.min.y, 0);
            var normal = new THREE.Vector3(-1, 0, 0);
            var plane = new THREE.Plane();
            plane.setFromNormalAndCoplanarPoint(normal, point);

            var intersect = ray.intersectPlane(plane);

            if (intersect && extendBox.containsPoint(intersect)) {
                intersects.push(intersect);
            }

            // 与Y轴平行的面
            point.set(bBox.max.x, bBox.max.y, 0);
            normal.set(-1, 0, 0);
            plane.setFromNormalAndCoplanarPoint(normal, point);
            intersect = ray.intersectPlane(plane);

            if (intersect && extendBox.containsPoint(intersect)) {
                intersects.push(intersect);
            }

            // 与X轴平行的面
            point.set(bBox.min.x, bBox.min.y, 0);
            normal.set(0, 1, 0);
            plane.setFromNormalAndCoplanarPoint(normal, point);
            intersect = ray.intersectPlane(plane);

            if (intersect && extendBox.containsPoint(intersect)) {

                // 判断是否存在同一个点（四个角的位置可能出现同点）
                if (!isExistedPoint(intersect, intersects)) {
                    intersects.push(intersect);
                }

            }

            // 与X轴平行的面
            point.set(bBox.max.x, bBox.max.y, 0);
            normal.set(0, 1, 0);
            plane.setFromNormalAndCoplanarPoint(normal, point);
            intersect = ray.intersectPlane(plane);

            if (intersect && extendBox.containsPoint(intersect)) {

                // 判断是否存在同一个点（四个角的位置可能出现同点）
                if (!isExistedPoint(intersect, intersects)) {
                    intersects.push(intersect);
                }
            }

            if (intersects.length != 2) {

                return null;
            }

            // 存在两个交点则射线与包围盒相交
            var inter1 = intersects[0];
            var inter2 = intersects[1];

            var dir = inter2.clone().sub(inter1).normalize();

            if (CLOUD.Extensions.Utils.Geometric.isEqualBetweenPoints(dir, direction, _epsilon)) {

                return intersects[0];

            } else {

                return intersects[1];

            }

        }

        return null;
    };

    // 定位
    this.fly = function() {

        var cameraPosition = this.calculateCameraPosition();
        var cameraProjectedWorldPosition = cameraPosition.projectedWorldPosition.clone();

        // 变换到缩放后的场景区域
        transformWorldPoint(cameraProjectedWorldPosition);
        this.flyToPointWithParallelEye(cameraProjectedWorldPosition);
    };

    // 根据给定世界系中的点以平行视线方向定位
    this.flyToPointWithParallelEye = function(wPoint) {

        this.viewer.cameraEditor.flyToPointWithParallelEye(wPoint);
    };

    // 根据轴号定位
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

        if (this.callbackCameraChanged && posChanged) {

            var cameraWorldPos = worldPosition.clone();

            // 获得离相机最近的交点
            var intersection = this.getIntersectionToMinDistance(screenPosition);

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

                this.callbackCameraChanged(jsonObj);
            } else {

                var jsonObj = {
                    position: cameraWorldPos,
                    isInScene : false,
                    axis: {
                        abcName: '',
                        numeralName: '',
                        offsetX: '',
                        offsetY: '',
                        offsetZ: '',
                        infoX: '',
                        infoY: ''
                    }
                };

                this.callbackCameraChanged(jsonObj);
            }
        }
    };

    // 启用或禁用相机图标
    this.enableCameraNode = function(enable) {

        _enableShowCamera = enable;
        //this.render();
    };

    // 从主容器中移除小地图
    this.remove = function() {

        if (_mapContainer && _mapContainer.parentNode) {

            _mapContainer.parentNode.removeChild(_mapContainer);
        }
    };

    // 增加小地图到主容器
    this.append = function() {

        if (_mapContainer && !_mapContainer.parentNode) {

            this.domContainer.appendChild(_mapContainer);

            this.render();
        }
    };

    // 相机变化回调
    this.setCameraChangedCallback = function(callback) {

        this.callbackCameraChanged = callback;
    };

    // 轴网上点击回调
    this.setClickOnAxisGridCallback = function(callback) {

        this.callbackClickOnAxisGrid = callback;
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


CLOUD.Extensions.Marker = function (id, editor) {

    this.id = id;
    this.editor = editor;

    this.position = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    this.shape = null;
    this.shapeOffset = {offsetX : 0, offsetY: 0}; // 屏幕坐标顶点在左上角

    this.style = CLOUD.Extensions.Marker.getDefaultStyle();

    this.selected = false;
    this.highlighted = false;
    this.highlightColor = '#faff3c';
    this.isDisableInteractions = false;

    this.onMouseDownBinded = this.onMouseDown.bind(this);
    this.onMouseOutBinded = this.onMouseOut.bind(this);
    this.onMouseOverBinded = this.onMouseOver.bind(this);
};

CLOUD.Extensions.Marker.prototype = {
    constructor: CLOUD.Extensions.Marker,

    addDomEventListeners: function () {
    },

    removeDomEventListeners: function () {
    },

    onMouseDown: function (event) {

        this.select();
    },

    onMouseOut: function () {
        this.highlight(false);
    },

    onMouseOver: function () {
        this.highlight(true);
    },

    destroy:function() {
        this.setParent(null);
    },

    set: function(userId, position, boundingBox, state, style){

        this.userId = userId;
        this.position.set(position.x, position.y, position.z);
        this.boundingBox = boundingBox.clone();
        this.state = state;

        if (style) {
            this.style = CLOUD.DomUtil.cloneStyle(style);
        }

        this.update();
    },

    setParent: function (parent) {

        var shapeEl = this.shape;

        if (shapeEl) {

            if (shapeEl.parentNode) {
                shapeEl.parentNode.removeChild(shapeEl);
            }

            if (parent) {
                parent.appendChild(shapeEl);
            }
        }
    },

    setStyle: function (style) {
        this.style = CLOUD.DomUtil.cloneStyle(style);
        this.update();
    },

    select: function () {

        if (this.selected) {
            return;
        }

        this.selected = true;
        this.highlighted = false;
        this.update();

        this.editor.selectMarker(this);
    },

    deselect: function () {

        this.selected = false;
    },

    highlight: function (isHighlight) {

        if (this.isDisableInteractions) {
            return;
        }

        this.highlighted = isHighlight;
        this.update();
    },

    disableInteractions: function (disable) {

        this.isDisableInteractions = disable;
    },

    delete: function () {

        this.editor.deleteMarker(this);
    },

    getClientPosition: function () {

        return this.editor.worldToClient(this.position);
    },

    getBoundingBox: function(){
        return this.boundingBox;
    },

    update: function () {

        var position = this.getClientPosition();
        var offsetX = position.x + this.shapeOffset.offsetX;
        var offsetY = position.y + this.shapeOffset.offsetY;

        this.transformShape = [
            'translate(', offsetX, ',', offsetY, ') '
        ].join('');

        this.shape.setAttribute("transform", this.transformShape);
    }
};

CLOUD.Extensions.Marker.shapeTypes = {BUBBLE: 0, FLAG: 1};

CLOUD.Extensions.Marker.getDefaultStyle = function() {
    var style = {};

    style['stroke-width'] = 2;
    style['stroke-color'] = '#fffaff';
    style['stroke-opacity'] = 1.0;
    style['fill-color'] = '#ff2129';
    style['fill-opacity'] = 1.0;

    return style;
};

CLOUD.Extensions.MarkerFlag = function (id, editor) {

    CLOUD.Extensions.Marker.call(this, id, editor);

    this.shapeType = CLOUD.Extensions.Marker.shapeTypes.FLAG;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.MarkerFlag.prototype = Object.create(CLOUD.Extensions.Marker.prototype);
CLOUD.Extensions.MarkerFlag.prototype.constructor = CLOUD.Extensions.Marker;

CLOUD.Extensions.MarkerFlag.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.MarkerFlag.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.MarkerFlag.prototype.createShape = function () {

    this.shape = CLOUD.Extensions.Utils.Shape2D.makeFlag();
};

CLOUD.Extensions.MarkerFlag.prototype.update = function () {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var offsetX = position.x;
    var offsetY = position.y;

    var transformShape = [
        'translate(', offsetX, ',', offsetY, ') '
    ].join('');

    this.shape.setAttribute("transform", transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", strokeColor);
    this.shape.setAttribute("stroke-opacity", strokeOpacity);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', fillOpacity);
};

CLOUD.Extensions.MarkerFlag.prototype.renderToCanvas = function (ctx) {

};
CLOUD.Extensions.MarkerBubble = function (id, editor) {

    CLOUD.Extensions.Marker.call(this, id, editor);

    this.shapeType = CLOUD.Extensions.Marker.shapeTypes.BUBBLE;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.MarkerBubble.prototype = Object.create(CLOUD.Extensions.Marker.prototype);
CLOUD.Extensions.MarkerBubble.prototype.constructor = CLOUD.Extensions.Marker;

CLOUD.Extensions.MarkerBubble.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.MarkerBubble.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.MarkerBubble.prototype.createShape = function () {

    this.shape = CLOUD.Extensions.Utils.Shape2D.makeBubble(this.style, this.shapeOffset);
};

CLOUD.Extensions.MarkerBubble.prototype.update = function () {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var offsetX = position.x;
    var offsetY = position.y;

    var transformShape = [
        'translate(', offsetX, ',', offsetY, ') '
    ].join('');

    this.shape.setAttribute("transform", transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", strokeColor);
    this.shape.setAttribute("stroke-opacity", strokeOpacity);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', fillOpacity);
};

CLOUD.Extensions.MarkerBubble.prototype.renderToCanvas = function (ctx) {

};




CLOUD.Extensions.MarkerEditor = function (viewer) {
    "use strict";

    this.cameraEditor = viewer.cameraEditor;
    this.scene = viewer.getScene();
    this.domElement = viewer.domElement;

    this.markers = [];

    this.selectedMarker = null;

    // 隐患待整改：红色
    // 隐患已整改：黄色
    // 隐患已关闭：绿色
    // size: 15 * 20
    this.flagColors = {red: "#ff2129", green: "#85af03", yellow:"#fe9829"};

    // 有隐患：红色
    // 无隐患：绿色
    // 过程验收点、开业验收点的未检出：灰色
    // size: 14 * 20
    this.bubbleColors = {red: "#f92a24", green: "#86b507", gray:"#ccccca"};

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

    this.markerType = 0;
    this.markerColor = this.flagColors.red;
    this.markerState = 0;
    this.isEditing = false;

    this.beginEditCallback = null;
    this.endEditCallback = null;

    this.nextMarkerId = 0;

    this.initialized = false;

    this.onMouseDownBinded = this.onMouseDown.bind(this);
    this.onMouseUpBinded = this.onMouseUp.bind(this);
    this.onKeyDownBinded = this.onKeyDown.bind(this);
    this.onKeyUpBinded = this.onKeyUp.bind(this);
};

CLOUD.Extensions.MarkerEditor.prototype.addDomEventListeners = function () {

    if (this.svg) {

        this.svg.addEventListener('mousedown', this.onMouseDownBinded, false);
        this.svg.addEventListener('mouseup', this.onMouseUpBinded, false);

        window.addEventListener('keydown', this.onKeyDownBinded, false);
        window.addEventListener('keyup', this.onKeyUpBinded, false);
    }
};

CLOUD.Extensions.MarkerEditor.prototype.removeDomEventListeners = function () {

    if (this.svg) {

        this.svg.removeEventListener('mousedown', this.onMouseDownBinded, false);
        this.svg.removeEventListener('mouseup', this.onMouseUpBinded, false);

        window.removeEventListener('keydown', this.onKeyDownBinded, false);
        window.removeEventListener('keyup', this.onKeyUpBinded, false);
    }

};

CLOUD.Extensions.MarkerEditor.prototype.onMouseDown = function (event) {

    if (this.selectedMarker && event.target === this.svg) {

        this.selectMarker(null);
    }
};

CLOUD.Extensions.MarkerEditor.prototype.onMouseUp = function (event) {

    var cameraEditor = this.cameraEditor;

    if (cameraEditor.enabled === false)
        return;

    if (this.selectedMarker) {
        return;
    }

    event.preventDefault();

    if (event.button === THREE.MOUSE.LEFT) {

        var scope = this;
        var point = this.getPointOnDomContainer(event.clientX, event.clientY);
        var normalizedPoint = this.clientToViewport(point);

        scope.scene.pick(normalizedPoint, cameraEditor.object, function (intersect) {

            if (intersect) {

                var userId = "";
                userId = intersect.userId || userId;

                if (userId === "") return;

                var bBox = intersect.object.boundingBox;

                if (!bBox) {
                    intersect.object.geometry.computeBoundingBox();
                    bBox = intersect.object.geometry.boundingBox;
                }

                var position = intersect.point.clone();
                var inverseMatrix = scope.getInverseSceneMatrix();
                position.applyMatrix4(inverseMatrix);

                var markerId = scope.generateMarkerId();
                var marker;

                if (scope.markerType === 1) {

                    marker = new CLOUD.Extensions.MarkerBubble(markerId, scope);

                } else {

                    marker = new CLOUD.Extensions.MarkerFlag(markerId, scope);
                }

                var style = CLOUD.Extensions.Marker.getDefaultStyle();
                style['fill-color'] = scope.markerColor;
                marker.set(userId, position, bBox, scope.markerState, style);
                scope.addMarker(marker);
            }
        });
    }

};

CLOUD.Extensions.MarkerEditor.prototype.onKeyDown = function (event) {

};

CLOUD.Extensions.MarkerEditor.prototype.onKeyUp = function (event) {

    if (!this.isEditing) {
        return;
    }

    switch (event.keyCode) {
        case this.keys.DELETE:
            if (this.selectedMarker) {
                this.selectedMarker.delete();
                this.deselectMarker();
            }
            break;
        default :
            break;
    }
};

CLOUD.Extensions.MarkerEditor.prototype.onResize = function () {

    var bounds = this.getDomContainerBounds();

    this.svg.setAttribute('width', bounds.width + '');
    this.svg.setAttribute('height', bounds.height + '');

    this.updateMarkers();
};

CLOUD.Extensions.MarkerEditor.prototype.init = function(callbacks) {

    if (callbacks) {

        this.beginEditCallback = callbacks.beginEditCallback;
        this.endEditCallback = callbacks.endEditCallback;
    }

    if (!this.svg) {

        var bounds = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
        var svgWidth = bounds.width;
        var svgHeight = bounds.height;

        this.svg = CLOUD.Extensions.Utils.Shape2D.createSvgElement('svg');
        this.svg.style.position = "absolute";
        this.svg.style.display = "block";
        this.svg.style.position = "absolute";
        this.svg.style.display = "block";
        this.svg.style.left = "0";
        this.svg.style.top = "0";
        this.svg.setAttribute('width', svgWidth + '');
        this.svg.setAttribute('height', svgHeight + '');

        this.domElement.appendChild(this.svg);
        this.enableSVGPaint(false);

        this.svgGroup = CLOUD.Extensions.Utils.Shape2D.createSvgElement('g');
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    this.initialized = true;
};

CLOUD.Extensions.MarkerEditor.prototype.uninit = function() {

    this.initialized = false;

    if (!this.svg) return;

    // 如果仍然处在编辑中，强行结束
    if (this.isEditing) {
        this.editEnd();
    }

    // 卸载数据
    this.unloadMarkers();

    if (this.svgGroup && this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    if (this.svg.parentNode) {
        this.svg.parentNode.removeChild(this.svg);
    }

    this.svgGroup = null;
    this.svg = null;
};

CLOUD.Extensions.MarkerEditor.prototype.isInitialized = function() {

    return this.initialized;
};

CLOUD.Extensions.MarkerEditor.prototype.onExistEditor = function () {

    this.uninit();
};

CLOUD.Extensions.MarkerEditor.prototype.generateMarkerId = function () {

    ++this.nextMarkerId;

    var id = this.nextMarkerId.toString(10);

    //var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    //    return v.toString(16);
    //});

    return id;
};

// 清除数据
CLOUD.Extensions.MarkerEditor.prototype.clear = function() {

    var markers = this.markers;

    while (markers.length) {
        var marker = markers[0];
        this.deleteMarker(marker);
    }

    var group = this.svgGroup;
    if (group && group.childNodes.length > 0) {
        while (group.childNodes.length) {
            group.removeChild(group.childNodes[0]);
        }
    }
};

CLOUD.Extensions.MarkerEditor.prototype.updateMarkers = function() {

    for (var i = 0, len = this.markers.length; i < len; i++) {
        var marker = this.markers[i];
        marker.update();
    }
};

CLOUD.Extensions.MarkerEditor.prototype.addMarker = function(marker) {

    marker.setParent(this.svgGroup);

    this.markers.push(marker);
};

CLOUD.Extensions.MarkerEditor.prototype.deleteMarker = function (marker) {

    if (marker) {

        var idx = this.markers.indexOf(marker);

        if (idx !== -1) {
            this.markers.splice(idx, 1);
        }

        marker.destroy();
    }
};

CLOUD.Extensions.MarkerEditor.prototype.selectMarker = function (marker) {

    if (this.selectedMarker !== marker) {

        this.deselectMarker();
    }

    this.selectedMarker = marker;

};

CLOUD.Extensions.MarkerEditor.prototype.deselectMarker = function () {

    if (this.selectedMarker) {

        this.selectedMarker.deselect();
        this.selectedMarker = null;
    }
};

CLOUD.Extensions.MarkerEditor.prototype.getSceneMatrix = function() {

    var matrix = this.scene.getRootNodeMatrix();

    if (!matrix) {

        matrix = new THREE.Matrix4();
    }

    return matrix;
};

CLOUD.Extensions.MarkerEditor.prototype.getInverseSceneMatrix = function() {

    var sceneMatrix = this.getSceneMatrix();
    var inverseMatrix = new THREE.Matrix4();

    inverseMatrix.getInverse(sceneMatrix);

    return inverseMatrix;
};

CLOUD.Extensions.MarkerEditor.prototype.worldToClient = function(wPoint) {

    var bounds = this.getDomContainerBounds();
    var camera = this.cameraEditor.object;
    var sceneMatrix = this.getSceneMatrix();
    var result = new THREE.Vector3(wPoint.x, wPoint.y, wPoint.z);

    result.applyMatrix4(sceneMatrix);
    result.project(camera);

    result.x =  Math.round(0.5 * (result.x + 1) * bounds.width);
    result.y =  Math.round(-0.5 * (result.y - 1) * bounds.height);
    result.z = 0;

    return result;
};

CLOUD.Extensions.MarkerEditor.prototype.clientToWorld = function(cPoint) {

    var bounds = this.getDomContainerBounds();
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    result.x = cPoint.x / bounds.width * 2 - 1;
    result.y = - cPoint.y / bounds.height * 2 + 1;
    result.z = 0;

    result.unproject(camera);

    var inverseMatrix = this.getInverseSceneMatrix();

    result.applyMatrix4(inverseMatrix);

    return result;
};

CLOUD.Extensions.MarkerEditor.prototype.clientToViewport = function(cPoint) {

    var bounds = this.getDomContainerBounds();
    var result = new THREE.Vector3();

    result.x = cPoint.x / bounds.width * 2 - 1;
    result.y = - cPoint.y / bounds.height * 2 + 1;
    result.z = 0;

    return result;
};

CLOUD.Extensions.MarkerEditor.prototype.setMarkerState = function(state) {

    if (state < 0 && state > 5) {
        state = 0;
    }

    switch (state) {
        case 0:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.FLAG;
            this.markerColor = this.flagColors.red;
            break;
        case 1:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.FLAG;
            this.markerColor = this.flagColors.green;
            break;
        case 2:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.FLAG;
            this.markerColor = this.flagColors.yellow;
            break;
        case 3:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.BUBBLE;
            this.markerColor = this.bubbleColors.red;
            break;
        case 4:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.BUBBLE;
            this.markerColor = this.bubbleColors.green;
            break;
        case 5:
            this.markerType = CLOUD.Extensions.Marker.shapeTypes.BUBBLE;
            this.markerColor = this.bubbleColors.gray;
            break;
    }

    this.markerState = state;
};

// 是否允许在SVG上绘图
CLOUD.Extensions.MarkerEditor.prototype.enableSVGPaint = function (enable) {

    if (enable) {

        this.svg && this.svg.setAttribute("pointer-events", "painted");
    } else {

        this.svg && this.svg.setAttribute("pointer-events", "none");
    }

};

CLOUD.Extensions.MarkerEditor.prototype.handleCallbacks = function (name) {

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
    }

};

CLOUD.Extensions.MarkerEditor.prototype.getDomContainerBounds = function () {

    return CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
};

CLOUD.Extensions.MarkerEditor.prototype.getPointOnDomContainer = function (clientX, clientY) {

    var rect = this.getDomContainerBounds();

    return new THREE.Vector2(clientX - rect.left, clientY - rect.top);
};

CLOUD.Extensions.MarkerEditor.prototype.getDomElement = function () {
    return this.domElement;
};

// ---------------------------- 外部 API BEGIN ---------------------------- //

CLOUD.Extensions.MarkerEditor.prototype.editBegin = function() {

    if (this.isEditing) {
        return true;
    }

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    this.handleCallbacks("beginEdit");

    // 注册事件
    this.addDomEventListeners();
    // 允许绘图
    this.enableSVGPaint(true);

    this.clear();

    this.isEditing = true;
};

CLOUD.Extensions.MarkerEditor.prototype.editEnd = function() {

    this.isEditing = false;

    this.removeDomEventListeners();

    if (this.svgGroup && this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    this.handleCallbacks("endEdit");

    // 不允许绘图
    this.enableSVGPaint(false);
};

CLOUD.Extensions.MarkerEditor.prototype.getMarkersBoundingBox = function() {

    if (this.markers.length < 1) return null;

    var bBox = new THREE.Box3();

    for (var i = 0, len = this.markers.length; i < len; i++) {
        var marker = this.markers[i];
        bBox.union(marker.getBoundingBox());
    }

    return bBox;
};

// 获得列表
CLOUD.Extensions.MarkerEditor.prototype.getMarkerInfoList = function() {

    var markerInfoList = [];

    for (var i = 0, len = this.markers.length; i < len; i++) {

        var marker = this.markers[i];
        var info = {
            id: marker.id,
            userId: marker.userId,
            shapeType: marker.shapeType,
            position: marker.position,
            boundingBox: marker.boundingBox,
            state : marker.state
        };

        markerInfoList.push(info);
    }

    return markerInfoList;
};

// 加载
CLOUD.Extensions.MarkerEditor.prototype.loadMarkers = function (markerInfoList) {

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    // 清除数据
    this.clear();

    var currMarkerState = this.markerState;

    for (var i = 0, len = markerInfoList.length; i < len; i++) {

        var info = markerInfoList[i];

        var id = info.id;
        var userId = info.userId;
        var shapeType = info.shapeType;
        var position = info.position;
        //var boundingBox = info.boundingBox;
        var boundingBox = new THREE.Box3();
        boundingBox.max.x = info.boundingBox.max.x;
        boundingBox.max.y = info.boundingBox.max.y;
        boundingBox.max.z = info.boundingBox.max.z;
        boundingBox.min.x = info.boundingBox.min.x;
        boundingBox.min.y = info.boundingBox.min.y;
        boundingBox.min.z = info.boundingBox.min.z;

        var state = info.state;

        this.setMarkerState(state);

        var style = CLOUD.Extensions.Marker.getDefaultStyle();
        style['fill-color'] = this.markerColor;

        switch (shapeType) {

            case CLOUD.Extensions.Marker.shapeTypes.FLAG:
                var flag = new CLOUD.Extensions.MarkerFlag(id, this);
                flag.set(userId, position, boundingBox, state, style);
                this.addMarker(flag);
                break;
            case  CLOUD.Extensions.Marker.shapeTypes.BUBBLE:
                var bubble = new CLOUD.Extensions.MarkerBubble(id, this);
                bubble.set(userId, position, boundingBox, state, style);
                this.addMarker(bubble);
                break;
        }
    }

    this.markerState = currMarkerState;
    this.setMarkerState(currMarkerState);
};

// 卸载
CLOUD.Extensions.MarkerEditor.prototype.unloadMarkers = function () {

    // 清除数据
    this.clear();
};

// 显示
CLOUD.Extensions.MarkerEditor.prototype.showMarkers = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "visible");
    }
};

// 隐藏
CLOUD.Extensions.MarkerEditor.prototype.hideMarkers = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "hidden");
    }
};

// ---------------------------- 外部 API END ---------------------------- //



CLOUD.Extensions.Annotation = function (editor, id) {

    this.editor = editor;
    this.id = id;
    this.shapeType = 0;

    this.position = {x: 0, y: 0, z: 0};
    this.size = {width: 0, height: 0};
    this.rotation = 0;

    this.style = this.getDefaultStyle();
    this.shape = null;
    this.selected = false;
    this.highlighted = false;
    this.highlightColor = '#FAFF3C';
    this.isDisableInteractions = false;
    this.disableResizeWidth = false;
    this.disableResizeHeight = false;
    this.disableRotation = false;

    this.onMouseDownBinded = this.onMouseDown.bind(this);
    this.onMouseOutBinded = this.onMouseOut.bind(this);
    this.onMouseOverBinded = this.onMouseOver.bind(this);
};

CLOUD.Extensions.Annotation.prototype = {
    constructor: CLOUD.Extensions.Annotation,

    addDomEventListeners: function () {
    },

    removeDomEventListeners: function () {
    },

    onMouseDown: function (event) {

        if (this.isDisableInteractions) {
            return;
        }

        this.select();

        if (this.editor.annotationFrame) {
            this.editor.annotationFrame.dragBegin(event);
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

        this.removeDomEventListeners();
        this.deselect();
        this.setParent(null);
    },

    set: function (position, size, rotation) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
        this.size.width = size.width;
        this.size.height = size.height;
        this.rotation = rotation || 0;

        this.update();
    },

    // 设置旋转角（弧度）
    resetRotation: function (angle) {

        this.rotation = angle;
        this.update();
    },

    // 获得旋转角（弧度）
    getRotation: function () {

        return this.rotation;
    },

    // 设置位置
    resetPosition: function (position) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
        this.update();
    },

    getClientPosition: function () {

        return this.editor.getAnnotationClientPosition(this.position);
    },

    resetSize: function (size, position) {

        this.size.width = size.width;
        this.size.height = size.height;
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
        this.update();
    },

    getClientSize: function () {

        return this.editor.getAnnotationClientSize(this.size, this.position);
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

    setStyle: function (style) {

        this.style = CLOUD.DomUtil.cloneStyle(style);
        this.update();
    },

    getStyle: function () {

        return CLOUD.DomUtil.cloneStyle(this.style);
    },

    update: function () {
    },

    select: function () {

        if (this.selected) {
            return;
        }

        this.selected = true;
        this.highlighted = false;
        this.update();

        this.editor.selectAnnotation(this);
    },

    deselect: function () {

        this.selected = false;
    },

    highlight: function (isHighlight) {

        if (this.isDisableInteractions) {
            return;
        }

        this.highlighted = isHighlight;
        this.update();
    },

    disableInteractions: function (disable) {

        this.isDisableInteractions = disable;
    },

    delete: function () {

        this.editor.deleteAnnotation(this);
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

CLOUD.Extensions.Annotation.shapeTypes = {ARROW: 0, RECTANGLE: 1, CIRCLE: 2, CROSS: 3, CLOUD: 4, TEXT: 5};
CLOUD.Extensions.AnnotationArrow = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.ARROW;
    this.head = new THREE.Vector2();
    this.tail = new THREE.Vector2();
    this.disableResizeHeight = true;
    this.size.height = this.style['stroke-width'] * 4; // 箭头固定高度

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationArrow.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationArrow.prototype.constructor = CLOUD.Extensions.AnnotationArrow;

CLOUD.Extensions.AnnotationArrow.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationArrow.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationArrow.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('polygon');
};

CLOUD.Extensions.AnnotationArrow.prototype.setByTailHead = function (tail, head) {

    var v0 = new THREE.Vector2(tail.x, tail.y);
    var v1 = new THREE.Vector2(head.x, head.y);
    var dir = v1.clone().sub(v0).normalize();

    // 计算尺寸
    this.size.width = v0.distanceTo(v1);

    // 计算旋转角度
    this.rotation = Math.acos(dir.dot(new THREE.Vector2(1, 0)));
    this.rotation = head.y > tail.y ? (Math.PI * 2) - this.rotation : this.rotation;

    this.tail.set(tail.x, tail.y);
    this.head.set(head.x, head.y);

    var depth = tail.z;

    this.position.x = 0.5 * (this.head.x + this.tail.x);
    this.position.y = 0.5 * (this.head.y + this.tail.y);
    this.position.z = depth;

    this.update();
};

CLOUD.Extensions.AnnotationArrow.prototype.getClientSize = function () {

    var size = this.editor.getAnnotationClientSize(this.size, this.position);
    size.height = this.style['stroke-width'] * 4;

    return size;
};

CLOUD.Extensions.AnnotationArrow.prototype.resetSize = function (size, position) {

    var dir = new THREE.Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
    dir.multiplyScalar(size.width * 0.5);

    var center = new THREE.Vector2(position.x, position.y);
    var tail = center.clone().sub(dir);
    var head = center.clone().add(dir);

    this.tail.set(tail.x, tail.y);
    this.head.set(head.x, head.y);

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    this.size.width = size.width;

    this.update();
};


CLOUD.Extensions.AnnotationArrow.prototype.resetPosition = function (position) {

    var dx = this.head.x - this.tail.x;
    var dy = this.head.y - this.tail.y;

    this.tail.x = position.x - dx * 0.5;
    this.tail.y = position.y - dy * 0.5;
    this.head.x = this.tail.x + dx;
    this.head.y = this.tail.y + dy;

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    this.update();
};

CLOUD.Extensions.AnnotationArrow.prototype.update = function () {

    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];

    var shapePoints = this.getShapePoints();
    var mappedPoints = shapePoints.map(function (point) {
        return point[0] + ',' + point[1];
    });
    var pointsStr = mappedPoints.join(' ');
    var position = this.getClientPosition();
    var size = this.getClientSize();
    var offsetX = 0.5 * size.width;
    var offsetY = 0.5 * size.height;

    this.transformShape = [
        'translate(', position.x, ',', position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');

    this.shape.setAttribute('points', pointsStr);
    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute('fill', strokeColor);
    this.shape.setAttribute('opacity', strokeOpacity);
};

CLOUD.Extensions.AnnotationArrow.prototype.getShapePoints = function () {

    var strokeWidth = this.style['stroke-width'] * 2;
    var size = this.getClientSize();
    var halfLen = size.width * 0.5;
    var thickness = strokeWidth;
    var halfThickness = strokeWidth * 0.5;
    var headLen = halfLen - (2.0 * thickness);

    var p1 = [-halfLen, -halfThickness];
    var p2 = [headLen, -halfThickness];
    var p3 = [headLen, -thickness];
    var p4 = [halfLen, 0];
    var p5 = [headLen, thickness];
    var p6 = [headLen, halfThickness];
    var p7 = [-halfLen, halfThickness];

    var points = [p1, p2, p3, p4, p5, p6, p7];

    points.forEach(function (point) {
        point[0] += halfLen;
        point[1] += thickness;
    });

    return points;
};

CLOUD.Extensions.AnnotationArrow.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.style['stroke-width'] * 2;
    var strokeColor = this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var offsetX = size.width * 0.5;
    var offsetY = strokeWidth;

    var m1 = new THREE.Matrix4().makeTranslation(-offsetX, -offsetY, 0);
    var m2 = new THREE.Matrix4().makeRotationZ(this.rotation);
    var m3 = new THREE.Matrix4().makeTranslation(position.x, position.y, 0);
    var transform = m3.multiply(m2).multiply(m1);

    var points = this.getShapePoints();

    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity);
    ctx.beginPath();

    points.forEach(function (point) {

        var client = new THREE.Vector3(point[0], point[1], 0);
        client.applyMatrix4(transform);
        ctx.lineTo(client.x, client.y);
    });

    ctx.fill();
};


CLOUD.Extensions.AnnotationRectangle = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.RECTANGLE;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationRectangle.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationRectangle.prototype.constructor = CLOUD.Extensions.AnnotationRectangle;

CLOUD.Extensions.AnnotationRectangle.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationRectangle.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationRectangle.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('rect');
};

CLOUD.Extensions.AnnotationRectangle.prototype.update = function () {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var width = Math.max(size.width - strokeWidth, 0);
    var height = Math.max(size.height - strokeWidth, 0);
    var offsetX = 0.5 * width;
    var offsetY = 0.5 * height;

    this.transformShape = [
        'translate(', position.x, ',', position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    this.shape.setAttribute("stroke", CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity));
    this.shape.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity));
    this.shape.setAttribute('width', width + '');
    this.shape.setAttribute('height', height + '');
};

CLOUD.Extensions.AnnotationRectangle.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var size = this.getClientSize();
    var position = this.getClientPosition();
    var width = Math.max(size.width - strokeWidth, 0);
    var height = Math.max(size.height - strokeWidth, 0);

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;
    ctx.translate(position.x, position.y);
    ctx.rotate(this.rotation);

    if (fillOpacity !== 0) {
        ctx.fillRect(width / -2, height / -2, width, height);
    }

    ctx.strokeRect(width / -2, height / -2, width, height);
};

CLOUD.Extensions.AnnotationCircle = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.CIRCLE;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationCircle.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationCircle.prototype.constructor = CLOUD.Extensions.AnnotationCircle;

CLOUD.Extensions.AnnotationCircle.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCircle.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCircle.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('ellipse');
};

CLOUD.Extensions.AnnotationCircle.prototype.update = function () {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var offsetX = Math.max(size.width - strokeWidth, 0) * 0.5;
    var offsetY = Math.max(size.height - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', position.x, ',', position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');

    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity));
    this.shape.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity));
    this.shape.setAttribute('cx', offsetX);
    this.shape.setAttribute('cy', offsetY);
    this.shape.setAttribute('rx', offsetX);
    this.shape.setAttribute('ry', offsetY);
};

CLOUD.Extensions.AnnotationCircle.prototype.renderToCanvas = function (ctx) {

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

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var width = Math.max(size.width - strokeWidth, 0);
    var height = Math.max(size.height - strokeWidth, 0);

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;
    ctx.translate(position.x, position.y);
    ctx.rotate(this.rotation);

    //ctx.beginPath();

    ellipse(ctx, 0, 0, width, height);

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    //ctx.stroke();
};
CLOUD.Extensions.AnnotationCloud = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.CLOUD;
    this.shapePoints = [];
    this.trackingPoint = {x: 0, y: 0};
    this.isSeal = false; // 是否封口
    this.isTracking = false;
    this.isEnableTrack = false;
    this.originSize = {width: 1, height:1};
    this.viewBox = {width: 1000, height: 1000};

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationCloud.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationCloud.prototype.constructor = CLOUD.Extensions.AnnotationCloud;

CLOUD.Extensions.AnnotationCloud.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCloud.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCloud.prototype.createShape = function () {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.AnnotationCloud.prototype.setByPositions = function (positions, isSeal) {

    this.positions = positions.concat();

    this.isSeal = isSeal || false;

    // 计算位置及大小
    this.calculatePosition(true);

    this.originSize.width = (this.size.width === 0) ? 1 : this.size.width;
    this.originSize.height = (this.size.height === 0) ? 1 : this.size.height;

    this.update();
};

CLOUD.Extensions.AnnotationCloud.prototype.set = function (position, size, rotation, shapePointsStr, originSize) {

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
    this.size.width = size.width;
    this.size.height = size.height;
    this.rotation = rotation || 0;

    if (originSize) {

        this.originSize.width = (originSize.width === 0) ? 1 : originSize.width;
        this.originSize.height = (originSize.height === 0) ? 1 : originSize.height;

    } else {

        this.originSize.width = (this.size.width === 0) ? 1 : this.size.width;
        this.originSize.height = (this.size.height === 0) ? 1 : this.size.height;
    }

    this.setShapePoints(shapePointsStr);

    this.update();
};

CLOUD.Extensions.AnnotationCloud.prototype.setTrackingPoint = function (point) {

    this.trackingPoint.x = point.x;
    this.trackingPoint.y = point.y;

    this.calculatePosition(false);

    this.update();
};

CLOUD.Extensions.AnnotationCloud.prototype.update = function () {

    if (this.shapePoints.length < 1) return;

    var shapePathStr = this.getPathString();
    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity));
    this.shape.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity));
    this.shape.setAttribute('d', shapePathStr);
};

CLOUD.Extensions.AnnotationCloud.prototype.worldToViewBox = function (wPoint) {

    var originWidth = this.originSize.width;
    var originHeight = this.originSize.height;
    var viewBoxWidth = this.viewBox.width;
    var viewBoxHeight = this.viewBox.height;
    var x = Math.floor(wPoint.x / originWidth * viewBoxWidth + 0.5);
    var y = Math.floor(wPoint.y / originHeight* viewBoxHeight + 0.5);

    return {x: x, y: y };
};

CLOUD.Extensions.AnnotationCloud.prototype.viewBoxToWorld = function (vPoint) {

    var originWidth = this.originSize.width;
    var originHeight = this.originSize.height;
    var viewBoxWidth = this.viewBox.width;
    var viewBoxHeight = this.viewBox.height;
    var x = vPoint.x / viewBoxWidth * originWidth;
    var y = vPoint.y / viewBoxHeight * originHeight;

    return {x: x, y: y };
};

CLOUD.Extensions.AnnotationCloud.prototype.getPathString = function () {

    //var path = this.shapePoints.map(function(point, i){
    //    if (i === 0) {
    //        return ['M'].concat([point.x, point.y]).join(' ');
    //    } else {
    //        return ['Q'].concat([point.cx, point.cy, point.x, point.y ]).join(' ');
    //    }
    //}).join(' ');
    //
    //if (this.isSeal) {

    //    path += 'Z';
    //}
    //
    //return path;

    var scaleX = this.size.width / this.originSize.width;
    var scaleY = this.size.height / this.originSize.height;

    var m0 = new THREE.Matrix4().makeScale(scaleX, scaleY, 1);
    var m1 = new THREE.Matrix4().makeRotationZ(-this.rotation);
    var m2 = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, this.position.z);
    var transform = m2.multiply(m1).multiply(m0);

    var scope = this;
    var pos = new THREE.Vector3();
    var x, y, cx, cy;

    var path = this.shapePoints.map(function(point, i){

        if (i === 0) {

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            x = pos.x;
            y = pos.y;

            return ['M'].concat([x, y]).join(' ');
        } else {

            pos.x = point.cx;
            pos.y = point.cy;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            cx = pos.x;
            cy = pos.y;

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            x = pos.x;
            y = pos.y;

            return ['Q'].concat([cx, cy, x, y ]).join(' ');
        }
    }).join(' ');

    if (this.isSeal) {
        path += 'Z';
    }

    return path;
};

// 计算控制点
CLOUD.Extensions.AnnotationCloud.prototype.getControlPoint = function (startPoint, endPoint) {

    var start = new THREE.Vector2(startPoint.x, startPoint.y);
    var end = new THREE.Vector2(endPoint.x, endPoint.y);
    var direction = end.clone().sub(start);
    var halfLen = 0.5 * direction.length();
    var centerX = 0.5 * (start.x + end.x);
    var centerY = 0.5 * (start.y + end.y);
    var center = new THREE.Vector2(centerX, centerY);

    direction.normalize();
    direction.rotateAround(new THREE.Vector2(0, 0), 0.5 * Math.PI);
    direction.multiplyScalar(halfLen);
    center.add(direction);

    return {
        x: center.x,
        y: center.y
    };
};

CLOUD.Extensions.AnnotationCloud.prototype.getBoundingBox = function () {

    var box = new THREE.Box2();
    var point = new THREE.Vector2();

    for (var i = 0, len = this.shapePoints.length; i < len; i++) {

        if (i === 0) {

            point.set(this.shapePoints[i].x, this.shapePoints[i].y);
            box.expandByPoint(point);

        } else {

            point.set(this.shapePoints[i].cx, this.shapePoints[i].cy);
            box.expandByPoint(point);

            point.set(this.shapePoints[i].x, this.shapePoints[i].y);
            box.expandByPoint(point);
        }
    }

    return box;
};

CLOUD.Extensions.AnnotationCloud.prototype.calculateShapePath = function () {

    var originShapePoint = {};
    var currentShapePoint = {};
    var lastShapePoint = {};
    var controlPoint;

    var len = this.positions.length;
    this.shapePoints = [];

    if (len < 1) {
        return;
    }

    // 保存深度
    this.depth = this.positions[0].z || 0;

    if (len === 1) {

        currentShapePoint.x = this.positions[0].x;
        currentShapePoint.y = this.positions[0].y;

        this.shapePoints.push({x: this.positions[0].x, y: this.positions[0].y});

        if (this.isTracking) {

            // 计算控制点
            controlPoint = this.getControlPoint(currentShapePoint, this.trackingPoint);

            this.shapePoints.push({cx: controlPoint.x, cy: controlPoint.y, x: this.trackingPoint.x, y: this.trackingPoint.y});

        }

    } else {

        for (var i = 0; i < len; i++) {

            currentShapePoint.x = this.positions[i].x;
            currentShapePoint.y = this.positions[i].y;

            if (i === 0) {

                this.shapePoints.push({x: this.positions[i].x, y: this.positions[i].y});

                lastShapePoint.x = this.positions[i].x;
                lastShapePoint.y = this.positions[i].y;

                originShapePoint.x = this.positions[i].x;
                originShapePoint.y = this.positions[i].y;

            } else {

                // 计算控制点
                controlPoint = this.getControlPoint(lastShapePoint, currentShapePoint);

                this.shapePoints.push({cx: controlPoint.x, cy: controlPoint.y, x: currentShapePoint.x, y: currentShapePoint.y});

                lastShapePoint.x = currentShapePoint.x;
                lastShapePoint.y = currentShapePoint.y;

                // 最后一个点, 处理封口
                if (i === len - 1) {

                    if (this.isTracking) {

                        // 计算控制点
                        controlPoint = this.getControlPoint(lastShapePoint, this.trackingPoint);

                        this.shapePoints.push({cx: controlPoint.x, cy: controlPoint.y, x: this.trackingPoint.x, y: this.trackingPoint.y});

                    } else if (this.isSeal) {
                        // 计算控制点
                        controlPoint = this.getControlPoint(lastShapePoint, originShapePoint);

                        this.shapePoints.push({cx: controlPoint.x, cy: controlPoint.y, x: originShapePoint.x, y: originShapePoint.y});
                    }

                }
            }
        }
    }

};

CLOUD.Extensions.AnnotationCloud.prototype.calculateRelativePosition = function (center) {

    // 计算相对位置
    for (var i = 0, len = this.shapePoints.length; i < len; i++) {

        if (i === 0) {

            this.shapePoints[i].x -= center.x;
            this.shapePoints[i].y -= center.y;

        } else {

            this.shapePoints[i].x -= center.x;
            this.shapePoints[i].y -= center.y;
            this.shapePoints[i].cx -= center.x;
            this.shapePoints[i].cy -= center.y;
        }
    }
};

CLOUD.Extensions.AnnotationCloud.prototype.calculatePosition = function (force) {

    force = force || false;

    // 计算控制点
    this.calculateShapePath();

    if (force) {

        var box = this.getBoundingBox();
        var center = box.center();

        this.center = {x: center.x, y: center.y};

        // 计算中心点
        this.position.x  = center.x;
        this.position.y  = center.y;
        this.position.z = this.depth || 0;

        // 计算相对位置
        this.calculateRelativePosition(center);

        // 重计算包围盒
        box = this.getBoundingBox();

        var size = box.size();

        this.size.width = size.x || 16;
        this.size.height = size.y || 16;

    } else {

        if (this.center) {

            // 计算相对位置
            this.calculateRelativePosition(this.center);
        }

    }
};

CLOUD.Extensions.AnnotationCloud.prototype.startTrack = function () {
    this.isTracking = true;
};

CLOUD.Extensions.AnnotationCloud.prototype.finishTrack = function () {
    this.isTracking = false;
};

CLOUD.Extensions.AnnotationCloud.prototype.enableTrack = function () {
    this.isEnableTrack = true;
};

CLOUD.Extensions.AnnotationCloud.prototype.disableTrack = function () {
    this.isEnableTrack = false;
};

CLOUD.Extensions.AnnotationCloud.prototype.getTrackState = function () {
    return this.isEnableTrack;
};

CLOUD.Extensions.AnnotationCloud.prototype.setSeal = function (isSeal) {

    this.isSeal = isSeal;

    this.calculatePosition(true);
    this.update();
};

// 设置形状点集
CLOUD.Extensions.AnnotationCloud.prototype.setShapePoints = function (shapeStr) {

    var x, y, cx, cy, retPoint;
    var shapePoints = shapeStr.split(',');

    var x0 = parseInt(shapePoints[0]);
    var y0 = parseInt(shapePoints[1]);
    retPoint = this.viewBoxToWorld({x : x0, y: y0});
    x0 = retPoint.x;
    y0 = retPoint.y;

    this.shapePoints = [];
    this.shapePoints.push({x: x0, y: y0});

    for (var i = 2, len = shapePoints.length; i < len; i += 4) {

        cx = parseInt(shapePoints[i]);
        cy = parseInt(shapePoints[i + 1]);
        retPoint = this.viewBoxToWorld({x : cx, y: cy});
        cx = retPoint.x;
        cy = retPoint.y;

        x = parseInt(shapePoints[i + 2]);
        y = parseInt(shapePoints[i + 3]);
        retPoint = this.viewBoxToWorld({x : x, y: y});
        x = retPoint.x;
        y = retPoint.y;

        this.shapePoints.push({cx: cx, cy: cy, x: x, y: y});
    }
};

// 获得形状点集字符串（用“，”分割）
CLOUD.Extensions.AnnotationCloud.prototype.getShapePoints = function () {

    var points = [];

    // 转成整型存储以减少存储空间
    var x, y, cx, cy, retPoint;

    for (var i = 0, len = this.shapePoints.length; i < len; i++) {

        if (i === 0) {

            x = this.shapePoints[i].x;
            y = this.shapePoints[i].y;
            retPoint = this.worldToViewBox({x : x, y: y});
            x = retPoint.x;
            y = retPoint.y;
            points.push(x);
            points.push(y);

        } else {

            cx = this.shapePoints[i].cx;
            cy = this.shapePoints[i].cy;
            retPoint = this.worldToViewBox({x : cx, y: cy});
            cx = retPoint.x;
            cy = retPoint.y;
            points.push(cx);
            points.push(cy);

            x = this.shapePoints[i].x;
            y = this.shapePoints[i].y;
            retPoint = this.worldToViewBox({x : x, y: y});
            x = retPoint.x;
            y = retPoint.y;
            points.push(x);
            points.push(y);
        }
    }

    return points.join(',');
};

CLOUD.Extensions.AnnotationCloud.prototype.renderToCanvas = function (ctx) {

    // 小于两个点，不处理
    if (this.shapePoints.length < 2) return;

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;

    var scaleX = this.size.width / this.originSize.width;
    var scaleY = this.size.height / this.originSize.height;

    var m0 = new THREE.Matrix4().makeScale(scaleX, scaleY, 1);
    var m1 = new THREE.Matrix4().makeRotationZ(-this.rotation);
    var m2 = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, this.position.z);
    var transform = m2.multiply(m1).multiply(m0);

    var scope = this;

    ctx.beginPath();

    var pos = new THREE.Vector3();
    var x, y, cx, cy;

    this.shapePoints.forEach(function(point,i){

        if (i === 0) {

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            x = pos.x;
            y = pos.y;

            ctx.moveTo(x, y);
        } else {

            pos.x = point.cx;
            pos.y = point.cy;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            cx = pos.x;
            cy = pos.y;

            pos.x = point.x;
            pos.y = point.y;
            pos.z = 0;
            pos.applyMatrix4(transform);
            pos = scope.editor.worldToClient(pos);
            x = pos.x;
            y = pos.y;

            ctx.quadraticCurveTo(cx, cy, x, y);
        }

    });

    ctx.stroke();

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    ctx.stroke();
};


CLOUD.Extensions.AnnotationCross = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.CROSS;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationCross.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationCross.prototype.constructor = CLOUD.Extensions.AnnotationCross;

CLOUD.Extensions.AnnotationCross.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCross.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationCross.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Utils.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.AnnotationCross.prototype.update = function () {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var offsetX = Math.max(size.width - strokeWidth, 0) * 0.5;
    var offsetY = Math.max(size.height - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', position.x, ',', position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    this.shape.setAttribute('stroke',strokeColor);
    this.shape.setAttribute('stroke-opacity',strokeOpacity);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', fillOpacity);
    this.shape.setAttribute('d', this.getPath().join(' '));
};

CLOUD.Extensions.AnnotationCross.prototype.getPath = function() {

    var size = this.getClientSize();
    var l = 0;
    var t = 0;
    var r = size.width;
    var b = size.height;

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

CLOUD.Extensions.AnnotationCross.prototype.renderToCanvas = function (ctx) {

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var width = Math.max(size.width - strokeWidth, 0);
    var height = Math.max(size.height - strokeWidth, 0);

    ctx.strokeStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity);
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity);
    ctx.lineWidth = strokeWidth;

    ctx.translate(position.x, position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-0.5 * width, -0.5 * height);

    //ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);

    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);

    ctx.stroke();

    if (fillOpacity !== 0) {
        ctx.fill();
    }

    ctx.stroke();
};

CLOUD.Extensions.AnnotationText = function (editor, id) {

    CLOUD.Extensions.Annotation.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Annotation.shapeTypes.TEXT;
    this.currText = "";
    this.currTextLines = [""];
    this.textDirty = true;
    this.lineHeight = 100;

    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('maxlength', '260');

    this.textAreaStyle = {};
    this.textAreaStyle['position'] = 'absolute';
    this.textAreaStyle['overflow-y'] = 'hidden';

    this.measurePanel = document.createElement('div');

    this.isActive = false;

    this.createShape();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationText.prototype = Object.create(CLOUD.Extensions.Annotation.prototype);
CLOUD.Extensions.AnnotationText.prototype.constructor = CLOUD.Extensions.AnnotationText;

CLOUD.Extensions.AnnotationText.prototype.addDomEventListeners = function () {

    this.shape.addEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.addEventListener("mouseout", this.onMouseOutBinded);
    this.shape.addEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationText.prototype.removeDomEventListeners = function () {

    this.shape.removeEventListener("mousedown", this.onMouseDownBinded, true);
    this.shape.removeEventListener("mouseout", this.onMouseOutBinded);
    this.shape.removeEventListener("mouseover", this.onMouseOverBinded);
};

CLOUD.Extensions.AnnotationText.prototype.createShape = function () {

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

CLOUD.Extensions.AnnotationText.prototype.set = function (position, size, rotation, textString) {

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    this.size.width = size.width;
    this.size.height = size.height;

    this.rotation = rotation;

    this.setText(textString);
};

CLOUD.Extensions.AnnotationText.prototype.resetSize = function (size, position) {

    var clientSize = this.getClientSize();
    var isCalcLines = (Math.floor(clientSize.width) !== size.width);

    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;

    this.size.width = size.width;
    this.size.height = size.height;

    if (isCalcLines) {

        var newLines = this.calcTextLines();

        if (!this.linesEqual(newLines)) {

            this.currTextLines = newLines;
            this.textDirty = true;
            this.forceRedraw();
        }
    }

    this.update();
};

CLOUD.Extensions.AnnotationText.prototype.setText = function (text) {

    this.currText = text;
    this.currTextLines = this.calcTextLines();
    this.textDirty = true;
    this.show();
    this.update();
};

CLOUD.Extensions.AnnotationText.prototype.getText = function () {

    return this.currText;
};

CLOUD.Extensions.AnnotationText.prototype.setParent = function (parent) {

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

CLOUD.Extensions.AnnotationText.prototype.update = function (forceDirty) {

    var fontSize = this.style['font-size'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    var position = this.getClientPosition();
    var size = this.getClientSize();
    var offsetX = size.width * 0.5;
    var offsetY = size.height * 0.5;

    this.transformShape = [
        'translate(', position.x, ',', position.y, ') ',
        'rotate(', THREE.Math.radToDeg(this.rotation), ') ',
        'translate(', -offsetX, ',', -offsetY, ') '
    ].join('');

    this.shape.setAttribute("font-family", this.style['font-family']);
    this.shape.setAttribute("font-size", fontSize);
    this.shape.setAttribute('font-weight', this.style['font-weight']);
    this.shape.setAttribute("font-style", this.style['font-style']);
    this.shape.setAttribute("fill", CLOUD.Extensions.Utils.Shape2D.getRGBAString(strokeColor, strokeOpacity));

    var bBox = this.shape.getBBox();
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
    this.clipRect.setAttribute('width', size.width);
    this.clipRect.setAttribute('height', size.height);

    verticalTransform = ['translate(0, ', size.height, ')'].join('');
    this.backgroundRect.setAttribute("transform", this.transformShape + verticalTransform);
    this.backgroundRect.setAttribute('width', size.width);
    this.backgroundRect.setAttribute('height', size.height);
    this.backgroundRect.setAttribute("stroke-width", '0');
    this.backgroundRect.setAttribute('fill', CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity));
};

CLOUD.Extensions.AnnotationText.prototype.show = function () {

    if (this.shape.style.display !== "") {
        this.shape.style.display = "";
    }
};

CLOUD.Extensions.AnnotationText.prototype.hide = function () {

    if (this.shape.style.display !== "none") {
        this.shape.style.display = "none";
    }

};

CLOUD.Extensions.AnnotationText.prototype.forceRedraw = function () {

    window.requestAnimationFrame(function () {

        this.highlighted = !this.highlighted;
        this.update();

        this.highlighted = !this.highlighted;
        this.update();

    }.bind(this));
};

CLOUD.Extensions.AnnotationText.prototype.rebuildTextSvg = function () {

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

CLOUD.Extensions.AnnotationText.prototype.getLineHeight = function () {
    return this.style['font-size'] * (this.lineHeight * 0.01);
};

CLOUD.Extensions.AnnotationText.prototype.calcTextLines = function () {

    var textValues = this.editor.annotationTextArea.getTextValuesByAnnotation(this);
    return textValues.lines;
};

CLOUD.Extensions.AnnotationText.prototype.getTextLines = function () {

    return this.currTextLines.concat();
};

CLOUD.Extensions.AnnotationText.prototype.linesEqual = function (lines) {

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

CLOUD.Extensions.AnnotationText.prototype.renderToCanvas = function (ctx) {

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

    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];
    var strokeColor = this.style['stroke-color'];
    var fontOpacity = this.style['stroke-opacity'];
    var fontFamily = this.style['font-family'];
    var fontStyle = this.style['font-style'];
    var fontWeight = this.style['font-weight'];
    var fontSize = this.style['font-size'];

    var lineHeight = fontSize * (this.lineHeight * 0.01);
    var position = this.getClientPosition();
    var size = this.getClientSize();

    ctx.save();
    ctx.fillStyle = CLOUD.Extensions.Utils.Shape2D.getRGBAString(fillColor, fillOpacity);
    ctx.translate(position.x, position.y);

    if (fillOpacity !== 0) {
        ctx.fillRect(-0.5 * size.width, -0.5 * size.height, size.width, size.height);
    }

    ctx.restore();

    // Text
    ctx.fillStyle = strokeColor;
    ctx.strokeStyle = strokeColor;
    ctx.textBaseline = 'top';
    ctx.translate(position.x, position.y);
    ctx.rotate(this.rotation);
    ctx.translate(-0.5 * size.width, -0.5 * size.height);

    ctx.font = fontStyle + " " + fontWeight + " " + fontSize + "px " + fontFamily;
    ctx.globalAlpha = fontOpacity;
    renderTextLines(ctx, this.currTextLines, lineHeight, size.height);
};


CLOUD.Extensions.AnnotationTextArea = function (editor, container) {

    this.editor = editor;
    this.container = container;

    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('maxlength', '260');

    this.textAreaStyle = {};
    this.textAreaStyle['position'] = 'absolute';
    this.textAreaStyle['overflow-y'] = 'hidden';

    this.measurePanel = document.createElement('div');

    this.textAnnotation = null;
    this.onKeyDownBinded = this.onKeyDown.bind(this);
    this.onResizeBinded = this.onResize.bind(this);

    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationTextArea.prototype.addDomEventListeners = function () {

    this.textArea.addEventListener('keydown', this.onKeyDownBinded, false);
};

CLOUD.Extensions.AnnotationTextArea.prototype.removeDomEventListeners = function () {

    this.textArea.removeEventListener('keydown', this.onKeyDownBinded, false);
};

CLOUD.Extensions.AnnotationTextArea.prototype.onKeyDown = function () {

    var keyCode = event.keyCode;
    var shiftDown = event.shiftKey;

    if (!shiftDown && keyCode === 13) {
        event.preventDefault();
        this.accept();
    }
};

CLOUD.Extensions.AnnotationTextArea.prototype.onResize = function () {

    window.requestAnimationFrame(function () {

        if (this.textAnnotation) {

            var text = this.textArea.value;
            this.style = null;
            this.init();
            this.textArea.value = text;
        }

    }.bind(this));
};

CLOUD.Extensions.AnnotationTextArea.prototype.destroy = function () {

    this.removeDomEventListeners();
    this.inactive();
};

CLOUD.Extensions.AnnotationTextArea.prototype.init = function () {

    var position = this.textAnnotation.getClientPosition();
    var size = this.textAnnotation.getClientSize();
    var left = Math.floor(position.x - size.width * 0.5 + 0.5);
    var top = Math.floor(position.y - size.height * 0.5 + 0.5);

    var lineHeightPercentage = this.textAnnotation.lineHeight + "%";
    this.textAreaStyle['line-height'] = lineHeightPercentage;

    this.setBound(left, top, size.width, size.height);
    this.setStyle(this.textAnnotation.getStyle());
    this.textArea.value = this.textAnnotation.getText();

};

CLOUD.Extensions.AnnotationTextArea.prototype.setBound = function (left, top, width, height) {

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

CLOUD.Extensions.AnnotationTextArea.prototype.setStyle = function (style) {

    if (this.style) {

        var width = parseFloat(this.textArea.style.width);
        var height = parseFloat(this.textArea.style.height);
        var left = parseFloat(this.textArea.style.left);
        var top = parseFloat(this.textArea.style.top);

        var position = {
            x: left + (width * 0.5),
            y: top + (height * 0.5)
        };

        this.setBound(
            position.x - width * 0.5,
            position.y - height * 0.5,
            width, height);
    }

    this.textAreaStyle['font-family'] = style['font-family'];
    this.textAreaStyle['font-size'] = style['font-size'] + 'px';
    this.textAreaStyle['font-weight'] = style['font-weight'];
    this.textAreaStyle['font-style'] = style['font-style'];
    this.textAreaStyle['color'] = style['fill-color'];

    var styleStr = CLOUD.DomUtil.getStyleString(this.textAreaStyle);
    this.textArea.setAttribute('style', styleStr);

    this.style = CLOUD.DomUtil.cloneStyle(style);
};

CLOUD.Extensions.AnnotationTextArea.prototype.isActive = function () {

    return !!this.textAnnotation;
};

CLOUD.Extensions.AnnotationTextArea.prototype.active = function (annotation, firstEdit) {

    if (this.textAnnotation === annotation) {
        return;
    }

    this.inactive();

    this.container.appendChild(this.textArea);
    this.textAnnotation = annotation;
    this.firstEdit = firstEdit || false;

    this.init();

    window.addEventListener('resize', this.onResizeBinded);

    var textArea = this.textArea;

    window.requestAnimationFrame(function(){
        textArea.focus();
    });
};

CLOUD.Extensions.AnnotationTextArea.prototype.inactive = function () {

    window.removeEventListener('resize', this.onResizeBinded);

    if (this.textAnnotation) {

        this.textAnnotation = null;
        this.container.removeChild(this.textArea);
    }

    this.style = null;
};

CLOUD.Extensions.AnnotationTextArea.prototype.accept = function () {

    var left = parseFloat(this.textArea.style.left);
    var top = parseFloat(this.textArea.style.top);
    var width = parseFloat(this.textArea.style.width);
    var height = parseFloat(this.textArea.style.height);
    var textValues = this.getTextValues();
    var position = {
        x: left + (width * 0.5),
        y: top + (height * 0.5)
    };
    var data = {
        annotation: this.textAnnotation,
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

CLOUD.Extensions.AnnotationTextArea.prototype.getTextValuesByAnnotation = function (annotation) {

    this.active(annotation, false);

    var textValues = this.getTextValues();

    this.inactive();

    return textValues;
};

CLOUD.Extensions.AnnotationTextArea.prototype.getTextValues = function () {

    var text = this.textArea.value;

    return {
        text: text,
        lines: this.calcTextLines()
    };
};

CLOUD.Extensions.AnnotationTextArea.prototype.calcTextLines = function () {

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

CLOUD.Extensions.AnnotationTextArea.prototype.getShorterLine = function (line) {

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

CLOUD.Extensions.AnnotationTextArea.prototype.splitWord = function (word, remaining, maxLength, output) {

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

CLOUD.Extensions.AnnotationTextArea.prototype.splitLine = function (text, maxLength, output) {

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


CLOUD.Extensions.AnnotationFrame = function (editor, container) {

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

    this.annotation = null;

    this.onResizeDownBinded = this.onResizeDown.bind(this);
    this.onDoubleClickBinded = this.onDoubleClick.bind(this);
    this.onRepositionDownBinded = this.onRepositionDown.bind(this);
    this.onRotationDownBinded = this.onRotationDown.bind(this);

    this.createFramePanel();
    this.addDomEventListeners();
};

CLOUD.Extensions.AnnotationFrame.prototype.addDomEventListeners = function () {

    this.framePanel.addEventListener('mousedown', this.onResizeDownBinded);
    this.framePanel.addEventListener('dblclick', this.onDoubleClickBinded);
    this.selection.element.addEventListener('mousedown', this.onRepositionDownBinded);
    this.selection.element.addEventListener('mousedown', this.onRotationDownBinded);
};

CLOUD.Extensions.AnnotationFrame.prototype.removeDomEventListeners = function () {

    this.framePanel.removeEventListener('mousedown', this.onResizeDownBinded);
    this.framePanel.removeEventListener('dblclick', this.onDoubleClickBinded);
    this.selection.element.removeEventListener('mousedown', this.onRepositionDownBinded);
    this.selection.element.removeEventListener('mousedown', this.onRotationDownBinded);
};

CLOUD.Extensions.AnnotationFrame.prototype.onMouseMove = function (event) {

};

CLOUD.Extensions.AnnotationFrame.prototype.onMouseUp = function (event) {
};

CLOUD.Extensions.AnnotationFrame.prototype.onRepositionDown = function (event) {

    if (!this.annotation) return;

    if (this.isDragPoint(event.target) || this.isRotatePoint(event.target)) return;

    this.selection.dragging = true;
    this.originMouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    this.originPosition = this.annotation.getClientPosition();

    this.onMouseMove = this.onRepositionMove.bind(this);
    this.onMouseUp = this.onRepositionUp.bind(this);

    this.editor.dragAnnotationFrameBegin();
};

CLOUD.Extensions.AnnotationFrame.prototype.onRepositionMove = function (event) {

    if (!this.annotation) return;

    if (!this.selection.dragging) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);

    var movement = {
        x: mouse.x - this.originMouse.x,
        y: mouse.y - this.originMouse.y
    };

    var x = this.originPosition.x + movement.x;
    var y = this.originPosition.y + movement.y;

    this.updatePosition(x, y, this.selection.rotation);
    var position = this.editor.getAnnotationWorldPosition({x: x, y: y});
    this.annotation.resetPosition(position);
};

CLOUD.Extensions.AnnotationFrame.prototype.onRepositionUp = function () {

    this.onMouseMove = function () {
    };

    this.onMouseUp = function () {
    };

    if (!this.selection.dragging) {
        return;
    }

    this.selection.dragging = false;
    this.editor.dragAnnotationFrameEnd();
};

CLOUD.Extensions.AnnotationFrame.prototype.onResizeDown = function (event) {

    if (!this.annotation) return;

    var target = event.target;

    if (this.isDragPoint(target)) {

        this.selection.resizing = true;
        this.selection.handle.resizingPanel = target;

        var direction = this.selection.handle.resizingPanel.getAttribute('data-drag-point');
        this.container.style.cursor = direction + '-resize';

        var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
        var position = this.annotation.getClientPosition();
        var size = this.annotation.getClientSize();

        this.origin = {
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            mouseX: mouse.x,
            mouseY: mouse.y
        };

        this.onMouseMove = this.onResizeMove.bind(this);
        this.onMouseUp = this.onResizeUp.bind(this);

        this.editor.dragAnnotationFrameBegin();
    }
};

CLOUD.Extensions.AnnotationFrame.prototype.onResizeMove = function (event) {

    if (!this.annotation) return;

    if (!this.selection.resizing) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    var origin = this.origin;

    var movement = {
        x: mouse.x - origin.mouseX,
        y: mouse.y - origin.mouseY
    };

    var vMovement = new THREE.Vector3(movement.x, movement.y, 0);
    var matRotation = new THREE.Matrix4().makeRotationZ(-this.selection.rotation);
    movement = vMovement.applyMatrix4(matRotation);

    var x = origin.x,
        y = origin.y,
        width = origin.width,
        height = origin.height;

    var translationDelta = new THREE.Vector3();
    var direction = this.selection.handle.resizingPanel.getAttribute('data-drag-point');

    var translations = {
        n: function () {
            height -= movement.y;
            translationDelta.y = movement.y;
        },
        s: function () {
            height += movement.y;
            translationDelta.y = movement.y;
        },
        w: function () {
            width -= movement.x;
            translationDelta.x = movement.x;
        },
        e: function () {
            width += movement.x;
            translationDelta.x = movement.x;
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

    var matRedoRotation = new THREE.Matrix4().makeRotationZ(this.selection.rotation);
    var actualDelta = translationDelta.applyMatrix4(matRedoRotation);
    var clientPosition = {x: x + (actualDelta.x * 0.5), y: y + (actualDelta.y * 0.5)};
    var clientSize = {width: width, height: height};
    var newPosition = this.editor.getAnnotationWorldPosition(clientPosition);
    var size = this.editor.getAnnotationWorldSize(clientSize, clientPosition);

    this.annotation.resetSize(size, newPosition);
};

CLOUD.Extensions.AnnotationFrame.prototype.onResizeUp = function (event) {

    this.onMouseMove = function () {
    };

    this.onMouseUp = function () {
    };

    this.selection.resizing = false;
    this.selection.handle.resizingPanel = null;
    this.container.style.cursor = '';
    this.editor.dragAnnotationFrameEnd();
};

CLOUD.Extensions.AnnotationFrame.prototype.onRotationDown = function (event) {

    if (!this.annotation) return;

    if (!this.isRotatePoint(event.target)) return;

    this.selection.rotating = true;

    this.originPosition = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    this.originRotation = this.selection.rotation || 0;

    this.onMouseMove = this.onRotationMove.bind(this);
    this.onMouseUp = this.onRotationUp.bind(this);

    this.editor.dragAnnotationFrameBegin();
};

CLOUD.Extensions.AnnotationFrame.prototype.onRotationMove = function (event) {

    if (!this.annotation) return;

    if (!this.selection.rotating) return;

    var mouse = this.editor.getPointOnDomContainer(event.clientX, event.clientY);
    var position = this.annotation.getClientPosition();
    var angle1 = CLOUD.Extensions.Utils.Geometric.getAngleBetweenPoints(position, mouse);
    var angle2 = CLOUD.Extensions.Utils.Geometric.getAngleBetweenPoints(position, this.originPosition);
    var rotation = angle1 - angle2 + this.originRotation;

    this.updatePosition(this.selection.x, this.selection.y, rotation);

    this.annotation.resetRotation(rotation);
};

CLOUD.Extensions.AnnotationFrame.prototype.onRotationUp = function (event) {

    this.onMouseMove = function () {
    };

    this.onMouseUp = function () {
    };

    this.selection.rotating = false;
    this.originRotation = null;
    this.originPosition = null;
    this.editor.dragAnnotationFrameEnd();
};

CLOUD.Extensions.AnnotationFrame.prototype.onDoubleClick = function (event) {

    this.selection.dragging = false;

    if (this.annotation) {
        this.editor.onMouseDoubleClick(event, this.annotation);
    }
};

CLOUD.Extensions.AnnotationFrame.prototype.destroy = function () {

    this.removeDomEventListeners();
};

CLOUD.Extensions.AnnotationFrame.prototype.createFramePanel = function () {

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

CLOUD.Extensions.AnnotationFrame.prototype.setSelection = function (x, y, width, height, rotation) {

    this.updateDimensions(width, height);
    this.updatePosition(x, y, rotation);
    this.updateState(true);
    this.framePanel.style.visibility = 'visible';
};

CLOUD.Extensions.AnnotationFrame.prototype.setAnnotation = function (annotation) {

    if (!annotation) {

        if (this.annotation) {

            this.annotation = null;
            this.updateState(false);
        }

        return;
    }

    var size = annotation.getClientSize();
    var position = annotation.getClientPosition();
    var rotation = annotation.rotation;

    this.annotation = annotation;

    this.setSelection(position.x - (size.width / 2), position.y - (size.height / 2), size.width, size.height, rotation);

    this.enableResize();
    this.enableRotation();
};

CLOUD.Extensions.AnnotationFrame.prototype.isActive = function () {
    return this.isDragging() || this.isResizing() || this.isRotating();
};

CLOUD.Extensions.AnnotationFrame.prototype.dragBegin = function (event) {

    this.onRepositionDown(event);
};

CLOUD.Extensions.AnnotationFrame.prototype.isDragging = function () {

    return this.selection.dragging;
};

CLOUD.Extensions.AnnotationFrame.prototype.isResizing = function () {

    return this.selection.resizing;
};

CLOUD.Extensions.AnnotationFrame.prototype.isRotating = function () {

    return this.selection.rotating;
};

CLOUD.Extensions.AnnotationFrame.prototype.enableResize = function () {

    var handle, direction;

    if (this.annotation.disableResizeHeight || this.annotation.disableResizeWidth) {

        for (direction in this.selection.handle) {

            handle = this.selection.handle[direction];
            if (handle) handle.style.display = 'none';
        }

        if (this.annotation.disableResizeHeight) {

            this.selection.handle['w'].style.display = 'block';
            this.selection.handle['e'].style.display = 'block';
        }

        if (this.annotation.disableResizeWidth) {

            this.selection.handle['n'].style.display = 'block';
            this.selection.handle['s'].style.display = 'block';
        }
    } else {

        for (direction in this.selection.handle) {

            handle = this.selection.handle[direction];

            if (handle) {
                handle.style.display = 'block';
            }
        }
    }

};

CLOUD.Extensions.AnnotationFrame.prototype.enableRotation = function () {

    var display = this.annotation.disableRotation ? 'none' : 'block';
    this.selection.rotationPanel.style.display = display;
};

CLOUD.Extensions.AnnotationFrame.prototype.updateDimensions = function (width, height) {

    this.selection.width = width;
    this.selection.height = height;
    this.selection.element.style.width = width + 'px';
    this.selection.element.style.height = height + 'px';
};

CLOUD.Extensions.AnnotationFrame.prototype.updatePosition = function (x, y, rotation) {

    var size = this.annotation.getClientSize();

    this.selection.x = x;
    this.selection.y = y;
    this.selection.rotation = rotation;

    this.selection.element.style.msTransform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.msTransformOrigin = (size.width / 2) + 'px ' + (size.height / 2) + 'px';

    this.selection.element.style.webkitTransform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.webkitTransformOrigin = (size.width / 2) + 'px ' + (size.height / 2) + 'px';

    this.selection.element.style.transform = CLOUD.DomUtil.toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
    this.selection.element.style.transformOrigin = (size.width / 2) + 'px ' + (size.height / 2) + 'px';
};

CLOUD.Extensions.AnnotationFrame.prototype.updateState = function (active) {

    this.selection.active = active;
    this.selection.element.style.display = active ? 'block' : 'none';
};

CLOUD.Extensions.AnnotationFrame.prototype.isDragPoint = function (element) {

    return CLOUD.DomUtil.matchesSelector(element, '.select-drag-point');
};

CLOUD.Extensions.AnnotationFrame.prototype.isRotatePoint = function (element) {

    return CLOUD.DomUtil.matchesSelector(element, '.select-rotate-point');
};
var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};

CLOUD.Extensions.AnnotationEditor = function (viewer) {
    "use strict";

    this.cameraEditor = viewer.cameraEditor;
    this.domElement = viewer.domElement;
    this.annotations = [];
    this.selectedAnnotation = null;
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
    this.annotationType = CLOUD.Extensions.Annotation.shapeTypes.ARROW;
    this.nextAnnotationId = 0;
    this.annotationMinLen = 16;
    this.initialized = false;
    this.epsilon = 0.0001;

    this.onMouseDownBinded = this.onMouseDown.bind(this);
    this.onMouseDoubleClickBinded = this.onMouseDoubleClick.bind(this);
    this.onMouseMoveBinded = this.onMouseMove.bind(this);
    this.onMouseUpBinded = this.onMouseUp.bind(this);
    this.onKeyDownBinded = this.onKeyDown.bind(this);
    this.onKeyUpBinded = this.onKeyUp.bind(this);
};

CLOUD.Extensions.AnnotationEditor.prototype.addDomEventListeners = function () {

    if (this.svg) {

        this.svg.addEventListener('mousedown', this.onMouseDownBinded, false);
        this.svg.addEventListener('dblclick', this.onMouseDoubleClickBinded, false);

        window.addEventListener('mousemove', this.onMouseMoveBinded, false);
        window.addEventListener('mouseup', this.onMouseUpBinded, false);
        window.addEventListener('keydown', this.onKeyDownBinded, false);
        window.addEventListener('keyup', this.onKeyUpBinded, false);

        this.onFocus();
    }

};

CLOUD.Extensions.AnnotationEditor.prototype.removeDomEventListeners = function () {

    if (this.svg) {

        this.svg.removeEventListener('mousedown', this.onMouseDownBinded, false);
        this.svg.removeEventListener('dblclick', this.onMouseDoubleClickBinded, false);

        window.removeEventListener('mousemove', this.onMouseMoveBinded, false);
        window.removeEventListener('mouseup', this.onMouseUpBinded, false);
        window.removeEventListener('keydown', this.onKeyDownBinded, false);
        window.removeEventListener('keyup', this.onKeyUpBinded, false);
    }

};

CLOUD.Extensions.AnnotationEditor.prototype.onFocus = function () {

    if (this.svg) {

        this.svg.focus();
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.onMouseDown = function (event) {

    event.preventDefault();
    event.stopPropagation();

    if (this.annotationFrame.isActive()) {

        this.annotationFrame.setAnnotation(this.selectedAnnotation);

        return;
    }

    this.handleMouseEvent(event, "down");

    if (!this.isCreating && event.target === this.svg) {

        this.selectAnnotation(null);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.onMouseMove = function (event) {

    event.preventDefault();
    event.stopPropagation();

    if (this.annotationFrame.isActive()) {

        this.annotationFrame.onMouseMove(event);
        this.annotationFrame.setAnnotation(this.selectedAnnotation);

        return;
    }

    this.handleMouseEvent(event, "move");
};

CLOUD.Extensions.AnnotationEditor.prototype.onMouseUp = function (event) {

    event.preventDefault();
    event.stopPropagation();

    // 批注编辑结束
    if (this.annotationFrame.isActive()) {

        this.annotationFrame.onMouseUp(event);

        return;
    }

    if (this.selectedAnnotation && this.isCreating) {

        this.handleMouseEvent(event, "up");
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.onMouseDoubleClick = function (event, annotation) {

    event.preventDefault();
    event.stopPropagation();

    if (!this.isEditing) {
        return;
    }

    this.mouseDoubleClickForCloud(event);
    this.mouseDoubleClickForText(event, annotation);
};

CLOUD.Extensions.AnnotationEditor.prototype.onKeyDown = function (event) {

};

CLOUD.Extensions.AnnotationEditor.prototype.onKeyUp = function (event) {

    if (!this.isEditing) {
        return;
    }

    switch (event.keyCode) {
        case this.keys.DELETE:
            if (this.selectedAnnotation) {
                this.selectedAnnotation.delete();
                this.selectedAnnotation = null;
                this.deselectAnnotation();
            }
            break;
        case this.keys.ESC:

            // 结束云图绘制
            if (this.annotationType === CLOUD.Extensions.Annotation.shapeTypes.CLOUD) {

                // 结束云图绘制，不封闭云图
                this.selectedAnnotation.setSeal(false);
                this.selectedAnnotation.finishTrack();
                this.createAnnotationEnd();
                this.deselectAnnotation();
            }

            if (this.annotationType === CLOUD.Extensions.Annotation.shapeTypes.TEXT) {

                if (this.annotationTextArea.isActive()) {
                    this.annotationTextArea.accept();
                }
            }

            break;
        default :
            break;
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.onResize = function () {

    var bounds = this.getDomContainerBounds();

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = bounds.width;
    this.bounds.height = bounds.height;

    this.svg.setAttribute('width', this.bounds.width + '');
    this.svg.setAttribute('height', this.bounds.height + '');

    this.updateAnnotations();
};

CLOUD.Extensions.AnnotationEditor.prototype.handleMouseEvent = function (event, type) {

    var mode = this.annotationType;

    switch (mode) {

        case CLOUD.Extensions.Annotation.shapeTypes.RECTANGLE:
            if (type === "down") {

                if (this.mouseDownForRectangle(event)) {
                    this.createAnnotationBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForRectangle(event);
            } else if (type === "up") {
                this.createAnnotationEnd();
                this.deselectAnnotation();
            }
            break;
        case CLOUD.Extensions.Annotation.shapeTypes.CIRCLE:
            if (type === "down") {

                if (this.mouseDownForCircle(event)) {
                    this.createAnnotationBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForCircle(event);
            } else if (type === "up") {
                //this.created()
                this.createAnnotationEnd();
                this.deselectAnnotation();
            }
            break;
        case CLOUD.Extensions.Annotation.shapeTypes.CROSS:
            if (type === "down") {
                if (this.mouseDownForCross(event)) {
                    this.createAnnotationBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForCross(event);
            } else if (type === "up") {
                this.createAnnotationEnd();
                this.deselectAnnotation();
            }
            break;
        case CLOUD.Extensions.Annotation.shapeTypes.CLOUD:
            if (type === "down") {
                if (this.mouseDownForCloud(event)) {
                    this.createAnnotationBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForCloud(event);
            } else if (type === "up") {
                this.mouseUpForCloud(event);
            }
            break;
        case CLOUD.Extensions.Annotation.shapeTypes.TEXT:
            if (type === "down") {
                this.mouseDownForText(event);
            }
            break;
        case CLOUD.Extensions.Annotation.shapeTypes.ARROW:
        default :
            if (type === "down") {

                if (this.mouseDownForArrow(event)) {
                    this.createAnnotationBegin();
                }
            } else if (type === "move") {
                this.mouseMoveForArrow(event);
            } else if (type === "up") {
                this.createAnnotationEnd();
                this.deselectAnnotation();
            }
            break;
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForArrow = function (event) {

    if (this.selectedAnnotation) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var width = this.annotationMinLen;
    var tail = {x: this.originX, y: this.originY};
    var head = {
        x: Math.round(tail.x + Math.cos(Math.PI * 0.25) * width),
        y: Math.round(tail.y + Math.sin(-Math.PI * 0.25) * width)
    };

    var constrain = function (tail, head, width, bounds) {

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(head.x, head.y, bounds)) {
            return;
        }

        head.y = Math.round(tail.y + Math.sin(Math.PI * 0.25) * width);

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(head.x, head.y, bounds)) {
            return;
        }

        head.x = Math.round(tail.y + Math.cos(-Math.PI * 0.25) * width);

        if (CLOUD.Extensions.Utils.Geometric.isInsideBounds(head.x, head.y, bounds)) {
            return;
        }

        head.y = Math.round(tail.y + Math.sin(-Math.PI * 0.25) * width);
    };

    constrain(tail, head, width, this.getBounds());

    head = this.getAnnotationWorldPosition(head);
    tail = this.getAnnotationWorldPosition(tail);

    var arrowId = this.generateAnnotationId();
    var arrow = new CLOUD.Extensions.AnnotationArrow(this, arrowId);
    arrow.setByTailHead(tail, head);
    this.addAnnotation(arrow);
    arrow.created();

    this.selectedAnnotation = arrow;

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseMoveForArrow = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var arrow = this.selectedAnnotation;
    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.originX;
    var startY = this.originY;

    var deltaX = end.x - startX;

    if (Math.abs(deltaX) < this.annotationMinLen) {

        if (deltaX > 0) {
            end.x = startX + this.annotationMinLen;
        } else {
            end.x = startX - this.annotationMinLen;
        }
    }

    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    var tail = {x: startX, y: startY};
    var head = {x: endX, y: endY};

    tail = this.getAnnotationWorldPosition(tail);
    head = this.getAnnotationWorldPosition(head);

    if (Math.abs(arrow.head.x - head.x) >= this.epsilon || Math.abs(arrow.head.y - head.y) >= this.epsilon ||
        Math.abs(arrow.tail.x - tail.x) >= this.epsilon || Math.abs(arrow.tail.y - tail.y) >= this.epsilon) {

        arrow.setByTailHead(tail, head);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForRectangle = function (event) {

    if (this.selectedAnnotation) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);
    var minLen = this.annotationMinLen;

    this.originX = start.x;
    this.originY = start.y;

    var clientPosition = {x: start.x, y: start.y};
    var clientSize = {width: minLen, height: minLen};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    var id = this.generateAnnotationId();
    var rectangle = new CLOUD.Extensions.AnnotationRectangle(this, id);
    rectangle.set(position, size, 0);
    this.addAnnotation(rectangle);
    rectangle.created();

    this.selectedAnnotation = rectangle;

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseMoveForRectangle = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var rectangle = this.selectedAnnotation;
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

    var clientPosition = {x: (startX + endX) / 2, y: (startY + endY) / 2};
    var clientSize = {width: Math.abs(endX - startX), height: Math.abs(endY - startY)};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    if (Math.abs(rectangle.position.x - position.x) > this.epsilon || Math.abs(rectangle.size.y - size.y) > this.epsilon ||
        Math.abs(rectangle.position.y - position.y) > this.epsilon || Math.abs(rectangle.size.y - size.y) > this.epsilon) {

        rectangle.set(position, size);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForCircle = function (event) {

    if (this.selectedAnnotation) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var minLen = this.annotationMinLen;
    var clientPosition = {x: start.x, y: start.y};
    var clientSize = {width: minLen, height: minLen};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    var id = this.generateAnnotationId();
    var circle = new CLOUD.Extensions.AnnotationCircle(this, id);
    circle.set(position, size, 0);
    this.addAnnotation(circle);
    circle.created();

    this.selectedAnnotation = circle;

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseMoveForCircle = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var circle = this.selectedAnnotation;
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

    var clientPosition = {x: (startX + endX) / 2, y: (startY + endY) / 2};
    var clientSize = {width: Math.abs(endX - startX), height: Math.abs(endY - startY)};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    if (Math.abs(circle.position.x - position.x) > this.epsilon || Math.abs(circle.size.y - size.y) > this.epsilon ||
        Math.abs(circle.position.y - position.y) > this.epsilon || Math.abs(circle.size.y - size.y) > this.epsilon) {

        circle.set(position, size);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForCross = function (event) {

    if (this.selectedAnnotation) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);

    this.originX = start.x;
    this.originY = start.y;

    var minLen = this.annotationMinLen;
    var clientPosition = {x: start.x, y: start.y};
    var clientSize = {width: minLen, height: minLen};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    var id = this.generateAnnotationId();
    var cross = new CLOUD.Extensions.AnnotationCross(this, id);
    cross.set(position, size, 0);
    this.addAnnotation(cross);
    cross.created();

    this.selectedAnnotation = cross;

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseMoveForCross = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var cross = this.selectedAnnotation;
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

    var clientPosition = {x: (startX + endX) / 2, y: (startY + endY) / 2};
    var clientSize = {width: Math.abs(endX - startX), height: Math.abs(endY - startY)};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    if (Math.abs(cross.position.x - position.x) > this.epsilon || Math.abs(cross.size.y - size.y) > this.epsilon ||
        Math.abs(cross.position.y - position.y) > this.epsilon || Math.abs(cross.size.y - size.y) > this.epsilon) {

        cross.set(position, size);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForCloud = function (event) {

    if (this.selectedAnnotation) return false;

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);
    this.originX = start.x;
    this.originY = start.y;

    var position = this.getAnnotationWorldPosition({x: start.x, y: start.y});
    this.cloudPoints = [position];

    var id = this.generateAnnotationId();
    var cloud = new CLOUD.Extensions.AnnotationCloud(this, id);
    cloud.setByPositions(this.cloudPoints);
    cloud.created();
    cloud.enableTrack();

    this.addAnnotation(cloud);
    this.selectedAnnotation = cloud;

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseMoveForCloud = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var cloud = this.selectedAnnotation;

    if (cloud.getTrackState()) {

        var mouse = this.getPointOnDomContainer(event.clientX, event.clientY);
        var position = this.getAnnotationWorldPosition(mouse);
        cloud.startTrack();
        cloud.setTrackingPoint(position);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseUpForCloud = function (event) {

    if (!this.selectedAnnotation || !this.isCreating) {
        return;
    }

    var end = this.getPointOnDomContainer(event.clientX, event.clientY);
    var origin = {x: this.originX, y: this.originY};
    var threshold = 2; // 相差2个像素

    // 判断是否同一个点, 同一个点不加入集合
    if (CLOUD.Extensions.Utils.Geometric.isEqualBetweenPoints(origin, end, threshold)) return;

    var point = this.getAnnotationWorldPosition({x: end.x, y: end.y});
    this.cloudPoints.push(point);

    var cloud = this.selectedAnnotation;

    // 先禁止跟踪，在真正响应事件时启用
    cloud.disableTrack();

    var positions = this.cloudPoints;

    // 采用计时器来判断是否单击和双击
    function handleMouseUp() {

        cloud.finishTrack();
        cloud.setByPositions(positions);
        cloud.enableTrack();
    }

    if (this.timerId) {
        clearTimeout(this.timerId);
    }

    // 延迟300ms以判断是否单击
    this.timerId = setTimeout(handleMouseUp, 300);
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDoubleClickForCloud = function (event) {

    if (this.isCreating && this.selectedAnnotation) {

        if (this.selectedAnnotation.shapeType === CLOUD.Extensions.Annotation.shapeTypes.CLOUD) {

            // 清除定时器
            if (this.timerId) {
                clearTimeout(this.timerId);
            }

            var position = this.getPointOnDomContainer(event.clientX, event.clientY);
            var point = this.getAnnotationWorldPosition(position);

            this.cloudPoints.push({x: point.x, y: point.y});
            this.selectedAnnotation.finishTrack();
            // 结束云图绘制，并封闭云图
            this.selectedAnnotation.setByPositions(this.cloudPoints, true);
            this.createAnnotationEnd();
            this.deselectAnnotation();
        }
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDownForText = function (event) {

    if (this.annotationTextArea.isActive()) {

        this.annotationTextArea.accept();
        return;
    }

    if (this.selectedAnnotation) {
        return;
    }

    var start = this.getPointOnDomContainer(event.clientX, event.clientY);
    var clientFontSize = 16;
    var originWidth = clientFontSize * 20;
    var originHeight = clientFontSize * 4;

    var clientPosition = {x: start.x + 0.5 * originWidth, y: start.y + 0.5 * originHeight};
    var clientSize = {width: originWidth, height: originHeight};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    var id = this.generateAnnotationId();
    var text = new CLOUD.Extensions.AnnotationText(this, id);
    text.set(position, size, 0, '');
    this.addAnnotation(text);
    text.created();
    text.forceRedraw();

    this.selectedAnnotation = text;
    this.annotationTextArea.active(this.selectedAnnotation, true);

    return true;
};

CLOUD.Extensions.AnnotationEditor.prototype.mouseDoubleClickForText = function (event, annotation) {

    if (annotation) {

        if (this.selectedAnnotation && (this.selectedAnnotation.shapeType === CLOUD.Extensions.Annotation.shapeTypes.TEXT)) {

            this.selectedAnnotation.hide();
            this.deselectAnnotation();
            this.annotationTextArea.active(annotation, false);
        }
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.init = function (callbacks) {

    if (callbacks) {

        this.beginEditCallback = callbacks.beginEditCallback;
        this.endEditCallback = callbacks.endEditCallback;
        this.changeEditorModeCallback = callbacks.changeEditorModeCallback;
    }

    if (!this.svg) {

        var rect = this.getDomContainerBounds();
        this.bounds.width = rect.width;
        this.bounds.height = rect.height;

        this.svg = CLOUD.Extensions.Utils.Shape2D.createSvgElement('svg');
        this.svg.style.position = "absolute";
        this.svg.style.display = "block";
        this.svg.style.left = "0";
        this.svg.style.top = "0";
        this.svg.setAttribute('width', rect.width + '');
        this.svg.setAttribute('height', rect.height + '');

        this.domElement.appendChild(this.svg);

        this.enableSVGPaint(false);

        this.annotationFrame = new CLOUD.Extensions.AnnotationFrame(this, this.domElement);
        this.annotationTextArea = new CLOUD.Extensions.AnnotationTextArea(this, this.domElement);
    }

    this.initialized = true;
};

CLOUD.Extensions.AnnotationEditor.prototype.uninit = function () {

    this.initialized = false;

    if (!this.svg) return;

    // 如果仍然处在编辑中，强行结束
    if (this.isEditing) {
        this.editEnd();
    }

    // 卸载数据
    this.unloadAnnotations();

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

CLOUD.Extensions.AnnotationEditor.prototype.isInitialized = function () {

    return this.initialized;
};

CLOUD.Extensions.AnnotationEditor.prototype.destroy = function () {

    if (this.annotationTextArea) {

        if (this.annotationTextArea.isActive()) {

            this.annotationTextArea.accept();
        }
    }

    this.deselectAnnotation();

    if (this.annotationFrame) {

        this.annotationFrame.destroy();
        this.annotationFrame = null;
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.generateAnnotationId = function () {

    ++this.nextAnnotationId;

    return this.nextAnnotationId.toString(10);

    //return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    //    return v.toString(16);
    //});
};

CLOUD.Extensions.AnnotationEditor.prototype.onExistEditor = function () {

    this.uninit();
};

CLOUD.Extensions.AnnotationEditor.prototype.editBegin = function () {

    if (this.isEditing) {
        return true;
    }

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Utils.Shape2D.createSvgElement('g');
    }

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    this.handleCallbacks("beginEdit");

    // 注册事件
    this.addDomEventListeners();
    // 允许在SVG上绘图
    this.enableSVGPaint(true);
    // 清除数据
    this.clear();

    this.isEditing = true;
};

CLOUD.Extensions.AnnotationEditor.prototype.editEnd = function () {

    this.isEditing = false;

    if (this.annotationTextArea && this.annotationTextArea.isActive()) {
        this.annotationTextArea.accept();
    }

    if (this.svgGroup && this.svgGroup.parentNode) {
        //this.svg.removeChild(this.svgGroup);
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    this.removeDomEventListeners();

    this.handleCallbacks("endEdit");

    // 不允许穿透
    this.enableSVGPaint(false);
    this.deselectAnnotation();
};

CLOUD.Extensions.AnnotationEditor.prototype.createAnnotationBegin = function () {

    if (!this.isCreating) {

        this.isCreating = true;
        this.disableAnnotationInteractions(true);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.createAnnotationEnd = function () {

    if (this.isCreating) {

        this.isCreating = false;
        this.disableAnnotationInteractions(false);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.dragAnnotationFrameBegin = function () {

    this.disableAnnotationInteractions(true)
};

CLOUD.Extensions.AnnotationEditor.prototype.dragAnnotationFrameEnd = function () {

    this.disableAnnotationInteractions(false)
};

CLOUD.Extensions.AnnotationEditor.prototype.clear = function () {

    var annotations = this.annotations;

    while (annotations.length) {
        var annotation = annotations[0];
        this.removeAnnotation(annotation);
        annotation.destroy();
    }

    var group = this.svgGroup;
    if (group && group.childNodes.length > 0) {
        while (group.childNodes.length) {
            group.removeChild(group.childNodes[0]);
        }
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.setAnnotationType = function (type) {

    this.annotationType = type;

    // 强行完成
    this.createAnnotationEnd();
    this.deselectAnnotation();

    this.onFocus();
};

CLOUD.Extensions.AnnotationEditor.prototype.addAnnotation = function (annotation) {

    annotation.setParent(this.svgGroup);

    this.annotations.push(annotation);
};

CLOUD.Extensions.AnnotationEditor.prototype.deleteAnnotation = function (annotation) {

    if (annotation) {
        this.removeAnnotation(annotation);
        annotation.destroy();
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.removeAnnotation = function (annotation) {

    var idx = this.annotations.indexOf(annotation);

    if (idx !== -1) {
        this.annotations.splice(idx, 1);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.setAnnotationSelection = function (annotation) {

    if (this.selectedAnnotation !== annotation) {

        this.deselectAnnotation();
    }

    this.selectedAnnotation = annotation;

    // 放在最前面

    if (!this.isCreating) {
        this.annotationFrame.setAnnotation(annotation);
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.selectAnnotation = function (annotation) {

    if (annotation) {

        if (this.annotationType === annotation.shapeType) {

            this.setAnnotationSelection(annotation)

        } else {

            var shapeType = annotation.shapeType;

            this.setAnnotationSelection(null);
            //this.setAnnotationType(shapeType);
            this.setAnnotationSelection(annotation);
        }

    } else {
        this.setAnnotationSelection(null);
    }

};

CLOUD.Extensions.AnnotationEditor.prototype.deselectAnnotation = function () {

    if (this.selectedAnnotation) {
        this.selectedAnnotation.deselect();
        this.selectedAnnotation = null;
    }

    this.annotationFrame.setAnnotation(null);
};

CLOUD.Extensions.AnnotationEditor.prototype.worldToClient = function (wPoint) {

    var rect = this.getDomContainerBounds();
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3(wPoint.x, wPoint.y, wPoint.z);

    // 变换到相机空间
    result.applyMatrix4(camera.matrixWorld);
    result.sub(camera.position);
    result.project(camera);

    // 变换到屏幕空间
    result.x = Math.floor(0.5 * (result.x + 1) * rect.width + 0.5);
    result.y = Math.floor(-0.5 * (result.y - 1) * rect.height + 0.5);
    result.z = 0;

    return result;
};

CLOUD.Extensions.AnnotationEditor.prototype.clientToWorld = function (cPoint) {

    var rect = this.getDomContainerBounds();
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    result.x = cPoint.x / rect.width * 2 - 1;
    result.y = -cPoint.y / rect.height * 2 + 1;
    result.z = 0;

    result.unproject(camera);
    result.add(camera.position).applyMatrix4(camera.matrixWorldInverse);
    //result.z = 0;

    return result;
};

CLOUD.Extensions.AnnotationEditor.prototype.getAnnotationWorldPosition = function (cPos) {

    return this.clientToWorld(cPos);
};

CLOUD.Extensions.AnnotationEditor.prototype.getAnnotationClientPosition = function (wPos) {

    return this.worldToClient(wPos);
};

CLOUD.Extensions.AnnotationEditor.prototype.getAnnotationWorldSize = function (cSize, cPos) {

    var lt = this.clientToWorld({x: cPos.x - 0.5 * cSize.width, y: cPos.y - 0.5 * cSize.height});
    var rb = this.clientToWorld({x: cPos.x + 0.5 * cSize.width, y: cPos.y + 0.5 * cSize.height});

    return {width: Math.abs(rb.x - lt.x), height: Math.abs(rb.y - lt.y)}
};

CLOUD.Extensions.AnnotationEditor.prototype.getAnnotationClientSize = function (wSize, wPos) {

    var lt = this.worldToClient({x: wPos.x - 0.5 * wSize.width, y: wPos.y - 0.5 * wSize.height, z: wPos.z});
    var rb = this.worldToClient({x: wPos.x + 0.5 * wSize.width, y: wPos.y + 0.5 * wSize.height, z: wPos.z});

    return {width: Math.abs(rb.x - lt.x), height: Math.abs(rb.y - lt.y)};
};

CLOUD.Extensions.AnnotationEditor.prototype.getMarkersBoundingBox = function () {

    return null;
};

CLOUD.Extensions.AnnotationEditor.prototype.getBounds = function () {

    return this.bounds;
};

CLOUD.Extensions.AnnotationEditor.prototype.getPointOnDomContainer = function (clientX, clientY) {

    var rect = this.getDomContainerBounds();

    return new THREE.Vector2(clientX - rect.left, clientY - rect.top);
};

CLOUD.Extensions.AnnotationEditor.prototype.getDomContainerBounds = function () {

    return CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
};

CLOUD.Extensions.AnnotationEditor.prototype.getViewBox = function (clientWidth, clientHeight) {

    var lt = this.clientToWorld({x: 0, y: 0});
    var rb = this.clientToWorld({x: clientWidth, y: clientHeight});
    var left = Math.min(lt.x, rb.x);
    var top = Math.min(lt.y, rb.y);
    var right = Math.max(lt.x, rb.x);
    var bottom = Math.max(lt.y, rb.y);

    return [left, top, right - left, bottom - top].join(' ');
};

CLOUD.Extensions.AnnotationEditor.prototype.handleTextChange = function (data) {

    var text = data.annotation;

    if (data.text === '') {
        this.selectAnnotation(null);
        data.annotation.delete();
        return;
    }

    var clientPosition = {x: data.position.x, y: data.position.y};
    var clientSize = {width: data.width, height: data.height};
    var position = this.getAnnotationWorldPosition(clientPosition);
    var size = this.getAnnotationWorldSize(clientSize, clientPosition);

    text.resetSize(size, position);
    text.setText(data.text);

    this.createAnnotationEnd();
    this.deselectAnnotation();
};

CLOUD.Extensions.AnnotationEditor.prototype.disableAnnotationInteractions = function (disable) {

    this.annotations.forEach(function (annotation) {
        annotation.disableInteractions(disable);
    });
};

CLOUD.Extensions.AnnotationEditor.prototype.handleCallbacks = function (name) {

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
            if (this.changeEditorModeCallback) {

                this.changeEditorModeCallback(this.domElement);
            }
            break;
    }

};

CLOUD.Extensions.AnnotationEditor.prototype.renderToCanvas = function (ctx) {

    this.annotations.forEach(function (annotation) {
        ctx.save();
        annotation.renderToCanvas(ctx);
        ctx.restore();
    });
};

// 是否允许在SVG上绘图
CLOUD.Extensions.AnnotationEditor.prototype.enableSVGPaint = function (enable) {

    if (enable) {

        this.svg && this.svg.setAttribute("pointer-events", "painted");
    } else {

        this.svg && this.svg.setAttribute("pointer-events", "none");
    }

};

// ---------------------------- 外部 API BEGIN ---------------------------- //

// 屏幕快照
CLOUD.Extensions.AnnotationEditor.prototype.getScreenSnapshot = function (snapshot) {

    var canvas = document.createElement("canvas");

    var bounds = this.getDomContainerBounds();
    canvas.width = bounds.width;
    canvas.height = bounds.height;

    var ctx = canvas.getContext('2d');
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
    if (snapshot) {

        var preSnapshot = new Image();
        preSnapshot.src = snapshot;
        ctx.drawImage(preSnapshot, 0, 0);
    }

    // 绘制批注
    this.renderToCanvas(ctx);

    var data = canvas.toDataURL("image/png");

    canvas = ctx = null;

    return data;
};

// 设置导出背景色
CLOUD.Extensions.AnnotationEditor.prototype.setBackgroundColor = function (startColor, stopColor) {

    this.gradientStartColor = startColor;
    this.gradientStopColor = stopColor;
};

// 获得批注列表
CLOUD.Extensions.AnnotationEditor.prototype.getAnnotationInfoList = function () {

    // 强行完成

    if (this.annotationType === CLOUD.Extensions.Annotation.shapeTypes.TEXT) {

        if (this.annotationTextArea.isActive()) {
            this.annotationTextArea.accept();
        }
    }

    this.createAnnotationEnd();
    this.deselectAnnotation();

    var annotationInfoList = [];

    for (var i = 0, len = this.annotations.length; i < len; i++) {
        var annotation = this.annotations[i];

        var text = "";
        if (annotation.shapeType === CLOUD.Extensions.Annotation.shapeTypes.TEXT) {
            text = encodeURIComponent(annotation.currText); // 编码中文
            //text = annotation.currText; // 编码中文
        }

        var shapePoints = "";
        var originSize = null;
        if (annotation.shapeType === CLOUD.Extensions.Annotation.shapeTypes.CLOUD) {
            shapePoints = annotation.getShapePoints();
            originSize = annotation.originSize;
        }

        var info = {
            id: annotation.id,
            shapeType: annotation.shapeType,
            position: annotation.position,
            size: annotation.size,
            rotation: annotation.rotation,
            shapePoints: shapePoints,
            originSize: originSize,
            text: text
        };

        annotationInfoList.push(info);
    }

    return annotationInfoList;
};

// 加载批注
CLOUD.Extensions.AnnotationEditor.prototype.loadAnnotations = function (annotationInfoList) {

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Utils.Shape2D.createSvgElement('g');
    }

    // 清除数据
    this.clear();

    if (!this.svgGroup.parentNode) {
        this.svg.insertBefore(this.svgGroup, this.svg.firstChild);
    }

    for (var i = 0, len = annotationInfoList.length; i < len; i++) {

        var info = annotationInfoList[i];
        var id = info.id;
        var shapeType = info.shapeType;
        var position = info.position;
        var size = info.size;
        var rotation = info.rotation;
        var shapePointsStr = info.shapePoints;
        var originSize = info.originSize;
        var text = decodeURIComponent(info.text); // 解码中文
        //var text = info.text; // 解码中文

        switch (shapeType) {

            case CLOUD.Extensions.Annotation.shapeTypes.ARROW:
                var arrow = new CLOUD.Extensions.AnnotationArrow(this, id);
                arrow.set(position, size, rotation);
                this.addAnnotation(arrow);
                arrow.created();
                break;
            case  CLOUD.Extensions.Annotation.shapeTypes.RECTANGLE:
                var rectangle = new CLOUD.Extensions.AnnotationRectangle(this, id);
                rectangle.set(position, size, rotation);
                this.addAnnotation(rectangle);
                rectangle.created();
                break;
            case  CLOUD.Extensions.Annotation.shapeTypes.CIRCLE:
                var circle = new CLOUD.Extensions.AnnotationCircle(this, id);
                circle.set(position, size, rotation);
                this.addAnnotation(circle);
                circle.created();
                break;
            case  CLOUD.Extensions.Annotation.shapeTypes.CROSS:
                var cross = new CLOUD.Extensions.AnnotationCross(this, id);
                cross.set(position, size, rotation);
                this.addAnnotation(cross);
                cross.created();
                break;
            case CLOUD.Extensions.Annotation.shapeTypes.CLOUD:
                var cloud = new CLOUD.Extensions.AnnotationCloud(this, id);
                cloud.set(position, size, rotation, shapePointsStr, originSize);
                this.addAnnotation(cloud);
                cloud.created();
                break;
            case  CLOUD.Extensions.Annotation.shapeTypes.TEXT:
                var textAnnotation = new CLOUD.Extensions.AnnotationText(this, id);
                textAnnotation.set(position, size, rotation, text);
                this.addAnnotation(textAnnotation);
                textAnnotation.created();
                textAnnotation.forceRedraw();
                break;
            default :
                break;
        }
    }
};

// 卸载批注
CLOUD.Extensions.AnnotationEditor.prototype.unloadAnnotations = function () {

    // 清除数据
    this.clear();

    if (this.svgGroup && this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }
};

// 显示批注
CLOUD.Extensions.AnnotationEditor.prototype.showAnnotations = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "visible");
    }
};

// 隐藏批注
CLOUD.Extensions.AnnotationEditor.prototype.hideAnnotations = function () {

    if (this.svgGroup) {
        this.svgGroup.setAttribute("visibility", "hidden");
    }
};

// 设置批注风格（边框色，填充色，字体大小等等）
CLOUD.Extensions.AnnotationEditor.prototype.setAnnotationStyle = function (style) {

    this.annotationStyle = CLOUD.DomUtil.cloneStyle(style);
};

// 更新所有批注
CLOUD.Extensions.AnnotationEditor.prototype.updateAnnotations = function () {

    for (var i = 0, len = this.annotations.length; i < len; i++) {
        var annotation = this.annotations[i];
        annotation.update();
    }

    if (this.annotationFrame && this.selectedAnnotation) {
        this.annotationFrame.setAnnotation(this.selectedAnnotation)
    }
};

CLOUD.Extensions.AnnotationEditor.prototype.onCameraChange = function () {

    if (this.cameraEditor.cameraDirty) {

        this.handleCallbacks("changeEditor");
    }

};

// ---------------------------- 外部 API END ---------------------------- //

var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};

CLOUD.Extensions.DwgAnnotationEditor = function (viewer) {
    "use strict";

    CLOUD.Extensions.AnnotationEditor.call(this, viewer);

    this.pointToScreenCenter = {x: 800, y: 600};
};

CLOUD.Extensions.DwgAnnotationEditor.prototype = Object.create(CLOUD.Extensions.AnnotationEditor.prototype);
CLOUD.Extensions.DwgAnnotationEditor.prototype.constructor = CLOUD.Extensions.DwgAnnotationEditor;

CLOUD.Extensions.DwgAnnotationEditor.prototype.onResize = function () {

    var bounds = this.getDomContainerBounds();

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = bounds.width;
    this.bounds.height = bounds.height;

    this.svg.setAttribute('width', this.bounds.width + '');
    this.svg.setAttribute('height', this.bounds.height + '');
};

CLOUD.Extensions.DwgAnnotationEditor.prototype.setDomContainer = function (domElement) {

    if (domElement) {

        this.domElement = domElement;
    }
};

CLOUD.Extensions.DwgAnnotationEditor.prototype.setPointToScreenCenter = function (point) {

    if (point) {

        this.pointToScreenCenter.x = point.x;
        this.pointToScreenCenter.y = point.y;
    }
};

CLOUD.Extensions.DwgAnnotationEditor.prototype.worldToClient = function (wPoint) {

    var rect = this.getDomContainerBounds();
    var screenCenter = new THREE.Vector3(rect.width * 0.5, rect.height * 0.5, 0);
    var result = new THREE.Vector3(wPoint.x, wPoint.y, wPoint.z);

    // 变换到屏幕空间
    result.x = result.x - this.pointToScreenCenter.x + screenCenter.x;
    result.y = -result.y - this.pointToScreenCenter.y + screenCenter.y;
    result.z = 0;

    return result;
};

CLOUD.Extensions.DwgAnnotationEditor.prototype.clientToWorld = function (cPoint) {

    // Wp - Wc = Sp - Sc ===> Wp = Sp - Sc + Wc
    var rect = this.getDomContainerBounds();
    var screenCenter = new THREE.Vector3(rect.width * 0.5, rect.height * 0.5, 0);
    var result = new THREE.Vector3();

    result.x = cPoint.x - screenCenter.x  + this.pointToScreenCenter.x;
    result.y = -(cPoint.y - screenCenter.y + this.pointToScreenCenter.y); // 翻转,因为绘制图形参照坐标和屏幕的坐标系不同
    result.z = 0;

    return result;
};

CLOUD.Extensions.DwgAnnotationEditor.prototype.onCameraChange = function () {

    this.handleCallbacks("changeEditor");

};

CLOUD.Extensions.Helper2D = function (viewer) {

    this.viewer = viewer;
    this.dwgDomContainer = null;

    this.annotationMode = {MODEL: 0, DWG: 1};
    this.currentAnnotationMode = this.annotationMode.MODEL;
};

CLOUD.Extensions.Helper2D.prototype = {

    constructor: CLOUD.Extensions.Helper2D,

    // canvas转Base64格式png图片
    canvasToImage: function (dataUrl) {

        var editor;
        var newDataUrl;

        if (this.isModelAnnotations()) {

            editor = this.annotationEditor;

        } else {

            editor = this.dwgAnnotationEditor;
        }

        newDataUrl = editor.getScreenSnapshot(dataUrl);

        return newDataUrl;

    },

    // 是否存在批注
    hasAnnotations: function () {

        return this.annotationEditor || this.dwgAnnotationEditor;
    },

    // 是否模型批注
    isModelAnnotations: function () {

        return (this.currentAnnotationMode === this.annotationMode.MODEL);
    },

    // 是否DWG批注
    isDwgAnnotations: function () {

        return (this.currentAnnotationMode === this.annotationMode.DWG);
    },

    // 初始化批注
    initAnnotation: function () {

        var viewer = this.viewer;
        var scope = this;

        if (!this.annotationEditor) {

            this.annotationEditor = new CLOUD.Extensions.AnnotationEditor(viewer);
        }

        if (!this.annotationEditor.isInitialized()) {

            var callbacks = {
                beginEditCallback: function (domElement) {
                    viewer.editorManager.unregisterDomEventListeners(domElement);
                },
                endEditCallback: function (domElement) {
                    viewer.editorManager.registerDomEventListeners(domElement);
                },
                changeEditorModeCallback: function () {
                    scope.uninitAnnotationMode();
                }
            };

            this.annotationEditor.init(callbacks);

            callbacks = null;
        }
    },

    // 卸载批注资源
    uninitAnnotationMode: function () {

        if (this.annotationEditor && this.annotationEditor.isInitialized()) {

            this.annotationEditor.uninit();

        }
    },

    // 设置批注背景色
    setAnnotationBackgroundColor: function (startColor, stopColor) {

        if (this.annotationEditor) {

            this.annotationEditor.setBackgroundColor(startColor, stopColor);
        }
    },

    // 开始批注编辑
    editAnnotationBegin: function () {

        this.currentAnnotationMode = this.annotationMode.MODEL;

        // 如果没有设置批注模式，则自动进入批注模式
        this.initAnnotation();

        this.annotationEditor.editBegin();
    },

    // 完成批注编辑
    editAnnotationEnd: function () {

        if (this.annotationEditor) {

            this.annotationEditor.editEnd();

        }
    },

    // 设置批注类型
    setAnnotationType: function (type) {

        if (this.annotationEditor) {

            this.annotationEditor.setAnnotationType(type);

        }
    },

    // 加载批注列表
    loadAnnotations: function (annotations) {

        if (annotations) {

            this.initAnnotation();
            this.annotationEditor.loadAnnotations(annotations);
        } else {
            this.uninitAnnotationMode();
        }
    },

    // 获得批注对象列表
    getAnnotationInfoList: function () {

        if (this.annotationEditor) {

            return this.annotationEditor.getAnnotationInfoList();

        }

        return null;
    },

    // resize
    resizeAnnotations: function () {

        if (this.annotationEditor && this.annotationEditor.isInitialized()) {

            this.annotationEditor.onResize();

        }
    },

    // render
    renderAnnotations: function () {

        if (this.annotationEditor && this.annotationEditor.isInitialized()) {

            this.annotationEditor.onCameraChange();

        }
    },

    // 初始化DWG批注
    initDwgAnnotation: function (beginEditCallback, endEditCallback) {

        var viewer = this.viewer;
        var scope = this;
        var domElement = this.dwgDomContainer ? this.dwgDomContainer : viewer.domElement;

        if (!this.dwgAnnotationEditor) {

            this.dwgAnnotationEditor = new CLOUD.Extensions.DwgAnnotationEditor(viewer);
        }

        // 设置父容器
        this.dwgAnnotationEditor.setDomContainer(domElement);

        if (!this.dwgAnnotationEditor.isInitialized()) {

            var callbacks = {
                beginEditCallback: beginEditCallback,
                endEditCallback: endEditCallback,
                changeEditorModeCallback: function () {
                    scope.uninitDwgAnnotationMode();
                }
            };

            this.dwgAnnotationEditor.init(callbacks);

            callbacks = null;
        }
    },

    // 卸载DWG批注资源
    uninitDwgAnnotationMode: function () {

        if (this.dwgAnnotationEditor && this.dwgAnnotationEditor.isInitialized()) {

            this.dwgAnnotationEditor.uninit();

        }
    },

    // 设置DWG背景色
    setDwgAnnotationBackgroundColor: function (startColor, stopColor) {

        if (this.dwgAnnotationEditor) {

            this.dwgAnnotationEditor.setBackgroundColor(startColor, stopColor);
        }
    },

    // 开始编辑DWG批注
    editDwgAnnotationBegin: function (pointToCenter, beginEditCallback, endEditCallback, changeEditorModeCallback) {

        this.currentAnnotationMode = this.annotationMode.DWG;

        // 如果没有设置批注模式，则自动进入批注模式
        this.initDwgAnnotation(beginEditCallback, endEditCallback, changeEditorModeCallback);

        if (pointToCenter) {
            this.dwgAnnotationEditor.setPointToScreenCenter(pointToCenter);
        }

        this.dwgAnnotationEditor.editBegin();
    },

    // 完成编辑DWG批注
    editDwgAnnotationEnd: function () {

        if (this.dwgAnnotationEditor) {

            this.dwgAnnotationEditor.editEnd();

        }
    },

    // 设置DWG批注类型
    setDwgAnnotationType: function (type) {

        if (this.dwgAnnotationEditor) {

            this.dwgAnnotationEditor.setAnnotationType(type);

        }
    },

    // 加载DWG批注
    loadDwgAnnotations: function (annotations, pointToCenter, beginEditCallback, endEditCallback) {

        if (pointToCenter) {
            this.dwgAnnotationEditor.setPointToScreenCenter(pointToCenter);
        }

        if (annotations) {

            this.initDwgAnnotation(beginEditCallback, endEditCallback);
            this.dwgAnnotationEditor.loadAnnotations(annotations);
        } else {
            this.uninitDwgAnnotationMode();
        }
    },

    // 获得DWG批注对象列表
    getDwgAnnotationInfoList: function () {

        if (this.dwgAnnotationEditor) {

            return this.dwgAnnotationEditor.getAnnotationInfoList();

        }

        return null;
    },

    // resize
    resizeDwgAnnotations: function () {

        if (this.dwgAnnotationEditor && this.dwgAnnotationEditor.isInitialized()) {

            this.dwgAnnotationEditor.onResize();

        }
    },

    // render
    renderDwgAnnotations: function () {

        if (this.dwgAnnotationEditor && this.dwgAnnotationEditor.isInitialized()) {

            this.dwgAnnotationEditor.onCameraChange();

        }
    },

    getDwgScreenSnapshot: function (snapshotCallback) {

        //var dwgDom = this.dwgDomContainer;
        //
        //if (dwgDom) {
        //
        //    html2canvas(dwgDom, {
        //        logging: true,
        //        onrendered: function (canvas) {
        //
        //            var dataUrl = canvas.toDataURL("image/png");
        //            snapshotCallback(dataUrl);
        //        }
        //    });
        //
        //}

    },

    // 设置DWG批注容器
    setDwgDomContainer: function (domElement) {
        this.dwgDomContainer = domElement;
    },

    // ------------------ 标记 API -- S ------------------ //
    // 初始化Marker
    initMarkerEditor: function () {

        var viewer = this.viewer;

        if (!this.markerEditor) {

            this.markerEditor = new CLOUD.Extensions.MarkerEditor(viewer);
        }

        if (!this.markerEditor.isInitialized()) {

            var callbacks = {
                beginEditCallback: function (domElement) {
                    viewer.editorManager.unregisterDomEventListeners(domElement);
                },
                endEditCallback: function (domElement) {
                    viewer.editorManager.registerDomEventListeners(domElement);
                }
            };

            this.markerEditor.init(callbacks);

            callbacks = null;
        }
    },

    // 卸载Marker
    uninitMarkerEditor: function () {

        if (this.markerEditor.isInitialized()) {

            this.markerEditor.uninit();

        }
    },

    // zoom到合适的大小
    zoomToSelectedMarkers: function () {

        if (this.markerEditor) {

            var bBox = this.markerEditor.getMarkersBoundingBox();

            if (bBox) {
                this.viewer.zoomToBBox(bBox);
            }

            this.markerEditor.updateMarkers();

        }

    },

    // 开始编辑Marker
    editMarkerBegin: function () {

        this.initMarkerEditor();
        this.initMarkerEditor();
        this.markerEditor.editBegin();
    },

    // 结束编辑Marker
    editMarkerEnd: function () {

        if (this.markerEditor) {

            this.markerEditor.editEnd();

        }
    },

    // 设置标记状态
    setMarkerState: function (state) {

        if (this.markerEditor) {

            this.markerEditor.setMarkerState(state);

        }
    },

    // 加载标记
    loadMarkers: function (markerInfoList) {

        if (markerInfoList) {

            this.initMarkerEditor();
            this.markerEditor.loadMarkers(markerInfoList);

        } else {

            this.uninitMarkerEditor();
        }

    },

    // 获得标记列表
    getMarkerInfoList: function () {

        if (this.markerEditor) {

            return this.markerEditor.getMarkerInfoList();

        }

        return null;
    },

    resizeMarkers: function () {

        if (this.markerEditor) {

            return this.markerEditor.onResize();

        }
    },

    renderMarkers: function () {

        if (this.markerEditor) {

            return this.markerEditor.updateMarkers();

        }
    }

    // ------------------ 标记 API -- E ------------------ //
};