//var serverURL = "http://www.your-server.com/lcweb/lcapi/v1/";
var serverURL = "http://192.168.0.5/lcweb/lcapi/v1/";

var t;

$("#mainpanel").live("swipeleft", function(){
                        
                        $.mobile.changePage("#setpage", {
                                                         transition: "slide",
                                                         reverse: false
                                                         });
                        $("#settingspanel").trigger('create');
                       });



$("#settingspanel").live("swiperight", function(){
                        $.mobile.changePage("#thepage", {
                                                         transition: "slide",
                                                         reverse: true
                                                         });
                       });

$("#mainpanel").live("swiperight", function(){
                        GetDimmerStatus();
                        $.mobile.changePage("#dimmerpage", {
                                                         transition: "slide",
                                                         reverse: true
                                                         });
                        $("#dimmerpage").trigger('create');
                        
                       });
   
                    
  

                       

function InitPage()
{
  GetReceivers();
  GetDimmers();
  GetReceiverSettings();
  
  $('#addtimeron').scroller({ preset: 'time', ampm: false, timeFormat: 'HH:ii', theme: 'sense-ui' });
  $('#addtimeroff').scroller({ preset: 'time', ampm: false, timeFormat: 'HH:ii', theme: 'sense-ui' });
   
  $('#ontimecollapse').live('collapse',function(){
      var $btn_text  = $('#ontimecollapse').find('.ui-collapsible-heading').find('.ui-btn-text');
      //$btn_child = $btn_text.find('.ui-collapsible-heading-status');
      //overwrite the header text, then append its child to restore the previous structure
      var onTimeStr = GetTimerTimestamp('addtimeron');
      
      $btn_text.text("On time: "+onTimeStr);//.append($btn_child);
      //+$('input:radio[name=addontimeformat]:checked').val()
      
      
  });
  
  $('#ontimecollapse').live('expand',function(){
      var $btn_text  = $('#ontimecollapse').find('.ui-collapsible-heading').find('.ui-btn-text');
      $btn_text.text("On time");
  });

  $('#offtimecollapse').live('collapse',function(){
      var $btn_text  = $('#offtimecollapse').find('.ui-collapsible-heading').find('.ui-btn-text');
      var offTimeStr = GetTimerTimestamp('addtimeroff');
      $btn_text.text("Off time: "+offTimeStr);
  });
  
  $('#offtimecollapse').live('expand',function(){
      var $btn_text  = $('#offtimecollapse').find('.ui-collapsible-heading').find('.ui-btn-text');
      $btn_text.text("Off time");
  });
  
}

function UpdateReceivers()
{
  GetReceivers();
  GetReceiverSettings();
}

function GetReceivers()
{           
  $.ajax({
          type: 'GET',
          url: serverURL+'receiver',
          //data: data,
          success: function(data) {GetReceiversResponse(data);},
          dataType: 'json'
         });          
}

function GetReceiversResponse(data) 
{
  //console.log(data);
  var mainP = document.getElementById("mainpanel");    
  while ( mainP.hasChildNodes() ) { mainP.removeChild(mainP.firstChild); }
  
  $.each(data, function() {
    var btn = document.createElement("a");
    btn.id=this.id;
    btn.recstatus=this.status;
    btn.isdimmer=this.isdimmer;
    btn.learned=this.learned;
    btn.setAttribute('href', '#');
    btn.onclick = RecButtonClicked;
    btn.setAttribute('data-role', 'button');
    
    if (this.status != 'Off')
    {
      btn.setAttribute("data-theme", "e");
    }
    else
    {
      btn.setAttribute("data-theme", "a");
    }
    
    if (this.learned == 0)
    {
      $(btn).addClass('ui-disabled');
    }
        
    tn = document.createTextNode(this.name);
    btn.appendChild(tn);
    
    $("#mainpanel").append(btn);
    
    
  });
  
  $("#mainpanel").trigger('create');
  
  //console.log($('.ui-page-active').attr('id'));
}


