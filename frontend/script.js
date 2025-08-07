document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS E LÓGICA DO MENU HAMBÚRGUER ---
    const menuHamburguerBtn = document.getElementById('menu-hamburguer-btn');
    const menuNavegacao = document.getElementById('menu-navegacao');

    menuHamburguerBtn.addEventListener('click', () => {
        menuNavegacao.classList.toggle('ativo');
    });

    // --- O RESTANTE DO NOSSO CÓDIGO ---
    const topicInput = document.getElementById('topic-input');
    const nextStepBtn = document.getElementById('next-step-btn');
    const logoLink = document.getElementById('logo-link');
    // ... (resto do código que já conhecemos)
});