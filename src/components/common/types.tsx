import { ComponentType } from "react";

export type ComponentFactory = {
    [key: string]: ComponentType<any>;
}