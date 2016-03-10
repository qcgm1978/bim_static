 /**
 * @require /libs/tree/js/libs/three.min.js
 */
var CLOUD = CLOUD || {};
CLOUD.Version = "v3.a";

CLOUD.GlobalData = {
    SceneSize: 10,
    SceneScale: 2,
    MaxTriangle: 40000000,
    MaxVertex: 35000000,
    UseArrayBuffer: true,
    TextureResRoot: 'images/',
    ShowSubSceneBox: false,
    ShowCellBox: false,
    DynamicRelease: false,
    SubSceneVisibleDistance: 100,
    CellVisibleDistance: 2500,
};

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

CLOUD.SCENETYPE = {
    Default: 0,
    Aux: 1,
    Child: 2,
    Link: 3
};

CLOUD.MPKSTATUS = {
    UNKONW: 0,
    LOADING: 1,
    LOADED: 2
};

CLOUD.EVENTS = {
    ON_LOAD_START: 0,
    ON_LOAD_PROGRESS: 1,
    ON_LOAD_COMPLETE: 2,

    ON_LOAD_SUBSCENE: 10,

    ON_SELECTION_CHANGED: 100
};

CLOUD.Utils = {
    box3FromArray : function (arr) {
        if (arr instanceof Array) {
            var bbox = new THREE.Box3();
            bbox.min.fromArray(arr, 0);
            bbox.max.fromArray(arr, 3);
            return bbox;
        }
        return null;
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
            node.matrixAutoUpdate = false;
        }

        if (objJson.matrix) {
            node.matrix.fromArray(objJson.matrix);
            node.matrixAutoUpdate = false;
        }

        if (trf) {
            var localTrf = node.matrix.clone();
            localTrf.multiplyMatrices(trf, node.matrix);
            node.matrix = localTrf;
            node.matrixAutoUpdate = false;
        }

        node.boundingBox = CLOUD.Utils.box3FromArray(objJson.bbox);
    },

    parseRootNode: function (scene, data) {
        if(!(scene instanceof CLOUD.Scene)) {
            return scene;
        }

        var rootNode = scene.rootNode;

        //bounding box
        var boundingBox = CLOUD.Utils.box3FromArray(data.metadata.bbox);

        if (rootNode.boundingBox === null) {
            rootNode.boundingBox = boundingBox;

            if (data.transform) {
                var position = data.transform.position,
                    rotation = data.transform.rotation,
                    scale = data.transform.scale;

                if (position) {
                    rootNode.position.fromArray(position);
                }

                if (rotation) {
                    rootNode.rotation.fromArray(rotation);
                }

                if (scale) {
                    rootNode.scale.fromArray(scale);
                    rootNode.scale.multiplyScalar(CLOUD.GlobalData.SceneScale);
                }
                rootNode.updateMatrix();
            }
        }
        else {
            rootNode.boundingBox.expandByPoint(boundingBox.min);
            rootNode.boundingBox.expandByPoint(boundingBox.max);
        }

        var localRoot = new CLOUD.Group();
        localRoot.boundingBox = boundingBox;
        rootNode.add(localRoot);

        return localRoot;
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

            offsetObj = {
                size: [domElement.offsetWidth, domElement.offsetHeight],
                // domElement.offsetLeft（offsetTop）是相对父容器的偏移量，如果用相对坐标表示，直接传回0
                //offset	: [ domElement.offsetLeft,  domElement.offsetTop ]
                offset: [offsetV.left, offsetV.top]
            }

        } else {
            offsetObj = {
                size: [window.innerWidth, window.innerHeight],
                offset: [0, 0]
            };
        }

        return offsetObj;
    },

    /**
     * set css class name
     * @param {String} id
     * @param {String} cssName
     * @returns
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
     * @returns
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
     * @returns
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
     * @returns
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

        object.name = nodeId;

        if (objJSON.userId)
            object.userId = objJSON.userId;

        CLOUD.Utils.parseTransform(object, objJSON, trf);
    },

    parseSceneNode: function(object, objJSON, modelManager, level) {

        object.sceneId = objJSON.sceneId;

        // set world bbox
        object.worldBoundingBox = object.boundingBox.clone();
        object.worldBoundingBox.applyMatrix4(modelManager.getGlobalTransform());
        object.level = objJSON.level;

        modelManager.listenSubScene(object);

        if (CLOUD.GlobalData.ShowSubSceneBox)
        {
            var clr = 0xff;
            clr = clr << (level * 5);

            var boxNode = new CLOUD.BBoxNode(object.boundingBox, clr);
            CLOUD.Utils.parseTransform(boxNode, objJSON);
            object.add(boxNode);
        }
    },

    parseCylinderNode: function (geometryNode, params) {
        if (params instanceof Object) {

        }
        else {
            var reg = new RegExp("'", "g");
            params = params.replace(reg, '"');
            params = JSON.parse(params);
        }

        var startPt = new THREE.Vector3();
        startPt.fromArray(params.startPt);
        var endPt = new THREE.Vector3();
        endPt.fromArray(params.endPt);

        var dir = new THREE.Vector3();
        dir.subVectors(endPt, startPt);

        var len = dir.length();
        dir.normalize();

        var radius = params.radius;
        if(radius <= 0)
            radius = 1000;
        geometryNode.scale.set(radius, len, radius);
        geometryNode.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        geometryNode.position.copy(startPt).addScaledVector(dir, len * 0.5);
        geometryNode.updateMatrix();
        //geometryNode.boundingBox =
        if (!geometryNode.geometry.boundingBox)
            geometryNode.geometry.computeBoundingBox();
    },

    parseBoxNode: function (object, objJSON) {

        CLOUD.Utils.parseTransform(object, objJSON);

        var boundingBox = CLOUD.Utils.box3FromArray(objJSON.bbox);
        var boxSize = boundingBox.size();
        var center = boundingBox.center();

        var trf = new THREE.Matrix4();
        trf.scale(boxSize);
        trf.setPosition(center);

        object.matrix.multiply(trf);
        object.matrixAutoUpdate = false;
    },

    parsePGeomNodeInstance: function (objJSON, matObj, trf) {

        var object;

        if (objJSON.geomType == "pipe") {

            var geometry = CLOUD.GeomUtil.UnitCylinderInstance;
            object = new CLOUD.Mesh(geometry, matObj);
            CLOUD.GeomUtil.parseCylinderNode(object, objJSON.params);

        }
        else if (objJSON.geomType == "box") {

            var geometry = CLOUD.GeomUtil.UnitBoxInstance;
            object = new CLOUD.Mesh(geometry, matObj);

            CLOUD.GeomUtil.parseBoxNode(object, objJSON);

        }
        else {
            console.log("unknonw geometry!");
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
    UnitCylinderInstance: new THREE.CylinderGeometry(1, 1, 1),
    UnitBoxInstance : new THREE.BoxGeometry(1, 1, 1)
};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author alteredq / http://alteredqualia.com/
 *
 * For Text operations in three.js (See TextGeometry)
 *
 * It uses techniques used in:
 *
 *	Triangulation ported from AS3
 *		Simple Polygon Triangulation
 *		http://actionsnippet.com/?p=1462
 *
 * 	A Method to triangulate shapes with holes
 *		http://www.sakri.net/blog/2009/06/12/an-approach-to-triangulating-polygons-with-holes/
 *
 */

THREE.FontUtils = {

	faces: {},

	// Just for now. face[weight][style]

	face: 'helvetiker',
	weight: 'normal',
	style: 'normal',
	size: 150,
	divisions: 10,

	getFace: function () {

		try {

			return this.faces[ this.face.toLowerCase() ][ this.weight ][ this.style ];

		} catch ( e ) {

			throw "The font " + this.face + " with " + this.weight + " weight and " + this.style + " style is missing."

		}

	},

	loadFace: function ( data ) {

		var family = data.familyName.toLowerCase();

		var ThreeFont = this;

		ThreeFont.faces[ family ] = ThreeFont.faces[ family ] || {};

		ThreeFont.faces[ family ][ data.cssFontWeight ] = ThreeFont.faces[ family ][ data.cssFontWeight ] || {};
		ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		return data;

	},

	drawText: function ( text ) {

		// RenderText

		var i,
			face = this.getFace(),
			scale = this.size / face.resolution,
			offset = 0,
			chars = String( text ).split( '' ),
			length = chars.length;

		var fontPaths = [];

		for ( i = 0; i < length; i ++ ) {

			var path = new THREE.Path();

			var ret = this.extractGlyphPoints( chars[ i ], face, scale, offset, path );
			offset += ret.offset;

			fontPaths.push( ret.path );

		}

		// get the width

		var width = offset / 2;
		//
		// for ( p = 0; p < allPts.length; p++ ) {
		//
		// 	allPts[ p ].x -= width;
		//
		// }

		//var extract = this.extractPoints( allPts, characterPts );
		//extract.contour = allPts;

		//extract.paths = fontPaths;
		//extract.offset = width;

		return { paths: fontPaths, offset: width };

	},




	extractGlyphPoints: function ( c, face, scale, offset, path ) {

		var pts = [];

		var b2 = THREE.ShapeUtils.b2;
		var b3 = THREE.ShapeUtils.b3;

		var i, i2, divisions,
			outline, action, length,
			scaleX, scaleY,
			x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2,
			laste,
			glyph = face.glyphs[ c ] || face.glyphs[ '?' ];

		if ( ! glyph ) return;

		if ( glyph.o ) {

			outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );
			length = outline.length;

			scaleX = scale;
			scaleY = scale;

			for ( i = 0; i < length; ) {

				action = outline[ i ++ ];

				//console.log( action );

				switch ( action ) {

				case 'm':

					// Move To

					x = outline[ i ++ ] * scaleX + offset;
					y = outline[ i ++ ] * scaleY;

					path.moveTo( x, y );
					break;

				case 'l':

					// Line To

					x = outline[ i ++ ] * scaleX + offset;
					y = outline[ i ++ ] * scaleY;
					path.lineTo( x, y );
					break;

				case 'q':

					// QuadraticCurveTo

					cpx  = outline[ i ++ ] * scaleX + offset;
					cpy  = outline[ i ++ ] * scaleY;
					cpx1 = outline[ i ++ ] * scaleX + offset;
					cpy1 = outline[ i ++ ] * scaleY;

					path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

							var t = i2 / divisions;
							b2( t, cpx0, cpx1, cpx );
							b2( t, cpy0, cpy1, cpy );

						}

					}

					break;

				case 'b':

					// Cubic Bezier Curve

					cpx  = outline[ i ++ ] * scaleX + offset;
					cpy  = outline[ i ++ ] * scaleY;
					cpx1 = outline[ i ++ ] * scaleX + offset;
					cpy1 = outline[ i ++ ] * scaleY;
					cpx2 = outline[ i ++ ] * scaleX + offset;
					cpy2 = outline[ i ++ ] * scaleY;

					path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

							var t = i2 / divisions;
							b3( t, cpx0, cpx1, cpx2, cpx );
							b3( t, cpy0, cpy1, cpy2, cpy );

						}

					}

					break;

				}

			}

		}



		return { offset: glyph.ha * scale, path: path };

	}

};


THREE.FontUtils.generateShapes = function ( text, parameters ) {

	// Parameters

	parameters = parameters || {};

	var size = parameters.size !== undefined ? parameters.size : 100;
	var curveSegments = parameters.curveSegments !== undefined ? parameters.curveSegments : 4;

	var font = parameters.font !== undefined ? parameters.font : 'helvetiker';
	var weight = parameters.weight !== undefined ? parameters.weight : 'normal';
	var style = parameters.style !== undefined ? parameters.style : 'normal';

	THREE.FontUtils.size = size;
	THREE.FontUtils.divisions = curveSegments;

	THREE.FontUtils.face = font;
	THREE.FontUtils.weight = weight;
	THREE.FontUtils.style = style;

	// Get a Font data json object

	var data = THREE.FontUtils.drawText( text );

	var paths = data.paths;
	var shapes = [];

	for ( var p = 0, pl = paths.length; p < pl; p ++ ) {

		Array.prototype.push.apply( shapes, paths[ p ].toShapes() );

	}

	return shapes;

};

// To use the typeface.js face files, hook up the API

THREE.typeface_js = { faces: THREE.FontUtils.faces, loadFace: THREE.FontUtils.loadFace };
if ( typeof self !== 'undefined' ) self._typeface_js = THREE.typeface_js;

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author alteredq / http://alteredqualia.com/
 *
 * For creating 3D text geometry in three.js
 *
 * Text = 3D Text
 *
 * parameters = {
 *  size: 			<float>, 	// size of the text
 *  height: 		<float>, 	// thickness to extrude text
 *  curveSegments: 	<int>,		// number of points on the curves
 *
 *  font: 			<string>,		// font name
 *  weight: 		<string>,		// font weight (normal, bold)
 *  style: 			<string>,		// font style  (normal, italics)
 *
 *  bevelEnabled:	<bool>,			// turn on bevel
 *  bevelThickness: <float>, 		// how deep into text bevel goes
 *  bevelSize:		<float>, 		// how far from text outline is bevel
 *  }
 *
 */

/*	Usage Examples

	// TextGeometry wrapper

	var text3d = new TextGeometry( text, options );

	// Complete manner

	var textShapes = THREE.FontUtils.generateShapes( text, options );
	var text3d = new ExtrudeGeometry( textShapes, options );

*/


THREE.TextGeometry = function ( text, parameters ) {

	parameters = parameters || {};

	var textShapes = THREE.FontUtils.generateShapes( text, parameters );

	// translate parameters to ExtrudeGeometry API

	parameters.amount = parameters.height !== undefined ? parameters.height : 50;

	// defaults

	if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
	if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
	if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

	THREE.ExtrudeGeometry.call( this, textShapes, parameters );

	this.type = 'TextGeometry';

};

THREE.TextGeometry.prototype = Object.create( THREE.ExtrudeGeometry.prototype );
THREE.TextGeometry.prototype.constructor = THREE.TextGeometry;

if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace({"glyphs":{"ο":{"x_min":0,"x_max":712,"ha":815,"o":"m 356 -25 q 96 88 192 -25 q 0 368 0 201 q 92 642 0 533 q 356 761 192 761 q 617 644 517 761 q 712 368 712 533 q 619 91 712 201 q 356 -25 520 -25 m 356 85 q 527 175 465 85 q 583 369 583 255 q 528 562 583 484 q 356 651 466 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 356 85 250 85 "},"S":{"x_min":0,"x_max":788,"ha":890,"o":"m 788 291 q 662 54 788 144 q 397 -26 550 -26 q 116 68 226 -26 q 0 337 0 168 l 131 337 q 200 152 131 220 q 384 85 269 85 q 557 129 479 85 q 650 270 650 183 q 490 429 650 379 q 194 513 341 470 q 33 739 33 584 q 142 964 33 881 q 388 1041 242 1041 q 644 957 543 1041 q 756 716 756 867 l 625 716 q 561 874 625 816 q 395 933 497 933 q 243 891 309 933 q 164 759 164 841 q 325 609 164 656 q 625 526 475 568 q 788 291 788 454 "},"¦":{"x_min":343,"x_max":449,"ha":792,"o":"m 449 462 l 343 462 l 343 986 l 449 986 l 449 462 m 449 -242 l 343 -242 l 343 280 l 449 280 l 449 -242 "},"/":{"x_min":183.25,"x_max":608.328125,"ha":792,"o":"m 608 1041 l 266 -129 l 183 -129 l 520 1041 l 608 1041 "},"Τ":{"x_min":-0.4375,"x_max":777.453125,"ha":839,"o":"m 777 893 l 458 893 l 458 0 l 319 0 l 319 892 l 0 892 l 0 1013 l 777 1013 l 777 893 "},"y":{"x_min":0,"x_max":684.78125,"ha":771,"o":"m 684 738 l 388 -83 q 311 -216 356 -167 q 173 -279 252 -279 q 97 -266 133 -279 l 97 -149 q 132 -155 109 -151 q 168 -160 155 -160 q 240 -114 213 -160 q 274 -26 248 -98 l 0 738 l 137 737 l 341 139 l 548 737 l 684 738 "},"Π":{"x_min":0,"x_max":803,"ha":917,"o":"m 803 0 l 667 0 l 667 886 l 140 886 l 140 0 l 0 0 l 0 1012 l 803 1012 l 803 0 "},"ΐ":{"x_min":-111,"x_max":339,"ha":361,"o":"m 339 800 l 229 800 l 229 925 l 339 925 l 339 800 m -1 800 l -111 800 l -111 925 l -1 925 l -1 800 m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 737 l 167 737 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 103 239 101 q 284 112 257 104 l 284 3 m 302 1040 l 113 819 l 30 819 l 165 1040 l 302 1040 "},"g":{"x_min":0,"x_max":686,"ha":838,"o":"m 686 34 q 586 -213 686 -121 q 331 -306 487 -306 q 131 -252 216 -306 q 31 -84 31 -190 l 155 -84 q 228 -174 166 -138 q 345 -207 284 -207 q 514 -109 454 -207 q 564 89 564 -27 q 461 6 521 36 q 335 -23 401 -23 q 88 100 184 -23 q 0 370 0 215 q 87 634 0 522 q 330 758 183 758 q 457 728 398 758 q 564 644 515 699 l 564 737 l 686 737 l 686 34 m 582 367 q 529 560 582 481 q 358 652 468 652 q 189 561 250 652 q 135 369 135 482 q 189 176 135 255 q 361 85 251 85 q 529 176 468 85 q 582 367 582 255 "},"²":{"x_min":0,"x_max":442,"ha":539,"o":"m 442 383 l 0 383 q 91 566 0 492 q 260 668 176 617 q 354 798 354 727 q 315 875 354 845 q 227 905 277 905 q 136 869 173 905 q 99 761 99 833 l 14 761 q 82 922 14 864 q 232 974 141 974 q 379 926 316 974 q 442 797 442 878 q 351 635 442 704 q 183 539 321 611 q 92 455 92 491 l 442 455 l 442 383 "},"–":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 334 l 0 334 l 0 410 l 705 410 l 705 334 "},"Κ":{"x_min":0,"x_max":819.5625,"ha":893,"o":"m 819 0 l 650 0 l 294 509 l 139 356 l 139 0 l 0 0 l 0 1013 l 139 1013 l 139 526 l 626 1013 l 809 1013 l 395 600 l 819 0 "},"ƒ":{"x_min":-46.265625,"x_max":392,"ha":513,"o":"m 392 651 l 259 651 l 79 -279 l -46 -278 l 134 651 l 14 651 l 14 751 l 135 751 q 151 948 135 900 q 304 1041 185 1041 q 334 1040 319 1041 q 392 1034 348 1039 l 392 922 q 337 931 360 931 q 271 883 287 931 q 260 793 260 853 l 260 751 l 392 751 l 392 651 "},"e":{"x_min":0,"x_max":714,"ha":813,"o":"m 714 326 l 140 326 q 200 157 140 227 q 359 87 260 87 q 488 130 431 87 q 561 245 545 174 l 697 245 q 577 48 670 123 q 358 -26 484 -26 q 97 85 195 -26 q 0 363 0 197 q 94 642 0 529 q 358 765 195 765 q 626 627 529 765 q 714 326 714 503 m 576 429 q 507 583 564 522 q 355 650 445 650 q 206 583 266 650 q 140 429 152 522 l 576 429 "},"ό":{"x_min":0,"x_max":712,"ha":815,"o":"m 356 -25 q 94 91 194 -25 q 0 368 0 202 q 92 642 0 533 q 356 761 192 761 q 617 644 517 761 q 712 368 712 533 q 619 91 712 201 q 356 -25 520 -25 m 356 85 q 527 175 465 85 q 583 369 583 255 q 528 562 583 484 q 356 651 466 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 356 85 250 85 m 576 1040 l 387 819 l 303 819 l 438 1040 l 576 1040 "},"J":{"x_min":0,"x_max":588,"ha":699,"o":"m 588 279 q 287 -26 588 -26 q 58 73 126 -26 q 0 327 0 158 l 133 327 q 160 172 133 227 q 288 96 198 96 q 426 171 391 96 q 449 336 449 219 l 449 1013 l 588 1013 l 588 279 "},"»":{"x_min":-1,"x_max":503,"ha":601,"o":"m 503 302 l 280 136 l 281 256 l 429 373 l 281 486 l 280 608 l 503 440 l 503 302 m 221 302 l 0 136 l 0 255 l 145 372 l 0 486 l -1 608 l 221 440 l 221 302 "},"©":{"x_min":-3,"x_max":1008,"ha":1106,"o":"m 502 -7 q 123 151 263 -7 q -3 501 -3 294 q 123 851 -3 706 q 502 1011 263 1011 q 881 851 739 1011 q 1008 501 1008 708 q 883 151 1008 292 q 502 -7 744 -7 m 502 60 q 830 197 709 60 q 940 501 940 322 q 831 805 940 681 q 502 944 709 944 q 174 805 296 944 q 65 501 65 680 q 173 197 65 320 q 502 60 294 60 m 741 394 q 661 246 731 302 q 496 190 591 190 q 294 285 369 190 q 228 497 228 370 q 295 714 228 625 q 499 813 370 813 q 656 762 588 813 q 733 625 724 711 l 634 625 q 589 704 629 673 q 498 735 550 735 q 377 666 421 735 q 334 504 334 597 q 374 340 334 408 q 490 272 415 272 q 589 304 549 272 q 638 394 628 337 l 741 394 "},"ώ":{"x_min":0,"x_max":922,"ha":1030,"o":"m 687 1040 l 498 819 l 415 819 l 549 1040 l 687 1040 m 922 339 q 856 97 922 203 q 650 -26 780 -26 q 538 9 587 -26 q 461 103 489 44 q 387 12 436 46 q 277 -22 339 -22 q 69 97 147 -22 q 0 338 0 202 q 45 551 0 444 q 161 737 84 643 l 302 737 q 175 552 219 647 q 124 336 124 446 q 155 179 124 248 q 275 88 197 88 q 375 163 341 88 q 400 294 400 219 l 400 572 l 524 572 l 524 294 q 561 135 524 192 q 643 88 591 88 q 762 182 719 88 q 797 341 797 257 q 745 555 797 450 q 619 737 705 637 l 760 737 q 874 551 835 640 q 922 339 922 444 "},"^":{"x_min":193.0625,"x_max":598.609375,"ha":792,"o":"m 598 772 l 515 772 l 395 931 l 277 772 l 193 772 l 326 1013 l 462 1013 l 598 772 "},"«":{"x_min":0,"x_max":507.203125,"ha":604,"o":"m 506 136 l 284 302 l 284 440 l 506 608 l 507 485 l 360 371 l 506 255 l 506 136 m 222 136 l 0 302 l 0 440 l 222 608 l 221 486 l 73 373 l 222 256 l 222 136 "},"D":{"x_min":0,"x_max":828,"ha":935,"o":"m 389 1013 q 714 867 593 1013 q 828 521 828 729 q 712 161 828 309 q 382 0 587 0 l 0 0 l 0 1013 l 389 1013 m 376 124 q 607 247 523 124 q 681 510 681 355 q 607 771 681 662 q 376 896 522 896 l 139 896 l 139 124 l 376 124 "},"∙":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 "},"ÿ":{"x_min":0,"x_max":47,"ha":125,"o":"m 47 3 q 37 -7 47 -7 q 28 0 30 -7 q 39 -4 32 -4 q 45 3 45 -1 l 37 0 q 28 9 28 0 q 39 19 28 19 l 47 16 l 47 19 l 47 3 m 37 1 q 44 8 44 1 q 37 16 44 16 q 30 8 30 16 q 37 1 30 1 m 26 1 l 23 22 l 14 0 l 3 22 l 3 3 l 0 25 l 13 1 l 22 25 l 26 1 "},"w":{"x_min":0,"x_max":1009.71875,"ha":1100,"o":"m 1009 738 l 783 0 l 658 0 l 501 567 l 345 0 l 222 0 l 0 738 l 130 738 l 284 174 l 432 737 l 576 738 l 721 173 l 881 737 l 1009 738 "},"$":{"x_min":0,"x_max":700,"ha":793,"o":"m 664 717 l 542 717 q 490 825 531 785 q 381 872 450 865 l 381 551 q 620 446 540 522 q 700 241 700 370 q 618 45 700 116 q 381 -25 536 -25 l 381 -152 l 307 -152 l 307 -25 q 81 62 162 -25 q 0 297 0 149 l 124 297 q 169 146 124 204 q 307 81 215 89 l 307 441 q 80 536 148 469 q 13 725 13 603 q 96 910 13 839 q 307 982 180 982 l 307 1077 l 381 1077 l 381 982 q 574 917 494 982 q 664 717 664 845 m 307 565 l 307 872 q 187 831 233 872 q 142 724 142 791 q 180 618 142 656 q 307 565 218 580 m 381 76 q 562 237 562 96 q 517 361 562 313 q 381 423 472 409 l 381 76 "},"\\":{"x_min":-0.015625,"x_max":425.0625,"ha":522,"o":"m 425 -129 l 337 -129 l 0 1041 l 83 1041 l 425 -129 "},"µ":{"x_min":0,"x_max":697.21875,"ha":747,"o":"m 697 -4 q 629 -14 658 -14 q 498 97 513 -14 q 422 9 470 41 q 313 -23 374 -23 q 207 4 258 -23 q 119 81 156 32 l 119 -278 l 0 -278 l 0 738 l 124 738 l 124 343 q 165 173 124 246 q 308 83 216 83 q 452 178 402 83 q 493 359 493 255 l 493 738 l 617 738 l 617 214 q 623 136 617 160 q 673 92 637 92 q 697 96 684 92 l 697 -4 "},"Ι":{"x_min":42,"x_max":181,"ha":297,"o":"m 181 0 l 42 0 l 42 1013 l 181 1013 l 181 0 "},"Ύ":{"x_min":0,"x_max":1144.5,"ha":1214,"o":"m 1144 1012 l 807 416 l 807 0 l 667 0 l 667 416 l 325 1012 l 465 1012 l 736 533 l 1004 1012 l 1144 1012 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"’":{"x_min":0,"x_max":139,"ha":236,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 "},"Ν":{"x_min":0,"x_max":801,"ha":915,"o":"m 801 0 l 651 0 l 131 822 l 131 0 l 0 0 l 0 1013 l 151 1013 l 670 191 l 670 1013 l 801 1013 l 801 0 "},"-":{"x_min":8.71875,"x_max":350.390625,"ha":478,"o":"m 350 317 l 8 317 l 8 428 l 350 428 l 350 317 "},"Q":{"x_min":0,"x_max":968,"ha":1072,"o":"m 954 5 l 887 -79 l 744 35 q 622 -11 687 2 q 483 -26 556 -26 q 127 130 262 -26 q 0 504 0 279 q 127 880 0 728 q 484 1041 262 1041 q 841 884 708 1041 q 968 507 968 735 q 933 293 968 398 q 832 104 899 188 l 954 5 m 723 191 q 802 330 777 248 q 828 499 828 412 q 744 790 828 673 q 483 922 650 922 q 228 791 322 922 q 142 505 142 673 q 227 221 142 337 q 487 91 323 91 q 632 123 566 91 l 520 215 l 587 301 l 723 191 "},"ς":{"x_min":1,"x_max":676.28125,"ha":740,"o":"m 676 460 l 551 460 q 498 595 542 546 q 365 651 448 651 q 199 578 263 651 q 136 401 136 505 q 266 178 136 241 q 508 106 387 142 q 640 -50 640 62 q 625 -158 640 -105 q 583 -278 611 -211 l 465 -278 q 498 -182 490 -211 q 515 -80 515 -126 q 381 12 515 -15 q 134 91 197 51 q 1 388 1 179 q 100 651 1 542 q 354 761 199 761 q 587 680 498 761 q 676 460 676 599 "},"M":{"x_min":0,"x_max":954,"ha":1067,"o":"m 954 0 l 819 0 l 819 869 l 537 0 l 405 0 l 128 866 l 128 0 l 0 0 l 0 1013 l 200 1013 l 472 160 l 757 1013 l 954 1013 l 954 0 "},"Ψ":{"x_min":0,"x_max":1006,"ha":1094,"o":"m 1006 678 q 914 319 1006 429 q 571 200 814 200 l 571 0 l 433 0 l 433 200 q 92 319 194 200 q 0 678 0 429 l 0 1013 l 139 1013 l 139 679 q 191 417 139 492 q 433 326 255 326 l 433 1013 l 571 1013 l 571 326 l 580 326 q 813 423 747 326 q 868 679 868 502 l 868 1013 l 1006 1013 l 1006 678 "},"C":{"x_min":0,"x_max":886,"ha":944,"o":"m 886 379 q 760 87 886 201 q 455 -26 634 -26 q 112 136 236 -26 q 0 509 0 283 q 118 882 0 737 q 469 1041 245 1041 q 748 955 630 1041 q 879 708 879 859 l 745 708 q 649 862 724 805 q 473 920 573 920 q 219 791 312 920 q 136 509 136 675 q 217 229 136 344 q 470 99 311 99 q 672 179 591 99 q 753 379 753 259 l 886 379 "},"!":{"x_min":0,"x_max":138,"ha":236,"o":"m 138 684 q 116 409 138 629 q 105 244 105 299 l 33 244 q 16 465 33 313 q 0 684 0 616 l 0 1013 l 138 1013 l 138 684 m 138 0 l 0 0 l 0 151 l 138 151 l 138 0 "},"{":{"x_min":0,"x_max":480.5625,"ha":578,"o":"m 480 -286 q 237 -213 303 -286 q 187 -45 187 -159 q 194 48 187 -15 q 201 141 201 112 q 164 264 201 225 q 0 314 118 314 l 0 417 q 164 471 119 417 q 201 605 201 514 q 199 665 201 644 q 193 772 193 769 q 241 941 193 887 q 480 1015 308 1015 l 480 915 q 336 866 375 915 q 306 742 306 828 q 310 662 306 717 q 314 577 314 606 q 288 452 314 500 q 176 365 256 391 q 289 275 257 337 q 314 143 314 226 q 313 84 314 107 q 310 -11 310 -5 q 339 -131 310 -94 q 480 -182 377 -182 l 480 -286 "},"X":{"x_min":-0.015625,"x_max":854.15625,"ha":940,"o":"m 854 0 l 683 0 l 423 409 l 166 0 l 0 0 l 347 519 l 18 1013 l 186 1013 l 428 637 l 675 1013 l 836 1013 l 504 520 l 854 0 "},"#":{"x_min":0,"x_max":963.890625,"ha":1061,"o":"m 963 690 l 927 590 l 719 590 l 655 410 l 876 410 l 840 310 l 618 310 l 508 -3 l 393 -2 l 506 309 l 329 310 l 215 -2 l 102 -3 l 212 310 l 0 310 l 36 410 l 248 409 l 312 590 l 86 590 l 120 690 l 347 690 l 459 1006 l 573 1006 l 462 690 l 640 690 l 751 1006 l 865 1006 l 754 690 l 963 690 m 606 590 l 425 590 l 362 410 l 543 410 l 606 590 "},"ι":{"x_min":42,"x_max":284,"ha":361,"o":"m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 738 l 167 738 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 103 239 101 q 284 112 257 104 l 284 3 "},"Ά":{"x_min":0,"x_max":906.953125,"ha":982,"o":"m 283 1040 l 88 799 l 5 799 l 145 1040 l 283 1040 m 906 0 l 756 0 l 650 303 l 251 303 l 143 0 l 0 0 l 376 1012 l 529 1012 l 906 0 m 609 421 l 452 866 l 293 421 l 609 421 "},")":{"x_min":0,"x_max":318,"ha":415,"o":"m 318 365 q 257 25 318 191 q 87 -290 197 -141 l 0 -290 q 140 21 93 -128 q 193 360 193 189 q 141 704 193 537 q 0 1024 97 850 l 87 1024 q 257 706 197 871 q 318 365 318 542 "},"ε":{"x_min":0,"x_max":634.71875,"ha":714,"o":"m 634 234 q 527 38 634 110 q 300 -25 433 -25 q 98 29 183 -25 q 0 204 0 93 q 37 314 0 265 q 128 390 67 353 q 56 460 82 419 q 26 555 26 505 q 114 712 26 654 q 295 763 191 763 q 499 700 416 763 q 589 515 589 631 l 478 515 q 419 618 464 580 q 307 657 374 657 q 207 630 253 657 q 151 547 151 598 q 238 445 151 469 q 389 434 280 434 l 389 331 l 349 331 q 206 315 255 331 q 125 210 125 287 q 183 107 125 145 q 302 76 233 76 q 436 117 379 76 q 509 234 493 159 l 634 234 "},"Δ":{"x_min":0,"x_max":952.78125,"ha":1028,"o":"m 952 0 l 0 0 l 400 1013 l 551 1013 l 952 0 m 762 124 l 476 867 l 187 124 l 762 124 "},"}":{"x_min":0,"x_max":481,"ha":578,"o":"m 481 314 q 318 262 364 314 q 282 136 282 222 q 284 65 282 97 q 293 -58 293 -48 q 241 -217 293 -166 q 0 -286 174 -286 l 0 -182 q 143 -130 105 -182 q 171 -2 171 -93 q 168 81 171 22 q 165 144 165 140 q 188 275 165 229 q 306 365 220 339 q 191 455 224 391 q 165 588 165 505 q 168 681 165 624 q 171 742 171 737 q 141 865 171 827 q 0 915 102 915 l 0 1015 q 243 942 176 1015 q 293 773 293 888 q 287 675 293 741 q 282 590 282 608 q 318 466 282 505 q 481 417 364 417 l 481 314 "},"‰":{"x_min":-3,"x_max":1672,"ha":1821,"o":"m 846 0 q 664 76 732 0 q 603 244 603 145 q 662 412 603 344 q 846 489 729 489 q 1027 412 959 489 q 1089 244 1089 343 q 1029 76 1089 144 q 846 0 962 0 m 845 103 q 945 143 910 103 q 981 243 981 184 q 947 340 981 301 q 845 385 910 385 q 745 342 782 385 q 709 243 709 300 q 742 147 709 186 q 845 103 781 103 m 888 986 l 284 -25 l 199 -25 l 803 986 l 888 986 m 241 468 q 58 545 126 468 q -3 715 -3 615 q 56 881 -3 813 q 238 958 124 958 q 421 881 353 958 q 483 712 483 813 q 423 544 483 612 q 241 468 356 468 m 241 855 q 137 811 175 855 q 100 710 100 768 q 136 612 100 653 q 240 572 172 572 q 344 614 306 572 q 382 713 382 656 q 347 810 382 771 q 241 855 308 855 m 1428 0 q 1246 76 1314 0 q 1185 244 1185 145 q 1244 412 1185 344 q 1428 489 1311 489 q 1610 412 1542 489 q 1672 244 1672 343 q 1612 76 1672 144 q 1428 0 1545 0 m 1427 103 q 1528 143 1492 103 q 1564 243 1564 184 q 1530 340 1564 301 q 1427 385 1492 385 q 1327 342 1364 385 q 1291 243 1291 300 q 1324 147 1291 186 q 1427 103 1363 103 "},"a":{"x_min":0,"x_max":698.609375,"ha":794,"o":"m 698 0 q 661 -12 679 -7 q 615 -17 643 -17 q 536 12 564 -17 q 500 96 508 41 q 384 6 456 37 q 236 -25 312 -25 q 65 31 130 -25 q 0 194 0 88 q 118 390 0 334 q 328 435 180 420 q 488 483 476 451 q 495 523 495 504 q 442 619 495 584 q 325 654 389 654 q 209 617 257 654 q 152 513 161 580 l 33 513 q 123 705 33 633 q 332 772 207 772 q 528 712 448 772 q 617 531 617 645 l 617 163 q 624 108 617 126 q 664 90 632 90 l 698 94 l 698 0 m 491 262 l 491 372 q 272 329 350 347 q 128 201 128 294 q 166 113 128 144 q 264 83 205 83 q 414 130 346 83 q 491 262 491 183 "},"—":{"x_min":0,"x_max":941.671875,"ha":1039,"o":"m 941 334 l 0 334 l 0 410 l 941 410 l 941 334 "},"=":{"x_min":8.71875,"x_max":780.953125,"ha":792,"o":"m 780 510 l 8 510 l 8 606 l 780 606 l 780 510 m 780 235 l 8 235 l 8 332 l 780 332 l 780 235 "},"N":{"x_min":0,"x_max":801,"ha":914,"o":"m 801 0 l 651 0 l 131 823 l 131 0 l 0 0 l 0 1013 l 151 1013 l 670 193 l 670 1013 l 801 1013 l 801 0 "},"ρ":{"x_min":0,"x_max":712,"ha":797,"o":"m 712 369 q 620 94 712 207 q 362 -26 521 -26 q 230 2 292 -26 q 119 83 167 30 l 119 -278 l 0 -278 l 0 362 q 91 643 0 531 q 355 764 190 764 q 617 647 517 764 q 712 369 712 536 m 583 366 q 530 559 583 480 q 359 651 469 651 q 190 562 252 651 q 135 370 135 483 q 189 176 135 257 q 359 85 250 85 q 528 175 466 85 q 583 366 583 254 "},"2":{"x_min":59,"x_max":731,"ha":792,"o":"m 731 0 l 59 0 q 197 314 59 188 q 457 487 199 315 q 598 691 598 580 q 543 819 598 772 q 411 867 488 867 q 272 811 328 867 q 209 630 209 747 l 81 630 q 182 901 81 805 q 408 986 271 986 q 629 909 536 986 q 731 694 731 826 q 613 449 731 541 q 378 316 495 383 q 201 122 235 234 l 731 122 l 731 0 "},"¯":{"x_min":0,"x_max":941.671875,"ha":938,"o":"m 941 1033 l 0 1033 l 0 1109 l 941 1109 l 941 1033 "},"Z":{"x_min":0,"x_max":779,"ha":849,"o":"m 779 0 l 0 0 l 0 113 l 621 896 l 40 896 l 40 1013 l 779 1013 l 778 887 l 171 124 l 779 124 l 779 0 "},"u":{"x_min":0,"x_max":617,"ha":729,"o":"m 617 0 l 499 0 l 499 110 q 391 10 460 45 q 246 -25 322 -25 q 61 58 127 -25 q 0 258 0 136 l 0 738 l 125 738 l 125 284 q 156 148 125 202 q 273 82 197 82 q 433 165 369 82 q 493 340 493 243 l 493 738 l 617 738 l 617 0 "},"k":{"x_min":0,"x_max":612.484375,"ha":697,"o":"m 612 738 l 338 465 l 608 0 l 469 0 l 251 382 l 121 251 l 121 0 l 0 0 l 0 1013 l 121 1013 l 121 402 l 456 738 l 612 738 "},"Η":{"x_min":0,"x_max":803,"ha":917,"o":"m 803 0 l 667 0 l 667 475 l 140 475 l 140 0 l 0 0 l 0 1013 l 140 1013 l 140 599 l 667 599 l 667 1013 l 803 1013 l 803 0 "},"Α":{"x_min":0,"x_max":906.953125,"ha":985,"o":"m 906 0 l 756 0 l 650 303 l 251 303 l 143 0 l 0 0 l 376 1013 l 529 1013 l 906 0 m 609 421 l 452 866 l 293 421 l 609 421 "},"s":{"x_min":0,"x_max":604,"ha":697,"o":"m 604 217 q 501 36 604 104 q 292 -23 411 -23 q 86 43 166 -23 q 0 238 0 114 l 121 237 q 175 122 121 164 q 300 85 223 85 q 415 112 363 85 q 479 207 479 147 q 361 309 479 276 q 140 372 141 370 q 21 544 21 426 q 111 708 21 647 q 298 761 190 761 q 492 705 413 761 q 583 531 583 643 l 462 531 q 412 625 462 594 q 298 657 363 657 q 199 636 242 657 q 143 558 143 608 q 262 454 143 486 q 484 394 479 397 q 604 217 604 341 "},"B":{"x_min":0,"x_max":778,"ha":876,"o":"m 580 546 q 724 469 670 535 q 778 311 778 403 q 673 83 778 171 q 432 0 575 0 l 0 0 l 0 1013 l 411 1013 q 629 957 541 1013 q 732 768 732 892 q 691 633 732 693 q 580 546 650 572 m 393 899 l 139 899 l 139 588 l 379 588 q 521 624 462 588 q 592 744 592 667 q 531 859 592 819 q 393 899 471 899 m 419 124 q 566 169 504 124 q 635 303 635 219 q 559 436 635 389 q 402 477 494 477 l 139 477 l 139 124 l 419 124 "},"…":{"x_min":0,"x_max":614,"ha":708,"o":"m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 m 378 0 l 236 0 l 236 151 l 378 151 l 378 0 m 614 0 l 472 0 l 472 151 l 614 151 l 614 0 "},"?":{"x_min":0,"x_max":607,"ha":704,"o":"m 607 777 q 543 599 607 674 q 422 474 482 537 q 357 272 357 391 l 236 272 q 297 487 236 395 q 411 619 298 490 q 474 762 474 691 q 422 885 474 838 q 301 933 371 933 q 179 880 228 933 q 124 706 124 819 l 0 706 q 94 963 0 872 q 302 1044 177 1044 q 511 973 423 1044 q 607 777 607 895 m 370 0 l 230 0 l 230 151 l 370 151 l 370 0 "},"H":{"x_min":0,"x_max":803,"ha":915,"o":"m 803 0 l 667 0 l 667 475 l 140 475 l 140 0 l 0 0 l 0 1013 l 140 1013 l 140 599 l 667 599 l 667 1013 l 803 1013 l 803 0 "},"ν":{"x_min":0,"x_max":675,"ha":761,"o":"m 675 738 l 404 0 l 272 0 l 0 738 l 133 738 l 340 147 l 541 738 l 675 738 "},"c":{"x_min":1,"x_max":701.390625,"ha":775,"o":"m 701 264 q 584 53 681 133 q 353 -26 487 -26 q 91 91 188 -26 q 1 370 1 201 q 92 645 1 537 q 353 761 190 761 q 572 688 479 761 q 690 493 666 615 l 556 493 q 487 606 545 562 q 356 650 428 650 q 186 563 246 650 q 134 372 134 487 q 188 179 134 258 q 359 88 250 88 q 492 136 437 88 q 566 264 548 185 l 701 264 "},"¶":{"x_min":0,"x_max":566.671875,"ha":678,"o":"m 21 892 l 52 892 l 98 761 l 145 892 l 176 892 l 178 741 l 157 741 l 157 867 l 108 741 l 88 741 l 40 871 l 40 741 l 21 741 l 21 892 m 308 854 l 308 731 q 252 691 308 691 q 227 691 240 691 q 207 696 213 695 l 207 712 l 253 706 q 288 733 288 706 l 288 763 q 244 741 279 741 q 193 797 193 741 q 261 860 193 860 q 287 860 273 860 q 308 854 302 855 m 288 842 l 263 843 q 213 796 213 843 q 248 756 213 756 q 288 796 288 756 l 288 842 m 566 988 l 502 988 l 502 -1 l 439 -1 l 439 988 l 317 988 l 317 -1 l 252 -1 l 252 602 q 81 653 155 602 q 0 805 0 711 q 101 989 0 918 q 309 1053 194 1053 l 566 1053 l 566 988 "},"β":{"x_min":0,"x_max":660,"ha":745,"o":"m 471 550 q 610 450 561 522 q 660 280 660 378 q 578 64 660 151 q 367 -22 497 -22 q 239 5 299 -22 q 126 82 178 32 l 126 -278 l 0 -278 l 0 593 q 54 903 0 801 q 318 1042 127 1042 q 519 964 436 1042 q 603 771 603 887 q 567 644 603 701 q 471 550 532 586 m 337 79 q 476 138 418 79 q 535 279 535 198 q 427 437 535 386 q 226 477 344 477 l 226 583 q 398 620 329 583 q 486 762 486 668 q 435 884 486 833 q 312 935 384 935 q 169 861 219 935 q 126 698 126 797 l 126 362 q 170 169 126 242 q 337 79 224 79 "},"Μ":{"x_min":0,"x_max":954,"ha":1068,"o":"m 954 0 l 819 0 l 819 868 l 537 0 l 405 0 l 128 865 l 128 0 l 0 0 l 0 1013 l 199 1013 l 472 158 l 758 1013 l 954 1013 l 954 0 "},"Ό":{"x_min":0.109375,"x_max":1120,"ha":1217,"o":"m 1120 505 q 994 132 1120 282 q 642 -29 861 -29 q 290 130 422 -29 q 167 505 167 280 q 294 883 167 730 q 650 1046 430 1046 q 999 882 868 1046 q 1120 505 1120 730 m 977 504 q 896 784 977 669 q 644 915 804 915 q 391 785 484 915 q 307 504 307 669 q 391 224 307 339 q 644 95 486 95 q 894 224 803 95 q 977 504 977 339 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"Ή":{"x_min":0,"x_max":1158,"ha":1275,"o":"m 1158 0 l 1022 0 l 1022 475 l 496 475 l 496 0 l 356 0 l 356 1012 l 496 1012 l 496 599 l 1022 599 l 1022 1012 l 1158 1012 l 1158 0 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"•":{"x_min":0,"x_max":663.890625,"ha":775,"o":"m 663 529 q 566 293 663 391 q 331 196 469 196 q 97 294 194 196 q 0 529 0 393 q 96 763 0 665 q 331 861 193 861 q 566 763 469 861 q 663 529 663 665 "},"¥":{"x_min":0.1875,"x_max":819.546875,"ha":886,"o":"m 563 561 l 697 561 l 696 487 l 520 487 l 482 416 l 482 380 l 697 380 l 695 308 l 482 308 l 482 0 l 342 0 l 342 308 l 125 308 l 125 380 l 342 380 l 342 417 l 303 487 l 125 487 l 125 561 l 258 561 l 0 1013 l 140 1013 l 411 533 l 679 1013 l 819 1013 l 563 561 "},"(":{"x_min":0,"x_max":318.0625,"ha":415,"o":"m 318 -290 l 230 -290 q 61 23 122 -142 q 0 365 0 190 q 62 712 0 540 q 230 1024 119 869 l 318 1024 q 175 705 219 853 q 125 360 125 542 q 176 22 125 187 q 318 -290 223 -127 "},"U":{"x_min":0,"x_max":796,"ha":904,"o":"m 796 393 q 681 93 796 212 q 386 -25 566 -25 q 101 95 208 -25 q 0 393 0 211 l 0 1013 l 138 1013 l 138 391 q 204 191 138 270 q 394 107 276 107 q 586 191 512 107 q 656 391 656 270 l 656 1013 l 796 1013 l 796 393 "},"γ":{"x_min":0.5,"x_max":744.953125,"ha":822,"o":"m 744 737 l 463 54 l 463 -278 l 338 -278 l 338 54 l 154 495 q 104 597 124 569 q 13 651 67 651 l 0 651 l 0 751 l 39 753 q 168 711 121 753 q 242 594 207 676 l 403 208 l 617 737 l 744 737 "},"α":{"x_min":0,"x_max":765.5625,"ha":809,"o":"m 765 -4 q 698 -14 726 -14 q 564 97 586 -14 q 466 7 525 40 q 337 -26 407 -26 q 88 98 186 -26 q 0 369 0 212 q 88 637 0 525 q 337 760 184 760 q 465 728 407 760 q 563 637 524 696 l 563 739 l 685 739 l 685 222 q 693 141 685 168 q 748 94 708 94 q 765 96 760 94 l 765 -4 m 584 371 q 531 562 584 485 q 360 653 470 653 q 192 566 254 653 q 135 379 135 489 q 186 181 135 261 q 358 84 247 84 q 528 176 465 84 q 584 371 584 260 "},"F":{"x_min":0,"x_max":683.328125,"ha":717,"o":"m 683 888 l 140 888 l 140 583 l 613 583 l 613 458 l 140 458 l 140 0 l 0 0 l 0 1013 l 683 1013 l 683 888 "},"­":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 334 l 0 334 l 0 410 l 705 410 l 705 334 "},":":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 "},"Χ":{"x_min":0,"x_max":854.171875,"ha":935,"o":"m 854 0 l 683 0 l 423 409 l 166 0 l 0 0 l 347 519 l 18 1013 l 186 1013 l 427 637 l 675 1013 l 836 1013 l 504 521 l 854 0 "},"*":{"x_min":116,"x_max":674,"ha":792,"o":"m 674 768 l 475 713 l 610 544 l 517 477 l 394 652 l 272 478 l 178 544 l 314 713 l 116 766 l 153 876 l 341 812 l 342 1013 l 446 1013 l 446 811 l 635 874 l 674 768 "},"†":{"x_min":0,"x_max":777,"ha":835,"o":"m 458 804 l 777 804 l 777 683 l 458 683 l 458 0 l 319 0 l 319 681 l 0 683 l 0 804 l 319 804 l 319 1015 l 458 1013 l 458 804 "},"°":{"x_min":0,"x_max":347,"ha":444,"o":"m 173 802 q 43 856 91 802 q 0 977 0 905 q 45 1101 0 1049 q 173 1153 90 1153 q 303 1098 255 1153 q 347 977 347 1049 q 303 856 347 905 q 173 802 256 802 m 173 884 q 238 910 214 884 q 262 973 262 937 q 239 1038 262 1012 q 173 1064 217 1064 q 108 1037 132 1064 q 85 973 85 1010 q 108 910 85 937 q 173 884 132 884 "},"V":{"x_min":0,"x_max":862.71875,"ha":940,"o":"m 862 1013 l 505 0 l 361 0 l 0 1013 l 143 1013 l 434 165 l 718 1012 l 862 1013 "},"Ξ":{"x_min":0,"x_max":734.71875,"ha":763,"o":"m 723 889 l 9 889 l 9 1013 l 723 1013 l 723 889 m 673 463 l 61 463 l 61 589 l 673 589 l 673 463 m 734 0 l 0 0 l 0 124 l 734 124 l 734 0 "}," ":{"x_min":0,"x_max":0,"ha":853},"Ϋ":{"x_min":0.328125,"x_max":819.515625,"ha":889,"o":"m 588 1046 l 460 1046 l 460 1189 l 588 1189 l 588 1046 m 360 1046 l 232 1046 l 232 1189 l 360 1189 l 360 1046 m 819 1012 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1012 l 140 1012 l 411 533 l 679 1012 l 819 1012 "},"0":{"x_min":73,"x_max":715,"ha":792,"o":"m 394 -29 q 153 129 242 -29 q 73 479 73 272 q 152 829 73 687 q 394 989 241 989 q 634 829 545 989 q 715 479 715 684 q 635 129 715 270 q 394 -29 546 -29 m 394 89 q 546 211 489 89 q 598 479 598 322 q 548 748 598 640 q 394 871 491 871 q 241 748 298 871 q 190 479 190 637 q 239 211 190 319 q 394 89 296 89 "},"”":{"x_min":0,"x_max":347,"ha":454,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 m 347 851 q 310 737 347 784 q 208 669 273 690 l 208 734 q 267 787 250 741 q 280 873 280 821 l 208 873 l 208 1013 l 347 1013 l 347 851 "},"@":{"x_min":0,"x_max":1260,"ha":1357,"o":"m 1098 -45 q 877 -160 1001 -117 q 633 -203 752 -203 q 155 -29 327 -203 q 0 360 0 127 q 176 802 0 616 q 687 1008 372 1008 q 1123 854 969 1008 q 1260 517 1260 718 q 1155 216 1260 341 q 868 82 1044 82 q 772 106 801 82 q 737 202 737 135 q 647 113 700 144 q 527 82 594 82 q 367 147 420 82 q 314 312 314 212 q 401 565 314 452 q 639 690 498 690 q 810 588 760 690 l 849 668 l 938 668 q 877 441 900 532 q 833 226 833 268 q 853 182 833 198 q 902 167 873 167 q 1088 272 1012 167 q 1159 512 1159 372 q 1051 793 1159 681 q 687 925 925 925 q 248 747 415 925 q 97 361 97 586 q 226 26 97 159 q 627 -122 370 -122 q 856 -87 737 -122 q 1061 8 976 -53 l 1098 -45 m 786 488 q 738 580 777 545 q 643 615 700 615 q 483 517 548 615 q 425 322 425 430 q 457 203 425 250 q 552 156 490 156 q 722 273 665 156 q 786 488 738 309 "},"Ί":{"x_min":0,"x_max":499,"ha":613,"o":"m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 m 499 0 l 360 0 l 360 1012 l 499 1012 l 499 0 "},"i":{"x_min":14,"x_max":136,"ha":275,"o":"m 136 873 l 14 873 l 14 1013 l 136 1013 l 136 873 m 136 0 l 14 0 l 14 737 l 136 737 l 136 0 "},"Β":{"x_min":0,"x_max":778,"ha":877,"o":"m 580 545 q 724 468 671 534 q 778 310 778 402 q 673 83 778 170 q 432 0 575 0 l 0 0 l 0 1013 l 411 1013 q 629 957 541 1013 q 732 768 732 891 q 691 632 732 692 q 580 545 650 571 m 393 899 l 139 899 l 139 587 l 379 587 q 521 623 462 587 q 592 744 592 666 q 531 859 592 819 q 393 899 471 899 m 419 124 q 566 169 504 124 q 635 302 635 219 q 559 435 635 388 q 402 476 494 476 l 139 476 l 139 124 l 419 124 "},"υ":{"x_min":0,"x_max":617,"ha":725,"o":"m 617 352 q 540 94 617 199 q 308 -24 455 -24 q 76 94 161 -24 q 0 352 0 199 l 0 739 l 126 739 l 126 355 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 355 492 257 l 492 739 l 617 739 l 617 352 "},"]":{"x_min":0,"x_max":275,"ha":372,"o":"m 275 -281 l 0 -281 l 0 -187 l 151 -187 l 151 920 l 0 920 l 0 1013 l 275 1013 l 275 -281 "},"m":{"x_min":0,"x_max":1019,"ha":1128,"o":"m 1019 0 l 897 0 l 897 454 q 860 591 897 536 q 739 660 816 660 q 613 586 659 660 q 573 436 573 522 l 573 0 l 447 0 l 447 455 q 412 591 447 535 q 294 657 372 657 q 165 586 213 657 q 122 437 122 521 l 122 0 l 0 0 l 0 738 l 117 738 l 117 640 q 202 730 150 697 q 316 763 254 763 q 437 730 381 763 q 525 642 494 697 q 621 731 559 700 q 753 763 682 763 q 943 694 867 763 q 1019 512 1019 625 l 1019 0 "},"χ":{"x_min":8.328125,"x_max":780.5625,"ha":815,"o":"m 780 -278 q 715 -294 747 -294 q 616 -257 663 -294 q 548 -175 576 -227 l 379 133 l 143 -277 l 9 -277 l 313 254 l 163 522 q 127 586 131 580 q 36 640 91 640 q 8 637 27 640 l 8 752 l 52 757 q 162 719 113 757 q 236 627 200 690 l 383 372 l 594 737 l 726 737 l 448 250 l 625 -69 q 670 -153 647 -110 q 743 -188 695 -188 q 780 -184 759 -188 l 780 -278 "},"8":{"x_min":55,"x_max":736,"ha":792,"o":"m 571 527 q 694 424 652 491 q 736 280 736 358 q 648 71 736 158 q 395 -26 551 -26 q 142 69 238 -26 q 55 279 55 157 q 96 425 55 359 q 220 527 138 491 q 120 615 153 562 q 88 726 88 668 q 171 904 88 827 q 395 986 261 986 q 618 905 529 986 q 702 727 702 830 q 670 616 702 667 q 571 527 638 565 m 394 565 q 519 610 475 565 q 563 717 563 655 q 521 823 563 781 q 392 872 474 872 q 265 824 312 872 q 224 720 224 783 q 265 613 224 656 q 394 565 312 565 m 395 91 q 545 150 488 91 q 597 280 597 204 q 546 408 597 355 q 395 465 492 465 q 244 408 299 465 q 194 280 194 356 q 244 150 194 203 q 395 91 299 91 "},"ί":{"x_min":42,"x_max":326.71875,"ha":361,"o":"m 284 3 q 233 -10 258 -5 q 182 -15 207 -15 q 85 26 119 -15 q 42 200 42 79 l 42 737 l 167 737 l 168 215 q 172 141 168 157 q 226 101 183 101 q 248 102 239 101 q 284 112 257 104 l 284 3 m 326 1040 l 137 819 l 54 819 l 189 1040 l 326 1040 "},"Ζ":{"x_min":0,"x_max":779.171875,"ha":850,"o":"m 779 0 l 0 0 l 0 113 l 620 896 l 40 896 l 40 1013 l 779 1013 l 779 887 l 170 124 l 779 124 l 779 0 "},"R":{"x_min":0,"x_max":781.953125,"ha":907,"o":"m 781 0 l 623 0 q 587 242 590 52 q 407 433 585 433 l 138 433 l 138 0 l 0 0 l 0 1013 l 396 1013 q 636 946 539 1013 q 749 731 749 868 q 711 597 749 659 q 608 502 674 534 q 718 370 696 474 q 729 207 722 352 q 781 26 736 62 l 781 0 m 373 551 q 533 594 465 551 q 614 731 614 645 q 532 859 614 815 q 373 896 465 896 l 138 896 l 138 551 l 373 551 "},"o":{"x_min":0,"x_max":713,"ha":821,"o":"m 357 -25 q 94 91 194 -25 q 0 368 0 202 q 93 642 0 533 q 357 761 193 761 q 618 644 518 761 q 713 368 713 533 q 619 91 713 201 q 357 -25 521 -25 m 357 85 q 528 175 465 85 q 584 369 584 255 q 529 562 584 484 q 357 651 467 651 q 189 560 250 651 q 135 369 135 481 q 187 177 135 257 q 357 85 250 85 "},"5":{"x_min":54.171875,"x_max":738,"ha":792,"o":"m 738 314 q 626 60 738 153 q 382 -23 526 -23 q 155 47 248 -23 q 54 256 54 125 l 183 256 q 259 132 204 174 q 382 91 314 91 q 533 149 471 91 q 602 314 602 213 q 538 469 602 411 q 386 528 475 528 q 284 506 332 528 q 197 439 237 484 l 81 439 l 159 958 l 684 958 l 684 840 l 254 840 l 214 579 q 306 627 258 612 q 407 643 354 643 q 636 552 540 643 q 738 314 738 457 "},"7":{"x_min":58.71875,"x_max":730.953125,"ha":792,"o":"m 730 839 q 469 448 560 641 q 335 0 378 255 l 192 0 q 328 441 235 252 q 593 830 421 630 l 58 830 l 58 958 l 730 958 l 730 839 "},"K":{"x_min":0,"x_max":819.46875,"ha":906,"o":"m 819 0 l 649 0 l 294 509 l 139 355 l 139 0 l 0 0 l 0 1013 l 139 1013 l 139 526 l 626 1013 l 809 1013 l 395 600 l 819 0 "},",":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 -12 q 105 -132 142 -82 q 0 -205 68 -182 l 0 -138 q 57 -82 40 -124 q 70 0 70 -51 l 0 0 l 0 151 l 142 151 l 142 -12 "},"d":{"x_min":0,"x_max":683,"ha":796,"o":"m 683 0 l 564 0 l 564 93 q 456 6 516 38 q 327 -25 395 -25 q 87 100 181 -25 q 0 365 0 215 q 90 639 0 525 q 343 763 187 763 q 564 647 486 763 l 564 1013 l 683 1013 l 683 0 m 582 373 q 529 562 582 484 q 361 653 468 653 q 190 561 253 653 q 135 365 135 479 q 189 175 135 254 q 358 85 251 85 q 529 178 468 85 q 582 373 582 258 "},"¨":{"x_min":-109,"x_max":247,"ha":232,"o":"m 247 1046 l 119 1046 l 119 1189 l 247 1189 l 247 1046 m 19 1046 l -109 1046 l -109 1189 l 19 1189 l 19 1046 "},"E":{"x_min":0,"x_max":736.109375,"ha":789,"o":"m 736 0 l 0 0 l 0 1013 l 725 1013 l 725 889 l 139 889 l 139 585 l 677 585 l 677 467 l 139 467 l 139 125 l 736 125 l 736 0 "},"Y":{"x_min":0,"x_max":820,"ha":886,"o":"m 820 1013 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1013 l 140 1013 l 411 534 l 679 1012 l 820 1013 "},"\"":{"x_min":0,"x_max":299,"ha":396,"o":"m 299 606 l 203 606 l 203 988 l 299 988 l 299 606 m 96 606 l 0 606 l 0 988 l 96 988 l 96 606 "},"‹":{"x_min":17.984375,"x_max":773.609375,"ha":792,"o":"m 773 40 l 18 376 l 17 465 l 773 799 l 773 692 l 159 420 l 773 149 l 773 40 "},"„":{"x_min":0,"x_max":364,"ha":467,"o":"m 141 -12 q 104 -132 141 -82 q 0 -205 67 -182 l 0 -138 q 56 -82 40 -124 q 69 0 69 -51 l 0 0 l 0 151 l 141 151 l 141 -12 m 364 -12 q 327 -132 364 -82 q 222 -205 290 -182 l 222 -138 q 279 -82 262 -124 q 292 0 292 -51 l 222 0 l 222 151 l 364 151 l 364 -12 "},"δ":{"x_min":1,"x_max":710,"ha":810,"o":"m 710 360 q 616 87 710 196 q 356 -28 518 -28 q 99 82 197 -28 q 1 356 1 192 q 100 606 1 509 q 355 703 199 703 q 180 829 288 754 q 70 903 124 866 l 70 1012 l 643 1012 l 643 901 l 258 901 q 462 763 422 794 q 636 592 577 677 q 710 360 710 485 m 584 365 q 552 501 584 447 q 451 602 521 555 q 372 611 411 611 q 197 541 258 611 q 136 355 136 472 q 190 171 136 245 q 358 85 252 85 q 528 173 465 85 q 584 365 584 252 "},"έ":{"x_min":0,"x_max":634.71875,"ha":714,"o":"m 634 234 q 527 38 634 110 q 300 -25 433 -25 q 98 29 183 -25 q 0 204 0 93 q 37 313 0 265 q 128 390 67 352 q 56 459 82 419 q 26 555 26 505 q 114 712 26 654 q 295 763 191 763 q 499 700 416 763 q 589 515 589 631 l 478 515 q 419 618 464 580 q 307 657 374 657 q 207 630 253 657 q 151 547 151 598 q 238 445 151 469 q 389 434 280 434 l 389 331 l 349 331 q 206 315 255 331 q 125 210 125 287 q 183 107 125 145 q 302 76 233 76 q 436 117 379 76 q 509 234 493 159 l 634 234 m 520 1040 l 331 819 l 248 819 l 383 1040 l 520 1040 "},"ω":{"x_min":0,"x_max":922,"ha":1031,"o":"m 922 339 q 856 97 922 203 q 650 -26 780 -26 q 538 9 587 -26 q 461 103 489 44 q 387 12 436 46 q 277 -22 339 -22 q 69 97 147 -22 q 0 339 0 203 q 45 551 0 444 q 161 738 84 643 l 302 738 q 175 553 219 647 q 124 336 124 446 q 155 179 124 249 q 275 88 197 88 q 375 163 341 88 q 400 294 400 219 l 400 572 l 524 572 l 524 294 q 561 135 524 192 q 643 88 591 88 q 762 182 719 88 q 797 342 797 257 q 745 556 797 450 q 619 738 705 638 l 760 738 q 874 551 835 640 q 922 339 922 444 "},"´":{"x_min":0,"x_max":96,"ha":251,"o":"m 96 606 l 0 606 l 0 988 l 96 988 l 96 606 "},"±":{"x_min":11,"x_max":781,"ha":792,"o":"m 781 490 l 446 490 l 446 255 l 349 255 l 349 490 l 11 490 l 11 586 l 349 586 l 349 819 l 446 819 l 446 586 l 781 586 l 781 490 m 781 21 l 11 21 l 11 115 l 781 115 l 781 21 "},"|":{"x_min":343,"x_max":449,"ha":792,"o":"m 449 462 l 343 462 l 343 986 l 449 986 l 449 462 m 449 -242 l 343 -242 l 343 280 l 449 280 l 449 -242 "},"ϋ":{"x_min":0,"x_max":617,"ha":725,"o":"m 482 800 l 372 800 l 372 925 l 482 925 l 482 800 m 239 800 l 129 800 l 129 925 l 239 925 l 239 800 m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 "},"§":{"x_min":0,"x_max":593,"ha":690,"o":"m 593 425 q 554 312 593 369 q 467 233 516 254 q 537 83 537 172 q 459 -74 537 -12 q 288 -133 387 -133 q 115 -69 184 -133 q 47 96 47 -6 l 166 96 q 199 7 166 40 q 288 -26 232 -26 q 371 -5 332 -26 q 420 60 420 21 q 311 201 420 139 q 108 309 210 255 q 0 490 0 383 q 33 602 0 551 q 124 687 66 654 q 75 743 93 712 q 58 812 58 773 q 133 984 58 920 q 300 1043 201 1043 q 458 987 394 1043 q 529 814 529 925 l 411 814 q 370 908 404 877 q 289 939 336 939 q 213 911 246 939 q 180 841 180 883 q 286 720 180 779 q 484 612 480 615 q 593 425 593 534 m 467 409 q 355 544 467 473 q 196 630 228 612 q 146 587 162 609 q 124 525 124 558 q 239 387 124 462 q 398 298 369 315 q 448 345 429 316 q 467 409 467 375 "},"b":{"x_min":0,"x_max":685,"ha":783,"o":"m 685 372 q 597 99 685 213 q 347 -25 501 -25 q 219 5 277 -25 q 121 93 161 36 l 121 0 l 0 0 l 0 1013 l 121 1013 l 121 634 q 214 723 157 692 q 341 754 272 754 q 591 637 493 754 q 685 372 685 526 m 554 356 q 499 550 554 470 q 328 644 437 644 q 162 556 223 644 q 108 369 108 478 q 160 176 108 256 q 330 83 221 83 q 498 169 435 83 q 554 356 554 245 "},"q":{"x_min":0,"x_max":683,"ha":876,"o":"m 683 -278 l 564 -278 l 564 97 q 474 8 533 39 q 345 -23 415 -23 q 91 93 188 -23 q 0 364 0 203 q 87 635 0 522 q 337 760 184 760 q 466 727 408 760 q 564 637 523 695 l 564 737 l 683 737 l 683 -278 m 582 375 q 527 564 582 488 q 358 652 466 652 q 190 565 253 652 q 135 377 135 488 q 189 179 135 261 q 361 84 251 84 q 530 179 469 84 q 582 375 582 260 "},"Ω":{"x_min":-0.171875,"x_max":969.5625,"ha":1068,"o":"m 969 0 l 555 0 l 555 123 q 744 308 675 194 q 814 558 814 423 q 726 812 814 709 q 484 922 633 922 q 244 820 334 922 q 154 567 154 719 q 223 316 154 433 q 412 123 292 199 l 412 0 l 0 0 l 0 124 l 217 124 q 68 327 122 210 q 15 572 15 444 q 144 911 15 781 q 484 1041 274 1041 q 822 909 691 1041 q 953 569 953 777 q 899 326 953 443 q 750 124 846 210 l 969 124 l 969 0 "},"ύ":{"x_min":0,"x_max":617,"ha":725,"o":"m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 m 535 1040 l 346 819 l 262 819 l 397 1040 l 535 1040 "},"z":{"x_min":-0.015625,"x_max":613.890625,"ha":697,"o":"m 613 0 l 0 0 l 0 100 l 433 630 l 20 630 l 20 738 l 594 738 l 593 636 l 163 110 l 613 110 l 613 0 "},"™":{"x_min":0,"x_max":894,"ha":1000,"o":"m 389 951 l 229 951 l 229 503 l 160 503 l 160 951 l 0 951 l 0 1011 l 389 1011 l 389 951 m 894 503 l 827 503 l 827 939 l 685 503 l 620 503 l 481 937 l 481 503 l 417 503 l 417 1011 l 517 1011 l 653 580 l 796 1010 l 894 1011 l 894 503 "},"ή":{"x_min":0.78125,"x_max":697,"ha":810,"o":"m 697 -278 l 572 -278 l 572 454 q 540 587 572 536 q 425 650 501 650 q 271 579 337 650 q 206 420 206 509 l 206 0 l 81 0 l 81 489 q 73 588 81 562 q 0 644 56 644 l 0 741 q 68 755 38 755 q 158 721 124 755 q 200 630 193 687 q 297 726 234 692 q 434 761 359 761 q 620 692 544 761 q 697 516 697 624 l 697 -278 m 479 1040 l 290 819 l 207 819 l 341 1040 l 479 1040 "},"Θ":{"x_min":0,"x_max":960,"ha":1056,"o":"m 960 507 q 833 129 960 280 q 476 -32 698 -32 q 123 129 255 -32 q 0 507 0 280 q 123 883 0 732 q 476 1045 255 1045 q 832 883 696 1045 q 960 507 960 732 m 817 500 q 733 789 817 669 q 476 924 639 924 q 223 792 317 924 q 142 507 142 675 q 222 222 142 339 q 476 89 315 89 q 730 218 636 89 q 817 500 817 334 m 716 449 l 243 449 l 243 571 l 716 571 l 716 449 "},"®":{"x_min":-3,"x_max":1008,"ha":1106,"o":"m 503 532 q 614 562 566 532 q 672 658 672 598 q 614 747 672 716 q 503 772 569 772 l 338 772 l 338 532 l 503 532 m 502 -7 q 123 151 263 -7 q -3 501 -3 294 q 123 851 -3 706 q 502 1011 263 1011 q 881 851 739 1011 q 1008 501 1008 708 q 883 151 1008 292 q 502 -7 744 -7 m 502 60 q 830 197 709 60 q 940 501 940 322 q 831 805 940 681 q 502 944 709 944 q 174 805 296 944 q 65 501 65 680 q 173 197 65 320 q 502 60 294 60 m 788 146 l 678 146 q 653 316 655 183 q 527 449 652 449 l 338 449 l 338 146 l 241 146 l 241 854 l 518 854 q 688 808 621 854 q 766 658 766 755 q 739 563 766 607 q 668 497 713 519 q 751 331 747 472 q 788 164 756 190 l 788 146 "},"~":{"x_min":0,"x_max":833,"ha":931,"o":"m 833 958 q 778 753 833 831 q 594 665 716 665 q 402 761 502 665 q 240 857 302 857 q 131 795 166 857 q 104 665 104 745 l 0 665 q 54 867 0 789 q 237 958 116 958 q 429 861 331 958 q 594 765 527 765 q 704 827 670 765 q 729 958 729 874 l 833 958 "},"Ε":{"x_min":0,"x_max":736.21875,"ha":778,"o":"m 736 0 l 0 0 l 0 1013 l 725 1013 l 725 889 l 139 889 l 139 585 l 677 585 l 677 467 l 139 467 l 139 125 l 736 125 l 736 0 "},"³":{"x_min":0,"x_max":450,"ha":547,"o":"m 450 552 q 379 413 450 464 q 220 366 313 366 q 69 414 130 366 q 0 567 0 470 l 85 567 q 126 470 85 504 q 225 437 168 437 q 320 467 280 437 q 360 552 360 498 q 318 632 360 608 q 213 657 276 657 q 195 657 203 657 q 176 657 181 657 l 176 722 q 279 733 249 722 q 334 815 334 752 q 300 881 334 856 q 220 907 267 907 q 133 875 169 907 q 97 781 97 844 l 15 781 q 78 926 15 875 q 220 972 135 972 q 364 930 303 972 q 426 817 426 888 q 344 697 426 733 q 421 642 392 681 q 450 552 450 603 "},"[":{"x_min":0,"x_max":273.609375,"ha":371,"o":"m 273 -281 l 0 -281 l 0 1013 l 273 1013 l 273 920 l 124 920 l 124 -187 l 273 -187 l 273 -281 "},"L":{"x_min":0,"x_max":645.828125,"ha":696,"o":"m 645 0 l 0 0 l 0 1013 l 140 1013 l 140 126 l 645 126 l 645 0 "},"σ":{"x_min":0,"x_max":803.390625,"ha":894,"o":"m 803 628 l 633 628 q 713 368 713 512 q 618 93 713 204 q 357 -25 518 -25 q 94 91 194 -25 q 0 368 0 201 q 94 644 0 533 q 356 761 194 761 q 481 750 398 761 q 608 739 564 739 l 803 739 l 803 628 m 360 85 q 529 180 467 85 q 584 374 584 262 q 527 566 584 490 q 352 651 463 651 q 187 559 247 651 q 135 368 135 478 q 189 175 135 254 q 360 85 251 85 "},"ζ":{"x_min":0,"x_max":573,"ha":642,"o":"m 573 -40 q 553 -162 573 -97 q 510 -278 543 -193 l 400 -278 q 441 -187 428 -219 q 462 -90 462 -132 q 378 -14 462 -14 q 108 45 197 -14 q 0 290 0 117 q 108 631 0 462 q 353 901 194 767 l 55 901 l 55 1012 l 561 1012 l 561 924 q 261 669 382 831 q 128 301 128 489 q 243 117 128 149 q 458 98 350 108 q 573 -40 573 80 "},"θ":{"x_min":0,"x_max":674,"ha":778,"o":"m 674 496 q 601 160 674 304 q 336 -26 508 -26 q 73 153 165 -26 q 0 485 0 296 q 72 840 0 683 q 343 1045 166 1045 q 605 844 516 1045 q 674 496 674 692 m 546 579 q 498 798 546 691 q 336 935 437 935 q 178 798 237 935 q 126 579 137 701 l 546 579 m 546 475 l 126 475 q 170 233 126 348 q 338 80 230 80 q 504 233 447 80 q 546 475 546 346 "},"Ο":{"x_min":0,"x_max":958,"ha":1054,"o":"m 485 1042 q 834 883 703 1042 q 958 511 958 735 q 834 136 958 287 q 481 -26 701 -26 q 126 130 261 -26 q 0 504 0 279 q 127 880 0 729 q 485 1042 263 1042 m 480 98 q 731 225 638 98 q 815 504 815 340 q 733 783 815 670 q 480 913 640 913 q 226 785 321 913 q 142 504 142 671 q 226 224 142 339 q 480 98 319 98 "},"Γ":{"x_min":0,"x_max":705.28125,"ha":749,"o":"m 705 886 l 140 886 l 140 0 l 0 0 l 0 1012 l 705 1012 l 705 886 "}," ":{"x_min":0,"x_max":0,"ha":375},"%":{"x_min":-3,"x_max":1089,"ha":1186,"o":"m 845 0 q 663 76 731 0 q 602 244 602 145 q 661 412 602 344 q 845 489 728 489 q 1027 412 959 489 q 1089 244 1089 343 q 1029 76 1089 144 q 845 0 962 0 m 844 103 q 945 143 909 103 q 981 243 981 184 q 947 340 981 301 q 844 385 909 385 q 744 342 781 385 q 708 243 708 300 q 741 147 708 186 q 844 103 780 103 m 888 986 l 284 -25 l 199 -25 l 803 986 l 888 986 m 241 468 q 58 545 126 468 q -3 715 -3 615 q 56 881 -3 813 q 238 958 124 958 q 421 881 353 958 q 483 712 483 813 q 423 544 483 612 q 241 468 356 468 m 241 855 q 137 811 175 855 q 100 710 100 768 q 136 612 100 653 q 240 572 172 572 q 344 614 306 572 q 382 713 382 656 q 347 810 382 771 q 241 855 308 855 "},"P":{"x_min":0,"x_max":726,"ha":806,"o":"m 424 1013 q 640 931 555 1013 q 726 719 726 850 q 637 506 726 587 q 413 426 548 426 l 140 426 l 140 0 l 0 0 l 0 1013 l 424 1013 m 379 889 l 140 889 l 140 548 l 372 548 q 522 589 459 548 q 593 720 593 637 q 528 845 593 801 q 379 889 463 889 "},"Έ":{"x_min":0,"x_max":1078.21875,"ha":1118,"o":"m 1078 0 l 342 0 l 342 1013 l 1067 1013 l 1067 889 l 481 889 l 481 585 l 1019 585 l 1019 467 l 481 467 l 481 125 l 1078 125 l 1078 0 m 277 1040 l 83 799 l 0 799 l 140 1040 l 277 1040 "},"Ώ":{"x_min":0.125,"x_max":1136.546875,"ha":1235,"o":"m 1136 0 l 722 0 l 722 123 q 911 309 842 194 q 981 558 981 423 q 893 813 981 710 q 651 923 800 923 q 411 821 501 923 q 321 568 321 720 q 390 316 321 433 q 579 123 459 200 l 579 0 l 166 0 l 166 124 l 384 124 q 235 327 289 210 q 182 572 182 444 q 311 912 182 782 q 651 1042 441 1042 q 989 910 858 1042 q 1120 569 1120 778 q 1066 326 1120 443 q 917 124 1013 210 l 1136 124 l 1136 0 m 277 1040 l 83 800 l 0 800 l 140 1041 l 277 1040 "},"_":{"x_min":0,"x_max":705.5625,"ha":803,"o":"m 705 -334 l 0 -334 l 0 -234 l 705 -234 l 705 -334 "},"Ϊ":{"x_min":-110,"x_max":246,"ha":275,"o":"m 246 1046 l 118 1046 l 118 1189 l 246 1189 l 246 1046 m 18 1046 l -110 1046 l -110 1189 l 18 1189 l 18 1046 m 136 0 l 0 0 l 0 1012 l 136 1012 l 136 0 "},"+":{"x_min":23,"x_max":768,"ha":792,"o":"m 768 372 l 444 372 l 444 0 l 347 0 l 347 372 l 23 372 l 23 468 l 347 468 l 347 840 l 444 840 l 444 468 l 768 468 l 768 372 "},"½":{"x_min":0,"x_max":1050,"ha":1149,"o":"m 1050 0 l 625 0 q 712 178 625 108 q 878 277 722 187 q 967 385 967 328 q 932 456 967 429 q 850 484 897 484 q 759 450 798 484 q 721 352 721 416 l 640 352 q 706 502 640 448 q 851 551 766 551 q 987 509 931 551 q 1050 385 1050 462 q 976 251 1050 301 q 829 179 902 215 q 717 68 740 133 l 1050 68 l 1050 0 m 834 985 l 215 -28 l 130 -28 l 750 984 l 834 985 m 224 422 l 142 422 l 142 811 l 0 811 l 0 867 q 104 889 62 867 q 164 973 157 916 l 224 973 l 224 422 "},"Ρ":{"x_min":0,"x_max":720,"ha":783,"o":"m 424 1013 q 637 933 554 1013 q 720 723 720 853 q 633 508 720 591 q 413 426 546 426 l 140 426 l 140 0 l 0 0 l 0 1013 l 424 1013 m 378 889 l 140 889 l 140 548 l 371 548 q 521 589 458 548 q 592 720 592 637 q 527 845 592 801 q 378 889 463 889 "},"'":{"x_min":0,"x_max":139,"ha":236,"o":"m 139 851 q 102 737 139 784 q 0 669 65 690 l 0 734 q 59 787 42 741 q 72 873 72 821 l 0 873 l 0 1013 l 139 1013 l 139 851 "},"ª":{"x_min":0,"x_max":350,"ha":397,"o":"m 350 625 q 307 616 328 616 q 266 631 281 616 q 247 673 251 645 q 190 628 225 644 q 116 613 156 613 q 32 641 64 613 q 0 722 0 669 q 72 826 0 800 q 247 866 159 846 l 247 887 q 220 934 247 916 q 162 953 194 953 q 104 934 129 953 q 76 882 80 915 l 16 882 q 60 976 16 941 q 166 1011 104 1011 q 266 979 224 1011 q 308 891 308 948 l 308 706 q 311 679 308 688 q 331 670 315 670 l 350 672 l 350 625 m 247 757 l 247 811 q 136 790 175 798 q 64 726 64 773 q 83 682 64 697 q 132 667 103 667 q 207 690 174 667 q 247 757 247 718 "},"΅":{"x_min":0,"x_max":450,"ha":553,"o":"m 450 800 l 340 800 l 340 925 l 450 925 l 450 800 m 406 1040 l 212 800 l 129 800 l 269 1040 l 406 1040 m 110 800 l 0 800 l 0 925 l 110 925 l 110 800 "},"T":{"x_min":0,"x_max":777,"ha":835,"o":"m 777 894 l 458 894 l 458 0 l 319 0 l 319 894 l 0 894 l 0 1013 l 777 1013 l 777 894 "},"Φ":{"x_min":0,"x_max":915,"ha":997,"o":"m 527 0 l 389 0 l 389 122 q 110 231 220 122 q 0 509 0 340 q 110 785 0 677 q 389 893 220 893 l 389 1013 l 527 1013 l 527 893 q 804 786 693 893 q 915 509 915 679 q 805 231 915 341 q 527 122 696 122 l 527 0 m 527 226 q 712 310 641 226 q 779 507 779 389 q 712 705 779 627 q 527 787 641 787 l 527 226 m 389 226 l 389 787 q 205 698 275 775 q 136 505 136 620 q 206 308 136 391 q 389 226 276 226 "},"⁋":{"x_min":0,"x_max":0,"ha":694},"j":{"x_min":-77.78125,"x_max":167,"ha":349,"o":"m 167 871 l 42 871 l 42 1013 l 167 1013 l 167 871 m 167 -80 q 121 -231 167 -184 q -26 -278 76 -278 l -77 -278 l -77 -164 l -41 -164 q 26 -143 11 -164 q 42 -65 42 -122 l 42 737 l 167 737 l 167 -80 "},"Σ":{"x_min":0,"x_max":756.953125,"ha":819,"o":"m 756 0 l 0 0 l 0 107 l 395 523 l 22 904 l 22 1013 l 745 1013 l 745 889 l 209 889 l 566 523 l 187 125 l 756 125 l 756 0 "},"1":{"x_min":215.671875,"x_max":574,"ha":792,"o":"m 574 0 l 442 0 l 442 697 l 215 697 l 215 796 q 386 833 330 796 q 475 986 447 875 l 574 986 l 574 0 "},"›":{"x_min":18.0625,"x_max":774,"ha":792,"o":"m 774 376 l 18 40 l 18 149 l 631 421 l 18 692 l 18 799 l 774 465 l 774 376 "},"<":{"x_min":17.984375,"x_max":773.609375,"ha":792,"o":"m 773 40 l 18 376 l 17 465 l 773 799 l 773 692 l 159 420 l 773 149 l 773 40 "},"£":{"x_min":0,"x_max":704.484375,"ha":801,"o":"m 704 41 q 623 -10 664 5 q 543 -26 583 -26 q 359 15 501 -26 q 243 36 288 36 q 158 23 197 36 q 73 -21 119 10 l 6 76 q 125 195 90 150 q 175 331 175 262 q 147 443 175 383 l 0 443 l 0 512 l 108 512 q 43 734 43 623 q 120 929 43 854 q 358 1010 204 1010 q 579 936 487 1010 q 678 729 678 857 l 678 684 l 552 684 q 504 838 552 780 q 362 896 457 896 q 216 852 263 896 q 176 747 176 815 q 199 627 176 697 q 248 512 217 574 l 468 512 l 468 443 l 279 443 q 297 356 297 398 q 230 194 297 279 q 153 107 211 170 q 227 133 190 125 q 293 142 264 142 q 410 119 339 142 q 516 96 482 96 q 579 105 550 96 q 648 142 608 115 l 704 41 "},"t":{"x_min":0,"x_max":367,"ha":458,"o":"m 367 0 q 312 -5 339 -2 q 262 -8 284 -8 q 145 28 183 -8 q 108 143 108 64 l 108 638 l 0 638 l 0 738 l 108 738 l 108 944 l 232 944 l 232 738 l 367 738 l 367 638 l 232 638 l 232 185 q 248 121 232 140 q 307 102 264 102 q 345 104 330 102 q 367 107 360 107 l 367 0 "},"¬":{"x_min":0,"x_max":706,"ha":803,"o":"m 706 411 l 706 158 l 630 158 l 630 335 l 0 335 l 0 411 l 706 411 "},"λ":{"x_min":0,"x_max":750,"ha":803,"o":"m 750 -7 q 679 -15 716 -15 q 538 59 591 -15 q 466 214 512 97 l 336 551 l 126 0 l 0 0 l 270 705 q 223 837 247 770 q 116 899 190 899 q 90 898 100 899 l 90 1004 q 152 1011 125 1011 q 298 938 244 1011 q 373 783 326 901 l 605 192 q 649 115 629 136 q 716 95 669 95 l 736 95 q 750 97 745 97 l 750 -7 "},"W":{"x_min":0,"x_max":1263.890625,"ha":1351,"o":"m 1263 1013 l 995 0 l 859 0 l 627 837 l 405 0 l 265 0 l 0 1013 l 136 1013 l 342 202 l 556 1013 l 701 1013 l 921 207 l 1133 1012 l 1263 1013 "},">":{"x_min":18.0625,"x_max":774,"ha":792,"o":"m 774 376 l 18 40 l 18 149 l 631 421 l 18 692 l 18 799 l 774 465 l 774 376 "},"v":{"x_min":0,"x_max":675.15625,"ha":761,"o":"m 675 738 l 404 0 l 272 0 l 0 738 l 133 737 l 340 147 l 541 737 l 675 738 "},"τ":{"x_min":0.28125,"x_max":644.5,"ha":703,"o":"m 644 628 l 382 628 l 382 179 q 388 120 382 137 q 436 91 401 91 q 474 94 447 91 q 504 97 501 97 l 504 0 q 454 -9 482 -5 q 401 -14 426 -14 q 278 67 308 -14 q 260 233 260 118 l 260 628 l 0 628 l 0 739 l 644 739 l 644 628 "},"ξ":{"x_min":0,"x_max":624.9375,"ha":699,"o":"m 624 -37 q 608 -153 624 -96 q 563 -278 593 -211 l 454 -278 q 491 -183 486 -200 q 511 -83 511 -126 q 484 -23 511 -44 q 370 1 452 1 q 323 0 354 1 q 283 -1 293 -1 q 84 76 169 -1 q 0 266 0 154 q 56 431 0 358 q 197 538 108 498 q 94 613 134 562 q 54 730 54 665 q 77 823 54 780 q 143 901 101 867 l 27 901 l 27 1012 l 576 1012 l 576 901 l 380 901 q 244 863 303 901 q 178 745 178 820 q 312 600 178 636 q 532 582 380 582 l 532 479 q 276 455 361 479 q 118 281 118 410 q 165 173 118 217 q 274 120 208 133 q 494 101 384 110 q 624 -37 624 76 "},"&":{"x_min":-3,"x_max":894.25,"ha":992,"o":"m 894 0 l 725 0 l 624 123 q 471 0 553 40 q 306 -41 390 -41 q 168 -7 231 -41 q 62 92 105 26 q 14 187 31 139 q -3 276 -3 235 q 55 433 -3 358 q 248 581 114 508 q 170 689 196 640 q 137 817 137 751 q 214 985 137 922 q 384 1041 284 1041 q 548 988 483 1041 q 622 824 622 928 q 563 666 622 739 q 431 556 516 608 l 621 326 q 649 407 639 361 q 663 493 653 426 l 781 493 q 703 229 781 352 l 894 0 m 504 818 q 468 908 504 877 q 384 940 433 940 q 293 907 331 940 q 255 818 255 875 q 289 714 255 767 q 363 628 313 678 q 477 729 446 682 q 504 818 504 771 m 556 209 l 314 499 q 179 395 223 449 q 135 283 135 341 q 146 222 135 253 q 183 158 158 192 q 333 80 241 80 q 556 209 448 80 "},"Λ":{"x_min":0,"x_max":862.5,"ha":942,"o":"m 862 0 l 719 0 l 426 847 l 143 0 l 0 0 l 356 1013 l 501 1013 l 862 0 "},"I":{"x_min":41,"x_max":180,"ha":293,"o":"m 180 0 l 41 0 l 41 1013 l 180 1013 l 180 0 "},"G":{"x_min":0,"x_max":921,"ha":1011,"o":"m 921 0 l 832 0 l 801 136 q 655 15 741 58 q 470 -28 568 -28 q 126 133 259 -28 q 0 499 0 284 q 125 881 0 731 q 486 1043 259 1043 q 763 957 647 1043 q 905 709 890 864 l 772 709 q 668 866 747 807 q 486 926 589 926 q 228 795 322 926 q 142 507 142 677 q 228 224 142 342 q 483 94 323 94 q 712 195 625 94 q 796 435 796 291 l 477 435 l 477 549 l 921 549 l 921 0 "},"ΰ":{"x_min":0,"x_max":617,"ha":725,"o":"m 524 800 l 414 800 l 414 925 l 524 925 l 524 800 m 183 800 l 73 800 l 73 925 l 183 925 l 183 800 m 617 352 q 540 93 617 199 q 308 -24 455 -24 q 76 93 161 -24 q 0 352 0 199 l 0 738 l 126 738 l 126 354 q 169 185 126 257 q 312 98 220 98 q 451 185 402 98 q 492 354 492 257 l 492 738 l 617 738 l 617 352 m 489 1040 l 300 819 l 216 819 l 351 1040 l 489 1040 "},"`":{"x_min":0,"x_max":138.890625,"ha":236,"o":"m 138 699 l 0 699 l 0 861 q 36 974 0 929 q 138 1041 72 1020 l 138 977 q 82 931 95 969 q 69 839 69 893 l 138 839 l 138 699 "},"·":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 "},"Υ":{"x_min":0.328125,"x_max":819.515625,"ha":889,"o":"m 819 1013 l 482 416 l 482 0 l 342 0 l 342 416 l 0 1013 l 140 1013 l 411 533 l 679 1013 l 819 1013 "},"r":{"x_min":0,"x_max":355.5625,"ha":432,"o":"m 355 621 l 343 621 q 179 569 236 621 q 122 411 122 518 l 122 0 l 0 0 l 0 737 l 117 737 l 117 604 q 204 719 146 686 q 355 753 262 753 l 355 621 "},"x":{"x_min":0,"x_max":675,"ha":764,"o":"m 675 0 l 525 0 l 331 286 l 144 0 l 0 0 l 256 379 l 12 738 l 157 737 l 336 473 l 516 738 l 661 738 l 412 380 l 675 0 "},"μ":{"x_min":0,"x_max":696.609375,"ha":747,"o":"m 696 -4 q 628 -14 657 -14 q 498 97 513 -14 q 422 8 470 41 q 313 -24 374 -24 q 207 3 258 -24 q 120 80 157 31 l 120 -278 l 0 -278 l 0 738 l 124 738 l 124 343 q 165 172 124 246 q 308 82 216 82 q 451 177 402 82 q 492 358 492 254 l 492 738 l 616 738 l 616 214 q 623 136 616 160 q 673 92 636 92 q 696 95 684 92 l 696 -4 "},"h":{"x_min":0,"x_max":615,"ha":724,"o":"m 615 472 l 615 0 l 490 0 l 490 454 q 456 590 490 535 q 338 654 416 654 q 186 588 251 654 q 122 436 122 522 l 122 0 l 0 0 l 0 1013 l 122 1013 l 122 633 q 218 727 149 694 q 362 760 287 760 q 552 676 484 760 q 615 472 615 600 "},".":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 0 l 0 0 l 0 151 l 142 151 l 142 0 "},"φ":{"x_min":-2,"x_max":878,"ha":974,"o":"m 496 -279 l 378 -279 l 378 -17 q 101 88 204 -17 q -2 367 -2 194 q 68 626 -2 510 q 283 758 151 758 l 283 646 q 167 537 209 626 q 133 373 133 462 q 192 177 133 254 q 378 93 259 93 l 378 758 q 445 764 426 763 q 476 765 464 765 q 765 659 653 765 q 878 377 878 553 q 771 96 878 209 q 496 -17 665 -17 l 496 -279 m 496 93 l 514 93 q 687 183 623 93 q 746 380 746 265 q 691 569 746 491 q 522 658 629 658 l 496 656 l 496 93 "},";":{"x_min":0,"x_max":142,"ha":239,"o":"m 142 585 l 0 585 l 0 738 l 142 738 l 142 585 m 142 -12 q 105 -132 142 -82 q 0 -206 68 -182 l 0 -138 q 58 -82 43 -123 q 68 0 68 -56 l 0 0 l 0 151 l 142 151 l 142 -12 "},"f":{"x_min":0,"x_max":378,"ha":472,"o":"m 378 638 l 246 638 l 246 0 l 121 0 l 121 638 l 0 638 l 0 738 l 121 738 q 137 935 121 887 q 290 1028 171 1028 q 320 1027 305 1028 q 378 1021 334 1026 l 378 908 q 323 918 346 918 q 257 870 273 918 q 246 780 246 840 l 246 738 l 378 738 l 378 638 "},"“":{"x_min":1,"x_max":348.21875,"ha":454,"o":"m 140 670 l 1 670 l 1 830 q 37 943 1 897 q 140 1011 74 990 l 140 947 q 82 900 97 940 q 68 810 68 861 l 140 810 l 140 670 m 348 670 l 209 670 l 209 830 q 245 943 209 897 q 348 1011 282 990 l 348 947 q 290 900 305 940 q 276 810 276 861 l 348 810 l 348 670 "},"A":{"x_min":0.03125,"x_max":906.953125,"ha":1008,"o":"m 906 0 l 756 0 l 648 303 l 251 303 l 142 0 l 0 0 l 376 1013 l 529 1013 l 906 0 m 610 421 l 452 867 l 293 421 l 610 421 "},"6":{"x_min":53,"x_max":739,"ha":792,"o":"m 739 312 q 633 62 739 162 q 400 -31 534 -31 q 162 78 257 -31 q 53 439 53 206 q 178 859 53 712 q 441 986 284 986 q 643 912 559 986 q 732 713 732 833 l 601 713 q 544 830 594 786 q 426 875 494 875 q 268 793 331 875 q 193 517 193 697 q 301 597 240 570 q 427 624 362 624 q 643 540 552 624 q 739 312 739 451 m 603 298 q 540 461 603 400 q 404 516 484 516 q 268 461 323 516 q 207 300 207 401 q 269 137 207 198 q 405 83 325 83 q 541 137 486 83 q 603 298 603 197 "},"‘":{"x_min":1,"x_max":139.890625,"ha":236,"o":"m 139 670 l 1 670 l 1 830 q 37 943 1 897 q 139 1011 74 990 l 139 947 q 82 900 97 940 q 68 810 68 861 l 139 810 l 139 670 "},"ϊ":{"x_min":-70,"x_max":283,"ha":361,"o":"m 283 800 l 173 800 l 173 925 l 283 925 l 283 800 m 40 800 l -70 800 l -70 925 l 40 925 l 40 800 m 283 3 q 232 -10 257 -5 q 181 -15 206 -15 q 84 26 118 -15 q 41 200 41 79 l 41 737 l 166 737 l 167 215 q 171 141 167 157 q 225 101 182 101 q 247 103 238 101 q 283 112 256 104 l 283 3 "},"π":{"x_min":-0.21875,"x_max":773.21875,"ha":857,"o":"m 773 -7 l 707 -11 q 575 40 607 -11 q 552 174 552 77 l 552 226 l 552 626 l 222 626 l 222 0 l 97 0 l 97 626 l 0 626 l 0 737 l 773 737 l 773 626 l 676 626 l 676 171 q 695 103 676 117 q 773 90 714 90 l 773 -7 "},"ά":{"x_min":0,"x_max":765.5625,"ha":809,"o":"m 765 -4 q 698 -14 726 -14 q 564 97 586 -14 q 466 7 525 40 q 337 -26 407 -26 q 88 98 186 -26 q 0 369 0 212 q 88 637 0 525 q 337 760 184 760 q 465 727 407 760 q 563 637 524 695 l 563 738 l 685 738 l 685 222 q 693 141 685 168 q 748 94 708 94 q 765 95 760 94 l 765 -4 m 584 371 q 531 562 584 485 q 360 653 470 653 q 192 566 254 653 q 135 379 135 489 q 186 181 135 261 q 358 84 247 84 q 528 176 465 84 q 584 371 584 260 m 604 1040 l 415 819 l 332 819 l 466 1040 l 604 1040 "},"O":{"x_min":0,"x_max":958,"ha":1057,"o":"m 485 1041 q 834 882 702 1041 q 958 512 958 734 q 834 136 958 287 q 481 -26 702 -26 q 126 130 261 -26 q 0 504 0 279 q 127 880 0 728 q 485 1041 263 1041 m 480 98 q 731 225 638 98 q 815 504 815 340 q 733 783 815 669 q 480 912 640 912 q 226 784 321 912 q 142 504 142 670 q 226 224 142 339 q 480 98 319 98 "},"n":{"x_min":0,"x_max":615,"ha":724,"o":"m 615 463 l 615 0 l 490 0 l 490 454 q 453 592 490 537 q 331 656 410 656 q 178 585 240 656 q 117 421 117 514 l 117 0 l 0 0 l 0 738 l 117 738 l 117 630 q 218 728 150 693 q 359 764 286 764 q 552 675 484 764 q 615 463 615 593 "},"3":{"x_min":54,"x_max":737,"ha":792,"o":"m 737 284 q 635 55 737 141 q 399 -25 541 -25 q 156 52 248 -25 q 54 308 54 140 l 185 308 q 245 147 185 202 q 395 96 302 96 q 539 140 484 96 q 602 280 602 190 q 510 429 602 390 q 324 454 451 454 l 324 565 q 487 584 441 565 q 565 719 565 617 q 515 835 565 791 q 395 879 466 879 q 255 824 307 879 q 203 661 203 769 l 78 661 q 166 909 78 822 q 387 992 250 992 q 603 921 513 992 q 701 723 701 844 q 669 607 701 656 q 578 524 637 558 q 696 434 655 499 q 737 284 737 369 "},"9":{"x_min":53,"x_max":739,"ha":792,"o":"m 739 524 q 619 94 739 241 q 362 -32 516 -32 q 150 47 242 -32 q 59 244 59 126 l 191 244 q 246 129 191 176 q 373 82 301 82 q 526 161 466 82 q 597 440 597 255 q 363 334 501 334 q 130 432 216 334 q 53 650 53 521 q 134 880 53 786 q 383 986 226 986 q 659 841 566 986 q 739 524 739 719 m 388 449 q 535 514 480 449 q 585 658 585 573 q 535 805 585 744 q 388 873 480 873 q 242 809 294 873 q 191 658 191 745 q 239 514 191 572 q 388 449 292 449 "},"l":{"x_min":41,"x_max":166,"ha":279,"o":"m 166 0 l 41 0 l 41 1013 l 166 1013 l 166 0 "},"¤":{"x_min":40.09375,"x_max":728.796875,"ha":825,"o":"m 728 304 l 649 224 l 512 363 q 383 331 458 331 q 256 363 310 331 l 119 224 l 40 304 l 177 441 q 150 553 150 493 q 184 673 150 621 l 40 818 l 119 898 l 267 749 q 321 766 291 759 q 384 773 351 773 q 447 766 417 773 q 501 749 477 759 l 649 898 l 728 818 l 585 675 q 612 618 604 648 q 621 553 621 587 q 591 441 621 491 l 728 304 m 384 682 q 280 643 318 682 q 243 551 243 604 q 279 461 243 499 q 383 423 316 423 q 487 461 449 423 q 525 553 525 500 q 490 641 525 605 q 384 682 451 682 "},"κ":{"x_min":0,"x_max":632.328125,"ha":679,"o":"m 632 0 l 482 0 l 225 384 l 124 288 l 124 0 l 0 0 l 0 738 l 124 738 l 124 446 l 433 738 l 596 738 l 312 466 l 632 0 "},"4":{"x_min":48,"x_max":742.453125,"ha":792,"o":"m 742 243 l 602 243 l 602 0 l 476 0 l 476 243 l 48 243 l 48 368 l 476 958 l 602 958 l 602 354 l 742 354 l 742 243 m 476 354 l 476 792 l 162 354 l 476 354 "},"p":{"x_min":0,"x_max":685,"ha":786,"o":"m 685 364 q 598 96 685 205 q 350 -23 504 -23 q 121 89 205 -23 l 121 -278 l 0 -278 l 0 738 l 121 738 l 121 633 q 220 726 159 691 q 351 761 280 761 q 598 636 504 761 q 685 364 685 522 m 557 371 q 501 560 557 481 q 330 651 437 651 q 162 559 223 651 q 108 366 108 479 q 162 177 108 254 q 333 87 224 87 q 502 178 441 87 q 557 371 557 258 "},"‡":{"x_min":0,"x_max":777,"ha":835,"o":"m 458 238 l 458 0 l 319 0 l 319 238 l 0 238 l 0 360 l 319 360 l 319 681 l 0 683 l 0 804 l 319 804 l 319 1015 l 458 1013 l 458 804 l 777 804 l 777 683 l 458 683 l 458 360 l 777 360 l 777 238 l 458 238 "},"ψ":{"x_min":0,"x_max":808,"ha":907,"o":"m 465 -278 l 341 -278 l 341 -15 q 87 102 180 -15 q 0 378 0 210 l 0 739 l 133 739 l 133 379 q 182 195 133 275 q 341 98 242 98 l 341 922 l 465 922 l 465 98 q 623 195 563 98 q 675 382 675 278 l 675 742 l 808 742 l 808 381 q 720 104 808 213 q 466 -13 627 -13 l 465 -278 "},"η":{"x_min":0.78125,"x_max":697,"ha":810,"o":"m 697 -278 l 572 -278 l 572 454 q 540 587 572 536 q 425 650 501 650 q 271 579 337 650 q 206 420 206 509 l 206 0 l 81 0 l 81 489 q 73 588 81 562 q 0 644 56 644 l 0 741 q 68 755 38 755 q 158 720 124 755 q 200 630 193 686 q 297 726 234 692 q 434 761 359 761 q 620 692 544 761 q 697 516 697 624 l 697 -278 "}},"cssFontWeight":"normal","ascender":1189,"underlinePosition":-100,"cssFontStyle":"normal","boundingBox":{"yMin":-334,"xMin":-111,"yMax":1189,"xMax":1672},"resolution":1000,"original_font_information":{"postscript_name":"Helvetiker-Regular","version_string":"Version 1.00 2004 initial release","vendor_url":"http://www.magenta.gr/","full_font_name":"Helvetiker","font_family_name":"Helvetiker","copyright":"Copyright (c) Μagenta ltd, 2004","description":"","trademark":"","designer":"","designer_url":"","unique_font_identifier":"Μagenta ltd:Helvetiker:22-10-104","license_url":"http://www.ellak.gr/fonts/MgOpen/license.html","license_description":"Copyright (c) 2004 by MAGENTA Ltd. All Rights Reserved.\r\n\r\nPermission is hereby granted, free of charge, to any person obtaining a copy of the fonts accompanying this license (\"Fonts\") and associated documentation files (the \"Font Software\"), to reproduce and distribute the Font Software, including without limitation the rights to use, copy, merge, publish, distribute, and/or sell copies of the Font Software, and to permit persons to whom the Font Software is furnished to do so, subject to the following conditions: \r\n\r\nThe above copyright and this permission notice shall be included in all copies of one or more of the Font Software typefaces.\r\n\r\nThe Font Software may be modified, altered, or added to, and in particular the designs of glyphs or characters in the Fonts may be modified and additional glyphs or characters may be added to the Fonts, only if the fonts are renamed to names not containing the word \"MgOpen\", or if the modifications are accepted for inclusion in the Font Software itself by the each appointed Administrator.\r\n\r\nThis License becomes null and void to the extent applicable to Fonts or Font Software that has been modified and is distributed under the \"MgOpen\" name.\r\n\r\nThe Font Software may be sold as part of a larger software package but no copy of one or more of the Font Software typefaces may be sold by itself. \r\n\r\nTHE FONT SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL MAGENTA OR PERSONS OR BODIES IN CHARGE OF ADMINISTRATION AND MAINTENANCE OF THE FONT SOFTWARE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.","manufacturer_name":"Μagenta ltd","font_sub_family_name":"Regular"},"descender":-334,"familyName":"Helvetiker","lineHeight":1522,"underlineThickness":50});

THREE.CombinedCamera = function ( width, height, fov, near, far, orthoNear, orthoFar ) {

	THREE.Camera.call( this );

	this.fov = fov;

	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;

	// We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

	this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 	orthoNear, orthoFar );
	this.cameraP = new THREE.PerspectiveCamera( fov, width / height, near, far );

	this.zoom = 1;

	this.toPerspective();

	var aspect = width/height;

};

THREE.CombinedCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

	// Switches to the Perspective Camera

	this.near = this.cameraP.near;
	this.far = this.cameraP.far;

	this.cameraP.fov =  this.fov / this.zoom ;

	this.cameraP.updateProjectionMatrix();

	this.projectionMatrix = this.cameraP.projectionMatrix;

	this.inPerspectiveMode = true;
	this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

	// Switches to the Orthographic camera estimating viewport from Perspective

	var fov = this.fov;
	var aspect = this.cameraP.aspect;
	var near = this.cameraP.near;
	var far = this.cameraP.far;

	// The size that we set is the mid plane of the viewing frustum

	var hyperfocus = ( near + far ) / 2;

	var halfHeight = Math.tan( fov * Math.PI / 180 / 2 ) * hyperfocus;
	var planeHeight = 2 * halfHeight;
	var planeWidth = planeHeight * aspect;
	var halfWidth = planeWidth / 2;

	halfHeight /= this.zoom;
	halfWidth /= this.zoom;

	this.cameraO.left = -halfWidth;
	this.cameraO.right = halfWidth;
	this.cameraO.top = halfHeight;
	this.cameraO.bottom = -halfHeight;

	// this.cameraO.left = -farHalfWidth;
	// this.cameraO.right = farHalfWidth;
	// this.cameraO.top = farHalfHeight;
	// this.cameraO.bottom = -farHalfHeight;

	// this.cameraO.left = this.left / this.zoom;
	// this.cameraO.right = this.right / this.zoom;
	// this.cameraO.top = this.top / this.zoom;
	// this.cameraO.bottom = this.bottom / this.zoom;

	this.cameraO.updateProjectionMatrix();

	this.near = this.cameraO.near;
	this.far = this.cameraO.far;
	this.projectionMatrix = this.cameraO.projectionMatrix;

	this.inPerspectiveMode = false;
	this.inOrthographicMode = true;

};


THREE.CombinedCamera.prototype.setSize = function( width, height ) {

	this.cameraP.aspect = width / height;
	this.left = -width / 2;
	this.right = width / 2
	this.top = height / 2;
	this.bottom = -height / 2;

};


THREE.CombinedCamera.prototype.setFov = function( fov ) {

	this.fov = fov;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

// For mantaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function() {

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toPerspective();
		this.toOrthographic();

	}

};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (fullframe) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	if ( frameHeight === undefined ) frameHeight = 24;

	var fov = 2 * THREE.Math.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );

	this.setFov( fov );

	return fov;
};


THREE.CombinedCamera.prototype.setZoom = function( zoom ) {

	this.zoom = zoom;

	if ( this.inPerspectiveMode ) {

		this.toPerspective();

	} else {

		this.toOrthographic();

	}

};

THREE.CombinedCamera.prototype.setZoomByEye = function( zoom, target ) {

	var newEye = new THREE.Vector3();
	var eye = this.position.clone();

	// 移动相机
	// 放大，相当于相机朝目标点前移；缩小，相当于相机朝目标点后移
	newEye.addVectors(eye, target.sub(eye).multiplyScalar(zoom - 1));

	this.position.copy(newEye);
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

/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.WebGLIncrementRenderer = function ( parameters ) {

    console.log( 'THREE.WebGLIncrementRenderer', THREE.REVISION );

    parameters = parameters || {};

    var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' ),
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

        _clearColor = new THREE.Color( 0x000000 ),
        _clearAlpha = 0;

    var lights = [];

    var opaqueObjects = [];
    var opaqueObjectsLastIndex = - 1;
    var transparentObjects = [];
    var transparentObjectsLastIndex = - 1;

    var morphInfluences = new Float32Array( 8 );


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
        _currentMaterialId = - 1,
        _currentGeometryProgram = '',
        _currentCamera = null,

        _usedTextureUnits = 0,

        _viewportX = 0,
        _viewportY = 0,
        _viewportWidth = _canvas.width,
        _viewportHeight = _canvas.height,
        _currentWidth = 0,
        _currentHeight = 0,
        _filterObject = null,

    // frustum

        _frustum = new THREE.Frustum(),

    // camera matrices cache

        _projScreenMatrix = new THREE.Matrix4(),

        _vector3 = new THREE.Vector3(),

    // light arrays cache

        _direction = new THREE.Vector3(),

        _lightsNeedUpdate = true,

        _lights = {

            ambient: [ 0, 0, 0 ],
            directional: { length: 0, colors: [], positions: [] },
            point: { length: 0, colors: [], positions: [], distances: [], decays: [] },
            spot: { length: 0, colors: [], positions: [], distances: [], directions: [], anglesCos: [], exponents: [], decays: [] },
            hemi: { length: 0, skyColors: [], groundColors: [], positions: [] }

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

    // ------------------------------------------------------------------
    // 增加增量绘制支持
    var startTime, endTime, elapseTime, // 用于绘制计时
        limitFrameTime = 30, // 每帧的绘制的临界时间(单位 ms)
        currentIncrementalListIdx = 0, // 保存索引
        incrementListDirty = true, // 是否更新数据
        incrementPluginDirty = true, // 是否重绘插件对象
        isIncrementalRenderFinish = false, // 是否绘制结束
        isOpaqueObjectsRenderFinish = false, // 不透明对象绘制结束
        isTransparentObjectsRenderFinish = false, // 透明对象绘制结束
        isTransparentObjectsRenderStart = false;  // 透明对象绘制开始
    // ------------------------------------------------------------------

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

        _gl = _context || _canvas.getContext( 'webgl', attributes ) || _canvas.getContext( 'experimental-webgl', attributes );

        if ( _gl === null ) {

            if ( _canvas.getContext( 'webgl' ) !== null ) {

                throw 'Error creating WebGL context with your selected attributes.';

            } else {

                throw 'Error creating WebGL context.';

            }

        }

        _canvas.addEventListener( 'webglcontextlost', onContextLost, false );

    } catch ( error ) {

        console.error( 'THREE.WebGLIncrementRenderer: ' + error );

    }

    var extensions = new THREE.WebGLExtensions( _gl );

    extensions.get( 'OES_texture_float' );
    extensions.get( 'OES_texture_float_linear' );
    extensions.get( 'OES_texture_half_float' );
    extensions.get( 'OES_texture_half_float_linear' );
    extensions.get( 'OES_standard_derivatives' );
    extensions.get( 'ANGLE_instanced_arrays' );

    if ( extensions.get( 'OES_element_index_uint' ) ) {

        THREE.BufferGeometry.MaxIndex = 4294967296;

    }

    var capabilities = new THREE.WebGLCapabilities( _gl, extensions, parameters );

    var state = new THREE.WebGLState( _gl, extensions, paramThreeToGL );
    var properties = new THREE.WebGLProperties();
    var objects = new THREE.WebGLObjects( _gl, properties, this.info );
    var programCache = new THREE.WebGLPrograms( this, capabilities );

    this.info.programs = programCache.programs;

    var bufferRenderer = new THREE.WebGLBufferRenderer( _gl, extensions, _infoRender );
    var indexedBufferRenderer = new THREE.WebGLIndexedBufferRenderer( _gl, extensions, _infoRender );

    //

    function glClearColor( r, g, b, a ) {

        if ( _premultipliedAlpha === true ) {

            r *= a; g *= a; b *= a;

        }

        _gl.clearColor( r, g, b, a );

    }

    function setDefaultGLState() {

        state.init();

        _gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

        glClearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

    }

    function resetGLState() {

        _currentProgram = null;
        _currentCamera = null;

        _currentGeometryProgram = '';
        _currentMaterialId = - 1;

        _lightsNeedUpdate = true;

        state.reset();

    }

    setDefaultGLState();

    this.context = _gl;
    this.capabilities = capabilities;
    this.extensions = extensions;
    this.state = state;

    // shadow map

    var shadowMap = new THREE.WebGLShadowMap( this, lights, objects );

    this.shadowMap = shadowMap;


    // Plugins

    var spritePlugin = new THREE.SpritePlugin( this, sprites );
    var lensFlarePlugin = new THREE.LensFlarePlugin( this, lensFlares );

    // API

    this.getContext = function () {

        return _gl;

    };

    this.getContextAttributes = function () {

        return _gl.getContextAttributes();

    };

    this.forceContextLoss = function () {

        extensions.get( 'WEBGL_lose_context' ).loseContext();

    };

    this.getMaxAnisotropy = ( function () {

        var value;

        return function getMaxAnisotropy() {

            if ( value !== undefined ) return value;

            var extension = extensions.get( 'EXT_texture_filter_anisotropic' );

            if ( extension !== null ) {

                value = _gl.getParameter( extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT );

            } else {

                value = 0;

            }

            return value;

        }

    } )();

    this.getPrecision = function () {

        return capabilities.precision;

    };

    this.getPixelRatio = function () {

        return pixelRatio;

    };

    this.setPixelRatio = function ( value ) {

        if ( value !== undefined ) pixelRatio = value;

    };

    this.getSize = function () {

        return {
            width: _width,
            height: _height
        };

    };

    this.setSize = function ( width, height, updateStyle ) {

        _width = width;
        _height = height;

        _canvas.width = width * pixelRatio;
        _canvas.height = height * pixelRatio;

        if ( updateStyle !== false ) {

            _canvas.style.width = width + 'px';
            _canvas.style.height = height + 'px';

        }

        this.setViewport( 0, 0, width, height );

    };

    this.setViewport = function ( x, y, width, height ) {

        _viewportX = x * pixelRatio;
        _viewportY = y * pixelRatio;

        _viewportWidth = width * pixelRatio;
        _viewportHeight = height * pixelRatio;

        _gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

    };

    this.getViewport = function ( dimensions ) {

        dimensions.x = _viewportX / pixelRatio;
        dimensions.y = _viewportY / pixelRatio;

        dimensions.z = _viewportWidth / pixelRatio;
        dimensions.w = _viewportHeight / pixelRatio;

    };

    this.setScissor = function ( x, y, width, height ) {

        _gl.scissor(
            x * pixelRatio,
            y * pixelRatio,
            width * pixelRatio,
            height * pixelRatio
        );

    };

    this.enableScissorTest = function ( boolean ) {

        state.setScissorTest( boolean );

    };

    // Clearing

    this.getClearColor = function () {

        return _clearColor;

    };

    this.setClearColor = function ( color, alpha ) {

        _clearColor.set( color );

        _clearAlpha = alpha !== undefined ? alpha : 1;

        glClearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

    };

    this.getClearAlpha = function () {

        return _clearAlpha;

    };

    this.setClearAlpha = function ( alpha ) {

        _clearAlpha = alpha;

        glClearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

    };

    this.clear = function ( color, depth, stencil ) {

        var bits = 0;

        if ( color === undefined || color ) bits |= _gl.COLOR_BUFFER_BIT;
        if ( depth === undefined || depth ) bits |= _gl.DEPTH_BUFFER_BIT;
        if ( stencil === undefined || stencil ) bits |= _gl.STENCIL_BUFFER_BIT;

        _gl.clear( bits );

    };

    this.clearColor = function () {

        _gl.clear( _gl.COLOR_BUFFER_BIT );

    };

    this.clearDepth = function () {

        _gl.clear( _gl.DEPTH_BUFFER_BIT );

    };

    this.clearStencil = function () {

        _gl.clear( _gl.STENCIL_BUFFER_BIT );

    };

    this.clearTarget = function ( renderTarget, color, depth, stencil ) {

        this.setRenderTarget( renderTarget );
        this.clear( color, depth, stencil );

    };

    // Reset

    this.resetGLState = resetGLState;

    this.dispose = function() {

        _canvas.removeEventListener( 'webglcontextlost', onContextLost, false );

    };

    // Events

    function onContextLost( event ) {

        event.preventDefault();

        resetGLState();
        setDefaultGLState();

        properties.clear();

    };

    function onTextureDispose( event ) {

        var texture = event.target;

        texture.removeEventListener( 'dispose', onTextureDispose );

        deallocateTexture( texture );

        _infoMemory.textures --;


    }

    function onRenderTargetDispose( event ) {

        var renderTarget = event.target;

        renderTarget.removeEventListener( 'dispose', onRenderTargetDispose );

        deallocateRenderTarget( renderTarget );

        _infoMemory.textures --;

    }

    function onMaterialDispose( event ) {

        var material = event.target;

        material.removeEventListener( 'dispose', onMaterialDispose );

        deallocateMaterial( material );

    }

    // Buffer deallocation

    function deallocateTexture( texture ) {

        var textureProperties = properties.get( texture );

        if ( texture.image && textureProperties.__image__webglTextureCube ) {

            // cube texture

            _gl.deleteTexture( textureProperties.__image__webglTextureCube );

        } else {

            // 2D texture

            if ( textureProperties.__webglInit === undefined ) return;

            _gl.deleteTexture( textureProperties.__webglTexture );

        }

        // remove all webgl properties
        properties.delete( texture );

    }

    function deallocateRenderTarget( renderTarget ) {

        var renderTargetProperties = properties.get( renderTarget );
        var textureProperties = properties.get( renderTarget.texture );

        if ( ! renderTarget || textureProperties.__webglTexture === undefined ) return;

        _gl.deleteTexture( textureProperties.__webglTexture );

        if ( renderTarget instanceof THREE.WebGLRenderTargetCube ) {

            for ( var i = 0; i < 6; i ++ ) {

                _gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer[ i ] );
                _gl.deleteRenderbuffer( renderTargetProperties.__webglRenderbuffer[ i ] );

            }

        } else {

            _gl.deleteFramebuffer( renderTargetProperties.__webglFramebuffer );
            _gl.deleteRenderbuffer( renderTargetProperties.__webglRenderbuffer );

        }

        properties.delete( renderTarget.texture );
        properties.delete( renderTarget );

    }

    function deallocateMaterial( material ) {

        releaseMaterialProgramReference( material );

        properties.delete( material );

    }


    function releaseMaterialProgramReference( material ) {

        var programInfo = properties.get( material ).program;

        material.program = undefined;

        if ( programInfo !== undefined ) {

            programCache.releaseProgram( programInfo );

        }

    }

    // Buffer rendering

    this.renderBufferImmediate = function ( object, program, material ) {

        state.initAttributes();

        var buffers = properties.get( object );

        if ( object.hasPositions && ! buffers.position ) buffers.position = _gl.createBuffer();
        if ( object.hasNormals && ! buffers.normal ) buffers.normal = _gl.createBuffer();
        if ( object.hasUvs && ! buffers.uv ) buffers.uv = _gl.createBuffer();
        if ( object.hasColors && ! buffers.color ) buffers.color = _gl.createBuffer();

        var attributes = program.getAttributes();

        if ( object.hasPositions ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.position );
            _gl.bufferData( _gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW );

            state.enableAttribute( attributes.position );
            _gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

        }

        if ( object.hasNormals ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.normal );

            if ( material.type !== 'MeshPhongMaterial' && material.shading === THREE.FlatShading ) {

                for ( var i = 0, l = object.count * 3; i < l; i += 9 ) {

                    var array = object.normalArray;

                    var nx = ( array[ i + 0 ] + array[ i + 3 ] + array[ i + 6 ] ) / 3;
                    var ny = ( array[ i + 1 ] + array[ i + 4 ] + array[ i + 7 ] ) / 3;
                    var nz = ( array[ i + 2 ] + array[ i + 5 ] + array[ i + 8 ] ) / 3;

                    array[ i + 0 ] = nx;
                    array[ i + 1 ] = ny;
                    array[ i + 2 ] = nz;

                    array[ i + 3 ] = nx;
                    array[ i + 4 ] = ny;
                    array[ i + 5 ] = nz;

                    array[ i + 6 ] = nx;
                    array[ i + 7 ] = ny;
                    array[ i + 8 ] = nz;

                }

            }

            _gl.bufferData( _gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW );

            state.enableAttribute( attributes.normal );

            _gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );

        }

        if ( object.hasUvs && material.map ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.uv );
            _gl.bufferData( _gl.ARRAY_BUFFER, object.uvArray, _gl.DYNAMIC_DRAW );

            state.enableAttribute( attributes.uv );

            _gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );

        }

        if ( object.hasColors && material.vertexColors !== THREE.NoColors ) {

            _gl.bindBuffer( _gl.ARRAY_BUFFER, buffers.color );
            _gl.bufferData( _gl.ARRAY_BUFFER, object.colorArray, _gl.DYNAMIC_DRAW );

            state.enableAttribute( attributes.color );

            _gl.vertexAttribPointer( attributes.color, 3, _gl.FLOAT, false, 0, 0 );

        }

        state.disableUnusedAttributes();

        _gl.drawArrays( _gl.TRIANGLES, 0, object.count );

        object.count = 0;

    };

    this.renderBufferDirect = function ( camera, lights, fog, geometry, material, object, group ) {

        setMaterial( material );

        var program = setProgram( camera, lights, fog, material, object );

        var updateBuffers = false;
        var geometryProgram = geometry.id + '_' + program.id + '_' + material.wireframe;

        if ( geometryProgram !== _currentGeometryProgram ) {

            _currentGeometryProgram = geometryProgram;
            updateBuffers = true;

        }

        // morph targets

        var morphTargetInfluences = object.morphTargetInfluences;

        if ( morphTargetInfluences !== undefined ) {

            var activeInfluences = [];

            for ( var i = 0, l = morphTargetInfluences.length; i < l; i ++ ) {

                var influence = morphTargetInfluences[ i ];
                activeInfluences.push( [ influence, i ] );

            }

            activeInfluences.sort( numericalSort );

            if ( activeInfluences.length > 8 ) {

                activeInfluences.length = 8;

            }

            var morphAttributes = geometry.morphAttributes;

            for ( var i = 0, l = activeInfluences.length; i < l; i ++ ) {

                var influence = activeInfluences[ i ];
                morphInfluences[ i ] = influence[ 0 ];

                if ( influence[ 0 ] !== 0 ) {

                    var index = influence[ 1 ];

                    if ( material.morphTargets === true && morphAttributes.position ) geometry.addAttribute( 'morphTarget' + i, morphAttributes.position[ index ] );
                    if ( material.morphNormals === true && morphAttributes.normal ) geometry.addAttribute( 'morphNormal' + i, morphAttributes.normal[ index ] );

                } else {

                    if ( material.morphTargets === true ) geometry.removeAttribute( 'morphTarget' + i );
                    if ( material.morphNormals === true ) geometry.removeAttribute( 'morphNormal' + i );

                }

            }

            var uniforms = program.getUniforms();

            if ( uniforms.morphTargetInfluences !== null ) {

                _gl.uniform1fv( uniforms.morphTargetInfluences, morphInfluences );

            }

            updateBuffers = true;

        }

        //

        var index = geometry.index;
        var position = geometry.attributes.position;

        if ( material.wireframe === true ) {

            index = objects.getWireframeAttribute( geometry );

        }

        var renderer;

        if ( index !== null ) {

            renderer = indexedBufferRenderer;
            renderer.setIndex( index );

        } else {

            renderer = bufferRenderer;

        }

        if ( updateBuffers ) {

            setupVertexAttributes( material, program, geometry );

            if ( index !== null ) {

                _gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, objects.getAttributeBuffer( index ) );

            }

        }

        //

        var dataStart = 0;
        var dataCount = Infinity;

        if ( index !== null ) {

            dataCount = index.count

        } else if ( position !== undefined ) {

            dataCount = position.count;

        }

        var rangeStart = geometry.drawRange.start;
        var rangeCount = geometry.drawRange.count;

        var groupStart = group !== null ? group.start : 0;
        var groupCount = group !== null ? group.count : Infinity;

        var drawStart = Math.max( dataStart, rangeStart, groupStart );
        var drawEnd = Math.min( dataStart + dataCount, rangeStart + rangeCount, groupStart + groupCount ) - 1;

        var drawCount = Math.max( 0, drawEnd - drawStart + 1 );

        //

        if ( object instanceof THREE.Mesh ) {

            if ( material.wireframe === true ) {

                state.setLineWidth( material.wireframeLinewidth * pixelRatio );
                renderer.setMode( _gl.LINES );

            } else {

                renderer.setMode( _gl.TRIANGLES );

            }

            if ( geometry instanceof THREE.InstancedBufferGeometry && geometry.maxInstancedCount > 0 ) {

                renderer.renderInstances( geometry );

            } else {

                renderer.render( drawStart, drawCount );

            }

        } else if ( object instanceof THREE.Line ) {

            var lineWidth = material.linewidth;

            if ( lineWidth === undefined ) lineWidth = 1; // Not using Line*Material

            state.setLineWidth( lineWidth * pixelRatio );

            if ( object instanceof THREE.LineSegments ) {

                renderer.setMode( _gl.LINES );

            } else {

                renderer.setMode( _gl.LINE_STRIP );

            }

            renderer.render( drawStart, drawCount );

        } else if ( object instanceof THREE.Points ) {

            renderer.setMode( _gl.POINTS );
            renderer.render( drawStart, drawCount );

        }

    };

    function setupVertexAttributes( material, program, geometry, startIndex ) {

        var extension;

        if ( geometry instanceof THREE.InstancedBufferGeometry ) {

            extension = extensions.get( 'ANGLE_instanced_arrays' );

            if ( extension === null ) {

                console.error( 'THREE.WebGLIncrementRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
                return;

            }

        }

        if ( startIndex === undefined ) startIndex = 0;

        state.initAttributes();

        var geometryAttributes = geometry.attributes;

        var programAttributes = program.getAttributes();

        var materialDefaultAttributeValues = material.defaultAttributeValues;

        for ( var name in programAttributes ) {

            var programAttribute = programAttributes[ name ];

            if ( programAttribute >= 0 ) {

                var geometryAttribute = geometryAttributes[ name ];

                if ( geometryAttribute !== undefined ) {

                    var size = geometryAttribute.itemSize;
                    var buffer = objects.getAttributeBuffer( geometryAttribute );

                    if ( geometryAttribute instanceof THREE.InterleavedBufferAttribute ) {

                        var data = geometryAttribute.data;
                        var stride = data.stride;
                        var offset = geometryAttribute.offset;

                        if ( data instanceof THREE.InstancedInterleavedBuffer ) {

                            state.enableAttributeAndDivisor( programAttribute, data.meshPerAttribute, extension );

                            if ( geometry.maxInstancedCount === undefined ) {

                                geometry.maxInstancedCount = data.meshPerAttribute * data.count;

                            }

                        } else {

                            state.enableAttribute( programAttribute );

                        }

                        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
                        _gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, stride * data.array.BYTES_PER_ELEMENT, ( startIndex * stride + offset ) * data.array.BYTES_PER_ELEMENT );

                    } else {

                        if ( geometryAttribute instanceof THREE.InstancedBufferAttribute ) {

                            state.enableAttributeAndDivisor( programAttribute, geometryAttribute.meshPerAttribute, extension );

                            if ( geometry.maxInstancedCount === undefined ) {

                                geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

                            }

                        } else {

                            state.enableAttribute( programAttribute );

                        }

                        _gl.bindBuffer( _gl.ARRAY_BUFFER, buffer );
                        _gl.vertexAttribPointer( programAttribute, size, _gl.FLOAT, false, 0, startIndex * size * 4 ); // 4 bytes per Float32

                    }

                } else if ( materialDefaultAttributeValues !== undefined ) {

                    var value = materialDefaultAttributeValues[ name ];

                    if ( value !== undefined ) {

                        switch ( value.length ) {

                            case 2:
                                _gl.vertexAttrib2fv( programAttribute, value );
                                break;

                            case 3:
                                _gl.vertexAttrib3fv( programAttribute, value );
                                break;

                            case 4:
                                _gl.vertexAttrib4fv( programAttribute, value );
                                break;

                            default:
                                _gl.vertexAttrib1fv( programAttribute, value );

                        }

                    }

                }

            }

        }

        state.disableUnusedAttributes();

    }

    // Sorting

    function numericalSort ( a, b ) {

        return b[ 0 ] - a[ 0 ];

    }

    function painterSortStable ( a, b ) {

        if ( a.object.renderOrder !== b.object.renderOrder ) {

            return a.object.renderOrder - b.object.renderOrder;

        } else if ( a.material.id !== b.material.id ) {

            return a.material.id - b.material.id;

        } else if ( a.z !== b.z ) {

            return a.z - b.z;

        } else {

            return a.id - b.id;

        }

    }

    function reversePainterSortStable ( a, b ) {

        if ( a.object.renderOrder !== b.object.renderOrder ) {

            return a.object.renderOrder - b.object.renderOrder;

        } if ( a.z !== b.z ) {

            return b.z - a.z;

        } else {

            return a.id - b.id;

        }

    }

    // Rendering

    this.render = function ( scene, camera, renderTarget, forceClear ) {

        if ( camera instanceof THREE.Camera === false ) {

            console.error( 'THREE.WebGLIncrementRenderer.render: camera is not an instance of THREE.Camera.' );
            return;

        }

        var fog = scene.fog;

        // reset caching for this frame

        _currentGeometryProgram = '';
        _currentMaterialId = - 1;
        _currentCamera = null;
        _lightsNeedUpdate = true;

        // update scene graph

        if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

        // update camera matrices and frustum

        if ( camera.parent === null ) camera.updateMatrixWorld();

        camera.matrixWorldInverse.getInverse( camera.matrixWorld );

        _projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        _frustum.setFromMatrix( _projScreenMatrix );

        lights.length = 0;

        opaqueObjectsLastIndex = - 1;
        transparentObjectsLastIndex = - 1;

        sprites.length = 0;
        lensFlares.length = 0;

        projectObject( scene, camera );

        opaqueObjects.length = opaqueObjectsLastIndex + 1;
        transparentObjects.length = transparentObjectsLastIndex + 1;

        if ( _this.sortObjects === true ) {

            opaqueObjects.sort( painterSortStable );
            transparentObjects.sort( reversePainterSortStable );

        }

        //

        shadowMap.render( scene );

        //

        _infoRender.calls = 0;
        _infoRender.vertices = 0;
        _infoRender.faces = 0;
        _infoRender.points = 0;

        this.setRenderTarget( renderTarget );

        if ( this.autoClear || forceClear ) {

            this.clear( this.autoClearColor, this.autoClearDepth, this.autoClearStencil );

        }

        //

        if ( scene.overrideMaterial ) {

            var overrideMaterial = scene.overrideMaterial;

            renderObjects( opaqueObjects, camera, lights, fog, overrideMaterial );
            renderObjects( transparentObjects, camera, lights, fog, overrideMaterial );

        } else {

            // opaque pass (front-to-back order)

            state.setBlending( THREE.NoBlending );
            renderObjects( opaqueObjects, camera, lights, fog );

            // transparent pass (back-to-front order)

            renderObjects( transparentObjects, camera, lights, fog );

        }

        // custom render plugins (post pass)

        spritePlugin.render( scene, camera );
        lensFlarePlugin.render( scene, camera, _currentWidth, _currentHeight );

        // Generate mipmap if we're using any kind of mipmap filtering

        if ( renderTarget ) {

            var texture = renderTarget.texture;
            var isTargetPowerOfTwo = isPowerOfTwo( renderTarget );
            if ( texture.generateMipmaps && isTargetPowerOfTwo && texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) {

                updateRenderTargetMipmap( renderTarget );

            }

        }

        // Ensure depth buffer writing is enabled so it can be cleared on next render

        state.setDepthTest( true );
        state.setDepthWrite( true );
        state.setColorWrite( true );

        // _gl.finish();

    };


    // ------------------------------------------------------------------
    // 增加增量绘制支持

    // Rendering

    this.IncrementRender = function ( scene, camera, renderTarget, forceClear ) {

        if ( camera instanceof THREE.Camera === false ) {

            console.error( 'THREE.WebGLIncrementRenderer.IncrementRender: camera is not an instance of THREE.Camera.' );
            return;
        }

        var fog = scene.fog;

        if (incrementListDirty) {

            incrementListDirty = false;

            buildIncrementObjectList(scene, camera);

            //
            shadowMap.render( scene );

            //
            _infoRender.calls = 0;
            _infoRender.vertices = 0;
            _infoRender.faces = 0;
            _infoRender.points = 0;

            this.setRenderTarget( renderTarget );
        }

        if ( this.autoClear || forceClear ) {
            this.clear( this.autoClearColor, this.autoClearDepth, this.autoClearStencil );
        }

        //
        if ( scene.overrideMaterial ) {

            var overrideMaterial = scene.overrideMaterial;

            isOpaqueObjectsRenderFinish = renderIncrementObjects( opaqueObjects, camera, lights, fog, overrideMaterial );

            if ( isOpaqueObjectsRenderFinish ) {

                if ( !isTransparentObjectsRenderStart ) {
                    isTransparentObjectsRenderStart = true;
                    currentIncrementalListIdx = 0;
                }

                isTransparentObjectsRenderFinish = renderIncrementObjects( transparentObjects, camera, lights, fog, overrideMaterial, true);
            }


        } else {

            // opaque pass (front-to-back order)

            state.setBlending( THREE.NoBlending );

            if ( !isOpaqueObjectsRenderFinish ) {
                isOpaqueObjectsRenderFinish = renderIncrementObjects( opaqueObjects, camera, lights, fog );
            }

            // transparent pass (back-to-front order)

            if ( isOpaqueObjectsRenderFinish ) {

                if ( !isTransparentObjectsRenderStart ) {
                    isTransparentObjectsRenderStart = true;
                    currentIncrementalListIdx = 0;
                }

                isTransparentObjectsRenderFinish = renderIncrementObjects( transparentObjects, camera, lights, fog,  undefined,true );
            }
        }

        isIncrementalRenderFinish = (isOpaqueObjectsRenderFinish && isTransparentObjectsRenderFinish);

        if ( isIncrementalRenderFinish ) {

            if ( incrementPluginDirty ) {

                incrementPluginDirty = false;
                renderIncrementPluginObjects(scene, camera, renderTarget);
            }
        }

        // Ensure depth buffer writing is enabled so it can be cleared on next render
        state.setDepthTest( true );
        state.setDepthWrite( true );
        state.setColorWrite( true );

        // _gl.finish();

        return isIncrementalRenderFinish;

    };


    this.resetIncrementRender = function() {
        incrementListDirty = true;
        incrementPluginDirty = true;
        isOpaqueObjectsRenderFinish = false;
        isTransparentObjectsRenderFinish = false;
        isTransparentObjectsRenderStart = false;
        currentIncrementalListIdx = 0;
    };

    this.setLimitFrameTime = function( limitTime ) {
        limitFrameTime = limitTime;
    };

    this.setFilterObject = function(filterObject) {
        _filterObject = filterObject;
    };

    function isVisibleForFilter(node) {

        return _filterObject && _filterObject.isVisible(node);
    }

    function getOverridedMaterial(object) {

        if (_filterObject) {
            return _filterObject.getOverridedMaterial(object);
        }

        return null;
    }

    function buildIncrementObjectList( scene, camera) {

        _currentGeometryProgram = '';
        _currentMaterialId = - 1;
        _currentCamera = null;
        _lightsNeedUpdate = true;

        if ( scene.autoUpdate === true ) scene.updateMatrixWorld();

        // update camera matrices and frustum

        if ( camera.parent === null ) camera.updateMatrixWorld();

        camera.matrixWorldInverse.getInverse( camera.matrixWorld );

        _projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        _frustum.setFromMatrix( _projScreenMatrix );

        lights.length = 0;

        opaqueObjectsLastIndex = - 1;
        transparentObjectsLastIndex = - 1;

        sprites.length = 0;
        lensFlares.length = 0;

        projectObject( scene, camera );

        opaqueObjects.length = opaqueObjectsLastIndex + 1;
        transparentObjects.length = transparentObjectsLastIndex + 1;

        if ( _this.sortObjects === true ) {

            opaqueObjects.sort( painterSortStable );
            transparentObjects.sort( reversePainterSortStable );
        }
    }


    function renderIncrementPluginObjects(scene, camera, renderTarget) {

        spritePlugin.render(scene, camera);
        lensFlarePlugin.render(scene, camera, _currentWidth, _currentHeight);

        // Generate mipmap if we're using any kind of mipmap filtering

        if (renderTarget) {

            var texture = renderTarget.texture;
            var isTargetPowerOfTwo = isPowerOfTwo(renderTarget);
            if (texture.generateMipmaps && isTargetPowerOfTwo && texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter) {

                updateRenderTargetMipmap(renderTarget);

            }
        }
    }

    function renderIncrementObjects( renderList, camera, lights, fog, overrideMaterial, tansparent ) {

        var isRenderFinish = true;

        // 经过测试，Date.now() 比 performance.now() 快
        // 不过 Date.now() 会受系统程序执行阻塞
        //startTime = window.performance.now();
        startTime = Date.now();

        var l = renderList.length;
        //if (tansparent === undefined)
        //    l = Math.min(renderList.length, 20000);

        var i = currentIncrementalListIdx;
        for (; i < l; i++) {

            var renderItem = renderList[ i ];

            var object = renderItem.object;
            var geometry = renderItem.geometry;
            var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
            var group = renderItem.group;

            object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
            object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

            if ( object instanceof THREE.ImmediateRenderObject ) {

                setMaterial( material );

                var program = setProgram( camera, lights, fog, material, object );

                _currentGeometryProgram = '';

                object.render( function ( object ) {

                    _this.renderBufferImmediate( object, program, material );

                } );

            } else {

                _this.renderBufferDirect( camera, lights, fog, geometry, material, object, group );

            }

            if (i % 100 === 99) {
                //endTime = window.performance.now();
                endTime = Date.now();

                elapseTime = endTime - startTime;

                if (elapseTime > limitFrameTime) {

                    isRenderFinish = false;
                    currentIncrementalListIdx = i + 1;
                    //console.log("elapse time : " + elapseTime + ",my_idx = " + currentIncrementalListIdx);

                    break;
                }
            }
        }

        if (i === l - 1) {

            currentIncrementalListIdx = i + 1;
            isRenderFinish = true;
        }

        return isRenderFinish;
    }
    // ------------------------------------------------------------------


    function pushRenderItem( object, geometry, material, z, group ) {

        var array, index;

        // allocate the next position in the appropriate array

        if ( material.transparent ) {

            array = transparentObjects;
            index = ++ transparentObjectsLastIndex;

        } else {

            array = opaqueObjects;
            index = ++ opaqueObjectsLastIndex;

        }

        // recycle existing render item or grow the array

        var renderItem = array[ index ];

        if ( renderItem !== undefined ) {

            renderItem.id = object.id;
            renderItem.object = object;
            renderItem.geometry = geometry;
            renderItem.material = material;
            renderItem.z = _vector3.z;
            renderItem.group = group;

        } else {

            renderItem = {
                id: object.id,
                object: object,
                geometry: geometry,
                material: material,
                z: _vector3.z,
                group: group
            };

            // assert( index === array.length );
            array.push( renderItem );

        }

    }

    function projectObject( object, camera ) {

        if (object.visible === false) return;

        //Liwei: ignor groups
        var isGroup = object instanceof THREE.Group;

        if (!isGroup && (object.channels.mask & camera.channels.mask) !== 0) {

            if ( object instanceof THREE.Light ) {

                lights.push( object );

            } else if ( object instanceof THREE.Sprite ) {

                sprites.push( object );

            } else if ( object instanceof THREE.LensFlare ) {

                lensFlares.push( object );

            } else if ( object instanceof THREE.ImmediateRenderObject ) {

                if ( _this.sortObjects === true ) {

                    _vector3.setFromMatrixPosition( object.matrixWorld );
                    _vector3.applyProjection( _projScreenMatrix );

                }

                pushRenderItem( object, null, object.material, _vector3.z, null );

            } else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points ) {

                // 元素可见性过滤
                if (!isVisibleForFilter(object)) {
                    return;
                }

                if ( object instanceof THREE.SkinnedMesh ) {

                    object.skeleton.update();

                }

                if ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) {

                    //var material = object.material;

                    // 材质过滤
                    var material = getOverridedMaterial(object);
                    material = material || object.material;

                    if ( material.visible === true ) {

                        if ( _this.sortObjects === true ) {

                            if (!object.modelCenter) {

                                object.modelCenter = new THREE.Vector3();

                                if (object.boundingBox) {

                                    object.boundingBox.center(object.modelCenter);
                                    object.modelCenter.applyMatrix4(object.matrixWorld);
                                }
                                else {

                                    object.modelCenter.setFromMatrixPosition(object.matrixWorld);
                                }
                            }

                            _vector3.copy(object.modelCenter);

                            _vector3.applyProjection( _projScreenMatrix );

                            //console.log(_vector3.z);
                        }

                        var geometry = objects.update( object );

                        if ( material instanceof THREE.MeshFaceMaterial ) {

                            var groups = geometry.groups;
                            var materials = material.materials;

                            for ( var i = 0, l = groups.length; i < l; i ++ ) {

                                var group = groups[ i ];
                                var groupMaterial = materials[ group.materialIndex ];

                                if ( groupMaterial.visible === true ) {

                                    pushRenderItem( object, geometry, groupMaterial, _vector3.z, group );

                                }

                            }

                        } else {

                            pushRenderItem( object, geometry, material, _vector3.z, null );

                        }

                    }

                }

            }

        }

        var children = object.children;

        for ( var i = 0, l = children.length; i < l; i ++ ) {

            projectObject( children[ i ], camera );

        }

    }

    function renderObjects( renderList, camera, lights, fog, overrideMaterial ) {

        for ( var i = 0, l = renderList.length; i < l; i ++ ) {

            var renderItem = renderList[ i ];

            var object = renderItem.object;
            var geometry = renderItem.geometry;
            var material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
            var group = renderItem.group;

            object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
            object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

            if ( object instanceof THREE.ImmediateRenderObject ) {

                setMaterial( material );

                var program = setProgram( camera, lights, fog, material, object );

                _currentGeometryProgram = '';

                object.render( function ( object ) {

                    _this.renderBufferImmediate( object, program, material );

                } );

            } else {

                _this.renderBufferDirect( camera, lights, fog, geometry, material, object, group );

            }
        }
    }

    function initMaterial( material, lights, fog, object ) {

        var materialProperties = properties.get( material );

        var parameters = programCache.getParameters( material, lights, fog, object );
        var code = programCache.getProgramCode( material, parameters );

        var program = materialProperties.program;
        var programChange = true;

        if ( program === undefined ) {

            // new material
            material.addEventListener( 'dispose', onMaterialDispose );

        } else if ( program.code !== code ) {

            // changed glsl or parameters
            releaseMaterialProgramReference( material );

        } else if ( parameters.shaderID !== undefined ) {

            // same glsl and uniform list
            return;

        } else {

            // only rebuild uniform list
            programChange = false;

        }

        if ( programChange ) {

            if ( parameters.shaderID ) {

                var shader = THREE.ShaderLib[ parameters.shaderID ];

                materialProperties.__webglShader = {
                    name: material.type,
                    uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
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

            program = programCache.acquireProgram( material, parameters, code );

            materialProperties.program = program;
            material.program = program;

        }

        var attributes = program.getAttributes();

        if ( material.morphTargets ) {

            material.numSupportedMorphTargets = 0;

            for ( var i = 0; i < _this.maxMorphTargets; i ++ ) {

                if ( attributes[ 'morphTarget' + i ] >= 0 ) {

                    material.numSupportedMorphTargets ++;

                }

            }

        }

        if ( material.morphNormals ) {

            material.numSupportedMorphNormals = 0;

            for ( i = 0; i < _this.maxMorphNormals; i ++ ) {

                if ( attributes[ 'morphNormal' + i ] >= 0 ) {

                    material.numSupportedMorphNormals ++;

                }

            }

        }

        materialProperties.uniformsList = [];

        var uniformLocations = materialProperties.program.getUniforms();

        for ( var u in materialProperties.__webglShader.uniforms ) {

            var location = uniformLocations[ u ];

            if ( location ) {

                materialProperties.uniformsList.push( [ materialProperties.__webglShader.uniforms[ u ], location ] );

            }

        }

    }

    function setMaterial( material ) {

        setMaterialFaces( material );

        if ( material.transparent === true ) {

            state.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha );

        } else {

            state.setBlending( THREE.NoBlending );

        }

        state.setDepthFunc( material.depthFunc );
        state.setDepthTest( material.depthTest );
        state.setDepthWrite( material.depthWrite );
        state.setColorWrite( material.colorWrite );
        state.setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

    }

    function setMaterialFaces( material ) {

        material.side !== THREE.DoubleSide ? state.enable( _gl.CULL_FACE ) : state.disable( _gl.CULL_FACE );
        state.setFlipSided( material.side === THREE.BackSide );

    }

    function setProgram( camera, lights, fog, material, object ) {

        _usedTextureUnits = 0;

        var materialProperties = properties.get( material );

        if ( material.needsUpdate || ! materialProperties.program ) {

            initMaterial( material, lights, fog, object );
            material.needsUpdate = false;

        }

        var refreshProgram = false;
        var refreshMaterial = false;
        var refreshLights = false;

        var program = materialProperties.program,
            p_uniforms = program.getUniforms(),
            m_uniforms = materialProperties.__webglShader.uniforms;

        if ( program.id !== _currentProgram ) {

            _gl.useProgram( program.program );
            _currentProgram = program.id;

            refreshProgram = true;
            refreshMaterial = true;
            refreshLights = true;

        }

        if ( material.id !== _currentMaterialId ) {

            if ( _currentMaterialId === - 1 ) refreshLights = true;
            _currentMaterialId = material.id;

            refreshMaterial = true;

        }

        if ( refreshProgram || camera !== _currentCamera ) {

            _gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements );

            if ( capabilities.logarithmicDepthBuffer ) {

                _gl.uniform1f( p_uniforms.logDepthBufFC, 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

            }


            if ( camera !== _currentCamera ) _currentCamera = camera;

            // load material specific uniforms
            // (shader material also gets them for the sake of genericity)

            if ( material instanceof THREE.ShaderMaterial ||
                material instanceof THREE.MeshPhongMaterial ||
                material.envMap ) {

                if ( p_uniforms.cameraPosition !== undefined ) {

                    _vector3.setFromMatrixPosition( camera.matrixWorld );
                    _gl.uniform3f( p_uniforms.cameraPosition, _vector3.x, _vector3.y, _vector3.z );

                }

            }

            if ( material instanceof THREE.MeshPhongMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material instanceof THREE.MeshBasicMaterial ||
                material instanceof THREE.ShaderMaterial ||
                material.skinning ) {

                if ( p_uniforms.viewMatrix !== undefined ) {

                    _gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements );

                }

            }

        }

        // skinning uniforms must be set even if material didn't change
        // auto-setting of texture unit for bone texture must go before other textures
        // not sure why, but otherwise weird things happen

        if ( material.skinning ) {

            if ( object.bindMatrix && p_uniforms.bindMatrix !== undefined ) {

                _gl.uniformMatrix4fv( p_uniforms.bindMatrix, false, object.bindMatrix.elements );

            }

            if ( object.bindMatrixInverse && p_uniforms.bindMatrixInverse !== undefined ) {

                _gl.uniformMatrix4fv( p_uniforms.bindMatrixInverse, false, object.bindMatrixInverse.elements );

            }

            if ( capabilities.floatVertexTextures && object.skeleton && object.skeleton.useVertexTexture ) {

                if ( p_uniforms.boneTexture !== undefined ) {

                    var textureUnit = getTextureUnit();

                    _gl.uniform1i( p_uniforms.boneTexture, textureUnit );
                    _this.setTexture( object.skeleton.boneTexture, textureUnit );

                }

                if ( p_uniforms.boneTextureWidth !== undefined ) {

                    _gl.uniform1i( p_uniforms.boneTextureWidth, object.skeleton.boneTextureWidth );

                }

                if ( p_uniforms.boneTextureHeight !== undefined ) {

                    _gl.uniform1i( p_uniforms.boneTextureHeight, object.skeleton.boneTextureHeight );

                }

            } else if ( object.skeleton && object.skeleton.boneMatrices ) {

                if ( p_uniforms.boneGlobalMatrices !== undefined ) {

                    _gl.uniformMatrix4fv( p_uniforms.boneGlobalMatrices, false, object.skeleton.boneMatrices );

                }

            }

        }

        if ( refreshMaterial ) {

            // refresh uniforms common to several materials

            if ( fog && material.fog ) {

                refreshUniformsFog( m_uniforms, fog );

            }

            if ( material instanceof THREE.MeshPhongMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material.lights ) {

                if ( _lightsNeedUpdate ) {

                    refreshLights = true;
                    setupLights( lights, camera );
                    _lightsNeedUpdate = false;

                }

                if ( refreshLights ) {

                    refreshUniformsLights( m_uniforms, _lights );
                    markUniformsLightsNeedsUpdate( m_uniforms, true );

                } else {

                    markUniformsLightsNeedsUpdate( m_uniforms, false );

                }

            }

            if ( material instanceof THREE.MeshBasicMaterial ||
                material instanceof THREE.MeshLambertMaterial ||
                material instanceof THREE.MeshPhongMaterial ) {

                refreshUniformsCommon( m_uniforms, material );

            }

            // refresh single material specific uniforms

            if ( material instanceof THREE.LineBasicMaterial ) {

                refreshUniformsLine( m_uniforms, material );

            } else if ( material instanceof THREE.LineDashedMaterial ) {

                refreshUniformsLine( m_uniforms, material );
                refreshUniformsDash( m_uniforms, material );

            } else if ( material instanceof THREE.PointsMaterial ) {

                refreshUniformsParticle( m_uniforms, material );

            } else if ( material instanceof THREE.MeshPhongMaterial ) {

                refreshUniformsPhong( m_uniforms, material );

            } else if ( material instanceof THREE.MeshDepthMaterial ) {

                m_uniforms.mNear.value = camera.near;
                m_uniforms.mFar.value = camera.far;
                m_uniforms.opacity.value = material.opacity;

            } else if ( material instanceof THREE.MeshNormalMaterial ) {

                m_uniforms.opacity.value = material.opacity;

            }

            if ( object.receiveShadow && ! material._shadowPass ) {

                refreshUniformsShadow( m_uniforms, lights, camera );

            }

            // load common uniforms

            loadUniformsGeneric( materialProperties.uniformsList );

        }

        loadUniformsMatrices( p_uniforms, object );

        if ( p_uniforms.modelMatrix !== undefined ) {

            _gl.uniformMatrix4fv( p_uniforms.modelMatrix, false, object.matrixWorld.elements );

        }

        return program;

    }

    // Uniforms (refresh uniforms objects)

    function refreshUniformsCommon ( uniforms, material ) {

        uniforms.opacity.value = material.opacity;

        uniforms.diffuse.value = material.color;

        if ( material.emissive ) {

            uniforms.emissive.value = material.emissive;

        }

        uniforms.map.value = material.map;
        uniforms.specularMap.value = material.specularMap;
        uniforms.alphaMap.value = material.alphaMap;

        if ( material.aoMap ) {

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

        if ( material.map ) {

            uvScaleMap = material.map;

        } else if ( material.specularMap ) {

            uvScaleMap = material.specularMap;

        } else if ( material.displacementMap ) {

            uvScaleMap = material.displacementMap;

        } else if ( material.normalMap ) {

            uvScaleMap = material.normalMap;

        } else if ( material.bumpMap ) {

            uvScaleMap = material.bumpMap;

        } else if ( material.alphaMap ) {

            uvScaleMap = material.alphaMap;

        } else if ( material.emissiveMap ) {

            uvScaleMap = material.emissiveMap;

        }

        if ( uvScaleMap !== undefined ) {

            if ( uvScaleMap instanceof THREE.WebGLRenderTarget ) uvScaleMap = uvScaleMap.texture;
            var offset = uvScaleMap.offset;
            var repeat = uvScaleMap.repeat;

            uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

        }

        uniforms.envMap.value = material.envMap;
        uniforms.flipEnvMap.value = ( material.envMap instanceof THREE.WebGLRenderTargetCube ) ? 1 : - 1;

        uniforms.reflectivity.value = material.reflectivity;
        uniforms.refractionRatio.value = material.refractionRatio;

    }

    function refreshUniformsLine ( uniforms, material ) {

        uniforms.diffuse.value = material.color;
        uniforms.opacity.value = material.opacity;

    }

    function refreshUniformsDash ( uniforms, material ) {

        uniforms.dashSize.value = material.dashSize;
        uniforms.totalSize.value = material.dashSize + material.gapSize;
        uniforms.scale.value = material.scale;

    }

    function refreshUniformsParticle ( uniforms, material ) {

        uniforms.psColor.value = material.color;
        uniforms.opacity.value = material.opacity;
        uniforms.size.value = material.size;
        uniforms.scale.value = _canvas.height / 2.0; // TODO: Cache this.

        uniforms.map.value = material.map;

        if ( material.map !== null ) {

            var offset = material.map.offset;
            var repeat = material.map.repeat;

            uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

        }

    }

    function refreshUniformsFog ( uniforms, fog ) {

        uniforms.fogColor.value = fog.color;

        if ( fog instanceof THREE.Fog ) {

            uniforms.fogNear.value = fog.near;
            uniforms.fogFar.value = fog.far;

        } else if ( fog instanceof THREE.FogExp2 ) {

            uniforms.fogDensity.value = fog.density;

        }

    }

    function refreshUniformsPhong ( uniforms, material ) {

        uniforms.specular.value = material.specular;
        uniforms.shininess.value = Math.max( material.shininess, 1e-4 ); // to prevent pow( 0.0, 0.0 )

        if ( material.lightMap ) {

            uniforms.lightMap.value = material.lightMap;
            uniforms.lightMapIntensity.value = material.lightMapIntensity;

        }

        if ( material.emissiveMap ) {

            uniforms.emissiveMap.value = material.emissiveMap;

        }

        if ( material.bumpMap ) {

            uniforms.bumpMap.value = material.bumpMap;
            uniforms.bumpScale.value = material.bumpScale;

        }

        if ( material.normalMap ) {

            uniforms.normalMap.value = material.normalMap;
            uniforms.normalScale.value.copy( material.normalScale );

        }

        if ( material.displacementMap ) {

            uniforms.displacementMap.value = material.displacementMap;
            uniforms.displacementScale.value = material.displacementScale;
            uniforms.displacementBias.value = material.displacementBias;

        }

    }

    function refreshUniformsLights ( uniforms, lights ) {

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

    function markUniformsLightsNeedsUpdate ( uniforms, value ) {

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

    function refreshUniformsShadow ( uniforms, lights, camera ) {

        if ( uniforms.shadowMatrix ) {

            var j = 0;

            for ( var i = 0, il = lights.length; i < il; i ++ ) {

                var light = lights[ i ];

                if ( light.castShadow === true ) {

                    if ( light instanceof THREE.PointLight || light instanceof THREE.SpotLight || light instanceof THREE.DirectionalLight ) {

                        var shadow = light.shadow;

                        if ( light instanceof THREE.PointLight ) {

                            // for point lights we set the shadow matrix to be a translation-only matrix
                            // equal to inverse of the light's position
                            _vector3.setFromMatrixPosition( light.matrixWorld ).negate();
                            shadow.matrix.identity().setPosition( _vector3 );

                            // for point lights we set the sign of the shadowDarkness uniform to be negative
                            uniforms.shadowDarkness.value[ j ] = - shadow.darkness;

                        } else {

                            uniforms.shadowDarkness.value[ j ] = shadow.darkness;

                        }

                        uniforms.shadowMatrix.value[ j ] = shadow.matrix;
                        uniforms.shadowMap.value[ j ] = shadow.map;
                        uniforms.shadowMapSize.value[ j ] = shadow.mapSize;
                        uniforms.shadowBias.value[ j ] = shadow.bias;

                        j ++;

                    }

                }

            }

        }

    }

    // Uniforms (load to GPU)

    function loadUniformsMatrices ( uniforms, object ) {

        _gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object.modelViewMatrix.elements );

        if ( uniforms.normalMatrix ) {

            _gl.uniformMatrix3fv( uniforms.normalMatrix, false, object.normalMatrix.elements );

        }

    }

    function getTextureUnit() {

        var textureUnit = _usedTextureUnits;

        if ( textureUnit >= capabilities.maxTextures ) {

            console.warn( 'WebGLIncrementRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + capabilities.maxTextures );

        }

        _usedTextureUnits += 1;

        return textureUnit;

    }

    function loadUniformsGeneric ( uniforms ) {

        var texture, textureUnit;

        for ( var j = 0, jl = uniforms.length; j < jl; j ++ ) {

            var uniform = uniforms[ j ][ 0 ];

            // needsUpdate property is not added to all uniforms.
            if ( uniform.needsUpdate === false ) continue;

            var type = uniform.type;
            var value = uniform.value;
            var location = uniforms[ j ][ 1 ];

            switch ( type ) {

                case '1i':
                    _gl.uniform1i( location, value );
                    break;

                case '1f':
                    _gl.uniform1f( location, value );
                    break;

                case '2f':
                    _gl.uniform2f( location, value[ 0 ], value[ 1 ] );
                    break;

                case '3f':
                    _gl.uniform3f( location, value[ 0 ], value[ 1 ], value[ 2 ] );
                    break;

                case '4f':
                    _gl.uniform4f( location, value[ 0 ], value[ 1 ], value[ 2 ], value[ 3 ] );
                    break;

                case '1iv':
                    _gl.uniform1iv( location, value );
                    break;

                case '3iv':
                    _gl.uniform3iv( location, value );
                    break;

                case '1fv':
                    _gl.uniform1fv( location, value );
                    break;

                case '2fv':
                    _gl.uniform2fv( location, value );
                    break;

                case '3fv':
                    _gl.uniform3fv( location, value );
                    break;

                case '4fv':
                    _gl.uniform4fv( location, value );
                    break;

                case 'Matrix3fv':
                    _gl.uniformMatrix3fv( location, false, value );
                    break;

                case 'Matrix4fv':
                    _gl.uniformMatrix4fv( location, false, value );
                    break;

                //

                case 'i':

                    // single integer
                    _gl.uniform1i( location, value );

                    break;

                case 'f':

                    // single float
                    _gl.uniform1f( location, value );

                    break;

                case 'v2':

                    // single THREE.Vector2
                    _gl.uniform2f( location, value.x, value.y );

                    break;

                case 'v3':

                    // single THREE.Vector3
                    _gl.uniform3f( location, value.x, value.y, value.z );

                    break;

                case 'v4':

                    // single THREE.Vector4
                    _gl.uniform4f( location, value.x, value.y, value.z, value.w );

                    break;

                case 'c':

                    // single THREE.Color
                    _gl.uniform3f( location, value.r, value.g, value.b );

                    break;

                case 'iv1':

                    // flat array of integers (JS or typed array)
                    _gl.uniform1iv( location, value );

                    break;

                case 'iv':

                    // flat array of integers with 3 x N size (JS or typed array)
                    _gl.uniform3iv( location, value );

                    break;

                case 'fv1':

                    // flat array of floats (JS or typed array)
                    _gl.uniform1fv( location, value );

                    break;

                case 'fv':

                    // flat array of floats with 3 x N size (JS or typed array)
                    _gl.uniform3fv( location, value );

                    break;

                case 'v2v':

                    // array of THREE.Vector2

                    if ( uniform._array === undefined ) {

                        uniform._array = new Float32Array( 2 * value.length );

                    }

                    for ( var i = 0, i2 = 0, il = value.length; i < il; i ++, i2 += 2 ) {

                        uniform._array[ i2 + 0 ] = value[ i ].x;
                        uniform._array[ i2 + 1 ] = value[ i ].y;

                    }

                    _gl.uniform2fv( location, uniform._array );

                    break;

                case 'v3v':

                    // array of THREE.Vector3

                    if ( uniform._array === undefined ) {

                        uniform._array = new Float32Array( 3 * value.length );

                    }

                    for ( var i = 0, i3 = 0, il = value.length; i < il; i ++, i3 += 3 ) {

                        uniform._array[ i3 + 0 ] = value[ i ].x;
                        uniform._array[ i3 + 1 ] = value[ i ].y;
                        uniform._array[ i3 + 2 ] = value[ i ].z;

                    }

                    _gl.uniform3fv( location, uniform._array );

                    break;

                case 'v4v':

                    // array of THREE.Vector4

                    if ( uniform._array === undefined ) {

                        uniform._array = new Float32Array( 4 * value.length );

                    }

                    for ( var i = 0, i4 = 0, il = value.length; i < il; i ++, i4 += 4 ) {

                        uniform._array[ i4 + 0 ] = value[ i ].x;
                        uniform._array[ i4 + 1 ] = value[ i ].y;
                        uniform._array[ i4 + 2 ] = value[ i ].z;
                        uniform._array[ i4 + 3 ] = value[ i ].w;

                    }

                    _gl.uniform4fv( location, uniform._array );

                    break;

                case 'm3':

                    // single THREE.Matrix3
                    _gl.uniformMatrix3fv( location, false, value.elements );

                    break;

                case 'm3v':

                    // array of THREE.Matrix3

                    if ( uniform._array === undefined ) {

                        uniform._array = new Float32Array( 9 * value.length );

                    }

                    for ( var i = 0, il = value.length; i < il; i ++ ) {

                        value[ i ].flattenToArrayOffset( uniform._array, i * 9 );

                    }

                    _gl.uniformMatrix3fv( location, false, uniform._array );

                    break;

                case 'm4':

                    // single THREE.Matrix4
                    _gl.uniformMatrix4fv( location, false, value.elements );

                    break;

                case 'm4v':

                    // array of THREE.Matrix4

                    if ( uniform._array === undefined ) {

                        uniform._array = new Float32Array( 16 * value.length );

                    }

                    for ( var i = 0, il = value.length; i < il; i ++ ) {

                        value[ i ].flattenToArrayOffset( uniform._array, i * 16 );

                    }

                    _gl.uniformMatrix4fv( location, false, uniform._array );

                    break;

                case 't':

                    // single THREE.Texture (2d or cube)

                    texture = value;
                    textureUnit = getTextureUnit();

                    _gl.uniform1i( location, textureUnit );

                    if ( ! texture ) continue;

                    if ( texture instanceof THREE.CubeTexture ||
                        ( Array.isArray( texture.image ) && texture.image.length === 6 ) ) {

                        // CompressedTexture can have Array in image :/

                        setCubeTexture( texture, textureUnit );

                    } else if ( texture instanceof THREE.WebGLRenderTargetCube ) {

                        setCubeTextureDynamic( texture.texture, textureUnit );

                    } else if ( texture instanceof THREE.WebGLRenderTarget ) {

                        _this.setTexture( texture.texture, textureUnit );

                    } else {

                        _this.setTexture( texture, textureUnit );

                    }

                    break;

                case 'tv':

                    // array of THREE.Texture (2d or cube)

                    if ( uniform._array === undefined ) {

                        uniform._array = [];

                    }

                    for ( var i = 0, il = uniform.value.length; i < il; i ++ ) {

                        uniform._array[ i ] = getTextureUnit();

                    }

                    _gl.uniform1iv( location, uniform._array );

                    for ( var i = 0, il = uniform.value.length; i < il; i ++ ) {

                        texture = uniform.value[ i ];
                        textureUnit = uniform._array[ i ];

                        if ( ! texture ) continue;

                        if ( texture instanceof THREE.CubeTexture ||
                            ( texture.image instanceof Array && texture.image.length === 6 ) ) {

                            // CompressedTexture can have Array in image :/

                            setCubeTexture( texture, textureUnit );

                        } else if ( texture instanceof THREE.WebGLRenderTarget ) {

                            _this.setTexture( texture.texture, textureUnit );

                        } else if ( texture instanceof THREE.WebGLRenderTargetCube ) {

                            setCubeTextureDynamic( texture.texture, textureUnit );

                        } else {

                            _this.setTexture( texture, textureUnit );

                        }

                    }

                    break;

                default:

                    console.warn( 'THREE.WebGLIncrementRenderer: Unknown uniform type: ' + type );

            }

        }

    }

    function setColorLinear( array, offset, color, intensity ) {

        array[ offset + 0 ] = color.r * intensity;
        array[ offset + 1 ] = color.g * intensity;
        array[ offset + 2 ] = color.b * intensity;

    }

    function setupLights ( lights, camera ) {

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

        for ( l = 0, ll = lights.length; l < ll; l ++ ) {

            light = lights[ l ];

            color = light.color;
            intensity = light.intensity;
            distance = light.distance;

            if ( light instanceof THREE.AmbientLight ) {

                if ( ! light.visible ) continue;

                r += color.r;
                g += color.g;
                b += color.b;

            } else if ( light instanceof THREE.DirectionalLight ) {

                dirCount += 1;

                if ( ! light.visible ) continue;

                _direction.setFromMatrixPosition( light.matrixWorld );
                _vector3.setFromMatrixPosition( light.target.matrixWorld );
                _direction.sub( _vector3 );
                _direction.transformDirection( viewMatrix );

                dirOffset = dirLength * 3;

                dirPositions[ dirOffset + 0 ] = _direction.x;
                dirPositions[ dirOffset + 1 ] = _direction.y;
                dirPositions[ dirOffset + 2 ] = _direction.z;

                setColorLinear( dirColors, dirOffset, color, intensity );

                dirLength += 1;

            } else if ( light instanceof THREE.PointLight ) {

                pointCount += 1;

                if ( ! light.visible ) continue;

                pointOffset = pointLength * 3;

                setColorLinear( pointColors, pointOffset, color, intensity );

                _vector3.setFromMatrixPosition( light.matrixWorld );
                _vector3.applyMatrix4( viewMatrix );

                pointPositions[ pointOffset + 0 ] = _vector3.x;
                pointPositions[ pointOffset + 1 ] = _vector3.y;
                pointPositions[ pointOffset + 2 ] = _vector3.z;

                // distance is 0 if decay is 0, because there is no attenuation at all.
                pointDistances[ pointLength ] = distance;
                pointDecays[ pointLength ] = ( light.distance === 0 ) ? 0.0 : light.decay;

                pointLength += 1;

            } else if ( light instanceof THREE.SpotLight ) {

                spotCount += 1;

                if ( ! light.visible ) continue;

                spotOffset = spotLength * 3;

                setColorLinear( spotColors, spotOffset, color, intensity );

                _direction.setFromMatrixPosition( light.matrixWorld );
                _vector3.copy( _direction ).applyMatrix4( viewMatrix );

                spotPositions[ spotOffset + 0 ] = _vector3.x;
                spotPositions[ spotOffset + 1 ] = _vector3.y;
                spotPositions[ spotOffset + 2 ] = _vector3.z;

                spotDistances[ spotLength ] = distance;

                _vector3.setFromMatrixPosition( light.target.matrixWorld );
                _direction.sub( _vector3 );
                _direction.transformDirection( viewMatrix );

                spotDirections[ spotOffset + 0 ] = _direction.x;
                spotDirections[ spotOffset + 1 ] = _direction.y;
                spotDirections[ spotOffset + 2 ] = _direction.z;

                spotAnglesCos[ spotLength ] = Math.cos( light.angle );
                spotExponents[ spotLength ] = light.exponent;
                spotDecays[ spotLength ] = ( light.distance === 0 ) ? 0.0 : light.decay;

                spotLength += 1;

            } else if ( light instanceof THREE.HemisphereLight ) {

                hemiCount += 1;

                if ( ! light.visible ) continue;

                _direction.setFromMatrixPosition( light.matrixWorld );
                _direction.transformDirection( viewMatrix );

                hemiOffset = hemiLength * 3;

                hemiPositions[ hemiOffset + 0 ] = _direction.x;
                hemiPositions[ hemiOffset + 1 ] = _direction.y;
                hemiPositions[ hemiOffset + 2 ] = _direction.z;

                skyColor = light.color;
                groundColor = light.groundColor;

                setColorLinear( hemiSkyColors, hemiOffset, skyColor, intensity );
                setColorLinear( hemiGroundColors, hemiOffset, groundColor, intensity );

                hemiLength += 1;

            }

        }

        // null eventual remains from removed lights
        // (this is to avoid if in shader)

        for ( l = dirLength * 3, ll = Math.max( dirColors.length, dirCount * 3 ); l < ll; l ++ ) dirColors[ l ] = 0.0;
        for ( l = pointLength * 3, ll = Math.max( pointColors.length, pointCount * 3 ); l < ll; l ++ ) pointColors[ l ] = 0.0;
        for ( l = spotLength * 3, ll = Math.max( spotColors.length, spotCount * 3 ); l < ll; l ++ ) spotColors[ l ] = 0.0;
        for ( l = hemiLength * 3, ll = Math.max( hemiSkyColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiSkyColors[ l ] = 0.0;
        for ( l = hemiLength * 3, ll = Math.max( hemiGroundColors.length, hemiCount * 3 ); l < ll; l ++ ) hemiGroundColors[ l ] = 0.0;

        zlights.directional.length = dirLength;
        zlights.point.length = pointLength;
        zlights.spot.length = spotLength;
        zlights.hemi.length = hemiLength;

        zlights.ambient[ 0 ] = r;
        zlights.ambient[ 1 ] = g;
        zlights.ambient[ 2 ] = b;

    }

    // GL state setting

    this.setFaceCulling = function ( cullFace, frontFaceDirection ) {

        if ( cullFace === THREE.CullFaceNone ) {

            state.disable( _gl.CULL_FACE );

        } else {

            if ( frontFaceDirection === THREE.FrontFaceDirectionCW ) {

                _gl.frontFace( _gl.CW );

            } else {

                _gl.frontFace( _gl.CCW );

            }

            if ( cullFace === THREE.CullFaceBack ) {

                _gl.cullFace( _gl.BACK );

            } else if ( cullFace === THREE.CullFaceFront ) {

                _gl.cullFace( _gl.FRONT );

            } else {

                _gl.cullFace( _gl.FRONT_AND_BACK );

            }

            state.enable( _gl.CULL_FACE );

        }

    };

    // Textures

    function setTextureParameters ( textureType, texture, isImagePowerOfTwo ) {

        var extension;

        if ( isImagePowerOfTwo ) {

            _gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, paramThreeToGL( texture.wrapS ) );
            _gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, paramThreeToGL( texture.wrapT ) );

            _gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( texture.magFilter ) );
            _gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( texture.minFilter ) );

        } else {

            _gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
            _gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

            if ( texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping ) {

                console.warn( 'THREE.WebGLIncrementRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.', texture );

            }

            _gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, filterFallback( texture.magFilter ) );
            _gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, filterFallback( texture.minFilter ) );

            if ( texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) {

                console.warn( 'THREE.WebGLIncrementRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.', texture );

            }

        }

        extension = extensions.get( 'EXT_texture_filter_anisotropic' );

        if ( extension ) {

            if ( texture.type === THREE.FloatType && extensions.get( 'OES_texture_float_linear' ) === null ) return;
            if ( texture.type === THREE.HalfFloatType && extensions.get( 'OES_texture_half_float_linear' ) === null ) return;

            if ( texture.anisotropy > 1 || properties.get( texture ).__currentAnisotropy ) {

                _gl.texParameterf( textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min( texture.anisotropy, _this.getMaxAnisotropy() ) );
                properties.get( texture ).__currentAnisotropy = texture.anisotropy;

            }

        }

    }

    function uploadTexture( textureProperties, texture, slot ) {

        if ( textureProperties.__webglInit === undefined ) {

            textureProperties.__webglInit = true;

            texture.addEventListener( 'dispose', onTextureDispose );

            textureProperties.__webglTexture = _gl.createTexture();

            _infoMemory.textures ++;

        }

        state.activeTexture( _gl.TEXTURE0 + slot );
        state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );

        _gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );
        _gl.pixelStorei( _gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha );
        _gl.pixelStorei( _gl.UNPACK_ALIGNMENT, texture.unpackAlignment );

        texture.image = clampToMaxSize( texture.image, capabilities.maxTextureSize );

        if ( textureNeedsPowerOfTwo( texture ) && isPowerOfTwo( texture.image ) === false ) {

            texture.image = makePowerOfTwo( texture.image );

        }

        var image = texture.image,
            isImagePowerOfTwo = isPowerOfTwo( image ),
            glFormat = paramThreeToGL( texture.format ),
            glType = paramThreeToGL( texture.type );

        setTextureParameters( _gl.TEXTURE_2D, texture, isImagePowerOfTwo );

        var mipmap, mipmaps = texture.mipmaps;

        if ( texture instanceof THREE.DataTexture ) {

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels

            if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

                for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

                    mipmap = mipmaps[ i ];
                    state.texImage2D( _gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

                }

                texture.generateMipmaps = false;

            } else {

                state.texImage2D( _gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data );

            }

        } else if ( texture instanceof THREE.CompressedTexture ) {

            for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

                mipmap = mipmaps[ i ];

                if ( texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat ) {

                    if ( state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

                        state.compressedTexImage2D( _gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );

                    } else {

                        console.warn( "THREE.WebGLIncrementRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()" );

                    }

                } else {

                    state.texImage2D( _gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

                }

            }

        } else {

            // regular Texture (image, video, canvas)

            // use manually created mipmaps if available
            // if there are no manual mipmaps
            // set 0 level mipmap and then use GL to generate other mipmap levels

            if ( mipmaps.length > 0 && isImagePowerOfTwo ) {

                for ( var i = 0, il = mipmaps.length; i < il; i ++ ) {

                    mipmap = mipmaps[ i ];
                    state.texImage2D( _gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap );

                }

                texture.generateMipmaps = false;

            } else {

                state.texImage2D( _gl.TEXTURE_2D, 0, glFormat, glFormat, glType, texture.image );

            }

        }

        if ( texture.generateMipmaps && isImagePowerOfTwo ) _gl.generateMipmap( _gl.TEXTURE_2D );

        textureProperties.__version = texture.version;

        if ( texture.onUpdate ) texture.onUpdate( texture );

    }

    this.setTexture = function ( texture, slot ) {

        var textureProperties = properties.get( texture );

        if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

            var image = texture.image;

            if ( image === undefined ) {

                console.warn( 'THREE.WebGLIncrementRenderer: Texture marked for update but image is undefined', texture );
                return;

            }

            if ( image.complete === false ) {

                console.warn( 'THREE.WebGLIncrementRenderer: Texture marked for update but image is incomplete', texture );
                return;

            }

            uploadTexture( textureProperties, texture, slot );

            return;

        }

        state.activeTexture( _gl.TEXTURE0 + slot );
        state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );

    };

    function clampToMaxSize ( image, maxSize ) {

        if ( image.width > maxSize || image.height > maxSize ) {

            // Warning: Scaling through the canvas will only work with images that use
            // premultiplied alpha.

            var scale = maxSize / Math.max( image.width, image.height );

            var canvas = document.createElement( 'canvas' );
            canvas.width = Math.floor( image.width * scale );
            canvas.height = Math.floor( image.height * scale );

            var context = canvas.getContext( '2d' );
            context.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );

            console.warn( 'THREE.WebGLIncrementRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image );

            return canvas;

        }

        return image;

    }

    function isPowerOfTwo( image ) {

        return THREE.Math.isPowerOfTwo( image.width ) && THREE.Math.isPowerOfTwo( image.height );

    }

    function textureNeedsPowerOfTwo( texture ) {

        if ( texture.wrapS !== THREE.ClampToEdgeWrapping || texture.wrapT !== THREE.ClampToEdgeWrapping ) return true;
        if ( texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) return true;

        return false;

    }

    function makePowerOfTwo( image ) {

        if ( image instanceof HTMLImageElement || image instanceof HTMLCanvasElement ) {

            var canvas = document.createElement( 'canvas' );
            canvas.width = THREE.Math.nearestPowerOfTwo( image.width );
            canvas.height = THREE.Math.nearestPowerOfTwo( image.height );

            var context = canvas.getContext( '2d' );
            context.drawImage( image, 0, 0, canvas.width, canvas.height );

            console.warn( 'THREE.WebGLIncrementRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image );

            return canvas;

        }

        return image;

    }

    function setCubeTexture ( texture, slot ) {

        var textureProperties = properties.get( texture );

        if ( texture.image.length === 6 ) {

            if ( texture.version > 0 && textureProperties.__version !== texture.version ) {

                if ( ! textureProperties.__image__webglTextureCube ) {

                    texture.addEventListener( 'dispose', onTextureDispose );

                    textureProperties.__image__webglTextureCube = _gl.createTexture();

                    _infoMemory.textures ++;

                }

                state.activeTexture( _gl.TEXTURE0 + slot );
                state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

                _gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, texture.flipY );

                var isCompressed = texture instanceof THREE.CompressedTexture;
                var isDataTexture = texture.image[ 0 ] instanceof THREE.DataTexture;

                var cubeImage = [];

                for ( var i = 0; i < 6; i ++ ) {

                    if ( _this.autoScaleCubemaps && ! isCompressed && ! isDataTexture ) {

                        cubeImage[ i ] = clampToMaxSize( texture.image[ i ], capabilities.maxCubemapSize );

                    } else {

                        cubeImage[ i ] = isDataTexture ? texture.image[ i ].image : texture.image[ i ];

                    }

                }

                var image = cubeImage[ 0 ],
                    isImagePowerOfTwo = isPowerOfTwo( image ),
                    glFormat = paramThreeToGL( texture.format ),
                    glType = paramThreeToGL( texture.type );

                setTextureParameters( _gl.TEXTURE_CUBE_MAP, texture, isImagePowerOfTwo );

                for ( var i = 0; i < 6; i ++ ) {

                    if ( ! isCompressed ) {

                        if ( isDataTexture ) {

                            state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[ i ].width, cubeImage[ i ].height, 0, glFormat, glType, cubeImage[ i ].data );

                        } else {

                            state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[ i ] );

                        }

                    } else {

                        var mipmap, mipmaps = cubeImage[ i ].mipmaps;

                        for ( var j = 0, jl = mipmaps.length; j < jl; j ++ ) {

                            mipmap = mipmaps[ j ];

                            if ( texture.format !== THREE.RGBAFormat && texture.format !== THREE.RGBFormat ) {

                                if ( state.getCompressedTextureFormats().indexOf( glFormat ) > - 1 ) {

                                    state.compressedTexImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data );

                                } else {

                                    console.warn( "THREE.WebGLIncrementRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()" );

                                }

                            } else {

                                state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data );

                            }

                        }

                    }

                }

                if ( texture.generateMipmaps && isImagePowerOfTwo ) {

                    _gl.generateMipmap( _gl.TEXTURE_CUBE_MAP );

                }

                textureProperties.__version = texture.version;

                if ( texture.onUpdate ) texture.onUpdate( texture );

            } else {

                state.activeTexture( _gl.TEXTURE0 + slot );
                state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube );

            }

        }

    }

    function setCubeTextureDynamic ( texture, slot ) {

        state.activeTexture( _gl.TEXTURE0 + slot );
        state.bindTexture( _gl.TEXTURE_CUBE_MAP, properties.get( texture ).__webglTexture );

    }

    // Render targets

    function setupFrameBuffer ( framebuffer, renderTarget, textureTarget ) {

        _gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
        _gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, textureTarget, properties.get( renderTarget.texture ).__webglTexture, 0 );

    }

    function setupRenderBuffer ( renderbuffer, renderTarget ) {

        _gl.bindRenderbuffer( _gl.RENDERBUFFER, renderbuffer );

        if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

            _gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );
            _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

            /* For some reason this is not working. Defaulting to RGBA4.
             } else if ( ! renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

             _gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.STENCIL_INDEX8, renderTarget.width, renderTarget.height );
             _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );
             */

        } else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

            _gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height );
            _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

        } else {

            _gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.RGBA4, renderTarget.width, renderTarget.height );

        }

    }

    this.setRenderTarget = function ( renderTarget ) {

        var isCube = ( renderTarget instanceof THREE.WebGLRenderTargetCube );

        if ( renderTarget && properties.get( renderTarget ).__webglFramebuffer === undefined ) {

            var renderTargetProperties = properties.get( renderTarget );
            var textureProperties = properties.get( renderTarget.texture );

            if ( renderTarget.depthBuffer === undefined ) renderTarget.depthBuffer = true;
            if ( renderTarget.stencilBuffer === undefined ) renderTarget.stencilBuffer = true;

            renderTarget.addEventListener( 'dispose', onRenderTargetDispose );

            textureProperties.__webglTexture = _gl.createTexture();

            _infoMemory.textures ++;

            // Setup texture, create render and frame buffers

            var isTargetPowerOfTwo = isPowerOfTwo( renderTarget ),
                glFormat = paramThreeToGL( renderTarget.texture.format ),
                glType = paramThreeToGL( renderTarget.texture.type );

            if ( isCube ) {

                renderTargetProperties.__webglFramebuffer = [];
                renderTargetProperties.__webglRenderbuffer = [];

                state.bindTexture( _gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture );

                setTextureParameters( _gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo );

                for ( var i = 0; i < 6; i ++ ) {

                    renderTargetProperties.__webglFramebuffer[ i ] = _gl.createFramebuffer();
                    renderTargetProperties.__webglRenderbuffer[ i ] = _gl.createRenderbuffer();
                    state.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

                    setupFrameBuffer( renderTargetProperties.__webglFramebuffer[ i ], renderTarget, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i );
                    setupRenderBuffer( renderTargetProperties.__webglRenderbuffer[ i ], renderTarget );

                }

                if ( renderTarget.texture.generateMipmaps && isTargetPowerOfTwo ) _gl.generateMipmap( _gl.TEXTURE_CUBE_MAP );

            } else {

                renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();

                if ( renderTarget.shareDepthFrom ) {

                    renderTargetProperties.__webglRenderbuffer = renderTarget.shareDepthFrom.__webglRenderbuffer;

                } else {

                    renderTargetProperties.__webglRenderbuffer = _gl.createRenderbuffer();

                }

                state.bindTexture( _gl.TEXTURE_2D, textureProperties.__webglTexture );
                setTextureParameters( _gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo );

                state.texImage2D( _gl.TEXTURE_2D, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null );

                setupFrameBuffer( renderTargetProperties.__webglFramebuffer, renderTarget, _gl.TEXTURE_2D );

                if ( renderTarget.shareDepthFrom ) {

                    if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

                        _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer );

                    } else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

                        _gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderTargetProperties.__webglRenderbuffer );

                    }

                } else {

                    setupRenderBuffer( renderTargetProperties.__webglRenderbuffer, renderTarget );

                }

                if ( renderTarget.texture.generateMipmaps && isTargetPowerOfTwo ) _gl.generateMipmap( _gl.TEXTURE_2D );

            }

            // Release everything

            if ( isCube ) {

                state.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

            } else {

                state.bindTexture( _gl.TEXTURE_2D, null );

            }

            _gl.bindRenderbuffer( _gl.RENDERBUFFER, null );
            _gl.bindFramebuffer( _gl.FRAMEBUFFER, null );

        }

        var framebuffer, width, height, vx, vy;

        if ( renderTarget ) {

            var renderTargetProperties = properties.get( renderTarget );

            if ( isCube ) {

                framebuffer = renderTargetProperties.__webglFramebuffer[ renderTarget.activeCubeFace ];

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

        if ( framebuffer !== _currentFramebuffer ) {

            _gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
            _gl.viewport( vx, vy, width, height );

            _currentFramebuffer = framebuffer;

        }

        if ( isCube ) {

            var textureProperties = properties.get( renderTarget.texture );
            _gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, 0 );

        }

        _currentWidth = width;
        _currentHeight = height;

    };

    this.readRenderTargetPixels = function ( renderTarget, x, y, width, height, buffer ) {

        if ( renderTarget instanceof THREE.WebGLRenderTarget === false ) {

            console.error( 'THREE.WebGLIncrementRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.' );
            return;

        }

        var framebuffer = properties.get( renderTarget ).__webglFramebuffer;

        if ( framebuffer ) {

            var restore = false;

            if ( framebuffer !== _currentFramebuffer ) {

                _gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );

                restore = true;

            }

            try {

                var texture = renderTarget.texture;

                if ( texture.format !== THREE.RGBAFormat
                    && paramThreeToGL( texture.format ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_FORMAT ) ) {

                    console.error( 'THREE.WebGLIncrementRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.' );
                    return;

                }

                if ( texture.type !== THREE.UnsignedByteType
                    && paramThreeToGL( texture.type ) !== _gl.getParameter( _gl.IMPLEMENTATION_COLOR_READ_TYPE )
                    && ! ( texture.type === THREE.FloatType && extensions.get( 'WEBGL_color_buffer_float' ) )
                    && ! ( texture.type === THREE.HalfFloatType && extensions.get( 'EXT_color_buffer_half_float' ) ) ) {

                    console.error( 'THREE.WebGLIncrementRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.' );
                    return;

                }

                if ( _gl.checkFramebufferStatus( _gl.FRAMEBUFFER ) === _gl.FRAMEBUFFER_COMPLETE ) {

                    _gl.readPixels( x, y, width, height, paramThreeToGL( texture.format ), paramThreeToGL( texture.type ), buffer );

                } else {

                    console.error( 'THREE.WebGLIncrementRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.' );

                }

            } finally {

                if ( restore ) {

                    _gl.bindFramebuffer( _gl.FRAMEBUFFER, _currentFramebuffer );

                }

            }

        }

    };

    function updateRenderTargetMipmap( renderTarget ) {

        var target = renderTarget instanceof THREE.WebGLRenderTargetCube ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D;
        var texture = properties.get( renderTarget.texture ).__webglTexture;

        state.bindTexture( target, texture );
        _gl.generateMipmap( target );
        state.bindTexture( target, null );

    }

    // Fallback filters for non-power-of-2 textures

    function filterFallback ( f ) {

        if ( f === THREE.NearestFilter || f === THREE.NearestMipMapNearestFilter || f === THREE.NearestMipMapLinearFilter ) {

            return _gl.NEAREST;

        }

        return _gl.LINEAR;

    }

    // Map three.js constants to WebGL constants

    function paramThreeToGL ( p ) {

        var extension;

        if ( p === THREE.RepeatWrapping ) return _gl.REPEAT;
        if ( p === THREE.ClampToEdgeWrapping ) return _gl.CLAMP_TO_EDGE;
        if ( p === THREE.MirroredRepeatWrapping ) return _gl.MIRRORED_REPEAT;

        if ( p === THREE.NearestFilter ) return _gl.NEAREST;
        if ( p === THREE.NearestMipMapNearestFilter ) return _gl.NEAREST_MIPMAP_NEAREST;
        if ( p === THREE.NearestMipMapLinearFilter ) return _gl.NEAREST_MIPMAP_LINEAR;

        if ( p === THREE.LinearFilter ) return _gl.LINEAR;
        if ( p === THREE.LinearMipMapNearestFilter ) return _gl.LINEAR_MIPMAP_NEAREST;
        if ( p === THREE.LinearMipMapLinearFilter ) return _gl.LINEAR_MIPMAP_LINEAR;

        if ( p === THREE.UnsignedByteType ) return _gl.UNSIGNED_BYTE;
        if ( p === THREE.UnsignedShort4444Type ) return _gl.UNSIGNED_SHORT_4_4_4_4;
        if ( p === THREE.UnsignedShort5551Type ) return _gl.UNSIGNED_SHORT_5_5_5_1;
        if ( p === THREE.UnsignedShort565Type ) return _gl.UNSIGNED_SHORT_5_6_5;

        if ( p === THREE.ByteType ) return _gl.BYTE;
        if ( p === THREE.ShortType ) return _gl.SHORT;
        if ( p === THREE.UnsignedShortType ) return _gl.UNSIGNED_SHORT;
        if ( p === THREE.IntType ) return _gl.INT;
        if ( p === THREE.UnsignedIntType ) return _gl.UNSIGNED_INT;
        if ( p === THREE.FloatType ) return _gl.FLOAT;

        extension = extensions.get( 'OES_texture_half_float' );

        if ( extension !== null ) {

            if ( p === THREE.HalfFloatType ) return extension.HALF_FLOAT_OES;

        }

        if ( p === THREE.AlphaFormat ) return _gl.ALPHA;
        if ( p === THREE.RGBFormat ) return _gl.RGB;
        if ( p === THREE.RGBAFormat ) return _gl.RGBA;
        if ( p === THREE.LuminanceFormat ) return _gl.LUMINANCE;
        if ( p === THREE.LuminanceAlphaFormat ) return _gl.LUMINANCE_ALPHA;

        if ( p === THREE.AddEquation ) return _gl.FUNC_ADD;
        if ( p === THREE.SubtractEquation ) return _gl.FUNC_SUBTRACT;
        if ( p === THREE.ReverseSubtractEquation ) return _gl.FUNC_REVERSE_SUBTRACT;

        if ( p === THREE.ZeroFactor ) return _gl.ZERO;
        if ( p === THREE.OneFactor ) return _gl.ONE;
        if ( p === THREE.SrcColorFactor ) return _gl.SRC_COLOR;
        if ( p === THREE.OneMinusSrcColorFactor ) return _gl.ONE_MINUS_SRC_COLOR;
        if ( p === THREE.SrcAlphaFactor ) return _gl.SRC_ALPHA;
        if ( p === THREE.OneMinusSrcAlphaFactor ) return _gl.ONE_MINUS_SRC_ALPHA;
        if ( p === THREE.DstAlphaFactor ) return _gl.DST_ALPHA;
        if ( p === THREE.OneMinusDstAlphaFactor ) return _gl.ONE_MINUS_DST_ALPHA;

        if ( p === THREE.DstColorFactor ) return _gl.DST_COLOR;
        if ( p === THREE.OneMinusDstColorFactor ) return _gl.ONE_MINUS_DST_COLOR;
        if ( p === THREE.SrcAlphaSaturateFactor ) return _gl.SRC_ALPHA_SATURATE;

        extension = extensions.get( 'WEBGL_compressed_texture_s3tc' );

        if ( extension !== null ) {

            if ( p === THREE.RGB_S3TC_DXT1_Format ) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if ( p === THREE.RGBA_S3TC_DXT1_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if ( p === THREE.RGBA_S3TC_DXT3_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if ( p === THREE.RGBA_S3TC_DXT5_Format ) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

        }

        extension = extensions.get( 'WEBGL_compressed_texture_pvrtc' );

        if ( extension !== null ) {

            if ( p === THREE.RGB_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            if ( p === THREE.RGB_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            if ( p === THREE.RGBA_PVRTC_4BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            if ( p === THREE.RGBA_PVRTC_2BPPV1_Format ) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

        }

        extension = extensions.get( 'EXT_blend_minmax' );

        if ( extension !== null ) {

            if ( p === THREE.MinEquation ) return extension.MIN_EXT;
            if ( p === THREE.MaxEquation ) return extension.MAX_EXT;

        }

        return 0;

    }

    // DEPRECATED

    this.supportsFloatTextures = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
        return extensions.get( 'OES_texture_float' );

    };

    this.supportsHalfFloatTextures = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
        return extensions.get( 'OES_texture_half_float' );

    };

    this.supportsStandardDerivatives = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
        return extensions.get( 'OES_standard_derivatives' );

    };

    this.supportsCompressedTextureS3TC = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
        return extensions.get( 'WEBGL_compressed_texture_s3tc' );

    };

    this.supportsCompressedTexturePVRTC = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
        return extensions.get( 'WEBGL_compressed_texture_pvrtc' );

    };

    this.supportsBlendMinMax = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
        return extensions.get( 'EXT_blend_minmax' );

    };

    this.supportsVertexTextures = function () {

        return capabilities.vertexTextures;

    };

    this.supportsInstancedArrays = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
        return extensions.get( 'ANGLE_instanced_arrays' );

    };

    //

    this.initMaterial = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .initMaterial() has been removed.' );

    };

    this.addPrePlugin = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .addPrePlugin() has been removed.' );

    };

    this.addPostPlugin = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .addPostPlugin() has been removed.' );

    };

    this.updateShadowMap = function () {

        console.warn( 'THREE.WebGLIncrementRenderer: .updateShadowMap() has been removed.' );

    };

    Object.defineProperties( this, {
        shadowMapEnabled: {
            get: function () {

                return shadowMap.enabled;

            },
            set: function ( value ) {

                console.warn( 'THREE.WebGLIncrementRenderer: .shadowMapEnabled is now .shadowMap.enabled.' );
                shadowMap.enabled = value;

            }
        },
        shadowMapType: {
            get: function () {

                return shadowMap.type;

            },
            set: function ( value ) {

                console.warn( 'THREE.WebGLIncrementRenderer: .shadowMapType is now .shadowMap.type.' );
                shadowMap.type = value;

            }
        },
        shadowMapCullFace: {
            get: function () {

                return shadowMap.cullFace;

            },
            set: function ( value ) {

                console.warn( 'THREE.WebGLIncrementRenderer: .shadowMapCullFace is now .shadowMap.cullFace.' );
                shadowMap.cullFace = value;

            }
        },
        shadowMapDebug: {
            get: function () {

                return shadowMap.debug;

            },
            set: function ( value ) {

                console.warn( 'THREE.WebGLIncrementRenderer: .shadowMapDebug is now .shadowMap.debug.' );
                shadowMap.debug = value;

            }
        }
    } );

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

CLOUD.Animation = function () {

    var _scope = this;
    var _object = null;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _duration = 1000;
    var _startTime = null;
    var _isPlaying = false;
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

        _isPlaying = true;
        _onStartCallbackFired = false;

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
            //    //console.log("unitZ");
            //    middle.crossVectors(start , unitZ).normalize();
            //} else {
            //    //console.log("unitX");
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
                //console.log("[slerpInterpolate][isconic]");
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
/*
For three.js r73
 */
CloudUniformsLib = {
    cust_clip: {
        iClipPlane: { type: "i", value: 0 },
        vClipPlane: { type: "v4", value: new THREE.Vector4(0, 0, 1, 0) }
    },
    cus_Instanced:{
        transformMatrix: { type: "m4", value: new THREE.Matrix4() }
    }
};
CloudShaderChunk = {
    cust_clip_pars_vertex: "#ifdef USE_CUSTOMCLIP\n\n    uniform vec4 vClipPlane; \n\n    uniform int iClipPlane; \n\n    varying float fClipDistance;\n\n#endif\n",
    cust_clip_pars_fragment: "#ifdef USE_CUSTOMCLIP\n\n    uniform int iClipPlane; \n\n    varying float fClipDistance;\n\n#endif\n",
    cust_clip_vertex: "#ifdef USE_CUSTOMCLIP\n\n    if(iClipPlane >0) {\n        fClipDistance = dot(worldPosition.xyz, vClipPlane.xyz) + vClipPlane.w;\n    }\n#endif\n",
    cust_clip_fragment: "#ifdef USE_CUSTOMCLIP\n\n    if(iClipPlane >0 && fClipDistance > 0.0) {\n\n        discard;\n\n    }\n\n#endif\n",

    cust_Instanced_pars_vertex:"#ifdef USE_CUST_INSTANCED\n\n    attribute vec4 componentV1;\nattribute vec4 componentV2;\nattribute vec4 componentV3;\nattribute vec4 componentV4;\n#endif\n",
    cust_Instanced_normal_vertex:"#ifdef USE_CUST_INSTANCED\n\n\tmat4 modelTransMatrix = mat4(componentV1, componentV2, componentV3,componentV4);\n\t objectNormal = inverseTransformDirection(objectNormal, modelTransMatrix);\n#endif\n",
    cust_Instanced_vertex:"#ifdef USE_CUST_INSTANCED\n\n\tvec4 newposition = mat4(componentV1, componentV2, componentV3,componentV4) * vec4( transformed, 1.0 );\n\t transformed = newposition.xyz;\n#endif\n",

    cust_Instanced_pars_vertex2:"#ifdef USE_CUST_INSTANCED\n\n  uniform mat4 transformMatrix; \n#endif\n",
    cust_Instanced_vertex2:"#ifdef USE_CUST_INSTANCED\n\n\tvec4 newposition = transformMatrix * vec4( transformed, 1.0 );\n\t transformed = newposition.xyz;\n#endif\n"

};
CloudShaderLibs = {};

CloudShaderLibs.r73 = {
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

            CloudUniformsLib["cust_clip"],

            {
                "emissive": { type: "c", value: new THREE.Color(0x000000) },
                "specular": { type: "c", value: new THREE.Color(0x111111) },
                "shininess": { type: "f", value: 30 }
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

            CloudShaderChunk["cust_clip_pars_vertex"],
            CloudShaderChunk["cust_Instanced_pars_vertex"],

            "void main() {",

            THREE.ShaderChunk["uv_vertex"],
            THREE.ShaderChunk["uv2_vertex"],
            THREE.ShaderChunk["color_vertex"],

            THREE.ShaderChunk["beginnormal_vertex"],
            CloudShaderChunk["cust_Instanced_normal_vertex"],
            THREE.ShaderChunk["morphnormal_vertex"],
            THREE.ShaderChunk["skinbase_vertex"],
            THREE.ShaderChunk["skinnormal_vertex"],
            THREE.ShaderChunk["defaultnormal_vertex"],

            "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

            "    vNormal = normalize( transformedNormal );",

            "#endif",

            THREE.ShaderChunk["begin_vertex"],
            CloudShaderChunk["cust_Instanced_vertex"],
            THREE.ShaderChunk["displacementmap_vertex"],
            THREE.ShaderChunk["morphtarget_vertex"],
            THREE.ShaderChunk["skinning_vertex"],
            THREE.ShaderChunk["project_vertex"],
            THREE.ShaderChunk["logdepthbuf_vertex"],

            "    vViewPosition = - mvPosition.xyz;",

            THREE.ShaderChunk["worldpos_vertex"],

            CloudShaderChunk["cust_clip_vertex"],
            THREE.ShaderChunk["envmap_vertex"],
            THREE.ShaderChunk["lights_phong_vertex"],
            THREE.ShaderChunk["shadowmap_vertex"],

            "}"

        ].join("\n"),

        fragmentShader: [
            "#define USE_CUSTOMCLIP",
            CloudShaderChunk["cust_clip_pars_fragment"],

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
            CloudShaderChunk["cust_clip_fragment"],

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
            CloudUniformsLib["cust_clip"],
            CloudUniformsLib["cus_Instanced"]
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
            CloudShaderChunk["cust_clip_pars_vertex"],
            CloudShaderChunk["cust_Instanced_pars_vertex2"],
            //CloudShaderChunk["cust_Instanced_pars_vertex"],

            "void main() {",

            THREE.ShaderChunk["uv_vertex"],
            THREE.ShaderChunk["uv2_vertex"],
            THREE.ShaderChunk["color_vertex"],
            THREE.ShaderChunk["skinbase_vertex"],

            "    #ifdef USE_ENVMAP",

            THREE.ShaderChunk["beginnormal_vertex"],
            CloudShaderChunk["cust_Instanced_normal_vertex"],
            THREE.ShaderChunk["morphnormal_vertex"],
            THREE.ShaderChunk["skinnormal_vertex"],
            THREE.ShaderChunk["defaultnormal_vertex"],

            "    #endif",


            THREE.ShaderChunk["begin_vertex"],
            CloudShaderChunk["cust_Instanced_vertex2"],
            //CloudShaderChunk["cust_Instanced_vertex"],
            THREE.ShaderChunk["morphtarget_vertex"],
            THREE.ShaderChunk["skinning_vertex"],
            THREE.ShaderChunk["project_vertex"],
            THREE.ShaderChunk["logdepthbuf_vertex"],

            THREE.ShaderChunk["worldpos_vertex"],
            "vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );",
            CloudShaderChunk["cust_clip_vertex"],
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
            CloudShaderChunk["cust_clip_pars_fragment"],

            "void main() {",
            CloudShaderChunk["cust_clip_fragment"],

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
};

CloudShaderLib = CloudShaderLibs['r' + THREE.REVISION];
if (CloudShaderLib === undefined) {
    console.log('custom clip not implemented for three.js r' + THREE.REVISION + ' yet!');
}

CLOUD.MaterialUtil = {

    createInstancePhongMaterial: function (matObj) {
        // 复制一份，不影响其他模型的使用
        // 不复制一份，有模型绘制不出
        var material = matObj.clone();
        material.type = "phong_instanced";
        material.uniforms = CloudShaderLib.phong_cust_clip.uniforms;
        material.vertexShader = "#define USE_CUST_INSTANCED \n" + CloudShaderLib.phong_cust_clip.vertexShader;
        material.fragmentShader = "#define USE_CUST_INSTANCED \n" + CloudShaderLib.phong_cust_clip.fragmentShader;
        return material;
    },

    updateBasicMaterial: function (material, instanced) {
        if (instanced) {
            material.vertexShader = "#define USE_CUST_INSTANCED \n" + CloudShaderLib.base_cust_clip.vertexShader;
            material.fragmentShader = "#define USE_CUST_INSTANCED \n" + CloudShaderLib.base_cust_clip.fragmentShader;
        }
        else {
            material.vertexShader = CloudShaderLib.base_cust_clip.vertexShader;
            material.fragmentShader = CloudShaderLib.base_cust_clip.fragmentShader;
        }

        material.needsUpdate = true;
    },

    setMatrixUniform: function(transform) {
        CloudShaderLib.base_cust_clip.uniforms.transformMatrix.value = transform;
    },

    createHilightMaterial: function () {

        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true, side: THREE.DoubleSide, polygonOffset: true, depthTest: true, polygonOffsetFactor: -2, polygonOffsetUnits: -1 });
        if (CloudShaderLib !== undefined) {
            material.type = 'base_cust_clip';
            material.uniforms = CloudShaderLib.base_cust_clip.uniforms;
            material.vertexShader = CloudShaderLib.base_cust_clip.vertexShader;
            material.fragmentShader = CloudShaderLib.base_cust_clip.fragmentShader;
        }

        return material;
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

        position.fromArray(str2float(camera.camera_position.split(",")));
        var dir = new THREE.Vector3();
        dir.fromArray(str2float(camera.camera_direction.split(",")));
        var up = new THREE.Vector3();
        up.fromArray(str2float(camera.camera_up.split(",")));

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
    }
};

CLOUD.Camera = function (width, height, fov, near, far, orthoNear, orthoFar) {

    THREE.CombinedCamera.call(this, width, height, fov, near, far, orthoNear, orthoFar);

    this.positionPlane = new THREE.Plane();
};

CLOUD.Camera.prototype = Object.create(THREE.CombinedCamera.prototype);
CLOUD.Camera.prototype.constructor = CLOUD.Camera;

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
    var target = bbox.center();
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

CLOUD.Camera.prototype.zoomToBBox = function (bbox) {
    var boxSize = bbox.size();
    var radius = Math.sqrt(Math.pow(boxSize.x, 2) + Math.pow(boxSize.y, 2) + Math.pow(boxSize.z, 2)) * 0.5;
    var distToCenter = radius / Math.sin(Math.PI / 180.0 * this.fov * 0.5);
    var offset = new THREE.Vector3();
    offset.copy(this.getWorldDirection());
    offset.setLength(distToCenter);
    var center = bbox.center();

    var position = new THREE.Vector3();
    position.subVectors(center, offset);
    this.position.copy(position);

    this.lookAt(center);
    this.updateProjectionMatrix();

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
    if (this.inPerspectiveMode) {
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
CLOUD.ClipWidget = function (plane, center) {
    THREE.Object3D.call(this);

    this.uniforms = CloudShaderLib.phong_cust_clip.uniforms;
    this.uniforms.vClipPlane.value.copy(plane);
    this.clipplane = new THREE.Vector4();
    this.clipplane.copy(plane);
    this.center = new THREE.Vector3();
    this.center.copy(center);

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
        CloudShaderLib.base_cust_clip.uniforms.iClipPlane.value = enabled;
        if (clipplane !== undefined) {
            CloudShaderLib.base_cust_clip.uniforms.vClipPlane.value.copy(clipplane);
        }
        if (m !== undefined) {
            CloudShaderLib.base_cust_clip.uniforms.vClipPlane.value.applyMatrix4(m);
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
        this.uniforms.vClipPlane.value.copy(this.clipplane);
        this.uniforms.vClipPlane.value.applyMatrix4(m);

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

        tmpClipplane = this.uniforms.vClipPlane.value;
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
        var v4 = this.uniforms.vClipPlane.value;
        plane.setComponents(v4.x, v4.y, v4.z, v4.w);

        return { sign: ray.direction.dot(plane.normal) < 0, distance: ray.distanceToPlane(plane) };
    };
};

CLOUD.ClipWidget.prototype = Object.create(THREE.Object3D.prototype);
CLOUD.ClipWidget.prototype.constructor = CLOUD.ClipWidget;


CLOUD.ViewHouse = function (viewer) {

    var scope = this;

    this.viewer = viewer;
    // Mouse buttons
    this.mouseButtons = {LEFT: THREE.MOUSE.LEFT, RIGHT: THREE.MOUSE.RIGHT};
    this.visible = true;
    this.isAnimationFinish = true; // 是否动画结束
    this.pickedColor = 0xb1d1ec;
    this.width = 0;
    this.height = 0;

    var houseContainer, renderer;

    // House 尺寸规格
    var enumSizeMode = {
        Big: 0,
        Medium: 1,
        Small: 2
    };

    // House 尺寸
    var enumSize = {
        Big: 220,
        Medium: 165,
        Small: 110
    };

    var enumViewMode = {
        Home: 0,
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

    // 房屋各构件名字
    var componentNames = {
        Compass: "compass",
        Home: "home",
        BottomFloor: "Bottom_Floor",
        BottomSouth: "Bottom_South",
        BottomNorth: "Bottom_North",
        BottomEast: "Bottom_East",
        BottomWest: "Bottom_West",
        BottomSouthEast: "Bottom_SouthEast",
        BottomSouthWest: "Bottom_SouthWest",
        BottomNorthWest: "Bottom_NorthWest",
        BottomNorthEast: "Bottom_NorthEast",
        MiddleSouth: "Middle_South",
        MiddleNorth: "Middle_North",
        MiddleEast: "Middle_East",
        MiddleWest: "Middle_West",
        MiddleSouthEast: "Middle_SouthEast",
        MiddleSouthWest: "Middle_SouthWest",
        MiddleNorthWest: "Middle_NorthWest",
        MiddleNorthEast: "Middle_NorthEast",
        MiddleDoor: "Middle_Door",
        MiddleRightWindow: "Middle_RightWindow",
        MiddleLeftWindow: "Middle_LeftWindow",
        RoofCenter: "Roof_Center",
        RoofSouth: "Roof_South",
        RoofNorth: "Roof_North",
        RoofEast: "Roof_East",
        RoofWest: "Roof_West",
        RoofEaves: "Roof_Eaves",
        RoofSouthEast: "Roof_SouthEast",
        RoofSouthWest: "Roof_SouthWest",
        RoofNorthWest: "Roof_NorthWest",
        RoofNorthEast: "Roof_NorthEast",
        ControlPointNorth: "ControlPoint_North",
        ControlPointSouth: "ControlPoint_South",
        ControlPointEast: "ControlPoint_East",
        ControlPointWest: "ControlPoint_West",
        ControlRingNorthEast: "ControlRing_NorthEast",
        ControlRingSouthWest: "ControlRing_SouthWest",
        ControlRingNorthWest: "ControlRing_NorthWest",
        ControlRingSouthEast: "ControlRing_SouthEast"
    };

    var threshold = 0.0001; // 精度阈值 (1e-4)

    // house
    var houseScene = new THREE.Scene();
    var houseCamera = new THREE.OrthographicCamera(-enumSize.Big / 2, enumSize.Big / 2, enumSize.Big / 2, -enumSize.Big / 2, -enumSize.Big / 2, enumSize.Big / 2);
    var houseRaycaster = new THREE.Raycaster();

    // home(Billboard)
    var homeScene = new THREE.Scene();
    var homeCamera = houseCamera.clone(); // 克隆一份，这样鼠标位置可以通用
    var homeRaycaster = new THREE.Raycaster();

    var groupCompass = new THREE.Group(); // 指北针组
    var groupControlRing = new THREE.Group(); // 控制圆环组
    var groupHouse = new THREE.Group(); // 房屋组
    var groupHome = new THREE.Group(); // 主页组
    var groupPick = new THREE.Group(); // 参与挑选
    var groupHightLight = new THREE.Group(); // 高亮组

    // 保存初始位置
    var groupControlRingPos = new THREE.Vector3();
    var groupHightLightPos = new THREE.Vector3();

    // ------ 状态保存 S ------ //
    // 门
    var houseDoorMesh = null;
    var houseDoorColor = null;
    // 前墙
    var houseFrontMesh = null;
    var houseFrontColor = null;
    // 左窗
    var HouseLeftWindowMesh = null;
    var houseLeftWindowColor = null;
    // 右窗
    var houseRightWindowMesh = null;
    var houseRightWindowColor = null;
    // 左墙
    var houseLeftMesh = null;
    var houseLeftColor = null;
    // 右墙
    var houseRightMesh = null;
    var houseRightColor = null;

    // 高亮圆环
    var highLightRingRadius = 0;
    var highlightRingMesh = null;
    var highlightRingQuat = null;
    var highlightRingPos = null;

    // 高亮圆环控制点
    var highlightPointMesh = null;
    var highlightPointQuat = null;
    var highlightPointPos = null;

    // 高亮圆环箭头
    var highlightArrowMesh = null;
    var highlightArrowQuat = null;
    var highlightArrowPos = null;
    // ------ 状态保存 E ------ //

    // 注意启用禁用和显示隐藏的区别：启用禁用由外部用户决定；显示隐藏由是否标准视图模式来决定。
    // 启用禁用优先级高。
    var isEnableCompass = true; // 是否启用或禁用指北针
    var isShowHome = false; // 是否显示home
    var isRotate = false; // 旋转控制
    var isTransparent = true; // 是否透明
    var opacityCoe = 0.6; // 不透明度

    // 保持旋转量
    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var mouseCoord = new THREE.Vector2();
    var hasPickedObject = false;
    var lastPickedObjectName = ""; // 上次选中对象的名字
    var Intersected = null;

    var viewHouseRadius = 110; // 最大半径
    var halfHeight = 0; // 房屋半高
    var halfWidth = 0; // 房屋前后墙半宽
    var lineWidth = 5; // 线宽

    var currentViewMode = -1; // 当前观察模式

    var lastMouseOverHouse = false;

    /// 构造房屋线框
    // @param {object} container 父容器
    // @param {Array} vertices 顶点集
    // @param {Array} indices 索引集
    // @param {Number} color 颜色
    // @returns
    var createWireFrame = function (container, vertices, indices, color, lineWidth) {

        var len = vertices.length;
        var positions = new Float32Array(len * 3);

        for (var i = 0; i < len; ++i) {
            positions[i * 3] = vertices[i].x;
            positions[i * 3 + 1] = vertices[i].y;
            positions[i * 3 + 2] = vertices[i].z;
        }

        var geometry = new THREE.BufferGeometry();

        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

        var material = new THREE.LineBasicMaterial({color: color, linewidth: lineWidth});
        var mesh = new THREE.Line(geometry, material);
        container.add(mesh);
    };

    // 保持需要特殊处理的mesh
    var holdSpecialMesh = function (name, mesh, color) {
        // 特殊处理
        if (name === componentNames.MiddleDoor) {
            houseDoorMesh = mesh;
            houseDoorColor = color;
        }
        if (name === componentNames.MiddleSouth) {
            houseFrontMesh = mesh;
            houseFrontColor = color;
        }
        if (name === componentNames.MiddleLeftWindow) {
            HouseLeftWindowMesh = mesh;
            houseLeftWindowColor = color;
        }
        if (name === componentNames.MiddleRightWindow) {
            houseRightWindowMesh = mesh;
            houseRightWindowColor = color;
        }
        if (name === componentNames.MiddleWest) {
            houseLeftMesh = mesh;
            houseLeftColor = color;
        }
        if (name === componentNames.MiddleEast) {
            houseRightMesh = mesh;
            houseRightColor = color;
        }
    };

    /// 构造房屋面
    // @param {object} container 父容器
    // @param {Array} vertices 顶点集
    // @param {Array} indices 索引集
    // @param {Number} color 颜色
    // @returns
    var createMesh = function (container, vertices, indices, color, name) {

        var geometry = new THREE.Geometry();
        var vertex;
        var face;
        var offset = 0;
        var len = vertices.length;

        while (offset < len) {

            vertex = new THREE.Vector3();
            vertex = vertices[offset++];
            geometry.vertices.push(vertex);
        }

        offset = 0;
        len = indices.length;

        while (offset < len) {

            face = new THREE.Face3();
            face.a = indices[offset++];
            face.b = indices[offset++];
            face.c = indices[offset++];

            geometry.faces.push(face);
        }

        var material = new THREE.MeshBasicMaterial({color: color/*, side: THREE.DoubleSide*/});
        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;

        // 保持需要特殊处理的mesh
        holdSpecialMesh(name, mesh, color);

        container.add(mesh);
    };

    // 构造房屋
    var createHouse = function () {

        // ----------- 房屋 ----------- //
        // 房屋颜色
        var houseWallColor = 0xe7e7ec;
        var houseDoorRoofColor = 0x99a4b5;
        var houseWireFrameColor = 0x787878;
        // 墙
        var houseWallLength = 85.0;// 左右墙间宽度(长)
        var houseWallWidth = 70.0;// 前后墙间宽度(宽)
        var houseWallHeight = 50.0; // 墙高(高)
        // 门槛
        var houseSillHeight = 6.0;
        var houseSillBottomWidth = 54.0;
        var houseSillBottomDepth = 12.0;
        var houseSillTopWidth = 42.0;
        var houseSillTopDepth = 6.0;
        // 门
        var houseDoorWidth = 30.0;
        var houseDoorHeight = 28.0;
        // 窗
        var houseWindowWidth = 25.0;
        // 房檐
        var houseRoofTopLength = 54.0; // 上房檐左右宽度(长)
        var houseRoofTopWidth = 42.0; // 上房檐前后宽度(宽)
        var houseRoofBottomLength = 100.0; // 下房檐左右宽度(长)
        var houseRoofBottomWidth = 80.0; // 下房檐前后宽度(宽)
        var houseRoofHeight = 30.0;// 房顶高度
        // 房屋高度
        var houseHeight = houseWallHeight + houseRoofHeight; // 房屋总高度
        var houseHalfHeight = houseHeight / 2; // 房屋半高
        var houseCornerWidth = 9.0;// 房屋角落宽度

        halfHeight = houseHalfHeight; // 保持半高
        halfWidth = houseWallWidth / 2;

        // 房子坐北朝南(门在南)，相机从南往北看
        // 以向上为Z轴正方向，North为Y轴正方向，East为X轴正方向建立模型：房子前墙在Y负方向，后墙在Y正方向。
        // -----------------------------------
        //                  N (Y 正)
        //                   ^
        //                  |
        //     W  < ------- |------- >  E （X 正）
        //                  |
        //                  v
        //                S
        // -----------------------------------


        // 以中心点为基准
        var wallFarOffsetX = houseWallLength / 2.0;
        var wallNearOffsetX = houseWallLength / 2.0 - houseCornerWidth;
        var wallFarOffsetY = houseWallWidth / 2.0;
        var wallNearOffsetY = houseWallWidth / 2.0 - houseCornerWidth;

        // ------ House Bottom ------ //
        var bottomNearOffsetZ = houseHalfHeight - houseCornerWidth;
        var bottomFarOffsetZ = houseHalfHeight;

        // 1-1. South (Front)
        var sillBottomNearOffsetX = houseSillBottomWidth / 2.0;
        var sillBottomFarOffsetY = houseWallWidth / 2.0 + houseSillBottomDepth + 0.01;
        var sillBottomNearOffsetY = houseWallWidth / 2.0 + 0.01;
        var sillBottomNearOffsetZ = houseHalfHeight - houseSillHeight;
        var sillBottomFarOffsetZ = houseHalfHeight;

        var sillTopNearOffsetX = houseSillTopWidth / 2.0;
        var sillTopFarOffsetY = houseWallWidth / 2.0 + houseSillTopDepth + 0.01;
        var sillTopNearOffsetY = houseWallWidth / 2.0 + 0.01;
        var sillTopNearOffsetZ = houseHalfHeight - houseSillHeight * 2;
        var sillTopFarOffsetZ = houseHalfHeight - houseSillHeight;

        var bottomSouthFace = [];
        // sill bottom
        bottomSouthFace.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomNearOffsetZ));
        // sill top
        bottomSouthFace.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopFarOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopNearOffsetZ));
        bottomSouthFace.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopNearOffsetZ));
        var bottomSouthFaceIndex = [
            4, 5, 6, 6, 7, 4, 5, 1, 2, 2, 6, 5, 0, 4, 7, 7, 3, 0, 7, 6, 2, 2, 3, 7, 0, 1, 5, 5, 4, 0,
            12, 13, 14, 14, 15, 12, 13, 9, 10, 10, 14, 13, 8, 12, 15, 15, 11, 8, 15, 14, 10, 10, 11, 15, 8, 9, 13, 13, 12, 8];
        //var bottomSouthFaceWireIndex = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

        // 1-2. South East
        var bottomSouthEastFace = [];
        bottomSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, -bottomNearOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, -bottomNearOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -bottomNearOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomSouthEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        var bottomSouthEastFaceIndex = [0, 3, 2, 2, 1, 0, 3, 0, 5, 5, 4, 3, 0, 1, 6, 6, 5, 0];
        //var bottomSouthEastFaceWireIndex = [ 0, 1, 2, 3, 4, 5, 6 ];

        // 1-3. East (Right)
        var bottomEastFace = [];
        bottomEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -bottomNearOffsetZ));
        bottomEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -bottomNearOffsetZ));
        bottomEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomEastFace.push(new THREE.Vector3(wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        var bottomEastFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3];

        // 1-4. North East
        var bottomNorthEastFace = [];
        bottomNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -bottomNearOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomNorthEastFace.push(new THREE.Vector3(wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        var bottomNorthEastFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3, 0, 5, 6, 6, 1, 0];

        // 1-5. North (Back)
        var bottomNorthFace = [];
        bottomNorthFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthFace.push(new THREE.Vector3(wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomNorthFace.push(new THREE.Vector3(-wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        var bottomNorthFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3];

        // 1-6. North West
        var bottomNorthWestFace = [];
        bottomNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, -bottomNearOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -bottomNearOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomNorthWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        var bottomNorthWestFaceIndex = [0, 3, 2, 2, 1, 0, 3, 0, 5, 5, 4, 3, 0, 1, 6, 6, 5, 0];

        // 1-7. West (Left)
        var bottomWestFace = [];
        bottomWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -bottomNearOffsetZ));
        bottomWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -bottomNearOffsetZ));
        bottomWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        var bottomWestFaceIndex = [0, 3, 2, 2, 1, 0, 3, 0, 5, 5, 4, 3];

        // 1-8. South West
        var bottomSouthWestFace = [];
        bottomSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, -bottomNearOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, -bottomNearOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -bottomNearOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        bottomSouthWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallNearOffsetY, -bottomFarOffsetZ));
        var bottomSouthWestFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3, 0, 5, 6, 6, 1, 0];

        // 1-9. Floor
        var bottomFloorFace = [];
        bottomFloorFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        bottomFloorFace.push(new THREE.Vector3(-wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomFloorFace.push(new THREE.Vector3(wallNearOffsetX, wallNearOffsetY, -bottomFarOffsetZ));
        bottomFloorFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        var bottomFloorFaceIndex = [0, 1, 2, 2, 3, 0];

        // ----- House Middle -----
        var middleFarOffsetZ = houseHalfHeight - houseCornerWidth;
        var middleNearOffsetZ = houseWallHeight - houseHalfHeight;

        // 2-1. South (Front)
        var middleSouthFace = [];
        middleSouthFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        middleSouthFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        middleSouthFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        middleSouthFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        var middleSouthFaceIndex = [0, 1, 2, 2, 3, 0];

        // 2-2. South East
        var middleSouthEastFace = [];
        middleSouthEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, -middleFarOffsetZ));
        middleSouthEastFace.push(new THREE.Vector3(wallNearOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        middleSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        middleSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, -middleFarOffsetZ));
        middleSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -middleFarOffsetZ));
        middleSouthEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, middleNearOffsetZ));
        var middleSouthEastFaceIndex = [0, 3, 2, 2, 1, 0, 3, 4, 5, 5, 2, 3];

        // 2-3. East (Right)
        // Wall
        var middleEastFace = [];
        middleEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, -middleFarOffsetZ));
        middleEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -middleFarOffsetZ));
        middleEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, middleNearOffsetZ));
        middleEastFace.push(new THREE.Vector3(wallFarOffsetX, -wallNearOffsetY, middleNearOffsetZ));
        var middleEastFaceIndex = [0, 1, 2, 2, 3, 0];

        // 2-4. North East
        var middleNorthEastFace = [];
        middleNorthEastFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthEastFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, middleNearOffsetZ));
        middleNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, middleNearOffsetZ));
        middleNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, -middleFarOffsetZ));
        middleNorthEastFace.push(new THREE.Vector3(wallFarOffsetX, wallNearOffsetY, middleNearOffsetZ));
        var middleNorthEastFaceIndex = [0, 1, 2, 2, 3, 0, 3, 2, 5, 5, 4, 3];

        // 2-5. North (Back)
        var middleNorthFace = [];
        middleNorthFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthFace.push(new THREE.Vector3(wallNearOffsetX, wallFarOffsetY, middleNearOffsetZ));
        middleNorthFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, middleNearOffsetZ));
        var middleNorthFaceIndex = [0, 3, 2, 2, 1, 0];

        // 2-6. North West
        var middleNorthWestFace = [];
        middleNorthWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthWestFace.push(new THREE.Vector3(-wallNearOffsetX, wallFarOffsetY, middleNearOffsetZ));
        middleNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, middleNearOffsetZ));
        middleNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, -middleFarOffsetZ));
        middleNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -middleFarOffsetZ));
        middleNorthWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, middleNearOffsetZ));
        var middleNorthWestFaceIndex = [0, 3, 2, 2, 1, 0, 3, 4, 5, 5, 2, 3];

        // 2-7. West (Left)
        // Wall
        var middleWestFace = [];
        middleWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -middleFarOffsetZ));
        middleWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, -middleFarOffsetZ));
        middleWestFace.push(new THREE.Vector3(-wallFarOffsetX, wallNearOffsetY, middleNearOffsetZ));
        middleWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, middleNearOffsetZ));
        var middleWestFaceIndex = [0, 3, 2, 2, 1, 0];

        // 2-8. South West
        var middleSouthWestFace = [];
        middleSouthWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, -middleFarOffsetZ));
        middleSouthWestFace.push(new THREE.Vector3(-wallNearOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        middleSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, middleNearOffsetZ));
        middleSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, -middleFarOffsetZ));
        middleSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, -middleFarOffsetZ));
        middleSouthWestFace.push(new THREE.Vector3(-wallFarOffsetX, -wallNearOffsetY, middleNearOffsetZ));
        var middleSouthWestFaceIndex = [0, 1, 2, 2, 3, 0, 3, 2, 5, 5, 4, 3];

        // Door
        var doorFarOffsetX = houseDoorWidth / 2.0;
        var doorFarOffsetY = wallFarOffsetY + 0.01;
        var doorNearOffsetZ = houseSillHeight * 2 + houseDoorHeight - houseHalfHeight;
        var doorFarOffsetZ = houseHalfHeight - houseSillHeight * 2;
        var middleDoorFace = [];
        middleDoorFace.push(new THREE.Vector3(-doorFarOffsetX, -doorFarOffsetY, -doorFarOffsetZ));
        middleDoorFace.push(new THREE.Vector3(doorFarOffsetX, -doorFarOffsetY, -doorFarOffsetZ));
        middleDoorFace.push(new THREE.Vector3(doorFarOffsetX, -doorFarOffsetY, doorNearOffsetZ));
        middleDoorFace.push(new THREE.Vector3(-doorFarOffsetX, -doorFarOffsetY, doorNearOffsetZ));
        var middleDoorFaceIndex = [0, 1, 2, 2, 3, 0];

        // Right Window
        var windowFarOffsetX = wallFarOffsetX + 0.01;
        var windowFarOffsetY = houseWindowWidth / 2.0;
        var windowFarOffsetZ = houseSillHeight * 2 + houseDoorHeight - houseHalfHeight;
        var windowNearOffsetZ = houseSillHeight * 2 + houseDoorHeight - houseWindowWidth - houseHalfHeight;
        var middleRightWindowFace = [];
        middleRightWindowFace.push(new THREE.Vector3(windowFarOffsetX, -windowFarOffsetY, windowNearOffsetZ));
        middleRightWindowFace.push(new THREE.Vector3(windowFarOffsetX, windowFarOffsetY, windowNearOffsetZ));
        middleRightWindowFace.push(new THREE.Vector3(windowFarOffsetX, windowFarOffsetY, windowFarOffsetZ));
        middleRightWindowFace.push(new THREE.Vector3(windowFarOffsetX, -windowFarOffsetY, windowFarOffsetZ));
        var middleRightWindowFaceIndex = [0, 1, 2, 2, 3, 0];

        // Left Window
        var middleLeftWindowFace = [];
        middleLeftWindowFace.push(new THREE.Vector3(-windowFarOffsetX, -windowFarOffsetY, windowNearOffsetZ));
        middleLeftWindowFace.push(new THREE.Vector3(-windowFarOffsetX, windowFarOffsetY, windowNearOffsetZ));
        middleLeftWindowFace.push(new THREE.Vector3(-windowFarOffsetX, windowFarOffsetY, windowFarOffsetZ));
        middleLeftWindowFace.push(new THREE.Vector3(-windowFarOffsetX, -windowFarOffsetY, windowFarOffsetZ));
        var middleLeftWindowFaceIndex = [0, 3, 2, 2, 1, 0];

        // ----- House Roof -----
        var roofBottomFarOffsetX = houseRoofBottomLength / 2.0;
        var roofBottomNearOffsetX = houseRoofBottomLength / 2.0 - houseCornerWidth;
        var roofBottomFarOffsetY = houseRoofBottomWidth / 2.0;
        var roofBottomNearOffsetY = houseRoofBottomWidth / 2.0 - houseCornerWidth;

        var roofTopFarOffsetX = houseRoofTopLength / 2.0;
        var roofTopNearOffsetX = houseRoofTopLength / 2.0 - houseCornerWidth;
        var roofTopFarOffsetY = houseRoofTopWidth / 2.0;
        var roofTopNearOffsetY = houseRoofTopWidth / 2.0 - houseCornerWidth;

        var roofFarOffsetZ = houseHalfHeight;
        var roofNearOffsetZ = houseWallHeight - houseHalfHeight;

        // 3-1. South (Front)
        var roofSouthFace = [];
        roofSouthFace.push(new THREE.Vector3(-roofBottomNearOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthFace.push(new THREE.Vector3(roofBottomNearOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthFace.push(new THREE.Vector3(roofTopNearOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofSouthFace.push(new THREE.Vector3(roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        var roofSouthFaceIndex = [0, 1, 2, 0, 2, 3, 4, 3, 2, 4, 2, 5];

        // 3-2. South East
        var roofSouthEastFace = [];
        roofSouthEastFace.push(new THREE.Vector3(roofTopFarOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofTopFarOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofTopNearOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofBottomNearOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, -roofBottomNearOffsetY, roofNearOffsetZ));
        var roofSouthEastFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3, 0, 5, 6, 6, 1, 0];

        // 3-3. East (Right)
        var roofEastFace = [];
        roofEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, -roofBottomNearOffsetY, roofNearOffsetZ));
        roofEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, roofBottomNearOffsetY, roofNearOffsetZ));
        roofEastFace.push(new THREE.Vector3(roofTopFarOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofEastFace.push(new THREE.Vector3(roofTopFarOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofEastFace.push(new THREE.Vector3(roofTopFarOffsetX - houseCornerWidth, -roofTopNearOffsetY, roofFarOffsetZ));
        roofEastFace.push(new THREE.Vector3(roofTopFarOffsetX - houseCornerWidth, roofTopNearOffsetY, roofFarOffsetZ));
        var roofEastFaceIndex = [0, 1, 2, 0, 2, 3, 4, 3, 2, 4, 2, 5];

        // 3-4. North East
        var roofNorthEastFace = [];
        roofNorthEastFace.push(new THREE.Vector3(roofTopFarOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofTopFarOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofTopNearOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofBottomNearOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthEastFace.push(new THREE.Vector3(roofBottomFarOffsetX, roofBottomNearOffsetY, roofNearOffsetZ));
        var roofNorthEastFaceIndex = [0, 3, 2, 2, 1, 0, 3, 0, 5, 5, 4, 3, 0, 1, 6, 6, 5, 0];

        // 3-5. North (Back)
        var roofNorthFace = [];
        roofNorthFace.push(new THREE.Vector3(roofBottomNearOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthFace.push(new THREE.Vector3(-roofBottomNearOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthFace.push(new THREE.Vector3(roofTopNearOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthFace.push(new THREE.Vector3(roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofNorthFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        var roofNorthFaceIndex = [0, 1, 2, 0, 2, 3, 4, 3, 2, 4, 2, 5];

        // 3-6. North West
        var roofNorthWestFace = [];
        roofNorthWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofBottomNearOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofNorthWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, roofBottomNearOffsetY, roofNearOffsetZ));
        var roofNorthWestFaceIndex = [0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 0, 3, 0, 5, 6, 6, 1, 0];

        // 3-7. West (Left)
        var roofWestFace = [];
        roofWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, roofBottomNearOffsetY, roofNearOffsetZ));
        roofWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, -roofBottomNearOffsetY, roofNearOffsetZ));
        roofWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        var roofWestFaceIndex = [0, 1, 2, 0, 2, 3, 4, 3, 2, 4, 2, 5];

        // 3-8. South West
        var roofSouthWestFace = [];
        roofSouthWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofTopFarOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofBottomNearOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofSouthWestFace.push(new THREE.Vector3(-roofBottomFarOffsetX, -roofBottomNearOffsetY, roofNearOffsetZ));
        var roofSouthWestFaceIndex = [0, 3, 2, 2, 1, 0, 3, 0, 5, 5, 4, 3, 0, 1, 6, 6, 5, 0];

        // 3-9. Roof Top
        // Center
        var roofCenterFace = [];
        roofCenterFace.push(new THREE.Vector3(roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofCenterFace.push(new THREE.Vector3(-roofTopNearOffsetX, -roofTopNearOffsetY, roofFarOffsetZ));
        roofCenterFace.push(new THREE.Vector3(-roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        roofCenterFace.push(new THREE.Vector3(roofTopNearOffsetX, roofTopNearOffsetY, roofFarOffsetZ));
        var roofCenterFaceIndex = [0, 2, 1, 0, 3, 2];

        // Eaves bottom
        var roofEavesFace = [];
        roofEavesFace.push(new THREE.Vector3(roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(-roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(-roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, roofNearOffsetZ));
        roofEavesFace.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, roofNearOffsetZ));
        var roofEavesFaceIndex = [0, 4, 5, 5, 1, 0, 1, 5, 6, 6, 2, 1, 2, 6, 7, 7, 3, 2, 3, 7, 4, 4, 0, 3];

        var verticesList = [
            bottomSouthFace, bottomSouthEastFace, bottomEastFace, bottomNorthEastFace,
            bottomNorthFace, bottomNorthWestFace, bottomWestFace, bottomSouthWestFace,
            bottomFloorFace,
            middleSouthFace, middleSouthEastFace, middleEastFace, middleNorthEastFace,
            middleNorthFace, middleNorthWestFace, middleWestFace, middleSouthWestFace,
            middleDoorFace, middleRightWindowFace, middleLeftWindowFace,
            roofSouthFace, roofSouthEastFace, roofEastFace, roofNorthEastFace,
            roofNorthFace, roofNorthWestFace, roofWestFace, roofSouthWestFace,
            roofCenterFace, roofEavesFace
        ];

        var indicesList = [
            bottomSouthFaceIndex, bottomSouthEastFaceIndex, bottomEastFaceIndex, bottomNorthEastFaceIndex,
            bottomNorthFaceIndex, bottomNorthWestFaceIndex, bottomWestFaceIndex, bottomSouthWestFaceIndex,
            bottomFloorFaceIndex,
            middleSouthFaceIndex, middleSouthEastFaceIndex, middleEastFaceIndex, middleNorthEastFaceIndex,
            middleNorthFaceIndex, middleNorthWestFaceIndex, middleWestFaceIndex, middleSouthWestFaceIndex,
            middleDoorFaceIndex, middleRightWindowFaceIndex, middleLeftWindowFaceIndex,
            roofSouthFaceIndex, roofSouthEastFaceIndex, roofEastFaceIndex, roofNorthEastFaceIndex,
            roofNorthFaceIndex, roofNorthWestFaceIndex, roofWestFaceIndex, roofSouthWestFaceIndex,
            roofCenterFaceIndex, roofEavesFaceIndex
        ];

        var namesList = [
            componentNames.BottomSouth, componentNames.BottomSouthEast, componentNames.BottomEast, componentNames.BottomNorthEast,
            componentNames.BottomNorth, componentNames.BottomNorthWest, componentNames.BottomWest, componentNames.BottomSouthWest,
            componentNames.BottomFloor,
            componentNames.MiddleSouth, componentNames.MiddleSouthEast, componentNames.MiddleEast, componentNames.MiddleNorthEast,
            componentNames.MiddleNorth, componentNames.MiddleNorthWest, componentNames.MiddleWest, componentNames.MiddleSouthWest,
            componentNames.MiddleDoor, componentNames.MiddleRightWindow, componentNames.MiddleLeftWindow,
            componentNames.RoofSouth, componentNames.RoofSouthEast, componentNames.RoofEast, componentNames.RoofNorthEast,
            componentNames.RoofNorth, componentNames.RoofNorthWest, componentNames.RoofWest, componentNames.RoofSouthWest,
            componentNames.RoofCenter, componentNames.RoofEaves
        ];

        var colors = [
            houseDoorRoofColor, houseWallColor, houseWallColor, houseWallColor,
            houseWallColor, houseWallColor, houseWallColor, houseWallColor,
            houseWallColor,
            houseWallColor, houseWallColor, houseWallColor, houseWallColor,
            houseWallColor, houseWallColor, houseWallColor, houseWallColor,
            houseDoorRoofColor, houseDoorRoofColor, houseDoorRoofColor,
            houseDoorRoofColor, houseDoorRoofColor, houseDoorRoofColor, houseDoorRoofColor,
            houseDoorRoofColor, houseDoorRoofColor, houseDoorRoofColor, houseDoorRoofColor,
            houseWallColor, houseWallColor
        ];

        for (var i = 0; i < verticesList.length; ++i) {
            createMesh(groupHouse, verticesList[i], indicesList[i], colors[i], namesList[i]);
        }

        // --------------------- house wire frame --------------------- //
        var houseWireVertex = []; // house wire frame

        // floor
        houseWireVertex.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, -bottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, -bottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, -bottomFarOffsetZ));

        // ceiling
        houseWireVertex.push(new THREE.Vector3(-wallFarOffsetX, -wallFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(wallFarOffsetX, -wallFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(wallFarOffsetX, wallFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-wallFarOffsetX, wallFarOffsetY, roofNearOffsetZ));

        // roof bottom
        houseWireVertex.push(new THREE.Vector3(-roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(roofBottomFarOffsetX, -roofBottomFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-roofBottomFarOffsetX, roofBottomFarOffsetY, roofNearOffsetZ));

        // roof top
        houseWireVertex.push(new THREE.Vector3(-roofTopFarOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(roofTopFarOffsetX, -roofTopFarOffsetY, roofFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(roofTopFarOffsetX, roofTopFarOffsetY, roofFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-roofTopFarOffsetX, roofTopFarOffsetY, roofFarOffsetZ));

        // sill bottom
        houseWireVertex.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomFarOffsetY, -sillBottomNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillBottomNearOffsetX, -sillBottomNearOffsetY, -sillBottomNearOffsetZ));
        // sill top
        houseWireVertex.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopFarOffsetY, -sillTopNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopNearOffsetY, -bottomNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopNearOffsetY, -bottomNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-sillTopNearOffsetX, -sillTopNearOffsetY, -sillTopNearOffsetZ));

        // door
        houseWireVertex.push(new THREE.Vector3(-doorFarOffsetX, -doorFarOffsetY, -doorFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(doorFarOffsetX, -doorFarOffsetY, -doorFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(doorFarOffsetX, -doorFarOffsetY, doorNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-doorFarOffsetX, -doorFarOffsetY, doorNearOffsetZ));

        // left window
        houseWireVertex.push(new THREE.Vector3(-windowFarOffsetX, -windowFarOffsetY, windowNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-windowFarOffsetX, windowFarOffsetY, windowNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-windowFarOffsetX, windowFarOffsetY, windowFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(-windowFarOffsetX, -windowFarOffsetY, windowFarOffsetZ));
        // right window
        houseWireVertex.push(new THREE.Vector3(windowFarOffsetX, -windowFarOffsetY, windowNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(windowFarOffsetX, windowFarOffsetY, windowNearOffsetZ));
        houseWireVertex.push(new THREE.Vector3(windowFarOffsetX, windowFarOffsetY, windowFarOffsetZ));
        houseWireVertex.push(new THREE.Vector3(windowFarOffsetX, -windowFarOffsetY, windowFarOffsetZ));

        // 外框
        var wireFrameIndexList = [
            [0, 1, 2, 3, 0], [4, 5, 6, 7, 4], [0, 4], [1, 5], [3, 7], [2, 6], [8, 9, 10, 11, 8], [12, 13, 14, 15, 12], [8, 12], [9, 13], [10, 14], [11, 15],
            [16, 17, 18, 19, 16], [20, 21, 22, 23, 20], [16, 20], [17, 21], [18, 22], [19, 23],
            [24, 25, 26, 27, 24], [28, 29, 30, 31, 28], [24, 28], [25, 29], [26, 30], [27, 31],
            [32, 33, 34, 35, 32],
            [36, 37, 38, 39, 36],
            [40, 41, 42, 43, 40]
        ];

        for (var j = 0; j < wireFrameIndexList.length; ++j) {
            createWireFrame(groupHouse, houseWireVertex, wireFrameIndexList[j], houseWireFrameColor, lineWidth);
        }
    };

    // 构造指北针转盘
    var createCompass = function () {

        // ----------- 指北针 ----------- //
        var compassOutsiderRadius = 82; // 指北针圆盘外环
        var compassInsiderRadius = 65; // 指北针圆盘内环
        var compassTriangleHeight = 30; // 指北针文字对应三角形垂直线长度
        var compassNorthColor = 0x9f4a4a; // 指北针N方向颜色
        var compassColor = 0xdbdbdb; // 指北针圆盘颜色
        var compassFontColor = 0xff0000; // 字体颜色

        // 转盘材质
        var materialDisc = new THREE.MeshBasicMaterial({color: compassColor, side: THREE.DoubleSide});
        // N方向材质
        var materialNorth = new THREE.MeshBasicMaterial({
            color: compassNorthColor,
            side: THREE.DoubleSide,
            depthTest: false
        });
        // 字体材质
        var materialFont = new THREE.MeshBasicMaterial({
            color: compassFontColor,
            overdraw: 0.0,
            side: THREE.DoubleSide,
            depthTest: false
        });

        // -------- 三角面 -------- //
        var triangleShape = new THREE.Shape();
        triangleShape.moveTo(compassTriangleHeight, 0);
        triangleShape.lineTo(0, compassTriangleHeight / 2);
        triangleShape.lineTo(0, -compassTriangleHeight / 2);
        triangleShape.lineTo(compassTriangleHeight, 0);

        var geometry = new THREE.ShapeGeometry(triangleShape);

        // East
        var meshE = new THREE.Mesh(geometry, materialDisc);
        meshE.translateX(compassOutsiderRadius - 2);

        // West
        var meshW = new THREE.Mesh(geometry, materialDisc);
        meshW.rotateZ(Math.PI);
        meshW.translateX(compassOutsiderRadius - 2);

        // North
        var meshN = new THREE.Mesh(geometry, materialNorth);
        meshN.rotateZ(Math.PI / 2);
        meshN.translateX(compassOutsiderRadius - 2);

        // South
        var meshS = new THREE.Mesh(geometry, materialDisc);
        meshS.rotateZ(-Math.PI / 2);
        meshS.translateX(compassOutsiderRadius - 2);

        groupCompass.add(meshE);
        groupCompass.add(meshW);
        groupCompass.add(meshN);
        groupCompass.add(meshS);

        // -------- 文字标注 S -------- //
        var theTextN = "N";
        var theTextS = "S";
        var theTextE = "E";
        var theTextW = "W";
        var font_parameters = {
            size: 12,
            height: 1,
            curveSegments: 2,
            font: "helvetiker"
        };

        // 文字坐标原点为左下角
        //     - - - -
        //   |   A   |
        //  o - - - -
        var geoTextN = new THREE.TextGeometry(theTextN, font_parameters);
        var geoTextS = new THREE.TextGeometry(theTextS, font_parameters);
        var geoTextE = new THREE.TextGeometry(theTextE, font_parameters);
        var geoTextW = new THREE.TextGeometry(theTextW, font_parameters);

        // 计算包围框
        geoTextN.computeBoundingBox();
        geoTextS.computeBoundingBox();
        geoTextE.computeBoundingBox();
        geoTextW.computeBoundingBox();

        var offsetX;
        var meshTextN, meshTextS, meshTextE, meshTextW;

        offsetX = -0.5 * ( geoTextN.boundingBox.max.x - geoTextN.boundingBox.min.x );
        meshTextN = new THREE.Mesh(geoTextN, materialFont);
        meshTextN.translateX(offsetX);
        meshTextN.translateY(compassOutsiderRadius);

        offsetX = -0.5 * ( geoTextS.boundingBox.max.x - geoTextS.boundingBox.min.x );
        meshTextS = new THREE.Mesh(geoTextS, materialFont);
        meshTextS.rotateZ(Math.PI);
        meshTextS.translateX(offsetX);
        meshTextS.translateY(compassOutsiderRadius);

        offsetX = -0.5 * ( geoTextE.boundingBox.max.x - geoTextE.boundingBox.min.x );
        meshTextE = new THREE.Mesh(geoTextE, materialFont);
        meshTextE.rotateZ(-Math.PI / 2);
        meshTextE.translateX(offsetX);
        meshTextE.translateY(compassOutsiderRadius);

        offsetX = -0.5 * ( geoTextE.boundingBox.max.x - geoTextE.boundingBox.min.x );
        meshTextW = new THREE.Mesh(geoTextW, materialFont);
        meshTextW.rotateZ(Math.PI / 2);
        meshTextW.translateX(offsetX);
        meshTextW.translateY(compassOutsiderRadius);

        groupCompass.add(meshTextN);
        groupCompass.add(meshTextS);
        groupCompass.add(meshTextE);
        groupCompass.add(meshTextW);

        // -------- 文字标注 E -------- //

        // -------- 指北针圆盘 -------- //
        var discShape = new THREE.RingGeometry(compassInsiderRadius, compassOutsiderRadius, 32, 5, 0, Math.PI * 2);
        var mesh = new THREE.Mesh(discShape, materialDisc);
        mesh.name = componentNames.Compass;
        groupCompass.add(mesh);
    };

    // 构造控制圆环
    var createControlRing = function () {
        // ----------- 控制圆环 ----------- //
        var ringColor = 0x99a4b5; // 圆环及圆环控制点颜色
        var ringRadius = 75; // 圆环半径
        var ringPointRadius = 10; // 圆环控制点半径
        var ringWidth = 3; // 圆环宽度

        // 圆环材质
        var materialRingParameter = {color: ringColor, side: THREE.DoubleSide};
        var materialPointParameter = {color: ringColor, side: THREE.DoubleSide};

        // -------- 圆环 由4段构成 -------- //
        var startAngle = Math.asin(ringPointRadius / ringRadius);
        var endAngle = Math.PI / 2 - startAngle * 2;
        var ringShape = new THREE.RingGeometry(ringRadius - ringWidth / 2, ringRadius + ringWidth / 2, 32, 5, startAngle, endAngle);

        // NorthEast
        var mesh = new THREE.Mesh(ringShape, new THREE.MeshBasicMaterial(materialRingParameter));
        mesh.name = componentNames.ControlRingNorthEast;
        groupControlRing.add(mesh);

        // NorthWest
        var mesh = new THREE.Mesh(ringShape, new THREE.MeshBasicMaterial(materialRingParameter));
        mesh.name = componentNames.ControlRingNorthWest;
        mesh.rotateZ(Math.PI / 2);
        groupControlRing.add(mesh);

        // SouthWest
        var mesh = new THREE.Mesh(ringShape, new THREE.MeshBasicMaterial(materialRingParameter));
        mesh.name = componentNames.ControlRingSouthWest;
        mesh.rotateZ(Math.PI);
        groupControlRing.add(mesh);

        // SouthEast
        var mesh = new THREE.Mesh(ringShape, new THREE.MeshBasicMaterial(materialRingParameter));
        mesh.name = componentNames.ControlRingSouthEast;
        mesh.rotateZ(-Math.PI / 2);
        groupControlRing.add(mesh);

        // -------- 圆形控制点 -------- //
        var circleShape = new THREE.Shape();
        circleShape.moveTo(ringPointRadius, 0);
        circleShape.absarc(0, 0, ringPointRadius, 0, Math.PI * 2, false);
        var geometry = new THREE.ShapeGeometry(circleShape);

        // N
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materialPointParameter));
        mesh.name = componentNames.ControlPointNorth;
        mesh.rotateZ(Math.PI / 2);
        mesh.translateX(ringRadius);
        groupControlRing.add(mesh);

        // S
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materialPointParameter));
        mesh.name = componentNames.ControlPointSouth;
        mesh.rotateZ(-Math.PI / 2);
        mesh.translateX(ringRadius);
        groupControlRing.add(mesh);

        // E
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materialPointParameter));
        mesh.name = componentNames.ControlPointEast;
        mesh.translateX(ringRadius);
        groupControlRing.add(mesh);

        // W
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materialPointParameter));
        mesh.name = componentNames.ControlPointWest;
        mesh.translateX(-ringRadius);
        groupControlRing.add(mesh);
    };

    // 构造Home模型
    var createHome = function () {
        // ----------- Home ----------- //
        var homeWallColor = 0xe7e7ec; // 墙壁颜色
        var homeWireFrameColor = 0x787878;// 线框颜色
        var homeWallHeight = 15; // 墙高
        var homeWallWidth = 24; // 墙宽
        var homeRoofHeight = 15; // 屋顶高
        var homeRoofWidth = 30; // 屋顶宽
        var homeDoorHeight = 13; // 门高
        var homeDoorWidth = 8; // 门宽
        var homeScaleCoe = 1.0; // 缩放系数
        var homeOffsetX = viewHouseRadius - homeRoofWidth / 2; // 距离中心点偏移量
        var homeOffsetZ = viewHouseRadius - (homeWallHeight + homeRoofHeight); // 距离中心点偏移量

        var houseVertices = [];
        houseVertices.push(new THREE.Vector3(0, homeWallHeight + homeRoofHeight, 0));
        houseVertices.push(new THREE.Vector3(-homeRoofWidth / 2, homeWallHeight, 0));
        houseVertices.push(new THREE.Vector3(-homeWallWidth / 2, homeWallHeight, 0));
        houseVertices.push(new THREE.Vector3(-homeWallWidth / 2, 0, 0));
        houseVertices.push(new THREE.Vector3(-homeDoorWidth / 2, 0, 0));
        houseVertices.push(new THREE.Vector3(-homeDoorWidth / 2, homeDoorHeight, 0));
        houseVertices.push(new THREE.Vector3(homeDoorWidth / 2, homeDoorHeight, 0));
        houseVertices.push(new THREE.Vector3(homeDoorWidth / 2, 0, 0));
        houseVertices.push(new THREE.Vector3(homeWallWidth / 2, 0, 0));
        houseVertices.push(new THREE.Vector3(homeWallWidth / 2, homeWallHeight, 0));
        houseVertices.push(new THREE.Vector3(homeRoofWidth / 2, homeWallHeight, 0));
        houseVertices.push(new THREE.Vector3(0, homeWallHeight + homeRoofHeight, 0));

        // 轮廓线
        var geometry = new THREE.Geometry();

        for (var i = 0; i < houseVertices.length; ++i) {
            geometry.vertices.push(houseVertices[i].multiplyScalar(homeScaleCoe));
        }

        var mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: homeWireFrameColor,
            linewidth: lineWidth
        }));
        mesh.position.x = -homeOffsetX;
        mesh.position.y = homeOffsetZ;
        groupHome.add(mesh);

        // 内部面
        var houseShape = new THREE.Shape();
        houseShape.moveTo(houseVertices[0].x, houseVertices[0].y);

        for (var j = 1; j < houseVertices.length; ++j) {
            houseShape.lineTo(houseVertices[j].x, houseVertices[j].y);
        }

        var geometry = new THREE.ShapeGeometry(houseShape);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            color: homeWallColor,
            side: THREE.DoubleSide
        }));
        mesh.position.x = -homeOffsetX;
        mesh.position.y = homeOffsetZ;
        mesh.name = componentNames.Home;
        groupHome.add(mesh);

        // ------ 主视图图标 E ------ //
    };

    // 构建高亮圆环
    var createHighLightRing = function () {

        // ----------- 高亮 ----------- //
        var activeColor = 0xb1d1ec; // 选中区域高亮颜色
        var activeEdgeColor = 0x776d4;// 选中区域高亮边线颜色
        var ringPointRadius = 10; // 圆环控制点半径
        var ringRadius = 75; // 圆环半径

        // 选中高亮材质
        var materialActiveParameter = {color: activeColor, side: THREE.DoubleSide/*, depthTest: false*/};
        //  旋转箭头
        var materialArrowParameter = {color: activeEdgeColor, linewidth: lineWidth};
        // 高亮区域圆环
        var startAngle = Math.asin(ringPointRadius / ringRadius);
        var endAngle = Math.PI / 2 - startAngle * 2;
        var ringShape = new THREE.RingGeometry(ringRadius - ringPointRadius / 3, ringRadius + ringPointRadius / 3, 32, 5, startAngle, endAngle);

        highLightRingRadius = ringRadius;

        // ------------ 圆环 ------------ //
        highlightRingMesh = new THREE.Mesh(ringShape, new THREE.MeshBasicMaterial(materialActiveParameter));
        highlightRingMesh.translateZ(0.01);
        groupHightLight.add(highlightRingMesh);

        // 保存旋转量
        highlightRingQuat = new THREE.Quaternion();
        highlightRingQuat.copy(highlightRingMesh.quaternion);
        highlightRingPos = new THREE.Vector3();
        highlightRingPos.copy(highlightRingMesh.position);

        // ------------ 高亮圆形控制点 ------------ //
        var circleShape = new THREE.Shape();
        circleShape.moveTo(ringPointRadius, 0);
        circleShape.absarc(0, 0, ringPointRadius, 0, Math.PI * 2, false);
        var geometry = new THREE.ShapeGeometry(circleShape);

        highlightPointMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materialActiveParameter));
        highlightPointMesh.translateZ(0.01);
        groupHightLight.add(highlightPointMesh);

        // 保存旋转量
        highlightPointQuat = new THREE.Quaternion();
        highlightPointQuat.copy(highlightPointMesh.quaternion);
        highlightPointPos = new THREE.Vector3();
        highlightPointPos.copy(highlightPointMesh.position);

        //  ------------ 旋转箭头 ------------ //
        // ---------------------
        //   0
        //   |
        //   |
        //  1 ------- 2
        // ---------------------
        // 箭头点集
        var baseEdge = ringPointRadius * 2 * 0.707;
        var lineVertices = [
            new THREE.Vector3(baseEdge / 4, baseEdge / 2, 0),
            new THREE.Vector3(-baseEdge / 4, 0, 0),
            new THREE.Vector3(baseEdge / 4, -baseEdge / 2, 0)
        ];
        var geometry = new THREE.Geometry();
        for (var i = 0; i < lineVertices.length; ++i) {
            geometry.vertices.push(lineVertices[i]);
        }

        highlightArrowMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial(materialArrowParameter));
        highlightArrowMesh.translateZ(0.015);
        groupHightLight.add(highlightArrowMesh);

        // 保持旋转量
        highlightArrowQuat = new THREE.Quaternion();
        highlightArrowQuat.copy(highlightArrowMesh.quaternion);
        highlightArrowPos = new THREE.Vector3();
        highlightArrowPos.copy(highlightArrowMesh.position);

        // 不显示
        highlightRingMesh.visible = false;
        highlightPointMesh.visible = false;
        highlightArrowMesh.visible = false;
    };

    var createViewHouse = function () {

        createCompass();
        createHouse();
        createControlRing();
        createHome();
        createHighLightRing();

        // 指北针位置下移半个房屋高度
        groupCompass.translateZ(-halfHeight);

        houseScene.add(groupCompass);
        houseScene.add(groupHouse);

        groupPick.add(groupHome);
        groupPick.add(groupControlRing);

        groupControlRing.translateZ(30);

        homeScene.add(groupPick);
        homeScene.add(groupHightLight);
    };

    var setSize = function (mode) {
        switch (mode) {
            case enumSizeMode.Big:
                scope.width = enumSize.Big;
                scope.height = enumSize.Big;
                break;
            case enumSizeMode.Medium:
                scope.width = enumSize.Medium;
                scope.height = enumSize.Medium;
                break;
            case enumSizeMode.Small:
                scope.width = enumSize.Small;
                scope.height = enumSize.Small;
                break;
            default :
                scope.width = enumSize.Small;
                scope.height = enumSize.Small;
                break;
        }

        houseContainer.style.width = scope.width + "px";
        houseContainer.style.height = scope.height + "px";
    };

    var isValidRange = function (mouse) {

        var domElement = houseContainer;

        if (domElement !== undefined) {
            var dim = CLOUD.DomUtil.getContainerOffsetToClient(domElement);
            var relativeMouse = new THREE.Vector2();

            // 计算鼠标点相对于viewhouse所在视口的位置
            relativeMouse.x = mouse.x - dim.offset[0];
            relativeMouse.y = mouse.y - dim.offset[1];

            // 规范化坐标系
            if (relativeMouse.x > 0 && relativeMouse.x < scope.width && relativeMouse.y > 0 && relativeMouse.y < scope.height) {
                mouseCoord.x = relativeMouse.x / scope.width * 2 - 1;
                mouseCoord.y = -relativeMouse.y / scope.height * 2 + 1;

                return true;
            }
        }

        return false;
    };

    var showHome = function (isShow) {
        isShowHome = isShow;

        if (isShow) {
            groupHome.visible = true;
        } else {
            groupHome.visible = false;
        }

    };
    var enableTransparent = function (enable) {
        isTransparent = enable;

        if (enable) {
            var houseObjects = groupHouse.children;
            for (var i = 0; i < houseObjects.length; i++) {
                houseObjects[i].material.transparent = true;
                houseObjects[i].material.opacity = opacityCoe;
            }

            var ringObjects = groupControlRing.children;
            for (var i = 0; i < ringObjects.length; i++) {
                ringObjects[i].material.transparent = true;
                ringObjects[i].material.opacity = opacityCoe;
            }

            var compassObjects = groupCompass.children;
            for (var i = 0; i < compassObjects.length; i++) {
                compassObjects[i].material.transparent = true;
                compassObjects[i].material.opacity = opacityCoe;
            }

            var homeObjects = groupHome.children;
            for (var i = 0; i < homeObjects.length; i++) {
                homeObjects[i].material.transparent = true;
                homeObjects[i].material.opacity = opacityCoe;
            }

        } else {
            var houseObjects = groupHouse.children;
            for (var i = 0; i < houseObjects.length; i++) {
                houseObjects[i].material.transparent = false;
                houseObjects[i].material.opacity = 1.0;
            }

            var ringObjects = groupControlRing.children;
            for (var i = 0; i < ringObjects.length; i++) {
                ringObjects[i].material.transparent = false;
                ringObjects[i].material.opacity = 1.0;
            }

            var compassObjects = groupCompass.children;
            for (var i = 0; i < compassObjects.length; i++) {
                compassObjects[i].material.transparent = false;
                compassObjects[i].material.opacity = 1.0;
            }

            var homeObjects = groupHome.children;
            for (var i = 0; i < homeObjects.length; i++) {
                homeObjects[i].material.transparent = false;
                homeObjects[i].material.opacity = 1.0;
            }
        }
    };

    var switchView = function (name) {

        //var viewMode = enumView.ISO;
        var viewMode = -1;

        // 计算鼠标所在的象限
        var isClockWise = false;
        if (mouseCoord.x * mouseCoord.y > 0) {
            isClockWise = true;
        }

        //console.log("[intersects][name = " + Intersected.name +",isClockWise = " + isClockWise + "]" );

        switch (name) {
            case componentNames.Home:
                viewMode = enumViewMode.Home;
                break;
            case componentNames.RoofCenter:
                if (currentViewMode === enumViewMode.RoofFront ||
                    currentViewMode === enumViewMode.RoofSouthEast ||
                    currentViewMode === enumViewMode.RoofSouthWest) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.RoofRight) {
                    viewMode = enumViewMode.TopTurnRight;
                } else if (currentViewMode === enumViewMode.RoofBack ||
                    currentViewMode === enumViewMode.RoofNorthEast ||
                    currentViewMode === enumViewMode.RoofNorthWest) {
                    viewMode = enumViewMode.TopTurnBack;
                } else if (currentViewMode === enumViewMode.RoofLeft) {
                    viewMode = enumViewMode.TopTurnLeft;
                } else if (currentViewMode === enumViewMode.TopTurnRight) {
                    viewMode = enumViewMode.TopTurnRight;
                } else if (currentViewMode === enumViewMode.TopTurnBack) {
                    viewMode = enumViewMode.TopTurnBack;
                } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                    viewMode = enumViewMode.TopTurnLeft;
                } else {
                    viewMode = enumViewMode.Top; // 默认
                }
                break;
            case componentNames.BottomFloor:
                if (currentViewMode === enumViewMode.BottomFront ||
                    currentViewMode === enumViewMode.BottomSouthEast ||
                    currentViewMode === enumViewMode.BottomSouthWest) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.BottomRight) {
                    viewMode = enumViewMode.BottomTurnLeft;
                } else if (currentViewMode === enumViewMode.BottomBack ||
                    currentViewMode === enumViewMode.BottomNorthEast ||
                    currentViewMode === enumViewMode.BottomNorthWest) {
                    viewMode = enumViewMode.BottomTurnBack;
                } else if (currentViewMode === enumViewMode.BottomLeft) {
                    viewMode = enumViewMode.BottomTurnRight;
                } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                    viewMode = enumViewMode.BottomTurnRight;
                } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                    viewMode = enumViewMode.BottomTurnBack;
                } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                    viewMode = enumViewMode.BottomTurnLeft;
                } else {
                    viewMode = enumViewMode.Bottom; // 默认
                }
                break;
            case componentNames.BottomSouth:
                viewMode = enumViewMode.BottomFront;
                break;
            case componentNames.BottomNorth:
                viewMode = enumViewMode.BottomBack;
                break;
            case componentNames.BottomEast:
                viewMode = enumViewMode.BottomRight;
                break;
            case componentNames.BottomWest:
                viewMode = enumViewMode.BottomLeft;
                break;
            case componentNames.BottomSouthEast:
                viewMode = enumViewMode.BottomSouthEast;
                break;
            case componentNames.BottomSouthWest:
                viewMode = enumViewMode.BottomSouthWest;
                break;
            case componentNames.BottomNorthWest:
                viewMode = enumViewMode.BottomNorthWest;
                break;
            case componentNames.BottomNorthEast:
                viewMode = enumViewMode.BottomNorthEast;
                break;
            case componentNames.MiddleSouth:
            case componentNames.MiddleDoor:
                viewMode = enumViewMode.Front;
                break;
            case componentNames.MiddleNorth:
                viewMode = enumViewMode.Back;
                break;
            case componentNames.MiddleRightWindow:
            case componentNames.MiddleEast:
                viewMode = enumViewMode.Right;
                break;
            case componentNames.MiddleWest:
            case componentNames.MiddleLeftWindow:
                viewMode = enumViewMode.Left;
                break;
            case componentNames.MiddleSouthEast:
                viewMode = enumViewMode.SouthEast;
                break;
            case componentNames.MiddleSouthWest:
                viewMode = enumViewMode.SouthWest;
                break;
            case componentNames.MiddleNorthWest:
                viewMode = enumViewMode.NorthWest;
                break;
            case componentNames.MiddleNorthEast:
                viewMode = enumViewMode.NorthEast;
                break;
            case componentNames.RoofSouth:
                viewMode = enumViewMode.RoofFront;
                break;
            case componentNames.RoofNorth:
                viewMode = enumViewMode.RoofBack;
                break;
            case componentNames.RoofEast:
                viewMode = enumViewMode.RoofRight;
                break;
            case componentNames.RoofWest:
                viewMode = enumViewMode.RoofLeft;
                break;
            case componentNames.RoofSouthEast:
                viewMode = enumViewMode.RoofSouthEast;
                break;
            case componentNames.RoofSouthWest:
                viewMode = enumViewMode.RoofSouthWest;
                break;
            case componentNames.RoofNorthWest:
                viewMode = enumViewMode.RoofNorthWest;
                break;
            case componentNames.RoofNorthEast:
                viewMode = enumViewMode.RoofNorthEast;
                break;
            case componentNames.ControlPointNorth: // 前 - 顶 - 后 - 后顶 - 前
                if (currentViewMode === enumViewMode.Front) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.Top) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.Back) {
                    viewMode = enumViewMode.TopTurnBack;
                } else if (currentViewMode === enumViewMode.TopTurnBack) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.Right) {
                    viewMode = enumViewMode.TopTurnRight;
                } else if (currentViewMode === enumViewMode.TopTurnRight) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.Left) {
                    viewMode = enumViewMode.TopTurnLeft;
                } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BackTurnRight) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BackTurnTop) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.RightTurnFront) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.RightTurnBack) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.RightTurnTop) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                    viewMode = enumViewMode.Bottom;
                } else {
                    viewMode = enumViewMode.Top; // 默认
                }
                break;
            case componentNames.ControlPointSouth: // 前 - 底 - 后 - 后底 - 前
                if (currentViewMode === enumViewMode.Front) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.Bottom) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.Back) {
                    viewMode = enumViewMode.BottomTurnBack;
                } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.Right) {
                    viewMode = enumViewMode.BottomTurnRight;
                } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.Left) {
                    viewMode = enumViewMode.BottomTurnLeft;
                } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.RightTurnFront) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.RightTurnBack) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.RightTurnTop) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.BackTurnRight) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.BackTurnTop) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.Top) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.TopTurnRight) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.TopTurnBack) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                    viewMode = enumViewMode.Left;
                }
                else {
                    viewMode = enumViewMode.Bottom; // 默认
                }
                break;
            case componentNames.ControlPointEast: // 前 - 右 - 后 - 左 - 前
                if (currentViewMode === enumViewMode.Front) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.Right) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.Back) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.Left) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.Top) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.TopTurnRight) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.TopTurnBack) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.Bottom) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.RightTurnFront) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.RightTurnBack) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.RightTurnTop) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.BackTurnRight) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.BackTurnTop) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                    viewMode = enumViewMode.Back;
                } else {
                    viewMode = enumViewMode.Right; // 默认
                }
                break;
            case componentNames.ControlPointWest: // 前 - 左 - 后 - 右 - 前
                if (currentViewMode === enumViewMode.Front) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.Left) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.Back) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.Right) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.Front) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.Top) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.TopTurnRight) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.TopTurnBack) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.Bottom) {
                    viewMode = enumViewMode.Left;
                } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                    viewMode = enumViewMode.Front;
                } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.RightTurnFront) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.RightTurnBack) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.RightTurnTop) {
                    viewMode = enumViewMode.Back;
                } else if (currentViewMode === enumViewMode.BackTurnRight) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.BackTurnTop) {
                    viewMode = enumViewMode.Right;
                } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                    viewMode = enumViewMode.Bottom;
                } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                    viewMode = enumViewMode.Top;
                } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                    viewMode = enumViewMode.Front;
                } else {
                    viewMode = enumViewMode.Left; // 默认
                }
                break;
            case componentNames.ControlRingNorthEast:
            case componentNames.ControlRingSouthWest:
            case componentNames.ControlRingNorthWest:
            case componentNames.ControlRingSouthEast:
                if (isClockWise) {// clockwise
                    if (currentViewMode === enumViewMode.Front) {
                        viewMode = enumViewMode.FrontTurnRight;
                    } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                        viewMode = enumViewMode.FrontTurnTop;
                    } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                        viewMode = enumViewMode.FrontTurnLeft;
                    } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                        viewMode = enumViewMode.Front;
                    } else if (currentViewMode === enumViewMode.Right) {
                        viewMode = enumViewMode.RightTurnBack;
                    } else if (currentViewMode === enumViewMode.RightTurnBack) {
                        viewMode = enumViewMode.RightTurnTop;
                    } else if (currentViewMode === enumViewMode.RightTurnTop) {
                        viewMode = enumViewMode.RightTurnFront;
                    } else if (currentViewMode === enumViewMode.RightTurnFront) {
                        viewMode = enumViewMode.Right;
                    } else if (currentViewMode === enumViewMode.Back) {
                        viewMode = enumViewMode.BackTurnRight;
                    } else if (currentViewMode === enumViewMode.BackTurnRight) {
                        viewMode = enumViewMode.BackTurnTop;
                    } else if (currentViewMode === enumViewMode.BackTurnTop) {
                        viewMode = enumViewMode.BackTurnLeft;
                    } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                        viewMode = enumViewMode.Back;
                    } else if (currentViewMode === enumViewMode.Left) {
                        viewMode = enumViewMode.LeftTurnFront;
                    } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                        viewMode = enumViewMode.LeftTurnTop;
                    } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                        viewMode = enumViewMode.LeftTurnBack;
                    } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                        viewMode = enumViewMode.Left;
                    } else if (currentViewMode === enumViewMode.Top) {
                        viewMode = enumViewMode.TopTurnRight;
                    } else if (currentViewMode === enumViewMode.TopTurnRight) {
                        viewMode = enumViewMode.TopTurnBack;
                    } else if (currentViewMode === enumViewMode.TopTurnBack) {
                        viewMode = enumViewMode.TopTurnLeft;
                    } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                        viewMode = enumViewMode.Top;
                    } else if (currentViewMode === enumViewMode.Bottom) {
                        viewMode = enumViewMode.BottomTurnRight;
                    } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                        viewMode = enumViewMode.BottomTurnBack;
                    } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                        viewMode = enumViewMode.BottomTurnLeft;
                    } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                        viewMode = enumViewMode.Bottom;
                    } else {
                        viewMode = enumViewMode.FrontTurnRight; // 默认
                    }
                } else {
                    if (currentViewMode === enumViewMode.Front) {
                        viewMode = enumViewMode.FrontTurnLeft;
                    } else if (currentViewMode === enumViewMode.FrontTurnLeft) {
                        viewMode = enumViewMode.FrontTurnTop;
                    } else if (currentViewMode === enumViewMode.FrontTurnTop) {
                        viewMode = enumViewMode.FrontTurnRight;
                    } else if (currentViewMode === enumViewMode.FrontTurnRight) {
                        viewMode = enumViewMode.Front;
                    } else if (currentViewMode === enumViewMode.Right) {
                        viewMode = enumViewMode.RightTurnFront;
                    } else if (currentViewMode === enumViewMode.RightTurnFront) {
                        viewMode = enumViewMode.RightTurnTop;
                    } else if (currentViewMode === enumViewMode.RightTurnTop) {
                        viewMode = enumViewMode.RightTurnBack;
                    } else if (currentViewMode === enumViewMode.RightTurnBack) {
                        viewMode = enumViewMode.Right;
                    } else if (currentViewMode === enumViewMode.Back) {
                        viewMode = enumViewMode.BackTurnLeft;
                    } else if (currentViewMode === enumViewMode.BackTurnLeft) {
                        viewMode = enumViewMode.BackTurnTop;
                    } else if (currentViewMode === enumViewMode.BackTurnTop) {
                        viewMode = enumViewMode.BackTurnRight;
                    } else if (currentViewMode === enumViewMode.BackTurnRight) {
                        viewMode = enumViewMode.Back;
                    } else if (currentViewMode === enumViewMode.Left) {
                        viewMode = enumViewMode.LeftTurnBack;
                    } else if (currentViewMode === enumViewMode.LeftTurnBack) {
                        viewMode = enumViewMode.LeftTurnTop;
                    } else if (currentViewMode === enumViewMode.LeftTurnTop) {
                        viewMode = enumViewMode.LeftTurnFront;
                    } else if (currentViewMode === enumViewMode.LeftTurnFront) {
                        viewMode = enumViewMode.Left;
                    } else if (currentViewMode === enumViewMode.Top) {
                        viewMode = enumViewMode.TopTurnLeft;
                    } else if (currentViewMode === enumViewMode.TopTurnLeft) {
                        viewMode = enumViewMode.TopTurnBack;
                    } else if (currentViewMode === enumViewMode.TopTurnBack) {
                        viewMode = enumViewMode.TopTurnRight;
                    } else if (currentViewMode === enumViewMode.TopTurnRight) {
                        viewMode = enumViewMode.Top;
                    } else if (currentViewMode === enumViewMode.Bottom) {
                        viewMode = enumViewMode.BottomTurnLeft;
                    } else if (currentViewMode === enumViewMode.BottomTurnLeft) {
                        viewMode = enumViewMode.BottomTurnBack;
                    } else if (currentViewMode === enumViewMode.BottomTurnBack) {
                        viewMode = enumViewMode.BottomTurnRight;
                    } else if (currentViewMode === enumViewMode.BottomTurnRight) {
                        viewMode = enumViewMode.Bottom;
                    } else {
                        viewMode = enumViewMode.FrontTurnLeft; // 默认
                    }
                }

                break;
        }

        currentViewMode = viewMode;
    };
    var setHighlight = function (name, highlight) {
        if (highlight) {

            // 计算鼠标所在的象限
            var isClockWise = false;
            if (mouseCoord.x * mouseCoord.y > 0) {
                isClockWise = true;
            }

            // ---------- 处理联动高亮 S ---------- //
            if (name === componentNames.MiddleDoor) {
                // 选中Door，前墙也高亮
                houseFrontMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleSouth) {
                    houseFrontMesh.material.color.setHex(houseFrontColor);
                }
            }

            if (name === componentNames.MiddleSouth) {
                // 选中前墙，Door也高亮
                houseDoorMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleDoor) {
                    houseDoorMesh.material.color.setHex(houseDoorColor);
                }
            }

            if (name === componentNames.MiddleWest) {
                // 选中左墙，左窗也高亮
                HouseLeftWindowMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleLeftWindow) {
                    HouseLeftWindowMesh.material.color.setHex(houseLeftWindowColor);
                }
            }

            if (name === componentNames.MiddleLeftWindow) {
                // 选中左窗，左墙也高亮
                houseLeftMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleWest) {
                    houseLeftMesh.material.color.setHex(houseLeftColor);
                }
            }

            if (name === componentNames.MiddleEast) {
                // 选中右窗，右墙也高亮
                houseRightWindowMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleRightWindow) {
                    houseRightWindowMesh.material.color.setHex(houseRightWindowColor);
                }
            }

            if (name === componentNames.MiddleRightWindow) {
                // 选中右墙，右窗也高亮
                houseRightMesh.material.color.setHex(scope.pickedColor);
            } else {
                if (name !== componentNames.MiddleEast) {
                    houseRightMesh.material.color.setHex(houseRightColor);
                }
            }

            // ---------- 处理联动高亮 E ---------- //

            switch (name) {
                case componentNames.ControlRingNorthEast:
                    highlightRingMesh.visible = true;
                    highlightRingMesh.quaternion.copy(highlightRingQuat);
                    highlightRingMesh.position.copy(highlightRingPos);

                    highlightPointMesh.visible = true;
                    highlightPointMesh.quaternion.copy(highlightPointQuat);
                    highlightPointMesh.position.copy(highlightPointPos);
                    highlightPointMesh.rotateZ(Math.PI / 4);
                    highlightPointMesh.translateX(highLightRingRadius);

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(Math.PI / 4);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    if (isClockWise) {
                        // 箭头朝下
                        highlightArrowMesh.rotateZ(Math.PI / 2);
                    } else {
                        highlightArrowMesh.rotateZ(-Math.PI / 2);
                    }
                    break;
                case componentNames.ControlRingNorthWest:
                    highlightRingMesh.visible = true;
                    highlightRingMesh.quaternion.copy(highlightRingQuat);
                    highlightRingMesh.position.copy(highlightRingPos);
                    highlightRingMesh.rotateZ(Math.PI / 2);

                    highlightPointMesh.visible = true;
                    highlightPointMesh.quaternion.copy(highlightPointQuat);
                    highlightPointMesh.position.copy(highlightPointPos);
                    highlightPointMesh.rotateZ(Math.PI * 3 / 4);
                    highlightPointMesh.translateX(highLightRingRadius);

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(Math.PI * 3 / 4);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    if (isClockWise) {
                        highlightArrowMesh.rotateZ(Math.PI / 2);
                    } else {
                        highlightArrowMesh.rotateZ(-Math.PI / 2);
                    }
                    break;
                case componentNames.ControlRingSouthWest:
                    highlightRingMesh.visible = true;
                    highlightRingMesh.quaternion.copy(highlightRingQuat);
                    highlightRingMesh.position.copy(highlightRingPos);
                    highlightRingMesh.rotateZ(Math.PI);

                    highlightPointMesh.visible = true;
                    highlightPointMesh.quaternion.copy(highlightPointQuat);
                    highlightPointMesh.position.copy(highlightPointPos);
                    highlightPointMesh.rotateZ(-Math.PI * 3 / 4);
                    highlightPointMesh.translateX(highLightRingRadius);

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(-Math.PI * 3 / 4);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    if (isClockWise) {
                        highlightArrowMesh.rotateZ(Math.PI / 2);
                    } else {
                        highlightArrowMesh.rotateZ(-Math.PI / 2);
                    }
                    break;
                case componentNames.ControlRingSouthEast:
                    highlightRingMesh.visible = true;
                    highlightRingMesh.quaternion.copy(highlightRingQuat);
                    highlightRingMesh.position.copy(highlightRingPos);
                    highlightRingMesh.rotateZ(-Math.PI / 2);

                    highlightPointMesh.visible = true;
                    highlightPointMesh.quaternion.copy(highlightPointQuat);
                    highlightPointMesh.position.copy(highlightPointPos);
                    highlightPointMesh.rotateZ(-Math.PI / 4);
                    highlightPointMesh.translateX(highLightRingRadius);

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(-Math.PI / 4);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    if (isClockWise) {
                        highlightArrowMesh.rotateZ(Math.PI / 2);
                    } else {
                        highlightArrowMesh.rotateZ(-Math.PI / 2);
                    }
                    break;
                case componentNames.ControlPointNorth:
                    highlightRingMesh.visible = false;
                    highlightPointMesh.visible = false;

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(Math.PI / 2);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    break;
                case componentNames.ControlPointSouth:
                    highlightRingMesh.visible = false;
                    highlightPointMesh.visible = false;

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(-Math.PI / 2);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    break;
                case componentNames.ControlPointEast:
                    highlightRingMesh.visible = false;
                    highlightPointMesh.visible = false;

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    break;
                case componentNames.ControlPointWest:
                    highlightRingMesh.visible = false;
                    highlightPointMesh.visible = false;

                    highlightArrowMesh.visible = true;
                    highlightArrowMesh.quaternion.copy(highlightArrowQuat);
                    highlightArrowMesh.position.copy(highlightArrowPos);
                    highlightArrowMesh.rotateZ(Math.PI);
                    highlightArrowMesh.translateX(highLightRingRadius);
                    break;
                default:
                    highlightRingMesh.visible = false;
                    highlightPointMesh.visible = false;
                    highlightArrowMesh.visible = false;
                    break;
            }

        } else {

            if (highlightRingMesh.visible) {
                highlightRingMesh.visible = false;
            }

            if (highlightPointMesh.visible) {
                highlightPointMesh.visible = false;
            }

            if (highlightArrowMesh.visible) {
                highlightArrowMesh.visible = false;
            }
        }
    };
    var setObjectHighlight = function (object) {
        if (Intersected != object) {
            if (Intersected) {
                Intersected.material.color.setHex(Intersected.currentHex);
            }

            Intersected = object;
            Intersected.currentHex = Intersected.material.color.getHex();

            if (Intersected.name !== "") {
                Intersected.material.color.setHex(scope.pickedColor);
            }

            setHighlight(Intersected.name, true);

            //console.log("[intersects - 1][length = " + intersects.length + ",name = " + Intersected.name +"]");
        }
    };
    var clearObjectHighlight = function () {
        if (Intersected) {
            Intersected.material.color.setHex(Intersected.currentHex);
        }

        setHighlight("", false);

        Intersected = null;
    };
    var picked = function () {

        // 优先选择控制圆环
        homeRaycaster.setFromCamera(mouseCoord, homeCamera);
        var homeIntersects = homeRaycaster.intersectObjects(groupPick.children, true);

        if (homeIntersects.length > 0) {

            setObjectHighlight(homeIntersects[0].object);

        } else {

            houseRaycaster.setFromCamera(mouseCoord, houseCamera);
            var houseIntersects = houseRaycaster.intersectObjects(houseScene.children, true);

            if (houseIntersects.length > 0) {
                setObjectHighlight(houseIntersects[0].object);
            } else {
                clearObjectHighlight();
            }
        }
    };

    // 判断两个值是否在允许误差范围内
    var isEquals = function (value1, value2, epsilon) {
        return (value1 > value2) ? (value1 - value2 <= epsilon) : (value2 - value1 <= epsilon);
    };
    var isCompassView = function (dir) {

        //  非标准视图及顶、底视图
        var dirNorm = dir.clone();
        dirNorm.normalize();

        // 当dirNorm.y为0时，指北针与视线平行
        if (isEquals(dirNorm.y, 0, threshold)) {
            return false;
        }

        return true;
    };
    var isStandardView = function (dir) {

        // 标准视图：上、下、左、右、前、后

        var dirNorm = dir.clone();
        dirNorm.normalize();

        // Top (0, -1, 0)
        // Bottom (0, 1, 0)
        // Front (0, 0, -1)
        // Back (0, 0, 1)
        // Right (-1, 0, 0)
        // Left (1, 0, 0)

        // 两个为0，即为标准视图
        if ((isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, 0, threshold)) ||
            (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) ||
            (isEquals(dirNorm.y, 0, threshold) &&
            isEquals(dirNorm.z, 0, threshold))) {
            return true;
        }

        return false;
    };
    var isBottomView = function (dir) {
        var dirNorm = dir.clone();
        dirNorm.normalize();

        // Bottom (0, 1, 0)
        if (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, 1, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) {
            return true;
        }

        return false;
    };
    var getCurrentStandardView = function (dir, up) {
        var dirNorm = dir.clone();
        dirNorm.normalize();

        var upNorm = up.clone();
        upNorm.normalize();

        // Top - dir(0, -1, 0)
        if (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, -1, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) {

            // Top - up(0, 0, -1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, -1, threshold)) {
                return enumViewMode.Top;
            }

            // TopTurnRight - up(-1, 0, 0)
            if (isEquals(upNorm.x, -1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.TopTurnRight;
            }

            // TopTurnBack - up(0, 0, 1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 1, threshold)) {
                return enumViewMode.TopTurnBack;
            }

            // TopTurnLeft - up(1, 0, 0)
            if (isEquals(upNorm.x, 1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.TopTurnLeft;
            }
        }

        // Bottom - dir(0, 1, 0)
        if (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, 1, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) {

            // Bottom - up(0, 0, 1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 1, threshold)) {
                return enumViewMode.Bottom;
            }

            // BottomTurnRight - up(-1, 0, 0)
            if (isEquals(upNorm.x, -1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.BottomTurnRight;
            }

            // BottomTurnBack - up(0, 0, -1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, -1, threshold)) {
                return enumViewMode.BottomTurnBack;
            }

            // BottomTurnLeft - up(1, 0, 0)
            if (isEquals(upNorm.x, 1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.Bottom;
            }
        }

        // Front - dir(0, 0, -1)
        if (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, 0, threshold) &&
            isEquals(dirNorm.z, -1, threshold)) {

            // Front - up(0, 1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.Front;
            }

            // FrontTurnTop - up(0, -1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, -1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.FrontTurnTop;
            }

            // FrontTurnLeft - up(1, 0, 0)
            if (isEquals(upNorm.x, 1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.FrontTurnLeft;
            }

            // FrontTurnRight - up(-1, 0, 0)
            if (isEquals(upNorm.x, -1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.FrontTurnRight;
            }
        }

        // Back - dir(0, 0, 1)
        if (isEquals(dirNorm.x, 0, threshold) &&
            isEquals(dirNorm.y, 0, threshold) &&
            isEquals(dirNorm.z, 1, threshold)) {

            // Back - up(0, 1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.Back;
            }

            // BackTurnTop - up(0, -1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, -1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.BackTurnTop;
            }

            // BackTurnLeft - up(-1, 0, 0)
            if (isEquals(upNorm.x, -1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.BackTurnLeft;
            }

            // BackTurnRight - up(1, 0, 0)
            if (isEquals(upNorm.x, 1, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.BackTurnRight;
            }
        }

        // Right - dir(-1, 0, 0)
        if (isEquals(dirNorm.x, -1, threshold) &&
            isEquals(dirNorm.y, 0, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) {

            // Right - up(0, 1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.Right;
            }

            // RightTurnTop - up(0, -1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, -1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.RightTurnTop;
            }

            // RightTurnFront - up(0, 0, -1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, -1, threshold)) {
                return enumViewMode.RightTurnFront;
            }

            // RightTurnBack - up(0, 0, 1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 1, threshold)) {
                return enumViewMode.RightTurnBack;
            }
        }

        // Left - dir(1, 0, 0)
        if (isEquals(dirNorm.x, 1, threshold) &&
            isEquals(dirNorm.y, 0, threshold) &&
            isEquals(dirNorm.z, 0, threshold)) {

            // Left - up(0, 1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.Left;
            }

            // LeftTurnTop - up(0, -1, 0)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, -1, threshold) &&
                isEquals(upNorm.z, 0, threshold)) {
                return enumViewMode.LeftTurnTop;
            }

            // LeftTurnFront - up(0, 0, -1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, -1, threshold)) {
                return enumViewMode.LeftTurnFront;
            }

            // LeftTurnBack - up(0, 0, 1)
            if (isEquals(upNorm.x, 0, threshold) &&
                isEquals(upNorm.y, 0, threshold) &&
                isEquals(upNorm.z, 1, threshold)) {
                return enumViewMode.LeftTurnBack;
            }
        }

        return -1;
    };

    // 设置容器元素style
    var setContainerElementStyle = function (container) {
        container.style.position = "absolute";
        container.style.display = "block";
        container.style.outline = "0";
        container.style.right = "20px";
        container.style.top = "20px";
        container.style.opacity = ".6";
        container.style.webkitTransition = "opacity .2s ease";
        container.style.mozTransition = "opacity .2s ease";
        container.style.msTransform = "opacity .2s ease";
        container.style.oTransform = "opacity .2s ease";
        container.style.transition = "opacity .2s ease";
    };

    this.init = function (container) {

        houseContainer = document.createElement("div");
        setContainerElementStyle(houseContainer);
        container.appendChild(houseContainer);

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});

        houseContainer.appendChild(renderer.domElement);

        // 设置视口大小
        this.resize(container.offsetWidth, container.offsetHeight, this.viewer.isMobile);
    };

    // 是否禁用指北针转盘
    this.enableCompass = function (enable) {
        isEnableCompass = enable;
    };

    this.mouseUp = function (event, callback) {

        //if (event.button === mouseButtons.RIGHT) {
        //    isRotate = false;
        //}

        isRotate = false;

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var isInHouse = isValidRange(mouse);

        //if (isInHouse) {
        //    callback();
        //}

        return isInHouse;
    };

    this.mouseMove = function (event, callback) {

        var change = false;
        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var mouseOverHouse = isValidRange(mouse);

        // 左键选择，右键旋转

        // 允许鼠标移出viewhouse区域
        if (isRotate) {

            rotateEnd.set(mouse.x, mouse.y);
            rotateDelta.subVectors(rotateEnd, rotateStart);
            callback(rotateDelta);
            rotateStart.copy(rotateEnd);

        } else {

            if (mouseOverHouse) {

                if (lastPickedObjectName === undefined) {
                    lastPickedObjectName = "";
                }

                // 禁用透明
                if (isTransparent) {
                    enableTransparent(false);
                    change = true;
                }

                // 显示home
                if (isShowHome === false) {
                    showHome(true);
                    change = true;
                }

                picked();

                // 存在选中的对象
                if (Intersected) {

                    if (Intersected.name !== "") {

                        // 处理联动状态：前墙与门，左墙与左窗，右墙与右窗存在联动
                        var linkageName = Intersected.name;
                        if (linkageName === componentNames.MiddleDoor) {
                            linkageName = componentNames.MiddleSouth;
                        } else if (linkageName === componentNames.MiddleLeftWindow) {
                            linkageName = componentNames.MiddleWest;
                        } else if (linkageName === componentNames.MiddleRightWindow) {
                            linkageName = componentNames.MiddleEast;
                        }

                        if (lastPickedObjectName !== linkageName) {
                            lastPickedObjectName = linkageName;
                            hasPickedObject = true;
                            change = true;
                        }
                    }

                } else { // 不存在选中的对象

                    // 判断上次是否有选中的对象，如果上次有选中的对象，则需要刷新
                    if (lastPickedObjectName !== "") {
                        lastPickedObjectName = ""; // 置为空字符串
                        hasPickedObject = false;
                        change = true;
                    }
                }

                // 不用每次刷新
                if (change) {

                    this.render();
                    //callback();
                }

                lastMouseOverHouse = true;

            } else {

                if (lastMouseOverHouse) {

                    lastMouseOverHouse = false;

                    if (hasPickedObject) {
                        clearObjectHighlight();
                        hasPickedObject = false;
                        change = true;
                    }

                    // 启用透明
                    if (isTransparent === false) {
                        enableTransparent(true);
                        change = true;
                    }

                    // 隐藏home
                    if (isShowHome) {
                        showHome(false);
                        change = true;
                    }

                    // 不用每次刷新
                    if (change) {
                        //callback();
                        this.render();
                    }

                    //console.log("mouse out");
                }
            }
        }

        return mouseOverHouse;
    };

    this.mouseDown = function (event, callback) {

        var mouse = new THREE.Vector2(event.clientX, event.clientY);
        var mouseOverHouse = isValidRange(mouse);

        if (mouseOverHouse) {

            //picked();  // 不需再次选择

            if (event.button === scope.mouseButtons.LEFT) {

                if (Intersected) {

                    switchView(Intersected.name);

                    if (currentViewMode !== -1) {
                        // 反馈到主视图
                        callback(currentViewMode);
                    }
                }

            } else if (event.button === scope.mouseButtons.RIGHT) {

                // 右键启用旋转
                isRotate = false;

                if (Intersected) {
                    var name = Intersected.name;

                    if (name === componentNames.Compass) {
                        isRotate = true;
                        rotateStart.set(mouse.x, mouse.y);
                    }
                }
            }
        }

        return mouseOverHouse;
    };

    this.render = function () {

        if (!this.visible)
            return;

        if (!renderer) {
            return;
        }

        var mainCamera = this.viewer.camera;
        var mainScene = this.viewer.getScene();
        var rotation = mainScene.rootNode.rotation;

        // 获得相机方向向量
        var dir = mainCamera.getWorldDirection();

        // 获得主场景的旋转矩阵
        var rotMat = new THREE.Matrix4();
        rotMat.makeRotationFromEuler(rotation);

        // 设置坐标轴的旋转向量
        houseScene.rotation.copy(rotation);

        houseCamera.up.copy(mainCamera.realUp || mainCamera.up);
        houseCamera.lookAt(dir);
        houseCamera.updateMatrixWorld();

        // 获得当前标准视图
        if (currentViewMode === -1) {
            currentViewMode = getCurrentStandardView(dir, houseCamera.up);
        }

        // 判断是否标准视图
        if (isStandardView(dir)) {
            groupControlRing.visible = true;
        } else {
            groupControlRing.visible = false;
        }

        // 动画过程中，不显示控制圆环
        // 动画为结束
        if (!this.isAnimationFinish) {
            groupControlRing.visible = false;
        }

        // 高亮圆环的显示控制
        if (groupControlRing.visible === false) {
            highlightRingMesh.visible = false;
            highlightPointMesh.visible = false;
            highlightArrowMesh.visible = false;
        }

        groupControlRing.position.copy(groupControlRingPos);
        groupHightLight.position.copy(groupHightLightPos);

        if (groupControlRing.visible) {
            // 如果是底视图，让控制圆环显示
            if (isBottomView(dir)) {
                groupControlRing.translateZ(halfHeight + 1);
                groupHightLight.translateZ(halfHeight + 1);
            }
        }

        // 是否禁用指北针
        if (isEnableCompass) {
            // 是否显示指北针
            if (isCompassView(dir)) {
                groupCompass.visible = true;
            } else {
                groupCompass.visible = false;
            }
        } else {
            groupCompass.visible = false;
        }

        // 绘制house
        renderer.autoClear = true;
        renderer.render(houseScene, houseCamera);

        // 绘制home
        renderer.autoClear = false;
        renderer.render(homeScene, homeCamera);
        renderer.autoClear = true;
    };

    // resize view house based on scene size
    this.resize = function (width, height, bMobile) {

        var offset = 20;
        if (width < 400 || bMobile) {
            setSize(enumSizeMode.Small);
            //offset = offset + enumSize.Small;
        }
        //else if (width < 800) {
        //    setSize(enumSizeMode.Medium);
        //}
        else {
            setSize(enumSizeMode.Medium);
            //offset = offset + enumSize.Medium;
        }

        renderer.setSize(this.width, this.height);
    };

    // 创建view house
    createViewHouse();

    // 设置透明
    enableTransparent(true);

    // 隐藏home
    showHome(false);
};
CLOUD.Client = function (serverUrl, databagId, texturePath) {
    "use strict";
    //this.serverUrl = "http://172.16.244.67:9980/project/";
    this.serverUrl = serverUrl;
    this.databagId = databagId;
    this.texturePath = texturePath;

    this.cache = {
        geometries: {},
        face_materials: {},
        materials: {},
        textures: {},
        instancedMaterials: {}
    };

    this.index = null;

    this.meshIds = {}; // dict for meshId -> mkpId

    this.mkpIndex = null; // mpk index from file: mpk/index

    this.symbolIndex = null; // symbol index from file: symbol/index

    var defaultMaterial = new THREE.MeshPhongMaterial();
    defaultMaterial.side = THREE.DoubleSide;
    this.defaultMaterial = defaultMaterial;

    this.geomCacheVer = 0;
};

CLOUD.Client.prototype = {
    constructor: CLOUD.Client,

    projectUrl: function () {
        return this.serverUrl + this.databagId + "/index.json";
    },

    sceneUrl: function (sceneId) {
        return this.serverUrl + this.databagId + "/scene/" + sceneId;
    },

    mpkIndexUrl: function () {
        return this.serverUrl + this.databagId + "/mpk/index";
    },

    symbolIndexUrl: function () {
        return this.serverUrl + this.databagId + "/symbol/index";
    },

    mpkUrl : function(mpkId){
        return this.serverUrl + this.databagId + "/mpk/" + mpkId;
    },

    submeshUrl: function (geometryId) {
        return this.serverUrl + this.databagId + "/midx/" + geometryId;
    },

    materialUrl: function (materialId) {
        return this.serverUrl + this.databagId + "/material/" + materialId;
    },

    getTexturePath: function(){
        return this.texturePath ? this.texturePath : THREE.Loader.prototype.extractUrlBase(this.materialUrl("material"));
    },

    purgeUnusedResource: function () {
        if (this.geomCacheVer < 1)
            return;
        this.geomCacheVer = 0;

        var geometries = this.cache.geometries;
        for (var meshId in geometries) {
            var geometry = geometries[meshId];
            if (geometry && geometry.refCount === 0) {

                geometry.dispose();

                var mpkId = this.meshIds[meshId];
                var mpkIdx = this.mkpIndex.items[mpkId]
                mpkIdx.status = CLOUD.MPKSTATUS.UNKONW;
                geometries[meshId] = null;

               // console.log("Release geometry: " + meshId);
            }
        }
    },

    findMaterial: function (materialId, isInstanced) {

        var resource = this.cache;
        var matObj = resource.materials[materialId];
        if (!matObj)
            matObj = resource.defaultMaterial;

        if (isInstanced) {

            // 在InstancedMaterials中直接使用“复制源 Material" 的materialId值(存放在name属性中)
            var material = resource.instancedMaterials[matObj.name];
            if (material === undefined) {
                material = CLOUD.MaterialUtil.createInstancePhongMaterial(matObj);
            }
            matObj = material;
        }

        return matObj;
    },

    findSymbol: function (symbolId) {

        return this.symbolIndex.items[symbolId];
    }
}
CLOUD.Scene = function () {
    THREE.Scene.call(this);

    this.type = 'Scene';

    this.raycaster = new CLOUD.Raycaster();

    this.rootNode = new CLOUD.Group();
    this.rootNode.sceneRoot = true;

    this.add(this.rootNode);

    this.clipWidget = null;

    this.filter = new CLOUD.Filter();

    this.selectedIds = []; // 存一份是为了供鼠标pick使用

    this.isEnableMultiSelect = false;
};

CLOUD.Scene.prototype = Object.create(THREE.Scene.prototype);
CLOUD.Scene.prototype.constructor = CLOUD.Scene;

CLOUD.Scene.prototype.clone = function (object) {
    if (object === undefined)
        object = new CLOUD.Scene();

    THREE.Scene.prototype.clone.call(this, object);

    return object;
};

CLOUD.Scene.prototype.clearAll = function () {
    this.rootNode.children = [];
    this.rootNode.boundingBox = null;
};

CLOUD.Scene.prototype.selectionBox = function () {

    if (!this.filter.isSelectionSetEmpty()) {
        var box = new THREE.Box3();
        box.copy(this.filter.getSelectionBox());
        box.applyMatrix4(this.rootNode.matrix);
        return box;
    }

    return this.worldBoundingBox();
};

CLOUD.Scene.prototype.updateSelection = function (trf) {
    //if (trf !== undefined) {
    //    this.selectedNode.matrix = trf;
    //    this.selectedNode.updateMatrixWorld(true);
    //}
    //
    //this.rootNode.add(this.selectedNode);
};

CLOUD.Scene.prototype.worldBoundingBox = function () {
    var box = new THREE.Box3();
    box.copy(this.rootNode.boundingBox);
    box.applyMatrix4(this.rootNode.matrix);
    return box;
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

// callback(point:Vector3)
// point == null if hit nothing.
CLOUD.Scene.prototype.hitTestPosition = function (mouse, camera, callback) {
    var raycaster = this.raycaster;
    raycaster.setFromCamera(mouse, camera);
    var intersects =  this.hitTestClipPlane(raycaster.ray, raycaster.intersectObjects(this.children, true));

    if (intersects.length < 1) {
        callback(null);
        return;
    }

    intersects.sort(function (a, b) {
        return a.distance - b.distance;
    });
    callback(intersects[0].point);

};

CLOUD.Scene.prototype.pick = function (mouse, camera, callback) {
    var raycaster = this.raycaster;
    raycaster.setFromCamera(mouse, camera);

    var scope = this;

    var intersects = this.hitTestClipPlane(raycaster.ray, raycaster.intersectObjects(scope.children, true));

    intersects.sort(function (a, b) {
        return a.distance - b.distance;
    });

    var length = intersects.length;

    if (length > 0) {

        for (var ii = 0; ii < length; ++ii) {

            var intersect = intersects[ii];
            var meshNode = intersect.object;

            if (scope.filter.isVisible(meshNode)) {

                if (meshNode.userId && meshNode.geometry) {

                    intersect.userId = meshNode.userId;
                    callback(intersect);

                    return;
                }

            }
        }

    }
    else {
        callback(null);
    }
};

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

CLOUD.Scene.prototype.traverseIf = function (callback) {

    function traverseChild(node, callback) {

        var children = node.children;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            if (!callback(child)) {
                break;
            }

            if(child.visible)
                traverseChild(child, callback);
        }
    };

    var children = this.rootNode.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        traverseChild(child, callback);
    }
};

CLOUD.Scene.prototype.findSceneNode = function (sceneId) {

    var children = this.rootNode.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        if (sceneId == child.sceneId) {
            return child;
        }
    }

    return null;
};

CLOUD.Scene.prototype.showSceneNodes = function (bVisible) {

    var children = this.rootNode.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        child.visible = bVisible;
    }
}

CLOUD.Scene.prototype.prepareScene = function () {

    var _frustum = new THREE.Frustum();
    var _projScreenMatrix = new THREE.Matrix4();

    return function(camera){
        if (camera.parent === null)
            camera.updateMatrixWorld();

        camera.matrixWorldInverse.getInverse(camera.matrixWorld);
        camera.updatePositionPlane();

        _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

        _frustum.setFromMatrix(_projScreenMatrix);

        // Cell Cull and LoD
        this.traverseIf(function (object) {

            if ( object instanceof CLOUD.Cell) {
                if (_frustum.intersectsBox(object.worldBoundingBox)) {
                    object.update(camera);
                }
                else {
                    object.visible = false;
                }
                return true;
            }


            return false;
        });
    }
}();

CLOUD.Scene.prototype.enableMulitSelect = function (isMultiSelect) {
    this.isEnableMultiSelect = isMultiSelect;
};


CLOUD.Scene.prototype.selectByUserIds = function (ids) {

    this.filter.setSelectedIds(ids);

    if (ids === null) {
        this.selectedIds = [];
        this.filter.resetSelectionBox();
    }
};

CLOUD.Scene.prototype.setSelectedId = function (id) {

    if (this.isEnableMultiSelect) {
        this.selectedIds.push(id);
    } else {
        this.selectedIds = [];
        this.selectedIds.push(id);
    }

    //// 如果之前选中，则取消选中
    //if (id in this.selectedIds) {
    //    delete this.selectedIds[id];
    //    this.filter.resetSelectionBox();
    //} else {
    //    this.selectedIds[id] = 1;
    //}
};

CLOUD.Mesh = function (geometry, material, meshId) {
    THREE.Mesh.call(this, geometry, material);

    this.boundingBox = null;
    this.subMeshData = null;
    this.meshId = meshId;

    if(geometry.refCount)
        this.geometry.refCount += 1;
};

CLOUD.Mesh.prototype = Object.create(THREE.Mesh.prototype);
CLOUD.Mesh.prototype.constructor = CLOUD.Mesh;

CLOUD.Mesh.prototype.updateGeometry = function (mesh) {

    this.geometry = mesh;
    this.geometry.refCount += 1;
    this.visible = true;
}

CLOUD.Mesh.prototype.unload = function () {

    // parameter geometry
    if (!this.meshId)
        return;

    if (!this.geometry.refCount)
        return;

    this.geometry.refCount -= 1;
    this.geometry = null;
    this.visible = false;
}

CLOUD.Mesh.prototype.findSubMeshData = function (meshId) {
    if (this.subMeshData === null)
        return null;
    var subMeshes = this.subMeshData.meshes;
    for (var objId in subMeshes) {
        if (objId === meshId) {
            return subMeshes[objId];
        }
    }
    return null;
}

CLOUD.Mesh.prototype.findSubBBox = function (meshId) {
    var subMesh = this.findSubMeshData(meshId);
    if (subMesh !== null) {
        return subMesh.boundingBox;
    }

    return this.subMeshData.bbox;
};

CLOUD.Mesh.prototype.findSubGeometry = function (meshId) {
    var subMesh = this.findSubMeshData(meshId);
    if (subMesh === null) {
        if (this.geometry.name === meshId) {
            return this.geometry;
        }
        return null;
    }

    if (subMesh.geometry === undefined) {
        // vertex
        var positions = this.geometry.attributes.position.array;
        var vertexRange = subMesh.vertex;
        var vertexStart = vertexRange[0];
        var vertexCount = vertexRange[1];
        var vb = new Float32Array(vertexCount * 3);
        for (var idx = 0; idx < vertexCount; idx++) {
            var ii = (vertexStart + idx) * 3;
            vb[idx * 3] = positions[ii];
            vb[idx * 3 + 1] = positions[ii + 1];
            vb[idx * 3 + 2] = positions[ii + 2];
        }

        // index
        var idxRange = subMesh.index;
        var idxStart = idxRange[0];
        var idxEnd = idxStart + idxRange[1];
        var indices = this.geometry.index.array;
        var ib = new Uint16Array(idxRange[1]);
        for (var ii = idxStart, idx = 0; ii < idxEnd; ii++, idx++) {
            var idxNew = indices[ii] - vertexStart;
            if (idxNew < 0 || idxNew >= vertexCount) {
                idxNew = 0;
                console.log("bad index of mesh!");
            }

            ib[idx] = idxNew;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(vb, 3));
        geometry.setIndex(new THREE.BufferAttribute(ib, 1));

        subMesh.geometry = geometry;
    }

    return subMesh.geometry;
}

CLOUD.Mesh.prototype.raycast = (function () {

    var inverseMatrix = new THREE.Matrix4();
    var ray = new THREE.Ray();
    var descSort = function (a, b) {
        return a.distance - b.distance;
    };

    var intersectionPoint = new THREE.Vector3();
    var intersectionPointWorld = new THREE.Vector3();

    function checkIntersection(object, raycaster, ray, pA, pB, pC, point) {

        var intersect;
        var material = object.material;

        if (material.side === THREE.BackSide) {

            intersect = ray.intersectTriangle(pC, pB, pA, true, point);

        } else {

            intersect = ray.intersectTriangle(pA, pB, pC, material.side !== THREE.DoubleSide, point);

        }

        if (intersect === null) return null;

        intersectionPointWorld.copy(point);
        intersectionPointWorld.applyMatrix4(object.matrixWorld);

        var distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);

        if (distance < raycaster.near || distance > raycaster.far) return null;

        return {
            distance: distance,
            point: intersectionPointWorld.clone(),
            object: object
        };

    }


    return function (raycaster, intersects) {

        var geometry = this.geometry;
        var boundingBox = this.boundingBox;

        // Check boundingBox before continuing
        inverseMatrix.getInverse(this.matrixWorld);
        ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

        if (boundingBox !== null) {
            if (ray.isIntersectionBox(boundingBox) === false) {
                return;
            }
        }

        //Check the submesh exsiting.
        var userId = "";
        if (this.subMeshData !== null) {
            userId = this.subMeshData.userId;

            var meshIntersects = [];

            var subMeshes = this.subMeshData.meshes;
            for (var subObj in subMeshes) {
                var subMesh = subMeshes[subObj];
                boundingBox = subMesh.boundingBox;

                if (ray.isIntersectionBox(boundingBox) === true) {
                    this.hitTestSubMesh({ start: subMesh.index[0], count: subMesh.index[1], index: 0 }, raycaster, meshIntersects, ray, subMesh.userId, subObj);
                }
            }
            meshIntersects.sort(descSort);

            if (meshIntersects.length > 0) {
                intersects.push(meshIntersects[0]);
                return;
            }
        }

        if (geometry instanceof THREE.Geometry) {
            var fvA, fvB, fvC;
            var isFaceMaterial = material instanceof THREE.MeshFaceMaterial;
            var materials = isFaceMaterial === true ? material.materials : null;

            var vertices = geometry.vertices;
            var faces = geometry.faces;
            //var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
            //if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;

            for (var f = 0, fl = faces.length; f < fl; f++) {

                var face = faces[f];
                var faceMaterial = isFaceMaterial === true ? materials[face.materialIndex] : material;

                if (faceMaterial === undefined) continue;

                fvA = vertices[face.a];
                fvB = vertices[face.b];
                fvC = vertices[face.c];

                var intersection = checkIntersection(this, raycaster, ray, fvA, fvB, fvC, intersectionPoint);

                if (intersection) {

                    intersection.face = face;
                    intersection.faceIndex = f;
                    intersection.sceneId = raycaster.sceneId;
                    intersects.push(intersection);

                }
            }
        }
        else {
            // We have to check the full mesh.
            this.hitTestGeometry(raycaster, intersects, ray, userId, geometry.name);
        }

    }
}());

CLOUD.Mesh.prototype.clone = function (object, recursive) {
    if (object === undefined) object = new CLOUD.Mesh(this.geometry, this.material);

    THREE.Mesh.prototype.clone.call(this, object, recursive);

    return object;
};

CLOUD.Mesh.prototype.computeGlobalMatrix = function()
{
    var trf = this.matrix.clone();
    var parent = this.parent
    while (parent != null && parent.sceneRoot === undefined) {
        trf.multiplyMatrices(parent.matrix, trf);
        parent = parent.parent;
    }
    return trf;
}

CLOUD.Mesh.prototype.hitTestGeometry = function (raycaster, intersects, ray, userId, meshId) {
    var geometry = this.geometry;



    if (geometry instanceof  THREE.InstancedBufferGeometry) {

        var material = this.material;
        if (material === undefined) return;

        var precision = raycaster.precision;

        for (var i = 0; i < geometry.maxInstancedCount; i++) {

            var userId = geometry.extProperty.userIds[i];
            var bbox  = geometry.extProperty.bboxs[i];
            var transformMatrix = geometry.extProperty.transformMatrixs[i];

            var intersectionPoint = ray.intersectBox(bbox);

            if (intersectionPoint === null) continue;

            intersectionPoint.applyMatrix4(this.matrixWorld);

            var distance = raycaster.ray.origin.distanceTo(intersectionPoint);

            if (distance < precision || distance < raycaster.near || distance > raycaster.far) continue;

            intersects.push({
                transformMatrix: transformMatrix,
                bbox: bbox,
                distance: distance,
                point: intersectionPoint,
                face: null,
                faceIndex: null,
                object: this,
                ray: ray,
                sceneId: raycaster.sceneId,
                trf: this.computeGlobalMatrix()
            });
        }
    } else if (geometry instanceof THREE.BufferGeometry) {
        var material = this.material;
        if (material === undefined) return;

        var attributes = geometry.attributes;

        if (geometry.index !== undefined) {
            var indices = geometry.index.array;
            var positions = attributes.position.array;
            var offsets = geometry.groups;

            if (offsets.length === 0) {
                offsets = [{ start: 0, count: indices.length, index: 0 }];
            }

            for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {
                this.hitTestSubMesh(offsets[oi], raycaster, intersects, ray, userId, meshId);
            }
        } else {
            var vA = new THREE.Vector3();
            var vB = new THREE.Vector3();
            var vC = new THREE.Vector3();

            var a, b, c;
            var precision = raycaster.precision;

            var positions = attributes.position.array;

            for (var i = 0, j = 0, il = positions.length; i < il; i += 3, j += 9) {
                a = i;
                b = i + 1;
                c = i + 2;

                vA.fromArray(positions, j);
                vB.fromArray(positions, j + 3);
                vC.fromArray(positions, j + 6);
                var intersectionPoint;
                if (material.side === THREE.BackSide) {
                    intersectionPoint = ray.intersectTriangle(vC, vB, vA, true);
                } else {
                    intersectionPoint = ray.intersectTriangle(vA, vB, vC, material.side !== THREE.DoubleSide);
                }

                if (intersectionPoint === null) continue;

                intersectionPoint.applyMatrix4(this.matrixWorld);

                var distance = raycaster.ray.origin.distanceTo(intersectionPoint);

                if (distance < precision || distance < raycaster.near || distance > raycaster.far) continue;

                intersects.push({
                    distance: distance,
                    point: intersectionPoint,
                    face: new THREE.Face3(a, b, c, THREE.Triangle.normal(vA, vB, vC)),
                    faceIndex: null,
                    object: this,
                    ray: ray,
                    sceneId: raycaster.sceneId,
                    trf: this.computeGlobalMatrix()
                });
            }
        }
    }

};

CLOUD.Mesh.prototype.hitTestSubMesh = function (offset, raycaster, intersects, ray, userId, meshId) {
    var material = this.material;

    var vA = new THREE.Vector3();
    var vB = new THREE.Vector3();
    var vC = new THREE.Vector3();

    var a, b, c;
    var precision = raycaster.precision;

    var geometry = this.geometry;
    var attributes = geometry.attributes;
    var indices = geometry.index.array;
    var positions = attributes.position.array;

    var start = offset.start;
    var count = offset.count;
    //var index = offset.index;

    for (var i = start, il = start + count; i < il; i += 3) {
        a = indices[i];
        b = indices[i + 1];
        c = indices[i + 2];

        vA.fromArray(positions, a * 3);
        vB.fromArray(positions, b * 3);
        vC.fromArray(positions, c * 3);

        if (material.side === THREE.BackSide) {
            var intersectionPoint = ray.intersectTriangle(vC, vB, vA, true);
        } else {
            var intersectionPoint = ray.intersectTriangle(vA, vB, vC, material.side !== THREE.DoubleSide);
        }

        if (intersectionPoint === null) continue;

        intersectionPoint.applyMatrix4(this.matrixWorld);

        var distance = raycaster.ray.origin.distanceTo(intersectionPoint);

        if (distance < precision || distance < raycaster.near || distance > raycaster.far) continue;

        intersects.push({
            distance: distance,
            point: intersectionPoint,
            face: new THREE.Face3(a, b, c, THREE.Triangle.normal(vA, vB, vC)),
            faceIndex: i,
            object: this,
            ray: ray,
            meshId: meshId,
            sceneId: raycaster.sceneId,
            trf: this.computeGlobalMatrix()
        });
    }
}

CLOUD.Group = function () {
    "use strict";
    THREE.Group.call(this);

    this.type = 'Group';

    this.boundingBox = null;
};

CLOUD.Group.prototype = Object.create(THREE.Group.prototype);
CLOUD.Group.prototype.constructor = CLOUD.Group;

CLOUD.Group.prototype.unload = function () {

    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        child.unload();
    }
}

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

        if (this.subSceneRoot && this.sceneId) {
            raycaster.sceneId = this.sceneId;
        }

        return true;
    };
}());

CLOUD.Group.prototype.clone = function (object, recursive) {
    if (object === undefined) {
        object = new CLOUD.Group();
    }

    THREE.Group.prototype.clone.call(this, object, recursive);

    return object;
};

CLOUD.Cell = function () {
    "use strict";
    CLOUD.Group.call(this);

    this.type = 'Cell';

    this.worldBoundingBox = null;
};

CLOUD.Cell.prototype = Object.create(CLOUD.Group.prototype);
CLOUD.Cell.prototype.constructor = CLOUD.Cell;

CLOUD.Cell.prototype.clone = function (object, recursive) {
    if (object === undefined) {
        object = new CLOUD.Cell();
    }

    CLOUD.Group.prototype.clone.call(this, object, recursive);

    return object;
};

CLOUD.Cell.prototype.update = function () {

    var v2 = new THREE.Vector3();

    return function (camera) {
        var scope = this;

        scope.worldBoundingBox.center(v2);

        var distance = camera.positionPlane.distanceToPoint(v2);
        distance = distance * distance;

        if (scope.level === undefined || (distance < scope.level * CLOUD.GlobalData.CellVisibleDistance)) {
            //console.log(distance);
            //if (scope.level !== undefined) {
            //    console.log("xxx-" + scope.level * CLOUD.GlobalData.CellVisibleDistance);
            //}
            this.visible = true;
        }
        else {

            this.visible = false;

        }

        return this.visible;
    };
}();

CLOUD.SubScene = function () {
    "use strict";
    CLOUD.Cell.call(this);

    this.type = 'SubScene';
    this.sceneId = '';
    this.client = null;
    this.loaded = false;
    this.visible = false;
};

CLOUD.SubScene.prototype = Object.create(CLOUD.Cell.prototype);
CLOUD.SubScene.prototype.constructor = CLOUD.SubScene;

CLOUD.SubScene.prototype.unload = function () {

    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        child.unload();
    }

    if (this.embedded === undefined)
        this.children = [];

    this.loaded = false;

    this.client.geomCacheVer += 1;
}

CLOUD.SubScene.prototype.clone = function (object, recursive) {
    if (object === undefined) {
        object = new CLOUD.SubScene();
    }

    CLOUD.Cell.prototype.clone.call(this, object, recursive);

    return object;
};

CLOUD.SubScene.prototype.load = function () {
    if (!this.loaded) {
        this.visible = false;
        this.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_SUBSCENE, sceneId: this.sceneId, client: this.client });
    }
    else {
        this.visible = true;
    }
};

CLOUD.SubScene.prototype.update = function () {

    var v2 = new THREE.Vector3();

    return function (camera) {
        var scope = this;

        scope.worldBoundingBox.center(v2);

        var distance = camera.positionPlane.distanceToPoint(v2);
        var distance = distance * distance;

        if (scope.level === undefined || distance < scope.level * CLOUD.GlobalData.SubSceneVisibleDistance) {
            this.load();
        }
        else {
            this.visible = false;

            if (CLOUD.GlobalData.DynamicRelease && scope.loaded && distance > (scope.level * CLOUD.GlobalData.SubSceneVisibleDistance * 2)) {
                this.unload();
            }
        }

        return this.visible;
    };
}();
CLOUD.Raycaster = function (origin, direction, near, far) {
    "use strict";

    this.ray = new THREE.Ray(origin, direction);
    // direction is assumed to be normalized (for accurate distance calculations)

    this.near = near || 0;
    this.far = far || Infinity;

    this.params = {
        Sprite: {},
        Mesh: {},
        PointCloud: { threshold: 1 },
        LOD: {},
        Line: {}
    };
};

//
function intersectObject(object, raycaster, intersects, recursive) {
    if (!object.visible) {
        return;
    }

    var hit = object.raycast(raycaster, intersects);

    if (recursive === true) {
        // Group
        var children = object.children;
        if (children.length > 0 && !hit)
            return;

        for (var i = 0, l = children.length; i < l; i++) {
            intersectObject(children[i], raycaster, intersects, true);
        }
    }
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

    setFromCamera: function (coords, camera) {
        // camera is assumed _not_ to be a child of a transformed object
        if (camera instanceof THREE.CombinedCamera) {
            if (camera.inPerspectiveMode) {
                this.ray.origin.copy(camera.position);
                this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(camera.position).normalize();
            }
            else {
                this.ray.origin.set(coords.x, coords.y, -1).unproject(camera);
                this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
            }
        }
        else if (camera instanceof THREE.PerspectiveCamera) {
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

        intersectObject(object, this, intersects, recursive);

        //intersects.sort( descSort );

        return intersects;
    },

    intersectObjects: function (objects, recursive) {
        var intersects = [];

        if (objects instanceof Array === false) {
            console.log('CLOUD.Raycaster.intersectObjects: objects is not an Array.');
            return intersects;
        }

        for (var i = 0, l = objects.length; i < l; i++) {
            intersectObject(objects[i], this, intersects, recursive);
        }

        //intersects.sort( descSort );

        return intersects;
    }
};


CLOUD.CameraEditor = function (camera, domElement, onChange) {
    "use strict";
    this.object = camera;
    this.domElement = domElement;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus
    this.target = new THREE.Vector3();
    // the orbit center
    this.pivot = null;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 0.2;

    // Limits to how far you can dolly in and out
    this.minDistance = 0.05;
    //this.maxDistance = Infinity;
    this.maxDistance = camera.far - CLOUD.GlobalData.SceneSize * 2;//camera.far * 0.9

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1.0;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    var scope = this;

    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    //var theta;
    //var phi;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2};

    var isAtZoom = 0; // 指示是否处在滚动缩放状态
    var state = STATE.NONE;


    this.IsIdle = function () {
        return state === STATE.NONE;
    };

    this.updateView = function () {
        onChange();
    }

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
        var te = this.object.matrix.elements;

        // get X column of matrix
        panOffset.set(te[0], te[1], te[2]);
        panOffset.multiplyScalar(-distance);

        pan.add(panOffset);
        //console.log("Warning!");
    };

    // pass in distance in world space to move up
    this.panUp = function (distance) {
        var te = this.object.matrix.elements;

        // get Y column of matrix
        panOffset.set(te[4], te[5], te[6]);
        panOffset.multiplyScalar(distance);

        pan.add(panOffset);
        //console.log("Warning!");
    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function (deltaX, deltaY) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (scope.object.fov !== undefined) {
            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub(scope.target);
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
            //console.log(targetDistance);
            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
            scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
        } else if (scope.object.top !== undefined) {
            // orthographic
            scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
            scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
        } else {
            // camera neither orthographic or perspective
            console.warn('WARNING: CloudPickEditor.js encountered an unknown camera type - pan disabled.');
        }
    };

    this.pan2 = function () {
        var dim = this.getContainerDimensions();

        // 根据clientX,clientY,计算出相对父容器的offsetX,offsetY值: offsetX = clientX - dim.offset[0], offsetY = clientY - dim.offset[1]
        var ray1 = scope.object.computeRay(panStart.x - dim.offset[0], panStart.y - dim.offset[1], scope.domElement);
        var plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(scope.object.getWorldDirection(), scope.target);
        var startPt = ray1.intersectPlane(plane);

        var ray2 = scope.object.computeRay(panEnd.x - dim.offset[0], panEnd.y - dim.offset[1], scope.domElement);
        var endPt = ray2.intersectPlane(plane);
        //var startPt = scope.object.screenToWorld(panStart.x - dim.offset[0], panStart.y - dim.offset[1], scope.domElement, scope.target.clone());
        //var endPt = scope.object.screenToWorld(panEnd.x - dim.offset[0], panEnd.y - dim.offset[1], scope.domElement, scope.target.clone());
        var deltaPt = new THREE.Vector3();

        deltaPt.subVectors(startPt, endPt);
        // 相机视角很近时，鼠标移动，场景变化太小。为了在相机近距离时，鼠标的移动能使场景变化更明显，加入一个缩放系数来进行控制偏移量。
        // 进行缩放系数设定的情况：相机和目标点的距离小于某个阈值（CLOUD.GlobalData.SceneSize * 1/10），即表明需要进行缩放偏移量。
        // 鼠标中键滚动包含了平移操作，缩放偏移量会造成平移后再移回来位置不正确，故鼠标滚动缩放不设定缩放系数。

        var offset = scope.object.position.clone().sub(scope.target);
        var radius = offset.length() * scale;
        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

        // 阈值设定
        var threshold = CLOUD.GlobalData.SceneSize / 10.0;
        // 缩放系数,以场景大小作为参照，缩放范围为：[1, CLOUD.GlobalData.SceneSize]
        var coe = 1;

        if (radius < threshold) {
            // 将[0, radius / threshol] 映射到 [1, CLOUD.GlobalData.SceneSize]
            // 系数取整
            coe = Math.ceil((1 - radius / threshold) * (CLOUD.GlobalData.SceneSize - 1) + 1);
        }

        //console.log("radius = " + radius + ","+  "coe = " + coe);

        // 不是滚动缩放，才进行偏移量缩放
        if (isAtZoom === 0) {
            deltaPt.multiplyScalar(coe);
        }

        pan.add(deltaPt);
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

    this.updateCamera = function (target) {
        lastPosition.copy(this.object.position);
        lastQuaternion.copy(this.object.quaternion);
        this.target.copy(target);
        scope.reset();
    };

    this.update = function () {

        var position = this.object.position;
        var pivot = this.pivot !== null ? this.pivot.clone() : this.target;

        if(state == STATE.ROTATE){

            var viewVec = position.clone().sub(pivot);
            var viewLength = viewVec.length();
            viewVec.normalize();
            var viewTrf = null;
            var camDir = this.object.getWorldDirection();

            if (Math.abs(thetaDelta) > Math.abs(phiDelta)) {

                var rightDir = camDir.clone().cross(this.object.up);
                if (rightDir.lengthSq() > 0.001) {

                    viewTrf = new THREE.Quaternion().setFromAxisAngle(this.object.up, thetaDelta);

                    var newViewDir = viewVec.clone().applyQuaternion(viewTrf);
                    newViewDir.normalize();

                    position.copy(pivot).add(newViewDir.multiplyScalar(viewLength));


                    camDir.applyQuaternion(viewTrf);
                    camDir.normalize();

                    var newTarget = new THREE.Vector3();
                    newTarget.copy(position).add(camDir.multiplyScalar(viewLength));

                    this.target.copy(newTarget);

                    this.object.realUp.copy(rightDir).cross(camDir);
                }

            }
            else if (Math.abs(phiDelta) > 0.01) {

                var abortRotation = false;
                var rightDir = camDir.clone().cross(this.object.up);
                if (rightDir.lengthSq() < 0.001) {

                    var shouldAbortRotation = function (realUp)
                    {
                        if (Math.abs(camDir.dot(new THREE.Vector3(0, 1, 0)) - 1) < 0.001) {
                            if (phiDelta > 0)
                                return true;
                            rightDir = camDir.clone().cross(realUp);

                            //console.log("BOTTOM");
                        }

                        if (Math.abs(camDir.dot(new THREE.Vector3(0, -1, 0)) - 1) < 0.001) {
                            if (phiDelta < 0)
                                return true;

                            rightDir = camDir.clone().cross(realUp);
                            //console.log("TOP");
                        }

                        return false;
                    }
                    abortRotation = shouldAbortRotation(this.object.realUp);
                }

                if (!abortRotation) {
                    viewTrf = new THREE.Quaternion().setFromAxisAngle(rightDir, phiDelta);

                    var newViewDir = viewVec.clone().applyQuaternion(viewTrf);
                    newViewDir.normalize();

                    position.copy(pivot).add(newViewDir.multiplyScalar(viewLength));

                    camDir.applyQuaternion(viewTrf);
                    camDir.normalize();
                    var newTarget = new THREE.Vector3();
                    newTarget.copy(position).add(camDir.multiplyScalar(viewLength));

                    this.object.realUp.copy(rightDir).cross(camDir);

                    this.target.copy(newTarget);
                }
            }
        }

        if (Math.abs(scale - 1) > 0.001) {

            var camVec = position.clone().sub(this.target);
            var length = camVec.length();
            camVec.normalize();
            camVec.setLength(length * scale);
            position.copy(this.target).add(camVec);
        }

        if (state === STATE.PAN) {
            var disOffset = this.target.clone().sub(this.object.position);
            this.target.add(pan);
            this.object.position.copy(this.target).sub(disOffset);
        }

        // lookAt使用realUp
        var tmpUp = new THREE.Vector3();
        tmpUp.copy(this.object.up);
        this.object.up.copy(this.object.realUp);
        this.object.lookAt(this.target);
        this.object.up.copy(tmpUp);

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (lastPosition.distanceToSquared(this.object.position) > EPS
            || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
            onChange();

            lastPosition.copy(this.object.position);
            lastQuaternion.copy(this.object.quaternion);
        }
    };

    this.setState = function (val) {
        state = val;
    };

    this.reset = function () {
        state = STATE.NONE;

        //this.target.copy( this.target0 );
        //this.object.position.copy( this.position0 );

        this.update();
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
    };

    this.endOperation = function () {
        state = STATE.NONE;
        this.pivot = null;
    };

    this.zoom = function (delta, cx, cy) {

        if (cx === undefined || cy === undefined) {
            if (delta > 0) {
                this.dollyOut(1 + delta * 0.0005);
            } else {
                this.dollyIn(1 - delta * 0.0005);
            }
            this.update();
        }
        else {
            isAtZoom = 1; // 进入滚动缩放 置1

            // pan when zooming
            var dim = this.getContainerDimensions();
            cx = cx - dim.offset[0];
            cy = cy - dim.offset[1];

            var halfWidth = dim.size[0] / 2;
            var halfHeight = dim.size[1] / 2;

            state = STATE.PAN;

            this.beginPan(cx, cy);
            this.process(halfWidth, halfHeight);

            if (delta > 0) {
                this.dollyIn(1 + delta * 0.0005);
            } else {
                this.dollyOut(1 - delta * 0.0005);
            }
            this.update();

            this.beginPan(halfWidth, halfHeight);
            this.process(cx, cy);

            state = STATE.NONE;

            isAtZoom = 0; // 离开滚动缩放 重置0
        }
    };

    // 基于相机空间的漫游
    this.fly = function (moveVector, quaternion) {
        this.object.translateX(moveVector.x);
        this.object.translateY(moveVector.y);
        this.object.translateZ(moveVector.z);
        this.object.quaternion.multiply(quaternion);

        // expose the rotation vector for convenience
        this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);

        // update target
        this.target.copy(this.object.position).add(this.object.getWorldDirection());

        onChange();
    };

    // 基于世界空间的漫游
    this.flyOnWorld = function () {

        var up = this.object.up.clone();

        if (this.object.realUp) {
            this.object.up.copy(this.object.realUp);
        }

        // 使用realUp
        this.object.lookAt(this.target);

        if (this.object.realUp) {
            this.object.up.copy(up);
        }

        // 调用Render刷新
        onChange();
    };
    this.processRotate = function(delta){
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        scope.rotateLeft(2 * Math.PI * delta.x / element.clientWidth * scope.rotateSpeed);
    },

    this.process = function (cx, cy) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if (state === STATE.ROTATE) {
            if (scope.noRotate === true) return;

            rotateEnd.set(cx, cy);
            rotateDelta.subVectors(rotateEnd, rotateStart);

            // rotating across whole screen goes 360 degrees around
            scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

            rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
            if (scope.noZoom === true) return;

            dollyEnd.set(cx, cy);
            dollyDelta.subVectors(dollyEnd, dollyStart);

            if (dollyDelta.y > 0) {
                scope.dollyOut();
            } else {
                scope.dollyIn();
            }

            dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
            if (scope.noPan === true) return;

            panEnd.set(cx, cy);
            panDelta.subVectors(panEnd, panStart);
            scope.pan2();
            //scope.pan( panDelta.x, panDelta.y );

            panStart.copy(panEnd);
        }

        if (state !== STATE.NONE) scope.update();
    };

    this.processTouch = function (input) {
        var pointersLength = input.pointers.length;

        if (pointersLength > 1) {// 多指操作
            // ROTATE
            if (scope.noRotate !== true) {
                state = STATE.ROTATE;

                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                var thresholdAngle = 0.5 * Math.PI / 180; // 0.5度

                if ( input.deltaAngle < thresholdAngle &&  input.deltaAngle > -thresholdAngle) {
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

                scope.pan( deltaX, deltaY);
            }
        }

        if (state !== STATE.NONE) scope.update();
    };

    this.getContainerDimensions = function () {
        return CLOUD.DomUtil.getContainerOffsetToClient(this.domElement);
    };

    this.mapWindowToViewport = function (cx, cy) {
        var dim = this.getContainerDimensions();
        var mouse = new THREE.Vector2();

        mouse.x = ((cx - dim.offset[0]) / dim.size[0]) * 2 - 1;
        mouse.y = -((cy - dim.offset[1]) / dim.size[1]) * 2 + 1;

        return mouse;
    };

    this.getCameraInfo = function () {
        var camInfo = new CLOUD.CameraInfo(this.object.position, this.target, this.object.up);
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

        var position = this.object.position;
        var target = this.target;
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
        m1.lookAt(this.object.position, this.target, this.object.up);

        var quat2 = new THREE.Quaternion();
        quat2.setFromRotationMatrix(m1);

        // 获得旋转角
        var rotation = new THREE.Euler();
        rotation.setFromQuaternion(quat2, undefined, false);

        return rotation;
    }
};
CLOUD.OrbitEditor = function (cameraEditor, scene, domElement) {
    "use strict";
    this.scene = scene;
    this.domElement = (domElement !== undefined) ? domElement : document;

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };

    // camera state
    this.cameraEditor = cameraEditor;
};

CLOUD.OrbitEditor.prototype = Object.create(THREE.EventDispatcher.prototype);
CLOUD.OrbitEditor.prototype.constructor = CLOUD.OrbitEditor;

CLOUD.OrbitEditor.prototype.onExistEditor = function () {
};

CLOUD.OrbitEditor.prototype.processMouseDown = function (event) {
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
        scope.scene.hitTestPosition(mouse, camera_scope.object, function (pt) {
            camera_scope.pivot = pt;
        });

        camera_scope.beginRotate(event.clientX, event.clientY);

    } else if (event.button === scope.mouseButtons.ZOOM) {
        if (camera_scope.noZoom === true)
            return;

        camera_scope.beginZoom(event.clientX, event.clientY);
    } else if (event.button === scope.mouseButtons.PAN) {
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

CLOUD.OrbitEditor.prototype.onMouseMove = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) {
        return;
    }

    event.preventDefault();

    //console.log("[CloudOrbitEditor.onMouseMove][mouse.clientXY(" + event.clientX + "," + event.clientY + "),mouse.offsetXY(" + event.offsetX + "," + event.offsetY + ")]");

    // 当鼠标移动到其他元素上时，event.offsetX, event.offsetY获得的是鼠标在其他元素区域里的相对坐标，
    // 会造成模型跳变，所以传入event.clientX, event.clientY，根据当前父元素节点位置计算鼠标的真实偏移量
    //camera_scope.process(event.offsetX, event.offsetY);

    camera_scope.process(event.clientX, event.clientY);
};

CLOUD.OrbitEditor.prototype.onMouseUp = function ( /* event */) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) return false;

    if (camera_scope.IsIdle() === true) {
        return false;
    }
    camera_scope.endOperation();
    return true;
};

CLOUD.OrbitEditor.prototype.onMouseWheel = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false || camera_scope.noZoom === true || camera_scope.IsIdle() !== true) return;

    event.preventDefault();
    event.stopPropagation();

    //滚轮操作在浏览器中要考虑兼容性
    // 五大浏览器（IE、Opera、Safari、Firefox、Chrome）中Firefox 使用detail，其余四类使用wheelDelta；
    //两者只在取值上不一致，代表含义一致，detail与wheelDelta只各取两个值，detail只取±3，wheelDelta只取±120，其中正数表示为向上，负数表示向下。
    var delta = 0 || event.wheelDelta || event.detail;
    delta = (Math.abs(delta) > 10 ? delta : -delta * 40);

    camera_scope.zoom(delta, event.clientX, event.clientY);
    //scope.dispatchEvent( startEvent );
    //scope.dispatchEvent( endEvent );
};

CLOUD.OrbitEditor.prototype.onKeyDown = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false || camera_scope.noKeys === true || camera_scope.noPan === true) return;

    switch (event.keyCode) {
        case camera_scope.keys.UP:
            camera_scope.pan(0, -camera_scope.keyPanSpeed);
            camera_scope.update();
            break;

        case camera_scope.keys.BOTTOM:
            camera_scope.pan(0, camera_scope.keyPanSpeed);
            camera_scope.update();
            break;

        case camera_scope.keys.LEFT:
            camera_scope.pan(-camera_scope.keyPanSpeed, 0);
            camera_scope.update();
            break;

        case camera_scope.keys.RIGHT:
            camera_scope.pan(camera_scope.keyPanSpeed, 0);
            camera_scope.update();
            break;
    }
};

CLOUD.OrbitEditor.prototype.onKeyUp = function (event) {
};

CLOUD.OrbitEditor.prototype.touchstart = function (event) {
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) return;

    CloudTouch.proxy.touchsHandler(camera_scope, event);
    var input = camera_scope.session.prevInput;
    camera_scope.processTouch(input);
};

CLOUD.OrbitEditor.prototype.touchmove = function (event) {
    var scope = this;
    var camera_scope = this.cameraEditor;
    if (camera_scope.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    CloudTouch.proxy.touchsHandler(camera_scope, event);
    var input = camera_scope.session.prevInput;
    camera_scope.processTouch(input);
};

CLOUD.OrbitEditor.prototype.touchend = function( /* event */ ) {
    var camera_scope = this.cameraEditor;
    if ( camera_scope.enabled === false ) return;

    CloudTouch.proxy.touchsHandler(camera_scope, event);
    var input = camera_scope.session.prevInput;
    camera_scope.processTouch(input);

    //scope.dispatchEvent( endEvent );
     camera_scope.endOperation();
};
CLOUD.PickEditor = function (object, scene, domElement) {
    "use strict";
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    // Customize the mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };
};
CLOUD.PickEditor.prototype = Object.create(CLOUD.OrbitEditor.prototype);
CLOUD.PickEditor.prototype.constructor = CLOUD.PickEditor;

CLOUD.PickEditor.prototype.onMouseDown = function (event) {
    "use strict";
    var cameraEditor = this.cameraEditor;
    if (cameraEditor.enabled === false)
        return;
    event.preventDefault();

    // Pick
    if (event.button === THREE.MOUSE.LEFT && cameraEditor.IsIdle() === true) {
        var scope = this;
        var mouse = cameraEditor.mapWindowToViewport(event.clientX, event.clientY);

        scope.scene.pick(mouse, cameraEditor.object, function (intersect) {

            var userId = "";
            if (intersect)
                userId = intersect.userId;

            // 不需要每次更新
            if ( ( scope.lastUserId !== undefined ) || ( userId !== "" ) ) {

                if ( scope.lastUserId !== userId ) {

                    scope.lastUserId = userId;

                    if (userId === "") {
                        scope.scene.selectByUserIds(null);
                    } else {
                        scope.scene.setSelectedId(userId);
                        scope.scene.selectByUserIds(scope.scene.selectedIds);
                    }

                    cameraEditor.updateView();

                    scope.onObjectSelected(intersect);
                }
                //else { // 再次选中相同id的对象，取消选中
                //    if (userId !== "" ) {
                //        scope.scene.setSelectedId(userId);
                //        scope.scene.selectByUserIds(scope.scene.selectedIds);
                //
                //        cameraEditor.updateView();
                //
                //        scope.onObjectSelected(null);
                //    }
                //}
            }
        });
    }

    return this.processMouseDown(event);
};
CLOUD.ZoomEditor = function ( object, scene, domElement ) {
	CLOUD.OrbitEditor.call( this,  object, scene, domElement );

	this.mouseButtons = { ZOOM: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT };
};
CLOUD.ZoomEditor.prototype = Object.create( CLOUD.OrbitEditor.prototype );
CLOUD.ZoomEditor.prototype.constructor = CLOUD.ZoomEditor;

CLOUD.PanEditor = function (object, scene, domElement) {
    "use strict";
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    this.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT };
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
            var left = dim.size[0] / 2 - boxWidth / 2;
            var top = dim.size[1] / 2 - boxHeight / 2;

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
        var left = dim.size[0] / 2 - boxWidth / 2;
        var top = dim.size[1] / 2 - boxHeight / 2;

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
                            htmlText += '<img id="' + element.imgId + '" class="icon-medium" src="' + element.imgUrl + '" />';
                            htmlText += '<img id="' + element.imgId2 + '" class="icon-medium" src="' + element.imgUrl2 + '" style="display: none" />';
                        } else {
                            htmlText += '<img id="' + element.imgId + '" class="icon-medium" src="' + element.imgUrl + '" style="display: none" />';
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
    this.movementSpeed = 0.005 * CLOUD.GlobalData.SceneScale; // 前后左右上下移动速度
    this.movementSpeedMultiplier = 1; // 速度放大器
    this.speedUpCoe = 0.1; // 放大因子
    this.lookSpeed = 0.001; // 相机观察速度
    this.constrainPitch = true; // 是否限制仰角
    this.pitchMin = -Math.PI * 0.25; // 仰角最小值
    this.pitchMax = Math.PI * 0.25; // 仰角最大值
    this.pitchDeltaTotal = 0;
    this.MoveDirection = {NONE:0,UP:0x0001, DOWN:0x0002, LEFT:0x0004, RIGHT:0x0008, FORWARD:0x0010, BACK:0x0020};
    this.moveState = this.MoveDirection.NONE;

    // 保存旋转点
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    var scope = this;
    this.ui = new CLOUD.FlyEditorUI(this.domElement, function (speedMultiplier) {
        scope.movementSpeedMultiplier = speedMultiplier;
    });
    // 初始化方向控制器
    this.ui.initCross();
};

CLOUD.FlyEditor.prototype = {
    handleEvent: function (event) {
        if (typeof this[event.type] == 'function') {
            this[event.type](event);
        }
    },
    onExistEditor: function () {
        this.ui.showControlPanel(false);
    },
    onKeyDown: function (event) {
        if (event.altKey) {
            return;
        }

        var moveDirection = this.MoveDirection.NONE;
        switch (event.keyCode) {
            case 38: /*up - 前进*/
            case 87: /*W - 前进*/
                moveDirection= this.MoveDirection.FORWARD;
                break;
            case 40: /*down - 后退 */
            case 83: /*S - 后退*/
                moveDirection= this.MoveDirection.BACK;
                break;
            case 37: /*left - 左移 */
            case 65: /*A - 左移*/
                moveDirection= this.MoveDirection.LEFT;
                break;
            case 39: /*right - 右移*/
            case 68: /*D - 右移*/
                moveDirection= this.MoveDirection.RIGHT;
                break;
            case 81: /*Q - 上移*/
                moveDirection= this.MoveDirection.UP;
                break;
            case 69: /*E - 下移*/
                moveDirection= this.MoveDirection.DOWN;
                break;
            default:
                needUpdateUI = true;
        }
        if (moveDirection !== this.MoveDirection.NONE) {
            this.moveState |= moveDirection;
            this.ui.onKeyDown(moveDirection, this.MoveDirection);
        }

        this.update(1);
    },

    onKeyUp: function (event) {
        var moveDirection = this.MoveDirection.NONE;
        switch (event.keyCode) {
            case 38: /*up - 前进*/
            case 87: /*W - 前进 */
                moveDirection  = this.MoveDirection.FORWARD;
                break;
            case 40: /*down - 后退 */
            case 83: /*S - 后退 */
                moveDirection  = this.MoveDirection.BACK;
                break;
            case 37: /*left - 左移 */
            case 65: /*A - 左移 */
                moveDirection  = this.MoveDirection.LEFT;
                break;
            case 39: /*right - 右移*/
            case 68: /*D - 右移 */
                moveDirection  = this.MoveDirection.RIGHT;
                break;
            case 81: /*Q - 上移 */
                moveDirection  = this.MoveDirection.UP;
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

    onMouseDown: function (event) {
        if (this.domElement !== document) {
            this.domElement.focus();
        }

        event.preventDefault();
        event.stopPropagation();

        // 设置旋转起点
        this.rotateStart.set(event.clientX, event.clientY);

        return true;
    },

    onMouseMove: function (event) {
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
        this.rotateStart.copy(this.rotateEnd);

        var turnAngle = this.rotateDelta.x * this.lookSpeed;
        var pitchAngle = -this.rotateDelta.y * this.lookSpeed;

        // 记录总仰角
        this.pitchDeltaTotal += pitchAngle;

        // 左右旋转
        this.goTurn(turnAngle);

        // 俯仰
        if (this.constrainPitch) {
            if (this.pitchDeltaTotal < this.pitchMax && this.pitchDeltaTotal > this.pitchMin) {
                this.goPitch(pitchAngle);
            }
        } else {
            this.goPitch(pitchAngle);
        }

        // 钳制总仰角
        this.pitchDeltaTotal = THREE.Math.clamp(this.pitchDeltaTotal, this.pitchMin, this.pitchMax);

        this.update(1)
    },

    onMouseUp: function (event) {
        event.preventDefault();
        event.stopPropagation();

        this.update(1);
        return true;
    },

    onMouseWheel: function (event) {
        // 鼠标滚轮控制运动速度

        var delta = 0 || event.wheelDelta || event.detail;
        delta = (Math.abs(delta) > 10 ? delta : -delta * 40);
        this.movementSpeedMultiplier = this.ui.changeMoveSpeed(delta, this.movementSpeedMultiplier);

    },

    update: function (delta) {
        var moveMultiplier = this.movementSpeedMultiplier * this.speedUpCoe; // 将增速率限制在[0.1, 10]内
        var moveStep = delta * this.movementSpeed * moveMultiplier;

        // 前进
        if (this.moveState & this.MoveDirection.FORWARD) {
            this.goForward(moveStep);
        }

        // 后退
        if (this.moveState  & this.MoveDirection.BACK) {
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

        // 刷新
        this.cameraEditor.flyOnWorld();
    },

    // 前进
    goForward: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        // 新的target和eye在Y轴上的坐标不变
        var diff = new THREE.Vector3(target.x - eye.x, 0, target.z - eye.z);
        var len = diff.length();
        var coe = step / len;
        var stepDiff = new THREE.Vector3(diff.x * coe, 0, diff.z * coe);

        eye.add(stepDiff);
        target.add(stepDiff);
    },

    // 后退
    goBack: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        // 新的target和eye在Y轴上的坐标不变
        var diff = new THREE.Vector3(target.x - eye.x, 0, target.z - eye.z);
        var len = diff.length();
        var coe = step / len;
        var stepDiff = new THREE.Vector3(-diff.x * coe, 0, -diff.z * coe);

        eye.add(stepDiff);
        target.add(stepDiff);
    },

    // 左移
    goLeft: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        // 新的target和eye在Y轴上的坐标不变
        var diff = new THREE.Vector3(target.x - eye.x, 0, target.z - eye.z);
        var len = diff.length();
        var coe = step / len;
        var stepDiff = new THREE.Vector3(diff.z * coe, 0, -diff.x * coe);

        eye.add(stepDiff);
        target.add(stepDiff);
    },

    // 右移
    goRight: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        // 新的target和eye在Y轴上的坐标不变
        var diff = new THREE.Vector3(target.x - eye.x, 0, target.z - eye.z);
        var len = diff.length();
        var coe = step / len;
        var stepDiff = new THREE.Vector3(-diff.z * coe, 0, diff.x * coe);

        eye.add(stepDiff);
        target.add(stepDiff);
    },

    // 上移
    goUp: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        // target和eye的Y轴上的坐标增加step
        eye.y += step;
        target.y += step;
    },

    // 下移
    goDown: function (step) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        eye.y -= step;
        target.y -= step;
    },

    //  右转：angle为正； 左转：angle为负
    goTurn: function (angle) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        var diff = new THREE.Vector3(target.x - eye.x, 0, target.z - eye.z);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var centerDiff = new THREE.Vector3(diff.x * cosAngle - diff.z * sinAngle, 0, diff.x * sinAngle + diff.z * cosAngle);

        target.x = eye.x + centerDiff.x;
        target.z = eye.z + centerDiff.z;
    },

    // 俯仰
    goPitch: function (angle) {
        var eye = this.cameraEditor.object.position;
        var target = this.cameraEditor.target;

        var offsetX = target.x - eye.x;
        var offsetZ = target.z - eye.z;
        var distance = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
        var diff = new THREE.Vector3(distance, target.y - eye.y, 0);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var centerDiff = new THREE.Vector3(diff.x * cosAngle - diff.y * sinAngle, diff.x * sinAngle + diff.y * cosAngle, 0);
        var percent = centerDiff.x / distance;

        target.x = eye.x + percent * offsetX;
        target.y = eye.y + centerDiff.y;
        target.z = eye.z + percent * offsetZ;
    },

    resize: function() {
        this.ui.resize();
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
}


CLOUD.ClipEditor = function (object, scene, domElement) {
    CLOUD.OrbitEditor.call(this, object, scene, domElement);

    var clipWidget = scene.getClipWidget();
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.MIDDLE, ZOOM: THREE.MOUSE.RIGHT };

    this.toggle = function (enable, visible) {
        if (CloudShaderLib === undefined) {
            return;
        }

        clipWidget.enable(enable, visible);
    };

    this.visible = function (enable) {
        if (CloudShaderLib === undefined) {
            return;
        }

        clipWidget.visible = enable;
    };

    this.horizon = function (enable) {
        if (CloudShaderLib === undefined) {
            return;
        }

        clipWidget.horizon(enable);
    };

    this.set = function (offset) {
        if (CloudShaderLib === undefined) {
            return;
        }

        clipWidget.offset(offset);
    };

    this.rotX = function (rot) {
        if (CloudShaderLib === undefined) {
            return;
        }

        clipWidget.rotX(rot);
    };

    this.rotY = function (rot) {
        if (CloudShaderLib === undefined) {
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
        if (CloudShaderLib === undefined) {
            return null;
        }

        return clipWidget.backup();
    };

    this.restore = function (status, offset, rotx, roty) {
        if (CloudShaderLib === undefined) {
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

    this.setStandardView = function (stdView, viewer) {

        var redoRender = function (viewer, box) {

            // fit all
            var target = viewer.camera.zoomToBBox(box);

            viewer.cameraEditor.updateCamera(target);
            viewer.resetIncrementRender();  // 增量绘制的处理
            viewer.render();
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
        var box = viewer.getScene().worldBoundingBox();
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

            _isPlaying = false; // 无动画，将状态置成 false

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
                viewer.viewHouse.isAnimationFinish = false;

                // 传入更新值,这里的this是 CLOUD.Animation._object
                var interpDir = this.animDir;
                var interpUp = this.animUp;

                viewer.camera.LookAt(target, interpDir, interpUp, focal);

                redoRender(viewer, box);
            }).onComplete(function () {

                // 处理最后一帧
                viewer.viewHouse.isAnimationFinish = true; // 标记ViewHouse动画结束

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


CLOUD.Filter = function () {

    var createMaterial = function (color) {
        var material = new THREE.MeshPhongMaterial({color: color});

        if (CloudShaderLib !== undefined) {
            material.type = 'phong_cust_clip';
            material.uniforms = CloudShaderLib.phong_cust_clip.uniforms;
            material.vertexShader = CloudShaderLib.phong_cust_clip.vertexShader;
            material.fragmentShader = CloudShaderLib.phong_cust_clip.fragmentShader;
        }

        return material;
    };

    var visibilityFilter = {};

    var overridedMaterials = {};
    overridedMaterials.selection = CLOUD.MaterialUtil.createHilightMaterial();

    var materialOverriderByUserId = {};

    var materialOverriderByUserData = {};

    var selectionSet = {
        boundingBox: new THREE.Box3()
    };

    ////////////////////////////////////////////////////////////////////
    // Visbililty Filter API
    this.setFilterByUserIds = function (ids) {

        if (ids) {
            visibilityFilter.ids = {};
            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                visibilityFilter.ids[ids[ii]] = true;
            }
        }
        else {
            delete visibilityFilter.ids;
        }

    };

    this.addFilterByUserIds = function (ids) {

        if (!ids)
            return;

        if (!visibilityFilter.ids)
            visibilityFilter.ids = {};

        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            visibilityFilter.ids[ids[ii]] = true;
        }
    };

    this.addUserFilter = function (name, value) {

        if (visibilityFilter[name] === undefined)
            visibilityFilter[name] = {};

        visibilityFilter[name][value] = true;
    };

    this.getUserFilter = function (name) {
        return visibilityFilter[name];
    }

    this.removeUserFilter = function (name, value) {

        if(value === undefined){
            delete visibilityFilter[name];
        }
        else {
            delete visibilityFilter[name][value];

            if (Object.getOwnPropertyNames(visibilityFilter[name]).length == 0) {
                delete visibilityFilter[name];
            }

        }
    }

    this.clearUserFilters = function () {
        visibilityFilter = {};
    }

    ////////////////////////////////////////////////////////////////////
    // material overrider API
    this.setOverriderMaterial = function (materialName, color) {
        var material = overridedMaterials[materialName];
        if (material) {
            material.color = color;
            return material;
        }
        else {
            material = createMaterial(color);
            overridedMaterials[materialName] = material;
            return material;
        }
    };

    this.setOverriderByUserIds = function (name, ids, materialName) {
        if (name === undefined)
            materialOverriderByUserId = {};

        if (ids === undefined) {
            delete materialOverriderByUserId[name];
        }
        else {

            var material;
            if (materialName) {
                material = overridedMaterials[materialName];
            }

            var overrider = {};
            overrider.material = material ? material : overridedMaterials.selection;

            overrider.ids = {};
            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                overrider.ids[ids[ii]] = true;
            }

            materialOverriderByUserId[name] = overrider;
        }

    };

    this.setUserOverrider = function (name, value, materialName) {
        if (name === undefined)
            materialOverriderByUserData = {};

        if (value === undefined) {
            delete materialOverriderByUserData[name];
        }
        else {

            var material;
            if (materialName) {
                material = overridedMaterials[materialName];
            }

            if (!materialOverriderByUserData[name])
                materialOverriderByUserData[name] = {};

            materialOverriderByUserData[name][value] = material || overridedMaterials.selection;
        }
    };

    this.removeUserOverrider = function (name, value) {

        if (name === undefined)
            materialOverriderByUserData = {};

        if (value === undefined) {
            delete materialOverriderByUserData[name];
        }
        else {
            delete materialOverriderByUserData[name][value];
        }

    };


    ////////////////////////////////////////////////////////////////
    // 设置selectionSet的颜色
    this.setSelectionMaterial = function (color) {
        overridedMaterials.selection.color = color;
    };

    this.setSelectedIds = function (ids) {

        if (ids && ids.length > 0) {
            selectionSet.ids = {};
            for (var ii = 0, len = ids.length; ii < len; ++ii) {
                selectionSet.ids[ids[ii]] = true;
            }
        }
        else {
            delete selectionSet.ids;
        }
    };

    this.addSelectedIds = function (ids) {

        if (!ids)
            return;
        if (selectionSet.ids === undefined){
            selectionSet.ids = {};
        }


        for (var ii = 0, len = ids.length; ii < len; ++ii) {
            selectionSet.ids[ids[ii]] = true;
        }

    };
    ////////////////////////////////////////////////////////////////
    // 判断是否可见
    this.isVisible = function (node) {

        var id = node.userId;
        if (id && visibilityFilter.ids && (visibilityFilter.ids[id] === 0)) {
            return false;
        }

        if (!node.userData)
            return true;

        for (var item in visibilityFilter) {

            var userValue = node.userData[item];
            if(userValue && visibilityFilter[item][userValue] !== undefined ){
                return false;
            }
        }

        return true;
    };



    // 判断是否选中
    function isSelected (id) {

        if (selectionSet.ids && selectionSet.ids[id]) {
            return true;
        }

        return false;
    };

    // 计算选中对象的包围盒
    this.computeSelectionBox = function (object) {
        var box = object.boundingBox || (object.geometry && object.geometry.boundingBox);

        // 计算boundingBox
        if (box) {
            var box2 = box.clone();

            // 包围盒变换
            if (object.matrix) {
                box2.applyMatrix4(object.matrix);
            }

            selectionSet.boundingBox.expandByPoint(box2.min);
            selectionSet.boundingBox.expandByPoint(box2.max);
        }
    };

    // 切换材质
    this.getOverridedMaterial = function (object) {

        var id = object.userId;

        if (!id) {
            return null;
        }

        if (isSelected(id)) {
            return overridedMaterials.selection;
        }

        for (var item in materialOverriderByUserId) {
            var overrider = materialOverriderByUserId[item];
            if (overrider.ids[id])
                return overrider.material;
        }

        if (!object.userData)
            return null;

        for (var item in materialOverriderByUserData) {
            var overrider = materialOverriderByUserData[item];
            var material = overrider[object.userData[item]];
            if (material)
                return material;
        }


        return null;
    };

    // 重置包围盒
    this.resetSelectionBox = function() {
        selectionSet.boundingBox.makeEmpty();
    };

    this.getSelectionBox = function() {
        return selectionSet.boundingBox;
    };

    this.isSelectionSetEmpty = function() {
        return  !selectionSet.ids
    }
};
/*global ArrayBuffer, Uint32Array, Int32Array, Float32Array, Int8Array, Uint8Array, window, performance, Console*/

/*
Copyright (c) 2013 Khaled Mammou - Advanced Micro Devices, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var o3dgc = (function () {
    "use strict";
    var module, local;
    module = {};
    local = {};
    local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0 = 7;
    local.O3DGC_BINARY_STREAM_MAX_SYMBOL0 = 127; // ((1 << O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0) >>> 0) - 1;
    local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1 = 6;
    local.O3DGC_BINARY_STREAM_MAX_SYMBOL1 = 63; // ((1 << O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1) >>> 0) - 1;
    local.O3DGC_BINARY_STREAM_NUM_SYMBOLS_UINT32 = 5; // Math.floor((32 + O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0 - 1) / O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0);
    local.O3DGC_BIG_ENDIAN = 0;
    local.O3DGC_LITTLE_ENDIAN = 1;
    local.O3DGC_MAX_DOUBLE = 1.79769e+308;
    local.O3DGC_MIN_LONG = -2147483647;
    local.O3DGC_MAX_LONG = 2147483647;
    local.O3DGC_MAX_UCHAR8 = 255;
    local.O3DGC_MAX_TFAN_SIZE = 256;
    local.O3DGC_MAX_ULONG = 4294967295;
    local.O3DGC_SC3DMC_START_CODE = 0x00001F1;
    local.O3DGC_DV_START_CODE = 0x00001F2;
    local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES = 256;
    local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES = 256;
    local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES = 32;
    local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS = 2;
    local.O3DGC_SC3DMC_BINARIZATION_FL = 0; // Fixed Length (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_BP = 1; // BPC (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_FC = 2; // 4 bits Coding (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_AC = 3; // Arithmetic Coding (not supported)
    local.O3DGC_SC3DMC_BINARIZATION_AC_EGC = 4; // Arithmetic Coding & EGCk
    local.O3DGC_SC3DMC_BINARIZATION_ASCII = 5; // Arithmetic Coding & EGCk
    local.O3DGC_STREAM_TYPE_UNKOWN = 0;
    local.O3DGC_STREAM_TYPE_ASCII = 1;
    local.O3DGC_STREAM_TYPE_BINARY = 2;
    local.O3DGC_SC3DMC_NO_PREDICTION = 0; // supported
    local.O3DGC_SC3DMC_DIFFERENTIAL_PREDICTION = 1; // supported
    local.O3DGC_SC3DMC_XOR_PREDICTION = 2; // not supported
    local.O3DGC_SC3DMC_ADAPTIVE_DIFFERENTIAL_PREDICTION = 3; // not supported
    local.O3DGC_SC3DMC_CIRCULAR_DIFFERENTIAL_PREDICTION = 4; // not supported
    local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION = 5; // supported
    local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION = 6; // supported
    local.O3DGC_SC3DMC_ENCODE_MODE_QBCR = 0; // not supported
    local.O3DGC_SC3DMC_ENCODE_MODE_SVA = 1; // not supported
    local.O3DGC_SC3DMC_ENCODE_MODE_TFAN = 2; // supported
    local.O3DGC_DYNAMIC_VECTOR_ENCODE_MODE_LIFT = 0;
    local.O3DGC_MIN_NEIGHBORS_SIZE = 128;
    local.O3DGC_MIN_NUM_NEIGHBORS_SIZE = 16;
    local.O3DGC_TFANS_MIN_SIZE_ALLOCATED_VERTICES_BUFFER = 128;
    local.O3DGC_TFANS_MIN_SIZE_TFAN_SIZE_BUFFER = 8;
    local.O3DGC_DEFAULT_VECTOR_SIZE = 32;

    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_UNKOWN = 0;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_POSITION = 1;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_NORMAL = 2;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_COLOR = 3;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_TEXCOORD = 4;
    module.O3DGC_IFS_FLOAT_ATTRIBUTE_TYPE_WEIGHT = 5;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_UNKOWN = 0;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_INDEX = 1;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_JOINT_ID = 2;
    module.O3DGC_IFS_INT_ATTRIBUTE_TYPE_INDEX_BUFFER_ID = 3;

    module.O3DGC_OK = 0;
    module.O3DGC_ERROR_BUFFER_FULL = 1;
    module.O3DGC_ERROR_CORRUPTED_STREAM = 5;
    module.O3DGC_ERROR_NON_SUPPORTED_FEATURE = 6;
    module.O3DGC_ERROR_AC = 7;

    function SystemEndianness() {
        var a, b, c;
        b = new ArrayBuffer(4);
        a = new Uint32Array(b);
        c = new Uint8Array(b);
        a[0] = 1;
        if (c[0] === 1) {
            return local.O3DGC_LITTLE_ENDIAN;
        }
        return local.O3DGC_BIG_ENDIAN;
    }
    // SC3DMCStats class
    module.SC3DMCStats = function () {
        this.m_timeCoord = 0;
        this.m_timeNormal = 0;
        this.m_timeCoordIndex = 0;
        this.m_timeFloatAttribute = new Float32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_timeIntAttribute = new Float32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_timeReorder = 0;
        this.m_streamSizeCoord = 0;
        this.m_streamSizeNormal = 0;
        this.m_streamSizeCoordIndex = 0;
        this.m_streamSizeFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_streamSizeIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
    };
    // SC3DMCTriplet class
    module.SC3DMCTriplet = function (a, b, c) {
        this.m_a = a;
        this.m_b = b;
        this.m_c = c;
    };
    module.SC3DMCTriplet.prototype.Less = function (rhs) {
        var res;
        if (this.m_c !== rhs.m_c) {
            res = (this.m_c < rhs.m_c);
        } else if (this.m_b !== rhs.m_b) {
            res = (this.m_b < rhs.m_b);
        } else {
            res = (this.m_a < rhs.m_a);
        }
        return res;
    };
    module.SC3DMCTriplet.prototype.Equal = function (rhs) {
        return (this.m_c === rhs.m_c && this.m_b === rhs.m_b && this.m_a === rhs.m_a);
    };
    // SC3DMCPredictor class
    module.SC3DMCPredictor = function () {
        this.m_id = new module.SC3DMCTriplet(-1, -1, -1);
        this.m_pred = new Float32Array(local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
    };
    // fix me: optimize this function (e.g., binary search)
    function InsertPredictor(e, nPred, list, dimFloatArray) {
        var pos, foundOrInserted, j, j1, j0, h, i;
        pos = -1;
        foundOrInserted = false;
        j1 = nPred.m_value;
        j0 = 0;
        for (j = j0; j < j1; ++j) {
            if (e.Equal(list[j].m_id)) {
                foundOrInserted = true;
                break;
            } else if (e.Less(list[j].m_id)) {
                if (nPred.m_value < local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS) {
                    ++nPred.m_value;
                }
                for (h = nPred.m_value - 1; h > j; --h) {
                    list[h].m_id.m_a = list[h - 1].m_id.m_a;
                    list[h].m_id.m_b = list[h - 1].m_id.m_b;
                    list[h].m_id.m_c = list[h - 1].m_id.m_c;
                    for (i = 0; i < dimFloatArray; ++i) {
                        list[h].m_pred[i] = list[h - 1].m_pred[i];
                    }
                }
                list[j].m_id.m_a = e.m_a;
                list[j].m_id.m_b = e.m_b;
                list[j].m_id.m_c = e.m_c;
                pos = j;
                foundOrInserted = true;
                break;
            }
        }
        if (!foundOrInserted && nPred.m_value < local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS) {
            pos = nPred.m_value++;
            list[pos].m_id.m_a = e.m_a;
            list[pos].m_id.m_b = e.m_b;
            list[pos].m_id.m_c = e.m_c;
        }
        return pos;
    }
    // Timer class
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }
    if (!window.performance.now) {
        local.nowOffset = Date.now();
        if (performance.timing && performance.timing.navigationStart) {
            local.nowOffset = performance.timing.navigationStart;
        }
        window.performance.now = function now() {
            return Date.now() - local.nowOffset;
        };
    }
    module.Timer = function () {
        this.m_start = 0;
        this.m_end = 0;
    };
    module.Timer.prototype.Tic = function () {
        this.m_start = window.performance.now();
    };
    module.Timer.prototype.Toc = function () {
        this.m_end = window.performance.now();
    };
    module.Timer.prototype.GetElapsedTime = function () {
        return this.m_end - this.m_start;
    };
    // Vec3 class
    module.Vec3 = function (x, y, z) {
        this.m_x = x;
        this.m_y = y;
        this.m_z = z;
    };
    module.Vec3.prototype.Set = function (x, y, z) {
        this.m_x = x;
        this.m_y = y;
        this.m_z = z;
    };
    module.Vec3.prototype.Sub = function (lhs, rhs) {
        this.m_x = lhs.m_x - rhs.m_x;
        this.m_y = lhs.m_y - rhs.m_y;
        this.m_z = lhs.m_z - rhs.m_z;
    };
    module.Vec3.prototype.Add = function (lhs, rhs) {
        this.m_x = lhs.m_x + rhs.m_x;
        this.m_y = lhs.m_y + rhs.m_y;
        this.m_z = lhs.m_z + rhs.m_z;
    };
    module.Vec3.prototype.SelfAdd = function (v) {
        this.m_x += v.m_x;
        this.m_y += v.m_y;
        this.m_z += v.m_z;
    };
    module.Vec3.prototype.Cross = function (lhs, rhs) {
        this.m_x = lhs.m_y * rhs.m_z - lhs.m_z * rhs.m_y;
        this.m_y = lhs.m_z * rhs.m_x - lhs.m_x * rhs.m_z;
        this.m_z = lhs.m_x * rhs.m_y - lhs.m_y * rhs.m_x;
    };
    module.Vec3.prototype.GetNorm = function () {
        return Math.sqrt(this.m_x * this.m_x + this.m_y * this.m_y + this.m_z * this.m_z);
    };
    function SphereToCube(vin, vout) {
        var ax, ay, az;
        ax = Math.abs(vin.m_x);
        ay = Math.abs(vin.m_y);
        az = Math.abs(vin.m_z);
        if (az >= ax && az >= ay) {
            if (vin.m_z >= 0) {
                vout.m_z = 0;
                vout.m_x = vin.m_x;
                vout.m_y = vin.m_y;
            } else {
                vout.m_z = 1;
                vout.m_x = -vin.m_x;
                vout.m_y = -vin.m_y;
            }
        } else if (ay >= ax && ay >= az) {
            if (vin.m_y >= 0) {
                vout.m_z = 2;
                vout.m_x = vin.m_z;
                vout.m_y = vin.m_x;
            } else {
                vout.m_z = 3;
                vout.m_x = -vin.m_z;
                vout.m_y = -vin.m_x;
            }
        } else {
            if (vin.m_x >= 0) {
                vout.m_z = 4;
                vout.m_x = vin.m_y;
                vout.m_y = vin.m_z;
            } else {
                vout.m_z = 5;
                vout.m_x = -vin.m_y;
                vout.m_y = -vin.m_z;
            }
        }
    }
    local.CubeToSphere = {
        0: function (vin, vout) {
            vout.m_x = vin.m_x;
            vout.m_y = vin.m_y;
            vout.m_z = Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_y * vout.m_y));
        },
        1: function (vin, vout) {
            vout.m_x = -vin.m_x;
            vout.m_y = -vin.m_y;
            vout.m_z = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_y * vout.m_y));
        },
        2: function (vin, vout) {
            vout.m_z = vin.m_x;
            vout.m_x = vin.m_y;
            vout.m_y = Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_z * vout.m_z));
        },
        3: function (vin, vout) {
            vout.m_z = -vin.m_x;
            vout.m_x = -vin.m_y;
            vout.m_y = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_x * vout.m_x - vout.m_z * vout.m_z));
        },
        4: function (vin, vout) {
            vout.m_y = vin.m_x;
            vout.m_z = vin.m_y;
            vout.m_x = Math.sqrt(Math.max(0.0, 1.0 - vout.m_y * vout.m_y - vout.m_z * vout.m_z));
        },
        5: function (vin, vout) {
            vout.m_y = -vin.m_x;
            vout.m_z = -vin.m_y;
            vout.m_x = -Math.sqrt(Math.max(0.0, 1.0 - vout.m_y * vout.m_y - vout.m_z * vout.m_z));
        }
    };
    function IntToUInt(value) {
        return (value < 0) ? (-1 - (2 * value)) : (2 * value);
    }
    function UIntToInt(uiValue) {
        return (uiValue & 1) ? -((uiValue + 1) >>> 1) : ((uiValue >>> 1));
    }
    module.Iterator = function () {
        this.m_count = 0;
    };
    module.NumberRef = function () {
        this.m_value = 0;
    };
    // BinaryStream class
    module.BinaryStream = function (buffer) {
        this.m_endianness = SystemEndianness();
        this.m_buffer = buffer;
        this.m_stream = new Uint8Array(this.m_buffer);
        this.m_localBuffer = new ArrayBuffer(4);
        this.m_localBufferViewUChar8 = new Uint8Array(this.m_localBuffer);
        this.m_localBufferViewFloat32 = new Float32Array(this.m_localBuffer);
        this.m_localBufferViewUInt32 = new Uint32Array(this.m_localBuffer);
    };
    module.BinaryStream.prototype.ReadFloat32Bin = function (bsIterator) {
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
        } else {
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
        }
        return this.m_localBufferViewFloat32[0];
    };
    module.BinaryStream.prototype.ReadUInt32Bin = function (bsIterator) {
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
        } else {
            this.m_localBufferViewUChar8[0] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[1] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[2] = this.m_stream[bsIterator.m_count++];
            this.m_localBufferViewUChar8[3] = this.m_stream[bsIterator.m_count++];
        }
        return this.m_localBufferViewUInt32[0];
    };
    module.BinaryStream.prototype.ReadUChar8Bin = function (bsIterator) {
        return this.m_stream[bsIterator.m_count++];
    };
    module.BinaryStream.prototype.ReadUInt32ASCII = function (bsIterator) {
        var value, shift, i;
        value = 0;
        shift = 0;
        for (i = 0; i < local.O3DGC_BINARY_STREAM_NUM_SYMBOLS_UINT32; ++i) {
            value += (this.m_stream[bsIterator.m_count++] << shift) >>> 0;
            shift += local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0;
        }
        return value;
    };
    module.BinaryStream.prototype.ReadFloat32ASCII = function (bsIterator) {
        var value = this.ReadUInt32ASCII(bsIterator);
        if (this.m_endianness === local.O3DGC_BIG_ENDIAN) {
            this.m_localBufferViewUChar8[3] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[2] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[1] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[0] = value & local.O3DGC_MAX_UCHAR8;
        } else {
            this.m_localBufferViewUChar8[0] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[1] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[2] = value & local.O3DGC_MAX_UCHAR8;
            value >>>= 8;
            this.m_localBufferViewUChar8[3] = value & local.O3DGC_MAX_UCHAR8;
        }
        return this.m_localBufferViewFloat32[0];
    };
    module.BinaryStream.prototype.ReadIntASCII = function (bsIterator) {
        return UIntToInt(this.ReadUIntASCII(bsIterator));
    };
    module.BinaryStream.prototype.ReadUIntASCII = function (bsIterator) {
        var i, x, value;
        value = this.m_stream[bsIterator.m_count++];
        if (value === local.O3DGC_BINARY_STREAM_MAX_SYMBOL0) {
            i = 0;
            do {
                x = this.m_stream[bsIterator.m_count++];
                value += ((x >>> 1) << i) >>> 0;
                i += local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL1;
            } while (x & 1);
        }
        return value;
    };
    module.BinaryStream.prototype.ReadUCharASCII = function (bsIterator) {
        return this.m_stream[bsIterator.m_count++];
    };
    module.BinaryStream.prototype.ReadFloat32 = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadFloat32ASCII(bsIterator);
        }
        return this.ReadFloat32Bin(bsIterator);
    };
    module.BinaryStream.prototype.ReadUInt32 = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadUInt32ASCII(bsIterator);
        }
        return this.ReadUInt32Bin(bsIterator);
    };
    module.BinaryStream.prototype.ReadUChar = function (bsIterator, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.ReadUCharASCII(bsIterator);
        }
        return this.ReadUChar8Bin(bsIterator);
    };
    module.BinaryStream.prototype.GetBuffer = function (bsIterator, size) {
        return new Uint8Array(this.m_buffer, bsIterator.m_count, size);
    };

    // Copyright (c) 2004 Amir Said (said@ieee.org) & William A. Pearlman (pearlw@ecse.rpi.edu)
    // All rights reserved.

    local.O3DGC_AC_MIN_LENGTH = 0x01000000;   // threshold for renormalization
    local.O3DGC_AC_MAX_LENGTH = 0xFFFFFFFF;      // maximum AC interval length
    local.O3DGC_AC_BM_LENGTH_SHIFT = 13;     // Maximum values for binary models length bits discarded before mult.
    local.O3DGC_AC_BM_MAX_COUNT = (1 << local.O3DGC_AC_BM_LENGTH_SHIFT) >>> 0;  // for adaptive models
    local.O3DGC_AC_DM_LENGTH_SHIFT = 15; // Maximum values for general models length bits discarded before mult.
    local.O3DGC_AC_DM_MAX_COUNT = (1 << local.O3DGC_AC_DM_LENGTH_SHIFT) >>> 0;  // for adaptive models
    // StaticBitModel class
    module.StaticBitModel = function () {
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0; // p0 = 0.5
    };
    module.StaticBitModel.prototype.SetProbability = function (p) {
        this.m_bit0Prob = Math.floor(p * ((1 << local.O3DGC_AC_BM_LENGTH_SHIFT) >>> 0));
    };
    // AdaptiveBitModel class
    module.AdaptiveBitModel = function () {
        // initialization to equiprobable model
        this.m_updateCycle = 4;
        this.m_bitsUntilUpdate = 4;
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0;
        this.m_bit0Count = 1;
        this.m_bitCount = 2;
    };
    module.AdaptiveBitModel.prototype.Reset = function () {
        this.m_updateCycle = 4;
        this.m_bitsUntilUpdate = 4;
        this.m_bit0Prob = (1 << (local.O3DGC_AC_BM_LENGTH_SHIFT - 1)) >>> 0;
        this.m_bit0Count = 1;
        this.m_bitCount = 2;
    };
    module.AdaptiveBitModel.prototype.Update = function () {
        // halve counts when a threshold is reached
        if ((this.m_bitCount += this.m_updateCycle) > local.O3DGC_AC_BM_MAX_COUNT) {
            this.m_bitCount = (this.m_bitCount + 1) >>> 1;
            this.m_bit0Count = (this.m_bit0Count + 1) >>> 1;
            if (this.m_bit0Count === this.m_bitCount) {
                ++this.m_bitCount;
            }
        }
        // compute scaled bit 0 probability
        var scale = Math.floor(0x80000000 / this.m_bitCount);
        this.m_bit0Prob = (this.m_bit0Count * scale) >>> (31 - local.O3DGC_AC_BM_LENGTH_SHIFT);
        // set frequency of model updates
        this.m_updateCycle = (5 * this.m_updateCycle) >>> 2;
        if (this.m_updateCycle > 64) {
            this.m_updateCycle = 64;
        }
        this.m_bitsUntilUpdate = this.m_updateCycle;
    };
    // AdaptiveDataModel class
    module.AdaptiveDataModel = function () {
        this.m_buffer = {};
        this.m_distribution = {};
        this.m_symbolCount = {};
        this.m_decoderTable = {};
        this.m_totalCount = 0;
        this.m_updateCycle = 0;
        this.m_symbolsUntilUpdate = 0;
        this.m_dataSymbols = 0;
        this.m_lastSymbol = 0;
        this.m_tableSize = 0;
        this.m_tableShift = 0;
    };
    module.AdaptiveDataModel.prototype.Update = function () {
        var n, sum, s, scale, k, max_cycle, w;
        // halve counts when a threshold is reached
        if ((this.m_totalCount += this.m_updateCycle) > local.O3DGC_AC_DM_MAX_COUNT) {
            this.m_totalCount = 0;
            for (n = 0; n < this.m_dataSymbols; ++n) {
                this.m_totalCount += (this.m_symbolCount[n] = (this.m_symbolCount[n] + 1) >>> 1);
            }
        }
        // compute cumulative distribution, decoder table
        sum = 0;
        s = 0;
        scale = Math.floor(0x80000000 / this.m_totalCount);
        if (this.m_tableSize === 0) {
            for (k = 0; k < this.m_dataSymbols; ++k) {
                this.m_distribution[k] = (scale * sum) >>> (31 - local.O3DGC_AC_DM_LENGTH_SHIFT);
                sum += this.m_symbolCount[k];
            }
        } else {
            for (k = 0; k < this.m_dataSymbols; ++k) {
                this.m_distribution[k] = (scale * sum) >>> (31 - local.O3DGC_AC_DM_LENGTH_SHIFT);
                sum += this.m_symbolCount[k];
                w = this.m_distribution[k] >>> this.m_tableShift;
                while (s < w) {
                    this.m_decoderTable[++s] = k - 1;
                }
            }
            this.m_decoderTable[0] = 0;
            while (s <= this.m_tableSize) {
                this.m_decoderTable[++s] = this.m_dataSymbols - 1;
            }
        }
        // set frequency of model updates
        this.m_updateCycle = (5 * this.m_updateCycle) >>> 2;
        max_cycle = ((this.m_dataSymbols + 6) << 3) >>> 0;
        if (this.m_updateCycle > max_cycle) {
            this.m_updateCycle = max_cycle;
        }
        this.m_symbolsUntilUpdate = this.m_updateCycle;
    };
    module.AdaptiveDataModel.prototype.Reset = function () {
        var k;
        if (this.m_dataSymbols === 0) {
            return;
        }
        // restore probability estimates to uniform distribution
        this.m_totalCount = 0;
        this.m_updateCycle = this.m_dataSymbols;
        for (k = 0; k < this.m_dataSymbols; ++k) {
            this.m_symbolCount[k] = 1;
        }
        this.Update();
        this.m_symbolsUntilUpdate = this.m_updateCycle = (this.m_dataSymbols + 6) >>> 1;
    };
    module.AdaptiveDataModel.prototype.SetAlphabet = function (number_of_symbols) {
        if ((number_of_symbols < 2) || (number_of_symbols > (1 << 11))) {
            Console.log("invalid number of data symbols");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_dataSymbols !== number_of_symbols) { // assign memory for data model
            this.m_dataSymbols = number_of_symbols;
            this.m_lastSymbol = this.m_dataSymbols - 1;
            // define size of table for fast decoding
            if (this.m_dataSymbols > 16) {
                var table_bits = 3;
                while (this.m_dataSymbols > ((1 << (table_bits + 2)) >>> 0)) {
                    ++table_bits;
                }
                this.m_tableSize = (1 << table_bits) >>> 0;
                this.m_tableShift = local.O3DGC_AC_DM_LENGTH_SHIFT - table_bits;
                this.m_buffer = new ArrayBuffer(4 * (2 * this.m_dataSymbols + this.m_tableSize + 2));
                this.m_distribution = new Uint32Array(this.m_buffer, 0, this.m_dataSymbols);
                this.m_symbolCount = new Uint32Array(this.m_buffer, 4 * this.m_dataSymbols, this.m_dataSymbols);
                this.m_decoderTable = new Uint32Array(this.m_buffer, 8 * this.m_dataSymbols, this.m_tableSize + 2);
            } else {// small alphabet: no table needed
                this.m_tableSize = this.m_tableShift = 0;
                this.m_buffer = new ArrayBuffer(4 * 2 * this.m_dataSymbols);
                this.m_distribution = new Uint32Array(this.m_buffer, 0, this.m_dataSymbols);
                this.m_symbolCount = new Uint32Array(this.m_buffer, 4 * this.m_dataSymbols, this.m_dataSymbols);
                this.m_decoderTable = {};
            }
        }
        this.Reset(); // initialize model
        return module.O3DGC_OK;
    };
    // ArithmeticDecoder class
    module.ArithmeticDecoder = function () {
        this.m_codeBuffer = {};
        this.m_acShift = 0;
        this.m_base = 0;
        this.m_value = 0;
        this.m_length = 0; // arithmetic coding state
        this.m_bufferSize = 0;
        this.m_mode = 0; // mode: 0 = undef, 1 = encoder, 2 = decoder
    };
    module.ArithmeticDecoder.prototype.SetBuffer = function (max_code_bytes, user_buffer) {
        if (max_code_bytes === 0) {
            Console.log("invalid codec buffer size");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_mode !== 0) {
            Console.log("cannot set buffer while encoding or decoding");
            return module.O3DGC_ERROR_AC;
        }
        this.m_bufferSize = max_code_bytes;
        this.m_codeBuffer = user_buffer;
    };
    module.ArithmeticDecoder.prototype.StartDecoder = function () {
        if (this.m_mode !== 0) {
            Console.log("cannot start decoder");
            return module.O3DGC_ERROR_AC;
        }
        if (this.m_bufferSize === 0) {
            Console.log("no code buffer set");
            return module.O3DGC_ERROR_AC;
        }
        // initialize decoder: interval, pointer, initial code value
        this.m_mode = 2;
        this.m_length = local.O3DGC_AC_MAX_LENGTH;
        this.m_acShift = 3;
        this.m_value = ((this.m_codeBuffer[0] << 24) | (this.m_codeBuffer[1] << 16) | (this.m_codeBuffer[2] << 8) | (this.m_codeBuffer[3])) >>> 0;
    };
    module.ArithmeticDecoder.prototype.StopDecoder = function () {
        if (this.m_mode !== 2) {
            Console.log("invalid to stop decoder");
            return module.O3DGC_ERROR_AC;
        }
        this.m_mode = 0;
    };
    module.ArithmeticDecoder.prototype.GetBit = function () {
        this.m_length >>>= 1; // halve interval
        var bit = (this.m_value >= this.m_length); // decode bit
        if (bit) {
            this.m_value -= this.m_length; // move base
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return bit;
    };
    module.ArithmeticDecoder.prototype.GetBits = function (bits) {
        var s = Math.floor(this.m_value / (this.m_length >>>= bits)); // decode symbol, change length
        this.m_value -= this.m_length * s; // update interval
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return s;
    };
    module.ArithmeticDecoder.prototype.DecodeStaticBitModel = function (M) {
        var x, bit;
        x = M.m_bit0Prob * (this.m_length >>> local.O3DGC_AC_BM_LENGTH_SHIFT); // product l x p0
        bit = (this.m_value >= x); // decision
        // update & shift interval
        if (!bit) {
            this.m_length = x;
        } else {
            this.m_value -= x; // shifted interval base = 0
            this.m_length -= x;
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        return bit; // return data bit value
    };
    module.ArithmeticDecoder.prototype.DecodeAdaptiveBitModel = function (M) {
        var x, bit;
        x = M.m_bit0Prob * (this.m_length >>> local.O3DGC_AC_BM_LENGTH_SHIFT);   // product l x p0
        bit = (this.m_value >= x); // decision
        // update interval
        if (!bit) {
            this.m_length = x;
            ++M.m_bit0Count;
        } else {
            this.m_value -= x;
            this.m_length -= x;
        }
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        if (--M.m_bitsUntilUpdate === 0) {
            M.Update(); // periodic model update
        }
        return bit; // return data bit value
    };
    module.ArithmeticDecoder.prototype.DecodeAdaptiveDataModel = function (M) {
        var n, s, x, y, t, dv, z, m;
        y = this.m_length;
        if (M.m_tableSize > 0) { // use table look-up for faster decoding
            dv = Math.floor(this.m_value / (this.m_length >>>= local.O3DGC_AC_DM_LENGTH_SHIFT));
            t = dv >>> M.m_tableShift;
            s = M.m_decoderTable[t];         // initial decision based on table look-up
            n = M.m_decoderTable[t + 1] + 1;
            while (n > s + 1) { // finish with bisection search
                m = (s + n) >>> 1;
                if (M.m_distribution[m] > dv) {
                    n = m;
                } else {
                    s = m;
                }
            }
            // compute products
            x = M.m_distribution[s] * this.m_length;
            if (s !== M.m_lastSymbol) {
                y = M.m_distribution[s + 1] * this.m_length;
            }
        } else { // decode using only multiplications
            x = s = 0;
            this.m_length >>>= local.O3DGC_AC_DM_LENGTH_SHIFT;
            m = (n = M.m_dataSymbols) >>> 1;
            // decode via bisection search
            do {
                z = this.m_length * M.m_distribution[m];
                if (z > this.m_value) {
                    n = m;
                    y = z; // value is smaller
                } else {
                    s = m;
                    x = z; // value is larger or equal
                }
            } while ((m = (s + n) >>> 1) !== s);
        }
        this.m_value -= x; // update interval
        this.m_length = y - x;
        if (this.m_length < local.O3DGC_AC_MIN_LENGTH) {
            this.RenormDecInterval(); // renormalization
        }
        ++M.m_symbolCount[s];
        if (--M.m_symbolsUntilUpdate === 0) {
            M.Update(false); // periodic model update
        }
        return s;
    };
    module.ArithmeticDecoder.prototype.ExpGolombDecode = function (k, bModel0, bModel1) {
        var symbol, binary_symbol, l;
        symbol = 0;
        binary_symbol = 0;
        do {
            l = this.DecodeAdaptiveBitModel(bModel1);
            if (l) {
                symbol += (1 << k) >>> 0;
                k++;
            }
        } while (l);
        while (k--) { //next binary part
            if (this.DecodeStaticBitModel(bModel0)) {
                binary_symbol = (binary_symbol | (1 << k)) >>> 0;
            }
        }
        return (symbol + binary_symbol);
    };
    module.ArithmeticDecoder.prototype.RenormDecInterval = function () {
        do { // read least-significant byte
            this.m_value = ((this.m_value << 8) | this.m_codeBuffer[++this.m_acShift]) >>> 0;
            this.m_length = (this.m_length << 8) >>> 0;
        } while (this.m_length < local.O3DGC_AC_MIN_LENGTH); // length multiplied by 256
    };
    module.ArithmeticDecoder.prototype.DecodeIntACEGC = function (mModelValues, bModel0, bModel1, exp_k, M) {
        var uiValue = this.DecodeAdaptiveDataModel(mModelValues);
        if (uiValue === M) {
            uiValue += this.ExpGolombDecode(exp_k, bModel0, bModel1);
        }
        return UIntToInt(uiValue);
    };
    module.ArithmeticDecoder.prototype.DecodeUIntACEGC = function (mModelValues, bModel0, bModel1, exp_k, M) {
        var uiValue = this.DecodeAdaptiveDataModel(mModelValues);
        if (uiValue === M) {
            uiValue += this.ExpGolombDecode(exp_k, bModel0, bModel1);
        }
        return uiValue;
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FIFO class
    module.FIFO = function () {
        this.m_data = {};
        this.m_allocated = 0;
        this.m_size = 0;
        this.m_start = 0;
        this.m_end = 0;
    };
    module.FIFO.prototype.Clear = function () {
        this.m_start = this.m_end = this.m_size = 0;
    };
    module.FIFO.prototype.GetAllocatedSize = function () {
        return this.m_allocated;
    };
    module.FIFO.prototype.GetSize = function () {
        return this.m_size;
    };
    module.FIFO.prototype.Allocate = function (size) {
        if (size > this.m_allocated) {
            this.m_allocated = size;
            this.m_data = new Int32Array(this.m_allocated);
        }
        this.Clear();
        return module.O3DGC_OK;
    };
    module.FIFO.prototype.PopFirst = function () {
        --this.m_size;
        var current = this.m_start++;
        if (this.m_start === this.m_allocated) {
            this.m_end = 0;
        }
        return this.m_data[current];
    };
    module.FIFO.prototype.PushBack = function (value) {
        --this.m_size;
        this.m_data[this.m_end] = value;
        ++this.m_size;
        ++this.m_end;
        if (this.m_end === this.m_allocated) {
            this.m_end = 0;
        }
    };
    // IndexedFaceSet class
    module.IndexedFaceSet = function () {
        this.m_nCoordIndex = 0;
        this.m_nCoord = 0;
        this.m_nNormal = 0;
        this.m_numFloatAttributes = 0;
        this.m_numIntAttributes = 0;
        this.m_creaseAngle = 30.0;
        this.m_ccw = true;
        this.m_solid = true;
        this.m_convex = true;
        this.m_isTriangularMesh = true;
        this.m_coordMin = new Float32Array(3);
        this.m_coordMax = new Float32Array(3);
        this.m_normalMin = new Float32Array(3);
        this.m_normalMax = new Float32Array(3);
        this.m_nFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_nIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_dimFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_dimIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_typeFloatAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_typeIntAttribute = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_minFloatAttributeBuffer = new ArrayBuffer(4 * local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_minFloatAttribute = new Float32Array(this.m_minFloatAttributeBuffer);
        this.m_maxFloatAttributeBuffer = new ArrayBuffer(4 * local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_maxFloatAttribute = new Float32Array(this.m_maxFloatAttributeBuffer);
        this.m_coordIndex = {};
        this.m_coord = {};
        this.m_normal = {};
        this.m_floatAttribute = [];
        this.m_intAttribute = [];
    };
    module.IndexedFaceSet.prototype.GetNCoordIndex = function () {
        return this.m_nCoordIndex;
    };
    module.IndexedFaceSet.prototype.GetNCoordIndex = function () {
        return this.m_nCoordIndex;
    };
    module.IndexedFaceSet.prototype.GetNCoord = function () {
        return this.m_nCoord;
    };
    module.IndexedFaceSet.prototype.GetNNormal = function () {
        return this.m_nNormal;
    };
    module.IndexedFaceSet.prototype.GetNFloatAttribute = function (a) {
        return this.m_nFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetNIntAttribute = function (a) {
        return this.m_nIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetNumFloatAttributes = function () {
        return this.m_numFloatAttributes;
    };
    module.IndexedFaceSet.prototype.GetNumIntAttributes = function () {
        return this.m_numIntAttributes;
    };
    module.IndexedFaceSet.prototype.GetCoordMinArray = function () {
        return this.m_coordMin;
    };
    module.IndexedFaceSet.prototype.GetCoordMaxArray = function () {
        return this.m_coordMax;
    };
    module.IndexedFaceSet.prototype.GetNormalMinArray = function () {
        return this.m_normalMin;
    };
    module.IndexedFaceSet.prototype.GetNormalMaxArray = function () {
        return this.m_normalMax;
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMinArray = function (a) {
        return (new Float32Array(this.m_minFloatAttributeBuffer, a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES * 4, this.GetFloatAttributeDim(a)));
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMaxArray = function (a) {
        return (new Float32Array(this.m_maxFloatAttributeBuffer, a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES * 4, this.GetFloatAttributeDim(a)));
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeDim = function (a) {
        return this.m_dimFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttributeDim = function (a) {
        return this.m_dimIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeType = function (a) {
        return this.m_typeFloatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttributeType = function (a) {
        return this.m_typeIntAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetFloatAttributeMax = function (a, dim) {
        return this.m_maxFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim];
    };
    module.IndexedFaceSet.prototype.GetCreaseAngle = function () {
        return this.m_creaseAngle;
    };
    module.IndexedFaceSet.prototype.GetCreaseAngle = function () {
        return this.m_creaseAngle;
    };
    module.IndexedFaceSet.prototype.GetCCW = function () {
        return this.m_ccw;
    };
    module.IndexedFaceSet.prototype.GetSolid = function () {
        return this.m_solid;
    };
    module.IndexedFaceSet.prototype.GetConvex = function () {
        return this.m_convex;
    };
    module.IndexedFaceSet.prototype.GetIsTriangularMesh = function () {
        return this.m_isTriangularMesh;
    };
    module.IndexedFaceSet.prototype.GetCoordIndex = function () {
        return this.m_coordIndex;
    };
    module.IndexedFaceSet.prototype.GetCoordIndex = function () {
        return this.m_coordIndex;
    };
    module.IndexedFaceSet.prototype.GetCoord = function () {
        return this.m_coord;
    };
    module.IndexedFaceSet.prototype.GetNormal = function () {
        return this.m_normal;
    };
    module.IndexedFaceSet.prototype.GetFloatAttribute = function (a) {
        return this.m_floatAttribute[a];
    };
    module.IndexedFaceSet.prototype.GetIntAttribute = function (a) {
        return this.m_intAttribute[a];
    };
    module.IndexedFaceSet.prototype.SetNCoordIndex = function (nCoordIndex) {
        this.m_nCoordIndex = nCoordIndex;
    };
    module.IndexedFaceSet.prototype.SetNNormalIndex = function (nNormalIndex) {
    };
    module.IndexedFaceSet.prototype.SetNormalPerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetNFloatAttributeIndex = function (nFloatAttributeIndex) {
    };
    module.IndexedFaceSet.prototype.SetNIntAttributeIndex = function (nIntAttributeIndex) {
    };
    module.IndexedFaceSet.prototype.SetFloatAttributePerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetIntAttributePerVertex = function (perVertex) {
    };
    module.IndexedFaceSet.prototype.SetNCoord = function (nCoord) {
        this.m_nCoord = nCoord;
    };
    module.IndexedFaceSet.prototype.SetNNormal = function (nNormal) {
        this.m_nNormal = nNormal;
    };
    module.IndexedFaceSet.prototype.SetNumFloatAttributes = function (numFloatAttributes) {
        this.m_numFloatAttributes = numFloatAttributes;
    };
    module.IndexedFaceSet.prototype.SetNumIntAttributes = function (numIntAttributes) {
        this.m_numIntAttributes = numIntAttributes;
    };
    module.IndexedFaceSet.prototype.SetCreaseAngle = function (creaseAngle) {
        this.m_creaseAngle = creaseAngle;
    };
    module.IndexedFaceSet.prototype.SetCCW = function (ccw) {
        this.m_ccw = ccw;
    };
    module.IndexedFaceSet.prototype.SetSolid = function (solid) {
        this.m_solid = solid;
    };
    module.IndexedFaceSet.prototype.SetConvex = function (convex) {
        this.m_convex = convex;
    };
    module.IndexedFaceSet.prototype.SetIsTriangularMesh = function (isTriangularMesh) {
        this.m_isTriangularMesh = isTriangularMesh;
    };
    module.IndexedFaceSet.prototype.SetCoordMin = function (j, min) {
        this.m_coordMin[j] = min;
    };
    module.IndexedFaceSet.prototype.SetCoordMax = function (j, max) {
        this.m_coordMax[j] = max;
    };
    module.IndexedFaceSet.prototype.SetNormalMin = function (j, min) {
        this.m_normalMin[j] = min;
    };
    module.IndexedFaceSet.prototype.SetNormalMax = function (j, max) {
        this.m_normalMax[j] = max;
    };
    module.IndexedFaceSet.prototype.SetNFloatAttribute = function (a, nFloatAttribute) {
        this.m_nFloatAttribute[a] = nFloatAttribute;
    };
    module.IndexedFaceSet.prototype.SetNIntAttribute = function (a, nIntAttribute) {
        this.m_nIntAttribute[a] = nIntAttribute;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeDim = function (a, d) {
        this.m_dimFloatAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetIntAttributeDim = function (a, d) {
        this.m_dimIntAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeType = function (a, d) {
        this.m_typeFloatAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetIntAttributeType = function (a, d) {
        this.m_typeIntAttribute[a] = d;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeMin = function (a, dim, min) {
        this.m_minFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim] = min;
    };
    module.IndexedFaceSet.prototype.SetFloatAttributeMax = function (a, dim, max) {
        this.m_maxFloatAttribute[a * local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES + dim] = max;
    };
    module.IndexedFaceSet.prototype.SetCoordIndex = function (coordIndex) {
        this.m_coordIndex = coordIndex;
    };
    module.IndexedFaceSet.prototype.SetCoord = function (coord) {
        this.m_coord = coord;
    };
    module.IndexedFaceSet.prototype.SetNormal = function (normal) {
        this.m_normal = normal;
    };
    module.IndexedFaceSet.prototype.SetFloatAttribute = function (a, floatAttribute) {
        this.m_floatAttribute[a] = floatAttribute;
    };
    module.IndexedFaceSet.prototype.SetIntAttribute = function (a, intAttribute) {
        this.m_intAttribute[a] = intAttribute;
    };

    // SC3DMCEncodeParams class
    module.SC3DMCEncodeParams = function () {
        var a;
        this.m_numFloatAttributes = 0;
        this.m_numIntAttributes = 0;
        this.m_floatAttributeQuantBits = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_floatAttributePredMode = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES);
        this.m_intAttributePredMode = new Uint32Array(local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES);
        this.m_encodeMode = local.O3DGC_SC3DMC_ENCODE_MODE_TFAN;
        this.m_streamTypeMode = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_coordQuantBits = 14;
        this.m_normalQuantBits = 8;
        this.m_coordPredMode = local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        this.m_normalPredMode = local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION;
        for (a = 0; a < local.O3DGC_SC3DMC_MAX_NUM_FLOAT_ATTRIBUTES; ++a) {
            this.m_floatAttributePredMode[a] = local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        }
        for (a = 0; a < local.O3DGC_SC3DMC_MAX_NUM_INT_ATTRIBUTES; ++a) {
            this.m_intAttributePredMode[a] = local.O3DGC_SC3DMC_DIFFERENTIAL_PREDICTION;
        }
    };
    module.SC3DMCEncodeParams.prototype.GetStreamType = function () {
        return this.m_streamTypeMode;
    };
    module.SC3DMCEncodeParams.prototype.GetEncodeMode = function () {
        return this.m_encodeMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNumFloatAttributes = function () {
        return this.m_numFloatAttributes;
    };
    module.SC3DMCEncodeParams.prototype.GetNumIntAttributes = function () {
        return this.m_numIntAttributes;
    };
    module.SC3DMCEncodeParams.prototype.GetCoordQuantBits = function () {
        return this.m_coordQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalQuantBits = function () {
        return this.m_normalQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributeQuantBits = function (a) {
        return this.m_floatAttributeQuantBits[a];
    };
    module.SC3DMCEncodeParams.prototype.GetCoordPredMode = function () {
        return this.m_coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalPredMode = function () {
        return this.m_normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributePredMode = function (a) {
        return this.m_floatAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetIntAttributePredMode = function (a) {
        return this.m_intAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetCoordPredMode = function () {
        return this.m_coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetNormalPredMode = function () {
        return this.m_normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.GetFloatAttributePredMode = function (a) {
        return this.m_floatAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.GetIntAttributePredMode = function (a) {
        return this.m_intAttributePredMode[a];
    };
    module.SC3DMCEncodeParams.prototype.SetStreamType = function (streamTypeMode) {
        this.m_streamTypeMode = streamTypeMode;
    };
    module.SC3DMCEncodeParams.prototype.SetEncodeMode = function (encodeMode) {
        this.m_encodeMode = encodeMode;
    };
    module.SC3DMCEncodeParams.prototype.SetNumFloatAttributes = function (numFloatAttributes) {
        this.m_numFloatAttributes = numFloatAttributes;
    };
    module.SC3DMCEncodeParams.prototype.SetNumIntAttributes = function (numIntAttributes) {
        this.m_numIntAttributes = numIntAttributes;
    };
    module.SC3DMCEncodeParams.prototype.SetCoordQuantBits = function (coordQuantBits) {
        this.m_coordQuantBits = coordQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.SetNormalQuantBits = function (normalQuantBits) {
        this.m_normalQuantBits = normalQuantBits;
    };
    module.SC3DMCEncodeParams.prototype.SetFloatAttributeQuantBits = function (a, q) {
        this.m_floatAttributeQuantBits[a] = q;
    };
    module.SC3DMCEncodeParams.prototype.SetCoordPredMode = function (coordPredMode) {
        this.m_coordPredMode = coordPredMode;
    };
    module.SC3DMCEncodeParams.prototype.SetNormalPredMode = function (normalPredMode) {
        this.m_normalPredMode = normalPredMode;
    };
    module.SC3DMCEncodeParams.prototype.SetFloatAttributePredMode = function (a, p) {
        this.m_floatAttributePredMode[a] = p;
    };
    module.SC3DMCEncodeParams.prototype.SetIntAttributePredMode = function (a, p) {
        this.m_intAttributePredMode[a] = p;
    };
    // AdjacencyInfo class
    module.AdjacencyInfo = function () {
        this.m_neighborsSize = 0;    // actual allocated size for m_neighbors
        this.m_numNeighborsSize = 0; // actual allocated size for m_numNeighbors
        this.m_numElements = 0;      // number of elements
        this.m_neighbors = {};
        this.m_numNeighbors = {};
    };
    module.AdjacencyInfo.prototype.Allocate = function (numNeighborsSize, neighborsSize) {
        this.m_numElements = numNeighborsSize;
        if (neighborsSize > this.m_neighborsSize) {
            this.m_neighborsSize = neighborsSize;
            this.m_neighbors = new Int32Array(this.m_neighborsSize);
        }
        if (numNeighborsSize > this.m_numNeighborsSize) {
            this.m_numNeighborsSize = numNeighborsSize;
            this.m_numNeighbors = new Int32Array(this.m_numNeighborsSize);
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.AllocateNumNeighborsArray = function (numElements) {
        if (numElements > this.m_numNeighborsSize) {
            this.m_numNeighborsSize = numElements;
            this.m_numNeighbors = new Int32Array(this.m_numNeighborsSize);
        }
        this.m_numElements = numElements;
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.AllocateNeighborsArray = function () {
        var i;
        for (i = 1; i < this.m_numElements; ++i) {
            this.m_numNeighbors[i] += this.m_numNeighbors[i - 1];
        }
        if (this.m_numNeighbors[this.m_numElements - 1] > this.m_neighborsSize) {
            this.m_neighborsSize = this.m_numNeighbors[this.m_numElements - 1];
            this.m_neighbors = new Int32Array(this.m_neighborsSize);
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.ClearNumNeighborsArray = function () {
        var i;
        for (i = 0; i < this.m_numElements; ++i) {
            this.m_numNeighbors[i] = 0;
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.ClearNeighborsArray = function () {
        var i;
        for (i = 0; i < this.m_neighborsSize; ++i) {
            this.m_neighbors[i] = -1;
        }
        return module.O3DGC_OK;
    };
    module.AdjacencyInfo.prototype.Begin = function (element) {
        return (element > 0) ? this.m_numNeighbors[element - 1] : 0;
    };
    module.AdjacencyInfo.prototype.End = function (element) {
        return this.m_numNeighbors[element];
    };
    module.AdjacencyInfo.prototype.AddNeighbor = function (element, neighbor) {
        var p, p0, p1;
        p0 = this.Begin(element);
        p1 = this.End(element);
        for (p = p0; p < p1; ++p) {
            if (this.m_neighbors[p] === -1) {
                this.m_neighbors[p] = neighbor;
                return module.O3DGC_OK;
            }
        }
        return module.O3DGC_ERROR_BUFFER_FULL;
    };
    module.AdjacencyInfo.prototype.GetNeighbor = function (element) {
        return this.m_neighbors[element];
    };
    module.AdjacencyInfo.prototype.GetNumNeighbors = function (element) {
        return this.End(element) - this.Begin(element);
    };
    module.AdjacencyInfo.prototype.GetNumNeighborsBuffer = function () {
        return this.m_numNeighbors;
    };
    module.AdjacencyInfo.prototype.GetNeighborsBuffer = function () {
        return this.m_neighbors;
    };
    // Vector class
    module.Vector = function () {
        this.m_data = {};
        this.m_allocated = 0;
        this.m_size = 0;
    };
    module.Vector.prototype.Clear = function () {
        this.m_size = 0;
    };
    module.Vector.prototype.Get = function (i) {
        return this.m_data[i];
    };
    module.Vector.prototype.GetAllocatedSize = function () {
        return this.m_allocated;
    };
    module.Vector.prototype.GetSize = function () {
        return this.m_size;
    };
    module.Vector.prototype.GetBuffer = function () {
        return this.m_data;
    };
    module.Vector.prototype.SetSize = function (size) {
        this.m_size = size;
    };
    module.Vector.prototype.Allocate = function (size) {
        var i, tmp_data;
        if (size > this.m_allocated) {
            this.m_allocated = size;
            tmp_data = new Int32Array(this.m_allocated);
            if (this.m_size > 0) {
                for (i = 0; i < this.m_size; ++i) {
                    tmp_data[i] = this.m_data[i];
                }
            }
            this.m_data = tmp_data;
        }
    };
    module.Vector.prototype.PushBack = function (value) {
        var i, tmp_data;
        if (this.m_size === this.m_allocated) {
            this.m_allocated *= 2;
            if (this.m_allocated < local.O3DGC_DEFAULT_VECTOR_SIZE) {
                this.m_allocated = local.O3DGC_DEFAULT_VECTOR_SIZE;
            }
            tmp_data = new Int32Array(this.m_allocated);
            if (this.m_size > 0) {
                for (i = 0; i < this.m_size; ++i) {
                    tmp_data[i] = this.m_data[i];
                }
            }
            this.m_data = tmp_data;
        }
        this.m_data[this.m_size++] = value;
    };
    // CompressedTriangleFans class
    module.CompressedTriangleFans = function () {
        this.m_numTFANs = new module.Vector();
        this.m_degrees = new module.Vector();
        this.m_configs = new module.Vector();
        this.m_operations = new module.Vector();
        this.m_indices = new module.Vector();
        this.m_trianglesOrder = new module.Vector();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
    };
    module.CompressedTriangleFans.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.CompressedTriangleFans.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.CompressedTriangleFans.prototype.Clear = function () {
        this.m_numTFANs.Clear();
        this.m_degrees.Clear();
        this.m_configs.Clear();
        this.m_operations.Clear();
        this.m_indices.Clear();
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.Allocate = function (numVertices, numTriangles) {
        this.m_numTFANs.Allocate(numVertices);
        this.m_degrees.Allocate(2 * numVertices);
        this.m_configs.Allocate(2 * numVertices);
        this.m_operations.Allocate(2 * numVertices);
        this.m_indices.Allocate(2 * numVertices);
        this.m_trianglesOrder.Allocate(numTriangles);
        this.Clear();
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.PushNumTFans = function (numTFans) {
        this.m_numTFANs.PushBack(numTFans);
    };
    module.CompressedTriangleFans.prototype.ReadNumTFans = function (it) {
        return this.m_numTFANs.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushDegree = function (degree) {
        this.m_degrees.PushBack(degree);
    };
    module.CompressedTriangleFans.prototype.ReadDegree = function (it) {
        return this.m_degrees.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushConfig = function (config) {
        this.m_configs.PushBack(config);
    };
    module.CompressedTriangleFans.prototype.ReadConfig = function (it) {
        return this.m_configs.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushOperation = function (op) {
        this.m_operations.PushBack(op);
    };
    module.CompressedTriangleFans.prototype.ReadOperation = function (it) {
        return this.m_operations.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushIndex = function (index) {
        this.m_indices.PushBack(index);
    };
    module.CompressedTriangleFans.prototype.ReadIndex = function (it) {
        return this.m_indices.Get(it.m_count++);
    };
    module.CompressedTriangleFans.prototype.PushTriangleIndex = function (index) {
        this.m_trianglesOrder.PushBack(IntToUInt(index));
    };
    module.CompressedTriangleFans.prototype.ReadTriangleIndex = function (it) {
        return UIntToInt(this.m_trianglesOrder.Get(it.m_count++));
    };
    module.CompressedTriangleFans.prototype.LoadUIntData = function (data, bstream, it) {
        var size, i;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size);
        data.Clear();
        for (i = 0; i < size; ++i) {
            data.PushBack(bstream.ReadUIntASCII(it));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadIntData = function (data, bstream, it) {
        var size, i;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size);
        data.Clear();
        for (i = 0; i < size; ++i) {
            data.PushBack(bstream.ReadIntASCII(it));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadBinData = function (data, bstream, it) {
        var size, symbol, i, h;
        bstream.ReadUInt32ASCII(it);
        size = bstream.ReadUInt32ASCII(it);
        data.Allocate(size * local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0);
        data.Clear();
        i = 0;
        while (i < size) {
            symbol = bstream.ReadUCharASCII(it);
            for (h = 0; h < local.O3DGC_BINARY_STREAM_BITS_PER_SYMBOL0; ++h) {
                data.PushBack(symbol & 1);
                symbol >>>= 1;
                ++i;
            }
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadUIntAC = function (data, M, bstream, it) {

        var sizeSize, size, minValue, buffer, acd, mModelValues, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 12;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        minValue = bstream.ReadUInt32Bin(it);
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 1);
        for (i = 0; i < size; ++i) {
            data.PushBack(acd.DecodeAdaptiveDataModel(mModelValues) + minValue);
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadIntACEGC = function (data, M, bstream, it) {
        var sizeSize, size, minValue, buffer, acd, mModelValues, bModel0, bModel1, value, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 12;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        minValue = bstream.ReadUInt32Bin(it) - local.O3DGC_MAX_LONG;
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        for (i = 0; i < size; ++i) {
            value = acd.DecodeAdaptiveDataModel(mModelValues);
            if (value === M) {
                value += acd.ExpGolombDecode(0, bModel0, bModel1);
            }
            data.PushBack(value + minValue);
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.LoadBinAC = function (data, bstream, it) {
        var sizeSize, size, buffer, acd, bModel, i;
        sizeSize = bstream.ReadUInt32Bin(it) - 8;
        size = bstream.ReadUInt32Bin(it);
        if (size === 0) {
            return module.O3DGC_OK;
        }
        buffer = bstream.GetBuffer(it, sizeSize);
        it.m_count += sizeSize;
        data.Allocate(size);
        acd = new module.ArithmeticDecoder();
        acd.SetBuffer(sizeSize, buffer);
        acd.StartDecoder();
        bModel = new module.AdaptiveBitModel();
        for (i = 0; i < size; ++i) {
            data.PushBack(acd.DecodeAdaptiveBitModel(bModel));
        }
        return module.O3DGC_OK;
    };
    module.CompressedTriangleFans.prototype.Load = function (bstream, iterator, decodeTrianglesOrder, streamType) {
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            this.LoadUIntData(this.m_numTFANs, bstream, iterator);
            this.LoadUIntData(this.m_degrees, bstream, iterator);
            this.LoadUIntData(this.m_configs, bstream, iterator);
            this.LoadBinData(this.m_operations, bstream, iterator);
            this.LoadIntData(this.m_indices, bstream, iterator);
            if (decodeTrianglesOrder) {
                this.LoadUIntData(this.m_trianglesOrder, bstream, iterator);
            }
        } else {
            this.LoadIntACEGC(this.m_numTFANs, 4, bstream, iterator);
            this.LoadIntACEGC(this.m_degrees, 16, bstream, iterator);
            this.LoadUIntAC(this.m_configs, 10, bstream, iterator);
            this.LoadBinAC(this.m_operations, bstream, iterator);
            this.LoadIntACEGC(this.m_indices, 8, bstream, iterator);
            if (decodeTrianglesOrder) {
                this.LoadIntACEGC(this.m_trianglesOrder, 16, bstream, iterator);
            }
        }
        return module.O3DGC_OK;
    };
    // TriangleFans class
    module.TriangleFans = function () {
        this.m_verticesAllocatedSize = 0;
        this.m_sizeTFANAllocatedSize = 0;
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        this.m_sizeTFAN = {};
        this.m_vertices = {};
    };
    module.TriangleFans.prototype.Allocate = function (sizeTFAN, verticesSize) {
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        if (this.m_verticesAllocatedSize < verticesSize) {
            this.m_verticesAllocatedSize = verticesSize;
            this.m_vertices = new Int32Array(this.m_verticesAllocatedSize);
        }
        if (this.m_sizeTFANAllocatedSize < sizeTFAN) {
            this.m_sizeTFANAllocatedSize = sizeTFAN;
            this.m_sizeTFAN = new Int32Array(this.m_sizeTFANAllocatedSize);
        }
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.Clear = function () {
        this.m_numTFANs = 0;
        this.m_numVertices = 0;
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.AddVertex = function (vertex) {
        var i, tmp_vertices;
        ++this.m_numVertices;
        if (this.m_numVertices > this.m_verticesAllocatedSize) {
            this.m_verticesAllocatedSize *= 2;
            tmp_vertices = new Int32Array(this.m_verticesAllocatedSize);
            for (i = 0; i < this.m_numVertices; ++i) {
                tmp_vertices[i] = this.m_vertices[i];
            }
            this.m_vertices = tmp_vertices;
        }
        this.m_vertices[this.m_numVertices - 1] = vertex;
        ++this.m_sizeTFAN[this.m_numTFANs - 1];
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.AddTFAN = function () {
        var i, tmp_sizeTFAN;
        ++this.m_numTFANs;
        if (this.m_numTFANs > this.m_sizeTFANAllocatedSize) {
            this.m_sizeTFANAllocatedSize *= 2;
            tmp_sizeTFAN = new Int32Array(this.m_sizeTFANAllocatedSize);
            for (i = 0; i < this.m_numTFANs; ++i) {
                tmp_sizeTFAN[i] = this.m_sizeTFAN[i];
            }
            this.m_sizeTFAN = tmp_sizeTFAN;
        }
        this.m_sizeTFAN[this.m_numTFANs - 1] = (this.m_numTFANs > 1) ? this.m_sizeTFAN[this.m_numTFANs - 2] : 0;
        return module.O3DGC_OK;
    };
    module.TriangleFans.prototype.Begin = function (tfan) {
        return (tfan > 0) ? this.m_sizeTFAN[tfan - 1] : 0;
    };
    module.TriangleFans.prototype.End = function (tfan) {
        return this.m_sizeTFAN[tfan];
    };
    module.TriangleFans.prototype.GetVertex = function (vertex) {
        return this.m_vertices[vertex];
    };
    module.TriangleFans.prototype.GetTFANSize = function (tfan) {
        return this.End(tfan) - this.Begin(tfan);
    };
    module.TriangleFans.prototype.GetNumTFANs = function () {
        return this.m_numTFANs;
    };
    module.TriangleFans.prototype.GetNumVertices = function () {
        return this.m_numVertices;
    };
    // TriangleListDecoder class
    module.TriangleListDecoder = function () {
        this.m_itNumTFans = new module.Iterator();
        this.m_itDegree = new module.Iterator();
        this.m_itConfig = new module.Iterator();
        this.m_itOperation = new module.Iterator();
        this.m_itIndex = new module.Iterator();
        this.m_maxNumVertices = 0;
        this.m_maxNumTriangles = 0;
        this.m_numTriangles = 0;
        this.m_numVertices = 0;
        this.m_tempTrianglesSize = 0;
        this.m_vertexCount = 0;
        this.m_triangleCount = 0;
        this.m_numConqueredTriangles = 0;
        this.m_numVisitedVertices = 0;
        this.m_triangles = {};
        this.m_tempTriangles = {};
        this.m_visitedVertices = {};
        this.m_visitedVerticesValence = {};
        this.m_vertexToTriangle = new module.AdjacencyInfo();
        this.m_ctfans = new module.CompressedTriangleFans();
        this.m_tfans = new module.TriangleFans();
        this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_decodeTrianglesOrder = false;
        this.m_decodeVerticesOrder = false;
        this.m_processConfig = {
            0: function (decoder, degree) { // ops: 1000001 vertices: -1 -2
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            1: function (decoder, degree, focusVertex) { // ops: 1xxxxxx1 vertices: -1 x x x x x -2
                var u, op, index;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree - 1; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            2: function (decoder, degree) { // ops: 00000001 vertices: -1
                var u;
                for (u = 0; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            3: function (decoder, degree) { // ops: 00000001 vertices: -2
                var u;
                for (u = 0; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
            },
            4: function (decoder, degree) {// ops: 10000000 vertices: -1
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
                for (u = 1; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            5: function (decoder, degree) { // ops: 10000000 vertices: -2
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            6: function (decoder, degree) { // ops: 00000000 vertices:
                var u;
                for (u = 0; u < degree; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
            },
            7: function (decoder, degree) { // ops: 1000001 vertices: -2 -1
                var u;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree - 1; ++u) {
                    decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                    decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            8: function (decoder, degree, focusVertex) { // ops: 1xxxxxx1 vertices: -2 x x x x x -1
                var u, op, index;
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[1]);
                for (u = 1; u < degree - 1; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
                decoder.m_tfans.AddVertex(decoder.m_visitedVertices[0]);
            },
            9: function (decoder, degree, focusVertex) { // general case
                var u, op, index;
                for (u = 0; u < degree; ++u) {
                    op = decoder.m_ctfans.ReadOperation(decoder.m_itOperation);
                    if (op === 1) {
                        index = decoder.m_ctfans.ReadIndex(decoder.m_itIndex);
                        if (index < 0) {
                            decoder.m_tfans.AddVertex(decoder.m_visitedVertices[-index - 1]);
                        } else {
                            decoder.m_tfans.AddVertex(index + focusVertex);
                        }
                    } else {
                        decoder.m_visitedVertices[decoder.m_numVisitedVertices++] = decoder.m_vertexCount;
                        decoder.m_tfans.AddVertex(decoder.m_vertexCount++);
                    }
                }
            }
        };
    };
    module.TriangleListDecoder.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.TriangleListDecoder.prototype.GetReorderTriangles = function () {
        return this.m_decodeTrianglesOrder;
    };
    module.TriangleListDecoder.prototype.GetReorderVertices = function () {
        return this.m_decodeVerticesOrder;
    };
    module.TriangleListDecoder.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.TriangleListDecoder.prototype.GetVertexToTriangle = function () {
        return this.m_vertexToTriangle;
    };
    module.TriangleListDecoder.prototype.Reorder = function () {
        var triangles, numTriangles, order, it, prevTriangleIndex, tempTriangles, t, i;
        if (this.m_decodeTrianglesOrder) {
            triangles = this.m_triangles;
            numTriangles = this.m_numTriangles;
            order = this.m_ctfans.m_trianglesOrder.m_data;
            tempTriangles = this.m_tempTriangles;
            tempTriangles.set(triangles);
            it = 0;
            prevTriangleIndex = 0;
            for (i = 0; i < numTriangles; ++i) {
                t = UIntToInt(order[it++]) + prevTriangleIndex;
                triangles[3 * t] = tempTriangles[3 * i];
                triangles[3 * t + 1] = tempTriangles[3 * i + 1];
                triangles[3 * t + 2] = tempTriangles[3 * i + 2];
                prevTriangleIndex = t + 1;
            }
        }
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.CompueLocalConnectivityInfo = function (focusVertex) {
        var visitedVertices, visitedVerticesValence, triangles, vertexToTriangle, beginV2T, endV2T, numConqueredTriangles, foundOrInserted, numVisitedVertices, tmp, i, j, k, h, x, y, t, p, v;
        visitedVertices = this.m_visitedVertices;
        visitedVerticesValence = this.m_visitedVerticesValence;
        triangles = this.m_triangles;
        vertexToTriangle = this.m_vertexToTriangle;
        beginV2T = vertexToTriangle.Begin(focusVertex);
        endV2T = vertexToTriangle.End(focusVertex);
        numConqueredTriangles = 0;
        numVisitedVertices = 0;
        t = 0;
        for (i = beginV2T; (t >= 0) && (i < endV2T); ++i) {
            t = vertexToTriangle.GetNeighbor(i);
            if (t >= 0) {
                ++numConqueredTriangles;
                p = 3 * t;
                // extract visited vertices
                for (k = 0; k < 3; ++k) {
                    v = triangles[p + k];
                    if (v > focusVertex) { // vertices are insertices by increasing traversal order
                        foundOrInserted = false;
                        for (j = 0; j < numVisitedVertices; ++j) {
                            if (v === visitedVertices[j]) {
                                visitedVerticesValence[j]++;
                                foundOrInserted = true;
                                break;
                            } else if (v < visitedVertices[j]) {
                                ++numVisitedVertices;
                                for (h = numVisitedVertices - 1; h > j; --h) {
                                    visitedVertices[h] = visitedVertices[h - 1];
                                    visitedVerticesValence[h] = visitedVerticesValence[h - 1];
                                }
                                visitedVertices[j] = v;
                                visitedVerticesValence[j] = 1;
                                foundOrInserted = true;
                                break;
                            }
                        }
                        if (!foundOrInserted) {
                            visitedVertices[numVisitedVertices] = v;
                            visitedVerticesValence[numVisitedVertices] = 1;
                            numVisitedVertices++;
                        }
                    }
                }
            }
        }
        // re-order visited vertices by taking into account their valence (i.e., # of conquered triangles incident to each vertex)
        // in order to avoid config. 9
        if (numVisitedVertices > 2) {
            for (x = 1; x < numVisitedVertices; ++x) {
                if (visitedVerticesValence[x] === 1) {
                    y = x;
                    while ((y > 0) && (visitedVerticesValence[y] < visitedVerticesValence[y - 1])) {
                        tmp = visitedVerticesValence[y];
                        visitedVerticesValence[y] = visitedVerticesValence[y - 1];
                        visitedVerticesValence[y - 1] = tmp;
                        tmp = visitedVertices[y];
                        visitedVertices[y] = visitedVertices[y - 1];
                        visitedVertices[y - 1] = tmp;
                        --y;
                    }
                }
            }
        }
        this.m_numConqueredTriangles = numConqueredTriangles;
        this.m_numVisitedVertices = numVisitedVertices;
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.DecompressTFAN = function (focusVertex) {
        var vertexToTriangle, triangles, itDegree, itConfig, tfans, ntfans, processConfig, ctfans, triangleCount, numConqueredTriangles, degree, config, k0, k1, b, c, t, f, k;
        vertexToTriangle = this.m_vertexToTriangle;
        triangles = this.m_triangles;
        itDegree = this.m_itDegree;
        itConfig = this.m_itConfig;
        tfans = this.m_tfans;
        processConfig = this.m_processConfig;
        ctfans = this.m_ctfans;
        triangleCount = this.m_triangleCount;
        numConqueredTriangles = this.m_numConqueredTriangles;
        ntfans = ctfans.ReadNumTFans(this.m_itNumTFans);
        if (ntfans > 0) {
            for (f = 0; f < ntfans; ++f) {
                tfans.AddTFAN();
                degree = ctfans.ReadDegree(itDegree) + 2 - numConqueredTriangles;
                config = ctfans.ReadConfig(itConfig);
                k0 = tfans.GetNumVertices();
                tfans.AddVertex(focusVertex);
                processConfig[config](this, degree, focusVertex);
                k1 = tfans.GetNumVertices();
                b = tfans.GetVertex(k0 + 1);
                for (k = k0 + 2; k < k1; ++k) {
                    c = tfans.GetVertex(k);
                    t = triangleCount * 3;
                    triangles[t++] = focusVertex;
                    triangles[t++] = b;
                    triangles[t] = c;
                    vertexToTriangle.AddNeighbor(focusVertex, triangleCount);
                    vertexToTriangle.AddNeighbor(b, triangleCount);
                    vertexToTriangle.AddNeighbor(c, triangleCount);
                    b = c;
                    triangleCount++;
                }
            }
        }
        this.m_triangleCount = triangleCount;
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Decompress = function () {
        var focusVertex;
        for (focusVertex = 0; focusVertex < this.m_numVertices; ++focusVertex) {
            if (focusVertex === this.m_vertexCount) {
                this.m_vertexCount++; // insert focusVertex
            }
            this.CompueLocalConnectivityInfo(focusVertex);
            this.DecompressTFAN(focusVertex);
        }
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Init = function (triangles, numTriangles, numVertices, maxSizeV2T) {
        var i, numNeighbors;
        this.m_numTriangles = numTriangles;
        this.m_numVertices = numVertices;
        this.m_triangles = triangles;
        this.m_vertexCount = 0;
        this.m_triangleCount = 0;
        this.m_itNumTFans.m_count = 0;
        this.m_itDegree.m_count = 0;
        this.m_itConfig.m_count = 0;
        this.m_itOperation.m_count = 0;
        this.m_itIndex.m_count = 0;
        if (this.m_numVertices > this.m_maxNumVertices) {
            this.m_maxNumVertices = this.m_numVertices;
            this.m_visitedVerticesValence = new Int32Array(this.m_numVertices);
            this.m_visitedVertices = new Int32Array(this.m_numVertices);
        }
        if (this.m_decodeTrianglesOrder && this.m_tempTrianglesSize < this.m_numTriangles) {
            this.m_tempTrianglesSize = this.m_numTriangles;
            this.m_tempTriangles = new Int32Array(3 * this.m_tempTrianglesSize);
        }
        this.m_ctfans.SetStreamType(this.m_streamType);
        this.m_ctfans.Allocate(this.m_numVertices, this.m_numTriangles);
        this.m_tfans.Allocate(2 * this.m_numVertices, 8 * this.m_numVertices);
        // compute vertex-to-triangle adjacency information
        this.m_vertexToTriangle.AllocateNumNeighborsArray(numVertices);
        numNeighbors = this.m_vertexToTriangle.GetNumNeighborsBuffer();
        for (i = 0; i < numVertices; ++i) {
            numNeighbors[i] = maxSizeV2T;
        }
        this.m_vertexToTriangle.AllocateNeighborsArray();
        this.m_vertexToTriangle.ClearNeighborsArray();
        return module.O3DGC_OK;
    };
    module.TriangleListDecoder.prototype.Decode = function (triangles, numTriangles, numVertices, bstream, it) {
        var compressionMask, maxSizeV2T;
        compressionMask = bstream.ReadUChar(it, this.m_streamType);
        this.m_decodeTrianglesOrder = ((compressionMask & 2) !== 0);
        this.m_decodeVerticesOrder = ((compressionMask & 1) !== 0);
        if (this.m_decodeVerticesOrder) { // vertices reordering not supported
            return module.O3DGC_ERROR_NON_SUPPORTED_FEATURE;
        }
        maxSizeV2T = bstream.ReadUInt32(it, this.m_streamType);
        this.Init(triangles, numTriangles, numVertices, maxSizeV2T);
        this.m_ctfans.Load(bstream, it, this.m_decodeTrianglesOrder, this.m_streamType);
        this.Decompress();
        return module.O3DGC_OK;
    };
    // SC3DMCDecoder class
    module.SC3DMCDecoder = function () {
        var i;
        this.m_iterator = new module.Iterator();
        this.m_streamSize = 0;
        this.m_params = new module.SC3DMCEncodeParams();
        this.m_triangleListDecoder = new module.TriangleListDecoder();
        this.m_quantFloatArray = {};
        this.m_orientation = {};
        this.m_normals = {};
        this.m_quantFloatArraySize = 0;
        this.m_normalsSize = 0;
        this.m_orientationSize = 0;
        this.m_stats = new module.SC3DMCStats();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
        this.m_neighbors = [];
        this.m_idelta = new Float32Array(local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES);
        this.m_minNormal = new Float32Array(2);
        this.m_maxNormal = new Float32Array(2);
        this.m_minNormal[0] = this.m_minNormal[1] = -2;
        this.m_maxNormal[0] = this.m_maxNormal[1] = 2;
        for (i = 0; i < local.O3DGC_SC3DMC_MAX_DIM_ATTRIBUTES; ++i) {
            this.m_neighbors[i] = new module.SC3DMCPredictor();
        }
    };
    module.SC3DMCDecoder.prototype.GetStats = function () {
        return this.m_stats;
    };
    module.SC3DMCDecoder.prototype.DecodeHeader = function (ifs, bstream) {
        var c0, start_code, mask, j, a, d;
        c0 = this.m_iterator.m_count;
        start_code = bstream.ReadUInt32(this.m_iterator, local.O3DGC_STREAM_TYPE_BINARY);
        if (start_code !== local.O3DGC_SC3DMC_START_CODE) {
            this.m_iterator.m_count = c0;
            start_code = bstream.ReadUInt32(this.m_iterator, local.O3DGC_STREAM_TYPE_ASCII);
            if (start_code !== local.O3DGC_SC3DMC_START_CODE) {
                return module.O3DGC_ERROR_CORRUPTED_STREAM;
            }
            this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        } else {
            this.m_streamType = local.O3DGC_STREAM_TYPE_BINARY;
        }
        this.m_streamSize = bstream.ReadUInt32(this.m_iterator, this.m_streamType);
        this.m_params.SetEncodeMode(bstream.ReadUChar(this.m_iterator, this.m_streamType));

        ifs.SetCreaseAngle(bstream.ReadFloat32(this.m_iterator, this.m_streamType));
        mask = bstream.ReadUChar(this.m_iterator, this.m_streamType);
        ifs.SetCCW((mask & 1) === 1);
        ifs.SetSolid((mask & 2) === 1);
        ifs.SetConvex((mask & 4) === 1);
        ifs.SetIsTriangularMesh((mask & 8) === 1);

        ifs.SetNCoord(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNNormal(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNumFloatAttributes(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
        ifs.SetNumIntAttributes(bstream.ReadUInt32(this.m_iterator, this.m_streamType));

        if (ifs.GetNCoord() > 0) {
            ifs.SetNCoordIndex(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            for (j = 0; j < 3; ++j) {
                ifs.SetCoordMin(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                ifs.SetCoordMax(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
            }
            this.m_params.SetCoordQuantBits(bstream.ReadUChar(this.m_iterator, this.m_streamType));
        }
        if (ifs.GetNNormal() > 0) {
            ifs.SetNNormalIndex(bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            for (j = 0; j < 3; ++j) {
                ifs.SetNormalMin(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                ifs.SetNormalMax(j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
            }
            ifs.SetNormalPerVertex(bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
            this.m_params.SetNormalQuantBits(bstream.ReadUChar(this.m_iterator, this.m_streamType));
        }
        for (a = 0; a < ifs.GetNumFloatAttributes(); ++a) {
            ifs.SetNFloatAttribute(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            if (ifs.GetNFloatAttribute(a) > 0) {
                ifs.SetNFloatAttributeIndex(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
                d = bstream.ReadUChar(this.m_iterator, this.m_streamType);
                ifs.SetFloatAttributeDim(a, d);
                for (j = 0; j < d; ++j) {
                    ifs.SetFloatAttributeMin(a, j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                    ifs.SetFloatAttributeMax(a, j, bstream.ReadFloat32(this.m_iterator, this.m_streamType));
                }
                ifs.SetFloatAttributePerVertex(a, bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
                ifs.SetFloatAttributeType(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
                this.m_params.SetFloatAttributeQuantBits(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
            }
        }
        for (a = 0; a < ifs.GetNumIntAttributes(); ++a) {
            ifs.SetNIntAttribute(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
            if (ifs.GetNIntAttribute(a) > 0) {
                ifs.SetNIntAttributeIndex(a, bstream.ReadUInt32(this.m_iterator, this.m_streamType));
                ifs.SetIntAttributeDim(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
                ifs.SetIntAttributePerVertex(a, bstream.ReadUChar(this.m_iterator, this.m_streamType) === 1);
                ifs.SetIntAttributeType(a, bstream.ReadUChar(this.m_iterator, this.m_streamType));
            }
        }
        return module.O3DGC_OK;
    };
    function DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride) {
        var ws, k, p, w, i, id;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        for (k = 0; k < 3; ++k) {
            w = triangles[ta * 3 + k];
            if (w < v) {
                id.m_a = -1;
                id.m_b = -1;
                id.m_c = w;
                p = InsertPredictor(id, nPred, neighbors, dimFloatArray);
                if (p !== -1) {
                    ws = w * stride;
                    for (i = 0; i < dimFloatArray; ++i) {
                        neighbors[p].m_pred[i] = quantFloatArray[ws + i];
                    }
                }
            }
        }
    }
    function ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors) {
        var ta3, tb3, as, bs, cs, a, b, c, x, i, k, u1_begin, u1_end, u1, tb, foundB, p, id;
        ta3 = ta * 3;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (triangles[ta3] === v) {
            a = triangles[ta3 + 1];
            b = triangles[ta3 + 2];
        } else if (triangles[ta3 + 1] === v) {
            a = triangles[ta3];
            b = triangles[ta3 + 2];
        } else {
            a = triangles[ta3];
            b = triangles[ta3 + 1];
        }
        if (a < v && b < v) {
            u1_begin = v2T.Begin(a);
            u1_end = v2T.End(a);
            for (u1 = u1_begin; u1 < u1_end; ++u1) {
                tb = v2TNeighbors[u1];
                if (tb < 0) {
                    break;
                }
                tb3 = tb * 3;
                c = -1;
                foundB = false;
                for (k = 0; k < 3; ++k) {
                    x = triangles[tb3 + k];
                    if (x === b) {
                        foundB = true;
                    } else if (x < v && x !== a) {
                        c = x;
                    }
                }
                if (c !== -1 && foundB) {
                    if (a < b) {
                        id.m_a = a;
                        id.m_b = b;
                    } else {
                        id.m_a = b;
                        id.m_b = a;
                    }
                    id.m_c = (-c - 1);
                    p = InsertPredictor(id, nPred, neighbors, dimFloatArray);
                    if (p !== -1) {
                        as = a * stride;
                        bs = b * stride;
                        cs = c * stride;
                        for (i = 0; i < dimFloatArray; ++i) {
                            neighbors[p].m_pred[i] = quantFloatArray[as + i] + quantFloatArray[bs + i] - quantFloatArray[cs + i];
                        }
                    }
                }
            }
        }
    }
    module.SC3DMCDecoder.prototype.DecodeIntArrayBinary = function (intArray,
                                                                    numIntArray,
                                                                    dimIntArray,
                                                                    stride,
                                                                    ifs,
                                                                    predMode,
                                                                    bstream) {
        var testPredEnabled, bestPred, i, u, ta, u_begin, u_end, buffer, iterator, streamType, predResidual, acd, bModel0, bModel1, mModelPreds, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, exp_k, M, id, mModelValues, neighbors, normals, nPred, v;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        mModelPreds = new module.AdaptiveDataModel();
        mModelPreds.SetAlphabet(local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS + 1);
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numIntArray * dimIntArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);        // bitsream size
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        exp_k = 0;
        M = 0;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_AC_EGC) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        buffer = bstream.GetBuffer(iterator, streamSize);
        iterator.m_count += streamSize;
        acd.SetBuffer(streamSize, buffer);
        acd.StartDecoder();
        exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
        M = acd.ExpGolombDecode(0, bModel0, bModel1);
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        for (v = 0; v < numIntArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                for (u = u_begin; u < u_end; ++u) {
                    ta = v2TNeighbors[u];
                    if (ta < 0) {
                        break;
                    }
                    DeltaPredictors(triangles, ta, v, nPred, neighbors, dimIntArray, intArray, stride);
                }
            }
            if (nPred.m_value > 1) {
                bestPred = acd.DecodeAdaptiveDataModel(mModelPreds);
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual + intArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = acd.DecodeUIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    intArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeIntArrayASCII = function (intArray,
                                                                   numIntArray,
                                                                   dimIntArray,
                                                                   stride,
                                                                   ifs,
                                                                   predMode,
                                                                   bstream) {
        var testPredEnabled, iterator, streamType, predResidual, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, id, neighbors, normals, nPred, v, u_begin, u_end, u, ta, i, bestPred;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numIntArray * dimIntArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);        // bitsream size
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        id = new module.SC3DMCTriplet(-1, -1, -1);
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_ASCII) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        bstream.ReadUInt32(iteratorPred, streamType);        // predictors bitsream size
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        for (v = 0; v < numIntArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                for (u = u_begin; u < u_end; ++u) {
                    ta = v2TNeighbors[u];
                    if (ta < 0) {
                        break;
                    }
                    DeltaPredictors(triangles, ta, v, nPred, neighbors, dimIntArray, intArray, stride);
                }
            }
            if (nPred.m_value > 1) {
                bestPred = bstream.ReadUCharASCII(iteratorPred);
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    intArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    intArray[v * stride + i] = predResidual + intArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimIntArray; ++i) {
                    predResidual = bstream.ReadUIntASCII(iterator);
                    intArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeIntArray = function (intArray,
                                                              numIntArray,
                                                              dimIntArray,
                                                              stride,
                                                              ifs,
                                                              predMode,
                                                              bstream) {
        if (this.m_streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.DecodeIntArrayASCII(intArray, numIntArray, dimIntArray, stride, ifs, predMode, bstream);
        }
        return this.DecodeIntArrayBinary(intArray, numIntArray, dimIntArray, stride, ifs, predMode, bstream);
    };
    function ComputeNormals(triangles, ntris, coords, nvert, normals) {
        var t3, v, n, t, a, b, c, d1, d2, n0;
        n0 = new module.Vec3();
        d1 = new module.Vec3();
        d2 = new module.Vec3();
        n = nvert * 3;
        for (v = 0; v < n; ++v) {
            normals[v] = 0;
        }
        for (t = 0; t < ntris; ++t) {
            t3 = t * 3;
            a = triangles[t3] * 3;
            b = triangles[t3 + 1] * 3;
            c = triangles[t3 + 2] * 3;
            d1.m_x = coords[b] - coords[a];
            d1.m_y = coords[b + 1] - coords[a + 1];
            d1.m_z = coords[b + 2] - coords[a + 2];
            d2.m_x = coords[c] - coords[a];
            d2.m_y = coords[c + 1] - coords[a + 1];
            d2.m_z = coords[c + 2] - coords[a + 2];
            n0.m_x = d1.m_y * d2.m_z - d1.m_z * d2.m_y;
            n0.m_y = d1.m_z * d2.m_x - d1.m_x * d2.m_z;
            n0.m_z = d1.m_x * d2.m_y - d1.m_y * d2.m_x;
            normals[a] += n0.m_x;
            normals[a + 1] += n0.m_y;
            normals[a + 2] += n0.m_z;
            normals[b] += n0.m_x;
            normals[b + 1] += n0.m_y;
            normals[b + 2] += n0.m_z;
            normals[c] += n0.m_x;
            normals[c + 1] += n0.m_y;
            normals[c + 2] += n0.m_z;
        }
    }
    module.SC3DMCDecoder.prototype.ProcessNormals = function (ifs) {
        var v3, v2, nvert, normalSize, normals, quantFloatArray, orientation, triangles, n0, n1, v, rna0, rnb0, ni1, norm0;
        nvert = ifs.GetNNormal();

        normalSize = ifs.GetNNormal() * 3;
        if (this.m_normalsSize < normalSize) {
            this.m_normalsSize = normalSize;
            this.m_normals = new Float32Array(this.m_normalsSize);
        }
        normals = this.m_normals;
        quantFloatArray = this.m_quantFloatArray;
        orientation = this.m_orientation;
        triangles = ifs.GetCoordIndex();
        ComputeNormals(triangles, ifs.GetNCoordIndex(), quantFloatArray, nvert, normals);
        n0 = new module.Vec3();
        n1 = new module.Vec3();
        for (v = 0; v < nvert; ++v) {
            v3 = 3 * v;
            n0.m_x = normals[v3];
            n0.m_y = normals[v3 + 1];
            n0.m_z = normals[v3 + 2];
            norm0 = Math.sqrt(n0.m_x * n0.m_x + n0.m_y * n0.m_y + n0.m_z * n0.m_z);
            if (norm0 === 0.0) {
                norm0 = 1.0;
            }
            SphereToCube(n0, n1);
            rna0 = n1.m_x / norm0;
            rnb0 = n1.m_y / norm0;
            ni1 = n1.m_z + orientation[v];
            orientation[v] = ni1;
            if ((ni1 >>> 1) !== (n1.m_z >>> 1)) {
                rna0 = 0.0;
                rnb0 = 0.0;
            }
            v2 = v * 2;
            normals[v2] = rna0;
            normals[v2 + 1] = rnb0;
        }
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.IQuantize = function (floatArray,
                                                         numFloatArray,
                                                         dimFloatArray,
                                                         stride,
                                                         minFloatArray,
                                                         maxFloatArray,
                                                         nQBits,
                                                         predMode) {
        var v, nin, nout, orientation, normals, CubeToSphere;
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            CubeToSphere = local.CubeToSphere;
            orientation = this.m_orientation;
            normals = this.m_normals;
            nin = new module.Vec3(0, 0, 0);
            nout = new module.Vec3(0, 0, 0);
            this.IQuantizeFloatArray(floatArray, numFloatArray, dimFloatArray, stride, this.m_minNormal, this.m_maxNormal, nQBits + 1);
            for (v = 0; v < numFloatArray; ++v) {
                nin.m_x = floatArray[stride * v] + normals[2 * v];
                nin.m_y = floatArray[stride * v + 1] + normals[2 * v + 1];
                nin.m_z = orientation[v];
                CubeToSphere[nin.m_z](nin, nout);
                floatArray[stride * v] = nout.m_x;
                floatArray[stride * v + 1] = nout.m_y;
                floatArray[stride * v + 2] = nout.m_z;
            }
        } else {
            this.IQuantizeFloatArray(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits);
        }
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArrayBinary = function (floatArray,
                                                                      numFloatArray,
                                                                      dimFloatArray,
                                                                      stride,
                                                                      minFloatArray,
                                                                      maxFloatArray,
                                                                      nQBits,
                                                                      ifs,
                                                                      predMode,
                                                                      bstream) {
        var maxNPred, testPredEnabled, testParaPredEnabled, bestPred, dModel, buffer, quantFloatArray, neighbors, normals, nPred, ta, i, v, u, u_begin, u_end, iterator, orientation, streamType, predResidual, acd, bModel0, bModel1, mModelPreds, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, exp_k, M, mModelValues;
        iterator = this.m_iterator;
        orientation = this.m_orientation;
        streamType = this.m_streamType;
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        mModelPreds = new module.AdaptiveDataModel();
        maxNPred = local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS;
        mModelPreds.SetAlphabet(maxNPred + 1);
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numFloatArray * dimFloatArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        exp_k = 0;
        M = 0;
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_AC_EGC) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        buffer = bstream.GetBuffer(iterator, streamSize);
        iterator.m_count += streamSize;
        acd.SetBuffer(streamSize, buffer);
        acd.StartDecoder();
        exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
        M = acd.ExpGolombDecode(0, bModel0, bModel1);
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            if (this.m_orientationSize < size) {
                this.m_orientationSize = size;
                this.m_orientation = new Int8Array(this.m_orientationSize);
                orientation = this.m_orientation;
            }
            dModel = new module.AdaptiveDataModel();
            dModel.SetAlphabet(12);
            for (i = 0; i < numFloatArray; ++i) {
                orientation[i] = UIntToInt(acd.DecodeAdaptiveDataModel(dModel));
            }
            this.ProcessNormals(ifs);
            dimFloatArray = 2;
        }
        if (this.m_quantFloatArraySize < size) {
            this.m_quantFloatArraySize = size;
            this.m_quantFloatArray = new Int32Array(this.m_quantFloatArraySize);
        }
        quantFloatArray = this.m_quantFloatArray;
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        testParaPredEnabled = predMode.m_value === local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        for (v = 0; v < numFloatArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                if (testParaPredEnabled) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors);
                    }
                }
                if (nPred.m_value < maxNPred) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride);
                    }
                }
            }
            if (nPred.m_value > 1) {
                bestPred = acd.DecodeAdaptiveDataModel(mModelPreds);
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && testPredEnabled) {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual + quantFloatArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = acd.DecodeUIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                    quantFloatArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        this.IQuantize(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, predMode);
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArrayASCII = function (floatArray,
                                                                     numFloatArray,
                                                                     dimFloatArray,
                                                                     stride,
                                                                     minFloatArray,
                                                                     maxFloatArray,
                                                                     nQBits,
                                                                     ifs,
                                                                     predMode,
                                                                     bstream) {
        var maxNPred, testPredEnabled, testParaPredEnabled, iterator, orientation, streamType, predResidual, v2T, v2TNeighbors, triangles, size, start, streamSize, mask, binarization, iteratorPred, quantFloatArray, neighbors, normals, nPred, v, u, u_begin, u_end, ta, i, bestPred;
        maxNPred = local.O3DGC_SC3DMC_MAX_PREDICTION_NEIGHBORS;
        iterator = this.m_iterator;
        orientation = this.m_orientation;
        streamType = this.m_streamType;
        v2T = this.m_triangleListDecoder.GetVertexToTriangle();
        v2TNeighbors = v2T.m_neighbors;
        triangles = ifs.GetCoordIndex();
        size = numFloatArray * dimFloatArray;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        mask = bstream.ReadUChar(iterator, streamType);
        binarization = (mask >>> 4) & 7;
        predMode.m_value = mask & 7;
        streamSize -= (iterator.m_count - start);
        iteratorPred = new module.Iterator();
        iteratorPred.m_count = iterator.m_count + streamSize;
        if (binarization !== local.O3DGC_SC3DMC_BINARIZATION_ASCII) {
            return module.O3DGC_ERROR_CORRUPTED_STREAM;
        }
        bstream.ReadUInt32(iteratorPred, streamType);
        if (predMode.m_value === local.O3DGC_SC3DMC_SURF_NORMALS_PREDICTION) {
            if (this.m_orientationSize < numFloatArray) {
                this.m_orientationSize = numFloatArray;
                this.m_orientation = new Int8Array(this.m_orientationSize);
                orientation = this.m_orientation;
            }
            for (i = 0; i < numFloatArray; ++i) {
                orientation[i] = bstream.ReadIntASCII(iterator);
            }
            this.ProcessNormals(ifs);
            dimFloatArray = 2;
        }
        if (this.m_quantFloatArraySize < size) {
            this.m_quantFloatArraySize = size;
            this.m_quantFloatArray = new Int32Array(this.m_quantFloatArraySize);
        }
        quantFloatArray = this.m_quantFloatArray;
        neighbors = this.m_neighbors;
        normals = this.m_normals;
        nPred = new module.NumberRef();
        testPredEnabled = predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION;
        testParaPredEnabled = predMode.m_value === local.O3DGC_SC3DMC_PARALLELOGRAM_PREDICTION;
        for (v = 0; v < numFloatArray; ++v) {
            nPred.m_value = 0;
            if (v2T.GetNumNeighbors(v) > 0 && testPredEnabled) {
                u_begin = v2T.Begin(v);
                u_end = v2T.End(v);
                if (testParaPredEnabled) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        ParallelogramPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride, v2T, v2TNeighbors);
                    }
                }
                if (nPred.m_value < maxNPred) {
                    for (u = u_begin; u < u_end; ++u) {
                        ta = v2TNeighbors[u];
                        if (ta < 0) {
                            break;
                        }
                        DeltaPredictors(triangles, ta, v, nPred, neighbors, dimFloatArray, quantFloatArray, stride);
                    }
                }
            }
            if (nPred.m_value > 1) {
                bestPred = bstream.ReadUCharASCII(iteratorPred);
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual + neighbors[bestPred].m_pred[i];
                }
            } else if (v > 0 && predMode.m_value !== local.O3DGC_SC3DMC_NO_PREDICTION) {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual + quantFloatArray[(v - 1) * stride + i];
                }
            } else {
                for (i = 0; i < dimFloatArray; ++i) {
                    predResidual = bstream.ReadUIntASCII(iterator);
                    quantFloatArray[v * stride + i] = predResidual;
                }
            }
        }
        iterator.m_count = iteratorPred.m_count;
        this.IQuantize(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, predMode);
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodeFloatArray = function (floatArray,
                                                                numFloatArray,
                                                                dimFloatArray,
                                                                stride,
                                                                minFloatArray,
                                                                maxFloatArray,
                                                                nQBits,
                                                                ifs,
                                                                predMode,
                                                                bstream) {
        if (this.m_streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            return this.DecodeFloatArrayASCII(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, ifs, predMode, bstream);
        }
        return this.DecodeFloatArrayBinary(floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits, ifs, predMode, bstream);
    };
    module.SC3DMCDecoder.prototype.IQuantizeFloatArray = function (floatArray, numFloatArray, dimFloatArray, stride, minFloatArray, maxFloatArray, nQBits) {
        var idelta, quantFloatArray, d, r, v;
        idelta = this.m_idelta;
        quantFloatArray = this.m_quantFloatArray;
        for (d = 0; d < dimFloatArray; ++d) {
            r = maxFloatArray[d] - minFloatArray[d];
            if (r > 0.0) {
                idelta[d] = r / (((1 << nQBits) >>> 0) - 1);
            } else {
                idelta[d] = 1.0;
            }
        }
        for (v = 0; v < numFloatArray; ++v) {
            for (d = 0; d < dimFloatArray; ++d) {
                floatArray[v * stride + d] = quantFloatArray[v * stride + d] * idelta[d] + minFloatArray[d];
            }
        }
        return module.O3DGC_OK;
    };
    module.SC3DMCDecoder.prototype.DecodePlayload = function (ifs, bstream) {
        var params, iterator, stats, predMode, timer, ret, a;
        params = this.m_params;
        iterator = this.m_iterator;
        stats = this.m_stats;
        predMode = new module.NumberRef();
        timer = new module.Timer();
        ret = module.O3DGC_OK;
        this.m_triangleListDecoder.SetStreamType(this.m_streamType);
        stats.m_streamSizeCoordIndex = iterator.m_count;
        timer.Tic();
        this.m_triangleListDecoder.Decode(ifs.GetCoordIndex(), ifs.GetNCoordIndex(), ifs.GetNCoord(), bstream, iterator);
        timer.Toc();
        stats.m_timeCoordIndex = timer.GetElapsedTime();
        stats.m_streamSizeCoordIndex = iterator.m_count - stats.m_streamSizeCoordIndex;
        // decode coord
        stats.m_streamSizeCoord = iterator.m_count;
        timer.Tic();
        if (ifs.GetNCoord() > 0) {
            ret = this.DecodeFloatArray(ifs.GetCoord(), ifs.GetNCoord(), 3, 3, ifs.GetCoordMinArray(), ifs.GetCoordMaxArray(), params.GetCoordQuantBits(), ifs, predMode, bstream);
            params.SetCoordPredMode(predMode.m_value);
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Toc();
        stats.m_timeCoord = timer.GetElapsedTime();
        stats.m_streamSizeCoord = iterator.m_count - stats.m_streamSizeCoord;

        // decode Normal
        stats.m_streamSizeNormal = iterator.m_count;
        timer.Tic();
        if (ifs.GetNNormal() > 0) {
            ret = this.DecodeFloatArray(ifs.GetNormal(), ifs.GetNNormal(), 3, 3, ifs.GetNormalMinArray(), ifs.GetNormalMaxArray(), params.GetNormalQuantBits(), ifs, predMode, bstream);
            params.SetNormalPredMode(predMode.m_value);
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Toc();
        stats.m_timeNormal = timer.GetElapsedTime();
        stats.m_streamSizeNormal = iterator.m_count - stats.m_streamSizeNormal;

        // decode FloatAttributes
        for (a = 0; a < ifs.GetNumFloatAttributes(); ++a) {
            stats.m_streamSizeFloatAttribute[a] = iterator.m_count;
            timer.Tic();
            ret = this.DecodeFloatArray(ifs.GetFloatAttribute(a), ifs.GetNFloatAttribute(a), ifs.GetFloatAttributeDim(a), ifs.GetFloatAttributeDim(a), ifs.GetFloatAttributeMinArray(a), ifs.GetFloatAttributeMaxArray(a), params.GetFloatAttributeQuantBits(a), ifs, predMode, bstream);
            params.SetFloatAttributePredMode(a, predMode.m_value);
            timer.Toc();
            stats.m_timeFloatAttribute[a] = timer.GetElapsedTime();
            stats.m_streamSizeFloatAttribute[a] = iterator.m_count - stats.m_streamSizeFloatAttribute[a];
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        // decode IntAttributes
        for (a = 0; a < ifs.GetNumIntAttributes(); ++a) {
            stats.m_streamSizeIntAttribute[a] = iterator.m_count;
            timer.Tic();
            ret = this.DecodeIntArray(ifs.GetIntAttribute(a), ifs.GetNIntAttribute(a), ifs.GetIntAttributeDim(a), ifs.GetIntAttributeDim(a), ifs, predMode, bstream);
            params.SetIntAttributePredMode(a, predMode.m_value);
            timer.Toc();
            stats.m_timeIntAttribute[a] = timer.GetElapsedTime();
            stats.m_streamSizeIntAttribute[a] = iterator.m_count - stats.m_streamSizeIntAttribute[a];
        }
        if (ret !== module.O3DGC_OK) {
            return ret;
        }
        timer.Tic();
        this.m_triangleListDecoder.Reorder();
        timer.Toc();
        stats.m_timeReorder = timer.GetElapsedTime();
        return ret;
    };
    // DVEncodeParams class
    module.DVEncodeParams = function () {
        this.m_encodeMode = local.O3DGC_DYNAMIC_VECTOR_ENCODE_MODE_LIFT;
        this.m_streamTypeMode = local.O3DGC_STREAM_TYPE_ASCII;
        this.m_quantBits = 10;
    };
    module.DVEncodeParams.prototype.GetStreamType = function () {
        return this.m_streamTypeMode;
    };
    module.DVEncodeParams.prototype.GetEncodeMode = function () {
        return this.m_encodeMode;
    };
    module.DVEncodeParams.prototype.GetQuantBits = function () {
        return this.m_quantBits;
    };
    module.DVEncodeParams.prototype.SetStreamType = function (streamTypeMode) {
        this.m_streamTypeMode = streamTypeMode;
    };
    module.DVEncodeParams.prototype.SetEncodeMode = function (encodeMode) {
        this.m_encodeMode = encodeMode;
    };
    module.DVEncodeParams.prototype.SetQuantBits = function (quantBits) {
        this.m_quantBits = quantBits;
    };
    // DynamicVector class
    module.DynamicVector = function () {
        this.m_num = 0;
        this.m_dim = 0;
        this.m_stride = 0;
        this.m_max = {};
        this.m_min = {};
        this.m_vectors = {};
    };
    module.DynamicVector.prototype.GetNVector = function () {
        return this.m_num;
    };
    module.DynamicVector.prototype.GetDimVector = function () {
        return this.m_dim;
    };
    module.DynamicVector.prototype.GetStride = function () {
        return this.m_stride;
    };
    module.DynamicVector.prototype.GetMinArray = function () {
        return this.m_min;
    };
    module.DynamicVector.prototype.GetMaxArray = function () {
        return this.m_max;
    };
    module.DynamicVector.prototype.GetVectors = function () {
        return this.m_vectors;
    };
    module.DynamicVector.prototype.GetMin = function (j) {
        return this.m_min[j];
    };
    module.DynamicVector.prototype.GetMax = function (j) {
        return this.m_max[j];
    };
    module.DynamicVector.prototype.SetNVector = function (num) {
        this.m_num = num;
    };
    module.DynamicVector.prototype.SetDimVector = function (dim) {
        this.m_dim = dim;
    };
    module.DynamicVector.prototype.SetStride = function (stride) {
        this.m_stride = stride;
    };
    module.DynamicVector.prototype.SetMinArray = function (min) {
        this.m_min = min;
    };
    module.DynamicVector.prototype.SetMaxArray = function (max) {
        this.m_max = max;
    };
    module.DynamicVector.prototype.SetMin = function (j, min) {
        this.m_min[j] = min;
    };
    module.DynamicVector.prototype.SetMax = function (j, max) {
        this.m_max[j] = max;
    };
    module.DynamicVector.prototype.SetVectors = function (vectors) {
        this.m_vectors = vectors;
    };
    // DynamicVectorDecoder class
    module.DynamicVectorDecoder = function () {
        this.m_streamSize = 0;
        this.m_maxNumVectors = 0;
        this.m_numVectors = 0;
        this.m_dimVectors = 0;
        this.m_quantVectors = {};
        this.m_iterator = new module.Iterator();
        this.m_streamType = local.O3DGC_STREAM_TYPE_UNKOWN;
        this.m_params = new module.DVEncodeParams();
    };
    module.DynamicVectorDecoder.prototype.GetStreamType = function () {
        return this.m_streamType;
    };
    module.DynamicVectorDecoder.prototype.GetIterator = function () {
        return this.m_iterator;
    };
    module.DynamicVectorDecoder.prototype.SetStreamType = function (streamType) {
        this.m_streamType = streamType;
    };
    module.DynamicVectorDecoder.prototype.SetIterator = function (iterator) {
        this.m_iterator = iterator;
    };
    module.DynamicVectorDecoder.prototype.IUpdate = function (data, shift, size) {
        var p, size1;
        size1 = size - 1;
        p = 2;
        data[shift] -= data[shift + 1] >> 1;
        while (p < size1) {
            data[shift + p] -= (data[shift + p - 1] + data[shift + p + 1] + 2) >> 2;
            p += 2;
        }
        if (p === size1) {
            data[shift + p] -= data[shift + p - 1] >> 1;
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.IPredict = function (data, shift, size) {
        var p, size1;
        size1 = size - 1;
        p = 1;
        while (p < size1) {
            data[shift + p] += (data[shift + p - 1] + data[shift + p + 1] + 1) >> 1;
            p += 2;
        }
        if (p === size1) {
            data[shift + p] += data[shift + p - 1];
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.Merge = function (data, shift, size) {
        var i, h, a, b, tmp;
        h = (size >> 1) + (size & 1);
        a = h - 1;
        b = h;
        while (a > 0) {
            for (i = a; i < b; i += 2) {
                tmp = data[shift + i];
                data[shift + i] = data[shift + i + 1];
                data[shift + i + 1] = tmp;
            }
            --a;
            ++b;
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.ITransform = function (data, shift, size) {
        var n, even, k, i;
        n = size;
        even = 0;
        k = 0;
        even += ((n & 1) << k++) >>> 0;
        while (n > 1) {
            n = (n >> 1) + ((n & 1) >>> 0);
            even += ((n & 1) << k++) >>> 0;
        }
        for (i = k - 2; i >= 0; --i) {
            n = ((n << 1) >>> 0) - (((even >>> i) & 1)) >>> 0;
            this.Merge(data, shift, n);
            this.IUpdate(data, shift, n);
            this.IPredict(data, shift, n);
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.IQuantize = function (floatArray,
                                                       numFloatArray,
                                                       dimFloatArray,
                                                       stride,
                                                       minFloatArray,
                                                       maxFloatArray,
                                                       nQBits) {
        var quantVectors, r, idelta, size, d, v;
        quantVectors = this.m_quantVectors;
        size = numFloatArray * dimFloatArray;
        for (d = 0; d < dimFloatArray; ++d) {
            r = maxFloatArray[d] - minFloatArray[d];
            if (r > 0.0) {
                idelta = r / (((1 << nQBits) >>> 0) - 1);
            } else {
                idelta = 1.0;
            }
            for (v = 0; v < numFloatArray; ++v) {
                floatArray[v * stride + d] = quantVectors[v + d * numFloatArray] * idelta + minFloatArray[d];
            }
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.DecodeHeader = function (dynamicVector, bstream) {
        var iterator, c0, start_code, streamType;
        iterator = this.m_iterator;
        c0 = iterator.m_count;
        start_code = bstream.ReadUInt32(iterator, local.O3DGC_STREAM_TYPE_BINARY);
        if (start_code !== local.O3DGC_DV_START_CODE) {
            iterator.m_count = c0;
            start_code = bstream.ReadUInt32(iterator, local.O3DGC_STREAM_TYPE_ASCII);
            if (start_code !== local.O3DGC_DV_START_CODE) {
                return module.O3DGC_ERROR_CORRUPTED_STREAM;
            }
            this.m_streamType = local.O3DGC_STREAM_TYPE_ASCII;
        } else {
            this.m_streamType = local.O3DGC_STREAM_TYPE_BINARY;
        }
        streamType = this.m_streamType;
        this.m_streamSize = bstream.ReadUInt32(iterator, streamType);
        this.m_params.SetEncodeMode(bstream.ReadUChar(iterator, streamType));
        dynamicVector.SetNVector(bstream.ReadUInt32(iterator, streamType));
        if (dynamicVector.GetNVector() > 0) {
            dynamicVector.SetDimVector(bstream.ReadUInt32(iterator, streamType));
            this.m_params.SetQuantBits(bstream.ReadUChar(iterator, streamType));
        }
        return module.O3DGC_OK;
    };
    module.DynamicVectorDecoder.prototype.DecodePlayload = function (dynamicVector, bstream) {
        var size, iterator, streamType, ret, start, streamSize, dim, num, j, acd, bModel0, bModel1, exp_k, M, buffer, mModelValues, quantVectors, v, d;
        iterator = this.m_iterator;
        streamType = this.m_streamType;
        ret = module.O3DGC_OK;
        start = iterator.m_count;
        streamSize = bstream.ReadUInt32(iterator, streamType);
        dim = dynamicVector.GetDimVector();
        num = dynamicVector.GetNVector();
        size = dim * num;
        for (j = 0; j < dynamicVector.GetDimVector(); ++j) {
            dynamicVector.SetMin(j, bstream.ReadFloat32(iterator, streamType));
            dynamicVector.SetMax(j, bstream.ReadFloat32(iterator, streamType));
        }
        acd = new module.ArithmeticDecoder();
        bModel0 = new module.StaticBitModel();
        bModel1 = new module.AdaptiveBitModel();
        streamSize -= (iterator.m_count - start);
        exp_k = 0;
        M = 0;
        if (streamType === local.O3DGC_STREAM_TYPE_BINARY) {
            buffer = bstream.GetBuffer(iterator, streamSize);
            iterator.m_count += streamSize;
            acd.SetBuffer(streamSize, buffer);
            acd.StartDecoder();
            exp_k = acd.ExpGolombDecode(0, bModel0, bModel1);
            M = acd.ExpGolombDecode(0, bModel0, bModel1);
        }
        mModelValues = new module.AdaptiveDataModel();
        mModelValues.SetAlphabet(M + 2);
        if (this.m_maxNumVectors < size) {
            this.m_maxNumVectors = size;
            this.m_quantVectors = new Int32Array(this.m_maxNumVectors);
        }
        quantVectors = this.m_quantVectors;
        if (streamType === local.O3DGC_STREAM_TYPE_ASCII) {
            for (v = 0; v < num; ++v) {
                for (d = 0; d < dim; ++d) {
                    quantVectors[d * num + v] = bstream.ReadIntASCII(iterator);
                }
            }
        } else {
            for (v = 0; v < num; ++v) {
                for (d = 0; d < dim; ++d) {
                    quantVectors[d * num + v] = acd.DecodeIntACEGC(mModelValues, bModel0, bModel1, exp_k, M);
                }
            }
        }
        for (d = 0; d < dim; ++d) {
            this.ITransform(quantVectors, d * num, num);
        }
        this.IQuantize(dynamicVector.GetVectors(), num, dim,
                       dynamicVector.GetStride(), dynamicVector.GetMinArray(),
                       dynamicVector.GetMaxArray(), this.m_params.GetQuantBits());
        return ret;
    };

    return module;
})();


/**
* @author Liwei.Ma
*/
var S3D = S3D || {};

S3D.S3DLoader = function () {

    this.ifs = new o3dgc.IndexedFaceSet();
};

S3D.S3DLoader.prototype = {

    constructor: S3D.S3DLoader,

    position : function () {
        return this.ifs.GetCoord();
    },

    index : function () {
        return this.ifs.GetCoordIndex();
    },

    vertexCount : function () {
        return this.ifs.GetNCoord();
    },

   faceCount : function () {
        return this.ifs.GetNCoordIndex();
   },


   parse: function (arrayBuffer) {

        var ifs = this.ifs;

        var bstream = new o3dgc.BinaryStream(arrayBuffer);
        var size = arrayBuffer.byteLength;

        var decoder = new o3dgc.SC3DMCDecoder();
        decoder.DecodeHeader(ifs, bstream);

        var headerSize = decoder.m_iterator.m_count;

        // allocate memory
        if (ifs.GetNCoordIndex() > 0) {
            ifs.SetCoordIndex(new Uint32Array(3 * ifs.GetNCoordIndex()));
        }
        if (ifs.GetNCoord() > 0) {
            ifs.SetCoord(new Float32Array(3 * ifs.GetNCoord()));
        }
        if (ifs.GetNNormal() > 0) {
            ifs.SetNormal(new Float32Array(3 * ifs.GetNNormal()));
        }
        var numNumFloatAttributes = ifs.GetNumFloatAttributes();
        for (var a = 0; a < numNumFloatAttributes; ++a) {
            if (ifs.GetNFloatAttribute(a) > 0) {
                ifs.SetFloatAttribute(a, new Float32Array(ifs.GetFloatAttributeDim(a) * ifs.GetNFloatAttribute(a)));
            }
        }
        var numNumIntAttributes = ifs.GetNumIntAttributes();
        for (var a = 0; a < numNumIntAttributes; ++a) {
            if (ifs.GetNIntAttribute(a) > 0) {
                ifs.SetIntAttribute(a, new Int32Array(ifs.GetIntAttributeDim(a) * ifs.GetNIntAttribute(a)));
            }
        }

        // decode mesh
        decoder.DecodePlayload(ifs, bstream);
   },

   load: function (url, callback) {

       var scope = this;

       var xhr = new XMLHttpRequest();
       xhr.open("GET", url, true);
       xhr.responseType = "arraybuffer";

       xhr.onload = function (evt) {

           scope.parse(xhr.response);
           callback();
       };

       xhr.send(null);
   }
};



var LZMA = LZMA || {};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = LZMA;

}

LZMA.OutWindow = function(){
  this._windowSize = 0;
};

LZMA.OutWindow.prototype.create = function(windowSize){
  if ( (!this._buffer) || (this._windowSize !== windowSize) ){
    this._buffer = [];
  }
  this._windowSize = windowSize;
  this._pos = 0;
  this._streamPos = 0;
};

LZMA.OutWindow.prototype.flush = function(){
  var size = this._pos - this._streamPos;
  if (size !== 0){
    while(size --){
      this._stream.writeByte(this._buffer[this._streamPos ++]);
    }
    if (this._pos >= this._windowSize){
      this._pos = 0;
    }
    this._streamPos = this._pos;
  }
};

LZMA.OutWindow.prototype.releaseStream = function(){
  this.flush();
  this._stream = null;
};

LZMA.OutWindow.prototype.setStream = function(stream){
  this.releaseStream();
  this._stream = stream;
};

LZMA.OutWindow.prototype.init = function(solid){
  if (!solid){
    this._streamPos = 0;
    this._pos = 0;
  }
};

LZMA.OutWindow.prototype.copyBlock = function(distance, len){
  var pos = this._pos - distance - 1;
  if (pos < 0){
    pos += this._windowSize;
  }
  while(len --){
    if (pos >= this._windowSize){
      pos = 0;
    }
    this._buffer[this._pos ++] = this._buffer[pos ++];
    if (this._pos >= this._windowSize){
      this.flush();
    }
  }
};

LZMA.OutWindow.prototype.putByte = function(b){
  this._buffer[this._pos ++] = b;
  if (this._pos >= this._windowSize){
    this.flush();
  }
};

LZMA.OutWindow.prototype.getByte = function(distance){
  var pos = this._pos - distance - 1;
  if (pos < 0){
    pos += this._windowSize;
  }
  return this._buffer[pos];
};

LZMA.RangeDecoder = function(){
};

LZMA.RangeDecoder.prototype.setStream = function(stream){
  this._stream = stream;
};

LZMA.RangeDecoder.prototype.releaseStream = function(){
  this._stream = null;
};

LZMA.RangeDecoder.prototype.init = function(){
  var i = 5;

  this._code = 0;
  this._range = -1;

  while(i --){
    this._code = (this._code << 8) | this._stream.readByte();
  }
};

LZMA.RangeDecoder.prototype.decodeDirectBits = function(numTotalBits){
  var result = 0, i = numTotalBits, t;

  while(i --){
    this._range >>>= 1;
    t = (this._code - this._range) >>> 31;
    this._code -= this._range & (t - 1);
    result = (result << 1) | (1 - t);

    if ( (this._range & 0xff000000) === 0){
      this._code = (this._code << 8) | this._stream.readByte();
      this._range <<= 8;
    }
  }

  return result;
};

LZMA.RangeDecoder.prototype.decodeBit = function(probs, index){
  var prob = probs[index],
      newBound = (this._range >>> 11) * prob;

  if ( (this._code ^ 0x80000000) < (newBound ^ 0x80000000) ){
    this._range = newBound;
    probs[index] += (2048 - prob) >>> 5;
    if ( (this._range & 0xff000000) === 0){
      this._code = (this._code << 8) | this._stream.readByte();
      this._range <<= 8;
    }
    return 0;
  }

  this._range -= newBound;
  this._code -= newBound;
  probs[index] -= prob >>> 5;
  if ( (this._range & 0xff000000) === 0){
    this._code = (this._code << 8) | this._stream.readByte();
    this._range <<= 8;
  }
  return 1;
};

LZMA.initBitModels = function(probs, len){
  while(len --){
    probs[len] = 1024;
  }
};

LZMA.BitTreeDecoder = function(numBitLevels){
  this._models = [];
  this._numBitLevels = numBitLevels;
};

LZMA.BitTreeDecoder.prototype.init = function(){
  LZMA.initBitModels(this._models, 1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.decode = function(rangeDecoder){
  var m = 1, i = this._numBitLevels;

  while(i --){
    m = (m << 1) | rangeDecoder.decodeBit(this._models, m);
  }
  return m - (1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.reverseDecode = function(rangeDecoder){
  var m = 1, symbol = 0, i = 0, bit;

  for (; i < this._numBitLevels; ++ i){
    bit = rangeDecoder.decodeBit(this._models, m);
    m = (m << 1) | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.reverseDecode2 = function(models, startIndex, rangeDecoder, numBitLevels){
  var m = 1, symbol = 0, i = 0, bit;

  for (; i < numBitLevels; ++ i){
    bit = rangeDecoder.decodeBit(models, startIndex + m);
    m = (m << 1) | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.LenDecoder = function(){
  this._choice = [];
  this._lowCoder = [];
  this._midCoder = [];
  this._highCoder = new LZMA.BitTreeDecoder(8);
  this._numPosStates = 0;
};

LZMA.LenDecoder.prototype.create = function(numPosStates){
  for (; this._numPosStates < numPosStates; ++ this._numPosStates){
    this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
    this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
  }
};

LZMA.LenDecoder.prototype.init = function(){
  var i = this._numPosStates;
  LZMA.initBitModels(this._choice, 2);
  while(i --){
    this._lowCoder[i].init();
    this._midCoder[i].init();
  }
  this._highCoder.init();
};

LZMA.LenDecoder.prototype.decode = function(rangeDecoder, posState){
  if (rangeDecoder.decodeBit(this._choice, 0) === 0){
    return this._lowCoder[posState].decode(rangeDecoder);
  }
  if (rangeDecoder.decodeBit(this._choice, 1) === 0){
    return 8 + this._midCoder[posState].decode(rangeDecoder);
  }
  return 16 + this._highCoder.decode(rangeDecoder);
};

LZMA.Decoder2 = function(){
  this._decoders = [];
};

LZMA.Decoder2.prototype.init = function(){
  LZMA.initBitModels(this._decoders, 0x300);
};

LZMA.Decoder2.prototype.decodeNormal = function(rangeDecoder){
  var symbol = 1;

  do{
    symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
  }while(symbol < 0x100);

  return symbol & 0xff;
};

LZMA.Decoder2.prototype.decodeWithMatchByte = function(rangeDecoder, matchByte){
  var symbol = 1, matchBit, bit;

  do{
    matchBit = (matchByte >> 7) & 1;
    matchByte <<= 1;
    bit = rangeDecoder.decodeBit(this._decoders, ( (1 + matchBit) << 8) + symbol);
    symbol = (symbol << 1) | bit;
    if (matchBit !== bit){
      while(symbol < 0x100){
        symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
      }
      break;
    }
  }while(symbol < 0x100);

  return symbol & 0xff;
};

LZMA.LiteralDecoder = function(){
};

LZMA.LiteralDecoder.prototype.create = function(numPosBits, numPrevBits){
  var i;

  if (this._coders
    && (this._numPrevBits === numPrevBits)
    && (this._numPosBits === numPosBits) ){
    return;
  }
  this._numPosBits = numPosBits;
  this._posMask = (1 << numPosBits) - 1;
  this._numPrevBits = numPrevBits;

  this._coders = [];

  i = 1 << (this._numPrevBits + this._numPosBits);
  while(i --){
    this._coders[i] = new LZMA.Decoder2();
  }
};

LZMA.LiteralDecoder.prototype.init = function(){
  var i = 1 << (this._numPrevBits + this._numPosBits);
  while(i --){
    this._coders[i].init();
  }
};

LZMA.LiteralDecoder.prototype.getDecoder = function(pos, prevByte){
  return this._coders[( (pos & this._posMask) << this._numPrevBits)
    + ( (prevByte & 0xff) >>> (8 - this._numPrevBits) )];
};

LZMA.Decoder = function(){
  this._outWindow = new LZMA.OutWindow();
  this._rangeDecoder = new LZMA.RangeDecoder();
  this._isMatchDecoders = [];
  this._isRepDecoders = [];
  this._isRepG0Decoders = [];
  this._isRepG1Decoders = [];
  this._isRepG2Decoders = [];
  this._isRep0LongDecoders = [];
  this._posSlotDecoder = [];
  this._posDecoders = [];
  this._posAlignDecoder = new LZMA.BitTreeDecoder(4);
  this._lenDecoder = new LZMA.LenDecoder();
  this._repLenDecoder = new LZMA.LenDecoder();
  this._literalDecoder = new LZMA.LiteralDecoder();
  this._dictionarySize = -1;
  this._dictionarySizeCheck = -1;

  this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);
};

LZMA.Decoder.prototype.setDictionarySize = function(dictionarySize){
  if (dictionarySize < 0){
    return false;
  }
  if (this._dictionarySize !== dictionarySize){
    this._dictionarySize = dictionarySize;
    this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);
    this._outWindow.create( Math.max(this._dictionarySizeCheck, 4096) );
  }
  return true;
};

LZMA.Decoder.prototype.setLcLpPb = function(lc, lp, pb){
  var numPosStates = 1 << pb;

  if (lc > 8 || lp > 4 || pb > 4){
    return false;
  }

  this._literalDecoder.create(lp, lc);

  this._lenDecoder.create(numPosStates);
  this._repLenDecoder.create(numPosStates);
  this._posStateMask = numPosStates - 1;

  return true;
};

LZMA.Decoder.prototype.init = function(){
  var i = 4;

  this._outWindow.init(false);

  LZMA.initBitModels(this._isMatchDecoders, 192);
  LZMA.initBitModels(this._isRep0LongDecoders, 192);
  LZMA.initBitModels(this._isRepDecoders, 12);
  LZMA.initBitModels(this._isRepG0Decoders, 12);
  LZMA.initBitModels(this._isRepG1Decoders, 12);
  LZMA.initBitModels(this._isRepG2Decoders, 12);
  LZMA.initBitModels(this._posDecoders, 114);

  this._literalDecoder.init();

  while(i --){
    this._posSlotDecoder[i].init();
  }

  this._lenDecoder.init();
  this._repLenDecoder.init();
  this._posAlignDecoder.init();
  this._rangeDecoder.init();
};

LZMA.Decoder.prototype.decode = function(inStream, outStream, outSize){
  var state = 0, rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0, nowPos64 = 0, prevByte = 0,
      posState, decoder2, len, distance, posSlot, numDirectBits;

  this._rangeDecoder.setStream(inStream);
  this._outWindow.setStream(outStream);

  this.init();

  while(outSize < 0 || nowPos64 < outSize){
    posState = nowPos64 & this._posStateMask;

    if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0){
      decoder2 = this._literalDecoder.getDecoder(nowPos64 ++, prevByte);

      if (state >= 7){
        prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0) );
      }else{
        prevByte = decoder2.decodeNormal(this._rangeDecoder);
      }
      this._outWindow.putByte(prevByte);

      state = state < 4? 0: state - (state < 10? 3: 6);

    }else{

      if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1){
        len = 0;
        if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0){
          if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0){
            state = state < 7? 9: 11;
            len = 1;
          }
        }else{
          if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0){
            distance = rep1;
          }else{
            if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0){
              distance = rep2;
            }else{
              distance = rep3;
              rep3 = rep2;
            }
            rep2 = rep1;
          }
          rep1 = rep0;
          rep0 = distance;
        }
        if (len === 0){
          len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);
          state = state < 7? 8: 11;
        }
      }else{
        rep3 = rep2;
        rep2 = rep1;
        rep1 = rep0;

        len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);
        state = state < 7? 7: 10;

        posSlot = this._posSlotDecoder[len <= 5? len - 2: 3].decode(this._rangeDecoder);
        if (posSlot >= 4){

          numDirectBits = (posSlot >> 1) - 1;
          rep0 = (2 | (posSlot & 1) ) << numDirectBits;

          if (posSlot < 14){
            rep0 += LZMA.reverseDecode2(this._posDecoders,
                rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);
          }else{
            rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
            rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);
            if (rep0 < 0){
              if (rep0 === -1){
                break;
              }
              return false;
            }
          }
        }else{
          rep0 = posSlot;
        }
      }

      if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck){
        return false;
      }

      this._outWindow.copyBlock(rep0, len);
      nowPos64 += len;
      prevByte = this._outWindow.getByte(0);
    }
  }

  this._outWindow.flush();
  this._outWindow.releaseStream();
  this._rangeDecoder.releaseStream();

  return true;
};

LZMA.Decoder.prototype.setDecoderProperties = function(properties){
  var value, lc, lp, pb, dictionarySize;

  if (properties.size < 5){
    return false;
  }

  value = properties.readByte();
  lc = value % 9;
  value = ~~(value / 9);
  lp = value % 5;
  pb = ~~(value / 5);

  if ( !this.setLcLpPb(lc, lp, pb) ){
    return false;
  }

  dictionarySize = properties.readByte();
  dictionarySize |= properties.readByte() << 8;
  dictionarySize |= properties.readByte() << 16;
  dictionarySize += properties.readByte() * 16777216;

  return this.setDictionarySize(dictionarySize);
};

LZMA.decompress = function(properties, inStream, outStream, outSize){
  var decoder = new LZMA.Decoder();

  if ( !decoder.setDecoderProperties(properties) ){
    throw "Incorrect stream properties";
  }

  if ( !decoder.decode(inStream, outStream, outSize) ){
    throw "Error in data stream";
  }

  return true;
};

/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "OpenCTM: The Open Compressed Triangle Mesh file format" by Marcus Geelnard
  http://openctm.sourceforge.net/
*/

var CTM = CTM || {};

// browserify support
if ( typeof module === 'object' ) {

	module.exports = CTM;

}

CTM.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

CTM.Flags = {
  NORMALS: 0x00000001
};

CTM.File = function(stream){
  this.load(stream);
};

CTM.File.prototype.load = function(stream){
  this.header = new CTM.FileHeader(stream);

  this.body = new CTM.FileBody(this.header);

  this.getReader().read(stream, this.body);
};

CTM.File.prototype.getReader = function(){
  var reader;

  switch(this.header.compressionMethod){
    case CTM.CompressionMethod.RAW:
      reader = new CTM.ReaderRAW();
      break;
    case CTM.CompressionMethod.MG1:
      reader = new CTM.ReaderMG1();
      break;
    case CTM.CompressionMethod.MG2:
      reader = new CTM.ReaderMG2();
      break;
  }

  return reader;
};

CTM.FileHeader = function(stream){


  stream.readInt32(); //magic "OCTM"
  this.fileFormat = stream.readInt32();
  this.compressionMethod = stream.readInt32();
  this.vertexCount = stream.readInt32();

  this.triangleCount = stream.readInt32();
  this.uvMapCount = stream.readInt32();
  this.attrMapCount = stream.readInt32();
  this.flags = stream.readInt32();
  this.comment = stream.readString();
};

CTM.FileHeader.prototype.hasNormals = function(){
  return this.flags & CTM.Flags.NORMALS;
};

CTM.FileBody = function(header){
  var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals()? header.vertexCount * 3: 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

  var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

  this.indices = new Uint32Array(data, 0, i);

  this.vertices = new Float32Array(data, i * 4, v);

  if ( header.hasNormals() ){
    this.normals = new Float32Array(data, (i + v) * 4, n);
  }

  if (header.uvMapCount){
    this.uvMaps = [];
    for (j = 0; j < header.uvMapCount; ++ j){
      this.uvMaps[j] = {uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
    }
  }

  if (header.attrMapCount){
    this.attrMaps = [];
    for (j = 0; j < header.attrMapCount; ++ j){
      this.attrMaps[j] = {attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
    }
  }
};

CTM.FileMG2Header = function(stream){
  stream.readInt32(); //magic "MG2H"
  this.vertexPrecision = stream.readFloat32();
  this.normalPrecision = stream.readFloat32();
  this.lowerBoundx = stream.readFloat32();
  this.lowerBoundy = stream.readFloat32();
  this.lowerBoundz = stream.readFloat32();
  this.higherBoundx = stream.readFloat32();
  this.higherBoundy = stream.readFloat32();
  this.higherBoundz = stream.readFloat32();
  this.divx = stream.readInt32();
  this.divy = stream.readInt32();
  this.divz = stream.readInt32();

  this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
  this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
  this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

CTM.ReaderRAW = function(){
};

CTM.ReaderRAW.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);

  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderRAW.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readArrayInt32(indices);
};

CTM.ReaderRAW.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readArrayFloat32(vertices);
};

CTM.ReaderRAW.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readArrayFloat32(normals);
};

CTM.ReaderRAW.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    stream.readArrayFloat32(uvMaps[i].uv);
  }
};

CTM.ReaderRAW.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    stream.readArrayFloat32(attrMaps[i].attr);
  }
};

CTM.ReaderMG1 = function(){
};

CTM.ReaderMG1.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);

  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG1.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG1.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(vertices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();

    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();

    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG2 = function(){
};

CTM.ReaderMG2.prototype.read = function(stream, body){
  this.MG2Header = new CTM.FileMG2Header(stream);

  this.readVertices(stream, body.vertices);
  this.readIndices(stream, body.indices);

  if (body.normals){
    this.readNormals(stream, body);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG2.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(vertices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  var gridIndices = this.readGridIndices(stream, vertices);

  CTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

CTM.ReaderMG2.prototype.readGridIndices = function(stream, vertices){
  stream.readInt32(); //magic "GIDX"
  stream.readInt32(); //packed size

  var gridIndices = new Uint32Array(vertices.length / 3);

  var interleaved = new CTM.InterleavedStream(gridIndices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreGridIndices(gridIndices, gridIndices.length);

  return gridIndices;
};

CTM.ReaderMG2.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG2.prototype.readNormals = function(stream, body){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(body.normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  var smooth = CTM.calcSmoothNormals(body.indices, body.vertices);

  CTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

CTM.ReaderMG2.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();

    var precision = stream.readFloat32();

    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

    CTM.restoreMap(uvMaps[i].uv, 2, precision);
  }
};

CTM.ReaderMG2.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();

    var precision = stream.readFloat32();

    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

    CTM.restoreMap(attrMaps[i].attr, 4, precision);
  }
};

CTM.restoreIndices = function(indices, len){
  var i = 3;
  if (len > 0){
    indices[2] += indices[0];
    indices[1] += indices[0];
  }
  for (; i < len; i += 3){
    indices[i] += indices[i - 3];

    if (indices[i] === indices[i - 3]){
      indices[i + 1] += indices[i - 2];
    }else{
      indices[i + 1] += indices[i];
    }

    indices[i + 2] += indices[i];
  }
};

CTM.restoreGridIndices = function(gridIndices, len){
  var i = 1;
  for (; i < len; ++ i){
    gridIndices[i] += gridIndices[i - 1];
  }
};

CTM.restoreVertices = function(vertices, grid, gridIndices, precision){
  var gridIdx, delta, x, y, z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx, zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff, prevDelta = 0,
      i = 0, j = 0, len = gridIndices.length;

  for (; i < len; j += 3){
    x = gridIdx = gridIndices[i ++];

    z = ~~(x / zdiv);
    x -= ~~(z * zdiv);
    y = ~~(x / ydiv);
    x -= ~~(y * ydiv);

    delta = intVertices[j];
    if (gridIdx === prevGridIdx){
      delta += prevDelta;
    }

    vertices[j]     = grid.lowerBoundx +
      x * grid.sizex + precision * delta;
    vertices[j + 1] = grid.lowerBoundy +
      y * grid.sizey + precision * intVertices[j + 1];
    vertices[j + 2] = grid.lowerBoundz +
      z * grid.sizez + precision * intVertices[j + 2];

    prevGridIdx = gridIdx;
    prevDelta = delta;
  }
};

CTM.restoreNormals = function(normals, smooth, precision){
  var ro, phi, theta, sinPhi,
      nx, ny, nz, by, bz, len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0, k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

  for (; i < k; i += 3){
    ro = intNormals[i] * precision;
    phi = intNormals[i + 1];

    if (phi === 0){
      normals[i]     = smooth[i]     * ro;
      normals[i + 1] = smooth[i + 1] * ro;
      normals[i + 2] = smooth[i + 2] * ro;
    }else{

      if (phi <= 4){
        theta = (intNormals[i + 2] - 2) * PI_DIV_2;
      }else{
        theta = ( (intNormals[i + 2] * 4 / phi) - 2) * PI_DIV_2;
      }

      phi *= precision * PI_DIV_2;
      sinPhi = ro * Math.sin(phi);

      nx = sinPhi * Math.cos(theta);
      ny = sinPhi * Math.sin(theta);
      nz = ro * Math.cos(phi);

      bz = smooth[i + 1];
      by = smooth[i] - smooth[i + 2];

      len = Math.sqrt(2 * bz * bz + by * by);
      if (len > 1e-20){
        by /= len;
        bz /= len;
      }

      normals[i]     = smooth[i]     * nz +
        (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
      normals[i + 1] = smooth[i + 1] * nz -
        (smooth[i + 2]      + smooth[i]   ) * bz  * ny + by * nx;
      normals[i + 2] = smooth[i + 2] * nz +
        (smooth[i]     * by + smooth[i + 1] * bz) * ny + bz * nx;
    }
  }
};

CTM.restoreMap = function(map, count, precision){
  var delta, value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0, j, len = map.length;

  for (; i < count; ++ i){
    delta = 0;

    for (j = i; j < len; j += count){
      value = intMap[j];

      delta += value & 1? -( (value + 1) >> 1): value >> 1;

      map[j] = delta * precision;
    }
  }
};

CTM.calcSmoothNormals = function(indices, vertices){
  var smooth = new Float32Array(vertices.length),
      indx, indy, indz, nx, ny, nz,
      v1x, v1y, v1z, v2x, v2y, v2z, len,
      i, k;

  for (i = 0, k = indices.length; i < k;){
    indx = indices[i ++] * 3;
    indy = indices[i ++] * 3;
    indz = indices[i ++] * 3;

    v1x = vertices[indy]     - vertices[indx];
    v2x = vertices[indz]     - vertices[indx];
    v1y = vertices[indy + 1] - vertices[indx + 1];
    v2y = vertices[indz + 1] - vertices[indx + 1];
    v1z = vertices[indy + 2] - vertices[indx + 2];
    v2z = vertices[indz + 2] - vertices[indx + 2];

    nx = v1y * v2z - v1z * v2y;
    ny = v1z * v2x - v1x * v2z;
    nz = v1x * v2y - v1y * v2x;

    len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-10){
      nx /= len;
      ny /= len;
      nz /= len;
    }

    smooth[indx]     += nx;
    smooth[indx + 1] += ny;
    smooth[indx + 2] += nz;
    smooth[indy]     += nx;
    smooth[indy + 1] += ny;
    smooth[indy + 2] += nz;
    smooth[indz]     += nx;
    smooth[indz + 1] += ny;
    smooth[indz + 2] += nz;
  }

  for (i = 0, k = smooth.length; i < k; i += 3){
    len = Math.sqrt(smooth[i] * smooth[i] +
      smooth[i + 1] * smooth[i + 1] +
      smooth[i + 2] * smooth[i + 2]);

    if(len > 1e-10){
      smooth[i]     /= len;
      smooth[i + 1] /= len;
      smooth[i + 2] /= len;
    }
  }

  return smooth;
};

CTM.isLittleEndian = (function(){
  var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

  bytes[0] = 1;

  return ints[0] === 1;
}());

CTM.InterleavedStream = function(data, count){
  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  this.offset = CTM.isLittleEndian? 3: 0;
  this.count = count * 4;
  this.len = this.data.length;
};

CTM.InterleavedStream.prototype.writeByte = function(value){
  this.data[this.offset] = value;

  this.offset += this.count;
  if (this.offset >= this.len){

    this.offset -= this.len - 4;
    if (this.offset >= this.count){

      this.offset -= this.count + (CTM.isLittleEndian? 1: -1);
    }
  }
};

CTM.Stream = function(data){
  this.data = data;
  this.offset = 0;
};

CTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

CTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

CTM.Stream.prototype.readByte = function(){
  return this.data[this.offset ++] & 0xff;
};

CTM.Stream.prototype.readInt32 = function(){
  var i = this.readByte();
  i |= this.readByte() << 8;
  i |= this.readByte() << 16;
  return i | (this.readByte() << 24);
};

CTM.Stream.prototype.readFloat32 = function(){
  var m = this.readByte();
  m += this.readByte() << 8;

  var b1 = this.readByte();
  var b2 = this.readByte();

  m += (b1 & 0x7f) << 16;
  var e = ( (b2 & 0x7f) << 1) | ( (b1 & 0x80) >>> 7);
  var s = b2 & 0x80? -1: 1;

  if (e === 255){
    return m !== 0? NaN: s * Infinity;
  }
  if (e > 0){
    return s * (1 + (m * this.TWO_POW_MINUS23) ) * Math.pow(2, e - 127);
  }
  if (m !== 0){
    return s * m * this.TWO_POW_MINUS126;
  }
  return s * 0;
};

CTM.Stream.prototype.readString = function(){
  var len = this.readInt32();

  this.offset += len;

  return String.fromCharCode.apply(null,this.data.subarray(this.offset - len, this.offset));
};

CTM.Stream.prototype.readArrayInt32 = function(array){
  var i = 0, len = array.length;

  while(i < len){
    array[i ++] = this.readInt32();
  }

  return array;
};

CTM.Stream.prototype.readArrayFloat32 = function(array){
  var i = 0, len = array.length;

  while(i < len){
    array[i ++] = this.readFloat32();
  }

  return array;
};


CLOUD.MaterialLoader = function ( showStatus ) {
	THREE.Loader.call( this, showStatus );
};

CLOUD.MaterialLoader.prototype = Object.create(THREE.Loader.prototype);
CLOUD.MaterialLoader.prototype.constructor = CLOUD.MaterialLoader;

CLOUD.MaterialLoader.prototype.setBaseUrl = function( value ) {
    this.baseUrl = value;
};

CLOUD.MaterialLoader.prototype.setCrossOrigin = function( value ) {
    this.crossOrigin = value;
};

CLOUD.MaterialLoader.prototype.load = function (materialUrl, callback, result) {

    var scope = this;
    var texturePath = this.baseUrl;

    function hack_material(json) {
        var material = new THREE[json.type](json.parameters);

        if (CloudShaderLib === undefined) {
            return material;
        }

        if (json.type === 'MeshPhongMaterial') {
            material.type = 'phong_cust_clip';
            material.uniforms = CloudShaderLib.phong_cust_clip.uniforms;
            material.vertexShader = CloudShaderLib.phong_cust_clip.vertexShader;
            material.fragmentShader = CloudShaderLib.phong_cust_clip.fragmentShader;
        }

        if ( json.parameters.mapDiffuse !== undefined ) {
            //material.map = THREE.ImageUtils.loadTexture( texturePath + "/" + json.parameters.mapDiffuse );
            material.map = scope.loadTexture( texturePath + "/" + json.parameters.mapDiffuse );
        }

        if ( json.parameters.mapSpecular !== undefined ) {
            //material.specularMap = THREE.ImageUtils.loadTexture( texturePath + "/" + json.parameters.mapSpecular );
            material.specularMap = scope.loadTexture( texturePath + "/" + json.parameters.mapSpecular );
        }

        return material;
    }

    var loader = new THREE.XHRLoader();

    loader.load(materialUrl, function (text) {
        var matData = JSON.parse(text);

        for (var matID in matData.materials) {
            var matJSON = matData.materials[matID];

            if (matJSON.parameters.opacity !== undefined && matJSON.parameters.opacity < 1.0) {
                matJSON.parameters.transparent = true;
            }
            if (matJSON.parameters.side != undefined && matJSON.parameters.side === "double") {
                matJSON.parameters.side = THREE.DoubleSide;
            }

            if (matJSON.parameters.ambient !== undefined)
                delete matJSON.parameters.ambient; // ambient is removed for PhongMaterial


            //material = new THREE[ matJSON.type ]( matJSON.parameters );
            material = hack_material(matJSON);
            material.name = matID;

            result.materials[matID] = material;
        }

        callback();
    });
};

CLOUD.MaterialLoader.prototype.loadTexture = function( url, mapping, onLoad, onProgress, onError ) {

    var texture;
    var loader = THREE.Loader.Handlers.get( url );
    var manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;

    if ( loader !== null ) {

        texture = loader.load( url, onLoad );

    } else {

        texture = new THREE.Texture();

        loader = new THREE.ImageLoader( manager );
        loader.setCrossOrigin( this.crossOrigin );
        loader.load( url, function ( image ) {

            texture.image = CLOUD.MaterialLoader.ensurePowerOfTwo( image );
            texture.needsUpdate = true;

            if ( onLoad ) onLoad( texture );

        }, onProgress, onError );

    }

    if ( mapping !== undefined ) texture.mapping = mapping;

    return texture;
};

CLOUD.MaterialLoader.ensurePowerOfTwo = function ( image ) {

    if ( ! THREE.Math.isPowerOfTwo( image.width ) || ! THREE.Math.isPowerOfTwo( image.height ) ) {

        var canvas = document.createElement( "canvas" );
        canvas.width = CLOUD.MaterialLoader.nextHighestPowerOfTwo( image.width );
        canvas.height = CLOUD.MaterialLoader.nextHighestPowerOfTwo( image.height );

        var ctx = canvas.getContext( "2d" );
        ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );
        return canvas;

    }

    return image;
};

CLOUD.MaterialLoader.nextHighestPowerOfTwo = function( x ) {

    --x;

    for ( var i = 1; i < 32; i <<= 1 ) {
        x = x | x >> i;
    }

    return x + 1;
};


CLOUD.MpkLoader = function ( showStatus ) {

	THREE.Loader.call( this, showStatus );

};

CLOUD.MpkLoader.prototype = Object.create( THREE.Loader.prototype );
CLOUD.MpkLoader.prototype.constructor = CLOUD.MpkLoader;

CLOUD.MpkLoader.prototype.load = function (url, parameters, client, callback, onComplete) {

    var scope = this;
    var useArraybuffer = CLOUD.GlobalData.UseArrayBuffer;

    var xhr = new XMLHttpRequest();

    var length = 0;

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {

                var format = client.mkpIndex.format;
                if (format === undefined || format === 0) {

                    var binaryData;
                    if (useArraybuffer) {
                        binaryData = new Uint8Array(xhr.response);
                    }
                    else {
                        var ct = xhr.getResponseHeader("content-type") || "";
                        var xml = ct.indexOf("xml") >= 0;
                        var responseArrayBuffer = xhr.hasOwnProperty('responseType') && xhr.responseType == 'arraybuffer';
                        var mozResponseArrayBuffer = 'mozResponseArrayBuffer' in xhr;
                        var data = mozResponseArrayBuffer ? xhr.mozResponseArrayBuffer : responseArrayBuffer ? xhr.response : xml ? xhr.responseXML : xhr.responseText; // Vjeux

                        var arrayBuffers = [];
                        if (Object.prototype.toString.call(data) != '[object Array]') {
                            console.log('manually convert to response bufferArray!');
                            for (var i = 0, len = xhr.response.length; i < len; ++i) {
                                var c = xhr.response.charCodeAt(i);
                                var byte = c & 0xff;
                                arrayBuffers.push(byte);
                            }
                        } else {
                            arrayBuffers = data;
                        }
                        binaryData = new Uint8Array(arrayBuffers);
                    }


                    scope.parseCTM(binaryData, parameters, client, callback);

                    binaryData = null;
                }
                else {
                    scope.parseS3D(xhr.response, parameters, client, callback);
                }

                onComplete();
            }
        }

    }
    xhr.open("GET", url, true);

    if(useArraybuffer){
        xhr.responseType = "arraybuffer";
    }
    else{
        xhr.setRequestHeader("Content-Type", "text/plain; charset=x-user-defined");
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
    xhr.send(null);
};

CLOUD.MpkLoader.prototype.parseS3D = function (arrayBuffer, parameters, client, callback) {

    for (var meshId in parameters.items) {

        if (client.cache.geometries[meshId])
            continue;

        var offset = parameters.items[meshId];
        var s3dFile = new S3D.S3DLoader();
        s3dFile.parse(arrayBuffer.slice(offset.offset, offset.offset + offset.size));
        this.createModel(s3dFile.index(), s3dFile.position(), meshId, callback);
    }

}

CLOUD.MpkLoader.prototype.parseCTM = function (binaryData, parameters, client, callback) {

    var stream = new CTM.Stream(binaryData);
    for (var meshId in parameters.items) {

        if (client.cache.geometries[meshId])
            continue;

        var offset = parameters.items[meshId];
        stream.offset = offset.offset;
        var ctmFile = new CTM.File(stream);
        this.createModel(ctmFile.body.indices, ctmFile.body.vertices, meshId, callback);
        ctmFile = null;
    }

    stream = null;
};

CLOUD.MpkLoader.prototype.createModel = function (indices, vertices, meshId, callback) {

    var geometry = new THREE.BufferGeometry();
    geometry.refCount = 0;
    geometry.name = meshId;

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

    geometry.computeVertexNormals();

    callback(geometry);
};


/**
 * @author Liwei.Ma
 */

CLOUD.SubSceneLoader = function (manager, crossOrigin) {
    this.manager = manager;
    this.crossOrigin = crossOrigin;
};

CLOUD.SubSceneLoader.prototype = {
    constructor: CLOUD.SubSceneLoader,

    update: function(subScene){

        var scope = this;

        var resource = subScene.client.cache;

        function on_load_mesh(meshNode) {
            return function () {
                var mesh = resource.geometries[meshNode.meshId];
                if (mesh) {
                    meshNode.updateGeometry(mesh);
                }
                else {
                    console.log("err: " + item + " may be in other mpk");
                }
            }
        };

        function update_children(children) {

            for (var child in children) {
                var meshNode = children[child];

                if (meshNode instanceof CLOUD.Mesh) {

                    var meshId = meshNode.meshId;
                    if (meshId === undefined)
                        continue;

                    if (!meshNode.geometry || meshNode.geometry.refCount === undefined) {
                        var mesh = resource.geometries[meshId];
                        if (mesh) {
                            meshNode.updateGeometry(mesh);
                        }
                        else {

                            scope.manager.addDelayLoadMesh({ meshNode: meshNode, client: subScene.client });

                        }
                    }
                    continue;
                }

                update_children(meshNode.children);
            }
        };

        update_children(subScene.children);
    },

    /**
     * Parse the scene only, will not load the mesh data.
     */
    parse: function (subScene, sceneJSON) {

        var scope = this;

        var client = subScene.client;
        var resource = client.cache;

        function handle_children(parent, children, level, userId, userData, trf) {

            for (var nodeId in children) {

                var objJSON = children[nodeId];

                // override user id.
                if (userId !== undefined)
                    objJSON.userId = userId;

                if (objJSON.userData)
                    userData = objJSON.userData;

                var object;

                if (objJSON.nodeType == "MpkNode") {

                    handle_children(parent, objJSON.nodes, level);

                }
                else if (objJSON.nodeType == "CellNode") {

                    object = new CLOUD.Cell();
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                    // set world bbox
                    object.worldBoundingBox = object.boundingBox.clone();
                    object.worldBoundingBox.applyMatrix4(scope.manager.getGlobalTransform());
                    object.level = objJSON.level;


                    parent.add(object);

                    handle_children(object, objJSON.children, level + 1);
                }
                else if (objJSON.nodeType == "SceneNode") {

                    if (objJSON.sceneType == CLOUD.SCENETYPE.Child) {

                        object = new CLOUD.SubScene();
                        CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                        object.client = client;

                        CLOUD.GeomUtil.parseSceneNode(object, objJSON, scope.manager, level);

                        parent.add(object);

                        object.load();
                    }
                    else {
                        // Will not load.
                    }
                }
                else if (objJSON.nodeType == "GroupNode") {

                    object = new CLOUD.Group();
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);

                    handle_children(parent, objJSON.children, level + 1, userId, userData, object.matrix);

                }
                else if (objJSON.nodeType == "MeshNode") {

                    if (resource.bOutOfLimitation == true)
                        continue;

                    var matObj = client.findMaterial(objJSON.materialId, false);

                    object = new CLOUD.Mesh(CLOUD.GeomUtil.EmptyGeometry, matObj, objJSON.meshId);
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);
                    object.userData = userData;

                    // will not load the mesh.

                    parent.add(object);
                }
                else if (objJSON.nodeType == "PGeomNode") {

                    var matObj = client.findMaterial(objJSON.materialId, false);
                    object = object = CLOUD.GeomUtil.parsePGeomNodeInstance(objJSON, matObj, trf);

                    if (object) {

                        object.name = nodeId;
                        object.userId = objJSON.userId;
                        object.userData = userData;


                        parent.add(object);
                    }
                }
                else if (objJSON.nodeType == "SymbolInstance") {

                    var symbolJSON = client.findSymbol(objJSON.symbolId);

                    if (symbolJSON) {
                        if (symbolJSON.nodeType === "GroupNode") {

                            object = new CLOUD.Group();
                            CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);

                            handle_children(parent, symbolJSON.children, level + 1, objJSON.userId, userData, object.matrix);

                        }
                        else if (symbolJSON.nodeType === "MeshNode") {

                            var matObj = client.findMaterial(symbolJSON.materialId, false);

                            object = new CLOUD.Mesh(CLOUD.GeomUtil.EmptyGeometry, matObj, symbolJSON.meshId);
                            CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);
                            object.userData = userData;
                            parent.add(object);

                        }
                        else if (symbolJSON.nodeType === "PGeomNode") {

                            var matObj = client.findMaterial(symbolJSON.materialId, false);

                            var trfLocal = new THREE.Matrix4();
                            if (objJSON.matrix) {
                                trfLocal.fromArray(objJSON.matrix);
                            }
                            if (trf) {
                                trfLocal.updateMatrixWorld(trf, trfLocal);
                            }

                            object = CLOUD.GeomUtil.parsePGeomNodeInstance(symbolJSON, matObj, trfLocal);

                            if (object) {

                                object.name = nodeId;
                                object.userId = userId;
                                object.userData = userData;

                                parent.add(object);
                            }
                        }
                    }

                }
                else if (objJSON.nodeType == "InstancedMeshNode") {
                    if ( resource.bOutOfLimitation === true ) {
                        continue;
                    }

                    var matObj = client.findMaterial(objJSON.materialId, true);

                    object = new CLOUD.Mesh(undefined, matObj, objJSON.meshId);
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                    parent.add(object);
                }
            }
        };

        if (sceneJSON.children) {
            subScene.embedded = true;
            handle_children(subScene, sceneJSON.children, 0);
        }
    }
}
/**
 * @author Liwei.Ma
 */

CLOUD.SceneLoader = function (manager, crossOrigin) {
    this.manager = manager;
    this.crossOrigin = crossOrigin;
};

CLOUD.SceneLoader.prototype = {
    constructor: CLOUD.SceneLoader,

    // Load the scene as children of group
    load: function (sceneId, group, client, notifyProgress, callbackFinished) {
        var scope = this;

        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);

        loader.load(client.sceneUrl(sceneId), function (data) {
            scope.parse(JSON.parse(data), sceneId, group, client, notifyProgress, callbackFinished);
        });

    },


    setCrossOrigin: function (value) {
        this.crossOrigin = value;
    },


    parse: function (json, sceneId, group, client, notifyProgress, callbackFinished) {
        var scope = this;

        var delayLoadMeshNodes = [];

        var data = json;

        var triangleCount = 0;
        var vertexCount = 0;

        var resource = client.cache;

        var total_models = data.metadata.count;
        if (total_models <= 0) {
            callbackFinished(resource);
            return;
        }

        var counter_models = total_models;

        var localRoot = CLOUD.Utils.parseRootNode(group, data);
        localRoot.sceneId = sceneId;
        localRoot.client = client;
        localRoot.subSceneRoot = true;

        if (notifyProgress)
            scope.manager.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_START, sceneId: sceneId });


        function loadMeshNode(object, meshId) {

            var mesh = resource.geometries[meshId];
            if (mesh) {
                object.updateGeometry(mesh);
            }
            else {
                delayLoadMeshNodes.push({ meshNode: object, isInstanced: false });
            }
        }

        function loadInstanceMeshNode(object, meshId, objJSON) {

            var mesh = resource.geometries[meshId];
            if (mesh) {
                var geometry = CLOUD.GeomUtil.createInstancedBufferGeometry(mesh, objJSON);
                object.updateGeometry(geometry);
            }
            else {
                delayLoadMeshNodes.push({ meshNode: object, isInstanced: true });
            }
        }

        function handle_children(parent, children, level, userId, userData, trf) {

            for (var nodeId in children) {

                var objJSON = children[nodeId];

                // override userId
                if (userId !== undefined)
                    objJSON.userId = userId;

                if (objJSON.userData)
                    userData = objJSON.userData;

                var object;

                if (objJSON.nodeType == "MpkNode") {

                    scope.manager.loadMpk(objJSON.mpkId, client, onload_mpk_complete(parent, objJSON, level + 1));
                    continue;
                }
                else if (objJSON.nodeType == "CellNode") {

                    object = new CLOUD.Cell();
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                    // set world bbox
                    object.worldBoundingBox = object.boundingBox.clone();
                    object.worldBoundingBox.applyMatrix4(scope.manager.getGlobalTransform());
                    object.level = objJSON.level;

                    //if (CLOUD.GlobalData.ShowCellBox) {
                    //    var clr = 0xff;
                    //    clr = clr << (level * 5);

                    //    var boxNode = new CLOUD.BBoxNode(object.boundingBox, clr);
                    //    CLOUD.Utils.parseTransform(boxNode, objJSON);
                    //    object.add(boxNode);
                    //}



                    handle_children(object, objJSON.children, level + 1);
                    parent.add(object);

                }
                else if (objJSON.nodeType == "SceneNode") {

                    if (objJSON.sceneType == CLOUD.SCENETYPE.Child) {

                        object = new CLOUD.SubScene();
                        CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                        object.client = client;

                        CLOUD.GeomUtil.parseSceneNode(object, objJSON, scope.manager, level);

                        parent.add(object);

                        scope.manager.subSceneLoader.parse(object, objJSON);
                    }
                    else {
                        // Will not load.
                    }
                }
                else if (objJSON.nodeType == "GroupNode") {

                    object = new CLOUD.Group();
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);

                    handle_children(parent, objJSON.children, level + 1, userId, userData, object.matrix);

                }
                else if (objJSON.nodeType == "MeshNode") {
                    if (resource.bOutOfLimitation == true)
                        continue;

                    var matObj = client.findMaterial(objJSON.materialId, false);

                    object = new CLOUD.Mesh(CLOUD.GeomUtil.EmptyGeometry, matObj, objJSON.meshId);
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);
                    object.userData = userData;

                    loadMeshNode(object, objJSON.meshId);

                    parent.add(object);
                }
                else if (objJSON.nodeType == "PGeomNode") {

                    var matObj = client.findMaterial(objJSON.materialId, false);
                    object = object = CLOUD.GeomUtil.parsePGeomNodeInstance(objJSON, matObj, trf);

                    if (object) {

                        object.name = nodeId;
                        object.userId = objJSON.userId;
                        object.userData = userData;

                        //console.log(userData);

                        parent.add(object);
                    }
                }
                else if (objJSON.nodeType == "SymbolInstance") {

                    var symbolJSON = client.findSymbol(objJSON.symbolId);
                    if (symbolJSON) {

                        if (symbolJSON.nodeType === "GroupNode") {

                            object = new CLOUD.Group();
                            CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);

                            handle_children(parent, symbolJSON.children, level + 1, objJSON.userId, userData, object.matrix);

                            // update child userId
                        }
                        else if (symbolJSON.nodeType === "MeshNode") {

                            var matObj = client.findMaterial(symbolJSON.materialId, false);

                            object = new CLOUD.Mesh(CLOUD.GeomUtil.EmptyGeometry, matObj, symbolJSON.meshId);
                            CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId, trf);
                            object.userData = userData;

                            loadMeshNode(object, objJSON.meshId);

                            parent.add(object);

                        }
                        else if (symbolJSON.nodeType === "PGeomNode") {

                            var matObj = client.findMaterial(symbolJSON.materialId, false);

                            var trfLocal = new THREE.Matrix4();
                            if (objJSON.matrix) {
                                trfLocal.fromArray(objJSON.matrix);
                            }
                            if (trf) {
                                trfLocal.multiplyMatrices(trf, trfLocal.clone());
                            }

                            object = CLOUD.GeomUtil.parsePGeomNodeInstance(symbolJSON, matObj, trfLocal);

                            if (object) {

                                object.name = nodeId;
                                object.userId = userId;
                                object.userData = userData;

                                parent.add(object);
                            }
                        }
                    }

                }
                else if (objJSON.nodeType == "InstancedMeshNode") {
                    if ( resource.bOutOfLimitation === true ) {
                        continue;
                    }

                    var matObj = client.findMaterial(objJSON.materialId, true);

                    var object = new CLOUD.Mesh(undefined, matObj, objJSON.meshId);
                    CLOUD.GeomUtil.parseNodeProperties(object, objJSON, nodeId);

                    loadInstanceMeshNode(object, objJSON.meshId, objJSON);

                    parent.add(object);

                }

                if (level == 0) {
                    onload_node_complete();
                }
            }
        };

        function onload_node_complete(level) {

            counter_models -= 1;
            async_callback_gate();

        };

        function onload_mpk_complete(parent, objJSON, level) {

            return function () {
                handle_children(parent, objJSON.nodes, level);
                counter_models -= 1;
                async_callback_gate();
            }
        };


        function async_callback_gate() {

            var progress = {
                total: total_models,
                loaded: total_models - counter_models
            };

            // update progress
            if (notifyProgress)
                scope.manager.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_PROGRESS, progress:progress});

            if (counter_models == 0) {
                counter_models -= 1;
                finalize();
                callbackFinished(resource);
            }
        };

        function on_load_mesh(item) {
            var mesh = resource.geometries[item.meshNode.meshId];
            if (mesh) {
                item.meshNode.updateGeometry(mesh);
            }
            else {
                console.log("err: " + item + " may be in other mpk");
            }
        };

        function finalize() {
            // take care of targets which could be asynchronously loaded objects
            var TASK_COUNT = 5;

            function processItem(i) {

                if (i >= delayLoadMeshNodes.length)
                    return;

                var item = delayLoadMeshNodes[i];

                var meshId = item.meshNode.meshId;
                var mesh = resource.geometries[meshId];
                if (mesh) {
                    item.meshNode.updateGeometry(mesh);
                    processItem(i + TASK_COUNT);
                }
                else {
                    var mpkId = client.meshIds[meshId];
                    scope.manager.loadMpk(mpkId, client, function () {
                        on_load_mesh(item);
                        processItem(i + TASK_COUNT);
                    });
                }

            }


            for (var ii = 0; ii < TASK_COUNT; ii++) {
                processItem(ii);
            }
        };


        handle_children(localRoot, data.objects, 0);

        // just in case there are no async elements
        async_callback_gate();
    }
}
/**
 * @author Liwei.Ma
 * Load the index, material and mpkIndex
 */

CLOUD.IndexLoader = function (crossOrigin, manager) {
    this.taskCount = 0;
    this.crossOrigin = crossOrigin;
    this.maxTaskCount = 3;
    this.manager = manager;
};

CLOUD.IndexLoader.prototype = {
    constructor: CLOUD.IndexLoader,

    load: function (client, callbackFinished) {

        var scope = this;

        function onTaskFinished() {
            scope.taskCount++;
            if (scope.taskCount >= scope.maxTaskCount) {
                callbackFinished();
            }

        };

        // Index
        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);
        loader.load(client.projectUrl(), function (text) {

            var index = JSON.parse(text);
            client.index = index;

            if (index.view) {
                CLOUD.Utils.parseTransform(scope.manager.scene.rootNode, index.view);
            }

            if (index.metadata.symbol) {

                loader.load(client.symbolIndexUrl(), function (textSymbol) {
                    client.symbolIndex = JSON.parse(textSymbol);

                        onTaskFinished();
                    });
             }
            else {
                onTaskFinished();
            }

        });

        // Material
        var materialLoader = new CLOUD.MaterialLoader();
        materialLoader.setBaseUrl(client.getTexturePath());
        materialLoader.setCrossOrigin(this.crossOrigin);
        materialLoader.load(client.materialUrl("material"), function () {
            onTaskFinished();
        }, client.cache);

        // MPK Index
        loader.load(client.mpkIndexUrl(), function (text) {
            client.mkpIndex = JSON.parse(text);

            // build meshId to mpkIndex
            for (var mpkId in client.mkpIndex.items) {
                var meshIds = client.mkpIndex.items[mpkId].items;
                for (var meshId in meshIds) {
                    client.meshIds[meshId] = mpkId;
                }
            }

            onTaskFinished();
        });



    },


    setCrossOrigin: function (value) {
        this.crossOrigin = value;
    }
}
/**
 * @author Liwei.Ma
 */

CLOUD.SceneBoxLoader = function (manager, crossOrigin) {
    this.manager = manager;
    this.crossOrigin = crossOrigin;
};

CLOUD.SceneBoxLoader.prototype = {
    constructor: CLOUD.SceneBoxLoader,

    load: function (sceneId, scene, cloudClient, callbackFinished) {
        var scope = this;

        var loader = new THREE.XHRLoader(scope.manager);
        loader.setCrossOrigin(this.crossOrigin);

        loader.load(cloudClient.sceneUrl(sceneId), function (data) {
            scope.parse(sceneId, JSON.parse(data), scene, cloudClient, callbackFinished)
        });

    },

    setCrossOrigin: function (value) {
        this.crossOrigin = value;
    },

    parse: function (sceneId, json, scene, cloudClient, callbackFinished) {
        var scope = this;

        var data = json;

        var result = cloudClient.cache;

        var total_models = data.metadata.count;
        if (total_models <= 0) {
            callbackFinished(result);
            return;
        }

        var counter_models = total_models;

        var localRoot = CLOUD.Utils.parseRootNode(scene, data);

        this.manager.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_START, sceneId: sceneId });

        // handle all the children from the loaded json and attach them to given parent

        var level = -1;
        function handle_children(parent, children) {
            level++;
            for (var nodeId in children) {

                if (level == 0)
                    --counter_models;

                var objJSON = children[nodeId];

                var object;

                if (objJSON.nodeType == "MpkNode") {
                    handle_children(parent, objJSON.nodes);
                }
                else if (objJSON.nodeType == "GroupNode"
                    || objJSON.nodeType == "MeshNode") {

                    var clr = 0xff;
                    clr = clr << (level*5);

                    var bbox = CLOUD.Utils.box3FromArray(objJSON.bbox);
                    object = new CLOUD.BBoxNode(bbox, clr);
                    CLOUD.Utils.parseTransform(object, objJSON);

                    parent.add(object);

                    handle_children(parent, objJSON.children);
                }
                else if(objJSON.nodeType == "CellNode"
                    || objJSON.nodeType == "SceneNode") {

                    var clr = 0xff;
                    clr = clr << (level * 5);

                    var bbox = CLOUD.Utils.box3FromArray(objJSON.bbox);
                    object = new CLOUD.BBoxNode(bbox, clr);
                    CLOUD.Utils.parseTransform(object, objJSON);

                    parent.add(object);
                }

            }
            level--;
        };

        function async_callback_gate() {

            var progress = {
                total: total_models,
                loaded: total_models - counter_models
            };

            //upate progress
            scope.manager.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_PROGRESS, progress: progress });

            if (counter_models == 0) {
                counter_models -= 1;
                callbackFinished(result);
            }
        };

        handle_children(localRoot, data.objects);

        // just in case there are no async elements
        async_callback_gate();
    }
}
/**
 * @author Liwei.Ma
 */

CLOUD.ModelManager = function () {

    THREE.LoadingManager.call(this);
    //this.onStart = function () { console.log("start"); };
    //this.onLoad = function () { console.log("load"); }
    //this.onProgress = function () { console.log("progress"); }
    this.onError = function () { console.log("error") };

    this.scene = new CLOUD.Scene();

    this.headLamp = new THREE.DirectionalLight(0xB7B7CE, 0.8);
    this.assistLamp = new THREE.DirectionalLight(0x333333, 0.8);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    //hemiLight.color.setHSL( 1, 1, 1 );
    //hemiLight.groundColor.setHSL( 0.5, 0.5, 0.5 );
    //hemiLight.position.set( 0, -500, -500 );
    this.scene.add(hemiLight);
    this.scene.add(this.headLamp);
    this.scene.add(this.assistLamp);

    // Loaders
    this.mpkLoader = new CLOUD.MpkLoader();
    this.sceneLoader = new CLOUD.SceneLoader(this, true);
    this.boxLoader = new CLOUD.SceneBoxLoader(this, true);
    this.subSceneLoader = new CLOUD.SubSceneLoader(this, true);

    this.clients = {};

    this.vertexCount = 0;
    this.triangleCount = 0;

    this.loading = false;

    this.delayLoadMeshItems = [];
    this.loadedItemOffset = 0;
};

CLOUD.ModelManager.prototype = Object.create(THREE.LoadingManager.prototype);

CLOUD.ModelManager.prototype.constructor = CLOUD.ModelManager;

CLOUD.ModelManager.prototype.prepareScene = function (camera) {
    var dir = camera.getWorldDirection().clone();
    dir.normalize();
    dir.multiplyScalar(-1);
    this.headLamp.position.copy(dir);

    var offset = new THREE.Vector3(-2.0, -1.5, -0.5);
    offset.normalize();
    dir.add(offset).normalize();
    this.assistLamp.position.copy(dir);

    // update scene
    this.scene.prepareScene(camera);

    this.prepareResource();
};

CLOUD.ModelManager.prototype.getGlobalTransform = function(){
    return this.scene.rootNode.matrix;
};

// load index
CLOUD.ModelManager.prototype.loadIndex = function (parameters, callback) {

    var scope = this;

    // get from cache
    var client = this.clients[parameters.databagId];
    if (client === undefined) {
        client = new CLOUD.Client(parameters.serverUrl, parameters.databagId);
        this.clients[parameters.databagId] = client;
    }

    var sceneLoader = this.sceneLoader;

    var idxLoader = new CLOUD.IndexLoader(true, this);
    idxLoader.load(client, function () {
        callback(client);
    });

}

// load one scene
CLOUD.ModelManager.prototype.showScene = function (databagId, sceneIds) {

    var scope = this;
    var client = scope.clients[databagId];

    scope.scene.showSceneNodes(false);

    if (!sceneIds)
        return;

    function showSceneImpl(idx) {

        if (idx >= sceneIds.length) {
            scope.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_COMPLETE });
            return;
        }


        var sceneId = sceneIds[idx];
        var sceneNode = scope.scene.findSceneNode(sceneId);
        if (sceneNode && sceneNode.client.databagId == databagId) {
            sceneNode.visible = true;
            showSceneImpl(idx+1);
        }
        else {

            scope.loading = true;

            scope.sceneLoader.load(sceneId, scope.scene, client, true, function () {

                scope.loading = false;
                showSceneImpl(idx+1);
            });
        }
    }

    showSceneImpl(0);
}

/**
* @param parameters {databagId, serverUrl, debug}
*/
CLOUD.ModelManager.prototype.load = function (parameters) {

    var scope = this;

    this.loadIndex(parameters, function (client) {

        scope.loading = true;
        var defaultSceneId = client.index.metadata.scenes[0];

        scope.sceneLoader.load(defaultSceneId, scope.scene, client, true, function (result) {

            scope.loadLinks(result, client);

        });
    });

}

/**
* @param parameters {scene, databagId, serverUrl, debug}
*/
CLOUD.ModelManager.prototype.loadLinks = function (result, client) {
    var scope = this;
    var sceneLoader = this.sceneLoader;

    client.linkSceneIdx = -1;

    var loadLinkedScenes = function (result) {

        client.linkSceneIdx++;
        var linkScenes = client.index.metadata.linkScenes;

        if (linkScenes == undefined || linkScenes.length < 1) {
            scope.loading = false;
            scope.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_COMPLETE});
            return;
        }

        if (client.linkSceneIdx < linkScenes.length) {
            var sceneId = linkScenes[client.linkSceneIdx];
            //console.log("Linked scene: " + sceneId);
            sceneLoader.load(sceneId, scope.scene, client, true, loadLinkedScenes);
        }
        else {
            scope.loading = false;
            scope.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_COMPLETE});
        }
    }

    loadLinkedScenes(result);
}

CLOUD.ModelManager.prototype.listenSubScene = function(sceneNode){
    var scope = this;
    sceneNode.addEventListener(CLOUD.EVENTS.ON_LOAD_SUBSCENE, function (evt) {
        scope.onLoadSubSceneEvent(evt);
    });
}

CLOUD.ModelManager.prototype.onLoadSubSceneEvent = function (evt) {
    var subSceneNode = evt.target;
    var scope = this;
    subSceneNode.loaded = true;

    if (subSceneNode.children.length == 0) {
        this.sceneLoader.load(subSceneNode.sceneId, subSceneNode, evt.client, false, function () {
            //console.log(subSceneNode.sceneId);
            subSceneNode.visible = true;
            //scope.dispatchEvent({ type: CLOUD.EVENTS.ON_LOAD_COMPLETE });
            //console.log({vertex: scope.vertexCount, triangle: scope.triangleCount});
        });
    }
    else {
        this.subSceneLoader.update(subSceneNode);
    }
}

CLOUD.ModelManager.prototype.addDelayLoadMesh = function(item){

    this.delayLoadMeshItems.push(item);

}

CLOUD.ModelManager.prototype.loadMpk = function (mpkId, client, callback) {
    var mpkLoader = this.mpkLoader;
    var mpkIdx = client.mkpIndex.items[mpkId];

    if (!mpkIdx) {
        console.log("missing mpk " + mpkId);
        return;
    }
    // Reuse if possible.
    if (mpkIdx.status){
        if (mpkIdx.status == CLOUD.MPKSTATUS.LOADED) {
            callback();
            return;
        }

        if (mpkIdx.status == CLOUD.MPKSTATUS.LOADING) {
            mpkIdx.addEventListener("ON_MPK_LOADED", function () {
                callback();
            });
            return;
        }
     }

    THREE.EventDispatcher.prototype.apply(mpkIdx);
    mpkIdx.status = CLOUD.MPKSTATUS.LOADING;

    var scope = this;

    mpkLoader.load(client.mpkUrl(mpkId), mpkIdx, client,
        function (mesh) {

            scope.vertexCount += mesh.getAttribute("position").count;
            scope.triangleCount += mesh.getIndex().count / 3;
            //if (vertexCount >= CLOUD.GlobalData.MaxVertex ||
            //    triangleCount >= CLOUD.GlobalData.MaxTriangle) {
            //    resource.bOutOfLimitation = true;
            //}
            client.cache.geometries[mesh.name] = mesh;
        },
        function () {
            mpkIdx.status = CLOUD.MPKSTATUS.LOADED;
            callback();
            mpkIdx.dispatchEvent({ type: "ON_MPK_LOADED" });
        }
    );
}

CLOUD.ModelManager.prototype.prepareResource = function () {

    var scope = this;

    var delayLoadMeshItems = this.delayLoadMeshItems;
    var itemCount = delayLoadMeshItems.length;
    var startOffset = scope.loadedItemOffset;
    scope.loadedItemOffset = itemCount;

    if (startOffset < itemCount)
    {
        var TASK_COUNT = 4;

        function on_load_mesh(item) {

            var mesh = item.client.cache.geometries[item.meshNode.meshId];
            if (mesh) {
                item.meshNode.updateGeometry(mesh);
            }
            else {
                console.log("err: " + item + " may be in other mpk");
            }
        };

        function processItem(i) {

            var idx = i + startOffset;
            if (idx >= itemCount) {
                //console.log(startOffset);
                return;
            }


            var item = delayLoadMeshItems[idx];
            var client = item.client;

            var meshId = item.meshNode.meshId;
            var mesh = client.cache.geometries[meshId];
            if (mesh) {
                item.meshNode.updateGeometry(mesh);
                processItem(i + TASK_COUNT);
            }
            else {
                var mpkId = client.meshIds[meshId];
                scope.loadMpk(mpkId, client, function () {
                    on_load_mesh(item);
                    processItem(i + TASK_COUNT);
                });
            }

        }


        //console.log("start");
        for (var ii = 0; ii < TASK_COUNT; ii++) {
            processItem(ii);
        }

    }
    else {
        //console.log("STOP");
    }



    if (!CLOUD.GlobalData.DynamicRelease || this.loading)
        return;

    for (var ii in this.clients) {
        var client = this.clients[ii];
        client.purgeUnusedResource();
    }
}

THREE.EventDispatcher.prototype.apply(CLOUD.ModelManager.prototype);
CLOUD.EditorManager = function (handleViewHouseEvent) {

    var scope = this;
    this.editor = null;
    this.animationDuration = 500;// 500毫秒
    this.animationFrameTime = 13; // 周期性执行或调用函数之间的时间间隔，以毫秒计
    this.enableAnimation = true; // 是否允许动画

    function touchmove( event ) {
        scope.editor.touchmove(event);
    }
    function touchstart( event ) {
        scope.editor.touchstart(event);
    }
    function touchend(event) {
        scope.editor.touchend(event);
    }
    function onKeyDown( event ) {
        scope.editor.onKeyDown(event);
    }
    function onKeyUp( event ) {
        scope.editor.onKeyUp(event);
    }
    function onMouseWheel( event ) {
        scope.editor.onMouseWheel(event);
    }

    function onMouseMove( event ) {

        var isAnimating = scope.isAnimating();

        // 判断是否在动画中，如果在动画中，不响应
        if (!isAnimating) {
            // viewHouse 交互
            handleViewHouseEvent("move", event);

            // 其它交互
            if (scope.isMouseMove) {
                //console.log("editor - onMouseMove");
                scope.editor.onMouseMove(event);
            }
        }
    }

    function onMouseUp(event) {

        var isAnimating = scope.isAnimating();

        // 判断是否在动画中，如果在动画中，不响应
        if (!isAnimating) {
            // viewHouse 交互
            handleViewHouseEvent("up", event);


            if (scope.isMouseMove) {
                scope.isMouseMove = false;

               // 其它交互
               scope.editor.onMouseUp(event);
            }
        }
    }

    function onMouseDown( event ) {

        scope.isMouseMove = false;

        var isAnimating = scope.isAnimating();

        // 判断是否在动画中，如果在动画中，不响应
        if (!isAnimating) {
            // viewHouse 交互
            var isInHouse = handleViewHouseEvent("down", event);

            // 鼠标点不在viewHouse区域，则允许主视图操作
            if (!isInHouse) {
                scope.isMouseMove = true;

                // 其它交互
                scope.editor.onMouseDown(event);
            }
        }
    }


    this.registerDomEventListeners = function (domElement) {

        domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        domElement.addEventListener( 'mousedown', onMouseDown, false );
        domElement.addEventListener( 'mousewheel', onMouseWheel, false );
        domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

        // 注册在document上会影响dbgUI的resize事件
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('mouseup', onMouseUp, false);

        domElement.addEventListener( 'touchstart', touchstart, false );
        domElement.addEventListener( 'touchend', touchend, false );
        domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', onKeyDown, false );
        window.addEventListener( 'keyup', onKeyUp, false );
    };

};


CLOUD.EditorManager.prototype = {

    constructor: CLOUD.EditorManager,

    updateEditor: function (camera) {
        if (this.clipEditor !== undefined) {
            this.clipEditor.update(camera);
        }
    },

    setEditor : function (newEditor) {

        if (this.editor === newEditor)
            return;

        if (this.editor !== null) {
            // 切换模块引起的状态变化应该都在这里处理
            this.editor.onExistEditor();
        }

        this.editor = newEditor;
    },

    getClipEditor : function(viewer){
        if (this.clipEditor === undefined) {
            this.clipEditor = new CLOUD.ClipEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
        }

        return this.clipEditor;
    },

    setPickMode: function (viewer) {
        var scope = this;

        if(this.pickEditor === undefined){
            var pickEditor = new CLOUD.PickEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
            pickEditor.onObjectSelected = function (intersect) {
                viewer.modelManager.dispatchEvent({ type: CLOUD.EVENTS.ON_SELECTION_CHANGED, intersect: intersect })
            };
            this.pickEditor = pickEditor;
        }


        scope.setEditor(this.pickEditor);
    },

    setOrbitMode: function (viewer) {
        var scope = this;

        if(this.orbitEditor === undefined){
            this.orbitEditor = new CLOUD.OrbitEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
        }

        scope.setEditor(this.orbitEditor);
    },

    setZoomMode: function (viewer) {
        var scope = this;

        if(this.zoomEditor === undefined){
            this.zoomEditor = new CLOUD.ZoomEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
        }

        scope.setEditor(this.zoomEditor);
    },

    setPanMode: function (viewer) {
        var scope = this;

        if(this.panEditor === undefined){
            this.panEditor = new CLOUD.PanEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
        }

        scope.setEditor(this.panEditor);
    },

    setFlyMode: function (bShowControlPanel, viewer) {
        var scope = this;
        if(this.flyEditor === undefined){
            this.flyEditor = new CLOUD.FlyEditor(viewer.cameraEditor, viewer.getScene(), viewer.domElement);
        }
        if (bShowControlPanel !== undefined) {
            this.flyEditor.showControlPanel(bShowControlPanel);
        }
        scope.setEditor(this.flyEditor);

        // 进入fly模式，视图设置为ISO
        //scope.setStandardView(CLOUD.EnumStandardView.ISO, viewer);
    },

    zoomIn: function (factor, viewer) {
        var zoom = 1;
        if(factor === undefined){
            zoom = viewer.camera.zoom * 1.1;
        }
        else{
            zoom = factor;
        }

        // 缩放限制
        var isZoom = viewer.cameraEditor.isKeepZoom(zoom);
        if (isZoom !== true) {
            return;
        }

        // 缩放时，改变相机缩放因子zoom，就会改变相机FOV，从而造成模型显示变形
        // 思路：保持相机FOV和目标点位置不变，调整相机位置达到缩放的目的
        //this.camera.setZoom(factor);
        viewer.camera.setZoomByEye(zoom, viewer.cameraEditor.target.clone())

        viewer.render();
    },

    zoomOut: function (factor, viewer) {
        if(factor === undefined){
            factor = viewer.camera.zoom * 0.9;
        }
        if(factor < 0.28){
            factor = 0.28;
        }

        // 缩放限制
        var isZoom = viewer.cameraEditor.isKeepZoom(factor);
        if (isZoom !== true) {
            return;
        }

        // 缩放时，改变相机缩放因子zoom，就会改变相机FOV，从而造成模型显示变形
        // 思路：保持相机FOV和目标点位置不变，调整相机位置达到缩放的目的
        //this.camera.setZoom(factor);
        viewer.camera.setZoomByEye(factor, viewer.cameraEditor.target.clone());

        viewer.render();
    },

    zoomAll: function (viewer) {
        var box = viewer.getScene().worldBoundingBox();
        var target = viewer.camera.zoomToBBox(box);
        viewer.cameraEditor.updateCamera(target);

        viewer.render();
    },

    zoomToSelection: function (viewer) {
        var box = viewer.getScene().selectionBox();
        var target = viewer.camera.zoomToBBox(box);
        viewer.cameraEditor.updateCamera(target);
        viewer.render();
    },

    isAnimating: function () {
        return (this.enableAnimation && this.animator && this.animator.isPlaying());
    },

    setStandardView: function (stdView, viewer) {

        var camera = viewer.camera;

        if (this.enableAnimation) {

            if (!this.animator) {
                this.animator = new CLOUD.CameraAnimator();
            }

            this.animator.setDuration(this.animationDuration);
            this.animator.setFrameTime(this.animationFrameTime);
            this.animator.setStandardView(stdView, viewer);

        } else {

            var box = this.getScene().worldBoundingBox();
            var target = camera.setStandardView(stdView, box); // 设置观察视图

            // fit all
            target = viewer.camera.zoomToBBox(box);
            viewer.cameraEditor.updateCamera(target);
            viewer.render();

            camera.up.copy(THREE.Object3D.DefaultUp);// 渲染完成后才可以恢复相机up方向
        }
    },
};




CloudViewer = function () {
    "use strict";

    this.domElement = null;

    this.camera = null;
    this.renderer = null;

    this.incrementRenderEnabled = true; // 启用增量绘制

    this.modelManager = new CLOUD.ModelManager();

    this.viewHouse = new CLOUD.ViewHouse(this);
    this.viewHouse.visible = false;
    this.isMouseMove = false;

    var scope = this;

    function initializeView() {
        scope.viewHouse.visible = true;
        scope.zoomAll();
        // run once
        scope.modelManager.removeEventListener(CLOUD.EVENTS.ON_LOAD_START, initializeView);
    }

    scope.modelManager.addEventListener(CLOUD.EVENTS.ON_LOAD_START, initializeView);

    // 处理ViewHouse交互
    function handleViewHouseEvent(type, event) {

        var isInHouse = false;

        switch (type) {
            case "down":
                isInHouse = scope.viewHouse.mouseDown(event, function (view) {
                    scope.setStandardView(view);
                });
                break;
            case "move":
                isInHouse = scope.viewHouse.mouseMove(event, function (delta) {
                    if (delta !== undefined) {
                        scope.cameraEditor.processRotate(delta);
                    }

                    scope.cameraEditor.updateView();
                });
                break;
            case "up":
                isInHouse = scope.viewHouse.mouseUp(event, function () {
                    scope.cameraEditor.updateView();
                });
                break;
            default:
                break;
        }

        return isInHouse;
    }

    this.editorManager = new CLOUD.EditorManager(handleViewHouseEvent);

    this.isMobile = 0;
    var u = navigator.userAgent;
    if (u.indexOf('Android') > -1) {
        this.isMobile = 1;
    } else if (u.indexOf('iPhone') > -1) {
        this.isMobile = 2;
    } else if (u.indexOf('Windows Phone') > -1) {
        this.isMobile = 3;
    }
    else {

    }
};

CloudViewer.prototype = {

    constructor: CloudViewer,

    // 设置图片资源的路径。默认在“images/”
    setImageResPath: function (path) {
        CLOUD.GlobalData.TextureResRoot = path;
    },

    getScene: function () {
        return this.modelManager.scene;
    },

    setIncrementRenderEnabled: function (enable) {
        this.incrementRenderEnabled = enable;
    },

    // 设置每帧的最大耗时
    setLimitFrameTime: function (limitTime) {
        if (this.incrementRenderEnabled) {

            if (limitTime <= 0) {
                limitTime = 30;
            }

            this.renderer.setLimitFrameTime(limitTime);
        }
    },

    resetIncrementRender: function () {
        if (this.incrementRenderEnabled) {
            this.renderer.resetIncrementRender();
        }
    },

    render: function () {

        var scope = this;
        var camera = this.camera;

        // 重置增量绘制状态
        this.resetIncrementRender();

        this.editorManager.updateEditor(camera);
        this.modelManager.prepareScene(camera);

        var scene = this.getScene();
        // 设置过滤对象
        scope.renderer.setFilterObject(scene.filter);

        function incrementRender() {

            scope.handleId = requestAnimationFrame(incrementRender);

            var isRenderFinish = scope.renderer.IncrementRender(scene, camera);

            if (isRenderFinish) {
                cancelAnimationFrame(scope.handleId);
            }
        }

        // 增量绘制
        if (this.incrementRenderEnabled && this.renderer.IncrementRender) {

            // 第一次需要清屏
            scope.renderer.autoClear = true;
            incrementRender();
            scope.renderer.autoClear = false;

        } else { // 正常绘制

            scope.renderer.autoClear = true;
            this.renderer.render(scene, camera);
        }

        this.viewHouse.render();
    },

    setEditorDefault: function () {
        this.setPickMode();
    },

    // 关闭/开启切面功能，同时设置可见性
    clipToggle: function (enable, visible) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.toggle(enable, visible);

        this.render();
    },

    // 显示/隐藏切面
    clipVisible: function (enable) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.visible(enable);

        this.render();
    },

    // 设置切面为水平/竖直模式
    // 这是一个辅助函数，是对下面旋转功能的封装，保存/恢复状态不需记录/设定
    clipHorizon: function (enable) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.horizon(enable);

        this.render();
    },

    // 沿切面局部坐标移动切面(Z轴)
    clipSetPlane: function (offset) {
        var clipEditor = this.editorManager.getClipEditor(this);

        clipEditor.set(offset);

        this.render();
    },

    // 以切面局部坐标X轴为轴旋转切面
    clipRotPlaneX: function (rot) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.rotX(rot);

        this.render();
    },

    // 以切面局部坐标Y轴为轴旋转切面
    clipRotPlaneY: function (rot) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.rotY(rot);

        this.render();
    },

    // 保存切面状态，切面的位置及旋转状态数据的Object
    // 为减少依赖切面开启、可见状态未包含
    backupClipplane: function () {
        var clipEditor = this.editorManager.getClipEditor(this);
        return clipEditor.backup();
    },

    // 恢复切面状态
    // 输入之前从backupClipplane保存的切面状态对象status，以及界面记录的偏移offset、X+Y轴选转量rotx+roty
    // 注意：offset+rotx+roty是界面状态，内部仅作初始值记录，界面更改后用新值与旧值计算增量控制切面
    restoreClipplane: function (status, offset, rotx, roty) {
        var clipEditor = this.editorManager.getClipEditor(this);
        clipEditor.restore(status, offset, rotx, roty);
        this.render();
    },

    resize: function (width, height) {
        this.camera.setSize(width, height);
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.viewHouse.resize(width, height, this.isMobile);

        this.resizeFlyCross(); // 重设fly模式下十字光标位置

        this.render();
    },

    init: function (domElement) {

        this.domElement = domElement;
        // window.innerWidth, window.innerHeight
        var viewportWidth = domElement.offsetWidth;
        var viewportHeight = domElement.offsetHeight;

        // Renderer
        this.renderer = new THREE.WebGLIncrementRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
        var renderer = this.renderer;

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(viewportWidth, viewportHeight);

        domElement.appendChild(renderer.domElement);

        // 判断是否定义了IncrementRender
        if (this.renderer.IncrementRender === undefined) {
            console.warn('THREE.WebGLIncrementRenderer.IncrementRender: undefined!');
        }

        // 初始化viewHouse
        this.viewHouse.init(domElement);

        // Camera
        var camera = new CLOUD.Camera(viewportWidth, viewportHeight, 45, 0.01, CLOUD.GlobalData.SceneSize * 20, -CLOUD.GlobalData.SceneSize, CLOUD.GlobalData.SceneSize);
        this.camera = camera;

        var scope = this;
        this.cameraEditor = new CLOUD.CameraEditor(camera, domElement, function () {
            scope.render();
        });

        this.lookAt(new THREE.Vector3(-CLOUD.GlobalData.SceneSize, CLOUD.GlobalData.SceneSize, CLOUD.GlobalData.SceneSize), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        this.setPickMode();

        // Register Events
        this.editorManager.registerDomEventListeners(this.domElement);
    },

    registerEventListener: function (type, callback) {
        this.modelManager.addEventListener(type, callback);
    },

    setMeshLimitation: function (maxTriCount, maxVertexCount) {
        CLOUD.GlobalData.MaxTriangle = maxTriCount;
        CLOUD.GlobalData.MaxVertex = maxVertexCount;
    },

    // Should enable for IE
    setUseArrayBuffer: function (bEnable) {
        CLOUD.GlobalData.UseArrayBuffer = bEnable;
    },

    /**
     * Load all
     */
    load: function (databagId, serverUrl, debug) {

        var scope = this;
        if (debug) {
            CLOUD.GlobalData.ShowSubSceneBox = true;
            CLOUD.GlobalData.ShowCellBox = true;
        }

        scope.modelManager.load({databagId: databagId, serverUrl: serverUrl, debug: debug});
    },

    /**
     * Load databag index only
     * callback is called when loading is finished.
     */
    loadIndex: function (databagId, serverUrl, debug, callback) {
        var scope = this;
        if (debug) {
            CLOUD.GlobalData.ShowSubSceneBox = true;
            CLOUD.GlobalData.ShowCellBox = true;
        }

        scope.modelManager.loadIndex({databagId: databagId, serverUrl: serverUrl, debug: debug}, callback);
    },

    /**
     * show one scene.
     * Event CLOUD.EVENTS.ON_LOAD_COMPLETE is raised when finished.
     */
    showScene: function (databagId, sceneIds) {
        this.modelManager.showScene(databagId, sceneIds);
    },

    setPickMode: function () {
        this.editorManager.setPickMode(this);
    },

    setOrbitMode: function () {
        this.editorManager.setOrbitMode(this);
    },

    setZoomMode: function () {
        this.editorManager.setZoomMode(this);
    },

    setPanMode: function () {
        this.editorManager.setPanMode(this);
    },

    setFlyMode: function (bShowControlPanel) {
        this.editorManager.setFlyMode(bShowControlPanel, this);
    },

    resizeFlyCross: function() {
        if ( this.editorManager && this.editorManager.editor === this.editorManager.flyEditor) {
            this.editorManager.flyEditor.resize();
        }
    },

    zoomIn: function (factor) {
        this.editorManager.zoomIn(factor, this);
    },

    zoomOut: function (factor) {
        this.editorManager.zoomOut(factor, this);
    },

    zoomAll: function () {
        this.editorManager.zoomAll(this);
    },

    zoomToSelection: function () {
        this.editorManager.zoomToSelection(this);
    },

    setStandardView: function (stdView) {
        this.editorManager.setStandardView(stdView, this);
    },

    lookAt: function (position, target, up) {
        var dir = new THREE.Vector3();
        dir.subVectors(target, position);

        this.camera.LookAt(target, dir, up);
        this.cameraEditor.updateCamera(target);
        this.render();
    },

    // transform
    transformCamera: function (camera) {
        return CLOUD.CameraUtil.transformCamera(camera, this.modelManager.scene);
    },

    getCamera: function () {
        return this.cameraEditor.getCameraInfo();
    },

    setCamera: function (jsonStr) {
        var camInfo = CLOUD.CameraUtil.parseCameraInfo(jsonStr);
        this.lookAt(camInfo.position, camInfo.target, camInfo.up);
    },

    clearAll: function () {

        this.getScene().clearAll();
    },

    canvas2image: function () {
        var mimetype = "image/png";
        // 在chrome中多调用几次，会出现图片显示不正常（显示空白，原因是转换的值变得不正常了），
        // 所有在每次调用前先render一次
        this.render();
        var dataUrl = this.renderer.domElement.toDataURL(mimetype);
        return dataUrl;
    },

    // 设置方向控制器位置
    setFlyCrossPosition: function () {
        this.editorManager.setFlyCrossPosition();
    },

    getFilters : function() {
        return  this.getScene().filter;
    }
};
