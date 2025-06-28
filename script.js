// Highlight selected view mode
const viewButtons = document.querySelectorAll('.view-modes button');
viewButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    viewButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCalendarView(btn.id);
  });
});

// Calendar view logic
const calendarSection = document.querySelector('.calendar-section');

let selectedDate = new Date();

function getWeekDates(date) {
  // Returns array of Date objects for the current week (Sunday to Saturday)
  const curr = new Date(date);
  const week = [];
  const first = curr.getDate() - curr.getDay();
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr.setDate(first + i));
    week.push(new Date(d));
  }
  return week;
}

function getMonthDates(date) {
  // Returns array of Date objects for the current month
  const curr = new Date(date);
  const year = curr.getFullYear();
  const month = curr.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const monthDates = [];
  for (let i = 1; i <= days; i++) {
    monthDates.push(new Date(year, month, i));
  }
  return monthDates;
}

function formatDate(date) {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  return `${date.getDate()} ${months[date.getMonth()]}<br>${days[date.getDay()]}`;
}

function getTimeSlots() {
  // Returns an array of time slot labels from 12:00 AM to 11:00 PM
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    slots.push(`${displayHour}:00 ${ampm}`);
  }
  return slots;
}

function updateCalendarView(viewId, customDate) {
  let html = '';
  const now = customDate ? new Date(customDate) : new Date();
  const timeSlots = getTimeSlots();
  selectedDate = now;
  const today = new Date();
  
  if (viewId === 'daily-view') {
    // Daily: show only selected day
    const isToday = now.toDateString() === today.toDateString();
    html += '<table class="calendar-grid"><thead><tr>';
    html += '<th>Date</th>';
    html += `<th class="${isToday ? 'current-day' : ''}">${formatDate(now)}</th>`;
    html += '</tr></thead><tbody>';
    timeSlots.forEach(slot => {
      html += `<tr><td>${slot}</td><td></td></tr>`;
    });
    html += '</tbody></table>';
  } else if (viewId === 'weekly-view') {
    // Weekly: show current week
    const week = getWeekDates(now);
    html += '<table class="calendar-grid"><thead><tr>';
    html += '<th>Date</th>';
    week.forEach(d => {
      const isSelected = d.toDateString() === selectedDate.toDateString();
      const isToday = d.toDateString() === today.toDateString();
      const classes = ['calendar-day-header'];
      if (isSelected) classes.push('selected-day');
      const classString = ` class="${classes.join(' ')}"`;
      html += `<th${classString} data-date="${d.toISOString()}">`;
      if (isToday) {
        html += `<div class="current-day-circle">${d.getDate()}</div>`;
        html += `<div class="date-info">${formatDate(d)}</div>`;
      } else {
        html += formatDate(d);
      }
      html += '</th>';
    });
    html += '</tr></thead><tbody>';
    timeSlots.forEach(slot => {
      html += `<tr><td>${slot}</td>`;
      for (let i = 0; i < 7; i++) html += '<td></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  } else if (viewId === 'monthly-view') {
    // Monthly: show all days in current month
    const monthDates = getMonthDates(now);
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    html += '<table class="calendar-grid"><thead><tr>';
    html += '<th>Date</th>';
    days.forEach(day => {
      html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';
    let week = [];
    for (let i = 0; i < monthDates.length; i++) {
      if (i === 0) {
        for (let j = 0; j < monthDates[0].getDay(); j++) week.push('');
      }
      week.push(monthDates[i]);
      if (week.length === 7 || i === monthDates.length - 1) {
        html += '<tr><td></td>';
        for (let j = 0; j < 7; j++) {
          if (typeof week[j] === 'object') {
            const d = week[j];
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const isToday = d.toDateString() === today.toDateString();
            const classes = ['calendar-day-header'];
            if (isSelected) classes.push('selected-day');
            if (isToday) classes.push('current-day');
            const classString = ` class="${classes.join(' ')}"`;
            html += `<td${classString} data-date="${d.toISOString()}">${d.getDate()}</td>`;
          } else {
            html += '<td></td>';
          }
        }
        html += '</tr>';
        week = [];
      }
    }
    html += '</tbody></table>';
  } else if (viewId === 'yearly-view') {
    // Yearly: show all 12 months in a grid
    const year = now.getFullYear();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    html += '<div class="yearly-grid">';
    html += `<h2 style="text-align: center; margin-bottom: 20px;">${year}</h2>`;
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(year, i, 1);
      const isCurrentMonth = monthDate.getMonth() === now.getMonth() && monthDate.getFullYear() === now.getFullYear();
      html += `<div class="month-card${isCurrentMonth ? ' current-month' : ''}" data-month="${i}" data-year="${year}">`;
      html += `<h3>${months[i]}</h3>`;
      html += `<div class="month-events"></div>`;
      html += '</div>';
    }
    html += '</div>';
  }
  calendarSection.innerHTML = html;

  // Add click listeners to day headers
  document.querySelectorAll('.calendar-day-header').forEach(cell => {
    cell.addEventListener('click', function(e) {
      const dateStr = this.getAttribute('data-date');
      if (dateStr) {
        viewButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('daily-view').classList.add('active');
        updateCalendarView('daily-view', dateStr);
      }
    });
  });

  // Add click listeners to month cards in yearly view
  document.querySelectorAll('.month-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const month = parseInt(this.getAttribute('data-month'));
      const year = parseInt(this.getAttribute('data-year'));
      const monthDate = new Date(year, month, 1);
      
      viewButtons.forEach(b => b.classList.remove('active'));
      document.getElementById('monthly-view').classList.add('active');
      updateCalendarView('monthly-view', monthDate);
    });
  });

  // Re-render all events after updating the calendar
  renderAllEvents();
}

