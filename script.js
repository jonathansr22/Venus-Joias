import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";


// --- CONTROLE DE ACESSO ---

// 1. Função de Login
document.getElementById('btnLogar').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
        document.getElementById('login-erro').style.display = 'block';
    }
};

// 2. Função de Sair
document.getElementById('btnSair').onclick = () => signOut(auth);

// 3. Observador de Estado (O Coração da Segurança)
onAuthStateChanged(auth, (user) => {
    const overlay = document.getElementById('login-overlay');
    const btnSair = document.getElementById('btnSair');

    if (user) {
        // Usuário Logado: Esconde login, mostra botão sair e carrega dados
        overlay.style.display = 'none';
        btnSair.style.display = 'inline-block';
        carregarDados();
    } else {
        // Usuário Deslogado: Mostra login e limpa a tela
        overlay.style.display = 'flex';
        btnSair.style.display = 'none';
        document.getElementById('containerPedidos').innerHTML = "";
    }
});

// Coloque sua lógica de onSnapshot dentro de uma função carregarDados()
function carregarDados() {
    onSnapshot(query(pedidosRef, orderBy("createdAt", "desc")), (snapshot) => {
        // ... (seu código de renderizar pedidos que já fizemos antes) ...
    });
}

// ... restante das funções (addDoc, deleteDoc, etc)

const firebaseConfig = {
    apiKey: "AIzaSyCW99N-Ok683zmhwcTRSAeZ1o5fxLvSs44",
    authDomain: "pedidos-venus-joias.firebaseapp.com",
    projectId: "pedidos-venus-joias",
    storageBucket: "pedidos-venus-joias.firebasestorage.app",
    messagingSenderId: "504751234156",
    appId: "1:504751234156:web:dcf8f4c9b416c5d0fa4c49",
    measurementId: "G-K4RLW60R85"
  }


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const pedidosRef = collection(db, "pedidos");

let itensTemporarios = [];


onSnapshot(query(pedidosRef, orderBy("createdAt", "desc")), (snapshot) => {
    const container = document.getElementById('containerPedidos');
    if (snapshot.empty) {
        container.innerHTML = '<p class="vazio">Nenhum pedido na nuvem.</p>';
        return;
    }

    container.innerHTML = snapshot.docs.map(docSnap => {
        const p = docSnap.data();
        const id = docSnap.id;
        return `
            <div class="pedido-salvo">
                <div class="pedido-header">
                    <span>Cliente: ${p.cliente}</span>
                    <span>${p.data}</span>
                </div>
                ${p.itens.map(i => `
                    <div class="pedido-item">
                        <span>${i.nome}</span>
                        <span>${i.qtd}x</span>
                        <span>R$ ${i.total.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="pedido-footer">Total Geral: R$ ${p.totalGeral.toFixed(2)}</div>
                <div class="acoes-pedido no-print">
                    <button class="btn-mini btn-whatsapp" onclick="enviarWhatsApp('${id}')">WhatsApp</button>
                    <button class="btn-mini" onclick="window.print()">Imprimir</button>
                    <button class="btn-mini" style="color:red" onclick="excluirPedido('${id}')">Excluir</button>
                </div>
            </div>
        `;
    }).join('');
});


document.getElementById('btnAddItem').onclick = () => {
    const nome = document.getElementById('itemNome').value;
    const valor = parseFloat(document.getElementById('itemValor').value);
    const qtd = parseInt(document.getElementById('itemQtd').value);

    if (!nome || isNaN(valor)) return alert("Preencha o item!");

    itensTemporarios.push({ nome, valor, qtd, total: valor * qtd });
    document.getElementById('itemNome').value = '';
    document.getElementById('itemValor').value = '';
    
    atualizarUIListTemporaria();
};

function atualizarUIListTemporaria() {
    const lista = document.getElementById('listaItensTemporaria');
    lista.innerHTML = itensTemporarios.map(i => `<div style="font-size:0.8rem">🌸 ${i.qtd}x ${i.nome} - R$ ${i.total.toFixed(2)}</div>`).join('');
    document.getElementById('btnFinalizar').style.display = itensTemporarios.length > 0 ? 'block' : 'none';
}


document.getElementById('btnFinalizar').onclick = async () => {
    const cliente = document.getElementById('cliente').value;
    const data = document.getElementById('data').value;
    
    if (!cliente || !data) return alert("Cliente e data são obrigatórios!");

    try {
        await addDoc(pedidosRef, {
            cliente,
            data: data.split('-').reverse().join('/'),
            itens: itensTemporarios,
            totalGeral: itensTemporarios.reduce((sum, i) => sum + i.total, 0),
            createdAt: new Date()
        });
        
        
        itensTemporarios = [];
        document.getElementById('cliente').value = '';
        atualizarUIListTemporaria();
        alert("Salvo na nuvem com sucesso!");
    } catch (e) {
        alert("Erro ao salvar: " + e.message);
    }
};

window.excluirPedido = async (id) => {
    if (confirm("Deseja apagar este pedido da nuvem?")) {
        await deleteDoc(doc(db, "pedidos", id));
    }
};

window.enviarWhatsApp = (id) => {
    
    alert("Gerando resumo para WhatsApp...");

};

