/*
* @preserve
* @summary Hansol Diagram Library.
* @file diagram-min.js (diagram library source file)
* @author Kimsejin <kimsejin@hansol.com>
* @version 1.0.1-beta
*
* © 2022 Kimsejin <kimsejin@hansol.com>
* @endpreserve
*/

const DEBUG = true;
const VERSION = "0.1-beta";
const META_VERSION = 1;
const EVENT_NODE_CLICKED = "onNodeClicked";
const EVENT_NODE_CREATED = "onNodeCreated";
const EVENT_NODE_SELECTED = "onNodeSelected";
const EVENT_NODE_UNSELECTED = "onNodeUnSelected";
const DEFAULT_SHAPE = "Rectangle";
const BLOCK_RECT_DEFAULT_WIDTH = 200;
const BLOCK_RECT_DEFAULT_HEIGHT = 60;
const BLOCK_CIRCLE_RADIUS = 70;
const BLOCK_DIAMOND_DEFAULT_RADIUS = 60;
const BLOCK_FONT_SIZE = 15;

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
// 0: Main button pressed, usually the left button or the un-initialized state
// 1: Auxiliary button pressed, usually the wheel button or the middle button(if present)
// 2: Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
const MOUSE_BUTTON_LEFT_MAIN = 0;
const MOUSE_BUTTON_MIDDLE = 1;
const MOUSE_BUTTON_RIGHT = 2;

let diagram_seq = 0;
let diagrams = new Map();

/**
 * 마우스 포인터가 SVG 상의 어느 한 지점에 있을 때, 이 지점의 SVG ViewBox 좌표계상의 좌표를 반환한다.
 * 이 좌표는 SVG 내에서만 유효하다. 실제 모니터나, 브라우저의 document 좌표와는 다를 수 있다.
 * @example
 * element.addEventListener("click", function (evt) {
 *  const offset = __getMousePosition(evt);
 * }
 * @param {object} evt mouse event
 * @returns {object} mouse position object {x, y}
 */
function __getMousePosition(e) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
    // e.screenX, e.screenY: 모니터 화면상에서의 위치.
    // e.clientX, e.clientY: browser document 상에서의 위치. (특정 Element 가 아님)
    if (!e.target.getScreenCTM) {
        // foreignobject 들은 getScreenCTM 이 없을 수 있다.
        return { x: 0, y: 0 };
    }
    let CTM = e.target.getScreenCTM();
    // getScreenCTM() 은 SVG element 에서만 유효한 것으로 보임. SVGMatrix 를 반환한다.
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
}

/**
 * @example
 * let elm = __makeSvgElement('text', {'x': 10, 'y': 30, 'style': 'pointer-events: none'}, ['svg-text', 'svg-debug-text']);
 * @param {string} tag svg element name
 * @param {object} attrs svg element attributes
 * @param {list} classes svg element class names
 * @returns {object} svg element
 */
function __makeSvgElement(tag, attrs, classes) {
    let elm = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
        __setSvgAttrs(elm, attrs);
    }
    if (classes) {
        classes.forEach((c) => elm.classList.add(c));
    }
    return elm;
}

function __makeSvgTextElement(w, h, fontSize, text) {
    let textElement = __makeSvgElement("foreignObject", {
        width: w,
        height: h,
        style: "pointer-events: none;"
    }, []);

    let textArea = document.createElement("div");
    textArea.className = "svg-text";
    textArea.contentEditable = false;
    textArea.style.cssText = `white-space: pre; width: 100%; height: 100%; padding: 5px; font-size: ${fontSize};`;
    textArea.style.overflow = "hide";
    textArea.style.pointerEvents = "none";
    textArea.innerHTML = text;
    textElement.appendChild(textArea);
    return textElement;
}

/**
 * @example
 * __setSvgAttrs((svgElement, {'cx': x, 'cy': y});
 * @param {object} elm svg element
 * @param {object} attrs svg element attributes
 */
function __setSvgAttrs(elm, attrs) {
    if (attrs) {
        Object.keys(attrs).forEach((k) => elm.setAttributeNS(null, k, attrs[k]));
    }
    return elm;
}

/**
 * s 가 "true" (대소문자 상관없음) 인 경우에만 true 를 반환한다.
 * @param {string} s source string
 * @returns {boolean} 
 */
function __parseBoolean(s) {
    return (String(s).toLowerCase() === 'true');
}

function __xpathFirst(path, rootNode) {
    let iterator = __xpathIterator(path, rootNode);
    return iterator?.iterateNext();
}

function __xpathIterator(path, rootNode) {
    return rootNode.ownerDocument.evaluate(path,
        rootNode,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null);
}

function __setXmlAttribute(key, value, node) {
    let xmlDoc = node.ownerDocument;
    let attr = xmlDoc.createAttribute(key);
    attr.value = value;
    node.attributes.setNamedItem(attr);
}

function __firstChild(childName, node) {
    if (!node.children) {
        return;
    }
    for (let n = 0; n < node.children.length; n++) {
        let child = node.children[n];
        if (child.nodeType !== Node.TEXT_NODE && child.nodeName === childName) {
            return child;
        }
    }
}

function convertAnchorPosition(v) {
    if (v === "0") {
        return "L";
    } else if (v === "1") {
        return "T";
    } else if (v === "2") {
        return "R";
    } else if (v === "3") {
        return "B";
    }
}

function convertAnchorPosition2(v) {
    if (v === "L") {
        return "0";
    } else if (v === "T") {
        return "1";
    } else if (v === "R") {
        return "2";
    } else if (v === "B") {
        return "3";
    }
}

/**
 * @example
 * let diagram = new Diagram('#mysvg');
 * @param {string} svgSelector jquery selector for svg element
 * @returns {object} diagram object
 */
class Diagram {

    static defaultOptions = {
        onContextMenu: null,
        onNodeClicked: null,
        onNodeCreated: null,
        useBackgroundPattern: false,
        lineType: "B", // 'L': StraightLine, 'B': Bezier
        moveUnit: 50,
        memoBorderColor: "#E6C700",
        memoBorderColorSelected: "red",
        memoBackgroundColor: "#FFDF6D",
        memoFontSize: "14px",
        memoRemoveConfirm: () =>
            confirm('Are you sure you want to delete this Memo?'),    
    }

