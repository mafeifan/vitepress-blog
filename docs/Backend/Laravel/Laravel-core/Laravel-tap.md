```
<?php

class Builder
{
	public $limit;

	public function take($value)
    {
        return $this->limit($value);
    }

    public function limit($value)
    {
    	$this->limit = $value;
    	return $this;
    }

	public function when($value, $callback, $default = null)
    {
        if ($value) {
            return $callback($this, $value) ?: $this;
        } elseif ($default) {
            return $default($this, $value) ?: $this;
        }

        return $this;
    }

    public function tap($callback)
    {
        return $this->when(true, $callback);
    }
}

$builder = new Builder();

$builder
->when(1, function($q) {
	return $q->take(3);
})
->tap(function($q) {
	return $q->take(4);
});

print_r($builder);
```
