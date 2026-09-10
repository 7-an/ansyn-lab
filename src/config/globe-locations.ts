export type GlobePhoto = { src: string; alt: string; width: number; height: number };
// Approximate city coordinates for the user-requested interaction prototype.
// User-supplied city photos; empty arrays render a text-only coordinate record.
export const globeLocations: {id: string; name: string; english: string; lat: number; lon: number; timeZone: string; photos: GlobePhoto[]}[] = [
  {id: "hong-kong", name: "Hong Kong", english: "Hong Kong", lat: 22.3193, lon: 114.1694, timeZone: "Asia/Hong_Kong", photos: [
    {src: "/media/places/hong-kong-introduction.webp", alt: "Introducing my personal website in Hong Kong", width: 1600, height: 900},
    {src: "/media/places/hong-kong-table.webp", alt: "Sharing social profiles over a meal in Hong Kong", width: 1200, height: 900}
  ]},
  {id: "shenzhen", name: "Shenzhen", english: "Shenzhen", lat: 22.5431, lon: 114.0579, timeZone: "Asia/Shanghai", photos: [{src: "/media/places/shenzhen-meetup.webp", alt: "A meetup photo in Shenzhen, with the original illustrated faces", width: 1200, height: 844}]},
  {id: "hangzhou", name: "Hangzhou", english: "Hangzhou", lat: 30.2741, lon: 120.1551, timeZone: "Asia/Shanghai", photos: []}
];
