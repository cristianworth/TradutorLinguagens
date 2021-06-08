# Tradutor de Linguagens
Tradutor de Linguagens é um trabalho da disciplina de Compiladores da UNIJUI
### Funcionalidades
* [x] Tradução da linguagem origem VisuAlg para a linguagem destino JavaScript
* [x] Tradução da linguagem origem VisuAlg para a linguagem destino C#
* [x] Download do arquivo traduzido
* [x] Geração da tabela de tokens que foram localizados no código origem VisuAlg
### Como usar
1. Informe um código funcional em VisuAlg na caixa de texto na direita
2. Selecione a linguagem destino (JS ou C#) e clique no botão "Traduzir"
3. O programa vai converter o código VisuAlg informado para um equivalente em JS/C# na caixa de texto da esquerda
4. Além disso será gerado a tabela de tokens com:
    * Nome do token encontrado
    * Tipo do token encontrado (identifier, keyword, operator, etc...)
    * Quantidade do token, quantas vezes esse token apareceu no código origem

Caso não seja familiarizado com a linguagens origem VisuAlg, abaixo tem um exemplo básico:
```
algoritmo "Ler e Mostrar Numero Informado"
var
   valor1 : Real
inicio
   escreva ("Digite um valor (Real): ")
   leia(valor1)
   escreval ("Valor Informado: ", valor1)
fimalgoritmo
```

Se precisar, [aqui](ExemplosEmVisualg.txt) tem mais exemplos de uso em VisuAlg
