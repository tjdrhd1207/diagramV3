/*
 * @preserve
 * @summary Hansol Diagram Library.
 * @file diagram-min.js (diagram library source file)
 * @author Kimsejin <kimsejin@hansol.com>
 * @author Kimjaemin <jaeminkim@hansol.com>
 * @version 1.0.35
 *
 * © 2022 Kimsejin <kimsejin@hansol.com>, Kimjaemin <jaeminkim@hansol.com>
 * @endpreserve
 */

const DEBUG = true;
const VERSION = "0.1-beta";
const META_VERSION = 1;
const EVENT_NODE_CLICKED = "onNodeClicked";
const EVENT_NODE_CREATED = "onNodeCreated";
const EVENT_NODE_SELECTED = "onNodeSelected";
const EVENT_NODE_UNSELECTED = "onNodeUnSelected";
const EVENT_ZOOMED = "onZoomed";
const EVENT_DIAGRAM_MODIFIED = "onDiagramModified";
const EVENT_LINK_CREATING = "onLinkCreating";
const EVENT_NODE_MODIFYING_CAPTION = "onNodeModifyingCaption";
const EVENT_NODE_MODIFYING_COMMENT = "onNodeModifyingComment";
const DEFAULT_SHAPE = "Rectangle";
// 블럭의 크기는 아래와 같이 고정한다. 크기 변경 기능은 
// 현재는 고려하지 않는다. 기존의 시나리오 변환시에는
// 기존의 크기를 잃어버리고 새 크기로 변환된다.
const BLOCK_RECT_DEFAULT_WIDTH = 140;
const BLOCK_RECT_DEFAULT_HEIGHT = 40;
const BLOCK_CIRCLE_RADIUS = 35;
const BLOCK_DIAMOND_DEFAULT_RADIUS = 50;
const BLOCK_FONT_SIZE = 13;

const ModifyEventTypes = Object.freeze({
    // 로깅시에 쉽게 상수를 인식할 수 있도록 값을 부여한다.
    LinkAdded: "ModifyEventTypes.LinkAdded",
    LinkRemoved: "ModifyEventTypes.LinkRemoved",
    NodeAdded: "ModifyEventTypes.NodeAdded",
    NodeRemoved: "ModifyEventTypes.NodeRemoved",
    NodeMoved: "ModifyEventTypes.NodeMoved",
    NodeCaptionModified: "ModifyEventTypes.NodeCaptionModified",
    NodeCommentModified: "ModifyEventTypes.NodeCommentModified",
    MemoAdded: "ModifyEventTypes.MemoAdded",
    MemoRemoved: "ModifyEventTypes.MemoRemoved",
    MemoMoved: "ModifyEventTypes.MemoMoved",
    MemoContentModified: "ModifyEventTypes.MemoContentModified",
});

const KeyActionNames = Object.freeze({
    // 로깅시에 쉽게 상수를 인식할 수 있도록 값을 부여한다.
    Escape: "KeyActionNames.Escape",
    Delete: "KeyActionNames.Delete",
    SelectAll: "KeyActionNames.SelectAll",
    Copy: "KeyActionNames.Copy",
    Paste: "KeyActionNames.Paste",
    Cut: "KeyActionNames.Cut",
    Undo: "KeyActionNames.Undo",
    Redo: "KeyActionNames.Redo",
    SetBookmark: "KeyActionNames.SetBookmark",
    JumpBookmark: "KeyActionNames.JumpBookmark",
    GrabAndZoom: "KeyActionNames.GrabAndZoom",
});

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
 * element.addEventListener("click", function (e) {
 *  const offset = __getMousePosition(e.target, e.clientX, e.clientY);
 * }
 * @param {object} evt mouse event
 * @returns {object} mouse position object {x, y}
 */
function __getMousePosition(target, x, y) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
    // e.screenX, e.screenY: 모니터 화면상에서의 위치.
    // e.clientX, e.clientY: browser document 상에서의 위치. (특정 Element 가 아님)
    if (!target.getScreenCTM) {
        // foreignobject 들은 getScreenCTM 이 없을 수 있다.
        return { x: 0, y: 0 };
    }
    let CTM = target.getScreenCTM();
    // getScreenCTM() 은 SVG element 에서만 유효한 것으로 보임. SVGMatrix 를 반환한다.
    return {
        x: (x - CTM.e) / CTM.a,
        y: (y - CTM.f) / CTM.d
    };
}

function assertSetEquals(setA, setB) {
    return setA.size === setB.size && setA.union(setB).size === setA.size;
};

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
    textArea.style.cssText = `white-space: pre; width: 100%; height: 100%; padding: 5px; font-size: ${fontSize}px;`;
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

const convertAnchorPosition = { "0": "L", "1": "T", "2": "R", "3": "B", };
const reverseAnchorPosition = { "L": "0", "T": "1", "R": "2", "B": "3", };

/*
 * case-insensitive
 */
function getHtmlAttribute(element, name) {
    // HTMLElement.attributes:
    //  => NamedNodeMap {0: type, 1: id, 2: value, 3: size, ...}
    for (let attr of element.attributes) {
        if (attr.name.toLowerCase() === name.toLowerCase()) {
            return attr.value;
        }
    }
    return null;
}

/*
 * case-insensitive
 */
function setHtmlAttribute(element, name, value) {
    // HTMLElement.attributes:
    //  => NamedNodeMap {0: type, 1: id, 2: value, 3: size, ...}
    let isset = false;
    for (let attr of element.attributes) {
        if (attr.name.toLowerCase() === name.toLowerCase()) {
            attr.value = value;
            isset = true;
            break;
        }
    }
    if (!isset) {
        element.setAttribute(name, value);
    }
}

/*
 * 주어진 두 Object 를 합친다. (deep)
 * 동일한 이름의 property 는 source 에 있는 값으로 override 한다.
 */
function mergeDeep(target, source) {
    // this.options = Object.assign({ ...Diagram.defaultOptions }, options);
    let merged = {};
    let keys = new Set([...Object.keys(target), ...Object.keys(source)]);
    for (let key of keys) {
        if (!(key in source)) {
            merged[key] = target[key];
        } else if (!(key in target)) {
            merged[key] = source[key];
        } else {
            if (target[key] instanceof Object && source[key] instanceof Object) {
                merged[key] = mergeDeep(target[key], source[key]);
            } else {
                merged[key] = source[key];
            }
        }
    }
    return merged;
}

