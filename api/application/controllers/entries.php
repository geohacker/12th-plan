<?php

class Entries_Controller extends Base_Controller
{

	public $restful = true;

	public function get_index()
	{
		echo 'Hello earth.';
	}

	public function post_add()
	{
		$entry = new Entry(Input::get());

		if ($entry->validate()) {
			if ($entry->save()) {
				return Response::json(array(
					'id' => $entry->id
				), 201);
			} else {
				return Response::error(500);
			}
		} else {
			return Response::json($entry->errors()->all(), 400);
		}
	}
}
