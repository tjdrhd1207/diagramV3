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

export const $DummyProjectFile = `<?xml version="1.0" encoding="utf-8"?>
<scenario designer-version="3.0.0">
  <options />
  <scenario-pages>
    <page name="ivrmain.xml" start="true" tag="" lastOpened="false"/>
  </scenario-pages>
  <variables key="app">
  </variables>
  <functions />
  <interface />
</scenario>`;

export const $DummyPageXML = `<?xml version="1.0" encoding="utf-8"?>
<scenario>
  <block id="99999999" desc="시작" meta-name="StartNode">
    <start>
      <user-comment></user-comment>
      <variables key="ivrmain">
      </variables>
    </start>
    <svg>
      <bounds>45,30,75,70</bounds>
      <selected>false</selected>
    </svg>
  </block>
</scenario>`;
