var lexer = function (input) {

    var isAssignment = function (c) { return /(<-|:=)/.test(c + input[i + 1]); },
        isLogical = function (c) { return /(<>|[<>]?=.|\se\s|\sou\s)/i.test(input[i - 1] + c + input[i + 1] + input[i + 2]); },
        isOperator = function (c) { return /[+\-*\/\^%()<>!,:]/.test(c); },
        isComment = function (c) { return /\/{2}/.test(c + input[i + 1]); },
        isAccess = function (c) { return /[\[\]]/.test(c); },
        isDigit = function (c) { return /[0-9]/.test(c); },
        isWhiteSpace = function (c) { return / /.test(c); },
        isNewLine = function (c) { return /\n/.test(c); },
        isLiteral = function (c) { return /["]/.test(c); },
        isKeyWord = function (c) { return (keywords[c.toLowerCase()] != undefined); },
        isIdentifier = function (c) { return typeof c === "string" && !isOperator(c) && !isWhiteSpace(c) && !isNewLine(c) && !isLiteral(c) && !isAccess(c); };

    var tokens = [], c, i = 0;
    var advance = function () { return c = input[++i]; };
    var addToken = function (type, value) {
        tokens.push({
            type: type,
            value: value
        });
    };

    while (i < input.length) {
        c = input[i];
        if (isComment(c)) {
            var cmm = "";
            do cmm += c; while (!isNewLine(advance()));
            cmm += c
            advance()
            addToken("comment", cmm)
        }
        else if (isLiteral(c)) {
            var lit = "";
            do lit += c; while (!isLiteral(advance()));
            lit += c
            advance()
            addToken("literal", lit)
        }
        else if (isWhiteSpace(c)) advance();
        else if (isNewLine(c)) {
            addToken("newline", c)
            advance();
        }
        else if (isAssignment(c)) {
            c += advance();
            addToken("assignment", c)
            advance();
        }
        else if (isLogical(c)) {
            c += advance();
            addToken("logical", c.toLowerCase().trim())
            advance();
        }
        else if (isOperator(c)) {
            addToken("operator", c);
            advance();
        }
        else if (isDigit(c)) {
            var num = c;
            while (isDigit(advance())) num += c;
            if (c === ".") {
                do num += c; while (isDigit(advance()));
            }
            num = parseFloat(num);
            if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
            addToken("number", num);
        }
        else if (isAccess(c)) {
            let access = c;
            while (!isAccess(advance())) access += c
            access += c
            addToken("access", access);
            advance()
        }
        else if (isIdentifier(c)) {
            var idn = c;
            while (isIdentifier(advance())) idn += c;
            if (isKeyWord(idn)) {
                addToken("keyword", idn.toLowerCase());
            } else {
                addToken("identifier", idn);
            }
        }
        else throw "Unrecognized token.";
    }
    addToken("(end)", "(end)");
    return tokens;
};
tokens = [];
var keys = [];
//var parse = function (tokens) {
var interpretToken = function (token) {
    var sym = Object.create(symbols[token.type]);
    sym.type = token.type;
    sym.value = token.value;
    sym.generated = token.generated || false;
    sym.dataType = token.dataType || null;
    return sym;
};
var i = 0, token = function () { return interpretToken(tokens[i]); };
var advance = function () { i++; return token(); };

var expression = function () {
    var prefix, t = token();
    advance();
    prefix = t.handle(t);
    return prefix;
};

var argument = function (token) {
    let suffix = token.suffix || []
    let preffix = [token]
    if (suffix.length > 0)
        suffix.forEach(s => preffix.push(...argument(s)))
    return preffix
}

var compileArguments = function (argstree) {

    let args = argument(argstree)
    args.filter((a, index) => a.type == "argument" && index > 0).forEach(a => { a.type = "operator" })
    args[args.length - 1].type = "argument"
    return args
}

var parse = function () {
    keys = (traduzParaJS) ? keysJS : keysCS;
    i = 0;
    let parseTree = "";
    while (token().type !== "(end)") {
        let parsedExpression = expression()
        parseTree += " " + parsedExpression.value;
    }
    if (!traduzParaJS) {
        var rgx = /([;{}]|(^\s*))(\s*)$/img
        var x = parseTree.split('\n')
        x.forEach((s, i) => {
            if (!s.match(rgx)) {
                x[i] += " ; "
            }
        })
        parseTree = x.join("\n")
    }
    return parseTree;
};

// var functions = {
//     sin: Math.sin,
//     cos: Math.cos,
//     tan: Math.cos,
//     asin: Math.asin,
//     acos: Math.acos,
//     atan: Math.atan,
//     abs: Math.abs,
//     round: Math.round,
//     ceil: Math.ceil,
//     floor: Math.floor,
//     log: Math.log,
//     exp: Math.exp,
//     sqrt: Math.sqrt,
//     max: Math.max,
//     min: Math.min,
//     random: Math.random
// };

var keywords = {
    se: "if",
    entao: "{",
    senao: "else",
    fimse: "",
    para: "for",
    de: ";",
    repita: "do",
    fimrepita: "}",
    ate: "while",
    passo: "+=",
    faca: "do",
    fimpara: "}",
    escolha: "switch",
    fimescolha: " } ",
    interrompa: " break ",
    caso: "case",
    outrocaso: "default",
    escreva: "console.log",
    escreval: "console.log",
    leia: "prompt",
    var: "var",
    inicio: "{",
    algoritmo: "//",
    fimalgoritmo: "}",
    inteiro: "Number",
    real: "Number",
    caractere: "String",
    caracter: "String",
    logico: "Boolean",
    vetor: "Array",
    maiusc: "toUpperCase",
    minusc: "toLowerCase",
    faca: "{",
    enquanto: "while",
    fimenquanto: "}",
    randi: "Math.random()",
    mod: "%",
    procedimento: "function",
    fimprocedimento: "}",
    retorne: "return",
    funcao: "function",
    fimfuncao: "}",
};





var args = {};

run = (s) => {
    tokens = lexer(s);
    contaOcorrenciaTokens()
    return parse()
};

var traduzParaJS;
traduzir = () => {
    var original = document.getElementById("original").value;
    document.getElementById("downloadbtn").disabled = false;
    traduzParaJS = document.getElementById("traduzPara").value == "JS";
    document.getElementById("translated").value = run(original);
};

function Download() {
    var textToWrite = document.getElementById("translated").value;
    var textFileAsBlob = new Blob([textToWrite], { type: "text/plain" });
    var fileNameToSaveAs = (traduzParaJS) ? "translate.js" : "translate.cs";

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
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



function contaOcorrenciaTokens() {
    var countTokens = Object.values(tokens.reduce((a, { value, type }) => {
        a[value] = a[value] == undefined ? { value, type, count: 0 } : a[value];
        a[value].count++;
        return a;
    }, Object.create(null)));
    var sort = ["identifier", "keyword", "number", "literal", "operator", "logical", "assignment", "access", "call", "argument", "newline", "comment", "(end)"]
    countTokens = countTokens.sort((a, b) => sort.indexOf(a.type) - sort.indexOf(b.type));

    var cabecalhoHTML = '<tr><th scope="col">Token</th><th scope="col">Tipo</th><th scope="col">Quantidade</th></tr>';
    var corpoHTML = '';
    countTokens.forEach(function (x) {
        corpoHTML += `<tr><td scope="row">${x.value === '\n' ? 'Quebra de linha' : x.value}</td><td>${x.type}</td><td>${x.count}</td></tr>`;
    });

    var minhaDiv = document.getElementById("ocorrenciaTokensBody");
    minhaDiv.innerHTML = cabecalhoHTML + corpoHTML;
}
