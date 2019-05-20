declare module "NLPInterfaceModule" {

    export interface TopScoringIntent {
        intent: string;
        score: number;
    }

    export interface Resolution {
        values: any[];
    }

    export interface Entity {
        entity: string;
        type: string;
        startIndex: number;
        endIndex: number;
        resolution: Resolution;
    }

    export interface IUtterance {
        query: string;
        topScoringIntent: TopScoringIntent;
        entities: Entity[];
    }

}

