const obj = {
	"(se)(.*)(entao)": (x) => { 
		[,,y] = x.match(/(se)(.*)(entao)/)
		return ` IF ( ${y} ) { ` 
	},
	"(senao)": (x) => { 
		return ` } ELSE { ` 
	},
	"(fimse)|(fimpara)|(fimalgoritmo)|(fimenquanto)|(fimescolha)|(fimfuncao)|(fimprocedimento)|(fimrepita)": (x) => {
		return ` } ` 
	},
	"(escreval)|(escreva)": (x) => { 
		return ` CONSOLE.LOG`
	},
	"(para)(.*)(de)(.*)(ate)(.*)(faca)":(x) => {
		 [,,k,,i,,j] = x.match(/(para)(.*)(de)(.*)(ate)(.*)(faca)/)
		 return ` FOR ( ${k} = ${i}; ${k} <= ${j} ) {`
	},
	"(inteiro(\\s*):)|(real(\\s*):)|(caractere(\\s*):)|(logico(\\s*):)": (x) => { 
		return ` VAR ` 
	},
}

run = (s) => {
  for (property in obj) {
	rgx = new RegExp(`(${property})(?=([^"\]*(\\.|"([^"\]*\\.)*[^"\]*"))*[^"]*$)`,"gm")
	console.log(rgx)
    	s = s.toLowerCase().replace(rgx, (x) => obj[property](x));
  }
  return s;
};

traduzir = () => {
  var original = document.getElementById("original").value;
  document.getElementById("translated").innerHTML = run(original);
};
