
interface SearchResultItem {
  pharmacyName: string;
  pharmacyAddress: string;
  price: number;
}

interface SearchResult {
  rxId: number;
  rxTitle: string;
  prices: SearchResultItem[];
}
