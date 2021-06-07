
const keysJS = [
    {
        key: "var",
        value: "var",
        expect: "inicio|procedimento|funcao",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} `
            let variables = []
            let rgx = new RegExp(this.expect, 'i')

            while (!(token().type === this.expectType && rgx.test(token().value))) {

                if (token().type === "identifier") {
                    variables.push(expression())
                }
                else if (token().type === "operator" && token().value === ":") {
                    while (token().type !== this.expectType) advance()

                    var type = keywords[token().value]
                    if (token().value === "vetor") {
                        while (token().type !== "access") advance()
                        let access = token().value.split(',');
                        if (access.length > 1) {
                            [initial, final] = access[0].match(/\d/g);
                            [mInitial, mFinal] = access[1].match(/\d/g);
                            variables[variables.length - 1].parsedValue = variables[variables.length - 1].value + ` = [...Array(${final}+1)].map((e,indx) => { if(indx>=${initial}) return Array(${mFinal}+1).fill(null,${mInitial}) }) `
                        } else {
                            [initial, final] = access[0].match(/\d/g)
                            variables[variables.length - 1].parsedValue = variables[variables.length - 1].value + ` = [...Array(${final}+1).fill(null,${initial}) ]`
                        }
                        while ((token().type !== this.expectType) || (token().value === "de" && token().type === this.expectType)) advance()
                        type = keywords[token().value]
                    }

                    variables.forEach(variable => {
                        tokens.forEach((tk, index) => {
                            if (!tk.dataType && tk.value === variable.value && tk.type === variable.type)
                                tokens[index].dataType = type;
                        })
                    })
                    advance()
                }
                else
                    advance()
            };

            return retorno + variables.map(v => v.parsedValue || v.value).join() + ";\n";
        }
    },
    {
        key: "inicio",
        value: "",
        expect: "fimalgoritmo",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "fimalgoritmo",
        value: "",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "algoritmo",
        value: "//",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} algoritmo `
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
            argsAccess = args.find(a => a.type == "access")
            if (argsAccess?.value)
                argsAccess.value = argsAccess.value.replace(',', "][")

            let retorno = ` ${arg.value + (argsAccess?.value || '')} = ${arg.dataType}(${this.value}()); console.log(${arg.value + (argsAccess?.value || '')});`
            return retorno
        }
    },
    {
        key: "maiusc",
        value: "toUpperCase",
        expect: "",
        expectType: "identifier|literal",
        parser: function () {
            let exp;
            let rgx = new RegExp(this.expectType, 'i')
            while (!(token().type === "operator" && token().value === "("))
                advance()

            if (token().type === "operator" && token().value === "(") {
                tokens[i].type = "argument"
            }
            exp = expression()
            let args = argument(exp)
            arg = args.find(a => rgx.test(a.type))
            argsAccess = args.find(a => a.type == "access")
            if (argsAccess?.value)
                argsAccess.value = argsAccess.value.replace(',', "][")

            let retorno = ` ${arg.value + (argsAccess?.value || '')}.${this.value}()`
            return retorno
        }
    },
    {
        key: "minusc",
        value: "toLowerCase",
        expect: "",
        expectType: "identifier|literal",
        parser: function () {
            let exp;
            let rgx = new RegExp(this.expectType, 'i')
            while (!(token().type === "operator" && token().value === "("))
                advance()

            if (token().type === "operator" && token().value === "(") {
                tokens[i].type = "argument"
            }
            exp = expression()
            let args = argument(exp)
            arg = args.find(a => rgx.test(a.type))
            argsAccess = args.find(a => a.type == "access")
            if (argsAccess?.value)
                argsAccess.value = argsAccess.value.replace(',', "][")

            let retorno = ` ${arg.value + (argsAccess?.value || '')}.${this.value}()`
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

                if (token().type === "keyword" && token().value == "de") {
                    part = argumentParts.next()
                    advance()
                }
                else if (token().type === "keyword" && token().value == "ate") {
                    part = argumentParts.next()
                    advance()
                }
                else if (token().type === "keyword" && token().value == "passo") {
                    part = argumentParts.next()
                    advance()
                }
                part.value(token().value)
                advance()
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
    {
        key: "senao",
        value: "else",
        expect: "",
        expectType: "keyword",
        parser: function () {
            let retorno = ` } ${this.value} { `
            return retorno
        },
    },
    {
        key: "verdadeiro",
        value: "true",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "falso",
        value: "false",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "enquanto",
        value: "while",
        expect: "faca",
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
        key: "faca",
        value: "{",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = `) ${this.value} `
            return retorno
        },

    },
    {
        key: "fimenquanto",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "=",
        value: "===",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "<>",
        value: "!==",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "<=",
        value: "<=",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: ">=",
        value: ">=",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "e",
        value: "&&",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "ou",
        value: "||",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "repita",
        value: "do",
        expect: "ate",
        expectType: "keyword",
        parser: function () {
            let retorno = ` ${this.value} { `
            while (!(token().type === this.expectType && token().value === this.expect)) {
                retorno += expression().value
            };
            return retorno
        },
    },
    {
        key: "ate",
        value: "while",
        expect: "fimrepita",
        expectType: "keyword",
        parser: function () {
            let retorno = `} ${this.value} ( `
            while (!(token().type === this.expectType && token().value === this.expect)) {
                retorno += expression().value
            };
            return retorno
        },
    },
    {
        key: "fimrepita",
        value: ")",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "mod",
        value: "%",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "randi",
        value: "Math.random()",
        expect: "",
        expectType: "number",
        parser: function () {
            let exp;
            let rgx = new RegExp(this.expectType, 'i')
            while (!(token().type === "operator" && token().value === "("))
                advance()

            if (token().type === "operator" && token().value === "(") {
                tokens[i].type = "argument"
            }
            exp = expression()
            let args = argument(exp)
            arg = args.find(a => rgx.test(a.type))
            argsAccess = args.find(a => a.type == "access")
            if (argsAccess?.value)
                argsAccess.value = argsAccess.value.replace(',', "][")

            let retorno = `Math.floor(Math.random() * ${arg.value + (argsAccess?.value || '')} )`
            return retorno
        }
    },
    {
        key: "procedimento",
        value: "function",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = ` ${this.value} `
            let indentifier, args = "", returnType = "";
            let variables = []
            function* generatorParts() {
                yield (value) => {
                    indentifier = value;
                }
                yield (value) => {
                    while (!(token().type === "operator" && token().value === ")")) {
                        if (token().type === "identifier") {
                            variables.push(expression())
                        }

                        else if (token().type === "operator" && token().value === ":") {
                            while (token().type !== "keyword") advance()

                            var type = keywords[token().value]

                            variables.forEach(variable => {
                                tokens.forEach((tk, index) => {
                                    if (!tk.dataType && tk.value === variable.value && tk.type === variable.type)
                                        tokens[index].dataType = type;
                                })
                            })

                            advance()
                        }
                        else
                            advance()
                    };
                    args = variables.map(v => v.parsedValue || v.value).join();
                    part = argumentParts.next()

                }
                yield (value) => {
                    if (value.type === "keyword")
                        returnType += value.value
                }
            }

            let argumentParts = generatorParts();
            let part = argumentParts.next();

            while (!(token().type === this.expectType)) {
                if (token().type === "operator" && token().value == "(") {
                    part = argumentParts.next()
                    advance()
                }
                part.value(token())
                advance()
            };
            advance()
            tokens.forEach((tk, index) => {
                if (!tk.returnType && tk.value === indentifier.value && tk.type === indentifier.type) {
                    tokens[index].type = "call";
                    tokens[index].returnType = keywords[returnType] || "void";
                }
            })

            retorno += ` ${indentifier.value} (${args}) {\n`
            return retorno
        }
    },
    {
        key: "funcao",
        value: "function",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = ` ${this.value} `
            let indentifier, args = "", returnType = "";
            let variables = []
            function* generatorParts() {
                yield (value) => {
                    indentifier = value;
                }
                yield (value) => {
                    while (!(token().type === "operator" && token().value === ")")) {
                        if (token().type === "identifier") {
                            variables.push(expression())
                        }

                        else if (token().type === "operator" && token().value === ":") {
                            while (token().type !== "keyword") advance()

                            var type = keywords[token().value]

                            variables.forEach(variable => {
                                tokens.forEach((tk, index) => {
                                    if (!tk.dataType && tk.value === variable.value && tk.type === variable.type)
                                        tokens[index].dataType = type;
                                })
                            })

                            advance()
                        }
                        else
                            advance()
                    };
                    args = variables.map(v => v.parsedValue || v.value).join();
                    part = argumentParts.next()

                }
                yield (value) => {
                    if (value.type === "keyword")
                        returnType += value.value
                }
            }

            let argumentParts = generatorParts();
            let part = argumentParts.next();

            while (!(token().type === this.expectType)) {
                if (token().type === "operator" && token().value == "(") {
                    part = argumentParts.next()
                    advance()
                }
                part.value(token())
                advance()
            };
            advance()
            tokens.forEach((tk, index) => {
                if (!tk.returnType && tk.value === indentifier.value && tk.type === indentifier.type) {
                    tokens[index].type = "call";
                    tokens[index].returnType = keywords[returnType] || "void";
                }
            })

            retorno += ` ${indentifier.value} (${args}) {\n`
            return retorno
        }
    },
    {
        key: "fimprocedimento",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "fimfuncao",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "retorne",
        value: "return",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
    {
        key: "fimfuncao",
        value: "}",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value} `
            return retorno
        }
    },
]
