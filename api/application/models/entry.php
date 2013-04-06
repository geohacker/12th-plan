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

    /**
     * Relate to votes
     *
     * @var array
     */
    public function votes()
    {
        return $this->has_many('Vote');
    }

    /**
     * Relate to votes with likes
     *
     * @var array
     */
    public function likes()
    {
        return $this->has_many('Vote')
            ->where('like', '=', 1);
    }

    /**
     * Relate to votes with dislikes
     *
     * @var array
     */
    public function dislikes()
    {
        return $this->has_many('Vote')
            ->where('like', '=', 0);
    }
}
