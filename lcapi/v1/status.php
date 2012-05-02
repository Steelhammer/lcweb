<?php
class Status {
  
  function get($id=NULL)
  {
    if($id != NULL)throw new RestException(400, "No ID permitted");
    
    $cmdtime = time();
    $commandStr = "--checkforupdate ".$cmdtime;  
    $endtime = time() + 3*60;
    
    do 
    {
      $result = `exec 2>&1;lccmd $commandStr`;
      
      $result = trim($result, "\n");
      $status = explode(" - ", $result);
      
      if($status[0] != 'OK') throw new RestException(400, $status[1]);
      
      if (strtolower($status[1]) != 'no update')
      {
        return array('update' => $status[1]);
      }
      sleep(10);
    } while ($endtime > time());
    return array('update' => 'No update');
  }
}
?>