// static inline style 
let STYLE_TEXT = `
    .svg-text {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
    .draggable {
        cursor: move;
    }
    .connect-block {
        fill: #ffc107 !important;
        animation: blink 1.5s infinite;
    }
    @keyframes blink {
        0% { opacity: 1; }
        25% { opacity: 0.7; }
        50% { opacity: 0.5; }
        75% { opacity: 0.7; }
        100% { opacity: 1; }
    }
`;

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
        onNodeSelected: null,
        onNodeUnSelected: null,
        onZoomed: null,
        onDiagramModified: null,
        onLinkCreating: null,
        onNodeModifyingCaption: null,
        onNodeModifyingComment: null,
        useBackgroundPattern: false,
        lineType: "B", // 'L': StraightLine, 'B': Bezier
        moveUnit: 50,
        minimapQuerySelector: null,
        keyActions: {},
        lookAndFeel: {
            selectionBox: {
                fill: "purple",
                stroke: "black",
                opacity: 0.05,
            },
            memo: {
                borderColor: "#E6C700",
                borderColorSelected: "red",
                backgroundColor: "#FFDF6D",
                fontSize: "14px",
            }
        },
    };

    /**
     * @param {string} svgSelector 
     * @param {object} meta 
     * @param {object} options 
     */
    constructor(svgSelector, meta, options) {
        const id = String(diagram_seq++);
        const svg = document.querySelector(svgSelector);

        // 가장 먼저 아래와 같은 정리작업을 해주어야 한다:
        // 동일한 SVG DOM Element 에 대해서 Diagram 이 다시 만들어진다면
        // SVG 가 가지고 있는 Child Element 들과 이전에 등록된 이벤트
        // 핸들러들을 모두 제거해 주어야 한다.
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        if (svg.handlerList) {
            for (let eventName in svg.handlerList) {
                svg.removeEventListener(eventName, svg.handlerList[eventName]);
            }
        }

        let _style = document.createElement("style");
        _style.innerHTML = STYLE_TEXT;
        svg.appendChild(_style);

        this.id = id;
        this.svg = svg;
        this.meta = meta;
        this.options = mergeDeep(Diagram.defaultOptions, options);
        this.components = new Map();
        this.markerId = id + '-marker';
        this.creatingLinkOrigin = null;
        this.creatingLinkLine = null;
        this.creatingNodeName = null;
        this.bookmarks = [];
        this.dragStart = null;
        this.selectionBox = null;
        this.actionManager = new ActionManager(this);
        this.selectedItems = [];
        this.eventMap = new Map();
        this.svgDragInfo = { x: -1, y: -1 };
        this.grabDown = false;
        this.ready = false;
        this.nextSeq = 0;
        this.bookmarkMap = new Map();
        this.keyTracking = new Set();
        this.keyActions = {}; // ActionName => Set of KeyboardEvent.key

        svg.dataset.id = id;

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

        if (options.minimapQuerySelector) {
            const style = getComputedStyle(svg);
            let vpw = parseInt(style.width);
            let vph = parseInt(style.height);

            const minimap = document.querySelector(options.minimapQuerySelector);
            const minimapStyle = getComputedStyle(minimap);
            minimap.setAttribute("width", minimapStyle.width);
            minimap.setAttribute("height", minimapStyle.height);
            minimap.setAttribute("viewBox", `0 0 ${vpw} ${vph}`);
            // let minimapRect = __makeSvgElement('rect', {width: '1400', height: '400', fill: 'black', stroke: 'red', opacity: '0.3'});
            // minimap.appendChild(minimapRect);
        }

        /* keydown 이벤트가 발생하기 위해 svg에 포커싱 */
        if (!getHtmlAttribute(svg, "tabindex")) {
            setHtmlAttribute(svg, "tabindex", "0");
        }

        this.#registerEvent(EVENT_NODE_CLICKED, options.onNodeClicked);
        this.#registerEvent(EVENT_NODE_CREATED, options.onNodeCreated);
        this.#registerEvent(EVENT_NODE_SELECTED, options.onNodeSelected);
        this.#registerEvent(EVENT_NODE_UNSELECTED, options.onNodeUnSelected);
        this.#registerEvent(EVENT_ZOOMED, options.onZoomed);
        this.#registerEvent(EVENT_DIAGRAM_MODIFIED, options.onDiagramModified);
        this.#registerEvent(EVENT_LINK_CREATING, options.onLinkCreating);
        this.#registerEvent(EVENT_NODE_MODIFYING_CAPTION, options.onNodeModifyingCaption);
        this.#registerEvent(EVENT_NODE_MODIFYING_COMMENT, options.onNodeModifyingComment);

        // SVG (DOM Element) 에 handlerList 라는 object 를 저장한다.
        // 이 object 에는 SVG 에 등록한 이벤트 핸들러의 목록이 들어있다.
        // 나중에 이 SVG 가 재사용되는 경우에 해당 이벤트 핸들러들의
        // 참조를 사용해 기존 핸들러들을 정리해주기 위함이다.
        // 앞으로 추가되는 이벤트 핸들러들도 이러한 과정을 따라 주어야 한다.
        svg.handlerList = {
            contextmenu: e => this.#contextmenu(e),
            mousedown: e => this.#mousedown(e),
            mousemove: e => this.#mousemove(e),
            mouseup: e => this.#mouseup(e),
            click: e => this.#mouseclick(e),
            mousewheel: e => this.#mousescroll(e),
            keydown: e => this.#keydown(e),
            keyup: e => this.#keyup(e),
            blur: e => this.#blur(e),
        };

        svg.addEventListener("contextmenu", svg.handlerList.contextmenu);
        svg.addEventListener("mousedown", svg.handlerList.mousedown);
        svg.addEventListener("mousemove", svg.handlerList.mousemove);
        svg.addEventListener("mouseup", svg.handlerList.mouseup);
        svg.addEventListener("click", svg.handlerList.click);
        svg.addEventListener("mousewheel", svg.handlerList.mousewheel);
        svg.addEventListener("keydown", svg.handlerList.keydown);
        svg.addEventListener("keyup", svg.handlerList.keyup);
        svg.addEventListener("blur", svg.handlerList.blur);

        // KeyCombination 을 정의할 때 Control+c 와 같은 형식을 
        // 사용하지 않고 배열을 사용한다. 어떠한 키도 ("+" 처럼) 유효한
        // 값이 될 수 있기 때문에 delimeter 방식을 사용하지 않도록 한다.
        // 등록할 때 Key 이름은 대소문자를 구별한다. KeyboardEvent.key 에 해당한다.
        this.#registerKeyAction(KeyActionNames.Escape, ["Escape"]);
        this.#registerKeyAction(KeyActionNames.Delete, ["Delete"]);
        this.#registerKeyAction(KeyActionNames.SelectAll, ["Control", "a"]);
        this.#registerKeyAction(KeyActionNames.Copy, ["Control", "c"]);
        this.#registerKeyAction(KeyActionNames.Paste, ["Control", "v"]);
        this.#registerKeyAction(KeyActionNames.Cut, ["Control", "x"]);
        this.#registerKeyAction(KeyActionNames.Undo, ["Control", "z"]);
        this.#registerKeyAction(KeyActionNames.Redo, ["Control", "r"]);
        this.#registerKeyAction(KeyActionNames.SetBookmark, ["Alt", "1"]);
        this.#registerKeyAction(KeyActionNames.JumpBookmark, ["Control", "1"]);
        this.#registerKeyAction(KeyActionNames.GrabAndZoom, ["Control"]);

        if (options.keyActions) {
            for (let action in options.keyActions) {
                let keyCombo = options.keyActions[action];
                // 기본값이 있는 경우 사용자 설정으로 덮어써진다.
                this.#registerKeyAction(action, keyCombo);
            }
        }

        diagrams.set(id, this);
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

    createNode(nodeName, x, y) {
        let offset = __getMousePosition(this.svg, x, y);
        if (nodeName === "[MEMO]") {
            let memo = new Memo(this,
                this.generateId(),
                offset.x,
                offset.y,
                300,
                300,
                "",
                false);
            this.actionManager.append(ActionManager.COMPONENTS_ADDED, [memo]);
        } else {
            let nodeInfo = this.meta.nodes[nodeName];
            if (!nodeInfo) {
                throw "Invalid node name: " + nodeName;
            }
            let block = Block.createInstance(this,
                this.generateId(),
                nodeInfo.shape || DEFAULT_SHAPE,
                nodeInfo.icon,
                nodeName,
                nodeInfo.displayName,
                "", // comment
                offset.x,
                offset.y,
                null, // w
                null, // h
                null, // userData
            );
            this.actionManager.append(ActionManager.COMPONENTS_ADDED, [block]);
        }
    }

    copy() {
        if (!window.navigator.clipboard) {
            alert("클립보드 기능이 활성화 되어있지 않습니다.");
            return;
        }

        let rootNode = new NodeWrapper("scenario");
        this.selectedItems.forEach((item) => {
            if (item.type === 'B') {    // TODO: 메모 copy&paste 향후 추가
                let blockNode = rootNode.appendChild("block");
                Block.serialize(item, blockNode);
            } else if (item.type === "M") {
                let memoNode = rootNode.appendChild("memo");
                Memo.serialize(item, memoNode);
            }
        });
        let xmlText = rootNode.toString(true);
        window.navigator.clipboard.writeText(xmlText)
            .catch((e) => {
                alert("클립보드 사용시 오류가 발생했습니다.");
                console.error(e);
            });
    }

    generateId() {
        for (let i = this.nextSeq; ; i++) {
            const id = String(i).padStart(8, "0");
            if (!this.components.get(id)) {
                this.nextSeq = i + 1;
                return id;
            }
        }
    }

    paste() {
        if (!window.navigator.clipboard) {
            alert("클립보드 기능이 활성화 되어있지 않습니다.");
            return;
        }

        let map = new Map();
        window.navigator.clipboard.readText().then((clipText) => {
            let rootNode = NodeWrapper.parseFromXML(clipText);
            let first = true;
            let undoItems = [];
            for (let node of rootNode.children("block")) {
                if (first) {
                    this.unselectAll();
                    first = false;
                }
                let nodeName = node.attr("meta-name");
                let nodeInfo = this.meta.nodes[nodeName];
                let isStartNode = nodeInfo.isStartNode;
                if (isStartNode) {
                    alert("시작 블럭은 복사할 수 없습니다.");
                    continue;
                }

                if (!nodeInfo) {
                    throw "Invalid node name: " + nodeName;
                }
                let nodeCaption = node.attr("desc");
                let nodeComment = node.attr("comment");
                let nodeId = node.attr("id");
                let bounds = node.child("svg/bounds").value();
                let [x, y, w, h] = bounds.split(",");
                let userData = node.child(nodeInfo.buildTag);
                let newBlock = Block.createInstance(this,
                    this.generateId(),
                    nodeInfo.shape || DEFAULT_SHAPE,
                    nodeInfo.icon,
                    nodeName,
                    nodeCaption,
                    nodeComment,
                    parseInt(x) + 10,   // TODO: 향후 개선 (반복적 paste 문제)
                    parseInt(y) + 10,
                    parseInt(w),
                    parseInt(h),
                    userData
                );
                newBlock.select();
                map.set(nodeId, newBlock);
                undoItems.push(newBlock);
            }

            for (let node of rootNode.children("block")) {
                let nodeId = node.attr("id");
                if (!map.get(nodeId)) {
                    continue;
                }
                for (let nodeSub of node.children("choice")) {
                    let targetId = nodeSub.attr("target");
                    let targetNode = map.get(targetId);

                    if (targetNode) {
                        let originAnchor = nodeSub.attr("svg-origin-anchor");
                        let destAnchor = nodeSub.attr("svg-dest-anchor");
                        let newLink = new Link(this,
                            this.generateId(),
                            nodeSub.attr("event"),
                            map.get(nodeId),
                            map.get(targetId),
                            convertAnchorPosition[originAnchor],
                            convertAnchorPosition[destAnchor],
                            true
                        );
                        undoItems.push(newLink);
                    }
                }
            }

            for (let node of rootNode.children("memo")) {
                if (first) {
                    this.unselectAll();
                    first = false;
                }
                let text = node.child("text").value();
                let bounds = node.child("svg/bounds").value();
                let [x, y, w, h] = bounds.split(",");
                let selected = node.child("svg/selected").valueAsBoolean();
                let newMemo = new Memo(
                    this,
                    this.generateId(),
                    parseInt(x) + 10,
                    parseInt(y) + 10,
                    parseInt(w),
                    parseInt(h),
                    text,
                    selected);
                undoItems.push(newMemo);
            }

            if (undoItems.length > 0) {
                this.actionManager.append(ActionManager.COMPONENTS_ADDED, undoItems);
            }
        }).catch((e) => {
            alert("클립보드 사용 시 오류가 발생했습니다.");
            console.error(e);
        })
    }

    cut() {
        this.copy();
        this.delete();
    }

    delete() {
        let hasStartNode = false;
        this.selectedItems.forEach(item => {
            if (item.type === "B") {
                let nodeInfo = this.meta.nodes[item.metaName];
                if (nodeInfo.isStartNode) {
                    hasStartNode = true;
                }
            }
        });

        if (hasStartNode) {
            if (this.selectedItems.length === 1) {
                alert("선택한 블럭은 삭제할 수 없습니다.");
            } else {
                alert("선택한 블럭중에 삭제할 수 없는 블럭이 포함되어 있습니다.");
            }
        } else {
            let undoItems = [];
            // 아래와 같이 제거 로직이 복잡한 이유는 다시 복구할 때 필요한 정보들 때문임.
            // 링크를 먼저 제거해야 Undo 할 때 제대로 복구할 수 있다.

            // 선택된 링크들을 모두 제거.
            let selectedItems = [...this.selectedItems];
            selectedItems.filter(item => item.type === "L").forEach(item => {
                item.remove();
                undoItems.push(item);
            });

            // 링크중에 선택되진 않았지만 블럭을 제거하면서 자동 제거될 것들을 미리 제거.
            selectedItems.filter(item => item.type === "B").forEach(item => {
                for (let link of item.links.values()) {
                    console.log(link);
                    link.remove();
                    undoItems.push(link);
                }
            });

            // 최종적으로 Block, Memo 들을 제거.
            selectedItems.filter(item => item.type !== "L").forEach(item => {
                item.remove();
                undoItems.push(item);
            });

            this.clearSelection();
            this.actionManager.append(ActionManager.COMPONENTS_REMOVED, undoItems);
        }
    }

    undo() {
        this.actionManager.undo();
    }

    redo() {
        this.actionManager.redo();
    }

    /**
     * 
     * @param {String} type Horizontal-Alignment: start/center/end, 
     * Vertical-Alignment: top/middle/bottom, Horizental-Space-Align: halign, Vertical-Space-Align: valign
     */
    align(type) {
        let blocks = this.selectedItems.filter(item => item.type === "B");
        let count = blocks.length;
        if (count <= 1) {
            return;
        }

        let undoData = { type, actions: [] };
        let leftMost = Infinity;
        let rightMost = -Infinity;
        let topMost = Infinity;
        let bottomMost = -Infinity;
        let wsum = 0;
        let hsum = 0;
        let minCenterX = Infinity;
        let maxCenterX = -Infinity;
        let minCenterY = Infinity;
        let maxCenterY = -Infinity;
        for (let block of blocks) {
            leftMost = Math.min(leftMost, block.x);
            rightMost = Math.max(rightMost, block.x + block.w);
            topMost = Math.min(topMost, block.y);
            bottomMost = Math.max(bottomMost, block.y + block.h);
            wsum += block.w;
            hsum += block.h;
            block.centerX = parseInt(block.x + block.w / 2);
            block.centerY = parseInt(block.y + block.h / 2);
            minCenterX = Math.min(minCenterX, block.centerX);
            maxCenterX = Math.max(maxCenterX, block.centerX);
            minCenterY = Math.min(minCenterY, block.centerY);
            maxCenterY = Math.max(maxCenterY, block.centerY);
        }
        let middleX = parseInt(leftMost + (rightMost - leftMost) / 2);
        let middleY = parseInt(topMost + (bottomMost - topMost) / 2);
        // console.log(`aling(${type})`);
        // console.log(`L=${leftMost}/R=${rightMost}/T=${topMost}/B=${bottomMost}/MX=${middleX}/MY=${middleY}`);
        // console.log(`C=${minCenterX}/${minCenterY}/${maxCenterX}/${maxCenterY}`);
        // console.log(`S=${wsum}/${hsum}`);

        if (type === "start") {
            blocks.forEach(block => {
                let rx = parseInt(leftMost - block.x);
                let ry = 0;
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "center") {
            blocks.forEach(block => {
                let rx = parseInt(middleX - (block.x + block.w / 2));
                let ry = 0;
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "end") {
            blocks.forEach(block => {
                let rx = parseInt(rightMost - (block.x + block.w));
                let ry = 0;
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "top") {
            blocks.forEach(block => {
                let rx = 0;
                let ry = parseInt(topMost - block.y);
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "middle") {
            blocks.forEach(block => {
                let rx = 0;
                let ry = parseInt(middleY - (block.y + block.h / 2));
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "bottom") {
            blocks.forEach(block => {
                let rx = 0;
                let ry = parseInt(bottomMost - (block.y + block.h));
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            });
        } else if (type === "halign") {
            let space = rightMost - leftMost - wsum; // 빈공간의 총합.
            let espace = parseInt(space / (blocks.length - 1));
            blocks.sort((a, b) => a.centerX - b.centerX); // 중심점을 기준으로 정렬.
            for (let idx = 1; idx < count - 1; idx++) {
                let before = blocks[idx - 1];
                let block = blocks[idx];
                let moveTo = before.x + before.w + espace;
                let rx = moveTo - block.x;
                let ry = 0;
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            }
            // 아래는 각 블록의 중심점을 기준으로 하여 동일한 간격으로 정렬하는 로직임.
            // let space = parseInt((maxCenterX - minCenterX) / (count - 1));
            // blocks.sort((a, b) => a.centerX - b.centerX);
            // for (let idx = 1; idx < count - 1; idx++) {
            //     let block = blocks[idx];
            //     let moveTo = minCenterX + (space * idx);
            //     block.setPosition(moveTo - block.centerX, 0, true);
            // }
        } else if (type === "valign") {
            let space = bottomMost - topMost - hsum; // 빈공간의 총합.
            let espace = parseInt(space / (blocks.length - 1));
            blocks.sort((a, b) => a.centerY - b.centerY); // 중심점을 기준으로 정렬.
            for (let idx = 1; idx < count - 1; idx++) {
                let before = blocks[idx - 1];
                let block = blocks[idx];
                let moveTo = before.y + before.h + espace;
                let rx = 0;
                let ry = moveTo - block.y;
                block.setPosition(rx, ry, true);
                undoData.actions.push({ block, rx, ry });
            }
            // 아래는 각 블록의 중심점을 기준으로 하여 동일한 간격으로 정렬하는 로직임.
            // let space = parseInt((maxCenterY - minCenterY) / (count - 1));
            // blocks.sort((a, b) => a.centerY - b.centerY);
            // for (let idx = 1; idx < count - 1; idx++) {
            //     let block = blocks[idx];
            //     let moveTo = minCenterY + (space * idx);
            //     block.setPosition(0, moveTo - block.centerY, true);
            // }
        }
        if (undoData.actions.push.length > 0) {
            this.actionManager.append(ActionManager.COMPONENTS_ALIGNED, undoData);
        }
    }

    fireEvent(eventName, ...args) {
        let listeners = this.eventMap.get(eventName);
        listeners?.forEach(f => f(...args));
    }

    setCreateMode(nodeName) {
        // CreateMode 를 끄려면 null 설정
        this.creatingNodeName = nodeName;
    }

    selectAll() {
        this.components.forEach(c => c.select());
    }

    unselectAll() {
        this.clearSelection();
    }

    zoomReset() {
        this.zoom(1.0);
    }

    zoomIn(e) {
        this.zoom(0.9, true, e);
    }

    zoomOut(e) {
        this.zoom(1.1, true, e);
    }

    zoom(scale, isRelative = false, pointerEvent = null) {
        if (scale === 1.0) {
            this.svg.removeAttribute("viewBox");
            this.fireEvent(EVENT_ZOOMED, scale);
        } else {
            let vpw = parseInt(getComputedStyle(this.svg).width);
            let vph = parseInt(getComputedStyle(this.svg).height);
            let viewBox = getHtmlAttribute(this.svg, "viewBox");
            let vbx = 0;
            let vby = 0;
            let vbw = 0;
            let vbh = 0;
            if (viewBox) {
                [vbx, vby, vbw, vbh] = viewBox.split(/[\s,]+/);
            } else {
                [vbx, vby, vbw, vbh] = [0, 0, vpw, vph];
            }
            if (isRelative) {
                let e = pointerEvent;
                if (e) {
                    let currentPoint = __getMousePosition(this.svg, e.clientX, e.clientY);
                    vbx = parseInt(vbx) + (currentPoint.x - vbx) * (1 - scale);
                    vby = parseInt(vby) + (currentPoint.y - vby) * (1 - scale);
                } else {
                    let middlePoint = __getMousePosition(this.svg, vpw / 2, vph / 2);
                    vbx = parseInt(vbx) + (middlePoint.x - vbx) * (1 - scale);
                    vby = parseInt(vby) + (middlePoint.y - vby) * (1 - scale);
                }
                vbw *= scale;
                vbh *= scale;
            } else {
                let middlePoint = __getMousePosition(this.svg, vpw / 2, vph / 2);
                if (!viewBox) {
                    vbw = vpw * scale;
                    vbh = vph * scale;
                } else {
                    vbw *= scale;
                    vbh *= scale;
                }
                vbx = parseInt(vbx) + (middlePoint.x - vbx) * (1 - scale);
                vby = parseInt(vby) + (middlePoint.y - vby) * (1 - scale);
            }
            setHtmlAttribute(this.svg, "viewBox", `${vbx} ${vby} ${vbw} ${vbh}`);
            this.fireEvent(EVENT_ZOOMED, vbw / vpw);
        }
    }

    // TODO: 이미 다른 번호로 세팅 되어있는 블록을 세팅하려고할 때 기존껄 지우고 새로 세팅되도록
    toggleBookMark(num) {
        const items = this.selectedItems;
        if (items.length === 1 && items[0].type === 'B') {
            const blockId = items[0].id;
            if (this.bookmarkMap.get(num) === blockId) {
                this.bookmarkMap.delete(num);
                console.log(`bookmark ${num} has been removed.`);
            } else {
                this.bookmarkMap.set(num, blockId);
                console.log(`bookmark ${num} have been added.`);
            }
        } else {
            console.log("You must select one block for bookmarking.");
            return;
        }
    }

    // TODO: 배율 고려한 코드 추가 (zoom되어진 상태일 시)
    // TODO: focusNode(blockId) 함수 추후 모듈화
    jumpToBookMark(num) {
        const blockId = this.bookmarkMap.get(num);
        if (blockId) {
            this.focusNode(blockId);
        }
    }

    /**
     * @param {string} blockId
     */
    focusNode(blockId) {
        const blockObj = this.components.get(blockId);
        if (blockObj) {
            blockObj.select();
            const style = getComputedStyle(this.svg);
            const width = parseInt(style.width);
            const height = parseInt(style.height);
            const viewBox = [blockObj.x - (width / 2), blockObj.y - (height / 2), width, height];
            setHtmlAttribute(this.svg, "viewBox", viewBox.join(' '));
        }
    }

    /**
     * @param {string} svgSelector jquery selector for svg element
     * @param {string} xml xml from which new diagram built
     * @returns {object} diagram object
     */
    static deserialize(svgSelector, meta, xml, options) {
        let diagram = new Diagram(svgSelector, meta, options);
        let rootNode = NodeWrapper.parseFromXML(xml);
        let maxSeq = -1;

        for (let node of rootNode.children("block")) {
            let block = Block.deserialize(diagram, node);
            let seq = parseInt(block.id);
            if (seq != 99999999 && seq > maxSeq) {
                maxSeq = seq;
            }
        }

        for (let node of rootNode.children("block")) {
            let nodeId = node.attr("id");
            let block = diagram.components.get(nodeId);
            for (let nodeSub of node.children("choice")) {
                Link.deserialize(block, nodeSub);
            }
        }

        for (let node of rootNode.children("memo")) {
            Memo.deserialize(diagram, node);
        }

        diagram.actionManager.reset();
        diagram.ready = true;
        return diagram;
    }

    /**
     * @param {Diagram} diagram
     */
    static serialize(diagram) {
        let rootNode = new NodeWrapper("scenario");

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
            let blockNode = rootNode.appendChild("block");
            Block.serialize(block, blockNode);
        }

        for (let memo of memos) {
            let memoNode = rootNode.appendChild("memo");
            Memo.serialize(memo, memoNode);
        }
        return rootNode.toString();
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
        const finalRect = __makeSvgElement('rect', { width: '1000000%', height: '1000000%', fill: 'url(#' + id + '-grid)', style: 'pointer-events: none', transform: "translate(-500000, -500000)" });
        pattern1.appendChild(pattern1Path);
        pattern2.appendChild(pattern2Rect);
        pattern2.appendChild(pattern2Path);
        defs.appendChild(pattern1);
        defs.appendChild(pattern2);
        this.svg.appendChild(defs);
        this.svg.appendChild(finalRect);
    }

    #contextmenu(e) {
        let element = document.elementFromPoint(e.pageX, e.pageY);
        if (this.options.onContextMenu) {
            // TODO: 의미있는 element 인 경우에만 전달하도록 개선하기.
            this.options.onContextMenu(e, element);
        }
    }

    #mousedown(e) {
        const offset = __getMousePosition(e.target, e.clientX, e.clientY);

        if (this.grabDown) {
            this.svgDragInfo.x = e.clientX;
            this.svgDragInfo.y = e.clientY;
        } else if (e.target.classList.contains("draggable")) {
            if (e.buttons === 1) {
                let element = e.target;
                let id = element.getAttributeNS(null, "data-id");
                let c = this.components.get(id);
                if (!this.isSelected(c)) {
                    return;
                }

                this.dragStart = {
                    item: c,
                    offsetX: offset.x - c.x,
                    offsetY: offset.y - c.y,
                    x: offset.x,
                    y: offset.y,
                    lastX: offset.x,
                    lastY: offset.y,
                };
            }
        } else if (e.target === this.svg) {
            if (!e.shiftKey) {
                this.clearSelection();
            }
            if (e.button === MOUSE_BUTTON_LEFT_MAIN) {
                let lnf = this.options.lookAndFeel.selectionBox;
                let box = __makeSvgElement("rect", {
                    x: offset.x,
                    y: offset.y,
                    "data-init-x": offset.x,
                    "data-init-y": offset.y,
                    style: `fill: ${lnf.fill};
                        fill-opacity: ${lnf.opacity};
                        stroke: ${lnf.stroke};
                        stroke-width: 1;
                        stroke-dasharray: 3 3;
                        pointer-events: none`,
                });
                this.svg.appendChild(box);
                this.selectionBox = box;
            }
        }
    }

    #mousemove(e) {
        const offset = __getMousePosition(e.target, e.clientX, e.clientY);

        if (this.dragStart) {
            e.preventDefault();

            let dragStart = this.dragStart;
            if (e.buttons > 0 && e.button === MOUSE_BUTTON_LEFT_MAIN) {
                let byX = offset.x - dragStart.lastX;
                let byY = offset.y - dragStart.lastY;
                dragStart.lastX = offset.x;
                dragStart.lastY = offset.y;

                this.selectedItems.forEach(m => {
                    if ((m.type === 'B' || m.type === 'M')) {
                        m.setPosition(byX, byY, true);
                    }
                });
            } else {
                // SVG 영역을 벗어났다가 다시 들어오는 경우, SVG 외부에서
                // 발생하는 mouseup 이벤트를 받을 수 없어 발생하는 문제 고려해야 함.
                // 1) 원래의 위치로 돌아가기.
                // 2) 이동을 확정하고 ActionManager 에 넣기. (이것이 더 편해 보임)
                let relX = dragStart.item.x - (dragStart.x - dragStart.offsetX);
                let relY = dragStart.item.y - (dragStart.y - dragStart.offsetY);
                let targets = [...this.selectedItems];
                let undoData = { targets, relX, relY };
                this.actionManager.append(ActionManager.COMPONENTS_MOVED, undoData);
                this.dragStart = null;
            }
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

            let xmargin = e.clientX - e.offsetX;
            let ymargin = e.clientY - e.offsetY;
            let _r = box.getBoundingClientRect();
            let _rect = this.svg.createSVGRect();
            _rect.x = _r.x - xmargin;
            _rect.y = _r.y - ymargin;
            _rect.width = _r.width;
            _rect.height = _r.height;
            // getIntersectionList() 의 첫번째 인자는 SVG 좌표가 아니라 페이지의
            // 좌표를 입력해야 한다. 그래서 getBoundingClientRect() 를 사용했음.
            // 그런데 특이하게도 원점은 SVG 의 0,0 원점을 사용해야 정확히 작동함.
            // 그래서 xmargin, ymargin 을 계산해서 빼주었음.
            let nodeList = this.svg.getIntersectionList(_rect, null);
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
            if (!e.shiftKey) {
                for (let c of unselecting) {
                    c.unselect();
                }
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
        } else if (this.grabDown) {
            if (!this.#checkKeyAction(KeyActionNames.GrabAndZoom, e)) {
                this.svg.style.cursor = "";
                this.grabDown = false;
                return;
            }
            if (e.buttons > 0 && e.button === MOUSE_BUTTON_LEFT_MAIN) {
                let deltaX = e.clientX - this.svgDragInfo.x;
                let deltaY = e.clientY - this.svgDragInfo.y;
                let viewBox = getHtmlAttribute(this.svg, "viewBox");
                let style = getComputedStyle(this.svg);
                let scale = 1.0;
                if (viewBox) {
                    viewBox = viewBox.split(/[\s,]+/);
                    scale = parseInt(viewBox[2]) / parseInt(style.width);
                } else {
                    viewBox = [0, 0, parseInt(style.width), parseInt(style.height)];
                }
                viewBox[0] -= parseInt(deltaX * scale);
                viewBox[1] -= parseInt(deltaY * scale);

                setHtmlAttribute(this.svg, "viewBox", viewBox.join(' '));
                this.svgDragInfo.x = e.clientX;
                this.svgDragInfo.y = e.clientY;
            }
        }
    }

    #mouseup(e) {
        const offset = __getMousePosition(e.target, e.clientX, e.clientY);

        if (this.dragStart) {
            let relX = offset.x - this.dragStart.x;
            let relY = offset.y - this.dragStart.y;

            if (relX !== 0 || relY !== 0) {
                let targets = [...this.selectedItems];
                let undoData = { targets, relX, relY };
                this.actionManager.append(ActionManager.COMPONENTS_MOVED, undoData);
            }
            this.dragStart = null;
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
            this.createNode(nodeName, e.clientX, e.clientY);
        }
    }

    #mousescroll(e) {
        if (this.grabDown) {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.zoomOut(e);
            } else {
                this.zoomIn(e);
            }
        }
    }

    #registerKeyAction(action, keyCombo) {
        let kset = new Set(keyCombo);
        for (let k in this.keyActions) {
            let v = this.keyActions[k];
            if (k !== action && assertSetEquals(v, kset)) {
                let _kset = [...kset].join(", ");
                let _v = [...v].join(", ");
                let err = `Duplicate key combination: ${action}=[${_kset}], ${k}=[${_v}]`;
                console.error(err);
            }
        }
        this.keyActions[action] = kset;
    }

    #checkKeyAction(action, keyEvent) {
        let keyCombo = this.keyActions[action];
        return assertSetEquals(this.keyTracking, keyCombo);
    }

    #getKeyAction(keyEvent) {
        let ctrl = keyEvent.ctrlKey;
        let alt = keyEvent.altKey;
        let shift = keyEvent.shiftKey;
        let meta = keyEvent.metaKey;

        // key: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        let key = keyEvent.key; // (e.g., Control, Shift, a, A, 1, F1)
        // keyCode: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        // let keyCode = keyEvent.keyCode; // Deprecated
        // charCode: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/charCode
        // let charCode = keyEvent.charCode; // Deprecated
        // code: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
        let code = keyEvent.code; // Physical key (문자가 아닌), (e.g., ControlLeft, ControlRight)
        let log = `Ctrl:${ctrl}, Alt:${alt}, Shift:${shift}, Meta:${meta}, Key:${key}, Code:${code}`;
        console.log(log, keyEvent);

        for (let action in this.keyActions) {
            let keyCombo = this.keyActions[action];
            if (assertSetEquals(this.keyTracking, keyCombo)) {
                console.log("same:", this.keyTracking, keyCombo);
                return action;
            }
        }
        return null;
    }

    #keydown(e) {
        this.keyTracking.add(e.key);
        console.log("keyTracking: ", this.keyTracking);

        let keyAction = this.#getKeyAction(e);
        console.log("keyAction: ", keyAction);
        if (keyAction === KeyActionNames.Escape) {
            this.setCreateMode(null);
            this.unselectAll();
        } else if (keyAction === KeyActionNames.Delete) {
            e.preventDefault();
            this.delete();
        } else if (keyAction === KeyActionNames.SelectAll) {
            e.preventDefault();
            this.selectAll();
        } else if (keyAction === KeyActionNames.Copy) {
            e.preventDefault();
            this.copy();
        } else if (keyAction === KeyActionNames.Paste) {
            e.preventDefault();
            this.paste();
        } else if (keyAction === KeyActionNames.Cut) {
            e.preventDefault();
            this.cut();
        } else if (keyAction === KeyActionNames.Undo) {
            e.preventDefault();
            this.undo();
        } else if (keyAction === KeyActionNames.Redo) {
            e.preventDefault();
            this.redo();
        } else if (keyAction === KeyActionNames.SetBookmark) {
            e.preventDefault();
            if (e.key.match(/[0-9]/)) {
                this.toggleBookMark(e.key);
            }
        } else if (keyAction === KeyActionNames.JumpBookmark) {
            e.preventDefault();
            if (e.key.match(/[0-9]/)) {
                this.unselectAll();
                this.jumpToBookMark(e.key);
            }
        } else if (keyAction === KeyActionNames.GrabAndZoom) {
            e.preventDefault();
            this.svg.style.cursor = "grab";
            this.grabDown = true;
        }
    }

    #keyup(e) {
        this.keyTracking.delete(e.key);
        console.log("keyTracking: ", this.keyTracking);

        if (this.grabDown) {
            this.svg.style.cursor = "";
            this.grabDown = false;
        }
    }

    #blur(e) {
        // 영역을 벗어나면 KeyboardEvent 를 받을 수 없기 때문에
        // (특히 keyup 이벤트) 트랙킹이 정상적으로 되지 않으므로
        // 아예 모두 해제해 버린다. 
        // 다른 어플리케이션들도 이렇게 하는 것으로 보임.
        this.keyTracking.clear();
        console.log("keyTracking: ", this.keyTracking);
    }
}

