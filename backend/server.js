// --- CONFIGURAÇÃO INICIAL ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- ROTAS DA NOSSA APLICAÇÃO ---
app.get('/', (req, res) => {
    res.send('Nosso backend Educar.IA está no ar! :)');
});

app.post('/gerar-roteiro', async (req, res) => {
    const { topic, style } = req.body;
    console.log(`Pedido recebido para gerar ROTEIRO e ÁUDIO sobre: ${topic}`);

    // --- NOVA LÓGICA PARA ESCOLHER O ADJETIVO CORRETO ---
    let adjetivoAvatar;
    if (style === 'Animação') {
        adjetivoAvatar = 'animado';
    } else if (style === 'Humano') {
        adjetivoAvatar = 'humano';
    } else {
        adjetivoAvatar = 'personagem fictício';
    }
    // ----------------------------------------------------

    try {
        // ETAPA 1: Gerar o roteiro (COM O PROMPT ATUALIZADO)
        const prompt = `Crie um roteiro curto e didático para um vídeo de 1 minuto sobre o tópico "${topic}". O roteiro DEVE OBRIGATORIAMENTE começar com a frase: "Olá, eu sou um avatar ${adjetivoAvatar} da Educar.IA e ". Continue a frase de forma natural para introduzir o tópico. Fale sempre em primeira pessoa, como se fosse o avatar. Use uma linguagem simples e direta.`;
        
        console.log('Enviando o seguinte prompt para a OpenAI:', prompt);
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        const generatedScript = completion.choices[0].message.content;
        console.log('Roteiro gerado com sucesso!');

        // ETAPA 2: Gerar o áudio a partir do roteiro
        console.log('Enviando roteiro para a API de Texto-para-Voz...');
        const audioResponse = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: generatedScript,
        });
        
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        const audioFileName = `audio-${Date.now()}.mp3`;
        const audioFilePath = path.join(__dirname, 'public', audioFileName);
        
        await fs.promises.writeFile(audioFilePath, audioBuffer);
        console.log(`Áudio salvo com sucesso em: ${audioFilePath}`);
        
        const audioUrl = `http://localhost:${PORT}/${audioFileName}`;

        // ETAPA 3: Enviar o roteiro E a URL do áudio de volta para o frontend
        res.json({
            script: generatedScript,
            audioUrl: audioUrl
        });

    } catch (error) {
        console.error('Ocorreu um erro em uma das etapas da IA:', error);
        res.status(500).json({ error: 'Oops! Houve um erro ao gerar o conteúdo de IA.' });
    }
});

// --- INICIA O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de TEXTO e ÁUDIO rodando na porta ${PORT}.`);
});