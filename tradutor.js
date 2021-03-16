const obj = {
  "(se)(.*)(entao)": (x) => {
    return x
      .replace(/(se)(.*)(entao)/gm, (x) => ` IF ( ${x} ) { `)
      .replace(/(se)|(entao)/gm, "");
  },
  "(senao)": (x) => {
    return x.replace(/(senao)/gm, (x) => ` } ELSE { `);
  },
  "(fimse)|(fimpara)": (x) => {
    return x.replace(/(fimse)|(fimpara)/gm, (x) => ` } `);
  },
  "(escreval)": (x) => {
    return x.trim().replace(/(escreval)/gm, (x) => ` console.log`);
  },
  "(para)(.*)(de)(.*)(ate)(.*)(faca)": (x) => {
    [, , k, , i, , j] = x.match(/(para)(.*)(de)(.*)(ate)(.*)(faca)/);
    return (s = ` FOR ( ${k} = ${i}; ${k} <= ${j} ) {`);
  },
};

run = (s) => {
  for (property in obj) {
    rgx = new RegExp(property, "gm");
    s = s.toLowerCase().replace(rgx, (x) => obj[property](x));
  }
  return s;
};

traduzir = () => {
  var original = document.getElementById("original").value;
  document.getElementById("translated").innerHTML = run(original);
};
