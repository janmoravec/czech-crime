<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Table
 *
 * @author petr
 */

use Nette\Diagnostics\Debugger;

require(__DIR__ . '/../../libs/tcpdf/tcpdf.php');

class Table extends \TCPDF
{
    protected $logo = array(
        'path' => null,
        'x' => null,
        'y' => null,
        'width' => 179,
        'height' => 27
    );
    
    protected $data;
    protected $total;
    protected $area;
    public $isDistrict;
    protected $firstDate;
    protected $secondDate;
    
    protected $table;
    
    protected $texts = array( "en" =>
                                array( 
                                    "overview" => "Overview of crime data for given time and area",
                                    "rankings" => "Rankings",
                                    "population" => "Number of population",
                                    "area" => "Area",
                                    "recorded" => "RECORDED",
                                    "cleared" => "CLEARED",
                                    "count" => "Count",
                                    "index" => "Crime rate",
                                    "crimes" => "Crimes",
                                    "area" => "AREA"
                                    ),
                            "cz" =>
                                array( 
                                    "overview" => "Přehled trestné činnosti",
                                    "rankings" => "Žebříček",
                                    "population" => "Počet obyvatel",
                                    "area" => "Rozloha",
                                    "recorded" => "ZJIŠTĚNO",
                                    "cleared" => "OBJASNĚNO",
                                    "count" => "POČET",
                                    "index" => "INDEX",
                                    "crimes" => "Trestné činy",
                                    "area" => "OBLAST"
                                    )
                            );
        
    public function getTable() {
        return $this->table;
    }

    public function setTable($table) {
        $this->table = $table;
    }

            
    public function getFirstDate() {
        return $this->firstDate;
    }

    public function setFirstDate($firstDate) {
        $this->firstDate = $firstDate;
    }

    public function getSecondDate() {
        return $this->secondDate;
    }

    public function setSecondDate($secondDate) {
        $this->secondDate = $secondDate;
    }

        
    public function getArea() {
        return $this->area;
    }

    public function setArea($area) {
        $this->area = $area;
    }

        
    public function getData() {
        return $this->data;
    }

    public function setData($data) {
        $this->data = $data;
    }

    protected $filename = false;
    
    public function getFilename() {
        return $this->filename;
    }

    public function setFilename($filename) {
        $this->filename = $filename;
    }
    
    public function getTotal() {
        return $this->total;
    }

    public function setTotal($total) {
        $this->total = $total;
    }
        
    public function generate( $language )
    {     
        // set document (meta) information
        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor($this->author);
        $this->SetTitle($this->title);
    
        //set margins
        $this->SetMargins(10, 20, 10,10);
        $this->SetHeaderMargin(10);
        $this->SetFooterMargin(10);

        //set auto page breaks
        $this->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);
        
        // add a page
        $this->AddPage();
        
        $this->Line(10, 23, 200, 23);
        
