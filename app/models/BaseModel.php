<?php

namespace Models;

abstract class BaseModel extends \Nette\Object
{
    /** @var Nette\DI\Container */
    private $context;
    
    protected $db;
    
    protected $lng = 18;
    
    protected $table;
    protected $key;

    public function __construct(\Nette\DI\Container $container)
    {
        $this->context = $container;
        $this->db = $this->getDatabase();
    }

    /**
     * @return Nette\DI\Container
     */
    final public function getContext()
    {
        return $this->context;
    }

    /**
     * @return DibiConnection
     */
    final public function getDatabase()
    {
        return $this->context->database;
    }
        
    
    /**
     * Computes salted password hash.
     * @param  string
     * @return string
     */
    public function calculateHash($password)
    {
            return sha1($password);// . str_repeat('nahradni-dil-solnicka', 10));
    }
    
    public function findAll()
    {
        return $this->getDatabase()->select('*')->from($this->table);
    }

    public function find($key)
    {
        return $this->getDatabase()->select('*')->from($this->table)->where('%sql=%s',$this->key,$key);
    }

    public function insert($data)
    {
        $this->getDatabase()->insert($this->table,$data)->execute();
        return $this->getDatabase()->insertId();
    }

    public function update($data,$key)
    {
        return $this->getDatabase()->update($this->table,$data)->where('%sql = %sql',$this->key,$key)->execute();
    }
    public function delete($key)
    {
        return $this->getDatabase()->delete($this->table)->where('%sql = %sql',$this->key,$key)->execute();
    }
    
    
}