import React, { useState } from "react";
import { workflowTemplates, matchTemplate, type WorkflowTemplate } from "@/lib/workflow-templates";
import { WorkflowNode } from "@/components/WorkflowNode";
import { Search, Zap, GitBranch, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryIcons: Record<string, string> = {
  monitoring: "📡",
  alerts: "🔔",
  analysis: "🔬",
  reporting: "📊",
};

const WorkflowBuilder: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowTemplate | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const match = matchTemplate(query);
    if (match) {
      setActiveWorkflow(match);
      setSelectedNode(null);
    }
  };

  const activeNode = activeWorkflow?.nodes.find((n) => n.id === selectedNode);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Natural Language Input */}
      <div className="border-b border-border px-6 py-4 flex-shrink-0">
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your workflow in plain English... e.g., 'Alert me when NDVI drops below 0.3'"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" className="flex-shrink-0">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Generate
          </Button>
        </form>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Template Library */}
        <div className="w-64 border-r border-border bg-card flex-shrink-0 overflow-auto p-4">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-3">
            Template Library
          </span>
          <div className="space-y-2">
            {workflowTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveWorkflow(t); setSelectedNode(null); }}
                className={`block w-full text-left p-3 border rounded-sm transition-colors ${
                  activeWorkflow?.id === t.id
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{categoryIcons[t.category]}</span>
                  <span className="text-sm font-medium leading-tight">{t.name}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{t.description}</span>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {t.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-muted text-muted-foreground">
                      {k}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Workflow Canvas */}
        <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
          {activeWorkflow ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold">{activeWorkflow.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeWorkflow.description}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                {activeWorkflow.nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    {i > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="w-px h-6 bg-border" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        <div className="w-px h-2 bg-border" />
                      </div>
                    )}
                    <WorkflowNode
                      node={node}
                      isSelected={selectedNode === node.id}
                      onClick={() => setSelectedNode(node.id)}
                    />
                  </React.Fragment>
                ))}
              </div>
              <Button className="mt-8" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Deploy Workflow
              </Button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">
                Select a template or describe your workflow above to begin.
              </p>
            </div>
          )}
        </div>

        {/* Right: Node Config */}
        <div className="w-72 border-l border-border bg-card flex-shrink-0 overflow-auto p-4">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-3">
            Node Configuration
          </span>
          {activeNode ? (
            <div>
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Type</span>
                <p className="text-sm font-medium mt-1 capitalize">{activeNode.type}</p>
              </div>
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Label</span>
                <p className="text-sm font-medium mt-1">{activeNode.label}</p>
              </div>
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</span>
                <p className="text-sm text-muted-foreground mt-1">{activeNode.description}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Parameters</span>
                {Object.entries(activeNode.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-border last:border-b-0">
                    <span className="font-mono text-xs text-muted-foreground">{key}</span>
                    <span className="font-mono text-xs font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click a node to view its configuration.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
