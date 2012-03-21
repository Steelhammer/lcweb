


<?php
class Logger {
  
  function get($id=NULL)
  {
    $commandStr = "--getlog";
    
    if (!is_null($id))
    {
      $commandStr .= " $id";
    }
    $loglines = `exec 2>&1;lccmd $commandStr`;
    
    return $loglines;
  }
}
?>
