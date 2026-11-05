
// Seletores de elementos do DOM que você já tinha
const Cardapio = document.querySelector('.cardapio');
const buttonShowAll = document.querySelector('.show-all');

// Objeto para armazenar a quantidade de cada item no carrinho.
// A chave é o 'id' do produto (ex: "coxinha") e o valor é a quantidade (ex: 3).
const cartQuantities = {};

// --- NOVOS SELETORES DOM para a seção do carrinho ---
// Seleciona o parágrafo onde a lista de itens do pedido será exibida.
// Usamos o seletor mais específico '.pedido > .description' para pegar o P principal do pedido.
const cartItemsDisplay = document.querySelector('.pedido > .description');

// Seleciona o parágrafo onde o preço total do pedido será exibido.
// Usamos o seletor '.pedido .value-itens .price' para ser específico.
const cartTotalDisplay = document.querySelector('.pedido .value-itens .price');

// --- Funções de renderização do cardápio (você já tinha e está ótima!) ---
function renderCardapioItems(itemsToRender) {
  Cardapio.innerHTML = itemsToRender.map((item) => `
    <div class="card">
      <div class="card-emoji">
        <emoji>${item.emoji}</emoji>
      </div>
      <div>
        <h3>${item.name}</h3>
        <p class="description">${item.desc}</p>
        <div class="card-footer">
          <p class="price">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
          <!-- Adicionado data-id ao botão Add para identificar o produto -->
          <button class="Add" data-id="${item.id}" ${cartQuantities[item.id] ? 'style="display: none;"' : ''}>Adicionar</button>
          <!-- Seletor de quantidade (inicialmente oculto ou visível se já no carrinho) -->
          <div class="quantity-selector" data-id="${item.id}" style="display: ${cartQuantities[item.id] ? 'flex' : 'none'};">
            <button class="quantity-button decrease">-</button>
            <span class="quantity-display">${cartQuantities[item.id] || 1}</span>
            <button class="quantity-button increase">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Renderiza todos os itens inicialmente
renderCardapioItems(Items);

function showAllItems() {
  renderCardapioItems(Items);
  updateCartDisplay(); // Também atualiza o carrinho ao re-renderizar o cardápio completo
}

buttonShowAll.addEventListener('click', showAllItems);

// --- NOVA FUNÇÃO CRUCIAL: Atualiza a exibição do carrinho e o total ---
function updateCartDisplay() {
    let total = 0; // Variável para armazenar o total do pedido
    let cartHtml = ''; // Variável para construir o HTML dos itens no carrinho

    // Verifica se o carrinho está vazio (se não tem nenhuma chave em cartQuantities)
    const hasItemsInCart = Object.keys(cartQuantities).length > 0;

    if (!hasItemsInCart) {
        // Se o carrinho estiver vazio, exibe a mensagem padrão e o total zerado
        cartItemsDisplay.textContent = 'Adicione itens do cardápio.';
        cartTotalDisplay.textContent = 'R$ 0,00';
        return; // Sai da função, não há itens para processar
    }

    // Loop para cada item que está no objeto cartQuantities
    // 'itemId' será a chave (ex: "coxinha"), 'quantity' será o valor (ex: 3)
    for (const itemId in cartQuantities) {
        // Verifica se a propriedade pertence realmente ao objeto (boa prática)
        if (cartQuantities.hasOwnProperty(itemId)) {
            const quantity = cartQuantities[itemId]; // Pega a quantidade do item
            // Encontra o objeto completo do item no array 'Items' (do products.js)
            const item = Items.find(product => product.id === itemId);

            if (item) { // Se o item foi encontrado
                const itemSubtotal = quantity * item.price; // Calcula o subtotal do item
                total += itemSubtotal; // Adiciona o subtotal ao total geral do carrinho

                // Adiciona o item formatado à string HTML do carrinho
                // Usamos toFixed(2) para 2 casas decimais e replace('.', ',') para formato BR
                cartHtml += `
                    <p>${quantity} x ${item.name} - R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</p>
                `;
            }
        }
    }

    // Finalmente, atualiza o HTML dos elementos no DOM
    cartItemsDisplay.innerHTML = cartHtml; // Insere a lista de itens
    cartTotalDisplay.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`; // Insere o total formatado
}
// --- FIM DA NOVA FUNÇÃO ---

// --- Lógica para os cliques nos botões de adicionar/aumentar/diminuir (Delegação de eventos) ---
// Este event listener escuta cliques em qualquer lugar dentro do Cardapio
Cardapio.addEventListener('click', (event) => {
  const target = event.target; // O elemento específico que foi clicado

  // Se o clique foi no botão "Adicionar"
  if (target.classList.contains('Add')) {
    const itemId = target.dataset.id; // Pega o ID do produto do atributo data-id
    
    // Esconde o botão "Adicionar"
    target.style.display = 'none';

    // Encontra o seletor de quantidade correspondente (é o próximo irmão do botão Add)
    const quantitySelector = target.nextElementSibling;
    if (quantitySelector && quantitySelector.classList.contains('quantity-selector')) {
      quantitySelector.style.display = 'flex'; // Exibe o seletor de quantidade
      cartQuantities[itemId] = 1; // Inicializa a quantidade para 1 no carrinho
      quantitySelector.querySelector('.quantity-display').textContent = 1; // Atualiza o display visual
    }
    updateCartDisplay(); // <<-- CHAMA A FUNÇÃO PARA ATUALIZAR O CARRINHO AQUI!
  }

  // Se o clique foi no botão de aumentar quantidade (+)
  if (target.classList.contains('increase')) {
    const quantitySelector = target.closest('.quantity-selector'); // Encontra o container do seletor
    if (quantitySelector) {
      const itemId = quantitySelector.dataset.id;
      cartQuantities[itemId] = (cartQuantities[itemId] || 0) + 1; // Incrementa a quantidade
      quantitySelector.querySelector('.quantity-display').textContent = cartQuantities[itemId]; // Atualiza o display
    }
    updateCartDisplay(); // <<-- CHAMA A FUNÇÃO PARA ATUALIZAR O CARRINHO AQUI!
  }

  // Se o clique foi no botão de diminuir quantidade (-)
  if (target.classList.contains('decrease')) {
    const quantitySelector = target.closest('.quantity-selector');
    if (quantitySelector) {
      const itemId = quantitySelector.dataset.id;
      
      // Garante que a quantidade não seja menor que 1
      if ((cartQuantities[itemId] || 0) > 1) {
        cartQuantities[itemId]--; // Decrementa a quantidade
        quantitySelector.querySelector('.quantity-display').textContent = cartQuantities[itemId]; // Atualiza o display
      } else {
        // Se a quantidade for 1 e o usuário clicar em '-', remove o item do carrinho
        delete cartQuantities[itemId]; // Remove a propriedade do objeto
        quantitySelector.style.display = 'none'; // Esconde o seletor de quantidade
        const addButton = quantitySelector.previousElementSibling; // Pega o botão "Adicionar"
        if (addButton && addButton.classList.contains('Add')) {
          addButton.style.display = 'block'; // Exibe o botão "Adicionar" novamente
        }
      }
    }
    updateCartDisplay(); // <<-- CHAMA A FUNÇÃO PARA ATUALIZAR O CARRINHO AQUI!
  }
});

// CHAMA A FUNÇÃO DE ATUALIZAÇÃO DO CARRINHO QUANDO A PÁGINA CARREGA
// Isso garante que a mensagem "Adicione itens do cardápio." e o total "R$ 0,00" apareçam corretamente
// logo que a página é aberta, antes de qualquer interação.
updateCartDisplay();

// --- NOVAS LINHAS PARA FILTRAGEM POR CATEGORIA ---

// 1. Seleciona todos os botões dentro do cardapio-header
const categoryButtons = document.querySelectorAll('.cardapio-header button');

// 2. Itera sobre cada botão e adiciona um ouvinte de evento de clique
categoryButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        // Remove a classe 'active' de todos os botões (para desmarcar o anterior)
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Adiciona a classe 'active' ao botão que foi clicado (para marcá-lo)
        event.target.classList.add('active');

        // Pega o texto do botão clicado (ex: "Salgados", "Bolos", "Todos")
        const clickedCategory = event.target.textContent;
        let itemsToShow = []; // Variável para armazenar os itens que serão exibidos

        if (clickedCategory === 'Todos') {
            // Se o botão "Todos" foi clicado, mostra todos os itens do array 'Items'
            itemsToShow = Items;
        } else {
            // Se foi um botão de categoria específica, usa o método .filter()
            // para criar um novo array com itens cuja propriedade 'cat'
            // seja igual à categoria clicada.
            itemsToShow = Items.filter(item => item.cat === clickedCategory);
        }

        // 3. Chama a função renderCardapioItems() com o array de itens filtrado (ou todos)
        renderCardapioItems(itemsToShow);
        
        // Opcional: Garante que o carrinho esteja atualizado mesmo após a filtragem
        // (Embora a filtragem não mude o carrinho em si, é uma boa prática)
        updateCartDisplay();
    });
});

