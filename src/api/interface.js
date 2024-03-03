import axios from "axios"
import { GET_BLOCK_META_URL, GET_PROJECT_URL, GET_WORKSPACE_URL, POST_PROJECT_URL } from "./serverinfo"

export const RESULT_CODE = {
	OK: "0000"
}

const META_RESULT_CODE = "result_code"
const META_ERROR_MESSAGE = "error_message"

const validateResponse = ({
	response
}) => {
	if (!response) {
		return false;
	}

	if (!response[META_RESULT_CODE] || !response[META_ERROR_MESSAGE]) {
		return false;
	}

	return true;
}

const httpRequest = async (
	_method,
	_url,
	_data,
	_verbose,
) => {
	let data = null;
	if (_verbose) {
		console.info("method: " + _method);
		console.info("url " + _url);
		console.info("request: " + JSON.stringify(_data));
	}

	await axios({
		method: _method,
		url: _url,
		data: _data
	}).then((response) => {
		if (response.data) {
			data = response.data;
		}
	}).catch((error) => {
		if (error.response) {
			data = error.response.data;
		}
	})
	
	if (_verbose) {
		console.log("response: " + JSON.stringify(data));
	}
	return data;
}

const getMetaJson = () => {
	return httpRequest("get", "/block-meta");
}

const getProjectList = () => {
	return httpRequest("get", "/project", null, true);
}

const getSnapshotList = () => {
	return httpRequest("get", "/snapshot", null, true);
}

const createProject = (
	_workspace,
	_project_name,
	_description
) => {
	const data = {
		workspace: _workspace,
		project_name: _project_name,
		description: _description
	}
	return httpRequest("post", "/project?action=create", data, true);
}

const openProject = (
	_project_id,
	_project_name
) => {
	return httpRequest('get', '/project/' + _project_id + '/' + _project_name, null, true);
}

const getWorkspace = () => {
	return httpRequest("get", GET_WORKSPACE_URL, null, true);
}

export { getMetaJson }
export { getProjectList }
export { getSnapshotList }
export { getWorkspace }
export { createProject }
export { openProject }