class ActionManager {
    static COMPONENTS_ADDED = "add";
    static COMPONENTS_REMOVED = "remove";
    static COMPONENTS_MOVED = "moved";
    static COMPONENTS_ALIGNED = "aligned";
    static NODE_CAPTION_MODIFIED = "nodecaption";
    static NODE_COMMENT_MODIFIED = "nodecomment";
    static MEMO_TEXT_MODIFIED = "memotext";

    constructor(diagram) {
        this.diagram = diagram;
        this.actions = [];
        this.action_max = 32;
        this.redoList = [];
        this.save = true;
    }

    reset() {
        // clear const array
        // this.actions.splice(0, actions.length);
        this.actions = [];
    }

    append(op, data) {
        if (!this.save) {
            return;
        }
        if (this.actions.length >= this.action_max) {
            this.actions.splice(0, 1);
        }
        let item = { "op": op, "data": data };

        // 아래에서 Block, Link, Memo 를 특별히 명시하지 않는 이상,
        // Component 는 것은 화면에 보이는 모든 Component 포함함.
        if (op === ActionManager.COMPONENTS_ADDED) {
            // 1) Diagram#createNode() 호출을 통해 하나의 Block, Memo 를 생성하는 경우.
            // 2) 마우스 클릭을 통해 하나의 Component 를 생성하는 경우. (Block, Link, Memo) => 1 번과 동일하므로 생략.
            // 3) Component 들을 붙여넣기 (Ctrl+V) 키를 통해서 붙여 넣는 경우.
            // 4) Component 들을 Diagram#paste() 호출을 통해 붙여 넣는 경우. => 3 번과 동일하므로 생략.
        } else if (op === ActionManager.COMPONENTS_REMOVED) {
            // 1) 삭제 (Delete) 키를 통해 선택 Component 들을 삭제하는 경우.
            // 2) Diagram#delete() 호출을 통해 선택 Component 들을 삭제하는 경우. => 1 번과 동일하므로 생략.
            // 3) Diagram#cut() 호출을 통해 선택 Component 들을 삭제하는 경우. => 2 번과 동일하므로 생략.
            // 4) 잘라내기 (Ctrl+X) 키를 통해서 선택 Component 들을 삭제하는 경우. => 3 번과 동일하므로 생략.
        } else if (op === ActionManager.COMPONENTS_MOVED) {
            // 1) 마우스 Drag-and-Drop 을 사용해서 선택 Component 들을 이동하는 경우.
        } else if (op === ActionManager.COMPONENTS_ALIGNED) {
            // 1) 마우스 align API 호출을 통해 블럭들을 정렬하는 경우.
        } else if (op === ActionManager.NODE_CAPTION_MODIFIED) {
            // 1) onNodeModifyingCaption 이벤트 처리에서 블럭의 Caption 을 변경하는 경우.
        } else if (op === ActionManager.NODE_COMMENT_MODIFIED) {
            // 1) onNodeModifyingComment 이벤트 처리에서 블럭의 Comment 를 변경하는 경우.
        } else if (op === ActionManager.MEMO_TEXT_MODIFIED) {
            // 1) Dblclick 하여 Memo 를 Editable 상태로 만든 후 텍스트를 변경하는 경우.
        } else {
            return;
        }
        console.log("ActionManager.append():", item);
        this.actions.push(item);
        // 새로운 action 이 추가되면 redo 목록은 모두 제거한다.
        // undo-redo 구현을 최대한 단순하게 하기 위함이며,
        // 이러한 로직상으로는 undo 하면서 스택에 쌓인 redo 목록은
        // 바로 사용하지 않으면 날라갈 수 있게 된다.
        // undo-redo 로직은 어플리케이션마다 다르기 때문에 
        // 다른 특정 어플리케이션과 비교할 필요는 없어 보임.
        this.redoList = [];
    }

