const API_BOARD_URL = 'https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/';

// Referências
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById("board");
    const addColumnButton = document.getElementById("addColumnButton");
    const boardDropdown = document.getElementById('boardDropdown');
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

    loadBoards(); // Carrega os boards disponíveis

    addColumnButton.addEventListener("click", createColumn);

    async function loadBoards() {
        try {
            console.log("Carregando boards...");
            const response = await fetch(`${API_BOARD_URL}boards`);
            if (!response.ok) throw new Error(`Erro ao carregar boards: ${response.statusText}`);

            const boards = await response.json();
            console.log("Boards recebidos:", boards);

            boardDropdown.innerHTML = '<option value="">Selecione um board</option>'; // Limpar antes de popular
            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.Id;
                option.textContent = board.Name;
                boardDropdown.appendChild(option);
            });

            // Carregar as colunas automaticamente quando um board é selecionado
            boardDropdown.addEventListener('change', () => {
                if (boardDropdown.value) {
                    console.log(`Board selecionado: ${boardDropdown.value}`);
                    loadColumns(boardDropdown.value);
                }
            });
        } catch (error) {
            console.error('Erro ao carregar boards:', error);
        }
    }

    async function loadColumns(boardId) {
        console.log(`Carregando colunas para o board ID: ${boardId}`);
        try {
            const response = await fetch(`${API_BOARD_URL}boards/${boardId}/columns`);
            if (!response.ok) throw new Error(`Erro ao carregar colunas: ${response.statusText}`);

            const columns = await response.json();
            console.log("Colunas recebidas:", columns);

            board.innerHTML = ''; // Limpa as colunas anteriores

            columns.forEach(columnData => {
                const column = document.createElement("div");
                column.className = "column";

                const title = document.createElement("h3");
                title.innerText = columnData.Name;

                const addTaskButton = document.createElement("button");
                addTaskButton.innerText = "Nova tarefa";
                addTaskButton.addEventListener("click", () => createTask(columnData.Id));

                column.appendChild(title);
                column.appendChild(addTaskButton);

                const taskList = document.createElement("div");
                taskList.className = "task-list";

                columnData.Tasks.forEach(taskData => {
                    const task = document.createElement("div");
                    task.className = "task";

                    const content = document.createElement("p");
                    content.innerText = taskData.Content;

                    const deleteButton = document.createElement("button");
                    deleteButton.innerText = "Excluir";
                    deleteButton.addEventListener("click", () => deleteTask(taskData.Id, task));

                    task.appendChild(content);
                    task.appendChild(deleteButton);
                    taskList.appendChild(task);
                });

                column.appendChild(taskList);
                board.appendChild(column);
            });

            board.appendChild(addColumnButton);
        } catch (error) {
            console.error('Erro ao carregar colunas:', error);
        }
    }

    async function createColumn() {
        const columnTitle = prompt("Digite o título da nova coluna:");
        if (!columnTitle || !boardDropdown.value) {
            alert("Por favor, selecione um board antes de criar uma coluna.");
            return;
        }

        console.log(`Tentando criar coluna no board ${boardDropdown.value} com título: ${columnTitle}`);
        try {
            const response = await fetch(`${API_BOARD_URL}columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Name: columnTitle,
                    BoardId: parseInt(boardDropdown.value) // Certifique-se de enviar o ID do board como número
                })
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`Erro ao criar coluna: ${response.statusText} - ${errorDetails}`);
            }

            const newColumn = await response.json();
            console.log("Coluna criada com sucesso:", newColumn);
            alert("Coluna criada com sucesso!");
            loadColumns(boardDropdown.value); // Atualiza as colunas do board após criação
        } catch (error) {
            console.error('Erro ao criar coluna:', error);
            alert(`Erro ao criar coluna: ${error.message}`);
        }
    }

    async function createTask(columnId) {
        const taskContent = prompt("Digite o conteúdo da nova tarefa:");
        if (!taskContent) {
            alert("Por favor, insira o conteúdo da tarefa.");
            return;
        }

        console.log(`Tentando criar tarefa na coluna ${columnId} com conteúdo: ${taskContent}`);
        try {
            const response = await fetch(`${API_BOARD_URL}tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Content: taskContent,
                    ColumnId: parseInt(columnId) // Certifique-se de enviar o ID da coluna como número
                })
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`Erro ao criar tarefa: ${response.statusText} - ${errorDetails}`);
            }

            const newTask = await response.json();
            console.log("Tarefa criada com sucesso:", newTask);
            alert("Tarefa criada com sucesso!");
            loadColumns(boardDropdown.value); // Atualiza as colunas após criação da tarefa
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            alert(`Erro ao criar tarefa: ${error.message}`);
        }
    }

    async function deleteTask(taskId, taskElement) {
        const confirmDelete = confirm("Tem certeza de que deseja excluir esta tarefa?");
        if (confirmDelete) {
            try {
                const response = await fetch(`${API_BOARD_URL}tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`Erro ao excluir tarefa: ${response.statusText} - ${errorDetails}`);
                }

                console.log("Tarefa excluída com sucesso");
                taskElement.remove(); // Remove a tarefa da interface
            } catch (error) {
                console.error('Erro ao excluir tarefa:', error);
                alert(`Erro ao excluir tarefa: ${error.message}`);
            }
        }
    }
});
