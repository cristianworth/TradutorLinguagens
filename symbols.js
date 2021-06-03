var symbols = {},
    symbol = function (id, handle) {
        var sym = symbols[id] || {};
        symbols[id] = {
            handle: sym.handle || handle,
        };
    };

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
symbol("access", function (access) {
    access.value = access.value.replace(',', "][")
    return access;
});
symbol("newline", function (newline) {
    return newline;
});
symbol("call", function (call) {
    let indexNext = tokens.slice(i).findIndex(n => n.type == "newline") 
    let next =  tokens.slice(i,i+indexNext)
    let exists = next.find( n => n.value === "(" && n.type === "operator")
    if (!exists){
        call.value += "()"
    }
    return call
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
symbol("logical", function (logical) {
    
    value = keys.find(k => k.key?.toLowerCase() === logical.value?.toLowerCase());
    return { value: value?.parser(logical.generated) ?? "", type: "parsed" };
});
symbol("keyword", function (keyword) {
    value = keys.find(k => k.key?.toLowerCase() === keyword.value?.toLowerCase());
    return { value: value?.parser(keyword.generated) ?? "", type: "parsed" };
});
symbol("identifier", function (name) {
    return name;
});