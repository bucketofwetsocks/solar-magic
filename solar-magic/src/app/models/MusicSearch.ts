import { MusicResult } from "./MusicResult";

export interface MusicSearch {
    results: MusicResult[],
    pagination: {
        requestedPage: number,
        totalPages: number,
        displayingMinNumber: number,
        displayingMaxNumber: number,
        totalCount: number
    }
}