    constructor(svgSelector, meta, options) {
        const id = 'D' + diagram_seq++;
        const $svg = $(svgSelector);
        const svg = $svg[0];
        this.id = id;
        this.svg = svg;
        this.$svg = $svg;
        this.meta = meta;
        this.options = Object.assign({ ...Diagram.defaultOptions }, options);
        this.components = new Map();
        this.componentSeq = 0;
        this.markerId = id + '-marker';
        this.creatingLinkOrigin = null;
        this.creatingLinkLine = null;
        this.creatingNodeName = null;
        this.bookmarks = [];
        this.dragItem = null;
        this.dragOffset = -1;
        this.selectionBox = null;
        this.actionManager = new ActionManager(this);
        this.selectedItems = [];
        this.eventMap = new Map();

        $svg.attr('data-id', id);

        if (!(this.meta && this.meta.version >= META_VERSION)) {
            throw "No meta object or meta version not supported";
        }

        // Marker for link arrows
        if (true) {
            const marker = __makeSvgElement('marker', {
                id: this.markerId, viewBox: '0 0 10 10',
                refX: 11, refY: 5,
                markerWidth: 6, markerHeight: 6,
                orient: 'auto-start-reverse'
            });
            marker.appendChild(__makeSvgElement('path', { d: 'M 0 0 L 11 5 L 0 10 Z' }));
            svg.appendChild(marker);
        }

        if (options.useBackgroundPattern === true) {
            this.#setBackgroundPattern();
        }

        $svg.on("contextmenu", function (e) {
            let element = document.elementFromPoint(e.pageX, e.pageY);
            if (options.onContextMenu) {
                // TODO: 의미있는 element 인 경우에만 전달하도록 개선하기.
                options.onContextMenu(e, element);
            }
        });

        this.#registerEvent(EVENT_NODE_CLICKED, options.onNodeClicked);
        this.#registerEvent(EVENT_NODE_CREATED, options.onNodeCreated);
        this.#registerEvent(EVENT_NODE_SELECTED, options.onNodeSelected);
        this.#registerEvent(EVENT_NODE_UNSELECTED, options.onNodeUnSelected);

        // Adding Event Listeners
        $svg.off("mousedown").on("mousedown", e => this.#mousedown(e));
        $svg.off("mousemove").on("mousemove", e => this.#mousemove(e));
        $svg.off("mouseup").on("mouseup", e => this.#mouseup(e));
        $svg.off("click").on("click", e => this.#mouseclick(e));

        diagrams.set(id, this);
    }

    #setDefaultOptions(options = {}) {
        options.onContextMenu = options.onContextMenu ?? null;
        options.onNodeClicked = options.onNodeClicked ?? null;
        options.onNodeCreated = options.onNodeCreated ?? null;
        options.useBackgroundPattern = options.useBackgroundPattern ?? false;
        options.lineType = options.lineType ?? "B"; // 'L': StraightLine, 'B': Bezier
        options.moveUnit = options.moveUnit ?? 50;
        options.memoBorderColor = options.memoBorderColor ?? "#E6C700";
        options.memoBorderColorSelected = options.memoBorderColorSelected ?? "red";
        options.memoBackgroundColor = options.memoBackgroundColor ?? "#FFDF6D";
        options.memoFontSize = options.memoFontSize ?? "14px";
        if (!options.memoRemoveConfirm) {
            options.memoRemoveConfirm = () =>
                confirm('Are you sure you want to delete this Memo?');
        }
        return options;
    }

    #registerEvent(eventName, f) {
        if (!f) {
            return;
        }
        let listeners = this.eventMap.get(eventName);
        if (!listeners) {
            this.eventMap.set(eventName, listeners = []);
        }
        listeners.push(f);
    }

    isSelected(item) {
        return this.selectedItems.includes(item);
    }

    appendToSelection(item) {
        this.selectedItems.push(item);
    }

    removeFromSelection(item) {
        let idx = this.selectedItems.findIndex((t) => t === item);
        this.selectedItems.splice(idx, 1);
    }

    clearSelection(excludeItem) {
        let items = [...this.selectedItems];
        items.forEach(function (item) {
            if (item !== excludeItem) {
                item.unselect();
            }
        });
    }

    copy() {
        copy_data = { 'elements': [] };
        this.selectedItems.forEach(function (item) {
            if (item.type === 'B') {
                copy_data.elements.push(item);
            }
        });
    }

    paste() {
        copy_data.elements.forEach(function (item) {
            item = decodeBlock(diagram, item.encode());
            item.setPosition(50, 50, true);
        });
    }

    delete() {
        this.selectedItems.forEach(item => {
            item.remove();
        });
    }

    undo() {
        this.actionManager.undo();
    }

    redo() {
        this.actionManager.redo();
    }

    fireEvent(eventName, ...args) {
        let listeners = this.eventMap.get(eventName);
        listeners?.forEach(f => f(...args));
    }

    /**
     * 
     * @param {*} nodeName : 노드이름
     */
    setCreateMode(nodeName) {
        // CreateMode 를 끄려면 null 설정
        this.creatingNodeName = nodeName;       
    }

    shrink(value) {
        value = value ? parseInt(value) : 100;
        let w = parseInt(getComputedStyle(svg).width);
        let h = parseInt(getComputedStyle(svg).height);
        svg.style.width = w - value;
        svg.style.height = h - value;
    }

    stretch(value) {
        value = value ? parseInt(value) : 100;
        let w = parseInt(getComputedStyle(svg).width);
        let h = parseInt(getComputedStyle(svg).height);
        svg.style.width = w + value;
        svg.style.height = h + value;
    }

    alignVertical(adjustment) {
        // adjustment: L, M, R
        // diagram.selectedItems.forEach(item => console.log(item));
    }

    alignHorizontal(adjustment) {
        // adjustment: T, M, B
    }

    remove() {
        this.$svg.empty();
        this.$svg.unbind();
    }

    selectAll() {
        this.components.forEach(c => c.select());
    }

    unselectAll() {
        this.clearSelection();
    }

    zoomIn() {
        let viewBox = this.svg.getAttribute("viewBox").split(' ');
        viewBox[2] *= 0.9;
        viewBox[3] *= 0.9;
        this.svg.setAttribute("viewBox", viewBox.join(' '));
    }

    zoomOut() {
        let viewBox = this.svg.getAttribute("viewBox").split(' ');
        viewBox[2] *= 1.1;
        viewBox[3] *= 1.1;
        this.svg.setAttribute("viewBox", viewBox.join(' '));
    }

    /**
     * @example
     * @param {string} svgSelector jquery selector for svg element
     * @param {string} xml xml from which new diagram built
     * @returns {object} diagram object
     */
    static deserialize(svgSelector, meta, xml, options) {
        $(svgSelector).empty();

        let diagram = new Diagram(svgSelector, meta, options);
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xml, "text/xml");
        let rootNode = xmlDoc.childNodes[0];
        let node, iterator, maxSeq;

        iterator = __xpathIterator("/scenario/block", rootNode);
        maxSeq = -1;
        while ((node = iterator.iterateNext())) {
            let block = Block.deserialize(diagram, node);
            let seq = parseInt(block.id);
            if (seq != 99999999 && seq > maxSeq) {
                maxSeq = seq;
            }
        }
        diagram.componentSeq = maxSeq + 1;

        iterator = __xpathIterator("/scenario/block", rootNode);
        while ((node = iterator.iterateNext())) {
            let nodeId = parseInt(node.attributes.id.value);
            let iteratorSub = __xpathIterator("choice", node);
            let nodeSub;
            let block = diagram.components.get(String(nodeId));
            while ((nodeSub = iteratorSub.iterateNext())) {
                Link.deserialize(block, nodeSub);
            }
        }

        iterator = __xpathIterator("/scenario/memo", rootNode);
        while ((node = iterator.iterateNext())) {
            Memo.deserialize(diagram, node);
        }

        return diagram;
    }

    static serialize(diagram) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><scenario></scenario>', "text/xml");
        let rootNode = xmlDoc.getRootNode().firstChild;

        let blocks = [];
        let memos = [];
        for (let c of diagram.components.values()) {
            if (c.type === "B") {
                blocks.push(c);
            } else if (c.type === "M") {
                memos.push(c);
            }
        }

        for (let block of blocks) {
            let xmlBlock = xmlDoc.createElement("block");
            rootNode.appendChild(xmlBlock);
            Block.serialize(block, xmlBlock);
        }

        for (let memo of memos) {
            let xmlMemo = xmlDoc.createElement("memo");
            rootNode.appendChild(xmlMemo);
            Memo.serialize(memo, xmlMemo);
        }

        const xsltDoc = new DOMParser().parseFromString(`
            <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                <xsl:strip-space elements="*"/>
                <xsl:template match="para[content-style][not(text())]">
                <xsl:value-of select="normalize-space(.)"/>
                </xsl:template>
                <xsl:template match="node()|@*">
                <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
                </xsl:template>
                <xsl:output indent="yes"/>
            </xsl:stylesheet>
        `, 'application/xml');
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsltDoc);
        const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
        return new XMLSerializer().serializeToString(resultDoc);
    }

    static createEmpty(svgSelector, meta, options) {
        let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Diagram></Diagram>`;
        return Diagram.deserialize(svgSelector, meta, xml, options);
    }

    #setBackgroundPattern() {
        const id = this.id;
        const pattern1Size = 10;
        const pattern2Size = pattern1Size * 10;
        const pattern1Path = __makeSvgElement('path', { d: 'M ' + pattern1Size + ' 0 L 0 0 0 ' + pattern1Size, fill: 'none', stroke: 'rgb(220, 220, 220)', 'stroke-width': 0.5 });
        const pattern1 = __makeSvgElement('pattern', { id: id + '-smallGrid', width: pattern1Size, height: pattern1Size, patternUnits: 'userSpaceOnUse' });
        const pattern2Rect = __makeSvgElement('rect', { width: pattern2Size, height: pattern2Size, fill: 'url(#' + id + '-smallGrid)' });
        const pattern2Path = __makeSvgElement('path', { d: 'M ' + pattern2Size + ' 0 L 0 0 0 ' + pattern2Size, fill: 'none', stroke: 'rgb(220, 220, 220)', 'stroke-width': 1 });
        const pattern2 = __makeSvgElement('pattern', { id: id + '-grid', width: pattern2Size, height: pattern2Size, patternUnits: 'userSpaceOnUse' });
        const defs = __makeSvgElement('defs');
        const finalRect = __makeSvgElement('rect', { width: '100%', height: '100%', fill: 'url(#' + id + '-grid)', style: 'pointer-events: none' });
        pattern1.appendChild(pattern1Path);
        pattern2.appendChild(pattern2Rect);
        pattern2.appendChild(pattern2Path);
        defs.appendChild(pattern1);
        defs.appendChild(pattern2);
        this.svg.appendChild(defs);
        this.svg.appendChild(finalRect);
    }

    #mousedown(e) {
        const offset = __getMousePosition(e);

        if (e.target.classList.contains("draggable")) {
            if (e.buttons === 1) {
                let element = e.target;
                let id = element.getAttributeNS(null, "data-id");
                let c = this.components.get(id);
                if (!this.isSelected(c)) {
                    return;
                }
                this.dragItem = c;

                // 마우스의 위치에서 도형의 좌측상단 x, y 를
                // 빼면 이 도형안에서의 위치가 나온다.
                this.dragOffset = { x: offset.x - c.x, y: offset.y - c.y };
            }
        } else if (e.target == this.svg) {
                this.clearSelection();
                if (e.button === MOUSE_BUTTON_LEFT_MAIN) {
                    let box = __makeSvgElement('rect', {
                        x: offset.x,
                        y: offset.y,
                        "data-init-x": offset.x,
                        "data-init-y": offset.y,
                    }, ["svg-selection"]);
                    this.svg.appendChild(box);
                    this.selectionBox = box;
            }
        }
    }

    #mousemove(e) {
        const offset = __getMousePosition(e);

        let item = this.dragItem;
        if (item) {
            e.preventDefault();
            // clientX, clientY: screen coordinate 임.
            // let dragX = e.clientX;
            // let dragY = e.clientY;
            // selectedElement.setAttributeNS(null, "x", dragX);
            // selectedElement.setAttributeNS(null, "y", dragY);
            // console.log(`drag(): dragX=${dragX}, dragY=${dragY}`);

            let oldX = item.x;
            let oldY = item.y;
            let newX = offset.x - this.dragOffset.x;
            let newY = offset.y - this.dragOffset.y;
            let byX = newX - oldX;
            let byY = newY - oldY;

            this.selectedItems.forEach(m => {
                if ((m.type === 'B' || m.type === 'M')) {
                    m.setPosition(byX, byY, true);
                }
            });
        } else if (this.selectionBox) {
            if (!(e.buttons > 0 && e.button === MOUSE_BUTTON_LEFT_MAIN)) {
                // SelectionBox 를 사용중에 SVG 영역을 벗어났다가
                // 다시 들어오는 경우, SVG 영역 밖에서 마우스를 뗀 경우
                // mouseup 이벤트는 발생하지 않기 때문에 SelectionBox 해제를
                // 하지 못하는 경우가 생기기 때문에 여기서 추가 체크한다.
                // (주의)
                // ==> e.button 뿐만 아니라 e.buttons 도 체크하도록 한다.
                // ==> e.button 은 버튼이 해제될 때는 값이 초기화되지 않는다.
                let box = this.selectionBox;
                this.svg.removeChild(box);
                this.selectionBox = null;
                return;
            }
            let box = this.selectionBox;
            let x = parseInt(box.getAttributeNS(null, "data-init-x"));
            let y = parseInt(box.getAttributeNS(null, "data-init-y"));
            let w, h;

            if (offset.x < x) {
                w = x - offset.x;
                x = offset.x;
            } else {
                w = offset.x - x;
            }

            if (offset.y < y) {
                h = y - offset.y;
                y = offset.y;
            } else {
                h = offset.y - y;
            }

            __setSvgAttrs(box, {
                x: x,
                y: y,
                width: w,
                height: h
            });

            let nodeList = this.svg.getIntersectionList(box.getBBox(), null);
            let selected = this.selectedItems;
            let selecting = [];

            for (let n = 0; n < nodeList.length; n++) {
                let node = nodeList.item(n);
                let id = node.getAttributeNS(null, "data-id");
                if (id) {
                    selecting.push(this.components.get(id));
                }
            }
            // 각 Component 에 대해 select() 가 수행되기 전에 Unselect 할 목록을 얻어옴.
            let unselecting = selected.filter(t => !selecting.includes(t));
            for (let c of unselecting) {
                c.unselect();
            }
            for (let c of selecting) {
                c.select();
            }
        } else if (this.creatingLinkOrigin) {
            let line = this.creatingLinkLine;
            let lx = line.getAttributeNS(null, 'x1');
            let ly = line.getAttributeNS(null, 'y1');
            line.setAttributeNS(null, 'x2', offset.x);
            line.setAttributeNS(null, 'y2', offset.y);
            let distance = Math.sqrt((offset.x - lx) ** 2 + (offset.y - ly) ** 2);
            if (distance > 15) {
                line.setAttributeNS(null, "marker-end", `url(#${this.markerId})`);
            } else {
                line.setAttributeNS(null, "marker-end", "");
            }
        } 
    }

    #mouseup(e) {
        if (this.dragItem) {
            this.dragItem = null;
        }
        if (this.selectionBox) {
            let box = this.selectionBox;
            this.svg.removeChild(box);
            this.selectionBox = null;
        }
        let anchor = this.creatingLinkOrigin;
        let line = this.creatingLinkLine;
        if (line) {
            anchor.setVisible(false);
            this.creatingLinkOrigin = null;
            this.creatingLinkLine = null;
            this.svg.removeChild(line);
        }
    }

    #mouseclick(e) {
        let nodeName = this.creatingNodeName;
        this.creatingNodeName = null;
        if (nodeName) {
            if (nodeName === "[MEMO]") {
                let offset = __getMousePosition(e);
                new Memo(this,
                    this.componentSeq++,
                    offset.x,
                    offset.y,
                    300,
                    300,
                    "",
                    false);
            } else {
                let nodeInfo = this.meta.nodes[nodeName];
                if (!nodeInfo) {
                    throw "Invalid node name: " + nodeName;
                }
                let offset = __getMousePosition(e);
                Block.createInstance(this,
                    this.componentSeq++,
                    nodeInfo.shape || DEFAULT_SHAPE,
                    nodeInfo.icon.substring(6),
                    nodeName,
                    nodeInfo.displayName,
                    offset.x,
                    offset.y,
                    null,
                    null,
                    null,
                    e
                );
            }
        }        
    }
}

