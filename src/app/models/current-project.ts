export interface CurrentProject {
    id: number;
    user_id?: number;
    name: string;
    date?: string;
    status?: number;
    created_at?: string;
    updated_at?: string;
    drivers?: any[];
    stops?: any[];
}