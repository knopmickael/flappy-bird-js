function novoElemento (tagName, className) {             // f.param: recebe a tag criada e a classe a ser aplicada esse elemento novo
    
    const elem = document.createElement(tagName)
    // elem.className = className
    elem.classList.add(className)
    return elem
}

function Cano(reversa) {  
                                                         // função que pode receber um param com valor falso
    this.elem = novoElemento('div', 'cano')              // instancia um elemento div class="cano"

    const topo = novoElemento('div', 'canoTopo')         // instancia o topo do cano
    const corpo = novoElemento('div', 'canoCorpo')       // instancia o corpo do cano

    this.elem.appendChild(reversa ? topo : corpo)        // se reversa==true, primeiro aplica o topo │ se ==false, primeiro aplica o corpo
    this.elem.appendChild(reversa ? corpo : topo)        // ...

    this.setAltura = altura => corpo.style.height = `${altura}px`   // define a altura do corpo do cano
}

// const teste = new Cano(false)
// const teste = new Cano(true)
// document.querySelector('[wm-flappy]').appendChild(teste.elem)

function Canos(altura, abertura, x) {

    this.elem = novoElemento('div', 'canos')

    this.canoDeCima = new Cano(false)                          // instancia um cano com reverse == false, ou seja, com o saída do cano p/ baixo
    this.canoDeBaixo = new Cano(true)                          // instancia um cano com reverse == true, ou seja, com o saída do cano p/ cima

    this.elem.appendChild(this.canoDeCima.elem)
    this.elem.appendChild(this.canoDeBaixo.elem)

    this.sortearAbertura = () => {                                        // sorteia o lugar onde haverá a abertura dos canos p/ pássaro passar
        const alturaCanoDeCima = Math.random() * (altura - abertura)
        const alturaCanoDeBaixo = altura - abertura - alturaCanoDeCima
        this.canoDeCima.setAltura(alturaCanoDeCima)
        this.canoDeBaixo.setAltura(alturaCanoDeBaixo)
    }

    this.getX = ()  => parseInt(this.elem.style.left.split('px')[0])    // split divide a string(Exemp:100px) em array e pega antes do px-rule
    this.setX = (x) => this.elem.style.left = `${x}px`
    this.getLargura = () => this.elem.clientWidth                       // pega a largura da janela do cliente/user/navegador

    this.sortearAbertura()
    this.setX(x)
}

// const teste = new Canos(500, 200, 250)
// document.querySelector('[wm-flappy]').appendChild(teste.elem)