function RecButtonClicked()
{
  $(this).addClass('ui-disabled');
  var theaction = 'on';
  if (this.recstatus.toLowerCase() != 'off')
  {
    theaction = 'off';
  }
    
    $.ajax({
            type: 'PUT',
            url: serverURL+'receiver/'+this.id,
            data: {"command" : theaction},
            objid: $(this),
            success: function(data) {RecButtonClickResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {this.objid.removeClass('ui-disabled');},
            dataType: 'json'
           });

}

function RecButtonClickResponse(data)
{
  var recId = data[0].id;
  var recStatus = data[0].status;

  var recElem = document.getElementById(recId);
  recElem.recstatus=recStatus;
  var recidtag = '#'+recId;
  //console.log(recidtag);
  //console.log($(recidtag));
  
  if (recStatus.toLowerCase() != 'off')
  {
    $(recidtag).attr("data-theme", "e");
    $(recidtag).removeClass("ui-btn-up-a").removeClass("ui-btn-up-e").removeClass("ui-btn-hover-a").removeClass("ui-btn-hover-e");
    $(recidtag).addClass("ui-btn-up-e");
  }
  else
  {
    $(recidtag).attr("data-theme", "a");
    $(recidtag).removeClass("ui-btn-up-a").removeClass("ui-btn-up-e").removeClass("ui-btn-hover-a").removeClass("ui-btn-hover-e");
    $(recidtag).addClass("ui-btn-up-a");
    
  }
  $(recidtag).removeClass('ui-disabled');
}


function LearnReceiver(receiverid)
{  
    $.ajax({
            type: 'PUT',
            url: serverURL+'receiver/'+receiverid,
            data: {"command" : "learn"},
            success: function(data) {LearnReceiverResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {alert(errorThrown);},
            dataType: 'json'
           });
}

function LearnReceiverResponse(data)
{
  UpdateReceivers();
  
}

function Dimmer_not_used(btnid)
{




  $.mobile.changePage("#dimmerpage", {
                                              transition: "pop"
                                   
                                            });
  //$('#dimmerslider').slider("refresh");


}



function GetReceiverSettings()
{           
    $.ajax({
          type: 'GET',
          url: serverURL+'receiver',
          //data: data,
          success: function(data) {GetReceiversSettingsResponse(data);},
          dataType: 'json'
         });
}

function GetReceiversSettingsResponse(data) 
{
  //console.log(data);
  var mainP = document.getElementById("settingspanel");    
  while ( mainP.hasChildNodes() ) { mainP.removeChild(mainP.firstChild); }
  
  $.each(data, function() {
    
    var thePara = document.createElement("p"); 
    var recset = document.createElement("select");
    recset.id='setmenu'+this.id;
    recset.recid=this.id;
    recset.isdimmer=this.isdimmer;
    //console.log('Select id:');
    //console.log(recset.id);
    recset.recname=this.name;
    recset.onchange = SelectSetting;
    recset.setAttribute('data-native-menu', 'false');
    if (this.learned == 0)
    {
      recset.setAttribute('data-theme', 'c');
    }
    var nametxt = document.createElement("option");
    nametxt.text=this.name;
    recset.appendChild(nametxt);
    var editopt = document.createElement("option");
    editopt.text="Edit receiver";
    editopt.value="edit";
    recset.appendChild(editopt);
    var timeropt = document.createElement("option");
    timeropt.text="View / Edit timer";
    timeropt.value="timer";
    recset.appendChild(timeropt);
    var learnopt = document.createElement("option");
    learnopt.text="Learn";
    learnopt.value="learn";
    recset.appendChild(learnopt);
    var delopt = document.createElement("option");
    delopt.text="Delete receiver";
    delopt.value="delete";
    recset.appendChild(delopt);
    
    thePara.appendChild(recset);
    $("#settingspanel").append(thePara);
    //console.log($(recset));
     
    
  });
  
  var btn = document.createElement("a");

  btn.setAttribute('href', '#');
  btn.onclick = AddReceiver;
  btn.setAttribute('data-role', 'button');
  btn.setAttribute('data-icon', 'plus');
  btn.setAttribute("data-theme", "a");
  
  var tn = document.createTextNode("New receiver");
  btn.appendChild(tn);
  
  $("#settingspanel").append(btn);
  
  var logbtn = document.createElement("a");

  logbtn.setAttribute('href', '#');
  logbtn.onclick = ViewLog;
  logbtn.setAttribute('data-role', 'button');
  logbtn.setAttribute('data-icon', 'info');
  logbtn.setAttribute("data-theme", "a");
  
  var logtn = document.createTextNode("View log");
  logbtn.appendChild(logtn);
  
  $("#settingspanel").append(logbtn);
  
  //console.log($('.ui-page-active').attr('id'));

  if ($('.ui-page-active').attr('id') == 'setpage')
  {
    $("#settingspanel").trigger('create');
  }
}

function SelectSetting()
{
  switch($(this).val())
  {
  case "delete":
    DeleteReceiver(this.recid);
    break;
  case "edit":
    EditReceiver(this);
    break;
  case "timer":
    ViewTimer(this.recid);
    break;
  case "learn":
    LearnReceiver(this.recid);
    break;
  default:
    window.open("index.html", '_self')
  }
  
  
  $(this)[0].selectedIndex = 0;
  $(this).selectmenu("refresh");

}

function DeleteReceiver(receiverid)
{
  //console.log(receiverid);
  
    if(confirm("Are you sure?"))
    {
      $.ajax({
            type: 'DELETE',
            url: serverURL+'receiver/'+receiverid,
            success: function(data) {DeleteReceiverResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {alert(errorThrown);},
            dataType: 'json'
           });
    }
}

function DeleteReceiverResponse(data) 
{
  UpdateReceivers();
}


function EditReceiver(thisrec)
{  
  $("#editreceiverpage").data('recId', thisrec.recid);
  $("#editreceiverpage").data('isdimmer', thisrec.isdimmer);
  $("#editrecname").val(thisrec.recname);
   
  $('#recisdimmer').val(thisrec.isdimmer);
  
  
  //console.log($("#editreceiverpage").data('recId'));
  
  $.mobile.changePage("#editreceiverpage", {
                                              transition: "pop"
                                   
                                            });
  $('#recisdimmer').slider("refresh");
}

function DoEditReceiver()
{
  var receiverid = $("#editreceiverpage").data('recId');
  var recname = $("#editrecname").val();
  var isdimmer = $("#recisdimmer").val();
 
  //console.log(receiverid);
  //console.log(recname);
  //console.log(isdimmer);
    
   $.ajax({
            type: 'PUT',
            url: serverURL+'receiver/'+receiverid,
            data: {"name" : recname, "isdimmer" : isdimmer},
            success: function(data) {DoEditReceiverResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {alert('Receiver name must be unique');},
            dataType: 'json'
           });

}


function DoEditReceiverResponse(data)
{
  UpdateReceivers();
}


function AddReceiver()
{
  $("#addrecname").val('');
   
  $("#addrecisdimmer").val('0');
  
  $.mobile.changePage("#addreceiverpage", {
                                              transition: "pop"
                                   
                                            });
                                            
  $('#addrecisdimmer').slider("refresh");
}


function AddTimer()
{
  $("#edittimerheading").text('New timer');

  $("#addtimeron").val("12:00");
  $("#addtimeronoffset").val(0);
  $("#addtimerdimlevel").val(0);
  $("#ontimecollapse").trigger('collapse');
  
  $("#addtimeroff").val("12:00");
  $('#addofftime-time').attr('checked',true);
  $("#addtimeroffoffset").val(0);
  $("#offtimecollapse").trigger('collapse');
  
  $('input[name=addcheckbox-mo]').attr('checked', false);
  $('input[name=addcheckbox-tu]').attr('checked', false);
  $('input[name=addcheckbox-we]').attr('checked', false);
  $('input[name=addcheckbox-th]').attr('checked', false);
  $('input[name=addcheckbox-fr]').attr('checked', false);
  $('input[name=addcheckbox-sa]').attr('checked', false);
  $('input[name=addcheckbox-su]').attr('checked', false);
  
  $('#addedittimerokbtn').unbind('click');
  $('#addedittimerokbtn').click(function() { DoAddTimer();});
  
  var theNewBtn = document.getElementById("addtimerbutton");
  var recid = theNewBtn.getAttribute('recid');
  $('#addedittimercancelbtn').unbind('click');
  $('#addedittimercancelbtn').click(function() { GetTimers(recid);});
  
    
  $.mobile.changePage("#addtimerpage", {
                                              transition: "pop"
                                   
                                            });
                                            
  //$('#addontime-time').checkboxradio("refresh");
  $('#addcheckbox-mo').checkboxradio("refresh");
  $('#addcheckbox-tu').checkboxradio("refresh");
  $('#addcheckbox-we').checkboxradio("refresh");
  $('#addcheckbox-th').checkboxradio("refresh");
  $('#addcheckbox-fr').checkboxradio("refresh");
  $('#addcheckbox-sa').checkboxradio("refresh");
  $('#addcheckbox-su').checkboxradio("refresh");  
}

function AddTimerOnSunrise()
{
  $("#addtimeron").val("SUNRISE");
}

function AddTimerOnSunset()
{
  $("#addtimeron").val("SUNSET");
}

function AddTimerOffSunrise()
{
  $("#addtimeroff").val("SUNRISE");
}

function AddTimerOffSunset()
{
  $("#addtimeroff").val("SUNSET");
}

function DoAddTimer()
{
  var onTimeStr = GetTimerTimestamp('addtimeron');
  var dimLvl = $("#addtimerdimlevel").val();
  var offTimeStr = GetTimerTimestamp('addtimeroff');
  var theNewBtn = document.getElementById("addtimerbutton");
  var recid = theNewBtn.getAttribute('recid');
  var days = '';
  if ($('input[name=addcheckbox-mo]').is(':checked'))
  {
    days = days + '1';
  }
  if ($('input[name=addcheckbox-tu]').is(':checked'))
  {
    days = days + '2';
  }
  if ($('input[name=addcheckbox-we]').is(':checked'))
  {
    days = days + '3';
  }
  if ($('input[name=addcheckbox-th]').is(':checked'))
  {
    days = days + '4';
  }
  if ($('input[name=addcheckbox-fr]').is(':checked'))
  {
    days = days + '5';
  }
  if ($('input[name=addcheckbox-sa]').is(':checked'))
  {
    days = days + '6';
  }
  if ($('input[name=addcheckbox-su]').is(':checked'))
  {
    days = days + '7';
  }
  
  $.ajax({
            type: 'POST',
            url: serverURL+'timer/',
            data: {"recid" : recid, "ontime" : onTimeStr, "offtime" : offTimeStr, "days" : days, "dimlevel" : dimLvl},

            success: function(data) {DoAddTimerResponse(data, recid);},
            error: function(jqXHR, textStatus, errorThrown) {alert(textStatus);},
            dataType: 'json'
           });
}

function DoAddTimerResponse(data, recid)
{
  GetTimers(recid);
}

function EditTimer(timercontainerid)
{
  var timerContainer = document.getElementById(timercontainerid);
  
  var timerid = timerContainer.timid;
  var recid = timerContainer.recid;
  var onTempTime = GetTimeStampComponents(timerContainer.ontime);
  var onTimeTime = onTempTime[0];
  var onTimeOffset = onTempTime[1];
  var dimLvl = timerContainer.dimlvl;
  var offTempTime = GetTimeStampComponents(timerContainer.offtime);
  var offTimeTime = offTempTime[0];
  var offTimeOffset = offTempTime[1];
  var days = timerContainer.days;
  
  $("#edittimerheading").text('Edit timer');
  
  $("#addtimeron").val(onTimeTime);
  $("#addtimeronoffset").val(onTimeOffset);
  $("#addtimerdimlevel").val(dimLvl);
  $("#ontimecollapse").trigger('collapse');
  
  $("#addtimeroff").val(offTimeTime);
  $("#addtimeroffoffset").val(offTimeOffset);
  $("#offtimecollapse").trigger('collapse');
  
  $('input[name=addcheckbox-mo]').attr('checked', false);
  $('input[name=addcheckbox-tu]').attr('checked', false);
  $('input[name=addcheckbox-we]').attr('checked', false);
  $('input[name=addcheckbox-th]').attr('checked', false);
  $('input[name=addcheckbox-fr]').attr('checked', false);
  $('input[name=addcheckbox-sa]').attr('checked', false);
  $('input[name=addcheckbox-su]').attr('checked', false);
  if (days.search(/1/)>=0)
  {
    $('input[name=addcheckbox-mo]').attr('checked', true);
  }
  if (days.search(/2/)>=0)
  {
    $('input[name=addcheckbox-tu]').attr('checked', true);
  }
  if (days.search(/3/)>=0)
  {
    $('input[name=addcheckbox-we]').attr('checked', true);
  }
  if (days.search(/4/)>=0)
  {
    $('input[name=addcheckbox-th]').attr('checked', true);
  }
  if (days.search(/5/)>=0)
  {
    $('input[name=addcheckbox-fr]').attr('checked', true);
  }
  if (days.search(/6/)>=0)
  {
    $('input[name=addcheckbox-sa]').attr('checked', true);
  }
  if (days.search(/7/)>=0)
  {
    $('input[name=addcheckbox-su]').attr('checked', true);
  }
  
  $('#addedittimerokbtn').unbind('click');
  $('#addedittimerokbtn').click(function() { DoEditTimer(timerid);});
  
  var theNewBtn = document.getElementById("addtimerbutton");
  var recid = theNewBtn.getAttribute('recid');
  $('#addedittimercancelbtn').unbind('click');
  $('#addedittimercancelbtn').click(function() { GetTimers(recid);});
    
  $.mobile.changePage("#addtimerpage", {
                                              transition: "pop"
                                   
                                            });
                                            
  $('#addcheckbox-mo').checkboxradio("refresh");
  $('#addcheckbox-tu').checkboxradio("refresh");
  $('#addcheckbox-we').checkboxradio("refresh");
  $('#addcheckbox-th').checkboxradio("refresh");
  $('#addcheckbox-fr').checkboxradio("refresh");
  $('#addcheckbox-sa').checkboxradio("refresh");
  $('#addcheckbox-su').checkboxradio("refresh");
}

function DoEditTimer(timerid)
{
  var onTimeStr = GetTimerTimestamp('addtimeron');
  var dimLvl = $("#addtimerdimlevel").val();
  var offTimeStr = GetTimerTimestamp('addtimeroff');
  var theNewBtn = document.getElementById("addtimerbutton");
  var recid = theNewBtn.getAttribute('recid');
  var days = '';
  if ($('input[name=addcheckbox-mo]').is(':checked'))
  {
    days = days + '1';
  }
  if ($('input[name=addcheckbox-tu]').is(':checked'))
  {
    days = days + '2';
  }
  if ($('input[name=addcheckbox-we]').is(':checked'))
  {
    days = days + '3';
  }
  if ($('input[name=addcheckbox-th]').is(':checked'))
  {
    days = days + '4';
  }
  if ($('input[name=addcheckbox-fr]').is(':checked'))
  {
    days = days + '5';
  }
  if ($('input[name=addcheckbox-sa]').is(':checked'))
  {
    days = days + '6';
  }
  if ($('input[name=addcheckbox-su]').is(':checked'))
  {
    days = days + '7';
  }

  $.ajax({
            type: 'PUT',
            url: serverURL+'timer/'+timerid,
            data: {"ontime" : onTimeStr, "offtime" : offTimeStr, "days" : days, "dimlevel" : dimLvl},
            success: function(data) {DoEditTimerResponse(data, recid);},
            error: function(jqXHR, textStatus, errorThrown) {alert(textStatus);},
            dataType: 'json'
           });
}

function DoEditTimerResponse(data, recid)
{
  GetTimers(recid);
}

function GetTimers(receiverid)
{
  SetTimerTitle(receiverid);      
  var theNewBtn = document.getElementById("addtimerbutton");
  theNewBtn.setAttribute('recid', receiverid);
  var mainP = document.getElementById("timerpanel");    
  while ( mainP.hasChildNodes() ) { mainP.removeChild(mainP.firstChild); }
    $.ajax({
          type: 'GET',
          url: serverURL+'timer/'+receiverid,
          //data: data,
          success: function(data) {GetTimersResponse(data, receiverid);},
          dataType: 'json'
         });
}

function GetTimersResponse(data, receiverid)
{
  //console.log(data);
  
  var theNav = document.createElement("div");
  theNav.setAttribute('data-role', 'navbar');
  $(theNav).addClass('ui-body-a');
  var ulist = document.createElement("ul");
  theNav.appendChild(ulist);
  $(ulist).append('<li><a href="#">On</a> </li>'); 
  $(ulist).append('<li><a href="#">Off</a> </li>');
  $(ulist).append('<li><a href="#">Days</a> </li>');
  $(ulist).append('<li><a href="#">Dimlevel</a> </li>');
  $(ulist).append('<li><a href="#">&nbsp;</a> </li>');
  $("#timerpanel").append(theNav); 
    
  ulist.recid=this.recid;
  
  $.each(data, function() {
    //console.log('Creating timer');
  
    var theNav = document.createElement("div");
    theNav.setAttribute('data-role', 'navbar');
    $(theNav).addClass('ui-body-b');
    var ulist = document.createElement("ul");
    ulist.id='navbar'+this.id;
    ulist.timid=this.id;
    ulist.ontime=this.ontime;
    ulist.dimlvl=this.dimlevel;
    ulist.offtime=this.offtime;
    ulist.days=this.days;
    ulist.recid=receiverid;
    //console.log(this.id);
    theNav.appendChild(ulist);
    var idstr='#'+ulist.id;
    $(ulist).append('<li><a href="#" onClick="EditTimer(\''+ulist.id+'\')">' + this.ontime + '</a> </li>'); 
    $(ulist).append('<li><a href="#" onClick="EditTimer(\''+ulist.id+'\')">' + this.offtime + '</a> </li>');
    $(ulist).append('<li><a href="#" onClick="EditTimer(\''+ulist.id+'\')">' + this.days + '</a> </li>');
    $(ulist).append('<li><a href="#" onClick="EditTimer(\''+ulist.id+'\')">' + this.dimlevel + '</a> </li>');
    $(ulist).append('<li><a href="#" onClick="DeleteTimer('+this.id+','+receiverid+')" data-theme="a">Delete</a> </li>');
    $("#timerpanel").append(theNav);     
    
  });
  
  
  $("#timerpanel").trigger('create');

  //if ($('.ui-page-active').attr('id') == 'timerpage')
  //{
  //    
  //}
}

function ViewTimer(recid)
{
  GetTimers(recid);
  $.mobile.changePage("#timerpage", {
                                              transition: "pop"
                                   
                                            }); 
}

function FromTimerToSettings()
{
  
  $.mobile.changePage("#setpage", {
                                   transition: "pop"
                                   });
  GetReceiverSettings();                           
  
}


function DeleteTimer(timid, receiverid)
{
  if(confirm("Are you sure?"))
  {
    $.ajax({
          type: 'DELETE',
          url: serverURL+'timer/'+timid,
          success: function(data) {DeleteTimerResponse(data, receiverid);},
          error: function(jqXHR, textStatus, errorThrown) {alert(errorThrown);},
          dataType: 'json'
         });
  }
  else
  {
    GetTimers(receiverid);
  }
}

function DeleteTimerResponse(data, receiverid)
{
  GetTimers(receiverid);
}




function DoAddReceiver()
{
  var recname = $("#addrecname").val();
  var isdimmer = $("#addrecisdimmer").val();
  
  //console.log(receiverid);
  //console.log(recname);
  //console.log(isdimmer);
    
   $.ajax({
            type: 'POST',
            url: serverURL+'receiver/',
            data: {"name" : recname, "isdimmer" : isdimmer},

            success: function(data) {DoAddReceiverResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {alert('Receiver name must be unique');},
            dataType: 'json'
           });

}


function DoAddReceiverResponse(data)
{
  UpdateReceivers();
  
}


function GetDimmers()
{           
  $.ajax({
          type: 'GET',
          url: serverURL+'receiver',
          //data: data,
          success: function(data) {GetDimmersResponse(data);},
          dataType: 'json'
         });          
}

function GetDimmersResponse(data) 
{
  //console.log('Creating dimmers');
  var dimP = document.getElementById("dimmerpanel");    
  while ( dimP.hasChildNodes() ) { dimP.removeChild(dimP.firstChild); }
  
  $.each(data, function() {
    if (this.isdimmer == 1)
    {
      var dimlabel = document.createElement("label"); 
      dimlabel.setAttribute('for', 'dimslid'+this.id);
      $(dimlabel).addClass('dimslide');
      tn = document.createTextNode(this.name);
      dimlabel.appendChild(tn);
      $("#dimmerpanel").append(dimlabel);
    
    
      var dimLvl = 0;
      if (this.status == 'On')
      {
        dimLvl = 15;
      }
      else if (this.status == 'Off')
      {
        dimLvl = 0;
      }
      else
      {
        var temp = this.status;
        temp = temp.replace("Dimmed: ", "");
        dimLvl = temp;
         //console.log(temp);
      }
    
    
      var slid = document.createElement("input");
      
      slid.id='dimslid'+this.id;
      slid.type='range';
      slid.curvalue=dimLvl;
      slid.setAttribute('min', '0');
      slid.setAttribute('max', '15');
      slid.setAttribute('value', dimLvl);
      slid.setAttribute('onchange', 'DimReceiver(this)');
      
      //$(slid).slider();
      $("#dimmerpanel").append(slid);
      
    }
    });
    
    
  if ($('.ui-page-active').attr('id') == 'dimmerpage')
  {
    $("#dimmerpanel").trigger('create');
  }
  
  //console.log($('.ui-page-active').attr('id'));
}




function DimReceiver(dimmer)
{
  if (dimmer.curvalue != $(dimmer).val())
  {
    var newVal = $(dimmer).val(); 
    
    dimmer.curvalue = newVal;
    clearTimeout(t);
    t=setTimeout(function(){DoDimReceiver(dimmer)}, 200);
  }
}

function DoDimReceiver(dimmer)
{
  var dimlevel = dimmer.curvalue;
  var temp = dimmer.id;
  temp = temp.replace("dimslid", "");
  var receiverid = temp;

  //console.log(receiverid);
  //console.log(dimlevel);  
  
  
   $.ajax({
            type: 'PUT',
            url: serverURL+'receiver/'+receiverid,
            data: {"command" : "DIM", "level" : dimlevel},
            success: function(data) {DoDimReceiverResponse(data);},
            error: function(jqXHR, textStatus, errorThrown) {alert(errorThrown);},
            dataType: 'json'
           });

}


function DoDimReceiverResponse(data)
{
  var receiverid = data[0].id;
  var status = data[0].status;
  
  //console.log(receiverid);
  //console.log(status);

  //UpdateReceivers();
  
}




function GetDimmerStatus()
{           
  $.ajax({
          type: 'GET',
          url: serverURL+'receiver',
          //data: data,
          success: function(data) {GetDimmerStatusResponse(data);},
          dataType: 'json'
         });          
}

function GetDimmerStatusResponse(data) 
{
  //console.log('Updating dimmers');
  
  $.each(data, function() {
    if (this.isdimmer == 1)
    {
      var dimLvl = 0;
      if (this.status == 'On')
      {
        dimLvl = 15;
      }
      else if (this.status == 'Off')
      {
        dimLvl = 0;
      }
      else
      {
        var temp = this.status;
        temp = temp.replace("Dimmed: ", "");
        dimLvl = temp;
        //console.log(temp);
      }
      var idstr='#dimslid'+this.id;
      
      if ($(idstr).val() != dimLvl)
      {
        $(idstr).val(dimLvl);
        $(idstr).slider("refresh");
      }
    }
    });
}


function GetReceiverStatus()
{           
  $.ajax({
          type: 'GET',
          url: serverURL+'receiver',
          //data: data,
          success: function(data) {GetReceiverStatusResponse(data);},
          dataType: 'json'
         });          
}

function GetReceiverStatusResponse(data) 
{
  
  $.each(data, function() {
    var idstr='#'+this.id;
    
    var theBtn = document.getElementById(this.id);
    
    theBtn.recstatus=this.status;
    //console.log(theBtn.recstatus); 
    
    
    if (this.status.toLowerCase() != 'off')
    {
      $(idstr).attr("data-theme", "e");
      $(idstr).removeClass("ui-btn-up-a").removeClass("ui-btn-up-e").removeClass("ui-btn-hover-a").removeClass("ui-btn-hover-e");
      $(idstr).addClass("ui-btn-up-e");
    }
    else
    {
      $(idstr).attr("data-theme", "a");
      $(idstr).removeClass("ui-btn-up-a").removeClass("ui-btn-up-e").removeClass("ui-btn-hover-a").removeClass("ui-btn-hover-e");
      $(idstr).addClass("ui-btn-up-a");
      
    }
  });
}


function FromDimToMain()
{
  GetReceiverStatus();
  $.mobile.changePage("#thepage", {
                                   transition: "slide",
                                   reverse: false
                                   });
}


function SetTimerTitle(recid)
{
  $.ajax({
          type: 'GET',
          url: serverURL+'receiver/'+recid,
          //data: data,
          success: function(data) {$("#timerpageheading").text("Timers: "+data[0].name);},
          dataType: 'json'
         });  
}

function ViewLog()
{           
  $.ajax({
          type: 'GET',
          url: serverURL+'logger/25',
          //data: data,
          success: function(data) {ViewLogResponse(data);},
          dataType: 'json'
         });          
}

function ViewLogResponse(data) 
{
  var logText = data.log;
  
  var logP = document.getElementById("viewlogpanel");    
  while ( logP.hasChildNodes() ) { logP.removeChild(logP.firstChild); }
  
  $("#viewlogpanel").append("<pre>" + logText + "</pre>");
  $("#viewlogpanel").append('<a href="#" data-role="button" data-inline="true" data-rel="back">OK</a>');
  
  
  $.mobile.changePage("#viewlogpage", {
                                   transition: "slidedown"
                                   });
                                   
  $("#viewlogpanel").trigger('create');
}



function GetTimerTimestamp(timeid)
{
  var maintime = "#"+timeid;
  var offset = maintime+"offset"; 
  var maintimerstr = $(maintime).val();
  var offset = $(offset).val();
  var offsetstr = "";
  
  if (maintimerstr=="SUNSET" || maintimerstr=="SUNRISE")
  {
    if (offset > 0)
    {
      offsetstr = '+'+offset;
    }
    else if (offset < 0)
    {
      offsetstr = offset;
    }
  }
  else
  {
    offset = Math.abs(offset);
    if (offset > 0)
    {
      offsetstr = 'R'+offset;
    }
  }
  maintimerstr = maintimerstr+offsetstr;
  
  return maintimerstr;
}

function GetTimeStampComponents(timeStampStr)
{
  var mstr = timeStampStr.match(/(\d{1,2}:\d\d|SUNRISE|SUNSET)(\+|-|R|)(\d*)/i)
  
  var fixTime = mstr[1];
  var offset = "0";
  if (mstr[3] != "")
  {
    offset = "";
    if (mstr[2] == "-")
    {
      offset = "-";
    }
    offset = offset + mstr[3];
  }
  return [fixTime, offset];
}


