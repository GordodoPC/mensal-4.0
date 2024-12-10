const API_BOARD_URL = 'https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/#/';

// Referências
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById("board");
    const addColumnButton = document.getElementById("addColumnButton");
    const dropdownContent = document.getElementById('dropdownContent');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Configuração do tema
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    populateDropdown(); // Chamada inicial para popular o dropdown

    // Evento para criar nova coluna
    addColumnButton.addEventListener("click", createColumn);

    async function populateDropdown() {
        dropdownContent.innerHTML = ''; // Limpa o conteúdo antes de popular

        try {
            const response = await fetch(`${API_BOARD_URL}boards`);
            if (!response.ok) {
                if (response.status === 422) {
                    const errorData = await response.json();
                    alert(errorData.Errors[0] || "Erro inesperado.");
                } else {
                    alert("Aconteceu um erro inesperado, tente novamente.");
                }
                return;
            }

            const boards = await response.json();
            console.log("Boards recebidos:", boards);

            boards.forEach((board) => {
                const linkItem = document.createElement('li');
                linkItem.textContent = board.Name;
                linkItem.addEventListener('click', (event) => {
                    event.preventDefault(); // Previne o comportamento padrão do link
                    console.log(`Board ID selecionado: ${board.Id}`);
                    buscarColunas(board.Id); // Passa o ID do board corretamente
                });
                dropdownContent.appendChild(linkItem);
            });
        } catch (error) {
            console.error('Erro ao se conectar com o servidor:', error);
            alert("Falha ao se conectar com o servidor. Tente novamente mais tarde.");
        }
    }

    async function createColumn() {
        const columnTitle = prompt("Digite o título da nova coluna:");
        if (!columnTitle) return;

        // Criar coluna localmente antes de enviar à API
        const column = document.createElement("div");
        column.className = "column";

        const title = document.createElement("h3");
        title.innerText = columnTitle;

        const addTaskButton = document.createElement("button");
        addTaskButton.innerText = "Nova tarefa";
        addTaskButton.addEventListener("click", () => createTask(column));

        column.appendChild(title);
        column.appendChild(addTaskButton);
        board.appendChild(column);

        // Mover o botão "Nova coluna" para o lado da nova coluna
        board.appendChild(addColumnButton);

        // Enviar coluna para a API
        try {
            const response = await fetch(`${API_BOARD_URL}colunas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: columnTitle })
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar coluna: ${response.status}`);
            }

            const data = await response.json();
            console.log('Coluna criada:', data);
        } catch (error) {
            console.error('Erro ao enviar coluna para a API:', error);
        }
    }

    async function createTask(column) {
        const taskContent = prompt("Digite o conteúdo da nova tarefa:");
        if (!taskContent) return;

        // Criar tarefa localmente antes de enviar à API
        const task = document.createElement("div");
        task.className = "task";

        const content = document.createElement("p");
        content.innerText = taskContent;

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Excluir";
        deleteButton.addEventListener("click", () => task.remove());

        task.appendChild(content);
        task.appendChild(deleteButton);
        column.appendChild(task);

        // Enviar tarefa para a API
        try {
            const response = await fetch(`${API_BOARD_URL}tarefas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: taskContent, columnId: column.dataset.id })
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar tarefa: ${response.status}`);
            }

            const data = await response.json();
            console.log('Tarefa criada:', data);
        } catch (error) {
            console.error('Erro ao enviar tarefa para a API:', error);
        }
    }

    async function buscarColunas(boardId) {
        console.log(`Buscando colunas para o board com ID: ${boardId}`);

        try {
            const response = await fetch(`${API_BOARD_URL}boards/${boardId}/columns`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar colunas: ${response.status}`);
            }

            const columns = await response.json();
            console.log("Colunas recebidas:", columns);

            // Limpa o conteúdo atual do board antes de popular
            board.innerHTML = '';

            columns.forEach((columnData) => {
                const column = document.createElement("div");
                column.className = "column";

                const title = document.createElement("h3");
                title.innerText = columnData.Name;

                const addTaskButton = document.createElement("button");
                addTaskButton.innerText = "Nova tarefa";
                addTaskButton.addEventListener("click", () => createTask(column));

                column.appendChild(title);
                column.appendChild(addTaskButton);

                // Adiciona tarefas existentes na coluna
                columnData.Tasks.forEach((taskData) => {
                    const task = document.createElement("div");
                    task.className = "task";

                    const content = document.createElement("p");
                    content.innerText = taskData.Content;

                    const deleteButton = document.createElement("button");
                    deleteButton.innerText = "Excluir";
                    deleteButton.addEventListener("click", () => task.remove());

                    task.appendChild(content);
                    task.appendChild(deleteButton);
                    column.appendChild(task);
                });

                board.appendChild(column);
            });

            // Reposiciona o botão "Adicionar Coluna" no final
            board.appendChild(addColumnButton);
        } catch (error) {
            console.error('Erro ao buscar colunas:', error);
        }
    }
});
