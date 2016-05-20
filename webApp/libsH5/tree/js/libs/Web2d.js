var CLOUD = CLOUD || {};
CLOUD.Extensions = {};

CLOUD.Extensions.Shape2D = {
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
    var _defaultClearColor = 0xffffff; // 0xadadad; // 缺省背景色

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
    var _highlightColor = '#258ae3';
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
    }

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

        if (isOverCanvas) {
            callback();
        }

        return isOverCanvas;
    };

    this.mouseMove = function (event, callback) {

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isOverCanvas = this.isMouseOverCanvas(mouse);

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

    this.init = function (domContainer, width, height, styleOptions) {

        width = width || 320;
        height = height || 240;

        // 初始化绘图面板
        this.initCanvasContainer(domContainer, styleOptions);
        // 初始化提示节点
        this.initTipNode();
        this.initCameraNode();
        // 设置绘图面板大小
        this.setSize(width, height);
        // 设置绘图面板背景色
        this.setClearColor(_defaultClearColor);
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
            var css = ".cloud-tip:after { " +
                "box-sizing: border-box;" +
                "display: inline;" +
                "font-size: 10px;" +
                "width: 100%;" +
                "line-height: 1;" +
                "color: #333333;" +
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
            _tipNode.style.background = "#333333";
            _tipNode.style.color = "#fff";
            _tipNode.style.padding = "0 8px 0 8px";
            _tipNode.style.borderRadius = "2px";
            _tipNode.style.fontSize = "8px";
            _tipNode.style.opacity = 0;

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
            color: 0x303030,//0x2c2255
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

        // 高亮点的变换位置
        _circleNode.setAttribute('transform', 'translate(' + intersection.intersectionPoint.x + ',' + intersection.intersectionPoint.y + ')');

        // 提示文本
        _tipNode.innerHTML = intersection.abcName + "-" + intersection.numeralName;

        // 位置
        var box = _tipNode.getBoundingClientRect();

        _tipNode.style.left = (_svgHalfWidth + intersection.intersectionPoint.x - 0.5 * box.width) + "px";
        _tipNode.style.top = ( _svgHalfHeight + intersection.intersectionPoint.y - box.height - 12) + "px"; // 12 = fontsize(10px) + 2 * linewidth(1px)

        // 水平线条
        _highlightHorizLineNode.setAttribute('x1', intersection.horizLine[0].x);
        _highlightHorizLineNode.setAttribute('y1', intersection.horizLine[0].y);
        _highlightHorizLineNode.setAttribute('x2', intersection.horizLine[1].x);
        _highlightHorizLineNode.setAttribute('y2', intersection.horizLine[1].y);

        // 垂直线条
        _highlightVerticalLineNode.setAttribute('x1', intersection.verticalLine[0].x);
        _highlightVerticalLineNode.setAttribute('y1', intersection.verticalLine[0].y);
        _highlightVerticalLineNode.setAttribute('x2', intersection.verticalLine[1].x);
        _highlightVerticalLineNode.setAttribute('y2', intersection.verticalLine[1].y);

        _hasHighlightInterPoint = true;

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

        this.render();
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
        if (_isFlyToPoint) {

            _isFlyToPoint = false;

            // 相机在平面图包围盒中心截面上的投影
            var cameraProjectedWorldPosition = new THREE.Vector3(projectedCameraPosition.x, projectedCameraPosition.y, _cameraProjectedPosZ);
            transformWorldPoint(cameraProjectedWorldPosition);
            this.viewer.cameraEditor.flyToPointWithParallelEye(cameraProjectedWorldPosition);
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
                var axisInfoX = "X(" + intersection.abcName + "," + offsetX + ")";
                var axisInfoY = "Y(" + intersection.numeralName + "," + offsetY + ")";
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
        this.render();
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

                    var markerId = scope.generateMarkerId();

                    //console.log(markerId);
                    var marker = new CLOUD.Marker(markerId, scope);

                    marker.createSVGShape(shapeData, svgContainer);
                    marker.setWorldPosition(intersect.point);
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

        marker.createSVGShape(shapeData, svgContainer);
        marker.setWorldPosition(info.position);
        marker.setWorldBoundingBox(info.bBox);
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

CLOUD.MarkerEditor.prototype.worldToClient = function(point) {

    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    result.set(point.x, point.y, point.z);
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



var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};

CLOUD.Extensions.Comment = function (editor, id) {

    this.editor = editor;
    this.id = id;
    this.shapeType = 0;
    this.selected = false;
    this.highlighted = false;
    this.highlightColor = '#FAFF3C';

    this.style = this.createStyle();

    this.size = {x: 0, y: 0};
    this.position = {x: 0, y: 0};
    this.rotation = 0;
    this.shape = null;

    this.startX = 0;
    this.startY = 0;
};

CLOUD.Extensions.Comment.prototype = {
    constructor: CLOUD.Extensions.Comment,

    created:function(){
    },
    destroy: function () {
        this.unselect();
        this.setParent(null);
    },
    onMouseDown: function (event) {

        event.preventDefault();
        event.stopPropagation();

        this.select();
        this.editor.dragBegin();
    },
    set:function(position, width, height){
        this.rotation = 0;
        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    },
    setRotation: function(angle) {
        this.rotation = angle;
        this.updateStyle();
    },
    setPosition: function (x, y){
        this.position.x = x;
        this.position.y = y;
        this.updateStyle();
    },
    setSize: function (width, height, position) {
        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateStyle();
    },
    setParent: function (parent) {
        var shapeEl = this.shape;
        if(shapeEl.parentNode){
            shapeEl.parentNode.removeChild(shapeEl);
        }
        if(parent){
            parent.appendChild(shapeEl);
        }
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
        //this.highlighted = false;
        this.highlighted = true;
        this.updateStyle();

        this.editor.setSelection(this);
    },
    unselect: function () {
        this.selected = false;
        this.editor.setSelection(null);
    },
    highlight: function (isHighlight) {
        this.highlighted = isHighlight;
        this.updateStyle();
    },
    createStyle: function () {
        var style = {};

        style['stroke-width'] = 3;
        style['stroke-color'] = '#ff0000';
        style['stroke-opacity'] = '1.0';
        style['fill-color'] = '#ff0000';
        style['fill-opacity'] = '0.25';
        style['font-family'] = 'Arial';
        style['font-size'] = '20';
        style['font-style'] = 'Normal';
        style['font-weight'] = 'Normal';

        return style;
    },
    getDefaultStyles: function () {
        return {
            'stroke-width': {
                values: [
                    {name: 'Thin', value: 1},
                    {name: 'Normal', value: 3},
                    {name: 'Thick', value: 9}],
                default: 1
            },
            'stroke-color': {
                values: [
                    {name: 'red', value: '#ff0000'},
                    {name: 'green', value: '#00ff00'},
                    {name: 'blue', value: '#0000ff'},
                    {name: 'white', value: '#ffffff'},
                    {name: 'black', value: '#000000'}],
                default: 0
            },
            'stroke-opacity': {
                values: [
                    {name: '100%', value: 1.00},
                    {name: '75%', value: 0.75},
                    {name: '50%', value: 0.50},
                    {name: '25%', value: 0.25},
                    {name: '0%', value: 0.00}],
                default: 4
            }
        };
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
    this.addDomEventListener();
};

CLOUD.Extensions.CommentArrow.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentArrow.prototype.constructor = CLOUD.Extensions.CommentArrow;

CLOUD.Extensions.CommentArrow.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));

};

CLOUD.Extensions.CommentArrow.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentArrow.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentArrow.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('polygon');
};

