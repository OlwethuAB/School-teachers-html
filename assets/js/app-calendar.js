
var day_picker = $('#calendar').fullCalendar({
  selectable: true,
  unselectAuto: false,
  aspectRatio: 2,
  validRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start date of the current month
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // End date of the current month
  },
  hiddenDays: [0, 6], // Sunday (0) and Saturday (6) are hidden
  select: function(start, end, jsEvent){
    day_picker.fullCalendar('unselect');
    selectEngine_select(start, end);
  }
}); 

// button group
  $('#book_all_day').click(function (e) {
      selectEngine_addBooking({color: '#ff0bc2', type: 'allday'});
  });
  $('#book_am').click(function (e) {
      selectEngine_addBooking({color: '#00c83b', type: 'am'});
  });
  $('#book_pm').click(function (e) {
      selectEngine_addBooking({color: '#e3b502', type: 'pm'});
  });
  $('#book_remove').click(function (e) {
      selectEngine_removeBooking();
  });
//


// Select Engine
  var select_events = [];
  var disabled_dates = {};
  const select_placeholder = {
      rendering:      'background',
      color:          '#79b4db',
      allDay:         true,
      placeholder:    true,
  };
  const existing_template = {
      rendering:      'background',
      color:          '#992222',
      allDay:         true,
      placeholder:    false,
      unselectable:   true,
  };
  

  function selectEngine_select(start, end)
  {

      if(!(window.event.shiftKey)){
          select_events = [];
          select_scheduleIds = [];
      }

      var range = moment.range(start, end.subtract(1,'day'));
      for(let date of range.by('day')){

          var obj = {
              ...select_placeholder,
              start: date.format('YYYY-MM-DD'),
              //start: date.format('DD/MM/YYYY'),
          };
          !(select_events.some( val => val.start == obj.start )) && !(date.format('YYYY-MM-DD') in disabled_dates) ? select_events.push(obj) : '';
      }

      day_picker.fullCalendar( 'removeEvents', function(event){
          return event.placeholder == true;
      });
      day_picker.fullCalendar( 'renderEvents', select_events);

  }

  function selectEngine_prepareExistingDays()
  {
      
      if(typeof $('#day-picker').attr(':initial') == typeof undefined)
          return; //if no initial dates then ignore.
      let dates = JSON.parse($('#day-picker').attr(':initial'))
      let bookings = selectEngine_selectedEvents();
      for(let date of dates) {
          bookings.push({...existing_template,stick: true, placeholder: false, start:date, unselectable: true});
          disabled_dates[date] = true;
      }
      day_picker.fullCalendar('renderEvents', bookings, true);
  }

  function selectEngine_addBooking(options)
  {
      let bookings = selectEngine_selectedEvents();
      selectEngine_removeBooking();

      bookings.forEach( (booking, index, bookingArr) =>{

          bookingArr[index] = {...booking, ...options, placeholder: false, stick: true};

      });
      selectEngine_unselectAll();
      day_picker.fullCalendar('renderEvents', bookings, true);

  }

  function selectEngine_removeBooking()
  {
      let bookings = selectEngine_selectedEvents();

      day_picker.fullCalendar('removeEvents', (event) => bookings.includes(event));
      selectEngine_unselectAll();
  }

  function selectEngine_unselectAll()
  {

      select_events = [];
      select_scheduleIds = [];

      day_picker.fullCalendar( 'removeEvents', function(event){
          return event.placeholder == true;
      });

  }

  function selectEngine_selectedEvents()
  {
      var events = [];

      select_events.forEach(function(select_event){
          let FCevents = day_picker.fullCalendar( 'clientEvents', function(event){
              return (select_event.start == event.start.format('YYYY-MM-DD'));
              //return (select_event.start == event.start.format('DD/MM/YYYY'));
          });

          FCevents.forEach( event => {
              events.push(event);
          });
      });

      // events.push({...existing_template,start:moment('2023-02-13').format('YYYY-MM-DD')});

      return events;
  }

  function selectEngine_getDays()
  {

      let FCevents = day_picker.fullCalendar( 'clientEvents', function(event){
          return (event.placeholder == false) && !('unselectable' in event);
      });

      let days = FCevents.map( (event) => {return {date: event.start.format('DD-MM-YYYY'), type: event.type}});
      //let days = FCevents.map( (event) => {return {date: event.start.format('DD/MM/YYYY'), type: event.type}});

      return days;
  }

  function selectEngine_updateEvents(options)
  {
      var FCevents = selectEngine_selectedEvents();

      FCevents.forEach((FCevent, index, arr) => {
          arr[index] = {...FCevent, ...options};
      });

      day_picker.fullCalendar( 'updateEvents', FCevents);
  }
//
selectEngine_prepareExistingDays();
