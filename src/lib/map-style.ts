export const MAP_STYLES = ["geographic", "deformed"] as const;

export type MapStyle = (typeof MAP_STYLES)[number];

export const MAP_STYLE: MapStyle = "geographic";

export const MAP_ATTRIBUTIONS: Record<
  MapStyle,
  { label: string; href: string; license: string }
> = {
  geographic: {
    label: "Japan SVG map by @svg-maps/japan（based on MapSVG）",
    href: "https://github.com/VictorCazanave/svg-maps/tree/master/packages/japan",
    license: "CC BY 4.0",
  },
  deformed: {
    label: "デフォルメ日本地図 by chizutodesign",
    href: "https://github.com/chizutodesign/japan-deformed-map",
    license: "CC0 1.0",
  },
};

export const SVG_MAP_ID_TO_PREF_CODE: Record<string, string> = {
  hokkaido: "01",
  aomori: "02",
  iwate: "03",
  miyagi: "04",
  akita: "05",
  yamagata: "06",
  fukushima: "07",
  ibaraki: "08",
  tochigi: "09",
  gunma: "10",
  saitama: "11",
  chiba: "12",
  tokyo: "13",
  kanagawa: "14",
  niigata: "15",
  toyama: "16",
  ishikawa: "17",
  fukui: "18",
  yamanashi: "19",
  nagano: "20",
  gifu: "21",
  shizuoka: "22",
  aichi: "23",
  mie: "24",
  shiga: "25",
  kyoto: "26",
  osaka: "27",
  hyogo: "28",
  nara: "29",
  wakayama: "30",
  tottori: "31",
  shimane: "32",
  okayama: "33",
  hiroshima: "34",
  yamaguchi: "35",
  tokushima: "36",
  kagawa: "37",
  ehime: "38",
  kochi: "39",
  fukuoka: "40",
  saga: "41",
  nagasaki: "42",
  kumamoto: "43",
  oita: "44",
  miyazaki: "45",
  kagoshima: "46",
  okinawa: "47",
};