function Barreira(altura, largura, abertura, espaco, notificarPonto) {                 // adicionar parametro notificarPonto para creditar pontuação do game
    
    this.barreiras = [                                                 // cria um array de pares de canos
        new Canos(altura, abertura, largura),
        new Canos(altura, abertura, largura + espaco),                 // espaço entre o Cano atual e o próximo...
        new Canos(altura, abertura, largura + espaco * 2),             // cálculo * 2, 3,.. se deve ao fato de serem 4 itens no array..
        new Canos(altura, abertura, largura + espaco * 3)              // assim, padronizando a sequência do array na tela
    ]

    const deslocamento = 3                                              // velocidade da animação das barreiras (3 em 3 pixels)        *

    this.animar = () => {                                                       // função que realiza a animação dos canos na tela
        this.barreiras.forEach(barreira => {                                    // para cada um dos itens do array acima:
            barreira.setX(barreira.getX() - deslocamento)                       // define o left:% pegando o atual - a constante acima ^^

            if(barreira.getX() < -barreira.getLargura()) {                      // se o left atual da barreira for menor que a largura do game
                barreira.setX(barreira.getX() + espaco * this.barreiras.length) // define a posição do item atual como: gameLarg + itens*espaco
                barreira.sortearAbertura()                                      // sorteia a posição das aberturas a cada loop do array
            }

            const meio = largura / 2
            const cruzouMeio = barreira.getX() + deslocamento >= meio && barreira.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voar = false

    this.elem = novoElemento('img', 'passaro')
    this.elem.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elem.style.bottom.split('px')[0])
    this.setY = y => this.elem.style.bottom = `${y}px`

    window.onkeydown = e => voar = true
    window.onkeyup = e => voar = false

    this.animar = () => {
        const novoY = this.getY() + (voar ? 10 : -4)                   // SE voar==true, novoY vai receber Y atual + 8 ELSE vai receber -5
        const alturaMax = alturaJogo - this.elem.clientHeight         // define a constante recebendo o param - a janela do game (500px)

        if (novoY <= 0) {
            this.setY(0) 
        } else if (novoY >= alturaMax) {
            this.setY(alturaMax)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo/2)
}

// "As duas funções abaixo foram implementadas através de um diretório do github de um dos alunos de leonardo moura leitão - curso web moderno com javascript 2020."

function estaoSobrepostos(elementoA, elementoB) { // função que verifica se há colisão
    const a = elementoA.getBoundingClientRect() // getBoundingClientRect é o retângulo associado ao elemento a
    const b = elementoB.getBoundingClientRect() // getBoundingClientRect é o retângulo associado ao elemento b
    // Com as duas constantes, podemos calcular se há ou não sobreposição nesses dois eixos, verificando dessa forma se há colisão

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    // a.left + a.width = lado direito do elemento a em relação a left
    // se o lado direito de a em relação ao left for maior ou igual ao lado esquerdo de b em relação ao left, houve colisão horizontal!
    // b.left + b.width = lado direito do elemento b em relação ao left
    // se o lado direito de b em relação ao left for maior ou igual ao lado esquerdo de a em relação ao left , houve colisão horizontal!

    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    // a.top + a.height = parte inferior do elemento a em relação ao topo
    // se a parte inferior de a em relação ao topo for maior que a parte superior de b em relação ao topo, houve colisão vertical!
    // b.top + b.height = parte inferior do elemento b em relação ao topo
    // se a parte inferior de b em relação ao topo for maior que a parte superior de a em relação ao topo, houve colisão vertical!

    return horizontal && vertical 
    // retorna true ou false, sendo:
    // true caso houve colisão horizontal E vertical
    // false se não houve colisão dos eixos OU de apenas um deles
}

function colidiu(passaro, barreiras) { // função responsável por testar a colisão entre o pássaro e as barreiras
    let colidiu = false // quando houver colisão, esta variável será setada para true

    barreiras.barreiras.forEach(Canos => {
        if(!colidiu) { // só entra neste if se não tiver colidido ainda
            const superior = Canos.canoDeCima.elem
            const inferior = Canos.canoDeBaixo.elem

            // verifica se houve colisão entre os pássaro e uma das duas barreiras de cada par de barreiras
            colidiu = estaoSobrepostos(passaro.elem, superior)
                || estaoSobrepostos(passaro.elem, inferior)
            // caso haja colisão com uma das barreiras do par de barreiras, variável colidiu é setada para true
        }
    })
    return colidiu  // caso o retorno seja true, o jogo "acaba" (Game Over)
}

function Progresso() {
    this.elem = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elem.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function Restart() {
    this.elem = novoElemento('span', 'info')
    this.elem.innerHTML = 'Press F5 to Restart'
}

let pontos = 0
const passarin = new Passaro(500)
const progresso = new Progresso()
const teste = new Barreira (500, 1000, 200, 400, () => progresso.atualizarPontos(++pontos))
const gameArea = document.querySelector('[wm-flappy]')
gameArea.appendChild(passarin.elem)
gameArea.appendChild(progresso.elem)
gameArea.appendChild(new Restart().elem)
teste.barreiras.forEach(barreira => gameArea.appendChild(barreira.elem))
const intervalo = setInterval(() => {
    teste.animar()
    passarin.animar()
    if(colidiu(passarin, teste)) {
        clearInterval(intervalo)
    }
}, 20)