    createElements(data) {
        let redoItems = [];
        let diagram = this.diagram;
        data.filter(c => c.type !== "L").forEach(c => {
            if (c.type === "B") {
                let block = c;
                let newBlock = Block.createInstance(
                    block.diagram,
                    block.id,
                    block.shape,
                    block.icon,
                    block.metaName,
                    block.caption,
                    block.comment,
                    block.x,
                    block.y,
                    block.w,
                    block.h,
                    block.userData);
                // newBlock.select(block.selected);
                redoItems.push(newBlock);
            } else if (c.type === "M") {
                let memo = c;
                let newMemo = new Memo(
                    memo.diagram,
                    memo.id,
                    memo.x,
                    memo.y,
                    memo.w,
                    memo.h,
                    memo.text,
                    false);
                // newMemo.select(memo.selected);
                redoItems.push(newMemo);
            }
        });
        data.filter(c => c.type === "L").forEach(c => {
            let link = c;
            let newLink = new Link(
                link.diagram,
                link.id,
                link.caption,
                diagram.components.get(link.blockOrigin.id),
                diagram.components.get(link.blockDest.id),
                link.posOrigin,
                link.posDest,
                false);
            // newLink.select(link.selected);
            redoItems.push(newLink);
        });
        return redoItems;
    }

    undo() {
        this.save = false;
        let item = null;
        try {
            if (this.actions.length <= 0) {
                return;
            }
            item = this.actions.pop(); // remove last item
            let op = item.op;
            let data = item.data;
            console.log("ActionManager.undo():", op, data);

            if (op === ActionManager.COMPONENTS_ADDED) {
                data.forEach(c => c.remove());
            } else if (op === ActionManager.COMPONENTS_REMOVED) {
                // 다른 작업들과는 달리 이 작업은 새로운 블럭 Object 들을 만들게 된다.
                // 그래서 Redo 할 때도 새로운 블럭에 대해 작업해야 한다.
                let redoItems = this.createElements(data);
                item = { op, data: redoItems };
            } else if (op === ActionManager.COMPONENTS_MOVED) {
                // data: { targets, relX, relY }
                let { targets, relX, relY } = data;
                targets.filter(c => c.type !== "L").forEach(c => {
                    c.setPosition(parseInt(-relX), parseInt(-relY), true);
                });
            } else if (op === ActionManager.COMPONENTS_ALIGNED) {
                // data: { type, actions: [ { block, rx, ry }, ... ] }
                let { type, actions } = data;
                actions.forEach(act => {
                    let block = act.block;
                    block.setPosition(-act.rx, -act.ry, true);
                });
            } else if (op === ActionManager.NODE_CAPTION_MODIFIED) {
                let { block, oldValue, newValue } = data;
                block.setCaption(oldValue);
            } else if (op === ActionManager.NODE_COMMENT_MODIFIED) {
                let { block, oldValue, newValue } = data;
                block.setComment(oldValue);
            } else if (op === ActionManager.MEMO_TEXT_MODIFIED) {
                let { memo, oldValue, newValue } = data;
                memo.setText(oldValue);
            } else {
                return;
            }
        } finally {
            if (item) {
                if (this.redoList.length >= this.action_max) {
                    this.redoList.splice(0, 1);
                }
                this.redoList.push(item);
            }
            this.save = true;
        }
    }

