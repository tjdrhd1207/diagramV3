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
    <page name="ivrmain.xml" start="true" tag="" />
  </scenario-pages>
  <variables key="app">
  </variables>
  <functions />
  <interface />
</scenario>`;

export const $DummyFlowXML = `<?xml version="1.1" encoding="utf-8"?>
<scenario>
  <block id="99999999" desc="시작" comment="" meta-name="StartNode">
    <start>
      <variables key="ivrmain">
      </variables>
    </start>
    <svg>
      <bounds>45,30,75,70</bounds>
      <selected>false</selected>
    </svg>
  </block>
</scenario>`;

export const createDummyFlowXML = (flowName: string) => {
    let varKey = flowName;
    const index = flowName.lastIndexOf(".");
    if (index > 0) {
        varKey = flowName.substring(0, index);
    } 
    return `<?xml version="1.1" encoding="utf-8"?>
<scenario>
  <block id="99999999" desc="시작" comment="" meta-name="StartNode">
    <svg>
      <bounds>45,30,75,70</bounds>
      <selected>false</selected>
    </svg>
    <start>
      <variables key="${varKey}"/>
    </start>
  </block>
</scenario>`
}