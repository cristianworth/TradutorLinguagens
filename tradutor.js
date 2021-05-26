const tokens = {
	"(.*algoritmo \".*\"\n)|(var)|(inicio)|(fimalgoritmo)": (x) => {
		return ``;
	},
	"(se)":() => { 
		return ` if ( ` 
	},
	"(entao)": () => { 
		return ` ) { ` 
	},
	"(senao)": (x) => { 
		return ` } else { ` 
	},
	"(escreval)|(escreva)": (x) => { 
		return ` console.log `
	},
	"(?<=(para))(.*?)(?=(\\s*faca))":(x) => {
		[,k,,i,,j,,,z] = x.match(/(\S+)(\s+)(de)(\s+)(\S+)(\s+)(ate)(\s+)(\S+)(\s*)((passo)(\s+)(\S+))?/).filter( x=> (x||'').trim())
		return ` ${k} = ${i}; ${k} <= ${j}; ${k} + ${z||1}`
  },
	"(para)":(x) => {
    return ` FOR ( `
	},
	"(enquanto)":(x) => {
		return ` while ( `
  },
	"(repita)":(x) => {
		return ` do {`
	},
	"(ate)(\\s*)(.+)(\\s|$)":(x) => {
		[,,,k] = x.match(/(ate)(\s*)(.+)(\s|$)/)
		return `} while (${k});\n `
	},
	"(\\w+)((\\s*:(\\s*)inteiro)|(\\s*:(\\s*)real)|(\\s*:(\\s*)caractere)|(\\s*:(\\s*)logico))": (x) => {
		[, k] = x.match(
		  /(\w+)((\s*:(\s*)inteiro)|(\s*:(\s*)real)|(\s*:(\s*)caractere)|(\s*:(\s*)logico))/
		);
		return ` var ` + k;
	  },
  "(<-)|(:=\\s*)": (x) => {
    return ` = `;
  },
  "(retorne)": (x) => {
    return ` return `;
  },
  "(nao)": (x) => {
    return `!`;
  },
  "(limpatela)": (x) => {
    return `console.clear()`;
  },
  "(verdadeiro)": (x) => {
    return ` true `;
  },
  "(falso)": (x) => {
    return ` false `;
  },
	"((leia\\s*)\\(([^)]*)\\))": (x) => {
		[, , a] = x.match(/(leia\s*)\((.*)\)/i);
		return ` ${a} = prompt() `;
  },
	"((maiusc\\s*)\\(([^)]*)\\))":(x) => {
		[, , a] = x.match(/(maiusc\s*)\((.*)\)/i);
		return ` ${a}.toUpperCase()`;
	},
	"((minusc\\s*)\\(([^)]*)\\))":(x) => {
		[, , a] = x.match(/(minusc\s*)\((.*)\)/i);
		return ` ${a}.toLowerCase()`;
	},
	"(interrompa)": (x) => {
		return ` break `;
	},
	"((ESCOLHA)[\\s\\S]*(?=(FIMESCOLHA)))": (x) => {
		debugger;
		[operation,...token] = x.split(/(?<!".*)caso|outrocaso(?<!".*)/i);
		[opt] = operation.match(/(?<=(escolha))(.*)/i)
		opt = `switch ( ${opt} ) { \n`
		outrocaso = x.match(/(?<!".*)caso|outrocaso(?<!".*)/igm).indexOf('outrocaso')
		return opt + token.reduce((prev, curr, index) => {
			[,tk] = curr.match(/(.*)\n/)
			var exp = curr.replace(tk,'');
			ar = tk.split(',');
			
			if(outrocaso==index)
				return prev + ` default: ` +exp+"\nbreak;\n"
			return prev+ ar.reduce( (p, c) => p + ` case ${c} : `,'' )+exp+"\n break;\n"
			
		},'')
	},
	"(fimse)|(fimpara)|(fimenquanto)|(fimescolha)|(fimfuncao)|(fimprocedimento)|(fimrepita)": (x) => {
		return ` } ` 
	},
}


run = (s) => {
  for (property in tokens) {
	rgx = new RegExp(`(${property})(?=([^"\]*(\\.|"([^"\]*\\.)*[^"\]*"))*[^"]*$)`,"gmi")

	s = s.replace(rgx, (x) => tokens[property](x));
  }
  return s;
};


traduzir = () => {
	var original = document.getElementById("original").value;
	document.getElementById("downloadbtn").disabled = false;
	document.getElementById("translated").innerHTML = run(original);
};
  
function Download() {
	var textToWrite = document.getElementById("translated").innerHTML;
	var textFileAsBlob = new Blob([textToWrite], { type: "text/plain" });
	var fileNameToSaveAs = "translate.js"; //filename.extension
  
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null) {
	  // Chrome allows the link to be clicked without actually adding it to the DOM.
	  downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	} else {
	  // Firefox requires the link to be added to the DOM before it can be clicked.
	  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	  downloadLink.onclick = destroyClickedElement;
	  downloadLink.style.display = "none";
	  document.body.appendChild(downloadLink);
	}
  
	downloadLink.click();
}

  
function destroyClickedElement(event) {
  // remove the link from the DOM
  document.body.removeChild(event.target);
}