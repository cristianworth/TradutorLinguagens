var lex = function (input) {

    var isAssignment = function (c) { return /(<-|:=)/.test(c + input[i + 1]); },
        isOperator = function (c) { return /[+\-*\/\^%=()<>!,:]/.test(c); },
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
        if (isLiteral(c)) {
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
                addToken("keyword", idn);
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
//var parse = function (tokens) {
var parseTree = '';
var symbols = {},
    symbol = function (id, handle) {
        var sym = symbols[id] || {};
        symbols[id] = {
            handle: sym.handle || handle,
        };
    };

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

const keys = [
    {
        key: "var",
        value: "var",
        expect: "inicio",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} `
            let variables = []
            while (!(token().type === this.expectType && token().value === this.expect)) {
                if (token().type === "identifier") {
                    variables.push(expression())

                }
                else if (token().type === "operator" && token().value === ":") {
                    while (token().type !== this.expectType) advance()

                    let type = keywords[token().value]
                    variables.forEach(variable => {
                        tokens.forEach((tk, index) => {
                            if (tk.value === variable.value && tk.type === variable.type)
                                tokens[index].dataType = type;
                        })
                    })
                    advance()
                }
                else
                    advance()
            };

            return retorno + variables.map(v => v.value).join() + ";\n";
        }
    },
    {
        key: "inicio",
        value: "{",
        expect: "fimalgoritmo",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "fimalgoritmo",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "<-",
        value: "=",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: ":=",
        value: "=",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "escolha",
        value: "switch",
        expect: "fimescolha",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} ( `
            let expectExpression = true;

            while (!(token().type === this.expectType && token().value === this.expect)) {
                if (token().type === "newline" && expectExpression) {
                    retorno += ' ) {\n '
                    advance();
                    expectExpression = false;
                    continue
                }
                exp = expression()
                retorno += exp.value
            };
            return retorno
        }
    },
    {
        key: "caso",
        value: "case",
        expect: "caso|outrocaso|fimescolha",
        expectType: "keyword",
        parser: function (generated) {
            let retorno = ` ${this.value} `
            let rgx = new RegExp(this.expect, 'i')
            let expectExpression = true;

            if (!generated) {
                let list = tokens.slice(i)
                let index = list.findIndex(next => rgx.test(next.value) && next.type === "keyword")
                tokens.splice(i + index, 0, { type: "keyword", value: "interrompa", generated: true })
            }

            while (!(token().type === this.expectType && rgx.test(token().value))) {
                if (token().type === "operator" && token().value === ",") {
                    retorno += ' : \n '
                    advance();
                    tokens.splice(i, 0, { type: "keyword", value: "caso", generated: true })
                    expectExpression = false;
                    continue
                }
                else if (token().type === "newline" && expectExpression) {
                    retorno += ' : \n '
                    advance();
                    expectExpression = false;
                    continue
                }
                exp = expression()
                retorno += exp.value || exp
            };
            return retorno
        }
    },
    {
        key: "interrompa",
        value: "break",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}; \n`
            return retorno
        }
    },
    {
        key: "fimescolha",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}; \n `
            return retorno
        }
    },
    {
        key: "fimpara",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}; \n `
            return retorno
        }
    },
    {
        key: "fimse",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}; \n `
            return retorno
        }
    },
    {
        key: "outrocaso",
        value: "default",
        expect: "fimescolha",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value}: `
            return retorno
        }
    },
    {
        key: "escreva",
        value: "console.log",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "escreval",
        value: "console.log",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "leia",
        value: "prompt",
        expect: "",
        expectType: "identifier",
        parser: function () {
            let exp;
            while (!(token().type === "operator" && token().value === "("))
                advance()

            if (token().type === "operator" && token().value === "(") {
                tokens[i].type = "argument"
            }
            exp = expression()
            let args = argument(exp)
            arg = args.find(a => a.type == this.expectType)
            let retorno = ` ${arg.value} = ${arg.dataType}(${this.value}())`
            return retorno
        }
    },
    {
        key: "para",
        value: "for",
        expect: "faca",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} ( `
            let indentifier = "", initialValue = "", finalValue = "", step = "";

            function* generatorParts() {
                yield (value) => {
                    indentifier += value
                }
                yield (value) => {
                    initialValue += value
                }
                yield (value) => {
                    finalValue += value
                }
                yield (value) => {
                    step += value
                }
            }

            let argumentParts = generatorParts();
            let part = argumentParts.next();

            while (!(token().type === this.expectType && token().value === this.expect)) {
                if (token().type === "keyword" && token().value == "de")
                    part = argumentParts.next()

                else if (token().type === "keyword" && token().value == "ate")
                    part = argumentParts.next()

                else if (token().type === "keyword" && token().value == "passo")
                    part = argumentParts.next()

                part.value(expression().value)
            };
            advance()
            retorno += ` ${indentifier} = ${initialValue}; ${indentifier} <= ${finalValue}; ${indentifier} += (${step || 1}) ) {`
            return retorno
        },

    },
    {
        key: "se",
        value: "if",
        expect: "entao",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} ( `
            while (!(token().type === this.expectType && token().value === this.expect)) {
                retorno += expression().value
            };
            return retorno
        },

    },
    {
        key: "entao",
        value: "{",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = `) ${this.value} `
            return retorno
        },

    },
]
symbol(")");
symbol("(end)", function () { return { value: "", type: "(end)" } });

symbol("(", function () {
    value = expression();
    if (token().type !== ")") throw "Expected closing parenthesis ')'";
    advance();
    return value;
});
symbol("number", function (number) {
    return number;
});
symbol("literal", function (literal) {
    return literal;
});
symbol("newline", function (newline) {
    return newline;
});
symbol("assignment", function (assignment) {
    value = keys.find(k => k.key?.toLowerCase() === assignment.value?.toLowerCase());
    return { value: value?.parser(assignment.generated) ?? "", type: "parsed" };
});
symbol("argument", function (arg) {
    if (arg.value === "(") {
        arg.suffix = []
        while (!(token().value === ")" && token().type === "operator")) {
            if (token().type === "operator" && token().value === "(") {
                tokens[i].type = "argument"
            }
            arg.suffix.push(expression());
        };
        arg.suffix.push(token())
        expression()
    }
    return arg;
});
symbol("operator", function (operator) {
    return operator;
});
symbol("keyword", function (keyword) {
    value = keys.find(k => k.key?.toLowerCase() === keyword.value?.toLowerCase());
    return { value: value?.parser(keyword.generated) ?? "", type: "parsed" };
});
symbol("identifier", function (name) {
    if (token().type === "(") {
        var args = [];
        if (tokens[i + 1].type === ")") advance();
        else {
            do {
                advance();
                args.push(expression(2));
            } while (token().type !== ")");
            if (token().type !== ")") throw "Expected closing parenthesis ')'";
        }
        advance();
        return {
            type: "call",
            args: args,
            name: name.value
        };
    }
    return name;
});

var parse = function () {
    while (token().type !== "(end)") {
        let parsedExpression = expression()
        parseTree += parsedExpression.value;
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
    ate: "<=",
    passo: "++",
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
    fimalgoritmo: "}",
    inteiro: "Number",
    real: "Number",
    caractere: "String",
    logico: "Boolean",
    vetor: "Array"
};





var args = {};

run = (s) => {
    tokens = lex(s);
    return parse()
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