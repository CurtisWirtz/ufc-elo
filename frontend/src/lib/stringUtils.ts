export const truncateString = (txt: string): string => {
  if (txt.length < 4) return txt;

  return txt.slice(0, 4) + "..";
}