class ActionManager {
    constructor(diagram) {
        this.diagram = diagram;
        this.actions = [];
        this.action_max = 32;
        this.actionSave = true;
    }

    reset() {
        this.actions.splice(0, actions.length); // clear const array
    }

    append(op, data) {
        if (!this.actionSave) {
            return;
        }
        if (this.actions.length >= this.action_max) {
            this.actions.splice(0, 1);
        }
        let item = { 'op': op, 'data': data };
        this.actions.push(item);
    }

    undo() {
        this.actionSave = false;
        try {
            if (this.actions.length <= 0) {
                return;
            }
            let item = this.actions.pop(); // remove last item
            let op = item.op;
            let data = item.data;
            if (op === 'add-block') {
                let block = data.block;
                block.remove();
            } else if (op === 'add-link') {
                let link = data.link;
                link.remove();
            } else if (op === 'add-memo') {
                let memo = data.memo;
                memo.remove();
            } else if (op === 'remove-block') {
                let block = data;
                Block.createInstance(
                    this.diagram,
                    block.id,
                    block.shape,
                    block.icon,
                    block.metaName,
                    block.caption,
                    block.x,
                    block.y,
                    null);
            } else if (op === 'remove-link') {
                //linkDecodeFromJSON(diagram, data);
            } else if (op === 'remove-memo') {
                //memoDecodeFromJSON(diagram, data['memo-encoded']);
            }
        } finally {
            this.actionSave = true;
        }
    }

