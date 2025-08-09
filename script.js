// Aguarda o conteúdo da página carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DA PÁGINA ---
    const canvas = document.getElementById('desenhoCanvas');
    const ctx = canvas.getContext('2d');
    const larguraInput = document.getElementById('larguraInput');
    const alturaInput = document.getElementById('alturaInput');
    const calcularBtn = document.getElementById('calcularBtn');
    const valorResultado = document.getElementById('valorResultado');

    // --- LÓGICA DE CALIBRAÇÃO ATUALIZADA COM OS DADOS MAIS RECENTES ---
    // Nossos pontos de dados do mundo real. O PONTO_RASO agora é muito mais preciso!
    const PONTO_RASO = { ratio: 1.16, factor: 0.623 }; // Peça de 25x14.5 (ratio = 14.5 / 12.5), Fator = 42 / 67.47
    const PONTO_REDONDO = { ratio: 1.83, factor: 0.73 }; // Peça de ~23x21 (ratio = 21 / 11.5)

    // --- FUNÇÃO DE CÁLCULO PRINCIPAL ---
    function calcularComprimentoDeCorte(altura, largura) {
        if (altura <= 0 || largura <= 0) {
            return 0;
        }

        const a = altura;
        const b = largura / 2;

        // 1. CÁLCULO DO FATOR DINÂMICO
        const aspectRatio = a / b; // Calcula a proporção da peça
        let fatorDinamico;

        if (aspectRatio <= PONTO_RASO.ratio) {
            fatorDinamico = PONTO_RASO.factor;
        } else if (aspectRatio >= PONTO_REDONDO.ratio) {
            fatorDinamico = PONTO_REDONDO.factor;
        } else {
            const rangeRatio = PONTO_REDONDO.ratio - PONTO_RASO.ratio;
            const rangeFactor = PONTO_REDONDO.factor - PONTO_RASO.factor;
            const proporcao = (aspectRatio - PONTO_RASO.ratio) / rangeRatio;
            fatorDinamico = PONTO_RASO.factor + (proporcao * rangeFactor);
        }

        // 2. CÁLCULO DO COMPRIMENTO TEÓRICO
        const termoNaRaiz = (3 * a + b) * (a + 3 * b);
        if (termoNaRaiz < 0) return 0;
        const comprimentoCurva = (Math.PI / 2) * (3 * (a + b) - Math.sqrt(termoNaRaiz));
        const comprimentoTeorico = largura + comprimentoCurva;

        // 3. CÁLCULO FINAL USANDO O FATOR DINÂMICO
        const comprimentoFinal = comprimentoTeorico * fatorDinamico;

        return comprimentoFinal;
    }

    // --- FUNÇÃO PARA DESENHAR A PEÇA ---
    function desenharPeca(largura, altura) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const paddingTop = 30;
        const espacoDisponivelX = canvas.width * 0.9;
        const espacoDisponivelY = canvas.height - paddingTop * 1.5;
        const escala = Math.min(espacoDisponivelX / largura, espacoDisponivelY / altura);
        const larguraDesenho = largura * escala;
        const alturaDesenho = altura * escala;
        const centroX = canvas.width / 2;
        const centroY = paddingTop;
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centroY);
        ctx.lineTo(canvas.width, centroY);
        ctx.moveTo(centroX, 0);
        ctx.lineTo(centroX, canvas.height);
        ctx.stroke();
        ctx.strokeStyle = '#1a237e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centroX - larguraDesenho / 2, centroY);
        ctx.lineTo(centroX + larguraDesenho / 2, centroY);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centroX, centroY, larguraDesenho / 2, alturaDesenho, 0, 0, Math.PI);
        ctx.stroke();
    }

    // --- FUNÇÃO PRINCIPAL QUE RODA TUDO ---
    function atualizarCalculoEDesenho() {
        const largura = parseFloat(larguraInput.value);
        const altura = parseFloat(alturaInput.value);
        if (isNaN(largura) || isNaN(altura) || largura <= 0 || altura <= 0) {
            valorResultado.textContent = "Valores inválidos";
            if (canvas.width > 0 && canvas.height > 0) {
                desenharPeca(20, 15);
            }
            return;
        }
        const resultado = calcularComprimentoDeCorte(altura, largura);
        valorResultado.textContent = `${resultado.toFixed(2)} cm`;
        if (canvas.width > 0 && canvas.height > 0) {
            desenharPeca(largura, altura);
        }
    }

    // --- EVENT LISTENERS ---
    calcularBtn.addEventListener('click', atualizarCalculoEDesenho);
    larguraInput.addEventListener('input', atualizarCalculoEDesenho);
    alturaInput.addEventListener('input', atualizarCalculoEDesenho);
    window.addEventListener('resize', redimensionarCanvas);

    function redimensionarCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        atualizarCalculoEDesenho();
    }
    redimensionarCanvas();
});