    redo() {
        this.save = false;
        try {
            if (this.redoList.length <= 0) {
                return;
            }
            let item = this.redoList.pop(); // remove last item
            let op = item.op;
            let data = item.data;
            console.log("ActionManager.redo():", op, data);

            if (op === ActionManager.COMPONENTS_ADDED) {
                this.createElements(data);
            } else if (op === ActionManager.COMPONENTS_REMOVED) {
                data.forEach(c => c.remove());
            } else if (op === ActionManager.COMPONENTS_MOVED) {
                // data: { targets, relX, relY }
                let { targets, relX, relY } = data;
                targets.filter(c => c.type !== "L").forEach(c => {
                    c.setPosition(parseInt(relX), parseInt(relY), true);
                });
            } else if (op === ActionManager.COMPONENTS_ALIGNED) {
                // data: { type, actions: [ { block, rx, ry }, ... ] }
                let { type, actions } = data;
                actions.forEach(act => {
                    let block = act.block;
                    block.setPosition(act.rx, act.ry, true);
                });
            } else if (op === ActionManager.NODE_CAPTION_MODIFIED) {
                let { block, oldValue, newValue } = data;
                block.setCaption(newValue);
            } else if (op === ActionManager.NODE_COMMENT_MODIFIED) {
                let { block, oldValue, newValue } = data;
                block.setComment(newValue);
            } else if (op === ActionManager.MEMO_TEXT_MODIFIED) {
                let { memo, oldValue, newValue } = data;
                memo.setText(newValue);
            } else {
                return;
            }
        } finally {
            this.save = true;
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
     * @param {number} id
     */
    constructor(diagram, type, id) {
        this.diagram = diagram;
        this.type = type;
        this.id = id;
        this.svg = diagram.svg;
        this.selected = false;

        if (diagram.components.get(this.id)) {
            throw new Error("Component already exists: " + this.id);
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
        newX = Math.abs(remainX) > moveUnit / 2 ? newX + (newX > 0 ? moveUnit : -moveUnit) - remainX : newX - remainX;
        newY = Math.abs(remainY) > moveUnit / 2 ? newY + (newY > 0 ? moveUnit : -moveUnit) - remainY : newY - remainY;
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
        let origin = diagram.creatingLinkOrigin;
        let line = diagram.creatingLinkLine;
        diagram.creatingLinkOrigin.setVisible(false);
        diagram.svg.removeChild(line);

        if (origin !== this) {
            new Promise((resolve) => {
                if (diagram.options.onLinkCreating) {
                    diagram.fireEvent(EVENT_LINK_CREATING, origin.block, e, value => {
                        // TODO: 사용자가 결과값을 주기 위한 콜백을 호출하지 않는 경우
                        // resolve() 할 수 없다. 이 경우에 Promise 는 어떻게 되는가?
                        resolve(value);
                    });
                } else {
                    resolve(prompt("Enter event name:"));
                }
            }).then((caption) => {
                if (caption && caption.trim()) {
                    let link = new Link(diagram,
                        diagram.generateId(),
                        caption,
                        origin.block,
                        this.block,
                        origin.position,
                        this.position);
                    diagram.actionManager.append(ActionManager.COMPONENTS_ADDED, [link]);
                } else {
                    // Cancelled
                }
            });
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
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class Block extends UIComponent {
    static createInstance(diagram, id, shape, icon, metaName, caption, comment, x, y, w, h, userData) {
        x = parseInt(x);
        y = parseInt(y);
        w = parseInt(w);
        h = parseInt(h);
        let block = null;
        if (shape === "Rectangle") {
            block = new Rectangle2Block(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData);
        } else if (shape === "Circle") {
            block = new CircleBlock2(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData);
        } else if (shape === "Diamond") {
            block = new DiamondBlock2(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData);
        } else {
            throw "Invalid shape: " + shape;
        }

        if (diagram.ready) {
            diagram.fireEvent(EVENT_NODE_CREATED, block);
            diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, block, ModifyEventTypes.NodeAdded);
        }
        return block;
    }

    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData, classPrefix) {
        super(diagram, "B", id);
        this.icon = icon;
        this.metaName = metaName;
        this.caption = caption;
        this.comment = comment;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.links = new Map();
        this.userData = userData;
        this.classPrefix = classPrefix;
    }

    setPosition(newX, newY, isRelative) {
        super.setPosition(newX, newY, isRelative);
        this.links.forEach(link => link.adjustPoints());
    }

    /**
     * @param {String} value 
     */
    setCaption(value) {
        // let divElement = this.captionElement.children[0];
        let divElement = this.captionElement;
        divElement.textContent = value;
        this.caption = value;
    }

    /**
     * @param {String} value 
     */
    setComment(value) {
        // let divElement = this.commentElement.children[0];
        let divElement = this.commentElement;
        divElement.textContent = value;
        this.comment = value;
    }

    select() {
        if (!this.selected) {
            this.shapeElement.classList.add(this.classPrefix + "-selected");
            this.selected = true;
            this.diagram.appendToSelection(this);
            this.diagram.fireEvent(EVENT_NODE_SELECTED, this, "nodeSelected");
        }
    }

    unselect() {
        if (this.selected) {
            this.shapeElement.classList.remove(this.classPrefix + "-selected");
            this.selected = false;
            this.diagram.fireEvent(EVENT_NODE_UNSELECTED, this, "nodeUnSelected");
            this.diagram.removeFromSelection(this);
        }
    }

    remove() {
        this.svg.removeChild(this.shapeElement);
        this.svg.removeChild(this.rootElement);
        // NOTE: 
        //   rootElement 의 child 이므로 자동으로 메모리에서
        //   제거될 것으로 예상됨. 그렇지 않다면 수동으로 제거해야 함.
        // this.svg.removeChild(this.iconElement);
        // this.svg.removeChild(this.captionElement);
        // this.svg.removeChild(this.commentElement);
        this.anchors.remove();
        for (let c of this.links.values()) {
            c.remove();
        }
        this.diagram.components.delete(this.id);
        this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.NodeRemoved);
    }

    #mouseclick(e) {
        if (!this.selected) {
            // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
            if (!e.shiftKey) {
                this.diagram.clearSelection(this);
            }
            this.select();
        }
    }

    #mousedblclick(e) {
        let diagram = this.diagram;
        let block = this;
        if (e.button === MOUSE_BUTTON_LEFT_MAIN) {
            if (e.ctrlKey) {
                if (diagram.options.onNodeModifyingComment) {
                    new Promise((resolve) => {
                        let oldValue = this.comment;
                        diagram.options.onNodeModifyingComment(this, oldValue, newValue => {
                            if (newValue !== null && oldValue !== newValue) {
                                resolve(newValue);
                            }
                        });
                    }).then(newValue => {
                        console.log(`comment: new=${newValue}`);
                        let undoData = { block, oldValue: this.comment, newValue };
                        diagram.actionManager.append(ActionManager.NODE_COMMENT_MODIFIED, undoData);
                        this.setComment(newValue);
                        diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, block, ModifyEventTypes.NodeCommentModified);
                    });
                }
            } else {
                if (diagram.options.onNodeModifyingCaption) {
                    new Promise((resolve) => {
                        let oldValue = this.caption;
                        diagram.options.onNodeModifyingCaption(this, oldValue, newValue => {
                            if (newValue !== null && oldValue !== newValue) {
                                resolve(newValue);
                            }
                        });
                    }).then(newValue => {
                        console.log(`caption: new=${newValue}`);
                        let undoData = { block, oldValue: this.caption, newValue };
                        diagram.actionManager.append(ActionManager.NODE_CAPTION_MODIFIED, undoData);
                        this.setCaption(newValue);
                        diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, block, ModifyEventTypes.NodeCaptionModified);
                    });
                }
            }
        }
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
        this.shapeElement.addEventListener("dblclick", e => this.#mousedblclick(e));
        this.movePosition(0, 0, this.x, this.y);
    }

    /**
     * @param {Block} block
     * @param {NodeWrapper} node
     */
    static serialize(block, node) {
        node.attr("id", block.id);
        node.attr("desc", block.caption);
        node.attr("comment", block.comment);
        node.attr("meta-name", block.metaName);

        let svgNode = node.appendChild("svg", null);
        let boundsNode = svgNode.appendChild("bounds");
        let selectedNode = svgNode.appendChild("selected");
        boundsNode.value(`${block.x},${block.y},${block.w},${block.h}`);
        selectedNode.value(String(block.selected));

        if (block.userData) {
            node.appendNode(block.userData);
        }

        for (let link of block.links.values()) {
            if (link.blockDest !== block) {
                Link.serialize(link, node);
            }
        }
    }

