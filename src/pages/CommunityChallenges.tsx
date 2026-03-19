import React, { useState } from "react";
import { challenges, type Challenge } from "@/lib/mock-community";
import { Trophy, Users, FileText, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const categories = ["All", "deforestation", "agriculture", "urban", "climate"] as const;
const statuses = ["All", "active", "upcoming", "completed"] as const;

const CommunityChallenges: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const filtered = challenges
    .filter((c) => categoryFilter === "All" || c.category === categoryFilter)
    .filter((c) => statusFilter === "All" || c.status === statusFilter);

  const daysUntil = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Bar */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mr-2">Category:</span>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 text-xs rounded-sm transition-colors capitalize ${
              categoryFilter === c ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-2" />
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mr-2">Status:</span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded-sm transition-colors capitalize ${
              statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((challenge) => {
            const isExpanded = expandedId === challenge.id;
            const isJoined = joinedIds.has(challenge.id);
            const days = daysUntil(challenge.deadline);

            return (
              <div key={challenge.id} className="border border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 ${
                          challenge.status === "active" ? "bg-status-good/10 text-status-good" :
                          challenge.status === "upcoming" ? "bg-status-warn/10 text-status-warn" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {challenge.status}
                        </span>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground capitalize">{challenge.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-tight">{challenge.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{challenge.description}</p>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{challenge.participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{challenge.submissions} submissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-xs">{days}d left</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-muted-foreground">Progress</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-1" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-status-warn" />
                      <span className="font-mono text-xs">{challenge.prize}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                        className="px-2 py-1 text-xs text-muted-foreground hover:bg-accent rounded-sm transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => {
                          const next = new Set(joinedIds);
                          if (isJoined) next.delete(challenge.id); else next.add(challenge.id);
                          setJoinedIds(next);
                        }}
                        className={`px-3 py-1 text-xs rounded-sm transition-colors ${
                          isJoined
                            ? "bg-status-good text-primary-foreground"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Leaderboard */}
                {isExpanded && challenge.leaderboard.length > 0 && (
                  <div className="border-t border-border">
                    <div className="px-4 py-2 bg-muted/30">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Leaderboard</span>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {challenge.leaderboard.map((entry) => (
                          <tr key={entry.rank} className="border-b border-border last:border-b-0">
                            <td className="px-4 py-1.5 font-mono text-xs w-8">{entry.rank}</td>
                            <td className="py-1.5 text-sm">{entry.username}</td>
                            <td className="py-1.5 text-right font-mono text-xs text-status-good">{entry.score}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-xs text-muted-foreground">{entry.submissions} sub</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommunityChallenges;
