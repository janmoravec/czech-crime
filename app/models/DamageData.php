<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
namespace Models;
/**
 * Description of Sectors
 *
 * @author petr
 */
class DamageData extends BaseModel {
    protected $table = 'DamageData';
    protected $key = 'Id';
    
    public function insert($data)
    {
        return $this->db->insert($this->table,$data)->execute();
    }
    
    public function findTotalFromArea($area,$monthFrom,$yearFrom,$monthTo,$yearTo)
    {
        return $this->db->query("SELECT SUM(Vykazovane_celkem_mesic) AS Damage FROM DamageData JOIN TimeRange ON TimeRange.Id = FK_Time_Range
            WHERE FK_Area_Lookup=%i AND ( CONCAT(Year,IF(Month < 10,0,''),Month ) >=%i%i ) AND ( CONCAT( YEAR, MONTH ) <=%i%i ) ",$area,$yearFrom,$monthFrom,$yearTo,$monthTo);
    }
      
}

?>
