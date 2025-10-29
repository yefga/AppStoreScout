import { createHttp } from '../../../infra/http/createHTTP';
import { AppItem, PlatformKind } from '../../../domain/entities/AppItem';
import { SearchParams, SearchResult } from '../../../domain/repositories/AppRepo';

const http = createHttp({ baseUrl: 'https://itunes.apple.com' });

function derivePlatforms(kind?: string, supportedDevices?: string[], features?: string[]): PlatformKind[] {
    const set = new Set<PlatformKind>();
    if (kind === 'mac-software' || kind === 'macSoftware') set.add('macos');
    if (kind === 'software' || kind === 'iPadSoftware') set.add('ios');
    if ((features || []).some(f => /AppleTV/i.test(f))) set.add('tvos');
    if ((supportedDevices || []).some(d => /Watch/i.test(d))) set.add('watchos');
    return Array.from(set);
}

export async function searchApps(params: SearchParams, signal?: AbortSignal): Promise<SearchResult> {
    const { term, country, platforms, limit, offset } = params;
    const wantsMac = platforms.includes('macos');
    const entity = wantsMac && platforms.length === 1 ? 'macSoftware' : 'software';

    type Raw = { resultCount: number; results: any[] };
    const data = await http.get<Raw>('/search', {
        term,
        media: 'software',
        country,
        entity,
        limit,
        offset,
        lang: 'en_us',
    }, {}, signal);

    const items: AppItem[] = (data.results || []).map((r) => {
        const plat = derivePlatforms(r.kind, r.supportedDevices, r.features);
        const priceLabel = r.formattedPrice || (r.price === 0 ? 'Free' : r.price ? `$${r.price}` : '');
        return {
            id: Number(r.trackId) || 0,
            name: String(r.trackName || ''),
            bundleId: String(r.bundleId || ''),
            seller: String(r.sellerName || ''),
            platforms: plat,
            iconUrl: r.artworkUrl512 || r.artworkUrl100 || '',
            priceLabel,
            trackViewUrl: String(r.trackViewUrl || ''),
            genres: Array.isArray(r.genres) && r.genres.length ? r.genres : (r.primaryGenreName ? [r.primaryGenreName] : []),
            rating: r.averageUserRating ?? null,
            ratingCount: r.userRatingCount ?? null,
        } as AppItem;
    }).filter(item => {
        if (platforms.length === 0) return true;
        return platforms.some(p => item.platforms.includes(p));
    });

    return { items, totalCount: Number(data.resultCount) || items.length };
}