// Render all events for the current view
function renderAllEvents() {
  const viewId = document.querySelector('.view-modes .active').id;
  const currentFilter = document.getElementById('filter-select').value;
  
  // Clear existing events first
  document.querySelectorAll('.event-box').forEach(box => box.remove());
  
  // Filter events based on current selection
  const filteredEvents = events.filter(event => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'schedule') return event.category === 'schedule';
    if (currentFilter === 'calendar') return event.category !== 'schedule';
    return event.category === currentFilter;
  });
  
  // Update event counter
  const eventCounter = document.getElementById('event-counter');
  if (eventCounter) {
    eventCounter.textContent = `(${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''})`;
  }
  
  console.log('Filtered events:', filteredEvents, 'for filter:', currentFilter);
  
  filteredEvents.forEach(event => {
    if (viewId === 'daily-view') {
      // Show events for the selected day
      if (isEventVisibleOnDate(event, selectedDate)) {
        const rows = document.querySelectorAll('.calendar-grid tbody tr');
        rows.forEach(row => {
          const timeLabel = row.children[0].textContent.trim();
          if (timeLabel === event.startTimeLabel) {
            const cell = row.children[1];
            renderEventBox(cell, event);
          }
        });
      }
    } else if (viewId === 'weekly-view') {
      // Show events for the current week
      const weekDates = getWeekDates(selectedDate);
      weekDates.forEach(date => {
        if (isEventVisibleOnDate(event, date)) {
          const rows = document.querySelectorAll('.calendar-grid tbody tr');
          rows.forEach(row => {
            const timeLabel = row.children[0].textContent.trim();
            if (timeLabel === event.startTimeLabel) {
              const dayIndex = weekDates.findIndex(d => d.toDateString() === date.toDateString());
              if (dayIndex !== -1) {
                const cell = row.children[dayIndex + 1];
                renderEventBox(cell, event);
              }
            }
          });
        }
      });
    } else if (viewId === 'monthly-view') {
      // Show events for the current month
      const monthDates = getMonthDates(selectedDate);
      monthDates.forEach(date => {
        if (isEventVisibleOnDate(event, date)) {
          document.querySelectorAll('.calendar-day-header').forEach(cell => {
            const cellDate = cell.getAttribute('data-date');
            if (cellDate && new Date(cellDate).toDateString() === date.toDateString()) {
              renderEventBox(cell, event, true);
            }
          });
        }
      });
    } else if (viewId === 'yearly-view') {
      // Show event counts for each month
      const monthCards = document.querySelectorAll('.month-card');
      monthCards.forEach((card, monthIndex) => {
        const year = parseInt(card.getAttribute('data-year'));
        const monthEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
        });
        
        const monthEventsDiv = card.querySelector('.month-events');
        if (monthEventsDiv) {
          if (monthEvents.length > 0) {
            monthEventsDiv.innerHTML = `<div style="font-size: 12px; color: #666;">${monthEvents.length} event${monthEvents.length !== 1 ? 's' : ''}</div>`;
          } else {
            monthEventsDiv.innerHTML = '';
          }
        }
      });
    }
  });
}

