<?php
   $json = $_POST['json'];
   $info = json_encode($json);

   $file = fopen('data.json','w+');
   fwrite($file, $info);
   fclose($file);
?>