export interface FieldSceneOptions {
  particleDensity?: 'sparse' | 'moderate' | 'dense';
  depthSpan?: number;
  dollyRange?: number;
  noShootingStars?: boolean;
  showPolyhedronMark?: boolean;
}

export interface FieldSceneHandle {
  dispose(): void;
}

export function mountField(
  canvas: HTMLCanvasElement,
  opts?: FieldSceneOptions
): Promise<FieldSceneHandle>;
