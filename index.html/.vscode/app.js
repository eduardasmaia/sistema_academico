const store = {
    usuarios: [
        { id: 1, nome: "Maria Eduarda", papel: "admin", senha: "123" },
        { id: 2, nome: "Jarlison", papel: "admin", senha: "123" },
        { id: 3, nome: "Márcia", papel: "professor", senha: "123" },
        { id: 4, nome: "José", papel: "aluno", senha: "123" },
        { id: 5, nome: "Igor", papel: "aluno", senha: "123" }
    ],
    disciplinas: [
        { id: 101, nome: "Cálculo I", professor: "Márcia" },
        { id: 102, nome: "Estrutura de Dados", professor: "Márcia" }
    ],
    registros: [
        { id: 1, aluno: "José", disciplina: "Cálculo I", nota: 8.5, frequencia: "90%" },
        { id: 2, aluno: "Igor", disciplina: "Estrutura de Dados", nota: 7.0, frequencia: "85%" }
    ]
};

let usuarioLogado = null;

const views = {
    usuarios: () => `
        <div class="card">
            <h3>Gerenciamento Acadêmico</h3>
            <table>
                <thead><tr><th>ID</th><th>Nome</th><th>Cargo</th></tr></thead>
                <tbody>${store.usuarios.map(u => `<tr><td>${u.id}</td><td>${u.nome}</td><td><span class="badge ${u.papel}">${u.papel.toUpperCase()}</span></td></tr>`).join('')}</tbody>
            </table>
        </div>`,
    
    disciplinas: () => `
        <div class="card">
            <h3>Disciplinas Disponíveis</h3>
            <table>
                <thead><tr><th>Cód</th><th>Nome</th><th>Professor</th></tr></thead>
                <tbody>${store.disciplinas.map(d => `<tr><td>${d.id}</td><td>${d.nome}</td><td>${d.professor}</td></tr>`).join('')}</tbody>
            </table>
        </div>`,

    notas: () => {
        // Filtra os registros pelo nome do aluno logado
        const minhasNotas = store.registros.filter(n => n.aluno === usuarioLogado.nome);
        return `
            <div class="card">
                <h3>Notas e Frequência - ${usuarioLogado.nome}</h3>
                <table>
                    <thead><tr><th>Disciplina</th><th>Média Final</th><th>Presença</th></tr></thead>
                    <tbody>${minhasNotas.length > 0 ? minhasNotas.map(n => `
                        <tr><td>${n.disciplina}</td><td><strong>${Number(n.nota).toFixed(1)}</strong></td><td>${n.frequencia}</td></tr>
                    `).join('') : '<tr><td colspan="3">Nenhum registro encontrado.</td></tr>'}</tbody>
                </table>
            </div>`;
    },

    lancar_notas: () => `
        <div class="card">
            <h3>Lançar Notas e Frequência</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin-bottom: 20px;">
                <select id="sel-aluno">${store.usuarios.filter(u => u.papel === 'aluno').map(a => `<option>${a.nome}</option>`)}</select>
                <select id="sel-disc">${store.disciplinas.filter(d => d.professor === usuarioLogado.nome).map(d => `<option>${d.nome}</option>`)}</select>
                <input type="number" id="val-nota" placeholder="Nota (0-10)" step="0.1">
                <input type="number" id="val-freq" placeholder="Frequência (%)">
                <button onclick="salvarNovoRegistro()" class="btn-login" style="background:var(--success)">Salvar Nota</button>
            </div>
            <table>
                <thead><tr><th>Aluno</th><th>Disciplina</th><th>Nota</th><th>Freq</th></tr></thead>
                <tbody>${store.registros.map(r => `<tr><td>${r.aluno}</td><td>${r.disciplina}</td><td>${r.nota}</td><td>${r.frequencia}</td></tr>`).join('')}</tbody>
            </table>
        </div>`
};

// --- FUNÇÕES DE AÇÃO ---

function salvarNovoRegistro() {
    const nota = parseFloat(document.getElementById('val-nota').value);
    const freq = document.getElementById('val-freq').value;
    
    if(isNaN(nota) || freq === "") return alert("Preencha todos os campos!");

    store.registros.push({
        id: store.registros.length + 1,
        aluno: document.getElementById('sel-aluno').value,
        disciplina: document.getElementById('sel-disc').value,
        nota: nota,
        frequencia: freq + "%"
    });

    alert("Lançamento realizado!");
    navegar('lancar_notas', 'Lançamento de Notas');
}

function fazerLogin() {
    const nome = document.getElementById("usuario-input").value; // Ajustado para o ID correto do seu HTML
    const senha = document.getElementById("senha-input").value;

    const user = store.usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase() && u.senha === senha);

    if (user) {
        usuarioLogado = user;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("sistema-screen").style.display = "block";
        // Se houver um elemento para o nome do usuário:
        const badge = document.getElementById("user-badge");
        if(badge) badge.innerText = `Olá, ${user.nome}`;
        
        montarMenu();
        irParaInicial();
    } else {
        const erro = document.getElementById("erro");
        if(erro) erro.innerText = "Acesso negado!";
    }
}

function montarMenu() {
    const menu = document.getElementById("menu-acesso"); // Ajustado para o ID do seu HTML
    menu.innerHTML = "";
    if (usuarioLogado.papel === "admin") {
        menu.innerHTML += `<li onclick="navegar('usuarios', 'Gestão de Usuários')">👤 Usuários</li>`;
        menu.innerHTML += `<li onclick="navegar('disciplinas', 'Gestão de Cursos')">📚 Disciplinas</li>`;
    } else if (usuarioLogado.papel === "professor") {
        menu.innerHTML += `<li onclick="navegar('disciplinas', 'Minhas Turmas')">📚 Turmas</li>`;
        menu.innerHTML += `<li onclick="navegar('lancar_notas', 'Lançamento de Notas')">✍️ Lançar Notas</li>`;
    } else {
        menu.innerHTML += `<li onclick="navegar('notas', 'Minhas Notas')">📝 Notas</li>`;
    }
}

function navegar(path, title) {
    const mainArea = document.getElementById("app-content"); // Ajustado para o ID do seu HTML
    if(mainArea) mainArea.innerHTML = views[path]();
}

function irParaInicial() {
    if (usuarioLogado.papel === "admin") navegar('usuarios', 'Gestão de Usuários');
    else if (usuarioLogado.papel === "professor") navegar('disciplinas', 'Minhas Turmas');
    else navegar('notas', 'Minhas Notas');
}

function logout() {
    location.reload();
}