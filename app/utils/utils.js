export function sortAsc(keyName, a, b) {
  if (a[keyName].toLowerCase() > b[keyName].toLowerCase()) {
    return 1;
  }
  if (a[keyName].toLowerCase() < b[keyName].toLowerCase()) {
    return -1;
  }
  return 0;
}

export function sortDesc(keyName, a, b) {
  if (a[keyName].toLowerCase() < b[keyName].toLowerCase()) {
    return 1;
  }
  if (a[keyName].toLowerCase() > b[keyName].toLowerCase()) {
    return -1;
  }
  return 0;
}

export function capitalize(phrase) {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

export function getFormData(formElement) {
  const payload = new Object;
  const inputs = formElement.getElementsByTagName("input");
  Array.prototype.slice.call(inputs).forEach(function (element) {
    payload[element.name] = element.value;
  });
  return payload;
}