// Check if an event should be visible on a specific date
function isEventVisibleOnDate(event, date) {
  const eventDate = new Date(event.date);
  const checkDate = new Date(date);
  
  // If it's a one-time event, check if it's on the exact date
  if (!event.recurring) {
    return eventDate.toDateString() === checkDate.toDateString();
  }
  
  // For recurring events, check based on the recurring type
  if (event.recurringType === 'daily') {
    // Show on all days from the start date onwards
    return checkDate >= eventDate;
  } else if (event.recurringType === 'weekly') {
    // Show on the same day of the week, from the start date onwards
    return checkDate >= eventDate && checkDate.getDay() === eventDate.getDay();
  } else if (event.recurringType === 'monthly') {
    // Show on the same date of the month, from the start date onwards
    return checkDate >= eventDate && checkDate.getDate() === eventDate.getDate();
  }
  
  return false;
}

// Event storage
let events = [];
let reminders = [];
let goals = [];
let scheduleTasks = [];

// Create reminder for an event
function createEventReminder(event) {
  const eventDate = new Date(event.date);
  const [hours, minutes] = event.startTime.split(':');
  eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Create reminder 15 minutes before event
  const reminderTime = new Date(eventDate.getTime() - 15 * 60 * 1000);
  
  const reminder = {
    id: Date.now() + Math.random(),
    eventTitle: event.title,
    eventTime: event.startTime,
    reminderTime: reminderTime,
    description: `Reminder for ${event.title}`,
    eventId: event.id || Date.now()
  };
  
  reminders.push(reminder);
  updateRemindersList();
}

// Update reminders list in the modal
function updateRemindersList() {
  const remindersList = document.getElementById('reminders-list');
  if (!remindersList) return;
  
  if (reminders.length === 0) {
    remindersList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No reminders set. Add your first reminder below.</p>';
    return;
  }
  
  remindersList.innerHTML = reminders.map(reminder => `
    <div class="task-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">${reminder.eventTitle}</h4>
          <div class="task-meta">
            <span>Event: ${reminder.eventTime}</span>
            <span>Reminder: ${reminder.reminderTime.toLocaleString()}</span>
          </div>
          <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">${reminder.description}</p>
        </div>
        <button onclick="deleteReminder(${reminder.id})" class="task-remove">×</button>
      </div>
    </div>
  `).join('');
}

// Delete a reminder
function deleteReminder(reminderId) {
  reminders = reminders.filter(r => r.id !== reminderId);
  updateRemindersList();
}

// Update goals list in the modal
function updateGoalsList() {
  const goalsList = document.getElementById('goals-list');
  if (!goalsList) return;
  
  if (goals.length === 0) {
    goalsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No goals set. Add your first goal below.</p>';
    return;
  }
  
  goalsList.innerHTML = goals.map(goal => `
    <div class="task-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-primary);">${goal.title}</h4>
          <div class="task-meta">
            <span>Category: ${goal.category}</span>
            ${goal.targetDate ? `<span>Target: ${new Date(goal.targetDate).toLocaleDateString()}</span>` : ''}
          </div>
          <p style="margin: 8px 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">${goal.description || 'No description'}</p>
        </div>
        <button onclick="deleteGoal(${goal.id})" class="task-remove">×</button>
      </div>
    </div>
  `).join('');
}

