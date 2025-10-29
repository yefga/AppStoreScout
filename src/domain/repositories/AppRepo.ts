import { AppItem, PlatformKind } from '../entities/AppItem';


export interface SearchParams {
    term: string;
    country: string;
    platforms: PlatformKind[];
    limit: number;
    offset: number;
}


export interface SearchResult {
    items: AppItem[];
    totalCount: number;
}


export interface AppRepo {
    search(params: SearchParams, signal?: AbortSignal): Promise<SearchResult>;
}