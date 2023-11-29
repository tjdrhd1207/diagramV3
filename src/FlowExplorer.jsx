// @ts-nocheck
import React from 'react';


class Directory extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isExpanded: false,
		}
		this.fileinfo = {
			name: "src",
			type: "folder",
			items: [
				{
					name: "ivrmain",
					type: "file"
				}
			]

		};
	}

	fileTree = () => {
		const addFiles = files => {
			const {name, type, items} = files;
			if (type === "folder") {
				return (
					<div key={name} className="folder">
						<h4
							className="folder-name"
							onClick={() => this.setState({isExpanded: !(this.state.isExpanded)})}
						>
							{name}
						</h4>
						{	
							this.state.isExpanded && items.map((item) => addFiles(item))
						}
					</div>
				)
			} else {
				return (
					<div key={name} className="file">{name}</div>
				)
			}
		};
		return (
			<div>{addFiles(this.fileinfo)}</div>
		)
	}
	render() {
		return (
			<>
				{this.fileTree()}
			</>
		)
	}
}

export default Directory