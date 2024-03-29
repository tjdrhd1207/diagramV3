import Editor, { Monaco } from "@monaco-editor/react"
import { languages } from "monaco-editor";
import { Box } from "@mui/material"
import React from "react" 

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

const ISACIVRJSEditor = (
    props: {
        code: string
        setModified: (value: string) => void
    }
) => {
    const varAccessKey = "app";
    const funcAccessKey = "util";

    const [completionDisposable, setCompletionDisposable] = React.useState<any>(null);

    const handleBeforeMount = (monaco: Monaco) => {
        console.log("handleBeforeMount", monaco);
        if (monaco) {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                noLib: true,
                allowNonTsExtensions: true
            });

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
                            const keyword = line.slice(position.column - varAccessKey.length - 2, position.column - 2);
                            console.log(`line: ${line}, keyword: ${keyword}`);
                            switch (keyword) {
                                case varAccessKey:
                                    return {
                                        suggestions: [
                                            {
                                                label: "p1",
                                                kind: languages.CompletionItemKind.Property,
                                                insertText: "p1",
                                                range: range
                                            }
                                        ]
                                    };
                                default:
                                    return { suggestions: [] }
                            }
                        default:
                            return { suggestions: [ ...js_basic_snippets(range) ] };
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