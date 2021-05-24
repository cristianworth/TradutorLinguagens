const tokens = {
	"(se)":() => { 
		return ` IF ( ` 
	},
	"(entao)": () => { 
		return ` ) { ` 
	},

	"(senao)": (x) => { 
		return ` } ELSE { ` 
	},
	"(fimse)|(fimpara)|(fimenquanto)|(fimescolha)|(fimfuncao)|(fimprocedimento)|(fimrepita)": (x) => {
		return ` } ` 
	},
	"(escreval)|(escreva)": (x) => { 
		return ` CONSOLE.LOG`
	},
	"(?<=(para))(.*?)(?=(\\s*faca))":(x) => {
		[,k,,i,,j,,,z] = x.match(/(\S+)(\s+)(de)(\s+)(\S+)(\s+)(ate)(\s+)(\S+)(\s*)((passo)(\s+)(\S+))?/).filter( x=> (x||'').trim())
		return ` ${k} = ${i}; ${k} <= ${j}; ${k} + ${z||1}`
   },
	"(para)":(x) => {
		 return ` FOR ( `
	},
	"(enquanto)":(x) => {
		return ` WHILE ( `
   	},
	"(repita)":(x) => {
		return ` DO {`
	},
	"(ate)(\\s*)(.+)(\\s|$)":(x) => {
		[,,,k] = x.match(/(ate)(\s*)(.+)(\s|$)/)
		return `} while (${k});\n `
	},

	"(\\w+)((:(\\s*)inteiro)|(:(\\s*)real)|(:(\\s*)caractere)|(:(\\s*)logico))": (x) => { 
		[,k] = x.match(/(\w+)((:(\s*)inteiro)|(:(\s*)real)|(:(\s*)caractere)|(:(\s*)logico))/)
		return ` var ` + k 
	},
	"(escolha)": (x) => {
		return ` switch( `;
		},
  "(<-)|(:=\\s*)": (x) => {
    return ` = `;
  },
	"((caso)(.*))": (x) => {
		[, , y] = x.match(/(caso)(.*)/);
		ar = y.split(',')
		return ar.reduce( (prev, curr) => prev + ` case ${curr} : \n` );
	},
	"(leia)\((.*)\)": (x) => {
		[, a] = x.match(/leia\((.*)\)/);
		return ` var ${a} = prompt('What is your name?',''); `;
	  },
	  "(algoritmo)|(var)|(inicio)|(fimalgoritmo)": (x) => {
		return ``;
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
}


run = (s) => {
  
  for (property in tokens) {

		rgx = new RegExp(`(${property}\\b)(?=([^"\]*(\\.|"([^"\]*\\.)*[^"\]*"))*[^"]*$)`,"gmi")
		if(property=="((caso)(.*))"){
			rgx = new RegExp(`(${property})`,"gmi")
		}

    	s = s.toLowerCase().replace(rgx, (x) => tokens[property](x));
  }
  s = s.replace(/("[^"]*(?:""[^"]*)*")|(.*\(.*?)(?:\n)(.*?\).*)/g, function(m) { return m.replace(/\n/g, ''); })
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
  
  var button = document.getElementById("save");
  button.addEventListener("click", saveTextAsFile);
  
  function destroyClickedElement(event) {
	// remove the link from the DOM
	document.body.removeChild(event.target);
  }
