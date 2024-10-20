"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Play, Plus, Trash, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const CodeEditor = ({ value, onChange, onRun }) => {
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateLineNumbers();
  }, [value]);

  const updateLineNumbers = () => {
    const lines = value.split("\n");
    setLineNumbers(Array.from({ length: lines.length }, (_, i) => `${i + 1}`));
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative font-mono text-sm border rounded">
      <div
        ref={lineNumbersRef}
        className="absolute left-0 top-0 bottom-0 w-12 bg-muted flex flex-col items-end pr-2 pt-2 text-muted-foreground select-none overflow-hidden"
        style={{ height: "100%", overflowY: "hidden" }}
      >
        {lineNumbers.map((num, i) => (
          <div key={i} className="h-6 leading-6">
            {num}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          updateLineNumbers();
        }}
        onScroll={handleScroll}
        className="w-full h-64 p-2 pl-14 bg-background text-foreground rounded resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        spellCheck="false"
        style={{
          lineHeight: "1.5rem",
          tabSize: 2,
          overflowY: "scroll",
        }}
      />
      <Button size="sm" className="absolute right-2 bottom-2" onClick={onRun}>
        <Play className="w-4 h-4 mr-1" /> Run
      </Button>
    </div>
  );
};

const MarkdownEditor = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 p-2 bg-background text-foreground border rounded resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      placeholder="Write your markdown here..."
    />
  );
};

const OutputDisplay = ({ output }) => {
  if (output.startsWith("data:image")) {
    return (
      <img
        src={output}
        alt="Generated graph"
        className="mt-2 max-w-full h-auto"
      />
    );
  }
  return (
    <pre className="mt-2 p-2 bg-muted text-muted-foreground rounded whitespace-pre-wrap">
      {output}
    </pre>
  );
};

const NotebookCell = ({ cell, index, onRun, onDelete, onChange }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <Tabs defaultValue={cell.type} className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="code">
                <Code className="w-4 h-4 mr-1" /> Code
              </TabsTrigger>
              <TabsTrigger value="markdown">
                <FileText className="w-4 h-4 mr-1" /> Markdown
              </TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          <TabsContent value="code">
            <CodeEditor
              value={cell.content}
              onChange={(newContent) =>
                onChange(index, { ...cell, content: newContent })
              }
              onRun={() => onRun(index)}
            />
          </TabsContent>
          <TabsContent value="markdown">
            <MarkdownEditor
              value={cell.content}
              onChange={(newContent) =>
                onChange(index, { ...cell, content: newContent })
              }
            />
          </TabsContent>
        </Tabs>
        {cell.output && <OutputDisplay output={cell.output} />}
      </CardContent>
    </Card>
  );
};

export const NotebookComponent = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [cells, setCells] = useState([
    {
      type: "code",
      content:
        "# Example: Python code to generate stock data for the graph\n\nimport matplotlib.pyplot as plt\nimport io\nfrom base64 import b64encode\n\nstock_data = [\n  {'date': '2024-10-01', 'price': 100},\n  {'date': '2024-10-02', 'price': 102},\n  {'date': '2024-10-03', 'price': 98},\n  {'date': '2024-10-04', 'price': 105},\n]\n\ndates = [item['date'] for item in stock_data]\nprices = [item['price'] for item in stock_data]\n\n# Create a plot\nplt.figure(figsize=(10, 6))\nplt.plot(dates, prices)\nplt.title('Stock Prices')\nplt.xlabel('Date')\nplt.ylabel('Price')\n\n# Save the plot to a buffer\nbuf = io.BytesIO()\nplt.savefig(buf, format='png')\nbuf.seek(0)\nimage_png = buf.getvalue()\nencoded = b64encode(image_png).decode('utf-8')\nprint(f\"data:image/png;base64,{encoded}\")",
      output: "",
    },
    {
      type: "markdown",
      content: "## Welcome to the Notebook\n\nThis is a markdown cell.",
      output: "",
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPyodideScript = async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js";
      script.onload = async () => {
        const pyodideInstance = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/",
        });
        await pyodideInstance.loadPackage("matplotlib");
        setPyodide(pyodideInstance);
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadPyodideScript();
  }, []);

  const handleRunCode = async (index) => {
    if (pyodide && cells[index].type === "code") {
      try {
        const setupCode = `
          import sys
          from io import StringIO
          sys.stdout = StringIO()
        `;
        pyodide.runPython(setupCode);
        pyodide.runPython(cells[index].content);
        const output = pyodide.runPython("sys.stdout.getvalue()");

        const updatedCells = [...cells];
        updatedCells[index].output = output.trim();
        setCells(updatedCells);
      } catch (error) {
        const updatedCells = [...cells];
        updatedCells[index].output = `Error: ${error.message}`;
        setCells(updatedCells);
      }
    }
  };

  const addCell = (type: "code" | "markdown") => {
    setCells([...cells, { type, content: "", output: "" }]);
  };

  const deleteCell = (index: number) => {
    const updatedCells = cells.filter((_, i) => i !== index);
    setCells(updatedCells);
  };

  const updateCell = (index: number, updatedCell) => {
    const updatedCells = [...cells];
    updatedCells[index] = updatedCell;
    setCells(updatedCells);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading Python environment...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Python Notebook</h1>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCell("code")}
            className="mr-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Code Cell
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCell("markdown")}
          >
            <Plus className="w-4 h-4 mr-1" /> Markdown Cell
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <ScrollArea className="h-[calc(100vh-120px)]">
        {cells.map((cell, index) => (
          <NotebookCell
            key={index}
            cell={cell}
            index={index}
            onRun={handleRunCode}
            onDelete={deleteCell}
            onChange={updateCell}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export function Notebook() {
  return (
    <div className="min-h-screen bg-background">
      <Notebook />
    </div>
  );
}
