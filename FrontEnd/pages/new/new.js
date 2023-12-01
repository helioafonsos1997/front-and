// cria variavel ownerOptions
var ownerOptions = '<option value="">-- Selecione --</option>';
// Definição de uma função chamada myHome
function myHome() {
    // Chama a função getOwnersToSelect para obter proprietários (possivelmente)
    changeTitle('Novo Documento');
    // Chama a função getOwnersToSelect para obter proprietários (possivelmente)
    getOwnersToSelect();
    // Verifica se a propriedade openTab em sessionStorage é indefinida
    if (sessionStorage.openTab == undefined)
     // Se for indefinida, define openTab como 'item' em sessionStorage
        sessionStorage.openTab = 'item'
        // Chama a função showTab passando o valor armazenado em sessionStorage.openTab como argumento
    showTab(sessionStorage.openTab);
    // Adiciona um ouvinte de clique ao elemento com o id 'btnNewOwner', que chama a função showTab com argumento 'owner'
    $('#btnNewOwner').click(() => { showTab('owner') });
    // Adiciona um ouvinte de clique ao elemento com o id 'btnNewItem', que chama a função showTab com argumento 'item'
    $('#btnNewItem').click(() => { showTab('item'); });
      // Adiciona um ouvinte de envio de formulário a todos os formulários dentro de elementos com a classe 'tabs', que chama a função sendData
    $('.tabs form').submit(sendData);
}
// Função que lida com o envio de dados de um formulário
function sendData(ev) {
     // Prevenir o comportamento padrão de envio do formulário, que seria o recarregamento da página
    ev.preventDefault();
// Inicializar um objeto vazio para armazenar os dados do formulário
    var formJSON = {};
     // Criar um objeto FormData a partir do formulário atual
    const formData = new FormData(ev.target);
    // Iterar sobre cada par chave-valor no objeto FormData
    formData.forEach((value, key) => {
     // Armazenar o valor no objeto formJSON após aplicar a função stripTags para remover tags HTML potencialmente perigosas
        formJSON[key] = stripTags(value);
        // Atualizar o valor do elemento no formulário com o mesmo ID para refletir o valor processado
        $('#' + key).val(formJSON[key]);
    });

// Iterar sobre cada chave no objeto formJSON
    for (const key in formJSON)
      // Verificar se o valor associado à chave atual é uma string vazia
        if (formJSON[key] == '')
         // Se for uma string vazia, retornar false (indicando falha na validação)
            return false;

// Se a iteração não encontrou valores de string vazios, chama a função saveData com o objeto formJSON
    saveData(formJSON);
    // Retorna false (pode ser utilizado para impedir o comportamento padrão de envio do formulário)
    return false;
}

// Função que salva dados utilizando uma API
function saveData(formJSON) {
// Construir a URL da solicitação combinando a URL base da API com o tipo de recurso do formulário
 requestURL = `${app.apiBaseURL}/${formJSON.type}s`;
// Remover a propriedade 'type' do objeto formJSON, que foi usada apenas para construir a URL da solicitação
    delete formJSON.type;

    // Verificar se a propriedade 'ownerName' está presente no objeto formJSON
    if (formJSON.ownerName != undefined) {
        // Se 'ownerName' estiver presente, renomear a propriedade 'name' para 'ownerName' e remover 'ownerName'
        formJSON['name'] = formJSON.ownerName;
        // Deleta a propriedade 'ownerName' do objeto formJSON

        delete formJSON.ownerName;
    }
    // Verificar se a propriedade 'itemName' está presente no objeto formJSON
    if (formJSON.itemName != undefined) {
     // Se 'itemName' estiver presente, renomear a propriedade 'name' para 'itemName' e remover 'itemName'
        formJSON['name'] = formJSON.itemName;
        // Deleta a propriedade 'itemName' do objeto formJSON
        delete formJSON.itemName;
    }

    // jQuery: acessa a API usando AJAX.
    $.ajax({
        // Define o tipo de requisição como POST
        type: "POST",
        // Especifica a URL para onde a requisição será enviada
        url: requestURL,
        // Converte o objeto JavaScript formJSON em uma string JSON para ser enviado como dados da requisição
        data: JSON.stringify(formJSON),
        // Especifica o tipo de conteúdo que está sendo enviado na requisição (JSON neste caso) e o conjunto de caracteres (UTF-8)
        contentType: "application/json; charset=utf-8",
         // Especifica o tipo de dados que se espera receber como resposta da requisição (JSON neste caso)
        dataType: "json"
    })
        .done(() => {
            viewHTML = `
                <form>
                    <h3>Oba!</h3>
                    <p>Cadastro efetuado com sucesso.</p>
                    <p>Obrigado...</p>
                </form>
            `;
        })
        .fail((error) => { // Se falhou, mostra feeback.
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
            viewHTML = `
                <form>
                    <h3>Oooops!</h3>
                    <p>Não foi possível realizar o cadastro. Ocorreu uma falha no servidor.</p>
                </form>
            `;
        })
        .always(() => {
            $('.tabBlock').html(viewHTML);
            $('#formNewOwner').trigger('reset');
            $('#formNewItem').trigger('reset');
        });

    return false;
}

function showTab(tabName) {

    $('#formNewOwner').trigger('reset');
    $('#formNewItem').trigger('reset');

    switch (tabName) {
        case 'owner':
            $('#tabOwner').show();
            $('#tabItem').hide();
            $('#btnNewOwner').attr('class', 'active');
            $('#btnNewItem').attr('class', 'inactive');
            sessionStorage.openTab = 'owner';
            break;
        case 'item':
            $('#tabItem').show();
            $('#tabOwner').hide();
            $('#btnNewItem').attr('class', 'active');
            $('#btnNewOwner').attr('class', 'inactive');
            break;
    }

}

function getOwnersToSelect() {

    requestURL = `${app.apiBaseURL}/owners`;

    $.get(requestURL)
        .done((apiData) => {

            apiData.forEach((item) => {
                ownerOptions += `<option value="${item.id}">${item.id} - ${item.name}</option>`;
            });

            $('#owner').html(ownerOptions);
        })
        .fail((error) => {
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
        });

}

$(document).ready(myHome);