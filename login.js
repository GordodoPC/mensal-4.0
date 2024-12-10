// Defina a URL base da API
const API_BASE_URL = 'https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard';

document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Evita o recarregamento da página

  const emailInput = document.getElementById("emailInput");
  const email = emailInput.value.trim();
  if (!email) {
    showError("Por favor informe um email válido.");
    return;
  }

  const submitButton = this.querySelector("button");
  disableButton(submitButton, true);

  try {
    // Chamada da API para obter o usuário pelo e-mail
    const response = await fetch(`${API_BASE_URL}/GetPersonByEmail?Email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        showError(errorData.Errors[0] || "Erro desconhecido ao processar a solicitação.");
      } else {
        showError("Aconteceu um erro inesperado, tente novamente.");
      }
      return;
    }

    const userData = await response.json();
    console.log('Resposta da API:', userData); // Verifique a estrutura da resposta

    // Verifique se a resposta contém os dados do usuário necessários
    if (userData && userData.Id) {
      // Salva os dados do usuário no localStorage
      saveToLocalStorage("user", { id: userData.Id, email: userData.Email, name: userData.Name });
      window.location.href = "taskBoard.html";
    } else {
      showError("E-mail não encontrado ou inválido.");
    }
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    showError("Falha ao se conectar com o servidor. Tente novamente mais tarde.");
  } finally {
    disableButton(submitButton, false);
  }
});

// Função para exibir mensagens de erro
function showError(message) {
  alert(message);
}

// Função para desabilitar/ativar o botão de submit
function disableButton(button, disable) {
  button.disabled = disable;
}

// Função para salvar no localStorage
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
