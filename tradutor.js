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
  document.getElementById("downloadbtn").disabled = false;
  document.getElementById("translated").innerHTML = run(original);
};

function Download() {
	var textToWrite = document.getElementById('translated').innerHTML;
	var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
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
  
  var button = document.getElementById('save');
  button.addEventListener('click', saveTextAsFile);
  
  function destroyClickedElement(event) {
	// remove the link from the DOM
	document.body.removeChild(event.target);
  }