        $this->setCellMargins(0, 10, 0, 0);

        
        if($this->table == 'types')
        {   
            //$this->Cell(80, 10, $this->area->Name, 0, 10, 'R', false, '', 0, false,'T', $valign='M');
            $this->CreateTextBox( $this->area["Name"], -5, 15, 50, 10, 15, 'B','');
            $this->CreateTextBox( $this->texts[$language]["overview"], -5, 22, 80, 10, 10, 'B');

            if($this->firstDate == $this->secondDate)
                $this->CreateTextBox($this->firstDate, 155, 22, 20, 10, 10, 'B','R');
            else
                $this->CreateTextBox($this->firstDate.' - '.$this->secondDate, 155, 22, 20, 10, 10, 'B','R');
          
            $this->MultiCell(50,5, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 5,15,35,true ,'', true);
            $this->MultiCell(30,5,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0, 5,65,35,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["population"],-5,35,30,5,9,'B','L');
            $this->CreateTextBox(number_format($this->area["Population"],0,"."," "),45,35,30,5,9,'N','R');

            $this->MultiCell(50,5, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 5,15,40,true ,'', true);
            $this->MultiCell(30,5,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0, 5,65,40,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["index"],-5,40,30,5,9,'B','L');
            $this->CreateTextBox(number_format($this->data["total"]["Index"],0,"."," "),45,40,30,5,9,'N','R');
            
            $this->MultiCell(50,5, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 5,15,45,true ,'', true);
            $this->MultiCell(30,5,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0, 5,65,45,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["area"],-5,45,30,5,9,'B','L');
            $this->CreateTextBox(number_format($this->data["Area"],0,"."," ")." km2",45,45,30,5,9,'N','R');

            $this->MultiCell(50,10, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 10,75,55,true ,'', true);
            $this->MultiCell(50,10,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,10,125,55,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["recorded"],65,55,30,10,10,'B','C');
            $this->CreateTextBox($this->texts[$language]["cleared"],115,55,30,10,10,'B','C');

            $this->MultiCell(50,8, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 8,75,65,true ,'', true);
            $this->MultiCell(50,8,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,8,125,65,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["count"],55,65,25,8,8,'B','C');
            $this->CreateTextBox($this->texts[$language]["index"],80,65,25,8,8,'B','C');
            $this->CreateTextBox($this->texts[$language]["count"],105,65,25,8,8,'B','C');
            $this->CreateTextBox('%',130,65,25,8,8,'B','C');

            $this->MultiCell(60,8, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 8,15,73,true ,'', true);
            $this->MultiCell(50,8,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0,8,75,73,true ,'', true);
            $this->MultiCell(50,8,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0,8,125,73,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["crimes"],-4,73,25,8,9,'N','L');
            $this->CreateTextBox(number_format($this->data["total"]["FoundSum"],0,","," "),55,73,25,8,10,'B','C');
            $this->CreateTextBox(number_format(round( $this->data["total"]["Index"] * 10 )/10,0,","," "),80,73,25,8,10,'B','C');
            $this->CreateTextBox(number_format($this->data["total"]["SolvedSum"],0,","," "),105,73,25,8,10,'B','C');
            $this->CreateTextBox(number_format((($this->data["total"]["SolvedSum"]/$this->data["total"]["FoundSum"])*100),0,'',''),130,73,25,8,10,'B','C');       

            $y = 82;
            foreach($this->data["crimeTypesData"] as $d)
            {
                if($y > 250)
                {
                    $this->addPage();
                    $y = 20;
                }

                @$percent = ($d["SolvedSum"]/$d["FoundSum"])*100;
                $this->MultiCell(60,5, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 5,15,$y,true ,'', true);
                $this->MultiCell(50,5,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0,5,75,$y,true ,'', true);
                $this->MultiCell(50,5,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0,5,125,$y,true ,'', true);
                if( $language == "en" ) $this->CreateTextBox($d["CrimeName_en"],-4,$y,25,5,9,'N','L');
                else $this->CreateTextBox($d["CrimeName"],-4,$y,25,5,9,'N','L');
                $this->CreateTextBox(number_format($d["FoundSum"],0,","," "),55,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format(round($d["Index"]*10)/10,0,","," "),80,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format($d["SolvedSum"],0,","," "),105,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format($percent,0,'',''),130,$y,25,5,9,'B','C');   
                $y += 5;
            }
        }
        elseif($this->table == 'rank')
        {
            $this->CreateTextBox( $this->area["Name"], -5, 15, 50, 10, 15, 'B','');
            $this->CreateTextBox( $this->texts[$language]["rankings"], -5, 22, 80, 10, 10, 'B');

            if($this->firstDate == $this->secondDate)
                $this->CreateTextBox($this->firstDate, 155, 22, 20, 10, 10, 'B','R');
            else
                $this->CreateTextBox($this->firstDate.' - '.$this->secondDate, 155, 22, 20, 10, 10, 'B','R');
          
            $this->MultiCell(50,10, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 10,75,40,true ,'', true);
            $this->MultiCell(50,10,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,10,125,40,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["recorded"],65,40,30,10,10,'B','C');
            $this->CreateTextBox($this->texts[$language]["cleared"],115,40,30,10,10,'B','C');

            $this->MultiCell(50,8, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 8,75,50,true ,'', true);
            $this->MultiCell(50,8,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,8,125,50,true ,'', true);
            $this->CreateTextBox($this->texts[$language]["count"],55,50,25,8,8,'B','C');
            $this->CreateTextBox($this->texts[$language]["index"],80,50,25,8,8,'B','C');
            $this->CreateTextBox($this->texts[$language]["count"],105,50,25,8,8,'B','C');
            $this->CreateTextBox('%',130,50,25,8,8,'B','C');
            
            $this->CreateTextBox('#',0,50,25,8,8,'B','L');
            $this->CreateTextBox($this->texts[$language]["area"],7,50,25,8,8,'B','L');
            
            $this->Line(20, 68, 75, 68);
            
            $y = 58; $i = 1;
            foreach($this->data as $d)
            {
                if($y > 250)
                {
                    $this->addPage();
                    
                    $this->MultiCell(50,10, '', array('LTRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 10,75,30,true ,'', true);
                    $this->MultiCell(50,10,'', array('TRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,10,125,30,true ,'', true);
                    $this->CreateTextBox($this->texts[$language]["recorded"],65,30,30,10,10,'B','C');
                    $this->CreateTextBox($this->texts[$language]["cleared"],115,30,30,10,10,'B','C');

                    $this->MultiCell(50,8, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 8,75,40,true ,'', true);
                    $this->MultiCell(50,8,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,8,125,40,true ,'', true);
                    $this->CreateTextBox($this->texts[$language]["count"],55,40,25,8,8,'B','C');
                    $this->CreateTextBox($this->texts[$language]["index"],80,40,25,8,8,'B','C');
                    $this->CreateTextBox($this->texts[$language]["count"],105,40,25,8,8,'B','C');
                    $this->CreateTextBox('%',130,40,25,8,8,'B','C');

                    $this->CreateTextBox('#',0,40,25,8,8,'B','L');
                    $this->CreateTextBox($this->texts[$language]["area"],7,40,25,8,8,'B','L');
                    $y = 48;
                    $this->Line(10, 23, 200, 23);
                    $this->Line(20, 58, 75, 58);
                    if($this->firstDate == $this->secondDate)
                        $this->CreateTextBox($this->firstDate, 155, 12, 20, 10, 10, 'B','R');
                    else
                        $this->CreateTextBox($this->firstDate.' - '.$this->secondDate, 155, 12, 20, 10, 10, 'B','R');
                }
                
                $this->MultiCell(7,5, '', array('LRB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'L', 0, 5,20,$y,true ,'', true);
                $this->MultiCell(50,5,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,5,25,$y,true ,'', true);
                $this->MultiCell(50,5,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,5,75,$y,true ,'', true);
                $this->MultiCell(50,5,'', array('RB'=> array('width'=>0.1,'color'=>array('0','0','0'))), 'R', 0,5,125,$y,true ,'', true);
                
                @$percent = ($d["SolvedSum"]/$d["FoundSum"])*100;
                $this->CreateTextBox($i,0,$y,7,5,9,'N','C');
                $this->CreateTextBox($d["Name"],7,$y,48,5,9,'N','L');
                $this->CreateTextBox(number_format($d["FoundSum"],0,","," "),55,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format($d["I"],0,","," "),80,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format($d["SolvedSum"],0,","," "),105,$y,25,5,9,'B','C');
                $this->CreateTextBox(number_format($percent,0,'',''),130,$y,25,5,9,'B','C');   
                $y += 5;
                $i++;
            }
        }

        //Close and output PDF document
        $this->Output($this->filename, 'D');
    }

    public function Header() {
        $this->setFont('Dejavusans', '', 12);
        $this->setCellPaddings(0, 0, 5, 0);
          //  $this->Cell(190, 10, 'FAKTURA č. '.$this->invoiceNumber, 1, 0,'R');
            //$this->setJPEGQuality(90);
            //echo K_PATH_URL_CACHE;
            $path = __DIR__.'/../../images/logo-black.png';
            
            
            $this->Image($path, 12, 12, 45, 0, 'PNG');

    }
    public function Footer() {
            $this->SetY(-15);
            $this->SetFont('Dejavusans','', 7);
         //   $this->Cell(0, 10, 'Strana '.$this->page.' z '.count($this->pages), 0, false, 'R');
    }
    public function CreateTextBox($textval, $x = 0, $y, $width = 0, $height = 10, $fontsize = 10, $fontstyle = '', $align = 'L',$fill = false,$valign = 'M') {
            $this->SetXY($x+20, $y); // 20 = margin left
            $this->SetFont('Dejavusans', $fontstyle, $fontsize);
            
            $this->Cell($width, $height, $textval, 0, 1, $align, $fill,null,null,null,null,$valign);
    }

}

?>
