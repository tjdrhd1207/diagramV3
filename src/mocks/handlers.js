import { HttpResponse, http } from "msw";
import { GET_BLOCK_META_URL, GET_PROJECT_URL, GET_WORKSPACE_URL, POST_PROJECT_URL } from "../api/serverinfo";
import workspace_info from "./data/workspace_info.json";
import { ivr_simple_xml } from "./scn/IVR_Simple";

var WORKSPACE_INFO = workspace_info

const makeMetaJson = (
	_result_code,
	_error_message
) => {
	return {
		result_code: _result_code,
		error_message: _error_message
	}
}

export const handlers = [
	/**
	 * 
	 */
	http.get('/block-meta', async() => {
		let data = undefined;
		await import('./data/block_meta.json')
		.then(json => data = json.default)
		.catch(err => {});
		return HttpResponse.json(data);
	}),
	/**
		RESPONSE
		{
			"result_code": "0000",
			"error_message": "OK",
			"data": [
				{
					"workspace_name": "Default",
					"project_name": "IVR_DEMO",
					"project_id": "project-10010",
					"update_date": "20230904",
					"update_time": "131327",
					"description": "콜봇대상조회버전"
				},
				{
					"workspace_name": "Default",
					"project_name": "IVR_DEMO",
					"project_id": "project-10011",
					"update_date": "20230904",
					"update_time": "131325",
					"description": "콜봇대상조회버전"
				},
				{
					"workspace_name": "Default",
					"project_name": "IVR_DEMO",
					"project_id": "project-10012",
					"update_date": "20230904",
					"update_time": "131324",
					"description": "콜봇대상조회버전"
				}
			]
		}
	 */
	http.get('/project', async() => {
		let data = null;
		await import('./data/project_list.json')
			.then(json => data = json.default)
			.catch(err => {});
		return HttpResponse.json(data, { status: 200 });
	}),
	/**
	
	 */
	http.get('/project', () => {

	}),
	http.get('/project/:project_id/:page_file_name', async({ params }) => {
		const { project_id, page_file_name } = params;
		return HttpResponse.xml(ivr_simple_xml);
	}),
	/**
	 REQUEST
	 {
		 "method": "create" or "delete",
		 "worksace": "xxxx",
		 "project_name": "xxxx",
		 "description": "xxxxxxxxxxxxxxxxxxxxxxx",
		}
		RESPONSE : application/json
		{
			"result_code": "0000",
			"error_message": "OK"
			"data" : {
				"project_id": "prj_123123"
			}
		}
	}
	*/
	http.post("/project", async({ request }) => {
		const url = new URL(request.url);
		const data = await request.json();
		const action = url.searchParams.get('action');

		console.info('action: ' + action + ', data: ' + JSON.stringify(data));
		const { workspace, project_name } = data;

		if (!workspace || !project_name) {
			return HttpResponse.json({
				...makeMetaJson('9999', 'Bad request data')
			}, { status: 400 });
		}

		if (action === 'create') {
			return HttpResponse.json({
				...makeMetaJson('0000', 'OK'),
				data: {
					project_id: crypto.randomUUID()
				}
			}, { status: 200 })
		} else if (action === 'delete') {

		} else {

		}	
	}),
	/**
		RESPONSE : application/json
		{
			"result_code": "200",
			"error_message": "정상",
			"data": [
				{
					"workspace_name": "Default",
					"project_id" : "project-20240116120057",
					"project_name": "IVR_DEMO",
					"project_version": "1",
					"create_date": "2024-01-16",
					"create_time": "13:50:43",
					"description": "콜봇대상조회버전",
					"scenario_key": "scenario-2015645854",
					"modifier": "admin"
				}
			]
		}
	 */
	http.get("/snapshot", async() => {
		let data = undefined;
		await import('./data/snapshot_list.json')
			.then(json => data = json.default)
			.catch(err => {});
		return HttpResponse.json(data, { status: 200 });
	}),
	/**
		RESPONSE
		{
			"result_code": "0000",
			"error_message": "OK",
			"data": {
				"workspaces": [
					{
						"workspace_name": "Default", "project_names": ["IVR_DEMO", "KB_CAPITAL", "KB_CARD"]
					}
				]
			}
		}
	 */
	http.get(GET_WORKSPACE_URL, async() => {
		let data = undefined;
		await import('./data/workspace_info.json')
			.then(json => data = json.default)
			.catch(err => {});
		return HttpResponse.json(WORKSPACE_INFO, { status: 200 });
	}),
]