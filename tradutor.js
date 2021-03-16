const obj = {
	"(se)(.*)(entao)": (x) => { 
		[,,y] = x.match(/(se)(.*)(entao)/)
		return ` IF ( ${y} ) { ` 
	},
	"(senao)": (x) => { 
		return ` } ELSE { ` 
	},
	"(fimse)|(fimpara)": (x) => { 
		return ` } ` 
	},
	"(escreval)|(escreva)": (x) => { 
		return ` console.log`
	},
	"(para)(.*)(de)(.*)(ate)(.*)(faca)":(x) => {
		 [,,k,,i,,j] = x.match(/(para)(.*)(de)(.*)(ate)(.*)(faca)/)
		 return s = ` FOR ( ${k} = ${i}; ${k} <= ${j} ) {`
	},
}

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
