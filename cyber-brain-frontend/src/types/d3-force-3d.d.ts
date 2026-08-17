declare module 'd3-force-3d' {
  export interface SimulationNodeDatum3D {
    id?: number | string
    x?: number
    y?: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
    [key: string]: unknown
  }

  export interface SimulationLinkDatum3D<N extends SimulationNodeDatum3D> {
    source: number | string | N
    target: number | string | N
    weight?: number
    [key: string]: unknown
  }

  export interface ForceLink3D<N extends SimulationNodeDatum3D, L extends SimulationLinkDatum3D<N>> {
    (links: L[]): ForceLink3D<N, L>
    id(accessor: (node: N) => number | string): ForceLink3D<N, L>
    distance(distance: number | ((link: L) => number)): ForceLink3D<N, L>
    strength(strength: number | ((link: L) => number)): ForceLink3D<N, L>
    iterations(iterations: number): ForceLink3D<N, L>
  }

  export interface ForceManyBody3D<N extends SimulationNodeDatum3D> {
    (nodes: N[]): ForceManyBody3D<N>
    strength(strength: number | ((node: N) => number)): ForceManyBody3D<N>
    distanceMin(distance: number): ForceManyBody3D<N>
    distanceMax(distance: number): ForceManyBody3D<N>
    theta(theta: number): ForceManyBody3D<N>
  }

  export interface ForceCenter3D<N extends SimulationNodeDatum3D> {
    (nodes: N[]): ForceCenter3D<N>
    strength(strength: number): ForceCenter3D<N>
    x(x: number): ForceCenter3D<N>
    y(y: number): ForceCenter3D<N>
    z(z: number): ForceCenter3D<N>
  }

  export interface ForceSimulation3D<N extends SimulationNodeDatum3D> {
    force(name: string, force: unknown): ForceSimulation3D<N>
    stop(): ForceSimulation3D<N>
    tick(iterations?: number): ForceSimulation3D<N>
    restart(): ForceSimulation3D<N>
    alpha(alpha: number): ForceSimulation3D<N>
    nodes(): N[]
  }

  export function forceSimulation<N extends SimulationNodeDatum3D>(
    nodes?: N[],
    dimensions?: number,
  ): ForceSimulation3D<N>

  export function forceLink<N extends SimulationNodeDatum3D, L extends SimulationLinkDatum3D<N>>(
    links?: L[],
  ): ForceLink3D<N, L>

  export function forceManyBody<N extends SimulationNodeDatum3D>(): ForceManyBody3D<N>

  export function forceCenter<N extends SimulationNodeDatum3D>(
    x?: number,
    y?: number,
    z?: number,
  ): ForceCenter3D<N>
}
