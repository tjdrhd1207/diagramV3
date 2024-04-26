"use client"

import Editor, { Monaco } from "@monaco-editor/react"
import { languages } from "monaco-editor";
import { Box } from "@mui/material"
import React from "react" 
import dynamic from "next/dynamic";
import { useDiagramMetaStore, useProjectStore } from "@/store/workspace-store";
import { $Variable_Description_Tag, $Variable_Name_Tag, $Variable_Tag, $Variable_Type_Tag, $Variables_Attribute_Key, $Variables_Tag } from "@/consts/flow-editor";
import { NodeWrapper } from "@/lib/diagram";

export const EditorWithNoSSR = dynamic(
    () => import("./isacivr-js-editor").then((module) => module.ISACIVRJSEditor),
    { ssr: false }
)

const js_basic_snippets = (range: any) => [
    {
        label: "var",
        kind: languages.CompletionItemKind.Keyword,
        insertText: "var",
        range: range
    },
    {
        label: "if",
        kind: languages.CompletionItemKind.Keyword,
        insertText: "if",
        range: range
    },
    {
        label: "function",
        kind: languages.CompletionItemKind.Snippet,
        insertText: "function () {\n}",
        range: range
    },
    {
        label: "if",
        kind: languages.CompletionItemKind.Snippet,
        detail: "IF statement",
        insertText: "if (condition) {\n}",
        documentation: "if (condition) { }",
        range: range
    },
    {
        label: "ife",
        kind: languages.CompletionItemKind.Snippet,
        detail: "IF/ELSE statement",
        insertText: "if (condition) {\n} else {\n}",
        documentation: "if (condition) {\n} else {\n}",
        range: range
    },
    {
        label: "ei",
        kind: languages.CompletionItemKind.Snippet,
        detail: "ELSEIF statement",
        insertText: "else if (condition) {\n}",
        documentation: "else if (condition) {\n}",
        range: range
    },
    {
        label: "el",
        kind: languages.CompletionItemKind.Snippet,
        detail: "ELSE statement",
        insertText: "else {\n}",
        documentation: "else {\n}",
        range: range
    },
];

const js_util_snippets = (range: any) => [
    {
        label: "agentstatus",
        kind: languages.CompletionItemKind.Function,
        insertText: "agentstatus(dest_vdn, dest_station, user_data)",
        detail: "agentstatus(dest_vdn, dest_station, user_data)",
        documentation: "상담원 상태를 확인할 수 있습니다. 지원되는 CTI서버를 확인한 후 사용해야 합니다.",
        range: range,
    }, {
        label: "ani",
        kind: languages.CompletionItemKind.Function,
        insertText: "ani()",
        detail: "ani()",
        documentation: "채널에 현재 인입된 콜의 ani 번호를 가져옵니다. CTI이벤트에서 받을 정보를 기준으로 합니다.",
        range: range,
    }, {
        label: "ani_pbx",
        kind: languages.CompletionItemKind.Function,
        insertText: "ani_pbx()",
        detail: "ani_pbx()",
        documentation: "채널에 현재 인입된 콜의 ani 번호를 가져옵니다. SIP 상에서는 SIP 메세지상의 정보를 기준으로 합니다.",
        range: range,
    }
] as languages.CompletionItem[]

const ISACIVRJSEditor = (
    props: {
        code: string
        setModified: (value: string) => void
    }
) => {
    const projectXML = useProjectStore((state) => state.projectXML);

    const meta = useDiagramMetaStore((state) => state.meta);
    
    let varAccessKey = "app";
    const funcAccessKey = "util";

    const [completionDisposable, setCompletionDisposable] = React.useState<any>(null);

    const handleBeforeMount = (monaco: Monaco) => {
        console.log("handleBeforeMount", monaco);
        if (monaco) {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                noLib: true,
                allowNonTsExtensions: true
            });

            const xml = NodeWrapper.parseFromXML(projectXML);
            const variables = xml.child($Variables_Tag);
            const key = variables.attr($Variables_Attribute_Key);
            varAccessKey = key;
            const variable = variables.children($Variable_Tag);

            const disposable = monaco.languages.registerCompletionItemProvider("javascript", {
                triggerCharacters: ["."],
                provideCompletionItems: (model: any, position: any, context: any, token: any) => {
                    console.log(model, position, context, token);
                    const trigger = context.triggerCharacter;
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };
                    switch (trigger) {
                        case ".":
                            const line: string = model.getLineContent(position.lineNumber);
                            let keyword = line.slice(position.column - varAccessKey.length - 2, position.column - 2);
                            console.log(`line: ${line}, keyword: ${keyword}`);
                            if (line.slice(position.column - varAccessKey.length - 2, position.column - 2) === varAccessKey) {
                                return {
                                    suggestions: variable.map((v) => ({
                                        label: v.child($Variable_Name_Tag).value(),
                                        kind: languages.CompletionItemKind.Property,
                                        insertText: v.child($Variable_Name_Tag).value(),
                                        detail: `(${v.child($Variable_Type_Tag).value()}) ${v.child($Variable_Description_Tag).value()}`,
                                        range: range
                                    }))
                                };
                            } else if (line.slice(position.column - funcAccessKey.length - 2, position.column - 2) === funcAccessKey) {
                                const { utilFunctions } = meta;
                                return { suggestions: utilFunctions? utilFunctions.map((f: any) => ({
                                    label: f.label,
                                    kind: languages.CompletionItemKind.Function,
                                    insertText: f.insertText,
                                    detail: f.insertText,
                                    documentation: f.documentation,
                                    range: range
                                })) : [] }
                            } else {
                                return { suggestions: [ ...js_basic_snippets(range) ] };
                            }
                        default:
                            
                    }
                }
            });
            setCompletionDisposable(disposable);
        }
    }

    React.useEffect(() => {
        return () => {
            if (completionDisposable) {
                completionDisposable.dispose();
            }
        };
    }, [completionDisposable]);

    return (
        <Box sx={{ height: "100%" }}>
            {
                // typeof window === 'undefined' ? undefined :
                <Editor language="javascript" value={props.code}
                    beforeMount={handleBeforeMount}
                    // onMount={handleBeforeMount}
                    onChange={(value, ev) => {
                        // console.log(ev);
                        if (value !== undefined) {
                            props.setModified(value);
                        }
                    }} />
            }
        </Box>
    )
}

export { ISACIVRJSEditor }