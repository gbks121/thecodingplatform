import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { useStore } from "../store";
import type * as Monaco from "monaco-editor";

interface CodeEditorProps {
    yDoc: Y.Doc | null;
    provider: WebsocketProvider | null;
    onEditorMount?: (
        editor: Monaco.editor.IStandaloneCodeEditor,
        monaco: typeof Monaco
    ) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    yDoc,
    provider,
    onEditorMount,
}) => {
    const theme = useTheme();
    const { language } = useStore();
    const [editor, setEditor] =
        React.useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    // Determine Monaco theme based on MUI theme
    const monacoTheme = theme.palette.mode === "dark" ? "vs-dark" : "vs";

    const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
        setEditor(editorInstance);
        monacoRef.current = monaco;
        if (onEditorMount) onEditorMount(editorInstance, monaco);
    };

    // Effect 1: Bind Yjs to Monaco Editor (handles content sync)
    useEffect(() => {
        if (!yDoc || !provider || !editor) return;

        // cleanup old binding
        if (bindingRef.current) {
            bindingRef.current.destroy();
        }

        const yText = yDoc.getText("monaco");
        const model = editor.getModel();

        if (!model) {
            console.error("Debug: No model found for editor");
            return;
        }

        console.log("Debug: Creating new MonacoBinding");
        try {
            // Create new binding
            bindingRef.current = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                provider.awareness
            );

            // Listen for content changes to update "lastActivity"
            const disposable = editor.onDidChangeModelContent(() => {
                // Only broadcast if THIS user is typing (has focus)
                if (editor.hasTextFocus()) {
                    provider.awareness.setLocalStateField(
                        "lastActivity",
                        Date.now()
                    );
                }
            });

            console.log("Debug: Binding created successfully");
            (
                bindingRef.current as MonacoBinding & {
                    _customDisposable?: Monaco.IDisposable;
                }
            )._customDisposable = disposable;
        } catch (err) {
            console.error("Debug: Failed to create binding", err);
        }

        return () => {
            console.log("Debug: Destroying binding");
            (
                bindingRef.current as MonacoBinding & {
                    _customDisposable?: Monaco.IDisposable;
                }
            )?._customDisposable?.dispose();
            bindingRef.current?.destroy();
            bindingRef.current = null;
        };
    }, [yDoc, provider, editor]); // Removed 'language' dependency!

    // Effect 2: Handle Language Updates specifically
    useEffect(() => {
        if (!editor || !monacoRef.current) return;

        const model = editor.getModel();
        if (model) {
            console.log("Debug: Updating model language to", language);
            monacoRef.current.editor.setModelLanguage(model, language);
        }
    }, [language, editor]);

    // Effect 3: Update Monaco theme when MUI theme changes
    useEffect(() => {
        if (!editor || !monacoRef.current) return;
        monacoRef.current.editor.setTheme(monacoTheme);
    }, [monacoTheme, editor]);

    return (
        <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
                height="100%"
                theme={monacoTheme}
                language={language}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
                loading={<CircularProgress />}
            />
        </Box>
    );
};
