import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      });
      mermaidInitialized = true;
    }
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (ref.current && chart) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          ref.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          ref.current.innerHTML = `<pre>${chart}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div className="my-8 flex justify-center">
      <div ref={ref} className="mermaid-diagram" />
    </div>
  );
};
