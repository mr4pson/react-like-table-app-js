export function sortAsc(keyName, a, b) {
    if (a[keyName] > b[keyName]) {
      return 1;
    }
    if (a[keyName] < b[keyName]) {
      return -1;
    }
    return 0;
}
export function sortDesc(keyName, a, b) {
    if (a[keyName] < b[keyName]) {
      return 1;
    }
    if (a[keyName] > b[keyName]) {
      return -1;
    }
    return 0;
}
export function capitalize(phrase) {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}