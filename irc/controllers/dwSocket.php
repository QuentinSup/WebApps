<?php

namespace dw\classes;

class dwSocket
{
	private $type;
	private $domain;
	private $protocol;
	
	private $_hostname;
	private $_remotename;
	
	private $_socket = false;
	
	// Logger
	private static function logger() {
		static $logger = null;
		if(is_null($logger)) {
			$logger = dwLogger::getLogger(__CLASS__);
		}
		return $logger;
	}
	
	/**
	 * Constructeur
	 */
	public function __construct($type = 1, $domain = 2, $protocol = 1) {
		$this -> type 		= $type;
		$this -> domain 	= $domain;		
		$this -> protocol 	= $protocol;
	}
	
	/**
	 * Connect to remote $adress, using $port if specified
	 */
	public function pconnect($adress, $port = 0, $persistent = false) {
		return $this -> connect($adress, $port, true);
	}
	
	/**
	 * Connect to remote $adress, using $port if specified
	 */
	public function connect($adress, $port = 0, $persistent = false) {
		
		$this -> close();
		
		$errno = null;
		$errstr = null;

		//$socket = \socket_create($this -> domain, $this -> type, $this -> protocol);
	
		if($persistent) {
			$socket = pfsockopen($adress, $port, $errno, $errstr);
		} else {
			$socket = fsockopen($adress, $port, $errno, $errstr);
		}

		if($socket === false) {
			self::logger() -> warn($errstr);
		} else {
			stream_set_blocking($socket, 0);
			//$this -> resolveHostName();
			//$this -> resolveRemoteName();
			/*
			if(!\socket_connect($socket, $adress, $port)) {
				$this -> close();
				self::logger() -> warn($this -> getLastErrorText());	
			} else {
				$this -> resolveHostName();
				$this -> resolveRemoteName();
			}
			*/
		}

		$this -> _socket = $socket;
		
		return $socket;
	}
	
	public function close() {
		if($this -> _socket !== false) {
			//\socket_close($this -> _socket);
			fclose($this -> _socket);
			$this -> _socket = false;
			$this -> _hostname = null;
			$this -> _remotename = null;
		}
	}
	
	public function getSocket() {
		return $this -> _socket;
	}
	
	public function getHostName() {
		return $this -> _hostname;
	}
	
	public function getRemoteName() {
		return $this -> _remotename;
	}
	
	public function send($text) {
		for ($written = 0; $written < strlen($text); $written += $fwrite) {
			$fwrite = fwrite($this -> _socket, substr($text, $written));
			if ($fwrite === false) {
				return $fwrite;
			}
		}
		return $written;
		//return fwrite($this -> _socket, $text) > 0;
		//return \socket_write($this -> _socket, $text) > 0;
	}
	
	public function read() {
		//\socket_read($this -> _socket, 2048)
		return fgets($this -> _socket);
	}
	
	public function waitForData($timeout = 30000) {
		$content = "";
		$delay = 100;
		$endLoop = $timeout * 1000 / $delay;
		$nbLoop = 0;
		while($content == "" && $nbLoop <= $endLoop) {
			$nbLoop++;
			$content = $this -> read();
			if($content == "") {
				usleep($delay);	
			}
		}
		return $content;
	}
	
	public function resolveHostName() {
		return \socket_getsockname($socket, $this -> _hostname);
	}
	
	public function resolveRemoteName() {
		return \socket_getpeername($socket, $this -> _remotename);
	}
	
	/*
	public function getLastError() {
		
		return \socket_last_error();
	}
	
	public function getLastErrorText() {
		return \socket_strerror($this -> getLastError());	
	}
	*/
	
	public function getMetaData($meta = null) {
		$metas = \stream_get_meta_data($this -> _socket);
		print_r($metas);
		if(is_null($meta)) {
			return $metas;
		}
		return $metas[$meta];
	}

	public function isTimedOut() {
		return $this -> getMetaData('timed_out');	
	}	
		
}

?>