    redo() {
        this.actionSave = false;
        try {
            if (this.actions.length <= 0) {
                return;
            }
        } finally {
            this.actionSave = true;
        }
    }
}

/**
 * UIComponent
 */
class UIComponent {
    /**
     * @example
     * @param {Diagram} diagram
     * @param {string} type
     * @param {number} seq
     */
    constructor(diagram, type, seq) {
        this.diagram = diagram;
        this.type = type;
        this.seq = seq;
        this.id = String(seq);
        this.svg = diagram.svg;
        this.selected = false;

        if (diagram.components.get(this.id)) {
            throw "Component already exists: " + this.id;
        }
        diagram.components.set(this.id, this);
    }

    setPosition(newX, newY, isRelative) {
        if (isRelative) {
            newX += this.x;
            newY += this.y;
        }

        // 다수의 객체들을 움직이기 위해서는 transform 을 사용하거나
        // 또는 SVG Group 을 사용하는 것도 고려해 보는 것이 좋겠음.
        let moveUnit = this.diagram.options.moveUnit;
        let remainX = newX % moveUnit;
        let remainY = newY % moveUnit;
        newX = remainX > moveUnit / 2 ? newX + moveUnit - remainX : newX - remainX;
        newY = remainY > moveUnit / 2 ? newY + moveUnit - remainY : newY - remainY;
        let relX = newX - this.x;
        let relY = newY - this.y;
        this.x = newX;
        this.y = newY;
        this.movePosition(relX, relY, newX, newY);
    }

    movePosition(relX, reY, newX, newY) {
        throw new Error("Abstract method");
    }

    select() {
        throw new Error("Abstract method");
    }

    unselect() {
        throw new Error("Abstract method");
    }

    toggleSelect() {
        if (this.selected) {
            this.unselect();
        } else {
            this.select();
        }
    }

    remove() {
        throw new Error("Abstract method");
    }
}

/**
 * @example
 * @param {object} block block object
 * @param {string} position anchor position on block ('T', 'B', 'L', 'R')
 * @param {number} x anchor x position
 * @param {number} y anchor y position
 * @returns {object} svg element
 */
class AnchorGroup {
    constructor(diagram) {
        this.diagram = diagram;
        this.svg = diagram.svg;
        this.anchors = {};
    }

    add(block, positionKey, cx, cy) {
        let anchor = new Anchor(
            this.diagram,
            block,
            positionKey,
            cx,
            cy);
        this.anchors[positionKey] = anchor;
        this.svg.appendChild(anchor.element);
    }

    get(positionKey) {
        return this.anchors[positionKey];
    }

    setVisible(isVisible) {
        for (let anchor of Object.values(this.anchors)) {
            anchor.setVisible(isVisible);
        }
    }

    movePosition(relX, relY) {
        for (let anchor of Object.values(this.anchors)) {
            anchor.movePosition(relX, relY);
        }
    }

    remove() {
        for (let anchor of Object.values(this.anchors)) {
            this.svg.removeChild(anchor.element);
        }
    }
}

/**
 * @example
 * @param {object} block block object
 * @param {string} position anchor position on block ('T', 'B', 'L', 'R')
 * @param {number} x anchor x position
 * @param {number} y anchor y position
 * @returns {object} svg element
 */