CLOUD.Extensions.CommentArrow.prototype.set = function (sx, sy, ex, ey) {

    var v0 = new THREE.Vector2(sx, sy);
    var v1 = new THREE.Vector2(ex, ey);
    var vDir = v1.clone().sub(v0).normalize();

    this.size.x = v0.distanceTo(v1);
    this.rotation = Math.acos(vDir.dot(new THREE.Vector2(1, 0)));
    this.rotation = ey > sy ? (Math.PI * 2) - this.rotation : this.rotation;

    this.head.set(sx, sy, 0);
    this.tail.set(ex, ey, 0);

    this.updateTransformMatrix();
    this.updateStyle();
};

CLOUD.Extensions.CommentArrow.prototype.setSize = function (width, height, position) {

    var endX = Math.cos(this.rotation);
    var endY = Math.sin(this.rotation);
    var endDir = new THREE.Vector2(endX, endY);
    endDir.multiplyScalar(width * 0.5);

    var vCenter = new THREE.Vector2(position.x, position.y);
    var v0 = vCenter.clone().add(endDir);
    var v1 = vCenter.clone().sub(endDir);

    this.head.set(v1.x, v1.y, 0);
    this.tail.set(v0.x, v0.y, 0);
    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;

    this.updateTransformMatrix();
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

    this.updateTransformMatrix();
    this.updateStyle();
};

CLOUD.Extensions.CommentArrow.prototype.updateTransformMatrix = function () {

    var head = this.head;
    var tail = this.tail;
    var midX = this.size.x * 0.5;
    var midY = this.style['stroke-width'];
    var posX = (head.x + tail.x) * 0.5;
    var posY = (head.y + tail.y) * 0.5;

    this.transformShape = [
        'translate(', posX, ',', posY, ') ',
        'rotate(', THREE.Math.radToDeg(-this.rotation), ') ',
        'translate(', -midX, ',', -midY, ') '
    ].join('');

    // Update values used by EditFrame and Undo/Redo system //
    this.position.x = tail.x + (head.x - tail.x) * 0.5;
    this.position.y = tail.y + (head.y - tail.y) * 0.5;
};

CLOUD.Extensions.CommentArrow.prototype.updateStyle = function () {

    //this.size.y = this.style['stroke-width'] * 2;
    this.updateTransformMatrix();

    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var shapePoints = this.getShapePoints();
    var mappedPoints = shapePoints.map(function (point) {
        return point[0] + ',' + point[1];
    });

    var pointsStr = mappedPoints.join(' ');

    this.shape.setAttribute('points', pointsStr);
    this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute('fill', strokeColor);
    this.shape.setAttribute('opacity', this.style['stroke-opacity']);
};

CLOUD.Extensions.CommentArrow.prototype.getShapePoints = function () {

    var strokeWidth = this.style['stroke-width'] * 2;//
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



CLOUD.Extensions.CommentRectangle = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.RECTANGLE;

    this.createShape();
    this.addDomEventListener();
};

