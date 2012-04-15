<?php
class Timer {
  
  static $ADDFIELDS = array('recid', 'ontime', 'offtime', 'days', 'dimlevel');
  static $EDITFIELDS = array('ontime', 'offtime', 'days', 'dimlevel');

  function get($id=NULL)
  {
    $commandStr = "--gettimer";
    
    if (!is_null($id))
    {
      $commandStr .= " $id";
    }
    $timers = `exec 2>&1;lccmd $commandStr`;
    $timers = trim($timers, "\n");
    $timerlines = explode("\n", $timers);
    
    foreach ($timerlines as &$line)
    {
      $temp = explode("\t", $line);
      if(!intval($temp[0]))throw new RestException(404,"Timer for receiver $id");
      $line = array("id" => $temp[0],
                    "recid" => $temp[1],
                    "ontime" => $temp[2],
                    "offtime" => $temp[3],
                    "days" => $temp[4],
                    "dimlevel" => $temp[5]
                    );
    }
    return $timerlines;
  }
  
  function post($request_data=NULL)
  {
    $addparam = $this->_validate_add($request_data);
    
    $commandStr = '--addtimer '.$addparam['recid'].' "'.$addparam['ontime'].'" "'.$addparam['offtime'].'" '.$addparam['days'].' '.$addparam['dimlevel'];
    
    $result = `exec 2>&1;lccmd $commandStr`;
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return array("id" => $status[1]);
  }
  
  function put($id=NULL, $request_data=NULL)
  {
    if(is_null($id))throw new RestException(400,"ID required");
    
    $editparam = $this->_validate_edit($request_data);
    $commandStr = '--edittimer '.$id.' "'.$editparam['ontime'].'" "'.$editparam['offtime'].'" '.$editparam['days'].' '.$editparam['dimlevel'];
    
    $result = `exec 2>&1;lccmd $commandStr`;
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return array("id" => $status[1]);
  }
  
  
  function delete($id=NULL)
  {
    if(is_null($id))throw new RestException(400,"ID required");
    
    $result = `exec 2>&1;lccmd --deletetimer $id`;
    
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return array("id" => $status[1]);
  }
  
  private function _validate_add($data)
  {
    $rec=array();
    foreach (Timer::$ADDFIELDS as $field) {
//you may also vaildate the data here
      if(!isset($data[$field]))throw new RestException(417,"$field field missing");
      $rec[$field]=$data[$field];
    }
    return $rec;
  }
  
  private function _validate_edit($data)
  {
    $rec=array();
    foreach (Timer::$EDITFIELDS as $field) {
//you may also vaildate the data here
      if(!isset($data[$field]))throw new RestException(417,"$field field missing");
      $rec[$field]=$data[$field];
    }
    return $rec;
  }
}
?>
