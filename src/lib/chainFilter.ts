// Chain/brand names to filter out from Yelp results
// These are large chain coffee shops we want to exclude
const CHAIN_NAMES = [
  'starbucks',
  'starbucks coffee',
  '7brew',
  '7-eleven',
  'dunkin',
  'dunkin donuts',
  'dunkin\' donuts',
  'peets coffee',
  'peet\'s coffee',
  'caribou coffee',
  'tim hortons',
  'the coffee bean',
  'coffee bean & tea leaf',
  'tully\'s coffee',
  'tullys coffee',
  'biggby coffee',
  'panera bread', // Some locations have cafes
  'mcdonalds', // Has McCafe
  'wawa', // Some locations serve coffee
  'circle k', // Some locations serve coffee
  'speedway', // Some locations serve coffee
];

/**
 * Check if a business name matches a known chain/brand
 * Case-insensitive matching with partial word matching
 */
export function isChain(businessName: string): boolean {
  const normalizedName = businessName.toLowerCase().trim();
  
  // Check for exact or partial matches with chain names
  for (const chain of CHAIN_NAMES) {
    if (normalizedName.includes(chain) || chain.includes(normalizedName)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter out chain businesses from an array
 */
export function filterChains<T extends { name: string }>(businesses: T[]): T[] {
  return businesses.filter((business) => !isChain(business.name));
}