CLOUD.Extensions.CommentRectangle.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentRectangle.prototype.constructor = CLOUD.Extensions.CommentRectangle;

CLOUD.Extensions.CommentRectangle.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));

};

CLOUD.Extensions.CommentRectangle.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentRectangle.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentRectangle.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('rect');
};

CLOUD.Extensions.CommentRectangle.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];

    var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(-this.rotation), ') ',
        'translate(', -originX, ',', -originY, ') '
    ].join('');
};

CLOUD.Extensions.CommentRectangle.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    //var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    this.shape.setAttribute('stroke',strokeColor);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', 0.0 + '');
    this.shape.setAttribute('width', Math.max(this.size.x - strokeWidth, 0) + '');
    this.shape.setAttribute('height', Math.max(this.size.y - strokeWidth, 0) + '');
};


CLOUD.Extensions.CommentCircle = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CIRCLE;

    this.createShape();
    this.addDomEventListener();
};

CLOUD.Extensions.CommentCircle.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCircle.prototype.constructor = CLOUD.Extensions.CommentCircle;

CLOUD.Extensions.CommentCircle.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));

};

CLOUD.Extensions.CommentCircle.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentCircle.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentCircle.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('ellipse');
};

CLOUD.Extensions.CommentCircle.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];

    var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(-this.rotation), ') ',
        'translate(', -originX, ',', -originY, ') '
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
    this.shape.setAttribute("stroke", strokeColor);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', '0.0');
    this.shape.setAttribute('cx', radX);
    this.shape.setAttribute('cy', radY);
    this.shape.setAttribute('rx', radX);
    this.shape.setAttribute('ry', radY);
};


CLOUD.Extensions.CommentCloud = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CLOUD;

    this.shapePath = [];

    this.lastShapePoint = {x:0, y:0};

    this.createShape();
    this.addDomEventListener();
};

CLOUD.Extensions.CommentCloud.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCloud.prototype.constructor = CLOUD.Extensions.CommentCloud;

CLOUD.Extensions.CommentCloud.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCloud.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentCloud.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentCloud.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.CommentCloud.prototype.set = function(position, width, height){
    this.rotation = 0;
    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;
    this.size.y = height;

    this.addToPath(position);

    this.updateStyle();
};

CLOUD.Extensions.CommentCloud.prototype.updateTransformMatrix = function () {

    var originX = (this.size.x) * 0.5;
    var originY = (this.size.y) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(-this.rotation), ') ',
        'translate(', -originX, ',', -originY, ') '
    ].join('');
};

CLOUD.Extensions.CommentCloud.prototype.updateStyle = function () {

   //this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    //var strokeLineJoin = this.style['stroke-linejoin'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    //this.shape.setAttribute("transform", this.transformShape);
    this.shape.setAttribute("stroke-width", strokeWidth);
    this.shape.setAttribute("stroke", strokeColor);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', '0.0');
    //this.shape.setAttribute('stroke-linejoin', strokeLineJoin);
    this.shape.setAttribute('d', this.getPath().join(' '));
};

CLOUD.Extensions.CommentCloud.prototype.getPath = function() {

    return this.shapePath;
};

CLOUD.Extensions.CommentCloud.prototype.addToPath = function(point) {

    if (this.shapePath.length === 0) {
        this.shapePath.push('M');
        this.shapePath.push(point.x);
        this.shapePath.push(point.y);
    } else {

        // 计算控制点
        var controlPoint = this.calculateControlPoint(this.lastShapePoint, point);

        this.shapePath.push('Q');
        this.shapePath.push(controlPoint.x);
        this.shapePath.push(controlPoint.y);
        this.shapePath.push(',');
        this.shapePath.push(point.x);
        this.shapePath.push(point.y);
    }

    this.lastShapePoint.x = point.x;
    this.lastShapePoint.y = point.y;
};

// 计算控制点
CLOUD.Extensions.CommentCloud.prototype.calculateControlPoint = function(startPoint, endPoint) {

    var start = new THREE.Vector2(startPoint.x, startPoint.y);
    var end = new THREE.Vector2(endPoint.x, endPoint.y);
    var direction = end.clone().sub(start);
    var halfLen = 0.5 * direction.length();
    var centerX = 0.5 * (start.x + end.x);
    var centerY = 0.5 * (start.y + end.y);
    var center = new THREE.Vector2(centerX, centerY);

    direction.normalize();
    direction.rotateAround(new THREE.Vector2(0,0), -0.5 * Math.PI);
    direction.multiplyScalar(halfLen);
    center.add(direction);

    return {
        x: center.x,
        y: center.y
    };
};



CLOUD.Extensions.CommentCross = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.CROSS;

    this.createShape();
    this.addDomEventListener();
};

CLOUD.Extensions.CommentCross.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentCross.prototype.constructor = CLOUD.Extensions.CommentCross;

CLOUD.Extensions.CommentCross.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentCross.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentCross.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentCross.prototype.createShape = function() {
    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('path');
};

CLOUD.Extensions.CommentCross.prototype.updateTransformMatrix = function () {

    var strokeWidth = this.style['stroke-width'];

    var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
    var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

    this.transformShape = [
        'translate(', this.position.x, ',', this.position.y, ') ',
        'rotate(', THREE.Math.radToDeg(-this.rotation), ') ',
        'translate(', -originX, ',', -originY, ') '
    ].join('');
};

