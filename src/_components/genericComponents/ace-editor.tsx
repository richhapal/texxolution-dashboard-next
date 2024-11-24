"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace");
    await import("ace-builds/src-noconflict/mode-html");
    await import("ace-builds/src-noconflict/theme-monokai");
    await import("ace-builds/src-noconflict/ext-language_tools");
    return ace;
  },
  { ssr: false }
);

interface AceEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  label: string;
  required?: boolean;
  error?: string;
}

export default function CustomAceEditor({
  initialValue = "",
  onChange,
  label,
  required = false,
  error,
}: AceEditorProps) {
  const [editorContent, setEditorContent] = useState(initialValue);

  useEffect(() => {
    setEditorContent(initialValue);
  }, [initialValue]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onChange(content);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <AceEditor
        mode="html"
        theme="monokai"
        onChange={handleEditorChange}
        value={editorContent}
        name="ace-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        style={{ width: "100%", height: "200px" }}
        className="border border-gray-300 rounded-md shadow-sm"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
