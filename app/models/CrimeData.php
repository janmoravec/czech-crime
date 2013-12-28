<?php

/* TODO 
*
*   put stuff to variables ?
*/


/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
namespace Models;

use Nette\Diagnostics\Debugger;


/**
 * Description of Sectors
 *
 * @author petr
 */
class CrimeData extends BaseModel {
    protected $table = 'CrimeData';
    protected $key = 'Id';
    
    public function insert($data)
    {
        return $this->db->insert($this->table,$data)->execute();
    }
    
    //getDataByAreaAndTime - group by crimetype
    public function getAreaCrimes( $area, $timeFrom, $timeTo, $crimeTypes )
    {
        $query = "SELECT AreaLookup.Name, 
                         Sum( Found ) as FoundSum, 
                         Sum( Solved ) as SolvedSum, 
                         FK_Crime_Lookup, 
                         Population, 
                         Sum( `Damage-total` ) as `Damage-total`, 
                         Area,
                         CrimeLookup.Name as CrimeName,
                         CrimeLookup.Name_en as CrimeName_en,
                         Contact_address, 
                         Contact_phone, 
                         Contact_fax, 
                         Contact_mail  
                FROM CrimeData, AreaLookup, CrimeLookup
                WHERE FK_Area_Lookup = '" .$area. "'
                AND FK_Time_Lookup >= " .$timeFrom. " AND FK_Time_Lookup <= " .$timeTo. "
                AND FK_Crime_Lookup IN ( " .$crimeTypes. " ) 
                AND CrimeData.FK_Area_Lookup = AreaLookup.Code
                AND CrimeData.FK_Crime_Lookup = CrimeLookup.Code
                GROUP BY FK_Crime_Lookup";

        return $this->db->query( $query );
    }

    public function getAllCrimeTypesForArea( $area, $timeFrom, $timeTo )
    {
        $query = "SELECT AreaLookup.Name, 
                         Sum( Found ) as FoundSum, 
                         Sum( Solved ) as SolvedSum, 
                         FK_Crime_Lookup, 
                         Population, 
                         `Damage-total`, 
                         Area,
                         CrimeLookup.Name as CrimeName,
                         CrimeLookup.Name_en as CrimeName_en
                FROM CrimeData, AreaLookup, CrimeLookup
                WHERE FK_Area_Lookup = '" .$area. "'
                AND FK_Time_Lookup >= " .$timeFrom. " AND FK_Time_Lookup <= " .$timeTo. "
                AND CrimeData.FK_Area_Lookup = AreaLookup.Code
                AND CrimeData.FK_Crime_Lookup = CrimeLookup.Code
                GROUP BY FK_Crime_Lookup";

        return $this->db->query( $query );
    }
    
    //TODO - need to modify the check for every filter
    public function getAreaTotal( $area, $timeFrom, $timeTo, $crimeTypes )
    {
        $query = "SELECT Name, Sum( Found ) as FoundSum, ( ( Sum( Found ) / Population ) * 10000 ) as I 
        FROM CrimeData, AreaLookup 
        WHERE FK_Area_Lookup = '" .$area. "'
        AND FK_Time_Lookup >= " .$timeFrom. " AND FK_Time_Lookup <= " .$timeTo. "
        AND FK_Crime_Lookup IN ( " .$crimeTypes. " )
        AND CrimeData.FK_Area_Lookup = AreaLookup.Code 
        GROUP BY FK_Area_Lookup";

        //Debugger::log('getAreaTotal'); 
        //Debugger::log( $query ); 
               
        return $this->db->query( $query );
    }
    
    public function getTimeline( $crimeTypes )
    {
        $query = "SELECT Sum( Found ) as FoundSum, FK_Time_Lookup, Year, Month FROM CrimeData, TimeLookup 
                    WHERE FK_Area_Lookup = '0'
                    AND FK_Crime_Lookup IN ( " .$crimeTypes. " )
                    AND CrimeData.FK_Time_Lookup = TimeLookup.Id
                    GROUP BY FK_Time_Lookup";

        //Debugger::log( "getTimeline" );
        //Debugger::log( $query );

        return $this->db->query( $query );
    }
    

    /**
    *   get total sum of crimes ( crimetype 101-903 ), group by areas in selected time
    **/

    public function getAreasTotal( $zoomLevel, $timeFrom, $timeTo )
    {   
        $query = "SELECT FK_Area_Lookup, AreaLookup.Code, AreaLookup.Name, Population, SUM( Found ) as FoundSum 
                FROM CrimeData, AreaLookup, CrimeLookup
                WHERE AreaLookup.AreaLevel = ".$zoomLevel ." 
                AND FK_Time_Lookup >= " .$timeFrom. " AND FK_Time_Lookup <= " .$timeTo. "  
                AND FK_Crime_Lookup IN ( '101-903' )
                AND CrimeData.FK_Area_Lookup = AreaLookup.Code
                AND CrimeData.FK_Crime_Lookup = CrimeLookup.Code
                GROUP BY FK_Area_Lookup";

        //Debugger::log( "getAreasTotal" );
        //Debugger::log( $query );

        return $this->db->query( $query );
    }


