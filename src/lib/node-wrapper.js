"use client"

/**
 * NodeWrapper
 */
export class NodeWrapper {
    // static xsltDoc = new DOMParser().parseFromString(`
    //     <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    //         <xsl:strip-space elements="*"/>
    //         <xsl:template match="para[content-style][not(text())]">
    //         <xsl:value-of select="normalize-space(.)"/>
    //         </xsl:template>
    //         <xsl:template match="node()|@*">
    //         <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
    //         </xsl:template>
    //         <xsl:output indent="yes"/>
    //     </xsl:stylesheet>`, "application/xml");

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
            node = xmlDoc.childNodes[0];
        }

        if (node.ownerDocument) {
            this.doc = node.ownerDocument;
            this.node = node;
        } else {
            // 이 경우는 node 자체가 document 객체이며
            // 이 경우도 사용가능하도록 해줌.
            this.doc = node;
            this.node = node.childNodes[0];
        }

        this.nodeType = this.node.nodeType;
        // Node.ELEMENT_NODE            : 1
        // Node.ATTRIBUTE_NODE          : 2
        // Node.TEXT_NODE               : 3
        // Node.CDATA_SECTION_NODE      : 4
        // Node.COMMENT_NODE            : 8
        // Node.DOCUMENT_NODE           : 9
        if (this.nodeType !== Node.ELEMENT_NODE) {
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
     * @param path xpath expression
     */
    child(path) {
        // 주의) path 가 / 로 시작하면 rootNode 를 가리키지만
        // 아래에서는 현재 node 의 context 의 하위에서 찾게 된다.
        // 주의) path 의 말단은 Element Node 여야 한다.
        let iterator = this.doc.evaluate(path,
            this.node,
            null,
            5, // XPathResult.ORDERED_NODE_ITERATOR_TYPE
            null);
        let child = iterator.iterateNext();
        return child ? new NodeWrapper(child) : null;
    }

    /**
     * @param path xpath expression
     */
    children(path) {
        // 주의) path 가 / 로 시작하면 rootNode 를 가리키지만
        // 아래에서는 현재 node 의 context 의 하위에서 찾게 된다.
        // 주의) path 의 말단은 Element Node 여야 한다.
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
     * 두번째 파라미터 value 가 주어진다면 값을 변경한 후 성공여부를 반환한다.
     * 두번째 파라미터가 주어지지 않는 경우 값을 반환하거나, 해당 child 가 없다면 null 을 반환한다.
     * 
     * @param path xpath expression
     * @param value new value
     */
    childValue(path, value) {
        let child = this.child(path);
        if (value === undefined) {
            return child ? child.value() : null;
        } else {
            if (child) {
                child.value(value);
                return true;
            }
            return false;
        }
    }

    /**
     * 새로운 element 를 만들어 현재 Node 의 child 로 저장한 후 반환한다.
     * 
     * @param name new child element name
     */
    childAppend(name) {
        let node = this.doc.createElement(name);
        this.node.appendChild(node);
        return new NodeWrapper(node);
    }

    /**
     * 파라미터 val 이 주어진다면 현재 노드의 textContent 값을 변경한다.
     * 파라미터가 주어지지 않는다면 기존의 값을 반환한다.
     * 
     * @param val new value
     */
    value(val) {
        if (val === undefined) {
            return this.node.textContent;
        } else {
            this.node.textContent = val;
        }
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
     * @param name attribute name
     * @param value new attribute value
     */
    attr(name, value) {
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
     * @param name attribute name
     * @see attr(name, value)
     */
    attrInt(name) {
        // parseInt(null): NaN 가 발생할 수 있다.
        return parseInt(attr(name));
    }

    /**
     * toString()
     */
    toString() {
        if (!NodeWrapper.xsltDoc) {
            // Class 의 static 선언으로 옮기면 어떤 환경에서는 에러가 발생한다.
            NodeWrapper.xsltDoc = new DOMParser().parseFromString(`
                <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                    <xsl:strip-space elements="*"/>
                    <xsl:template match="para[content-style][not(text())]">
                    <xsl:value-of select="normalize-space(.)"/>
                    </xsl:template>
                    <xsl:template match="node()|@*">
                    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
                    </xsl:template>
                    <xsl:output indent="yes"/>
                </xsl:stylesheet>`, "application/xml");
        }

        try {
            // outerHTML 보다 formatting 잘 되어 보기 편하다.
            const xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(NodeWrapper.xsltDoc);
            const resultDoc = xsltProcessor.transformToDocument(this.node);
            return new XMLSerializer().serializeToString(resultDoc);
        } catch (e) {
            console.error(e);
            return this.node.outerHTML;
        }
    }
}