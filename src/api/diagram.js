export default function HansolDiagram()  {
	class Diagram {
		constructor(querySelector, options) {
			this.svg = document.querySelector(querySelector);
			this.options = options;
			this.createMode = false;
			this.createUserProps = null;
	
			this.svg.addEventListener("click", (e) => this.svgClick(e));
		}
	
		setCreateMode(userProps) {
			this.createMode = true;
			this.createUserProps = userProps;
		}
	
		getMousePosition(evt) {
			let CTM = evt.target.getScreenCTM();
			return {
				x: (evt.clientX - CTM.e) / CTM.a,
				y: (evt.clientY - CTM.f) / CTM.d
			};
		}
	
		svgClick(e) {
			if (this.createMode) {
				this.createMode = false;
				let element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				let coord = this.getMousePosition(e);
				element.setAttributeNS(null, "x", String(coord.x));
				element.setAttributeNS(null, "y", String(coord.y));
				// element.setAttributeNS(null, "x", e.clientX);
				// element.setAttributeNS(null, "y", e.clientY);
				element.setAttributeNS(null, "width", "100");
				element.setAttributeNS(null, "height", "70");
				element.setAttributeNS(null, "class", "block");
				element.setAttributeNS(null, "data-userprops", JSON.stringify(this.createUserProps));
				element.addEventListener("click", (e) => this.nodeClick(e));
				this.svg.appendChild(element);
			}
		}
	
		nodeClick(e) {
			let onBlockClicked = this.options.onBlockClicked;
			if (onBlockClicked) {
				let element = e.target;
				let userProps = element.getAttributeNS(null, "data-userprops");
				let userPropsObj = JSON.parse(userProps);
				onBlockClicked(e.target, userPropsObj);
				element.setAttributeNS(null, "data-userprops", JSON.stringify(userPropsObj));
			}
		}
	}

	return {
		"Diagram": Diagram
	}
}