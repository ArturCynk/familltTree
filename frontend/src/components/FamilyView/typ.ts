export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare const enum Gender {
    male = "male",
    female = "female"
}
export declare const enum RelType {
    blood = "blood",
    married = "married",
    divorced = "divorced",
    adopted = "adopted",
    half = "half"
}
export declare const enum FamilyType {
    root = "root",
    child = "child",
    parent = "parent"
}
export type Family = {
    readonly id: number;
    readonly type: FamilyType;
    readonly main: boolean;
    pid?: number;
    cid?: number;
    X: number;
    Y: number;
    parents: readonly Unit[];
    children: readonly Unit[];
};
export type Unit = {
    readonly fid: number;
    readonly child: boolean;
    readonly nodes: readonly Node[];
    pos: number;
};
export type Size = Readonly<{
    width: number;
    height: number;
}>;
export type Relation = Readonly<{
    firstName: string;
    lastName: string;
    id: string;
    type: RelType;
}>;
export type Node = Readonly<{
    id: string;
    //gender: Gender;
    firstName: string;
    lastName: string;
    status?: 'alive' | 'deceased';
    gender: 'male' | 'female' | 'not-binary';
    parents: readonly Relation[];
    children: readonly Relation[];
    siblings: readonly Relation[];
    spouses: readonly Relation[];
    deathDateFreeText?: string;
    placeholder?: boolean;
}>;
export type ExtNode = Node & Readonly<{
    top: number;
    left: number;
    hasSubTree: boolean;
    firstName: string;
    lastName: string;
    status?: 'alive' | 'deceased';
    deathDateFreeText?: string;
}>;
export type Connector = readonly [x1: number, y1: number, x2: number, y2: number];
export type RelData = Readonly<{
    canvas: Size;
    families: readonly Family[];
    nodes: readonly ExtNode[];
    connectors: readonly Connector[];
}>;
export type Options = Readonly<{
    rootId: string;
    placeholders?: boolean;
}>;
