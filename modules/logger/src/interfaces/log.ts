interface log {
    timestamp: Date;
    level: string;
    content: string[];
    meta?: any;
}

interface levels {
    [key: string]: number;
}


export type { log, levels };