    /**
     * @param {Diagram} diagram 
     * @param {NodeWrapper} node 
     * @returns {Block} new block object
     */
    static deserialize(diagram, node) {
        let id = node.attr("id");
        let desc = node.attr("desc");
        let comment = node.attr("comment");
        let metaName = node.attr("meta-name");
        let nodeDef = diagram.meta.nodes[metaName];
        let bounds = node.child("svg/bounds").value();
        let [x, y, w, h] = bounds.split(",");
        let selected = node.child("svg/selected").valueAsBoolean();
        let userData = node.child(nodeDef.buildTag);

        let block = Block.createInstance(
            diagram,
            id,
            nodeDef.shape || "Rectangle",
            nodeDef.icon,
            metaName,
            desc,
            comment == null ? "" : comment,
            parseInt(x),
            parseInt(y),
            parseInt(w),
            parseInt(h),
            userData
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
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class RectangleBlock extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_RECT_DEFAULT_WIDTH, BLOCK_RECT_DEFAULT_HEIGHT, userData, "hd-block");

        const svg = diagram.svg;
        this.shape = "Rectangle";
        this.iconOffset = this.w * 0.05;
        this.iconSize = Math.min(24, Math.min(this.w, this.h) - (this.iconOffset * 2));

        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            rx: Math.min(this.w, this.h) * 0.1,
            width: this.w,
            height: this.h
        }, [this.classPrefix, "draggable"]);

        // href 에 inline data uri 를 사용하는 경우에는 data 부분이 적절히 encoding 되어야 한다.
        // PNG 예) data:image/png;base64,iVBORw0KGgoAAAANS...==">
        // SVG 예) data:image/svg+xml;base64,MTUuMDcgMS4yNmMtLjU5L...">
        // SVG 예) data:image/svg+xml,<svg fill="%23000000"...</svg>
        //         (base64 가 아니라면 encodeURI() 등의 인코딩 필요. # => %23 특히 중요)
        this.iconElement = __makeSvgElement("image", {
            href: icon,
            width: this.iconSize,
            height: this.iconSize,
            style: "pointer-events: none",
        });

        this.captionElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        this.commentElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            comment);

        let divElement = this.commentElement.children[0];
        divElement.style.color = "#777";

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.captionElement);
        svg.appendChild(this.commentElement);

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
        this.captionElement.setAttributeNS(null, 'x', newX + 30);
        this.captionElement.setAttributeNS(null, 'y', newY + 3);
        this.commentElement.setAttributeNS(null, 'x', newX);
        this.commentElement.setAttributeNS(null, 'y', newY + 15);
        this.anchors.movePosition(relX, relY);
        if (this.diagram.ready) {
            this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.NodeMoved);
        }
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class Rectangle2Block extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_RECT_DEFAULT_WIDTH, BLOCK_RECT_DEFAULT_HEIGHT, userData, "hd-block2");

        const svg = diagram.svg;
        this.shape = "Rectangle";

        let iconSize = 22;
        let iconAreaWidth = 30;
        let fontSize = BLOCK_FONT_SIZE;
        let fontSize2 = 12;
        let lineHeight = 16;
        let radius = Math.min(this.w, this.h) * 0.1;

        // shapeElement: 블럭의 형태를 나타내주고 마우스 이벤트의
        // target 으로 작동하여 드래그가 가능하게 해주는 Element.
        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            rx: radius + "px",
            width: this.w,
            height: this.h
        }, [this.classPrefix, "draggable"]);

        // rootElement: shapeElement 를 제외한, 블럭의 나머지 Element
        // 들의 Parent 로써 작동하는 Element. 다수의 Element 를 동시에
        // 움직일수 있도록 해주며, 블럭안에 요소들의 배치를 쉽게 만들어 준다.
        this.rootElement = __makeSvgElement("foreignObject", {
            width: this.w,
            height: this.h,
            style: "position: relative; pointer-events: none;"
        });

        let iconArea = document.createElement("div");
        iconArea.className = `svg-text ${this.classPrefix + "-iconarea"}`;
        iconArea.style.cssText = `
            position: absolute;
            width: ${iconAreaWidth}px;
            height: 86%;
            margin: 3px;
            border-radius: ${radius}px;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;`;

        let textArea = document.createElement("div");
        textArea.className = `svg-text ${this.classPrefix + "-textarea"}`;
        textArea.style.cssText = `
            position: absolute;
            left: ${iconAreaWidth + 8}px;
            width: ${this.w - iconAreaWidth - 8}px;
            height: 100%;
            display: table;
            line-height: ${lineHeight}px;
            pointer-events: none;`;

        // href 에 inline data uri 를 사용하는 경우에는 data 부분이 적절히 encoding 되어야 한다.
        // PNG 예) data:image/png;base64,iVBORw0KGgoAAAANS...==">
        // SVG 예) data:image/svg+xml;base64,MTUuMDcgMS4yNmMtLjU5L...">
        // SVG 예) data:image/svg+xml,<svg fill="%23000000"...</svg>
        //         (base64 가 아니라면 encodeURI() 등의 인코딩 필요. # => %23 특히 중요)
        let iconElement = document.createElement("img");
        iconElement.src = icon;
        iconElement.style.cssText = `
            height: ${iconSize}px;
            width: ${iconSize}px;
            display: table-cell;
            vertical-align: middle;
            pointer-events: none;`;

        let centeredArea = document.createElement("div");
        centeredArea.style.cssText = `
            width: ${this.w - iconAreaWidth}px;
            white-space: pre;
            display: table-cell;
            vertical-align: middle;`;

        this.captionElement = document.createElement("span");
        this.captionElement.className = "svg-text";
        this.captionElement.contentEditable = false;
        this.captionElement.style.cssText = `font-size: ${fontSize}px`;
        this.captionElement.innerHTML = caption;

        this.commentElement = document.createElement("span");
        this.commentElement.className = "svg-text";
        this.commentElement.contentEditable = false;
        this.commentElement.style.cssText = `font-size: ${fontSize2}px; color: #777;`;
        this.commentElement.innerHTML = comment;

        iconArea.appendChild(iconElement);
        centeredArea.appendChild(this.captionElement);
        centeredArea.appendChild(document.createElement("br"));
        centeredArea.appendChild(this.commentElement);
        textArea.appendChild(centeredArea);

        this.rootElement.appendChild(iconArea);
        this.rootElement.appendChild(textArea);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.rootElement);

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
        this.rootElement.setAttributeNS(null, 'x', newX);
        this.rootElement.setAttributeNS(null, 'y', newY);
        this.anchors.movePosition(relX, relY);
        if (this.diagram.ready) {
            this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.NodeMoved);
        }
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class CircleBlock extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_CIRCLE_RADIUS * 2, BLOCK_CIRCLE_RADIUS * 2, userData, "hd-block");

        const svg = diagram.svg;
        this.shape = "Circle";
        this.radius = this.w / 2;
        this.iconSize = this.radius * 0.9;

        this.shapeElement = __makeSvgElement("circle", {
            "data-id": this.id,
            cx: x + this.radius,
            cy: y + this.radius,
            r: this.radius,
        }, [this.classPrefix, "draggable"]);

        this.iconElement = __makeSvgElement("image", {
            href: icon,
            width: this.iconSize,
            height: this.iconSize,
            style: "pointer-events: none",
        });

        this.captionElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        this.commentElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            comment);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.captionElement);
        svg.appendChild(this.commentElement);

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
        this.captionElement.setAttributeNS(null, 'x', newX);
        this.captionElement.setAttributeNS(null, 'y', newY);
        this.commentElement.setAttributeNS(null, 'x', newX);
        this.commentElement.setAttributeNS(null, 'y', newY + 15);
        this.anchors.movePosition(relX, relY);
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class CircleBlock2 extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_CIRCLE_RADIUS * 2, BLOCK_CIRCLE_RADIUS * 2, userData, "hd-block2");
        const svg = diagram.svg;
        this.shape = "Circle";
        this.w = this.w + 10;
        this.h = this.h + 10;
        let iconSize = 22;
        let iconAreaWidth = 30;
        let fontSize = BLOCK_FONT_SIZE;
        let lineHeight = 16;
        let radius = Math.min(this.w, this.h) * 0.1;
        this.commentShapeElement = null;
        this.commentForeignElement = null;
        this.commentArea = null;

        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            rx: "30px",
            width: this.w,
            height: this.h,
        }, [this.classPrefix, "draggable"]);

        this.rootElement = __makeSvgElement("foreignObject", {
            width: this.w,
            height: this.h,
            style: "position: relative; pointer-events: none;"
        });

        let contentArea = document.createElement("div");
        contentArea.className = `svg-text ${this.classPrefix + "-contentarea"}`;
        contentArea.style.cssText = `
            width: ${this.w}px;
            height: ${this.h}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 5px;
        `;

        let iconArea = document.createElement("div");
        iconArea.className = `svg-text ${this.classPrefix + "-iconarea"}`;
        iconArea.style.cssText = `
            width: ${iconAreaWidth}px;
            height: 40%;
            margin: 3px;
            border-radius: ${radius}px;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        `
        let textArea = document.createElement("div");
        textArea.className = `svg-text ${this.classPrefix + "-textarea"}`;
        textArea.style.cssText = `
            width: ${this.w - iconAreaWidth - 8}px;
            height: 60%;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: ${lineHeight}px;
            pointer-events: none;
        `;

        contentArea.appendChild(iconArea);
        contentArea.appendChild(textArea);

        let iconElement = document.createElement("img");
        iconElement.src = icon;
        iconElement.style.cssText = `
            height: ${iconSize}px;
            width: ${iconSize}px;
            display: flex;
            vertical-align: middle;
            pointer-events: none;`;

        this.captionElement = document.createElement("span");
        this.captionElement.className = "svg-text";
        this.captionElement.contentEditable = false;
        this.captionElement.style.cssText = `
            font-size: ${fontSize}px;
            display: inline-block;
            text-align: center;
            overflow: hidden;
            width: ${this.w}px;
            `;
        this.captionElement.innerHTML = caption;

        this.commentElement = document.createElement("span");
        this.commentElement.className = "svg-text";
        this.commentElement.contentEditable = false;
        this.commentElement.style.cssText = `font-size: ${fontSize}px; color: #777;`;
        this.commentElement.innerHTML = comment;

        iconArea.appendChild(iconElement);
        textArea.appendChild(this.captionElement);

        this.rootElement.appendChild(contentArea);
        svg.appendChild(this.shapeElement);
        svg.appendChild(this.rootElement);

        this.anchors = new AnchorGroup(diagram);
        this.anchors.add(this, "L", x, y + (this.h / 2));
        this.anchors.add(this, "R", x + this.w, y + (this.h / 2));
        this.anchors.add(this, "T", x + (this.w / 2), y);
        this.anchors.add(this, "B", x + (this.w / 2), y + this.h);

        this.shapeElement.addEventListener("mouseover", e => this.#mouseover(e));
        this.shapeElement.addEventListener("mouseout", e => this.#mouseout(e));

        this.initialize();
    }

    movePosition(relX, relY, newX, newY) {
        this.shapeElement.setAttributeNS(null, "x", newX);
        this.shapeElement.setAttributeNS(null, "y", newY);
        this.rootElement.setAttributeNS(null, "x", newX);
        this.rootElement.setAttributeNS(null, "y", newY);
        if (this.commentShapeElement) {
            svg.removeChild(this.commentShapeElement);
            svg.removeChild(this.commentForeignElement);
            this.commentShapeElement = null;
            this.commentForeignElement = null;
        }

        this.anchors.movePosition(relX, relY);
        if (this.diagram.ready) {
            this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.NodeMoved);
        }
    }

    #mouseover(e) {
        let LEFT_MARGIN = 10;
        if (this.comment.length > 0 && e.buttons === 0) {
            this.commentShapeElement = __makeSvgElement("rect", {
                width: this.w,
                height: this.h - 50,
                x: this.x - 40,
                y: this.y - 40,
                rx: "5px",
                visibility: "hidden",
            });

            this.commentForeignElement = __makeSvgElement("foreignObject", {
                width: this.w,
                height: this.h - 50,
                x: this.x - 40,
                y: this.y - 40,
                style: "pointer-events: none;",
                visibility: "hidden",
            });

            this.commentArea = document.createElement("div");
            this.commentArea.className = `svg-text ${this.classPrefix + "-textarea"}`;
            this.commentArea.style.cssText = `
                line-height: ${this.h - 50}px;
                pointer-events: none;
                text-align: center;
                color: white;
                display: inline-block;
                padding-left: ${LEFT_MARGIN / 2}px;
                font-size: ${this.fontSize}px;
                white-space: nowrap;
            `;
            this.commentArea.innerHTML = this.comment;

            this.commentShapeElement.appendChild(this.commentForeignElement);
            this.commentForeignElement.appendChild(this.commentArea);
            this.commentForeignElement.style.visibility = "visible";
            this.commentShapeElement.style.visibility = "visible";

            svg.appendChild(this.commentShapeElement);
            svg.appendChild(this.commentForeignElement);

            const newWidth = this.commentArea.getBoundingClientRect().width + LEFT_MARGIN;
            this.commentShapeElement.setAttribute("width", newWidth);
            this.commentForeignElement.setAttribute("width", newWidth);
            this.commentShapeElement.setAttribute("x", this.x - (newWidth / 2) + (this.w / 2));
            this.commentForeignElement.setAttribute("x", this.x - (newWidth / 2) + (this.w / 2));
        }
    }

    #mouseout(e) {
        if (this.commentShapeElement) {
            svg.removeChild(this.commentShapeElement);
            svg.removeChild(this.commentForeignElement);
            this.commentShapeElement = null;
            this.commentForeignElement = null;
        }
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class DiamondBlock extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_DIAMOND_DEFAULT_RADIUS * 2, BLOCK_DIAMOND_DEFAULT_RADIUS * 2, userData, "hd-block");

        const svg = diagram.svg;
        this.shape = "Diamond";
        this.radius = this.w / 2;
        this.iconSize = this.radius * 0.8;
        let xo = x + this.radius;
        let yo = y + this.radius;
        let pp = [`${x} ${yo}`, `${xo} ${y}`, `${xo + this.radius} ${yo}`, `${xo} ${yo + this.radius}`];

        this.shapeElement = __makeSvgElement("polygon", {
            "data-id": this.id,
        }, [this.classPrefix, "draggable"]);

        this.iconElement = __makeSvgElement("image", {
            href: icon,
            width: this.iconSize,
            height: this.iconSize,
            style: "pointer-events: none",
        });

        this.captionElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            caption);

        this.commentElement = __makeSvgTextElement(
            this.w,
            this.h,
            BLOCK_FONT_SIZE,
            comment);

        svg.appendChild(this.shapeElement);
        svg.appendChild(this.iconElement);
        svg.appendChild(this.captionElement);
        svg.appendChild(this.commentElement);

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
        this.captionElement.setAttributeNS(null, "x", newX);
        this.captionElement.setAttributeNS(null, "y", newY);
        this.commentElement.setAttributeNS(null, "x", newX);
        this.commentElement.setAttributeNS(null, "y", newY + 15);
        this.anchors.movePosition(relX, relY);
    }
}

/**
 * @example
 * @param {Diagram} diagram diagram
 * @param {string} id block id
 * @param {string} icon block icon
 * @param {string} caption block caption
 * @param {string} comment block comment
 * @param {number} x block x position
 * @param {number} y block y position
 * @returns {object} block object
 */
