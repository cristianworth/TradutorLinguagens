
var variaveisUsadas;
const keysCS = [
    {
        key: "var",
        value: "",
        expect: "inicio|procedimento|funcao",
        expectType: "keyword",
        parser: function () {
            let retorno = ` `
            let variables = []
            let rgx = new RegExp(this.expect, 'i')
            
            while (!(token().type === this.expectType && rgx.test(token().value))) {

                if (token().type === "identifier") {
                    variables.push(expression())
                }
                else if (token().type === "operator" && token().value === ":") {
                    while (token().type !== this.expectType) advance()

                    var type = variablesCS[token().value]
                    if (token().value === "vetor") {
                        while (token().type !== "access") advance()
                        let access = token().value.split(',');
                        while ((token().type !== this.expectType) || (token().value === "de" && token().type === this.expectType)) advance()
                        type = variablesCS[token().value];
                        if (access.length > 1) {
                            [initial, final] = access[0].match(/\d/g);
                            [mInitial, mFinal] = access[1].match(/\d/g);
                            variables[variables.length - 1].parsedValue = variables[variables.length - 1].value + ` = new ${type}[${(+initial)+(+final)},${(+mInitial)+(+mFinal)}] `
                        } else {
                            [initial, final] = access[0].match(/\d/g)
                            variables[variables.length - 1].parsedValue = variables[variables.length - 1].value + ` = new ${type}[${(+initial)+(+final)}]`
                        }
                        type+='[]';
                    }

                    variables.forEach(variable => {
                        tokens.forEach((tk, index) => {
                            if (!tk.dataType && tk.value === variable.value && tk.type === variable.type){
                                tokens[index].dataType = type;
                                variable.dataType = type
                            }
                        })
                    })
                    advance()
                }
                else
                    advance()
            };
            
            variaveisUsadas = variables;
            return retorno + variables.reduce((prev, current) =>  
               prev += ` ${current.dataType} ${(current.parsedValue || (current.value+' = null'))};\n` 
             , '');
        }
    },
    {
        key: "inicio",
        value: "",
        expect: "fimalgoritmo",
        expectType: "keyword",
        parser: function () {
            let lastIndex = tokens.map(t=> t.value).lastIndexOf("inicio");
            
            let retorno = ` ${this.value} `
            if(lastIndex+1 == i)
            retorno = `	public void Main()\n{\n Random rand = new Random(); `
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
            let retorno = ` break; \n${this.value}; \n `
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
        value: "Console.WriteLine",
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
            let args = compileArguments(exp)
            arg = args.filter(a => a.type !== "argument" &&  a.value !== ",")
            arg.forEach( a => {
                if (a?.value && a.type == "access")
                    a.value = a.value.replace(',', "][")
            })
            let retorno = `${this.value}(string.Format("${arg.reduce((accumulator, currentValue, index) => accumulator += `{${index}} `,"")}",${arg.map(a => a.value).join()} ))`
            return retorno
        }
    },
    {
        key: "escreval",
        value: "Console.WriteLine",
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
            let args = compileArguments(exp)
            arg = args.filter(a => a.type !== "argument" &&  a.value !== ",")
            arg.forEach( a => {
                if (a?.value && a.type == "access")
                    a.value = a.value.replace(',', "][")
            })
            let retorno = `${this.value}(string.Format("${arg.reduce((accumulator, currentValue, index) => accumulator += `{${index}} `,"")}",${arg.map(a => a.value).join()} ))`
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

            let tipoVariavelUsada;
            variaveisUsadas.forEach(function (x) {
                if (x.value == arg.value) {
                    tipoVariavelUsada = x.dataType;
                }
            })
            
            let retorno;
            if (tipoVariavelUsada == "int?")
                retorno = ` ${arg.value} = Convert.ToInt32(Console.ReadLine()); `
            else if (tipoVariavelUsada == "decimal?")
                retorno = ` ${arg.value} = Convert.ToDecimal(Console.ReadLine()); `
            else
                retorno = ` ${arg.value} = Console.ReadLine(); `
            
            return retorno
        }
    },
    {
        key: "maiusc",
        value: "ToUpper",
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
        value: "ToLower",
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
        value: "==",
        expect: "",
        expectType: "",
        parser: function () {
            let retorno = ` ${this.value}`
            return retorno
        }
    },
    {
        key: "<>",
        value: "!=",
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
        value: "rand.Next",
        expect: "",
        expectType: "number",
        parser: function () {
            let retorno = `${this.value}`
            return retorno
        }
    },
    {
        key: "procedimento",
        value: "public ",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = `\n ${this.value} `
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

                            var type = variablesCS[token().value]

                            variables.forEach(variable => {
                                tokens.forEach((tk, index) => {
                                    if (!tk.dataType && tk.value === variable.value && tk.type === variable.type){
                                        tokens[index].dataType = type;
                                        variable.dataType = type
                                    }
                                })
                            })

                            advance()
                        }
                        else
                            advance()
                    };
                    
                    args =  variables.reduce((prev, current) =>  
                    prev += ` ${current.dataType} ${(current.parsedValue || current.value)},`
                    , '');
                    part = argumentParts.next()
                    
                }
                yield (value) => {
                    if (value.type === "keyword")
                        returnType += variablesCS[value.value]
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
                if (!tk.returnType && tk.value === indentifier.value && tk.type === indentifier.type){
                    tokens[index].type = "call";
                    tokens[index].returnType = variablesCS[returnType]||"void";
                }
            })
            
            retorno += ` ${returnType} ${indentifier.value} (${args}) {\n`
            return retorno
        }
    },
    {
        key: "funcao",
        value: "public ",
        expect: "",
        expectType: "newline",
        parser: function () {
            let retorno = `\n ${this.value} `
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

                            var type = variablesCS[token().value]

                            variables.forEach(variable => {
                                tokens.forEach((tk, index) => {
                                    if (!tk.dataType && tk.value === variable.value && tk.type === variable.type){
                                        tokens[index].dataType = type;
                                        variable.dataType = type
                                    }
                                })
                            })

                            advance()
                        }
                        else
                            advance()
                    };
                    
                    args =  variables.reduce((prev, current) =>  
                    prev += ` ${current.dataType} ${(current.parsedValue || current.value)},`
                    , '');
                    part = argumentParts.next()
                    
                }
                yield (value) => {
                    if (value.type === "keyword")
                        returnType += variablesCS[value.value]
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
                if (!tk.returnType && tk.value === indentifier.value && tk.type === indentifier.type){
                    tokens[index].type = "call";
                    tokens[index].returnType = variablesCS[returnType]||"void";
                }
            })
            
            retorno += ` ${returnType} ${indentifier.value} (${args}) {\n`
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

const variablesCS = {
    inteiro: "int?",
    real: "decimal?",
    caractere: "string",
    caracter: "string",
    logico: "bool?",
}
