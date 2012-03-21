<?php
class Receiver {
  
  static $FIELDS = array('name', 'isdimmer');
  #static $ACTION = 'command';

  function get($id=NULL)
  {
    $commandStr = "--getreceiver";
    
    if (!is_null($id))
    {
      $commandStr .= " $id";
    }
    $recs = `exec 2>&1;lccmd $commandStr`;
    $recs = trim($recs, "\n");
    $reclines = explode("\n", $recs);
    
    foreach ($reclines as &$line)
    {
      $temp = explode("\t", $line);
      if(!intval($temp[0]))throw new RestException(404,"Receiver $id");
      $line = array("id" => $temp[0],
                    "name" => $temp[1],
                    "house" => $temp[2],
                    "unit" => $temp[3],
                    "isdimmer" => $temp[4],
                    "status" => $temp[5],
                    "learned" => $temp[6]);
    }
    return $reclines;
  }
  
  function post($request_data=NULL)
  {
    $addparam = $this->_validate_edit($request_data);
    
    $commandStr = '--addreceiver "'.$addparam['name'].'" '.$addparam['isdimmer'];
    
    $result = `exec 2>&1;lccmd $commandStr`;
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return $this->get($status[1]);
  }
  
  function put($id=NULL, $request_data=NULL)
  {
    if(is_null($id))throw new RestException(400,"ID required");
    
    $commandStr = '';
    
    if (isset($request_data['command']))
    {
      $theCmd = strtoupper($request_data['command']);
      if ($theCmd == 'ON')
      {
        $commandStr .= '--on '.$id;
      }
      elseif ($theCmd == 'OFF')
      {
        $commandStr .= '--off '.$id;
      }
      elseif ($theCmd == 'LEARN')
      {
        $commandStr .= '--learn '.$id;
      }
      elseif ($theCmd == 'DIM')
      {
        if(!isset($request_data['level']))throw new RestException(400,"DIM command requires 'level'");
        $commandStr .= '--dim '.$id.' '.$request_data['level'];
      }
      else
      {
        throw new RestException(400,"Invalid command for receiver");
      }
    }
    else
    {
      $editparam = $this->_validate_edit($request_data);
      $commandStr .= '--editreceiver '.$id.' "'.$editparam['name'].'" '.$editparam['isdimmer'];
    }
    
    $result = `exec 2>&1;lccmd $commandStr`;
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return $this->get($status[1]);
  }
  
  
  function delete($id=NULL)
  {
    if(is_null($id))throw new RestException(400,"ID required");
    
    $result = `exec 2>&1;lccmd --deletereceiver $id`;
    
    $result = trim($result, "\n");
    $status = explode(" - ", $result);
    
    if($status[0] != 'OK')throw new RestException(400, $status[1]);
    
    return $status[1];
  }
  
  private function _validate_edit($data)
  {
    $rec=array();
    foreach (Receiver::$FIELDS as $field) {
//you may also vaildate the data here
      if(!isset($data[$field]))throw new RestException(417,"$field field missing");
      $rec[$field]=$data[$field];
    }
    return $rec;
  }
}
?>
