
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCW99N-Ok683zmhwcTRSAeZ1o5fxLvSs44",
  authDomain: "pedidos-venus-joias.firebaseapp.com",
  projectId: "pedidos-venus-joias",
  storageBucket: "pedidos-venus-joias.firebasestorage.app",
  messagingSenderId: "504751234156",
  appId: "1:504751234156:web:dcf8f4c9b416c5d0fa4c49",
  measurementId: "G-K4RLW60R85"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 
const pedidosRef = collection(db, "pedidos");

let itensTemporarios = [];



const btnLogar = document.getElementById('btnLogar');
if (btnLogar) {
    btnLogar.onclick = async () => {
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const erroTxt = document.getElementById('login-erro');

        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            console.error("Erro no login:", error.code);
            erroTxt.style.display = 'block';
            erroTxt.innerText = "Falha no acesso: " + error.code;
        }
    };
}

// Botão Sair
document.getElementById('btnSair').onclick = () => signOut(auth);


onAuthStateChanged(auth, (user) => {
    const overlay = document.getElementById('login-overlay');
    const btnSair = document.getElementById('btnSair');

    if (user) {
        overlay.style.display = 'none';
        btnSair.style.display = 'inline-block';
        carregarPedidosCloud();
    } else {
        overlay.style.display = 'flex';
        btnSair.style.display = 'none';
    }
});

// --- FUNÇÕES DO SISTEMA ---

function carregarPedidosCloud() {
    onSnapshot(query(pedidosRef, orderBy("createdAt", "desc")), (snapshot) => {
        const container = document.getElementById('containerPedidos');
        container.innerHTML = snapshot.docs.map(docSnap => {
            const p = docSnap.data();
            const id = docSnap.id;
            return `
                <div class="pedido-salvo">
                    <div class="pedido-header">
                        <span>${p.cliente}</span>
                        <span>${p.data}</span>
                    </div>
                    ${p.itens.map(i => `
                        <div class="pedido-item">
                            <span>${i.nome}</span>
                            <span>${i.qtd}x</span>
                            <span>R$ ${i.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="pedido-footer">Total: R$ ${p.totalGeral.toFixed(2)}</div>
                    <div class="acoes-pedido no-print">
                        <button class="btn-mini btn-whatsapp" onclick="enviarWhatsApp('${id}')">WhatsApp</button>
                        <button class="btn-mini" onclick="window.print()">Imprimir</button>
                        <button class="btn-mini" style="color:red" onclick="excluirPedido('${id}')">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    });
}


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
    if (!cliente || !data) return alert("Preencha cliente e data!");

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
};


window.excluirPedido = async (id) => {
    if (confirm("Excluir da nuvem?")) await deleteDoc(doc(db, "pedidos", id));
};

window.enviarWhatsApp = (id) => {
    alert("Função WhatsApp preparada! ID: " + id);

};