import React, { useState } from "react";
import { marketplaceTemplates, type MarketplaceTemplate } from "@/lib/mock-marketplace";
import { Search, Star, Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const categories = ["All", "agriculture", "urban", "forestry", "climate"] as const;

const InsightMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [detailTemplate, setDetailTemplate] = useState<MarketplaceTemplate | null>(null);

  const filtered = marketplaceTemplates
    .filter((t) => activeCategory === "All" || t.category === activeCategory)
    .filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.tags.some((tag) => tag.includes(searchQuery.toLowerCase())));

  const install = (id: string) => setInstalledIds((prev) => new Set(prev).add(id));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search + Tabs */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1 text-xs rounded-sm transition-colors capitalize ${
                activeCategory === c ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((template) => {
            const isInstalled = installedIds.has(template.id);
            return (
              <div
                key={template.id}
                className="border border-border hover:border-muted-foreground/30 transition-colors cursor-pointer"
                onClick={() => setDetailTemplate(template)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-muted text-muted-foreground capitalize">
                      {template.category}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star className="w-3 h-3 text-status-warn fill-status-warn" />
                      <span className="font-mono text-xs">{template.rating}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">({template.reviewCount})</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs text-muted-foreground">{template.usageCount.toLocaleString()} uses</span>
                    </div>
                    <span className="text-xs text-muted-foreground">by {template.author}</span>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {template.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 bg-accent text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailTemplate} onOpenChange={(open) => !open && setDetailTemplate(null)}>
        <DialogContent className="max-w-lg">
          {detailTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{detailTemplate.name}</DialogTitle>
                <DialogDescription>by {detailTemplate.author}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm">{detailTemplate.longDescription}</p>
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">Sample Outputs</span>
                  <div className="space-y-1">
                    {detailTemplate.sampleOutputs.map((output) => (
                      <div key={output} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-status-good rounded-full" />
                        {output}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-status-warn fill-status-warn" />
                      <span className="font-mono text-sm">{detailTemplate.rating}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{detailTemplate.usageCount.toLocaleString()} uses</span>
                  </div>
                  <Button
                    onClick={(e) => { e.stopPropagation(); install(detailTemplate.id); }}
                    disabled={installedIds.has(detailTemplate.id)}
                    variant={installedIds.has(detailTemplate.id) ? "success" : "default"}
                  >
                    {installedIds.has(detailTemplate.id) ? (
                      "Installed"
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add to My Workflows
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsightMarketplace;
