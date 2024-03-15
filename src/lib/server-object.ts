export interface APIResponse {
    result: string,
    message: string,
    rows: any
}

export interface NewProjectRequest {
    workspace_name: string,
    project_name: string,
    description: string
}

export interface NewProjectResponse extends APIResponse {
    rows: {
        project_id: string
    }
}