class Anchor {
    constructor(diagram, block, position, x, y) {
        this.element = __makeSvgElement("circle", {
            cx: x,
            cy: y,
            r: 8,
            "stroke-width": 1,
            "data-pos": position, // for debuging purposes
            "stroke": "rgb(100, 100, 100)",
            "fill": "rgb(100, 100, 100)",
        }, []);

        this.setVisible(false);

        this.diagram = diagram;
        this.block = block;
        this.position = position;
        this.x = x;
        this.y = y;

        this.element.addEventListener("mouseenter", e => this.#mouseenter(e));
        this.element.addEventListener("mousedown", e => this.#mousedown(e));
        this.element.addEventListener("mouseup", e => this.#mouseup(e));
        this.element.addEventListener("mouseleave", e => this.#mouseleave(e));
    }

    movePosition(relX, relY) {
        let newX = this.x + relX;
        let newY = this.y + relY;
        __setSvgAttrs(this.element, { cx: newX, cy: newY });
        this.x = newX;
        this.y = newY;
    }

    setHover() {
        __setSvgAttrs(this.element, {
            "fill-opacity": "0.4",
            "stroke-opacity": "0.6",
            "cursor": "crosshair",
        });
    }

    setVisible(isVisible) {
        if (isVisible) {
            __setSvgAttrs(this.element, {
                "fill-opacity": "0.0",
                "stroke-opacity": "0.7",
                "cursor": "",
            });
        } else {
            __setSvgAttrs(this.element, {
                "fill-opacity": "0.0",
                "stroke-opacity": "0.0",
                "cursor": "",
            });
        }
    }

    #mouseenter(e) {
        let diagram = this.diagram;
        let element = this.element;
        if (diagram.selectionBox) {
            return;
        }
        this.setHover();
        e.stopPropagation();
    }

    #mousedown(e) {
        let diagram = this.diagram;
        const line = __makeSvgElement('line', {
            x1: this.x,
            y1: this.y,
            x2: this.x,
            y2: this.y,
            stroke: "gray",
            "stroke-dasharray": "5 2",
            "stroke-width": 2,
            "stroke-opacity": 0.9,
            "pointer-events": "none"
        }, []);
        diagram.svg.appendChild(line);
        e.stopPropagation();
        diagram.creatingLinkOrigin = this;
        diagram.creatingLinkLine = line;
    }

    #mouseup(e) {
        let diagram = this.diagram;
        if (!diagram.creatingLinkOrigin) {
            return;
        }
        let start = diagram.creatingLinkOrigin;
        let line = diagram.creatingLinkLine;
        diagram.creatingLinkOrigin.setVisible(false);
        diagram.svg.removeChild(line);

        if (diagram.creatingLinkOrigin !== this) {
            new Link(diagram, diagram.componentSeq++,
                "ok",
                start.block, this.block,
                start.position, this.position);
        }

        diagram.creatingLinkOrigin = null;
        diagram.creatingLinkLine = null;
        e.stopPropagation();
    }

    #mouseleave(e) {
        let diagram = this.diagram;
        let element = this.element;
        if (diagram.selectionBox) {
            return;
        }
        if (diagram.creatingLinkOrigin !== this) {
            this.setVisible(false);
        }
        e.stopPropagation();
    }
};

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} shape block shape [Rectangle, Diamond, Circle, Memo]
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class Block extends UIComponent {
    static createInstance(diagram, seq, shape, icon, metaName, caption, x, y, w, h, userData, evt) {
        let block = null;
        if (shape === "Rectangle") {
            block = new RectangleBlock(diagram, seq, icon, metaName, caption, x, y, w, h, userData);
        } else if (shape === "Circle") {
            block = new CircleBlock(diagram, seq, icon, metaName, caption, x, y, w, h, userData);
        } else if (shape === "Diamond") {
            block = new DiamondBlock(diagram, seq, icon, metaName, caption, x, y, w, h, userData);
        } else {
            throw "Invalid shape: " + shape;
        }

        if (evt) {
            diagram.fireEvent(EVENT_NODE_CREATED, block, evt);
        }
        return block;
    }

    constructor(diagram, seq, icon, metaName, caption, x, y, w, h, userData) {
        super(diagram, "B", seq);
        this.icon = icon;
        this.metaName = metaName;
        this.caption = caption;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.links = new Map();
        this.userData = userData;

        diagram.actionManager.append('add-block', this);
    }

    setPosition(newX, newY, isRelative) {
        super.setPosition(newX, newY, isRelative);
        this.links.forEach(link => link.adjustPoints());
    }

    select() {
        if (!this.selected) {
            this.shapeElement.classList.add("hd-block-selected");
            this.selected = true;
            this.diagram.appendToSelection(this);
            this.diagram.fireEvent(EVENT_NODE_SELECTED, this, "nodeSelected");
        }
    }

    unselect() {
        if (this.selected) {
            this.shapeElement.classList.remove("hd-block-selected");
            this.selected = false;
            this.diagram.fireEvent(EVENT_NODE_UNSELECTED, this, "nodeUnSelected");
            this.diagram.removeFromSelection(this);
        }
    }

    remove() {
        this.svg.removeChild(this.shapeElement);
        this.svg.removeChild(this.iconElement);
        this.svg.removeChild(this.textElement);
        this.anchors.remove();
        for (let c of this.links.values()) {
            c.remove();
        }
        this.diagram.components.delete(this.id);
        this.diagram.actionManager.append('remove-block', this);
    }

    #mouseclick(e) {
        // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
        if (!e.shiftKey) {
            this.diagram.clearSelection(this);
                }
            this.select();
    }

    #mouseenter(e) {
        if (this.diagram.selectionBox) {
            return;
        }
        this.anchors.setVisible(true);
    }

    #mouseleave(e) {
        if (this.diagram.selectionBox) {
            return;
        }
        this.anchors.setVisible(false);
    }

    initialize() {
        this.shapeElement.addEventListener("mouseenter", e => this.#mouseenter(e));
        this.shapeElement.addEventListener("mouseleave", e => this.#mouseleave(e));
        this.shapeElement.addEventListener("click", e => this.#mouseclick(e));
        this.movePosition(0, 0, this.x, this.y);
    }

    static serialize(block, node) {
        // <block id="00000000" desc="이벤트 캐치" meta-name="CatchNode">
        //     <catch>
        //      <user-comment>코멘트입니다.2</user-comment>
        //      <event>error</event>
        //      <target-page>(NotImplemented)</target-page>
        //      <target-block/>
        //      <multi-call>False</multi-call>
        //     </catch>
        //     <svg>
        //      <bounds>150,30,75,70</bounds>
        //      <selected>false</selected>
        //     </svg>
        //     <choice event="ok" target="00000001" svg-origin-anchor="2" svg-dest-anchor="0" svg-selected="false"/>
        // </block>
        let xmlDoc = node.ownerDocument;
        __setXmlAttribute("id", ("00000000" + block.id).slice(-8), node);
        __setXmlAttribute("desc", block.caption, node);
        __setXmlAttribute("meta-name", block.metaName, node);

        let xmlSvg = xmlDoc.createElementNS(null, "svg");
        let xmlBounds = xmlDoc.createElement("bounds");
        let xmlSelected = xmlDoc.createElement("selected");
        xmlBounds.textContent = `${block.x},${block.y},${block.w},${block.h}`;
        xmlSelected.textContent = String(block.selected);
        xmlSvg.appendChild(xmlBounds);
        xmlSvg.appendChild(xmlSelected);

        node.appendChild(block.userData);
        node.appendChild(xmlSvg);

        for (let link of block.links.values()) {
            if (link.blockDest !== block) {
                Link.serialize(link, node);
            }
        }
    }

    static deserialize(diagram, node) {
        let id = parseInt(node.attributes.id.value);
        let desc = node.attributes.desc.value;
        let metaName = node.attributes["meta-name"].value;
        let nodeDef = diagram.meta.nodes[metaName];
        let svgNode = __firstChild("svg", node);
        let bounds = __firstChild("bounds", svgNode).textContent;
        let [x, y, w, h] = bounds.split(",");
        let selected = __parseBoolean(__firstChild("selected", svgNode).textContent);
        let userData = __firstChild(nodeDef.buildTag, node);

        let block = Block.createInstance(
            diagram,
            id,
            nodeDef.shape || "Rectangle",
            nodeDef.icon,
            metaName,
            desc,
            parseInt(x),
            parseInt(y),
            parseInt(w),
            parseInt(h),
            userData,
            null
        );

        if (selected) {
            block.select();
        }
        return block;
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class RectangleBlock extends Block {
    constructor(diagram, seq, icon, metaName, caption, x, y, w, h, userData) {
        super(diagram, seq, icon, metaName, caption, x, y,
            w || BLOCK_RECT_DEFAULT_WIDTH, h || BLOCK_RECT_DEFAULT_HEIGHT, userData);

        const svg = diagram.svg;
        this.shape = "Rectangle";
        this.iconOffset = this.w * 0.05;
        this.iconSize = Math.min(32, Math.min(this.w, this.h) - (this.iconOffset * 2));

        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            rx: Math.min(this.w, this.h) * 0.1,
            width: this.w,
            height: this.h
        }, ["hd-block", "draggable"]);

        this.iconElement = __makeSvgElement("image", {
            href: 'images/' + icon,
            width: this.iconSize,
            height: this.iconSize,
            style: "pointer-events: none",
        });

        this.textElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.textElement);

        this.anchors = new AnchorGroup(diagram);
        this.anchors.add(this, "L", x, y + (this.h / 2));
        this.anchors.add(this, "R", x + this.w, y + (this.h / 2));
        this.anchors.add(this, "T", x + (this.w / 2), y);
        this.anchors.add(this, "B", x + (this.w / 2), y + this.h);

        this.initialize();
    }

    movePosition(relX, relY, newX, newY) {
        this.shapeElement.setAttributeNS(null, 'x', newX);
        this.shapeElement.setAttributeNS(null, 'y', newY);
        this.iconElement.setAttributeNS(null, 'x', newX + this.iconOffset);
        this.iconElement.setAttributeNS(null, 'y', newY + this.iconOffset);
        this.textElement.setAttributeNS(null, 'x', newX);
        this.textElement.setAttributeNS(null, 'y', newY);
        this.anchors.movePosition(relX, relY);
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class CircleBlock extends Block {
    constructor(diagram, seq, icon, metaName, caption, x, y, w, h, userData) {
        super(diagram, seq, icon, metaName, caption, x, y,
            w || BLOCK_CIRCLE_RADIUS * 2, h || BLOCK_CIRCLE_RADIUS * 2, userData);

        const svg = diagram.svg;
        this.shape = "Circle";
        this.radius = this.w / 2;
        this.iconSize = this.radius * 0.9;

        this.shapeElement = __makeSvgElement("circle", {
            "data-id": this.id,
            "cx": x + this.radius,
            "cy": y + this.radius,
            "r": this.radius,
        }, ["hd-block", "draggable"]);

        this.iconElement = __makeSvgElement("image", {
            "href": "images/" + icon,
            "width": this.iconSize,
            "height": this.iconSize,
            style: "pointer-events: none",
        });

        this.textElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.textElement);

        this.anchors = new AnchorGroup(diagram);
        this.anchors.add(this, "L", x, y + (this.h / 2));
        this.anchors.add(this, "R", x + this.w, y + (this.h / 2));
        this.anchors.add(this, "T", x + (this.w / 2), y);
        this.anchors.add(this, "B", x + (this.w / 2), y + this.h);

        this.initialize();
    }

    movePosition(relX, relY, newX, newY) {
        let r = this.w / 2;
        this.shapeElement.setAttributeNS(null, "cx", newX + r);
        this.shapeElement.setAttributeNS(null, "cy", newY + r);
        this.iconElement.setAttributeNS(null, 'x', newX + (this.w - this.iconSize) / 2);
        this.iconElement.setAttributeNS(null, 'y', newY);
        this.textElement.setAttributeNS(null, 'x', newX);
        this.textElement.setAttributeNS(null, 'y', newY);
        this.anchors.movePosition(relX, relY);
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class DiamondBlock extends Block {
    constructor(diagram, seq, icon, metaName, caption, x, y, w, h, userData) {
        super(diagram, seq, icon, metaName, caption, x, y,
            w || BLOCK_DIAMOND_DEFAULT_RADIUS * 2, h || BLOCK_DIAMOND_DEFAULT_RADIUS * 2, userData);

        const svg = diagram.svg;
        this.shape = "Diamond";
        this.radius = this.w / 2;
        this.iconSize = this.radius * 0.8;
        let xo = x + this.radius;
        let yo = y + this.radius;
        let pp = [`${x} ${yo}`, `${xo} ${y}`, `${xo + this.radius} ${yo}`, `${xo} ${yo + this.radius}`];

        this.shapeElement = __makeSvgElement("polygon", {
            "data-id": this.id,
        }, ["hd-block", "draggable"]);

        this.iconElement = __makeSvgElement("image", {
            "href": "images/" + icon,
            "width": this.iconSize,
            "height": this.iconSize,
            style: "pointer-events: none",
        });

        this.textElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.textElement);

        this.anchors = new AnchorGroup(diagram);
        this.anchors.add(this, "L", x, y + (this.h / 2));
        this.anchors.add(this, "R", x + this.w, y + (this.h / 2));
        this.anchors.add(this, "T", x + (this.w / 2), y);
        this.anchors.add(this, "B", x + (this.w / 2), y + this.h);

        this.initialize();
    }

    movePosition(relX, relY, newX, newY) {
        let xo = newX + this.radius;
        let yo = newY + this.radius;
        let pp = [`${newX} ${yo}`, `${xo} ${newY}`, `${xo + this.radius} ${yo}`, `${xo} ${yo + this.radius}`];
        this.shapeElement.setAttributeNS(null, "points", pp.join(","));
        this.iconElement.setAttributeNS(null, "x", newX + (this.w - this.iconSize) / 2);
        this.iconElement.setAttributeNS(null, "y", newY);
        this.textElement.setAttributeNS(null, "x", newX);
        this.textElement.setAttributeNS(null, "y", newY);
        this.anchors.movePosition(relX, relY);
    }
}

/**
 * @example
 * @param {object} block block object
 * @param {string} position anchor position on block ('T', 'B', 'L', 'R')
 * @param {number} x anchor x position
 * @param {number} y anchor y position
 * @returns {object} svg element
 */
class Link extends UIComponent {
    constructor(diagram, seq, caption, blockOrigin, blockDest, posOrigin, posDest, selected) {
        super(diagram, "L", seq);

        this.caption = caption;
        this.blockOrigin = blockOrigin;
        this.blockDest = blockDest;
        this.posOrigin = posOrigin;
        this.posDest = posDest;
        this.anchorFrom = blockOrigin.anchors.get(posOrigin);
        this.anchorTo = blockDest.anchors.get(posDest);
        this.lineType = diagram.options.lineType;

        if (diagram !== this.anchorTo.diagram) {
            throw "diagram not matched";
        }

        this.shapeElement = __makeSvgElement("path", {
            "data-id": this.id,
            "marker-end": `url(#${diagram.markerId})`,
            "cursor": "pointer"
        }, ["hd-link"]);

        this.textElement = __makeSvgElement("text", {
            "font-size": 15,
            "cursor": "pointer"
        }, ["hd-link-text", "svg-text"]);

        const inner_text = document.createTextNode(caption);
        this.textElement.appendChild(inner_text);

        this.svg.appendChild(this.shapeElement);
        this.svg.appendChild(this.textElement);
        this.adjustPoints();
        
        this.shapeElement.addEventListener("click", e => this.#mouseclick(e));
        this.shapeElement.addEventListener("dblclick", e => this.#mousedblclick(e));
        this.textElement.addEventListener("click", e => this.#mouseclick(e));
        this.textElement.addEventListener("dblclick", e => this.#mousedblclick(e));

        blockOrigin.links.set(this.id, this);
        blockDest.links.set(this.id, this);

        diagram.actionManager.append("add-link", this);

        if (selected) {
            this.select();
        }
    }

    select() {
        if (!this.selected) {
            this.shapeElement.classList.remove('hd-link');
            this.shapeElement.classList.add('hd-link-selected');
            this.textElement.classList.remove('hd-link-text');
            this.textElement.classList.add('hd-link-text-selected');
            this.selected = true;
            this.diagram.appendToSelection(this);
        }
    }

    unselect() {
        if (this.selected) {
            this.shapeElement.classList.remove('hd-link-selected');
            this.shapeElement.classList.add('hd-link');
            this.textElement.classList.remove('hd-link-text-selected');
            this.textElement.classList.add('hd-link-text');
            this.selected = false;
            this.diagram.removeFromSelection(this);
        }
    }

    remove() {
        try {
            this.svg.removeChild(this.shapeElement);
        } catch (e) {
        }
        try {
            this.svg.removeChild(this.textElement);
        } catch (e) {
        }
        this.diagram.components.delete(this.id);
        this.diagram.actionManager.append('remove-link', this);
    }

    /**
     * #makeArcPath
     */
    static #makeArcPath(pta, ptb, ptc, r) {
        // arcs: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        //       rx: x 축 반지름 
        //       ry: y 축 반지름
        //       x-axis-rotation: x 축으로 돌리기 (사용안함) 
        //       sweep-flag: 1 이면 시계방향, 0 이면 반시계방향으로 그리기.
        //       large-arc-flag: 더 큰 원을 사용하기.
        // https://www.nan.fyi/svg-paths/arcs
        let { x: ax, y: ay } = pta;
        let { x: bx, y: by } = ptb;
        let { x: cx, y: cy } = ptc;
        let ptaX, ptaY, ptcX, ptcY, clockwise = 0;

        if (ax === bx) {
            if (ay < by) {
                ptaX = bx, ptaY = by - r;
                if (ptaY < ay) {
                    return null;
                }
                if (bx < cx) { // Down-Right
                    ptcX = bx + r, ptcY = by;
                    if (ptcX > cx) {
                        return null;
                    }
                } else if (bx === cx) {
                    return null; // abc 가 모두 동일한 세로선에 있음.
                } else { // Down-Left
                    ptcX = bx - r, ptcY = by;
                    if (ptcX < cx) {
                        return null;
                    }
                    clockwise = 1;
                }
            } else if (ay === by) {
                return null; // ab 가 동일한 점임
            } else {
                ptaX = bx, ptaY = by + r;
                if (ptaY > ay) {
                    return null;
                }
                if (bx < cx) { // Up-Right
                    ptcX = bx + r, ptcY = by;
                    if (cx < ptcX) {
                        return null;
                    }
                    clockwise = 1;
                } else if (bx === cx) {
                    return null; // abc 가 모두 동일한 세로선에 있음.
                } else { // Up-Left
                    ptcX = bx - r, ptcY = by;
                    if (ptcX < cx) {
                        return null;
                    }
                }
            }
        } else if (ax < bx) {
            ptaX = bx - r, ptaY = by;
            if (ptaX < ax) {
                return null;
            }
            if (by < cy) { // Right-Down
                ptcX = bx, ptcY = by + r;
                if (ptcY < cy) {
                    return null;
                }
                clockwise = 1;
            } else if (by === cy) {
                return null; // abc 가 모두 동일한 가로선에 있음.
            } else { // Right-Up
                ptcX = bx, ptcY = by - r;
                if (ptcY < cy) {
                    return null;
                }
            }
        } else {
            ptaX = bx + r, ptaY = by;
            if (ptaX > ax) {
                return null;
            }
            if (by < cy) { // Left-Down
                ptcX = bx, ptcY = by + r;
                if (ptcY > cy) {
                    return null;
                }
            } else if (by === cy) {
                return null; // abc 가 모두 동일한 가로선에 있음.
            } else { // Left-Up
                ptcX = bx, ptcY = by - r;
                if (ptcY < cy) {
                    return null;
                }
                clockwise = 1;
            }
        }
        let arc = `A${r} ${r} 0 0 ${clockwise} ${ptcX} ${ptcY}`;
        return { x: ptaX, y: ptaY, arc: arc };
    }

    static #makeRoundedPath(points) {
        if (points.length < 3) {
            throw "invalid points";
        }
        const r = 10;
        const path = [];
        const useSharp = true;
        let start = points[0];
        let last = points[points.length - 1];

        path.push(`M${start.x} ${start.y}`);
        if (useSharp) {
            for (let n = 1; n < points.length; n++) {
                let pt = points[n];
                path.push(`L${pt.x} ${pt.y}`);
            }
        } else {
            let arcs = [];
            for (let n = 0; n < points.length - 2; n++) {
                let pt0 = points[n];
                let pt1 = points[n + 1];
                let pt2 = points[n + 2];
                let result = Link.#makeArcPath(pt0, pt1, pt2, r);
                result = false;
                if (result) {
                    arcs.push([`L${result.x} ${result.y}`, result.arc]);
                } else {
                    arcs.push(null);
                }
            }
            path.push(`L${last[0]} ${last[1]}`);
        }
        return path.join(" ");
    }

    static #calcAdjacentPoint(min, anchor) {
        if (anchor.position === 'L') {
            return { x: anchor.x - min, y: anchor.y };
        } else if (anchor.position === 'R') {
            return { x: anchor.x + min, y: anchor.y };
        } else if (anchor.position === 'T') {
            return { x: anchor.x, y: anchor.y - min };
        } else {
            return { x: anchor.x, y: anchor.y + min };
        }
    }

    #mouseclick(e) {
        // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
        if (!e.shiftKey) {
            this.diagram.clearSelection(this);
        }
        this.select();
    }

    #mousedblclick(e) {
        let block = this.blockOrigin;
        let meta = this.diagram.meta;

        // 1) Meta 의 Node 정보에서 Link 에 대한 Description 을 찾는다.
        let nodeDef = meta.nodes[block.metaName];
        let linkDef = nodeDef.links.filter(o => o.name === this.caption)[0];
        let desc = linkDef?.description;

        // 2) 없다면 Meta 의 Global Descprion 정보에서 찾는다.
        if (!desc) { // undefined or ''
            desc = meta.descriptions.link[this.caption];
        }
        console.log("mousedblclick", this.caption, desc);
        if (desc) {
            alert(desc);
        }
    }

    adjustPoints() {
        let startX = this.anchorFrom.x;
        let startY = this.anchorFrom.y;
        let endX = this.anchorTo.x;
        let endY = this.anchorTo.y;
        let min = this.lineType == "B" ? 80 : 40;
        let distance = Math.sqrt(((endX - startX) ** 2) + ((endY - startY) ** 2));
        let textStartX, textStartY, textEndX, textEndY, points;

        if (distance < min * 2) {
            // min*2 보다 작다면 너무 짧아서 lineType 에 상관없이 직선을 사용.
            textStartX = startX;
            textStartY = startY;
            textEndX = endX;
            textEndY = endY;
            points = `M${startX} ${startY} L${endX} ${endY}`;
        } else {
            let adj1 = Link.#calcAdjacentPoint(min, this.anchorFrom);
            let adj2 = Link.#calcAdjacentPoint(min, this.anchorTo);
            if (this.lineType === 'L') {
                let pt = [
                    { x: startX, y: startY },
                    { x: adj1.x, y: adj1.y },
                    { x: adj2.x, y: adj1.y },
                    { x: adj2.x, y: adj2.y },
                    { x: endX, y: endY }];
                points = Link.#makeRoundedPath(pt);
            } else if (this.lineType === 'B') {
                points = `M${startX} ${startY} C${adj1.x} ${adj1.y} ${adj2.x} ${adj2.y} ${endX} ${endY}`;
            } else {
                points = `M${startX} ${startY} L${adj1.x} ${adj1.y} L${adj2.x} ${adj2.y} L${endX} ${endY}`;
            }
            textStartX = adj1.x;
            textStartY = adj1.y;
            textEndX = adj2.x;
            textEndY = adj2.y;
        }
        // 아래의 stroke-linejoin 은 storke 가 두꺼울 때만 의미가 있다. 
        // 필요한 Rounded corners 효과는 불가능하다.
        // this.shapeElement.setAttribute("stroke-linejoin", "round");
        this.shapeElement.setAttribute('d', points);
        let textX = textStartX + (textEndX - textStartX) / 2;
        let textY = textStartY + (textEndY - textStartY) / 2;
        this.textElement.setAttribute('x', textX);
        this.textElement.setAttribute('y', textY);
    }

    static serialize(link, node) {
        // <choice event="ok" target="00000001" svg-origin-anchor="2" svg-dest-anchor="0" svg-selected="false"/>
        let xmlDoc = node.ownerDocument;
        let xmlChoice = xmlDoc.createElement("choice");
        __setXmlAttribute("event", link.caption, xmlChoice);
        __setXmlAttribute("target", ("00000000" + link.blockDest.id).slice(-8), xmlChoice);
        __setXmlAttribute("svg-origin-anchor", convertAnchorPosition2(link.posOrigin), xmlChoice);
        __setXmlAttribute("svg-dest-anchor", convertAnchorPosition2(link.posDest), xmlChoice);
        __setXmlAttribute("svg-selected", String(link.selected), xmlChoice);
        node.appendChild(xmlChoice);
    }

    static deserialize(block, node) {
        let diagram = block.diagram;
        let event = node.attributes.event.value;
        let target = parseInt(node.attributes.target.value);
        let svgOriginAnchor = node.attributes["svg-origin-anchor"].value;
        let svgDestAnchor = node.attributes["svg-dest-anchor"].value;
        let svgSelected = __parseBoolean(node.attributes["svg-selected"].value);
        return new Link(diagram,
            diagram.componentSeq++,
            event,
            block,
            diagram.components.get(String(target)),
            convertAnchorPosition(svgOriginAnchor),
            convertAnchorPosition(svgDestAnchor),
            svgSelected
        );
    }
}

/**
 * Memo
 */
class Memo extends UIComponent {
    /**
     * @example
     * @param {Diagram} diagram
     * @param {number} seq
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} text
     * @param {boolean} selected
     * @returns {object} memo object
     */
    constructor(diagram, seq, x, y, w, h, text, selected) {
        super(diagram, "M", seq);

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.selected = false;
        this.shapePadding = 2;

        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            x, y, width: w, height: h,
            // 이것은 style 속성에 넣지 않는다. class 보다 우선하기 때문에 제어가 되지 않는다.
            stroke: diagram.options.memoBorderColor, "stroke-width": 1,
            style: `fill: ${diagram.options.memoBackgroundColor}; padding: ${this.shapePadding}px`
        }, ["draggable"]);

        this.textElement = __makeSvgElement("foreignObject", {
            x: x + this.shapePadding,
            y: y + this.shapePadding,
            width: w - (this.shapePadding * 2),
            height: h - (this.shapePadding * 2),
            style: "pointer-events: none"
        }, []);

        this.textArea = document.createElement("div");

        let textArea = this.textArea;
        textArea.className = "svg-text";
        textArea.contentEditable = false;
        textArea.style.cssText = `white-space: pre; width: 100%; height: 100%; padding: 5px;
                font-size: ${diagram.options.memoFontSize};`;
        textArea.style.overflow = "auto";
        textArea.style.pointerEvents = "none";
        textArea.innerHTML = text;
        this.textElement.appendChild(textArea);

        textArea.addEventListener("focusout", e => {
            textArea.classList.add("svg-text");
            textArea.contentEditable = false;
            textArea.style.pointerEvents = "none";
        });

        this.shapeElement.addEventListener("click", e => this.#mouseclick(e));
        this.shapeElement.addEventListener("dblclick", e => this.#mousedblclick(e));

        this.svg.appendChild(this.shapeElement);
        this.svg.appendChild(this.textElement);

        if (selected) {
            this.select();
        }

        diagram.actionManager.append("add-memo", this);
    }

    select() {
        let options = this.diagram.options;
        if (!this.selected) {
            __setSvgAttrs(this.shapeElement, {
                stroke: options.memoBorderColorSelected, "stroke-width": 3
            });
            this.selected = true;
            this.diagram.appendToSelection(this);
        }
    }

    unselect() {
        let options = this.diagram.options;
        if (this.selected) {
            __setSvgAttrs(this.shapeElement, {
                stroke: options.memoBorderColor, "stroke-width": 1
            });
            this.selected = false;
            this.diagram.removeFromSelection(this);
        }
    }

    remove() {
        let options = this.diagram.options;
        if (!options.memoRemoveConfirm || options.memoRemoveConfirm()) {
            this.svg.removeChild(this.shapeElement);
            this.svg.removeChild(this.textElement);
            this.diagram.components.delete(this.id);
            this.diagram.actionManager.append('remove-memo', this);
        }
    }

    movePosition(relX, relY, newX, newY) {
        this.shapeElement.setAttributeNS(null, 'x', newX);
        this.shapeElement.setAttributeNS(null, 'y', newY);
        this.textElement.setAttributeNS(null, 'x', newX + this.shapePadding);
        this.textElement.setAttributeNS(null, 'y', newY + this.shapePadding);
    }

    #mouseclick(e) {
        // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
        if (!e.shiftKey) {
            this.diagram.clearSelection(this);
        }
        this.select();
        e.stopPropagation();
    }

    #mousedblclick(e) {
        this.textArea.classList.remove("svg-text");
        this.textArea.contentEditable = true;
        this.textArea.style.pointerEvents = "auto";
    }

    static serialize(memo, node) {
        let xmlDoc = node.ownerDocument;
        const text = xmlDoc.createElementNS(null, "text");
        const svg = xmlDoc.createElementNS(null, "svg");
        const svgBounds = xmlDoc.createElement("bounds");
        const svgSelected = xmlDoc.createElement("selected");
        text.textContent = memo.text;
        svgBounds.textContent = `${memo.x},${memo.y},${memo.w},${memo.h}`;
        svgSelected.textContent = String(memo.selected);
        svg.appendChild(svgBounds);
        svg.appendChild(svgSelected);
        node.appendChild(text);
        node.appendChild(svg);
    }

    static deserialize(diagram, node) {
        let text = __firstChild("text", node).textContent;
        let svgNode = __firstChild("svg", node);
        let bounds = __firstChild("bounds", svgNode).textContent;
        let [x, y, w, h] = bounds.split(",");
        let selected = __parseBoolean(__firstChild("selected", svgNode).textContent);

        return new Memo(
            diagram,
            diagram.componentSeq++,
            parseInt(x),
            parseInt(y),
            parseInt(w),
            parseInt(h),
            text,
            selected);
    }
}

export default Diagram;