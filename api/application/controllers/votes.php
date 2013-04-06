<?php

class Votes_Controller extends Base_Controller
{

	public $restful = true;

	public function post_vote()
	{
		$entry = Entry::find(Input::get('entry_id'));

		if (! $entry)
			return Response::error(404);

		$vote = new Vote(Input::get());

		$vote->ip = Request::ip();
		$vote->entry_id = $entry->id;

		if ($vote->validate()) {
			if ($vote->save()) {
				return Response::json(array(
					'likes'    => $entry->likes()->count(),
					'dislikes' => $entry->dislikes()->count(),
					'total'    => $entry->votes()->count(),
				), 201);
			} else {
				return Response::error(500);
			}
		} else {
			return Response::json($votes->errors()->all(), 400);
		}
	}

	public function get_get($entry_id)
	{
		$entry = Entry::find($entry_id);

		if (! $entry)
			return Response::error(404);

		return Response::json(array(
			'likes'    => $entry->likes()->count(),
			'dislikes' => $entry->dislikes()->count(),
			'total'    => $entry->votes()->count(),
		));
	}
}
