/**
 * @require /libsH5/js/libs/three.min.js
 */

/**
 * @namespace CLOUD
 * @property {string}  Version                - 版本
 * @require /libsH5/js/libs/three.min.js
 */
var CLOUD = CLOUD || {};
CLOUD.Version = "20170222";

/**
 * @namespace CLOUD.GlobalData
 * @property {number}  SceneSize                - 场景大小
 * @property {string}  TextureResRoot           - 纹理资源路径
 * @property {object}  SelectionColor           - 默认构件选中颜色
 * @property {boolean}  DisableAntialias        - 是否禁用反走样
 * @property {boolean}  EnableDemolishByDClick  - 是否允许双击半透明
 * @property {boolean}  UseMpkWorker            - 是否使用Worker
 * @property {string}  MpkWorkerUrl             - Worker导入库地址
 * @property {boolean}  UseLayerData            - 是否使用分层数据
 * @property {boolean}  IncrementRender         - 是否开启增量绘制
 * @property {number}  LimitFrameTime           - 每帧允许的最大绘制时间
 * @property {number}  maxObjectNumInPool       - 对象池大小
 * @property {number}  maxDrawCacheNum          - 绘制列表最大缓存数目，大于该数目，会回收缓存资源
 * @property {number}  OctantDepth              - 八叉树最大深度
 * @property {number}  MaximumDepth             -
 * @property {number}  TargetDistance           -
 * @property {number}  ConcurrencyRequestCount  - 最大请求数 (HTTP, web worker, etc. )
 * @property {boolean}  ShowOctant              - 是否绘制八叉树节点
 * @property {boolean}  DisableOctant           - 是否禁止八叉树裁剪数据
 * @property {boolean}  DEBUG                   - 是否允许调试 (输出日志信息等)
 */
CLOUD.GlobalData = {
    SceneSize: 1000,

    TextureResRoot: 'images/',

    SelectionColor: {color: 0x003BBD, side: THREE.DoubleSide/*, opacity: 0.5, transparent: true*/},

    DisableAntialias: false,
    EnableDemolishByDClick: true,

    UseMpkWorker: true,
    MpkWorkerUrl: "../libs/mpkWorker.min.js", //"../libs/mpkWorker.min.js",

    UseLayerData: true,

    IncrementRender: true,
    LimitFrameTime: 250,

    maxObjectNumInPool: 60000,
    maxDrawCacheNum : 40000,

    OctantDepth: 8,
    MaximumDepth: 0,
    TargetDistance: 10000,
    ConcurrencyRequestCount: 8, // Limitation of concurrency request (HTTP, web worker, etc. ) count
    ShowOctant: false,
    DisableOctant: false,

    DirectionalLight: true,

    DEBUG: false
};

/**
 * 视角枚举
 * @readonly
 * @enum {number}
 */
CLOUD.EnumStandardView = {
    ISO: 0,
    Top: 1,
    Bottom: 2,
    Front: 3,
    Back: 4,
    Right: 5,
    Left: 6,
    SouthEast: 7,
    SouthWest: 8,
    NorthEast: 9,
    NorthWest: 10,
    BottomFront: 11,
    BottomBack: 12,
    BottomRight: 13,
    BottomLeft: 14,
    BottomSouthEast: 15,
    BottomSouthWest: 16,
    BottomNorthEast: 17,
    BottomNorthWest: 18,
    RoofFront: 19,
    RoofBack: 20,
    RoofRight: 21,
    RoofLeft: 22,
    RoofSouthEast: 23,
    RoofSouthWest: 24,
    RoofNorthEast: 25,
    RoofNorthWest: 26,
    TopTurnRight: 27,
    TopTurnBack: 28,
    TopTurnLeft: 29,
    BottomTurnRight: 30,
    BottomTurnBack: 31,
    BottomTurnLeft: 32,
    FrontTurnRight: 33,
    FrontTurnTop: 34,
    FrontTurnLeft: 35,
    RightTurnBack: 36,
    RightTurnTop: 37,
    RightTurnFront: 38,
    BackTurnRight: 39,
    BackTurnTop: 40,
    BackTurnLeft: 41,
    LeftTurnFront: 42,
    LeftTurnTop: 43,
    LeftTurnBack: 44
};

// 新版已废弃
CLOUD.EnumObjectLevel = {
    Default: 0,
    Tiny: 1,
    Small: 2,
    Medium: 5,
    Large: 6
};

// 新版已废弃
CLOUD.ObjectLevelLoD = {
    0: 0.1,
    1: 0.2,
    2: 1,
    3: 4,
    4: 5,
    5: 5, // will remove
    6: 6  // 
};

// 新版已废弃
CLOUD.SCENETYPE = {
    Default: 0,
    Aux: 1,
    Child: 2,
    Link: 3
};

// 新版已废弃
CLOUD.OPSELECTIONTYPE = {
    Clear: 0,
    Add: 1,
    Remove: 2
};

// 新版已废弃
CLOUD.MPKSTATUS = {
    UNKONW: 0,
    LOADING: 1,
    LOADED: 2
};

/**
 * 事件枚举
 * @readonly
 * @enum {number}
 */
CLOUD.EVENTS = {
    ON_LOAD_START: 0,
    ON_LOAD_PROGRESS: 1,
    ON_LOAD_COMPLETE: 2,
    // ON_LOAD_EMPTYSCENE: 3,
    // ON_LOAD_SUBSCENE: 10,
    ON_SELECTION_CHANGED: 100,
    ON_UPDATE_SELECTION_UI: 101
};

CLOUD.PrimitiveCount = {
    vertexCount: 0,
    triangleCount: 0
};

/**
 * 通用函数
 *
 * @namespace CLOUD.Utils
 */
CLOUD.Utils = {
    /**
     * 根据数组构造THREE.Box3对象
     *
     * @param {Array} arr - 6个float值构成的数组，前3个值对应 min，后3个值对应 max
     * @param {THREE.Box3} [optionalbox] - 如果指定，则optionalbox即为返回值
     * @returns {THREE.Box3} 如果 arr 不是数组类型，则返回 null
     */
    box3FromArray: function (arr, optionalbox) {
        if (arr instanceof Array) {
            var bbox = optionalbox || new THREE.Box3();
            bbox.min.fromArray(arr, 0);
            bbox.max.fromArray(arr, 3);
            return bbox;
        }
        return null;
    },

    /**
     * 根据点数组计算包围盒
     *
     * @param {Array} points - 点数组，每项由3个float值构成
     * @returns {THREE.Box3} 点数组构成的包围盒
     */
    computeBBox: function (points) {
        var bbox = new THREE.Box3();
        var v1 = new THREE.Vector3();

        for (var ii = 0, len = points.length; ii < len; ++ii) {
            v1.fromArray(points[ii], 0);
            bbox.expandByPoint(v1);
        }

        return bbox;
    },

    /**
     * 合并包围盒
     *
     * @param {Array} boxs - 包围盒数组，每项可以为 Object 类型（{min : {x:x, y:y, z:z}, max : {x:x, y:y, z:z}}） 或者 THREE.Box3 类型
     *
     */
    mergeBBox: function (boxs) {

        if (boxs.length < 1) return null;

        var bBox = new THREE.Box3();
        var max = new THREE.Vector3();
        var min = new THREE.Vector3();
        var box = new THREE.Box3();

        for (var i = 0, len = boxs.length; i < len; i++) {
            max.set(boxs[i].max.x, boxs[i].max.y, boxs[i].max.z);
            min.set(boxs[i].min.x, boxs[i].min.y, boxs[i].min.z);
            box.set(min, max);
            bBox.union(box);
        }

        return bBox;
    },

    parseTransform: function (node, objJson, trf) {
        var updateMatrix = false;

        if (objJson.rotation) {
            node.rotation.fromArray(objJson.rotation);
            updateMatrix = true;
        }

        if (objJson.position) {
            node.position.fromArray(objJson.position);
            updateMatrix = true;
        }

        if (objJson.scale) {
            node.scale.fromArray(objJson.scale);
            updateMatrix = true;
        }

        if (objJson.quaternion) {
            node.quaternion.fromArray(objJson.quaternion);
            updateMatrix = true;
        }

        if (updateMatrix) {
            node.updateMatrix();
        }

        if (objJson.matrix) {
            node.matrix.fromArray(objJson.matrix);
        }

        if (trf) {
            var localTrf = node.matrix.clone();
            localTrf.multiplyMatrices(trf, node.matrix);
            node.matrix = localTrf;
        }

        node.matrixAutoUpdate = false;

        if (node.boundingBox !== undefined)
            node.boundingBox = CLOUD.Utils.box3FromArray(objJson.bbox);
    },

    isMobileDevice: function () {

        // userAgent 可能会被更改
        // var uA = navigator.userAgent;
        // if (uA.indexOf('Android') > -1 || uA.indexOf('iPhone') > -1 || uA.indexOf('Windows Phone')) {
        //     return true;
        // }

        var platform = navigator.platform; // iPad, iPhone, Linux armv7, Win, Mac

        // 暂不考虑 Linux
        if (platform.indexOf('Win') !== 0 && platform.indexOf('Mac') !== 0) {
            return true;
        }

        return false;
    }

};

CLOUD.DomUtil = {
    /**
     * split string on whitespace
     * @param {String} str
     * @returns {Array} words
     */
    splitStr : function(str) {
        return str.trim().split(/\s+/g);
    },

    /**
     * get the container offset relative to client
     * @param {object} domElement
     * @returns {object}
     */
    getContainerOffsetToClient : function(domElement) {
        var offsetObj;

        // 获取相对于视口(客户区域)的偏移量
        var getOffsetSum = function (ele) {
            var top = 0, left = 0;

            // 遍历父元素,获取相对与document的偏移量
            while (ele) {
                top += ele.offsetTop;
                left += ele.offsetLeft;
                ele = ele.offsetParent;
            }

            // 只处理document的滚动条(一般也用不着内部滚动条)
            var body = document.body,
                docElem = document.documentElement;

            //获取页面的scrollTop,scrollLeft(兼容性写法)
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
                scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            // 减掉滚动距离，获得相对于客户区域的偏移量
            top -= scrollTop;
            left -= scrollLeft;

            return {
                top: top,
                left: left
            }
        };

        // 获取相对于视口(客户区域)的偏移量(viewpoint), 不加页面的滚动量(scroll)
        var getOffsetRect = function (ele) {
            // getBoundingClientRect返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离。
            //注意：IE、Firefox3+、Opera9.5、Chrome、Safari支持，在IE中，默认坐标从(2,2)开始计算，导致最终距离比其他浏览器多出两个像素，我们需要做个兼容。
            var box = ele.getBoundingClientRect();
            var body = document.body, docElem = document.documentElement;

            //获取页面的scrollTop,scrollLeft(兼容性写法)
            //var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
            //    scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop,
                clientLeft = docElem.clientLeft || body.clientLeft;
            var top = box.top - clientTop,
                left = box.left - clientLeft;

            return {
                //Math.round 兼容火狐浏览器bug
                top: Math.round(top),
                left: Math.round(left)
            }
        };

        //获取元素相对于页面的偏移
        var getOffset = function (ele) {
            if (ele.getBoundingClientRect) {
                return getOffsetRect(ele);
            } else {
                return getOffsetSum(ele);
            }
        };

        if (domElement != document) {

            // 这种方式的目的是为了让外部直接传入clientX,clientY,然后计算出相对父容器的offsetX,offsetY值,
            // 即 offsetX = clientX - offsetV.left, offsetY = clientY - offsetV.top
            var offsetV = getOffset(domElement);

            // domElement.offsetLeft（offsetTop）是相对父容器的偏移量，如果用相对坐标表示，直接传回0
            //offset	: [ domElement.offsetLeft,  domElement.offsetTop ]
            offsetObj = {
                width : domElement.offsetWidth,
                height : domElement.offsetHeight,
                left : offsetV.left,
                top : offsetV.top
            }

        } else {

            offsetObj = {
                width : window.innerWidth,
                height : window.innerHeight,
                left : 0,
                top : 0
            }
        }

        return offsetObj;
    },

    /**
     * set css class name
     * @param {String} id
     * @param {String} cssName
     */
    setClassName : function(id, cssName) {
        var dom = document.getElementById(id);
        if (dom) {
            dom.className = cssName;
        }
    },

    /**
     * add css class name
     * @param {String} id
     * @param {String} cssName
     */
    addClassName : function(id, cssName) {
        var a, b, c;
        var i, j;
        var s = /\s+/;
        var dom = document.getElementById(id);
        if (dom) {

            b = dom;

            if (cssName && typeof cssName == "string") {
                a = cssName.split(s);

                // 如果节点是元素节点，则 nodeType 属性将返回 1。
                // 如果节点是属性节点，则 nodeType 属性将返回 2。
                if (b.nodeType === 1) {
                    if (!b.className && a.length === 1) {
                        b.className = cssName;
                    } else {
                        c = " " + b.className + " ";

                        for (i = 0, j = a.length; i < j; ++i) {
                            c.indexOf(" " + a[i] + " ") < 0 && (c += a[0] + " ");
                        }

                        b.className = String.trim(c);
                    }
                }
            }
        }
    },

    /**
     * remove css class name
     * @param {String} id
     * @param {String} cssName
     */
    removeClassName : function(id, className) {
        var a, b, c;
        var i, j;
        var s = /\s+/;
        var dom = document.getElementById(id);
        if (dom) {
            c = dom;

            if (className && typeof className == "string") {
                a = (className || "").split(s);

                if (c.nodeType === 1 && c.className) {
                    b = (" " + c.className + " ").replace(O, " ");
                    for (i = 0, j = a.length; i < j; i++) {
                        while (b.indexOf(" " + a[i] + " ") >= 0) {
                            b = b.replace(" " + a[i] + " ", " ");
                        }
                    }
                    c.className = className ? String.trim(b) : ""
                }
            }
        }
    },

    /**
     * show or hide element
     * @param {String} id
     * @param {Boolean} isShow
     */
    showOrHideElement : function(id, isShow) {
        var dom = document.getElementById(id);
        if (dom) {
            if (isShow) {
                dom.style.display = "";
            } else {
                dom.style.display = "none";
            }
        }
    },
    getStyleString: function
        (style) {

        var elements = [];

        for (var key in style) {

            var val = style[key];

            elements.push(key);
            elements.push(':');
            elements.push(val);
            elements.push('; ');
        }

        return elements.join('');
    },
    cloneStyle: function (style) {

        var clone = {};

        for (var key in style) {
            clone[key] = style[key];
        }

        return clone;
    },
    removeStyleAttribute: function (style, attrs) {

        if (!Array.isArray(attrs)) {
            attrs = [attrs];
        }

        attrs.forEach(function (key) {
            if (key in style) {
                delete style[key];
            }
        });
    },
    trimRight: function (text) {

        if (text.length === 0) {
            return "";
        }

        var lastNonSpace = text.length - 1;

        for (var i = lastNonSpace; i >= 0; --i) {
            if (text.charAt(i) !== ' ') {
                lastNonSpace = i;
                break;
            }
        }

        return text.substr(0, lastNonSpace + 1);
    },
    trimLeft: function (text) {

        if (text.length === 0) {
            return "";
        }

        var firstNonSpace = 0;

        for (var i = 0; i < text.length; ++i) {
            if (text.charAt(i) !== ' ') {
                firstNonSpace = i;
                break;
            }
        }

        return text.substr(firstNonSpace);
    },
    matchesSelector: function (domElem, selector) {

        if (domElem.matches) {
            return domElem.matches(selector);
        }

        if (domElem.matchesSelector) {
            return domElem.matchesSelector(selector);
        }

        if (domElem.webkitMatchesSelector) {
            return domElem.webkitMatchesSelector(selector);
        }

        if (domElem.msMatchesSelector) {
            return domElem.msMatchesSelector(selector);
        }

        if (domElem.mozMatchesSelector) {
            return domElem.mozMatchesSelector(selector);
        }

        if (domElem.oMatchesSelector) {
            return domElem.oMatchesSelector(selector);
        }

        if (domElem.querySelectorAll) {

            var matches = (domElem.document || domElem.ownerDocument).querySelectorAll(selector),
                i = 0;

            while (matches[i] && matches[i] !== element) i++;

            return matches[i] ? true : false;
        }

        return false;
    },
    toTranslate3d: function (x, y) {

        return 'translate3d(' + x + 'px,' + y + 'px,0)';
    },
    setCursorStyle: function (element, direction) {

        var cursor;

        switch (direction) {
            case 'n':
            case 's':
                cursor = 'ns-resize';
                break;
            case 'w':
            case 'e':
                cursor = 'ew-resize';
                break;
            case 'ne':
            case 'sw':
                cursor = 'nesw-resize';
                break;
            case 'nw':
            case 'se':
                cursor = 'nwse-resize';
                break;
        }

        element.style.cursor = cursor;
    }
};
/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.CylinderBufferGeometry = function ( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'CylinderBufferGeometry';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radiusTop = radiusTop !== undefined ? radiusTop : 20;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
	height = height !== undefined ? height : 100;

	radialSegments = Math.floor( radialSegments )  || 8;
	heightSegments = Math.floor( heightSegments ) || 1;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : 2 * Math.PI;

	// used to calculate buffer length

	var vertexCount = calculateVertexCount();
	var indexCount = calculateIndexCount();

	// buffers

	var indices = new THREE.BufferAttribute( new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount ) , 1 );
	var vertices = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );

	// helper variables

	var index = 0, indexOffset = 0, indexArray = [], halfHeight = height / 2;

	// generate geometry

	generateTorso();

	if( openEnded === false ) {

		if( radiusTop > 0 ) {

			generateCap( true );

		}

		if( radiusBottom > 0 ) {

			generateCap( false );

		}

	}

	// build geometry

	this.setIndex( indices );
	this.addAttribute( 'position', vertices );
	this.addAttribute( 'normal', normals );
	this.addAttribute( 'uv', uvs );

	// helper functions

	function calculateVertexCount () {

		var count = ( radialSegments + 1 ) * ( heightSegments + 1 );

		if ( openEnded === false ) {

			count += ( ( radialSegments + 1 ) * 2 ) + ( radialSegments * 2 );

		}

		return count;

	}

	function calculateIndexCount () {

		var count = radialSegments * heightSegments * 2 * 3;

		if ( openEnded === false ) {

			count += radialSegments * 2 * 3;

		}

		return count;

	}

	function generateTorso () {

		var x, y;
		var normal = new THREE.Vector3();
		var vertex = new THREE.Vector3();

		// this will be used to calculate the normal
		var tanTheta = ( radiusBottom - radiusTop ) / height;

		// generate vertices, normals and uvs

		for ( y = 0; y <= heightSegments; y ++ ) {

			var indexRow = [];

			var v = y / heightSegments;

			// calculate the radius of the current row
			var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

			for ( x = 0; x <= radialSegments; x ++ ) {

				var u = x / radialSegments;

				// vertex
				vertex.x = radius * Math.sin( u * thetaLength + thetaStart );
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * Math.cos( u * thetaLength + thetaStart );
				vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

				// normal
				normal.copy( vertex );

				// handle special case if radiusTop/radiusBottom is zero
				if( ( radiusTop === 0  && y === 0 ) || ( radiusBottom === 0  && y === heightSegments ) ) {

					normal.x = Math.sin( u * thetaLength + thetaStart );
					normal.z = Math.cos( u * thetaLength + thetaStart );

				}

				normal.setY( Math.sqrt( normal.x * normal.x + normal.z * normal.z ) * tanTheta ).normalize();
				normals.setXYZ( index, normal.x, normal.y, normal.z );

				// uv
				uvs.setXY( index, u, 1 - v );

				// save index of vertex in respective row
				indexRow.push( index );

				// increase index
				index ++;

			}

			// now save vertices of the row in our index array
			indexArray.push( indexRow );

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			for ( y = 0; y < heightSegments; y ++ ) {

				// we use the index array to access the correct indices
				var i1 = indexArray[ y ][ x ];
				var i2 = indexArray[ y + 1 ][ x ];
				var i3 = indexArray[ y + 1 ][ x + 1 ];
				var i4 = indexArray[ y ][ x + 1 ];

				// face one
				indices.setX( indexOffset, i1 ); indexOffset++;
				indices.setX( indexOffset, i2 ); indexOffset++;
				indices.setX( indexOffset, i4 ); indexOffset++;

				// face two
				indices.setX( indexOffset, i2 ); indexOffset++;
				indices.setX( indexOffset, i3 ); indexOffset++;
				indices.setX( indexOffset, i4 ); indexOffset++;

			}

		}

	}

	function generateCap ( top ) {

		var x, centerIndexStart, centerIndexEnd;
		var uv = new THREE.Vector2();
		var vertex = new THREE.Vector3();

		var radius = ( top === true ) ? radiusTop : radiusBottom;
		var sign = ( top === true ) ? 1 : - 1;

		// save the index of the first center vertex
		centerIndexStart = index;

		// first we generate the center vertex data of the cap.
		// because the geometry needs one set of uvs per face,
		// we must generate a center vertex per face/segment

		for ( x = 1; x <= radialSegments; x ++ ) {

			// vertex
			vertices.setXYZ( index, 0, halfHeight * sign, 0 );

			// normal
			normals.setXYZ( index, 0, sign, 0 );

			// uv
			if( top === true ) {

				uv.x = x / radialSegments;
				uv.y = 0;

			} else {

				uv.x = ( x - 1 ) / radialSegments;
				uv.y = 1;

			}

			uvs.setXY( index, uv.x, uv.y );

			// increase index
			index++;

		}

		// save the index of the last center vertex
		centerIndexEnd = index;

		// now we generate the surrounding vertices, normals and uvs

		for ( x = 0; x <= radialSegments; x ++ ) {

			var u = x / radialSegments;

			// vertex
			vertex.x = radius * Math.sin( u * thetaLength + thetaStart );
			vertex.y = halfHeight * sign;
			vertex.z = radius * Math.cos( u * thetaLength + thetaStart );
			vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

			// normal
			normals.setXYZ( index, 0, sign, 0 );

			// uv
			uvs.setXY( index, u, ( top === true ) ? 1 : 0 );

			// increase index
			index ++;

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			var c = centerIndexStart + x;
			var i = centerIndexEnd + x;

			if( top === true ) {

				// face top
				indices.setX( indexOffset, i ); indexOffset++;
				indices.setX( indexOffset, i + 1 ); indexOffset++;
				indices.setX( indexOffset, c ); indexOffset++;

			} else {

				// face bottom
				indices.setX( indexOffset, i + 1); indexOffset++;
				indices.setX( indexOffset, i ); indexOffset++;
				indices.setX( indexOffset, c ); indexOffset++;

			}

		}

	}

};

THREE.CylinderBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.CylinderBufferGeometry.prototype.constructor = THREE.CylinderBufferGeometry;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.BoxBufferGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	THREE.BufferGeometry.call( this );

	this.type = 'BoxBufferGeometry';

	this.parameters = {
		width: width,
		height: height,
		depth: depth,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		depthSegments: depthSegments
	};

	var scope = this;

	// segments
	widthSegments = Math.floor( widthSegments ) || 1;
	heightSegments = Math.floor( heightSegments ) || 1;
	depthSegments = Math.floor( depthSegments ) || 1;

	// these are used to calculate buffer length
	var vertexCount = calculateVertexCount( widthSegments, heightSegments, depthSegments );
	var indexCount = ( vertexCount / 4 ) * 6;

	// buffers
	var indices = new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount );
	var vertices = new Float32Array( vertexCount * 3 );
	var normals = new Float32Array( vertexCount * 3 );
	var uvs = new Float32Array( vertexCount * 2 );

	// offset variables
	var vertexBufferOffset = 0;
	var uvBufferOffset = 0;
	var indexBufferOffset = 0;
	var numberOfVertices = 0;

	// group variables
	var groupStart = 0;

	// build each side of the box geometry
	buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height,   width,  depthSegments, heightSegments, 0 ); // px
	buildPlane( 'z', 'y', 'x',   1, - 1, depth, height, - width,  depthSegments, heightSegments, 1 ); // nx
	buildPlane( 'x', 'z', 'y',   1,   1, width, depth,    height, widthSegments, depthSegments,  2 ); // py
	buildPlane( 'x', 'z', 'y',   1, - 1, width, depth,  - height, widthSegments, depthSegments,  3 ); // ny
	buildPlane( 'x', 'y', 'z',   1, - 1, width, height,   depth,  widthSegments, heightSegments, 4 ); // pz
	buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth,  widthSegments, heightSegments, 5 ); // nz

	// build geometry
	this.setIndex( new THREE.BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	// helper functions

	function calculateVertexCount ( w, h, d ) {

		var segments = 0;

		// calculate the amount of segments for each side
		segments += w * h * 2; // xy
		segments += w * d * 2; // xz
		segments += d * h * 2; // zy

		return segments * 4; // four vertices per segments

	}

	function buildPlane ( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

		var segmentWidth	= width / gridX;
		var segmentHeight = height / gridY;

		var widthHalf = width / 2;
		var heightHalf = height / 2;
		var depthHalf = depth / 2;

		var gridX1 = gridX + 1;
		var gridY1 = gridY + 1;

		var vertexCounter = 0;
		var groupCount = 0;

		var vector = new THREE.Vector3();

		// generate vertices, normals and uvs

		for ( var iy = 0; iy < gridY1; iy ++ ) {

			var y = iy * segmentHeight - heightHalf;

			for ( var ix = 0; ix < gridX1; ix ++ ) {

				var x = ix * segmentWidth - widthHalf;

				// set values to correct vector component
				vector[ u ] = x * udir;
				vector[ v ] = y * vdir;
				vector[ w ] = depthHalf;

				// now apply vector to vertex buffer
				vertices[ vertexBufferOffset ] = vector.x;
				vertices[ vertexBufferOffset + 1 ] = vector.y;
				vertices[ vertexBufferOffset + 2 ] = vector.z;

				// set values to correct vector component
				vector[ u ] = 0;
				vector[ v ] = 0;
				vector[ w ] = depth > 0 ? 1 : - 1;

				// now apply vector to normal buffer
				normals[ vertexBufferOffset ] = vector.x;
				normals[ vertexBufferOffset + 1 ] = vector.y;
				normals[ vertexBufferOffset + 2 ] = vector.z;

				// uvs
				uvs[ uvBufferOffset ] = ix / gridX;
				uvs[ uvBufferOffset + 1 ] = 1 - ( iy / gridY );

				// update offsets and counters
				vertexBufferOffset += 3;
				uvBufferOffset += 2;
				vertexCounter += 1;

			}

		}

		// 1. you need three indices to draw a single face
		// 2. a single segment consists of two faces
		// 3. so we need to generate six (2*3) indices per segment

		for ( iy = 0; iy < gridY; iy ++ ) {

			for ( ix = 0; ix < gridX; ix ++ ) {

				// indices
				var a = numberOfVertices + ix + gridX1 * iy;
				var b = numberOfVertices + ix + gridX1 * ( iy + 1 );
				var c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

				// face one
				indices[ indexBufferOffset ] = a;
				indices[ indexBufferOffset + 1 ] = b;
				indices[ indexBufferOffset + 2 ] = d;

				// face two
				indices[ indexBufferOffset + 3 ] = b;
				indices[ indexBufferOffset + 4 ] = c;
				indices[ indexBufferOffset + 5 ] = d;

				// update offsets and counters
				indexBufferOffset += 6;
				groupCount += 6;

			}

		}

		// add a group to the geometry. this will ensure multi material support
		scope.addGroup( groupStart, groupCount, materialIndex );

		// calculate new start value for groups
		groupStart += groupCount;

		// update total number of vertices
		numberOfVertices += vertexCounter;

	}

};

THREE.BoxBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.BoxBufferGeometry.prototype.constructor = THREE.BoxBufferGeometry;


/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The poles (phi) are at the positive and negative y axis.
 * The equator starts at positive z.
 */

THREE.Spherical = function( radius, phi, theta ) {

	this.radius = ( radius !== undefined ) ? radius : 1.0;
	this.phi = ( phi !== undefined ) ? phi : 0; // up / down towards top and bottom pole
	this.theta = ( theta !== undefined ) ? theta : 0; // around the equator of the sphere
};

THREE.Spherical.prototype = {

	constructor: THREE.Spherical,

	set: function ( radius, phi, theta ) {

		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( other ) {

		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;

	},

	// restrict phi to be betwee EPS and PI-EPS
	makeSafe: function() {

		var EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

		return this;

	},

	setFromVector3: function( vec3 ) {

		this.radius = vec3.length();

		if ( this.radius === 0 ) {

			this.theta = 0;
			this.phi = 0;

		} else {

			this.theta = Math.atan2( vec3.x, vec3.z ); // equator angle around y-up axis
			this.phi = Math.acos( THREE.Math.clamp( vec3.y / this.radius, - 1, 1 ) ); // polar angle

		}

		return this;

	}
};

CLOUD.GeomUtil = {

    createInstancedBufferGeometry: function (mesh, objJSON) {
        var instances = objJSON.count;

        // 转换buffer
        var geometry = new THREE.InstancedBufferGeometry();
        geometry.maxInstancedCount = instances;
        geometry.addAttribute('position', mesh.getAttribute("position"));
        geometry.setIndex(mesh.index);

        var transformMatrixs = [];
        var userIds = [];
        var bboxs = [];
        var items = objJSON.items;

        for (var key in items) {
            var item = items[key];
            transformMatrixs.push(item.worldMatrix);
            userIds.push(item.userId);
            bboxs.push(CLOUD.Utils.box3FromArray(item.bbox));
        }

        var componentV1 = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = componentV1.count; i < ul; i++) {
            componentV1.setXYZW(i, transformMatrixs[i][0], transformMatrixs[i][1], transformMatrixs[i][2], transformMatrixs[i][3]);
        }
        geometry.addAttribute('componentV1', componentV1);

        var componentV2 = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = componentV2.count; i < ul; i++) {
            componentV2.setXYZW(i, transformMatrixs[i][4], transformMatrixs[i][5], transformMatrixs[i][6], transformMatrixs[i][7]);
        }
        geometry.addAttribute('componentV2', componentV2);

        var componentV3 = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = componentV3.count; i < ul; i++) {
            componentV3.setXYZW(i, transformMatrixs[i][8], transformMatrixs[i][9], transformMatrixs[i][10], transformMatrixs[i][11]);
        }
        geometry.addAttribute('componentV3', componentV3);

        var componentV4 = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1);
        for (var i = 0, ul = componentV4.count; i < ul; i++) {
            componentV4.setXYZW(i, transformMatrixs[i][12], transformMatrixs[i][13], transformMatrixs[i][14], transformMatrixs[i][15]);
        }
        geometry.addAttribute('componentV4', componentV4);

        // 计算法线，
        // 注意：在shader中处理时，应用于法线向量的变换矩阵是顶点变换矩阵的逆转置矩阵
        if (geometry.attributes.normal === undefined) {
            geometry.computeVertexNormals();
        }

        geometry.boundingBox = CLOUD.Utils.box3FromArray(objJSON.bbox);

        var extProperty = {
            bboxs: bboxs,
            userIds: userIds,
            transformMatrixs: transformMatrixs
        };

        geometry.extProperty = extProperty;

        return geometry;
    },

    parseNodeProperties: function (object, objJSON, nodeId, trf) {

        //object.name = nodeId;

        if (objJSON.userId)
            object.name = objJSON.userId;
        else
            object.name = nodeId;

        CLOUD.Utils.parseTransform(object, objJSON, trf);
    },

    parseSceneNode: function (object, objJSON, modelManager, level) {

        object.sceneId = objJSON.sceneId;

        // set world bbox
        object.worldBoundingBox = object.boundingBox.clone();
        object.worldBoundingBox.applyMatrix4(modelManager.getGlobalTransform());
        object.level = objJSON.level;
        if (objJSON.order) {
            object.out = 1;
        }

        if (CLOUD.GlobalData.ShowSubSceneBox) {
            var clr = 0xff;
            clr = clr << (level * 5);

            var boxNode = new CLOUD.BBoxNode(object.boundingBox, clr);
            CLOUD.Utils.parseTransform(boxNode, objJSON);
            object.add(boxNode);
        }
    },

    parseCylinderNode: function () {

        var reg = new RegExp("'", "g");
        var startPt = new THREE.Vector3();
        var endPt = new THREE.Vector3();
        var dir = new THREE.Vector3();
        var unitY = new THREE.Vector3(0, 1, 0);

        return function (geometryNode, params) {
            if (params instanceof Object) {

            }
            else {
                params = params.replace(reg, '"');
                params = JSON.parse(params);
            }


            startPt.fromArray(params.startPt);
            endPt.fromArray(params.endPt);

            dir.subVectors(endPt, startPt);

            var len = dir.length();
            dir.normalize();

            var radius = params.radius;
            if (radius <= 1)
                radius = 100;
            geometryNode.scale.set(radius, len, radius);
            geometryNode.quaternion.setFromUnitVectors(unitY, dir);
            geometryNode.position.copy(startPt).addScaledVector(dir, len * 0.5);
            geometryNode.updateMatrix();
            geometryNode.matrixAutoUpdate = false;
        }

    }(),

    parseBoxNode: function () {

        var _boundingBox = new THREE.Box3();
        var _trf = new THREE.Matrix4();

        return function (object, objJSON) {
            CLOUD.Utils.parseTransform(object, objJSON);

            CLOUD.Utils.box3FromArray(objJSON.bbox, _boundingBox)
            var boxSize = _boundingBox.size();
            var center = _boundingBox.center();

            _trf.identity();
            _trf.scale(boxSize);
            _trf.setPosition(center);

            object.matrix.multiply(_trf);
            object.matrixAutoUpdate = false;
        };


    }(),

    parseHermitePipe: function (objJSON) {
        var reg = new RegExp("'", "g");
        var params = objJSON.params;
        params = params.replace(reg, '"');
        params = JSON.parse(params);
        var points = [];

        for (var ii = 0, len = params.ctrlPts.length / 3; ii < len; ++ii) {
            var pt = new THREE.Vector3();
            pt.fromArray(params.ctrlPts, ii * 3);
            points.push(pt);
        }

        var extrudePath = new THREE.CatmullRomCurve3(points);
        var tube = new THREE.TubeGeometry(extrudePath, 5, params.radius, 6, false);
        var bufferObj = new THREE.BufferGeometry();
        bufferObj.fromGeometry(tube);

        return bufferObj;
    },

    parsePGeomNodeInstance: function (client, objJSON, matObj, trf, unloadable) {

        var object = null;

        if (objJSON.geomType == "pipe" || objJSON.geomType == "tube") {

            var geometry = CLOUD.GeomUtil.UnitCylinderInstance;
            object = new THREE.Mesh(geometry, matObj);

            if (!object) {
                return null;
            }


            CLOUD.GeomUtil.parseCylinderNode(object, objJSON.params);

        }
        else if (objJSON.geomType == "box") {

            var geometry = CLOUD.GeomUtil.UnitBoxInstance;
            object = new THREE.Mesh(geometry, matObj);

            if (!object) {
                return null;
            }
            CLOUD.GeomUtil.parseBoxNode(object, objJSON);

        }
        else if (objJSON.geomType == "hermitepipe") {
            var geometry = CLOUD.GeomUtil.parseHermitePipe(objJSON);
            object = new THREE.Mesh(geometry, matObj);

            if (!object) {
                return null;
            }
        }
        else {
            CLOUD.Logger.log("unknonw geometry!");
            return object;
        }

        if (trf) {
            var localTrf = trf.clone();
            localTrf.multiply(object.matrix);
            object.matrix = localTrf;
            object.matrixAutoUpdate = false;
        }

        return object;
    },

    EmptyGeometry: new THREE.Geometry(),
    UnitCylinderInstance: new THREE.CylinderBufferGeometry(1, 1, 1, 8, 1, false),
    UnitBoxInstance: new THREE.BoxBufferGeometry(1, 1, 1),

    initializeUnitInstances: function () {
        if (!CLOUD.GeomUtil.UnitCylinderInstance.boundingBox)
            CLOUD.GeomUtil.UnitCylinderInstance.computeBoundingBox();
        if (!CLOUD.GeomUtil.UnitBoxInstance.boundingBox)
            CLOUD.GeomUtil.UnitBoxInstance.computeBoundingBox();
    },

    destroyUnitInstances: function () {
        CLOUD.GeomUtil.UnitCylinderInstance.dispose();
        CLOUD.GeomUtil.UnitBoxInstance.dispose();
    },

    toMeshWorldPosition: function (position, sceneMatrix) {

        if (!sceneMatrix) {
            sceneMatrix = new THREE.Matrix4();
        }

        var inverseScaleMatrix = new THREE.Matrix4();
        inverseScaleMatrix.getInverse(sceneMatrix);

        // 计算世界坐标下的位置
        var worldPosition = position.clone();
        worldPosition.applyMatrix4(inverseScaleMatrix);

        return worldPosition;
    },

    // 遍历父节点获得当前mesh的世界矩阵
    getWorldMatrixOfMesh: function (mesh) {
        var matList = [];
        var parent = mesh.parent;

        while (parent) {

            // if ((parent instanceof CLOUD.SubScene) || (parent instanceof CLOUD.Cell)) {
            //     break;
            // }

            matList.push(parent.matrix);
            parent = parent.parent;
        }

        var matTmp = new THREE.Matrix4();

        if (matList.length > 0) {
            matTmp = matList[matList.length - 1];

            for (var i = matList.length - 2; i >= 0; --i) {
                matTmp.multiply(matList[i]);
            }
        }

        var objMatrixWorld = new THREE.Matrix4();
        objMatrixWorld.multiplyMatrices(matTmp, mesh.matrix);

        return objMatrixWorld;
    },

    getBoundingBoxWorldOfMesh: function (mesh, sceneMatrix) {

        // 计算世界坐标下的包围盒
        var bBox = mesh.boundingBox;
        if (!bBox) {
            if (!mesh.geometry.boundingBox) {
                mesh.geometry.computeBoundingBox();
            }
            bBox = mesh.geometry.boundingBox;
        }

        var boundingBox = bBox.clone();

        boundingBox.applyMatrix4(mesh.matrixWorld);
        var inverseScaleMatrix = new THREE.Matrix4();
        inverseScaleMatrix.getInverse(sceneMatrix);
        boundingBox.applyMatrix4(inverseScaleMatrix);

        return boundingBox;
    },

    // getMeshNodeAttr: function (cacheGeometries, sceneOrSymbolReader, item, mpkArray, itemParent) {
    //     var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
    //     var meshAttr = sceneOrSymbolReader.getMeshAttrInfo(item.attrIndex);
    //     var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
    //     // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
    //     var meshId = meshAttr.meshId;
    //     var mpk = mpkArray[meshAttr.blockId];
    //
    //     if (!mpk) {
    //         // CLOUD.Logger.log("empty mpk");
    //         return null;
    //     }
    //
    //     var meshData = mpk.getMeshInfo(meshAttr.meshId);
    //
    //     if (meshData == undefined) {
    //         CLOUD.Logger.log("empty mesh data");
    //         return null;
    //     }
    //
    //     var geometry = cacheGeometries[meshId];
    //
    //     if (!geometry) {
    //
    //         var positions = mpk.getPtBuffer(meshAttr.meshId);
    //         var index = mpk.getIdxBuffer(meshAttr.meshId);
    //         var normal = mpk.getNormalBuffer(meshAttr.meshId);
    //
    //         if (positions == undefined || index == undefined || normal == undefined) {
    //             CLOUD.Logger.log("empty mesh data");
    //             return null;
    //         }
    //
    //         geometry = new THREE.BufferGeometry();
    //         geometry.setIndex(new THREE.BufferAttribute(index, 1));
    //         geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    //         geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
    //         // geometry.computeVertexNormals(); // 计算法线，影响光照
    //         cacheGeometries[meshId] = geometry;
    //     }
    //
    //     var matrixTmp = new THREE.Matrix4();
    //     matrixTmp.setPosition(meshData.baseVector);
    //     matrixTmp.scale(new THREE.Vector3(meshData.baseScale, meshData.baseScale, meshData.baseScale));
    //
    //     if (meshData.baseScale != 0.0) {
    //         matrix.multiply(matrixTmp);
    //     }
    //
    //     if (itemParent) {
    //         matrix.multiplyMatrices(itemParent.matrix, matrix);
    //     }
    //
    //     meshData = null;
    //     mpk = null;
    //     meshAttr = null;
    //
    //     return {nodeId: nodeId, meshId: meshId, matrix: matrix};
    // },

    getMeshNodeAttr: function() {

        var matrixTmp = new THREE.Matrix4();

        return function (cacheGeometries, sceneOrSymbolReader, item, mpkArray, itemParent) {
            var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
            var meshAttr = sceneOrSymbolReader.getMeshAttrInfo(item.attrIndex);
            var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
            // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
            var meshId = meshAttr.meshId;
            var mpk = mpkArray[meshAttr.blockId];

            if (!mpk) {
                // CLOUD.Logger.log("empty mpk");
                return null;
            }

            var meshData = mpk.getMeshInfo(meshAttr.meshId);

            if (meshData == undefined) {
                CLOUD.Logger.log("empty mesh data");
                return null;
            }

            var geometry = cacheGeometries[meshId];

            if (!geometry) {

                var positions = mpk.getPtBuffer(meshAttr.meshId);
                var index = mpk.getIdxBuffer(meshAttr.meshId);
                var normal = mpk.getNormalBuffer(meshAttr.meshId);

                if (positions == undefined || index == undefined || normal == undefined) {
                    CLOUD.Logger.log("empty mesh data");
                    return null;
                }

                geometry = new THREE.BufferGeometry();
                geometry.setIndex(new THREE.BufferAttribute(index, 1));
                geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
                // geometry.computeVertexNormals(); // 计算法线，影响光照
                cacheGeometries[meshId] = geometry;
            }

            // var matrixTmp = new THREE.Matrix4();
            matrixTmp.identity();
            matrixTmp.setPosition(meshData.baseVector);
            matrixTmp.scale(new THREE.Vector3(meshData.baseScale, meshData.baseScale, meshData.baseScale));

            if (meshData.baseScale != 0.0) {
                matrix.multiply(matrixTmp);
            }

            if (itemParent) {
                matrix.multiplyMatrices(itemParent.matrix, matrix);
            }

            meshData = null;
            mpk = null;
            meshAttr = null;

            return {nodeId: nodeId, meshId: meshId, matrix: matrix};
        }
    }(),

    getMeshNodeAttrOfTube: function (cacheGeometries, sceneOrSymbolReader, item, itemParent) {
        var geomAttr = sceneOrSymbolReader.getGeomInfo(item.attrIndex);
        var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
        var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
        // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
        var meshId = "tube";
        var geometry = cacheGeometries[meshId];

        if (!geometry) {
            geometry = CLOUD.GeomUtil.UnitCylinderInstance;
            cacheGeometries[meshId] = geometry;
        }

        var startPt = geomAttr.startPt;
        var endPt = geomAttr.endPt;

        var dir = new THREE.Vector3();
        dir.subVectors(endPt, startPt);

        var len = dir.length();
        dir.normalize();

        var radius = geomAttr.radius;
        if (radius <= 1) {
            radius = 100;
        }

        var unitY = new THREE.Vector3(0, 1, 0);
        var scale = new THREE.Vector3(radius, len, radius);
        var quaternion = new THREE.Quaternion().setFromUnitVectors(unitY, dir);
        var position = startPt.clone().addScaledVector(dir, len * 0.5);

        var matrixTmp = new THREE.Matrix4().compose(position, quaternion, scale);
        matrix.multiply(matrixTmp);

        if (itemParent) {
            matrix.multiplyMatrices(itemParent.matrix, matrix);
        }

        geomAttr = null;

        return {nodeId: nodeId, meshId: meshId, matrix: matrix};
    },

    getMeshNodeAttrOfPipe: function (cacheGeometries, sceneOrSymbolReader, item, itemParent) {
        var geomAttr = sceneOrSymbolReader.getGeomInfo(item.attrIndex);
        var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
        // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
        var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
        var meshId = "pipe";
        var geometry = cacheGeometries[meshId];

        if (!geometry) {
            geometry = CLOUD.GeomUtil.UnitCylinderInstance;
            cacheGeometries[meshId] = geometry;
        }

        var startPt = geomAttr.startPt;
        var endPt = geomAttr.endPt;

        var dir = new THREE.Vector3();
        dir.subVectors(endPt, startPt);

        var len = dir.length();
        dir.normalize();

        var radius = geomAttr.radius;
        if (radius <= 1) {
            radius = 100;
        }

        var unitY = new THREE.Vector3(0, 1, 0);
        var scale = new THREE.Vector3(radius, len, radius);
        var quaternion = new THREE.Quaternion().setFromUnitVectors(unitY, dir);
        var position = startPt.clone().addScaledVector(dir, len * 0.5);

        var matrixTmp = new THREE.Matrix4().compose(position, quaternion, scale);
        matrix.multiply(matrixTmp);

        if (itemParent) {
            matrix.multiplyMatrices(itemParent.matrix, matrix);
        }

        geomAttr = null;

        return {nodeId: nodeId, meshId: meshId, matrix: matrix};
    },

    getMeshNodeAttrOfBox: function (cacheGeometries, sceneOrSymbolReader, item, itemParent) {
        var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
        var bBox = item.boundingBox;
        var boxSize = bBox.size();
        var boxCenter = bBox.center();
        // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
        var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
        var meshId = "box";
        var geometry = cacheGeometries[meshId];

        if (!geometry) {
            geometry = CLOUD.GeomUtil.UnitBoxInstance;
            cacheGeometries[meshId] = geometry;
        }

        var matrixTmp = new THREE.Matrix4().scale(new THREE.Vector3(boxSize.x, boxSize.y, boxSize.z));
        matrixTmp.setPosition(boxCenter);
        matrix.multiply(matrixTmp);

        if (itemParent) {
            matrix.multiplyMatrices(itemParent.matrix, matrix);
        }

        return {nodeId: nodeId, meshId: meshId, matrix: matrix};
    }

};

CLOUD.MaterialUtil = {

    DefaultMaterial: new THREE.MeshPhongMaterial({color: 0x0000ff, side: THREE.DoubleSide}),

    createInstancePhongMaterial: function (matObj) {
        // 复制一份，不影响其他模型的使用
        // 不复制一份，有模型绘制不出
        var material = matObj.clone();
        material.type = "phong_instanced";
        material.uniforms = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.uniforms;
        material.vertexShader = "#define USE_CUST_INSTANCED \n" + CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.vertexShader;
        material.fragmentShader = "#define USE_CUST_INSTANCED \n" + CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.fragmentShader;
        return material;
    },

    updateBasicMaterial: function (material, instanced) {

        if (instanced) {
            material.vertexShader = "#define USE_CUST_INSTANCED \n" + CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.vertexShader;
            material.fragmentShader = "#define USE_CUST_INSTANCED \n" + CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.fragmentShader;
        } else {
            material.vertexShader = CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.vertexShader;
            material.fragmentShader = CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.fragmentShader;
        }

        material.needsUpdate = true;
    },

    setMatrixUniform: function(transform) {
        CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.uniforms.transformMatrix.value = transform;
    },

    createPhongMaterial: function(obj){
        var material = new THREE.MeshPhongMaterial(obj);
        material.type = 'phong_cust_clip';
        material.uniforms = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.uniforms;
        material.vertexShader = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.vertexShader;
        material.fragmentShader = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.fragmentShader;
        return material;
    },

    createHighlightMaterial: function () {
        return this.createPhongMaterial(CLOUD.GlobalData.SelectionColor);
    },

    nextHighestPowerOfTwo: function (x) {
        --x;

        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }

        return x + 1;
    },

    ensurePowerOfTwo: function (image) {

        if (!THREE.Math.isPowerOfTwo(image.width) || !THREE.Math.isPowerOfTwo(image.height)) {
            var canvas = document.createElement("canvas");
            canvas.width = CLOUD.MaterialUtil.nextHighestPowerOfTwo(image.width);
            canvas.height = CLOUD.MaterialUtil.nextHighestPowerOfTwo(image.height);

            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            return canvas;
        }

        return image;
    }
};

CLOUD.CameraInfo = function (position, target, up) {
    "use strict";
    this.position = position;
    this.target = target;
    this.up = up;
};

CLOUD.CameraUtil = {

    // camera = {"camera_position":"26513.603437903, -14576.4810728955, 15107.6582255056","camera_direction":"-220.050259546712, 169.277369901229, -125.801809656091","camera_up":"0, 0, 304.8"}
    transformCamera: function (camera, scene) {
        var position = new THREE.Vector3();

        var str2float = function (strarr) {
            return [parseFloat(strarr[0]), parseFloat(strarr[1]), parseFloat(strarr[2])];
        };

        position.fromArray(str2float(camera.position.split(",")));
        var dir = new THREE.Vector3();
        dir.fromArray(str2float(camera.direction.split(",")));
        var up = new THREE.Vector3();
        up.fromArray(str2float(camera.up.split(",")));

        var target = new THREE.Vector3();
        target.addVectors(position, dir);

        position.applyMatrix4(scene.rootNode.matrix);
        target.applyMatrix4(scene.rootNode.matrix);

        var rotMat = new THREE.Matrix4();
        rotMat.makeRotationFromEuler(scene.rootNode.rotation);
        up.applyMatrix4(rotMat);
        up.normalize();

        return new CLOUD.CameraInfo(position, target, up);
    },

    parseCameraInfo: function (jsonStr) {
        var jsonObj = JSON.parse(jsonStr);

        var position = new THREE.Vector3();
        position.x = jsonObj.position.x;
        position.y = jsonObj.position.y;
        position.z = jsonObj.position.z;

        var target = new THREE.Vector3();
        target.x = jsonObj.target.x;
        target.y = jsonObj.target.y;
        target.z = jsonObj.target.z;

        var up = new THREE.Vector3();
        up.x = jsonObj.up.x;
        up.y = jsonObj.up.y;
        up.z = jsonObj.up.z;

        return new CLOUD.CameraInfo(position, target, up);
    },


    intersectBoxByRay: function (ray, box) {

        var tmin, tmax, tymin, tymax, tzmin, tzmax;

        var invdirx = 1 / ray.direction.x,
			invdiry = 1 / ray.direction.y,
			invdirz = 1 / ray.direction.z;

        var origin = ray.origin;

        if (invdirx >= 0) {

            tmin = (box.min.x - origin.x) * invdirx;
            tmax = (box.max.x - origin.x) * invdirx;

        } else {

            tmin = (box.max.x - origin.x) * invdirx;
            tmax = (box.min.x - origin.x) * invdirx;

        }

        if (invdiry >= 0) {

            tymin = (box.min.y - origin.y) * invdiry;
            tymax = (box.max.y - origin.y) * invdiry;

        } else {

            tymin = (box.max.y - origin.y) * invdiry;
            tymax = (box.min.y - origin.y) * invdiry;

        }

        if ((tmin > tymax) || (tymin > tmax)) return null;

        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN

        if (tymin > tmin || tmin !== tmin) tmin = tymin;

        if (tymax < tmax || tmax !== tmax) tmax = tymax;

        if (invdirz >= 0) {

            tzmin = (box.min.z - origin.z) * invdirz;
            tzmax = (box.max.z - origin.z) * invdirz;

        } else {

            tzmin = (box.max.z - origin.z) * invdirz;
            tzmax = (box.min.z - origin.z) * invdirz;

        }

        if ((tmin > tzmax) || (tzmin > tmax)) return null;

        if (tzmin > tmin || tmin !== tmin) tmin = tzmin;

        if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

        //return point closest to the ray (positive side)

        if (tmax < 0) return null;

        return tmin >= 0 ? tmin : tmax;

    }
};
CLOUD.Logger = {

    log: function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.log.apply(console, arguments);
        }
    },

    debug: function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.debug.apply(console, arguments);
        }
    },

    warn: function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.warn.apply(console, arguments);
        }
    },

    error: function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.error.apply(console, arguments);
        }
    },

    time:function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.time.apply(console, arguments);
        }
    },

    timeEnd:function () {

        if (CLOUD.GlobalData.DEBUG) {
            console.timeEnd.apply(console, arguments);
        }
    }

};

/**
 * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
 * recently used items while discarding least recently used items when its limit
 * is reached.
 *
 * Licensed under MIT. Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>
 * See README.md for details.
 *
 * Illustration of the design:
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | head |.newer => |      |.newer => |      |.newer => | tail |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
 */
(function(g,f){
  const e = typeof exports == 'object' ? exports : typeof g == 'object' ? g : {};
  f(e);
  if (typeof define == 'function' && define.amd) { define('lru', e); }
})(this, function(exports) {

const NEWER = Symbol('newer');
const OLDER = Symbol('older');

function LRUMap(limit, entries) {
  if (typeof limit !== 'number') {
    // called as (entries)
    entries = limit;
    limit = 0;
  }

  this.size = 0;
  this.limit = limit;
  this.oldest = this.newest = undefined;
  this._keymap = new Map();

  if (entries) {
    this.assign(entries);
    if (limit < 1) {
      this.limit = this.size;
    }
  }
}

exports.LRUMap = LRUMap;

function Entry(key, value) {
  this.key = key;
  this.value = value;
  this[NEWER] = undefined;
  this[OLDER] = undefined;
}


LRUMap.prototype._markEntryAsUsed = function(entry) {
  if (entry === this.newest) {
    // Already the most recenlty used entry, so no need to update the list
    return;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry[NEWER]) {
    if (entry === this.oldest) {
      this.oldest = entry[NEWER];
    }
    entry[NEWER][OLDER] = entry[OLDER]; // C <-- E.
  }
  if (entry[OLDER]) {
    entry[OLDER][NEWER] = entry[NEWER]; // C. --> E
  }
  entry[NEWER] = undefined; // D --x
  entry[OLDER] = this.newest; // D. --> E
  if (this.newest) {
    this.newest[NEWER] = entry; // E. <-- D
  }
  this.newest = entry;
};

LRUMap.prototype.assign = function(entries) {
  let entry, limit = this.limit || Number.MAX_VALUE;
  this._keymap.clear();
  let it = entries[Symbol.iterator]();
  for (let itv = it.next(); !itv.done; itv = it.next()) {
    let e = new Entry(itv.value[0], itv.value[1]);
    this._keymap.set(e.key, e);
    if (!entry) {
      this.oldest = e;
    } else {
      entry[NEWER] = e;
      e[OLDER] = entry;
    }
    entry = e;
    if (limit-- == 0) {
      throw new Error('overflow');
    }
  }
  this.newest = entry;
  this.size = this._keymap.size;
};

LRUMap.prototype.get = function(key) {
  // First, find our cache entry
  var entry = this._keymap.get(key);
  if (!entry) return; // Not cached. Sorry.
  // As <key> was found in the cache, register it as being requested recently
  this._markEntryAsUsed(entry);
  return entry.value;
};

LRUMap.prototype.set = function(key, value) {
  var entry = this._keymap.get(key);

  if (entry) {
    // update existing
    entry.value = value;
    this._markEntryAsUsed(entry);
    return this;
  }

  // new entry
  this._keymap.set(key, (entry = new Entry(key, value)));

  if (this.newest) {
    // link previous tail to the new tail (entry)
    this.newest[NEWER] = entry;
    entry[OLDER] = this.newest;
  } else {
    // we're first in -- yay
    this.oldest = entry;
  }

  // add new entry to the end of the linked list -- it's now the freshest entry.
  this.newest = entry;
  ++this.size;
  if (this.size > this.limit) {
    // we hit the limit -- remove the head
    this.shift();
  }

  return this;
};

LRUMap.prototype.shift = function() {
  // todo: handle special case when limit == 1
  var entry = this.oldest;
  if (entry) {
    if (this.oldest[NEWER]) {
      // advance the list
      this.oldest = this.oldest[NEWER];
      this.oldest[OLDER] = undefined;
    } else {
      // the cache is exhausted
      this.oldest = undefined;
      this.newest = undefined;
    }
    // Remove last strong reference to <entry> and remove links from the purged
    // entry being returned:
    entry[NEWER] = entry[OLDER] = undefined;
    this._keymap.delete(entry.key);
    --this.size;
    return [entry.key, entry.value];
  }
};

// ----------------------------------------------------------------------------
// Following code is optional and can be removed without breaking the core
// functionality.

LRUMap.prototype.find = function(key) {
  let e = this._keymap.get(key);
  return e ? e.value : undefined;
};

LRUMap.prototype.has = function(key) {
  return this._keymap.has(key);
};

LRUMap.prototype['delete'] = function(key) {
  var entry = this._keymap.get(key);
  if (!entry) return;
  this._keymap.delete(entry.key);
  if (entry[NEWER] && entry[OLDER]) {
    // relink the older entry with the newer entry
    entry[OLDER][NEWER] = entry[NEWER];
    entry[NEWER][OLDER] = entry[OLDER];
  } else if (entry[NEWER]) {
    // remove the link to us
    entry[NEWER][OLDER] = undefined;
    // link the newer entry to head
    this.oldest = entry[NEWER];
  } else if (entry[OLDER]) {
    // remove the link to us
    entry[OLDER][NEWER] = undefined;
    // link the newer entry to head
    this.newest = entry[OLDER];
  } else {// if(entry[OLDER] === undefined && entry.newer === undefined) {
    this.oldest = this.newest = undefined;
  }

  this.size--;
  return entry.value;
};

LRUMap.prototype.clear = function() {
  // Not clearing links should be safe, as we don't expose live links to user
  this.oldest = this.newest = undefined;
  this.size = 0;
  this._keymap.clear();
};


function EntryIterator(oldestEntry) { this.entry = oldestEntry; }
EntryIterator.prototype[Symbol.iterator] = function() { return this; }
EntryIterator.prototype.next = function() {
  let ent = this.entry;
  if (ent) {
    this.entry = ent[NEWER];
    return { done: false, value: [ent.key, ent.value] };
  } else {
    return { done: true, value: undefined };
  }
};


function KeyIterator(oldestEntry) { this.entry = oldestEntry; }
KeyIterator.prototype[Symbol.iterator] = function() { return this; }
KeyIterator.prototype.next = function() {
  let ent = this.entry;
  if (ent) {
    this.entry = ent[NEWER];
    return { done: false, value: ent.key };
  } else {
    return { done: true, value: undefined };
  }
};

function ValueIterator(oldestEntry) { this.entry = oldestEntry; }
ValueIterator.prototype[Symbol.iterator] = function() { return this; }
ValueIterator.prototype.next = function() {
  let ent = this.entry;
  if (ent) {
    this.entry = ent[NEWER];
    return { done: false, value: ent.value };
  } else {
    return { done: true, value: undefined };
  }
};


LRUMap.prototype.keys = function() {
  return new KeyIterator(this.oldest);
};

LRUMap.prototype.values = function() {
  return new ValueIterator(this.oldest);
};

LRUMap.prototype.entries = function() {
  return this;
};

LRUMap.prototype[Symbol.iterator] = function() {
  return new EntryIterator(this.oldest);
};

LRUMap.prototype.forEach = function(fun, thisObj) {
  if (typeof thisObj !== 'object') {
    thisObj = this;
  }
  let entry = this.oldest;
  while (entry) {
    fun.call(thisObj, entry.value, entry.key, this);
    entry = entry[NEWER];
  }
};

/** Returns a JSON (array) representation */
LRUMap.prototype.toJSON = function() {
  var s = new Array(this.size), i = 0, entry = this.oldest;
  while (entry) {
    s[i++] = { key: entry.key, value: entry.value };
    entry = entry[NEWER];
  }
  return s;
};

/** Returns a String representation */
LRUMap.prototype.toString = function() {
  var s = '', entry = this.oldest;
  while (entry) {
    s += String(entry.key)+':'+entry.value;
    entry = entry[NEWER];
    if (entry) {
      s += ' < ';
    }
  }
  return s;
};

});

/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLGeometriesExt = function ( gl, properties, info ) {

	var geometries = new LRUMap(CLOUD.GlobalData.maxDrawCacheNum);

	// limit use of memory to only hold commonly-used geometries,
	// dispose infrequent geometries. - xiaojian
	geometries.shift = function() {
		var entry = LRUMap.prototype.shift.call(this);
		var buffergeometry = entry[1];
		//geometry.dispose();

		deleteAttributes( buffergeometry.attributes );
		if (buffergeometry.index) {
			deleteAttribute(buffergeometry.index);
		}
		var property = properties.get( buffergeometry );
		if ( property.wireframe ) deleteAttribute( property.wireframe );

		info.memory.geometries --;
	}

	function get( object ) {

		var geometry = object.geometry;
		var key = geometry.id;

		if(geometries.has(key)) {
			return geometries.get(key);
		}

		// do not add listener, dispose directly
		//geometry.addEventListener( 'dispose', onGeometryDispose );

		var bufferGeometry;
		if ( geometry instanceof THREE.BufferGeometry ) {
			bufferGeometry = geometry;
		} else if ( geometry instanceof THREE.Geometry ) {

			if ( geometry._bufferGeometry === undefined ) {

				geometry._bufferGeometry = new THREE.BufferGeometry().setFromObject( object );
			}

			bufferGeometry = geometry._bufferGeometry;
		}

		geometries.set(key, bufferGeometry);

		info.memory.geometries ++;

		return bufferGeometry;

	}

	function onGeometryDispose( event ) {

		var buffergeometry = event.target;

		deleteAttributes( buffergeometry.attributes );
		if (buffergeometry.index) {
			deleteAttribute(buffergeometry.index);
		}

		//
		//buffergeometry.removeEventListener( 'dispose', onGeometryDispose );

		var property = properties.get( buffergeometry );
		if ( property.wireframe ) deleteAttribute( property.wireframe );

		info.memory.geometries --;

	}

	function getAttributeBuffer( attribute ) {

		if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

			return properties.get( attribute.data ).__webglBuffer;

		}

		return properties.get( attribute ).__webglBuffer;

	}

	function deleteAttribute( attribute ) {

		var buffer = getAttributeBuffer( attribute );

		if ( buffer !== undefined ) {

			gl.deleteBuffer( buffer );
			removeAttributeBuffer( attribute );

		}

	}

	function deleteAttributes( attributes ) {

		for ( var name in attributes ) {

			deleteAttribute( attributes[ name ] );

		}

	}

	function removeAttributeBuffer( attribute ) {

		if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

			properties.delete( attribute.data );

		} else {

			properties.delete( attribute );

		}

	}

	this.get = get;

};

THREE.WebGLObjectsExt = function (gl, properties, info) {

    var geometries = new THREE.WebGLGeometriesExt(gl, properties, info);

    //

    function update(object) {

        // TODO: Avoid updating twice (when using shadowMap). Maybe add frame taskCounter.

        var geometry = geometries.get(object);

        // if (geometry.ticket === this.renderTicket)
        //     return geometry;
        //
        // geometriesTotal++;

        // geometry.ticket = this.renderTicket;

        // if (geometry.using) {
        //     return geometry;
        // }
        //
        // geometry.using = true;

        if (object.geometry instanceof THREE.Geometry) {

            geometry.updateFromObject(object);

        }

        var index = geometry.index;
        var attributes = geometry.attributes;

        if (index !== null) {

            updateAttribute(index, gl.ELEMENT_ARRAY_BUFFER);

        }

        for (var name in attributes) {

            updateAttribute(attributes[name], gl.ARRAY_BUFFER);

        }

        // morph targets

        var morphAttributes = geometry.morphAttributes;

        for (var name in morphAttributes) {

            var array = morphAttributes[name];

            for (var i = 0, l = array.length; i < l; i++) {

                updateAttribute(array[i], gl.ARRAY_BUFFER);

            }

        }

        return geometry;

    }

    function updateAttribute(attribute, bufferType) {

        var data = ( attribute instanceof THREE.InterleavedBufferAttribute ) ? attribute.data : attribute;

        var attributeProperties = properties.get(data);

        if (attributeProperties.__webglBuffer === undefined) {

            createBuffer(attributeProperties, data, bufferType);

        } else if (attributeProperties.version !== data.version) {

            updateBuffer(attributeProperties, data, bufferType);

        }

    }

    function createBuffer(attributeProperties, data, bufferType) {

        attributeProperties.__webglBuffer = gl.createBuffer();
        gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);

        var usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

        gl.bufferData(bufferType, data.array, usage);

        attributeProperties.version = data.version;

    }

    function updateBuffer(attributeProperties, data, bufferType) {

        gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);

        if (data.dynamic === false || data.updateRange.count === -1) {

            // Not using update ranges

            gl.bufferSubData(bufferType, 0, data.array);

        } else if (data.updateRange.count === 0) {

            console.error('THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.');

        } else {

            gl.bufferSubData(bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
                data.array.subarray(data.updateRange.offset, data.updateRange.offset + data.updateRange.count));

            data.updateRange.count = 0; // reset range

        }

        attributeProperties.version = data.version;

    }

    function getAttributeBuffer(attribute) {

        if (attribute instanceof THREE.InterleavedBufferAttribute) {

            return properties.get(attribute.data).__webglBuffer;

        }

        return properties.get(attribute).__webglBuffer;

    }

    function getWireframeAttribute(geometry) {

        var property = properties.get(geometry);

        if (property.wireframe !== undefined) {

            return property.wireframe;

        }

        var indices = [];

        var index = geometry.index;
        var attributes = geometry.attributes;
        var position = attributes.position;

        // console.time( 'wireframe' );

        if (index !== null) {

            var edges = {};
            var array = index.array;

            for (var i = 0, l = array.length; i < l; i += 3) {

                var a = array[i + 0];
                var b = array[i + 1];
                var c = array[i + 2];

                if (checkEdge(edges, a, b)) indices.push(a, b);
                if (checkEdge(edges, b, c)) indices.push(b, c);
                if (checkEdge(edges, c, a)) indices.push(c, a);

            }

        } else {

            var array = attributes.position.array;

            for (var i = 0, l = ( array.length / 3 ) - 1; i < l; i += 3) {

                var a = i + 0;
                var b = i + 1;
                var c = i + 2;

                indices.push(a, b, b, c, c, a);

            }

        }

        // console.timeEnd( 'wireframe' );

        var TypeArray = position.count > 65535 ? Uint32Array : Uint16Array;
        var attribute = new THREE.BufferAttribute(new TypeArray(indices), 1);

        updateAttribute(attribute, gl.ELEMENT_ARRAY_BUFFER);

        property.wireframe = attribute;

        return attribute;

    }

    function checkEdge(edges, a, b) {

        if (a > b) {

            var tmp = a;
            a = b;
            b = tmp;

        }

        var list = edges[a];

        if (list === undefined) {

            edges[a] = [b];
            return true;

        } else if (list.indexOf(b) === -1) {

            list.push(b);
            return true;

        }

        return false;

    }

    this.getAttributeBuffer = getAttributeBuffer;
    this.getWireframeAttribute = getWireframeAttribute;

    this.update = update;

};

CLOUD.RenderGroup = function () {

    var opaqueObjects = [];
    var transparentObjects = [];

    var opaqueObjectsLastIndex = -1;
    var transparentObjectsLastIndex = -1;

    var renderingIdx = 0;
    var opaqueFinished = false;
    var transparentFinished = false;
    var timeStart = 0;
    var timeEnd = 0;
    var timeElapse = 0;

    this.getOpaqueObjects = function () {
        return opaqueObjects;
    };

    this.getTransparentObjects = function () {
        return transparentObjects;
    };

    function painterSortStable(a, b) {
        if ( a.object.renderOrder !== b.object.renderOrder ) {
            return a.object.renderOrder - b.object.renderOrder;
        } else if (a.material.id !== b.material.id) {
            return a.material.id - b.material.id;
        } else if (a.z !== b.z) {
            return a.z - b.z;
        } else {
            return a.id - b.id;
        }
    }

    function painterSortStableZ(a, b) {

        if (a.z !== b.z) {
            return a.z - b.z;
        }
        else if (a.material.id !== b.material.id) {
            return a.material.id - b.material.id;
        }
        else {
            return a.id - b.id;
        }
    }

    function reversePainterSortStable(a, b) {
        if (a.z !== b.z) {
            return b.z - a.z;
        } else {
            return a.id - b.id;
        }
    }

    this.destroy = function () {
        opaqueObjects = [];
        transparentObjects = [];
    };

    this.restart = function () {
        renderingIdx = 0;
        opaqueFinished = false;
        transparentFinished = false;
    };

    this.prepare = function () {
        this.restart();
        opaqueObjectsLastIndex = -1;
        transparentObjectsLastIndex = -1;
    };

    this.renderableCount = function () {
        return opaqueObjectsLastIndex + transparentObjectsLastIndex;
    };

    function isFinished() {
        return opaqueFinished && transparentFinished;
    }

    this.pushRenderItem = function (object, geometry, material, z, group) {

        var array, index;
        if (material.transparent) {
            array = transparentObjects;
            index = ++transparentObjectsLastIndex;

        } else {
            array = opaqueObjects;
            index = ++opaqueObjectsLastIndex;
        }

        // recycle existing render item or grow the array
        var renderItem = array[index];
        if (renderItem !== undefined) {

            renderItem.id = object.id;
            renderItem.object = object;
            renderItem.geometry = geometry;
            renderItem.material = material;
            renderItem.z = z;
            renderItem.group = group;

        } else {
            renderItem = {
                id: object.id,
                object: object,
                geometry: geometry,
                material: material,
                z: z,
                group: group
            };
            // assert( index === array.length );
            //array.push( renderItem );
            array[index] = renderItem;
        }

    };

    this.sortRenderList = function (cullEnd) {

        opaqueObjects.length = opaqueObjectsLastIndex + 1;
        transparentObjects.length = transparentObjectsLastIndex + 1;

        //console.log(opaqueObjects.length + transparentObjects.length);

        if (cullEnd) {
            //console.time("sort");
            opaqueObjects.sort(painterSortStable);
            transparentObjects.sort(reversePainterSortStable);
            //console.timeEnd("sort");
        }
    };

    function renderObjects(renderer, renderList, camera, lights, fog, update) {

        timeStart = Date.now();

        var len = renderList.length;
        var i = renderingIdx;

        for (; i < len; i++) {

            var renderItem = renderList[i];
            var object = renderItem.object;
            var material = renderItem.material;
            var group = renderItem.group;
            var geometry = renderItem.geometry;

            object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
            object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

            renderer.renderBufferDirect(camera, lights, fog, geometry, material, object, group);

            // if ((i % 5000) === 4999) {
            //
            //     timeEnd = Date.now();
            //     timeElapse = timeEnd - timeStart;
            //
            //     if (timeElapse > CLOUD.GlobalData.LimitFrameTime) {
            //
            //         renderingIdx = i + 1;
            //         return false;
            //     }
            // }

            timeEnd = Date.now();
            timeElapse = timeEnd - timeStart;

            if (timeElapse > CLOUD.GlobalData.LimitFrameTime) {

                //console.log("timeElapse", [timeElapse, i]);

                renderingIdx = i + 1;
                return false;
            }
        }

        renderingIdx = 0;
        return true;
    }

    this.renderOpaqueObjects = function (renderer, camera, lights, fog, update) {

        if (!opaqueFinished) {
            opaqueFinished = renderObjects(renderer, opaqueObjects, camera, lights, fog, update);
        }

        return opaqueFinished;
    };

    this.renderTransparentObjects = function (renderer, camera, lights, fog, update) {

        if (!transparentFinished) {
            transparentFinished = renderObjects(renderer, transparentObjects, camera, lights, fog, update);
        }

        return transparentFinished;
    };
};

CLOUD.OrderedRenderer = function () {

    // increment culling
    var _cullTicket = 0;
    var _isIncrementalCullFinish = false,
        _isIncrementalRenderFinish = false;
    var _countCullingObject = 0;
    var _countScreenCullOff = 0;
    var _timeStartCull = 0;

    var _renderTicket = 0;

    var _renderGroups = [];

    var _frustum = null;
    var _projScreenMatrix = null;

    var _vector3 = new THREE.Vector3();

    var _isUpdateObjectList = true;
    var _dirtyIncrementList = true;

    var _filterObject = null;

    this.updateObjectList = function (isUpdate) {
        _isUpdateObjectList = isUpdate;
    };

    this.destroy = function () {

        for (var ii = 0, len = _renderGroups.length; ii < len; ++ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                group.destroy();
            }
        }

    };

    this.restart = function () {

        for (var ii = 0, len = _renderGroups.length; ii < len; ++ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                group.restart();
            }
        }

        _countCullingObject = 0;
        _countScreenCullOff = 0;
        _dirtyIncrementList = true;
        _isIncrementalCullFinish = true;
    };

    this.setFilter = function (filter) {
        _filterObject = filter;
    };

    function prepareNewFrame() {

        ++_cullTicket;
        if (_cullTicket > 100000)
            _cullTicket = 0;

        for (var ii = 0, len = _renderGroups.length; ii < len; ++ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                group.prepare();
            }
        }
    }

    function computeRenderableCount() {

        var totalCount = 0;
        for (var ii = 0, len = _renderGroups.length; ii < len; ++ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                totalCount += group.renderableCount();
            }
        }
        return totalCount;
    }

    function pushRenderItem(object, geometry, material, z) {

        var renderGroup = _renderGroups[object.renderOrder];
        if (renderGroup === undefined) {
            renderGroup = new CLOUD.RenderGroup();
            _renderGroups[object.renderOrder] = renderGroup;
        }

        renderGroup.pushRenderItem(object, geometry, material, z, null);
    }


    function computeObjectCenter(object) {

        object.modelCenter = new THREE.Vector3();

        if (object.boundingBox) {

            object.boundingBox.center(object.modelCenter);
            object.modelCenter.applyMatrix4(object.matrixWorld);

            _vector3.copy(object.boundingBox.min);
            _vector3.applyMatrix4(object.matrixWorld);

            object.radius = object.modelCenter.distanceTo(_vector3);
        }
        else {

            object.modelCenter.setFromMatrixPosition(object.matrixWorld);

        }
    }

    function sortRenderList() {

        for (var ii = 0, len = _renderGroups.length; ii < len; ++ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                group.sortRenderList(_isIncrementalCullFinish);
            }

        }
    }

    // function projectObject(object, camera) {
    //
    //     if (object.visible === false)
    //         return true;
    //
    //     if (_filterObject.isFileFilter(object)) {
    //         return true;
    //     } else if (object._cullTicket != _cullTicket /*&& (object.channels.mask & camera.channels.mask) !== 0*/) {
    //         ++_countCullingObject;
    //
    //         if (_countCullingObject % 5000 == 4999) {
    //             var diff = Date.now() - _timeStartCull;
    //             if (diff > 30)
    //                 return false;
    //         }
    //
    //         object._cullTicket = _cullTicket;
    //
    //         if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
    //
    //             if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {
    //
    //                 // if (!_filterObject.isVisible(object)) {
    //                 //     return true;
    //                 // }
    //
    //                 // if (object.renderOrder <= 5) {
    //                 //     //
    //                 //     // if (!object.modelCenter) {
    //                 //     //     computeObjectCenter(object);
    //                 //     // }
    //                 //     //
    //                 //     // if (object.radius !== undefined) {
    //                 //     //
    //                 //     //     _vector3.copy(object.modelCenter);
    //                 //     //     _vector3.applyProjection(_projScreenMatrix);
    //                 //     //     // _vector3End.copy(camera.realUp);
    //                 //     //     // _vector3End.multiplyScalar(object.radius).add(object.modelCenter);
    //                 //     //     //
    //                 //     //     // _vector3End.applyProjection(_projScreenMatrix);
    //                 //     //
    //                 //     //     // var sqrtDist = _vector3End.distanceTo(_vector3) * 10;
    //                 //     //     // if (sqrtDist < CLOUD.GlobalData.ScreenCullLOD) {
    //                 //     //     //     ++_countScreenCullOff;
    //                 //     //     //     return true;
    //                 //     //     // }
    //                 //     //
    //                 //     // }
    //                 //     // else {
    //                 //     //     _vector3.copy(object.modelCenter);
    //                 //     //     _vector3.applyProjection(_projScreenMatrix);
    //                 //     // }
    //                 // }
    //
    //                 _vector3.setFromMatrixPosition( object.matrixWorld );
    //                 _vector3.applyProjection( _projScreenMatrix );
    //
    //                 // 材质过滤
    //                 // var material = _filterObject.getOverridedMaterial(object);
    //                 // material = material || object.material;
    //
    //                 var material = object.material;
    //
    //                 // //var geometry = objects.update(object);
    //                 var geometry = object.geometry;
    //                 // if (geometry instanceof THREE.Geometry) {
    //                 //     geometry = geometry._bufferGeometry;
    //                 // }
    //
    //                 pushRenderItem(object, geometry, material, _vector3.z);
    //
    //             }
    //         }
    //     }
    //
    //     var children = object.children;
    //     if (children) {
    //         for (var i = 0, l = children.length; i < l; i++) {
    //
    //             if (!projectObject(children[i], camera))
    //                 return false;
    //
    //         }
    //     }
    //
    //     return true;
    // }

    function projectObject(object, camera) {

        if (object.visible === false)
            return true;

        if (object._cullTicket != _cullTicket /*&& (object.channels.mask & camera.channels.mask) !== 0*/) {

            ++_countCullingObject;

            // TODO: incrmental bug fixing
            // if (_countCullingObject % 5000 == 4999) {
                var diff = Date.now() - _timeStartCull;
                if (diff > 30) {
                    return false;
                }

            // }

            object._cullTicket = _cullTicket;

            if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {

                if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {

                    _vector3.setFromMatrixPosition( object.matrixWorld );
                    _vector3.applyProjection( _projScreenMatrix );

                    var material = object.material;
                    var geometry = object.geometry;

                    pushRenderItem(object, geometry, material, _vector3.z);

                }
            }
        }

        var children = object.children;
        if (children) {
            for (var i = 0, l = children.length; i < l; i++) {

                if (!projectObject(children[i], camera))
                    return false;

            }
        }

        return true;
    }

    function projectLights(scene, lights) {

        lights.length = 0;

        var children = scene.children;

        for (var i = 0, l = children.length; i < l; i++) {

            var object = children[i];
            if (object instanceof THREE.Light) {

                lights.push(object);

            }

        }
    }

    function buildObjectList(scene, camera, lights) {

        if (!_isUpdateObjectList) {
            _isIncrementalCullFinish = true;
            return;
        }

        if (_isIncrementalCullFinish) {

            prepareNewFrame();
            projectLights(scene, lights);
        }

        _timeStartCull = Date.now();

        //console.time("projectObject");
        _isIncrementalCullFinish = projectObject(scene, camera);
        //console.timeEnd("projectObject");
        //console.log("screen cull off: " + _screenCullOffCount);
        sortRenderList();
    }

    this.update = function (frustum, projScreenMatrix) {
        _projScreenMatrix = projScreenMatrix;
        _frustum = frustum;
    };

    function updateRenderTicket() {

        if (!_isUpdateObjectList || _dirtyIncrementList) {
            ++_renderTicket;
        }
        //else {
        //    console.log(_renderTicket);
        //}
        if (_renderTicket > 10000)
            _renderTicket = 0;
    }

    this.render = function (renderer, scene, camera, lights, renderTarget, forceClear, state) {

        updateRenderTicket();

        if (_dirtyIncrementList) {

            // console.log("  build");
            buildObjectList(scene, camera, lights);

            if (!_isIncrementalCullFinish)
                return false;
            else {
                forceClear = true;
                _dirtyIncrementList = false;

                //var count = computeRenderableCount();
                //console.log("renderable " + count);
            }

            renderer.setRenderTarget(renderTarget);
        }

        //console.log("  render");
        if (renderer.autoClear || forceClear) {
            renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil, _isUpdateObjectList);
        }

        var fog = scene.fog;

        renderer.setRenderTicket(_renderTicket);

        state.setBlending(THREE.NoBlending);

        // TODO: incrmental bug fixing
         //_isIncrementalRenderFinish = true; //

        for (var ii = _renderGroups.length - 1; ii >= 0; --ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                _isIncrementalRenderFinish = group.renderOpaqueObjects(renderer, camera, lights, fog, _isUpdateObjectList);
                if (!_isIncrementalRenderFinish)
                    break;
            }
        }

        if (_isIncrementalRenderFinish) {

            for (var ii = _renderGroups.length - 1; ii >= 0; --ii) {
                var group = _renderGroups[ii];
                if (group !== undefined) {
                    _isIncrementalRenderFinish = group.renderTransparentObjects(renderer, camera, lights, fog);
                    if (!_isIncrementalRenderFinish)
                        break;
                }
            }
        }

        // Ensure depth buffer writing is enabled so it can be cleared on next render
        state.setDepthTest(true);
        state.setDepthWrite(true);
        state.setColorWrite(true);

        return _isIncrementalRenderFinish;

    };

    this.computeSelectionBBox = function () {

        if (_filterObject === null)
            return null;

        if (_filterObject.isSelectionSetEmpty())
            return null;

        _filterObject.resetSelectionBox();

        for (var ii = _renderGroups.length - 1; ii >= 0; --ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                _filterObject.computeSelectionBox(group.getOpaqueObjects());
                _filterObject.computeSelectionBox(group.getTransparentObjects());
            }
        }

        return _filterObject.getSelectionBox();
    };

    this.computeRenderObjectsBox = function () {
        var box = new THREE.Box3();
        for (var ii = _renderGroups.length - 1; ii >= 0; --ii) {
            var group = _renderGroups[ii];
            if (group !== undefined) {
                var opaqueBox = _filterObject.computeRenderObjectsBox(group.getOpaqueObjects());
                if (!opaqueBox.empty()) {
                    box.expandByPoint(opaqueBox.min);
                    box.expandByPoint(opaqueBox.max);
                }

                var transparentBox = _filterObject.computeRenderObjectsBox(group.getTransparentObjects());
                if (!transparentBox.empty()) {
                    box.expandByPoint(transparentBox.min);
                    box.expandByPoint(transparentBox.max);
                }
            }
        }

        return box;
    };
};
/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.WebGLIncrementRenderer = function (parameters) {

    //console.log( 'THREE.WebGLIncrementRenderer', THREE.REVISION );

    parameters = parameters || {};

    var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement('canvas'),
        _context = parameters.context !== undefined ? parameters.context : null,

        _width = _canvas.width,
        _height = _canvas.height,

        pixelRatio = 1,

        _alpha = parameters.alpha !== undefined ? parameters.alpha : false,
        _depth = parameters.depth !== undefined ? parameters.depth : true,
        _stencil = parameters.stencil !== undefined ? parameters.stencil : true,
        _antialias = parameters.antialias !== undefined ? parameters.antialias : false,
        _premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
        _preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,

        _clearColor = new THREE.Color(0x000000),
        _clearAlpha = 0;

    var lights = [];

    // var opaqueObjects = [];
    // var opaqueObjectsLastIndex = -1;
    // var transparentObjects = [];
    // var transparentObjectsLastIndex = -1;
    //
    // var morphInfluences = new Float32Array(8);


    var sprites = [];
    var lensFlares = [];

    // public properties

    this.domElement = _canvas;
    this.context = null;

    // clearing

    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;

    // scene graph

    this.sortObjects = true;

    // physically based shading

    this.gammaFactor = 2.0;	// for backwards compatibility
    this.gammaInput = false;
    this.gammaOutput = false;

    // morphs

    this.maxMorphTargets = 8;
    this.maxMorphNormals = 4;

    // flags

    this.autoScaleCubemaps = true;

    // internal properties

    var _this = this,

        // internal state cache

        _currentProgram = null,
        _currentFramebuffer = null,
        _currentMaterialId = -1,
        _currentGeometryProgram = '',
        _currentCamera = null,

        _usedTextureUnits = 0,

        _viewportX = 0,
        _viewportY = 0,
        _viewportWidth = _canvas.width,
        _viewportHeight = _canvas.height,
        _currentWidth = 0,
        _currentHeight = 0,

        // frustum

        _frustum = new THREE.Frustum(),

        // camera matrices cache

        _projScreenMatrix = new THREE.Matrix4(),

        _vector3 = new THREE.Vector3(),

        // light arrays cache

        _direction = new THREE.Vector3(),

        _lightsNeedUpdate = true,

        _lights = {

            ambient: [0, 0, 0],
            directional: {length: 0, colors: [], positions: []},
            point: {length: 0, colors: [], positions: [], distances: [], decays: []},
            spot: {
                length: 0,
                colors: [],
                positions: [],
                distances: [],
                directions: [],
                anglesCos: [],
                exponents: [],
                decays: []
            },
            hemi: {length: 0, skyColors: [], groundColors: [], positions: []}

        },

        // info

        _infoMemory = {

            geometries: 0,
            textures: 0

        },

        _infoRender = {

            calls: 0,
            vertices: 0,
            faces: 0,
            points: 0

        };

    this.info = {

        render: _infoRender,
        memory: _infoMemory,
        programs: null

    };


    // initialize

    var _gl;

    try {

        var attributes = {
            alpha: _alpha,
            depth: _depth,
            stencil: _stencil,
            antialias: _antialias,
            premultipliedAlpha: _premultipliedAlpha,
            preserveDrawingBuffer: _preserveDrawingBuffer
        };

        _gl = _context || _canvas.getContext('webgl', attributes) || _canvas.getContext('experimental-webgl', attributes);

        if (_gl === null) {

            if (_canvas.getContext('webgl') !== null) {

                throw 'Error creating WebGL context with your selected attributes.';

            } else {

                throw 'Error creating WebGL context.';

            }

        }

        _canvas.addEventListener('webglcontextlost', onContextLost, false);

    } catch (error) {

        console.error('THREE.WebGLRenderer: ' + error);

    }

    var extensions = new THREE.WebGLExtensions(_gl);

    extensions.get('OES_texture_float');
    extensions.get('OES_texture_float_linear');
    extensions.get('OES_texture_half_float');
    extensions.get('OES_texture_half_float_linear');
    extensions.get('OES_standard_derivatives');
    extensions.get('ANGLE_instanced_arrays');

    if (extensions.get('OES_element_index_uint')) {

        THREE.BufferGeometry.MaxIndex = 4294967296;

    }

    var capabilities = new THREE.WebGLCapabilities(_gl, extensions, parameters);

    var state = new THREE.WebGLState(_gl, extensions, paramThreeToGL);
    var properties = new THREE.WebGLProperties();
    var objects = new THREE.WebGLObjectsExt(_gl, properties, this.info);
    var programCache = new THREE.WebGLPrograms(this, capabilities);

    this.info.programs = programCache.programs;

    var bufferRenderer = new THREE.WebGLBufferRenderer(_gl, extensions, _infoRender);
    var indexedBufferRenderer = new THREE.WebGLIndexedBufferRenderer(_gl, extensions, _infoRender);

    //

    function glClearColor(r, g, b, a) {

        if (_premultipliedAlpha === true) {

            r *= a;
            g *= a;
            b *= a;

        }

        _gl.clearColor(r, g, b, a);

    }

    function setDefaultGLState() {

        state.init();

        _gl.viewport(_viewportX, _viewportY, _viewportWidth, _viewportHeight);

        glClearColor(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha);

    }

    function resetGLState() {

        _currentProgram = null;
        _currentCamera = null;

        _currentGeometryProgram = '';
        _currentMaterialId = -1;

        _lightsNeedUpdate = true;

        state.reset();

    }

    setDefaultGLState();

    this.context = _gl;
    this.capabilities = capabilities;
    this.extensions = extensions;
    this.state = state;

    // shadow map

    //var shadowMap = new THREE.WebGLShadowMap( this, lights, objects );

    // LIWEI: Shadow is disabled here.
    var shadowMap = new THREE.WebGLShadowMap(this, lights);
    this.shadowMap = shadowMap;


    // Plugins

    // var spritePlugin = new THREE.SpritePlugin(this, sprites);
    // var lensFlarePlugin = new THREE.LensFlarePlugin(this, lensFlares);

    // API

    this.getContext = function () {

        return _gl;

    };

    this.getContextAttributes = function () {

        return _gl.getContextAttributes();

    };

    this.forceContextLoss = function () {

        extensions.get('WEBGL_lose_context').loseContext();

    };

    this.getMaxAnisotropy = (function () {

        var value;

        return function getMaxAnisotropy() {

            if (value !== undefined) return value;

            var extension = extensions.get('EXT_texture_filter_anisotropic');

            if (extension !== null) {

                value = _gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

            } else {

                value = 0;

            }

            return value;

        }

    })();

    this.getPrecision = function () {

        return capabilities.precision;

    };

    this.getPixelRatio = function () {

        return pixelRatio;

    };

    this.setPixelRatio = function (value) {

        if (value !== undefined) pixelRatio = value;

    };

    this.getSize = function () {

        return {
            width: _width,
            height: _height
        };

    };

    this.setSize = function (width, height, updateStyle) {

        _width = width;
        _height = height;

        _canvas.width = width * pixelRatio;
        _canvas.height = height * pixelRatio;

        if (updateStyle !== false) {

            _canvas.style.width = width + 'px';
            _canvas.style.height = height + 'px';

        }

        this.setViewport(0, 0, width, height);

    };

    this.setViewport = function (x, y, width, height) {

        _viewportX = x * pixelRatio;
        _viewportY = y * pixelRatio;

        _viewportWidth = width * pixelRatio;
        _viewportHeight = height * pixelRatio;

        _gl.viewport(_viewportX, _viewportY, _viewportWidth, _viewportHeight);

    };

    this.getViewport = function (dimensions) {

        dimensions.x = _viewportX / pixelRatio;
        dimensions.y = _viewportY / pixelRatio;

        dimensions.z = _viewportWidth / pixelRatio;
        dimensions.w = _viewportHeight / pixelRatio;

    };

    this.setScissor = function (x, y, width, height) {

        _gl.scissor(
            x * pixelRatio,
            y * pixelRatio,
            width * pixelRatio,
            height * pixelRatio
        );

    };

    this.enableScissorTest = function (boolean) {

        state.setScissorTest(boolean);

    };

    // Clearing

    this.getClearColor = function () {

        return _clearColor;

    };

    this.setClearColor = function (color, alpha) {

        _clearColor.set(color);

        _clearAlpha = alpha !== undefined ? alpha : 1;

        glClearColor(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha);

    };

    this.getClearAlpha = function () {

        return _clearAlpha;

    };

    this.setClearAlpha = function (alpha) {

        _clearAlpha = alpha;

        glClearColor(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha);

    };

    this.clear = function (color, depth, stencil) {

        var bits = 0;

        if (color === undefined || color) bits |= _gl.COLOR_BUFFER_BIT;
        if (depth === undefined || depth) bits |= _gl.DEPTH_BUFFER_BIT;
        if (stencil === undefined || stencil) bits |= _gl.STENCIL_BUFFER_BIT;

        _gl.clear(bits);

    };

    this.clearColor = function () {

        _gl.clear(_gl.COLOR_BUFFER_BIT);

    };

    this.clearDepth = function () {

        _gl.clear(_gl.DEPTH_BUFFER_BIT);

    };

    this.clearStencil = function () {

        _gl.clear(_gl.STENCIL_BUFFER_BIT);

    };

    this.clearTarget = function (renderTarget, color, depth, stencil) {

        this.setRenderTarget(renderTarget);
        this.clear(color, depth, stencil);

    };

    // Reset

    this.resetGLState = resetGLState;

    this.dispose = function () {

        _canvas.removeEventListener('webglcontextlost', onContextLost, false);

    };

    // Events

    function onContextLost(event) {

        event.preventDefault();

        resetGLState();
        setDefaultGLState();

        properties.clear();

    };

    function onTextureDispose(event) {

        var texture = event.target;

        texture.removeEventListener('dispose', onTextureDispose);

        deallocateTexture(texture);

        _infoMemory.textures--;


    }

    function onRenderTargetDispose(event) {

        var renderTarget = event.target;

        renderTarget.removeEventListener('dispose', onRenderTargetDispose);

        deallocateRenderTarget(renderTarget);

        _infoMemory.textures--;

    }

    function onMaterialDispose(event) {

        var material = event.target;

        material.removeEventListener('dispose', onMaterialDispose);

        deallocateMaterial(material);

    }

    // Buffer deallocation

    function deallocateTexture(texture) {

        var textureProperties = properties.get(texture);

        if (texture.image && textureProperties.__image__webglTextureCube) {

            // cube texture

            _gl.deleteTexture(textureProperties.__image__webglTextureCube);

        } else {

            // 2D texture

            if (textureProperties.__webglInit === undefined) return;

            _gl.deleteTexture(textureProperties.__webglTexture);

        }

        // remove all webgl properties
        properties.delete(texture);

    }

    function deallocateRenderTarget(renderTarget) {

        var renderTargetProperties = properties.get(renderTarget);
        var textureProperties = properties.get(renderTarget.texture);

        if (!renderTarget || textureProperties.__webglTexture === undefined) return;

        _gl.deleteTexture(textureProperties.__webglTexture);

        if (renderTarget instanceof THREE.WebGLRenderTargetCube) {

            for (var i = 0; i < 6; i++) {

                _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
                _gl.deleteRenderbuffer(renderTargetProperties.__webglRenderbuffer[i]);

            }

        } else {

            _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
            _gl.deleteRenderbuffer(renderTargetProperties.__webglRenderbuffer);

        }

        properties.delete(renderTarget.texture);
        properties.delete(renderTarget);

    }

    function deallocateMaterial(material) {

        releaseMaterialProgramReference(material);

        properties.delete(material);

    }

    function releaseMaterialProgramReference(material) {

        var programInfo = properties.get(material).program;

        material.program = undefined;

        if (programInfo !== undefined) {

            programCache.releaseProgram(programInfo);

        }

    }

    // Buffer rendering

    this.renderBufferImmediate = function (object, program, material) {

        state.initAttributes();

        var buffers = properties.get(object);

        if (object.hasPositions && !buffers.position) buffers.position = _gl.createBuffer();
        if (object.hasNormals && !buffers.normal) buffers.normal = _gl.createBuffer();
        if (object.hasUvs && !buffers.uv) buffers.uv = _gl.createBuffer();
        if (object.hasColors && !buffers.color) buffers.color = _gl.createBuffer();

        var attributes = program.getAttributes();

        if (object.hasPositions) {

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffers.position);
            _gl.bufferData(_gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW);

            state.enableAttribute(attributes.position);
            _gl.vertexAttribPointer(attributes.position, 3, _gl.FLOAT, false, 0, 0);

        }

        if (object.hasNormals) {

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffers.normal);

            if (material.type !== 'MeshPhongMaterial' && material.shading === THREE.FlatShading) {

                for (var i = 0, l = object.count * 3; i < l; i += 9) {

                    var array = object.normalArray;

                    var nx = ( array[i + 0] + array[i + 3] + array[i + 6] ) / 3;
                    var ny = ( array[i + 1] + array[i + 4] + array[i + 7] ) / 3;
                    var nz = ( array[i + 2] + array[i + 5] + array[i + 8] ) / 3;

                    array[i + 0] = nx;
                    array[i + 1] = ny;
                    array[i + 2] = nz;

                    array[i + 3] = nx;
                    array[i + 4] = ny;
                    array[i + 5] = nz;

                    array[i + 6] = nx;
                    array[i + 7] = ny;
                    array[i + 8] = nz;

                }

            }

            _gl.bufferData(_gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW);

            state.enableAttribute(attributes.normal);

            _gl.vertexAttribPointer(attributes.normal, 3, _gl.FLOAT, false, 0, 0);

        }

        if (object.hasUvs && material.map) {

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffers.uv);
            _gl.bufferData(_gl.ARRAY_BUFFER, object.uvArray, _gl.DYNAMIC_DRAW);

            state.enableAttribute(attributes.uv);

            _gl.vertexAttribPointer(attributes.uv, 2, _gl.FLOAT, false, 0, 0);

        }

        if (object.hasColors && material.vertexColors !== THREE.NoColors) {

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffers.color);
            _gl.bufferData(_gl.ARRAY_BUFFER, object.colorArray, _gl.DYNAMIC_DRAW);

            state.enableAttribute(attributes.color);

            _gl.vertexAttribPointer(attributes.color, 3, _gl.FLOAT, false, 0, 0);

        }

        state.disableUnusedAttributes();

        _gl.drawArrays(_gl.TRIANGLES, 0, object.count);

        object.count = 0;

    };

    this.renderBufferDirect = function (camera, lights, fog, geometry, material, object, group) {

        // if (!geometry)
        //     geometry = objects.update(object);

        geometry = objects.update(object);

        setMaterial(material);

        var program = setProgram(camera, lights, fog, material, object);

        var updateBuffers = false;

        //var geometryProgram = geometry.id + "_"  + program.id + "_" + material.wireframe;
        // Performance fixing: so far we do not have wireframe yet, using number(short string) is faster than long string.
        var geometryProgram = geometry.id + program.id;
        if (geometryProgram !== _currentGeometryProgram) {

            _currentGeometryProgram = geometryProgram;
            updateBuffers = true;
        }

        //// morph targets

        //var morphTargetInfluences = object.morphTargetInfluences;

        //if ( morphTargetInfluences !== undefined ) {

        //    var activeInfluences = [];

        //    for ( var i = 0, l = morphTargetInfluences.length; i < l; i ++ ) {

        //        var influence = morphTargetInfluences[ i ];
        //        activeInfluences.push( [ influence, i ] );

        //    }

        //    activeInfluences.sort( numericalSort );

        //    if ( activeInfluences.length > 8 ) {

        //        activeInfluences.length = 8;

        //    }

        //    var morphAttributes = geometry.morphAttributes;

        //    for ( var i = 0, l = activeInfluences.length; i < l; i ++ ) {

        //        var influence = activeInfluences[ i ];
        //        morphInfluences[ i ] = influence[ 0 ];

        //        if ( influence[ 0 ] !== 0 ) {

        //            var index = influence[ 1 ];

        //            if ( material.morphTargets === true && morphAttributes.position ) geometry.addAttribute( 'morphTarget' + i, morphAttributes.position[ index ] );
        //            if ( material.morphNormals === true && morphAttributes.normal ) geometry.addAttribute( 'morphNormal' + i, morphAttributes.normal[ index ] );

        //        } else {

        //            if ( material.morphTargets === true ) geometry.removeAttribute( 'morphTarget' + i );
        //            if ( material.morphNormals === true ) geometry.removeAttribute( 'morphNormal' + i );

        //        }

        //    }

        //    var uniforms = program.getUniforms();

        //    if ( uniforms.morphTargetInfluences !== null ) {

        //        _gl.uniform1fv( uniforms.morphTargetInfluences, morphInfluences );

        //    }

        //    updateBuffers = true;

        //}

        //

        var index = geometry.index;
        var position = geometry.attributes.position;

        //if ( material.wireframe === true ) {

        //    index = objects.getWireframeAttribute( geometry );

        //}

        var renderer;

        if (index !== null) {

            renderer = indexedBufferRenderer;
            renderer.setIndex(index);

        } else {

            renderer = bufferRenderer;

        }

        if (updateBuffers) {

            setupVertexAttributes(material, program, geometry);

            if (index !== null) {

                _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, objects.getAttributeBuffer(index));

            }

        }

        //

        // var dataStart = 0;
        var dataCount = Infinity;

        if (index !== null) {

            dataCount = index.count

        } else if (position !== undefined) {

            dataCount = position.count;

        }

        //var rangeStart = geometry.drawRange.start;
        //var rangeCount = geometry.drawRange.count;

        //var groupStart = group !== null ? group.start : 0;
        //var groupCount = group !== null ? group.count : Infinity;

        //var drawStart = Math.max( dataStart, rangeStart, groupStart );
        //var drawEnd = Math.min( dataStart + dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

        //var drawCount = Math.max( 0, drawEnd - drawStart + 1 );

        var drawStart = 0;
        var drawCount = dataCount;

        if (object instanceof THREE.Mesh) {

            if (material.wireframe === true) {

                state.setLineWidth(material.wireframeLinewidth * pixelRatio);
                renderer.setMode(_gl.LINES);

            } else {

                renderer.setMode(_gl.TRIANGLES);

            }

            if (geometry instanceof THREE.InstancedBufferGeometry && geometry.maxInstancedCount > 0) {

                renderer.renderInstances(geometry);

            } else {

                renderer.render(drawStart, drawCount);

            }

        } else if (object instanceof THREE.Line) {

            var lineWidth = material.linewidth;

            if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

            state.setLineWidth(lineWidth * pixelRatio);

            if (object instanceof THREE.LineSegments) {

                renderer.setMode(_gl.LINES);

            } else {

                renderer.setMode(_gl.LINE_STRIP);

            }

            renderer.render(drawStart, drawCount);

        } else if (object instanceof THREE.Points) {

            renderer.setMode(_gl.POINTS);
            renderer.render(drawStart, drawCount);

        }

    };

    function setupVertexAttributes(material, program, geometry, startIndex) {

        // var extension;

        //if ( geometry instanceof THREE.InstancedBufferGeometry ) {

        //    extension = extensions.get( 'ANGLE_instanced_arrays' );

        //    if ( extension === null ) {

        //		console.error( 'THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
        //        return;

        //    }

        //}

        // Performance Fixing
        //if (startIndex === undefined) startIndex = 0;
        startIndex = startIndex || 0;
        //if(typeof (startIndex) === "undefined") {
        //    startIndex = 0;
        //}

        state.initAttributes();

        var geometryAttributes = geometry.attributes;

        var programAttributes = program.getAttributes();

        var materialDefaultAttributeValues = material.defaultAttributeValues;

        for (var name in programAttributes) {

            var programAttribute = programAttributes[name];

            if (programAttribute >= 0) {

                var geometryAttribute = geometryAttributes[name];

                if (geometryAttribute !== undefined) {

                    var size = geometryAttribute.itemSize;
                    var buffer = objects.getAttributeBuffer(geometryAttribute);

                    var type = _gl.FLOAT;
                    var array = geometryAttribute.array;
                    var normalized = geometryAttribute.normalized;

                    if (array instanceof Float32Array) {

                        type = _gl.FLOAT;

                    } else if (array instanceof Float64Array) {

                        console.warn("Unsupported data buffer format: Float64Array");

                    } else if (array instanceof Uint16Array) {

                        type = _gl.UNSIGNED_SHORT;

                    } else if (array instanceof Int16Array) {

                        type = _gl.SHORT;

                    } else if (array instanceof Uint32Array) {

                        type = _gl.UNSIGNED_INT;

                    } else if (array instanceof Int32Array) {

                        type = _gl.INT;

                    } else if (array instanceof Int8Array) {

                        type = _gl.BYTE;

                    } else if (array instanceof Uint8Array) {

                        type = _gl.UNSIGNED_BYTE;

                    }

                    //if ( geometryAttribute instanceof THREE.InterleavedBufferAttribute ) {

                    //    var data = geometryAttribute.data;
                    //    var stride = data.stride;
                    //    var offset = geometryAttribute.offset;

                    //    if ( data instanceof THREE.InstancedInterleavedBuffer ) {

                    //        state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute, extension );

                    //        if ( geometry.maxInstancedCount === undefined ) {

                    //            geometry.maxInstancedCount = data.meshPerAttribute * data.count;

                    //        }

                    //    } else {

                    //        state.enableAttribute( programAttribute );

                    //    }

                    //    _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
                    //    _gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, stride * data.array.BYTES_PER_ELEMENT, ( startIndex * stride + offset ) * data.array.BYTES_PER_ELEMENT );

                    //}
                    //else
                    {

                        //if ( geometryAttribute instanceof THREE.InstancedBufferAttribute ) {

                        //    state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute, extension );

                        //    if ( geometry.maxInstancedCount === undefined ) {

                        //        geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

                        //    }

                        //}
                        //else
                        {

                            state.enableAttribute(programAttribute);

                        }

                        _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
                        _gl.vertexAttribPointer(programAttribute, size, type, false, 0, startIndex * size * array.BYTES_PER_ELEMENT); // 4 bytes per Float32

                    }

                } else if (materialDefaultAttributeValues !== undefined) {

                    var value = materialDefaultAttributeValues[name];

                    if (value !== undefined) {

                        switch (value.length) {

                            case 2:
                                _gl.vertexAttrib2fv(programAttribute, value);
                                break;

                            case 3:
                                _gl.vertexAttrib3fv(programAttribute, value);
                                break;

                            case 4:
                                _gl.vertexAttrib4fv(programAttribute, value);
                                break;

                            default:
                                _gl.vertexAttrib1fv(programAttribute, value);

                        }

                    }

                }

            }

        }

        state.disableUnusedAttributes();

    }

    // Sorting

    // function numericalSort(a, b) {
    //
    //     return b[0] - a[0];
    //
    // }

    // function painterSortStable(a, b) {
    //
    //     if (a.object.renderOrder !== b.object.renderOrder) {
    //
    //         return a.object.renderOrder - b.object.renderOrder;
    //
    //     } else if (a.material.id !== b.material.id) {
    //
    //         return a.material.id - b.material.id;
    //
    //     } else if (a.z !== b.z) {
    //
    //         return a.z - b.z;
    //
    //     } else {
    //
    //         return a.id - b.id;
    //
    //     }
    //
    // }

    // function reversePainterSortStable(a, b) {
    //
    //     if (a.object.renderOrder !== b.object.renderOrder) {
    //
    //         return a.object.renderOrder - b.object.renderOrder;
    //
    //     }
    //     if (a.z !== b.z) {
    //
    //         return b.z - a.z;
    //
    //     } else {
    //
    //         return a.id - b.id;
    //
    //     }
    //
    // }

    // Rendering

    // this.render = function (scene, camera, renderTarget, forceClear) {
    //
    //     if (camera instanceof THREE.Camera === false) {
    //
    //         console.error('THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.');
    //         return;
    //
    //     }
    //
    //     var fog = scene.fog;
    //
    //     // reset caching for this frame
    //
    //     _currentGeometryProgram = '';
    //     _currentMaterialId = -1;
    //     _currentCamera = null;
    //     _lightsNeedUpdate = true;
    //
    //     // update scene graph
    //
    //     if (scene.autoUpdate === true) scene.updateMatrixWorld();
    //
    //     // update camera matrices and frustum
    //
    //     if (camera.parent === null) camera.updateMatrixWorld();
    //
    //     camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    //
    //     _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    //     _frustum.setFromMatrix(_projScreenMatrix);
    //
    //     lights.length = 0;
    //
    //     opaqueObjectsLastIndex = -1;
    //     transparentObjectsLastIndex = -1;
    //
    //     sprites.length = 0;
    //     lensFlares.length = 0;
    //
    //     projectObject(scene, camera);
    //
    //     opaqueObjects.length = opaqueObjectsLastIndex + 1;
    //     transparentObjects.length = transparentObjectsLastIndex + 1;
    //
    //     if (_this.sortObjects === true) {
    //
    //         opaqueObjects.sort(painterSortStable);
    //         transparentObjects.sort(reversePainterSortStable);
    //
    //     }
    //
    //     //
    //
    //     shadowMap.render(scene);
    //
    //     //
    //
    //     _infoRender.calls = 0;
    //     _infoRender.vertices = 0;
    //     _infoRender.faces = 0;
    //     _infoRender.points = 0;
    //
    //     this.setRenderTarget(renderTarget);
    //
    //     if (this.autoClear || forceClear) {
    //
    //         this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
    //
    //     }
    //
    //     //
    //
    //     if (scene.overrideMaterial) {
    //
    //         var overrideMaterial = scene.overrideMaterial;
    //
    //         renderObjects(opaqueObjects, camera, lights, fog, overrideMaterial);
    //         renderObjects(transparentObjects, camera, lights, fog, overrideMaterial);
    //
    //     } else {
    //
    //         // opaque pass (front-to-back order)
    //
    //         state.setBlending(THREE.NoBlending);
    //         renderObjects(opaqueObjects, camera, lights, fog);
    //
    //         // transparent pass (back-to-front order)
    //
    //         renderObjects(transparentObjects, camera, lights, fog);
    //
    //     }
    //
    //     // custom render plugins (post pass)
    //
    //     spritePlugin.render(scene, camera);
    //     lensFlarePlugin.render(scene, camera, _currentWidth, _currentHeight);
    //
    //     // Generate mipmap if we're using any kind of mipmap filtering
    //
    //     if (renderTarget) {
    //
    //         var texture = renderTarget.texture;
    //         var isTargetPowerOfTwo = isPowerOfTwo(renderTarget);
    //         if (texture.generateMipmaps && isTargetPowerOfTwo && texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) {
    //
    //             updateRenderTargetMipmap(renderTarget);
    //
    //         }
    //
    //     }
    //
    //     // Ensure depth buffer writing is enabled so it can be cleared on next render
    //
    //     state.setDepthTest(true);
    //     state.setDepthWrite(true);
    //     state.setColorWrite(true);
    //
    //     // _gl.finish();
    //
    // };

    // function pushRenderItem(object, geometry, material, z, group) {
    //
    //     var array, index;
    //
    //     // allocate the next position in the appropriate array
    //
    //     if (material.transparent) {
    //
    //         array = transparentObjects;
    //         index = ++transparentObjectsLastIndex;
    //
    //     } else {
    //
    //         array = opaqueObjects;
    //         index = ++opaqueObjectsLastIndex;
    //
    //     }
    //
    //     // recycle existing render item or grow the array
    //
    //     var renderItem = array[index];
    //
    //     if (renderItem !== undefined) {
    //
    //         renderItem.id = object.id;
    //         renderItem.object = object;
    //         renderItem.geometry = geometry;
    //         renderItem.material = material;
    //         renderItem.z = _vector3.z;
    //         renderItem.group = group;
    //
    //     } else {
    //
    //         renderItem = {
    //             id: object.id,
    //             object: object,
    //             geometry: geometry,
    //             material: material,
    //             z: _vector3.z,
    //             group: group
    //         };
    //
    //         // assert( index === array.length );
    //         //array.push( renderItem );
    //         array[index] = renderItem;
    //     }
    //
    // }

    // function projectObject(object, camera) {
    //
    //     if (object.visible === false) return;
    //
    //     if (( object.channels && object.channels.mask & camera.channels.mask ) !== 0) {
    //
    //         if (object instanceof THREE.Light) {
    //
    //             lights.push(object);
    //
    //         } else if (object instanceof THREE.Sprite) {
    //
    //             sprites.push(object);
    //
    //         } else if (object instanceof THREE.LensFlare) {
    //
    //             lensFlares.push(object);
    //
    //         } else if (object instanceof THREE.ImmediateRenderObject) {
    //
    //             if (_this.sortObjects === true) {
    //
    //                 _vector3.setFromMatrixPosition(object.matrixWorld);
    //                 _vector3.applyProjection(_projScreenMatrix);
    //
    //             }
    //
    //             pushRenderItem(object, null, object.material, _vector3.z, null);
    //
    //         } else if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
    //
    //             if (object instanceof THREE.SkinnedMesh) {
    //
    //                 object.skeleton.update();
    //
    //             }
    //
    //             if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {
    //
    //                 var material = object.material;
    //
    //                 if (material.visible === true) {
    //
    //                     if (_this.sortObjects === true) {
    //
    //                         _vector3.setFromMatrixPosition(object.matrixWorld);
    //                         _vector3.applyProjection(_projScreenMatrix);
    //
    //                     }
    //
    //                     var geometry = objects.update(object);
    //
    //                     if (material instanceof THREE.MeshFaceMaterial) {
    //
    //                         var groups = geometry.groups;
    //                         var materials = material.materials;
    //
    //                         for (var i = 0, l = groups.length; i < l; i++) {
    //
    //                             var group = groups[i];
    //                             var groupMaterial = materials[group.materialIndex];
    //
    //                             if (groupMaterial.visible === true) {
    //
    //                                 pushRenderItem(object, geometry, groupMaterial, _vector3.z, group);
    //
    //                             }
    //
    //                         }
    //
    //                     } else {
    //
    //                         pushRenderItem(object, geometry, material, _vector3.z, null);
    //
    //                     }
    //
    //                 }
    //
    //             }
    //
    //         }
    //
    //     }
    //
    //     var children = object.children;
    //
    //     //if (!children) {
    //     //    console.log("null");
    //     //}
    //
    //     if (children) {
    //
    //         for (var i = 0, l = children.length; i < l; i++) {
    //
    //             projectObject(children[i], camera);
    //
    //         }
    //     }
    //
    //     //for ( var i = 0, l = children.length; i < l; i ++ ) {
    //     //
    //     //projectObject( children[ i ], camera );
    //     //
    //     //}
    //
    // }

    // function renderObjects(renderList, camera, lights, fog, overrideMaterial) {
    //
    //     for (var i = 0, l = renderList.length; i < l; i++) {
    //
    //         var renderItem = renderList[i];
    //
    //         var object = renderItem.object;
    //         var geometry = renderItem.geometry;
    //         var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
    //         var group = renderItem.group;
    //
    //         object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
    //         object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
    //
    //         if (object instanceof THREE.ImmediateRenderObject) {
    //
    //             setMaterial(material);
    //
    //             var program = setProgram(camera, lights, fog, material, object);
    //
    //             _currentGeometryProgram = '';
    //
    //             object.render(function (object) {
    //
    //                 _this.renderBufferImmediate(object, program, material);
    //
    //             });
    //
    //         } else {
    //
    //             _this.renderBufferDirect(camera, lights, fog, geometry, material, object, group);
    //
    //         }
    //
    //     }
    //
    // }

    function initMaterial(material, lights, fog, object) {

        var materialProperties = properties.get(material);

        var parameters = programCache.getParameters(material, lights, fog, object);
        var code = programCache.getProgramCode(material, parameters);

        var program = materialProperties.program;
        var programChange = true;

        if (program === undefined) {

            // new material
            material.addEventListener('dispose', onMaterialDispose);

        } else if (program.code !== code) {

            // changed glsl or parameters
            releaseMaterialProgramReference(material);

        } else if (parameters.shaderID !== undefined) {

            // same glsl and uniform list
            return;

        } else {

            // only rebuild uniform list
            programChange = false;

        }

        if (programChange) {

            if (parameters.shaderID) {

                var shader = THREE.ShaderLib[parameters.shaderID];

                materialProperties.__webglShader = {
                    name: material.type,
                    uniforms: THREE.UniformsUtils.clone(shader.uniforms),
                    vertexShader: shader.vertexShader,
                    fragmentShader: shader.fragmentShader
                };

            } else {

                materialProperties.__webglShader = {
                    name: material.type,
                    uniforms: material.uniforms,
                    vertexShader: material.vertexShader,
                    fragmentShader: material.fragmentShader
                };

            }

            material.__webglShader = materialProperties.__webglShader;

            program = programCache.acquireProgram(material, parameters, code);

            materialProperties.program = program;
            material.program = program;

        }

        var attributes = program.getAttributes();

        if (material.morphTargets) {

            material.numSupportedMorphTargets = 0;

            for (var i = 0; i < _this.maxMorphTargets; i++) {

                if (attributes['morphTarget' + i] >= 0) {

                    material.numSupportedMorphTargets++;

                }

            }

        }

        if (material.morphNormals) {

            material.numSupportedMorphNormals = 0;

            for (i = 0; i < _this.maxMorphNormals; i++) {

                if (attributes['morphNormal' + i] >= 0) {

                    material.numSupportedMorphNormals++;

                }

            }

        }

        materialProperties.uniformsList = [];

        var uniformLocations = materialProperties.program.getUniforms();

        for (var u in materialProperties.__webglShader.uniforms) {

            var location = uniformLocations[u];

            if (location) {

                materialProperties.uniformsList.push([materialProperties.__webglShader.uniforms[u], location]);

            }

        }

    }

    function setMaterial(material) {

        setMaterialFaces(material);

        if (material.transparent === true) {

            state.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha);

        } else {

            state.setBlending(THREE.NoBlending);

        }

        state.setDepthFunc(material.depthFunc);
        state.setDepthTest(material.depthTest);
        state.setDepthWrite(material.depthWrite);
        state.setColorWrite(material.colorWrite);
        state.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);

    }

    function setMaterialFaces(material) {

        material.side !== THREE.DoubleSide ? state.enable(_gl.CULL_FACE) : state.disable(_gl.CULL_FACE);
        state.setFlipSided(material.side === THREE.BackSide);

    }

    function setProgram(camera, lights, fog, material, object) {

        _usedTextureUnits = 0;

        var materialProperties = properties.get(material);

        if (material.needsUpdate || !materialProperties.program) {

            initMaterial(material, lights, fog, object);
            material.needsUpdate = false;

        }

        var refreshProgram = false;
        var refreshMaterial = false;
        var refreshLights = false;

        var program = materialProperties.program,
            p_uniforms = program.getUniforms(),
            m_uniforms = materialProperties.__webglShader.uniforms;

        if (program.id !== _currentProgram) {

            _gl.useProgram(program.program);
            _currentProgram = program.id;

            refreshProgram = true;
            refreshMaterial = true;
            refreshLights = true;

        }

        if (material.id !== _currentMaterialId) {

            if (_currentMaterialId === -1) refreshLights = true;
            _currentMaterialId = material.id;

            refreshMaterial = true;

        }

        if (refreshProgram || camera !== _currentCamera) {

            _gl.uniformMatrix4fv(p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements);

            if (capabilities.logarithmicDepthBuffer) {

                _gl.uniform1f(p_uniforms.logDepthBufFC, 2.0 / ( Math.log(camera.far + 1.0) / Math.LN2 ));

            }


            if (camera !== _currentCamera) _currentCamera = camera;

            // load material specific uniforms
            // (shader material also gets them for the sake of genericity)

            if (material instanceof THREE.ShaderMaterial ||
                material instanceof THREE.MeshPhongMaterial ||
                material.envMap) {

                if (p_uniforms.cameraPosition !== undefined) {

                    _vector3.setFromMatrixPosition(camera.matrixWorld);
                    _gl.uniform3f(p_uniforms.cameraPosition, _vector3.x, _vector3.y, _vector3.z);

                }

            }

            if (material instanceof THREE.MeshPhongMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material instanceof THREE.MeshBasicMaterial ||
                material instanceof THREE.ShaderMaterial ||
                material.skinning) {

                if (p_uniforms.viewMatrix !== undefined) {

                    _gl.uniformMatrix4fv(p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements);

                }

            }

        }

        // skinning uniforms must be set even if material didn't change
        // auto-setting of texture unit for bone texture must go before other textures
        // not sure why, but otherwise weird things happen

        if (material.skinning) {

            if (object.bindMatrix && p_uniforms.bindMatrix !== undefined) {

                _gl.uniformMatrix4fv(p_uniforms.bindMatrix, false, object.bindMatrix.elements);

            }

            if (object.bindMatrixInverse && p_uniforms.bindMatrixInverse !== undefined) {

                _gl.uniformMatrix4fv(p_uniforms.bindMatrixInverse, false, object.bindMatrixInverse.elements);

            }

            if (capabilities.floatVertexTextures && object.skeleton && object.skeleton.useVertexTexture) {

                if (p_uniforms.boneTexture !== undefined) {

                    var textureUnit = getTextureUnit();

                    _gl.uniform1i(p_uniforms.boneTexture, textureUnit);
                    _this.setTexture(object.skeleton.boneTexture, textureUnit);

                }

                if (p_uniforms.boneTextureWidth !== undefined) {

                    _gl.uniform1i(p_uniforms.boneTextureWidth, object.skeleton.boneTextureWidth);

                }

                if (p_uniforms.boneTextureHeight !== undefined) {

                    _gl.uniform1i(p_uniforms.boneTextureHeight, object.skeleton.boneTextureHeight);

                }

            } else if (object.skeleton && object.skeleton.boneMatrices) {

                if (p_uniforms.boneGlobalMatrices !== undefined) {

                    _gl.uniformMatrix4fv(p_uniforms.boneGlobalMatrices, false, object.skeleton.boneMatrices);

                }

            }

        }

        if (refreshMaterial) {

            // refresh uniforms common to several materials

            if (fog && material.fog) {

                refreshUniformsFog(m_uniforms, fog);

            }

            if (material instanceof THREE.MeshPhongMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material.lights) {

                if (_lightsNeedUpdate) {

                    refreshLights = true;
                    setupLights(lights, camera);
                    _lightsNeedUpdate = false;

                }

                if (refreshLights) {

                    refreshUniformsLights(m_uniforms, _lights);
                    markUniformsLightsNeedsUpdate(m_uniforms, true);

                } else {

                    markUniformsLightsNeedsUpdate(m_uniforms, false);

                }

            }

            if (material instanceof THREE.MeshBasicMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material instanceof THREE.MeshPhongMaterial) {

                refreshUniformsCommon(m_uniforms, material);

            }

            // refresh single material specific uniforms

            if (material instanceof THREE.LineBasicMaterial) {

                refreshUniformsLine(m_uniforms, material);

            } else if (material instanceof THREE.LineDashedMaterial) {

                refreshUniformsLine(m_uniforms, material);
                refreshUniformsDash(m_uniforms, material);

            } else if (material instanceof THREE.PointsMaterial) {

                refreshUniformsParticle(m_uniforms, material);

            } else if (material instanceof THREE.MeshPhongMaterial) {

                refreshUniformsPhong(m_uniforms, material);

            } else if (material instanceof THREE.MeshDepthMaterial) {

                m_uniforms.mNear.value = camera.near;
                m_uniforms.mFar.value = camera.far;
                m_uniforms.opacity.value = material.opacity;

            } else if (material instanceof THREE.MeshNormalMaterial) {

                m_uniforms.opacity.value = material.opacity;

            }

            if (object.receiveShadow && !material._shadowPass) {

                refreshUniformsShadow(m_uniforms, lights, camera);

            }

            // load common uniforms

            loadUniformsGeneric(materialProperties.uniformsList);

        }

        loadUniformsMatrices(p_uniforms, object);

        if (p_uniforms.modelMatrix !== undefined) {

            _gl.uniformMatrix4fv(p_uniforms.modelMatrix, false, object.matrixWorld.elements);

        }

        return program;

    }

    // Uniforms (refresh uniforms objects)

    function refreshUniformsCommon(uniforms, material) {

        uniforms.opacity.value = material.opacity;

        uniforms.diffuse.value = material.color;

        if (material.emissive) {

            uniforms.emissive.value = material.emissive;

        }

        uniforms.map.value = material.map;
        uniforms.specularMap.value = material.specularMap;
        uniforms.alphaMap.value = material.alphaMap;

        if (material.aoMap) {

            uniforms.aoMap.value = material.aoMap;
            uniforms.aoMapIntensity.value = material.aoMapIntensity;

        }

        // uv repeat and offset setting priorities
        // 1. color map
        // 2. specular map
        // 3. normal map
        // 4. bump map
        // 5. alpha map
        // 6. emissive map

        var uvScaleMap;

        if (material.map) {

            uvScaleMap = material.map;

        } else if (material.specularMap) {

            uvScaleMap = material.specularMap;

        } else if (material.displacementMap) {

            uvScaleMap = material.displacementMap;

        } else if (material.normalMap) {

            uvScaleMap = material.normalMap;

        } else if (material.bumpMap) {

            uvScaleMap = material.bumpMap;

        } else if (material.alphaMap) {

            uvScaleMap = material.alphaMap;

        } else if (material.emissiveMap) {

            uvScaleMap = material.emissiveMap;

        }

        if (uvScaleMap !== undefined) {

            if (uvScaleMap instanceof THREE.WebGLRenderTarget) uvScaleMap = uvScaleMap.texture;
            var offset = uvScaleMap.offset;
            var repeat = uvScaleMap.repeat;

            uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);

        }

        uniforms.envMap.value = material.envMap;
        uniforms.flipEnvMap.value = ( material.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : -1;

        uniforms.reflectivity.value = material.reflectivity;
        uniforms.refractionRatio.value = material.refractionRatio;

    }

    function refreshUniformsLine(uniforms, material) {

        uniforms.diffuse.value = material.color;
        uniforms.opacity.value = material.opacity;

    }

    function refreshUniformsDash(uniforms, material) {

        uniforms.dashSize.value = material.dashSize;
        uniforms.totalSize.value = material.dashSize + material.gapSize;
        uniforms.scale.value = material.scale;

    }

    function refreshUniformsParticle(uniforms, material) {

        uniforms.psColor.value = material.color;
        uniforms.opacity.value = material.opacity;
        uniforms.size.value = material.size;
        uniforms.scale.value = _canvas.height / 2.0; // TODO: Cache this.

        uniforms.map.value = material.map;

        if (material.map !== null) {

            var offset = material.map.offset;
            var repeat = material.map.repeat;

            uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);

        }

    }

    function refreshUniformsFog(uniforms, fog) {

        uniforms.fogColor.value = fog.color;

        if (fog instanceof THREE.Fog) {

            uniforms.fogNear.value = fog.near;
            uniforms.fogFar.value = fog.far;

        } else if (fog instanceof THREE.FogExp2) {

            uniforms.fogDensity.value = fog.density;

        }

    }

    function refreshUniformsPhong(uniforms, material) {

        uniforms.specular.value = material.specular;
        uniforms.shininess.value = Math.max(material.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )

        if (material.lightMap) {

            uniforms.lightMap.value = material.lightMap;
            uniforms.lightMapIntensity.value = material.lightMapIntensity;

        }

        if (material.emissiveMap) {

            uniforms.emissiveMap.value = material.emissiveMap;

        }

        if (material.bumpMap) {

            uniforms.bumpMap.value = material.bumpMap;
            uniforms.bumpScale.value = material.bumpScale;

        }

        if (material.normalMap) {

            uniforms.normalMap.value = material.normalMap;
            uniforms.normalScale.value.copy(material.normalScale);

        }

        if (material.displacementMap) {

            uniforms.displacementMap.value = material.displacementMap;
            uniforms.displacementScale.value = material.displacementScale;
            uniforms.displacementBias.value = material.displacementBias;

        }

    }

    function refreshUniformsLights(uniforms, lights) {

        uniforms.ambientLightColor.value = lights.ambient;

        uniforms.directionalLightColor.value = lights.directional.colors;
        uniforms.directionalLightDirection.value = lights.directional.positions;

        uniforms.pointLightColor.value = lights.point.colors;
        uniforms.pointLightPosition.value = lights.point.positions;
        uniforms.pointLightDistance.value = lights.point.distances;
        uniforms.pointLightDecay.value = lights.point.decays;

        uniforms.spotLightColor.value = lights.spot.colors;
        uniforms.spotLightPosition.value = lights.spot.positions;
        uniforms.spotLightDistance.value = lights.spot.distances;
        uniforms.spotLightDirection.value = lights.spot.directions;
        uniforms.spotLightAngleCos.value = lights.spot.anglesCos;
        uniforms.spotLightExponent.value = lights.spot.exponents;
        uniforms.spotLightDecay.value = lights.spot.decays;

        uniforms.hemisphereLightSkyColor.value = lights.hemi.skyColors;
        uniforms.hemisphereLightGroundColor.value = lights.hemi.groundColors;
        uniforms.hemisphereLightDirection.value = lights.hemi.positions;

    }

    // If uniforms are marked as clean, they don't need to be loaded to the GPU.

    function markUniformsLightsNeedsUpdate(uniforms, value) {

        uniforms.ambientLightColor.needsUpdate = value;

        uniforms.directionalLightColor.needsUpdate = value;
        uniforms.directionalLightDirection.needsUpdate = value;

        uniforms.pointLightColor.needsUpdate = value;
        uniforms.pointLightPosition.needsUpdate = value;
        uniforms.pointLightDistance.needsUpdate = value;
        uniforms.pointLightDecay.needsUpdate = value;

        uniforms.spotLightColor.needsUpdate = value;
        uniforms.spotLightPosition.needsUpdate = value;
        uniforms.spotLightDistance.needsUpdate = value;
        uniforms.spotLightDirection.needsUpdate = value;
        uniforms.spotLightAngleCos.needsUpdate = value;
        uniforms.spotLightExponent.needsUpdate = value;
        uniforms.spotLightDecay.needsUpdate = value;

        uniforms.hemisphereLightSkyColor.needsUpdate = value;
        uniforms.hemisphereLightGroundColor.needsUpdate = value;
        uniforms.hemisphereLightDirection.needsUpdate = value;

    }

    function refreshUniformsShadow(uniforms, lights, camera) {

        if (uniforms.shadowMatrix) {

            var j = 0;

            for (var i = 0, il = lights.length; i < il; i++) {

                var light = lights[i];

                if (light.castShadow === true) {

                    if (light instanceof THREE.PointLight || light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight) {

                        var shadow = light.shadow;

                        if (light instanceof THREE.PointLight) {

                            // for point lights we set the shadow matrix to be a translation-only matrix
                            // equal to inverse of the light's position
                            _vector3.setFromMatrixPosition(light.matrixWorld).negate();
                            shadow.matrix.identity().setPosition(_vector3);

                            // for point lights we set the sign of the shadowDarkness uniform to be negative
                            uniforms.shadowDarkness.value[j] = -shadow.darkness;

                        } else {

                            uniforms.shadowDarkness.value[j] = shadow.darkness;

                        }

                        uniforms.shadowMatrix.value[j] = shadow.matrix;
                        uniforms.shadowMap.value[j] = shadow.map;
                        uniforms.shadowMapSize.value[j] = shadow.mapSize;
                        uniforms.shadowBias.value[j] = shadow.bias;

                        j++;

                    }

                }

            }

        }

    }

    // Uniforms (load to GPU)

    function loadUniformsMatrices(uniforms, object) {

        _gl.uniformMatrix4fv(uniforms.modelViewMatrix, false, object.modelViewMatrix.elements);

        if (uniforms.normalMatrix) {

            _gl.uniformMatrix3fv(uniforms.normalMatrix, false, object.normalMatrix.elements);

        }

    }

    function getTextureUnit() {

        var textureUnit = _usedTextureUnits;

        if (textureUnit >= capabilities.maxTextures) {

            console.warn('WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + capabilities.maxTextures);

        }

        _usedTextureUnits += 1;

        return textureUnit;

    }

    function loadUniformsGeneric(uniforms) {

        var texture, textureUnit;

        for (var j = 0, jl = uniforms.length; j < jl; j++) {

            var uniform = uniforms[j][0];

            // needsUpdate property is not added to all uniforms.
            if (uniform.needsUpdate === false) continue;

            var type = uniform.type;
            var value = uniform.value;
            var location = uniforms[j][1];

            switch (type) {

                case '1i':
                    _gl.uniform1i(location, value);
                    break;

                case '1f':
                    _gl.uniform1f(location, value);
                    break;

                case '2f':
                    _gl.uniform2f(location, value[0], value[1]);
                    break;

                case '3f':
                    _gl.uniform3f(location, value[0], value[1], value[2]);
                    break;

                case '4f':
                    _gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                    break;

                case '1iv':
                    _gl.uniform1iv(location, value);
                    break;

                case '3iv':
                    _gl.uniform3iv(location, value);
                    break;

                case '1fv':
                    _gl.uniform1fv(location, value);
                    break;

                case '2fv':
                    _gl.uniform2fv(location, value);
                    break;

                case '3fv':
                    _gl.uniform3fv(location, value);
                    break;

                case '4fv':
                    _gl.uniform4fv(location, value);
                    break;

                case 'Matrix3fv':
                    _gl.uniformMatrix3fv(location, false, value);
                    break;

                case 'Matrix4fv':
                    _gl.uniformMatrix4fv(location, false, value);
                    break;

                //

                case 'i':

                    // single integer
                    _gl.uniform1i(location, value);

                    break;

                case 'f':

                    // single float
                    _gl.uniform1f(location, value);

                    break;

                case 'v2':

                    // single THREE.Vector2
                    _gl.uniform2f(location, value.x, value.y);

                    break;

                case 'v3':

                    // single THREE.Vector3
                    _gl.uniform3f(location, value.x, value.y, value.z);

                    break;

                case 'v4':

                    // single THREE.Vector4
                    _gl.uniform4f(location, value.x, value.y, value.z, value.w);

                    break;

                case 'c':

                    // single THREE.Color
                    _gl.uniform3f(location, value.r, value.g, value.b);

                    break;

                case 'iv1':

                    // flat array of integers (JS or typed array)
                    _gl.uniform1iv(location, value);

                    break;

                case 'iv':

                    // flat array of integers with 3 x N size (JS or typed array)
                    _gl.uniform3iv(location, value);

                    break;

                case 'fv1':

                    // flat array of floats (JS or typed array)
                    _gl.uniform1fv(location, value);

                    break;

                case 'fv':

                    // flat array of floats with 3 x N size (JS or typed array)
                    _gl.uniform3fv(location, value);

                    break;

                case 'v2v':

                    // array of THREE.Vector2

                    if (uniform._array === undefined) {

                        uniform._array = new Float32Array(2 * value.length);

                    }

                    for (var i = 0, i2 = 0, il = value.length; i < il; i++, i2 += 2) {

                        uniform._array[i2 + 0] = value[i].x;
                        uniform._array[i2 + 1] = value[i].y;

                    }

                    _gl.uniform2fv(location, uniform._array);

                    break;

                case 'v3v':

                    // array of THREE.Vector3

                    if (uniform._array === undefined) {

                        uniform._array = new Float32Array(3 * value.length);

                    }

                    for (var i = 0, i3 = 0, il = value.length; i < il; i++, i3 += 3) {

                        uniform._array[i3 + 0] = value[i].x;
                        uniform._array[i3 + 1] = value[i].y;
                        uniform._array[i3 + 2] = value[i].z;

                    }

                    _gl.uniform3fv(location, uniform._array);

                    break;

                case 'v4v':

                    // array of THREE.Vector4

                    if (uniform._array === undefined) {

                        uniform._array = new Float32Array(4 * value.length);

                    }

                    for (var i = 0, i4 = 0, il = value.length; i < il; i++, i4 += 4) {

                        uniform._array[i4 + 0] = value[i].x;
                        uniform._array[i4 + 1] = value[i].y;
                        uniform._array[i4 + 2] = value[i].z;
                        uniform._array[i4 + 3] = value[i].w;

                    }

                    _gl.uniform4fv(location, uniform._array);

                    break;

                case 'm3':

                    // single THREE.Matrix3
                    _gl.uniformMatrix3fv(location, false, value.elements);

                    break;

                case 'm3v':

                    // array of THREE.Matrix3

                    if (uniform._array === undefined) {

                        uniform._array = new Float32Array(9 * value.length);

                    }

                    for (var i = 0, il = value.length; i < il; i++) {

                        value[i].flattenToArrayOffset(uniform._array, i * 9);

                    }

                    _gl.uniformMatrix3fv(location, false, uniform._array);

                    break;

                case 'm4':

                    // single THREE.Matrix4
                    _gl.uniformMatrix4fv(location, false, value.elements);

                    break;

                case 'm4v':

                    // array of THREE.Matrix4

                    if (uniform._array === undefined) {

                        uniform._array = new Float32Array(16 * value.length);

                    }

                    for (var i = 0, il = value.length; i < il; i++) {

                        value[i].flattenToArrayOffset(uniform._array, i * 16);

                    }

                    _gl.uniformMatrix4fv(location, false, uniform._array);

                    break;

                case 't':

                    // single THREE.Texture (2d or cube)

                    texture = value;
                    textureUnit = getTextureUnit();

                    _gl.uniform1i(location, textureUnit);

                    if (!texture) continue;

                    if (texture instanceof THREE.CubeTexture ||
                        ( Array.isArray(texture.image) && texture.image.length === 6 )) {

                        // CompressedTexture can have Array in image :/

                        setCubeTexture(texture, textureUnit);

                    } else if (texture instanceof THREE.WebGLRenderTargetCube) {

                        setCubeTextureDynamic(texture.texture, textureUnit);

                    } else if (texture instanceof THREE.WebGLRenderTarget) {

                        _this.setTexture(texture.texture, textureUnit);

                    } else {

                        _this.setTexture(texture, textureUnit);

                    }

                    break;

                case 'tv':

                    // array of THREE.Texture (2d or cube)

                    if (uniform._array === undefined) {

                        uniform._array = [];

                    }

                    for (var i = 0, il = uniform.value.length; i < il; i++) {

                        uniform._array[i] = getTextureUnit();

                    }

                    _gl.uniform1iv(location, uniform._array);

                    for (var i = 0, il = uniform.value.length; i < il; i++) {

                        texture = uniform.value[i];
                        textureUnit = uniform._array[i];

                        if (!texture) continue;

                        if (texture instanceof THREE.CubeTexture ||
                            ( texture.image instanceof Array && texture.image.length === 6 )) {

                            // CompressedTexture can have Array in image :/

                            setCubeTexture(texture, textureUnit);

                        } else if (texture instanceof THREE.WebGLRenderTarget) {

                            _this.setTexture(texture.texture, textureUnit);

                        } else if (texture instanceof THREE.WebGLRenderTargetCube) {

                            setCubeTextureDynamic(texture.texture, textureUnit);

                        } else {

                            _this.setTexture(texture, textureUnit);

                        }

                    }

                    break;

                default:

                    console.warn('THREE.WebGLRenderer: Unknown uniform type: ' + type);

            }

        }

    }

    function setColorLinear(array, offset, color, intensity) {

        array[offset + 0] = color.r * intensity;
        array[offset + 1] = color.g * intensity;
        array[offset + 2] = color.b * intensity;

    }

    function setupLights(lights, camera) {

        var l, ll, light,
            r = 0, g = 0, b = 0,
            color, skyColor, groundColor,
            intensity,
            distance,

            zlights = _lights,

            viewMatrix = camera.matrixWorldInverse,

            dirColors = zlights.directional.colors,
            dirPositions = zlights.directional.positions,

            pointColors = zlights.point.colors,
            pointPositions = zlights.point.positions,
            pointDistances = zlights.point.distances,
            pointDecays = zlights.point.decays,

            spotColors = zlights.spot.colors,
            spotPositions = zlights.spot.positions,
            spotDistances = zlights.spot.distances,
            spotDirections = zlights.spot.directions,
            spotAnglesCos = zlights.spot.anglesCos,
            spotExponents = zlights.spot.exponents,
            spotDecays = zlights.spot.decays,

            hemiSkyColors = zlights.hemi.skyColors,
            hemiGroundColors = zlights.hemi.groundColors,
            hemiPositions = zlights.hemi.positions,

            dirLength = 0,
            pointLength = 0,
            spotLength = 0,
            hemiLength = 0,

            dirCount = 0,
            pointCount = 0,
            spotCount = 0,
            hemiCount = 0,

            dirOffset = 0,
            pointOffset = 0,
            spotOffset = 0,
            hemiOffset = 0;

        for (l = 0, ll = lights.length; l < ll; l++) {

            light = lights[l];

            color = light.color;
            intensity = light.intensity;
            distance = light.distance;

            if (light instanceof THREE.AmbientLight) {

                if (!light.visible) continue;

                r += color.r;
                g += color.g;
                b += color.b;

            } else if (light instanceof THREE.DirectionalLight) {

                dirCount += 1;

                if (!light.visible) continue;

                _direction.setFromMatrixPosition(light.matrixWorld);
                _vector3.setFromMatrixPosition(light.target.matrixWorld);
                _direction.sub(_vector3);
                _direction.transformDirection(viewMatrix);

                dirOffset = dirLength * 3;

                dirPositions[dirOffset + 0] = _direction.x;
                dirPositions[dirOffset + 1] = _direction.y;
                dirPositions[dirOffset + 2] = _direction.z;

                setColorLinear(dirColors, dirOffset, color, intensity);

                dirLength += 1;

            } else if (light instanceof THREE.PointLight) {

                pointCount += 1;

                if (!light.visible) continue;

                pointOffset = pointLength * 3;

                setColorLinear(pointColors, pointOffset, color, intensity);

                _vector3.setFromMatrixPosition(light.matrixWorld);
                _vector3.applyMatrix4(viewMatrix);

                pointPositions[pointOffset + 0] = _vector3.x;
                pointPositions[pointOffset + 1] = _vector3.y;
                pointPositions[pointOffset + 2] = _vector3.z;

                // distance is 0 if decay is 0, because there is no attenuation at all.
                pointDistances[pointLength] = distance;
                pointDecays[pointLength] = ( light.distance === 0 ) ? 0.0 : light.decay;

                pointLength += 1;

            } else if (light instanceof THREE.SpotLight) {

                spotCount += 1;

                if (!light.visible) continue;

                spotOffset = spotLength * 3;

                setColorLinear(spotColors, spotOffset, color, intensity);

                _direction.setFromMatrixPosition(light.matrixWorld);
                _vector3.copy(_direction).applyMatrix4(viewMatrix);

                spotPositions[spotOffset + 0] = _vector3.x;
                spotPositions[spotOffset + 1] = _vector3.y;
                spotPositions[spotOffset + 2] = _vector3.z;

                spotDistances[spotLength] = distance;

                _vector3.setFromMatrixPosition(light.target.matrixWorld);
                _direction.sub(_vector3);
                _direction.transformDirection(viewMatrix);

                spotDirections[spotOffset + 0] = _direction.x;
                spotDirections[spotOffset + 1] = _direction.y;
                spotDirections[spotOffset + 2] = _direction.z;

                spotAnglesCos[spotLength] = Math.cos(light.angle);
                spotExponents[spotLength] = light.exponent;
                spotDecays[spotLength] = ( light.distance === 0 ) ? 0.0 : light.decay;

                spotLength += 1;

            } else if (light instanceof THREE.HemisphereLight) {

                hemiCount += 1;

                if (!light.visible) continue;

                _direction.setFromMatrixPosition(light.matrixWorld);
                _direction.transformDirection(viewMatrix);

                hemiOffset = hemiLength * 3;

                hemiPositions[hemiOffset + 0] = _direction.x;
                hemiPositions[hemiOffset + 1] = _direction.y;
                hemiPositions[hemiOffset + 2] = _direction.z;

                skyColor = light.color;
                groundColor = light.groundColor;

                setColorLinear(hemiSkyColors, hemiOffset, skyColor, intensity);
                setColorLinear(hemiGroundColors, hemiOffset, groundColor, intensity);

                hemiLength += 1;

            }

        }

        // null eventual remains from removed lights
        // (this is to avoid if in shader)

        for (l = dirLength * 3, ll = Math.max(dirColors.length, dirCount * 3); l < ll; l++) dirColors[l] = 0.0;
        for (l = pointLength * 3, ll = Math.max(pointColors.length, pointCount * 3); l < ll; l++) pointColors[l] = 0.0;
        for (l = spotLength * 3, ll = Math.max(spotColors.length, spotCount * 3); l < ll; l++) spotColors[l] = 0.0;
        for (l = hemiLength * 3, ll = Math.max(hemiSkyColors.length, hemiCount * 3); l < ll; l++) hemiSkyColors[l] = 0.0;
        for (l = hemiLength * 3, ll = Math.max(hemiGroundColors.length, hemiCount * 3); l < ll; l++) hemiGroundColors[l] = 0.0;

        zlights.directional.length = dirLength;
        zlights.point.length = pointLength;
        zlights.spot.length = spotLength;
        zlights.hemi.length = hemiLength;

        zlights.ambient[0] = r;
        zlights.ambient[1] = g;
        zlights.ambient[2] = b;

    }

    // GL state setting

    this.setFaceCulling = function (cullFace, frontFaceDirection) {

        if (cullFace === THREE.CullFaceNone) {

            state.disable(_gl.CULL_FACE);

        } else {

            if (frontFaceDirection === THREE.FrontFaceDirectionCW) {

                _gl.frontFace(_gl.CW);

            } else {

                _gl.frontFace(_gl.CCW);

            }

            if (cullFace === THREE.CullFaceBack) {

                _gl.cullFace(_gl.BACK);

            } else if (cullFace === THREE.CullFaceFront) {

                _gl.cullFace(_gl.FRONT);

            } else {

                _gl.cullFace(_gl.FRONT_AND_BACK);

            }

            state.enable(_gl.CULL_FACE);

        }

    };

    // Textures

    function setTextureParameters(textureType, texture, isImagePowerOfTwo) {

        var extension;

        if (isImagePowerOfTwo) {

            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, paramThreeToGL(texture.wrapS));
            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, paramThreeToGL(texture.wrapT));

            _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, paramThreeToGL(texture.magFilter));
            _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, paramThreeToGL(texture.minFilter));

        } else {

            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
            _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);

            if (texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping) {

                console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.', texture);

            }

            _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, filterFallback(texture.magFilter));
            _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, filterFallback(texture.minFilter));

            if (texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) {

                console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.', texture);

            }

        }

        extension = extensions.get('EXT_texture_filter_anisotropic');

        if (extension) {

            if (texture.type === THREE.FloatType && extensions.get('OES_texture_float_linear') === null) return;
            if (texture.type === THREE.HalfFloatType && extensions.get('OES_texture_half_float_linear') === null) return;

            if (texture.anisotropy > 1 || properties.get(texture).__currentAnisotropy) {

                _gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, _this.getMaxAnisotropy()));
                properties.get(texture).__currentAnisotropy = texture.anisotropy;

            }

        }

    }

    function uploadTexture(textureProperties, texture, slot) {

        if (textureProperties.__webglInit === undefined) {

            textureProperties.__webglInit = true;

            texture.addEventListener('dispose', onTextureDispose);

            textureProperties.__webglTexture = _gl.createTexture();

            _infoMemory.textures++;

        }

        state.activeTexture(_gl.TEXTURE0 + slot);
        state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);

        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
        _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, texture.unpackAlignment);

        texture.image = clampToMaxSize(texture.image, capabilities.maxTextureSize);

        if (textureNeedsPowerOfTwo(texture) && isPowerOfTwo(texture.image) === false) {

            texture.image = makePowerOfTwo(texture.image);

        }

        var image = texture.image,
            isImagePowerOfTwo = isPowerOfTwo(image),
            glFormat = paramThreeToGL(texture.format),
            glType = paramThreeToGL(texture.type);

        setTextureParameters(_gl.TEXTURE_2D, texture, isImagePowerOfTwo);

        var mipmap, mipmaps = texture.mipmaps;

        if (texture instanceof THREE.DataTexture) {

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels

            if (mipmaps.length > 0 && isImagePowerOfTwo) {

                for (var i = 0, il = mipmaps.length; i < il; i++) {

                    mipmap = mipmaps[i];
                    state.texImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                }

                texture.generateMipmaps = false;

            } else {

                state.texImage2D(_gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data);

            }

        } else if (texture instanceof THREE.CompressedTexture) {

            for (var i = 0, il = mipmaps.length; i < il; i++) {

                mipmap = mipmaps[i];

                if (texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat) {

                    if (state.getCompressedTextureFormats().indexOf(glFormat) > -1) {

                        state.compressedTexImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                    } else {

                        console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");

                    }

                } else {

                    state.texImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                }

            }

        } else {

            // regular Texture (image, video, canvas)

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels

            if (mipmaps.length > 0 && isImagePowerOfTwo) {

                for (var i = 0, il = mipmaps.length; i < il; i++) {

                    mipmap = mipmaps[i];
                    state.texImage2D(_gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap);

                }

                texture.generateMipmaps = false;

            } else {

                state.texImage2D(_gl.TEXTURE_2D, 0, glFormat, glFormat, glType, texture.image);

            }

        }

        if (texture.generateMipmaps && isImagePowerOfTwo) _gl.generateMipmap(_gl.TEXTURE_2D);

        textureProperties.__version = texture.version;

        if (texture.onUpdate) texture.onUpdate(texture);

    }

    this.setTexture = function (texture, slot) {

        var textureProperties = properties.get(texture);

        if (texture.version > 0 && textureProperties.__version !== texture.version) {

            var image = texture.image;

            if (image === undefined) {

                console.warn('THREE.WebGLRenderer: Texture marked for update but image is undefined', texture);
                return;

            }

            if (image.complete === false) {

                console.warn('THREE.WebGLRenderer: Texture marked for update but image is incomplete', texture);
                return;

            }

            uploadTexture(textureProperties, texture, slot);

            return;

        }

        state.activeTexture(_gl.TEXTURE0 + slot);
        state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);

    };

    function clampToMaxSize(image, maxSize) {

        if (image.width > maxSize || image.height > maxSize) {

            // Warning: Scaling through the canvas will only work with images that use
            // premultiplied alpha.

            var scale = maxSize / Math.max(image.width, image.height);

            var canvas = document.createElement('canvas');
            canvas.width = Math.floor(image.width * scale);
            canvas.height = Math.floor(image.height * scale);

            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            console.warn('THREE.WebGLRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

            return canvas;

        }

        return image;

    }

    function isPowerOfTwo(image) {

        return THREE.Math.isPowerOfTwo(image.width) && THREE.Math.isPowerOfTwo(image.height);

    }

    function textureNeedsPowerOfTwo(texture) {

        if (texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping) return true;
        if (texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) return true;

        return false;

    }

    function makePowerOfTwo(image) {

        if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {

            var canvas = document.createElement('canvas');
            canvas.width = THREE.Math.nearestPowerOfTwo(image.width);
            canvas.height = THREE.Math.nearestPowerOfTwo(image.height);

            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            console.warn('THREE.WebGLRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

            return canvas;

        }

        return image;

    }

    function setCubeTexture(texture, slot) {

        var textureProperties = properties.get(texture);

        if (texture.image.length === 6) {

            if (texture.version > 0 && textureProperties.__version !== texture.version) {

                if (!textureProperties.__image__webglTextureCube) {

                    texture.addEventListener('dispose', onTextureDispose);

                    textureProperties.__image__webglTextureCube = _gl.createTexture();

                    _infoMemory.textures++;

                }

                state.activeTexture(_gl.TEXTURE0 + slot);
                state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);

                _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);

                var isCompressed = texture instanceof THREE.CompressedTexture;
                var isDataTexture = texture.image[0] instanceof THREE.DataTexture;

                var cubeImage = [];

                for (var i = 0; i < 6; i++) {

                    if (_this.autoScaleCubemaps && !isCompressed && !isDataTexture) {

                        cubeImage[i] = clampToMaxSize(texture.image[i], capabilities.maxCubemapSize);

                    } else {

                        cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];

                    }

                }

                var image = cubeImage[0],
                    isImagePowerOfTwo = isPowerOfTwo(image),
                    glFormat = paramThreeToGL(texture.format),
                    glType = paramThreeToGL(texture.type);

                setTextureParameters(_gl.TEXTURE_CUBE_MAP, texture, isImagePowerOfTwo);

                for (var i = 0; i < 6; i++) {

                    if (!isCompressed) {

                        if (isDataTexture) {

                            state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);

                        } else {

                            state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[i]);

                        }

                    } else {

                        var mipmap, mipmaps = cubeImage[i].mipmaps;

                        for (var j = 0, jl = mipmaps.length; j < jl; j++) {

                            mipmap = mipmaps[j];

                            if (texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat) {

                                if (state.getCompressedTextureFormats().indexOf(glFormat) > -1) {

                                    state.compressedTexImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                                } else {

                                    console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()");

                                }

                            } else {

                                state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);

                            }

                        }

                    }

                }

                if (texture.generateMipmaps && isImagePowerOfTwo) {

                    _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);

                }

                textureProperties.__version = texture.version;

                if (texture.onUpdate) texture.onUpdate(texture);

            } else {

                state.activeTexture(_gl.TEXTURE0 + slot);
                state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);

            }

        }

    }

    function setCubeTextureDynamic(texture, slot) {

        state.activeTexture(_gl.TEXTURE0 + slot);
        state.bindTexture(_gl.TEXTURE_CUBE_MAP, properties.get(texture).__webglTexture);

    }

    // Render targets

    function setupFrameBuffer(framebuffer, renderTarget, textureTarget) {

        _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
        _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, textureTarget, properties.get(renderTarget.texture).__webglTexture, 0);

    }

    function setupRenderBuffer(renderbuffer, renderTarget) {

        _gl.bindRenderbuffer(_gl.RENDERBUFFER, renderbuffer);

        if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {

            _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height);
            _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer);

            /* For some reason this is not working. Defaulting to RGBA4.
             } else if ( ! renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

             _gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.STENCIL_INDEX8, renderTarget.width, renderTarget.height );
             _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );
             */

        } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {

            _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height);
            _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer);

        } else {

            _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.RGBA4, renderTarget.width, renderTarget.height);

        }

    }

    this.setRenderTarget = function (renderTarget) {

        var isCube = ( renderTarget instanceof THREE.WebGLRenderTargetCube );

        if (renderTarget && properties.get(renderTarget).__webglFramebuffer === undefined) {

            var renderTargetProperties = properties.get(renderTarget);
            var textureProperties = properties.get(renderTarget.texture);

            if (renderTarget.depthBuffer === undefined) renderTarget.depthBuffer = true;
            if (renderTarget.stencilBuffer === undefined) renderTarget.stencilBuffer = true;

            renderTarget.addEventListener('dispose', onRenderTargetDispose);

            textureProperties.__webglTexture = _gl.createTexture();

            _infoMemory.textures++;

            // Setup texture, create render and frame buffers

            var isTargetPowerOfTwo = isPowerOfTwo(renderTarget),
                glFormat = paramThreeToGL(renderTarget.texture.format),
                glType = paramThreeToGL(renderTarget.texture.type);

            if (isCube) {

                renderTargetProperties.__webglFramebuffer = [];
                renderTargetProperties.__webglRenderbuffer = [];

                state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);

                setTextureParameters(_gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo);

                for (var i = 0; i < 6; i++) {

                    renderTargetProperties.__webglFramebuffer[i] = _gl.createFramebuffer();
                    renderTargetProperties.__webglRenderbuffer[i] = _gl.createRenderbuffer();
                    state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

                    setupFrameBuffer(renderTargetProperties.__webglFramebuffer[i], renderTarget, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i);
                    setupRenderBuffer(renderTargetProperties.__webglRenderbuffer[i], renderTarget);

                }

                if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);

            } else {

                renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();

                if (renderTarget.shareDepthFrom) {

                    renderTargetProperties.__webglRenderbuffer = renderTarget.shareDepthFrom.__webglRenderbuffer;

                } else {

                    renderTargetProperties.__webglRenderbuffer = _gl.createRenderbuffer();

                }

                state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);
                setTextureParameters(_gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo);

                state.texImage2D(_gl.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);

                setupFrameBuffer(renderTargetProperties.__webglFramebuffer, renderTarget, _gl.TEXTURE_2D);

                if (renderTarget.shareDepthFrom) {

                    if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {

                        _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer);

                    } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {

                        _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer);

                    }

                } else {

                    setupRenderBuffer(renderTargetProperties.__webglRenderbuffer, renderTarget);

                }

                if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) _gl.generateMipmap(_gl.TEXTURE_2D);

            }

            // Release everything

            if (isCube) {

                state.bindTexture(_gl.TEXTURE_CUBE_MAP, null);

            } else {

                state.bindTexture(_gl.TEXTURE_2D, null);

            }

            _gl.bindRenderbuffer(_gl.RENDERBUFFER, null);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);

        }

        var framebuffer, width, height, vx, vy;

        if (renderTarget) {

            var renderTargetProperties = properties.get(renderTarget);

            if (isCube) {

                framebuffer = renderTargetProperties.__webglFramebuffer[renderTarget.activeCubeFace];

            } else {

                framebuffer = renderTargetProperties.__webglFramebuffer;

            }

            width = renderTarget.width;
            height = renderTarget.height;

            vx = 0;
            vy = 0;

        } else {

            framebuffer = null;

            width = _viewportWidth;
            height = _viewportHeight;

            vx = _viewportX;
            vy = _viewportY;

        }

        if (framebuffer !== _currentFramebuffer) {

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
            _gl.viewport(vx, vy, width, height);

            _currentFramebuffer = framebuffer;

        }

        if (isCube) {

            var textureProperties = properties.get(renderTarget.texture);
            _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, 0);

        }

        _currentWidth = width;
        _currentHeight = height;

    };

    this.readRenderTargetPixels = function (renderTarget, x, y, width, height, buffer) {

        if (renderTarget instanceof THREE.WebGLRenderTarget === false) {

            console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.');
            return;

        }

        var framebuffer = properties.get(renderTarget).__webglFramebuffer;

        if (framebuffer) {

            var restore = false;

            if (framebuffer !== _currentFramebuffer) {

                _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);

                restore = true;

            }

            try {

                var texture = renderTarget.texture;

                if (texture.format !== THREE.RGBAFormat
                    && paramThreeToGL(texture.format) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {

                    console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.');
                    return;

                }

                if (texture.type !== THREE.UnsignedByteType
                    && paramThreeToGL(texture.type) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_TYPE)
                    && !( texture.type === THREE.FloatType && extensions.get('WEBGL_color_buffer_float') )
                    && !( texture.type === THREE.HalfFloatType && extensions.get('EXT_color_buffer_half_float') )) {

                    console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.');
                    return;

                }

                if (_gl.checkFramebufferStatus(_gl.FRAMEBUFFER) === _gl.FRAMEBUFFER_COMPLETE) {

                    _gl.readPixels(x, y, width, height, paramThreeToGL(texture.format), paramThreeToGL(texture.type), buffer);

                } else {

                    console.error('THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.');

                }

            } finally {

                if (restore) {

                    _gl.bindFramebuffer(_gl.FRAMEBUFFER, _currentFramebuffer);

                }

            }

        }

    };

    function updateRenderTargetMipmap(renderTarget) {

        var target = renderTarget instanceof THREE.WebGLRenderTargetCube ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D;
        var texture = properties.get(renderTarget.texture).__webglTexture;

        state.bindTexture(target, texture);
        _gl.generateMipmap(target);
        state.bindTexture(target, null);

    }

    // Fallback filters for non-power-of-2 textures

    function filterFallback(f) {

        if (f === THREE.NearestFilter || f === THREE.NearestMipMapNearestFilter || f === THREE.NearestMipMapLinearFilter) {

            return _gl.NEAREST;

        }

        return _gl.LINEAR;

    }

    // Map three.js constants to WebGL constants

    function paramThreeToGL(p) {

        var extension;

        if (p === THREE.RepeatWrapping) return _gl.REPEAT;
        if (p === THREE.ClampToEdgeWrapping) return _gl.CLAMP_TO_EDGE;
        if (p === THREE.MirroredRepeatWrapping) return _gl.MIRRORED_REPEAT;

        if (p === THREE.NearestFilter) return _gl.NEAREST;
        if (p === THREE.NearestMipMapNearestFilter) return _gl.NEAREST_MIPMAP_NEAREST;
        if (p === THREE.NearestMipMapLinearFilter) return _gl.NEAREST_MIPMAP_LINEAR;

        if (p === THREE.LinearFilter) return _gl.LINEAR;
        if (p === THREE.LinearMipMapNearestFilter) return _gl.LINEAR_MIPMAP_NEAREST;
        if (p === THREE.LinearMipMapLinearFilter) return _gl.LINEAR_MIPMAP_LINEAR;

        if (p === THREE.UnsignedByteType) return _gl.UNSIGNED_BYTE;
        if (p === THREE.UnsignedShort4444Type) return _gl.UNSIGNED_SHORT_4_4_4_4;
        if (p === THREE.UnsignedShort5551Type) return _gl.UNSIGNED_SHORT_5_5_5_1;
        if (p === THREE.UnsignedShort565Type) return _gl.UNSIGNED_SHORT_5_6_5;

        if (p === THREE.ByteType) return _gl.BYTE;
        if (p === THREE.ShortType) return _gl.SHORT;
        if (p === THREE.UnsignedShortType) return _gl.UNSIGNED_SHORT;
        if (p === THREE.IntType) return _gl.INT;
        if (p === THREE.UnsignedIntType) return _gl.UNSIGNED_INT;
        if (p === THREE.FloatType) return _gl.FLOAT;

        extension = extensions.get('OES_texture_half_float');

        if (extension !== null) {

            if (p === THREE.HalfFloatType) return extension.HALF_FLOAT_OES;

        }

        if (p === THREE.AlphaFormat) return _gl.ALPHA;
        if (p === THREE.RGBFormat) return _gl.RGB;
        if (p === THREE.RGBAFormat) return _gl.RGBA;
        if (p === THREE.LuminanceFormat) return _gl.LUMINANCE;
        if (p === THREE.LuminanceAlphaFormat) return _gl.LUMINANCE_ALPHA;

        if (p === THREE.AddEquation) return _gl.FUNC_ADD;
        if (p === THREE.SubtractEquation) return _gl.FUNC_SUBTRACT;
        if (p === THREE.ReverseSubtractEquation) return _gl.FUNC_REVERSE_SUBTRACT;

        if (p === THREE.ZeroFactor) return _gl.ZERO;
        if (p === THREE.OneFactor) return _gl.ONE;
        if (p === THREE.SrcColorFactor) return _gl.SRC_COLOR;
        if (p === THREE.OneMinusSrcColorFactor) return _gl.ONE_MINUS_SRC_COLOR;
        if (p === THREE.SrcAlphaFactor) return _gl.SRC_ALPHA;
        if (p === THREE.OneMinusSrcAlphaFactor) return _gl.ONE_MINUS_SRC_ALPHA;
        if (p === THREE.DstAlphaFactor) return _gl.DST_ALPHA;
        if (p === THREE.OneMinusDstAlphaFactor) return _gl.ONE_MINUS_DST_ALPHA;

        if (p === THREE.DstColorFactor) return _gl.DST_COLOR;
        if (p === THREE.OneMinusDstColorFactor) return _gl.ONE_MINUS_DST_COLOR;
        if (p === THREE.SrcAlphaSaturateFactor) return _gl.SRC_ALPHA_SATURATE;

        extension = extensions.get('WEBGL_compressed_texture_s3tc');

        if (extension !== null) {

            if (p === THREE.RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (p === THREE.RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (p === THREE.RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (p === THREE.RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

        }

        extension = extensions.get('WEBGL_compressed_texture_pvrtc');

        if (extension !== null) {

            if (p === THREE.RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            if (p === THREE.RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            if (p === THREE.RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            if (p === THREE.RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

        }

        extension = extensions.get('EXT_blend_minmax');

        if (extension !== null) {

            if (p === THREE.MinEquation) return extension.MIN_EXT;
            if (p === THREE.MaxEquation) return extension.MAX_EXT;

        }

        return 0;

    }

    // DEPRECATED

    this.supportsFloatTextures = function () {

        console.warn('THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).');
        return extensions.get('OES_texture_float');

    };

    this.supportsHalfFloatTextures = function () {

        console.warn('THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).');
        return extensions.get('OES_texture_half_float');

    };

    this.supportsStandardDerivatives = function () {

        console.warn('THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).');
        return extensions.get('OES_standard_derivatives');

    };

    this.supportsCompressedTextureS3TC = function () {

        console.warn('THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).');
        return extensions.get('WEBGL_compressed_texture_s3tc');

    };

    this.supportsCompressedTexturePVRTC = function () {

        console.warn('THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).');
        return extensions.get('WEBGL_compressed_texture_pvrtc');

    };

    this.supportsBlendMinMax = function () {

        console.warn('THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).');
        return extensions.get('EXT_blend_minmax');

    };

    this.supportsVertexTextures = function () {

        return capabilities.vertexTextures;

    };

    this.supportsInstancedArrays = function () {

        console.warn('THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).');
        return extensions.get('ANGLE_instanced_arrays');

    };

    //

    this.initMaterial = function () {

        console.warn('THREE.WebGLRenderer: .initMaterial() has been removed.');

    };

    this.addPrePlugin = function () {

        console.warn('THREE.WebGLRenderer: .addPrePlugin() has been removed.');

    };

    this.addPostPlugin = function () {

        console.warn('THREE.WebGLRenderer: .addPostPlugin() has been removed.');

    };

    this.updateShadowMap = function () {

        console.warn('THREE.WebGLRenderer: .updateShadowMap() has been removed.');

    };

    Object.defineProperties(this, {
        shadowMapEnabled: {
            get: function () {

                return shadowMap.enabled;

            },
            set: function (value) {

                console.warn('THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.');
                shadowMap.enabled = value;

            }
        },
        shadowMapType: {
            get: function () {

                return shadowMap.type;

            },
            set: function (value) {

                console.warn('THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.');
                shadowMap.type = value;

            }
        },
        shadowMapCullFace: {
            get: function () {

                return shadowMap.cullFace;

            },
            set: function (value) {

                console.warn('THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.');
                shadowMap.cullFace = value;

            }
        },
        shadowMapDebug: {
            get: function () {

                return shadowMap.debug;

            },
            set: function (value) {

                console.warn('THREE.WebGLRenderer: .shadowMapDebug is now .shadowMap.debug.');
                shadowMap.debug = value;

            }
        }
    });


    // ------------------------------------------------------------------
    // 增加增量绘制支持

    // Rendering
    var _orderedRenderer = new CLOUD.OrderedRenderer();

    this.destroy = function () {

        CLOUD.GeomUtil.destroyUnitInstances();
        //LIWEI: WebGLObjects has no method to clear the cached geometries, so recreate it.
        objects = new THREE.WebGLObjectsExt(_gl, properties, this.info);
        _orderedRenderer.destroy();

        properties.clear();
    };

    this.IncrementRender = function (scene, camera, renderTarget, forceClear) {

        if (camera instanceof THREE.Camera === false) {

            console.error('THREE.WebGLIncrementRenderer.IncrementRender: camera is not an instance of THREE.Camera.');
            return;
        }

        // reset caching for this frame

        _currentGeometryProgram = '';
        _currentMaterialId = -1;
        _currentCamera = null;
        _lightsNeedUpdate = true;

        // update scene graph

        if (scene.autoUpdate === true) scene.updateMatrixWorld();

        // update camera matrices and frustum

        if (camera.parent === null) camera.updateMatrixWorld();

        camera.matrixWorldInverse.getInverse(camera.matrixWorld);

        _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        _frustum.setFromMatrix(_projScreenMatrix);

        _infoRender.calls = 0;
        _infoRender.vertices = 0;
        _infoRender.faces = 0;
        _infoRender.points = 0;

        _orderedRenderer.update(_frustum, _projScreenMatrix);

        return _orderedRenderer.render(this, scene, camera, lights, renderTarget, forceClear, state);
    };

    // 重置增量绘制状态
    this.resetIncrementRender = function () {
        _orderedRenderer.restart();

    };

    // 设置过滤对象
    this.setFilterObject = function (filterObject) {

        _orderedRenderer.setFilter(filterObject);

    };

    // 设置是否更新对象列表
    this.setObjectListUpdateState = function (isUpdate) {
        _orderedRenderer.updateObjectList(isUpdate);
    };

    this.computeSelectionBBox = function () {

        return _orderedRenderer.computeSelectionBBox();
    };

    this.computeRenderObjectsBox = function () {
        return _orderedRenderer.computeRenderObjectsBox();
    };

    this.setRenderTicket = function (ticket) {
        objects.renderTicket = ticket;
    };

};


CLOUD.BBoxNode = function (boundingBox, color) {
    "use strict";
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(72), 3));

    THREE.LineSegments.call(this, geometry, new THREE.LineBasicMaterial({ color: color }));

    if (boundingBox !== undefined) {
        this.updateBBox(boundingBox);
    }
};

CLOUD.BBoxNode.prototype = Object.create(THREE.LineSegments.prototype);
CLOUD.BBoxNode.prototype.constructor = CLOUD.BBoxNode;

CLOUD.BBoxNode.prototype.unload = function () {

}

CLOUD.BBoxNode.prototype.updateBBox = function (boundingBox) {
    var min = boundingBox.min;
    var max = boundingBox.max;

    /*
	  5____4
	1/___0/|
	| 6__|_7
	2/___3/
	0: max.x, max.y, max.z
	1: min.x, max.y, max.z
	2: min.x, min.y, max.z
	3: max.x, min.y, max.z
	4: max.x, max.y, min.z
	5: min.x, max.y, min.z
	6: min.x, min.y, min.z
	7: max.x, min.y, min.z
	*/

    var vertices = this.geometry.attributes.position.array;

    vertices[0] = max.x; vertices[1] = max.y; vertices[2] = max.z;
    vertices[3] = min.x; vertices[4] = max.y; vertices[5] = max.z;

    vertices[6] = min.x; vertices[7] = max.y; vertices[8] = max.z;
    vertices[9] = min.x; vertices[10] = min.y; vertices[11] = max.z;

    vertices[12] = min.x; vertices[13] = min.y; vertices[14] = max.z;
    vertices[15] = max.x; vertices[16] = min.y; vertices[17] = max.z;

    vertices[18] = max.x; vertices[19] = min.y; vertices[20] = max.z;
    vertices[21] = max.x; vertices[22] = max.y; vertices[23] = max.z;

    //

    vertices[24] = max.x; vertices[25] = max.y; vertices[26] = min.z;
    vertices[27] = min.x; vertices[28] = max.y; vertices[29] = min.z;

    vertices[30] = min.x; vertices[31] = max.y; vertices[32] = min.z;
    vertices[33] = min.x; vertices[34] = min.y; vertices[35] = min.z;

    vertices[36] = min.x; vertices[37] = min.y; vertices[38] = min.z;
    vertices[39] = max.x; vertices[40] = min.y; vertices[41] = min.z;

    vertices[42] = max.x; vertices[43] = min.y; vertices[44] = min.z;
    vertices[45] = max.x; vertices[46] = max.y; vertices[47] = min.z;

    //

    vertices[48] = max.x; vertices[49] = max.y; vertices[50] = max.z;
    vertices[51] = max.x; vertices[52] = max.y; vertices[53] = min.z;

    vertices[54] = min.x; vertices[55] = max.y; vertices[56] = max.z;
    vertices[57] = min.x; vertices[58] = max.y; vertices[59] = min.z;

    vertices[60] = min.x; vertices[61] = min.y; vertices[62] = max.z;
    vertices[63] = min.x; vertices[64] = min.y; vertices[65] = min.z;

    vertices[66] = max.x; vertices[67] = min.y; vertices[68] = max.z;
    vertices[69] = max.x; vertices[70] = min.y; vertices[71] = min.z;

    this.geometry.attributes.position.needsUpdate = true;

    this.geometry.computeBoundingBox();
    this.geometry.computeBoundingSphere();
    this.matrixAutoUpdate = false;
};
THREE.CombinedCamera = function (width, height, fov, near, far) {

    THREE.Camera.call(this);

    this.aspect = width / height;
    this.fov = fov;
    this.near = near;
    this.far = far;

    this.left = -width / 2;
    this.right = width / 2;
    this.top = height / 2;
    this.bottom = -height / 2;

    this.cameraOrtho = new THREE.OrthographicCamera(this.left, this.right, this.top, this.bottom, this.near, this.far);
    this.cameraPerspective = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);

    this.zoom = 1;

    this.toPerspective();

};

THREE.CombinedCamera.prototype = Object.create(THREE.Camera.prototype);
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

    this.near = this.cameraPerspective.near;
    this.far = this.cameraPerspective.far;
    this.cameraPerspective.fov = this.fov / this.zoom;
    this.cameraPerspective.updateProjectionMatrix();
    this.projectionMatrix = this.cameraPerspective.projectionMatrix;
    this.isPerspective = true;
};

THREE.CombinedCamera.prototype.toOrthographic = function () {

    // Switches to the Orthographic camera estimating viewport from Perspective

    var fov = this.fov;
    var aspect = this.cameraPerspective.aspect;
    var near = this.cameraPerspective.near;
    var far = this.cameraPerspective.far;

    // The size that we set is the mid plane of the viewing frustum

    var hyperfocus = ( near + far ) / 2;

    var halfHeight = Math.tan(fov * Math.PI / 180 / 2) * hyperfocus;
    var planeHeight = 2 * halfHeight;
    var planeWidth = planeHeight * aspect;
    var halfWidth = planeWidth / 2;

    halfHeight /= this.zoom;
    halfWidth /= this.zoom;

    this.cameraOrtho.left = -halfWidth;
    this.cameraOrtho.right = halfWidth;
    this.cameraOrtho.top = halfHeight;
    this.cameraOrtho.bottom = -halfHeight;
    this.cameraOrtho.updateProjectionMatrix();

    this.near = this.cameraOrtho.near;
    this.far = this.cameraOrtho.far;
    this.projectionMatrix = this.cameraOrtho.projectionMatrix;

    this.isPerspective = false;
};


THREE.CombinedCamera.prototype.setSize = function (width, height) {

    this.cameraPerspective.aspect = width / height;
    this.left = -width / 2;
    this.right = width / 2;
    this.top = height / 2;
    this.bottom = -height / 2;
    this.aspect = width / height;
};

THREE.CombinedCamera.prototype.setFov = function (fov) {

    this.fov = fov;

    if (this.isPerspective) {

        this.toPerspective();

    } else {

        this.toOrthographic();

    }

};

THREE.CombinedCamera.prototype.setNearFar = function (near, far) {

    if (this.isPerspective) {

        this.cameraPerspective.near = near;
        this.cameraPerspective.far = far;

        this.toPerspective();

    } else {

        this.cameraOrtho.near = near;
        this.cameraOrtho.far = far;

        this.toOrthographic();

    }

};

// For mantaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function () {

    if (this.isPerspective) {

        this.toPerspective();

    } else {

        //this.toPerspective();
        this.toOrthographic();

    }

};

/*
 * Uses Focal Length (in mm) to estimate and set FOV
 * 35mm (fullframe) camera is used if frame size is not specified;
 * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
 */
THREE.CombinedCamera.prototype.setLens = function (focalLength, frameHeight) {

    if (frameHeight === undefined) frameHeight = 24;

    var fov = 2 * THREE.Math.radToDeg(Math.atan(frameHeight / ( focalLength * 2 )));

    this.setFov(fov);

    return fov;
};


THREE.CombinedCamera.prototype.setZoom = function (zoom) {

    this.zoom = zoom;

    if (this.isPerspective) {

        this.toPerspective();

    } else {

        this.toOrthographic();

    }

};
/*
 For three.js r73
 */
CLOUD.ShaderMaterial = CLOUD.ShaderMaterial || {};

CLOUD.ShaderMaterial.ShaderChunk = {
    cust_clip_pars_vertex: "#ifdef USE_CUSTOMCLIP\n\n    uniform vec4 vClipPlane[6]; \n\n    uniform int iClipPlane; \n\n    varying float fClipDistance[6];\n\n#endif\n",
    cust_clip_pars_fragment: "#ifdef USE_CUSTOMCLIP\n\n    uniform int iClipPlane; \n\n    varying float fClipDistance[6];\n\n#endif\n",

    cust_clip_vertex: "#ifdef USE_CUSTOMCLIP\n\n" +
    " for(int i = 0; i < 6; i++) {\n" +
    "     if (i < iClipPlane)\n" +
    "         fClipDistance[i] = dot(worldPosition.xyz, vClipPlane[i].xyz) + vClipPlane[i].w;\n" +
    "  }\n" +
    "#endif\n",

    cust_clip_fragment: "#ifdef USE_CUSTOMCLIP\n\n" +
    "for(int i = 0; i < 6; i++) {\n\n" +
    "    if (i < iClipPlane)\n" +
    "       if (fClipDistance[i] > 0.0) discard;\n\n" +
    "}\n\n" +
    "#endif\n",

    cust_Instanced_pars_vertex: "#ifdef USE_CUST_INSTANCED\n\n    attribute vec4 componentV1;\nattribute vec4 componentV2;\nattribute vec4 componentV3;\nattribute vec4 componentV4;\n#endif\n",
    cust_Instanced_normal_vertex: "#ifdef USE_CUST_INSTANCED\n\n\tmat4 modelTransMatrix = mat4(componentV1, componentV2, componentV3,componentV4);\n\t objectNormal = inverseTransformDirection(objectNormal, modelTransMatrix);\n#endif\n",
    cust_Instanced_vertex: "#ifdef USE_CUST_INSTANCED\n\n\tvec4 newposition = mat4(componentV1, componentV2, componentV3,componentV4) * vec4( transformed, 1.0 );\n\t transformed = newposition.xyz;\n#endif\n",

    cust_Instanced_pars_vertex2: "#ifdef USE_CUST_INSTANCED\n\n  uniform mat4 transformMatrix; \n#endif\n",
    cust_Instanced_vertex2: "#ifdef USE_CUST_INSTANCED\n\n\tvec4 newposition = transformMatrix * vec4( transformed, 1.0 );\n\t transformed = newposition.xyz;\n#endif\n"

};

CLOUD.ShaderMaterial.UniformsLib = {
    cust_clip: {
        iClipPlane: {type: "i", value: 0},
        vClipPlane: {
            type: "v4v",
            value: new Array(new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4())
        }
    },
    cus_Instanced: {
        transformMatrix: {type: "m4", value: new THREE.Matrix4()}
    }
};

CLOUD.ShaderMaterial.ShaderLibs = {
    r73: {
        phong_cust_clip: {
            uniforms: THREE.UniformsUtils.merge([

                THREE.UniformsLib["common"],
                THREE.UniformsLib["aomap"],
                THREE.UniformsLib["lightmap"],
                THREE.UniformsLib["emissivemap"],
                THREE.UniformsLib["bumpmap"],
                THREE.UniformsLib["normalmap"],
                THREE.UniformsLib["displacementmap"],
                THREE.UniformsLib["fog"],
                THREE.UniformsLib["lights"],
                THREE.UniformsLib["shadowmap"],

                CLOUD.ShaderMaterial.UniformsLib["cust_clip"],

                {
                    "emissive": {type: "c", value: new THREE.Color(0x000000)},
                    "specular": {type: "c", value: new THREE.Color(0x111111)},
                    "shininess": {type: "f", value: 30}
                }

            ]),

            vertexShader: [

                "#define USE_CUSTOMCLIP",

                "#define PHONG",

                "varying vec3 vViewPosition;",

                "#ifndef FLAT_SHADED",

                "    varying vec3 vNormal;",

                "#endif",

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["uv_pars_vertex"],
                THREE.ShaderChunk["uv2_pars_vertex"],
                THREE.ShaderChunk["displacementmap_pars_vertex"],
                THREE.ShaderChunk["envmap_pars_vertex"],
                THREE.ShaderChunk["lights_phong_pars_vertex"],
                THREE.ShaderChunk["color_pars_vertex"],
                THREE.ShaderChunk["morphtarget_pars_vertex"],
                THREE.ShaderChunk["skinning_pars_vertex"],
                THREE.ShaderChunk["shadowmap_pars_vertex"],
                THREE.ShaderChunk["logdepthbuf_pars_vertex"],

                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_pars_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_pars_vertex"],

                "void main() {",

                THREE.ShaderChunk["uv_vertex"],
                THREE.ShaderChunk["uv2_vertex"],
                THREE.ShaderChunk["color_vertex"],

                THREE.ShaderChunk["beginnormal_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_normal_vertex"],
                THREE.ShaderChunk["morphnormal_vertex"],
                THREE.ShaderChunk["skinbase_vertex"],
                THREE.ShaderChunk["skinnormal_vertex"],
                THREE.ShaderChunk["defaultnormal_vertex"],

                "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

                "    vNormal = normalize( transformedNormal );",

                "#endif",

                THREE.ShaderChunk["begin_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_vertex"],
                THREE.ShaderChunk["displacementmap_vertex"],
                THREE.ShaderChunk["morphtarget_vertex"],
                THREE.ShaderChunk["skinning_vertex"],
                THREE.ShaderChunk["project_vertex"],
                THREE.ShaderChunk["logdepthbuf_vertex"],

                "    vViewPosition = - mvPosition.xyz;",

                THREE.ShaderChunk["worldpos_vertex"],

                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_vertex"],
                THREE.ShaderChunk["envmap_vertex"],
                THREE.ShaderChunk["lights_phong_vertex"],
                THREE.ShaderChunk["shadowmap_vertex"],

                "}"

            ].join("\n"),

            fragmentShader: [
                "#define USE_CUSTOMCLIP",
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_pars_fragment"],

                "#define PHONG",

                "uniform vec3 diffuse;",
                "uniform vec3 emissive;",
                "uniform vec3 specular;",
                "uniform float shininess;",
                "uniform float opacity;",

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["color_pars_fragment"],
                THREE.ShaderChunk["uv_pars_fragment"],
                THREE.ShaderChunk["uv2_pars_fragment"],
                THREE.ShaderChunk["map_pars_fragment"],
                THREE.ShaderChunk["alphamap_pars_fragment"],
                THREE.ShaderChunk["aomap_pars_fragment"],
                THREE.ShaderChunk["lightmap_pars_fragment"],
                THREE.ShaderChunk["emissivemap_pars_fragment"],
                THREE.ShaderChunk["envmap_pars_fragment"],
                THREE.ShaderChunk["fog_pars_fragment"],
                THREE.ShaderChunk["lights_phong_pars_fragment"],
                THREE.ShaderChunk["shadowmap_pars_fragment"],
                THREE.ShaderChunk["bumpmap_pars_fragment"],
                THREE.ShaderChunk["normalmap_pars_fragment"],
                THREE.ShaderChunk["specularmap_pars_fragment"],
                THREE.ShaderChunk["logdepthbuf_pars_fragment"],

                "void main() {",
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_fragment"],

                "    vec3 outgoingLight = vec3( 0.0 );",
                "    vec4 diffuseColor = vec4( diffuse, opacity );",
                "    vec3 totalAmbientLight = ambientLightColor;",
                "    vec3 totalEmissiveLight = emissive;",
                "    vec3 shadowMask = vec3( 1.0 );",

                THREE.ShaderChunk["logdepthbuf_fragment"],
                THREE.ShaderChunk["map_fragment"],
                THREE.ShaderChunk["color_fragment"],
                THREE.ShaderChunk["alphamap_fragment"],
                THREE.ShaderChunk["alphatest_fragment"],
                THREE.ShaderChunk["specularmap_fragment"],
                THREE.ShaderChunk["normal_phong_fragment"],
                THREE.ShaderChunk["lightmap_fragment"],
                THREE.ShaderChunk["hemilight_fragment"],
                THREE.ShaderChunk["aomap_fragment"],
                THREE.ShaderChunk["emissivemap_fragment"],

                THREE.ShaderChunk["lights_phong_fragment"],
                THREE.ShaderChunk["shadowmap_fragment"],

                "totalDiffuseLight *= shadowMask;",
                "totalSpecularLight *= shadowMask;",

                "#ifdef METAL",

                "    outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;",

                "#else",

                "    outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;",

                "#endif",

                THREE.ShaderChunk["envmap_fragment"],

                THREE.ShaderChunk["linear_to_gamma_fragment"],

                THREE.ShaderChunk["fog_fragment"],

                "    gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

                "}"

            ].join("\n")
        },
        base_cust_clip: {
            uniforms: THREE.UniformsUtils.merge([

                THREE.UniformsLib["common"],
                THREE.UniformsLib["aomap"],
                THREE.UniformsLib["fog"],
                THREE.UniformsLib["shadowmap"],
                // CLIP
                CLOUD.ShaderMaterial.UniformsLib["cust_clip"],
                CLOUD.ShaderMaterial.UniformsLib["cus_Instanced"]
            ]),

            vertexShader: [

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["uv_pars_vertex"],
                THREE.ShaderChunk["uv2_pars_vertex"],
                THREE.ShaderChunk["envmap_pars_vertex"],
                THREE.ShaderChunk["color_pars_vertex"],
                THREE.ShaderChunk["morphtarget_pars_vertex"],
                THREE.ShaderChunk["skinning_pars_vertex"],
                THREE.ShaderChunk["shadowmap_pars_vertex"],
                THREE.ShaderChunk["logdepthbuf_pars_vertex"],

                "#define USE_CUSTOMCLIP",
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_pars_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_pars_vertex2"],
                //CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_pars_vertex"],

                "void main() {",

                THREE.ShaderChunk["uv_vertex"],
                THREE.ShaderChunk["uv2_vertex"],
                THREE.ShaderChunk["color_vertex"],
                THREE.ShaderChunk["skinbase_vertex"],

                "    #ifdef USE_ENVMAP",

                THREE.ShaderChunk["beginnormal_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_normal_vertex"],
                THREE.ShaderChunk["morphnormal_vertex"],
                THREE.ShaderChunk["skinnormal_vertex"],
                THREE.ShaderChunk["defaultnormal_vertex"],

                "    #endif",


                THREE.ShaderChunk["begin_vertex"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_vertex2"],
                //CLOUD.ShaderMaterial.ShaderChunk["cust_Instanced_vertex"],
                THREE.ShaderChunk["morphtarget_vertex"],
                THREE.ShaderChunk["skinning_vertex"],
                THREE.ShaderChunk["project_vertex"],
                THREE.ShaderChunk["logdepthbuf_vertex"],

                THREE.ShaderChunk["worldpos_vertex"],
                "vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );",
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_vertex"],
                THREE.ShaderChunk["envmap_vertex"],
                THREE.ShaderChunk["shadowmap_vertex"],

                "}"

            ].join("\n"),

            fragmentShader: [

                "#define USE_CUSTOMCLIP",

                "uniform vec3 diffuse;",
                "uniform float opacity;",

                THREE.ShaderChunk["color_pars_fragment"],
                THREE.ShaderChunk["map_pars_fragment"],
                THREE.ShaderChunk["alphamap_pars_fragment"],
                THREE.ShaderChunk["lightmap_pars_fragment"],
                THREE.ShaderChunk["envmap_pars_fragment"],
                THREE.ShaderChunk["fog_pars_fragment"],
                THREE.ShaderChunk["shadowmap_pars_fragment"],
                THREE.ShaderChunk["specularmap_pars_fragment"],
                THREE.ShaderChunk["logdepthbuf_pars_fragment"],
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_pars_fragment"],

                "void main() {",
                CLOUD.ShaderMaterial.ShaderChunk["cust_clip_fragment"],

                "    vec3 outgoingLight = vec3( 0.0 );",
                "    vec4 diffuseColor = vec4( diffuse, opacity );",
                "    vec3 totalAmbientLight = vec3( 1.0 );", // hardwired
                "    vec3 shadowMask = vec3( 1.0 );",

                THREE.ShaderChunk["logdepthbuf_fragment"],
                THREE.ShaderChunk["map_fragment"],
                THREE.ShaderChunk["color_fragment"],
                THREE.ShaderChunk["alphamap_fragment"],
                THREE.ShaderChunk["alphatest_fragment"],
                THREE.ShaderChunk["specularmap_fragment"],
                THREE.ShaderChunk["aomap_fragment"],
                THREE.ShaderChunk["shadowmap_fragment"],

                "    outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;",

                THREE.ShaderChunk["envmap_fragment"],

                //THREE.ShaderChunk["linear_to_gamma_fragment"],

                THREE.ShaderChunk["fog_fragment"],

                "    gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

                "}"

            ].join("\n")
        }
    }
};

CLOUD.ShaderMaterial.ShaderLib = CLOUD.ShaderMaterial.ShaderLibs['r' + THREE.REVISION];
if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
    CLOUD.Logger.log('custom clip not implemented for three.js r' + THREE.REVISION + ' yet!');
}

CLOUD.Animation = function () {

    var _scope = this;
    var _object = null;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _duration = 1000;
    var _startTime = null;
    //var _isPlaying = false;
    var _timerId = null;
    var _tolerance = 0.9995;
    var _interpolationFunction = null;

    var _onStartCallbackFired = false;
    var _onStartCallback = null;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;

    this.from = function(properties){

        _object = properties;

        // 保存开始值
        for (var field in _object) {
            _valuesStart[field] = _object[field];
        }

        return this;
    };

    this.to = function(properties, duration) {

        if (duration !== undefined) {
            _duration = duration;
        }

        _valuesEnd = properties;
        return this;
    };

    this.onStart = function (callback) {

        _onStartCallback = callback;
        return this;
    };

    this.onUpdate = function (callback) {

        _onUpdateCallback = callback;
        return this;
    };

    this.onComplete = function (callback) {

        _onCompleteCallback = callback;
        return this;
    };

    this.start = function( frameTime ) {

        _onStartCallbackFired = false;

        // 连续点击，会生成很多id
        // 先清除之前的id
        if (_timerId) {
            clearInterval(_timerId);
        }

        //_startTime = window.performance.now();
        _startTime = Date.now();

        _interpolationFunction = this.interpolate;

        var animate = function() {

            var elapsed;
            var start = _valuesStart;
            var end = _valuesEnd;
            //var time = window.performance.now();
            var time = Date.now();

            if (_onStartCallbackFired === false) {

                if (_onStartCallback !== null) {
                    _onStartCallback.call(_object);
                }

                _onStartCallbackFired = true;
            }

            elapsed = (time - _startTime) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;

            _object = _interpolationFunction(start, end, elapsed);

            if (elapsed === 1) {

                // 清除计时器
                clearInterval(_timerId);

                if (_onCompleteCallback !== null) {
                    _onCompleteCallback.call(_object);
                }
            } else {

                if (_onUpdateCallback !== null) {
                    _onUpdateCallback.call(_object, elapsed);
                }
            }
        }

        // 启动计时器
        _timerId = setInterval(animate, frameTime);
    };

    //判断两向量角度是否大于180°，大于180°返回真，否则返回假
    this.isAngleGreaterThanPi = function(start, end, up){

        // 根据混合积来判断角度
        var dir = new THREE.Vector3();
        dir.crossVectors(start, end);

        var volume = dir.dot(up);

        //dir 与 up 同向 - 小于 180°
        if (volume >= 0) {
            return false;
        }

        return true;
    };

    // 锥形底面圆弧插值
    this.conicInterpolate = function(start, end, interp, percentage, islargeangle) {

        // 场景旋转和相机旋转方向是反的
        var angle = -Math.PI * percentage;

        // 大角度的情况：以小弧度旋转
        if (islargeangle) {
            angle *= -1;
        }

        // 旋转轴
        var axis = new THREE.Vector3();
        axis.addVectors(end, start).normalize();

        // 从 start 开始绕轴 axis 旋转 angle
        var quat = new THREE.Quaternion();
        quat.setFromAxisAngle(axis, angle);

        interp.copy(start);
        interp.applyQuaternion(quat);
    };

    // 球形插值
    this.slerpInterpolate = function(start, end, up, interp, percentage, tolerance, isconic, islargeangle) {
        var unitX = new THREE.Vector3( 1, 0 , 0 );
        var unitZ = new THREE.Vector3( 0, 0 , 1);
        var middle = new THREE.Vector3(); // 中间量
        var step = 0;
        var cosTheta = start.dot(end);
        // 构造四元数
        var startQuaternion = new THREE.Quaternion(start.x, start.y, start.z, 1).normalize();
        var endQuaternion = new THREE.Quaternion(end.x, end.y, end.z, 1).normalize();
        var midQuaternion = new THREE.Quaternion(0, 0, 0 ,1);
        var slerpQuaternion = new THREE.Quaternion(0, 0, 0 ,1);

        if (isconic === undefined) {
            isconic = false;
        }

        if (islargeangle === undefined) {
            islargeangle = false;
        }

        // start == end (0度)
        if (tolerance < cosTheta){
            interp.copy(end);
        } else  if (tolerance < Math.abs(cosTheta)) {// start == -end (180度)

            //if ( tolerance > Math.abs( start.dot( unitZ )) ) {
            //    //CLOUD.Logger.log("unitZ");
            //    middle.crossVectors(start , unitZ).normalize();
            //} else {
            //    //CLOUD.Logger.log("unitX");
            //    middle.crossVectors(start , unitX).normalize();
            //}

            middle.crossVectors(start , up).normalize();

            // 中间量四元数
            midQuaternion.set(middle.x, middle.y, middle.z, 1).normalize();

            if (percentage < 0.5) {
                step = percentage * 2;
                THREE.Quaternion.slerp(startQuaternion, midQuaternion, slerpQuaternion, step);
                interp.set(slerpQuaternion.x, slerpQuaternion.y, slerpQuaternion.z);
            } else {
                step = (percentage - 0.5) * 2;
                THREE.Quaternion.slerp(midQuaternion, endQuaternion, slerpQuaternion, step);
                interp.set(slerpQuaternion.x, slerpQuaternion.y, slerpQuaternion.z);
            }

        } else { // start != abs(end)

            if (isconic ){
                //CLOUD.Logger.log("[slerpInterpolate][isconic]");
                this.conicInterpolate(start, end, interp, percentage, islargeangle);
            } else {
                THREE.Quaternion.slerp(startQuaternion, endQuaternion, slerpQuaternion, percentage);
                interp.set(slerpQuaternion.x, slerpQuaternion.y, slerpQuaternion.z);
            }
        }

        interp.normalize();
    };

    // 线性插值
    this.linearInterpolate = function(start, end, interp, percentage, tolerance) {
        var unitX = new THREE.Vector3( 1, 0 , 0 );
        var unitZ = new THREE.Vector3( 0, 0 , 1);
        var middle = new THREE.Vector3(); // 中间量
        var step = 0;
        var cosTheta = start.dot(end);

        // start == end (0度)
        if (tolerance < cosTheta){
            interp.copy(end);
        } else if (tolerance < -cosTheta) {// start == -end (180度)

            if ( tolerance > Math.abs( start.dot( unitZ )) ) {
                middle.crossVectors(start, unitZ).normalize();
            } else {
                middle.crossVectors(start, unitX).normalize();
            }

            // 非均匀插值，每段变化角度不一样
            if (percentage < 0.5) {
                step = percentage * 2;
                interp.lerpVectors(start, middle, step);
            } else {
                step = (percentage - 0.5) * 2;
                interp.lerpVectors(middle, end, step);
            }

        }else { // start != abs(end)
            interp.lerpVectors(start, end, percentage);
        }

        interp.normalize();
    };

    // 插值处理
    this.interpolate = function (valuesStart, valuesEnd, percentage) {
        var startRightDir = new THREE.Vector3();
        var endRightDir = new THREE.Vector3();

        // 插值结果
        var interpDir = new THREE.Vector3();
        var interpUp = new THREE.Vector3();

        var startDir = valuesStart.animDir;
        var startUp = valuesStart.animUp;
        var endDir = valuesEnd.animDir;
        var endUp = valuesEnd.animUp;

        startRightDir.crossVectors(startDir, startUp);
        endRightDir.crossVectors(endDir, endUp);

        var cosTheta = startRightDir.dot(endRightDir);
        var threshold = _tolerance - 1;

        // 判断方向是否变化，则采用锥形底面圆弧插值
        var dirChange = cosTheta < threshold ? true : false;

        // 判断两向量角度是否大于180
        var isLargeAngle = _scope.isAngleGreaterThanPi(startDir, endDir, startUp);

        // 计算插值量 - dir
        _scope.slerpInterpolate(startDir, endDir, startUp, interpDir, percentage, _tolerance, dirChange, isLargeAngle);

        // 计算插值量 - up
        _scope.linearInterpolate(startUp, endUp, interpUp, percentage, _tolerance);

        return {
            animDir: interpDir,
            animUp: interpUp
        };
    };

}
CLOUD.CameraAnimator = function () {

    var _duration = 500;// 500毫秒
    var _frameTime = 13; // 周期性执行或调用函数之间的时间间隔，以毫秒计
    var _isPlaying = false;
    var _animation = new CLOUD.Animation();

    this.setDuration = function (duration) {
        _duration = duration;
    };

    this.setFrameTime = function (frameTime) {
        _frameTime = frameTime;
    };

    this.setStandardView = function (stdView, viewer, margin, callback) {

        _isPlaying = false; // 无动画，将状态置成 false

        var redoRender = function (viewer, box) {

            // fit all
            var target = viewer.camera.zoomToBBox(box, margin);
            viewer.cameraEditor.updateCamera(target);
            viewer.render();

            // 增加回调
            callback && callback();
        };

        var camera = viewer.camera;
        var focal = CLOUD.GlobalData.SceneSize / 2;
        var threshold = 0.9995;

        // 1. 记录动画开始参数
        var startDir = camera.getWorldDirection().clone();
        startDir.normalize();

        var startUp = new THREE.Vector3();
        startUp.copy(camera.realUp || camera.up);
        startUp.normalize();

        // 2. 设置视图模式
        var box = viewer.getScene().getBoundingBox();
        var target = camera.setStandardView(stdView, box);

        // 3. 记录动画结束参数
        var endDir = camera.getWorldDirection().clone();
        endDir.normalize();

        var endUp = new THREE.Vector3();
        endUp.copy(camera.realUp || camera.up);
        endUp.normalize();

        // 开始结束点之间角度
        var cosThetaDir = startDir.dot(endDir);
        var cosThetaUp = startUp.dot(endUp);

        // dir和up都一样, 无动画
        if (threshold < cosThetaDir && threshold < cosThetaUp) {

            // 绘制
            redoRender(viewer, box);

            camera.up.copy(THREE.Object3D.DefaultUp);

        } else {

            _isPlaying = true; // 动画中

            // 启动定时器
            _animation.from({animDir: startDir, animUp: startUp}).to({
                animDir: endDir,
                animUp: endUp
            }, _duration).onUpdate(function () {
                if (viewer.viewHouse) {
                    viewer.viewHouse.isAnimationFinish = false;
                }

                // 传入更新值,这里的this是 CLOUD.Animation._object
                var interpDir = this.animDir;
                var interpUp = this.animUp;

                viewer.camera.LookAt(target, interpDir, interpUp, focal);

                redoRender(viewer, box);
            }).onComplete(function () {

                if (viewer.viewHouse) {
                    // 处理最后一帧
                    viewer.viewHouse.isAnimationFinish = true; // 标记ViewHouse动画结束
                }

                viewer.camera.LookAt(target, endDir, endUp, focal);

                // 绘制
                redoRender(viewer, box);

                _isPlaying = false; //动画结束
                viewer.camera.up.copy(THREE.Object3D.DefaultUp);// 渲染完成后才可以恢复相机up方向
            }).start(_frameTime);
        }
    };

    this.isPlaying = function () {
        return _isPlaying;
    };
}


/**
 * 过滤器，用于构件可见性，材质变更，隔离等处理
 * 构件状态 ： 选择、高亮、半透明、隔离
 *
 * @class  CLOUD.Filter
 *
 */
CLOUD.Filter = function () {

    // 内置材质库
    var _overridedMaterials = {};
    _overridedMaterials.selection = CLOUD.MaterialUtil.createHighlightMaterial();
    _overridedMaterials.scene = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0x888888,
        opacity: 0.1,
        transparent: true,
        side: THREE.DoubleSide
    });
    _overridedMaterials.darkRed = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0xA02828,
        opacity: 1,
        transparent: false,
        side: THREE.DoubleSide
    });
    _overridedMaterials.lightBlue = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0x1377C0,
        opacity: 1,
        transparent: false,
        side: THREE.DoubleSide
    });
    _overridedMaterials.black = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0x0,
        opacity: 0.3,
        transparent: true,
        side: THREE.DoubleSide
    });

    _overridedMaterials.add = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0x00FF00,
        opacity: 1,
        transparent: true,
        side: THREE.DoubleSide
    });
    _overridedMaterials.delete = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0xFF0000,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
    });
    _overridedMaterials.beforeEdit = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0xFABD05,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
    });
    _overridedMaterials.afterEdit = CLOUD.MaterialUtil.createPhongMaterial({
        color: 0xFABD05,
        opacity: 1,
        transparent: true,
        side: THREE.DoubleSide
    });

    // SERIALIZATION BEGIN
    var _filter = {}; // 可见过滤器
    var _fileFilter = {}; // 文件过滤器。在这里面的fileId将不可见。

    var _overriderByScene = false; // 场景半透明
    var _frozenSet = null; // 现在用于临时半透明构件的集合

    var _isolateSet = null; // 隔离：将不在该集合中的构件半透明（反向选择）
    var _isolateCondition = null;//组合条件的隔离

    var _overriderByIds = {}; // 材质过滤器
    var _overriderByData = {}; // 自定义材质覆盖
    var _overriderCondition = null;//组合条件的材质覆盖

    var _selectionSet = null; // 选中的构件集合
    var _selectionBoundingBox = new THREE.Box3(); // 选中构件的包围盒

    // SERIALIZATION END

    /**
     * 保存当前过滤器状态
     *
     */
    this.saveState = function () {
        var obj = {};
        obj.version = 1;
        obj.filter = _filter;
        obj.fileFilter = _fileFilter;
        obj.overriderByScene = _overriderByScene;

        if (_frozenSet) {
            obj.frozenSet = _frozenSet;
        }

        if (_isolateSet) {
            obj.isolateSet = _isolateSet;
        }

        if (_isolateCondition) {
            obj.isolateCondition = _isolateCondition;
        }

        obj.overriderByIds = _overriderByIds;
        obj.overriderByData = _overriderByData;

        if (_overriderCondition) {
            obj.overriderCondition = _overriderCondition;
        }

        if (_selectionSet) {
            obj.selectionSet = _selectionSet;
        }

        return obj;
    };

    /**
     * 恢复过滤器状态
     *
     */
    this.loadState = function (obj) {

        _filter = obj.filter;
        _fileFilter = obj.fileFilter;
        _overriderByScene = obj.overriderByScene;

        if (obj.frozenSet != undefined) {
            _frozenSet = obj.frozenSet;
        }

        if (obj.isolateSet != undefined) {
            _isolateSet = obj.isolateSet;
        }

        if (obj.isolateCondition != undefined) {
            _isolateCondition = obj.isolateCondition;
        }

        _overriderByIds = obj.overriderByIds;
        _overriderByData = obj.overriderByData;

        if (obj.overriderCondition) {
            _overriderCondition = obj.overriderCondition;
        }

        if (obj.selectionSet != undefined) {
            _selectionSet = obj.selectionSet;
        }

    };

    /**
     * 清除过滤器
     *
     */
    this.clear = function () {
        _filter = {};
        _fileFilter = {};
        _overriderByScene = false;
        _overriderByIds = {};
        _overriderByData = {};
        _selectionSet = null;
        _frozenSet = null;
        _isolateSet = null;
        _isolateCondition = null;
        _overriderCondition = null;
    };

    //DEBUG API
    /**
     * 获得可见过滤器
     *
     */
    this.getVisibleFilter = function () {
        return _filter;
    };

    /**
     * 获得文件过滤器
     *
     */
    this.getFileFilter = function () {
        return _fileFilter;
    };

    /**
     * 获得材质过滤器
     *
     */
    this.getOverriderByUserId = function () {
        return _overriderByIds;
    };

    /**
     * 获得自定义材质过滤器
     *
     */
    this.getOverriderByUserData = function () {
        return _overriderByData;
    };

    /**
     * 获得选中构件集对象
     *
     */
    this.getSelectionSet = function () {
        return _selectionSet;
    };

    /**
     * 获得双击选中构件集对象
     *
     */
    this.getDemolishSet = function () {
        return _frozenSet;
    };

    ////////////////////////////////////////////////////////////////////
    // Visbililty Filter API

    /**
     * 为【可见过滤器】设置过滤条件
     *
     * @param {Object} conditions - 过滤条件 conditions: {{'levelId':'F01'},{'categoryId':'21'}}
     */
    this.setVisibleConditions = function (conditions) {
        _filter.conditions = conditions;
    };

    /**
     * only show the nodes with the specified ids.
     *
     * @param {Array} ids - 构件 id 集合。 ids 已定义，为【可见构件集对象】批量添加属性， 否则，移除【可见构件集对象】属性
     * @remark 接口很怪
     */
    this.showByUserIds = function (ids) {

        if (ids) {

            _filter.visibleIds = {};
            var visibleIds = _filter.visibleIds;

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                visibleIds[ids[ii]] = true;
            }

        } else {
            delete _filter.visibleIds;
        }

    };

    /**
     * to remove - 参见 showByUserIds
     *
     * @param {Array} ids - 构件 id 集合。
     */
    this.setFilterByUserIds = function (ids) {
        this.showByUserIds(ids);
    };

    /**
     * 从【可见构件集对象】批量移除属性，并将【可见构件集对象】从【可见过滤器】中移除
     *
     *  @param {Array} ids - 构件 id 集合
     */
    this.removeShownUserIds = function (ids) {

        if (!_filter.visibleIds)
            return;

        var visibleIds = _filter.visibleIds;

        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            delete visibleIds[ids[ii]];
        }

        // check if empty
        for (var name in visibleIds) {
            return;
        }

        delete _filter.visibleIds;

    };

    /**
     * hide by the ids.
     *
     * @param {Array} ids - 构件 id 集合。ids 已定义，为【隐藏构件集对象】批量添加属性， 否则，从【可见过滤器】移除【隐藏构件集对象】
     */
    this.hideByUserIds = function (ids) {

        if (ids) {

            if (!_filter.invisibleIds)
                _filter.invisibleIds = {};

            var invisibleIds = _filter.invisibleIds;

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                invisibleIds[ids[ii]] = true;
            }
        } else {
            delete _filter.invisibleIds;
        }

    };

    /**
     * 从【隐藏构件集对象】中移除属性
     *
     * @param {Array} ids - 构件 id 集合
     */
    this.removeHiddenUserIds = function (ids) {

        if (!_filter.invisibleIds)
            return;

        var invisibleIds = _filter.invisibleIds;

        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            delete invisibleIds[ids[ii]];
        }

        // check if empty
        for (var name in invisibleIds) {
            return;
        }

        delete _filter.invisibleIds;

    };

    /**
     * 为【可见构件集对象】批量添加属性
     *
     * @param {Array} ids - 构件 id 集合
     */
    this.addFilterByUserIds = function (ids) {

        if (!ids)
            return;

        if (!_filter.visibleIds)
            _filter.visibleIds = {};

        var visibleIds = _filter.visibleIds;

        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            visibleIds[ids[ii]] = true;
        }
    };

    /**
     * 将值为value的构件id作为属性添加到【自定义可见过滤器】
     *
     * @param {String} name - 过滤器名字
     * @param {String} value - id 值
     */
    this.addUserFilter = function (name, value) {

        var filters = _filter.filters;

        if (filters === undefined) {
            _filter.filters = {};
            filters = _filter.filters;
        }

        if (filters[name] === undefined) {
            filters[name] = {};
        }

        filters[name][value] = true;
    };

    /**
     * 从名字为name的【自定义可见过滤器】中移除值为value的属性
     *
     * @param {String} name - 过滤器名字
     * @param {String} value - id 值
     */
    this.removeUserFilter = function (name, value) {

        var filters = _filter.filters;
        if (!filters)
            return;

        if (!filters[name])
            return;

        if (value === undefined) {
            delete filters[name];
        } else {

            if (filters[name][value]) {
                delete filters[name][value];
            }

            if (Object.getOwnPropertyNames(filters[name]).length == 0) {
                delete filters[name];
            }

        }
    };

    /**
     * 获得名字为name的【自定义可见过滤器】
     *
     * @param {String} name - 过滤器名字
     * @return {Object} 存在，返回对应的过滤器，否则，返回 undefined
     */
    this.getUserFilter = function (name) {

        if (_filter.filters) {
            return _filter.filters[name];
        }

        return undefined;
    };

    /**
     * 清除【自定义可见过滤器】
     *
     */
    this.clearUserFilters = function () {
        _filter = {};
    };

    /**
     * 为【文件过滤器】添加属性（文件 id）
     *
     * @param {String} fileId - 文件 id
     */
    this.addFileFilter = function (fileId) {
        _fileFilter[fileId] = 0;
    };

    /**
     * 从【文件过滤器】中移除属性（文件 id）
     *
     * @param {String} fileId - 文件 id
     * @remark 参数fileId未定义的，清除了整个容器，感觉不合理
     */
    this.removeFileFilter = function (fileId) {

        if (fileId === undefined) {
            _fileFilter = {};
        } else {

            if (_fileFilter[fileId] !== undefined) {
                delete _fileFilter[fileId];
            }

        }
    };

    /**
     * 判断【文件过滤器】中是否存在某个文件ID
     *
     * @param {String} fileId - 文件 id
     */
    this.hasFileFilter = function (fileId) {
        return _fileFilter[fileId] !== undefined;
    };

    /**
     * 判断对象是否在【文件过滤器】中
     *
     * @param {Object} object - node 节点对象
     */
    this.isFileFilter = function (object) {

        var userData = object.userData;

        if (userData) {

            var fileId = userData.sceneId;

            if (fileId) {
                return _fileFilter[fileId] !== undefined;
            }
        }

        return false;
    };

    /**
     * 判断【文件过滤器】是否非空对象
     *
     * @return {Boolean} true: 非空对象， false: 空对象
     */
    this.isNotNullFileFilter = function () {

        for(var id in _fileFilter) {

            if (_fileFilter.hasOwnProperty(id)) {
                return true;
            }

        }

        return false;
    };

    ////////////////////////////////////////////////////////////////////
    // material overrider API

    /**
     * 启用或禁用场景材质，用于场景半透明
     *
     * @param {Boolean} enable - 是否启用场景材质，true：启用，否则 禁用
     */
    this.enableSceneOverrider = function (enable) {
        _overriderByScene = enable;
    };

    /**
     * 判断是否启用场景材质
     *
     * @return {Boolean} true: 启用， false: 禁用
     */
    this.isSceneOverriderEnabled = function () {
        return _overriderByScene;
    };

    /**
     * 设置材质
     * 如果存在名为materialName的材质，则修改材质颜色
     * 如果不存在名为materialName的材质，则创建一个新材质
     * @param {String} materialName - 材质名
     * @param {Color} color - 材质颜色
     * @return 存在指定名称的材质，则用新颜色替换；不存在，则新建一个高亮材质
     */
    this.setOverriderMaterial = function (materialName, color) {

        var material = _overridedMaterials[materialName];

        if (material) {
            material.color = color;
            return material;
        } else {
            material = CLOUD.MaterialUtil.createHighlightMaterial({color: color});
            _overridedMaterials[materialName] = material;
            return material;
        }
    };

    /**
     * 分组设置材质， 一个 name 一个组 {name : {material : materialName, ids : {} }}
     *
     * @param {String} name - 材质对象名称标识（组名）。name 未定义，则清空【材质过滤器】数据
     * @param {Array} ids - 构件 id 集合。ids 未定义，则删除名为name材质对象
     * @param {String} materialName - 使用的材质名称
     */
    this.setOverriderByUserIds = function (name, ids, materialName) {

        // 如果名字未定义，则清空材质过滤器数据
        if (name === undefined) {
            _overriderByIds = {};
            return;
        }

        // 如果id集合未定义，则删除名为name材质
        if (ids === undefined) {

            if (_overriderByIds[name]) {
                delete _overriderByIds[name];
            }

        } else {

            var overrider = {};
            overrider.material = materialName;
            overrider.ids = {};

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                overrider.ids[ids[ii]] = true;
            }

            _overriderByIds[name] = overrider;
        }

    };

    /**
     * 设置自定义材质
     *
     * @param {String} name - 自定义材质名。name 未定义，则清空【自定义材质过滤器】数据
     * @param {String} value - 一般为构件 id 值。value 未定义，则从【自定义材质过滤器】删除属性值为name的对象
     * @param {String} materialName - 使用的材质名称
     */
    this.setUserOverrider = function (name, value, materialName) {

        if (name === undefined) {
            _overriderByData = {};
            return;
        }

        if (value === undefined) {

            if (_overriderByData[name]) {
                delete _overriderByData[name];
            }

        }
        else {

            if (!_overriderByData[name])
                _overriderByData[name] = {};

            _overriderByData[name][value] = materialName;
        }
    };

    /**
     * 从【自定义材质过滤器】中移除名为name的材质
     *
     * @param {String} name - 自定义材质名。name 未定义，则清空【自定义材质过滤器】数据
     * @param {String} value - 一般为构件 id 值。value 未定义，则移除【自定义材质过滤器】中的name属性值， 否则 移除【自定义材质过滤器】name属性下的value属性值
     */
    this.removeUserOverrider = function (name, value) {

        if (name === undefined) {
            _overriderByData = {};
            return;
        }

        if (!_overriderByData[name])
            return;

        if (value === undefined) {
            delete _overriderByData[name];
        } else {
            delete _overriderByData[name][value];
        }

    };

    /**
     * 设置材质覆盖条件
     *
     * @param {Object} conditions - 材质覆盖条件。
     *                               conditions: the condition array
     *                               condition = {condition:{levelName:'f01'}, material:name}
     */
    this.setConditionOverrider = function (conditions) {
        _overriderCondition = conditions;
    };

    ////////////////////////////////////////////////////////////////

    /**
     * 设置【选中构件】的材质颜色
     *
     * @param {Color} color - 十六进制颜色
     */
    this.setSelectionMaterial = function (color) {
        _overridedMaterials.selection.color = color;
    };

    /**
     * 为【选择集对象】批量设置属性 - 将构件id 作为属性附加到【选择集对象】中（会移除之前的所有属性）
     *
     * @param {Array} ids - 构件 id 集合
     * @return {Boolean} true: 附加属性成功或者清除属性成功
     * @ramark 这个接口定义有问题：返回值意义模糊
     */
    this.setSelectedIds = function (ids) {

        if (ids && ids.length > 0) {

            this.clearSelectionSet();

            _selectionSet = {};

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                _selectionSet[ids[ii]] = true;
            }

            return true;
        }

        if (_selectionSet) {

            this.clearSelectionSet();

            return true;
        }

        return false;
    };

    /**
     * 为【选择集对象】批量添加属性 - 将构件id 作为属性附加到【选择集对象】中（不移除之前的属性）
     *
     * @param {Array} ids - 构件 id 集合
     */
    this.addSelectedIds = function (ids) {

        if (!ids) return;

        if (!_selectionSet) {
            _selectionSet = {};
        }

        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            _selectionSet[ids[ii]] = true;
        }

    };

    /**
     * 从【选择集对象】中移除指定属性
     *
     * @param {String} id - 构件id
     * @return {Boolean} true: 移除成功， false：未找到指定属性。
     * @remark 返回值意义模糊
     */
    this.removeSelectedId = function (id) {

        if (_selectionSet && _selectionSet[id]) {

            delete _selectionSet[id];

            if (this.isNullSelectionSet())
                _selectionSet = null;


            return true;
        }
        return false;
    };

    /**
     * 移除【选择集对象】所有属性
     * 这里直接置为 null
     *
     */
    this.clearSelectionSet = function () {

        _selectionSet = null;

    };

    /**
     * 为【选择集对象】添加属性 或者 从【选择集对象】中移除属性
     *
     * @param {String} id - 构件 id
     * @param {String} value - 属性对应值， 默认为 true
     * @param {Boolean} removeIfExist - 是否移除存在的构件
     * @return {Boolean} true: 增加成功，false : 移除成功
     * @remark 返回值意义模糊
     */
    this.addSelectedId = function (id, value, removeIfExist) {
        if (!_selectionSet) {
            _selectionSet = {};
        }

        if (removeIfExist && this.removeSelectedId(id)) {

            return false;
        }

        _selectionSet[id] = value || true;

        return true;
    };

    /**
     * 【选择集对象】是否有属性
     *
     * @return {Boolean} true: 空对象， false：有属性
     */
    this.isNullSelectionSet = function () {

        for (var id in _selectionSet) {
            return false;
        }

        return true;
    };

    /**
     * 为【Demolish 集对象】批量设置属性 - 将构件id 作为属性附加到【Demolish 集对象】中（移除之前的属性）
     *
     * @param {Array} ids - 构件 id 集合。如果 ids 未定义，则将【Demolish 集对象】置为 null
     */
    this.setDemolishIds = function (ids) {

        if (ids && ids.length > 0) {

            this.clearDemolishSet();

            _frozenSet = {};

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                _frozenSet[ids[ii]] = true;
            }
        }
        else {
            _frozenSet = null;
        }
    };

    /**
     * 为【Demolish 集对象】批量添加属性 - 将构件id 作为属性附加到【Demolish 集对象】中（不移除之前的属性）
     *
     * @param {Array} ids - 构件 id 集合
     */
    this.addDemolishIds = function (ids) {

        if (!ids)
            return;

        if (!_frozenSet) {
            _frozenSet = {};
        }


        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            _frozenSet[ids[ii]] = true;
        }

    };

    /**
     * 为【Demolish 集对象】添加属性 - 将构件id 作为属性附加到【Demolish 集对象】中（不移除之前的属性），支持累加。
     *
     * @param {String} id - 构件id
     * @param {Boolean} removeIfExist - 是否移除已存在的属性
     * @return {Boolean} true: 添加属性成功，false：移除属性成功
     */
    this.addDemolishId = function (id, removeIfExist) {

        if (!_frozenSet) {
            _frozenSet = {};
        }

        if (removeIfExist) {
            if (_frozenSet[id]) {

                delete _frozenSet[id];

                if (this.isNullDemolishSet())
                    _frozenSet = null;

                return false;
            }
        }

        _frozenSet[id] = true;
        return true;
    };

    /**
     * 判断【Demolish 集对象】是否为空对象
     *
     * @return {Boolean} true：空，否则，非空
     */
    this.isNullDemolishSet = function () {

        for (var id in _frozenSet) {
            return false;
        }

        return true;
    };

    /**
     * 清除【Demolish 集对象】所有属性（Demolish 集对象 用于存放双击半透明的构件）
     * 这里直接置为null
     *
     */
    this.clearDemolishSet = function () {
        _frozenSet = null;
    };

    /**
     * 设置构件隔离条件
     *
     * @param {Object} conditions - 隔离条件 eg : conditions: [{'levelName':'F01'},{'categoryId':'21'}]
     */
    this.setIsolateCondition = function (conditions) {
        _isolateCondition = conditions;
    };

    /**
     * 为【隔离构件集合对象】批量设置属性 - 将构件id 作为属性附加到【隔离构件集合对象】中（移除之前的属性）
     *
     * @param {Array} ids - id 集合。 如果 ids 未定义，则将【隔离构件集合对象】置为 null
     */
    this.setIsolateByUserIds = function (ids) {

        if (ids && ids.length > 0) {

            _isolateSet = {};

            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                _isolateSet[ids[ii]] = true;
            }
        }
        else {
            _isolateSet = null;
        }
    };

    /**
     * 判断【隔离构件集合对象】是否为空对象
     *
     * @return {Boolean} true: 空对象， false：非空对象
     */
    this.isNullIsolateSet = function () {

        for (var id in _isolateSet) {
            return false;
        }

        return true;
    };

    /**
     * 判断【可见构件集合对象】是否为空对象
     *
     * @return {Boolean} true: 空对象， false：非空对象
     */
    this.isNullVisibleSet = function () {

        for (var id in _filter.visibleIds) {
            return false;
        }

        return true;
    };


    /**
     * 判断【隐藏构件集合对象】是否为空对象
     *
     * @return {Boolean} rue: 空对象， false：非空对象
     */
    this.isNullInVisibleSet = function () {

        for (var id in _filter.invisibleIds) {
            return false;
        }

        return true;
    };

    ////////////////////////////////////////////////////////////////
    /**
     * 判断构件是否可见
     *
     * @param {Object} node - 构件对象
     * @return {Boolean} true: 可见， 否则 不可见
     */
    this.isVisible = function (node) {

        if (node.customTag) {
            return true;
        }

        var id = node.name;

        if (_filter.visibleIds && _filter.visibleIds[id] === undefined) {
            return false;
        }

        if (_filter.invisibleIds && _filter.invisibleIds[id]) {
            return false;
        }

        var userData = node.userData;
        if (!userData)
            return true;

        var filters = _filter.filters;
        if (filters) {
            for (var item in filters) {

                var userValue = userData[item];
                if (userValue && filters[item][userValue] !== undefined) {
                    return false;
                }
            }
        }

        var conditions = _filter.conditions;
        if (conditions) {

            var len = conditions.length;
            if (len == 0)  // hide if visible array is empty
                return false;

            function matchCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }


            for (var idx = 0; idx < len; ++idx) {
                if (matchCondition(conditions[idx])) {
                    return true;
                }
            }

            // hide if not match.
            return false;
        }

        return true;
    };

    /**
     * 根据 id 判断构件是否可见
     *
     * @param {String} id - 构件id (userId)
     * @param {Object} userData - 自定义数据
     */
    this.isVisibleById = function (id , userData) {

        // if (node.customTag) {
        //     return true;
        // }
        //
        // var id = node.name;

        if (_filter.visibleIds && _filter.visibleIds[id] === undefined) {
            return false;
        }

        if (_filter.invisibleIds && _filter.invisibleIds[id]) {
            return false;
        }

        // var userData = node.userData;
        if (!userData)
            return true;

        var filters = _filter.filters;
        if (filters) {
            for (var item in filters) {

                var userValue = userData[item];
                if (userValue && filters[item][userValue] !== undefined) {
                    return false;
                }
            }
        }

        var conditions = _filter.conditions;
        if (conditions) {

            var len = conditions.length;
            if (len == 0)  // hide if visible array is empty
                return false;

            function matchCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }


            for (var idx = 0; idx < len; ++idx) {
                if (matchCondition(conditions[idx])) {
                    return true;
                }
            }

            // hide if not match.
            return false;
        }

        return true;
    };

    /**
     * 对象是否可以被pick
     *
     * @param {Object} object - 窗口宽
     * @return {Boolean} 是否可以pick - true: 对象可以被pick，false: 对象不可以pick
     */
    this.isSelectable = function (object) {

        var id = object.name;

        // 半透明的构件，不能pick
        if (_frozenSet && _frozenSet[id]) {
            return false;
        }

        // 不在集合中的构件属于半透明的构件，不能pick
        if (_isolateSet && !_isolateSet[id]) {
            return false;
        }

        //
        for (var item in _overriderByIds) {
            var overrider = _overriderByIds[item];
            if (overrider.ids[id])
                return true;
        }

        var userData = object.userData;
        if (!userData)
            return true;

        // 隔离
        if (_isolateCondition) {

            function matchIsoCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            for (var ii = 0, len = _isolateCondition.length; ii < len; ++ii) {
                var item = _isolateCondition[ii];
                if (matchIsoCondition(item)) {
                    return true;
                }
            }
        }

        // OTHER
        for (var item in _overriderByData) {
            var overrider = _overriderByData[item];
            var material = overrider[userData[item]];
            if (material !== undefined)
                return true;
        }

        // 场景半透明不能pick
        if (_overriderByScene)
            return false;

        return true;
    };

    /**
     * 根据构件对象获得构件材质
     *
     * @param {Object} object - 构件node节点
     */
    this.getOverridedMaterial = function (object) {

        if (object.customTag) {
            return null;
        }

        var id = object.name;

        // 半透明
        if (_frozenSet && _frozenSet[id]) {
            return _overridedMaterials.scene;
        }

        //隔离
        if (_isolateSet && !_isolateSet[id]) {
            return _overridedMaterials.scene;
        }

        // 选中
        if (_selectionSet && _selectionSet[id] !== undefined) {
            return _overridedMaterials.selection;
        }

        // 是否在ID集合材质过滤器中
        for (var item in _overriderByIds) {
            var overrider = _overriderByIds[item];
            if (overrider.ids[id])
                return _overridedMaterials[overrider.material];
        }

        var userData = object.userData;
        if (!userData)
            return null;

        // 自定义材质过滤器
        for (var item in _overriderByData) {
            var overrider = _overriderByData[item];
            var materialName = overrider[userData[item]];
            var material = _overridedMaterials[materialName];
            if (material !== undefined)
                return material;
        }

        if (_overriderCondition) {

            function matchCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            for (var ii = 0, len = _overriderCondition.length; ii < len; ++ii) {
                var item = _overriderCondition[ii];
                // 匹配成功，更改材质
                if (matchCondition(item.condition)) {
                    return _overridedMaterials[item.material];
                }
            }

        }

        if (_isolateCondition) {

            function matchIsoCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }


            var len = _isolateCondition.length;

            if (len > 0) {

                for (var ii = 0; ii < len; ++ii) {
                    var item = _isolateCondition[ii];
                    // 匹配成功，不更改材质
                    if (matchIsoCondition(item)) {
                        return null;
                    }
                }

                return _overridedMaterials.scene;
            }

        }

        // 场景材质
        if (_overriderByScene) {
            return _overridedMaterials.scene;
        }

        return null;
    };

    /**
     * 根据构件 id 及 user data 获得构件材质
     *
     * @param {String} id - 构件id (userId)
     * @param {Object} userData - 自定义数据
     */
    this.getOverridedMaterialById = function (id, userData) {

        // if (object.customTag) {
        //     return null;
        // }

        // var id = object.name;

        // 半透明
        if (_frozenSet && _frozenSet[id]) {
            return _overridedMaterials.scene;
        }

        //隔离
        if (_isolateSet && !_isolateSet[id]) {
            return _overridedMaterials.scene;
        }

        // 选中
        if (_selectionSet && _selectionSet[id] !== undefined) {
            return _overridedMaterials.selection;
        }

        // 是否在ID集合材质过滤器中
        for (var item in _overriderByIds) {
            var overrider = _overriderByIds[item];
            if (overrider.ids[id])
                return _overridedMaterials[overrider.material];
        }

        // var userData = object.userData;
        if (!userData)
            return null;

        // 自定义材质过滤器
        for (var item in _overriderByData) {
            var overrider = _overriderByData[item];
            var materialName = overrider[userData[item]];
            var material = _overridedMaterials[materialName];
            if (material !== undefined)
                return material;
        }

        if (_overriderCondition) {

            function matchCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            for (var ii = 0, len = _overriderCondition.length; ii < len; ++ii) {
                var item = _overriderCondition[ii];
                // 匹配成功，更改材质
                if (matchCondition(item.condition)) {
                    return _overridedMaterials[item.material];
                }
            }

        }

        if (_isolateCondition) {

            function matchIsoCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            var len = _isolateCondition.length;

            if (len > 0) {

                for (var ii = 0; ii < len; ++ii) {
                    var item = _isolateCondition[ii];
                    // 匹配成功，不更改材质
                    if (matchIsoCondition(item)) {
                        return null;
                    }
                }

                return _overridedMaterials.scene;
            }

        }

        // 场景材质
        if (_overriderByScene) {
            return _overridedMaterials.scene;
        }

        return null;
    };


    /**
     * 根据构件 id 及 user data 判断构件是否高亮(pick, highlight)
     *
     * @param {String} id - 构件id (userId)
     * @param {Object} userData - 自定义数据
     * @return {Boolean} true: 高亮
     */
    this.hasHighlightMaterial = function (id, userData) {

        // 选中
        if (_selectionSet && _selectionSet[id] !== undefined) {
            return true;
        }

        // 是否在ID集合材质过滤器中
        for (var item in _overriderByIds) {
            var overrider = _overriderByIds[item];
            if (overrider.ids[id])
                return true;
        }

        if (!userData)
            return false;

        // 自定义材质过滤器
        for (var item in _overriderByData) {
            var overrider = _overriderByData[item];
            var materialName = overrider[userData[item]];
            var material = _overridedMaterials[materialName];
            if (material !== undefined)
                return true;
        }

        if (_overriderCondition) {

            function matchCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            for (var ii = 0, len = _overriderCondition.length; ii < len; ++ii) {
                var item = _overriderCondition[ii];
                // 匹配成功，表示需要更改材质
                if (matchCondition(item.condition)) {
                    return true;
                }
            }

        }

        if (_isolateCondition) {

            function matchIsoCondition(condition) {

                for (var item in condition) {
                    if (condition[item] != userData[item])
                        return false;
                }

                return true;
            }

            var len = _isolateCondition.length;

            if (len > 0) {

                for (var ii = 0; ii < len; ++ii) {
                    var item = _isolateCondition[ii];
                    if (matchIsoCondition(item)) {
                        return false;
                    }
                }

                // return true;
            }
        }

        return false;
    };

    /**
     * 重置包围盒（世界系）
     *
     */
    this.resetSelectionBox = function () {
        _selectionBoundingBox.makeEmpty();
    };

    /**
     * 获得所有选中对象的包围盒（世界系）
     *
     */
    this.getSelectionBox = function () {
        return _selectionBoundingBox;
    };

    /**
     * 【选择集对象】是否为null
     *
     */
    this.isSelectionSetEmpty = function () {
        return _selectionSet == null;
    };

    /**
     * 计算渲染列表中所有选中对象的包围盒
     *
     * @param {Array} renderList - 渲染列表
     */
    this.computeSelectionBox = function (renderList) {

        if (_selectionSet == null)
            return false;

        for (var ii = 0; ii < renderList.length; ++ii) {

            var object = renderList[ii].object;

            if (_selectionSet[object.name] !== undefined) {

                if (!object.geometry) {
                    CLOUD.Logger.log("empty geometry!");
                    continue;
                }

                if (object.geometry.boundingBox == null) {
                    object.geometry.computeBoundingBox();
                }
                var box = object.geometry.boundingBox;

                if (box) {
                    var box2 = box.clone();
                    if (object.matrixWorld) {
                        box2.applyMatrix4(object.matrixWorld);
                    }

                    _selectionBoundingBox.expandByPoint(box2.min);
                    _selectionBoundingBox.expandByPoint(box2.max);
                }
            }

        }

        return true;
    };

    /**
     * 计算渲染列表中所有对象的包围盒
     *
     * @param {Array} renderList - 渲染列表
     */
    this.computeRenderObjectsBox = function (renderList) {
        var boundingBox = new THREE.Box3();
        for (var ii = 0; ii < renderList.length; ++ii) {
            var object = renderList[ii].object;
            if (!this.isVisible(object)) {
                continue;
            }

            if (object.customTag) {
                continue;
            }

            if (!object.geometry) {
                CLOUD.Logger.log("empty geometry!");
                continue;
            }
            if (object.geometry.boundingBox == null) {
                object.geometry.computeBoundingBox();
            }

            var box = object.geometry.boundingBox;
            if (box) {
                var box2 = box.clone();
                if (object.matrixWorld) {
                    box2.applyMatrix4(object.matrixWorld);
                }

                boundingBox.expandByPoint(box2.min);
                boundingBox.expandByPoint(box2.max);
            }
        }
        return boundingBox;
    };

    // ------------------- 隔离功能（隐藏／半透明）S ------------------- //

    // 将选中构件ID集合加入到【隐藏 - 未选中构件】集合中  - 显示选中的构件
    function pushToHideUnselectionSet() {

        if (_selectionSet) {
            _filter.visibleIds = {};
            var ids = _filter.visibleIds;
            for (var id in _selectionSet) {
                ids[id] = _selectionSet[id];
            }

        }
        else {
            //_filter.visibleIds = null;
        }


    }

    // 将选中构件ID集合加入到【隐藏 - 选中构件】集合中
    // 存在需要连续对其他构件隐藏的需求，加入清理状态, 默认不清除之前的数据
    function pushToHideSelectionSet(clear) {

        if (_selectionSet) {
            //_filter.invisibleIds = {};

            if (clear) {
                _filter.invisibleIds = {};
            } else {
                _filter.invisibleIds = _filter.invisibleIds || {}; // 连续对其他构件隐藏
            }

            var ids = _filter.invisibleIds;
            for (var id in _selectionSet) {
                ids[id] = _selectionSet[id];
            }

        }
        else {
            _filter.invisibleIds = null;
        }

    }


    // 将选中构件ID集合加入到【半透明 - 未选中构件】集合中
    function pushToTranslucentUnselectionSet() {

        if (_selectionSet) {
            _isolateSet = {};

            for (var id in _selectionSet) {
                _isolateSet [id] = _selectionSet[id];
            }

        }
        else {
            //_isolateSet  = null;
        }

    }

    // 将选中构件ID集合加入到【半透明 - 选中构件】集合中
    // 存在连续对其他构件半透明的需求，加入清理状态, 默认不清除之前的数据
    function pushToTranslucentSelectionSet(clear) {

        if (_selectionSet) {
            //_frozenSet = {};

            if (clear) {
                _frozenSet = {};
            } else {
                _frozenSet = _frozenSet || {}; // 连续对其他构件半透明
            }

            for (var id in _selectionSet) {
                _frozenSet[id] = _selectionSet[id];
            }

        }
        else {
            _frozenSet = null;
        }

    }

    /**
     * 设置【未选中的构件】隐藏状态
     *
     * @param {Boolean} enabled -  是否允许设置隐藏状态
     */
    this.setHideUnselected = function (enabled) {

        if (enabled) {
            pushToHideUnselectionSet();
        }

    };

    /**
     * 检查【未选中的构件】是否隐藏
     *
     */
    this.isHideUnselected = function () {
        return _filter.visibleIds !== undefined;
    };

    /**
     * 设置【选中构件】隐藏状态
     *
     * @param {Boolean} enabled - 是否允许设置隐藏状态
     * @param {Boolean} clear - 是否清除上一次的数据
     */
    this.setHideSelected = function (enabled, clear) {

        if (enabled) {

            pushToHideSelectionSet(clear);
        }
    };

    /**
     * 设置【已选构件】半透明状态
     *
     * @param {Boolean} enabled - 是否允许设置半透明状态
     * @param {Boolean} clear - 是否清除上一次的数据
     */
    this.setTranslucentSelected = function (enabled, clear) {

        if (enabled) {

            pushToTranslucentSelectionSet(clear);
        }

    };

    /**
     * 设置【未选构件】半透明状态
     *
     * @param {Boolean} enabled - 是否允许设置半透明状态
     */
    this.setTranslucentUnselected = function (enabled) {

        if (enabled) {

            pushToTranslucentUnselectionSet();
        }

    };

    /**
     * 取消所有半透明状态
     *
     */
    this.cancelTranslucentAll = function () {

        // 全场景半透明
        _overriderByScene = false;

        _frozenSet = null;

        _isolateSet = null;
    };

    /**
     * 恢复所有构件成显示状态
     *
     */
    this.revertAll = function () {

        _frozenSet = null;
        _selectionSet = null;

        _filter = {};

        _isolateSet = null;
        _overriderByScene = false;

        _overriderCondition = null;
        _isolateCondition = null;
    };

    /**
     * 是否处于隔离状态
     * 构件被选中，构件被隔离都表示处于隔离状态
     *
     */
    this.isIsolateState = function () {

        return !this.isNullSelectionSet() || !this.isNullDemolishSet() || !this.isNullIsolateSet() || !this.isNullVisibleSet() || !this.isNullInVisibleSet() || _overriderByScene;
    };

    // ------------------- 隔离功能（隐藏／半透明）E ------------------- //
};
/**
* The object to be held within the Object Pool.
*/
CLOUD.MeshEx = function () {

    THREE.Mesh.call(this);

    this.type = 'MeshEx';

    this.matrixAutoUpdate = false; // disable auto update
    this.visible = false; // 使用这个状态标志，对于过滤是否有影响？

    this.geometry = CLOUD.GeomUtil.EmptyGeometry;
    this.material = CLOUD.MaterialUtil.DefaultMaterial;

};

CLOUD.MeshEx.prototype = Object.create(THREE.Mesh.prototype);
CLOUD.MeshEx.prototype.constructor = CLOUD.MeshEx;

/**
 * Sets an object not in use to default values
 */
CLOUD.MeshEx.prototype.init = function (parameters) {

    if (parameters && parameters.parent) {
        parameters.parent.add(this);
    }

};

/**
 * Spawn an object
 */
CLOUD.MeshEx.prototype.spawn = function (parameters) {

    if (parameters.userId !== undefined) {
        this.name = parameters.userId;
    } else if (parameters.nodeId !== undefined) {
        this.name = parameters.nodeId;
    }

    if (parameters.geometry) {
        this.geometry = parameters.geometry;
    }

    if (parameters.material) {
        this.material = parameters.material;
    }

    if (parameters.matrix) {
        this.matrix.copy(parameters.matrix);
        this.updateMatrixWorld(true);//  this.matrixAutoUpdate = false;需要强制更新
    } else {
        this.matrix.identity();
        this.updateMatrixWorld(true);//  this.matrixAutoUpdate = false;需要强制更新
    }

    if (parameters.databagId) {
        this.databagId = parameters.databagId;
    } else {
        this.databagId = "";
    }

    if (parameters.userData) {
        this.userData = parameters.userData;
    } else {
        if (this.userData) {
            this.userData = null;
        }
    }


    this.visible = true;
    // 适配Three.js
    this.frustumCulled = false;
    this.material.visible = true;
};

/**
 * Resets the object values to default
 */
CLOUD.MeshEx.prototype.clear = function () {

    this.geometry = CLOUD.GeomUtil.EmptyGeometry;
    this.material = CLOUD.MaterialUtil.DefaultMaterial;
    this.visible = false;
    // 适配Three.js
    this.frustumCulled = true;
    this.material.visible = false;
};


/**
 * Custom Pool object. Holds objects to be managed to prevent
 * garbage collection.
 */
CLOUD.ObjectPool = function (classType, size) {

    this.cls = classType;
    this.size = size || 1000;// Max objects allowed in the pool
    this._pool = [];
    this.counter = 0;
};

/**
 * Populates the pool array with objects
 */
CLOUD.ObjectPool.prototype.init = function (parameters) {

    for (var i = 0; i < this.size; i++) {

        // Initialize the objects
        var obj = new this.cls();
        obj.init(parameters);
        this._pool[i] = obj;

    }
};

CLOUD.ObjectPool.prototype.resize = function (size, parameters) {

    this.size = size || 1000;
    this.collect();
    this.init(parameters);
};

/**
 * Grabs the last item in the list and initializes it and
 * pushes it to the front of the array.
 */
CLOUD.ObjectPool.prototype.get = function (parameters) {

    if (this.counter >= this.size) {

        // CLOUD.Logger.log("the pool is full");

    } else {

        this._pool[this.counter].spawn(parameters);

        return this._pool[this.counter++];
    }

    return null;
};

CLOUD.ObjectPool.prototype.clear = function () {

    for (var i = 0; i < this.size; i++) {

        this._pool[i].clear();
    }

    this.counter = 0;

};

/**
 * Allow collection of all objects in the pool
 */
CLOUD.ObjectPool.prototype.collect = function() {

    // just forget the list and let the garbage collector reap them
    this._pool = []; // fresh and new
    this.counter = 0;

};



var CloudTouch	= CloudTouch || {};

(function() {
    var INPUT_START = 1;
    var INPUT_MOVE = 2;
    var INPUT_END = 4;
    var INPUT_CANCEL = 8;

    var TOUCH_INPUT_MAP = {
        touchstart: INPUT_START,
        touchmove: INPUT_MOVE,
        touchend: INPUT_END,
        touchcancel: INPUT_CANCEL
    };

    var INPUT_TYPE_TOUCH = 'touch';

    var DIRECTION_NONE = 1;
    var DIRECTION_LEFT = 2;
    var DIRECTION_RIGHT = 4;
    var DIRECTION_UP = 8;
    var DIRECTION_DOWN = 16;

    var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
    var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
    var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

    var PROPS_XY = ['x', 'y'];
    var PROPS_CLIENT_XY = ['clientX', 'clientY'];

    // 处理touch事件
    var touchsHandler = function(manage, event) {
        var manage_scope = manage;
        var input = {
            pointers: event.touches,
            changedPointers: event.changedTouches,
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: event
        };

        var pointersLen = event.touches.length;
        var changedPointersLen = event.changedTouches.length;
        var eventType = TOUCH_INPUT_MAP[event.type];
        var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
        var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

        input.isFirst = !!isFirst;
        input.isFinal = !!isFinal;

        if (isFirst) {
            manage_scope.session = {};
        }

        input.eventType = eventType;

        computeTouchData(manage_scope, input);

        manage_scope.session.prevInput = input;
    };

    // 复制touch数据
    var simpleCloneTouchData = function(input) {
        var pointers = [];
        var i = 0;
        while (i < input.pointers.length) {
            pointers[i] = {
                clientX: Math.round(input.pointers[i].clientX),
                clientY: Math.round(input.pointers[i].clientY)
            };
            i++;
        }

        return {
            timeStamp: Date.now(),
            pointers: pointers,
            center: getCenter(pointers),
            deltaX: input.deltaX || 0,
            deltaY: input.deltaY || 0
        };
    }

    // 得到所有点的中心点
    var getCenter = function(pointers) {
        var pointersLength = pointers.length;

        // no need to loop when only one touch
        if (pointersLength === 1) {
            return {
                x: Math.round(pointers[0].clientX),
                y: Math.round(pointers[0].clientY)
            };
        }

        var x = 0, y = 0, i = 0;
        while (i < pointersLength) {
            x += pointers[i].clientX;
            y += pointers[i].clientY;
            i++;
        }

        return {
            x: Math.round(x / pointersLength),
            y: Math.round(y / pointersLength)
        };
    }

    // 计算并缓存touch数据
    var computeTouchData = function(manager, input) {
        var session = manager.session;
        var pointers = input.pointers;
        var pointersLength = pointers.length;

        // store the first input to calculate the distance and direction
        if (!session.firstInput) {
            session.firstInput = simpleCloneTouchData(input);
        }

        // to compute scale and rotation we need to store the multiple touches
        if (pointersLength > 1 && !session.firstMultiple) {
            session.firstMultiple = simpleCloneTouchData(input);
        } else if (pointersLength === 1) {
            session.firstMultiple = false;
        }

        var firstInput = session.firstInput;
        var firstMultiple = session.firstMultiple;
        var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

        var center = input.center = getCenter(pointers);
        input.timeStamp = Date.now();
        input.deltaTime = input.timeStamp - firstInput.timeStamp;

        input.angle = getAngle(offsetCenter, center);
        input.distance = getDistance(offsetCenter, center);

        input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
        input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

        // 计算偏移量
        computeDeltaXY(session, input);
        input.offsetDirection = getDirection(input.deltaX, input.deltaY);

        input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length > session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);
    }

    // 计算输入数据的偏移量
    var computeDeltaXY = function(session, input) {
        var center = input.center;
        var offset = session.offsetDelta || {};
        var prevDelta = session.prevDelta || {};
        var prevInput = session.prevInput || {};

        if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
            prevDelta = session.prevDelta = {
                x: prevInput.deltaX || 0,
                y: prevInput.deltaY || 0
            };

            offset = session.offsetDelta = {
                x: center.x,
                y: center.y
            };
        }

        // 相对第一个点的偏移量
        input.deltaX = prevDelta.x + (center.x - offset.x);
        input.deltaY = prevDelta.y + (center.y - offset.y);

        if (input.eventType === INPUT_START) {
            // 相对前一个点的偏移量
            input.relativeDeltaX = 0;
            input.relativeDeltaY = 0;
            // 相对前一个点的旋转量
            input.relativeRotation = 0;
            // 相对前一个点的缩放量
            input.relativeScale = 1;
            // 相对前一个点的角度变化量
            input.deltaAngle = 0;
        } else {
            // 相对前一个点的偏移量
            input.relativeDeltaX = center.x - prevInput.center.x
            input.relativeDeltaY = center.y - prevInput.center.y;
            // 相对前一个点的旋转量
            input.relativeRotation = input.rotation - prevInput.rotation;
            // 相对前一个点的缩放量
            input.relativeScale = input.scale / prevInput.scale;
            // 相对前一个点的角度变化量
            input.deltaAngle = input.angle - prevInput.angle;
        }

    }

    // 获得点的方向
    var getDirection = function(x, y) {
        if (x === y) {
            return DIRECTION_NONE;
        }

        if (Math.abs(x) >= Math.abs(y)) {
            return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }

        return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }

    // 计算两个点的距离
    var getDistance = function(p1, p2, props) {
        if (!props) {
            props = PROPS_XY;
        }
        var x = p2[props[0]] - p1[props[0]],
            y = p2[props[1]] - p1[props[1]];

        return Math.sqrt((x * x) + (y * y));
    }

    // 计算两个点的角度
    var getAngle = function(p1, p2, props) {
        if (!props) {
            props = PROPS_XY;
        }
        var x = p2[props[0]] - p1[props[0]],
            y = p2[props[1]] - p1[props[1]];
        return Math.atan2(y, x);
    }

    // 计算两个点集的旋转角度
    var getRotation = function(start, end) {
        return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
    }

    // 计算两个点集的缩放系数
    var getScale =function(start, end) {
        return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
    }

    // export it
    CloudTouch.proxy = {
        INPUT_START: INPUT_START,
        INPUT_MOVE: INPUT_MOVE,
        INPUT_END: INPUT_END,
        INPUT_CANCEL: INPUT_CANCEL,
        DIRECTION_NONE: DIRECTION_NONE,
        DIRECTION_LEFT: DIRECTION_LEFT,
        DIRECTION_RIGHT: DIRECTION_RIGHT,
        DIRECTION_UP: DIRECTION_UP,
        DIRECTION_DOWN: DIRECTION_DOWN,
        DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
        DIRECTION_VERTICAL: DIRECTION_VERTICAL,
        DIRECTION_ALL: DIRECTION_ALL,
        touchsHandler	: touchsHandler
    };
})();
CLOUD.Object3D = function () {

    Object.defineProperty(this, 'id', {value: THREE.Object3DIdCount++});

    this.name = '';
    this.type = 'Object3D';

    this.parent = null;

    this.channels = new THREE.Channels();
    this.children = [];

    var position = new THREE.Vector3();
    var rotation = new THREE.Euler();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3(1, 1, 1);

    function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
    }

    function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, undefined, false);
    }

    rotation.onChange(onRotationChange);
    quaternion.onChange(onQuaternionChange);

    Object.defineProperties(this, {
        position: {
            enumerable: true,
            value: position
        },
        rotation: {
            enumerable: true,
            value: rotation
        },
        quaternion: {
            enumerable: true,
            value: quaternion
        },
        scale: {
            enumerable: true,
            value: scale
        },
        modelViewMatrix: {
            value: new THREE.Matrix4()
        },
        normalMatrix: {
            value: new THREE.Matrix3()
        }
    });

    this.matrix = new THREE.Matrix4();
    this.matrixWorld = new THREE.Matrix4();
    this.matrixWorldNeedsUpdate = true;

    this.visible = true;

    this.renderOrder = 0;
};


CLOUD.Object3D.prototype = {

    constructor: CLOUD.Object3D,

    applyMatrix: function (matrix) {
        this.matrix.multiplyMatrices(matrix, this.matrix);
    },

    localToWorld: function (vector) {
        return vector.applyMatrix4(this.matrixWorld);
    },

    worldToLocal: function () {
        var m1 = new THREE.Matrix4();

        return function (vector) {
            return vector.applyMatrix4(m1.getInverse(this.matrixWorld));
        };

    }(),

    getWorldPosition: function (optionalTarget) {
        var result = optionalTarget || new THREE.Vector3();
        return result.setFromMatrixPosition(this.matrixWorld);
    },

    raycast: function () {
    },

    traverse: function (callback) {
        callback(this);
    },

    traverseVisible: function (callback) {

        if (this.visible === false) return;

        callback(this);

    },

    traverseAncestors: function (callback) {
        var parent = this.parent;

        if (parent !== null) {
            callback(parent);
            parent.traverseAncestors(callback);
        }

    },

    updateMatrix: function () {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    },

    updateMatrixWorld: function (force) {

        if (this.matrixWorldNeedsUpdate === true || force) {

            if (this.parent === null) {
                this.matrixWorld.copy(this.matrix);
            } else {
                this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            }

            this.matrixWorldNeedsUpdate = false;
            force = true;
        }

        // update children
        if (this.children) {

            for (var i = 0, len = this.children.length; i < len; i++) {
                this.children[i].updateMatrixWorld(force);
            }
        }

    }
};

THREE.EventDispatcher.prototype.apply(CLOUD.Object3D.prototype);


CLOUD.Group = function () {
    "use strict";

    CLOUD.Object3D.call(this);

    this.type = 'Group';

    this.children = [];

    this.boundingBox = null;

};

CLOUD.Group.prototype = Object.create(CLOUD.Object3D.prototype);
CLOUD.Group.prototype.constructor = CLOUD.Group;

CLOUD.Group.prototype.raycast = (function () {

    var inverseMatrix = new THREE.Matrix4();
    var ray = new THREE.Ray();

    return function (raycaster, intersects) {

        var boundingBox = this.boundingBox;

        // Check boundingBox before continuing
        inverseMatrix.getInverse(this.matrixWorld);
        ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

        if (boundingBox !== null) {
            if (ray.isIntersectionBox(boundingBox) === false) {
                return false;
            }
        }

        return true;
    };
}());


CLOUD.Group.prototype.add = function (object) {

    if (arguments.length > 1) {

        for (var i = 0; i < arguments.length; i++) {
            this.add(arguments[i]);
        }

        return this;

    }

    if (object === this) {
        console.error("CLOUD.Object3D.add: object can't be added as a child of itself.", object);
        return this;

    }

    if (object instanceof CLOUD.Object3D || object instanceof THREE.Object3D) {

        if (object.parent !== null) {
            object.parent.remove(object);
        }

        object.parent = this;
        object.dispatchEvent({ type: 'added' });

        this.children.push(object);

    } else {
        console.error("CLOUD.Object3D.add: object not an instance of Object3D.", object);
    }

    return this;

};

CLOUD.Group.prototype.remove = function (object) {

    if (arguments.length > 1) {

        for (var i = 0; i < arguments.length; i++) {
            this.remove(arguments[i]);
        }

    }

    var index = this.children.indexOf(object);

    if (index !== -1) {
        object.parent = null;
        object.dispatchEvent({ type: 'removed' });
        this.children.splice(index, 1);
    }

};


CLOUD.Group.prototype.traverseVisible = function (callback) {

    if (this.visible === false) return;

    callback(this);

    var children = this.children;

    for (var i = 0, l = children.length; i < l; i++) {
        children[i].traverseVisible(callback);
    }
};

CLOUD.Group.prototype.traverse = function (callback) {

    callback(this);

    var children = this.children;

    for (var i = 0, l = children.length; i < l; i++) {
        children[i].traverse(callback);
    }

};

CLOUD.Camera = function (width, height, fov, near, far) {

    THREE.CombinedCamera.call(this, width, height, fov, near, far);

    this.realUp = this.up.clone(); //
    this.target = new THREE.Vector3();
    this.dirty = false;

    this.positionPlane = new THREE.Plane();
    this.projScreenMatrix = new THREE.Matrix4();
    this.viewProjInverse = new THREE.Matrix4();

};

CLOUD.Camera.prototype = Object.create(THREE.CombinedCamera.prototype);
CLOUD.Camera.prototype.constructor = CLOUD.Camera;

CLOUD.Camera.prototype.updateMVP = function () {
    if (this.parent === null)
        this.updateMatrixWorld();

    this.matrixWorldInverse.getInverse(this.matrixWorld);
    this.updatePositionPlane();

    this.projScreenMatrix.multiplyMatrices(this.projectionMatrix, this.matrixWorldInverse);
    this.viewProjInverse.getInverse(this.projScreenMatrix);
};

CLOUD.Camera.prototype.LookAt = function (target, dir, up, focal) {
    var offset = new THREE.Vector3();
    offset.copy(dir);
    if (focal !== undefined)
        offset.setLength(focal);
    this.position.subVectors(target, offset);
    this.up = up;
    this.lookAt(target);
    this.realUp = up.clone();
    this.target = target.clone();
};

CLOUD.Camera.prototype.updatePositionPlane = function(){

    this.positionPlane.setFromNormalAndCoplanarPoint(this.getWorldDirection(), this.position);

};
// 用THREE.Camera.getWorldDirection替换
//CLOUD.Camera.prototype.LookDir = function () {
//    var vector = new THREE.Vector3(0, 0, -1);
//    vector.applyQuaternion(this.quaternion);
//    return vector;
//};

CLOUD.Camera.prototype.setStandardView = function (stdView, bbox) {

    //var target = bbox.center();

    var target;

    if (bbox) {
        target = bbox.center();
    } else {
        target = new THREE.Vector3(0, 0, 0);
    }

    var focal = CLOUD.GlobalData.SceneSize / 2;
    switch (stdView) {
        case CLOUD.EnumStandardView.ISO:
            var position = new THREE.Vector3(-CLOUD.GlobalData.SceneSize, CLOUD.GlobalData.SceneSize, CLOUD.GlobalData.SceneSize);
            //target = new THREE.Vector3();
            var dir = new THREE.Vector3();
            dir.subVectors(target, position);           
            this.LookAt(target, dir, THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.Top:
            this.LookAt(target, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, -1), focal);
            // 这里恢复up方向有问题，应该在本次渲染结束后才能恢复。
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.Bottom:
            this.LookAt(target, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.Front:
            //this.LookAt(target, new THREE.Vector3(0, -0.5, -1), new THREE.Vector3(0, 1, 0), focal);
            this.LookAt(target, new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.Back:
            this.LookAt(target, new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.Right:
            this.LookAt(target, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.Left:
            this.LookAt(target, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.SouthEast:
            // 将视点抬高，避开坐标轴重叠 (-1, 0, -1)  --> (-1, -1, -1)
            //this.LookAt(target, new THREE.Vector3(-1, -1, -1), new THREE.Vector3(0, 1, 0), focal);
            // 注意：之前修改过bug（GGP-11834：标准视图与Jetfire不一致）。修改方法是抬高视点。
            // 但是在viewhouse的多维度观察视角下，抬高视点对应的实际上是RoofSouthEast,所以这里恢复视点。
            this.LookAt(target, new THREE.Vector3(-1, 0, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.SouthWest:
            // 将视点抬高，避开坐标轴重叠 (1, 0, -1)  --> (1, -1, -1)
            //this.LookAt(target, new THREE.Vector3(1, -1, -1), new THREE.Vector3(0, 1, 0), focal);
            // 注意：之前修改过bug（GGP-11834：标准视图与Jetfire不一致）。修改方法是抬高视点。
            // 但是在viewhouse的多维度观察视角下，抬高视点对应的实际上是RoofSouthEast,所以这里恢复视点
            this.LookAt(target, new THREE.Vector3(1, 0, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.NorthWest:
            // 将视点抬高，避开坐标轴重叠 (1, 0, 1)  --> (1, -1, 1)
            //this.LookAt(target, new THREE.Vector3(1, -1, 1), new THREE.Vector3(0, 1, 0), focal);
            // 注意：之前修改过bug（GGP-11834：标准视图与Jetfire不一致）。修改方法是抬高视点。
            // 但是在viewhouse的多维度观察视角下，抬高视点对应的实际上是NorthWest,所以这里恢复视点
            this.LookAt(target, new THREE.Vector3(1, 0, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.NorthEast:
            // 将视点抬高，避开坐标轴重叠 (-1, 0, 1)  --> (-1, -1, 1)
            //this.LookAt(target, new THREE.Vector3(-1, -1, 1), new THREE.Vector3(0, 1, 0), focal);
            // 注意：之前修改过bug（GGP-11834：标准视图与Jetfire不一致）。修改方法是抬高视点。
            // 但是在viewhouse的多维度观察视角下，抬高视点对应的实际上是RoofNorthEast,所以这里恢复视点
            this.LookAt(target, new THREE.Vector3(-1, 0, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomFront:
            this.LookAt(target, new THREE.Vector3(0, 1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomBack:
            this.LookAt(target, new THREE.Vector3(0, 1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomRight:
            this.LookAt(target, new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomLeft:
            this.LookAt(target, new THREE.Vector3(1, 1, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomSouthEast:
            this.LookAt(target, new THREE.Vector3(-1, 1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomSouthWest:
            this.LookAt(target, new THREE.Vector3(1, 1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomNorthWest:
            this.LookAt(target, new THREE.Vector3(1, 1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.BottomNorthEast:
            this.LookAt(target, new THREE.Vector3(-1, 1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofFront:
            this.LookAt(target, new THREE.Vector3(0, -1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofBack:
            this.LookAt(target, new THREE.Vector3(0, -1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofRight:
            this.LookAt(target, new THREE.Vector3(-1, -1, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofLeft:
            this.LookAt(target, new THREE.Vector3(1, -1, 0), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofSouthEast:
            this.LookAt(target, new THREE.Vector3(-1, -1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofSouthWest:
            this.LookAt(target, new THREE.Vector3(1, -1, -1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofNorthWest:
            this.LookAt(target, new THREE.Vector3(1, -1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.RoofNorthEast:
            this.LookAt(target, new THREE.Vector3(-1, -1, 1), new THREE.Vector3(0, 1, 0), focal);
            break;
        case CLOUD.EnumStandardView.TopTurnRight:
            this.LookAt(target, new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.TopTurnBack:
            this.LookAt(target, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.TopTurnLeft:
            this.LookAt(target, new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BottomTurnRight:
            this.LookAt(target, new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BottomTurnBack:
            this.LookAt(target, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, -1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BottomTurnLeft:
            this.LookAt(target, new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.FrontTurnTop:
            this.LookAt(target, new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.FrontTurnLeft:
            this.LookAt(target, new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.FrontTurnRight:
            this.LookAt(target, new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.RightTurnTop:
            this.LookAt(target, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -1, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.RightTurnFront:
            this.LookAt(target, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.RightTurnBack:
            this.LookAt(target, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BackTurnTop:
            this.LookAt(target, new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BackTurnLeft:
            this.LookAt(target, new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.BackTurnRight:
            this.LookAt(target, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.LeftTurnTop:
            this.LookAt(target, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.LeftTurnBack:
            this.LookAt(target, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;
        case CLOUD.EnumStandardView.LeftTurnFront:
            this.LookAt(target, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), focal);
            //this.up.copy(THREE.Object3D.DefaultUp);
            break;

    }
    this.updateProjectionMatrix();

    return target;
};

/**
 * 缩放到指定的包围盒范围
 *
 * @param {THREE.Box3} bound - 包围盒
 * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
 * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
 * @param {THREE.Vector3} direction - 相机观察方向
 */
CLOUD.Camera.prototype.zoomToBBox = function (bound, margin, ratio, direction) {

    ratio = ratio || 1.0;
    margin = margin || 0.05;

    var bbox = new THREE.Box3();
    bbox.copy(bound);
    
    bbox.expandByScalar(bound.size().length() * margin);

    var dir = direction ? direction : this.getWorldDirection();
    var up = this.up;
    var aspect = this.aspect;
    var halfFov = THREE.Math.degToRad(this.fov * 0.5); // 转成弧度

    var boxSize = bbox.size();
    var center = bbox.center();
    var radius = boxSize.length() * 0.5;
    var distToCenter = radius / Math.sin(halfFov) * ratio;

    var offset = new THREE.Vector3();
    offset.copy(dir);
    offset.setLength(distToCenter);

    var position = new THREE.Vector3();
    position.subVectors(center, offset);

    // ---------- 计算新位置 S ----------------- //
    var right = new THREE.Vector3();
    right.crossVectors(dir, up);
    right.normalize();

    var newUp = new THREE.Vector3();
    newUp.crossVectors(dir, right);
    newUp.normalize();

    var vertPlane = new THREE.Plane();
    vertPlane.setFromNormalAndCoplanarPoint(right, position);

    var horzPlane = new THREE.Plane();
    horzPlane.setFromNormalAndCoplanarPoint(newUp, position);

    var maxHeight = 0;
    var maxDistForHeight = 0;
    var maxWidth = 0;
    var maxDistForWidth = 0;

    var corners = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ];

    corners[0].set(bbox.min.x, bbox.min.y, bbox.min.z); // 000
    corners[1].set(bbox.min.x, bbox.min.y, bbox.max.z); // 001
    corners[2].set(bbox.min.x, bbox.max.y, bbox.min.z); // 010
    corners[3].set(bbox.min.x, bbox.max.y, bbox.max.z); // 011
    corners[4].set(bbox.max.x, bbox.min.y, bbox.min.z); // 100
    corners[5].set(bbox.max.x, bbox.min.y, bbox.max.z); // 101
    corners[6].set(bbox.max.x, bbox.max.y, bbox.min.z); // 110
    corners[7].set(bbox.max.x, bbox.max.y, bbox.max.z);  // 111

    for (var i = 0; i < 8; i++) {
        var v = new THREE.Vector3();
        v.subVectors(corners[i], position);
        var dist = Math.abs(v.dot(dir));

        var h1 = Math.abs(horzPlane.distanceToPoint(corners[i]));
        var w1 = h1 * aspect;
        var w2 = Math.abs(vertPlane.distanceToPoint(corners[i]));
        var h2 = w2 / aspect;

        var h = Math.max(h1, h2);
        var w = Math.max(w1, w2);

        if (!maxHeight || !maxDistForHeight || h > maxHeight * dist / maxDistForHeight) {
            maxHeight = h;
            maxDistForHeight = dist;
        }

        if (!maxWidth || !maxDistForWidth || w > maxWidth * dist / maxDistForWidth) {
            maxWidth = w;
            maxDistForWidth = dist;
        }
    }

    var cameraDist = maxHeight / Math.tan(halfFov) + (distToCenter - maxDistForHeight);
    if (aspect < 1.0) {
        cameraDist = maxWidth / Math.tan(halfFov) + (distToCenter - maxDistForWidth);
    }

    offset.copy(dir).normalize().setLength(cameraDist);
    position.subVectors(center, offset);


    // ---------- 计算新位置 E ----------------- //

    this.position.copy(position);
    this.lookAt(center);
    this.updateProjectionMatrix();
    this.target.copy(center);
    return center;
};

CLOUD.Camera.prototype.computeRay = function (cx, cy, domElement) {
    var viewportDim = new THREE.Vector2();

    if (domElement === undefined) {
        viewportDim.x = window.innerWidth;
        viewportDim.y = window.innerHeight;
    }
    else {
        var element = domElement === document ? domElement.body : domElement;

        // clientWidth: 是对象可见的宽度，不包含滚动条等边线，会随窗口的显示大小改变。
        // offsetWidth:	是对象的可见宽度，包含滚动条等边线，会随窗口的显示大小改变。
        // CloudCameraEditor.getContainerDimensions 使用的是offsetWidth, offsetHeight,保持统一。
        //viewportDim.x = element.clientWidth;
        //viewportDim.y = element.clientHeight;
        viewportDim.x = element.offsetWidth;
        viewportDim.y = element.offsetHeight;
    }

    // To Viewport
    var viewPos = new THREE.Vector2();

    // 注意这里传入的cx, cy是相对视口的值（即已做过偏移）
    viewPos.x = (cx / viewportDim.x) * 2 - 1;
    viewPos.y = -(cy / viewportDim.y) * 2 + 1;

    var ray = new THREE.Ray();
    if (this.isPerspective) {
        ray.origin.copy(this.position);
        ray.direction.set(viewPos.x, viewPos.y, 0.5).unproject(this).sub(this.position).normalize();
    }
    else {
        ray.origin.set(viewPos.x, viewPos.y, -1).unproject(this);
        ray.direction.set(0, 0, -1).transformDirection(this.matrixWorld);
    }

    return ray;
};

CLOUD.Camera.prototype.screenToWorld = function (cx, cy, domElement, target) {

    var ray = this.computeRay(cx, cy, domElement);
    // plane on target
    var dir = this.getWorldDirection().normalize();

    var plane = new THREE.Plane(dir);
    plane.setFromNormalAndCoplanarPoint(dir, target);

    return ray.intersectPlane(plane, target);
};

CLOUD.Camera.prototype.clone = function () {

    var camera = new CLOUD.Camera(this.right * 2.0, this.top * 2.0, this.fov, this.near, this.far);

    camera.position.copy(this.position);
    camera.up.copy(this.up);

    if (this.realUp)
        camera.realUp.copy(this.realUp);

    if( this.target )
        camera.target.copy(this.target);

    camera.aspect = this.aspect;
    camera.fov = this.fov;
    camera.near = this.near;
    camera.far = this.far;

    camera.left = this.left;
    camera.right = this.right;
    camera.top = this.top;
    camera.bottom = this.bottom;

    camera.zoom = this.zoom;
    camera.isPerspective = this.isPerspective;

    this.updateProjectionMatrix();

    return camera;
};
CLOUD.Scene = function () {

    CLOUD.Group.call(this);

    this.type = 'Scene';
    this.autoUpdate = false; // 不自动更新

    this.filter = new CLOUD.Filter();
    this.raycaster = new CLOUD.Raycaster();
    this.raycaster.setFilter(this.filter);

    this.rootNode = new CLOUD.Group();
    this.rootNode.sceneRoot = true;
    this.add(this.rootNode);

    this.clipWidget = null;
    this.clipPlanes = null;

    this.boundingBoxInner = new THREE.Box3();

    // CLOUD.Logger.time("ObjectPool");
    this.meshPool = new CLOUD.ObjectPool(CLOUD.MeshEx, CLOUD.GlobalData.maxObjectNumInPool);
    this.meshPool.init({parent: this.rootNode});
    // CLOUD.Logger.timeEnd("ObjectPool");

    if (CLOUD.GlobalData.DirectionalLight) {
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        this.hemisphereLight.position.set(0, 500, 0);
        this.add(this.hemisphereLight);
        this.dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        this.dirLight.color.setHSL( 0.1, 1, 0.95 );
        this.dirLight.position.set( -1, 0.75, 1 );
        this.dirLight.position.multiplyScalar( 50 );
        this.add(this.dirLight);
    }
    else {
        this.lightOffset = new THREE.Vector3(-1, -1, -1);
        this.lightOffset.normalize();
        this.lampHead = new THREE.DirectionalLight(0xB7B7CE, 0.8);
        this.lampAssist = new THREE.DirectionalLight(0x333333, 0.8);
        this.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6));
        this.add(this.lampHead);
        this.add(this.lampAssist);
    }

    this.groupOctreeBox = new THREE.Group();
    this.add(this.groupOctreeBox);
};

CLOUD.Scene.prototype = Object.create(CLOUD.Group.prototype);
CLOUD.Scene.prototype.constructor = CLOUD.Scene;

CLOUD.Scene.prototype.destroy = function () {
    this.clearAll();
};

CLOUD.Scene.prototype.resizePool = function () {
    this.rootNode.children = [];
    this.meshPool.resize(CLOUD.GlobalData.maxObjectNumInPool, {parent: this.rootNode});
};

CLOUD.Scene.prototype.clearAll = function () {
    this.filter.clear();
    this.autoUpdate = false;
    this.rootNode.children = [];
    this.rootNode.boundingBox = null;
};

CLOUD.Scene.prototype.getRootNode = function () {
    return this.rootNode;
};

// 获得场景 root node 包围盒(场景变换后)
CLOUD.Scene.prototype.getBoundingBox = function () {
    var box = new THREE.Box3();

    return function () {
        box.copy(this.rootNode.boundingBox);
        box.applyMatrix4(this.rootNode.matrix);
        return box;
    };

}();

// 获得场景 root node 包围盒(场景变换前)
CLOUD.Scene.prototype.getBoundingBoxWorld = function () {
    return this.rootNode.boundingBox;
};

// 获得场景 root node 包围盒(变换后的构件包围盒)
CLOUD.Scene.prototype.getBoundingBoxInnner = function () {
    return this.boundingBoxInner;
};

// 获得场景 root node 变换矩阵
CLOUD.Scene.prototype.getMatrixGlobal = function () {
    return this.rootNode.matrix;
};

// 获得场景 root node 变换矩阵
CLOUD.Scene.prototype.getMatrixWorldGlobal = function () {
    return this.rootNode.matrixWorld;
};

// 获得场景 root node 旋转角度(Euler)
CLOUD.Scene.prototype.getRotationGlobal = function () {

    if (this.rootNode.matrix) {

        var rotMat = new THREE.Matrix4();
        rotMat.extractRotation(this.rootNode.matrix);

        var rotation = new THREE.Euler();
        rotation.setFromRotationMatrix( rotMat );

        return rotation;
    }

    return null;
};

CLOUD.Scene.prototype.getHitPoint = function (x, y, camera) {

    var raycaster = this.raycaster;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    var intersects =  this.hitTestClipPlane(raycaster.ray, raycaster.intersectObjects(this.children, true));
    intersects = this.hitTestClipPlanes(raycaster, intersects);

    if (intersects.length < 1) {
        return null;
    }

    intersects.sort(function (a, b) {
        return a.distance - b.distance;
    });

    for (var ii = 0, len = intersects.length; ii < len; ++ii) {
        var intersect = intersects[ii];

        if (intersect.distance <= camera.near)
            continue;

        var meshNode = intersect.object;

        if (this.filter.isVisible(meshNode)) {
            return intersect.point;
        }
    }

    return  null;
};

// 获取相机到场景包围盒8个顶点的最大距离对应点所在平面与所给射线的交点
CLOUD.Scene.prototype.getTrackingPointFromBoundingBox = function (direction, ray) {

    if (!this.rootNode.boundingBox) return null;

    var position = ray.origin;
    var box = this.getBoundingBox();
    var maxLen = 0;

    var corners = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ];

    corners[0].set(box.min.x, box.min.y, box.min.z); // 000
    corners[1].set(box.min.x, box.min.y, box.max.z); // 001
    corners[2].set(box.min.x, box.max.y, box.min.z); // 010
    corners[3].set(box.min.x, box.max.y, box.max.z); // 011
    corners[4].set(box.max.x, box.min.y, box.min.z); // 100
    corners[5].set(box.max.x, box.min.y, box.max.z); // 101
    corners[6].set(box.max.x, box.max.y, box.min.z); // 110
    corners[7].set(box.max.x, box.max.y, box.max.z);  // 111

    for (var i = 0; i < 8; i++) {

        var v = new THREE.Vector3();
        v.subVectors(corners[i], position);

        var len = v.dot(direction);

        if (maxLen < len) {
            maxLen = len;
        }
    }

    var offsetVec = direction.clone().multiplyScalar(maxLen);
    var coplanarPoint = position.clone().add(offsetVec);

    var plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(direction, coplanarPoint);

    return ray.intersectPlane(plane);
};

CLOUD.Scene.prototype.getNearDepthByRect = function () {

    var box = new THREE.Box3();
    var nearDepth = Infinity;
    var projectScreenMatrix = new THREE.Matrix4();
    var projectPosition = new THREE.Vector3();

    // 计算最近的深度
    function calcNearDepth(object) {
        projectPosition.setFromMatrixPosition( object.matrixWorld );
        projectPosition.applyProjection( projectScreenMatrix );

        var depth = projectPosition.z;

        if (depth < nearDepth && depth >= 0 && depth <= 1)   {
            nearDepth = depth;
        }
    }

    function intersectObjectByBox(frustum, object) {

        if (object.boundingBox && !(object instanceof THREE.Mesh)) {
            box.copy(object.boundingBox);
            box.applyMatrix4(object.matrixWorld);
        }
        else {
            var geometry = object.geometry;

            if (geometry.boundingBox === null)
                geometry.computeBoundingBox();

            box.copy(geometry.boundingBox);
            box.applyMatrix4(object.matrixWorld);

            //var objMatrixWorld = scope.getObjectMatrixWorld(object);
            //box.applyMatrix4(objMatrixWorld);
        }

        return frustum.intersectsBox(box);
    }

    return function (frustum, camera) {
        nearDepth = Infinity;
        projectScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

        function frustumTest(node) {

            if (node.worldBoundingBox) {

                if (!frustum.intersectsBox(node.worldBoundingBox)) {
                    return;
                }

                // 计算最近的深度
                calcNearDepth(node);
            }

            if (node.userData) {

                if (!intersectObjectByBox(frustum, node)) {
                    return;
                }

                // 计算最近的深度
                calcNearDepth(node);
            }

            var children = node.children;
            if (!children)
                return;

            for (var i = 0, l = children.length; i < l; i++) {
                var child = children[i];
                if (child.visible) {
                    frustumTest(child);
                }
            }
        }

        var children = this.rootNode.children;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            if (child.visible) {
                frustumTest(child);
            }
        }

        return nearDepth;
    }
}();

CLOUD.Scene.prototype.getClipWidget = function(){

    if (this.clipWidget == null) {
        var bbox = new THREE.Box3();
        bbox.copy(this.rootNode.boundingBox);
        bbox.applyMatrix4(this.rootNode.matrix);

        this.clipWidget = new CLOUD.ClipWidget(new THREE.Vector4(0, 0, 1, 0), bbox.center());
        this.add(this.clipWidget);
    }

    return this.clipWidget;
};

CLOUD.Scene.prototype.getClipPlanes = function(){

    if (this.clipPlanes == null) {
        var bbox = new THREE.Box3();
        bbox.copy(this.rootNode.boundingBox);
        bbox.applyMatrix4(this.rootNode.matrix);

        this.clipPlanes = new CLOUD.ClipPlanes(bbox.size(), bbox.center());
        this.add(this.clipPlanes);
    }

    return this.clipPlanes;
};

CLOUD.Scene.prototype.hitTest = function (mouse, camera) {

    var ray = this.raycaster;
    ray.setFromCamera(mouse, camera);

    var intersects =  this.hitTestClipPlane(ray.ray, ray.intersectObjects(this.children, true));
    intersects =  this.hitTestClipPlanes(ray, intersects);

    if (intersects.length < 1) {
        return null;
    }

    intersects.sort(function (a, b) {
        return a.distance - b.distance;
    });

    return intersects[0].point;
};

CLOUD.Scene.prototype.hitTestClipPlane = function (ray, intersects) {

    if (this.clipWidget && this.clipWidget.isEnabled()) {

        var hit = this.clipWidget.hitTest(ray);

        if (hit.distance == null)
            return intersects;

        function isBigEnough(element, index, array) {
            return (element.distance >= hit.distance);
        }

        function isSmallEnough(element, index, array) {
            return (element.distance <= hit.distance);
        }

        return intersects.filter(hit.sign ? isBigEnough:isSmallEnough);
    }

    return intersects;
};

CLOUD.Scene.prototype.hitTestClipPlanes = function (ray, intersects) {

    if (this.clipPlanes && this.clipPlanes.isEnabled()) {

        var hit = this.clipPlanes.hitTest(ray);

        if (hit.distance == null)
            return intersects;

        function isBigEnough(element, index, array) {
            return (element.distance >= hit.distance);
        }

        function isSmallEnough(element, index, array) {
            return (element.distance <= hit.distance);
        }

        return intersects.filter(hit.sign ? isBigEnough:isSmallEnough);
    }

    return intersects;
};

// callback(point:Vector3)
// point == null if hit nothing.
CLOUD.Scene.prototype.hitTestPosition = function (mouse, camera, callback) {

    //CLOUD.Logger.time("hitTest");
    var raycaster = this.raycaster;
    raycaster.setFromCamera(mouse, camera);

    var intersects =  this.hitTestClipPlane(raycaster.ray, raycaster.intersectObjects(this.children, true));
    intersects = this.hitTestClipPlanes(raycaster, intersects);

    if (intersects.length < 1) {

        // modified 2016-5-3  begin
        // 如果没有选中构件，绕场景中心旋转
        if (this.rootNode.boundingBox ) {
            var bBox = this.getBoundingBox();
            var pivot = bBox.center();

            // 如果没有选中构件，绕场景中心旋转
            callback(pivot);
        } else {
            callback(null);
        }

        //callback(null);
        // modified 2016-5-3  end
        //CLOUD.Logger.timeEnd("hitTest");
        return;
    }

    intersects.sort(function (a, b) {
        return a.distance - b.distance;
    });

    callback(intersects[0].point);
    //CLOUD.Logger.timeEnd("hitTest");
};

CLOUD.Scene.prototype.isPickable = function (node) {
    return this.filter.isVisible(node) && this.filter.isSelectable(node);
};

CLOUD.Scene.prototype.pick = function (mouse, camera, callback) {

    var scope = this;
    var raycaster = this.raycaster;
    raycaster.setFromCamera(mouse, camera);

    var intersects = this.hitTestClipPlane(raycaster.ray, raycaster.intersectObjects(scope.children, true));
    intersects = this.hitTestClipPlanes(raycaster, intersects);

    var length = intersects.length;

    if (length > 0) {

        intersects.sort(function (a, b) {
            return a.distance - b.distance;
        });

        for (var ii = 0; ii < length; ++ii) {

            var intersect = intersects[ii];

            if (intersect.distance <= camera.near)
                continue;

            var meshNode = intersect.object;

            if (scope.isPickable(meshNode)) {

                if (meshNode.geometry) {
                    intersect.userId = meshNode.name; // name -> userId
                    callback(intersect);
                    return;
                }

            }
        }

    }

   callback(null);
};

CLOUD.Scene.prototype.pickByRect = function () {

    var sphere = new THREE.Sphere();
    var box = new THREE.Box3();

    var INTERSECTION_STATE = {
        IS_Leave:0,
        IS_Intersection:1,
        IS_Contains : 2
    };

    function intersectObjectBySphere(frustum, object) {

        var geometry = object.geometry;
        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

        sphere.copy(geometry.boundingSphere);
        sphere.applyMatrix4(object.matrixWorld);

        var planes = frustum.planes;
        var center = sphere.center;
        var negRadius = -sphere.radius;

        var nCount = 0;
        for (var i = 0; i < 6; i++) {

            var distance = planes[i].distanceToPoint(center);

            if (distance < negRadius) {

                return INTERSECTION_STATE.IS_Leave;

            }
            else if (distance >= sphere.radius) {
                ++nCount;
            }


        }

        return nCount == 6 ? INTERSECTION_STATE.IS_Contains : INTERSECTION_STATE.IS_Intersection;
    }

    var p1 = new THREE.Vector3(),
        p2 = new THREE.Vector3();

    function intersectBox(frustum, box) {

        var nCount = 0;
        var planes = frustum.planes;

        for (var i = 0; i < 6 ; i++) {

            var plane = planes[i];

            p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
            p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
            p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
            p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

            var d1 = plane.distanceToPoint(p1);
            var d2 = plane.distanceToPoint(p2);

            // if both outside plane, no intersection

            if (d1 < 0 && d2 < 0) {

                return INTERSECTION_STATE.IS_Leave;

            }
            else if (d1 * d2 >= 0) {
                ++nCount;
            }
        }

        return nCount == 6 ? INTERSECTION_STATE.IS_Contains : INTERSECTION_STATE.IS_Intersection;
    }

    function intersectObjectByBox(frustum, object) {

        if (object.boundingBox && !(object instanceof THREE.Mesh)) {
            box.copy(object.boundingBox);
        }
        else {
            var geometry = object.geometry;

            if (geometry.boundingBox === null)
                geometry.computeBoundingBox();

            box.copy(geometry.boundingBox);
        }

        box.applyMatrix4(object.matrixWorld);

        return intersectBox(frustum, box);
    }

    return function (frustum, selectState, callback) {

        var scope = this;

        if (selectState === CLOUD.OPSELECTIONTYPE.Clear)
            scope.filter.setSelectedIds();

        var count = 0;

        function frustumTest(node) {

            if (node instanceof CLOUD.Group) {
                if (node.userData && node.userData.sceneId && scope.filter.hasFileFilter(node.userData.sceneId))
                    return;
            }

            if (node.worldBoundingBox) {

                if (intersectBox(frustum, node.worldBoundingBox) === INTERSECTION_STATE.IS_Leave) {
                    return;
                }

            }

            if (node.userData) {
                var state = intersectObjectByBox(frustum, node);
                if (state === INTERSECTION_STATE.IS_Contains) {

                    if (scope.filter.isVisible(node) && scope.filter.isSelectable(node)) {

                        if (selectState === CLOUD.OPSELECTIONTYPE.Remove) {
                            scope.filter.removeSelectedId(node.name);
                        }
                        else {
                            scope.filter.addSelectedId(node.name, node.userData);
                        }
                        ++count;
                    }

                }
                else {
                    return;
                }
            }

            var children = node.children;
            if (!children)
                return;

            for (var i = 0, l = children.length; i < l; i++) {
                var child = children[i];
                if (child.visible) {
                    frustumTest(child);
                }
            }
        }

        var children = this.rootNode.children;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            if (child.visible) {
                frustumTest(child);
            }
        }

        callback();
    }

}();

CLOUD.Scene.prototype.traverseIf = function (callback) {

    function traverseChild(node, callback) {

        var children = node.children;

        for (var i = 0, len = children.length; i < len; i++) {

            var child = children[i];

            if (!callback(child, node)) {
                break;
            }

            if(child.visible) {
                traverseChild(child, callback);
            }
        }
    }

    var children = this.rootNode.children;

    for (var i = 0, len = children.length; i < len; i++) {
        var child = children[i];
        traverseChild(child, callback);
    }
};

CLOUD.Scene.prototype.findSceneNode = function (sceneId) {

    var children = this.rootNode.children;

    for (var i = 0, l = children.length; i < l; i++) {

        var child = children[i];

        if (child.userData && sceneId == child.userData.sceneId) {
            return child;
        }
    }

    return null;
};

CLOUD.Scene.prototype.getNodeById = function (id) {

    var children = this.rootNode.children;

    for (var i = 0, l = children.length; i < l; i++) {

        var node = children[i];

        if (id === node.name) {
            return node;
        }
    }

    return null;
};

CLOUD.Scene.prototype.showSceneNodes = function (model, bVisible) {

    var children = this.rootNode.children;

    for (var i = 0, l = children.length; i < l; i++) {

        var child = children[i];

        if (child.databagId === model.databagId) {
            child.visible = bVisible;
        }
    }
};

CLOUD.Scene.prototype.containsBoxInFrustum = function () {

    var p1 = new THREE.Vector3(),
        p2 = new THREE.Vector3();

    return function (frustum, box) {

        var planes = frustum.planes;

        for (var i = 0; i < 6 ; i++) {
            var plane = planes[i];

            p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
            p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
            p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
            p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

            var d1 = plane.distanceToPoint(p1);
            var d2 = plane.distanceToPoint(p2);

            // if one outside plane, is not contained.

            if (d1 < 0 || d2 < 0) {
                return false;
            }
        }

        return true;
    };

}();

CLOUD.Scene.prototype.prepareScene = function () {

};

CLOUD.Scene.prototype.parseRootNode = function (data) {

    var rootNode = this.rootNode;
    var dataView = data.view;
    var boundingBox = CLOUD.Utils.box3FromArray(dataView.bbox);

    if (rootNode.boundingBox === null) {
        rootNode.boundingBox = boundingBox;

        var position = new THREE.Vector3();
        var rotation = new THREE.Quaternion();
        var scale = new THREE.Vector3(1,1,1);

        if (dataView.position) {
            position.fromArray(dataView.position);
        }

        if (dataView.rotation) {
            var euler = new THREE.Euler();
            euler.fromArray(dataView.rotation);
            rotation.setFromEuler(euler, false);
        }

        if (dataView.scale) {
            scale.fromArray(dataView.scale);
        }

        rootNode.matrix.compose(position, rotation, scale);
        rootNode.matrixAutoUpdate = false;
        rootNode.updateMatrixWorld(true);

    } else {
        rootNode.boundingBox.expandByPoint(boundingBox.min);
        rootNode.boundingBox.expandByPoint(boundingBox.max);
    }
};

CLOUD.Scene.prototype.hasVisibleNode = function () {
    return this.rootNode.children[0] && this.rootNode.children[0].visible;
};

CLOUD.Scene.prototype.updateLights = function (camera) {
    if (CLOUD.GlobalData.DirectionalLight) {
        var dirLight = this.dirLight;
        dirLight.updateMatrixWorld(true);
    }
    else {
        var headLamp = this.lampHead;
        headLamp.position.copy(camera.getWorldDirection()).multiplyScalar(-1);
        headLamp.updateMatrixWorld(true);

        var assistLamp = this.lampAssist;
        assistLamp.position.copy(headLamp.position).add(this.lightOffset).normalize();
        assistLamp.updateMatrixWorld();
    }
};

CLOUD.Scene.prototype.updateOctreeBox = function (rootNode) {
    var groupBox = this.groupOctreeBox;

    function traverse(parent) {

        for ( var i = 0, len = parent.childOctants.length; i < len; i ++ ) {
            var child = parent.childOctants[i];
            var box = new THREE.Box3(child.min, child.max);
            var clr = 0xff;
            clr = clr << (child.depth * 5);

            var boxNode = new CLOUD.BBoxNode(box, clr);
            groupBox.add(boxNode);
            boxNode.updateMatrixWorld(true);

            traverse(child);
        }
    }

    if (CLOUD.GlobalData.ShowOctant) {

        groupBox.visible = true;

        if(groupBox.children.length === 0) {

            // var rootNodeMatrix = this.getMatrixWorldGlobal();
            // groupBox.matrixWorld.copy(rootNodeMatrix);

            var box = new THREE.Box3(rootNode.min, rootNode.max);
            var clr = 0xff0000;
            var boxNode = new CLOUD.BBoxNode(box, clr);
            groupBox.add(boxNode);
            boxNode.updateMatrixWorld(true);

            traverse(rootNode);
        }

    } else {
        groupBox.visible = false;
    }

};


//
function intersectObject(object, raycaster, intersects, recursive, filter) {

    if (!object.visible) {
        return;
    }

    if (object instanceof CLOUD.Group) {
        if (object.fileId && filter.hasFileFilter(object.fileId))
            return;
    }

    var hit = object.raycast(raycaster, intersects);

    if (recursive === true && object.children) {
        // Group
        var children = object.children;
        if (children.length > 0 && (!hit && hit != undefined))
            return;

        for (var i = 0, l = children.length; i < l; i++) {
            intersectObject(children[i], raycaster, intersects, true, filter);
        }
    }
}

CLOUD.Raycaster = function (origin, direction, near, far) {
    "use strict";

    this.ray = new THREE.Ray(origin, direction);
    // direction is assumed to be normalized (for accurate distance calculations)

    this.near = near || 0;
    this.far = far || Infinity;

    this.params = {
        Sprite: {},
        Mesh: {},
        PointCloud: {threshold: 1},
        LOD: {},
        Line: {}
    };
};

CLOUD.Raycaster.prototype = {

    constructor: CLOUD.Raycaster,

    precision: 0.0001,
    linePrecision: 1,

    descSort: function (a, b) {
        return a.distance - b.distance;
    },

    set: function (origin, direction) {
        // direction is assumed to be normalized (for accurate distance calculations)

        this.ray.set(origin, direction);
    },

    setFilter: function (filter) {
        this.filter = filter;
    },

    setFromCamera: function (coords, camera) {

        // camera is assumed _not_ to be a child of a transformed object
        if (camera instanceof THREE.CombinedCamera) {
            if (camera.isPerspective) {
                this.ray.origin.copy(camera.position);
                this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(camera.position).normalize();
            } else {
                this.ray.origin.set(coords.x, coords.y, -1).unproject(camera);
                this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
            }
        } else if (camera instanceof THREE.PerspectiveCamera) {
            this.ray.origin.copy(camera.position);
            this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(camera.position).normalize();
        } else if (camera instanceof THREE.OrthographicCamera) {
            this.ray.origin.set(coords.x, coords.y, -1).unproject(camera);
            this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
        } else {
            console.error('CLOUD.Raycaster: Unsupported camera type.');
        }
    },

    intersectObject: function (object, recursive) {

        var intersects = [];

        intersectObject(object, this, intersects, recursive, this.filter);

        //intersects.sort( descSort );

        return intersects;
    },

    intersectObjects: function (objects, recursive) {
        var intersects = [];

        for (var i = 0, len = objects.length; i < len; i++) {
            intersectObject(objects[i], this, intersects, recursive, this.filter);
        }

        //intersects.sort( descSort );

        return intersects;
    }
};
CLOUD.CameraEditor = function (viewer, camera, domElement, onChange) {
    "use strict";

    this.viewer = viewer;
    this.camera = camera;
    this.domElement = domElement;

    // Set to false to disable this control
    this.enabled = true;

    // the orbit center
    this.pivot = null;

    var geometry = new THREE.SphereBufferGeometry(15, 64, 64);
    this.pivotBall = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: 0xffffff,
        depthTest: false,
        opacity: 0.5,
        transparent: true
    }));

    geometry = new THREE.SphereBufferGeometry(1, 64, 64);
    this.pivotCenter = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: 0xff0000,
        depthTest: false,
        opacity: 0.5,
        transparent: true
    }));

    //this.movementSpeed = 0.005 * CLOUD.GlobalData.SceneSize; // 移动速度
    this.movementSpeed = 0.0008 * CLOUD.GlobalData.SceneSize; // 移动速度
    this.defaultMovementSpeed = this.movementSpeed;
    this.minMovementSpeed = 0.01;

    this.minDollyDistance = 2.0;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 0.2;

    // Limits to how far you can dolly in and out
    //this.minDistance = camera.near;//
    this.minDistance = 0.1; // 0.000001; // 可能影响pick，pick对象与camera.near有关，是否这里也设置成camera.near？待进一步测试
    //this.maxDistance = Infinity;
    this.maxDistance = camera.far - CLOUD.GlobalData.SceneSize * 2;//camera.far * 0.9

    this.defaultThroughOutDistance = 0.1;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1.0;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 2.0;	// pixels moved per arrow key push
    this.defaultKeyPanSpeed = this.keyPanSpeed;
    this.minKeyPanSpeed = 0.01;
    //this.movementSpeedMultiplier = 1.0;

    // Set to true to automatically rotate around the target
    this.autoRotate = true;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    this.enablePassThrough = true; // 允许缩放穿透

    this.isDisableRotate = false; // 禁止旋转

    // Set to true to disable use of the keys
    this.noKeys = false;

    // The four arrow keys
    //this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
    this.keys = {
        ALT: 18,
        BACKSPACE: 8,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40,
        A: 65,
        D: 68,
        E: 69,
        Q: 81,
        S: 83,
        W: 87,
        PLUS: 187,
        SUB: 189,
        ZERO: 48,
        ESC: 27
    };

    // 限制Z轴, 因为做过场景旋转，故场景Z轴其实对应坐标Y轴
    this.isConstrainedAxisZ = false;
    var _zAxisUp = new THREE.Vector3(0, 1, 0);

    var scope = this;
    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();
    var pan = new THREE.Vector3();
    var panDeltaBasedWorld = new THREE.Vector3();
    var worldDimension = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();
    var dollyCenter = new THREE.Vector2();

    var theta;
    var phi;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    var STATE = {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2};
    var state = STATE.NONE;

    var lastTrackingPoint;

    this.destroy = function () {
        this.viewer = null;
    };

    this.IsIdle = function () {
        return state === STATE.NONE;
    };

    this.update = function () {

        return function (forceRender, updateRenderList) {

            var position = this.camera.position;
            var pivot = this.pivot !== null ? this.pivot : this.camera.target;
            var scope = this;

            if (state !== STATE.NONE) {
                this.dirtyCamera(true);
            }

            if (!this.isDisableRotate) {
                if (state == STATE.ROTATE) {

                    var eye = this.camera.target.clone().sub(position);
                    var eyeDistance = eye.length();
                    var viewVec = position.clone().sub(pivot);
                    var viewLength = viewVec.length();
                    var viewTrf = null;
                    var camDir = this.camera.getWorldDirection();

                    viewVec.normalize();

                    // 调整相机位置
                    var adjustCameraPosition = function (trf) {

                        var newTarget = new THREE.Vector3(); // 新目标点
                        var newViewDir = viewVec.clone().applyQuaternion(trf).normalize();

                        // 相机新位置
                        position.copy(pivot).add(newViewDir.multiplyScalar(viewLength));

                        // 保持相机到目标点的距离不变
                        camDir.applyQuaternion(trf).normalize();
                        newTarget.copy(position).add(camDir.multiplyScalar(eyeDistance));
                        // 相机目标点位置
                        scope.camera.target.copy(newTarget);
                    };

                    var up = this.camera.realUp || this.camera.up;
                    var rightDir = camDir.clone().cross(up).normalize();
                    var realUp = rightDir.clone().cross(camDir).normalize();
                    this.camera.realUp.copy(realUp);

                    var rotAxis;

                    // 锁定Z轴
                    if (this.isConstrainedAxisZ) {

                        // 水平旋转
                        if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {

                            rotAxis = _zAxisUp;
                            viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, thetaDelta);
                            adjustCameraPosition(viewTrf);
                            this.camera.realUp.applyQuaternion(viewTrf).normalize();

                        }

                    } else {

                        // 水平旋转
                        if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {

                            // remark: this.camera.up 的使用有些奇怪，大多数都被置成了 THREE.Object3D.DefaultUp，后续需要在重新考虑下
                            // 当this.camera.up为THREE.Object3D.DefaultUp时，其实水平旋转就是锁定了Z轴的旋转(模型的Z轴对应场景的Y轴)
                            rotAxis = this.camera.up.clone().normalize();
                            viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, thetaDelta);
                            adjustCameraPosition(viewTrf);
                            this.camera.realUp.applyQuaternion(viewTrf).normalize();

                        } else if (Math.abs(phiDelta) > 0.01) { // 垂直旋转

                            rotAxis = camDir.clone().cross(up).normalize();
                            viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, phiDelta);
                            adjustCameraPosition(viewTrf);
                            this.camera.realUp.applyQuaternion(viewTrf).normalize();

                            // 旋转180度时，up的y值应该反向，否则移动会反
                            this.adjustCameraUp();
                        }

                    }

                }
            }


            if (state === STATE.PAN) {

                this.camera.target.add(pan);
                this.camera.position.add(pan);

            }

            // lookAt使用realUp
            var tmpUp = new THREE.Vector3();
            tmpUp.copy(this.camera.up);
            this.camera.up.copy(this.camera.realUp);
            this.camera.lookAt(this.camera.target);
            this.camera.up.copy(tmpUp);

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set(0, 0, 0);

            if (forceRender) {
                //CLOUD.Logger.log("CameraEditor.forceRender");
                if (updateRenderList !== undefined) {
                    this.needUpdateRenderList(updateRenderList);
                }

                onChange();

                this.dirtyCamera(false);

                lastPosition.copy(this.camera.position);
                lastQuaternion.copy(this.camera.quaternion);
            } else {

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if (lastPosition.distanceToSquared(this.camera.position) > EPS
                    || 8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > EPS) {

                    //CLOUD.Logger.log("CameraEditor.render");
                    onChange();

                    this.dirtyCamera(false);

                    lastPosition.copy(this.camera.position);
                    lastQuaternion.copy(this.camera.quaternion);
                }
            }
        }

    }();

    this.updateAuto = function () {

        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function () {

            var position = this.camera.position;

            offset.copy(position).sub(this.camera.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis

            theta = Math.atan2(offset.x, offset.z);

            // angle from y-axis

            phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

            theta += thetaDelta;
            phi += phiDelta;

            // restrict theta to be between desired limits
            theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));

            // restrict phi to be between desired limits
            phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

            var radius = offset.length() * scale;

            // restrict radius to be between desired limits
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

            // move target to panned location
            this.camera.target.add(panOffset);

            offset.x = radius * Math.sin(phi) * Math.sin(theta);
            offset.y = radius * Math.cos(phi);
            offset.z = radius * Math.sin(phi) * Math.cos(theta);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(this.camera.target).add(offset);

            this.camera.lookAt(this.camera.target);

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            panOffset.set(0, 0, 0);

            lastPosition.copy(this.camera.position);
            lastQuaternion.copy(this.camera.quaternion);

            onChange();

            return true;

        };

    }();

    // 锁定Z轴
    this.lockAxisZ = function (isLock) {

        this.isConstrainedAxisZ = isLock;

    };

    this.updateView = function (updateRenderList) {

        if (updateRenderList !== undefined) {
            this.needUpdateRenderList(updateRenderList);
        }

        onChange();
    };

    // 是否需要更新RenderList
    this.needUpdateRenderList = function (need) {
        this.viewer.editorManager.isUpdateRenderList = need;
    };

    // 是否禁止旋转
    this.disableRotate = function (disable) {

        this.isDisableRotate = disable;
    };

    this.rotateLeft = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }

        thetaDelta -= angle;
    };

    this.rotateUp = function (angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle();
        }

        phiDelta -= angle;
    };

    // pass in distance in world space to move left
    this.panLeft = function (distance) {
        var te = this.camera.matrix.elements;

        // get X column of matrix
        panOffset.set(te[0], te[1], te[2]);
        panOffset.multiplyScalar(-distance);

        pan.add(panOffset);
        //CLOUD.Logger.log("Warning!");
    };

    // pass in distance in world space to move up
    this.panUp = function (distance) {
        var te = this.camera.matrix.elements;

        // get Y column of matrix
        panOffset.set(te[4], te[5], te[6]);
        panOffset.multiplyScalar(distance);

        pan.add(panOffset);
        //CLOUD.Logger.log("Warning!");
    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function (deltaX, deltaY) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (scope.camera.fov !== undefined) {
            // perspective
            var position = scope.camera.position;
            var offset = position.clone().sub(scope.camera.target);
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);

            //CLOUD.Logger.log(targetDistance);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
            scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
        } else if (scope.camera.top !== undefined) {
            // orthographic
            scope.panLeft(deltaX * (scope.camera.right - scope.camera.left) / element.clientWidth);
            scope.panUp(deltaY * (scope.camera.top - scope.camera.bottom) / element.clientHeight);
        } else {
            // camera neither orthographic or perspective
            CLOUD.Logger.warn('WARNING: CloudPickEditor.js encountered an unknown camera type - pan disabled.');
        }
    };

    this.panOnWorld = function () {

        var startPoint = new THREE.Vector3();
        var endPoint = new THREE.Vector3();
        var delta = new THREE.Vector3();

        return function () {

            var canvasContainer = this.getContainerDimensions();

            // 规范化开始点
            var canvasX = panStart.x - canvasContainer.left;
            var canvasY = panStart.y - canvasContainer.top;
            startPoint.x = canvasX / canvasContainer.width;
            startPoint.y = canvasY / canvasContainer.height;

            // 规范化结束点
            canvasX = panEnd.x - canvasContainer.left;
            canvasY = panEnd.y - canvasContainer.top;
            endPoint.x = canvasX / canvasContainer.width;
            endPoint.y = canvasY / canvasContainer.height;

            delta.subVectors(endPoint, startPoint);

            var offsetX = -delta.x * worldDimension.x;
            var offsetY = delta.y * worldDimension.y;
            var deltaX = this.getWorldRight().multiplyScalar(offsetX);
            var deltaY = this.getWorldUp().multiplyScalar(offsetY);

            panDeltaBasedWorld.addVectors(deltaX, deltaY);

            pan.add(panDeltaBasedWorld);
        }

    }();

    this.dolly = function () {
        var center = scope.mapWindowToViewport(dollyCenter.x, dollyCenter.y);
        var centerPosition = scope.getHitPoint(center.x, center.y);
        if (centerPosition != null) {
            if (Math.abs(scale - 1.0) < EPS) {
                return;
            }

            var cameraPos = this.camera.position;
            var eye = this.getWorldEye();

            var dir = new THREE.Vector3();
            dir.subVectors(centerPosition, cameraPos);

            var distance = dir.multiplyScalar(scale - 1).length();

            var newCameraPos = new THREE.Vector3();

            if (Math.abs(distance) < this.minDollyDistance) {
                newCameraPos.addVectors(cameraPos, dir.normalize().multiplyScalar(this.minDollyDistance));
            }
            else {
                newCameraPos.addVectors(cameraPos, dir);
            }

            this.camera.position.copy(newCameraPos);
            this.camera.target.copy(eye.add(newCameraPos));
        }
        else {
            scope.dollyByCenter();
        }
    };

    this.dollyIn = function (dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = getZoomScale();
        }

        scale /= dollyScale;
    };

    this.dollyOut = function (dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = getZoomScale();
        }

        scale *= dollyScale;
    };

    this.dollyByPoint = function (cx, cy) {

        if (Math.abs(scale - 1.0) < EPS) {
            return;
        }

        var minDistance = this.minDollyDistance;

        var cameraPos = this.camera.position;
        var eye = this.getWorldEye();
        var dollyPoint = this.getTrackingPoint(cx, cy);

        var dir = new THREE.Vector3();
        dir.subVectors(dollyPoint, cameraPos);

        var distance = dir.multiplyScalar(scale - 1).length();

        var newCameraPos = new THREE.Vector3();

        if (Math.abs(distance) < this.minDollyDistance) {
            newCameraPos.addVectors(cameraPos, dir.normalize().multiplyScalar(this.minDollyDistance));
        }
        else {
            newCameraPos.addVectors(cameraPos, dir);
        }

        this.camera.position.copy(newCameraPos);
        this.camera.target.copy(eye.add(newCameraPos));
    };

    this.dollyByCenter = function () {

        if (Math.abs(scale - 1.0) < EPS) {
            return;
        }

        var eye = this.getWorldEye();
        var lastLength = eye.length();
        var currLength = lastLength * scale;
        var deltaStep = currLength - lastLength;
        var dir = eye.clone().normalize();

        dir.multiplyScalar(deltaStep);
        this.camera.position.add(dir);
        this.camera.target.addVectors(this.camera.position, eye);
    };

    this.updateCamera = function (target, noRest) {

        this.dirtyCamera(true);

        lastPosition.copy(this.camera.position);
        lastQuaternion.copy(this.camera.quaternion);
        this.camera.target.copy(target);

        if (!noRest) {
            scope.reset();
        }

    };

    this.dirtyCamera = function (dirty) {
        this.camera.dirty = dirty;
    };

    this.modelView = function (forceRender, updateRenderList) {
        if (state !== STATE.NONE) {
            this.dirtyCamera(true);
        }

        var pivot = this.pivot !== null ? this.pivot : this.viewer.getScene().getBoundingBox().center();
        var scope = this;

        if (state == STATE.ROTATE) {
            var position = this.camera.position;

            var eye = this.camera.target.clone().sub(position);
            var eyeDistance = eye.length();
            var viewVec = position.clone().sub(pivot);
            var viewLength = viewVec.length();
            var viewTrf = null;
            var camDir = this.camera.getWorldDirection();

            viewVec.normalize();

            var adjustCameraPosition = function (trf) {
                var newTarget = new THREE.Vector3(); // 新目标点
                var newViewDir = viewVec.clone().applyQuaternion(trf).normalize();

                // 相机新位置
                position.copy(pivot).add(newViewDir.multiplyScalar(viewLength));

                // 保持相机到目标点的距离不变
                camDir.applyQuaternion(trf).normalize();
                newTarget.copy(position).add(camDir.multiplyScalar(eyeDistance));
                // 相机目标点位置
                scope.camera.target.copy(newTarget);
            };

            var up = this.camera.realUp || this.camera.up;
            var rightDir = camDir.clone().cross(up).normalize();
            var realUp = rightDir.clone().cross(camDir).normalize();
            this.camera.realUp.copy(realUp);

            var rotAxis;

            // 锁定Z轴
            if (this.isConstrainedAxisZ) {
                // 水平旋转
                if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {

                    rotAxis = _zAxisUp;
                    viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, thetaDelta);
                    adjustCameraPosition(viewTrf);
                    this.camera.realUp.applyQuaternion(viewTrf).normalize();
                }
            } else {
                // 水平旋转
                if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {

                    // remark: this.camera.up 的使用有些奇怪，大多数都被置成了 THREE.Object3D.DefaultUp，后续需要在重新考虑下
                    // 当this.camera.up为THREE.Object3D.DefaultUp时，其实水平旋转就是锁定了Z轴的旋转(模型的Z轴对应场景的Y轴)
                    rotAxis = this.camera.up.clone().normalize();
                    viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, thetaDelta);
                    adjustCameraPosition(viewTrf);
                    this.camera.realUp.applyQuaternion(viewTrf).normalize();

                } else if (Math.abs(phiDelta) > 0.01) { // 垂直旋转

                    var EPS = 0.000001;

                    rotAxis = camDir.clone().cross(up).normalize();

                    var cross = new THREE.Vector3(0, 1, 0).clone().cross(up);
                    var dot = cross.dot(rightDir);
                    var angle = Math.asin(cross.length());
                    if (dot < 0) {
                        angle = -angle;
                    }
                    if ((angle + phiDelta) > (Math.PI / 2 - EPS)) {
                        phiDelta = Math.PI / 2 - EPS - angle;
                    }
                    else if ((angle + phiDelta) < (-Math.PI / 2 + EPS)) {
                        phiDelta = -Math.PI / 2 + EPS - angle;
                    }

                    viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, phiDelta);
                    adjustCameraPosition(viewTrf);
                    this.camera.realUp.applyQuaternion(viewTrf).normalize();

                    // 旋转180度时，up的y值应该反向，否则移动会反
                    this.adjustCameraUp();
                }
            }

            if (scope.pivot != null) {
                scope.pivotBall.position.copy(scope.pivot);
                scope.pivotCenter.position.copy(scope.pivot);

                var scale = pivotBallSize();
                scope.pivotBall.scale.set(scale, scale, scale);
                scope.pivotCenter.scale.set(scale, scale, scale);
            }
            else {
                var scene = scope.viewer.getScene();
                var center = scene.getBoundingBox().center();
                scope.pivotBall.position.copy(center);
                scope.pivotCenter.position.copy(center);

                var scale = pivotBallSize();
                scope.pivotBall.scale.set(scale, scale, scale);
                scope.pivotCenter.scale.set(scale, scale, scale);
            }

            scope.pivotBall.updateMatrixWorld();
            scope.viewer.getScene().add(scope.pivotBall);

            scope.pivotCenter.updateMatrixWorld();
            scope.viewer.getScene().add(scope.pivotCenter);
        }
    };

    this.personView = function (forceRender, updateRenderList) {
        if (state !== STATE.NONE) {
            this.dirtyCamera(true);
        }

        var scope = this;

        if (state == STATE.ROTATE) {
            var position = this.camera.position;

            var eye = this.camera.target.clone().sub(position);
            var eyeDistance = eye.length();
            var camDir = this.camera.getWorldDirection();

            var up = this.camera.realUp || this.camera.up;
            var rightDir = camDir.clone().cross(up).normalize();
            var realUp = rightDir.clone().cross(camDir).normalize();
            this.camera.realUp.copy(realUp);

            var adjustCameraPosition = function (trf) {
                var newTarget = new THREE.Vector3(); // 新目标点

                // 保持相机到目标点的距离不变
                camDir.applyQuaternion(trf).normalize();
                newTarget.copy(position).add(camDir.multiplyScalar(eyeDistance));
                // 相机目标点位置
                scope.camera.target.copy(newTarget);
            };

            var rotAxis, rotAngle;
            if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {
                rotAxis = _zAxisUp;
                rotAngle = thetaDelta;
            }
            else {
                rotAxis = rightDir;

                var cross = new THREE.Vector3(0, 1, 0).clone().cross(up);
                var dot = cross.dot(rightDir);
                var angle = Math.asin(cross.length());
                if (dot < 0) {
                    angle = -angle;
                }
                if ((angle + phiDelta) > (Math.PI / 4 - EPS)) {
                    phiDelta = Math.PI / 4 - EPS - angle;
                }
                else if ((angle + phiDelta) < (-Math.PI / 4 + EPS)) {
                    phiDelta = -Math.PI / 4 + EPS - angle;
                }

                rotAngle = phiDelta;
            }
            var viewTrf = new THREE.Quaternion().setFromAxisAngle(rotAxis, rotAngle);
            adjustCameraPosition(viewTrf);
            this.camera.realUp.applyQuaternion(viewTrf).normalize();
        }
    };

    this.touchUpdate = function () {
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function (forceRender, updateRenderList) {

            var position = this.camera.position;
            var sceneBoundingBox = this.viewer.getScene().getBoundingBox();

            if (sceneBoundingBox.containsPoint(position)) {
                this.personView(forceRender, updateRenderList);
            }
            else {
                this.modelView(forceRender, updateRenderList);
            }

            this.camera.target.add(pan);
            this.camera.position.add(pan);

            // lookAt使用realUp
            var tmpUp = new THREE.Vector3();
            tmpUp.copy(this.camera.up);
            this.camera.up.copy(this.camera.realUp);
            this.camera.lookAt(this.camera.target);
            this.camera.up.copy(tmpUp);

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set(0, 0, 0);

            if (forceRender) {
                //CLOUD.Logger.log("CameraEditor.forceRender");
                if (updateRenderList !== undefined) {
                    this.needUpdateRenderList(updateRenderList);
                }

                onChange();

                this.dirtyCamera(false);

                lastPosition.copy(this.camera.position);
                lastQuaternion.copy(this.camera.quaternion);
            }
            else {
                if (lastPosition.distanceToSquared(this.camera.position) > EPS
                    || 8 * (1 - lastQuaternion.dot(this.camera.quaternion)) > EPS) {

                    //CLOUD.Logger.log("CameraEditor.render");
                    onChange();

                    this.dirtyCamera(false);

                    lastPosition.copy(this.camera.position);
                    lastQuaternion.copy(this.camera.quaternion);
                }
            }
        }
    }();

    this.setState = function (val) {
        state = val;
    };

    this.reset = function () {
        state = STATE.NONE;

        //this.target.copy( this.target0 );
        //this.camera.position.copy( this.position0 );

        // Modified by xmh 2016-6-24 begin
        // 强制重刷一帧，设置视点后，将相机设成脏状态，不强制刷新，状态设成正常状态的时机可能会出错。
        // 问题对应：批注模式下,先设置视点，后加载批注，因为没有即时刷新，批注加载完成后，才开始render,这时批注才收到视点变化的消息，造成批注不能显示。
        //this.update();
        this.update(true);
        // Modified by xmh 2016-6-24 end
    };

    function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
    }

    this.beginRotate = function (cx, cy) {
        if (scope.noRotate === true) return;

        state = STATE.ROTATE;
        rotateStart.set(cx, cy);

        // 获得追踪点
        lastTrackingPoint = null;
        //var trackingPoint = this.getTrackingPoint(cx, cy);
    };

    this.beginZoom = function (cx, cy) {
        if (scope.noZoom === true) return;

        state = STATE.DOLLY;
        dollyStart.set(cx, cy);
    };

    this.beginPan = function (cx, cy) {
        if (scope.noPan === true) return;
        state = STATE.PAN;
        panStart.set(cx, cy);

        // 根据当前鼠标点获得世界坐标系中的宽高
        worldDimension = this.getWorldDimension(cx, cy);
        // 清零
        panDeltaBasedWorld.set(0, 0, 0);
    };

    this.endOperation = function () {
        state = STATE.NONE;
        this.pivot = null;
    };

    // factor: 正数 - 放大， 负数 - 缩小
    this.zoom = function (factor, cx, cy) {

        state = STATE.DOLLY;

        if (cx === undefined || cy === undefined) {
            if (factor > 0) {
                this.dollyIn(1 - factor);
            } else {
                this.dollyOut(1 + factor);
            }

            this.dollyByCenter();
            this.update();
        }
        else {

            if (factor > 0) {
                this.dollyIn(1 - factor);
            } else {
                this.dollyOut(1 + factor);
            }

            this.dollyByPoint(cx, cy);
            this.update();
        }

        state = STATE.NONE;
    };

    // 基于相机空间的漫游
    this.fly = function (moveVector, quaternion) {
        this.camera.translateX(moveVector.x);
        this.camera.translateY(moveVector.y);
        this.camera.translateZ(moveVector.z);
        this.camera.quaternion.multiply(quaternion);

        // expose the rotation vector for convenience
        this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);

        // update target
        this.camera.target.copy(this.camera.position).add(this.camera.getWorldDirection());

        onChange();
    };

    // 基于世界空间的漫游
    this.flyOnWorld = function () {

        var up = this.camera.up.clone();

        if (this.camera.realUp) {
            this.camera.up.copy(this.camera.realUp);
        }

        // 使用realUp
        this.camera.lookAt(this.camera.target);

        if (this.camera.realUp) {
            this.camera.up.copy(up);
        }

        // 调用Render刷新
        onChange();
    };

    this.processRotate = function (delta) {

        var currentState = state; // 保持状态

        state = STATE.ROTATE; // 将状态设置成旋转

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        scope.rotateLeft(2 * Math.PI * delta.x / element.clientWidth * scope.rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        scope.rotateUp(2 * Math.PI * delta.y / element.clientHeight * scope.rotateSpeed);

        scope.update();

        state = currentState; // 恢复状态
    };

    this.process = function (cx, cy, forceRender) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (state === STATE.ROTATE) {
            if (scope.noRotate === true) return;

            rotateEnd.set(cx, cy);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            if (rotateDelta.x == 0 && rotateDelta.y == 0)
                return;

            // rotating across whole screen goes 360 degrees around
            scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);


        } else if (state === STATE.DOLLY) {
            if (scope.noZoom === true) return;

            dollyEnd.set(cx, cy);
            dollyDelta.subVectors(dollyEnd, dollyStart);
            if (dollyDelta.x == 0 && dollyDelta.y == 0)
                return;
            if (dollyDelta.y > 0) {
                //CLOUD.Logger.log("dollyOut");
                scope.dollyOut();
            } else {
                //CLOUD.Logger.log("dollyIn");
                scope.dollyIn();
            }

            scope.dollyByCenter();

            dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
            if (scope.noPan === true) return;

            panEnd.set(cx, cy);
            panDelta.subVectors(panEnd, panStart);
            if (panDelta.x == 0 && panDelta.y == 0)
                return;

            scope.panOnWorld();
            //scope.pan( panDelta.x, panDelta.y );

            panStart.copy(panEnd);
        }

        if (state !== STATE.NONE)
            scope.update(forceRender);
    };

    this.processTouch = function (input, forceRender) {
        var pointersLength = input.pointers.length;

        if (pointersLength > 1) {// 多指操作
            // ROTATE
            if (scope.noRotate !== true) {
                state = STATE.ROTATE;

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                var thresholdAngle = 0.5 * Math.PI / 180; // 0.5度

                if (input.deltaAngle < thresholdAngle && input.deltaAngle > -thresholdAngle) {
                    phiDelta += 2 * Math.PI * input.relativeDeltaY / element.clientWidth * scope.rotateSpeed;
                } else {
                    thetaDelta += input.relativeRotation;
                }
            }

            // DOLLY
            if (scope.noZoom !== true) {
                state = STATE.DOLLY;
                scale /= input.relativeScale;
            }
        } else {// 单指操作
            if (scope.noPan !== true) {
                state = STATE.PAN;

                var deltaX = input.relativeDeltaX;
                var deltaY = input.relativeDeltaY;

                scope.pan(deltaX, deltaY);
            }
        }

        if (state !== STATE.NONE) scope.update(forceRender);
    };

    this.getContainerDimensions = function () {
        return CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    };

    this.mapScreenToLocal = function (cx, cy, target) {
        var dim = this.getContainerDimensions();
        target.set(cx - dim.left, dim.height - (cy - dim.top));
    };

    this.computeFrustum = function () {

        var projectionMatrix = new THREE.Matrix4();
        var viewProjectionMatrix = new THREE.Matrix4();

        return function (x1, x2, y1, y2, frustum, dim) {

            var camera = this.camera;

            var ymax = camera.near * Math.tan(THREE.Math.degToRad(camera.fov * 0.5));
            var xmax = ymax * camera.aspect;

            var rx1 = ((x1 - dim.left) / dim.width) * 2 - 1;
            var rx2 = ((x2 - dim.left) / dim.width) * 2 - 1;
            var ry1 = -((y1 - dim.top) / dim.height) * 2 + 1;
            var ry2 = -((y2 - dim.top) / dim.height) * 2 + 1;

            projectionMatrix.makeFrustum(rx1 * xmax, rx2 * xmax, ry1 * ymax, ry2 * ymax, camera.near, camera.far);

            camera.updateMatrixWorld();
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);
            viewProjectionMatrix.multiplyMatrices(projectionMatrix, camera.matrixWorldInverse);
            frustum.setFromMatrix(viewProjectionMatrix);

        };

    }();

    this.mapWindowToViewport = function (cx, cy, target) {
        var dim = this.getContainerDimensions();
        var mouse = target || new THREE.Vector2();

        mouse.x = ((cx - dim.left) / dim.width) * 2 - 1;
        mouse.y = -((cy - dim.top) / dim.height) * 2 + 1;

        return mouse;
    };

    this.getCameraInfo = function () {
        var camInfo = new CLOUD.CameraInfo(this.camera.position, this.camera.target, this.camera.up);
        return JSON.stringify(camInfo);
    };

    // 放大缩小限制：根据相机与目标点距离来判断是否需要继续放大或缩小
    // 在限制范围内，可以继续缩放，否则，不再缩放
    this.isKeepZoom = function (zoom, minDistance, maxDistance) {
        if (minDistance === undefined) {
            minDistance = this.minDistance;
        }

        if (maxDistance === undefined) {
            maxDistance = this.maxDistance;
        }

        var position = this.camera.position;
        var target = this.camera.target;
        var offset = new THREE.Vector3();

        offset.copy(position).sub(target);
        var distance = offset.length() * (2 - zoom); // D = X + X * (1 - factor)

        if (distance < minDistance || distance > maxDistance) {
            return false;
        }

        return true;
    };

    this.computeRotation = function () {
        // 旋转矩阵
        var m1 = new THREE.Matrix4();
        m1.lookAt(this.camera.position, this.camera.target, this.camera.up);

        var quat2 = new THREE.Quaternion();
        quat2.setFromRotationMatrix(m1);

        // 获得旋转角
        var rotation = new THREE.Euler();
        rotation.setFromQuaternion(quat2, undefined, false);

        return rotation;
    };

    this.adjustCameraUp = function () {

        if (this.camera.realUp.y > 0) {

            this.camera.up = new THREE.Vector3(0, 1, 0);

        } else if (this.camera.realUp.y < 0) {

            this.camera.up = new THREE.Vector3(0, -1, 0);

        } else {

            if (this.camera.realUp.x > 0) {

                this.camera.up = new THREE.Vector3(1, 0, 0);

            } else if (this.camera.realUp.x < 0) {

                this.camera.up = new THREE.Vector3(-1, 0, 0);

            } else {

                if (this.camera.realUp.z > 0) {

                    this.camera.up = new THREE.Vector3(0, 0, 1);

                } else if (this.camera.realUp.z < 0) {

                    this.camera.up = new THREE.Vector3(0, 0, -1);
                }
            }
        }

    };

    this.getWorldEye = function () {
        return this.camera.target.clone().sub(this.camera.position);
    };

    this.getWorldRight = function () {
        var right = new THREE.Vector3();
        var up = this.camera.up;
        var eye = this.getWorldEye();
        right.crossVectors(eye, up);

        if (right.lengthSq() === 0) {
            if (up.z > up.y)
                eye.y -= 0.0001;
            else
                eye.z += 0.0001;

            right.crossVectors(eye, up);
        }

        return right.normalize();
    };

    this.getWorldUp = function () {
        var right = this.getWorldRight();
        var eye = this.getWorldEye();
        return right.cross(eye).normalize();
    };

    this.getWorldDimension = function (cx, cy) {

        var position = this.camera.position;
        var eye = this.getWorldEye().normalize();

        // 计算跟踪距离
        var trackingPoint = this.getTrackingPoint(cx, cy);
        var trackingDir = trackingPoint.clone().sub(position);
        var distance = Math.abs(eye.dot(trackingDir));

        var canvasContainer = this.getContainerDimensions();
        var aspect = canvasContainer.width / canvasContainer.height;
        var height = 2.0 * distance * Math.tan(THREE.Math.degToRad(this.camera.fov * 0.5));
        var width = height * aspect;

        return new THREE.Vector2(width, height);
    };

    this.getHitPoint = function (normalizedX, normalizedY) {

        var scene = this.viewer.getScene();
        var camera = this.camera;
        var hitPoint = scene.getHitPoint(normalizedX, normalizedY, camera);

        if (hitPoint) {
            return hitPoint.clone();
        }

        return null;
    };

    this.pointToWorld = function (normalizedX, normalizedY) {

        var worldPoint = new THREE.Vector3(normalizedX, normalizedY, 0.0);
        worldPoint.unproject(camera);

        return worldPoint;

        //var camera = this.camera;
        //var position = camera.position;
        //var eye = this.getWorldEye();
        //
        //var nearPoint = new THREE.Vector3(normalizedX, normalizedY, -1.0);
        //nearPoint.unproject(camera);
        //
        //var nearLen = nearPoint.sub(position).length();
        //
        //var worldPoint = new THREE.Vector3(normalizedX, normalizedY, 1.0);
        //worldPoint = worldPoint.unproject(camera);
        //
        //// 计算新的点
        //worldPoint.sub(position).normalize();
        //
        //var projectedLength = worldPoint.dot(eye);
        //
        //if (projectedLength < nearLen) {
        //    projectedLength = nearLen;
        //}
        //
        //worldPoint.multiplyScalar(projectedLength).add(position);
        //
        //return worldPoint;
    };

    this.getTrackingPoint = function (cx, cy) {

        var canvasContainer = this.getContainerDimensions();
        // 规范化开始点
        var canvasX = cx - canvasContainer.left;
        var canvasY = cy - canvasContainer.top;
        // 规范化到[-1, 1]
        var normalizedX = (canvasX / canvasContainer.width) * 2.0 - 1.0;
        var normalizedY = ((canvasContainer.height - canvasY) / canvasContainer.height) * 2.0 - 1.0;
        var trackingPoint = this.getHitPoint(normalizedX, normalizedY);

        if (!trackingPoint) {

            var position = this.camera.position;
            var normEye = this.getWorldEye().normalize();
            var worldPoint = this.pointToWorld(normalizedX, normalizedY);

            var ray = new THREE.Ray();
            ray.origin.copy(position);
            ray.direction.copy(worldPoint.clone().sub(position).normalize());

            if (!lastTrackingPoint) {

                trackingPoint = this.getTrackingPointFromBoundingBox(normEye, ray);

            } else {

                // 保持上一次的基点和本次基点在同一平面内

                var plane = new THREE.Plane();
                plane.setFromNormalAndCoplanarPoint(normEye, lastTrackingPoint);

                trackingPoint = ray.intersectPlane(plane);

                // 如果没有取到点，说明上一次的点在相机背后，重新取点
                if (!trackingPoint) {

                    //CLOUD.Logger.log("trackingPoint === null");
                    trackingPoint = this.getTrackingPointFromBoundingBox(normEye, ray);

                } else {

                    // 基准点在相机位置，重新取点

                    var dist = trackingPoint.distanceTo(position);

                    if (dist < EPS) {

                        //CLOUD.Logger.log("equal");
                        trackingPoint = this.getTrackingPointFromBoundingBox(normEye, ray);
                    }
                }
            }

            // 没有取到点，则取worldPoint
            if (!trackingPoint) {

                CLOUD.Logger.log("tracking point is default!");
                trackingPoint = worldPoint;
            }
        }

        // 保存状态
        lastTrackingPoint = trackingPoint.clone();

        return trackingPoint;
    };

    // 获取相机到场景包围盒8个顶点的最大距离对应点所在平面与所给射线的交点
    this.getTrackingPointFromBoundingBox = function (direction, ray) {

        var scene = this.viewer.getScene();
        return scene.getTrackingPointFromBoundingBox(direction, ray);
    };

    // 飞到指定点（平行视角）
    this.flyToPointWithParallelEye = function (point) {

        // 将相机移动到指定的点
        var eye = this.getWorldEye();
        var distance = eye.length();

        // 保持视角方向
        //var dir = new THREE.Vector3(0, 0, -1);
        var dir = eye.clone();
        dir.y = 0;
        dir.normalize();
        dir.setLength(distance);

        var up = new THREE.Vector3(0, 1, 0);

        this.camera.up = up;
        this.camera.realUp = up.clone();

        this.camera.position.copy(point);
        this.camera.target.addVectors(this.camera.position, dir);

        this.update(true);
    };

    // 飞到指定点（保持视角）
    this.flyToPoint = function (point) {

        var position = this.camera.position;
        var eye = this.getWorldEye();
        var normalizedEye = eye.clone().normalize();
        var trackingEye = point.clone().sub(position);
        var distance = Math.abs(normalizedEye.dot(trackingEye));
        var flyOffset = normalizedEye.clone().multiplyScalar(distance);

        this.camera.position.subVectors(point, flyOffset);
        this.camera.target.addVectors(this.camera.position, eye);

        this.update(true);
    };

    // 后退
    this.moveBackward = function (step, keepHeight) {

        var position = this.camera.position;
        var target = this.camera.target;
        if (keepHeight) {
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(-diff.x * coe, 0, -diff.z * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
        else {
            var eye = target.clone().sub(position);
            this.camera.translateZ(step);
            target.addVectors(position, eye);
        }
    };

    // 前进
    this.moveForward = function (step, keepHeight) {

        var position = this.camera.position;
        var target = this.camera.target;

        if (keepHeight) {
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(diff.x * coe, 0, diff.z * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
        else {
            var eye = target.clone().sub(position);

            this.camera.translateZ(-step);
            target.addVectors(position, eye);
        }

    };

    this.updatePivot = function (bySelection, failback) {
        if (bySelection) {
            var box = this.viewer.renderer.computeSelectionBBox();
            if (box == null || box.empty()) {
                failback();
                return;
            }
            this.pivot = box.center(this.pivot);
            return;
        }

        failback();
    };

    this.touchStartHandler = function (event) {
        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate
                if (this.noRotate === true) return;
                handleTouchStartRotate(event);
                state = STATE.ROTATE;
                break;

            case 2:	// two-fingered touch: dolly and pan
                if (this.noZoom !== true) {
                    handleTouchStartDolly(event);
                }
                if (this.noPan !== true) {
                    handleTouchStartPan(event);
                }
                break;

            default:
                state = STATE.NONE;
        }
    }

    this.touchMoveHandler = function (event) {

        this.viewer.editorManager.cameraChange = true;

        switch (event.touches.length) {
            case 1: // one-fingered touch: rotate
                if (this.noRotate !== true) {
                    handleTouchMoveRotate(event);
                }
                break;

            case 2: // two-fingered touch: dolly or pan
                this.viewer.getScene().remove(this.pivotBall);
                this.viewer.getScene().remove(this.pivotCenter);

                if (this.noZoom !== true) {
                    handleTouchMoveDolly(event);
                    state = STATE.DOLLY;
                }
                if (this.noPan !== true) {
                    handleTouchMovePan(event);
                    state = STATE.PAN;
                }

                break;

            default:
                state = STATE.NONE;
        }

        this.touchUpdate();
    }

    this.touchEndHandler = function (event) {

        this.viewer.editorManager.cameraChange = false;

        switch (event.touches.length) {
            // case 1:
            //     if ( this.noRotate !== true ){
            //         handleTouchMoveRotate( event );
            //     }
            //     break;

            default:
                state = STATE.NONE;
        }

        this.viewer.getScene().remove(this.pivotBall);
        this.viewer.getScene().remove(this.pivotCenter);

        this.touchUpdate();
    }

    function pivotBallSize() {
        var camera = scope.camera;
        var position = camera.position;

        var cameraDir = scope.camera.target.clone().sub(position);
        cameraDir.normalize();

        var plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(cameraDir.clone().negate(), scope.pivotBall.position);
        plane.normalize();
        var distance = plane.distanceToPoint(position);
        var planeWidth = distance * Math.tan(camera.fov * 0.5);

        var dim = scope.getContainerDimensions();
        return planeWidth * 2 / (dim.height - dim.top);
    }

    function handleTouchStartRotate(event) {
        //CLOUD.Logger.log( 'handleTouchStartRotate' );

        rotateStart.set(event.touches[0].clientX, event.touches[0].clientY);
    }

    function handleTouchStartDolly(event) {
        //CLOUD.Logger.log( 'handleTouchStartDolly' );

        var dx = event.touches[0].clientX - event.touches[1].clientX;
        var dy = event.touches[0].clientY - event.touches[1].clientY;

        dollyStart.set(0, Math.sqrt(dx * dx + dy * dy));
    }

    function handleTouchStartPan(event) {
        //CLOUD.Logger.log( 'handleTouchStartPan' );

        var cx = (event.touches[0].clientX + event.touches[1].clientX) * 0.5;
        var cy = (event.touches[0].clientY + event.touches[1].clientY) * 0.5;
        panStart.set(cx, cy);
    }

    function handleTouchMoveRotate(event) {
        //CLOUD.Logger.log( 'handleTouchMoveRotate' );

        rotateEnd.set(event.touches[0].clientX, event.touches[0].clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        thetaDelta -= 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed;
        phiDelta -= 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed;

        rotateStart.copy(rotateEnd);

        var scale = pivotBallSize();
        scope.pivotBall.scale.set(scale, scale, scale);
        scope.pivotCenter.scale.set(scale, scale, scale);
        scope.pivotBall.updateMatrixWorld();
        scope.pivotCenter.updateMatrixWorld();
    }

    function handleTouchMoveDolly(event) {
        //CLOUD.Logger.log( 'handleTouchMoveDolly' );

        var dx = event.touches[0].clientX - event.touches[1].clientX;
        var dy = event.touches[0].clientY - event.touches[1].clientY;

        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyEnd.set(0, distance);
        dollyDelta.subVectors(dollyEnd, dollyStart);

        if (Math.abs(dollyDelta.y) < 3) return;

        if (dollyDelta.y > 0) {
            scale /= getZoomScale();
        }
        else if (dollyDelta.y < 0) {
            scale *= getZoomScale();
        }
        dollyStart.copy(dollyEnd);

        dollyCenter.x = (event.touches[0].clientX + event.touches[1].clientX) * 0.5;
        dollyCenter.y = (event.touches[0].clientY + event.touches[1].clientY) * 0.5;

        scope.dolly();
    }

    function handleTouchMovePan(event) {
        //CLOUD.Logger.log( 'handleTouchMovePan' );

        var cx = (event.touches[0].clientX + event.touches[1].clientX) * 0.5;
        var cy = (event.touches[0].clientY + event.touches[1].clientY) * 0.5;
        panEnd.set(cx, cy);
        panDelta.subVectors(panEnd, panStart);

        if (Math.abs(panDelta.x) < 3 && Math.abs(panDelta.y) < 3) return;

        worldDimension = scope.getWorldDimension(cx, cy);
        panDeltaBasedWorld.set(0, 0, 0);

        scope.panOnWorld();

        panStart.copy(panEnd);
    }
};
CLOUD.PickHelper = function (scene, cameraEditor, onObjectSelected) {
    "use strict";

    this.cameraEditor = cameraEditor;
    this.scene = scene;
    this.filter = scene.filter;
    this.onObjectSelected = onObjectSelected;

    this.timerId = null;

    // debug 用
    this.debugInfoDiv = null;
    this.lastDebugInfoDivShow = false;   
};

CLOUD.PickHelper.prototype = {

    constructor: CLOUD.PickHelper,

    destroy : function(){
        this.cameraEditor = null;
        this.scene = null;
        this.filter = null;
        this.onObjectSelected = null;
    },
    
    click: function (event) {
        var scope = this;

        function handleMouseUp() {
            scope.handleMousePick(event, false);
        }

        if (scope.timerId) {
            clearTimeout(scope.timerId);
        }

        // 延迟300ms以判断是否单击
        scope.timerId = setTimeout(handleMouseUp, 300);
    },

    doubleClick : function (event) {

        event.preventDefault();

        if (this.timerId) {
            clearTimeout(this.timerId);
        }

        this.handleMousePick(event, true);
    },

    handleMousePick : function (event, isDoubleClick) {

        var cameraEditor = this.cameraEditor;

        if (cameraEditor.enabled === false)
            return false;


        var scope = this;

        var screenX = event.clientX;
        var screenY = event.clientY;

        var mouse = cameraEditor.mapWindowToViewport(screenX, screenY);

        scope.scene.pick(mouse, cameraEditor.camera, function (intersect) {

            if (!intersect) {

                if (scope.filter.setSelectedIds()) {
                    cameraEditor.updateView(true);                    
                }
                scope.onObjectSelected(null, false);
                return;
            }

            if (CLOUD.Utils.isMobileDevice()) {
                scope.cameraEditor.pivot = intersect.point;
            }

            var userId = intersect.userId;

            // 将位置和包围转换到世界系
            scope.intersectToWorld(intersect);

            // 双击构件变半透明，再双击取消半透明状态
            if (isDoubleClick) {

                if (CLOUD.GlobalData.EnableDemolishByDClick) {
                     scope.filter.addDemolishId(userId, false);
                     cameraEditor.updateView(true);                     
                }
                scope.onObjectSelected(intersect, true);
            }
            else {

                if (!event.ctrlKey) {
                    scope.filter.setSelectedIds();
                }
                
                if (scope.filter.addSelectedId(userId, intersect.object.userData, true)) {

                    scope.onObjectSelected(intersect, false);

                }
                else {

                    scope.onObjectSelected(null, false);
                }
                cameraEditor.updateView(true);
            }

        });
 
    },

    // 将位置和包围盒转换到世界系
    intersectToWorld : function(intersect) {

        // 注意：不确定相对坐标位置是否被其他模块使用，暂时先采用新的变量来保存世界坐标下的位置及包围盒
        // 最好是在求交点的时候，包围盒就和位置一起进行坐标变换, 就可以免除这里的计算了
        var sceneMatrix = this.scene.getMatrixGlobal();

        // 获得世界坐标下的位置
        intersect.worldPosition = CLOUD.GeomUtil.toMeshWorldPosition(intersect.point, sceneMatrix);
        // 获得世界坐标下的包围盒
        intersect.worldBoundingBox = CLOUD.GeomUtil.getBoundingBoxWorldOfMesh(intersect.object, sceneMatrix);
    }

};




CLOUD.OrbitEditor = function (cameraEditor, scene, domElement) {
    "use strict";
    this.scene = scene;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // Mouse buttons
    //this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };
    this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, PAN2: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    // camera state
    this.cameraEditor = cameraEditor;

    this.isMouseClick = false;
    this.oldMouseX = -1;
    this.oldMouseY = -1;
    this.timeoutId = null;
    this.orbitBySelection = false;
};

CLOUD.OrbitEditor.prototype = Object.create(THREE.EventDispatcher.prototype);
CLOUD.OrbitEditor.prototype.constructor = CLOUD.OrbitEditor;

CLOUD.OrbitEditor.prototype.destroy = function () {
};

CLOUD.OrbitEditor.prototype.onExistEditor = function () {
};

CLOUD.OrbitEditor.prototype.resize = function () {
};

CLOUD.OrbitEditor.prototype.getDomElement = function () {
    return this.domElement;
};
// 稍后考虑将延迟处理功能移到EditorManager
//CLOUD.OrbitEditor.prototype.update = function () {
//    this.cameraEditor.update(true, true);
//};

CLOUD.OrbitEditor.prototype.delayHandle = function () {
    var camera_scope = this.cameraEditor;

    function handle() {        
        camera_scope.update(true, true);
    }

    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
    }

    // 延迟300ms以判断是否单击
    this.timeoutId = setTimeout(handle, 200);
    camera_scope.viewer.editorManager.isUpdateRenderList = false;
};

// 增加一个对外部定义事件的处理
CLOUD.OrbitEditor.prototype.fireEvent = function (event) {
    this.cameraEditor.viewer.modelManager.dispatchEvent(event);
};

CLOUD.OrbitEditor.prototype.processMouseDown = function (event) {

    this.isMouseClick = false;
    this.oldMouseX = event.clientX;
    this.oldMouseY = event.clientY;

    var scope = this;
    var camera_scope = this.cameraEditor;

    if (camera_scope.enabled === false) {
        return false;
    }

    event.preventDefault();

    if (event.button === scope.mouseButtons.ORBIT) {
        if (camera_scope.noRotate === true)
            return;
        
        var mouse = camera_scope.mapWindowToViewport(event.clientX, event.clientY);

        camera_scope.updatePivot(this.orbitBySelection, function () {
            scope.scene.hitTestPosition(mouse, camera_scope.camera, function (pt) {
                camera_scope.pivot = pt;
            });
        });
 
        camera_scope.beginRotate(event.clientX, event.clientY);

    } else if (event.button === scope.mouseButtons.ZOOM) {
        if (camera_scope.noZoom === true)
            return;

        camera_scope.beginZoom(event.clientX, event.clientY);
    } else if (event.button === scope.mouseButtons.PAN || event.button === scope.mouseButtons.PAN2) {
        if (camera_scope.noPan === true) return;

        camera_scope.beginPan(event.clientX, event.clientY);
        //camera_scope.beginPan( event.offsetX, event.offsetY );
    }

    if (camera_scope.IsIdle() === false) {
        return true;
    }

    return false;
};
CLOUD.OrbitEditor.prototype.onMouseDown = function (event) {

    return this.processMouseDown(event);
};

CLOUD.OrbitEditor.prototype.processMouseMove = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) {
        return;
    }

    event.preventDefault();

    //CLOUD.Logger.log("[CloudOrbitEditor.onMouseMove][mouse.clientXY(" + event.clientX + "," + event.clientY + "),mouse.offsetXY(" + event.offsetX + "," + event.offsetY + ")]");

    // 当鼠标移动到其他元素上时，event.offsetX, event.offsetY获得的是鼠标在其他元素区域里的相对坐标，
    // 会造成模型跳变，所以传入event.clientX, event.clientY，根据当前父元素节点位置计算鼠标的真实偏移量
    //camera_scope.process(event.offsetX, event.offsetY);

    camera_scope.process(event.clientX, event.clientY, true);
};

CLOUD.OrbitEditor.prototype.onMouseMove = function (event) {
    this.processMouseMove(event);
};

CLOUD.OrbitEditor.prototype.processMouseUp = function (event) {
    // 直接使用up来模拟click
    if (this.oldMouseX == event.clientX && this.oldMouseY == event.clientY) {
        this.isMouseClick = true;
    }

    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false)
        return false;
    if (camera_scope.IsIdle() === true) {
        return false;
    }

    if (!this.isMouseClick) {
        camera_scope.update(true);
    }
    camera_scope.endOperation();
    return true;
};

CLOUD.OrbitEditor.prototype.onMouseUp = function (event) {

    return this.processMouseUp(event);
};

CLOUD.OrbitEditor.prototype.onMouseWheel = function (event) {
    var camera_scope = this.cameraEditor;
    //if (camera_scope.enabled === false || camera_scope.noZoom === true || camera_scope.IsIdle() !== true) return;

    if (camera_scope.enabled === false || camera_scope.noZoom === true) return;

    event.preventDefault();
    event.stopPropagation();

    //滚轮操作在浏览器中要考虑兼容性
    // 五大浏览器（IE、Opera、Safari、Firefox、Chrome）中Firefox 使用detail，其余四类使用wheelDelta；
    //两者只在取值上不一致，代表含义一致，detail与wheelDelta只各取两个值，detail只取±3，wheelDelta只取±120，其中正数表示为向上，负数表示向下。
    var delta = 0 || event.wheelDelta || event.detail;
    delta = (Math.abs(delta) > 10 ? delta : -delta * 40);
    delta *= 0.0001; // 0.0005

    this.delayHandle();

    camera_scope.zoom(delta, event.clientX, event.clientY);
};

CLOUD.OrbitEditor.prototype.onMouseDoubleClick = function (event) {
    //
};

CLOUD.OrbitEditor.prototype.onKeyDown = function (event) {
    var camera_scope = this.cameraEditor;

    if (camera_scope.enabled === false || camera_scope.noKeys === true || camera_scope.noPan === true) return;

    this.delayHandle();

    switch (event.keyCode) {
        case camera_scope.keys.ZERO:
            camera_scope.keyPanSpeed = camera_scope.defaultKeyPanSpeed;
            camera_scope.movementSpeed = camera_scope.defaultMovementSpeed;
            break;
        case camera_scope.keys.PLUS:
            camera_scope.keyPanSpeed *= 1.1;
            camera_scope.movementSpeed *= 1.1;
            break;
        case camera_scope.keys.SUB:
            camera_scope.keyPanSpeed *= 0.9;

            if (camera_scope.keyPanSpeed < camera_scope.minKeyPanSpeed) {
                camera_scope.keyPanSpeed = this.minKeyPanSpeed;
            }

            camera_scope.movementSpeed *= 0.9;

            if (camera_scope.movementSpeed < camera_scope.minMovementSpeed) {
                camera_scope.movementSpeed = this.minMovementSpeed;
            }
            break;
        case camera_scope.keys.Q:
            camera_scope.beginPan();
            camera_scope.pan(0, camera_scope.keyPanSpeed);
            camera_scope.update(true);
            break;

        case camera_scope.keys.E:
            camera_scope.beginPan();
            camera_scope.pan(0, -camera_scope.keyPanSpeed);
            camera_scope.update(true);
            break;

        case camera_scope.keys.LEFT:
        case camera_scope.keys.A:
            camera_scope.beginPan();
            camera_scope.pan(camera_scope.keyPanSpeed, 0);
            camera_scope.update(true);
            break;

        case camera_scope.keys.RIGHT:
        case camera_scope.keys.D:
            camera_scope.beginPan();
            camera_scope.pan(-camera_scope.keyPanSpeed, 0);
            camera_scope.update(true);
            break;

        case camera_scope.keys.UP:
        case camera_scope.keys.W:
            //camera_scope.beginPan();
            camera_scope.moveForward(camera_scope.movementSpeed, !event.shiftKey);
            camera_scope.update(true);
            break;
        case camera_scope.keys.BOTTOM:
        case camera_scope.keys.S:
            //camera_scope.beginPan();
            camera_scope.moveBackward(camera_scope.movementSpeed, !event.shiftKey);
            camera_scope.update(true);
            break;
    }
};

CLOUD.OrbitEditor.prototype.onKeyUp = function (event) {

    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false || camera_scope.noKeys === true || camera_scope.noPan === true) return;

    switch (event.keyCode) {
        case camera_scope.keys.ESC:
            // 对构件的特殊处理，严重依赖业务，需要考虑更灵活的实现
            this.scene.filter.clearSelectionSet();
            this.fireEvent({ type: CLOUD.EVENTS.ON_SELECTION_CHANGED, intersect: null, click: 1 });
            break;
        default :
            break
    }
};

CLOUD.OrbitEditor.prototype.touchstart = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) return;

    camera_scope.touchStartHandler(event);
};

CLOUD.OrbitEditor.prototype.touchmove = function (event) {
    var scope = this;
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) return;

    event.preventDefault();
    //event.stopPropagation();

    camera_scope.touchMoveHandler(event);
};

CLOUD.OrbitEditor.prototype.touchend = function( /* event */ ) {
    var camera_scope = this.cameraEditor;
    if ( camera_scope.enabled === false ) return;

    camera_scope.touchEndHandler(event);

    //scope.dispatchEvent( endEvent );
};
CLOUD.PickEditor = function (object, scene, domElement) {
    "use strict";
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    // Customize the mouse buttons
    //this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };
    var scope = this;
    this.pickHelper = new CLOUD.PickHelper(scene, this.cameraEditor, function (select, doubleClick) {
        scope.onObjectSelected(select, doubleClick);
    });
};

CLOUD.PickEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.PickEditor.prototype.constructor = CLOUD.PickEditor;

CLOUD.PickEditor.prototype.pickByClick = function (event) {

    this.pickHelper.click(event);
};

CLOUD.PickEditor.prototype.processMouseUp = function (event) {

    var scope = this;

    if (scope.oldMouseX == event.clientX && scope.oldMouseY == event.clientY) {
        this.pickByClick(event);
    }
    else {

        scope.cameraEditor.update(true);
    }
};

CLOUD.PickEditor.prototype.onMouseUp = function (event) {

    event.preventDefault();

    this.processMouseUp(event);
};

CLOUD.PickEditor.prototype.onMouseDoubleClick = function (event) {

    this.pickHelper.doubleClick(event);
};

CLOUD.RectPickEditor = function (slaveEditor, onSelectionChanged) {

    this.onObjectSelected = onSelectionChanged;

    this.startPt = new THREE.Vector2();
    this.endPt = new THREE.Vector2();

    this.frustum = new THREE.Frustum();

    this.slaveEditor = slaveEditor;

    var scope = this;
    this.pickHelper = new CLOUD.PickHelper(slaveEditor.scene, slaveEditor.cameraEditor, function (select, doubleClick) {
        scope.onObjectSelected(select, doubleClick);
    });

    this.timeId = null;
    this.longTapFlag = false;

    if (CLOUD.Utils.isMobileDevice()) {
        this.selectPad = new CLOUD.SelectPad(this);
    } else {
        this.selectPad = null;
    }

    var scope = this;

    this.longTap = function () {
        scope.longTapFlag = true;
        CLOUD.Logger.log("long tap");

        if (scope.selectPad) {
            scope.selectPad.showOverlay(scope.startPt);
        }
    };
};


CLOUD.RectPickEditor.prototype = {

    onstructor: CLOUD.RectPickEditor,

    destroy: function () {

        this.onObjectSelected = null;
        this.slaveEditor = null;

        this.pickHelper.destroy();
        this.pickHelper = null;

        if (this.selectPad) {
            this.selectPad = null;
        }

    },

    resize: function () {
    },

    getDomElement: function () {
        return this.slaveEditor.domElement;
    },

    udpateFrustum: function (updateUI) {

        var x1 = this.startPt.x;
        var x2 = this.endPt.x;
        var y1 = this.startPt.y;
        var y2 = this.endPt.y;

        if (x1 > x2) {

            var tmp1 = x1;
            x1 = x2;
            x2 = tmp1;

        }

        if (y1 > y2) {

            var tmp2 = y1;
            y1 = y2;
            y2 = tmp2;

        }

        if (x2 - x1 == 0 || y2 - y1 == 0)
            return false;

        var helper = this.slaveEditor.cameraEditor;
        var dim = helper.getContainerDimensions();

        helper.computeFrustum(x1, x2, y1, y2, this.frustum, dim);

        if (updateUI) {
            this.onUpdateUI({
                visible: true,
                dir: this.startPt.x < this.endPt.x,
                left: (x1 - dim.left),
                top: (y1 - dim.top),
                width: (x2 - x1),
                height: (y2 - y1)
            });
        }

        return true;
    },

    onExistEditor: function () {
        this.slaveEditor.onExistEditor();
    },

    onKeyDown: function (evt) {
        this.slaveEditor.onKeyDown(evt);
    },

    onKeyUp: function (evt) {
        this.slaveEditor.onKeyUp(evt);
    },

    onMouseDoubleClick: function (evt) {
        this.pickHelper.doubleClick(evt);
    },

    onMouseDown: function (event) {

        event.preventDefault();
        //event.stopPropagation();

        if (event.button === THREE.MOUSE.LEFT) {

            this.startPt.set(event.clientX, event.clientY);
        }

        return this.slaveEditor.processMouseDown(event);
    },

    onMouseMove: function (event) {

        event.preventDefault();
        var allowRectPick = event.shiftKey || event.ctrlKey || event.altKey;
        if (allowRectPick && event.button === THREE.MOUSE.LEFT) {

            this.endPt.set(event.clientX, event.clientY);
            this.udpateFrustum(true);
            return true;
        }

        this.slaveEditor.processMouseMove(event);
    },

    onMouseUp: function (event) {

        event.preventDefault();
        //event.stopPropagation();
        var slaveEditor = this.slaveEditor;

        this.onUpdateUI({visible: false});

        if (event.button === THREE.MOUSE.LEFT) {

            if (this.startPt.x == event.clientX && this.startPt.y == event.clientY) {
                this.pickHelper.click(event);
                return true;
            }
            else {
                var allowRectPick = event.shiftKey || event.ctrlKey || event.altKey;
                if (allowRectPick) {

                    this.endPt.set(event.clientX, event.clientY);
                    if (!this.udpateFrustum()) {
                        this.pickHelper.click(event);
                        return false;
                    }

                    var state = CLOUD.OPSELECTIONTYPE.Clear;

                    if (event.ctrlKey) {
                        state = CLOUD.OPSELECTIONTYPE.Add;
                    }
                    else if (event.altKey) {
                        state = CLOUD.OPSELECTIONTYPE.Remove;
                    }


                    var scope = this;
                    slaveEditor.scene.pickByRect(this.frustum, state, function () {
                        scope.onObjectSelected(null, false);
                    });
                    slaveEditor.cameraEditor.updateView(true);

                    return true;
                }
            }

        }


        return slaveEditor.processMouseUp(event);
    },

    onMouseWheel: function (evt) {
        this.slaveEditor.onMouseWheel(evt);
    }
};

CLOUD.RectPickEditor.prototype.touchstart = function (event) {
    var camera_scope = this.slaveEditor;
    if (camera_scope.enabled === false) return;

    this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);

    camera_scope.touchstart(event);

    if (this.timeId) {
        clearTimeout(this.timeId);
    }

    var scope = this;
    scope.timeId = setTimeout(scope.longTap, 400);

    if (this.selectPad) {
        this.selectPad.hideOverlay();
    }
};

CLOUD.RectPickEditor.prototype.touchmove = function (event) {
    var scope = this;
    var camera_scope = this.slaveEditor;
    if (camera_scope.enabled === false) return;

    if (this.timeId) {
        clearTimeout(this.timeId);
    }

    event.preventDefault();
    event.stopPropagation();

    camera_scope.touchmove(event);
};

CLOUD.RectPickEditor.prototype.touchend = function (event) {
    var camera_scope = this.slaveEditor;
    if (camera_scope.enabled === false) return;

    camera_scope.touchend(event);

    if (this.timeId) {
        clearTimeout(this.timeId);
    }

    if (this.longTapFlag) {
        this.longTapFlag = false;
        event.preventDefault();
    }
};
CLOUD.ZoomEditor = function ( object, scene, domElement ) {
	CLOUD.OrbitEditor.call( this,  object, scene, domElement );
	
	//this.mouseButtons = { ZOOM: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT };
	this.mouseButtons = { ZOOM: THREE.MOUSE.LEFT, PAN2: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
};
CLOUD.ZoomEditor.prototype = Object.create( CLOUD.OrbitEditor.prototype );
CLOUD.ZoomEditor.prototype.constructor = CLOUD.ZoomEditor;


CLOUD.RectZoomEditor = function (cameraEditor, scene, domElement) {

    CLOUD.OrbitEditor.call(this, cameraEditor, scene, domElement);

    this.startPt = new THREE.Vector2();
    this.endPt = new THREE.Vector2();
    this.frustum = new THREE.Frustum();
};

CLOUD.RectZoomEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.RectZoomEditor.prototype.constructor = CLOUD.RectZoomEditor;

CLOUD.RectZoomEditor.prototype.updateFrustum = function(updateUI) {

    var x1 = this.startPt.x;
    var x2 = this.endPt.x;
    var y1 = this.startPt.y;
    var y2 = this.endPt.y;

    if (x1 > x2) {

        var tmp1 = x1;
        x1 = x2;
        x2 = tmp1;

    }

    if (y1 > y2) {

        var tmp2 = y1;
        y1 = y2;
        y2 = tmp2;

    }

    if (x2 - x1 == 0 || y2 - y1 == 0)
        return false;

    var dim = this.cameraEditor.getContainerDimensions();

    this.cameraEditor.computeFrustum(x1, x2, y1, y2, this.frustum, dim);

    if (updateUI) {

        this.onUpdateUI({
            visible: true,
            dir: this.startPt.x < this.endPt.x,
            left: (x1 - dim.left),
            top: (y1 - dim.top),
            width: (x2 - x1),
            height: (y2 - y1)
        });
    }

    return true;
};

CLOUD.RectZoomEditor.prototype.onMouseDown = function(event) {

    event.preventDefault();
    event.stopPropagation();

    if (event.button === THREE.MOUSE.LEFT) {

        this.startPt.set(event.clientX, event.clientY);
    }

    return this.processMouseDown(event);
};

CLOUD.RectZoomEditor.prototype.onMouseMove = function(event) {

    event.preventDefault();

    if (event.button === THREE.MOUSE.LEFT) {

        this.endPt.set(event.clientX, event.clientY);
        this.updateFrustum(true);
        return true;
    }

    this.processMouseMove(event);
};

CLOUD.RectZoomEditor.prototype.onMouseUp = function(event) {

    event.preventDefault();
    event.stopPropagation();

    this.onUpdateUI({visible: false});

    if (event.button === THREE.MOUSE.LEFT) {

        if (this.startPt.x == event.clientX && this.startPt.y == event.clientY) {

            return true;
        }
        else {

            this.endPt.set(event.clientX, event.clientY);

            if (!this.updateFrustum()) {
                return false;
            }

            this.zoomToRectangle();

            return true;
        }

    }

    return this.processMouseUp(event);
};

CLOUD.RectZoomEditor.prototype.zoomToRectangle = function () {

    var camera = this.cameraEditor.camera;
    var target = this.cameraEditor.camera.target;
    var zNear = camera.near;

    var canvasBounds = this.cameraEditor.getContainerDimensions();
    var startX = this.startPt.x - canvasBounds.left;
    var startY = this.startPt.y - canvasBounds.top;
    var endX = this.endPt.x - canvasBounds.left;
    var endY = this.endPt.y - canvasBounds.top;
    var rectWidth = Math.abs(endX - startX);
    var rectHeight = Math.abs(startY - endY);

    if (rectWidth === 0 || rectHeight === 0)  return;

    var rectCenter = new THREE.Vector2((startX + endX) / 2, (startY + endY) / 2);
    var normalizeCenterX = rectCenter.x / canvasBounds.width * 2 - 1;
    var normalizeCenterY = -rectCenter.y / canvasBounds.height * 2 + 1;
    var normalizeCenter = new THREE.Vector2(normalizeCenterX, normalizeCenterY);

    var eye = camera.position.clone();
    var dirEyeToTarget = target.clone().sub(eye);
    var distEyeToTarget = dirEyeToTarget.length();

    var dirZoom;

    var pivot = this.scene.hitTest(normalizeCenter, camera);

    if (pivot) {

        var scaleFactor = rectWidth / rectHeight > canvasBounds.width / canvasBounds.height ? rectWidth / canvasBounds.width : rectHeight / canvasBounds.height;
        var distEyeToPivot = pivot.distanceTo(eye);
        var distZoom = distEyeToPivot * scaleFactor;

        dirEyeToTarget.normalize();
        //dirZoom = eye.clone().sub(pivot).normalize().multiplyScalar(zoomDist);
        dirZoom = dirEyeToTarget.clone().negate().multiplyScalar(distZoom);

    } else {

        var rcZoom = {};
        rcZoom.left = Math.min(startX, endX);
        rcZoom.top = Math.min(startY, endY);
        rcZoom.right = Math.max(startX, endX);
        rcZoom.bottom = Math.max(startY, endY);

        var closeDepth = this.scene.getNearDepthByRect(this.frustum, camera);

        if (closeDepth !== Infinity){

            var rCenter = new THREE.Vector3((startX + endX) / 2, (startY + endY) / 2, closeDepth);
            var rCorner = new THREE.Vector3(rcZoom.left, rcZoom.top, closeDepth);
            var wCenter = this.clientToWorld(rCenter);
            var wCorner = this.clientToWorld(rCorner);
            var distZoom = wCenter.clone().sub(wCorner).length();

            //if (distZoom < zNear) {
            //    //CLOUD.Logger.log("new dist", [newDist, near]);
            //    distZoom = zNear;
            //}

            pivot = wCenter.clone();
            dirEyeToTarget.normalize();
            dirZoom = dirEyeToTarget.clone().negate().multiplyScalar(distZoom);

        } else {

            var halfFrustumHeight = zNear * Math.tan(THREE.Math.degToRad(camera.fov * 0.5));
            var halfFrustumWidth = halfFrustumHeight * camera.aspect;
            var rightWidth = rectCenter.x * 2 * halfFrustumWidth / canvasBounds.width;
            var distCenterToRight = rightWidth - halfFrustumWidth;
            var upHeight = rectCenter.y * 2 * halfFrustumHeight / canvasBounds.height;
            var distCenterToUp = upHeight - halfFrustumHeight;
            var dirRight = this.cameraEditor.getWorldRight();
            var dirUp = this.cameraEditor.getWorldUp();

            dirRight.normalize().multiplyScalar(distCenterToRight);
            dirUp.multiplyScalar(distCenterToUp);

            var dirRay = dirEyeToTarget.clone().add(dirUp).add(dirRight);

            pivot = eye.clone().add(dirRay);

            var scaleFactor = rectWidth / rectHeight > canvasBounds.width / canvasBounds.height ? rectWidth / canvasBounds.width : rectHeight / canvasBounds.height;
            var distEyeToPivot = pivot.distanceTo(eye);
            var distZoom = distEyeToPivot * scaleFactor;

            dirEyeToTarget.normalize();
            //dirZoom = eye.clone().sub(pivot).normalize().multiplyScalar(zoomDist);
            dirZoom = dirEyeToTarget.clone().negate().multiplyScalar(distZoom);
        }

    }

    eye = pivot.clone().add(dirZoom);
    camera.position.copy(eye);
    target.copy(eye).sub(dirZoom.clone().normalize().multiplyScalar(distEyeToTarget));
    this.cameraEditor.updateView(true);
};

CLOUD.RectZoomEditor.prototype.worldToClient = function (wPoint) {

    var camera = this.cameraEditor.camera;
    var result = new THREE.Vector3(wPoint.x, wPoint.y, wPoint.z);

    result.project(camera);

    return result;
};

CLOUD.RectZoomEditor.prototype.clientToWorld = function (cPoint) {

    var rect = this.cameraEditor.getContainerDimensions();
    var camera = this.cameraEditor.camera;
    var result = new THREE.Vector3();

    result.x = cPoint.x / rect.width * 2 - 1;
    result.y = -cPoint.y / rect.height * 2 + 1;
    result.z = cPoint.z;

    result.unproject(camera);

    return result;
};
CLOUD.PanEditor = function (object, scene, domElement) {
    "use strict";
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    //this.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT };
};

CLOUD.PanEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.PanEditor.prototype.constructor = CLOUD.PanEditor;
CLOUD.FlyEditorUI = function (domElement, onChangeSpeed) {
    "use strict";

    this.domElement = (domElement !== undefined) ? domElement : document;

    if (domElement) this.domElement.setAttribute('tabindex', -1);

    this.enableControlPanel = false;// 是否允许控制面板

    this.crossContainer = null; // 十字图标父容器
    this.crossBoxWidth = 30; // 十字图标包围盒宽度
    this.crossBoxHeight = 30;// 十字图标包围盒高度

    this.elementIds = {
        imgKeyQ: 'imgKeyQ',
        imgKeyW: 'imgKeyW',
        imgKeyE: 'imgKeyE',
        imgKeyA: 'imgKeyA',
        imgKeyS: 'imgKeyS',
        imgKeyD: 'imgKeyD',
        imgKeyQ2: 'imgKeyQ2',
        imgKeyW2: 'imgKeyW2',
        imgKeyE2: 'imgKeyE2',
        imgKeyA2: 'imgKeyA2',
        imgKeyS2: 'imgKeyS2',
        imgKeyD2: 'imgKeyD2',
        imgTipQ: 'imgTipQ',
        imgTipW: 'imgTipW',
        imgTipE: 'imgTipE',
        imgTipA: 'imgTipA',
        imgTipS: 'imgTipS',
        imgTipD: 'imgTipD',
        tipRemarkQ: 'tipRemarkQ',
        tipRemarkW: 'tipRemarkW',
        tipRemarkE: 'tipRemarkE',
        tipRemarkA: 'tipRemarkA',
        tipRemarkS: 'tipRemarkS',
        tipRemarkD: 'tipRemarkD',
        keyControlPanel: 'keyControlPanel',
        velocitySliderPanel: 'velocitySliderPanel',
        velocitySlider: 'velocitySlider',
        keySelectedCss: 'key-selected'
    };

    // 速度滑动条设置
    this.sliderMax = 100;
    this.sliderMin = 1;
    this.sliderMiddle = 50;
    this.sliderSection = 10; // 滑动条分段数目
    this.sliderStep = this.sliderMax / this.sliderSection;

    this.onChangeSpeed = onChangeSpeed;
};

CLOUD.FlyEditorUI.prototype = {

    // 初始化方向控制器
    initCross: function () {

        if (!this.crossContainer) {
            var container = this.domElement;

            var xmlns = "http://www.w3.org/2000/svg";
            var boxWidth = this.crossBoxWidth;
            var boxHeight = this.crossBoxHeight;

            var dim = CLOUD.DomUtil.getContainerOffsetToClient(container);
            var left = dim.width / 2 - boxWidth / 2;
            var top = dim.height / 2 - boxHeight / 2;

            var svgElem = document.createElementNS(xmlns, "svg");
            svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
            svgElem.setAttributeNS(null, "width", boxWidth);
            svgElem.setAttributeNS(null, "height", boxHeight);

            // 绘制十字形
            //d="M 15, 15 l 15, 0 l -30, 0 l 15, 0 l 0, 15 l 0, -30 l 0, 15"
            var coords = "M " + boxWidth / 2 + ", " + boxHeight / 2 + "";
            coords += " l " + boxWidth / 2 + ", 0";
            coords += " l -" + boxWidth + ", 0";
            coords += " l " + boxWidth / 2 + ", 0";
            coords += " l 0, " + boxHeight / 2 + "";
            coords += " l 0, -" + boxHeight + "";
            coords += " l 0, " + boxHeight / 2 + "";

            var path = document.createElementNS(xmlns, "path");
            path.setAttributeNS(null, 'stroke', "red");
            path.setAttributeNS(null, 'stroke-width', 1);
            path.setAttributeNS(null, 'd', coords);
            path.setAttributeNS(null, 'opacity', 0.8);
            svgElem.appendChild(path);

            var svgContainer = document.createElement("div");
            svgContainer.style.position = "absolute";
            svgContainer.style.display = "block";
            svgContainer.style.outline = "0";
            svgContainer.style.left = left + "px";
            svgContainer.style.top = top + "px";
            svgContainer.style.opacity = "1.0";
            svgContainer.style.webkitTransition = "opacity .2s ease";
            svgContainer.style.mozTransition = "opacity .2s ease";
            svgContainer.style.msTransform = "opacity .2s ease";
            svgContainer.style.oTransform = "opacity .2s ease";
            svgContainer.style.transition = "opacity .2s ease";

            svgContainer.appendChild(svgElem);
            container.appendChild(svgContainer);

            this.crossContainer = svgContainer;
        }
    },
    resize: function() {
        var container = this.domElement;
        var boxWidth = this.crossBoxWidth;
        var boxHeight = this.crossBoxHeight;
        var svgContainer = this.crossContainer;

        var dim = CLOUD.DomUtil.getContainerOffsetToClient(container);
        var left = dim.width / 2 - boxWidth / 2;
        var top = dim.height / 2 - boxHeight / 2;

        svgContainer.style.left = left + "px";
        svgContainer.style.top = top + "px";
    },
    onKeyDown: function (moveState, MoveDirection) {
        if (!this.enableControlPanel)
            return;

        if (moveState &  MoveDirection.FORWARD) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyW, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyW2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipW, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkW, true);
        }

        if ( moveState & MoveDirection.BACK) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyS, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyS2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipS, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkS, true);
        }

        if (moveState & MoveDirection.LEFT) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyA, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyA2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipA, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkA, true);
        }

        if (moveState & MoveDirection.RIGHT) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyD, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyD2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipD, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkD, true);
        }
   

        if (moveState & MoveDirection.UP) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyQ, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyQ2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipQ, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkQ, true);
        }

        if (moveState & MoveDirection.DOWN) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyE, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyE2, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipE, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkE, true);
        }
    },

    onKeyUp: function (moveState, MoveDirection) {
        if (!this.enableControlPanel)
            return;

        if (moveState & MoveDirection.FORWARD) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyW, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyW2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipW, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkW, false);
        } 

        if ( moveState & MoveDirection.BACK) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyS, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyS2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipS, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkS, false);
        }
 
        if (moveState & MoveDirection.LEFT) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyA, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyA2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipA, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkA, false);
        }

        if (moveState & MoveDirection.RIGHT) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyD, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyD2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipD, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkD, false);
        }

        if (moveState & MoveDirection.UP) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyQ, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyQ2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipQ, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkQ, false);
        }

        if (moveState & MoveDirection.DOWN) {
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyE, true);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgKeyE2, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.imgTipE, false);
            CLOUD.DomUtil.showOrHideElement(this.elementIds.tipRemarkE, false);
        }
    },

    changeMoveSpeed: function (delta, cur) {
        // 鼠标滚轮控制运动速度
        if (delta > 0) {
            cur += this.sliderStep;

            if (cur > this.sliderMax) {
                cur = this.sliderMax;
            }
        } else {
            cur -= this.sliderStep;

            if (cur < this.sliderMin) {
                cur = this.sliderMin;
            }
        }

        if (this.velocitySlider) {
            this.velocitySlider.value = cur;
        }

        return cur;
    },

    // 启用或关闭控制面板
    enableFlyControlPanel: function (enable) {
        this.enableControlPanel = enable;
    },

    // 是否显示控制面板
    showControlPanel: function (isShow) {

        if (isShow === undefined) {
            isShow = false;
        }

        this.enableControlPanel = isShow;

        if (isShow) {
            // 创建键盘控制面板
            this.createKeyControlPanel(this.domElement.parentNode);
            // 创建滑动条控制面板
            this.createVelocitySliderPanel(this.domElement.parentNode);
        }

        // 显示或隐藏键盘控制面板
        CLOUD.DomUtil.showOrHideElement(this.elementIds.keyControlPanel, isShow);
        // 显示或隐藏滑动条面板
        CLOUD.DomUtil.showOrHideElement(this.elementIds.velocitySliderPanel, isShow);
        // 显示或隐藏方向控制器
        this.setCrossVisible(isShow);
    },

    // 设置方向控制器可见性
    setCrossVisible: function (visible) {

        if(this.crossContainer) {
            if (visible) {
                this.crossContainer.style.display = "";
            } else {
                this.crossContainer.style.display = "none";
            }
        }
    },

    // 创建滑动条面板
    createVelocitySliderPanel: function (parentNode) {
        if (parentNode !== undefined) {
            var scope = this;

            if (this.velocitySliderPanel === undefined) {
                var htmlText = '<span class="span-align">Min</span>' +
                    '<span  class="span-align"><input type="range" name="slider" id="velocitySlider" /></span>' +
                    '<span class="span-align">Max</span>';
                this.velocitySliderPanel = document.createElement("div");
                this.velocitySliderPanel.id = "velocitySliderPanel";
                //this.velocitySliderPanel.className = "row iconk-small iconk-widthFollow";
                this.velocitySliderPanel.style.display = "none";
                this.velocitySliderPanel.align = "center";
                this.velocitySliderPanel.innerHTML = htmlText;

                parentNode.appendChild(this.velocitySliderPanel);

                // 设置滑动条状态
                this.velocitySlider = document.getElementById(scope.elementIds.velocitySlider);
                if (this.velocitySlider) {
                    this.velocitySlider.max = this.sliderMax;
                    this.velocitySlider.min = this.sliderMin;
                    this.velocitySlider.value = this.sliderMiddle;
                    this.onChangeSpeed(this.sliderMiddle);
                    this.velocitySlider.addEventListener('change', function () {
                        scope.onChangeSpeed(scope.velocitySlider.value);
                    });
                }
            }
        }
    },

    // 创建键盘控制面板
    createKeyControlPanel: function (parentNode) {
        if (parentNode !== undefined) {
            if (this.keyControlPanel === undefined) {
                // 构造一个6 * 5 的格子面板
                // ------------------------------------------------
                //      0        1        2        3        4
                //  -----------------------------------------------
                //  0    *       *     forward     *        *
                //  1    up      *        |^       *        down
                //  2    |^      Q       W         E        |^
                //  3    <-      A       S         D        ->
                //  4    left    *       |         *        right
                //  5    *       *      back       *        *
                // ------------------------------------------------
                var elements = [{
                    id: 'key00', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key01', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key02', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkW', tipText: '前进', tipCss: 'tip-bottom'
                }, {
                    id: 'key03', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key04', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key10', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkQ', tipText: '上升', tipCss: 'tip-bottom'
                }, {
                    id: 'key11', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key12', imgId: 'imgTipW', imgUrl:CLOUD.GlobalData.TextureResRoot + 'cloud-tip-forward.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key13', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key14', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkE', tipText: '下降', tipCss: 'tip-bottom'
                }, {
                    id: 'key20', imgId: 'imgTipQ', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-tip-up.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyQ', imgId: 'imgKeyQ', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-Q.png', imgId2: 'imgKeyQ2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-Q.png',tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyW', imgId: 'imgKeyW', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-W.png"', imgId2: 'imgKeyW2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-W.png',tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyE', imgId: 'imgKeyE', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-E.png', imgId2: 'imgKeyE2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-E.png',tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key24', imgId: 'imgTipE', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-tip-down.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key30', imgId: 'imgTipA"', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-tip-left.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyA', imgId: 'imgKeyA', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-A.png', imgId2: 'imgKeyA2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-A.png', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyS', imgId: 'imgKeyS', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-S.png', imgId2: 'imgKeyS2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-S.png',tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'keyD', imgId: 'imgKeyD', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-key-D.png', imgId2: 'imgKeyD2', imgUrl2: CLOUD.GlobalData.TextureResRoot + 'cloud-press-D.png',tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key34', imgId: 'imgTipD', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-tip-right.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key40', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkA', tipText: '左移', tipCss: 'tip-right'
                }, {
                    id: 'key41', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key42', imgId: 'imgTipS', imgUrl: CLOUD.GlobalData.TextureResRoot + 'cloud-tip-back.png', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key43', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key44', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkD', tipText: '右移', tipCss: 'tip-left'
                }, {
                    id: 'key50', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key51', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key52', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: 'tipRemarkS', tipText: '后退', tipCss: 'tip-top'
                }, {
                    id: 'key53', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }, {
                    id: 'key54', imgId: '', imgUrl: '', imgId2: '', imgUrl2: '', tipId: '', tipText: '', tipCss: ''
                }];

                var htmlText = '<ul class="guide-list">';
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];

                    htmlText += '<li id="' + element.id + '">';
                    htmlText += '<div class="key-panel">';

                    if (element.tipId !== '') {
                        htmlText += '<p id="' + element.tipId + '" class="' + element.tipCss + '" style="display: none">' + element.tipText + '</p>';
                    }

                    if (element.imgId !== '') {
                        if (element.imgId2 !== '') {
                            htmlText += '<images id="' + element.imgId + '" class="icon-medium" src="' + element.imgUrl + '" />';
                            htmlText += '<images id="' + element.imgId2 + '" class="icon-medium" src="' + element.imgUrl2 + '" style="display: none" />';
                        } else {
                            htmlText += '<images id="' + element.imgId + '" class="icon-medium" src="' + element.imgUrl + '" style="display: none" />';
                        }
                    }

                    htmlText += '</div>';
                    htmlText += '</li>';
                }

                htmlText += '</ul>';

                this.keyControlPanel = document.createElement("div");
                this.keyControlPanel.id = "keyControlPanel";
                this.keyControlPanel.style.display = "none";
                this.keyControlPanel.innerHTML = htmlText;

                parentNode.appendChild(this.keyControlPanel);
            }
        }
    }
}
CLOUD.FlyEditor = function (cameraEditor, scene, domElement) {
    "use strict";
    this.cameraEditor = cameraEditor;
    this.scene = scene;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // API
    this.movementSpeed = 0.005 * CLOUD.GlobalData.SceneSize; // 移动速度
    this.defaultMovementSpeed = this.movementSpeed;
    this.minMovementSpeed = 0.001;
    this.movementSpeedMultiplier = 1; // 速度放大器

    this.lookSpeed = 0.001; // 相机观察速度

    this.constrainPitch = true; // 是否限制仰角
    // 仰角范围[-85, 175]
    this.pitchMin = THREE.Math.degToRad(5) - 0.5 * Math.PI; // 仰角最小值
    this.pitchMax = 0.5 * Math.PI - this.pitchMin; // 仰角最大值
    this.pitchDeltaTotal = 0;

    this.mouseButtons = {ORBIT: THREE.MOUSE.RIGHT, PAN2: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT};

    this.MoveDirection = {
        NONE: 0,
        UP: 0x0001,
        DOWN: 0x0002,
        LEFT: 0x0004,
        RIGHT: 0x0008,
        FORWARD: 0x0010,
        BACK: 0x0020
    };
    this.moveState = this.MoveDirection.NONE;

    this.isFirstPerson = true; // 第一人称视角
    this.deltaYaw = 0.0;
    this.deltaPitch = 0.0;
    this.deltaWheel = 0;

    // 保存旋转点
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    this.timeoutId = null;

    this.isLockCameraHeight = true;
    this.lockCameraHeight = 0;

    //this.clock = new THREE.Clock();

    //var scope = this;

    this.ui = new CLOUD.FlyEditorUI(this.domElement, function (speedMultiplier) {
        //scope.movementSpeedMultiplier = speedMultiplier;
    });
    // 初始化方向控制器
    this.ui.initCross();
};

CLOUD.FlyEditor.prototype = {
    constructor: CLOUD.FlyEditor,

    destroy: function () {
        this.ui = null;
        this.cameraEditor = null;
        this.scene = null;
        this.domElement = null;
    },

    resize: function () {
        this.ui.resize();
    },

    getDomElement: function () {
        return this.domElement;
    },

    handleEvent: function (event) {
        if (typeof this[event.type] == 'function') {
            this[event.type](event);
        }
    },
    delayHandle: function () {
        var scope = this;

        function handle() {
            scope.cameraEditor.viewer.editorManager.isUpdateRenderList = true;
            //scope.update();
            // 最后一帧只需刷新数据
            scope.cameraEditor.flyOnWorld();
        }

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // 延迟300ms以判断是否单击
        this.timeoutId = setTimeout(handle, 200);
        this.cameraEditor.viewer.editorManager.isUpdateRenderList = false;
    },
    activate: function () {
        //this.clock.start();
    },
    deactivate: function () {
        //this.clock.stop();
    },
    onExistEditor: function () {
        this.deactivate();
        this.ui.showControlPanel(false);
    },
    onKeyDown: function (event) {
        if (event.altKey) {
            return;
        }

        var moveDirection = this.MoveDirection.NONE;
        switch (event.keyCode) {
            case 48: /* 0 - 恢复速度 */
                this.movementSpeed = this.defaultMovementSpeed;
                break;
            case 187: /* 等号&加号 - 加速*/
                this.movementSpeed *= 1.1;
                break;
            case 189: /* 破折号&减号 - 减速*/
                this.movementSpeed *= 0.9;
                if (this.movementSpeed < this.minMovementSpeed) {
                    this.movementSpeed = this.minMovementSpeed;
                }
                break;
            case 38: /*up - 前进*/
            case 87: /*W - 前进*/
                moveDirection = this.MoveDirection.FORWARD;
                break;
            case 40: /*down - 后退 */
            case 83: /*S - 后退*/
                moveDirection = this.MoveDirection.BACK;
                break;
            case 37: /*left - 左移 */
            case 65: /*A - 左移*/
                moveDirection = this.MoveDirection.LEFT;
                break;
            case 39: /*right - 右移*/
            case 68: /*D - 右移*/
                moveDirection = this.MoveDirection.RIGHT;
                break;
            case 81: /*Q - 上移*/
                moveDirection = this.MoveDirection.UP;
                break;
            case 69: /*E - 下移*/
                moveDirection = this.MoveDirection.DOWN;
                break;
            default:
                needUpdateUI = true;
        }

        if (moveDirection !== this.MoveDirection.NONE) {
            this.moveState |= moveDirection;
            this.ui.onKeyDown(moveDirection, this.MoveDirection);
        }

        this.delayHandle();

        this.isFirstPerson = !event.shiftKey;
        this.update();
    },

    onKeyUp: function (event) {
        var moveDirection = this.MoveDirection.NONE;
        switch (event.keyCode) {
            case 38: /*up - 前进*/
            case 87: /*W - 前进 */
                moveDirection = this.MoveDirection.FORWARD;
                break;
            case 40: /*down - 后退 */
            case 83: /*S - 后退 */
                moveDirection = this.MoveDirection.BACK;
                break;
            case 37: /*left - 左移 */
            case 65: /*A - 左移 */
                moveDirection = this.MoveDirection.LEFT;
                break;
            case 39: /*right - 右移*/
            case 68: /*D - 右移 */
                moveDirection = this.MoveDirection.RIGHT;
                break;
            case 81: /*Q - 上移 */
                moveDirection = this.MoveDirection.UP;
                break;
            case 69: /*E - 下移 */
                moveDirection = this.MoveDirection.DOWN;
                break;
        }

        if (moveDirection !== this.MoveDirection.NONE) {
            this.ui.onKeyUp(moveDirection, this.MoveDirection);
            this.moveState &= ~moveDirection
        }
    },

    processMouseDown: function (event) {
        if (this.domElement !== document) {
            this.domElement.focus();
        }

        event.preventDefault();
        event.stopPropagation();

        if (event.button === this.mouseButtons.ORBIT) {
            // 设置旋转起点
            this.rotateStart.set(event.clientX, event.clientY);

        } else if (event.button === this.mouseButtons.PAN) {
            //this.cameraEditor.beginPan(event.clientX, event.clientY);
            this.cameraEditor.beginPan(event.clientX, event.clientY);

            if (this.isLockCameraHeight) {
                this.lockCameraHeight = event.clientY;
            }
        }

        return true;
    },

    onMouseDown: function (event) {

        return this.processMouseDown(event);
    },

    processMouseMove: function (event) {
        if (event.button === this.mouseButtons.ORBIT) {

            this.rotateEnd.set(event.clientX, event.clientY);
            this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
            this.rotateStart.copy(this.rotateEnd);

            if (this.rotateDelta.x != 0 || this.rotateDelta.y != 0) {

                this.deltaYaw += this.rotateDelta.x * this.lookSpeed;
                this.deltaPitch += this.rotateDelta.y * this.lookSpeed;

                this.isFirstPerson = !event.shiftKey;
                this.update();
            }
        } else if (event.button === this.mouseButtons.PAN) {

            if (this.isLockCameraHeight) {
                this.cameraEditor.process(event.clientX, this.lockCameraHeight, true);
            } else {
                this.cameraEditor.process(event.clientX, event.clientY, true);
            }
        }
    },

    onMouseMove: function (event) {
        this.processMouseMove(event);
    },


    processMouseUp: function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.button === this.mouseButtons.ORBIT) {

            this.rotateDelta.set(0, 0);
            this.deltaYaw = 0;
            this.deltaPitch = 0;
            this.isFirstPerson = !event.shiftKey;
            this.update();

        } else if (event.button === this.mouseButtons.PAN) {

            if (this.isLockCameraHeight) {
                this.cameraEditor.process(event.clientX, this.lockCameraHeight, true);
            } else {
                this.cameraEditor.process(event.clientX, event.clientY, true);
            }

            this.cameraEditor.endOperation();
        }

        return true;
    },

    onMouseUp: function (event) {
        return this.processMouseUp(event);
    },

    onMouseWheel: function (event) {

        // 鼠标滚轮缩放

        var cameraEditor = this.cameraEditor;

        if (cameraEditor.enabled === false || cameraEditor.noZoom === true) return;

        //滚轮操作在浏览器中要考虑兼容性
        // 五大浏览器（IE、Opera、Safari、Firefox、Chrome）中Firefox 使用detail，其余四类使用wheelDelta；
        //两者只在取值上不一致，代表含义一致，detail与wheelDelta只各取两个值，detail只取±3，wheelDelta只取±120，其中正数表示为向上，负数表示向下。
        var delta = 0 || event.wheelDelta || event.detail;
        delta = Math.abs(delta) > 10 ? delta : -delta * 40;
        delta *= 0.0005;

        this.delayHandle();

        // 以中心为基准缩放
        var rect = cameraEditor.getContainerDimensions();
        var clientX = rect.left + 0.5 * rect.width;
        var clientY = rect.top + 0.5 * rect.height;

        cameraEditor.zoom(delta, clientX, clientY);
    },

    update: function () {

        //var moveStep = delta * this.movementSpeed * this.movementSpeedMultiplier;
        var moveStep = this.movementSpeed;
        var camera = this.cameraEditor.camera;
        var position = camera.position;
        var target = this.cameraEditor.camera.target;
        var eye = target.clone().sub(position);

        this.cameraEditor.dirtyCamera(true);

        // 前进
        if (this.moveState & this.MoveDirection.FORWARD) {
            this.goForward(moveStep);
        }

        // 后退
        if (this.moveState & this.MoveDirection.BACK) {
            this.goBack(moveStep);
        }

        // 左移
        if (this.moveState & this.MoveDirection.LEFT) {
            this.goLeft(moveStep);
        }

        // 右移
        if (this.moveState & this.MoveDirection.RIGHT) {
            this.goRight(moveStep);
        }

        // 上移
        if (this.moveState & this.MoveDirection.UP) {
            this.goUp(moveStep);
        }

        // 下移
        if (this.moveState & this.MoveDirection.DOWN) {
            this.goDown(moveStep);
        }

        // Pitch around axis Z only when axis Z locked.
        if(this.cameraEditor.isConstrainedAxisZ) {
            this.deltaPitch = 0;
        }

        if (this.isFirstPerson) {

            var worldUp = new THREE.Vector3(0, 1, 0);
            var upDir = camera.realUp || camera.up;
            var rightDir = eye.clone().cross(upDir).normalize();

            if (this.deltaPitch != 0) {
                var pitchTransform = new THREE.Quaternion().setFromAxisAngle(rightDir, -this.deltaPitch);
                var tmp = eye.clone();

                tmp.applyQuaternion(pitchTransform);

                var angle = tmp.angleTo(worldUp);
                // 钳制到[-PI/2, PI/2]
                angle = angle - 0.5 * Math.PI;

                // 限制角度
                if (angle >= this.pitchMin && angle <= this.pitchMax) {
                    eye.applyQuaternion(pitchTransform);
                }

                this.deltaPitch = 0.0;
            }

            if (this.deltaYaw != 0) {
                //注意：鼠标左右移动的旋转轴要沿世界坐标系的y轴旋转，而不是摄像机自己的坐标轴，防止视角倾斜
                var yawTransform = new THREE.Quaternion().setFromAxisAngle(worldUp, -this.deltaYaw);

                eye.applyQuaternion(yawTransform);
                this.deltaYaw = 0.0;
            }

            target.addVectors(position, eye);
        } else {
            // 记录总仰角
            this.pitchDeltaTotal += this.deltaPitch;

            //CLOUD.Logger.log(this.pitchDeltaTotal);

            // 左右旋转
            this.goTurn(this.deltaYaw);
            this.deltaYaw = 0.0;

            // 俯仰
            if (this.constrainPitch) {
                if (this.pitchDeltaTotal < this.pitchMax && this.pitchDeltaTotal > this.pitchMin) {
                    this.goPitch(-this.deltaPitch);
                    this.deltaPitch = 0.0;
                }
            } else {
                this.goPitch(-this.deltaPitch);
                this.deltaPitch = 0.0;
            }

            // 钳制总仰角
            this.pitchDeltaTotal = THREE.Math.clamp(this.pitchDeltaTotal, this.pitchMin, this.pitchMax);
        }

        // 刷新
        this.cameraEditor.flyOnWorld();

        this.cameraEditor.dirtyCamera(false);
    },

    // 前进
    goForward: function (step) {

        if (this.isFirstPerson) {
            this.cameraEditor.camera.translateZ(-step);
        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;
            // 新的target和eye在Y轴上的坐标不变
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(diff.x * coe, 0, diff.z * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
    },

    // 后退
    goBack: function (step) {

        if (this.isFirstPerson) {

            this.cameraEditor.camera.translateZ(step);

        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;

            // 新的target和eye在Y轴上的坐标不变
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(-diff.x * coe, 0, -diff.z * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
    },

    // 左移
    goLeft: function (step) {

        if (this.isFirstPerson) {

            this.cameraEditor.camera.translateX(-step);

        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;

            // 新的target和eye在Y轴上的坐标不变
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(diff.z * coe, 0, -diff.x * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
    },

    // 右移
    goRight: function (step) {


        if (this.isFirstPerson) {

            this.cameraEditor.camera.translateX(step);

        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;

            // 新的target和eye在Y轴上的坐标不变
            var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
            var len = diff.length();
            var coe = step / len;
            var stepDiff = new THREE.Vector3(-diff.z * coe, 0, diff.x * coe);

            position.add(stepDiff);
            target.add(stepDiff);
        }
    },

    // 上移
    goUp: function (step) {


        if (this.isFirstPerson) {

            this.cameraEditor.camera.translateY(step);

        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;

            // target和eye的Y轴上的坐标增加step
            position.y += step;
            target.y += step;
        }
    },

    // 下移
    goDown: function (step) {

        if (this.isFirstPerson) {

            this.cameraEditor.camera.translateY(-step);

        } else {

            var position = this.cameraEditor.camera.position;
            var target = this.cameraEditor.camera.target;

            position.y -= step;
            target.y -= step;
        }
    },

    //  右转：angle为正； 左转：angle为负
    goTurn: function (angle) {
        var position = this.cameraEditor.camera.position;
        var target = this.cameraEditor.camera.target;

        var diff = new THREE.Vector3(target.x - position.x, 0, target.z - position.z);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var centerDiff = new THREE.Vector3(diff.x * cosAngle - diff.z * sinAngle, 0, diff.x * sinAngle + diff.z * cosAngle);

        target.x = position.x + centerDiff.x;
        target.z = position.z + centerDiff.z;
    },

    // 俯仰
    goPitch: function (angle) {
        var position = this.cameraEditor.camera.position;
        var target = this.cameraEditor.camera.target;

        var offsetX = target.x - position.x;
        var offsetZ = target.z - position.z;
        var distance = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
        var diff = new THREE.Vector3(distance, target.y - position.y, 0);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var centerDiff = new THREE.Vector3(diff.x * cosAngle - diff.y * sinAngle, diff.x * sinAngle + diff.y * cosAngle, 0);
        var percent = centerDiff.x / distance;

        target.x = position.x + percent * offsetX;
        target.y = position.y + centerDiff.y;
        target.z = position.z + percent * offsetZ;
    },

    setCrossVisible: function (visible) {
        this.ui.setCrossVisible(visible);
    },

    // 启用或关闭控制面板
    enableFlyControlPanel: function (enable) {
        this.ui.enableFlyControlPanel(enable);
    },

    showControlPanel: function (isShow) {
        this.ui.showControlPanel(isShow);
    }
};
// handleViewHouseEvent
CLOUD.EditorManager = function() {

    this.editor = null;
    this.editors = {};

    this.animationDuration = 500; // 500毫秒
    this.animationFrameTime = 13; // 周期性执行或调用函数之间的时间间隔，以毫秒计
    this.enableAnimation = true; // 是否允许动画
    this.isUpdateRenderList = true; // 是否更新渲染列表
    this.cameraChange = false;

    this.movePad = null;

    var scope = this;
    var _canMouseMoveOperation = false; // 是否可以进行mouseMove相关操作

    function touchmove(event) {
        scope.editor.touchmove(event);
    }

    function touchstart(event) {
        scope.editor.touchstart(event);
    }

    function touchend(event) {
        scope.editor.touchend(event);
    }

    function onKeyDown(event) {
        scope.editor.onKeyDown(event);
    }

    function onKeyUp(event) {
        scope.editor.onKeyUp(event);
    }

    function onMouseWheel(event) {
        scope.cameraChange = true;
        //window.setTimeout(function() {
        //
        //    scope.editor.onMouseWheel(event);
        //
        //}, 50);
        scope.editor.onMouseWheel(event);
        // scope.cameraChange = false;
    }

    function onMouseDown(event) {

        // 每次按下鼠标激活canvas
        setFocuse();

        _canMouseMoveOperation = true;
        scope.isUpdateRenderList = false;

        var isAnimating = scope.isAnimating();

        // 判断是否在动画中, 若是动画中，不响应事件
        if (isAnimating) {
            scope.cameraChange = false;
            return;
        }

        scope.editor.onMouseDown(event);
    }

    function onMouseMove(event) {

        var isAnimating = scope.isAnimating();

        // 判断是否在动画中, 若是动画中，不响应事件
        if (isAnimating) {
            scope.cameraChange = false;
            return;
        }

        // 其它交互
        if (_canMouseMoveOperation) {
            // 不更新渲染列表
            scope.isUpdateRenderList = false;
            scope.cameraChange = true;
            scope.editor.onMouseMove(event);
        }
    }

    function onMouseUp(event) {

        var isAnimating = scope.isAnimating();

        // 只要存在up事件，允许更新渲染列表
        scope.isUpdateRenderList = true;
        // scope.cameraChange = false;

        var isCanMouseMove = _canMouseMoveOperation;
        // 只要存在up事件，就将其置为false
        _canMouseMoveOperation = false;

        // 判断是否在动画中, 若是动画中，不响应事件
        if (isAnimating) {
            scope.cameraChange = false;
            return;
        }

        if (isCanMouseMove) {
            // 其它交互
            scope.editor.onMouseUp(event);
        }
    }


    function onMouseDoubleClick(event) {
        scope.editor.onMouseDoubleClick(event);
    }

    function setFocuse() {
        // 设置焦点
        var dom = scope.editor.getDomElement();
        if (dom) {
            var canvas = dom.querySelector("#cloud-main-canvas");
            if (canvas && canvas.focus)
                canvas.focus();
        }
    }

    // 返回鼠标运动状态
    this.isMouseMoving = function() {
        return _canMouseMoveOperation;
    };

    this.registerDomEventListeners = function(domElement) {

        domElement.addEventListener('contextmenu', function(event) { event.preventDefault(); }, false);
        domElement.addEventListener('mousedown', onMouseDown, false);
        domElement.addEventListener('mousewheel', onMouseWheel, false);
        domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
        domElement.addEventListener('dblclick', onMouseDoubleClick, false);

        // 注册在document上会影响dbgUI的resize事件
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mouseup', onMouseUp, false);

        domElement.addEventListener('touchstart', touchstart, false);
        domElement.addEventListener('touchend', touchend, false);
        domElement.addEventListener('touchmove', touchmove, false);

        //window.addEventListener( 'keydown', onKeyDown, false );
        //window.addEventListener( 'keyup', onKeyUp, false );
        domElement.addEventListener('keydown', onKeyDown, false);
        domElement.addEventListener('keyup', onKeyUp, false);

        setFocuse();
    };

    this.unregisterDomEventListeners = function(domElement) {

        domElement.removeEventListener('contextmenu', function(event) { event.preventDefault(); }, false);
        domElement.removeEventListener('mousedown', onMouseDown, false);
        domElement.removeEventListener('mousewheel', onMouseWheel, false);
        domElement.removeEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
        domElement.removeEventListener('dblclick', onMouseDoubleClick, false);

        // 注册在document上会影响dbgUI的resize事件
        window.removeEventListener('mousemove', onMouseMove, false);
        window.removeEventListener('mouseup', onMouseUp, false);

        domElement.removeEventListener('touchstart', touchstart, false);
        domElement.removeEventListener('touchend', touchend, false);
        domElement.removeEventListener('touchmove', touchmove, false);

        //window.removeEventListener( 'keydown', onKeyDown, false );
        //window.removeEventListener( 'keyup', onKeyUp, false );
        domElement.removeEventListener('keydown', onKeyDown, false);
        domElement.removeEventListener('keyup', onKeyUp, false);
    };

};


CLOUD.EditorManager.prototype = {

    constructor: CLOUD.EditorManager,

    destroy: function() {

        this.editor = null;

        for (var name in this.editors) {
            var editor = this.editors[name];
            editor.destroy();
        }

        this.editors = {};
        this.movePad = null;
    },

    setEditor: function(newEditor, slaveEditor) {

        if (this.editor !== null) {
            if (this.editor == this.editors['orbitEditor']) {
                //this.movePad.hideOverlay();
            }
            this.editor.onExistEditor();
        }

        if (slaveEditor)
            newEditor.slaveEditor = slaveEditor;

        if (newEditor == this.editors['orbitEditor']) {
            //this.movePad.showOverlay();
        }

        this.editor = newEditor;

    },

    setPickMode: function(viewer) {
        var scope = this;

        var pickEditor = this.editors["pickEditor"];

        if (pickEditor === undefined) {

            pickEditor = new CLOUD.PickEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            pickEditor.onObjectSelected = function (intersect, doubleClick) {
                viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_SELECTION_CHANGED, intersect: intersect, click: doubleClick ? 2 : 1 })
            };
            this.editors["pickEditor"] = pickEditor;
        }

        scope.setEditor(pickEditor);
    },

    getOrbitEditor: function(viewer) {

        var orbitEditor = this.editors["orbitEditor"];
        if (orbitEditor === undefined) {
            orbitEditor = new CLOUD.OrbitEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            this.editors["orbitEditor"] = orbitEditor;
            if (this.movePad == null) {
                //this.movePad = new CLOUD.MovePad(viewer);
            }
        }

        return orbitEditor;
    },

    getRectPickEditor: function(viewer) {

        var rectPickEditor = this.editors["rectPickEditor"];
        if (rectPickEditor === undefined) {

            rectPickEditor = new CLOUD.RectPickEditor(this.getOrbitEditor(viewer),
                function (intersect, doubleClick) {
                    viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_SELECTION_CHANGED, intersect: intersect, click: doubleClick ? 2 : 1 });
                });
            rectPickEditor.onUpdateUI = function(obj) {
                viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_UPDATE_SELECTION_UI, data: obj })
            };
            this.editors["rectPickEditor"] = rectPickEditor;
        }

        return rectPickEditor;
    },

    setRectPickMode: function(viewer, orbitBySelection) {
        var scope = this;

        var orbitEditor = this.getOrbitEditor(viewer);
        var rectPickEditor = this.getRectPickEditor(viewer);

        orbitEditor.orbitBySelection = orbitBySelection || false;
        scope.setEditor(rectPickEditor, orbitEditor);
    },

    setRectZoomMode: function (viewer) {
        var scope = this;

        var editor = this.editors["rectZoomEditor"];
        if (editor === undefined) {
            editor = new CLOUD.RectZoomEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            editor.onUpdateUI = function (obj) {
                viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_UPDATE_SELECTION_UI, data: obj })
            };
            this.editors["rectZoomEditor"] = editor;
        }

        scope.setEditor(editor);
    },

    setOrbitMode: function(viewer) {
        var scope = this;

        var orbitEditor = this.getOrbitEditor(viewer);

        scope.setEditor(orbitEditor);
    },

    setZoomMode: function(viewer) {
        var scope = this;

        var zoomEditor = this.editors["zoomEditor"];
        if (zoomEditor === undefined) {
            zoomEditor = new CLOUD.ZoomEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            this.editors["zoomEditor"] = zoomEditor;
        }

        scope.setEditor(zoomEditor);
    },

    setPanMode: function(viewer) {
        var scope = this;

        var panEditor = this.editors["panEditor"];
        if (panEditor === undefined) {
            panEditor = new CLOUD.PanEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            this.editors["panEditor"] = panEditor;
        }

        scope.setEditor(panEditor);
    },

    setClipPlanesMode : function (viewer) {
        var scope = this;

        var clipPlanes = this.editors["clipPlanesEditor"];
        if (clipPlanes === undefined) {
            clipPlanes = new CLOUD.ClipPlanesEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement,
                function (intersect, doubleClick) {
                    viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_SELECTION_CHANGED, intersect: intersect, click: doubleClick ? 2 : 1 });
                });
            clipPlanes.onUpdateUI = function(obj) {
                viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_UPDATE_SELECTION_UI, data: obj })
            };
            this.editors["clipPlanesEditor"] = clipPlanes;
            clipPlanes.update(viewer.camera);
        }

        scope.setEditor(clipPlanes);
    },

    setFlyMode: function(bShowControlPanel, viewer) {
        var scope = this;

        var flyEditor = this.editors["flyEditor"];
        if (flyEditor === undefined) {
            flyEditor = new CLOUD.FlyEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            this.editors["flyEditor"] = flyEditor;
        }

        var rectPickEditor = this.getRectPickEditor(viewer);

        scope.setEditor(flyEditor, rectPickEditor);
        flyEditor.showControlPanel(bShowControlPanel);
        flyEditor.activate();
    },

    isFlyMode: function() {

        if (this.editor === this.editors["flyEditor"]) {
            return true;
        }

        return false;
    },

    zoomIn: function(factor, viewer) {
        //if(factor === undefined){
        //    factor = viewer.camera.zoom * 1.1;
        //}

        // 缩放时，改变相机缩放因子zoom，就会改变相机FOV，从而造成模型显示变形
        // 思路：保持相机FOV和目标点位置不变，调整相机位置达到缩放的目的
        //this.camera.setZoom(factor);

        // 放大，factor > 0
        if (factor === undefined) {
            factor = 0.1;
        }

        if (factor < 0) {
            factor = 0;
        }

        viewer.cameraEditor.zoom(factor);

    },

    zoomOut: function(factor, viewer) {

        //if(factor === undefined){
        //    factor = viewer.camera.zoom * 0.9;
        //}
        //if(factor < 0.28){
        //    factor = 0.28;
        //}

        // 缩放时，改变相机缩放因子zoom，就会改变相机FOV，从而造成模型显示变形
        // 思路：保持相机FOV和目标点位置不变，调整相机位置达到缩放的目的
        //this.camera.setZoom(factor);

        if (factor === undefined) {
            factor = 0.1;
        }

        if (factor > 0) {
            factor *= -1;
        } else {
            factor = 0;
        }

        // 缩小，factor < 0
        viewer.cameraEditor.zoom(factor);
    },

    zoomToBBox: function (viewer, box, margin, ratio, direction) {
        margin = margin || -0.05;
        var target = viewer.camera.zoomToBBox(box, margin, ratio, direction);
        viewer.cameraEditor.updateCamera(target, true);
        viewer.render();
    },

    isAnimating: function() {
        return (this.enableAnimation && this.animator && this.animator.isPlaying());
    },

    setStandardView: function(stdView, viewer, margin, callback) {

        var camera = viewer.camera;

        if (this.enableAnimation) {

            if (!this.animator) {
                this.animator = new CLOUD.CameraAnimator();
            }

            this.animator.setDuration(this.animationDuration);
            this.animator.setFrameTime(this.animationFrameTime);
            this.animator.setStandardView(stdView, viewer, margin, callback);

        } else {

            var box = viewer.getScene().getBoundingBox();
            camera.setStandardView(stdView, box); // 设置观察视图

            // fit all
            var target = viewer.camera.zoomToBBox(box, margin);
            viewer.cameraEditor.updateCamera(target, true);
            viewer.render();

            callback && callback();// 是否回调
            camera.up.copy(THREE.Object3D.DefaultUp); // 渲染完成后才可以恢复相机up方向
        }
    },

    setStandardViewWithBox: function (viewer, stdView, box, margin, ratio) {
        var camera = viewer.camera;
        camera.setStandardView(stdView, box); // 设置观察视图
        var target = camera.zoomToBBox(box, margin, ratio);
        viewer.cameraEditor.updateCamera(target);
        viewer.render();
        camera.up.copy(THREE.Object3D.DefaultUp); // 渲染完成后才可以恢复相机up方向
    },

    resize: function () {
        if (this.editor) {
            this.editor.resize();
        }
    }
};
CLOUD.SelectPad = function (editor) {
    this.editor = editor;
    this.dim = editor.slaveEditor.cameraEditor.getContainerDimensions();

    this.pad = null;
    this.padSize = 96;

    this.startPt = new THREE.Vector2();
    this.position = new THREE.Vector2();

    this.click = false;
    this.clickCallback = null;

    this.intersect = null;

    var scope = this;

    this.init = function () {
        window.addEventListener('resize', this.padInitBind, false);
        this.pad = document.createElement("div");

        this.padInit();

        var viewport = this.editor.slaveEditor.domElement;
        viewport.appendChild(this.pad);

        this.addEventListener();
    };

    this.addEventListener = function () {
        this.pad.addEventListener('touchstart', this.padOnTouchStartBind, false);
        this.pad.addEventListener('touchmove', this.padOnTouchMoveBind, false);
        this.pad.addEventListener('touchend', this.padOnTouchEndBind, false);
        //window.addEventListener('touchend', this.padOnTouchEndBind, false);
    };

    this.padInit = function () {
        if (this.pad != null) {
            this.pad.style.backgroundImage = "url(images/selectPad.png)";
            this.pad.style.backgroundSize = '100%';
            this.pad.style.position = 'absolute';
            this.pad.style.width = this.padSize.toString() + 'px';
            this.pad.style.height = this.padSize.toString() + 'px';
            this.pad.style.display = 'none';
        }
    };

    this.showOverlay = function (position) {
        this.position = position;

        this.pad.style.left = this.position.x.toString() + 'px';
        this.pad.style.top = (this.position.y - this.dim.top).toString() + 'px';

        this.pad.style.display = '';

        this.pick();
    };

    this.hideOverlay = function () {
        this.pad.style.display = 'none';
    };

    this.pick = function () {
        var screenX = this.position.x;
        var screenY = this.position.y;

        var cameraEditor = this.editor.slaveEditor.cameraEditor;
        var pickHelper = this.editor.pickHelper;

        var scope = this;

        var mouse = cameraEditor.mapWindowToViewport(screenX, screenY);
        this.editor.slaveEditor.scene.pick(mouse, cameraEditor.camera, function (intersect) {
            if (!intersect) {
                if (pickHelper.filter.setSelectedIds()) {
                    cameraEditor.updateView(true);
                }
                pickHelper.onObjectSelected(null, false);
                scope.intersect = null;
                return;
            }

            var userId = intersect.userId;
            pickHelper.intersectToWorld(intersect);

            pickHelper.filter.setSelectedIds();
            if (pickHelper.filter.addSelectedId(userId, intersect.object.userData, true)) {
                pickHelper.onObjectSelected(intersect, false);
                scope.intersect = intersect;
            }
            else {
                pickHelper.onObjectSelected(null, false);
                scope.intersect = null;
            }
            cameraEditor.updateView(true);
        });
    };

    this.onTouchStart = function (event) {
        if (event.touches.length == 1) {
            event.stopPropagation();
            event.preventDefault();
            this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);

            this.click = true;
        }
    };

    this.onTouchMove = function (event) {
        if (event.touches.length == 1) {
            event.stopPropagation();
            event.preventDefault();

            var deltaX = event.touches[0].clientX - this.startPt.x;
            var deltaY = event.touches[0].clientY - this.startPt.y;

            this.position.x += deltaX;
            this.position.y += deltaY;

            this.pad.style.left = this.position.x.toString() + 'px';
            this.pad.style.top = (this.position.y - this.dim.top).toString() + 'px';

            this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);

            this.pick();

            this.click = false;
        }
    };

    this.onTouchEnd = function () {
        event.stopPropagation();

        if (this.click) {
            if (this.clickCallback != null) {
                this.clickCallback(this.intersect);
            }
            else {
                console.log("selectPad click", this.intersect);
            }
        }
    };

    this.padInitBind = this.padInit.bind(this);

    this.padOnTouchStartBind = this.onTouchStart.bind(this);
    this.padOnTouchEndBind = this.onTouchEnd.bind(this);
    this.padOnTouchMoveBind = this.onTouchMove.bind(this);

    this.init();
};
var CLOUD = CLOUD || {};
CLOUD.Loader = CLOUD.Loader || {};

CLOUD.Loader.Url = function (serverUrl, databagId) {
    this.serverUrl = serverUrl;
    this.databagId = databagId;
};

CLOUD.Loader.Url.prototype.projectUrl = function () {
    return this.serverUrl +"config/"+ this.databagId + "/config.json";
};

CLOUD.Loader.Url.prototype.sceneUrl = function (idx) {
    idx = idx || 0;
    return this.serverUrl + this.databagId + "/scene/scene_" + idx;
};

CLOUD.Loader.Url.prototype.sceneIdUrl = function () {
    return this.serverUrl + this.databagId + "/scene/scene_id";
};

CLOUD.Loader.Url.prototype.userIdUrl = function () {
    return this.serverUrl + this.databagId + "/scene/user_id";
};

CLOUD.Loader.Url.prototype.octreeUrl = function (idx) {
    idx = idx || 'o';
    return this.serverUrl +"file/"+ this.databagId + "/scene/index_" + idx;
};

CLOUD.Loader.Url.prototype.symbolUrl = function () {
    return this.serverUrl + this.databagId + "/symbol/symbol";
};

CLOUD.Loader.Url.prototype.mpkUrl = function (idx) {
    idx = idx || 0;
    return this.serverUrl + this.databagId + "/mpk/mpk_" + idx;
};

CLOUD.Loader.Url.prototype.meshIdUrl = function () {
    return this.serverUrl + this.databagId + "/mpk/mesh_id";
};

CLOUD.Loader.Url.prototype.materialUrl = function () {
    return this.serverUrl + this.databagId + "/material/material";
};

CLOUD.Loader.Url.prototype.materialIdUrl = function () {
    return this.serverUrl + this.databagId + "/material/material_id";
};

CLOUD.Loader.Url.prototype.userDataUrl = function () {
    return this.serverUrl + this.databagId + "/userdata/userdata";
};
/**
 * @author muwj 2016/12/15
 */

CLOUD.Loader.IdReader = function( buffer ) {

    var header = new Uint32Array( buffer, 0, 2 );
    this.size  = header[0];
    this.count = header[1];

    this.cache = {};

    this.idBuffer = buffer.slice( 4 * 2 );

    this.getSize = function () {

        return this.size;
    };

    this.getCount = function () {

        return this.count;
    };

    this.getString = function ( index_id ) {

        if (this.cache[index_id] !== undefined) {
            return this.cache[index_id];
        }

        if( index_id >= 0 && index_id < this.count ) {

            var buf = new Uint8Array( this.idBuffer, this.size * index_id, this.size );

            this.cache[index_id] = String.fromCharCode.apply( null, buf );
            // return String.fromCharCode.apply( null, buf );

            return this.cache[index_id];
        }
        return undefined;
    };

    this.getIndex = function ( string_id ) {

        if( string_id == undefined )
            return -1;

        var left = 0;
        var right = this.count - 1;
        var length = string_id.length;

        while( left <= right )
        {
            var mid = Math.floor( ( left + right ) / 2 );
            var buf = new Uint8Array( this.idBuffer, this.size * mid, length );
            var str = String.fromCharCode.apply( null, buf );

            var rt = string_id.localeCompare( str );
            if( rt == 0 )
                return mid;
            else if( rt < 0 )
                right = mid - 1;
            else if( rt > 0 )
                left = mid + 1;
        }
        return -1;
    }
};
/**
 * @author muwj 2016/12/15
 */

CLOUD.Loader.UserDataReader = function( text ) {

    this.userData = JSON.parse( text );
    this.count = 0;
    for( var key in this.userData ) {
        if( this.userData.hasOwnProperty( key ) ) {
            this.count++;
        }
    }

    this.getCount = function () {

        return this.count;
    };

    this.getData = function () {

        return this.userData;
    };

    this.getUserData = function ( index_id ) {

        if( index_id >= 0 && index_id < this.count ) {

            return this.userData[index_id + ''];
        }
        return undefined;
    }
};
/**
 * @author xiaoj-a@glodon.com
 **/

// Simple Stack used in re-construct octree

CLOUD.Loader.Stack = function () {
    this.size = 0;
    this.storage = {};
};

CLOUD.Loader.Stack.prototype.push = function (data) {
    var size = ++this.size;
    this.storage[size] = data;
};

CLOUD.Loader.Stack.prototype.pop = function () {
    var size = this.size,
        deletedData;

    if (size) {
        deletedData = this.storage[size];

        delete this.storage[size];
        this.size--;

        return deletedData;
    }
};

CLOUD.Loader.Stack.prototype.top = function () {
    var size = this.size,
        topData;

    if (size) {
        topData = this.storage[size];
        return topData;
    }
};

CLOUD.Loader.Stack.prototype.empty = function () {
    if (this.size > 0) {
        return false;
    }
    return true;
};

// Spatial hierarchy representation
CLOUD.Loader.OctreeNode = function(oId, depth) {

    if (oId === undefined) {
        alert("Invalid Octant Id");
    }

    this.octantId = oId;
    this.childOctants = new Array();
    this.min = null;
    this.max = null;
    this.depth = depth || 0;
    this.center = null;
    this.size = -1;   // square length of octant size
    // used in generate priority factor F = size / (sqDistanceToCamera * cosTheta)
    this.priority = -1;
};

// CLOUD.Loader.OctreeNode.prototype.constructor = CLOUD.Loader.OctreeNode;

CLOUD.Loader.OctreeNode.prototype.add = function (octant) {
    octant.depth = this.depth + 1;
    this.childOctants.push(octant);
};

CLOUD.Loader.OctreeNode.prototype.setBounds = function (bounds) {

    if (this.octantId == undefined) {
        alert("Invalid Octant Id");
    }
    this.min = bounds[this.octantId].min;
    this.max = bounds[this.octantId].max;
    this.center = new THREE.Vector3(0.5 * (this.max.x + this.min.x),
        0.5 * (this.max.y + this.min.y), 0.5 * (this.max.z + this.min.z));
    var x = this.max.x - this.min.x;
    var y = this.max.y - this.min.y;
    var z = this.max.z - this.min.z;
    this.size = x * x + y * y + z * z;

    var childCount = this.childOctants.length;
    for (var i = 0; i < childCount; ++i) {
        this.childOctants[i].setBounds(bounds);
    }
};

CLOUD.Loader.OctreeNode.prototype.intersectFrustum = function (frustum, visibleOctants, depth) {

    // test intersects
    var intersects;
    var node;

    if (frustum && this.depth < depth) {
        intersects = frustum.intersectsBox(new THREE.Box3(this.min, this.max));
    }
    // if intersects
    if (intersects === true) {

        // gather objects
        visibleOctants.push(this);

        // search subtree

        for (var i = 0, length = this.childOctants.length; i < length; ++i) {

            node = this.childOctants[i];
            node.intersectFrustum(frustum, visibleOctants, depth);
        }
    }
    //else {
    //	CLOUD.Logger.log("Octant" + this.octantId + "culled!")
    //}
};

CLOUD.Loader.OctreeNode.prototype.intersectFrustumWithPriority
    = function (frustum,depth,camPos, camDir,camInside, depthCriteria, visibleOctants) {

    // test intersects
    var intersects;
    var node;

    if (frustum && this.depth < depth) {
        intersects = frustum.intersectsBox(new THREE.Box3(this.min, this.max));
    }
    // if intersects
    if (intersects === true) {

        var camToOctantDir = new THREE.Vector3(this.center.x - camPos.x,
            this.center.y - camPos.y, this.center.z - camPos.z );
        var distance = camToOctantDir.lengthSq();
        camToOctantDir.normalize();
        var cosTheta = camToOctantDir.dot(camDir);
        this.priority = 1 / (distance * cosTheta);

        if(camInside) {
            this.priority *= this.size;
        } else {
            if(this.depth < depthCriteria) {
                this.priority *= this.size;
            }
        }

        // gather objects
        visibleOctants.push(this);

        // search subtree
        for (var i = 0, length = this.childOctants.length; i < length; ++i) {

            node = this.childOctants[i];
            node.intersectFrustumWithPriority(frustum,depth,camPos, camDir,camInside, depthCriteria, visibleOctants);
        }
    }
    //else {
    //	CLOUD.Logger.log("Octant" + this.octantId + "culled!")
    //}
};

CLOUD.Loader.OctreeNode.prototype.findRadiusNeighborOctants = function (queryPoint,radius, squareRadius, depth, neighborOctants) {

    var node;
    var intersects = false;

    if (queryPoint && this.depth < depth) {
        // does inner box intersect with octant
        intersects = !(queryPoint.x + radius < this.min.x || queryPoint.x - radius > this.max.x ||
            queryPoint.y + radius < this.min.y || queryPoint.y - radius > this.max.y ||
            queryPoint.z + radius < this.min.z || queryPoint.z - radius > this.max.z);
    }

    if (intersects === true) {

        var queryPointToOctant = new THREE.Vector3(0.5 * (this.max.x + this.min.x) - queryPoint.x,
            0.5 * (this.max.y + this.min.y) - queryPoint.y, 0.5 * (this.max.z + this.min.z) - queryPoint.z );
        var distance = queryPointToOctant.lengthSq();
        if(distance < squareRadius ) {
            // gather octants
            neighborOctants.push(this);
        }

        // search subtree
        for (var i = 0, length = this.childOctants.length; i < length; ++i) {

            node = this.childOctants[i];
            node.findRadiusNeighborOctants(queryPoint, radius, squareRadius, depth, neighborOctants);
        }
    }
    //else {
    //	CLOUD.Logger.log("Octant" + this.octantId + "culled!")
    //}
};

CLOUD.Loader.OctreeNode.prototype.intersectRayDistance = function (origin, direction) {
    var Tmin, Tmax, TYmin, TYmax;
    // X Axis
    var invDirectionX = 1 / direction.x;
    if(direction.x >= 0) {
        Tmin = (this.min.x - origin.x) * invDirectionX;
        Tmax = (this.max.x - origin.x) * invDirectionX;
    }else {
        Tmin = (this.max.x - origin.x) * invDirectionX;
        Tmax = (this.min.x - origin.x) * invDirectionX;
    }

    // Y Axis
    var invDirectionY = 1 / direction.y;
    if(direction.y >= 0){
        TYmin = (this.min.y - origin.y) * invDirectionY;
        TYmax = (this.max.y - origin.y) * invDirectionY;
    } else {
        TYmin = (this.max.y - origin.y) * invDirectionY;
        TYmax = (this.min.y - origin.y) * invDirectionY;
    }

    if((Tmin > TYmax) || (TYmin > Tmax)){
        //no intersection
        return Infinity;
    }
    if(TYmin > Tmin) {
        Tmin = TYmin;
    }
    if(TYmax < Tmax) {
        Tmax = TYmax;
    }

    // Z Axis
    var TZmin, TZmax;
    var invDirectionZ = 1 / direction.z;
    if(direction.z >= 0) {
        TZmin = (this.min.z - origin.z) * invDirectionZ;
        TZmax = (this.max.z - origin.z) * invDirectionZ;
    } else {
        TZmin = (this.max.z - origin.z) * invDirectionZ;
        TZmaz = (this.min.z - origin.z) * invDirectionZ;
    }
    if((Tmin > TZmax) || (TZmin > Tmax)) {
        // no intersection
        return Infinity;
    }
    if(TZmin > Tmin) {
        Tmin = TZmin;
    }
    if(TZmax < Tmax) {
        Tmax = TZmax;
    }
    // return nearest intersection distance
    return Tmin;
};
CLOUD.Loader.OctreeNode.prototype.getDepthDescending = function () {

    if(this.depth > CLOUD.GlobalData.MaximumDepth) {
        CLOUD.GlobalData.MaximumDepth = this.depth;
    }
    var childCount = this.childOctants.length;
    for (var i = 0; i < childCount; ++i) {
        this.childOctants[i].getDepthDescending();
    }
};
CLOUD.Loader.OctreeLoader = function (manager) {

    this.manager = manager;
    this.loader = new THREE.XHRLoader(manager);
};

CLOUD.Loader.OctreeLoader.prototype = {

    constructor: CLOUD.Loader.OctreeLoader,

    load: function (octreeUrl, callback) {

        var scope = this;
        var loader = this.loader;
        var rootNode;
        var bounds = [];

        function constructHierarchy(content) {
            var length = content.length;
            var pos = 0;
            var root = null;
            var parent = null;
            var stack = new CLOUD.Loader.Stack();
            var octantCount = 0;
            var depth = 0;
            var tmpOctantIds = [];
            while (pos < length && content[pos] != 'D') {
                if (content[pos] == '{') {
                    var octantId = "";
                    ++pos;
                    while (content[pos] != '}' && content[pos] != '{') {
                        octantId += content[pos];
                        ++pos;
                    }
                    --pos;
                    if (octantId === undefined) {
                        alert("bad id");
                    }

                    var node = new CLOUD.Loader.OctreeNode(octantId, depth);
                    tmpOctantIds.push(octantId);

                    ++octantCount;
                    //bounds[octantId] = null;
                    if (parent == null) {
                        root = node;
                    } else {
                        parent.add(node);

                    }
                    stack.push(node);
                    parent = node;
                } else if (content[pos] == '}') {
                    stack.pop();
                    if (!stack.empty()) {
                        parent = stack.top();
                    }
                }
                ++pos;
            }
            rootNode = root;
            ++pos;  // skip 'D'
            var index = 0;
            var scale = 1000;
            while (pos < length && index <= octantCount) {
                var x = '';
                while (content[pos] != ',') {
                    x += content[pos];
                    ++pos;
                }
                ++pos;
                var y = '';
                while (content[pos] != ',') {
                    y += content[pos];
                    ++pos;
                }
                ++pos;
                var z = '';
                while (content[pos] != ',') {
                    z += content[pos];
                    ++pos;
                }
                ++pos;
                var x1 = '';
                while (content[pos] != ',') {
                    x1 += content[pos];
                    ++pos;
                }
                ++pos;
                var y1 = '';
                while (content[pos] != ',') {
                    y1 += content[pos];
                    ++pos;
                }
                ++pos;
                var z1 = '';
                while (content[pos] != ',') {
                    z1 += content[pos];
                    ++pos;
                }
                ++pos;
                bounds[tmpOctantIds[index]] = new THREE.Box3(
                    new THREE.Vector3(x * scale, y * scale, z * scale),
                    new THREE.Vector3(x1 * scale, y1 * scale, z1 * scale));
                ++index;
            }
            rootNode.setBounds(bounds);
            rootNode.getDepthDescending();
            CLOUD.Logger.log("Maximum Depth:", CLOUD.GlobalData.MaximumDepth);
        }

        loader.setCrossOrigin(scope.manager.crossOrigin);
        // loader.setResponseType('arraybuffer');
        loader.load(octreeUrl, function (data) {

            constructHierarchy(data);

            callback(rootNode);

        });
    }

};
/**
 * @author muwj 2016/12/15
 */

CLOUD.Loader.Material = function (buffer, offset) {

    var data_i = new Uint32Array( buffer, offset, 5 );

    this.id = data_i[0];
    this.color = data_i[1];
    this.emissive = data_i[2];
    this.specular = data_i[3];
    this.side     = data_i[4];

    var data_f = new Float32Array( buffer, offset + 4 * 5, 2);
    this.shininess = data_f[0];
    this.opacity   = data_f[1];

    data_i = null;
    data_f = null;
};

CLOUD.Loader.MaterialReader = function (buffer) {

    var header = new Uint32Array(buffer, 0, 2);

    this.count = header[0];
    this.offset = header[1];

    this.dataSize = 4 * 7;
    this.dataBuffer  = buffer.slice( this.offset );

    // for data reading
    this.material_id = -1;
    var tmp_buffer = new ArrayBuffer( this.dataSize );
    this.material_cur = new CLOUD.Loader.Material(tmp_buffer, 0);

    header = null;
};

CLOUD.Loader.MaterialReader.prototype = {

    constructor: CLOUD.Loader.MaterialReader,

    getData: function (id) {

        if (id >= 0 && id < this.count) {
            return new CLOUD.Loader.Material(this.dataBuffer, id * this.dataSize)
        }
    },

    getDataInfo: function (id) {

        if (id == this.material_id) {
            return this.material_cur;
        }

        if (id >= 0 && id < this.count) {

            var data_i = new Uint32Array( this.dataBuffer, id * this.dataSize, 5 );
            this.material_cur.id       = data_i[0];
            this.material_cur.color    = data_i[1];
            this.material_cur.emissive = data_i[2];
            this.material_cur.specular = data_i[3];
            this.material_cur.side     = data_i[4];

            var data_f = new Float32Array( this.dataBuffer, id * this.dataSize + 4 * 5, 2 );
            this.material_cur.shininess = data_f[0];
            this.material_cur.opacity   = data_f[1];

            this.material_id = id;
            return this.material_cur;
        }
    }
};
/**
 * @author muwj 2016/12/29
 */

CLOUD.Loader.SymbolHeader = function ( buffer ) {

    var header = new Uint32Array( buffer, 0, 11 );

    this.blockId        = header[0];
    this.symbolCount    = header[1];
    this.itemCount      = header[2];
    this.matrixCount    = header[3];
    this.meshCount      = header[4];
    this.geomCount      = header[5];
    this.symbolOffset   = header[6];
    this.itemOffset     = header[7];
    this.matrixOffset   = header[8];
    this.meshOffset     = header[9];
    this.geomOffset     = header[10];

    var bbox = new Float32Array( buffer, 4 * 11, 6 );
    this.boundingBox = new THREE.Box3(
        new THREE.Vector3( bbox[0], bbox[1], bbox[2] ),
        new THREE.Vector3( bbox[3], bbox[4], bbox[5] ) );

    header = null;
    bbox = null;
};

CLOUD.Loader.Symbol = function ( buffer, offset ) {

    var item_i = new Int32Array( buffer, offset, 3 );

    this.symbolId  = item_i[0];
    this.itemIndex = item_i[1];
    this.itemCount = item_i[2];

    var bbox = new Float32Array( buffer, offset + 4 * 3, 6 );
    this.boundingBox = new THREE.Box3(
        new THREE.Vector3( bbox[0], bbox[1], bbox[2] ),
        new THREE.Vector3( bbox[3], bbox[4], bbox[5] ) );

    item_i = null;
    bbox = null;
};

CLOUD.Loader.SymbolReader = function ( buffer ) {

    this.header = new CLOUD.Loader.SymbolHeader( buffer );

    this.symbolSize   = 4 * 9;
    this.itemSize     = 4 * 13;
    this.matrixSize   = 4 * 16;
    this.meshSize     = 4 * 2;
    this.geomSize     = 4 * 8;
    this.maxSize      = 4 * 64;

    this.symbolBuffer = buffer.slice( this.header.symbolOffset, this.header.symbolOffset + this.header.symbolCount * this.symbolSize );
    this.itemBuffer   = buffer.slice( this.header.itemOffset,   this.header.itemOffset   + this.header.itemCount   * this.itemSize );
    this.matrixBuffer = buffer.slice( this.header.matrixOffset, this.header.matrixOffset + this.header.matrixCount * this.matrixSize );
    this.meshBuffer   = buffer.slice( this.header.meshOffset,   this.header.meshOffset   + this.header.meshCount   * this.meshSize );
    this.geomBuffer   = buffer.slice( this.header.geomOffset,   this.header.geomOffset   + this.header.geomOffset  * this.geomSize );

    // for data reading
    this.matr_cur_id = -1;

    this.pt_symb_min = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_symb_max = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_item_min = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_item_max = new THREE.Vector3( 0.0, 0.0, 0.0 );

    var tmp_buffer = new ArrayBuffer( this.maxSize );
    this.symb_cur = new CLOUD.Loader.Symbol( tmp_buffer, 0 );
    this.item_cur = new CLOUD.Loader.Item( tmp_buffer, 0 );
    this.matr_cur = new CLOUD.Loader.Matrix( tmp_buffer, 0 );
    this.mesh_cur = new CLOUD.Loader.MeshAttr( tmp_buffer, 0 );
    this.geom_cur = new CLOUD.Loader.GeomAttr( tmp_buffer, 0 );

    this.symb_cur.boundingBox.set( this.pt_symb_min, this.pt_symb_max );
    this.item_cur.boundingBox.set( this.pt_item_min, this.pt_item_max );
};

CLOUD.Loader.SymbolReader.prototype = {

    constructor: CLOUD.Loader.SymbolReader,

    getSymbol: function ( index ) {

        if ( index >= 0 && index < this.header.symbolCount ) {
            return new CLOUD.Loader.Symbol( this.symbolBuffer, index * this.symbolSize );
        }
    },

    getItem: function ( index ) {

        if ( index >= 0 && index < this.header.itemCount ) {
            return new CLOUD.Loader.Item( this.itemBuffer, index * this.itemSize );
        }
    },

    getMatrix: function ( index ) {

        if ( index >= 0 && index < this.header.matrixCount ) {
            return new CLOUD.Loader.Matrix( this.matrixBuffer, index * this.matrixSize );
        }
    },

    getMeshAttr: function ( index ) {

        if ( index >= 0 && index < this.header.meshCount ) {
            return new CLOUD.Loader.MeshAttr( this.meshBuffer, index * this.meshSize );
        }
    },

    getGeomAttr: function ( index ) {

        if ( index >= 0 && index < this.header.geomCount ) {
            return new CLOUD.Loader.GeomAttr( this.geomBuffer, index * this.geomSize );
        }
    },

    getSymbolInfo: function ( index ) {

        if ( index >= 0 && index < this.header.symbolCount ) {

            var item_i = new Int32Array( this.symbolBuffer, index * this.symbolSize, 3 );
            this.symb_cur.symbolId  = item_i[0];
            this.symb_cur.itemIndex = item_i[1];
            this.symb_cur.itemCount = item_i[2];

            var data_f = new Float32Array( this.symbolBuffer, index * this.symbolSize + 4 * 3, 6 );
            this.pt_symb_min.set( data_f[0], data_f[1], data_f[2] );
            this.pt_symb_max.set( data_f[3], data_f[4], data_f[5] );
            this.symb_cur.boundingBox.set( this.pt_symb_min, this.pt_symb_max );

            return this.symb_cur;
        }
    },

    getItemInfo: function ( index ) {

        if ( index >= 0 && index < this.header.itemCount ) {

            var data_i = new Int32Array( this.itemBuffer, index * this.itemSize, 7 );
            this.item_cur.ItemId     = data_i[0];
            this.item_cur.originalId = data_i[1];
            this.item_cur.materialId = data_i[2];
            this.item_cur.userDataId = data_i[3];
            this.item_cur.matrixId   = data_i[4];
            this.item_cur.type       = data_i[5];
            this.item_cur.attrIndex  = data_i[6];

            var data_f = new Float32Array( this.itemBuffer, index * this.itemSize + 4 * 7, 6 );
            this.pt_item_min.set( data_f[0], data_f[1], data_f[2] );
            this.pt_item_max.set( data_f[3], data_f[4], data_f[5] );
            this.item_cur.boundingBox.set( this.pt_item_min, this.pt_item_max );

            return this.item_cur;
        }
    },

    getMatrixInfo: function ( index ) {

        if ( index == this.matr_cur_id ) {
            return this.matr_cur;
        }

        if ( index >= 0 && index < this.header.matrixCount ) {

            var data = new Float32Array( this.matrixBuffer, index * this.matrixSize, 4 * 4 );
            this.matr_cur.matrix.fromArray( data );

            this.matr_cur_id = index;
            return this.matr_cur;
        }
    },

    getMeshAttrInfo: function ( index ) {

        if ( index >= 0 && index < this.header.meshCount ) {

            var data = new Int32Array( this.meshBuffer, index * this.meshSize, 2 );

            this.mesh_cur.blockId = data[0];
            this.mesh_cur.meshId  = data[1];

            return this.mesh_cur;
        }
    },

    getGeomInfo: function ( index ) {

        if ( index >= 0 && index < this.header.geomCount ) {

            var data = new Float32Array( this.geomBuffer, index * this.geomSize, 8 );

            this.geom_cur.startPt.set( data[0], data[1], data[2] );
            this.geom_cur.endPt.  set( data[3], data[4], data[5] );
            this.geom_cur.radius    = data[6];
            this.geom_cur.thickness = data[7];

            return this.geom_cur;
        }
    }
};
/**
 * @author muwj 2016/12/15
 */

CLOUD.Loader.MPKHeader = function (buffer) {

    var header = new Uint32Array( buffer, 0, 7 );

    this.blockId      = header[0];
    this.startId      = header[1];
    this.vtFormat     = header[2];
    this.meshCount    = header[3];
    this.meshOffset   = header[4];
    this.bufferSize   = header[5];
    this.bufferOffset = header[6];

    header = null;
};

CLOUD.Loader.MeshData = function (buffer, offset) {

    var mesh_info = new Uint32Array(buffer, offset, 4);

    this.mesh_id = mesh_info[0];
    this.ptCount = mesh_info[1];
    this.idxCount = mesh_info[2];
    this.dataOffset = mesh_info[3];

    var base_info = new Float32Array(buffer, offset + 4 * 4, 4);

    this.baseScale = base_info[0];
    this.baseVector = new THREE.Vector3(base_info[1], base_info[2], base_info[3]);

    mesh_info = null;
    base_info = null;
};

CLOUD.Loader.MPKReader = function (buffer) {

    this.header = new CLOUD.Loader.MPKHeader(buffer);

    this.meshSize = 4 * 8;
    this.maxSize = 4 * 64;
    this.meshBuffer = buffer.slice(this.header.meshOffset, this.header.meshOffset + this.header.meshCount * this.meshSize);
    this.geomBuffer = buffer.slice(this.header.bufferOffset, this.header.bufferOffset + this.header.bufferSize);

    // for data reading
    this.mesh_cur_id = -1;
    this.pt_pos = new THREE.Vector3(0.0, 0.0, 0.0);

    var tmp_buffer = new ArrayBuffer(this.maxSize);
    this.mesh_cur = new CLOUD.Loader.MeshData(tmp_buffer, 0);
    this.mesh_cur.baseVector = this.pt_pos;
};

CLOUD.Loader.MPKReader.prototype = {

    constructor: CLOUD.Loader.MPKReader,

    getMeshData: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            return new CLOUD.Loader.MeshData(this.meshBuffer, index * this.meshSize);
        }
    },

    getMeshInfo: function (id) {

        if (id == this.mesh_cur_id) {
            return this.mesh_cur;
        }

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var data_i = new Uint32Array(this.meshBuffer, index * this.meshSize, 4);
            this.mesh_cur.mesh_id = data_i[0];
            this.mesh_cur.ptCount = data_i[1];
            this.mesh_cur.idxCount = data_i[2];
            this.mesh_cur.dataOffset = data_i[3];

            var data_f = new Float32Array(this.meshBuffer, index * this.meshSize + 4 * 4, 4);
            this.mesh_cur.baseScale = data_f[0];
            this.mesh_cur.baseVector.set(data_f[1], data_f[2], data_f[3]);

            this.mesh_cur_id = id;
            return this.mesh_cur;
        }
    },

    getPtBuffer: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var mesh = this.getMeshInfo(id);
            if (mesh === undefined) {
                return undefined;
            }

            if (mesh.baseScale == 0.0) {
                return new Float32Array(this.geomBuffer, mesh.dataOffset, mesh.ptCount * 3);
            }
            else {
                return new Uint16Array(this.geomBuffer, mesh.dataOffset, mesh.ptCount * 3);
            }
        }
    },

    getIdxBuffer: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var mesh = this.getMeshInfo(id);
            if (mesh === undefined) {
                return undefined;
            }

            var offset = mesh.dataOffset;
            if (mesh.baseScale == 0.0) {
                offset += mesh.ptCount * 3 * 4;
            }
            else {
                offset += mesh.ptCount * 3 * 2;
                if (mesh.ptCount % 2 == 1) {
                    offset += 2;
                }
            }

            if (mesh.ptCount > 65535) {
                return new Uint32Array(this.geomBuffer, offset, mesh.idxCount);
            }
            else {
                return new Uint16Array(this.geomBuffer, offset, mesh.idxCount);
            }
        }
    },

    getNormalBuffer: function ( id ) {

        var index = id - this.header.startId;
        if ( (this.header.vtFormat & 2) == 2 &&
            index >= 0 &&
            index < this.header.meshCount ) {

            var mesh = this.getMeshInfo( id );
            if ( mesh === undefined ) {
                return undefined;
            }

            var offset = mesh.dataOffset;
            if ( mesh.baseScale == 0.0 ) {
                offset += mesh.ptCount * 3 * 4;
            }
            else {
                offset += mesh.ptCount * 3 * 2;
                if ( mesh.ptCount % 2 == 1 ) {
                    offset += 2;
                }
            }

            if ( mesh.ptCount > 65535 ) {
                offset += mesh.idxCount * 4;
            }
            else {
                offset += mesh.idxCount * 2;
                if ( mesh.idxCount % 2 == 1 ) {
                    offset += 2;
                }
            }

            return new Float32Array( this.geomBuffer, offset, mesh.ptCount * 3 );
        }
    }
};
/**
 * @author muwj 2016/12/15
 */

CLOUD.Loader.SceneHeader = function ( buffer ) {

    var header = new Uint32Array( buffer, 0, 13 );

    this.blockId        = header[0];
    this.cellCount      = header[1];
    this.itemCount      = header[2];
    this.userDataCount  = header[3];
    this.matrixCount    = header[4];
    this.meshCount      = header[5];
    this.geomCount      = header[6];
    this.cellOffset     = header[7];
    this.itemOffset     = header[8];
    this.userDataOffset = header[9];
    this.matrixOffset   = header[10];
    this.meshOffset     = header[11];
    this.geomOffset     = header[12];

    var bbox = new Float32Array( buffer, 4 * 13, 6 );
    this.boundingBox = new THREE.Box3(
        new THREE.Vector3( bbox[0], bbox[1], bbox[2] ),
        new THREE.Vector3( bbox[3], bbox[4], bbox[5] ) );

    header = null;
    bbox = null;
};

CLOUD.Loader.Cell = function ( buffer, offset ) {

    var cell_i = new Int32Array( buffer, offset, 5 );

    this.cellId    = cell_i[0];
    this.depth     = cell_i[1];
    this.itemIndex = cell_i[2];
    this.itemCount = cell_i[3];

    this.layerCount= cell_i[4];
    this.layerIdxBuffer = new Int32Array( buffer, offset + 5*4, 64 );
    this.categoryBuffer = new Int32Array( buffer, offset + (5+64)*4, 64 );

    var bbox = new Float32Array( buffer, offset + (5+64+64)*4, 6 );
    this.boundingBox = new THREE.Box3(
        new THREE.Vector3( bbox[0], bbox[1], bbox[2] ),
        new THREE.Vector3( bbox[3], bbox[4], bbox[5] ) );

    cell_i = null;
    bbox = null;
};

CLOUD.Loader.Item = function ( buffer, offset ) {

    var item_i = new Int32Array( buffer, offset, 7 );

    this.ItemId     = item_i[0];
    this.originalId = item_i[1];
    this.materialId = item_i[2];
    this.userDataId = item_i[3];
    this.matrixId   = item_i[4];
    this.type       = item_i[5];
    this.attrIndex  = item_i[6];

    var bbox = new Float32Array( buffer, offset + 4 * 7, 6 );
    this.boundingBox = new THREE.Box3(
        new THREE.Vector3( bbox[0], bbox[1], bbox[2] ),
        new THREE.Vector3( bbox[3], bbox[4], bbox[5] ) );

    item_i = null;
    bbox = null;
};

CLOUD.Loader.Matrix = function ( buffer, offset ) {

    var matrixData = new Float32Array( buffer, offset, 4 * 4 );
    this.matrix = new THREE.Matrix4().fromArray( matrixData );
    matrixData = null;
};

CLOUD.Loader.UserData = function ( buffer, offset ) {

    var userData = new Int32Array( buffer, offset, 3 );

    this.category = userData[0];
    this.scene_id = userData[1];
    this.plan     = userData[2];

    this.classCode = new Uint8Array( buffer, offset + 4 * 3, 20 );
    userData = null;
};

CLOUD.Loader.MeshAttr = function ( buffer, offset ) {

    var meshData = new Int32Array( buffer, offset, 2 );

    this.blockId = meshData[0];
    this.meshId  = meshData[1];

    meshData = null;
};

CLOUD.Loader.GeomAttr = function ( buffer, offset ) {

    var geomData = new Float32Array( buffer, offset, 8 );

    this.startPt = new THREE.Vector3( geomData[0], geomData[1], geomData[2] );
    this.endPt   = new THREE.Vector3( geomData[3], geomData[4], geomData[5] );
    this.radius    = geomData[6];
    this.thickness = geomData[7];

    geomData = null;
};

CLOUD.Loader.SceneReader = function ( buffer ) {

    this.header = new CLOUD.Loader.SceneHeader( buffer );

    this.cellSize     = 4 * (5+64+64+6);
    this.itemSize     = 4 * 13;
    this.matrixSize   = 4 * 16;
    this.userDataSize = 4 * 3 + 20;
    this.meshSize     = 4 * 2;
    this.geomSize     = 4 * 8;
    this.maxSize      = 4 * 256;

    this.cellBuffer     = buffer.slice( this.header.cellOffset,     this.header.cellOffset     + this.header.cellCount     * this.cellSize );
    this.itemBuffer     = buffer.slice( this.header.itemOffset,     this.header.itemOffset     + this.header.itemCount     * this.itemSize );
    this.matrixBuffer   = buffer.slice( this.header.matrixOffset,   this.header.matrixOffset   + this.header.matrixCount   * this.matrixSize );
    this.userDataBuffer = buffer.slice( this.header.userDataOffset, this.header.userDataOffset + this.header.userDataCount * this.userDataSize );
    this.meshBuffer     = buffer.slice( this.header.meshOffset,     this.header.meshOffset     + this.header.meshCount     * this.meshSize );
    this.geomBuffer     = buffer.slice( this.header.geomOffset,     this.header.geomOffset     + this.header.geomOffset    * this.geomSize );

    // for data reading
    this.matr_cur_id = -1;
    this.user_cur_id = -1;

    this.pt_cell_min = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_cell_max = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_item_min = new THREE.Vector3( 0.0, 0.0, 0.0 );
    this.pt_item_max = new THREE.Vector3( 0.0, 0.0, 0.0 );

    var tmp_buffer = new ArrayBuffer( this.maxSize );
    this.cell_cur = new CLOUD.Loader.Cell( tmp_buffer, 0 );
    this.item_cur = new CLOUD.Loader.Item( tmp_buffer, 0 );
    this.matr_cur = new CLOUD.Loader.Matrix( tmp_buffer, 0 );
    this.user_cur = new CLOUD.Loader.UserData( tmp_buffer, 0 );
    this.mesh_cur = new CLOUD.Loader.MeshAttr( tmp_buffer, 0 );
    this.geom_cur = new CLOUD.Loader.GeomAttr( tmp_buffer, 0 );

    this.cell_cur.boundingBox.set( this.pt_cell_min, this.pt_cell_max );
    this.item_cur.boundingBox.set( this.pt_item_min, this.pt_item_max );
};

CLOUD.Loader.SceneReader.prototype = {

    constructor: CLOUD.Loader.SceneReader,

    getCellMpks: function( index ) {

        if ( index >= 0 && index < this.header.cellCount ) {
            var src = [];
            var cell = this.getCellInfo( index );
            for ( var i = cell.itemIndex; i < cell.itemCount; ++i ) {
                var item = this.getItemInfo( i );
                if( item.type == 1 ) { // mesh

                    var meshAttr = this.getMeshAttrInfo( item.attrIndex );
                    src.push( meshAttr.blockId );
                }
            }

            var key = {};
            var dist = [];
            for ( var j = 0; j < src.length; ++j ) {
                if ( ! key[src[j]] ) {
                    key[src[j]] = true;
                    dist.push( src[j] );
                }
            }
            return dist;
        }
    },

    getCell: function ( index ) {

        if ( index >= 0 && index < this.header.cellCount ) {
            return new CLOUD.Loader.Cell( this.cellBuffer, index * this.cellSize );
        }
    },

    getItem: function ( index ) {

        if ( index >= 0 && index < this.header.itemCount ) {
            return new CLOUD.Loader.Item( this.itemBuffer, index * this.itemSize );
        }
    },

    getMatrix: function ( index ) {

        if ( index >= 0 && index < this.header.matrixCount ) {
            return new CLOUD.Loader.Matrix( this.matrixBuffer, index * this.matrixSize );
        }
    },

    getUserData: function ( index ) {

        if ( index >= 0 && index < this.header.userDataCount ) {
            return new CLOUD.Loader.UserData( this.userDataBuffer, index * this.userDataSize );
        }
    },

    getMeshAttr: function ( index ) {

        if ( index >= 0 && index < this.header.meshCount ) {
            return new CLOUD.Loader.MeshAttr( this.meshBuffer, index * this.meshSize );
        }
    },

    getGeomAttr: function ( index ) {

        if ( index >= 0 && index < this.header.geomCount ) {
            return new CLOUD.Loader.GeomAttr( this.geomBuffer, index * this.geomSize );
        }
    },

    getCellInfo: function ( index ) {

        if ( index >= 0 && index < this.header.cellCount ) {

            var data_i = new Int32Array( this.cellBuffer, index * this.cellSize, 5 );
            this.cell_cur.cellId    = data_i[0];
            this.cell_cur.depth     = data_i[1];
            this.cell_cur.itemIndex = data_i[2];
            this.cell_cur.itemCount = data_i[3];

            this.cell_cur.layerCount = data_i[4];
            this.cell_cur.layerIdxBuffer = new Int32Array( this.cellBuffer, index * this.cellSize + 5*4, 64 );
            this.cell_cur.categoryBuffer = new Int32Array( this.cellBuffer, index * this.cellSize + (5+64)*4, 64 );

            var data_f = new Float32Array( this.cellBuffer, index * this.cellSize + (5+64+64)*4, 6 );
            this.pt_cell_min.set( data_f[0], data_f[1], data_f[2] );
            this.pt_cell_max.set( data_f[3], data_f[4], data_f[5] );
            this.cell_cur.boundingBox.set( this.pt_cell_min, this.pt_cell_max );

            return this.cell_cur;
        }
    },

    getItemInfo: function ( index ) {

        if ( index >= 0 && index < this.header.itemCount ) {

            var data_i = new Int32Array( this.itemBuffer, index * this.itemSize, 7 );
            this.item_cur.ItemId     = data_i[0];
            this.item_cur.originalId = data_i[1];
            this.item_cur.materialId = data_i[2];
            this.item_cur.userDataId = data_i[3];
            this.item_cur.matrixId   = data_i[4];
            this.item_cur.type       = data_i[5];
            this.item_cur.attrIndex  = data_i[6];

            var data_f = new Float32Array( this.itemBuffer, index * this.itemSize + 4 * 7, 6 );
            this.pt_item_min.set( data_f[0], data_f[1], data_f[2] );
            this.pt_item_max.set( data_f[3], data_f[4], data_f[5] );
            this.item_cur.boundingBox.set( this.pt_item_min, this.pt_item_max );

            return this.item_cur;
        }
    },

    getMatrixInfo: function ( index ) {

        if ( index == this.matr_cur_id ) {
            return this.matr_cur;
        }

        if ( index >= 0 && index < this.header.matrixCount ) {

            var data = new Float32Array( this.matrixBuffer, index * this.matrixSize, 4 * 4 );
            this.matr_cur.matrix.fromArray( data );

            this.matr_cur_id = index;
            return this.matr_cur;
        }
    },

    getUserInfo: function ( index ) {

        if ( index == this.user_cur_id ) {
            return this.user_cur;
        }

        if ( index >= 0 && index < this.header.userDataCount ) {

            var data = new Int32Array( this.userDataBuffer, index * this.userDataSize, 3 );
            this.user_cur.category = data[0];
            this.user_cur.scene_id = data[1];
            this.user_cur.plan     = data[2];

            this.user_cur.classCode = new Uint8Array( this.userDataBuffer, index * this.userDataSize + 4 * 3, 20 );

            this.user_cur_id = index;
            return this.user_cur;
        }
    },

    getMeshAttrInfo: function ( index ) {

        if ( index >= 0 && index < this.header.meshCount ) {

            var data = new Int32Array( this.meshBuffer, index * this.meshSize, 2 );
            this.mesh_cur.blockId = data[0];
            this.mesh_cur.meshId  = data[1];

            return this.mesh_cur;
        }
    },

    getGeomInfo: function ( index ) {

        if ( index >= 0 && index < this.header.geomCount ) {

            var data = new Float32Array( this.geomBuffer, index * this.geomSize, 8 );
            this.geom_cur.startPt.set( data[0], data[1], data[2] );
            this.geom_cur.endPt.set  ( data[3], data[4], data[5] );
            this.geom_cur.radius    = data[6];
            this.geom_cur.thickness = data[7];

            return this.geom_cur;
        }
    }
};
CLOUD.Model = function (manager, serverUrl, databagId, texturePath) {

    THREE.LoadingManager.call(this);

    this.manager = manager;
    this.serverUrl = serverUrl;
    this.databagId = databagId;
    this.texturePath = texturePath;
    this.crossOrigin = true;

    this.modelUrl = new CLOUD.Loader.Url(serverUrl, databagId);

    this.filter = this.manager.scene.filter;
    this.pool = this.manager.scene.meshPool;

    this.cache = {
        cells: {},
        geometries: {},
        materials: {},
        instancedMaterials: {}
    };

    // this.cfgInfo = null;

    // Loaders
    this.loader = new THREE.XHRLoader(this);
    this.octreeLoader = new CLOUD.Loader.OctreeLoader(this);

    this.octreeRootNode = null;
    this.octreeRootNodeI = null;
    this.visibleOctant = new Array();

    this.materialReader = null;
    this.symbolReader = null;
    this.userIdReader = null;
    this.userDataReader = null;

    this.sceneArray = null;
    this.sceneCount = 0;
    this.mpkArray = null;
    // this.mpkCount = 0;
    // this.symbolCount = 0;
    // this.octree_o = 1;
    // this.octree_i = 1;

    this.taskCount = 0;
    this.maxTaskCount = 0;   // TODO: change the way to flag resource loading finish flag.
    this.containsCamera = false;
    this.load_complete = false;

    // cache overall referenced unique meshes
    this.referencedMeshCache = {};
    this.taskManager = new CLOUD.TaskManager(this);
    this.userWorker = false;//(typeof window.Worker === "function");
    this.notifyProgress = true;

    this.nodePriority = {
        high:[],
        medium:[],
        low:[]
    };
};

CLOUD.Model.prototype = Object.create(THREE.LoadingManager.prototype);
CLOUD.Model.prototype.constructor = CLOUD.Model;

CLOUD.Model.prototype.destroy = function () {

    // this.cfgInfo = null;
    this.loader = null;
    this.userIdReader = null;
    this.userDataReader = null;
    this.octreeLoader = null;
    this.octreeRootNode = null;
    this.octreeRootNodeI = null;
    this.visibleOctant = null;
    this.materialReader = null;
    this.symbolReader = null;
    this.sceneArray = null;
    this.mpkArray = null;

    this.modelUrl = null;
    this.filter = null;
    this.pool = null;
    this.manager = null;

    this.clearCache();
    this.cache = null;

    this.clearNodePriority();
    this.nodePriority = null;
};

CLOUD.Model.prototype.clearCells = function () {
    this.cache.cells = {};
};

CLOUD.Model.prototype.clearCache = function () {

    var cache = this.cache;
    var geometries = cache.geometries;
    var materials = cache.materials;

    var geometry, material;

    for (var id in geometries) {
        geometry = geometries[id];
        geometry.dispose();
    }

    for (var id in materials) {
        material = materials[id];
        material.dispose();
    }

    cache.cells = {};
    cache.geometries = {};
    cache.materials = {};
    cache.instancedMaterials = {};
};

CLOUD.Model.prototype.clearNodePriority = function () {
    var nodePriority = this.nodePriority;
    nodePriority.high = [];
    nodePriority.medium = [];
    nodePriority.low = [];
};

CLOUD.Model.prototype.load = function (notifyProgress) {

    var scope = this;
    var modelUrl = this.modelUrl;
    var manager = this.manager;
    var scene = manager.scene;
    var loader = this.loader;

    this.notifyProgress = notifyProgress;

    manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_START});

    // var cfgLoader = new CLOUD.Loader.ConfigLoader(this);
    loader.setResponseType("");
    loader.setCrossOrigin(this.crossOrigin);
    loader.load(modelUrl.projectUrl(), function (text) {
        var cfg = JSON.parse(text);
        var metadata = cfg.metadata;

        // scope.cfgInfo = cfg;
        var sceneCount = scope.sceneCount = metadata.scenes;
        var mpkCount = metadata.mpks;
        var symbolCount = metadata.symbol;
        var octreeCount_o = metadata.octree_o;
        var octreeCount_i = metadata.octree_i || 0;
        var materialCount = metadata.material || 0;
        var userDataCount = metadata.userdata || 0;// userdata
        var userIdCount = metadata.userId || 1;// userId

        scope.sceneArray = new Array(sceneCount);

        scope.maxTaskCount = 0;
        scope.maxTaskCount += 1; //sceneCount;
        if (mpkCount > 0) {
            scope.maxTaskCount += mpkCount;
        }
        scope.maxTaskCount += symbolCount;
        scope.maxTaskCount += octreeCount_o;
        scope.maxTaskCount += octreeCount_i;
        scope.maxTaskCount += materialCount;
        scope.maxTaskCount += userDataCount;
        scope.maxTaskCount += userIdCount;

        //scope.mpkArray = new Array(scope.mpkCount);
        scene.parseRootNode(cfg);
        scope.load_complete = false;

        // if (scope.mpkCount > 0) {
        //     scope.maxTaskCount += scope.mpkCount - 1;
        //     // scope.maxTaskCount += scope.mpkCount;
        // }

        var sceneId = 0;

        loader.setResponseType("arraybuffer");
        loader.load(modelUrl.sceneUrl(sceneId), function (data) {
            var sceneReader = new CLOUD.Loader.SceneReader(data);

            if (sceneReader.header.blockId < sceneCount) {
                scope.sceneArray[sceneReader.header.blockId] = sceneReader;
            }

            sceneReader = null;
            // scope.manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_START, sceneId: sceneId});

            scope.onTaskFinished();
        });

        // Add MPKs to task manager
        scope.processMpkTasks(mpkCount);

        // Material
        // scope.materialLoader.setBaseUrl(scope.getTexturePath());
        // loader.setCrossOrigin(scope.crossOrigin);
        loader.setResponseType("arraybuffer");
        loader.load(modelUrl.materialUrl(), function (data) {
            scope.parseMaterial(data);
            scope.onTaskFinished();
        });

        // TODO: maxTaskCount should not be assigned with hard code at initialization (5).
        if (symbolCount > 0) {
            loader.setResponseType("arraybuffer");
            loader.load(modelUrl.symbolUrl(), function (data) {
                scope.parseSymbol(data);
                scope.onTaskFinished();
            });
        }

        // load spatial index
        var octreeLoader = scope.octreeLoader;
        if(octreeCount_o > 0) {
            octreeLoader.load(modelUrl.octreeUrl('o'), function (rootNode) {
                scope.octreeRootNode = rootNode;
                //CLOUD.Logger.log("octreeLoader outer layer.");
                scope.onTaskFinished();
            });
        }

        if(octreeCount_i > 0) {
            octreeLoader.load(modelUrl.octreeUrl('i'), function (rootNode) {
                scope.octreeRootNodeI = rootNode;
                //CLOUD.Logger.log("octreeLoader inner layer.");
                scope.onTaskFinished();
            });
        }

        if (userIdCount > 0) {
            loader.setResponseType("arraybuffer");
            loader.load(modelUrl.userIdUrl(), function (data) {
                scope.parseUserId(data);
                scope.onTaskFinished();
            });
        }

        if (userDataCount > 0) {
            loader.setResponseType("");
            loader.load(modelUrl.userDataUrl(), function (data) {
                scope.parseUserData(data);
                scope.onTaskFinished();
            });
        }

    });
};

CLOUD.Model.prototype.loadMpk = function (mpkId, callback) {

    var scope = this;
    var modelUrl = this.modelUrl;
    var loader = this.loader;
    var mpkWorkerUrl = CLOUD.GlobalData.MpkWorkerUrl;

    if (this.userWorker) {

        loader.setResponseType("arraybuffer");
        loader.load(modelUrl.mpkUrl(mpkId), function (data) {

            var worker = new Worker(mpkWorkerUrl);
            worker.onmessage = function (event) {
                //var mpkReader = event.data[0];
                //if (mpkReader.header.blockId < mpkCount) {
                //    scope.mpkArray[mpkReader.header.blockId] = mpkReader;
                //}

                var result = event.data;

                for (var key in result) {
                    if (result.hasOwnProperty(key)) {
                        scope.referencedMeshCache[key] = result[key];
                    }
                }

                callback();

                // TODO: Notify Progress
                scope.onTaskFinished();
            };

            //worker.postMessage( {"msg": data, result:scope.result});
            worker.postMessage({"msg": data});
        });

    } else {

        loader.setResponseType("arraybuffer");
        loader.load(modelUrl.mpkUrl(mpkId), function (data) {
            scope.parseMpk(data);
            callback();
            scope.onTaskFinished();
        });
    }

};

CLOUD.Model.prototype.processMpkTasks = function (mpkCount) {

    // Add MPKs to task manager
    var taskManager = this.taskManager;

    for (var j = 0; j < mpkCount; ++j) {
        taskManager.addMpkTask(j);
    }

    taskManager.processMpkTasks(this.onTaskFinished);
};

CLOUD.Model.prototype.onTaskFinished = function () {

    this.taskCount++;
    // if (scope.taskCount >= scope.maxTaskCount) {
    //     scope.load_complete = true;
    //     scope.manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_COMPLETE});
    //
    // } else {
    //     var progress = {
    //         total: scope.maxTaskCount,
    //         loaded: scope.taskCount
    //     };
    //     scope.manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_PROGRESS, progress: progress});
    // }

    var manager = this.manager;

    if (this.notifyProgress) {
        var progress = {
            total: this.maxTaskCount,
            loaded: this.taskCount
        };
        manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_PROGRESS, progress: progress});
    }

    if (this.taskCount >= this.maxTaskCount) {
        this.load_complete = true;
        manager.dispatchEvent({type: CLOUD.EVENTS.ON_LOAD_COMPLETE});
    }
};

// CLOUD.Model.prototype.getTexturePath = function () {
//     return this.texturePath ? this.texturePath : THREE.Loader.prototype.extractUrlBase(this.materialUrl("material"));
// };
//
// CLOUD.Model.prototype.findMaterial = function (materialId, isInstanced) {
//
// };

CLOUD.Model.prototype.setCrossOrigin = function (crossOrigin) {
    this.crossOrigin = crossOrigin;
};

CLOUD.Model.prototype.parseMaterial = function (data) {

    this.materialReader = new CLOUD.Loader.MaterialReader(data);

    var materialReader = this.materialReader;
    var len = materialReader.count;
    var materials = this.cache.materials;

    if (len < 0) {
        return;
    }

    for (var i = 0; i < len; ++i) {

        var materialParameters = {};
        var materialData = materialReader.getData(i);

        if (materialData.color !== undefined) {
            materialParameters.color = materialData.color;
        }

        if (materialData.opacity !== undefined) {
            materialParameters.opacity = materialData.opacity;

            if (materialData.opacity < 1.0) {
                materialParameters.transparent = true;
            }
        }

        if (materialData.side !== undefined && materialData.side) {
            materialParameters.side = THREE.DoubleSide;
        }

        var material;

        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {

            material = new THREE.MeshBasicMaterial(materialParameters);

        } else {

            if (materialData.emissive !== undefined) {
                materialParameters.emissive = materialData.emissive;
            }

            if (materialData.specular !== undefined) {
                materialParameters.specular = materialData.specular;
            }

            if (materialData.shininess !== undefined) {
                materialParameters.shininess = materialData.shininess;
            }

            var shaderPhong = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip;

            material = new THREE.MeshPhongMaterial(materialParameters);
            material.type = 'phong_cust_clip';
            material.uniforms = shaderPhong.uniforms;
            material.vertexShader = shaderPhong.vertexShader;
            material.fragmentShader = shaderPhong.fragmentShader;
        }

        material.name = i;
        materials[i] = material;
        materialParameters = null;
    }

};

CLOUD.Model.prototype.parseSymbol = function (data) {
    this.symbolReader = new CLOUD.Loader.SymbolReader(data);
};

CLOUD.Model.prototype.parseMpk = function (data) {

    var reader = new MPK.MPKReader(data);
    var id = reader.header.startId;
    var count = id + reader.header.meshCount;
    for (; id < count; ++id) {
        var p = reader.getPtBuffer(id);
        var i = reader.getIdxBuffer(id);
        var n = reader.getNormalBuffer(id);
        var m = reader.getMeshData(id);
        if (p == undefined || i == undefined || n == undefined) {
            CLOUD.Logger.log("Error Geometry!");
            continue;
        }
        this.referencedMeshCache[id] = {
            P: p,  // position
            I: i,  // index
            N: n,  // normal
            M: m   // mesh info
        };
    }
    reader = null;
};

CLOUD.Model.prototype.parseUserId = function (data) {
    this.userIdReader = new CLOUD.Loader.IdReader(data);
};

CLOUD.Model.prototype.parseUserData = function (data) {
    this.userDataReader = new CLOUD.Loader.UserDataReader(data);
};

/**
 * 读取数据，构造mesh node
 *
 * @param {Object} reader - sceneReader or symbolReader ： 如果 itemParent === null或undefined 为sceneReader， 否则为 symbolReader
 * @param {Int} cellId - 八叉树单元ID
 * @param {Object} item - 数据项
 * @param {Object} itemParent - 父节点参数项 {matrix : xxx, ItemId : xxx, originalId: xxx}
 * @param {string} categoryId - 分类编码 id
 */
CLOUD.Model.prototype.readMeshInfo = function (reader, cellId, item, itemParent, categoryId, cellDepth) {

    var cacheCell = this.cache.cells[cellId];
    var cacheGeometries = this.cache.geometries;
    // var material = this.cache.materials[item.materialId];
    // itemParent存在, 表示读取symbol数据
    var userDataId = itemParent ? itemParent.userDataId : item.userDataId;
    var originalId = itemParent ? itemParent.originalId : item.originalId;
    var userId = this.userIdReader.getString(originalId);

    // Is this debugging code?
    //var idxUserId = this.userIdReader.getIndex(userId);
    //
    //if (idxUserId !== originalId) {
    //    CLOUD.Logger.log("read userId error->", originalId);
    //}
    // End of comment

    var meshInfo;

    if (item.type == 1) {
        //meshInfo = CLOUD.GeomUtil.getMeshNodeAttr(cacheGeometries, reader, item, this.mpkArray, itemParent);
        meshInfo = this.getMeshNodeAttribute(reader, item, itemParent);
    } else if (item.type == 2) {
        meshInfo = CLOUD.GeomUtil.getMeshNodeAttrOfTube(cacheGeometries, reader, item, itemParent);
    } else if (item.type == 3) {
        meshInfo = CLOUD.GeomUtil.getMeshNodeAttrOfPipe(cacheGeometries, reader, item, itemParent);
    } else if (item.type == 4) {
        meshInfo = CLOUD.GeomUtil.getMeshNodeAttrOfBox(cacheGeometries, reader, item, itemParent);
    }

    if (!meshInfo) {
        return;
    }

    var nodeId = meshInfo.nodeId;

    // if (cacheCell[nodeId]) {
    //     CLOUD.Logger.log("nodeId:" + nodeId + " exist");
    // }

    var userData = this.userDataReader.getUserData(userDataId);
    var matrixCache = meshInfo.matrix.clone();

    // cacheCell[nodeId] = {
    //     nodeId: nodeId,
    //     userId: userId,
    //     userData: userData,
    //     meshId: meshInfo.meshId,
    //     matrix: matrixCache,
    //     materialId: item.materialId
    // };

    // this.pushNodeInfo(cellId, nodeId, cacheCell[nodeId]);

    var nodeInfo = {
        nodeId: nodeId,
        userId: userId,
        userData: userData,
        meshId: meshInfo.meshId,
        matrix: matrixCache,
        materialId: item.materialId,
        categoryId: categoryId,
        cellDepth: cellDepth
    };

    cacheCell.push(nodeInfo);

    // this.pushNodeInfo(nodeInfo);

    meshInfo = null;
};

CLOUD.Model.prototype.readSymbolInfo = function (id, cellId, itemParent, categoryId, cellDepth) {

    if (this.symbolReader == null) {
        return;
    }

    var symbolCount = this.symbolReader.header.symbolCount;

    if (id >= 0 && id < symbolCount) {
        var symbolCurrent = this.symbolReader.getSymbolInfo(id);

        for (var i = symbolCurrent.itemIndex; i < symbolCurrent.itemCount; ++i) {
            var item = this.symbolReader.getItemInfo(i);

            if (item.type == 0) {
                continue;
            }

            this.readMeshInfo(this.symbolReader, cellId, item, itemParent, categoryId, cellDepth);
        }
    }
};

// replacement of "CLOUD.GeomUtil.getMeshNodeAttr"
CLOUD.Model.prototype.getMeshNodeAttribute = function (sceneOrSymbolReader, item, itemParent) {
    var matrix = sceneOrSymbolReader.getMatrixInfo(item.matrixId).matrix.clone();
    var meshAttr = sceneOrSymbolReader.getMeshAttrInfo(item.attrIndex);
    var nodeId = itemParent ? itemParent.ItemId + "_" + item.ItemId : item.ItemId;
    // var nodeId = matrixParent ? "symbol" + item.ItemId : item.ItemId;
    var meshId = meshAttr.meshId;

    var refMeshCache = this.referencedMeshCache;
    var meshData = refMeshCache[meshId].M;
    if (meshData == undefined) {
        CLOUD.Logger.log("No mesh information.");
        return null;
    }

    var cacheGeometries = this.cache.geometries;
    var geometry = cacheGeometries[meshId];
    if (!geometry) {

        var positions = refMeshCache[meshId].P;
        var index = refMeshCache[meshId].I;
        var normal = refMeshCache[meshId].N;

        if (positions == undefined || index == undefined || normal == undefined) {
            CLOUD.Logger.log("empty mesh data");
            return null;
        }

        geometry = new THREE.BufferGeometry();
        geometry.setIndex(new THREE.BufferAttribute(index, 1));
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
        // geometry.computeVertexNormals(); // 计算法线，影响光照
        cacheGeometries[meshId] = geometry;
    }

    var matrixTmp = new THREE.Matrix4();
    matrixTmp.setPosition(new THREE.Vector3(meshData.baseVector[0], meshData.baseVector[1], meshData.baseVector[2]));
    matrixTmp.scale(new THREE.Vector3(meshData.baseScale, meshData.baseScale, meshData.baseScale));

    if (meshData.baseScale != 0.0) {
        matrix.multiply(matrixTmp);
    }

    if (itemParent) {
        matrix.multiplyMatrices(itemParent.matrix, matrix);
    }

    //meshData = null;
    meshAttr = null;
    matrixTmp = null;

    return {nodeId: nodeId, meshId: meshId, matrix: matrix};
};

CLOUD.Model.prototype.calcVisibleOctant = function (camera) {

    if (!(this.octreeRootNode)) {
        CLOUD.Logger.log("octree load is not finish!");
        return 0;
    }

    this.visibleOctant.length = 0;

    //If inner scene contains camera, prioritize inner cells, else prioritize outer cells
    var frustum = this.manager.getWorldFrustum(camera, true);
    var cameraPos = camera.position;
    var depth = CLOUD.GlobalData.OctantDepth; // traverse till depth arrived.
    // draw bounding of outer layer for test.
    this.manager.updateOctreeBox(this.octreeRootNode);

    var depthCriteria = CLOUD.GlobalData.MaximumDepth * 0.7;
    var target = camera.target;
    var camDir = new THREE.Vector3(target.x - cameraPos.x, target.y - cameraPos.y, target.z - cameraPos.z);
    camDir.normalize();
    // var octantSize = new THREE.Vector3();

    var outer; // 0: 内部，1：外部

    if (this.containsCamera && this.octreeRootNodeI != null) {
        // Inner cell should get higher priority than outer, while generally the pool is large enough in this case.
        this.octreeRootNodeI.intersectFrustumWithPriority(frustum, depth, cameraPos, camDir, true, depthCriteria, this.visibleOctant);
        CLOUD.Logger.log("Inner: ", this.visibleOctant.length);
        this.octreeRootNode.intersectFrustumWithPriority(frustum, depth, cameraPos, camDir, true, depthCriteria, this.visibleOctant);
        outer = false;
    } else {
        // Outer cell only
        this.octreeRootNode.intersectFrustumWithPriority(frustum, depth, cameraPos, camDir, false, depthCriteria, this.visibleOctant);
        CLOUD.Logger.log("Outer: ", this.visibleOctant.length);
        outer = true;
    }
    //CLOUD.Logger.log("visibleOctant", visibleOctant.join(','));
    var cellCount = this.visibleOctant.length;
    CLOUD.Logger.log("Total Octant Count: ", this.visibleOctant.length);

    return {cellCount: cellCount, outer:outer};
};

CLOUD.Model.prototype.sortVisibleOctant = function (camera) {

    var cameraPos = camera.position;

    this.visibleOctant.sort(function (a, b) {
        if (this.containsCamera) {
            // special case: promote octant which contains camera
            var bCameraOutsideOctantA = cameraPos.x < a.min.x || cameraPos.x > a.max.x ||
                cameraPos.y < a.min.y || cameraPos.y > a.max.y ||
                cameraPos.z < a.min.z || cameraPos.z > a.max.z;
            if (!bCameraOutsideOctantA) {
                return -1;
            }

            var bCameraOutsideOctantB = cameraPos.x < b.min.x || cameraPos.x > b.max.x ||
                cameraPos.y < b.min.y || cameraPos.y > b.max.y ||
                cameraPos.z < b.min.z || cameraPos.z > b.max.z;

            if (!bCameraOutsideOctantB) {
                return 1;
            }
        }
        if (a.priority > b.priority) {
            //  sort a to a lower index than b, i.e. a comes first.
            return -1;
        } else if (a.priority < b.priority) {
            return 1;
        }
        // same priority
        return 0;
    });

};

CLOUD.Model.prototype.readItemData = function (sceneReader, idx, cellId, categoryId, cellDepth) {

    var item = sceneReader.getItemInfo(idx);

    if (item === undefined) {
        return;
    }

    if (item.type === 0) {

        var matrixParent = sceneReader.getMatrixInfo(item.matrixId).matrix.clone();
        var itemParent = {
            matrix: matrixParent,
            ItemId: item.ItemId,
            originalId: item.originalId,
            userDataId: item.userDataId
        };

        this.readSymbolInfo(item.attrIndex, cellId, itemParent, categoryId, cellDepth);
        itemParent = null;

    } else {

        this.readMeshInfo(sceneReader, cellId, item, null, categoryId, cellDepth);

    }
};

CLOUD.Model.prototype.prepare = function (camera, clearPool) {

    var sceneCount = this.sceneArray ? this.sceneArray.length : 0;

    if (sceneCount < 1) {
        CLOUD.Logger.log("model load not started!");
        return;
    }

    // VAAS-100: Mesh and Other resource loading does not sync with reading process,
    // here do scene prepare after all of them loaded.
    // TODO: on-demand loading resource like mesh package, scene and material etc.
    if (!this.load_complete) {
        console.log("model is not loaded!");
        return;
    }

    var sceneReader = this.sceneArray[0];

    if (!sceneReader) {
        CLOUD.Logger.log("Empty scene");
        return;
    }

    CLOUD.Logger.time("prepareScene");

    var cellCount = 0;
    var disableOctant = CLOUD.GlobalData.DisableOctant;
    var useLayerData = CLOUD.GlobalData.UseLayerData;

    var priorityCategories;

    // FRUSTUM Querying Cost < 1 ms
    // CLOUD.Logger.time("frustum");
    if (disableOctant) {

        cellCount = sceneReader.header.cellCount;

        if (cellCount === 0) {
            return;
        }

    } else {

        var octantParam = this.calcVisibleOctant(camera);
        cellCount = octantParam.cellCount;
        var outer = octantParam.outer;

        if (cellCount === 0) {
            return;
        }

        // begin sort
        this.sortVisibleOctant(camera);
        //end of simple prioritized algorithm
        // CLOUD.Logger.timeEnd("frustum");
        // END OF FRUSTUM Querying Cost < 1 ms

        if (outer) {
            priorityCategories = this.manager.highPriorityCategories.outer;
        } else {
            priorityCategories = this.manager.highPriorityCategories.inner;
        }
    }

    var pool = this.pool;
    var cacheCells = this.cache.cells;

    if (clearPool) {
        // console.log("enter pool clear");
        pool.clear();
    }

    // 清除优先级集合
    this.clearNodePriority();

    // console.time("pushNodeInfo");

    for (var i = 0; i < cellCount; ++i) {

        var cellId, cellDepth = 0;

        if (disableOctant) {
            cellId = i;
        } else {
            cellId = this.visibleOctant[i].octantId;
            cellDepth = this.visibleOctant[i].depth;
        }

        var cacheCell = cacheCells[cellId];

        if (cacheCell === undefined) {

            // 缓存node数据
            cacheCell = cacheCells[cellId] = [];

            var cell = sceneReader.getCellInfo(cellId);

            if (useLayerData) {

                var layerCount = cell.layerCount;
                var layerIdxBuffer = cell.layerIdxBuffer;
                var categoryBuffer = cell.categoryBuffer;

                for (var k = 0; k < layerCount; ++k ) {

                    var start = layerIdxBuffer[k];
                    var end = cell.itemCount;

                    if (k < layerCount - 1 ) {
                        end = layerIdxBuffer[k + 1];
                    }

                    var categoryId = categoryBuffer[k];

                    for (var j = start; j < end; ++j) {
                        this.readItemData(sceneReader, j, cellId, categoryId, cellDepth);
                    }

                }

            } else {

                for (var j = cell.itemIndex; j < cell.itemCount; ++j) {
                    this.readItemData(sceneReader, j, cellId, undefined, cellDepth);
                }
            }

        }

        for (var j = 0, len = cacheCell.length; j < len; ++j ) {
            this.pushNodeInfo(cacheCell[j], priorityCategories);
        }
    }

    // console.timeEnd("pushNodeInfo");

    // console.time("updateMeshNodes");
    this.updateMeshNodes();
    // console.timeEnd("updateMeshNodes");

    CLOUD.Logger.log("mesh count:", pool.counter);
    CLOUD.Logger.timeEnd("prepareScene");
};

CLOUD.Model.prototype.pushNodeInfo = function (nodeInfo, priorityCategories) {

    var filter = this.filter;
    var userId = nodeInfo.userId;
    var userData = nodeInfo.userData;
    var fileId = userData.sceneId;
    //var categoryId = nodeInfo.categoryId;
    var categoryId = userData ? userData.categoryId : undefined;

    var nodePriorityHigh = this.nodePriority.high;
    var nodePriorityMedium = this.nodePriority.medium;
    var nodePriorityLow = this.nodePriority.low;

    var mediumPriority = false;

    // 文件过滤
    if (userData && filter.hasFileFilter(fileId)) {
        return;
    }

    // 可见性过滤
    if (filter.isVisibleById(userId, userData) === false) {
        return;
    }

    // 材质过滤
    var isHighlight = filter.hasHighlightMaterial(userId, userData);

    if (priorityCategories && categoryId && priorityCategories[categoryId]) {
        mediumPriority = true;
    }

    if (isHighlight) {
        nodePriorityHigh.push(nodeInfo);
    } else if (mediumPriority){
        nodePriorityMedium.push(nodeInfo);
    } else {
        nodePriorityLow.push(nodeInfo);
    }
};

CLOUD.Model.prototype.updateMeshNodes = function () {

    var pool = this.pool;
    var filter = this.filter;
    var bagId = this.databagId;

    var cache = this.cache;
    var cacheGeometries = cache.geometries;
    var cacheMaterials = cache.materials;

    var nodePriority = this.nodePriority;
    var priorityNodesSet = [nodePriority.high, nodePriority.medium, nodePriority.low];
    // var priorityNodesSet = [nodePriority.medium];

    for (var j = 0, count = priorityNodesSet.length; j < count; ++j) {

        var priorityNodes = priorityNodesSet[j];

        for (var i = 0, len = priorityNodes.length; i < len; ++i) {

            var cacheNode = priorityNodes[i];
            var nodeId = cacheNode.nodeId;
            var userId = cacheNode.userId;
            var userData = cacheNode.userData;
            var meshId = cacheNode.meshId;
            var matrix = cacheNode.matrix;

            var geometry = cacheGeometries[meshId];
            var materialId = cacheNode.materialId;

            // 材质过滤
            var material = filter.getOverridedMaterialById(userId, userData);
            material = material || cacheMaterials[materialId];

            var parameters = {
                databagId: bagId,
                nodeId: nodeId,
                userId: userId,
                userData: userData,
                geometry: geometry,
                matrix: matrix,
                material: material
            };

            var meshNode = pool.get(parameters);
            if (meshNode) {
                meshNode.renderOrder = CLOUD.GlobalData.MaximumDepth - cacheNode.cellDepth;
            }
            parameters = null;
        }
    }

    priorityNodesSet = null;
};
/**
 * 模型管理类
 *
 * @class  CLOUD.ModelManager
 *
 */
CLOUD.ModelManager = function () {

    // THREE.LoadingManager.call(this);

    this.scene = new CLOUD.Scene();

    this.crossOrigin = true;
    this.models = {};

    // Does camera locate inside the scene bound scope
    this.containsCamera = false;

    this.highPriorityCategories = {inner: {}, outer: {}};
};

CLOUD.ModelManager.prototype.calculateCameraModelRelation = function (cameraPos) {

    // if one of models contains camera, then camera is inside the model.
    var contains = false;
    var models = this.models;

    for(var id in models) {
        if (models.hasOwnProperty(id)) {
            var model = models[id];
            if(model.octreeRootNodeI === null) {
                continue;
            }
            if(cameraPos.x < model.octreeRootNodeI.min.x || cameraPos.x > model.octreeRootNodeI.max.x ||
                cameraPos.y < model.octreeRootNodeI.min.y || cameraPos.y > model.octreeRootNodeI.max.y ||
                cameraPos.z < model.octreeRootNodeI.min.z || cameraPos.z > model.octreeRootNodeI.max.z) {
                // camera is outside of model's bound box
                model.containsCamera = false;
            } else {
                model.containsCamera = true;
            }
        }
        contains = contains || model.containsCamera;
    }
    this.containsCamera = contains;
};
// CLOUD.ModelManager.prototype = Object.create(THREE.LoadingManager.prototype);
//
// CLOUD.ModelManager.prototype.constructor = CLOUD.ModelManager;

CLOUD.ModelManager.prototype.destroy = function () {

    this.scene.destroy();

    for (var name in this.models) {
        this.models[name].destroy();
    }

    this.models = {};
};

CLOUD.ModelManager.prototype.prepareScene = function (camera) {

    var clearPool = true;
    var counter = 0;
    var models = this.models;

    for(var id in models) {

        if (models.hasOwnProperty(id)) {

            if (counter > 1) {
                clearPool = false;
            }

            counter++;

            var model = models[id];
            model.prepare(camera, clearPool);
        }
    }

};

CLOUD.ModelManager.prototype.clearScene = function () {

    var models = this.models;

    for(var id in models) {

        if (models.hasOwnProperty(id)) {

            var model = models[id];
            model.clearCells();

        }
    }

};

// CLOUD.ModelManager.prototype.prepareResource = function (renderId, load) {
//
// };
//
// CLOUD.ModelManager.prototype.loadBuidingOutside = function (camera) {
//
// };

CLOUD.ModelManager.prototype.getGlobalTransform = function () {
    return this.scene.rootNode.matrix;
};

/**
 * 加载模型
 *
 * @param {object} parameters 加载配置项,包含 databagId, serverUrl, debug
 */
CLOUD.ModelManager.prototype.load = function (parameters) {

    // get from cache
    var model = this.models[parameters.databagId];

    if (model === undefined) {

        model = new CLOUD.Model(this, parameters.serverUrl, parameters.databagId);

        this.models[parameters.databagId] = model;
    }
    else {
        return model;
    }

    model.load(parameters.notifyProgress);

    return model;
};

// 跨域设置
CLOUD.ModelManager.prototype.setCrossOrigin = function (crossOrigin) {
    this.crossOrigin = crossOrigin;
};

CLOUD.ModelManager.prototype.getMatrixWorldGlobal = function () {
    return this.scene.getMatrixWorldGlobal();
};

// CLOUD.ModelManager.prototype.getMatrixWorldInverseForOriginalCamera = function (camera) {
//
//     var rootMatrixWorld = this.scene.getMatrixWorldGlobal();
//     var matrixWorldInverse = new THREE.Matrix4();
//
//     // rootNode.matrixWorld * oriCamera.matrixWorld = camera.matrixWorld
//     matrixWorldInverse.getInverse(rootMatrixWorld);
//     matrixWorldInverse.multiply(camera.matrixWorld);
//     matrixWorldInverse.getInverse(matrixWorldInverse);
//
//     return matrixWorldInverse;
// };

// 获取场景变换前的相机对应的Frustum
CLOUD.ModelManager.prototype.getWorldFrustum = function (camera, transform) {

    var matrixWorldInverse = new THREE.Matrix4();
    var frustum = new THREE.Frustum();

    if (transform) {

        matrixWorldInverse.getInverse(camera.matrixWorld);
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, matrixWorldInverse));

    } else {

        var worldCamera = camera.clone();
        var targetPost = camera.target;
        // 计算场景变换后的相机位置和目标点的距离
        var distancePost = targetPost.clone().sub(camera.position).length();
        // 获得场景 root node 变换矩阵
        var matrixWorldRoot = this.getMatrixWorldGlobal();
        // 逆矩阵
        var matrixInverseRoot = new THREE.Matrix4();
        matrixInverseRoot.getInverse(matrixWorldRoot);

        // 抽取旋转矩阵
        var matrixRotation = new THREE.Matrix4();
        matrixRotation.extractRotation(matrixWorldRoot);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(matrixRotation);
        quaternion.inverse();// 反转

        // 计算场景变换前的相机位置
        worldCamera.position.applyMatrix4(matrixInverseRoot);

        // 计算场景变换前的目标位置
        var targetPre = targetPost.clone();
        targetPre.applyMatrix4(matrixInverseRoot);

        // 计算场景变换前的相机方向
        // var dirPre = camera.getWorldDirection();
        // dirPre.applyQuaternion(quaternion).normalize();
        var dirPre = targetPre.clone().sub(worldCamera.position);

        // 计算场景变换前的相机位置和目标点的距离
        var distancePre = dirPre.length();

        dirPre.normalize();

        // 计算场景变换前的相机 near 和 far
        var scaleCoe = distancePre / distancePost;
        // worldCamera.near = camera.near * scaleCoe;
        worldCamera.far = camera.far * scaleCoe;

        // 计算场景变换前的相机up和realUpw
        // var up = camera.position.clone().add(camera.up);
        // up.applyMatrix4(inverseMatrix).sub(worldCamera.position).normalize();
        // var realUp = camera.position.clone().add(camera.realUp);
        // realUp.applyMatrix4(inverseMatrix).sub(worldCamera.position).normalize();
        // worldCamera.up.copy(up);
        // worldCamera.realUp.copy(realUp);
        worldCamera.up.applyQuaternion(quaternion).normalize();
        worldCamera.realUp.applyQuaternion(quaternion).normalize();
        worldCamera.updateProjectionMatrix();
        worldCamera.updateMatrixWorld();

        matrixWorldInverse.getInverse(worldCamera.matrixWorld);
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(worldCamera.projectionMatrix, matrixWorldInverse));

        worldCamera = null;
    }

    return frustum;
};

CLOUD.ModelManager.prototype.updateOctreeBox = function (rootNode) {

    this.scene.updateOctreeBox(rootNode);

};

CLOUD.ModelManager.prototype.hasModel = function () {

    var models = this.models;

    for(var id in models) {
        if (models.hasOwnProperty(id)) {
            var model = models[id];
            if (model.load_complete) {
                return true;
            }
        }
    }

   return false;
};

CLOUD.ModelManager.prototype.setCategoriesToHighPriority = function (categories, side) {

    var len = categories.length;

    if (len < 1) {
        return;
    }

    var highPriorityCategories = this.highPriorityCategories[side] = {};

    for (var i = 0; i < len; ++i) {
        highPriorityCategories[categories[i]] = true;
    }
};

CLOUD.ModelManager.prototype.clearCategoriesFromHighPriority = function (side) {
    this.highPriorityCategories[side] = {};
};

CLOUD.ModelManager.prototype.clearAllCategoriesFromHighPriority = function () {
    this.clearCategoriesFromHighPriority("inner");
    this.clearCategoriesFromHighPriority("outer");
};

THREE.EventDispatcher.prototype.apply(CLOUD.ModelManager.prototype);

CLOUD.TaskWorker = function (threadCount, finishCallback) {

    this.MaxThreadCount = threadCount || 8;

    var scope = this;
    scope.todoList = {};
    scope.todoCount = 0;
    scope.doingCount = 0;

    this.hasTask = function () {
        return scope.todoCount > 0;
    };

    this.addItem = function(id, item) {
        scope.todoList[id] = item;
        scope.todoCount++;
    };

    this.clearTasks = function () {
        scope.todoList = {};
        scope.todoCount = 0;
    };

    this.run = function (renderId, loader, sorter) {
        var scope = this;
        if (scope.doingCount > 0) {
            //console.log("busy");
            return;
        }
        
        var items = [];
        var todoList = scope.todoList;
        for (var name in todoList) {
            if(todoList.hasOwnProperty(name)) {
                items.push(name)
            }
        }
        //console.log(scope.todoCount + "/" + items.length);
        scope.todoList = {};
        scope.todoCount = 0;

        var itemCount = items.length;
        if (itemCount == 0)
            return;

        if (sorter) {
            items.sort(sorter);
        }

        itemCount = Math.min(itemCount, CLOUD.GlobalData.ConcurrencyRequestCount);

        var TASK_COUNT = Math.min(this.MaxThreadCount, itemCount);
        scope.doingCount = itemCount;

        function processItem(i) {

            if (i >= itemCount) {
                if (scope.doingCount < 1) {
                    finishCallback();
                }
                return;
            }

            var item = items[i];

            loader(item, i + TASK_COUNT, processItem);
        };

        for (var ii = 0; ii < TASK_COUNT; ++ii) {
            processItem(ii);
        }
    };
};

CLOUD.MpkTaskWorker = function (threadCount) {

    this.MaxThreadCount = threadCount || 8;
    var scope = this;
    this.todoList = [];
    this.doingCount = 0;
    this.listners = [];

    this.addItem = function (mpkId) {

        if (mpkId === undefined) {
            console.log("undefined mpkId");
            return;
        }

        //if (this.todoList[mpkId] === undefined) {
        //    this.todoList[mpkId] = [];
        //}
        this.todoList.push(mpkId);
    };

    this.run = function (loader, onFinished) {

        if (this.doingCount > 0) {
            this.listners.push(onFinished);
            return;
        }

        var doingList = this.todoList;
        this.todoList = [];
        var items = [];
        for (var item in doingList) {
            if(doingList.hasOwnProperty(item)) {
                items.push(item);
            }

        }

        var scope = this;
        var itemCount = items.length;
        if (itemCount == 0) {
            onFinished();
            return;
        }

        var doingListners = this.listners;
        this.listners = [];
        scope.doingCount = itemCount;

        var TASK_COUNT = Math.min(this.MaxThreadCount, itemCount);

        function processItem(i) {

            if (i >= itemCount) {
                if (scope.doingCount < 1) {
                    // next loop
                    onFinished(0, itemCount);

                    for (var ii = 0, len = doingListners.length; ii < len; ++ii) {
                        doingListners[ii](0, itemCount);
                    }
                    doingListners = [];
                    scope.run(loader, function () { });

                } else {
                    onFinished(scope.doingCount, itemCount);
                }
                return;
            }

            if (i >= TASK_COUNT) {
                onFinished(scope.doingCount, itemCount);
            }

            var mpkId = items[i];
            //console.log(mpkId);
            loader(mpkId, i + TASK_COUNT, processItem);
        };

        for (var ii = 0; ii < TASK_COUNT; ++ii) {
            processItem(ii);
        }
    };
};

CLOUD.TaskManager = function (manager) {
    this.manager = manager;
    var scope = this;

    // MPK
    this.mpkWorker = new CLOUD.MpkTaskWorker(8);
};

CLOUD.TaskManager.prototype = {

    constructor: CLOUD.TaskManager,

    addMpkTask: function(mpkId) {
        this.mpkWorker.addItem(mpkId);
    },

    processMpkTasks: function (finishCallback) {

        var scope = this;
        //function on_load_mesh(client, item) {
        //
        //    if (item === null)
        //        return;
        //
        //    var mesh = client.cache.geometries[item.meshNode.meshId];
        //    if (mesh) {
        //        item.meshNode.updateGeometry(mesh);
        //    }
        //    else {
        //        console.log("err: " + item + " may be in other mpk");
        //    }
        //}

        function loader(mpkId, nextIdx, callback) {

            scope.manager.loadMpk(mpkId, function () {
                //if (items == undefined)
                //    console.log("error");
                //
                //for (var ii = 0, len = items.length; ii < len; ++ii) {
                //    on_load_mesh(client, items[ii]);
                //}


                --scope.mpkWorker.doingCount;
                // next task
                callback(nextIdx);
            });
        }

        this.mpkWorker.run(loader, finishCallback || function () { });
    }
};
/**
 * @author muwj 2016/12/15
 * @editor xiaoj 2017/03/24  remove THREE.Vector dependency for web worker usage
 */
var MPK = MPK || {};

MPK.MPKHeader = function (buffer) {

    var header = new Uint32Array( buffer, 0, 7 );

    this.blockId      = header[0];
    this.startId      = header[1];
    this.vtFormat     = header[2];
    this.meshCount    = header[3];
    this.meshOffset   = header[4];
    this.bufferSize   = header[5];
    this.bufferOffset = header[6];

    header = null;
};

MPK.MeshData = function (buffer, offset) {

    var mesh_info = new Uint32Array(buffer, offset, 4);

    this.mesh_id = mesh_info[0];
    this.ptCount = mesh_info[1];
    this.idxCount = mesh_info[2];
    this.dataOffset = mesh_info[3];

    var base_info = new Float32Array(buffer, offset + 4 * 4, 4);

    this.baseScale = base_info[0];

    this.baseVector = new Float32Array(3);
    this.baseVector[0] =  base_info[1];
    this.baseVector[1] = base_info[2];
    this.baseVector[2] = base_info[3];

    mesh_info = null;
    base_info = null;
};

MPK.MPKReader = function (buffer) {

    this.header = new MPK.MPKHeader(buffer);

    this.meshSize = 4 * 8;
    this.maxSize = 4 * 64;
    this.meshBuffer = buffer.slice(this.header.meshOffset, this.header.meshOffset + this.header.meshCount * this.meshSize);
    this.geomBuffer = buffer.slice(this.header.bufferOffset, this.header.bufferOffset + this.header.bufferSize);

    // for data reading
    this.mesh_cur_id = -1;
    //this.pt_pos = new THREE.Vector3(0.0, 0.0, 0.0);
    this.pt_pos = new Float32Array(3);

    var tmp_buffer = new ArrayBuffer(this.maxSize);
    this.mesh_cur = new MPK.MeshData(tmp_buffer, 0);
    this.mesh_cur.baseVector = this.pt_pos;
};

MPK.MPKReader.prototype = {

    constructor: MPK.MPKReader,

    getMeshData: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            return new MPK.MeshData(this.meshBuffer, index * this.meshSize);
        }
    },

    getMeshInfo: function (id) {

        if (id == this.mesh_cur_id) {
            return this.mesh_cur;
        }

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var data_i = new Uint32Array(this.meshBuffer, index * this.meshSize, 4);
            this.mesh_cur.mesh_id = data_i[0];
            this.mesh_cur.ptCount = data_i[1];
            this.mesh_cur.idxCount = data_i[2];
            this.mesh_cur.dataOffset = data_i[3];

            var data_f = new Float32Array(this.meshBuffer, index * this.meshSize + 4 * 4, 4);
            this.mesh_cur.baseScale = data_f[0];
            //this.mesh_cur.baseVector.set(data_f[1], data_f[2], data_f[3]);
            this.mesh_cur.baseVector[0] = data_f[1];
            this.mesh_cur.baseVector[1] = data_f[2];
            this.mesh_cur.baseVector[2] = data_f[3];

            this.mesh_cur_id = id;
            return this.mesh_cur;
        }
    },

    getPtBuffer: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var mesh = this.getMeshInfo(id);
            if (mesh === undefined) {
                return undefined;
            }

            if (mesh.baseScale == 0.0) {
                return new Float32Array(this.geomBuffer, mesh.dataOffset, mesh.ptCount * 3);
            }
            else {
                return new Uint16Array(this.geomBuffer, mesh.dataOffset, mesh.ptCount * 3);
            }
        }
    },

    getIdxBuffer: function (id) {

        var index = id - this.header.startId;
        if (index >= 0 && index < this.header.meshCount) {

            var mesh = this.getMeshInfo(id);
            if (mesh === undefined) {
                return undefined;
            }

            var offset = mesh.dataOffset;
            if (mesh.baseScale == 0.0) {
                offset += mesh.ptCount * 3 * 4;
            }
            else {
                offset += mesh.ptCount * 3 * 2;
                if (mesh.ptCount % 2 == 1) {
                    offset += 2;
                }
            }

            if (mesh.ptCount > 65535) {
                return new Uint32Array(this.geomBuffer, offset, mesh.idxCount);
            }
            else {
                return new Uint16Array(this.geomBuffer, offset, mesh.idxCount);
            }
        }
    },

    getNormalBuffer: function ( id ) {

        var index = id - this.header.startId;
        if ( (this.header.vtFormat & 2) == 2 &&
            index >= 0 &&
            index < this.header.meshCount ) {

            var mesh = this.getMeshInfo( id );
            if ( mesh === undefined ) {
                return undefined;
            }

            var offset = mesh.dataOffset;
            if ( mesh.baseScale == 0.0 ) {
                offset += mesh.ptCount * 3 * 4;
            }
            else {
                offset += mesh.ptCount * 3 * 2;
                if ( mesh.ptCount % 2 == 1 ) {
                    offset += 2;
                }
            }

            if ( mesh.ptCount > 65535 ) {
                offset += mesh.idxCount * 4;
            }
            else {
                offset += mesh.idxCount * 2;
                if ( mesh.idxCount % 2 == 1 ) {
                    offset += 2;
                }
            }

            return new Float32Array( this.geomBuffer, offset, mesh.ptCount * 3 );
        }
    }
};
CLOUD.ClipWidget = function (plane, center) {
    THREE.Object3D.call(this);

    this.uniforms = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.uniforms;

    this.uniforms.vClipPlane.value[0] = plane.clone();

    this.clipplane = plane.clone();

    this.center = center.clone();

    this.size = 0.4;
    this.raycaster = new CLOUD.Raycaster();

    var planegeo = new THREE.PlaneBufferGeometry(16, 16, 1, 1);
    planegeo.dynamic = true;
    var plane = new THREE.Mesh(planegeo, new THREE.MeshPhongMaterial({ opacity: 0.3, transparent: true, side: THREE.DoubleSide, color: 0x6699cc }));

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

    var segments = 6;
    var positions = new Float32Array(segments * 3);
    var colors = new Float32Array(segments * 3);

    {
        // positions
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;

        positions[3] = this.size;
        positions[4] = 0;
        positions[5] = 0;

        positions[6] = 0;
        positions[7] = 0;
        positions[8] = 0;

        positions[9] = 0;
        positions[10] = this.size;
        positions[11] = 0;

        positions[12] = 0;
        positions[13] = 0;
        positions[14] = 0;

        positions[15] = 0;
        positions[16] = 0;
        positions[17] = this.size;

        // colors
        colors[0] = 1;
        colors[1] = 0;
        colors[2] = 0;

        colors[3] = 1;
        colors[4] = 0;
        colors[5] = 0;

        colors[6] = 0;
        colors[7] = 1;
        colors[8] = 0;

        colors[9] = 0;
        colors[10] = 1;
        colors[11] = 0;

        colors[12] = 0;
        colors[13] = 0;
        colors[14] = 1;

        colors[15] = 0;
        colors[16] = 0;
        colors[17] = 1;
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    geometry.computeBoundingSphere();

    var halfPi = 1.57;
    var axis = new THREE.Line(geometry, material, THREE.LineSegments);
    var arrowZ = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.03, 0.1, 6, 1, false), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    arrowZ.rotation.x = halfPi;
    arrowZ.position.z = this.size;
    var torusX = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 4, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    torusX.rotation.y = halfPi;
    torusX.position.x = this.size * 0.85;
    var torusY = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 4, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    torusY.rotation.x = halfPi;
    torusY.position.y = this.size * 0.85;
    var coord = new THREE.Object3D();
    coord.add(axis);
    coord.add(torusX);
    coord.add(torusY);
    coord.add(arrowZ);

    this.visible = false;
    this.add(plane);
    this.coord = coord;
    this.add(coord);

    this.XYZ = [torusX, torusY, arrowZ];
    this.axis = null;

    var worldPosition = new THREE.Vector3();
    var worldRotation = new THREE.Euler();
    var tempMatrix = new THREE.Matrix4();
    var camPosition = new THREE.Vector3();
    var camRotation = new THREE.Euler();

    var tempQuaternion = new THREE.Quaternion();
    var unitX = new THREE.Vector3(1, 0, 0);
    var unitY = new THREE.Vector3(0, 1, 0);

    this.onUpdateClipPlane = function (enabled, clipplane, m) {
        CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.uniforms.iClipPlane.value = enabled;
        if (clipplane !== undefined) {
            CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.uniforms.vClipPlane.value[0] = clipplane.clone();
        }
        if (m !== undefined) {
            CLOUD.ShaderMaterial.ShaderLib.base_cust_clip.uniforms.vClipPlane.value[0].applyMatrix4(m);
        }
    }

    this.enable = function (enable, visible) {
        this.visible = visible;
        this.uniforms.iClipPlane.value = enable ? 1 : 0;

        this.onUpdateClipPlane(this.isEnabled());
    }
    this.isEnabled = function () {
        return this.uniforms.iClipPlane.value == 1;
    }
    this.horizon = function (enable) {
        if (enable) {
            this.quaternion.setFromAxisAngle(unitX, -halfPi);
            this.position.copy(this.center);
        } else {
            this.quaternion.setFromAxisAngle(unitX, 0);
            this.position.copy(this.center);
        }
        this.recaculateClipplane();
    }
    this.update = function (camera) {
        coord = this.coord;

        this.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(this.matrixWorld);
        worldRotation.setFromRotationMatrix(tempMatrix.extractRotation(this.matrixWorld));

        camera.updateMatrixWorld();
        camPosition.setFromMatrixPosition(camera.matrixWorld);
        camRotation.setFromRotationMatrix(tempMatrix.extractRotation(camera.matrixWorld));

        scale = worldPosition.distanceTo(camPosition) / 6 * this.size;
        coord.scale.set(scale, scale, scale);
    }

    this.recaculateClipplane = function () {
        this.updateMatrix();
        var m = new THREE.Matrix4();
        m.getInverse(this.matrix);
        m.transpose();
        this.uniforms.vClipPlane.value[0] = this.clipplane.clone();
        this.uniforms.vClipPlane.value[0].applyMatrix4(m);

        this.onUpdateClipPlane(this.isEnabled(), this.clipplane, m);
    }
    this.position.copy(this.center);
    this.recaculateClipplane();

    var offsetOld = 0;
    this.offset = function (offset) {
        if (offset == offsetOld) {
            return;
        }
        dist = offset - offsetOld;

        offsetOld = offset;

        tmpClipplane = this.uniforms.vClipPlane.value[0];
        offsetVector = new THREE.Vector3(tmpClipplane.x * dist, tmpClipplane.y * dist, tmpClipplane.z * dist);
        this.position.add(offsetVector);

        tmpClipplane.w -= dist;

        this.onUpdateClipPlane(this.isEnabled(), tmpClipplane);
    }

    var rotXOld = 0;
    this.rotX = function (rot) {
        if (rot == rotXOld) {
            return;
        }
        angle = rot - rotXOld;

        rotXOld = rot;
        tempQuaternion.setFromAxisAngle(unitX, angle);
        this.quaternion.multiply(tempQuaternion);

        this.recaculateClipplane();
    }

    var rotYOld = 0;
    this.rotY = function (rot) {
        if (rot == rotYOld) {
            return;
        }
        angle = rot - rotYOld;

        rotYOld = rot;
        tempQuaternion.setFromAxisAngle(unitY, angle);
        this.quaternion.multiply(tempQuaternion);

        this.recaculateClipplane();
    }

    this.snap = function (mouse, camera) {
        this.raycaster.setFromCamera(mouse, camera);
        var intersects = this.raycaster.intersectObjects(this.XYZ);

        if (intersects.length > 0) {
            axis = intersects[0].object;
            axis.color = axis.material.color;
            axis.material.color.set(0xffffff);
            this.axis = axis;
        } else if (this.axis != null) {
            this.axis.material.color.set(this.axis.color);
            this.axis = null;
        }
    };

    this.backup = function () {
        var ret = new Object();
        ret.quaternion = this.quaternion.clone();
        ret.position = this.position.clone();
        return ret;
    };

    this.restore = function (status, offset, rotx, roty) {
        offsetOld = offset;
        rotXOld = rotx;
        rotYOld = roty;
        this.quaternion.copy(status.quaternion);
        this.position.copy(status.position);
        this.recaculateClipplane();
    };

    this.onMouseUp = function (event) {
        if (this.axis != null) {
            this.axis.material.color.set(this.axis.color);
            this.axis = null;
        }
        return true;
    };

    this.onMouseDown = function (event) {
        if (this.axis !== null) {
        }
        return true;
    };

    this.onMouseMove = function (mouse, camera) {
        this.snap(mouse, camera);
    };

    this.hitTest = function(ray){
        var plane = new THREE.Plane();
        var v4 = this.uniforms.vClipPlane.value[0];
        plane.setComponents(v4.x, v4.y, v4.z, v4.w);

        return { sign: ray.direction.dot(plane.normal) < 0, distance: ray.distanceToPlane(plane) };
    };
};

CLOUD.ClipWidget.prototype = Object.create(THREE.Object3D.prototype);
CLOUD.ClipWidget.prototype.constructor = CLOUD.ClipWidget;




CLOUD.ClipEditor = function (object, scene, domElement) {
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    var clipWidget = scene.getClipWidget();
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };

    this.toggle = function (enable, visible) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.enable(enable, visible);
    };

    this.visible = function (enable) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.visible = enable;
    };

    this.horizon = function (enable) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.horizon(enable);
    };

    this.set = function (offset) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.offset(offset);
    };

    this.rotX = function (rot) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.rotX(rot);
    };

    this.rotY = function (rot) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipWidget.rotY(rot);
    };

    this.update = function (camera) {
        if (clipWidget === undefined)
            return;
        clipWidget.update(camera);
    };

    this.backup = function () {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return null;
        }

        return clipWidget.backup();
    };

    this.restore = function (status, offset, rotx, roty) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        return clipWidget.restore(status, offset, rotx, roty);
    }
};
CLOUD.ClipEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.ClipEditor.prototype.constructor = CLOUD.ClipEditor;

/*
// conflict with default camera mouse event processor
CLOUD.ClipEditor.prototype.onMouseUp = function ( event ) {
	clipWidget.onMouseUp();

	var camera_scope = this.cameraEditor;
	if ( camera_scope.enabled === false ) return false;

	if ( camera_scope.IsIdle() === true ) {
		return false;
	}
	camera_scope.endOperation();
	return true;
};

CLOUD.ClipEditor.prototype.onMouseDown = function ( event ) {
	clipWidget.onMouseDown();

	this.processMouseDown(event);
};

CLOUD.ClipEditor.prototype.onMouseMove = function ( event ) {
	mouse = this.cameraEditor.mapWindowToViewport(event.clientX, event.clientY);

	clipWidget.onMouseMove(mouse, this.cameraEditor.object);

	var camera_scope = this.cameraEditor;
	if ( camera_scope.enabled === false ) return;

	event.preventDefault();

	camera_scope.process(event.clientX, event.clientY);
};
*/
CLOUD.ClipPlanes = function (size, center) {
    THREE.Object3D.call(this);

    var faceName = [];
    faceName.push("clipPlane_right");
    faceName.push("clipPlane_left");
    faceName.push("clipPlane_top");
    faceName.push("clipPlane_bottom");
    faceName.push("clipPlane_front");
    faceName.push("clipPlane_back");

    this.cubeSize = size.clone();
    this.center = center.clone();

    this.visible = false;
    this.rotatable = false;

    this.selectIndex = null;

    this.planeOffset = new Array(6);

    this.uniforms = CLOUD.ShaderMaterial.ShaderLib.phong_cust_clip.uniforms;

    this.clipplanes = null;

    this.calculation = true;

    this.getPlaneNormal = function (face) {
        var planeNormal = new THREE.Vector4();
        var index = Math.floor(face / 2);
        var mod = face % 2;
        planeNormal.setComponent(index, Math.pow(-1, mod));
        planeNormal["w"] = -this.cubeSize.getComponent(index) * 0.5;
        this.planeOffset[face] = 0;
        return planeNormal;
    };

    this.planeMaterial = new THREE.MeshPhongMaterial({
        opacity: 0.3,
        transparent: true,
        side: THREE.DoubleSide,
        color: 0x6699cc
    });
    this.planeHighLightMatrial = new THREE.MeshPhongMaterial({
        opacity: 0.3,
        transparent: true,
        side: THREE.DoubleSide,
        color: 0x00FF80
    });
    this.initPlaneModel = function (face) {
        var index = Math.floor(face / 2);
        var mod = face % 2;

        var width = (index == 0 ? this.cubeSize.z : this.cubeSize.x);
        var height = (index == 1) ? this.cubeSize.z : this.cubeSize.y;

        var plane = new THREE.PlaneGeometry(width, height);
        var planeMesh = new THREE.Mesh(plane, this.planeMaterial.clone());
        planeMesh.name = faceName[face];
        planeMesh.customTag = true;
        planeMesh.position.setComponent(index, Math.pow(-1, mod) * this.cubeSize.getComponent(index) * 0.5);
        if (index == 0) planeMesh.rotation.y = Math.pow(-1, mod) * Math.PI * 0.5;
        else if (index == 1) planeMesh.rotation.x = Math.pow(-1, mod) * Math.PI * 0.5;
        //else if (index == 2 && mod == 0) planeMesh.rotation.x = Math.PI;

        this.add(planeMesh);
    };

    this.enable = function (enable, visible) {
        this.visible = visible;
        this.uniforms.iClipPlane.value = enable ? 6 : 0;
    };

    this.isEnabled = function () {
        return this.uniforms.iClipPlane.value == 0 ? false : true;
    };

    ClipPlanesInfo = function (enable, visible, rotatable, calculation, planeOffset, position, scale, quaternion, cubeSize, center) {
        this.enable = enable;
        this.visible = visible;
        this.rotatable = rotatable;
        this.calculation = calculation;
        this.planeOffset = planeOffset.slice(0);
        this.position = position;
        this.scale = scale;
        this.quaternion = quaternion;
        this.cubeSize = cubeSize;
        this.center = center;
    };

    this.store = function () {
        return new ClipPlanesInfo(this.uniforms.iClipPlane.value ? true : false, this.visible, this.rotatable, this.calculation, this.planeOffset, this.position.clone(), this.scale.clone(), this.quaternion.clone(),
            this.cubeSize.clone(), this.center.clone());
    };

    this.restore = function (info) {
        this.calculation = true;
        this.calculationPlanes(info.cubeSize, info.center);

        this.enable(info.enable, info.visible);
        this.rotatable = info.rotatable;
        this.calculation = info.calculation;

        for (var i = 0; i < 6; ++i) {
            this.planeOffset[i] = info.planeOffset[i];
        }
        this.position.copy(info.position);
        this.scale.copy(info.scale);

        this.quaternion._w = info.quaternion._w;
        this.quaternion._x = info.quaternion._x;
        this.quaternion._y = info.quaternion._y;
        this.quaternion._z = info.quaternion._z;

        this.update();
    };

    this.reset = function () {
        this.calculation = true;
        for (var i = 0; i < 6; ++i) {
            this.planeOffset[i] = 0;
        }
        this.position.copy(this.center);
        this.scale.copy(new THREE.Vector3(1.0, 1.0, 1.0));
        this.quaternion.copy(new THREE.Quaternion());
        this.update();
    };

    this.calculationPlanes = function (size, center) {
        if (!this.calculation) return;

        this.cubeSize.copy(size);
        this.center.copy(center);

        var size = this.children.length;
        for (var i = size - 1; i >= 0; --i) {
            this.remove(this.children[i]);
        }

        for (var i = 0; i < 6; ++i) {
            this.uniforms.vClipPlane.value[i] = this.getPlaneNormal(i);
            this.initPlaneModel(i);
        }

        this.clipplanes = this.uniforms.vClipPlane.value.slice(0);

        this.reset();
    };

    this.update = function () {
        this.updateMatrixWorld();
        var m = new THREE.Matrix4();
        m.getInverse(this.matrix);
        m.transpose();
        for (var i = 0; i < 6; ++i) {
            this.uniforms.vClipPlane.value[i] = this.clipplanes[i].clone().applyMatrix4(m);
        }
    };

    this.offset = function (face, offset) {
        this.calculation = false;

        var index = Math.floor(face / 2);
        var mod = face % 2;
        this.planeOffset[face] += offset;

        var size = this.cubeSize.getComponent(index) * 0.5;
        if (mod == 0 && this.planeOffset[face] > size) {
            this.planeOffset[face] -= offset;
            offset = size - this.planeOffset[face];
            this.planeOffset[face] = size;
        }
        else if (mod == 1 && this.planeOffset[face] < -size) {
            this.planeOffset[face] -= offset;
            offset = -size - this.planeOffset[face];
            this.planeOffset[face] = -size;
        }

        var centerOffset = new THREE.Vector3();
        for (var i = 0; i < 6; ++i) {
            var normal = this.clipplanes[i].clone();
            var planeOffset = this.planeOffset[i];
            var deltaOffset = new THREE.Vector3(normal.x * planeOffset, normal.y * planeOffset, normal.z * planeOffset);
            centerOffset.add(deltaOffset);
        }

        var scale = 1 + (centerOffset.getComponent(index) / this.cubeSize.getComponent(index));
        if (scale > 0.0 && scale < 2.0) {
            this.scale.setComponent(index, scale);
            var tempClipPlane = this.uniforms.vClipPlane.value[face].clone();
            var tempNormal = new THREE.Vector3(tempClipPlane.x, tempClipPlane.y, tempClipPlane.z);
            tempNormal.normalize();
            var deltaOffset = offset;
            var offsetVector = new THREE.Vector3(tempNormal.x * deltaOffset, tempNormal.y * deltaOffset, tempNormal.z * deltaOffset);
            if (face % 2 == 1) {
                this.position.sub(offsetVector.multiplyScalar(0.5));
            }
            else {
                this.position.add(offsetVector.multiplyScalar(0.5));
            }

            this.update();
        }
        else {
            this.planeOffset[face] -= offset;
        }
    };

    var tempQuaternion = new THREE.Quaternion();

    var unitX = new THREE.Vector3(1.0, 0.0, 0.0);
    this.rotX = function (rot) {
        this.calculation = false;
        tempQuaternion.setFromAxisAngle(unitX, rot);
        this.quaternion.multiply(tempQuaternion);
        this.update();
    };

    var unitY = new THREE.Vector3(0.0, 1.0, 0.0);
    this.rotY = function (rot) {
        this.calculation = false;
        tempQuaternion.setFromAxisAngle(unitY, rot);
        this.quaternion.multiply(tempQuaternion);
        this.update();
    };

    this.highLight = function () {
        if (this.selectIndex == null)
            return;
        this.children[this.selectIndex].material = this.planeHighLightMatrial.clone();
    };

    this.cancelHighLight = function () {
        if (this.selectIndex == null)
            return;
        this.children[this.selectIndex].material = this.planeMaterial.clone();
        this.selectIndex = null;
    };

    this.calculationPlanes(size, center);
};

CLOUD.ClipPlanes.prototype = Object.create(THREE.Object3D.prototype);
CLOUD.ClipPlanes.prototype.constructor = CLOUD.ClipPlanes;

CLOUD.ClipPlanes.prototype.hitTest = function (raycaster) {
    var minDistance = null;
    var minSign = null;

    this.raycast(raycaster);
    if (this.selectIndex != null) {
        var ray = raycaster.ray;
        var plane = new THREE.Plane();
        var v4 = this.uniforms.vClipPlane.value[this.selectIndex];
        plane.setComponents(v4.x, v4.y, v4.z, v4.w);
        minDistance = ray.distanceToPlane(plane);
        minSign = ray.direction.dot(plane.normal) < 0;
    }

    return {sign: minSign, distance: minDistance};
};

CLOUD.ClipPlanes.prototype.raycast = (function () {
    return function (raycaster, intersects) {
        var planeIntersects = [];
        var selectPlane;
        for (var i = 0, l = this.children.length; i < l; i++) {
            intersectObject(this.children[i], raycaster, planeIntersects, true);
            if (planeIntersects.length > 0) {
                if (!selectPlane) {
                    selectPlane = planeIntersects.pop();
                    this.selectIndex = i;
                }
                else {
                    var plane = planeIntersects.pop();
                    if (plane.distance < selectPlane.distance) {
                        selectPlane = plane;
                        this.selectIndex = i;
                    }
                }
            }
        }

        if (!selectPlane)
            this.selectIndex = null;

        return false;
    };
}());
CLOUD.ClipPlanesEditor = function (object, scene, domElement, onSelectionChanged) {
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    this.cameraEditor = object;
    this.scene = scene;
    this.onObjectSelected = onSelectionChanged;

    this.enablePick = false;

    var clipPlanes = scene.getClipPlanes();

    this.startPt = new THREE.Vector2();
    this.endPt = new THREE.Vector2();

    this.frustum = new THREE.Frustum();

    this.selectIndex = null;

    this.planeDistance = 0;

    this.offsetSpeed = 0.02;

    var scope = this;
    this.pickHelper = new CLOUD.PickHelper(this.scene, this.cameraEditor, function (select, doubleClick) {
        scope.onObjectSelected(select, doubleClick);
    });

    this.toggle = function (enable, visible) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipPlanes.enable(enable, visible);
    };

    this.visible = function (enable) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipPlanes.visible = enable;
    };

    this.rotatable = function (enable) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipPlanes.rotatable = enable;
    };

    this.store = function () {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        return clipPlanes.store();
    };

    this.restore = function (clipPlanesInfo) {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipPlanes.restore(clipPlanesInfo);
    };

    this.reset = function () {
        if (CLOUD.ShaderMaterial.ShaderLib === undefined) {
            return;
        }

        clipPlanes.reset();
    };

    this.pointToScreen = function (point) {
        var camera = this.cameraEditor.camera;
        var viewProjMatrix = new THREE.Matrix4();
        viewProjMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

        var point4 = new THREE.Vector4(point.x, point.y, point.z, 1.0);
        point4.applyMatrix4(viewProjMatrix);

        var screen = new THREE.Vector2();
        screen.x = (point4.x / point4.w + 1.0) / 2;
        screen.y = 1 - (point4.y / point4.w + 1.0) / 2;

        var dim = this.cameraEditor.getContainerDimensions();

        screen.x = screen.x * dim.width + dim.left;
        screen.y = screen.y * dim.height + dim.top;

        return screen;
    };

    this.getPlaneDistanceInScreen = function () {
        if (this.selectIndex == null) return null;

        if (this.selectIndex < 2) {
            var right = clipPlanes.center.clone();
            var left = clipPlanes.center.clone();

            right.x -= clipPlanes.cubeSize.x;
            left.x += clipPlanes.cubeSize.x;

            var rightScreen = this.pointToScreen(right);
            var leftScreen = this.pointToScreen(left);

            return rightScreen.x - leftScreen.x;
        }
        else {
            var top = clipPlanes.center.clone();
            var bottom = clipPlanes.center.clone();

            bottom.y -= clipPlanes.cubeSize.y;
            top.y += clipPlanes.cubeSize.y;

            var bottomScreen = this.pointToScreen(bottom);
            var topScreen = this.pointToScreen(top);

            return bottomScreen.y - topScreen.y;
        }
    };

    this.getPickPoint = function (cx, cy) {
        var canvasContainer = this.cameraEditor.getContainerDimensions();
        // 规范化开始点
        var canvasX = cx - canvasContainer.left;
        var canvasY = cy - canvasContainer.top;
        // 规范化到[-1, 1]
        var normalizedX = (canvasX / canvasContainer.width) * 2.0 - 1.0;
        var normalizedY = ((canvasContainer.height - canvasY) / canvasContainer.height) * 2.0 - 1.0;

        var raycaster = new CLOUD.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), this.cameraEditor.object);

        var point = raycaster.ray.intersectPlane(this.plane);
        return point;
    };

    this.getSelectIndex = function () {
        return clipPlanes.selectIndex;
    };

    this.isVisible = function () {
        return clipPlanes.visible;
    };

    this.isRotate = function () {
        return clipPlanes.rotatable;
    };

    this.offset = function (offset) {
        var index = Math.floor(this.selectIndex / 2);
        if (this.selectIndex <= 3) {
            clipPlanes.offset(this.selectIndex, -offset * clipPlanes.cubeSize.getComponent(index) * 2);
        }
        else if (this.selectIndex % 2 == 1) {
            clipPlanes.offset(this.selectIndex, -offset * clipPlanes.cubeSize.getComponent(index) * 2);
        }
        else {
            clipPlanes.offset(this.selectIndex, offset * clipPlanes.cubeSize.getComponent(index) * 2);
        }
    };

    this.rotate = function (cx, cy) {
        if (this.selectIndex == 2 || this.selectIndex == 3) {
            clipPlanes.rotX(cy / 180 * Math.PI * 0.1);
        }
        else {
            clipPlanes.rotY(cx / 180 * Math.PI * 0.1);
        }
    };

    this.update = function (camera) {
        if (clipPlanes === undefined)
            return;
        clipPlanes.update(camera);
    };

    this.cancelHighLight = function () {
        if (clipPlanes === undefined)
            return;
        clipPlanes.cancelHighLight();
    };

    this.highLight = function () {
        if (clipPlanes === undefined)
            return;
        clipPlanes.highLight();
    };
};

CLOUD.ClipPlanesEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.ClipPlanesEditor.prototype.constructor = CLOUD.ClipPlanesEditor;

CLOUD.ClipPlanesEditor.prototype.updateFrustum = function (updateUI) {

    var x1 = this.startPt.x;
    var x2 = this.endPt.x;
    var y1 = this.startPt.y;
    var y2 = this.endPt.y;

    if (x1 > x2) {

        var tmp1 = x1;
        x1 = x2;
        x2 = tmp1;

    }

    if (y1 > y2) {

        var tmp2 = y1;
        y1 = y2;
        y2 = tmp2;

    }

    if (x2 - x1 == 0 || y2 - y1 == 0)
        return false;

    var helper = this.cameraEditor;
    var dim = helper.getContainerDimensions();

    helper.computeFrustum(x1, x2, y1, y2, this.frustum, dim);

    if (updateUI) {
        this.onUpdateUI({visible: true, dir: this.startPt.x < this.endPt.x, left: (x1 - dim.left), top: (y1 - dim.top), width: (x2 - x1), height: (y2 - y1)});
    }

    return true;
};

CLOUD.ClipPlanesEditor.prototype.processMouseDown = function (event) {
    this.startPt.set(event.clientX, event.clientY);

    if (!this.enablePick && event.button === THREE.MOUSE.LEFT) {
        this.cameraEditor.getTrackingPoint(event.clientX, event.clientY);
        this.selectIndex = this.getSelectIndex();

        this.planeDistance = this.getPlaneDistanceInScreen();
    }

    if (this.selectIndex != null) {
        this.highLight();
        this.cameraEditor.viewer.editorManager.isUpdateRenderList = true;
        this.cameraEditor.update(true);
    }
    else {
        CLOUD.OrbitEditor.prototype.processMouseDown.call(this, event);
    }
};

CLOUD.ClipPlanesEditor.prototype.processMouseUp = function (event) {
    this.selectIndex = null;

    this.planeDistance = 0;

    if (this.enablePick && event.button === THREE.MOUSE.LEFT) {
        this.onUpdateUI({visible: false});

        if (this.startPt.x == event.clientX && this.startPt.y == event.clientY) {
            this.pickHelper.click(event);
        }
        else {
            var allowRectPick = event.shiftKey || event.ctrlKey || event.altKey;
            if (allowRectPick) {

                this.endPt.set(event.clientX, event.clientY);
                if (!this.updateFrustum()) {
                    this.pickHelper.click(event);
                    return false;
                }

                var state = CLOUD.OPSELECTIONTYPE.Clear;

                if (event.ctrlKey) {
                    state = CLOUD.OPSELECTIONTYPE.Add;
                }
                else if (event.altKey) {
                    state = CLOUD.OPSELECTIONTYPE.Remove;
                }


                var scope = this;
                this.scene.pickByReck(this.frustum, state, function () {
                    scope.onObjectSelected(null, false);
                });
                this.cameraEditor.updateView(true);

                return true;
            }
        }
    }

    CLOUD.OrbitEditor.prototype.processMouseUp.call(this, event);

    this.cameraEditor.viewer.editorManager.isUpdateRenderList = true;
    this.cancelHighLight();
    this.cameraEditor.update(true);

    return true;
};


CLOUD.ClipPlanesEditor.prototype.processMouseMove = function (event) {
    var allowRectPick = event.shiftKey || event.ctrlKey || event.altKey;
    if (allowRectPick && event.button === THREE.MOUSE.LEFT) {
        this.endPt.set(event.clientX, event.clientY);
        this.updateFrustum(true);
        return true;
    }

    if (this.selectIndex != null) {
        if (!this.isRotate()) {
            var delta = 0;
            if (this.selectIndex < 2) {
                delta = event.clientX - this.startPt.x;
            }
            else {
                delta = event.clientY - this.startPt.y;
            }

            this.offset(delta / this.planeDistance);
            this.startPt.set(event.clientX, event.clientY);
        }
        else {
            this.rotate(event.clientX - this.startPt.x, event.clientY - this.startPt.y);
            this.startPt.set(event.clientX, event.clientY);
        }
        this.cameraEditor.update(true);
    }
    else {
        CLOUD.OrbitEditor.prototype.processMouseMove.call(this, event);
    }
};

CLOUD.ClipPlanesEditor.prototype.touchstart = function (event) {
    event.preventDefault();

    this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);
    if (!this.enablePick) {
        this.cameraEditor.getTrackingPoint(event.touches[0].clientX, event.touches[0].clientY);
        this.selectIndex = this.getSelectIndex();
        this.planeDistance = this.getPlaneDistanceInScreen();
    }

    if (this.selectIndex != null) {
        this.highLight();
        this.cameraEditor.viewer.editorManager.isUpdateRenderList = true;
        this.cameraEditor.update(true);
    }
    else {
        this.cameraEditor.touchStartHandler(event);
    }
};

CLOUD.ClipPlanesEditor.prototype.touchmove = function (event) {
    event.preventDefault();

    if (this.selectIndex != null) {
        if (!this.isRotate()) {
            var delta = 0;
            if (this.selectIndex < 2) {
                delta = event.touches[0].clientX - this.startPt.x;
            }
            else {
                delta = event.touches[0].clientY - this.startPt.y;
            }

            this.offset(delta / this.planeDistance);
            this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);
        }
        else {
            this.rotate(event.touches[0].clientX - this.startPt.x, event.touches[0].clientY - this.startPt.y);
            this.startPt.set(event.touches[0].clientX, event.touches[0].clientY);
        }
        this.cameraEditor.update(true);
    }
    else {
        this.cameraEditor.touchMoveHandler(event);
    }
};

CLOUD.ClipPlanesEditor.prototype.touchend = function (event) {
    event.preventDefault();

    this.selectIndex = null;
    this.planeDistance = 0;

    if (this.enablePick) {
        this.onUpdateUI({visible: false});

        if (this.startPt.x == event.touches[0].clientX && this.startPt.y == event.touches[0].clientY) {
            this.pickHelper.click(event);
        }
    }

    this.cameraEditor.touchEndHandler(event);

    this.cameraEditor.viewer.editorManager.isUpdateRenderList = true;
    this.cancelHighLight();
    this.cameraEditor.update(true);

    return true;
};
CLOUD.ClipPlaneService = function(viewer) {
    this.viewer = viewer;
};

CLOUD.ClipPlaneService.prototype = {

    construtor: CLOUD.ClipPlaneService,

    destroy: function() {
        this.viewer = null;
    },


    update: function(camera) {

        var viewer = this.viewer;
        var clipEditor = viewer.editorManager.editors["clipEditor"];
        if (clipEditor !== undefined) {
            clipEditor.update(camera);
            viewer.render();
        }

        var clipPlanesEditor = viewer.editorManager.editors["clipPlanesEditor"];
        if (clipPlanesEditor !== undefined) {
            clipPlanesEditor.update(camera);
            viewer.render();
        }
    },
    
    getClipEditor: function() {

        var viewer = this.viewer;
        var clipEditor = viewer.editorManager.editors["clipEditor"];
        if (clipEditor === undefined) {
            clipEditor = new CLOUD.ClipEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            viewer.editorManager.editors["clipEditor"] = clipEditor;
        }

        this.update(viewer.camera);

        return clipEditor;
    },

    getClipPlanesEditor: function() {

        var viewer = this.viewer;
        var clipPlanesEditor = viewer.editorManager.editors["clipPlanesEditor"];
        if (clipPlanesEditor === undefined) {
            clipPlanesEditor = new CLOUD.ClipPlanesEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            viewer.editorManager.editors["clipPlanesEditor"] = clipPlanesEditor;
        }

        this.update(viewer.camera);

        return clipPlanesEditor;
    },

    // 关闭/开启切面功能，同时设置可见性
    clipToggle: function(enable, visible) {

        var viewer = this.viewer;
        var clipEditor = this.getClipEditor();
        clipEditor.toggle(enable, visible);

    },

    // 显示/隐藏切面
    clipVisible: function(enable) {

        var clipEditor = this.getClipEditor();
        clipEditor.visible(enable);

    },

    // 设置切面为水平/竖直模式
    // 这是一个辅助函数，是对下面旋转功能的封装，保存/恢复状态不需记录/设定
    clipHorizon: function(enable) {

        var clipEditor = this.getClipEditor();
        clipEditor.horizon(enable);

    },

    // 沿切面局部坐标移动切面(Z轴)
    clipSetPlane: function(offset) {

        var clipEditor = this.getClipEditor();

        clipEditor.set(offset);

    },

    // 以切面局部坐标X轴为轴旋转切面
    clipRotPlaneX: function(rot) {

        var clipEditor = this.getClipEditor();
        clipEditor.rotX(rot);

    },

    // 以切面局部坐标Y轴为轴旋转切面
    clipRotPlaneY: function(rot) {

        var clipEditor = this.getClipEditor();
        clipEditor.rotY(rot);

    },

    // 保存切面状态，切面的位置及旋转状态数据的Object
    // 为减少依赖切面开启、可见状态未包含
    backupClipplane: function() {

        var clipEditor = this.getClipEditor();
        return clipEditor.backup();

    },

    // 恢复切面状态
    // 输入之前从backupClipplane保存的切面状态对象status，以及界面记录的偏移offset、X+Y轴选转量rotx+roty
    // 注意：offset+rotx+roty是界面状态，内部仅作初始值记录，界面更改后用新值与旧值计算增量控制切面
    restoreClipplane: function(status, offset, rotx, roty) {

        var clipEditor = this.getClipEditor();
        clipEditor.restore(status, offset, rotx, roty);

    },


    clipPlanesToggle: function(enable, visible) {

        var viewer = this.viewer;
        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.toggle(enable, visible);

    },

    // 显示/隐藏切面
    clipPlanesVisible: function(enable) {

        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.visible(enable);

    },

    clipPlanesRotatable: function(enable) {

        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.rotatable(enable);

    },

    clipPlanesEnablePick : function (enable) {
        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.enablePick = enable;
    },
    
    saveState: function() {

        var clipPlanesEditor = this.getClipPlanesEditor();
        return clipPlanesEditor.store();

    },

    loadState: function(info) {

        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.restore(info);

    },

    clipPlanesReset: function() {

        var clipPlanesEditor = this.getClipPlanesEditor();
        clipPlanesEditor.reset();

    },
}
/**
 * 模型浏览类
 *
 * @class  CLOUD.Viewer
 *
 */
CLOUD.Viewer = function () {
    "use strict";

    this.domElement = null;
    this.camera = null;
    this.renderer = null;

    // 增量绘制
    this.countRenderRequest = 0;
    this.maxCountRenderRequest = 10000;
    this.rendering = false;
    this.incrementRenderHandle = 0;

    this.callbacks = {};
    this.services = {};

    // this.isModelLoaded = false;

    this.tmpBox = new THREE.Box3();

    this.enableCameraNearFar = true; // 允许动态计算裁剪面
    this.currentHomeView = CLOUD.EnumStandardView.ISO; // home视图设置

    this.modelManager = new CLOUD.ModelManager();
    this.editorManager = new CLOUD.EditorManager();

    this.isRecalculationPlanes = false;
    this.calculationPlanesBind = this.calculationPlanes.bind(this);
    this.addRenderFinishedCallback(this.calculationPlanesBind);
};

/**
 * @lends CLOUD.Viewer.prototype
 *
 */
CLOUD.Viewer.prototype = {

    constructor: CLOUD.Viewer,

    // ------ 注册自定义回调函数 S -------------- //
    /**
     * 注册回调函数
     *
     * @param {String} type - 回调函数类型
     * @param {function()} callback - 回调函数
     */
    addCallbacks: function (type, callback) {

        var list = this.callbacks[type];

        if (!list) {
            list = [];
            this.callbacks[type] = list;
        }

        if (list.indexOf(callback) === -1) {
            list.push(callback);
        }
    },

    /**
     * 取消某类型回调函数注册
     *
     * @param {String} type - 回调函数类型
     * @param {function()} callback - 回调函数
     */
    removeCallbacks: function (type, callback) {

        var list = this.callbacks[type];

        if (!list) {
            return;
        }

        var index = list.indexOf(callback);

        if (index !== -1) {
            list.splice(index, 1);
        }
    },

    /**
     * 取消所有注册
     *
     */
    removeAllCallbacks: function () {

        for (var type in this.callbacks) {

            var list = this.callbacks[type];

            for (var i = 0, length = list.length; i < length; i++) {
                list.splice(0, 1);
            }
        }

        for (var type in this.callbacks) {

            delete this.callbacks[type];
        }

        this.callbacks = {};
    },

    /**
     * 响应回调
     *
     */
    onCallbacks: function (type) {

        var list = this.callbacks[type];

        if (!list) {
            return;
        }

        for (var i = 0, length = list.length; i < length; i++) {
            list[i]();
        }
    },

    // ------ 注册自定义回调函数 E -------------- //

    // ------ 管理外部插件的render S -------------- //

    /**
     * 注册 render 回调函数
     *
     * @param {function()} callback - render 回调函数
     */
    addRenderCallback: function (callback) {
        this.addCallbacks("render", callback);
    },

    /**
     * 取消 render 回调注册
     *
     * @param {function()} callback - render 回调函数
     */
    removeRenderCallback: function (callback) {
        this.removeCallbacks("render", callback);
    },

    /**
     * 响应 render 回调
     *
     */
    onRenderCallback: function () {
        this.onCallbacks("render");
    },

    /**
     * 注册 render Finished
     *
     */
    addRenderFinishedCallback: function (callback) {
        this.addCallbacks("renderFinished", callback);
    },

    /**
     * 取消 render Finished 注册
     *
     * @param {function()} callback - render finished 回调函数
     */
    removeRenderFinishedCallback: function (callback) {
        this.removeCallbacks("renderFinished", callback);
    },

    /**
     * 响应 render Finished
     *
     */
    onRenderFinishedCallback: function () {
        this.onCallbacks("renderFinished");
    },

    // ------ 管理外部插件的render E -------------- //

    /**
     * 释放资源
     *
     */
    destroy: function () {

        this.removeAllCallbacks();
        this.editorManager.unregisterDomEventListeners(this.domElement);
        this.domElement.removeChild(this.domElement.childNodes[0]);
        this.domElement = null;

        for (var id in this.services) {
            var service = this.services[id];
            service.destroy();
        }

        this.services = {};
        this.editorManager.destroy();
        this.modelManager.destroy();

        if (this.renderer.destroy) {
            this.renderer.destroy();
        }

        this.renderer = null;
        this.modelManager = null;
        this.editorManager = null;
    },

    /**
     * 初始化
     *
     * @param {dom} domElement - dom容器
     */
    init: function (domElement) {

        console.log("Web3D: " + CLOUD.Version);

        var scope = this;
        this.domElement = domElement;
        var settings = {alpha: true, preserveDrawingBuffer: true, antialias: true};
        var incrementRenderEnabled = CLOUD.GlobalData.IncrementRender;

        //if (!CLOUD.GlobalData.disableAntialias)
        //    settings.antialias = true;

        var canvas;

        try {
            canvas = document.createElement('canvas');
            var webglContext = canvas.getContext('webgl', settings) || canvas.getContext('experimental-webgl', settings);

            if (!webglContext) {
                settings.antialias = false;
            }

        } catch (e) {
            return false;
        }

        CLOUD.GeomUtil.initializeUnitInstances();

        settings.canvas = canvas;

        if (incrementRenderEnabled) {
            this.renderer = new THREE.WebGLIncrementRenderer(settings);
            this.renderer.setRenderTicket(0);
        } else {
            this.renderer = new THREE.WebGLRenderer(settings);
        }

        this.renderer.domElement.addEventListener("webglcontextlost", function (event) {
            event.preventDefault();
            if (scope.incrementRenderHandle > 0) {
                cancelAnimationFrame(scope.incrementRenderHandle);
                console.log("---------------- webglcontextlost --------------");
            }
        }, false);

        // window.innerWidth, window.innerHeight
        var viewportWidth = domElement.offsetWidth;
        var viewportHeight = domElement.offsetHeight;

        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(viewportWidth, viewportHeight);

        // Added by xmh begin
        // 允许获得焦点，将键盘事件注册到父容器（之前注册到window上会存在各种联动问题），鼠标点击父容器，激活canvas
        this.renderer.domElement.setAttribute('tabindex', '0');
        this.renderer.domElement.setAttribute('id', 'cloud-main-canvas');
        // Added by xmh end
        this.domElement.appendChild(this.renderer.domElement);

        // Camera
        this.camera = new CLOUD.Camera(viewportWidth, viewportHeight, 45, 0.1, CLOUD.GlobalData.SceneSize * 20.0);
        var camera = this.camera;
        this.cameraEditor = new CLOUD.CameraEditor(this, camera, domElement, function () {
            scope.render();
        });

        this.setPickMode();

        // Register Events
        this.editorManager.registerDomEventListeners(this.domElement);

        this.modelManager.onUpdateViewer = function () {
            scope.render(true);
        };

        this.goToInitialView();

        //this.editorManager.registerDomEventListeners(canvas);
        return true;
    },

    /**
     *  刷新渲染模型
     *
     */
    render: function () {

        // console.time("viewer.render");
        var scope = this;
        var camera = this.camera;
        var modelManager = this.modelManager;
        var renderer = this.renderer;
        var scene = this.getScene();
        var incrementRenderEnabled = CLOUD.GlobalData.IncrementRender;

        // // 没有模型加载,返回
        // if (!this.isModelLoaded) {
        //
        //     if (modelManager.hasModel()) {
        //         this.isModelLoaded = true;
        //     } else {
        //         // CLOUD.Logger.log("model not loaded!");
        //         console.log("model not loaded!");
        //         return;
        //     }
        // }

        // 增量绘制
        if (incrementRenderEnabled && scope.renderer.IncrementRender) {

            ++this.countRenderRequest;

            if (this.countRenderRequest > this.maxCountRenderRequest)
                this.countRenderRequest = 0;

            if (this.rendering) {
                return;
            }

            this.rendering = true;

            // update camera's inner/outer status, both "calculateNearFar" and "prepareScene" will use this info.
            modelManager.calculateCameraModelRelation(camera.position);

            this.calculateNearFar();

            for (var sid in this.services) {
                var service = this.services[sid];
                service.update(camera);
            }

            scene.updateLights(camera);

            var isUpdateRenderList = this.editorManager.isUpdateRenderList;

            renderer.resetIncrementRender();// 重置增量绘制状态
            renderer.setObjectListUpdateState(isUpdateRenderList);// 设置更新状态
            renderer.setFilterObject(scene.filter);// 设置过滤对象

            function incrementRender(callId, autoClear) {

                var renderId = callId;

                return function () {

                    // var renderer = scope.renderer;
                    renderer.autoClear = autoClear;

                    if (scope.editorManager.cameraChange) {

                        renderer.resetIncrementRender();// 重置增量绘制状态
                        renderer.autoClear = true;
                        scope.editorManager.cameraChange = false;

                    } else {

                        renderer.autoClear = autoClear;

                    }

                    // var timeTag = "IncrementRender_";
                    // timeTag += renderId;
                    //
                    // console.time(timeTag);

                    var isFinished = renderer.IncrementRender(scene, camera);

                    // console.timeEnd(timeTag);

                    if (!isFinished && renderId === scope.countRenderRequest) {

                        scope.incrementRenderHandle = requestAnimationFrame(incrementRender(renderId, false));

                    } else {

                        scope.rendering = false;

                        // CLOUD.Logger.timeEnd("incrementRender");

                        if (renderId !== scope.countRenderRequest) {
                            scope.render();
                        } else {

                            // console.log("------------ finished rendering ------------");
                            // 结束后回调函数
                            scope.onRenderFinishedCallback();
                        }
                    }
                }
            }

            this.incrementRenderHandle = requestAnimationFrame(incrementRender(scope.countRenderRequest, true));

            if (isUpdateRenderList) {
                modelManager.prepareScene(camera);
            }

            this.onRenderCallback();

        } else { // 正常绘制

            this.calculateNearFar();
            scene.updateLights(camera);
            modelManager.prepareScene(camera);
            renderer.render(scene, camera);
            this.onRenderCallback();
            this.onRenderFinishedCallback();// 结束后回调函数

        }

        // console.timeEnd("viewer.render");
    },

    /**
     * 窗口大小变化回调事件
     *
     * @param {Float} width - 窗口宽
     * @param {Float} height - 窗口高
     */
    resize: function (width, height) {

        var camera = this.camera;
        camera.setSize(width, height);
        camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.editorManager.resize();
        this.onCallbacks("resize");
        this.render();
    },

    /**
     * 动态计算相机远近裁剪面
     *
     */
    calculateNearFar: function () {

        var scene = this.getScene();
        var boundingBox = scene.getBoundingBoxWorld();
        var camera = this.camera;

        // reducing z-fighting by dynamically adjust near/far
        if (boundingBox != null) {

            var box = this.tmpBox;
            box.copy(boundingBox);
            box.applyMatrix4(scene.getMatrixGlobal());

            var target = box.center();
            var position = camera.position;

            var newPos = position.clone().sub(target);
            var length = newPos.length();

            // camera.inside = scene.getBoundingBoxInnner().containsPoint(camera.position);

            if (this.modelManager.containsCamera || !this.enableCameraNearFar) {
                ////CLOUD.GlobalData.SceneSize * 20.0
                camera.setNearFar(0.1, 20000.0);
            } else {
                var delta = 0.001;
                var zNear = (length * length + length * delta) / ((1 << 24) * delta);
                ////CLOUD.GlobalData.SceneSize * 10.0

                camera.setNearFar(zNear, length + 10000.0);
            }
        }
    },

    /**
     *  注册Dom事件
     *
     */
    registerDomEventListeners: function () {
        if (this.domElement) {
            this.editorManager.registerDomEventListeners(this.domElement);
        }
    },

    /**
     *  取消Dom事件
     *
     */
    unregisterDomEventListeners: function () {
        if (this.domElement) {
            this.editorManager.unregisterDomEventListeners(this.domElement);
        }
    },

    /**
     *  注册模型事件监听器
     *
     */
    registerEventListener: function (type, callback) {
        this.modelManager.addEventListener(type, callback);
    },

    /**
     * 加载模型
     *
     * @param {String} databagId - 模型包名
     * @param {String} serverUrl - 服务器地址
     * @param {Boolean} notifyProgress - 是否通知加载进度，默认true
     * @param {Boolean} debug - 是否调试，可选
     */
    load: function (databagId, serverUrl, notifyProgress, debug) {

        notifyProgress = notifyProgress || true;

        return this.modelManager.load({
            databagId: databagId,
            serverUrl: serverUrl,
            notifyProgress: notifyProgress,
            debug: debug
        });
    },

    /**
     * 卸载模型
     *
     */
    unloadAll: function () {
        this.renderer.destroy();
        this.modelManager.destroy();
    },

    /**
     * 清除场景数据
     *
     */
    clearAll: function () {
        this.getScene().clearAll();
    },

    /**
     * 获得场景对象
     *
     */
    getScene: function () {
        return this.modelManager.scene;
    },

    /**
     * 获得过滤器对象
     *
     */
    getFilters: function () {
        return this.getScene().filter;
    },

    /**
     * show or hide scene by databag client.
     */
    showScene: function (client, bVisibles) {
        this.getScene().showSceneNodes(client, bVisibles);
    },

    /**
     * 设置缺省的Editor模式（orbit, pick, zoom, fly etc）
     *
     */
    setEditorDefault: function () {
        this.setPickMode();
    },

    /**
     * 设置单选模式 - Pick Editor
     *
     */
    setPickMode: function (orbitBySelection) {
        this.editorManager.setRectPickMode(this, orbitBySelection);
        //this.editorManager.setPickMode(this);
    },

    /**
     * 设置框选模式 - RectPick Editor
     *
     */
    setRectPickMode: function (orbitBySelection) {
        this.editorManager.setRectPickMode(this, orbitBySelection);
    },

    /**
     * 设置框选缩放模式 - RectZoom Editor
     *
     */
    setRectZoomMode: function () {
        this.editorManager.setRectZoomMode(this);
    },

    /**
     * 设置自由旋转模式 - Orbit Editor
     *
     */
    setOrbitMode: function () {
        this.editorManager.setOrbitMode(this);
    },

    /**
     * 设置缩放模式 - Zoom Editor
     *
     */
    setZoomMode: function () {
        this.editorManager.setZoomMode(this);
    },

    /**
     * 设置平移模式 - Pan Editor
     *
     */
    setPanMode: function () {
        this.editorManager.setPanMode(this);
    },

    /**
     * 设置飞行模式 - Fly Editor
     *
     */
    setFlyMode: function (bShowControlPanel) {
        this.editorManager.setFlyMode(bShowControlPanel, this);
    },

    /**
     * 设置切面模式 - ClipPlanes Editor
     *
     */
    setClipPlanesMode: function () {
        this.editorManager.setClipPlanesMode(this);
    },

    /**
     * 放大
     *
     * @param {Float} factor - 放大因子
     */
    zoomIn: function (factor) {
        this.editorManager.zoomIn(factor, this);
    },

    /**
     * 缩小
     *
     * @param {Float} factor - 缩小因子
     */
    zoomOut: function (factor) {
        this.editorManager.zoomOut(factor, this);
    },

    /**
     * 缩放到场景包围盒大小
     *
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomAll: function (margin, ratio) {
        var box = this.getScene().getBoundingBox();
        this.editorManager.zoomToBBox(this, box, margin, ratio);
    },

    /**
     * 缩放到场景内部包围盒大小
     *
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomToBuilding: function (margin, ratio) {
        var box = this.getScene().boundingBoxInner;

        if (box.empty()) {
            this.zoomAll();
        } else {
            this.editorManager.zoomToBBox(this, box, margin, ratio);
        }
    },

    /**
     * 缩放到选中构件包围盒大小
     *
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomToSelection: function (margin, ratio) {
        var box = this.renderer.computeSelectionBBox();

        if (box == null || box.empty()) {
            box = this.getScene().getBoundingBox();
        }

        this.editorManager.zoomToBBox(this, box, margin, ratio);
    },

    /**
     * 缩放到指定包围包围盒大小
     *
     * @param {THREE.Box3} box - 包围盒（世界坐标系）
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomToBBox: function (box, margin, ratio) {

        if (!box) {
            box = this.getScene().getBoundingBox();
        } else {
            box.applyMatrix4(this.getScene().getMatrixGlobal());
        }

        this.editorManager.zoomToBBox(this, box, margin, ratio);
    },

    /**
     * 根据观察方向缩放到指定包围盒范围
     *
     * @param {THREE.Box3} box - 包围盒（世界坐标系）
     * @param {THREE.Vector3} direction - 观察方向（从包围盒中心指向某个参考点）
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomToBBoxByDirection: function (box, direction, margin, ratio) {

        if (!direction) {
            this.zoomToBBox(box, margin, ratio);
            return;
        }

        if (direction && box) {
            var zoomBox = box.clone();
            var refPoint = zoomBox.center().clone().add(direction);

            zoomBox.applyMatrix4(this.getScene().getMatrixGlobal());
            refPoint.applyMatrix4(this.getScene().getMatrixGlobal());

            var newDirection = refPoint.clone().sub(zoomBox.center());

            if (newDirection.length() > 0.0001) {
                newDirection.normalize();
                viewer.camera.realUp.copy(THREE.Object3D.DefaultUp);// 先调整相机up方向,使得一直朝上
                this.editorManager.zoomToBBox(this, zoomBox, margin, ratio, newDirection);
            } else {
                this.editorManager.zoomToBBox(this, zoomBox, margin, ratio);
            }
        }

    },

    /**
     * 根据外围大包围盒和指定包围盒缩放到指定包围盒范围
     *
     * @param {THREE.Box3} box - 指定构件包围盒（世界坐标系）
     * @param {THREE.Box3} outerBox - 外围大包围盒
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    zoomToBBoxWithOuterBox: function (box, outerBox, margin, ratio) {

        if (!outerBox) {
            this.zoomToBBox(box, margin, ratio);
            return;
        }

        if (outerBox && box) {
            var zoomBox = box.clone();
            var refPoint = outerBox.center();

            zoomBox.applyMatrix4(this.getScene().getMatrixGlobal());
            refPoint.applyMatrix4(this.getScene().getMatrixGlobal());

            var newDirection = refPoint.clone().sub(zoomBox.center());

            if (newDirection.length() > 0.0001) {
                newDirection.normalize();
                this.camera.realUp.copy(THREE.Object3D.DefaultUp);// 先调整相机up方向,使得一直朝上
                this.editorManager.zoomToBBox(this, zoomBox, margin, ratio, newDirection);
            } else {
                this.editorManager.zoomToBBox(this, zoomBox, margin, ratio);
            }

        }
    },

    /**
     * 设置视角
     *
     * @param {EnumStandardView} stdView - 视角（CLOUD.EnumStandardView.ISO， CLOUD.EnumStandardView.Top etc）
     * @param {Float} margin - 包围盒缩放比例, 缺省值: -0.05
     * @param {Float} callback - 回调函数
     */
    setStandardView: function (stdView, margin, callback) {
        margin = margin || -0.05;
        this.editorManager.setStandardView(stdView, this, margin, callback);
    },

    /**
     * 根据指定视角及包围盒缩放
     *
     * @param {EnumStandardView} stdView - 视角（CLOUD.EnumStandardView.ISO， CLOUD.EnumStandardView.Top etc）
     * @param {THREE.Box3} box - 原始（未变换的）世界包围盒
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    setStandardViewWithBox: function (stdView, box, margin, ratio) {

        margin = margin || 0.05;
        ratio = ratio || 1.0;

        if (box) {
            box.applyMatrix4(this.getScene().getMatrixGlobal());
        } else {
            box = this.getScene().getBoundingBox();
        }

        this.editorManager.setStandardViewWithBox(this, stdView, box, margin, ratio);
    },

    /**
     * 根据 Top 视角及包围盒缩放(注意：这里名字有误导， 其实被设成了 ISO 视角)
     *
     * @param {THREE.Box3} box - 原始（未变换的）世界包围盒
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     * @param {Float} ratio - 相机与中心距离的拉伸比例, 缺省值: 1.0
     */
    setTopView: function (box, margin, ratio) {
        this.setStandardViewWithBox(CLOUD.EnumStandardView.ISO, box, margin, ratio);
    },

    /**
     * 设置初始视角
     *
     * @param {EnumStandardView} viewType - 视角（CLOUD.EnumStandardView.ISO， CLOUD.EnumStandardView.Top etc）
     */
    setInitialViewType: function (viewType) {
        this.initialView = viewType;
    },

    /**
     * 切换到初始视图
     *
     */
    goToInitialView: function () {

        var target;

        if (!this.initialView) {
            target = new THREE.Vector3(0, 0, 0);
            var position = new THREE.Vector3(-CLOUD.GlobalData.SceneSize * 0.5, CLOUD.GlobalData.SceneSize * 0.3, CLOUD.GlobalData.SceneSize);
            var up = new THREE.Vector3(0, 1, 0);
            var dir = new THREE.Vector3();
            dir.subVectors(target, position);
            this.camera.LookAt(target, dir, up);
        } else {
            target = this.camera.setStandardView(this.initialView);
        }

        this.cameraEditor.updateCamera(target);
        this.render();
    },

    /**
     * 设置 home 视图类型
     *
     * @param {EnumStandardView} viewType - 视角（CLOUD.EnumStandardView.ISO， CLOUD.EnumStandardView.Top etc）
     */
    setHomeViewType: function (viewType) {
        this.currentHomeView = viewType;
    },

    /**
     * 切换到 home 视图
     *
     * @param {Float} margin - 包围盒缩放比例, 缺省值: 0.05
     */
    goToHomeView: function (margin) {
        this.setStandardView(this.currentHomeView, margin);
    },

    /**
     * 设置相机观察点
     *
     * @param {THREE.Vector3} position - 相机位置
     * @param {THREE.Vector3} target - 相机观察目标位置
     * @param {THREE.Vector3} up - 相机向上位置
     */
    lookAt: function (position, target, up) {
        var dir = new THREE.Vector3();
        dir.subVectors(target, position);

        this.camera.LookAt(target, dir, up);
        this.cameraEditor.updateCamera(target);
        this.render();
    },

    /**
     * 设置图片资源的路径。默认在“images/”
     *
     * @param {String} path - 资源路径
     */
    setImageResPath: function (path) {
        CLOUD.GlobalData.TextureResRoot = path;
    },

    /**
     * 设置每帧的最大耗时
     *
     * @param {Float} limitTime - 最长时间
     */
    setLimitFrameTime: function (limitTime) {
        if (CLOUD.GlobalData.IncrementRender) {

            if (limitTime <= 0) {
                limitTime = 30;
            }

            CLOUD.GlobalData.LimitFrameTime = limitTime;
        }
    },

    /**
     * 限制帧率
     *
     * @param {Float} frameRate - 最大帧率
     */
    limitFrameRate: function (frameRate) {

        if (CLOUD.GlobalData.IncrementRender) {

            if (frameRate <= 0) {
                frameRate = 4;
            }

            CLOUD.GlobalData.LimitFrameTime = 1000 / frameRate;
        }
    },

    /**
     * 相机变换
     *
     * @param {Object} camera - 相机状态JSON对象
     *                          （{"position":"26513.603437903, -14576.4810728955, 15107.6582255056",
     *                          "direction":"-220.050259546712, 169.277369901229, -125.801809656091",
     *                          "up":"0, 0, 304.8"})
     * @return {Object} 新相机信息
     */
    transformCamera: function (camera) {
        return CLOUD.CameraUtil.transformCamera(camera, this.modelManager.scene);
    },

    /**
     * 获得相机状态
     *
     * @return {Object} 相机信息
     */
    getCamera: function () {
        return this.cameraEditor.getCameraInfo();
    },

    /**
     * 设置相机状态
     *
     * @param {Object} jsonStr - 相机信息JSON对象
     */
    setCamera: function (jsonStr) {
        var camInfo = CLOUD.CameraUtil.parseCameraInfo(jsonStr);
        this.lookAt(camInfo.position, camInfo.target, camInfo.up);
    },

    /**
     * 获得render buffer base64图形数据
     *
     * @param {Color} backgroundClr - 背景颜色
     * @param {Function} callback - 回调函数（参数为截取的 base64 图形数据）
     * @return {String} 如果存在回调函数，则返回 null， 否则 返回 base64 图形数据
     */
    getRenderBufferScreenShot: function (backgroundClr, callback) {

        // 在高分屏上toDataURL直接获得图片数据比实际的图片大
        var domElement = this.renderer.domElement;
        var dataUrl = domElement.toDataURL("image/png");
        var canvasWidth = domElement.width;
        var canvasHeight = domElement.height;
        var pixelRatio = window.devicePixelRatio || 1;
        var w = canvasWidth / pixelRatio;
        var h = canvasHeight / pixelRatio;

        if (!w || !h) {

            if (callback) {
                callback(dataUrl);
                return null
            } else {
                return dataUrl;
            }
        }

        var nw, nh, nx = 0,
            ny = 0;

        if (w > h || (canvasWidth / canvasHeight < w / h)) {
            nw = w;
            nh = canvasHeight / canvasWidth * w;
            ny = h / 2 - nh / 2;
        } else {
            nh = h;
            nw = canvasWidth / canvasHeight * h;
            nx = w / 2 - nw / 2;
        }

        if (callback) {

            var newImage = new Image();
            newImage.onload = function () {

                var tmpCanvas = document.createElement("canvas");
                var ctx = tmpCanvas.getContext("2d");
                tmpCanvas.width = w;
                tmpCanvas.height = h;

                if (backgroundClr) {
                    ctx.fillStyle = backgroundClr;
                    ctx.fillRect(0, 0, w, h);
                }

                ctx.drawImage(newImage, nx, ny, nw, nh);

                var newURL = tmpCanvas.toDataURL("image/png");

                callback(newURL);
            };

            newImage.src = dataUrl;

            return null;
        }

        var newImage = new Image();

        newImage.src = dataUrl;

        var tmpCanvas = document.createElement("canvas");
        var ctx = tmpCanvas.getContext("2d");
        tmpCanvas.width = w;
        tmpCanvas.height = h;

        if (backgroundClr) {
            ctx.fillStyle = backgroundClr;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(newImage, nx, ny, nw, nh);

        var newURL = tmpCanvas.toDataURL("image/png");

        return newURL;
    },

    screenShot: function (width, height, callback) {
        var scope = this;

        function getRenderBufferScreenShot(width, height, callback) {
            var domElement = scope.renderer.domElement;
            var dataUrl = domElement.toDataURL("image/png");
            var canvasWidth = domElement.width;
            var canvasHeight = domElement.height;
            var pixelRatio = window.devicePixelRatio || 1;
            var w = width;
            var h = height;

            if (!w || !h) {
                if (callback) {
                    callback(dataUrl);
                    return null
                } else {
                    return dataUrl;
                }
            }

            var nw, nh, nx = 0,
                ny = 0;

            if (w > h || (canvasWidth / canvasHeight < w / h)) {
                nw = w;
                nh = canvasHeight / canvasWidth * w;
                ny = h / 2 - nh / 2;
            } else {
                nh = h;
                nw = canvasWidth / canvasHeight * h;
                nx = w / 2 - nw / 2;
            }

            if (callback) {

                var newImage = new Image();
                newImage.onload = function () {

                    var tmpCanvas = document.createElement("canvas");
                    var ctx = tmpCanvas.getContext("2d");
                    tmpCanvas.width = w;
                    tmpCanvas.height = h;
                    ctx.drawImage(newImage, nx, ny, nw, nh);

                    var newURL = tmpCanvas.toDataURL("image/png");
                    callback(newURL);
                };

                newImage.src = dataUrl;

                return null;
            }
        }

        var dataUrl = getRenderBufferScreenShot(width, height, callback);

        this.render();

        return dataUrl;
    },

    /**
     * 获得render buffer base64 图形数据
     *
     * @param {Color} backgroundClr - 背景颜色
     * @return {String} base64 图形数据
     */
    canvas2image: function (backgroundClr) {

        var dataUrl = this.getRenderBufferScreenShot(backgroundClr);
        // 在chrome中多调用几次，会出现图片显示不正常（显示空白，原因是转换的值变得不正常了），
        // 每次获得截图后，缓存数据貌似被清除了
        // 所以在每次调用后render一次
        this.render();

        return dataUrl;
    },

    /**
     * 是否锁定Z轴
     *
     * @param {Boolean} isLock - true 锁定， 否则 解锁
     */
    lockAxisZ: function (isLock) {

        if (this.cameraEditor) {
            this.cameraEditor.lockAxisZ(isLock);
        }
    },

    /**
     * 允许双击半透明
     *
     * @param {Boolean} enable - true 允许
     */
    enableTranslucentByDClick: function (enable) {
        CLOUD.GlobalData.EnableDemolishByDClick = enable;
    },

    /**
     * 是否禁止旋转
     *
     * @param {Boolean} enable - true 禁止
     */
    disableRotate: function (disable) {

        if (this.cameraEditor) {
            this.cameraEditor.disableRotate(disable);
        }
    },

    /**
     * 计算切面
     *
     */
    calculationPlanes: function () {

        if (this.isRecalculationPlanes) {
            this.isRecalculationPlanes = false;
            var scene = this.getScene();
            var box = this.renderer.computeRenderObjectsBox();
            scene.getClipPlanes().calculationPlanes(box.size(), box.center());
            this.render();
        }
    },

    /**
     * 重置切面状态
     *
     */
    recalculationPlanes: function () {
        this.isRecalculationPlanes = true;
    },

    /**
     * 设置octree 深度
     *
     * @param {number} depth - 深度
     */
    setOctantDepth: function (depth) {
        CLOUD.GlobalData.OctantDepth = depth;
    },

    /**
     * 重置对象池大小
     *
     * @param {number} size - 对象池对象数
     */
    resizePool: function (size) {
        CLOUD.GlobalData.maxObjectNumInPool = size;
        this.getScene().resizePool();
    },

    /**
     * 设置高优先级
     *
     * @param {array} categories - 高优先级category
     * @param {number} region - 内外部（0：内部，1：外部）
     */
    setCategoriesToHighPriority: function (categories, region) {
        var side = (region == 0) ? "inner": "outer";
        this.modelManager.setCategoriesToHighPriority(categories, side);
    },

    /**
     * 清除内部或者外部 category 高优先级
     *
     * @param {number} region - 内外部（0：内部，1：外部）
     */
    clearCategoriesFromHighPriority: function (region) {
        var side = (region == 0) ? "inner": "outer";
        this.modelManager.clearCategoriesFromHighPriority(side);
    },

    /**
     * 清除内外部 category 高优先级
     *
     */
    clearAllCategoriesFromHighPriority: function () {
        this.modelManager.clearAllCategoriesFromHighPriority();
    },

    /**
     * 按条件隔离构件
     *
     * @param {array} conditions    - 多个条件对象数组，单个数组取交集，多个数组取并集
     *                                  [{"categoryId":-2001340},{"specialty":"AR"},{"categoryId":-2321500,"levelName":"F03"}]
     * @param {string} state        - 隔离的方式 "hide"：其他隐藏，"translucent"：其他半透明
     */
    isolate:function (conditions, state) {

        var filter = this.getFilters();

        if (state === "hide") {

            filter.setVisibleConditions(conditions);

        } else if (state === "translucent") {

            filter.setIsolateCondition(conditions);

        }

    }

};