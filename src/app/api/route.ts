import { NodeWrapper } from "@/lib/diagram";
import { JSDOM } from "jsdom";

export async function GET(request: Request) {
    const xmlString = `<root>
    <message>Hello&#32;World&#33;</message>
    <newlines>Line1&#10;Line2&#13;Line3&#xA;Line4&#xD;Line5&#10;</newlines>
</root>`
    
    const dom = new JSDOM(xmlString, { contentType: "text/xml" });
    const rootNode = dom.window.document.getRootNode().childNodes[0];

    const wrapper = new NodeWrapper(rootNode);
    console.log(wrapper.toString());
    
    
    return Response.json({ result: rootNode.firstChild?.nodeName });
}