    /**
    *   get total sum of crimes for selected crimetypes 
    **/

    public function getAreasTotalForCrimeTypes( $zoomLevel, $timeFrom, $timeTo, $crimeTypes )
    {   
        $query = "SELECT FK_Area_Lookup, AreaLookup.Code, AreaLookup.Name, Population, SUM( Found ) as FoundSum, Population 
                FROM CrimeData, AreaLookup, CrimeLookup
                WHERE AreaLookup.AreaLevel = ".$zoomLevel ."
                AND FK_Time_Lookup >= " .$timeFrom. " AND FK_Time_Lookup <= " .$timeTo. "  
                AND FK_Crime_Lookup IN ( " .$crimeTypes. " )
                AND CrimeData.FK_Area_Lookup = AreaLookup.Code
                AND CrimeData.FK_Crime_Lookup = CrimeLookup.Code
                GROUP BY FK_Area_Lookup";

        //Debugger::log( "getAreasTotalForCrimeTypes" );
        //Debugger::log( $query );

        return $this->db->query( $query );
    }

    public function findTimeRange()
    {
        //return array( "Min" => 18, "Max" => 111 );
        return $this->db->query( 'SELECT MIN( FK_Time_Lookup ) as Min, MAX(FK_Time_Lookup) as Max FROM CrimeData' );
    }

    public function getTimeById( $fk_time_lookup )
    {   
        $sql = 'SELECT Id as FK_Time_Lookup, Year, Month 
                                  FROM TimeLookup
                                  WHERE Id = "' .$fk_time_lookup. '"';

        //Debugger::log( "getTimeById" );
        //Debugger::log( $sql );

        return $this->db->query( $sql );
    }

    public function getTimeRangesForMixMax( $min, $max )
    {
        return $this->db->query( 'SELECT Id, Month,Year FROM TimeLookup WHERE Id >= ' .$min. ' AND Id <= ' .$max. ' ORDER BY Id' );
    } 

    public function getDisplayableCrimeTypes()
    {
        return $this->db->query( 'SELECT * FROM CrimeLookup  WHERE isNotDisplayable = 0 ORDER BY SortIndex' );
    }     

    /**
    *   get ranking of all units in current level for one selected crime type
    **/

    public function getRankingsForCrimeType( $zoomLevel, $crimeType, $timeFrom, $timeTo )
    {   
        $sql = 'SELECT AreaLookup.Code, AreaLookup.Name, Population, SUM( Found ) as FoundSum, SUM( Solved ) as SolvedSum
                FROM CrimeData, AreaLookup, CrimeLookup
                WHERE AreaLookup.AreaLevel = "'.$zoomLevel .'"
                AND FK_Time_Lookup >= "' .$timeFrom. '" AND FK_Time_Lookup <= "' .$timeTo. '"  
                AND FK_Crime_Lookup = "' .$crimeType. '"
                AND CrimeData.FK_Area_Lookup = AreaLookup.Code
                AND CrimeData.FK_Crime_Lookup = CrimeLookup.Code
                GROUP BY FK_Area_Lookup';

        //Debugger::log( "getRankingsForCrimeType" );
        //Debugger::log( $sql );

        return $this->db->query( $sql );
 
    }
   
    public function getGraphData( $area, $timeFrom, $timeTo, $crimeTypes )
    {
        $query = "SELECT FK_Time_Lookup, FK_Crime_Lookup, Found, Solved, Month, Year FROM CrimeData, TimeLookup
                  WHERE FK_Area_Lookup = '" .$area. "'
                  AND FK_Crime_Lookup IN ( " .$crimeTypes. " )
                  AND FK_Time_Lookup = TimeLookup.Id";

        //Debugger::log( "getGraphData" );
        //Debugger::log( $query );

        return $this->db->query( $query );
    }

    public function getExcludedIds( $yearFrom, $monthFrom, $yearTo, $monthTo )
    {   
        $query = 'SELECT ExcludedIds FROM TimeRange 
                WHERE (CONCAT(Year,IF(Month < 10,0,""),Month) ='.$yearTo.$monthTo.')';
        
        return $this->db->query( $query );
    }

    //for data browser
    public function findCrime($id)
    {
        return $this->db->query('SELECT * FROM CrimeLookup WHERE Id=%i',$id);
    }

    public function getCrimes()
    {
        return $this->db->query('SELECT * FROM CrimeLookup ORDER BY SortAllIndex' );
    }