// Opcional: Adiciona a classe 'active' ao botão 'Todos' no carregamento inicial
// para indicar que todos os itens estão sendo exibidos por padrão.
buttonShowAll.classList.add('active');

// --- NOVAS LINHAS: Funcionalidade do botão "Ver cardápio" ---

// 1. Seleciona o botão "Ver cardápio" do cabeçalho
const primButton = document.querySelector('.prim-button');

// 2. Seleciona o elemento para onde queremos rolar (o título "Cardápio")
const cardapioSection = document.querySelector('h2'); // O primeiro h2 é o título do cardápio

// 3. Adiciona um ouvinte de evento de clique ao botão
primButton.addEventListener('click', () => {
    // Usa o método scrollIntoView() para rolar até a seção do cardápio
    cardapioSection.scrollIntoView({
        behavior: 'smooth' // Faz a rolagem ser suave, não instantânea
    });
});

// --- NOVAS LINHAS: Funcionalidade de Enviar Pedido pelo WhatsApp ---

// 1. Seleciona o botão de enviar pelo WhatsApp
const sendWhatsAppButton = document.querySelector('.pedido button:last-of-type'); // Último botão dentro da div .pedido

// 2. Seleciona o campo de input do nome do cliente
const customerNameInput = document.querySelector('.pedido input[placeholder="seu nome"]');

