document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'pt-br',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    dayMaxEvents: true,

    // Personaliza a exibição do conteúdo do evento
    eventContent: function(arg) {
      let customEl = document.createElement('div');
      customEl.classList.add('custom-event');
    
      // Botão de exclusão
      let deleteBtn = document.createElement('button');
      deleteBtn.innerText = 'X';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.onclick = function() {
        arg.event.remove(); // Remove o evento
        updateDailyTotals(calendar); // Atualiza os totais após remoção de evento
      };
    
      // Insere o botão antes do texto
      customEl.appendChild(deleteBtn);
    
      // Título do evento
      let titleEl = document.createElement('span');
      titleEl.innerText = arg.event.title;
      customEl.appendChild(titleEl);
    
      return { domNodes: [customEl] };
    },
    
    // Adiciona o evento de clique para exibir o modal
    eventClick: function(info) {
      var eventTitle = info.event.title; // Título do evento clicado
      document.getElementById('modalTitle').innerText = 'Detalhes do Procedimento';
      document.getElementById('modalContent').innerText = `Evento: ${eventTitle}`;
      document.getElementById('eventModal').style.display = 'block'; // Exibe o modal
    }
  });
  calendar.render();

  var eventValues = {}; // Objeto para armazenar a soma dos valores por data
  let totalToday = 0; // Total do dia atual
  let totalMonth = 0; // Total do mês acumulado

  // Função para atualizar os totais do dia e do mês
  function updateTotals() {
    document.getElementById('totalToday').innerText = `Total do Dia Atual: R$ ${totalToday.toFixed(2)}`;
    document.getElementById('totalMonth').innerText = `Total do Mês Acumulado: R$ ${totalMonth.toFixed(2)}`;
  }

  // Adiciona evento no formulário
  document.getElementById('appointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var appointmentDate = document.getElementById('appointmentDate').value;
    var clientName = document.getElementById('clientName').value;
    var value = parseFloat(document.getElementById('value').value);
    var procedure = document.getElementById('procedure').value;

    // Ajusta a data para o formato correto (yyyy-mm-dd)
    var dateKey = new Date(appointmentDate).toISOString().split('T')[0];

    if (eventValues[dateKey]) {
      eventValues[dateKey] += value;
    } else {
      eventValues[dateKey] = value;
    }

    const maxTitleLength = 30; // Número máximo de caracteres

    // Função para truncar o título
    const truncatedTitle = `${procedure} - ${clientName} - R$ ${value.toFixed(2)}`.length > maxTitleLength
      ? `${procedure.substring(0, maxTitleLength)}...`
      : `${procedure} - ${clientName} - R$ ${value.toFixed(2)}`;


    calendar.on('eventClick', function(info) {
      const fullTitle = `${procedure} - ${clientName} - R$ ${value.toFixed(2)}`;
      document.getElementById('modalTitle').innerText = 'Detalhes do Procedimento';
      document.getElementById('modalContent').innerText = `${fullTitle}`; // Exibe o título completo
      document.getElementById('eventModal').style.display = 'block'; // Exibe o modal
    });
      

    // Adiciona o evento no calendário
    calendar.addEvent({
      title: truncatedTitle,
      start: appointmentDate,
      allDay: true
    });

    // Verifica se o evento é do dia atual e soma ao total do dia
    const today = new Date();
    const eventDate = new Date(appointmentDate);
    if (eventDate.toDateString() === today.toDateString()) {
      totalToday += value;
    }

    // Verifica se o evento é do mês atual e soma ao total do mês
    if (eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()) {
      totalMonth += value;
    }

    // Atualiza os totais de dia e mês
    updateTotals();

    // Atualiza os totais diários após adicionar um novo evento
    updateDailyTotals(calendar);
  });

  // Função para atualizar os totais diários
  function updateDailyTotals(calendar) {
    // Limpa os totais diários anteriores
    document.querySelectorAll('.daily-total').forEach(el => el.remove());

    // Calcula e exibe os novos totais diários
    calendar.getEvents().forEach(event => {
      var dateKey = new Date(event.start).toISOString().split('T')[0];
      var cell = calendar.getCellEl(new Date(dateKey));
      if (cell && !cell.querySelector('.daily-total')) {
        var totalDiv = document.createElement('div');
        totalDiv.className = 'daily-total';
        totalDiv.innerText = `Total: R$ ${eventValues[dateKey].toFixed(2)}`;
        cell.appendChild(totalDiv);
      }
    });
  }

  // Função para poder digitar no campo "Outros" no campo Procedimento
  document.getElementById('procedure').addEventListener('change', function() {
    var otherProcedure = document.getElementById('otherProcedure');
    if (this.value === 'outros') {
      otherProcedure.style.display = 'block';
      otherProcedure.required = true;
    } else {
      otherProcedure.style.display = 'none';
      otherProcedure.required = false;
    }
  });

  // Função para permitir edição do valor
  document.getElementById('procedure').addEventListener('change', function() {
    var otherProcedure = document.getElementById('otherProcedure');
    var valueField = document.getElementById('value');
  
    if (this.value === 'outros') {
      otherProcedure.style.display = 'block';
      otherProcedure.required = true;
      valueField.readOnly = false; // Permitir edição
      valueField.value = ''; // Limpar o valor para permitir entrada
    } else {
      otherProcedure.style.display = 'none';
      otherProcedure.required = false;
      valueField.readOnly = true; // Tornar somente leitura

      // Atualizar o valor com base na seleção do procedimento
      if (this.value === 'Limpeza de pele') {
        valueField.value = 50;
      } else if (this.value === 'Micropigmentação') {
        valueField.value = 350;
      } else if (this.value === 'Depilação Egípicia') {
        valueField.value = 30;
      } else if (this.value === 'Hidratação Profunda') {
        valueField.value = 120;
      } else if (this.value === 'Depilação com Cera') {
        valueField.value = 70;
      }
    }
  });

  // Função para fechar o modal
  document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('eventModal').style.display = 'none'; // Esconde o modal
  });

});
