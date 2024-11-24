"use client";

import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface TextEditorProps {
  label: string;
  initialValue?: string;
  onChange: (content: string) => void;
  error: string;
  required: boolean;
}

export default function TinyMceTextEditor({
  initialValue = "",
  onChange,
  error,
  label,
  required = false,
}: TextEditorProps) {
  const editorRef = useRef<any>(null);
  console.log("lable", label, "value", initialValue);
  const handleEditorChange = (content: string, editor: any) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Editor
        apiKey="am6fg1iw9qnh81j97cyxnjmcbj5qtnlu1hnoevv6ge7cefk9" // Sign up at https://www.tiny.cloud/ to get a free API key
        onInit={(_evt, editor) => (editorRef.current = editor)}
        value={initialValue}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help | " +
            "ltr rtl |" +
            "table",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          toolbar_mode: "floating",
          language: "en",
          directionality: "ltr",
        }}
        onEditorChange={handleEditorChange}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
