/**
 * UX helpers that moved into the `foundry.applications.ux` namespace (V13+).
 * Mirrors the global `TextEditor` class declared in `client/ui/editor.d.ts`.
 */
export declare const TextEditor: {
  implementation: {
    enrichHTML(content: string | null, options?: EnrichmentOptions): Promise<string>;
  };
};