CLOUD.Extensions.CommentCross.prototype.updateStyle = function () {

    this.updateTransformMatrix();

    var strokeWidth = this.style['stroke-width'];
    var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
    //var strokeOpacity = this.style['stroke-opacity'];
    var fillColor = this.style['fill-color'];
    var fillOpacity = this.style['fill-opacity'];

    this.shape.setAttribute('transform', this.transformShape);
    this.shape.setAttribute('stroke-width', strokeWidth);
    this.shape.setAttribute('stroke',strokeColor);
    this.shape.setAttribute('fill', fillColor);
    this.shape.setAttribute('fill-opacity', 0.0 + '');
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


CLOUD.Extensions.CommentText = function (editor, id) {

    CLOUD.Extensions.Comment.call(this, editor, id);

    this.shapeType = CLOUD.Extensions.Comment.shapeTypes.TEXT;
    this.currText = "";
    this.currTextLines = [""];
    this.textDirty = true;
    this.lineHeight = 100;

    this.createShape();
    this.addDomEventListener();
};

CLOUD.Extensions.CommentText.prototype = Object.create(CLOUD.Extensions.Comment.prototype);
CLOUD.Extensions.CommentText.prototype.constructor = CLOUD.Extensions.CommentText;

CLOUD.Extensions.CommentText.prototype.addDomEventListener = function () {

    this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
    this.shape.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.shape.addEventListener("mouseover",this.onMouseOver.bind(this));
};

CLOUD.Extensions.CommentText.prototype.onMouseOut = function() {
    this.highlight(false);
};

CLOUD.Extensions.CommentText.prototype.onMouseOver = function() {
    this.highlight(true);
};

CLOUD.Extensions.CommentText.prototype.createShape = function() {

    this.clipPath = CLOUD.Extensions.Shape2D.createSvgElement('clipPath');
    this.clipPathId = 'clip_' + this.id;
    this.clipPath.setAttribute('id', this.clipPathId);
    this.clipPath.removeAttribute('pointer-events');

    this.clipRect = CLOUD.Extensions.Shape2D.createSvgElement('rect');
    this.clipRect.removeAttribute('pointer-events');
    this.clipPath.appendChild(this.clipRect);

    this.shape = CLOUD.Extensions.Shape2D.createSvgElement('text');
    this.shapeBg = CLOUD.Extensions.Shape2D.createSvgElement('rect');
};

CLOUD.Extensions.CommentText.prototype.setSize = function (width, height, position) {

    var recalcLines = (this.size.x !== width);

    this.position.x = position.x;
    this.position.y = position.y;
    this.size.x = width;
    this.size.y = height;

    if (recalcLines) {
        var newLines = this.calcTextLines();
        if (!this.linesEqual(newLines)) {
            this.currTextLines = newLines;
            this.textDirty = true;
            this.forceRedraw();
        }
    }

    this.updateStyle();
};

CLOUD.Extensions.CommentText.prototype.setParent = function (parent) {

    var currParent = this.clipPath.parentNode;

    if (currParent) {
        currParent.removeChild(this.clipPath);
    }

    if (parent) {
        parent.appendChild(this.clipPath);
    }

    currParent = this.shapeBg.parentNode;

    if (currParent) {
        currParent.removeChild(this.shapeBg);
    }

    if (parent) {
        parent.appendChild(this.shapeBg);
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

    var originX = this.size.x * 0.5;
    var originY = this.size.y * 0.5;
    var posX = this.position.x - originX;
    var posY = this.position.y - originY;

    this.transformShape = [
        'translate(', posX, ',', posY, ') ',
        'scale(', 1, ',', -1, ') '].join('');
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
    this.shape.setAttribute('font-weight', this.style['font-weight'] ? 'bold' : '');
    this.shape.setAttribute("font-style", this.style['font-style'] ? 'italic' : '');
    //this.shape.setAttribute("fill", fillColor);

    var bBox = this.shape.getBoundingClientRect();
    var verticalTransform = ['translate(0, ', -this.size.y + fontSize, ')'].join('');
    this.shape.setAttribute("transform", (this.transformShape + verticalTransform));
    this.shape.setAttribute('clip-path', 'url(#' + this.clipPathId + ')');

    // Must be called AFTER shape's styles are in place.
    if (this.textDirty || forceDirty) {
        if (forceDirty) {
            this.currTextLines = this.calcTextLines();
        }
        this.rebuildTextSvg();
        this.textDirty = false;
    }

    this.clipRect.setAttribute('x', "0");
    this.clipRect.setAttribute('y', bBox.height + '');
    this.clipRect.setAttribute('width', this.size.x);
    this.clipRect.setAttribute('height', this.size.y);

    verticalTransform = ['translate(0, ', -this.size.y, ')'].join('');
    this.shapeBg.setAttribute("transform", this.transformShape + verticalTransform);
    this.shapeBg.setAttribute('width', this.size.x);
    this.shapeBg.setAttribute('height', this.size.y);
    this.shapeBg.setAttribute("stroke-width", '0');
    this.shapeBg.setAttribute('fill','white');
};

CLOUD.Extensions.CommentText.prototype.calcTextLines = function () {
     return 5;
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

CLOUD.Extensions.CommentText.prototype.setText = function (text) {

    this.currText = text;
    this.currTextLines = this.calcTextLines();
    this.textDirty = true;
    this.updateStyle();
};

CLOUD.Extensions.CommentText.prototype.getText = function () {

    return this.currText;
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
        var tspan = CLOUD.Extensions.Shape2D.createSvgElement('tspan');
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


var CLOUD = CLOUD || {};
CLOUD.Extensions = CLOUD.Extensions || {};

CLOUD.Extensions.CommentEditor = function (cameraEditor, scene, domElement) {
    "use strict";

    this.cameraEditor = cameraEditor;
    this.scene = scene;
    this.domElement = domElement;
    this.comments = [];
    this.selectedComment = null;
    this.bounds = {x: 0, y: 0, width: 0, height: 0};
    this.nextCommentId = 0;
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
    this.startX = 0;
    this.startY = 0;
    this.isCreating = false;
    this.isDragging = false;

    this.commentType = "ARROW";
};

CLOUD.Extensions.CommentEditor.prototype.init = function() {

    if (!this.svg) {

        var svgWidth = this.domElement.offsetWidth;
        var svgHeight = this.domElement.offsetHeight;
        //var viewBox = this.getViewBox(svgWidth, svgHeight);

        this.svg = CLOUD.Extensions.Shape2D.createSvgElement('svg');
        this.svg.style.position = "absolute";
        this.svg.style.display = "block";
        this.svg.style.left = "0";
        this.svg.style.top = "0";
        //this.svg.setAttribute('viewBox', viewBox);
        this.svg.setAttribute('width', svgWidth + '');
        this.svg.setAttribute('height', svgHeight + '');

        this.domElement.appendChild(this.svg);

        this.bounds.width = svgWidth;
        this.bounds.height = svgHeight;
    }
};

CLOUD.Extensions.CommentEditor.prototype.uninit = function() {

    if (!this.svg) return;

    var svg = this.svg;

    if (svg.parentNode) {
        svg.parentNode.removeChild(svg);
    }

    this.svgGroup = null;
    this.svg = null;
};

CLOUD.Extensions.CommentEditor.prototype.onExistEditor = function () {

    this.uninit();
};

CLOUD.Extensions.CommentEditor.prototype.onMouseDown = function(event) {

    //event.preventDefault();
    //event.stopPropagation();

    if (this.commentType !== "CLOUD") {
        if (this.selectedComment) return;
    }

    this.handleComment(event, "down");

    if (!this.isCreating) {
        this.isCreating = true;
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseMove = function(event) {

    //event.preventDefault();
    //event.stopPropagation();

    if (!this.selectedComment || !this.isCreating) {
        return;
    }

    if (this.commentType !== "CLOUD") {
        this.handleComment(event, "move");
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseUp = function(event) {

    //event.preventDefault();
    //event.stopPropagation();

    if (this.commentType !== "CLOUD") {
        if (this.selectedComment && this.isCreating) {

            this.selectedComment.created();

            this.isCreating = false;
        }

        this.unselect();
    }
};

CLOUD.Extensions.CommentEditor.prototype.onMouseWheel = function (event) {

    //this.update();
};

CLOUD.Extensions.CommentEditor.prototype.onMouseDoubleClick = function(event) {

};

CLOUD.Extensions.CommentEditor.prototype.onKeyDown = function(event) {

};

CLOUD.Extensions.CommentEditor.prototype.onKeyUp = function(event) {

    switch (event.keyCode) {
        case this.keys.DELETE:
            if (this.selectedComment) {
                this.deleteComment(this.selectedComment);
                this.selectedComment = null;
            }
            break;
        case this.keys.ESC: // 结束云图绘制

            if (this.commentType === "CLOUD") {
                if (this.selectedComment && this.isCreating) {

                    this.selectedComment.created();

                    this.isCreating = false;
                }

                this.unselect();
            }

            break;
        default :
            break;
    }
};

CLOUD.Extensions.CommentEditor.prototype.touchstart = function(event) {

};

CLOUD.Extensions.CommentEditor.prototype.touchmove = function(event) {

};

CLOUD.Extensions.CommentEditor.prototype.touchend = function(event) {

};

CLOUD.Extensions.CommentEditor.prototype.update = function() {

    for (var i = 0, len = this.comments.length; i < len; i++) {
        var comment = this.comments[i];
        var pos = this.worldToClient(comment.worldPosition);
        comment.setClientPostion(pos);
        comment.updateStyle();
    }
};

CLOUD.Extensions.CommentEditor.prototype.editBegin = function() {

    if (this.isEditing) {
        return true;
    }

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Shape2D.createSvgElement('g');
    }

    if (this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    this.svg.insertBefore(this.svgGroup, this.svg.firstChild);

    this.clear();

    this.isEditing = true;
};

CLOUD.Extensions.CommentEditor.prototype.editEnd = function() {
    this.isEditing = false;

    this.svg.removeChild(this.svgGroup);
};

CLOUD.Extensions.CommentEditor.prototype.generateCommentId = function () {

    //return ++this.nextCommentId;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
CLOUD.Extensions.CommentEditor.prototype.clear = function() {

    var comments = this.comments;

    while (comments.length) {
        var comment = comments[0];
        this.removeComment(comment);
        comment.destroy();
    }

    var svg = this.svgGroup;
    if (svg && svg.childNodes.length > 0) {
        while (svg.childNodes.length) {
            svg.removeChild(svg.childNodes[0]);
        }
    }
};

CLOUD.Extensions.CommentEditor.prototype.getComment = function (id) {

    for (var i = 0, len = this.comments.length; i < len; ++i) {
        if (this.comments[i].id == id) {
            return this.comments[i];
        }
    }

    return null;
};

CLOUD.Extensions.CommentEditor.prototype.addComment = function(comment) {

    comment.setParent(this.svgGroup);

    this.comments.push(comment);
};

CLOUD.Extensions.CommentEditor.prototype.removeComment = function(comment) {

    var idx = this.comments.indexOf(comment);

    if (idx !== -1) {
        this.comments.splice(idx, 1);
    }
};

CLOUD.Extensions.CommentEditor.prototype.loadComments = function(commentInfoList) {

    if (!this.svgGroup) {
        this.svgGroup = CLOUD.Extensions.Shape2D.createSvgElement('g');
    }

    if (this.svgGroup.parentNode) {
        this.svgGroup.parentNode.removeChild(this.svgGroup);
    }

    this.svg.insertBefore(this.svgGroup, this.svg.firstChild);

    this.clear();

    for (var i = 0, len = commentInfoList.length; i < len; i++) {

        var info = commentInfoList[i];
        var id = info.id;
        var shapeType = info.shapeType;
        var position = info.position;
        var size = info.size;

        switch (shapeType) {

            case CLOUD.Extensions.Comment.shapeTypes.ARROW:
                //var arrow = new CLOUD.Extensions.CommentArrow(this, arrowId);
                //arrow.set(head.x, head.y, tail.x, tail.y);
                //this.addComment(arrow);
                //arrow.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.RECTANGLE:
                var rectangle = new CLOUD.Extensions.CommentRectangle(this, id);
                rectangle.set(position, size.x, size.y);
                this.addComment(rectangle);
                rectangle.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.CIRCLE:
                var circle = new CLOUD.Extensions.CommentCircle(this, id);
                circle.set(position, size.x, size.y);
                this.addComment(circle);
                circle.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.CROSS:
                var cross = new CLOUD.Extensions.CommentCross(this, id);
                cross.set(position, size.x, size.y);
                this.addComment(cross);
                cross.created();
                break;
            case CLOUD.Extensions.Comment.shapeTypes.CLOUD:
                //var cloud = new CLOUD.Extensions.CommentCloud(this, id);
                //cloud.set(position, size.x, size.y);
                //this.addComment(cloud);
                //cloud.created();
                break;
            case  CLOUD.Extensions.Comment.shapeTypes.TEXT:
                //var text = new CLOUD.Extensions.CommentText(this, id);
                //text.set(position, size.x, size.y);
                //this.addComment(text);
                //text.created();
                //text.forceRedraw();
                break;
            default :
                break;
        }
    }
};

CLOUD.Extensions.CommentEditor.prototype.getCommentInfoList = function() {

    var commentInfoList = [];

    for (var i = 0, len = this.comments.length; i < len; i++) {
        var comment = this.comments[i];

        var info = {
            id: comment.id,
            shapeType : comment.shapeType,
            position: comment.position,
            size: comment.size
        };

        commentInfoList.push(info);
    }

    return commentInfoList;
};

CLOUD.Extensions.CommentEditor.prototype.worldToClient = function(point) {

    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    result.set(point.x, point.y, point.z);
    result.project(camera);

    result.x =  Math.round(0.5 * (result.x + 1) * dim.width);
    result.y =  Math.round(-0.5 * (result.y - 1) * dim.height);
    result.z = 0;

    return result;
};

CLOUD.Extensions.CommentEditor.prototype.clientToWorld = function(x, y, depth) {

    var dim = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    var camera = this.cameraEditor.object;
    var result = new THREE.Vector3();

    depth = depth || 0;

    result.x = x / dim.width * 2 - 1;
    result.y = - y / dim.height * 2 + 1;
    result.z = depth;

    result.unproject(camera);
    result.z = 0;

    //result.add(camera.position).applyMatrix4(camera.matrixWorldInverse);
    //result.z = 0;

    return result;
};

CLOUD.Extensions.CommentEditor.prototype.calcBoundingBox = function() {

    //if (this.comments.length < 1) return null;
    //
    //var bBox = new THREE.Box3();
    //
    //for (var i = 0, len = this.comments.length; i < len; i++) {
    //    var comment = this.comments[i];
    //    bBox.union(comment.getWorldBoundingBox());
    //}
    //
    //return bBox;


    return null;
};

CLOUD.Extensions.CommentEditor.prototype.isInsideBounds = function(x, y, bounds) {

    return x >= bounds.x && x <= bounds.x + bounds.width &&
        y >= bounds.y && y <= bounds.y + bounds.height;
};

CLOUD.Extensions.CommentEditor.prototype.getBounds = function() {

    return this.bounds;
};

CLOUD.Extensions.CommentEditor.prototype.getPointOnSvgContainer = function (clientX, clientY) {

    var rect = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);

    return new THREE.Vector2(clientX - rect.left, clientY - rect.top);
};

CLOUD.Extensions.CommentEditor.prototype.unselect = function () {

    if (this.selectedComment) {
        this.selectedComment.unselect();
        this.selectedComment = null;
    }
};

CLOUD.Extensions.CommentEditor.prototype.getViewBox = function (clientWidth, clientHeight) {

    var lt = this.clientToWorld(0, 0);
    var rb = this.clientToWorld(clientWidth, clientHeight);

    var l = Math.min(lt.x, rb.x);
    var t = Math.min(lt.y, rb.y);
    var r = Math.max(lt.x, rb.x);
    var b = Math.max(lt.y, rb.y);

    return [l, t, r - l, b - t].join(' ');
};

CLOUD.Extensions.CommentEditor.prototype.onResize = function (event) {

    var bounds = CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = bounds.width;
    this.bounds.height = bounds.height;

    var viewBox = this.getViewBox(this.bounds.width, this.bounds.height);

    //this.svg.setAttribute('viewBox', viewBox);
    this.svg.setAttribute('width', this.bounds.width + '');
    this.svg.setAttribute('height', this.bounds.height + '');

};

CLOUD.Extensions.CommentEditor.prototype.dragBegin = function (event) {
    if (this.selectedComment) {
        this.dragging = true;
    }
};

CLOUD.Extensions.CommentEditor.prototype.dragEnd = function (event) {
    this.isDragging = false;
};

CLOUD.Extensions.CommentEditor.prototype.setSelection = function (comment) {

    //if (this.selectedComment !== comment) {
    //
    //    this.unselect();
    //
    //    if(comment){
    //        comment.select();
    //    }
    //}

    this.selectedComment = comment;
};

CLOUD.Extensions.CommentEditor.prototype.deleteComment = function(comment) {

    if (comment) {
        this.removeComment(comment);
        comment.destroy();
    }
};

CLOUD.Extensions.CommentEditor.prototype.setCommentType = function(type) {
     this.commentType = type;
};

CLOUD.Extensions.CommentEditor.prototype.handleComment = function(event , type) {

    var mode = this.commentType;

    switch (mode) {

        case "RECTANGLE":
            if (type === "down") {
                this.createCommentRectangle(event);
            } else if (type === "move") {
                this.moveCommentRectangle(event);
            }
            break;
        case "CIRCLE":
            if (type === "down") {
                this.createCommentCircle(event);
            } else if (type === "move") {
                this.moveCommentCircle(event);
            }
            break;
        case "CROSS":
            if (type === "down") {
                this.createCommentCross(event);
            } else if (type === "move") {
                this.moveCommentCross(event);
            }
            break;
        case "CLOUD":
            if (type === "down") {
                if (this.selectedComment && this.isCreating) {
                    this.moveCommentCloud(event);
                }  else {
                    this.createCommentCloud(event);
                }
            }
            //else if (type === "move") {
            //    this.moveCommentCloud(event);
            //}
            break;
        case "TEXT":
            if (type === "down") {
                this.createCommentText(event);
            } else if (type === "move") {
                this.moveCommentText(event);
            }
            break;
        case "ARROW":
        default :
            if (type === "down") {
                this.createCommentArrow(event);
            } else if (type === "move") {
                this.moveCommentArrow(event);
            }
            break;
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentArrow = function(event) {

    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);

    this.startX = start.x;
    this.startY = start.y;

    var width = 2;
    var head = {x: this.startX, y: this.startY};
    var tail = {
        x: Math.round(head.x + Math.cos(Math.PI * 0.25) * width),
        y: Math.round(head.y + Math.sin(-Math.PI * 0.25) * width)
    };

    var constrain = function (head, tail, width, bounds) {

        if (this.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.y = Math.round(head.y + Math.sin(Math.PI * 0.25) * width);

        if (this.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.x = Math.round(head.y + Math.cos(-Math.PI * 0.25) * width);

        if (this.isInsideBounds(tail.x, tail.y, bounds)) {
            return;
        }

        tail.y = Math.round(head.y + Math.sin(-Math.PI * 0.25) * width);

    }.bind(this);

    constrain(head, tail, width, this.getBounds());

    //head = this.clientToWorld(head.x, head.y);
    //tail = this.clientToWorld(tail.x, tail.y);

    var arrowId = this.generateCommentId();
    var arrow = new CLOUD.Extensions.CommentArrow(this, arrowId);
    arrow.set(head.x, head.y, tail.x, tail.y);
    this.addComment(arrow);
    arrow.created();

    this.selectedComment = arrow;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentArrow = function(event) {

    var arrow = this.selectedComment;
    var end = this.getPointOnSvgContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.startX;
    var startY = this.startY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    //var head = this.clientToWorld(startX, startY);
    //var tail = this.clientToWorld(endX, endY);

    var head = {x:startX, y: startY};
    var tail = {x: endX, y: endY};

    var epsilon = 0.0001;

    if (Math.abs(arrow.head.x - head.x) >= epsilon || Math.abs(arrow.head.y - head.y) >= epsilon ||
        Math.abs(arrow.tail.x - tail.x) >= epsilon || Math.abs(arrow.tail.y - tail.y) >= epsilon) {

        arrow.set(head.x, head.y, tail.x, tail.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentRectangle = function(event) {

    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);

    this.startX = start.x;
    this.startY = start.y;

    //var position = this.clientToWorld(start.x, start.y);
    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var rectangle = new CLOUD.Extensions.CommentRectangle(this, id);
    rectangle.set(position, size.x, size.y);
    this.addComment(rectangle);
    rectangle.created();

    this.selectedComment = rectangle;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentRectangle = function(event) {

    var rectangle = this.selectedComment;
    var end = this.getPointOnSvgContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.startX;
    var startY = this.startY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    //var position = this.clientToWorld((startX + endX) / 2, (startY + endY) / 2);
    //var size = this.clientToWorld(endX - startX, endY - startY);

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(rectangle.position.x - position.x) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon ||
        Math.abs(rectangle.position.y - position.y) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon) {

        rectangle.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentCircle = function(event) {

    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);

    this.startX = start.x;
    this.startY = start.y;

    //var position = this.clientToWorld(start.x, start.y);
    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var circle = new CLOUD.Extensions.CommentCircle(this, id);
    circle.set(position, size.x, size.y);
    this.addComment(circle);
    circle.created();

    this.selectedComment = circle;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentCircle = function(event) {

    var circle = this.selectedComment;
    var end = this.getPointOnSvgContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.startX;
    var startY = this.startY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    //var position = this.clientToWorld((startX + endX) / 2, (startY + endY) / 2);
    //var size = this.clientToWorld(endX - startX, endY - startY);

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(circle.position.x - position.x) > epsilon || Math.abs(circle.size.y - size.y) > epsilon ||
        Math.abs(circle.position.y - position.y) > epsilon || Math.abs(circle.size.y - size.y) > epsilon) {

        circle.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentCross = function(event) {
    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);

    this.startX = start.x;
    this.startY = start.y;

    //var position = this.clientToWorld(start.x, start.y);
    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var cross = new CLOUD.Extensions.CommentCross(this, id);
    cross.set(position, size.x, size.y);
    this.addComment(cross);
    cross.created();

    this.selectedComment = cross;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentCross = function(event) {

    var cross = this.selectedComment;
    var end = this.getPointOnSvgContainer(event.clientX, event.clientY);
    var bounds = this.getBounds();

    var startX = this.startX;
    var startY = this.startY;
    var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);

    if (endX === startX && endY === startY) {
        endX++;
        endY++;
    }

    //var position = this.clientToWorld((startX + endX) / 2, (startY + endY) / 2);
    //var size = this.clientToWorld(endX - startX, endY - startY);

    var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var size = new THREE.Vector2(endX - startX, endY - startY);

    var epsilon = 0.0001;

    if (Math.abs(cross.position.x - position.x) > epsilon || Math.abs(cross.size.y - size.y) > epsilon ||
        Math.abs(cross.position.y - position.y) > epsilon || Math.abs(cross.size.y - size.y) > epsilon) {

        cross.set(position, size.x, size.y);
    }
};

CLOUD.Extensions.CommentEditor.prototype.createCommentCloud = function(event) {

    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);

    this.startX = start.x;
    this.startY = start.y;

    //var position = this.clientToWorld(start.x, start.y);
    var position = {x: start.x, y: start.y};
    var size = {x: 10, y: 10};

    var id = this.generateCommentId();
    var cloud = new CLOUD.Extensions.CommentCloud(this, id);
    cloud.set(position, size.x, size.y);
    this.addComment(cloud);
    cloud.created();

    this.selectedComment = cloud;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentCloud = function(event) {

    var size = {x: 10, y: 10};
    var cloud = this.selectedComment;
    var position = this.getPointOnSvgContainer(event.clientX, event.clientY);
    cloud.set(position, size.x, size.y);

};

CLOUD.Extensions.CommentEditor.prototype.createCommentText = function(event) {

    var start = this.getPointOnSvgContainer(event.clientX, event.clientY);
    var clientFontSize = 20;
    var initialWidth = clientFontSize * 15;
    var initialHeight = clientFontSize * 3;

    var size = new THREE.Vector2(initialWidth, initialHeight);

    var position = new THREE.Vector2(
        start.x + (initialWidth * 0.5),
        start.y + (initialHeight * 0.5));

    var id = this.generateCommentId();
    var text = new CLOUD.Extensions.CommentText(this, id);
    text.set(position, size.x, size.y);
    this.addComment(text);
    text.created();
    text.forceRedraw();

    this.selectedComment = text;
};

CLOUD.Extensions.CommentEditor.prototype.moveCommentText = function(event) {

    //var text = this.selectedComment;
    //var end = this.getPointOnSvgContainer(event.clientX, event.clientY);
    //var bounds = this.getBounds();
    //
    //var startX = this.startX;
    //var startY = this.startY;
    //var endX = Math.min(Math.max(bounds.x, end.x), bounds.x + bounds.width);
    //var endY = Math.min(Math.max(bounds.y, end.y), bounds.y + bounds.height);
    //
    //if (endX === startX && endY === startY) {
    //    endX++;
    //    endY++;
    //}
    //
    ////var position = this.clientToWorld((startX + endX) / 2, (startY + endY) / 2);
    ////var size = this.clientToWorld(endX - startX, endY - startY);
    //
    //var position = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    //var size = new THREE.Vector2(endX - startX, endY - startY);
    //
    //var epsilon = 0.0001;
    //
    //if (Math.abs(text.position.x - position.x) > epsilon || Math.abs(text.size.y - size.y) > epsilon ||
    //    Math.abs(text.position.y - position.y) > epsilon || Math.abs(text.size.y - size.y) > epsilon) {
    //
    //    text.set(position, size.x, size.y);
    //}
};