    public function getCrimesForOverview()
    {
        return $this->db->query('SELECT * FROM CrimeLookup WHERE Code != "101-903" AND Code != "101-690" ORDER BY SortAllIndex' );
    }

    public function getAreaGeometry( $zoomLevel )
    {
        $sql = 'SELECT * FROM AreaLookup WHERE AreaLevel = ' .$zoomLevel;
        return $this->db->query( $sql );
    }

    public function getAreasForZoomLevel( $zoomLevel ) 
    {
        $sql = 'SELECT Code, Name, Population FROM AreaLookup WHERE AreaLevel = ' .$zoomLevel;
        return $this->db->query( $sql );
    }

    public function getAreaByCode( $code ) 
    {
        $sql = 'SELECT Code, Name, Population, Area, Contact_address, Contact_phone, Contact_fax, Contact_mail FROM AreaLookup WHERE Code = "' .$code. '"';
        return $this->db->query( $sql );
    }

    public function getContact( $area )
    {
        $sql = 'SELECT Contact_address, Contact_phone, Contact_fax, Contact_mail FROM AreaLookup WHERE Id = ' .$area;
        return $this->db->query( $sql );
    }

    //api 
    public function getApiAreas( $level = null ) {

        if( isset( $level ) ) {
            $sql = 'SELECT Code, Name, AreaLevel FROM AreaLookup WHERE AreaLevel = ' .$level;
        } else {
            $sql = 'SELECT Code, Name, AreaLevel FROM AreaLookup';
        }

        return $this->db->query( $sql );

    }
    public function getApiAreaDetail( $code ) {
        
        $sql = 'SELECT * FROM AreaLookup WHERE Code = ' .$code ;
        return $this->db->query( $sql );

    }

    public function getApiCrimeTypes() {

        $sql = 'SELECT Code, Name, Name_en FROM CrimeLookup ORDER BY SortAllIndex' ;
        return $this->db->query( $sql );

    }
    public function getApiCrimeTypeDetail( $code ) {

        $sql = 'SELECT Code, Name, Name_en FROM CrimeLookup WHERE Code = ' . $code ;
        return $this->db->query( $sql );

    }

    public function getApiTimes() {

        $sql = 'SELECT * FROM TimeLookup ORDER BY Id';
        return $this->db->query( $sql );

    }
    public function getApiTimeDetail( $id ) {

        $sql = 'SELECT * FROM TimeLookup WHERE Id = ' . $id ;
        return $this->db->query( $sql );

    }

    public function getApiCrimes( $areaId = null, $crimeTypes = null, $timeFrom = null, $timeTo = null, $groupByArea = true ) {

        $areaCondition = "";
        $timesCondition = "";
        $crimeTypesCondition = "";

        $sql = 'SELECT AreaLookup.Code, AreaLookup.Name, Population, Sum( Found ) as FoundSum, Sum( Solved ) as SolvedSum, ( ( Sum( Found ) / Population ) * 10000 ) as CriminalityIndex 
                   FROM CrimeData, AreaLookup
                   WHERE';

        if( isset( $areaId ) ) {
            $sql .=  ' FK_Area_Lookup = ' . $areaId;
        }

        if( isset( $crimeTypes ) ) {

            if( isset( $areaId ) ) {
                $sql .= ' AND';
            }

            $crimeTypesArr = explode( ",", $crimeTypes );
            $crimeTypesString = "";
            foreach( $crimeTypesArr as $crimeType ) {
                //add comma if not first number
                if( $crimeTypesString != "" ) $crimeTypesString .= ",";
                $crimeTypesString .= "'" . $crimeType . "'"; 
            }
            
            $sql .= ' FK_Crime_Lookup IN ( ' .$crimeTypesString. ' ) ';
                
        }

        if( isset( $timeFrom ) ) {

            if( isset( $areaId ) || isset( $crimeTypes ) ) {
                $sql .= ' AND';
            }
            
            $sql .= ' FK_Time_Lookup >= "' . $timeFrom . '"';
                
        }

        if( isset( $timeTo ) ) {

            if( isset( $areaId ) || isset( $crimeTypes ) || isset( $timeTo ) ) {
                $sql .= ' AND';
            }
            
            $sql .= ' FK_Time_Lookup <= "' . $timeTo . '"';
                
        }

        $sql .= ' AND CrimeData.FK_Area_Lookup = AreaLookup.Code';
        if( $groupByArea ) {
            $sql .= ' GROUP BY FK_Area_Lookup';
        } else {
            $sql .= ' GROUP BY FK_Time_Lookup';
        }
                    
        Debugger::log( "sql" );
        Debugger::log( $sql );

        return $this->db->query( $sql );
        
    }

}   

?>
