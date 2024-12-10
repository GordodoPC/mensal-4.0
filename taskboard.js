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
            const response = await fetch(`${API_BOARD_URL}boards`);
            if (!response.ok) throw new Error('Erro ao carregar boards');

            const boards = await response.json();
            console.log("Boards recebidos:", boards);

            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.Id;
                option.textContent = board.Name;
                boardDropdown.appendChild(option);
            });

            boardDropdown.addEventListener('change', () => {
                if (boardDropdown.value) {
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
            if (!response.ok) throw new Error('Erro ao carregar colunas');

            const columns = await response.json();
            console.log("Colunas recebidas:", columns);

            board.innerHTML = '';

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
                    column.appendChild(task);
                });

                board.appendChild(column);
            });

            board.appendChild(addColumnButton);
        } catch (error) {
            console.error('Erro ao carregar colunas:', error);
        }
    }

    async function createColumn() {
        const columnTitle = prompt("Digite o título da nova coluna:");
        if (!columnTitle || !boardDropdown.value) return;

        try {
            const response = await fetch(`${API_BOARD_URL}columns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Name: columnTitle, BoardId: boardDropdown.value })
            });

            if (!response.ok) throw new Error('Erro ao criar coluna');

            const newColumn = await response.json();
            console.log("Coluna criada:", newColumn);
            loadColumns(boardDropdown.value);
        } catch (error) {
            console.error('Erro ao criar coluna:', error);
        }
    }

    async function createTask(columnId) {
        const taskContent = prompt("Digite o conteúdo da nova tarefa:");
        if (!taskContent) return;

        try {
            const response = await fetch(`${API_BOARD_URL}tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Content: taskContent, ColumnId: columnId })
            });

            if (!response.ok) throw new Error('Erro ao criar tarefa');

            const newTask = await response.json();
            console.log("Tarefa criada:", newTask);
            loadColumns(boardDropdown.value);
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
    }

    async function deleteTask(taskId, taskElement) {
        try {
            const response = await fetch(`${API_BOARD_URL}tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Erro ao excluir tarefa');

            console.log("Tarefa excluída:", taskId);
            taskElement.remove();
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    }
});
