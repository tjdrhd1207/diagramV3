const xpathIterator = (path, rootNode) => rootNode.ownerDocument.evaluate(
	path,
	rootNode,
	null,
	XPathResult.ORDERED_NODE_ITERATOR_TYPE,
	null
);

// const xpathFirst = (path, rootNode) => xpathIterator(path, rootNode)?.iterateNext();
const xpathFirst = (path, rootNode) => rootNode.ownerDocument.evaluate(
	path,
	rootNode,
	null,
	XPathResult.FIRST_ORDERED_NODE_TYPE,
	null	
)?.singleNodeValue;

const firstChild = (childName, node) => {
	if (!node.children) {
		return;
	}
	for (let n = 0; n < node.children.length; n++) { // NOSONAR
		let child = node.children[n];
		if (child.nodeType !== Node.TEXT_NODE && child.nodeName === childName) {
			return child;
		}
	}
};

export const parseProjectXML = (xml) => {
	const projectObject = {
		pages: [],
		variables: [],
		functions: null,
		interface: {
			use_trim: null,
			message: []
		}
	}
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xml, 'text/xml');
	const rootNode = xmlDoc.childNodes[0];
	
	const page_nodes = xpathIterator('/scenario/scenario-pages/page', rootNode);
	let page;
	while (page = page_nodes.iterateNext()) {
		const name = page.getAttribute('name');
		const start = page.getAttribute('start')? true : false;
		const tag = page.getAttribute('tag');
		const lastOpened = page.getAttribute('lastOpened')? true : false;
		projectObject.pages.push({
			name: name,
			start: start,
			tag: tag,
			lastOpened: lastOpened
		})
	}

	const variables_nodes = xpathIterator('/scenario/variables', rootNode);
	let variables;
	while (variables = variables_nodes.iterateNext()) {
		const key = variables.getAttribute('key');
		const variable_nodes = xpathIterator('variable', variables);
		let variable, variable_list = [];
		while (variable = variable_nodes.iterateNext()) {
			const type = firstChild('type', variable).textContent;
			const name = firstChild('name', variable).textContent;
			const init_value = firstChild('init-value', variable).textContent;
			const description = firstChild('description', variable).textContent;
			variable_list.push({
				type: type,
				name: name,
				init_value: init_value,
				description: description
			});
		}
		projectObject.variables.push({
			key: key,
			variable: [...variable_list]
		})
	}

	const function_node = xpathFirst('/scenario/functions', rootNode);
	if (function_node) {
		projectObject.functions = function_node.textContent;
	}

	const interface_node = xpathFirst('/scenario/interface', rootNode);
	projectObject.interface.use_trim = firstChild('use-trim', interface_node).textContent;
	const message_nodes = xpathIterator('message', interface_node);
	let message, message_list = [];
	while (message = message_nodes.iterateNext()) {
		const code = firstChild('code', message).textContent;
		const name = firstChild('name', message).textContent;
		const variables_fixed_node = xpathFirst('variables-fixed', message);
		if (variables_fixed_node) {
			const variable_nodes = xpathIterator('variable', variables_fixed_node);
			let variable, variable_list = [];
			while (variable = variable_nodes.iterateNext()) {
				const mode = firstChild('mode', variable).textContent;
				const type = firstChild('type', variable).textContent;
				const value = firstChild('value', variable).textContent;
				const sort = firstChild('sort', variable).textContent;
				const replace = firstChild('replace', variable).textContent;
				const position = firstChild('position', variable).textContent;
				const length = firstChild('length', variable).textContent;
				const description = firstChild('description', variable).textContent;
				variable_list.push({
					mode: mode,
					type: type,
					value: value,
					sort: sort,
					replace: replace,
					position: position,
					length: length,
					description: description
				})
			}
			projectObject.interface.message.push({
				code: code,
				name: name,
				variable: [...variable_list]
			})
		}
	}

	return projectObject;
}

const convertMetaToXML = (meta) => {
	
}