class DiamondBlock2 extends Block {
    constructor(diagram, id, icon, metaName, caption, comment, x, y, w, h, userData) {
        super(diagram, id, icon, metaName, caption, comment, x, y,
            BLOCK_DIAMOND_DEFAULT_RADIUS * 2, BLOCK_DIAMOND_DEFAULT_RADIUS * 2, userData, "hd-block2");

        const svg = diagram.svg;
        this.shape = "Diamond";
        let iconSize = 22;
        let iconAreaWidth = 35;
        let fontSize = BLOCK_FONT_SIZE;
        let lineHeight = 16;
        this.radius = this.w / 2;
        let xo = x + this.radius;
        let yo = y + this.radius;
        let pp = [`${x} ${yo}`, `${xo} ${y}`, `${xo + this.radius} ${yo}`, `${xo} ${yo + this.radius}`];
        this.commentShapeElement = null;
        this.commentForeignElement = null;
        this.commentArea = null;

        this.shapeElement = __makeSvgElement("polygon", {
            "data-id": this.id,
            width: this.w,
            height: this.h,
            points: pp,
        }, [this.classPrefix, "draggable"]);

        this.rootElement = __makeSvgElement("foreignObject", {
            width: this.w,
            height: this.h,
            style: "position: relative; pointer-events: none;"
        });

        let contentArea = document.createElement("div");
        contentArea.className = `svg-text ${this.classPrefix + "-contentarea"}`;
        contentArea.style.cssText = `
            width: ${this.w}px;
            height: ${this.h}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 5px;
        `;

        let iconArea = document.createElement("div");
        iconArea.className = `svg-text ${this.classPrefix + "-iconarea"}`;
        iconArea.style.cssText = `
            width: ${iconAreaWidth}px;
            height: 30%;
            margin-top: 10px;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        `;
        let textArea = document.createElement("div");
        textArea.className = `svg-text ${this.classPrefix + "-textarea"}`;
        textArea.style.cssText = `
            width: ${this.w}px;
            height: 40%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            text-align: center;
            line-height: ${lineHeight}px;
            pointer-events: none;
        `;

        contentArea.appendChild(iconArea);
        contentArea.appendChild(textArea);

        let iconElement = document.createElement("img");
        iconElement.src = icon;
        iconElement.style.cssText = `
            height: ${iconSize}px;
            width: ${iconSize}px;
            display: flex;
            vertical-align: middle;
            pointer-events: none;`;

        this.captionElement = document.createElement("span");
        this.captionElement.className = "svg-text";
        this.captionElement.contentEditable = false;
        this.captionElement.style.cssText = `
            font-size: ${fontSize}px;
            display: inline-block;
            text-align: center;
            overflow: hidden;
            width: ${this.w}px;
            `;
        this.captionElement.innerHTML = caption;

        this.commentElement = document.createElement("span");
        this.commentElement.className = "svg-text";
        this.commentElement.contentEditable = false;
        this.commentElement.style.cssText = `font-size: ${fontSize}px; color: #777;`;
        this.commentElement.innerHTML = comment;

        iconArea.appendChild(iconElement);
        textArea.appendChild(this.captionElement);

        this.rootElement.appendChild(contentArea);
        svg.appendChild(this.shapeElement);
        svg.appendChild(this.rootElement);

        this.anchors = new AnchorGroup(diagram);
        this.anchors.add(this, "L", x, y + this.radius);
        this.anchors.add(this, "R", x + (this.radius * 2), y + this.radius);
        this.anchors.add(this, "T", x + this.radius, y);
        this.anchors.add(this, "B", x + this.radius, y + (this.radius * 2));

        this.shapeElement.addEventListener("mouseover", e => this.#mouseover(e));
        this.shapeElement.addEventListener("mouseout", e => this.#mouseout(e));

        this.initialize();
    }

    movePosition(relX, relY, newX, newY) {
        let xo = newX + this.radius;
        let yo = newY + this.radius;
        let pp = [`${newX} ${yo}`, `${xo} ${newY}`, `${xo + this.radius} ${yo}`, `${xo} ${yo + this.radius}`];
        this.shapeElement.setAttributeNS(null, "points", pp.join(","));
        this.shapeElement.setAttributeNS(null, "x", newX);
        this.shapeElement.setAttributeNS(null, "y", newY);
        this.rootElement.setAttributeNS(null, "x", newX);
        this.rootElement.setAttributeNS(null, "y", newY);
        if (this.commentShapeElement) {
            svg.removeChild(this.commentShapeElement);
            svg.removeChild(this.commentForeignElement);
            this.commentShapeElement = null;
            this.commentForeignElement = null;
        }

        this.anchors.movePosition(relX, relY);
        if (this.diagram.ready) {
            this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.NodeMoved);
        }
    }

    #mouseover(e) {
        let LEFT_MARGIN = 10;
        if (this.comment.length > 0 && e.buttons === 0) {
            this.commentShapeElement = __makeSvgElement("rect", {
                width: this.w,
                height: this.h - 70,
                x: this.x,
                y: this.y - 40,
                rx: "5px",
                visibility: "hidden",
            });

            this.commentForeignElement = __makeSvgElement("foreignObject", {
                width: this.w,
                height: this.h - 70,
                x: this.x,
                y: this.y - 40,
                style: "pointer-events: none;",
                visibility: "hidden",
            });

            this.commentArea = document.createElement("div");
            this.commentArea.className = `svg-text ${this.classPrefix + "-textarea"}`;
            this.commentArea.style.cssText = `
                line-height: ${this.h - 70}px;
                pointer-events: none;
                text-align: center;
                color: white;
                display:inline-block;
                padding-left: ${LEFT_MARGIN / 2}px;
                font-size: ${this.fontSize}px;
                white-space: nowrap;
            `;
            this.commentArea.innerHTML = this.comment;

            this.commentShapeElement.appendChild(this.commentForeignElement);
            this.commentForeignElement.appendChild(this.commentArea);
            this.commentForeignElement.style.visibility = "visible";
            this.commentShapeElement.style.visibility = "visible";

            svg.appendChild(this.commentShapeElement);
            svg.appendChild(this.commentForeignElement);

            const newWidth = this.commentArea.getBoundingClientRect().width + LEFT_MARGIN;
            this.commentShapeElement.setAttribute("width", newWidth);
            this.commentForeignElement.setAttribute("width", newWidth);
            this.commentShapeElement.setAttribute("x", parseInt(this.x) - (newWidth / 2) + (this.w / 2));
            this.commentForeignElement.setAttribute("x", parseInt(this.x) - (newWidth / 2) + (this.w / 2));
        }
    }