// Delete a goal
function deleteGoal(goalId) {
  goals = goals.filter(g => g.id !== goalId);
  updateGoalsList();
}

// Add a new task to the schedule
function addTask() {
  const taskId = Date.now() + Math.random();
  const task = {
    id: taskId,
    title: '',
    difficulty: 'medium',
    estimatedTime: 30
  };
  scheduleTasks.push(task);
  updateTasksList();
}

// Remove a task from the schedule
function removeTask(taskId) {
  scheduleTasks = scheduleTasks.filter(t => t.id !== taskId);
  updateTasksList();
}

// Update task in the schedule
function updateTask(taskId, field, value) {
  const task = scheduleTasks.find(t => t.id === taskId);
  if (task) {
    task[field] = value;
  }
}

// Update tasks list in the modal
function updateTasksList() {
  const tasksList = document.getElementById('tasks-list');
  if (!tasksList) return;
  
  if (scheduleTasks.length === 0) {
    tasksList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No tasks added yet. Click "Add Task" to get started.</p>';
    return;
  }
  
  tasksList.innerHTML = scheduleTasks.map(task => `
    <div class="task-item">
      <div class="task-header">
        <input type="text" placeholder="Task title" value="${task.title}" onchange="updateTask(${task.id}, 'title', this.value)" class="task-title">
        <select onchange="updateTask(${task.id}, 'difficulty', this.value)" class="task-difficulty">
          <option value="easy" ${task.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
          <option value="medium" ${task.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="hard" ${task.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
        <input type="number" placeholder="Time (min)" value="${task.estimatedTime}" min="1" max="480" onchange="updateTask(${task.id}, 'estimatedTime', this.value)" class="task-time">
        <button onclick="removeTask(${task.id})" class="task-remove">×</button>
      </div>
      <div class="task-meta">
        <span>Difficulty: <span style="color: ${task.difficulty === 'easy' ? 'var(--success-color)' : task.difficulty === 'medium' ? 'var(--warning-color)' : 'var(--danger-color)'}">${task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}</span></span>
        <span>Estimated: ${task.estimatedTime} minutes</span>
      </div>
    </div>
  `).join('');
}

// Add event to calendar
function addEventToCalendar(event) {
  console.log('addEventToCalendar called with event:', event);
  
  // Check if event should be shown based on current filter
  const currentFilter = document.getElementById('filter-select').value;
  const shouldShow = currentFilter === 'all' || 
                    (currentFilter === 'schedule' && event.category === 'schedule') ||
                    (currentFilter === 'calendar' && event.category !== 'schedule') ||
                    event.category === currentFilter;
  
  if (!shouldShow) {
    console.log('Event filtered out by current filter:', currentFilter);
    return;
  }
  
  // Find the correct cell(s) in the current view and add a colored box
  // Only support current view (daily/weekly/monthly) and single events for now
  const viewId = document.querySelector('.view-modes .active').id;
  console.log('Current view ID:', viewId);
  
  if (viewId === 'daily-view') {
    // Only one column, find the correct time slot
    const rows = document.querySelectorAll('.calendar-grid tbody tr');
    console.log('Found rows:', rows.length);
    rows.forEach(row => {
      const timeLabel = row.children[0].textContent.trim();
      console.log('Checking time label:', timeLabel, 'against event startTimeLabel:', event.startTimeLabel);
      if (timeLabel === event.startTimeLabel) {
        console.log('Found matching time slot, adding event');
        const cell = row.children[1];
        renderEventBox(cell, event);
      }
    });
  } else if (viewId === 'weekly-view') {
    // Find the correct day and time slot
    const weekDates = getWeekDates(selectedDate);
    const rows = document.querySelectorAll('.calendar-grid tbody tr');
    console.log('Weekly view - found rows:', rows.length, 'week dates:', weekDates.length);
    rows.forEach(row => {
      const timeLabel = row.children[0].textContent.trim();
      if (timeLabel === event.startTimeLabel) {
        weekDates.forEach((date, i) => {
          if (date.toDateString() === event.date.toDateString()) {
            console.log('Found matching day and time, adding event');
            const cell = row.children[i + 1];
            renderEventBox(cell, event);
          }
        });
      }
    });
  } else if (viewId === 'monthly-view') {
    // For monthly, just highlight the day cell (not time-based)
    document.querySelectorAll('.calendar-day-header').forEach(cell => {
      const cellDate = cell.getAttribute('data-date');
      if (cellDate && new Date(cellDate).toDateString() === event.date.toDateString()) {
        console.log('Found matching day in monthly view, adding event');
        renderEventBox(cell, event, true);
      }
    });
  }
}