// 3. Define o número de telefone da padaria para o WhatsApp (Exemplo: Brasil, DDD 11)
// **ATENÇÃO: Substitua este número pelo número real da sua padaria!**
const phoneNumber = '5597984241378'; // Formato: CódigoPaísDDDNúmero (sem +, espaços ou traços)

// 4. Adiciona um ouvinte de evento de clique ao botão de enviar
sendWhatsAppButton.addEventListener('click', () => {
    const customerName = customerNameInput.value.trim(); // Pega o nome e remove espaços extras

    // Verifica se há itens no carrinho para enviar
    if (Object.keys(cartQuantities).length === 0) {
        alert('Seu carrinho está vazio! Adicione itens antes de enviar o pedido.');
        return; // Impede o envio se o carrinho estiver vazio
    }

    // Constrói a mensagem do pedido
    let message = `Olá, gostaria de fazer um pedido!\n`;

    if (customerName) {
        message += `Meu nome é: ${customerName}.\n\n`;
    } else {
        message += `\n`; // Adiciona uma linha em branco se o nome não for fornecido
    }
    
    message += `*Itens do Pedido:*\n`;
    let total = 0;

    for (const itemId in cartQuantities) {
        if (cartQuantities.hasOwnProperty(itemId)) {
            const quantity = cartQuantities[itemId];
            const item = Items.find(product => product.id === itemId);

            if (item) {
                const itemSubtotal = quantity * item.price;
                total += itemSubtotal;
                // Adiciona cada item à mensagem
                message += `${quantity}x ${item.name} - R$ ${itemSubtotal.toFixed(2).replace('.', ',')}\n`;
            }
        }
    }

    message += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    message += `\n\n_Aguardando a confirmação do pedido!_`;

    // Codifica a mensagem para ser segura em uma URL
    const encodedMessage = encodeURIComponent(message);

    // Cria o link completo do WhatsApp
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Abre o link em uma nova aba
    window.open(whatsappLink, '_blank');
});

// --- FIM DAS NOVAS LINHAS ---
