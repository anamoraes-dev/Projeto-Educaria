document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS E LÓGICA DO MENU HAMBÚRGUER ---
    const menuHamburguerBtn = document.getElementById('menu-hamburguer-btn');
    const menuNavegacao = document.getElementById('menu-navegacao');

    menuHamburguerBtn.addEventListener('click', () => {
        menuNavegacao.classList.toggle('ativo');
    });

    // --- ELEMENTOS PRINCIPAIS DA APLICAÇÃO ---
    const topicInput = document.getElementById('topic-input');
    const nextStepBtn = document.getElementById('next-step-btn');
    const logoLink = document.getElementById('logo-link');
    
    const creationSection = document.getElementById('creation-process');
    const modelosSection = document.getElementById('modelos');
    const titleStep2 = document.getElementById('title-step-2');
    
    const etapaTopico = document.getElementById('etapa-topico');
    const etapaResultado = document.getElementById('etapa-resultado');
    const styleCards = document.querySelectorAll('.avatar-card');

    let chosenTopic = ''; 
    let currentAudioElement = null;

    // --- FUNÇÕES AUXILIARES ---

    function resetApp(event) {
        if (event) event.preventDefault();
        if (currentAudioElement) {
            currentAudioElement.pause();
            currentAudioElement.src = '';
            currentAudioElement = null;
        }
        etapaTopico.classList.remove('hidden');
        etapaResultado.classList.add('hidden');
        titleStep2.classList.add('hidden');
        styleCards.forEach(card => card.classList.remove('selectable'));
        topicInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function falarTexto(texto) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
    }

    // --- EVENT LISTENERS (OUVINTES DE EVENTO) ---

    logoLink.addEventListener('click', resetApp);

    nextStepBtn.addEventListener('click', () => {
        const topic = topicInput.value;
        if (topic.trim() === '') {
            alert('Por favor, insira um tópico para avançar.');
            return;
        }
        chosenTopic = topic;
        modelosSection.scrollIntoView({ behavior: 'smooth' });
        titleStep2.classList.remove('hidden');
        styleCards.forEach(card => card.classList.add('selectable'));
    });

    styleCards.forEach(card => {
        card.addEventListener('click', async (event) => { 
            event.preventDefault();

            if (!card.classList.contains('selectable')) return;

            const chosenStyle = card.dataset.style;
            
            etapaTopico.classList.add('hidden');
            etapaResultado.classList.remove('hidden');
            
            etapaResultado.innerHTML = `
                <div class="spinner-container">
                    <h3>Seu avatar está sendo gerado!</h3>
                    <div class="spinner"></div>
                    <p>Gerando avatar, por favor, aguarde...</p>
                </div>`;
            
            creationSection.scrollIntoView({ behavior: 'smooth' });

            try {
                const response = await fetch('https://educaria-backend.onrender.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: chosenTopic, style: chosenStyle })
                });

                if (!response.ok) {
                    throw new Error(`Erro do servidor: ${response.statusText}`);
                }

                const data = await response.json();
                
                etapaResultado.innerHTML = `
                    <h3>Conteúdo gerado com sucesso!</h3>
                    <p id="result-text">Clique no play para ouvir a explicação do seu avatar.</p>`;
                
                falarTexto("Clique no play para ouvir a explicação do seu avatar.");

                console.log("Roteiro gerado (oculto na tela):", data.script);

                const audioElement = document.createElement('audio');
                audioElement.src = data.audioUrl;
                audioElement.controls = true;
                audioElement.style.marginTop = '20px';
                audioElement.style.width = '100%';
                etapaResultado.appendChild(audioElement);

                currentAudioElement = audioElement;

                const toggleButton = document.createElement('button');
                toggleButton.textContent = 'Mostrar Roteiro';
                toggleButton.className = 'cta-button';
                toggleButton.style.marginTop = '20px';

                const scriptContainer = document.createElement('div');
                scriptContainer.className = 'hidden';
                scriptContainer.style.marginTop = '20px';
                scriptContainer.style.textAlign = 'left';
                scriptContainer.style.padding = '1rem';
                scriptContainer.style.backgroundColor = '#fff';
                scriptContainer.style.borderRadius = '8px';
                scriptContainer.innerHTML = `<p>${data.script.replace(/\n/g, '<br>')}</p>`;

                etapaResultado.appendChild(toggleButton);
                etapaResultado.appendChild(scriptContainer);

                toggleButton.addEventListener('click', () => {
                    const isHidden = scriptContainer.classList.contains('hidden');
                    if (isHidden) {
                        scriptContainer.classList.remove('hidden');
                        toggleButton.textContent = 'Esconder Roteiro';
                    } else {
                        scriptContainer.classList.add('hidden');
                        toggleButton.textContent = 'Mostrar Roteiro';
                    }
                });


            } catch (error) {
                console.error('Erro ao conectar com o backend:', error);
                falarTexto("Oops! Ocorreu um erro.");
                etapaResultado.innerHTML = `
                    <h3>Oops! Ocorreu um erro.</h3>
                    <p>Houve um problema ao gerar seu conteúdo. Por favor, verifique o terminal do backend e tente novamente.</p>`;
            }
        });
    });

    topicInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            nextStepBtn.click();
        }
    });
});