function renderEventBox(cell, event, isMonth) {
  const box = document.createElement('div');
  box.className = 'event-box';
  box.style.background = event.color;
  box.style.color = '#fff';
  box.style.margin = '2px 0';
  box.style.padding = '2px 6px';
  box.style.borderRadius = '5px';
  box.style.fontSize = '0.95em';
  box.style.cursor = 'pointer';
  box.textContent = event.title;
  box.onclick = function(e) {
    showEventDetails(event);
    e.stopPropagation();
  };
  if (isMonth) {
    cell.appendChild(box);
  } else {
    cell.appendChild(box);
  }
}

function showEventDetails(event) {
  document.getElementById('event-details-title').textContent = event.title;
  document.getElementById('event-details-body').innerHTML = `
    <b>Time:</b> ${event.allDay ? 'All Day' : event.startTime + ' - ' + event.endTime}<br>
    <b>Description:</b> ${event.description || 'None'}<br>
    <b>Category:</b> ${event.category}<br>
    <b>Color:</b> <span style="display:inline-block;width:16px;height:16px;background:${event.color};border-radius:3px;"></span><br>
    <b>Recurring:</b> ${event.recurring ? event.recurringType : 'No'}
  `;
  document.getElementById('event-details-modal').style.display = 'flex';
}

