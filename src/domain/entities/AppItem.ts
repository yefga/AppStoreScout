export type PlatformKind = 'ios' | 'macos' | 'watchos' | 'tvos';


export interface AppItem {
    id: number;
    name: string;
    bundleId: string;
    seller: string;
    platforms: PlatformKind[];
    iconUrl: string;
    priceLabel: string;
    trackViewUrl: string;
    genres: string[];
    rating: number | null;
    ratingCount: number | null;
}