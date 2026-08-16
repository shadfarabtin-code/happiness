import type { MessageNode } from "@/services/api";

export type Row = { node: MessageNode; depth: number };

export function flatten(nodes: MessageNode[], collapsed: Set<string>, depth = 0): Row[] {
    return nodes.flatMap((node) => {
        const row: Row = { node, depth };
        if (collapsed.has(node.id)) return [row];
        return [row, ...flatten(node.replies, collapsed, depth + 1)];
    });
}

export function countDescendants(node: MessageNode): number {
    return node.replies.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

export function timeAgo(epochSeconds: number): string {
    const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000 - epochSeconds));
    const units: [string, number][] = [
        ["y", 31536000],
        ["mo", 2592000],
        ["d", 86400],
        ["h", 3600],
        ["m", 60],
    ];
    for (const [label, secondsInUnit] of units) {
        const value = Math.floor(diffSeconds / secondsInUnit);
        if (value >= 1) return `${value}${label} ago`;
    }
    return "just now";
}
