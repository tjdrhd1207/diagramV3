import React from "react";
import { Editor } from "@monaco-editor/react";
import { languages } from 'monaco-editor';
import JavascriptMonarch from "./JavascriptMonarch";

const custom_js = 'custom-js';

// https://marketplace.visualstudio.com/items?itemName=NicholasHsiang.vscode-javascript-snippet
/**
 * label : 표시할 문자
 * filterText: label 외 필터로 사용할 문자
 * insertText: 입력 문자열
 * detail: 설명
 * documentation: 상세 내용
 */
const js_basic_snippets = () => [
    {
        label: 'var',
        kind: languages.CompletionItemKind.Keyword,
        insertText: 'var'
    },
    {
        label: 'if',
        kind: languages.CompletionItemKind.Keyword,
        insertText: 'if'
    },
    {
        label: 'function',
        kind: languages.CompletionItemKind.Keyword,
        insertText: 'function'
    },
    {
        label: 'if',
        kind: languages.CompletionItemKind.Snippet,
        detail: 'IF statement',
        insertText: 'if (condition) {\n}',
        documentation: 'if (condition) { }',
    },
    {
        label: 'ife',
        kind: languages.CompletionItemKind.Snippet,
        detail: 'IF/ELSE statement',
        insertText: 'if (condition) {\n} else {\n}',
        documentation: 'if (condition) {\n} else {\n}',
    },
    {
        label: 'ei',
        kind: languages.CompletionItemKind.Snippet,
        detail: 'ELSEIF statement',
        insertText: 'else if (condition) {\n}',
        documentation: 'else if (condition) {\n}',
    },
    {
        label: 'el',
        kind: languages.CompletionItemKind.Snippet,
        detail: 'ELSE statement',
        insertText: 'else {\n}',
        documentation: 'else {\n}',
    },
];

const JSEditor = ({
    jsCode = null,
    onJsCodeChange = null,
    varAccessKey = 'app',
    varSnippets = null,
    funcAccessKey = 'util',
    funcSnippets = null,
    msgSnippets = null,
}) => {
    const [monaco, setMonaco] = React.useState(null);
    const [completionDisposable, setCompletionDisposable] = React.useState(null);

    const handleOnMound = (editor, monaco) => {
        monaco.languages.register({ id: custom_js });
        monaco.languages.setMonarchTokensProvider(custom_js, JavascriptMonarch);

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            noLib: true,
            allowNonTsExtensions: true
        });
        setMonaco(monaco);
    }

    const handleCodeChange = (value) => {
    }

    React.useEffect(() => {
        if (monaco) {
            setCompletionDisposable(
                monaco.languages.registerCompletionItemProvider('javascript', {
                    triggerCharacters: ['.'],
                    provideCompletionItems: (model, position) => {
                        const textUntilPosition = model.getValueInRange({
                            startLineNumber: position.lineNumber,
                            startColumn: 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        });
                        const lastCharacter = textUntilPosition.slice(-1);
                        if (lastCharacter === '.') {
                            const accessKey = textUntilPosition.slice(0, -1).match(/(\w+)$/)?.[0];
                            if (accessKey === 'app') {
                                return {
                                    suggestions: [
                                        {
                                            label: 'prop1',
                                            kind: monaco.languages.CompletionItemKind.Property,
                                            insertText: 'prop1',
                                        }
                                    ]
                                }
                            } else if (accessKey === 'util') {
                                return {
                                    suggestions: [
                                        {
                                            label: 'print',
                                            kind: monaco.languages.CompletionItemKind.Function,
                                            insertText: 'print(text);',
                                        }
                                    ]
                                }
                            } else {
                                return { suggestions: [] }
                            }
                        } else {
                            return {
                                suggestions: [
                                    ...js_basic_snippets(),
                                    {
                                        label: varAccessKey,
                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                        insertText: varAccessKey,
                                    },
                                    {
                                        label: funcAccessKey,
                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                        insertText: funcAccessKey,
                                    },
                                    {
                                        label: 'MESSAGE - 전문',
                                        kind: monaco.languages.CompletionItemKind.Keyword,
                                        insertText: 'app.a ="";\napp.b ="";',
                                    },
                                ]
                            };
                        }
                    }
                })
            );
        }
    }, [monaco]);

    React.useEffect(() => {
        return () => {
            if (completionDisposable) {
                completionDisposable.dispose();
            }
        };
    }, [completionDisposable]);

    const a = () => {

    }
    return (
        <Editor
            // defaultLanguage={custom_js}
            language="javascript"
            defaultValue="const a;"
            onMount={handleOnMound}
            onChange={handleCodeChange}
            onValidate={(makers) => console.log(makers)}
            height={"50vh"}
            
        />
    )
}

export { JSEditor }