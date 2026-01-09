// Banco de Dados Rigoroso (Identificação O/A vs Um/Uma)
const database = [
    { q: "O menino come a maçã", a: "The boy eats the apple", options: ["The", "boy", "eats", "the", "apple", "a", "an"] },
    { q: "Um menino come uma maçã", a: "A boy eats an apple", options: ["A", "boy", "eats", "an", "apple", "the", "The"] },
    { q: "O cachorro é um animal", a: "The dog is an animal", options: ["The", "dog", "is", "an", "animal", "a", "The"] },
    { q: "Uma mulher bebe a água", a: "A woman drinks the water", options: ["A", "woman", "drinks", "the", "water", "An", "The"] }
];

let state = JSON.parse(localStorage.getItem('duo_save')) || {
    xp: 0, streak: 0, hearts: 5, level: 1
};

const lesson = {
    queue: [],
    index: 0,
    selected: [],
    
    init() {
        this.queue = [...database].sort(() => Math.random() - 0.5);
        this.index = 0;
        document.getElementById('lesson-overlay').classList.remove('hidden');
        this.render();
    },

    render() {
        this.selected = [];
        const current = this.queue[this.index];
        const body = document.getElementById('lesson-body');
        
        body.innerHTML = `
            <h2>Traduza esta frase</h2>
            <p style="font-size: 22px; margin-bottom: 30px;">${current.q}</p>
            <div class="answer-zone" id="ans-zone"></div>
            <div class="word-bank" id="bank-zone"></div>
        `;

        current.options.sort(() => Math.random() - 0.5).forEach(word => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerText = word;
            chip.onclick = () => this.selectWord(word, chip);
            document.getElementById('bank-zone').appendChild(chip);
        });

        this.updateProgress();
    },

    selectWord(word, el) {
        if(el.classList.contains('used')) return;
        el.classList.add('used');
        this.selected.push(word);
        
        const clone = el.cloneNode(true);
        clone.classList.remove('used');
        clone.onclick = () => {
            el.classList.remove('used');
            this.selected = this.selected.filter(w => w !== word);
            clone.remove();
        };
        document.getElementById('ans-zone').appendChild(clone);
    },

    verify() {
        const current = this.queue[this.index];
        const isCorrect = this.selected.join(' ') === current.a;
        const panel = document.getElementById('feedback-panel');

        if(isCorrect) {
            panel.className = "feedback-panel show";
            document.getElementById('feedback-title').innerText = "Excelente!";
            document.getElementById('feedback-msg').innerText = "";
        } else {
            // Repetição Espaçada: Se errou, volta para o final da fila da lição
            this.queue.push(current);
            state.hearts--;
            if ("vibrate" in navigator) navigator.vibrate(200);
            
            panel.className = "feedback-panel show wrong";
            document.getElementById('feedback-title').innerText = "Atenção à gramática:";
            document.getElementById('feedback-msg').innerText = `Correto: ${current.a}`;
            
            if(state.hearts <= 0) {
                alert("Você ficou sem vidas! Tente novamente mais tarde.");
                this.exit();
            }
        }
        document.getElementById('hearts').innerText = state.hearts;
        document.getElementById('current-hearts').innerText = state.hearts;
        saveState();
    },

    advance() {
        this.index++;
        if(this.index < this.queue.length) {
            document.getElementById('feedback-panel').classList.remove('show');
            this.render();
        } else {
            state.xp += 10;
            state.streak++;
            saveState();
            alert("Lição Completa! +10 XP");
            this.exit();
        }
    },

    updateProgress() {
        const p = (this.index / this.queue.length) * 100;
        document.getElementById('lesson-progress-fill').style.width = p + '%';
    },

    exit() {
        document.getElementById('lesson-overlay').classList.add('hidden');
        renderHome();
    }
};

// Funções de Persistência
function saveState() {
    localStorage.setItem('duo_save', JSON.stringify(state));
    updateTopBar();
}

function updateTopBar() {
    document.getElementById('xp').innerText = state.xp;
    document.getElementById('streak').innerText = state.streak;
    document.getElementById('hearts').innerText = state.hearts;
}

function renderHome() {
    document.getElementById('main-content').innerHTML = `
        <div style="text-align:center; padding-top: 50px;">
            <div class="chip" onclick="lesson.init()" style="width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; margin: 0 auto; background: var(--orange); cursor:pointer;">📖</div>
            <h3>Começar Lição</h3>
            <p>Foco: Artigos e Objetos</p>
        </div>
    `;
}

// Início
document.getElementById('next-btn').onclick = () => lesson.advance();
updateTopBar();
renderHome();
