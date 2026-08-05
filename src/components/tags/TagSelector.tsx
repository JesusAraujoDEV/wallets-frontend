import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { fetchTags, createTag } from "@/lib/tags";
import type { Tag } from "@/lib/types";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
  }, []);

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));
  const availableTags = tags.filter(t => !selectedTagIds.includes(t.id));

  const handleSelect = (tagId: number) => {
    onChange([...selectedTagIds, tagId]);
  };

  const handleRemove = (tagId: number) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      setCreating(true);
      const tag = await createTag({ name: newTagName.trim() });
      setTags(prev => [...prev, tag]);
      onChange([...selectedTagIds, tag.id]);
      setNewTagName("");
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedTags.map(tag => (
        <Badge
          key={tag.id}
          variant="outline"
          className="text-xs font-medium gap-1 cursor-pointer"
          style={{ borderColor: tag.color || undefined, color: tag.color || undefined }}
          onClick={() => handleRemove(tag.id)}
        >
          {tag.name}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
            <TagIcon className="h-3.5 w-3.5 mr-1" />
            Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-2">
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {availableTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-accent"
                    style={{ borderColor: tag.color || undefined }}
                    onClick={() => { handleSelect(tag.id); setOpen(false); }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 pt-1 border-t">
              <Input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="Nuevo tag..."
                className="h-7 text-xs"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); } }}
              />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCreateTag} disabled={creating || !newTagName.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
