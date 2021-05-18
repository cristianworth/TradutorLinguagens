const tokens = {
  "(se)": () => {
    return ` IF ( `;
  },
  "(entao)": () => {
    return ` ) { `;
  },
  "(senao)": (x) => {
    return ` } ELSE { `;
  },
  "(fimse)|(fimpara)|(fimalgoritmo)|(fimenquanto)|(fimescolha)|(fimfuncao)|(fimprocedimento)|(fimrepita)":
    (x) => {
      return ` } `;
    },
  "(escreval)|(escreva)": (x) => {
    return ` CONSOLE.LOG`;
  },
  "(?<=(para))(.*?)(?=(faca))": (x) => {
    [, k, , i, , j] = x.match(/(.*)(de)(.*)(ate)(.*)/);
    return ` ${k} = ${i}; ${k} <= ${j}`;
  },
  "(para)": (x) => {
    return ` FOR ( `;
  },
  "(faca)": (x) => {
    return ` ) { `;
  },
  "(\\w+)((:(\\s*)inteiro)|(:(\\s*)real)|(:(\\s*)caractere)|(:(\\s*)logico))": (
    x
  ) => {
    [, k] = x.match(
      /(\w+)((:(\s*)inteiro)|(:(\s*)real)|(:(\s*)caractere)|(:(\s*)logico))/
    );
    return ` var ` + k;
  },

  "(<-)|(:=)": (x) => {
    return ` = `;
  },

  "(escolha)": (x) => {
    return ` switch( `;
  },

  "(caso)(.*)((caso)|(outrocaso))": (x) => {
    [, , y] = x.match(/(caso)(.*)((caso)|(outrocaso))/);
    return `) { case ${y} :`;
  },
};

run = (s) => {
  for (property in tokens) {
    rgx = new RegExp(
      `(${property}\\b)(?=([^"\]*(\\.|"([^"\]*\\.)*[^"\]*"))*[^"]*$)`,
      "gm"
    );
    s = s.toLowerCase().replace(rgx, (x) => tokens[property](x));
  }
  s = s.replace(
    /("[^"]*(?:""[^"]*)*")|(.*\(.*?)(?:\n)(.*?\).*)/g,
    function (m) {
      return m.replace(/\n/g, "");
    }
  );
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
