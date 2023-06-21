export interface ApiInfoResponse {
  currentBalance: string;
  network: string;
  permitCount: string;
  health: 'Healthy' | 'Unstable' | 'Broken';
  address: string;
}
