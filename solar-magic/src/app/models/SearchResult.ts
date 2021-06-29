import { Pagination } from "./Pagination";

export interface SearchResult<T> {
    results: T[],
    pagination: Pagination
}
