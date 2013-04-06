<?php

class Entry extends BaseModel
{
	/**
     * White list of attributes that can be mass assigned
     *
     * @var array
     */
    public static $accessible = array('description', 'data');


    /**
     * Rules for model validation.
     *
     * @var array
     */
    public static $rules = array(
		'description' => 'required',
		'data'        => 'required',
    );
}