// Wait for DOM to be loaded before setting up event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initial load: show weekly view
  updateCalendarView('weekly-view');

  // Modal show/hide logic
  const modals = {
    'new-event-btn': document.getElementById('new-event-modal'),
    'reminders-btn': document.getElementById('reminders-modal'),
    'goals-btn': document.getElementById('goals-modal'),
    'create-schedule-btn': document.getElementById('create-schedule-modal'),
  };

  function showModal(modalKey) {
    Object.entries(modals).forEach(([key, modal]) => {
      if (key === modalKey) {
        if (modal.style.display === 'none' || modal.style.display === '') {
          modal.style.display = 'flex';
        } else {
          modal.style.display = 'none';
        }
      } else {
        modal.style.display = 'none';
      }
    });
  }

  document.getElementById('new-event-btn').onclick = () => showModal('new-event-btn');
  document.getElementById('reminders-btn').onclick = () => showModal('reminders-btn');
  document.getElementById('goals-btn').onclick = () => showModal('goals-btn');
  document.getElementById('create-schedule-btn').onclick = () => {
    showModal('create-schedule-btn');
    updateTasksList();
  };

  // Close modal when clicking the close button or outside the modal content
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(btn => {
    btn.onclick = function() {
      const modalId = this.getAttribute('data-modal');
      document.getElementById(modalId).style.display = 'none';
    };
  });

  window.onclick = function(event) {
    Object.values(modals).forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };

  // Recurring options show/hide
  const recurringCheckbox = document.getElementById('recurring-checkbox');
  const recurringOptions = document.getElementById('recurring-options');
  if (recurringCheckbox && recurringOptions) {
    recurringCheckbox.addEventListener('change', function() {
      recurringOptions.style.display = this.checked ? 'block' : 'none';
    });
  }

  // Handle new event form submission
  const newEventForm = document.getElementById('new-event-form');
  if (newEventForm) {
    newEventForm.onsubmit = function(e) {
      e.preventDefault();
      const data = new FormData(newEventForm);
      const title = data.get('title');
      const startTime = data.get('start-time');
      const endTime = data.get('end-time');
      const description = data.get('description');
      const allDay = data.get('all-day') ? true : false;
      const recurring = data.get('recurring') ? true : false;
      const recurringType = recurring ? data.get('recurring-type') : null;
      const category = data.get('category');
      const color = data.get('color') || '#1a365d';
      // Use selectedDate for the event's date
      const eventDate = new Date(selectedDate);
      // Find the time label for the calendar
      function timeLabelFromValue(val) {
        if (!val) return '';
        const [h, m] = val.split(':');
        let hour = parseInt(h, 10);
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:00 ${ampm}`;
      }
      const startTimeLabel = allDay ? '12:00 AM' : timeLabelFromValue(startTime);
      const eventObj = {
        id: Date.now(),
        title, startTime, endTime, description, allDay, recurring, recurringType, category, color,
        date: eventDate,
        startTimeLabel
      };
      events.push(eventObj);
      addEventToCalendar(eventObj);
      
      // Automatically create a reminder for the event
      createEventReminder(eventObj);
      
      document.getElementById('new-event-modal').style.display = 'none';
      newEventForm.reset();
      recurringOptions.style.display = 'none';
    };
  }

  // Handle new reminder form submission
  const newReminderForm = document.getElementById('new-reminder-form');
  if (newReminderForm) {
    newReminderForm.onsubmit = function(e) {
      e.preventDefault();
      const data = new FormData(newReminderForm);
      const eventTitle = data.get('event-title');
      const reminderTime = new Date(data.get('reminder-time'));
      const description = data.get('reminder-description') || `Reminder for ${eventTitle}`;
      
      const reminder = {
        id: Date.now() + Math.random(),
        eventTitle: eventTitle,
        eventTime: 'Manual reminder',
        reminderTime: reminderTime,
        description: description,
        eventId: null
      };
      
      reminders.push(reminder);
      updateRemindersList();
      
      newReminderForm.reset();
    };
  }

  // Handle new goal form submission
  const newGoalForm = document.getElementById('new-goal-form');
  if (newGoalForm) {
    newGoalForm.onsubmit = function(e) {
      e.preventDefault();
      const data = new FormData(newGoalForm);
      const title = data.get('goal-title');
      const description = data.get('goal-description');
      const targetDate = data.get('goal-date');
      const category = data.get('goal-category');
      
      const goal = {
        id: Date.now() + Math.random(),
        title: title,
        description: description,
        targetDate: targetDate,
        category: category,
        createdAt: new Date()
      };
      
      goals.push(goal);
      updateGoalsList();
      
      newGoalForm.reset();
    };
  }

  // Update reminders list when reminders modal is opened
  const originalRemindersBtn = document.getElementById('reminders-btn').onclick;
  document.getElementById('reminders-btn').onclick = () => {
    showModal('reminders-btn');
    updateRemindersList();
  };

  // Update goals list when goals modal is opened
  document.getElementById('goals-btn').onclick = () => {
    showModal('goals-btn');
    updateGoalsList();
  };

  // Add task button functionality
  const addTaskBtn = document.getElementById('add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.onclick = addTask;
  }

  // Add filter dropdown functionality
  const filterSelect = document.getElementById('filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      console.log('Filter changed to:', this.value);
      renderAllEvents();
    });
  }

  // Handle create schedule form submission
  const createScheduleForm = document.getElementById('create-schedule-form');
  if (createScheduleForm) {
    createScheduleForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('Create schedule form submitted');
      
      const data = new FormData(createScheduleForm);
      const startTime = data.get('start-time');
      const endTime = data.get('end-time');
      const breaks = data.get('breaks') || 0;
      const pomodoro = data.get('pomodoro') === 'on';
      const eatTheFrog = data.get('eat-the-frog') === 'on';
      
      console.log('Form data:', { startTime, endTime, breaks, pomodoro, eatTheFrog });
      console.log('Schedule tasks:', scheduleTasks);
      
      // Validate that times are provided
      if (!startTime || !endTime) {
        alert('Please select both start and end times.');
        return;
      }
      
      // Create schedule object
      const schedule = {
        id: Date.now(),
        startTime: startTime,
        endTime: endTime,
        breaks: parseInt(breaks) || 0,
        pomodoro: pomodoro,
        eatTheFrog: eatTheFrog,
        tasks: scheduleTasks.filter(task => task.title.trim() !== ''),
        createdAt: new Date()
      };
      
      console.log('Created schedule:', schedule);
      
      // Create events for each task in the schedule
      if (schedule.tasks.length > 0) {
        console.log('Creating events for tasks...');
        createScheduleEvents(schedule);
      } else {
        console.log('No tasks to create events for');
      }
      
      // Clear the form and tasks
      createScheduleForm.reset();
      scheduleTasks = [];
      updateTasksList();
      
      // Close the modal
      document.getElementById('create-schedule-modal').style.display = 'none';
      
      alert('Schedule created successfully! Check your calendar for the new events.');
    };
  }

  // Create events from schedule
  function createScheduleEvents(schedule) {
    console.log('createScheduleEvents called with schedule:', schedule);
    
    const eventDate = new Date(selectedDate);
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
    
    let currentTime = new Date(eventDate);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(eventDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    console.log('Event date:', eventDate);
    console.log('Current time:', currentTime);
    console.log('End time:', endTime);
    
    // Sort tasks by difficulty if "Eat the Frog" is enabled
    let sortedTasks = [...schedule.tasks];
    if (schedule.eatTheFrog) {
      const difficultyOrder = { 'hard': 0, 'medium': 1, 'easy': 2 };
      sortedTasks.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    }
    
    console.log('Sorted tasks:', sortedTasks);
    
    sortedTasks.forEach((task, index) => {
      console.log(`Processing task ${index + 1}:`, task);
      
      if (currentTime >= endTime) {
        console.log('Current time exceeds end time, stopping');
        return; // Stop if we've exceeded the time slot
      }
      
      // Calculate task end time
      const taskEndTime = new Date(currentTime.getTime() + task.estimatedTime * 60 * 1000);
      
      // Don't create event if it exceeds the schedule end time
      if (taskEndTime > endTime) {
        console.log('Task end time exceeds schedule end time, skipping');
        return;
      }
      
      // Create event for this task
      const eventObj = {
        id: Date.now() + Math.random(),
        title: task.title,
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: taskEndTime.toTimeString().slice(0, 5),
        description: `Difficulty: ${task.difficulty} | Estimated: ${task.estimatedTime} minutes`,
        allDay: false,
        recurring: false,
        recurringType: null,
        category: 'schedule',
        color: getDifficultyColor(task.difficulty),
        date: new Date(eventDate),
        startTimeLabel: getTimeLabel(currentTime)
      };
      
      console.log('Created event object:', eventObj);
      
      events.push(eventObj);
      addEventToCalendar(eventObj);
      
      // Move to next task time (including break if specified)
      currentTime = new Date(taskEndTime.getTime() + (schedule.breaks * 60 * 1000));
      console.log('Next task time:', currentTime);
    });
    
    console.log('Final events array:', events);
  }

  // Get color based on difficulty
  function getDifficultyColor(difficulty) {
    switch (difficulty) {
      case 'easy': return '#28a745'; // Green
      case 'medium': return '#ffc107'; // Yellow
      case 'hard': return '#dc3545'; // Red
      default: return '#1a365d'; // Default navy
    }
  }

  // Get time label for calendar
  function getTimeLabel(date) {
    const hour = date.getHours();
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  }

  // Style for event boxes
  const style = document.createElement('style');
  style.innerHTML = `.event-box:hover { filter: brightness(0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.10); }
  .event-box { transition: box-shadow 0.2s; }`;
  document.head.appendChild(style);
});
