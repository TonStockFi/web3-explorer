import { HierarchyPointNode } from 'd3-hierarchy';
import { SyntheticEvent } from 'react';
export type Orientation = 'horizontal' | 'vertical';
export interface Point {
    x: number;
    y: number;
}
export interface RawNodeDatum {
    name: string;
    priority: number;
    id: string;
    attributes?: Record<string, string | number | boolean>;
    children?: RawNodeDatum[];
}
export interface TreeNodeDatum extends RawNodeDatum {
    children?: TreeNodeDatum[];
    __rd3t: {
        id: string;
        depth: number;
        collapsed: boolean;
    };
}
export interface TreeLinkDatum {
    source: HierarchyPointNode<TreeNodeDatum>;
    target: HierarchyPointNode<TreeNodeDatum>;
}
export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';
export type PathFunction = (link: TreeLinkDatum, orientation: Orientation) => string;
export type PathClassFunction = PathFunction;
export type SyntheticEventHandler = (evt: SyntheticEvent) => void;
export type AddChildrenFunction = (children: RawNodeDatum[]) => void;
/**
 * The properties that are passed to the user-defined `renderCustomNodeElement` render function.
 */
export interface CustomNodeElementProps {
    /**
     * The full datum of the node that is being rendered.
     */
    nodeDatum: TreeNodeDatum;
    /**
     * The D3 `HierarchyPointNode` representation of the node, which wraps `nodeDatum`
     * with additional properties.
     */
    hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
    /**
     * Toggles the expanded/collapsed state of the node.
     *
     * Provided for customized control flow; e.g. if we want to toggle the node when its
     * label is clicked instead of the node itself.
     */
    toggleNode: () => void;
    /**
     * The `onNodeClick` handler defined for `Tree` (if any).
     */
    onNodeClick: SyntheticEventHandler;
    /**
     * The `onNodeMouseOver` handler defined for `Tree` (if any).
     */
    onNodeMouseOver: SyntheticEventHandler;
    /**
     * The `onNodeMouseOut` handler defined for `Tree` (if any).
     */
    onNodeMouseOut: SyntheticEventHandler;
    /**
     * The `Node` class's internal `addChildren` handler.
     */
    addChildren: AddChildrenFunction;
}
export type RenderCustomNodeElementFn = (rd3tNodeProps: CustomNodeElementProps) => JSX.Element;
