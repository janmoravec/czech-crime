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
class Users extends BaseModel {
    protected $table = 'users';
    protected $key = 'id';
    
    public function findEmail($email)
    {
        return $this->db->query('SELECT * FROM users WHERE email=%s',$email);
    }
}

?>