    #mouseout(e) {
        if (this.commentShapeElement) {
            svg.removeChild(this.commentShapeElement);
            svg.removeChild(this.commentForeignElement);
            this.commentShapeElement = null;
            this.commentForeignElement = null;
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
class Link extends UIComponent {
    constructor(diagram, id, caption, blockOrigin, blockDest, posOrigin, posDest, selected) {
        super(diagram, "L", id);

        this.caption = caption;
        this.blockOrigin = blockOrigin;
        this.blockDest = blockDest;
        this.posOrigin = posOrigin;
        this.posDest = posDest;
        this.anchorFrom = blockOrigin.anchors.get(posOrigin);
        this.anchorTo = blockDest.anchors.get(posDest);
        this.lineType = diagram.options.lineType;
        this.hoverTimeout = 0;

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
        this.shapeElement.addEventListener("mouseover", e => this.#mouseover(e));
        this.shapeElement.addEventListener("mouseout", e => this.#mouseout(e));
        this.textElement.addEventListener("click", e => this.#mouseclick(e));
        this.textElement.addEventListener("dblclick", e => this.#mousedblclick(e));
        this.textElement.addEventListener("mouseover", e => this.#mouseover(e));
        this.textElement.addEventListener("mouseout", e => this.#mouseout(e));

        blockOrigin.links.set(this.id, this);
        blockDest.links.set(this.id, this);

        if (diagram.ready) {
            diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, blockOrigin, ModifyEventTypes.LinkAdded);
        }

        if (selected) {
            this.select();
        }
    }

    select() {
        if (!this.selected) {
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
        this.blockOrigin.links.delete(this.id);
        this.blockDest.links.delete(this.id);
        this.diagram.components.delete(this.id);
        this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.LinkRemoved);
    }

    #mouseover(e) {
        this.hoverTimeout = setTimeout(() => {
            this.blockOrigin.shapeElement.classList.add("connect-block");
            this.blockDest.shapeElement.classList.add("connect-block");
        }, 500);
    }

    #mouseout(e) {
        clearTimeout(this.hoverTimeout);
        this.blockOrigin.shapeElement.classList.remove("connect-block");
        this.blockDest.shapeElement.classList.remove("connect-block");
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
        if (!this.selected) {
            // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
            if (!e.shiftKey) {
                this.diagram.clearSelection(this);
            }
            // selected 효과는 click 을 통한 select 시에만 주도록한다.
            // SelectionBox 를 통한 select 일 때는 select 되는 것은
            // 선택되었다는 효과는 주지 않는다. (임시방편임)
            this.shapeElement.classList.remove('hd-link');
            this.shapeElement.classList.add('hd-link-selected');
            this.textElement.classList.remove('hd-link-text');
            this.textElement.classList.add('hd-link-text-selected');
            this.select();
        }
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

    /**
     * @param {Link} link
     * @param {NodeWrapper} node 
     */
    static serialize(link, node) {
        // <choice event="ok" target="00000001" svg-origin-anchor="2" svg-dest-anchor="0" svg-selected="false"/>
        let cnode = node.appendChild("choice");
        cnode.attr("event", link.caption);
        cnode.attr("target", link.blockDest.id);
        cnode.attr("svg-origin-anchor", reverseAnchorPosition[link.posOrigin]);
        cnode.attr("svg-dest-anchor", reverseAnchorPosition[link.posDest]);
        cnode.attr("svg-selected", String(link.selected));
    }

    /**
     * @param {Diagram} diagram 
     * @param {NodeWrapper} node 
     * @returns {Block} new block object
     */
    static deserialize(block, node) {
        let diagram = block.diagram;
        let event = node.attr("event");
        let target = node.attr("target");
        let svgOriginAnchor = node.attr("svg-origin-anchor");
        let svgDestAnchor = node.attr("svg-dest-anchor");
        let svgSelected = node.attrAsBoolean("svg-selected");
        return new Link(diagram,
            diagram.generateId(),
            event,
            block,
            diagram.components.get(target),
            convertAnchorPosition[svgOriginAnchor],
            convertAnchorPosition[svgDestAnchor],
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
     * @param {number} id
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} text
     * @param {boolean} selected
     * @returns {object} memo object
     */
    constructor(diagram, id, x, y, w, h, text, selected) {
        super(diagram, "M", id);

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.oldText = text;
        this.selected = false;
        this.shapePadding = 2;
        this.lookAndFeel = diagram.options.lookAndFeel.memo;

        this.shapeElement = __makeSvgElement("rect", {
            "data-id": this.id,
            x,
            y,
            width: w,
            height: h,
            // 이것은 style 속성에 넣지 않는다. class 보다 우선하기 때문에 제어가 되지 않는다.
            stroke: this.lookAndFeel.borderColor,
            "stroke-width": 1,
            style: `
                fill: ${this.lookAndFeel.backgroundColor};
                padding: ${this.shapePadding}px`
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
        textArea.style.cssText = `
            white-space: pre;
            width: 100%;
            height: 100%;
            padding: 5px;
            font-size: ${this.lookAndFeel.fontSize};
            overflow: auto;
            pointer-events: none`;
        textArea.innerHTML = text;
        this.textElement.appendChild(textArea);

        this.shapeElement.addEventListener("click", e => this.#mouseclick(e));
        this.shapeElement.addEventListener("dblclick", e => this.#mousedblclick(e));
        this.textArea.addEventListener("focusout", e => this.#focusout(e));

        this.svg.appendChild(this.shapeElement);
        this.svg.appendChild(this.textElement);

        //이걸 꼭 ready하는 시점에서 해야하는지 의문
        if (diagram.ready) {
            diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.MemoAdded);
        }
        if (selected) {
            this.select();
        }
    }

    setText(text) {
        this.textArea.textContent = text;
        this.text = text;
        this.oldText = text;
    }

    select() {
        let options = this.diagram.options;
        if (!this.selected) {
            __setSvgAttrs(this.shapeElement, {
                stroke: this.lookAndFeel.borderColorSelected,
                "stroke-width": 3
            });
            this.selected = true;
            this.diagram.appendToSelection(this);
        }
    }

    unselect() {
        let options = this.diagram.options;
        if (this.selected) {
            __setSvgAttrs(this.shapeElement, {
                stroke: this.lookAndFeel.borderColor,
                "stroke-width": 1
            });
            this.selected = false;
            this.diagram.removeFromSelection(this);
        }
    }

    remove() {
        let options = this.diagram.options;
        this.svg.removeChild(this.shapeElement);
        this.svg.removeChild(this.textElement);
        this.diagram.components.delete(this.id);
        this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.MemoRemoved);
    }

    movePosition(relX, relY, newX, newY) {
        this.shapeElement.setAttributeNS(null, 'x', newX);
        this.shapeElement.setAttributeNS(null, 'y', newY);
        this.textElement.setAttributeNS(null, 'x', newX + this.shapePadding);
        this.textElement.setAttributeNS(null, 'y', newY + this.shapePadding);
        this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.MemoMoved);
    }

    #mouseclick(e) {
        if (!this.selected) {
            // Diagram 의 MouseDown, MouseClick 과 처리가 겹칠 수 있기 때문에 주의해야 한다.
            if (!e.shiftKey) {
                this.diagram.clearSelection(this);
            }
            this.select();
            e.stopPropagation();
        }
    }

    #mousedblclick(e) {
        this.textArea.classList.remove("svg-text");
        this.textArea.contentEditable = true;
        this.textArea.style.pointerEvents = "auto";
        this.oldText = this.textArea.textContent;
    }

    #focusout(e) {
        this.textArea.classList.add("svg-text");
        this.textArea.contentEditable = false;
        this.textArea.style.pointerEvents = "none";
        if (this.oldText !== this.textArea.textContent) {
            this.text = this.textArea.textContent;
            this.diagram.actionManager.append(ActionManager.MEMO_TEXT_MODIFIED,
                { memo: this, oldValue: this.oldText, newValue: this.text });
            this.diagram.fireEvent(EVENT_DIAGRAM_MODIFIED, this, ModifyEventTypes.MemoContentModified);
        }
    }

    /**
     * @param {Memo} memo
     * @param {NodeWrapper} node 
     */
    static serialize(memo, node) {
        let textNode = node.appendChild("text");
        textNode.value(memo.text);
        let svgNode = node.appendChild("svg");
        let boundsNode = svgNode.appendChild("bounds");
        let selectedNode = svgNode.appendChild("selected");
        boundsNode.value(`${memo.x},${memo.y},${memo.w},${memo.h}`);
        selectedNode.value(String(memo.selected));
    }

    /**
     * @param {Diagram} diagram 
     * @param {NodeWrapper} node 
     * @returns {Memo} new memo object
     */
    static deserialize(diagram, node) {
        let text = node.child("text").value();
        let bounds = node.child("svg/bounds").value();
        let [x, y, w, h] = bounds.split(",");
        let selected = node.child("svg/selected").valueAsBoolean();

        return new Memo(
            diagram,
            diagram.generateId(),
            parseInt(x),
            parseInt(y),
            parseInt(w),
            parseInt(h),
            text,
            selected);
    }
}

// if (!globalThis.DOMParser) {
//     await import("jsdom").then(jsdom => {
//         globalThis.DOMParser = (new jsdom.JSDOM()).window.DOMParser;
//     }).catch(e =>
//         console.error("module not loaded:", e)
//     );
// }

/**
 * NodeWrapper
 */
class NodeWrapper {
    /**
     * parseFromXML
     * @param {string} xmlText XML Text
     * @return {NodeWrapper} NodeWrapper
     */
    static parseFromXML(xmlText) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xmlText, "text/xml");
        return new NodeWrapper(xmlDoc);
    }

    /**
     * constructor
     * @param node DOMParser Node
     * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
     */
    constructor(node) {
        if (node === undefined) {
            throw new Error("Node argument required");
        }

        if (typeof node === "string") {
            // 문자열로 입력하는 경우 rootNode 의 이름으로 보고
            // XML 문서를 새롭게 만든다. 그리고 이 클래스는 rootNode
            // 를 가르키도록 설정한다.
            let rootName = node;
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                 <${rootName}></${rootName}>`,
                "text/xml");
            this.doc = xmlDoc;
            this.node = xmlDoc.childNodes[0];
        } else {
            if (node.ownerDocument) {
                this.doc = node.ownerDocument;
                this.node = node;
            } else {
                // 이 경우는 node 자체가 document 객체이며
                // 이 경우도 사용가능하도록 해줌.
                this.doc = node;
                this.node = node.childNodes[0];
            }
        }

        this.nodeType = this.node.nodeType;
        // Node.ELEMENT_NODE            : 1
        // Node.ATTRIBUTE_NODE          : 2
        // Node.TEXT_NODE               : 3
        // Node.CDATA_SECTION_NODE      : 4
        // Node.COMMENT_NODE            : 8
        // Node.DOCUMENT_NODE           : 9
        if (this.nodeType !== 1) {
            throw new Error("Only Element node allowed");
        }
    }

    /**
     * root 노드를 반환한다.
     */
    root() {
        // Root node 는 반드시 하나 있어야 한다.
        // 없으면 XML 문법 오류로 볼 수 있다.
        return new NodeWrapper(this.doc.childNodes[0]);
    }

    /**
     * 상위 노드를 반환한다.
     */
    parent() {
        return new NodeWrapper(this.node.parentNode);
    }

    /**
     * 주어진 path 를 만족하는 Child Node 를 반환한다.
     * 복수의 Node 가 있는 경우 첫번째 것을 가져온다.
     * 입력하지 않거나 유효한 값이 아니면 기본값인 "*" 가 사용된다.
     * 이 경우에는 바로 하위에 있는 Child Node 중 첫번째 것을 반환한다.
     * 
     * @param {string} path xpath expression
     * @returns {NodeWrapper} Child Node
     */
    child(path) {
        // 주의) path 가 / 로 시작하면 rootNode 를 가리키지만
        // 아래에서는 현재 node 의 context 의 하위에서 찾게 된다.
        // 주의) path 의 말단은 Element Node 여야 한다.
        if (!path) {
            path = "*";
        }
        let iterator = this.doc.evaluate(path,
            this.node,
            null,
            5, // XPathResult.ORDERED_NODE_ITERATOR_TYPE
            null);
        let child = iterator.iterateNext();
        return child ? new NodeWrapper(child) : null;
    }

    /**
     * 주어진 path 를 만족하는 모든 Child Node 들을 List 로 반환한다.
     * 입력하지 않거나 유효한 값이 아니면 기본값인 "*" 가 사용된다.
     * 이 경우에는 바로 하위에 있는 모든 Child Node 들을 가져온다.
     * 
     * @param {string} path xpath expression
     * @returns {NodeWrapper[]} NodeWrapper list
     */
    children(path) {
        // 주의) path 가 / 로 시작하면 rootNode 를 가리키지만
        // 아래에서는 현재 node 의 context 의 하위에서 찾게 된다.
        // 주의) path 의 말단은 Element Node 여야 한다.
        if (!path) {
            path = "*";
        }
        let iterator = this.doc.evaluate(path,
            this.node,
            null,
            5, // XPathResult.ORDERED_NODE_ITERATOR_TYPE
            null);
        let children = [];
        let child = null;
        while (child = iterator.iterateNext()) {
            children.push(new NodeWrapper(child));
        }
        return children;
    }

    /**
     * 새로운 element 를 만들어 현재 Node 의 child 로 저장한 후 반환한다.
     * 
     * @param {string} name new child element name
     */
    appendChild(name, namespaceURI = undefined) {
        let node;
        if (namespaceURI === undefined) {
            node = this.doc.createElement(name);
        } else {
            // namespaceURI 는 null 일 수 있음.
            node = this.doc.createElementNS(namespaceURI, name);
        }
        this.node.appendChild(node);
        return new NodeWrapper(node);
    }

    /**
     * @param {any} node NodeWrapper or Node
     */
    appendNode(node) {
        if (node instanceof NodeWrapper) {
            this.node.appendChild(node.node);
        } else {
            this.node.appendChild(node);
        }
    }

    /**
     * xpath 에 해당하는 child 를 모두 제거한다. 
     * 
     * @param {string} path xpath expression
     */
    removeChild(path) {
        for (let child of this.children(path)) {
            this.node.removeChild(child.node);
        }
    }

    /**
     * 파라미터 val 이 주어진다면 현재 노드의 textContent 값을 변경한다.
     * 파라미터가 주어지지 않는다면 기존의 값을 반환한다.
     * 
     * @param {any} val new value
     */
    value(val = undefined) {
        if (val === undefined) {
            return this.node.textContent;
        } else {
            this.node.textContent = val;
        }
    }

    /**
     * 현재 노드의 textContent 값을 parseInt() 를 사용하여 
     * integer 로 변환하여 반환한다.
     */
    valueAsInt() {
        return parseInt(this.value());
    }

    /**
     * 현재 노드의 textContent 값이 대소문자 구분없이 "true" 인 경우에 true 를 반환한다.
     */
    valueAsBoolean() {
        return String(this.value()).toLowerCase() === "true";
    }

    /**
     * attrs
     */
    attrs() {
        let attrs = {};
        for (let item of this.node.attributes) {
            attrs[item.name] = item.value;
        }
        return attrs;
    }

    /**
     * 현재 노드의 attribute 값을 가져오거나 새 값을 저장한다.
     * 두번째 파라미터 value 가 주어진다면 해당 파라미터의 값을 변경하거나 추가한다.
     * 두번째 파라미터가 주어지지 않는다면 attribute 값을 반환하거나 해당 
     * attribute 가 존재하지 않는다면 null 을 반환한다.
     * 
     * @param {string} name attribute name
     * @param {any} value new attribute value
     */
    attr(name, value = undefined) {
        let attributes = this.node.attributes;
        let item = attributes.getNamedItem(name);
        if (value === undefined) {
            // getNamedItem() 해당 이름이 없다면 null 반환.
            return item === null ? null : item.value;
        } else {
            if (item === null) {
                let attr = this.doc.createAttribute(name);
                attr.value = value;
                attributes.setNamedItem(attr);
            } else {
                item.value = value;
            }
        }
    }

    /**
     * attribute 의 값을 parseInt() 로 변환하여 반환한다.
     * 
     * @param {string} name attribute name
     */
    attrAsInt(name) {
        // parseInt(null): NaN 가 발생할 수 있다.
        return parseInt(this.attr(name));
    }

    /**
     * attribute 의 값이 대소문자 상관없이 "true" 와
     * 일치하는 경우에는 true 를 반환한다.
     * 
     * @param {string} name attribute name
     */
    attrAsBoolean(name) {
        return String(this.attr(name)).toLowerCase() === "true";
    }

    /**
     * 
     * @param {string} name attribute name
     */
    removeAttribute(name) {
        this.node.removeAttribute(name);
    }

    /**
     * toString()
     */
    toString(declaration = true, version = "1.1") {
        if (!globalThis.XSLTProcessor) {
            // no XSLTProcessor in Node
            return this.node.outerHTML;
        }
        try {
            if (!NodeWrapper.xsltDoc) {
                // Class 의 static 선언으로 옮기면 어떤 환경에서는 에러가 발생한다.
                NodeWrapper.xsltDoc = new DOMParser().parseFromString(`
                    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                        <xsl:output 
                            method="xml"
                            indent="yes"
                            standalone="yes"
                            version="${version}"
                            encoding="utf-8"
                            cdata-section-elements="functions source"
                            omit-xml-declaration="yes" />
                        <xsl:strip-space elements="*"/>
                        <xsl:template match="para[content-style][not(text())]">
                            <xsl:value-of select="normalize-space(.)"/>
                        </xsl:template>
                        <xsl:template match="node()|@*">
                            <xsl:copy>
                                <xsl:apply-templates select="node()|@*"/>
                            </xsl:copy>
                        </xsl:template>
                    </xsl:stylesheet>`, "application/xml");
            }

            // outerHTML 보다 formatting 잘 되어 보기 편하다.
            const xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(NodeWrapper.xsltDoc);
            const resultDoc = xsltProcessor.transformToDocument(this.node);
            let xmlText = "";
            if (declaration) {
                xmlText = `<?xml version="${version}" encoding="utf-8"?>\n`;
            }
            xmlText += new XMLSerializer().serializeToString(resultDoc);
            return xmlText;
        } catch (e) {
            console.error(e);
            return this.node.outerHTML;
        }
    }
}

export { Diagram, ModifyEventTypes, KeyActionNames, NodeWrapper };