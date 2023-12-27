import { HttpResponse, http } from "msw";
import metadata from "./data/meta.json"
import wsinfodata from "./data/wsinfo.json"
import { GET_BLOCK_META_URL, GET_WORKSPACE_INFO_URL } from "../api/serverinfo";

export const handlers = [
	http.get(GET_BLOCK_META_URL, (req, res, ctx) => {
		return HttpResponse.json(metadata);
	}),
	http.get(GET_WORKSPACE_INFO_URL, (req, res, ctx) => {
		return HttpResponse.json(wsinfodata);
	}),
]