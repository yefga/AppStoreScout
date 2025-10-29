import { AppRepo, SearchParams, SearchResult } from '../../domain/repositories/AppRepo';
import { searchApps } from '../dataSources/remote/iTunesAPI';


export class AppRepoImpl implements AppRepo {
    async search(params: SearchParams, signal?: AbortSignal): Promise<SearchResult> {
        return searchApps(params, signal);
    }
}