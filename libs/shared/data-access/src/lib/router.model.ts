export interface RouterManagement {
  loadQueryParams(): void;

  updateQueryParams(...data: unknown[]): void;
}
