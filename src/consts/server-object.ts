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

export const emptyResponse = () => {
    return {
        result: "",
        message: "",
        rows: undefined
    } as APIResponse
}

export const createDummyFlowXML = () => {
    return `<?xml version="1.1" encoding="utf-8"?>
<scenario>
  <block id="99999999" desc="시작" comment="" meta-name="StartNode">
    <svg>
      <bounds>45,30,75,70</bounds>
    </svg>
    <start>
      <variables key=""/>
    </start>
  </block>
</scenario>`
}